'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import type { NavItem } from '@/types'

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Wallet',  href: '/dashboard' },
  { id: 'trade',     label: 'Trade',   href: '/trade'     },
  { id: 'travel',    label: 'Travel',  href: '/travel'    },
  { id: 'gaming',    label: 'Gaming',  href: '/gaming'    },
  { id: 'vault',     label: 'Vault',   href: '/vault'     },
]

// Icon components — SVG only, no emoji
function WalletIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="5" width="16" height="12" rx="2"
        stroke={active ? '#D4AF37' : 'currentColor'} strokeWidth="1.4" />
      <path d="M2 9h16" stroke={active ? '#D4AF37' : 'currentColor'} strokeWidth="1.4" />
      <circle cx="14" cy="13" r="1.5" fill={active ? '#D4AF37' : 'currentColor'} />
    </svg>
  )
}

function TradeIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M3 14l4-4 3 3 7-8"
        stroke={active ? '#D4AF37' : 'currentColor'} strokeWidth="1.4"
        strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="17" cy="5" r="2" fill={active ? '#D4AF37' : 'none'}
        stroke={active ? '#D4AF37' : 'currentColor'} strokeWidth="1.2" />
    </svg>
  )
}

function TravelIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M10 3C7.24 3 5 5.24 5 8c0 4.25 5 9 5 9s5-4.75 5-9c0-2.76-2.24-5-5-5z"
        stroke={active ? '#D4AF37' : 'currentColor'} strokeWidth="1.4" />
      <circle cx="10" cy="8" r="2"
        fill={active ? '#D4AF37' : 'none'}
        stroke={active ? '#D4AF37' : 'currentColor'} strokeWidth="1.2" />
    </svg>
  )
}

function GamingIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="2" y="6" width="16" height="10" rx="3"
        stroke={active ? '#D4AF37' : 'currentColor'} strokeWidth="1.4" />
      <path d="M7 11h2M8 10v2" stroke={active ? '#D4AF37' : 'currentColor'}
        strokeWidth="1.4" strokeLinecap="round" />
      <circle cx="13" cy="11" r="1" fill={active ? '#D4AF37' : 'currentColor'} />
    </svg>
  )
}

function VaultIcon({ active }: { active: boolean }) {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <rect x="3" y="3" width="14" height="14" rx="3"
        stroke={active ? '#D4AF37' : 'currentColor'} strokeWidth="1.4" />
      <circle cx="10" cy="10" r="3"
        stroke={active ? '#D4AF37' : 'currentColor'} strokeWidth="1.2" />
      <circle cx="10" cy="10" r="1" fill={active ? '#D4AF37' : 'currentColor'} />
      <path d="M10 7V5M10 15v-2M7 10H5M15 10h-2"
        stroke={active ? '#D4AF37' : 'currentColor'} strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  )
}

const ICONS = {
  dashboard: WalletIcon,
  trade: TradeIcon,
  travel: TravelIcon,
  gaming: GamingIcon,
  vault: VaultIcon,
}

// ── Desktop Sidebar ──────────────────────────────────────────

