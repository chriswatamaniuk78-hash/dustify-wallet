import type { NextConfig } from 'next'

const securityHeaders = [
  { key: 'X-DNS-Prefetch-Control',         value: 'on' },
  { key: 'X-Frame-Options',                value: 'DENY' },
  { key: 'X-Content-Type-Options',         value: 'nosniff' },
  { key: 'X-XSS-Protection',               value: '1; mode=block' },
  { key: 'Referrer-Policy',                value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy',             value: 'camera=(), microphone=(), geolocation=()' },
  { key: 'Strict-Transport-Security',      value: 'max-age=31536000; includeSubDomains; preload' },
  {
    key: 'Content-Security-Policy',
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https: blob:",
      "connect-src 'self' https://*.supabase.co https://api.anthropic.com https://polygon-mainnet.g.alchemy.com",
      "frame-ancestors 'none'",
    ].join('; '),
  },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ['lucide-react'],
  },
  async headers() {
    return [
      {
        source:  '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
  images: {
    unoptimized: true,
  },
}

export default nextConfig
