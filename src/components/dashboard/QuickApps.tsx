'use client'

import Link from 'next/link'

interface AppShortcut {
  id: string
  name: string
  tagline: string
  href: string
  accentColor: string
  icon: React.ReactNode
}

function TravelSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M11 3C8.24 3 6 5.24 6 8c0 4.5 5 10 5 10s5-5.5 5-10c0-2.76-2.24-5-5-5z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <circle cx="11" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
    </svg>
  )
}

function TradeSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <path d="M3 16l4.5-5 3.5 3.5 8-9" stroke="currentColor" strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="19" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
    </svg>
  )
}

function StudioSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <circle cx="11" cy="11" r="8" stroke="currentColor" strokeWidth="1.3" />
      <path d="M9 8l6 3-6 3V8z" fill="currentColor" />
    </svg>
  )
}

function GameSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3" y="7" width="16" height="10" rx="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M8 12h2.5M9.25 10.75v2.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      <circle cx="15" cy="12" r="1.2" fill="currentColor" />
    </svg>
  )
}

function ScrappiSVG() {
  return (
    <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
      <rect x="3.5" y="3.5" width="15" height="15" rx="3" stroke="currentColor" strokeWidth="1.3" />
      <path d="M7 11h8M11 7v8" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
    </svg>
  )
}

const SHORTCUTS: AppShortcut[] = [
  {
    id: 'travel',
    name: 'Dust Travel',
    tagline: 'Plan your next journey',
    href: '/travel',
    accentColor: '#378ADD',
    icon: <TravelSVG />,
  },
  {
    id: 'trade',
    name: 'Dust Trade',
    tagline: 'Markets & bot trading',
    href: '/trade',
    accentColor: '#1D9E75',
    icon: <TradeSVG />,
  },
  {
    id: 'studio',
    name: 'Dust Studio',
    tagline: 'Create & publish content',
    href: 'https://studio.dustify.com',
    accentColor: '#7F77DD',
    icon: <StudioSVG />,
  },
  {
    id: 'scrappi',
    name: 'SCRAPPI',
    tagline: 'Sovereign AI command center',
    href: 'https://code.dustifytechnologiescorp.com',
    accentColor: '#D4AF37',
    icon: <ScrappiSVG />,
  },
  {
    id: 'gaming',
    name: 'Dust Gaming',
    tagline: 'Play, test, and deploy',
    href: '/gaming',
    accentColor: '#EF9F27',
    icon: <GameSVG />,
  },
]

export default function QuickApps() {
  return (
    <div className="animate-fade-up delay-5">
      <div
        className="font-mono"
        style={{
          fontSize: 10,
          letterSpacing: '0.18em',
          color: 'var(--text-tertiary)',
          textTransform: 'uppercase',
          marginBottom: 12,
        }}
      >
        Quick access
      </div>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(2, 1fr)',
          gap: 10,
        }}
      >
        {SHORTCUTS.map((app) => (
          <Link
            key={app.id}
            href={app.href}
            target={app.href.startsWith('http') ? '_blank' : undefined}
            rel={app.href.startsWith('http') ? 'noopener noreferrer' : undefined}
            style={{ textDecoration: 'none' }}
          >
            <div
              style={{
                padding: '16px',
                background: 'var(--glass-1)',
                border: '1px solid var(--border-gold-0)',
                borderRadius: 14,
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                transition: 'all 0.2s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={e => {
                const el = e.currentTarget
                el.style.background = `${app.accentColor}10`
                el.style.borderColor = `${app.accentColor}35`
              }}
              onMouseLeave={e => {
                const el = e.currentTarget
                el.style.background = 'var(--glass-1)'
                el.style.borderColor = 'var(--border-gold-0)'
              }}
            >
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${app.accentColor}15`,
                  border: `1px solid ${app.accentColor}30`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: app.accentColor,
                  flexShrink: 0,
                }}
              >
                {app.icon}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                  {app.name}
                </div>
                <div
                  className="font-mono"
                  style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, letterSpacing: '0.03em' }}
                >
                  {app.tagline}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
