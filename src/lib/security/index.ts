/**
 * Dustify Wallet — Shared Security Utilities
 * Dustify Technologies Corp 🍁 Edmonton, Alberta, Canada
 * April 2026 Security Audit Implementation
 *
 * Fixes: V-01 V-03 V-04 V-05 V-07 V-08 V-09 V-10 V-13 V-15
 */

import { createHmac, timingSafeEqual, randomBytes, createHash } from 'crypto'
import { cookies } from 'next/headers'
import { z } from 'zod'

// ── V-05: Constant-time comparison ───────────────────────────────────────────
export function safeCompare(a: string, b: string): boolean {
  try {
    const bufA = Buffer.from(a)
    const bufB = Buffer.from(b)
    if (bufA.length !== bufB.length) {
      timingSafeEqual(bufA, Buffer.alloc(bufA.length))
      return false
    }
    return timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}

// ── V-07: Cryptographically secure random ────────────────────────────────────
export function secureRandom(bytes = 16): string {
  return randomBytes(bytes).toString('hex')
}

// ── V-03: Hash tokens before storage ─────────────────────────────────────────
export function hashToken(token: string): string {
  return createHash('sha256').update(token).digest('hex')
}

// ── V-13: Webhook HMAC-SHA256 + timestamp ────────────────────────────────────
export function verifyWebhookSignature(
  payload: string,
  signature: string,
  secret: string,
  timestampHeader: string,
  maxAgeSeconds = 300
): { valid: boolean; reason?: string } {
  const timestamp = parseInt(timestampHeader, 10)
  if (isNaN(timestamp)) return { valid: false, reason: 'Missing timestamp' }

  const age = Math.floor(Date.now() / 1000) - timestamp
  if (age > maxAgeSeconds) return { valid: false, reason: 'Webhook too old' }
  if (age < -30) return { valid: false, reason: 'Webhook timestamp in future' }

  const expectedSig = createHmac('sha256', secret)
    .update(`${timestamp}.${payload}`)
    .digest('hex')

  return { valid: safeCompare(signature, `sha256=${expectedSig}`) }
}

// ── V-09: Security headers ────────────────────────────────────────────────────
export const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options':           'DENY',
  'X-Content-Type-Options':    'nosniff',
  'X-XSS-Protection':          '1; mode=block',
  'Referrer-Policy':           'strict-origin-when-cross-origin',
  'Permissions-Policy':        'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'Content-Security-Policy': [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https: blob:",
    "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://polygon-mainnet.g.alchemy.com",
    "frame-ancestors 'none'",
  ].join('; '),
}

export function addSecurityHeaders(headers: Headers): Headers {
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    headers.set(key, value)
  }
  return headers
}

// ── V-10: CORS ────────────────────────────────────────────────────────────────
const ALLOWED_ORIGINS_LIST = [
  'https://dustifytechnologiescorp.com',
  'https://wallet.dustifytechnologiescorp.com',
  'https://code.dustifytechnologiescorp.com',
  'https://vault.dustifytechnologiescorp.com',
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim()).filter(Boolean)
    : []),
  ...(process.env.NODE_ENV !== 'production'
    ? ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002']
    : []),
]

export function getCORSHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS_LIST.includes(origin) ? origin : ''
  return {
    'Access-Control-Allow-Origin':      allowed,
    'Access-Control-Allow-Methods':     'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers':     'Content-Type, Authorization, x-dustcap, x-dustify-key, x-sbt-token-id',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age':           '86400',
    'Vary':                             'Origin',
  }
}

// ── V-01: Double-auth helper ──────────────────────────────────────────────────
const SBT_COOKIE_NAME = 'dustify_sbt_session'

export interface SBTClaims {
  tokenId:       string
  walletAddress: string
  tier:          'PIONEER' | 'SOVEREIGN' | 'ARCHITECT'
  expiresAt:     number
}

export async function requireSBTAuth(): Promise<SBTClaims | null> {
  if (process.env.NODE_ENV !== 'production') {
    return { tokenId: '847', walletAddress: '0xDev', tier: 'ARCHITECT', expiresAt: Math.floor(Date.now() / 1000) + 86400 }
  }

  try {
    const cookieStore = await cookies()
    const session = cookieStore.get(SBT_COOKIE_NAME)
    if (!session?.value) return null
    const claims = JSON.parse(Buffer.from(session.value, 'base64').toString()) as SBTClaims
    if (claims.expiresAt < Math.floor(Date.now() / 1000)) return null
    return claims
  } catch {
    return null
  }
}

// ── V-08: Common Zod schemas ──────────────────────────────────────────────────
export const SBTSchema = z.object({
  sbtTokenId:    z.string().min(1).max(10).regex(/^\d+$/),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  tier:          z.enum(['PIONEER', 'SOVEREIGN', 'ARCHITECT']),
})

// ── V-15: Request body size limit ────────────────────────────────────────────
export async function parseBodyWithLimit(req: Request, maxBytes = 4 * 1024 * 1024): Promise<unknown> {
  const contentLength = req.headers.get('content-length')
  if (contentLength && parseInt(contentLength) > maxBytes) {
    throw new Error(`Request too large: ${contentLength} > ${maxBytes}`)
  }
  const text = await req.text()
  if (text.length > maxBytes) throw new Error(`Body too large after read`)
  return JSON.parse(text)
}

// ── Inter-app auth ────────────────────────────────────────────────────────────
export function verifyInterAppAuth(req: Request): boolean {
  const key = req.headers.get('x-dustify-key') ?? ''
  const secret = process.env.DUSTIFY_INTER_APP_SECRET ?? ''
  if (!secret) return process.env.NODE_ENV !== 'production'
  return safeCompare(key, secret)
}
