import type { Metadata, Viewport } from 'next'
import './globals.css'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
  themeColor: '#D4AF37',
}

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? 'https://wallet.dustifytechnologiescorp.com'),
  title: {
    default: 'Soul Wallet — Dustify Technologies',
    template: '%s — Soul Wallet',
  },
  description: 'Quantum-secured identity wallet. Autonomous trading, travel booking, gaming rewards, and DustMiles. Canada\'s most advanced crypto super-app.',
  keywords: ['soul wallet', 'dustify', 'crypto wallet', 'trading bot', 'dustmiles', 'blockchain', 'polygon', 'canada', 'edmonton'],
  authors: [{ name: 'Dustify Technologies Corp', url: 'https://dustifytechnologiescorp.com' }],
  creator: 'Dustify Technologies Corp',
  publisher: 'Dustify Technologies Corp',
  // PWA
  applicationName: 'Soul Wallet',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: 'Soul Wallet',
    statusBarStyle: 'black-translucent',
    startupImage: '/icons/icon-512.png',
  },
  formatDetection: { telephone: false, email: false, address: false },
  // Open Graph
  openGraph: {
    type: 'website',
    locale: 'en_CA',
    url: 'https://wallet.dustifytechnologiescorp.com',
    title: 'Soul Wallet — Dustify Technologies',
    description: 'Quantum-secured identity wallet with autonomous trading, travel, and gaming.',
    siteName: 'Soul Wallet',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Soul Wallet' }],
  },
  // Twitter
  twitter: {
    card: 'summary_large_image',
    title: 'Soul Wallet — Dustify Technologies',
    description: 'Quantum-secured identity wallet',
    creator: '@DustifyTech',
    images: ['/og-image.png'],
  },
  // Icons
  icons: {
    icon: [
      { url: '/icons/icon-72.png',  sizes: '72x72',   type: 'image/png' },
      { url: '/icons/icon-96.png',  sizes: '96x96',   type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icons/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192.png', sizes: '192x192', type: 'image/png' },
    ],
    other: [
      { rel: 'mask-icon', url: '/icons/icon-512.svg', color: '#D4AF37' },
    ],
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" suppressHydrationWarning>
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="msapplication-TileColor" content="#D4AF37" />
        <meta name="msapplication-TileImage" content="/icons/icon-144.png" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=JetBrains+Mono:wght@300;400;500&display=swap" rel="stylesheet" />
      </head>
      <body>
        {children}
        {/* Service Worker Registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js', { scope: '/' })
                    .then(function(reg) {
                      console.log('[SW] Registered:', reg.scope);
                      // Pass API URL to service worker
                      if (reg.active) {
                        reg.active.postMessage({
                          type: 'SET_API_URL',
                          url: '${process.env.NEXT_PUBLIC_API_URL ?? ''}'
                        });
                      }
                      // Listen for updates
                      reg.addEventListener('updatefound', function() {
                        const newWorker = reg.installing;
                        if (newWorker) {
                          newWorker.addEventListener('statechange', function() {
                            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                              console.log('[SW] Update available — refresh to apply');
                            }
                          });
                        }
                      });
                    })
                    .catch(function(err) {
                      console.error('[SW] Registration failed:', err);
                    });
                });
              }
              // Install PWA prompt
              window.addEventListener('beforeinstallprompt', function(e) {
                e.preventDefault();
                window.__pwaInstallPrompt = e;
              });
            `,
          }}
        />
      </body>
    </html>
  )
}
