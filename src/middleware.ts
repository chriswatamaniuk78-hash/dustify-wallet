import { NextRequest, NextResponse } from 'next/server'

// Public paths that don't require SBT identity
const PUBLIC_PATHS = ['/onboard', '/mint', '/api', '/_next', '/favicon', '/sw.js', '/manifest.json', '/icons']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Allow public paths
  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  // Check for SBT session cookie
  const sbtSession = req.cookies.get('dustify_sbt_session')

  // In production: verify the SBT session against on-chain state
  // For now: redirect to onboard if no session
  if (!sbtSession && !pathname.startsWith('/onboard')) {
    // Development mode: allow all through with mock session
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/onboard', req.url))
  }

  // Add SBT identity headers to all requests
  const response = NextResponse.next()
  response.headers.set('X-Dustify-Protected', 'intelligence-guard-v3')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
}
