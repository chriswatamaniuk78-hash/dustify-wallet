import { NextRequest, NextResponse } from 'next/server'

const PUBLIC_PATHS = ['/onboard', '/auth', '/api', '/_next', '/favicon', '/offline']

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  if (PUBLIC_PATHS.some(p => pathname.startsWith(p))) {
    return NextResponse.next()
  }

  const sbtSession = req.cookies.get('dustify_sbt_session')

  if (!sbtSession && !pathname.startsWith('/onboard')) {
    if (process.env.NODE_ENV === 'development') {
      return NextResponse.next()
    }
    return NextResponse.redirect(new URL('/onboard', req.url))
  }

  const response = NextResponse.next()
  response.headers.set('X-Dustify-Protected', 'intelligence-guard-v3')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  return response
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|sw\\.js|manifest\\.json|icons/).*)'],
}
