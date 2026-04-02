/**
 * Dustify Wallet — Next.js Edge Middleware
 *
 * Security fixes:
 *  V-01  CVE-2025-29927 — Block x-middleware-subrequest bypass
 *  V-09  Full security headers on every response
 *  V-10  CORS origin enforcement
 */

import { NextRequest, NextResponse } from 'next/server'

const ALLOWED_ORIGINS = [
  'https://dustifytechnologiescorp.com',
  'https://wallet.dustifytechnologiescorp.com',
  'https://code.dustifytechnologiescorp.com',
  'https://vault.dustifytechnologiescorp.com',
  ...(process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',').map(s => s.trim())
    : []),
]

const SECURITY_HEADERS: Record<string, string> = {
  'X-Frame-Options':           'DENY',
  'X-Content-Type-Options':    'nosniff',
  'X-XSS-Protection':          '1; mode=block',
  'Referrer-Policy':           'strict-origin-when-cross-origin',
  'Permissions-Policy':        'camera=(), microphone=(), geolocation=()',
  'Strict-Transport-Security': 'max-age=31536000; includeSubDomains; preload',
  'X-Dustify-Protected':       'intelligence-guard-v3',
}

// Public paths that don't require SBT identity
const PUBLIC_PATHS = ['/onboard', '/mint', '/api', '/_next', '/favicon', '/icons']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // ── V-01: Block CVE-2025-29927 middleware bypass ────────────────────────────
  if (req.headers.get('x-middleware-subrequest')) {
    return new NextResponse(null, { status: 400 })
  }

  // ── CORS preflight ──────────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    const origin  = req.headers.get('origin') ?? ''
    const isDev   = process.env.NODE_ENV !== 'production'
    const allowed = ALLOWED_ORIGINS.includes(origin) || (isDev && origin.startsWith('http://localhost:'))
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin':  allowed ? origin : '',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, x-dustcap, x-dustify-key',
        'Access-Control-Max-Age':       '86400',
        'Vary':                         'Origin',
      },
    })
  }

  // ── SBT session check ───────────────────────────────────────────────────────
  const isPublic = PUBLIC_PATHS.some(p => pathname.startsWith(p))
  const sbtSession = req.cookies.get('dustify_sbt_session')

  if (!isPublic && !sbtSession && process.env.NODE_ENV === 'production') {
    return NextResponse.redirect(new URL('/onboard', req.url))
  }

  // ── Add security headers to every response ──────────────────────────────────
  const response = NextResponse.next()
  for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
    response.headers.set(key, value)
  }

  const origin  = req.headers.get('origin') ?? ''
  const isDev   = process.env.NODE_ENV !== 'production'
  if (ALLOWED_ORIGINS.includes(origin) || (isDev && origin.startsWith('http://localhost:'))) {
    response.headers.set('Access-Control-Allow-Origin', origin || '*')
    response.headers.set('Vary', 'Origin')
  }

  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.png|.*\\.ico).*)'],
}