function Sidebar() {
  const pathname = usePathname()

  return (
    <aside
      className="hidden lg:flex flex-col"
      style={{
        width: 220,
        minHeight: '100vh',
        background: 'rgba(4,4,4,0.85)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderRight: '1px solid rgba(212,175,55,0.12)',
        padding: '28px 16px',
        position: 'fixed',
        top: 0,
        left: 0,
        bottom: 0,
        zIndex: 50,
        gap: 0,
      }}
    >
      {/* Logo */}
      <div style={{ marginBottom: 40, paddingLeft: 12 }}>
        <div className="font-display" style={{ fontSize: 22, fontWeight: 600, letterSpacing: '-0.02em', color: 'var(--text-primary)' }}>
          Dust<span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>ify</span>
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.15em', marginTop: 2 }}>
          SOUL WALLET
        </div>
      </div>

      {/* Nav links */}
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4, flex: 1 }}>
        {NAV_ITEMS.map((item) => {
          const active = pathname.startsWith(item.href)
          const Icon = ICONS[item.id]
          return (
            <Link
              key={item.id}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                borderRadius: 12,
                textDecoration: 'none',
                transition: 'all 0.2s ease',
                background: active ? 'var(--gold-glass-2)' : 'transparent',
                border: active ? '1px solid var(--border-gold-1)' : '1px solid transparent',
                color: active ? 'var(--gold)' : 'var(--text-secondary)',
                fontSize: 14,
                fontWeight: active ? 500 : 400,
              }}
            >
              <Icon active={active} />
              {item.label}
            </Link>
          )
        })}
      </nav>

      {/* Bottom: SBT status */}
      <div
        style={{
          marginTop: 24,
          padding: '12px 14px',
          background: 'var(--gold-glass-1)',
          border: '1px solid var(--border-gold-1)',
          borderRadius: 12,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <div
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 8px var(--success)',
              animation: 'pulseGold 2s ease-in-out infinite',
            }}
          />
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--success)', letterSpacing: '0.1em' }}>
            QUANTUM ACTIVE
          </span>
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', wordBreak: 'break-all' }}>
          SBT #00847
        </div>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--gold-dim)', marginTop: 2 }}>
          0xD4AF...ABCD
        </div>
      </div>
    </aside>
  )
}

// ── Mobile Header ─────────────────────────────────────────────

function MobileHeader() {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '16px 20px',
        background: 'rgba(4,4,4,0.9)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        borderBottom: '1px solid rgba(212,175,55,0.12)',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}
      className="lg:hidden"
    >
      <div className="font-display" style={{ fontSize: 20, fontWeight: 600, letterSpacing: '-0.02em' }}>
        Dust<span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>ify</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: '4px 10px',
          background: 'var(--gold-glass-1)',
          border: '1px solid var(--border-gold-1)',
          borderRadius: 100,
        }}
      >
        <div
          style={{
            width: 6, height: 6, borderRadius: '50%',
            background: 'var(--success)',
            boxShadow: '0 0 6px var(--success)',
          }}
        />
        <span className="font-mono" style={{ fontSize: 10, color: 'var(--gold-warm)', letterSpacing: '0.1em' }}>
          SBT #00847
        </span>
      </div>
    </header>
  )
}

// ── Mobile Bottom Navigation ──────────────────────────────────

function BottomNav() {
  const pathname = usePathname()

  return (
    <nav
      className="lg:hidden"
      style={{
        position: 'fixed',
        bottom: 20,
        left: '50%',
        transform: 'translateX(-50%)',
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        padding: '8px 12px',
        background: 'rgba(8,8,8,0.92)',
        backdropFilter: 'blur(40px)',
        WebkitBackdropFilter: 'blur(40px)',
        border: '1px solid rgba(212,175,55,0.2)',
        borderRadius: 100,
        boxShadow: '0 4px 40px rgba(0,0,0,0.7), 0 0 0 1px rgba(212,175,55,0.08)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const active = pathname.startsWith(item.href)
        const Icon = ICONS[item.id]
        return (
          <Link
            key={item.id}
            href={item.href}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 3,
              padding: '8px 14px',
              borderRadius: 100,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              background: active ? 'var(--gold-glass-2)' : 'transparent',
              border: active ? '1px solid var(--border-gold-1)' : '1px solid transparent',
              color: active ? 'var(--gold)' : 'var(--text-tertiary)',
              minWidth: 52,
            }}
          >
            <Icon active={active} />
            <span className="font-mono" style={{ fontSize: 9, letterSpacing: '0.06em', color: active ? 'var(--gold-warm)' : 'var(--text-tertiary)' }}>
              {item.label.toUpperCase()}
            </span>
          </Link>
        )
      })}
    </nav>
  )
}

// ── Shell Layout Export ───────────────────────────────────────

export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div
        style={{
          flex: 1,
          marginLeft: 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: '100vh',
        }}
        className="lg:ml-[220px]"
      >
        <MobileHeader />
        <main
          style={{
            flex: 1,
            padding: '28px 24px 120px',
            maxWidth: 1100,
            width: '100%',
            margin: '0 auto',
          }}
        >
          {children}
        </main>
      </div>
      <BottomNav />
    </div>
  )
}
