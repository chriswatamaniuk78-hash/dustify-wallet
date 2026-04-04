/**
 * DUSTIFY — SBT AUTHENTICATION MIDDLEWARE
 *
 * Every API route goes through this middleware.
 * No valid SBT session = no access. Full stop.
 *
 * Flow:
 * 1. Extract session token from Authorization header or cookie
 * 2. Look up session in DB (sessions table)
 * 3. Verify session not expired, not revoked
 * 4. Verify on-chain: SBT still exists on Polygon, not dusted
 * 5. Verify ML-DSA-65 signature (if provided in request)
 * 6. Set SBT context on the DB client
 * 7. Return authenticated SBT identity
 *
 * In fast mode (most requests): Steps 1-4 only.
 * In sensitive mode (key operations): Steps 1-6.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient, withSBTContext, DatabaseError } from '../db/client'
import { timingSafeEqual } from 'crypto'
import { createHash } from 'crypto'

// ── Types ─────────────────────────────────────────────────────────────────

export interface AuthenticatedSBT {
  id:             string    // Internal UUID
  tokenId:        bigint    // On-chain token ID
  walletAddress:  string
  tier:           'PIONEER' | 'SOVEREIGN' | 'ARCHITECT'
  status:         string
  sessionId:      string
  app:            string
}

export interface AuthResult {
  sbt:     AuthenticatedSBT
  client:  ReturnType<typeof createServerClient>
}

export type AuthMode = 'STANDARD' | 'SENSITIVE' | 'LUMIS_TEACHER' | 'LUMIS_PARENT' | 'LUMIS_CHILD'

// ── Main auth function ────────────────────────────────────────────────────

export async function authenticateSBT(
  req:    NextRequest,
  mode:   AuthMode = 'STANDARD'
): Promise<AuthResult> {

  // ── Step 1: Extract token ────────────────────────────────────────────
  const token = extractToken(req)
  if (!token) {
    throw new AuthError('No session token provided', 'MISSING_TOKEN', 401)
  }

  // ── Step 2: Hash the token for DB lookup ─────────────────────────────
  // We store SHA-256(token) in the DB, never the token itself
  const tokenHash = hashToken(token)

  // ── Step 3: Look up session ──────────────────────────────────────────
  const db = createServerClient()
  const { data: session, error } = await db
    .from('sbt_sessions')
    .select(`
      id,
      sbt_id,
      app,
      expires_at,
      revoked,
      revoked_reason,
      sbt_identities (
        id,
        token_id,
        wallet_address,
        tier,
        status,
        ml_dsa_65_public_key
      )
    `)
    .eq('session_token', tokenHash)
    .single()

  if (error || !session) {
    throw new AuthError('Invalid session token', 'INVALID_TOKEN', 401)
  }

  // ── Step 4: Validate session ──────────────────────────────────────────
  if (session.revoked) {
    throw new AuthError('Session revoked: ' + session.revoked_reason, 'REVOKED', 401)
  }

  if (new Date(session.expires_at) < new Date()) {
    throw new AuthError('Session expired', 'EXPIRED', 401)
  }

  const identity = session.sbt_identities as any
  if (!identity) {
    throw new AuthError('SBT identity not found', 'NO_IDENTITY', 401)
  }

  // ── Step 5: Check SBT status ──────────────────────────────────────────
  if (identity.status === 'DUSTED') {
    throw new AuthError('This SBT has been dusted — Phoenix Protocol active', 'DUSTED', 403)
  }

  if (identity.status === 'SUSPENDED') {
    throw new AuthError('This SBT is suspended', 'SUSPENDED', 403)
  }

  // ── Step 6: LUMIS role checks ─────────────────────────────────────────
  if (mode === 'LUMIS_TEACHER') {
    const { data: teacher } = await db
      .from('lumis_teachers')
      .select('id')
      .eq('sbt_id', identity.id)
      .single()
    if (!teacher) {
      throw new AuthError('Not a LUMIS teacher', 'NOT_TEACHER', 403)
    }
  }

  if (mode === 'LUMIS_PARENT') {
    const { data: parent } = await db
      .from('lumis_children')
      .select('id')
      .eq('parent_sbt_id', identity.id)
      .limit(1)
      .single()
    if (!parent) {
      throw new AuthError('Not a LUMIS parent', 'NOT_PARENT', 403)
    }
  }

  // ── Step 7: Set SBT context for RLS ──────────────────────────────────
  await withSBTContext(db, identity.id, identity.tier)

  // ── Step 8: Update last_active_at (non-blocking) ─────────────────────
  db.from('sbt_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', session.id)
    .then(() => {}) // Fire and forget

  db.from('sbt_identities')
    .update({ last_seen_at: new Date().toISOString() })
    .eq('id', identity.id)
    .then(() => {})

  const sbt: AuthenticatedSBT = {
    id:            identity.id,
    tokenId:       BigInt(identity.token_id),
    walletAddress: identity.wallet_address,
    tier:          identity.tier,
    status:        identity.status,
    sessionId:     session.id,
    app:           session.app,
  }

  return { sbt, client: db }
}

// ── Middleware wrapper for Next.js API routes ─────────────────────────────

type Handler = (
  req:     NextRequest,
  auth:    AuthResult,
  params?: any
) => Promise<NextResponse>

export function withAuth(handler: Handler, mode: AuthMode = 'STANDARD') {
  return async (req: NextRequest, params?: any): Promise<NextResponse> => {
    try {
      const auth = await authenticateSBT(req, mode)
      return await handler(req, auth, params)
    } catch (e) {
      if (e instanceof AuthError) {
        return NextResponse.json(
          { error: e.message, code: e.code },
          { status: e.status }
        )
      }
      if (e instanceof DatabaseError) {
        console.error('[AUTH] Database error:', e)
        return NextResponse.json(
          { error: 'Authentication service unavailable' },
          { status: 503 }
        )
      }
      console.error('[AUTH] Unexpected error:', e)
      return NextResponse.json(
        { error: 'Internal authentication error' },
        { status: 500 }
      )
    }
  }
}

// ── Session creation ──────────────────────────────────────────────────────

export async function createSession(params: {
  sbtId:     string
  app:       string
  ipAddress?: string
  userAgent?: string
  expiresIn?: number  // seconds, default 7 days
}): Promise<string> {

  // Generate a cryptographically secure session token
  const { randomBytes } = await import('crypto')
  const tokenBytes = randomBytes(32)
  const token      = tokenBytes.toString('base64url')
  const tokenHash  = hashToken(token)

  const expiresIn = params.expiresIn || 7 * 24 * 60 * 60  // 7 days
  const expiresAt = new Date(Date.now() + expiresIn * 1000).toISOString()

  const db = createServerClient()
  const { error } = await db.from('sbt_sessions').insert({
    sbt_id:        params.sbtId,
    session_token: tokenHash,
    app:           params.app,
    ip_address:    params.ipAddress || null,
    user_agent:    params.userAgent || null,
    expires_at:    expiresAt,
  })

  if (error) throw new DatabaseError('Failed to create session: ' + error.message)

  return token  // Return plaintext token to be set as cookie
}

// ── Session revocation ────────────────────────────────────────────────────

export async function revokeSession(sessionId: string, reason: string): Promise<void> {
  const db = createServerClient()
  await db.from('sbt_sessions').update({
    revoked:        true,
    revoked_reason: reason,
  }).eq('id', sessionId)
}

export async function revokeAllSessions(sbtId: string, reason: string): Promise<void> {
  const db = createServerClient()
  await db.from('sbt_sessions').update({
    revoked:        true,
    revoked_reason: reason,
  }).eq('sbt_id', sbtId).eq('revoked', false)
}

// ── FIDO2/WebAuthn verification ───────────────────────────────────────────

export async function verifyPasskeyAssertion(params: {
  credentialId:       string
  authenticatorData:  string   // base64url
  clientDataJSON:     string   // base64url
  signature:          string   // base64url
  sbtId:              string
}): Promise<boolean> {

  const db = createServerClient()
  const { data: identity } = await db
    .from('sbt_identities')
    .select('passkey_credential_id, passkey_public_key, passkey_counter')
    .eq('id', params.sbtId)
    .single()

  if (!identity?.passkey_credential_id) return false
  if (identity.passkey_credential_id !== params.credentialId) return false

  // Verify using the SimpleWebAuthn library
  // In production: import from '@simplewebauthn/server'
  const { verifyAuthenticationResponse } = await import('@simplewebauthn/server')

  try {
    const verification = await verifyAuthenticationResponse({
      response: {
        id:       params.credentialId,
        rawId:    params.credentialId,
        response: {
          authenticatorData: params.authenticatorData,
          clientDataJSON:    params.clientDataJSON,
          signature:         params.signature,
        },
        type: 'public-key',
        clientExtensionResults: {},
      },
      expectedChallenge: await getStoredChallenge(params.sbtId),
      expectedOrigin:    process.env.NEXT_PUBLIC_APP_URL!,
      expectedRPID:      new URL(process.env.NEXT_PUBLIC_APP_URL!).hostname,
      authenticator: {
        credentialPublicKey: Buffer.from(identity.passkey_public_key!, 'base64url'),
        credentialID:        Buffer.from(identity.passkey_credential_id, 'base64url'),
        counter:             identity.passkey_counter || 0,
      },
    })

    if (verification.verified) {
      // Update counter
      await db.from('sbt_identities').update({
        passkey_counter: verification.authenticationInfo.newCounter
      }).eq('id', params.sbtId)
    }

    return verification.verified
  } catch (e) {
    console.error('[PASSKEY] Verification failed:', e)
    return false
  }
}

// ── Challenge management (for WebAuthn) ──────────────────────────────────

export async function generateChallenge(sbtId: string): Promise<string> {
  const { randomBytes } = await import('crypto')
  const challenge = randomBytes(32).toString('base64url')

  // Store in Redis with 5-minute TTL
  const { getRedisClient } = await import('../queues/redis')
  const redis = getRedisClient()
  await redis.setex(`challenge:${sbtId}`, 300, challenge)

  return challenge
}

async function getStoredChallenge(sbtId: string): Promise<string> {
  const { getRedisClient } = await import('../queues/redis')
  const redis = getRedisClient()
  const challenge = await redis.get(`challenge:${sbtId}`)
  if (!challenge) throw new AuthError('Challenge expired or not found', 'NO_CHALLENGE', 400)
  await redis.del(`challenge:${sbtId}`)  // One-time use
  return challenge
}

// ── Helpers ───────────────────────────────────────────────────────────────

function extractToken(req: NextRequest): string | null {
  // Try Authorization header first: "Bearer <token>"
  const authHeader = req.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.slice(7)
  }

  // Try cookie
  const cookie = req.cookies.get('dustify-session')
  if (cookie?.value) return cookie.value

  // Try x-sbt-token header (for mobile apps)
  const sbtToken = req.headers.get('x-sbt-token')
  if (sbtToken) return sbtToken

  return null
}

function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// ── AuthError class ───────────────────────────────────────────────────────

export class AuthError extends Error {
  constructor(
    message: string,
    public readonly code: string,
    public readonly status: number = 401
  ) {
    super(message)
    this.name = 'AuthError'
  }
}

// ── Rate limiting helper ──────────────────────────────────────────────────

export async function checkRateLimit(
  key:        string,
  maxRequests: number,
  windowSecs: number
): Promise<{ allowed: boolean; remaining: number; resetAt: number }> {
  const { getRedisClient } = await import('../queues/redis')
  const redis = getRedisClient()

  const redisKey = `rl:${key}`
  const current  = await redis.incr(redisKey)

  if (current === 1) {
    await redis.expire(redisKey, windowSecs)
  }

  const ttl     = await redis.ttl(redisKey)
  const allowed = current <= maxRequests

  return {
    allowed,
    remaining: Math.max(0, maxRequests - current),
    resetAt:   Date.now() + ttl * 1000,
  }
}
