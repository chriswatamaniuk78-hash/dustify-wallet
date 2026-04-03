import type { Metadata, Viewport } from 'next'
import { Playfair_Display, Cormorant_Garamond, JetBrains_Mono } from 'next/font/google'
import Script from 'next/script'
import '@/styles/globals.css'

const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-display', weight: ['400','700','900'], style: ['normal','italic'], display: 'swap' })
const cormorant = Cormorant_Garamond({ subsets: ['latin'], variable: '--font-body', weight: ['300','400','600'], style: ['normal','italic'], display: 'swap' })
const jetbrains = JetBrains_Mono({ subsets: ['latin'], variable: '--font-mono', weight: ['300','400','500'], display: 'swap' })

export const metadata: Metadata = {
  title: { default: 'Soul Wallet — Dustify', template: '%s · Soul Wallet' },
  description: 'Your quantum-secured sovereign identity, wealth, and lifestyle platform. Travel. Trade. Game. Earn.',
  applicationName: 'Soul Wallet',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Soul Wallet' },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Soul Wallet — Dustify Technologies',
    description: 'Quantum-secured identity. Autonomous trading. Infinite rewards.',
    type: 'website', locale: 'en_CA', siteName: 'Dustify',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en-CA" suppressHydrationWarning className={`${playfair.variable} ${cormorant.variable} ${jetbrains.variable}`}>
      <body className="bg-black text-white antialiased">
        {children}
        <Script id="sw-register" strategy="afterInteractive">{`
          if ('serviceWorker' in navigator) {
            window.addEventListener('load', () => {
              navigator.serviceWorker.register('/sw.js', { scope: '/' })
                .then(r => console.log('[SW] Registered'))
                .catch(e => console.log('[SW] Failed:', e));
            });
          }
        `}</Script>
      </body>
    </html>
  )
}
