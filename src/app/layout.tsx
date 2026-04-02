import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Soul Wallet — Dustify',
    template: '%s · Soul Wallet',
  },
  description:
    'Your quantum-secured sovereign identity, wealth, and lifestyle platform. Travel. Trade. Create. Earn.',
  keywords: ['soul wallet', 'dustify', 'crypto wallet', 'trading', 'rewards', 'SBT', 'NFT identity'],
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
  manifest: '/manifest.json',
  openGraph: {
    title: 'Soul Wallet — Dustify Technologies',
    description: 'Quantum-secured identity. Autonomous trading. Infinite rewards.',
    type: 'website',
    locale: 'en_US',
    siteName: 'Dustify',
  },
}

export const viewport: Viewport = {
  themeColor: '#000000',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  )
}
