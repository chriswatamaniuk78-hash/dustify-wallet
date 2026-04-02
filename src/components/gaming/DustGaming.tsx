'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/ui'
import { GameMarketplace, KidsZone } from './MarketplaceAndKids'
import { TournamentHub, CreatorHub, DevPortal } from './TournamentAndCreator'

type GamingTab = 'marketplace' | 'tournaments' | 'creators' | 'kids' | 'dev' | 'leaderboard' | 'assets'

const TABS: { id: GamingTab; label: string; icon: string; badge?: string }[] = [
  { id: 'marketplace',  label: 'Marketplace',  icon: '◎' },
  { id: 'tournaments',  label: 'Tournaments',  icon: '◆', badge: 'LIVE' },
  { id: 'creators',     label: 'Creators',     icon: '◉' },
  { id: 'kids',         label: 'Kids Zone',    icon: '◐', badge: 'SBT' },
  { id: 'dev',          label: 'Dev Portal',   icon: '◈' },
  { id: 'leaderboard',  label: 'Leaderboards', icon: '▲' },
  { id: 'assets',       label: 'My library',   icon: '◇' },
]

// ── Global leaderboard ────────────────────────────────────────

function GlobalLeaderboard() {
  const players = [
    { rank: 1, name: 'ShadowBlade_9', sbt: '00041', game: 'Hollow Realms', score: 9_847_320, rating: 'Diamond I', verified: true, country: '🇨🇦' },
    { rank: 2, name: 'QuantumRacer', sbt: '00112', game: 'Velocity Arena', score: 8_204_110, rating: 'Master', verified: true, country: '🇺🇸' },
    { rank: 3, name: 'AbyssDelver', sbt: '00234', game: 'Neon Abyss II', score: 7_841_000, rating: 'Grandmaster', verified: true, country: '🇬🇧' },
    { rank: 4, name: 'TerraLord', sbt: '00387', game: 'Terra Kingdoms', score: 6_920_400, rating: 'Diamond II', verified: false, country: '🇩🇪' },
    { rank: 5, name: 'CircuitMind', sbt: '00521', game: 'Circuit Breaker', score: 5_847_230, rating: 'Platinum I', verified: true, country: '🇯🇵' },
    { rank: 6, name: 'PixelStrike', sbt: '00689', game: 'Neon Abyss II', score: 4_921_870, rating: 'Diamond I', verified: false, country: '🇨🇦' },
    { rank: 7, name: 'NeonGhost', sbt: '00847', game: 'Velocity Arena', score: 3_847_120, rating: 'Master', verified: true, country: '🇰🇷' },
  ]

  const rankColors = ['var(--gold)', 'rgba(192,192,192,0.9)', 'rgba(205,127,50,0.9)']

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '12px 16px', background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-1)', borderRadius: 12 }}>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', lineHeight: 1.6 }}>
          ✦ Every leaderboard entry is a verified unique human with an SBT. No bots, no alt accounts, no smurfs. Rank #1 means you are verifiably the best single human player. Anti-cheat violations affect your SBT reputation across all games permanently.
        </div>
      </div>

      <div className="glass" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>Global rankings</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <StatusBadge variant="success" pulse>SBT-verified</StatusBadge>
            <StatusBadge variant="gold">No bots</StatusBadge>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {players.map(p => (
            <div
              key={p.rank}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                padding: '12px',
                borderRadius: 10,
                background: p.rank <= 3 ? 'var(--gold-glass-1)' : 'transparent',
                border: `1px solid ${p.rank <= 3 ? 'var(--border-gold-1)' : 'transparent'}`,
                transition: 'background 0.15s',
              }}
            >
              <div
                className="font-display"
                style={{ fontSize: 20, fontWeight: 600, color: rankColors[p.rank - 1] ?? 'var(--text-tertiary)', minWidth: 32, textAlign: 'center' }}
              >
                {p.rank}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{p.country} {p.name}</span>
                  {p.verified && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <circle cx="6" cy="6" r="5.5" fill="var(--gold)" opacity="0.2"/>
                      <circle cx="6" cy="6" r="5.5" stroke="var(--gold)" strokeWidth="1"/>
                      <path d="M3.5 6l2 2 3-3" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  )}
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                  {p.game} · SBT #{p.sbt} · {p.rating}
                </div>
              </div>
              <div className="font-mono" style={{ fontSize: 13, fontWeight: 500, color: p.rank <= 3 ? 'var(--gold)' : 'var(--text-secondary)' }}>
                {p.score.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── My library ────────────────────────────────────────────────

function MyLibrary() {
  const owned = [
    { title: 'Hollow Realms', developer: 'DarkArc Interactive', hoursPlayed: 142, lastPlayed: '2 hours ago', color: '#1a0a0a', accentColor: '#D85A30', sbtId: '#00847', resellValue: 48 },
    { title: 'Neon Abyss II', developer: 'PixelForge Studio', hoursPlayed: 87, lastPlayed: 'Yesterday', color: '#0f1035', accentColor: '#7F77DD', sbtId: '#00847', resellValue: 22 },
    { title: 'Circuit Breaker', developer: 'NeonByte Labs', hoursPlayed: 34, lastPlayed: '3 days ago', color: '#0a1a1a', accentColor: '#EF9F27', sbtId: '#00847', resellValue: 8 },
  ]

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '12px 16px', background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-1)', borderRadius: 12 }}>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', lineHeight: 1.6 }}>
          ✦ Your games are SBT licences — owned on-chain, not on a server. They cannot be taken away. You can resell any SBT-licensed game — the developer earns 5% royalty automatically.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {owned.map(g => (
          <div
            key={g.title}
            style={{ display: 'flex', gap: 16, padding: '16px', background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)', borderRadius: 14, alignItems: 'center' }}
          >
            <div
              style={{
                width: 64, height: 64, borderRadius: 12, flexShrink: 0,
                background: `linear-gradient(135deg, ${g.color}, ${g.accentColor}33)`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}
            >
              <div style={{ width: 20, height: 20, borderRadius: '50%', background: g.accentColor, opacity: 0.8 }} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{g.title}</div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>
                {g.developer} · SBT licence on {g.sbtId}
              </div>
              <div style={{ display: 'flex', gap: 12 }}>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{g.hoursPlayed}h played</span>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>Last: {g.lastPlayed}</span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
              <div style={{ textAlign: 'right' }}>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 2 }}>Resell value</div>
                <div className="font-mono" style={{ fontSize: 14, fontWeight: 500, color: 'var(--gold)' }}>${g.resellValue}</div>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <button className="btn-sovereign" style={{ padding: '6px 14px', fontSize: 12 }}>Play</button>
                <button className="btn-glass" style={{ padding: '5px 14px', fontSize: 11 }}>Resell</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Dust Gaming component ────────────────────────────────

export default function DustGaming() {
  const [activeTab, setActiveTab] = useState<GamingTab>('marketplace')

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Tab bar — two rows */}
      <div style={{ display: 'flex', gap: 4, padding: 4, background: 'var(--glass-2)', border: '1px solid var(--border-gold-0)', borderRadius: 14, flexWrap: 'wrap' }}>
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: 'max-content',
              padding: '9px 12px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === tab.id ? 'var(--gold-glass-3)' : 'transparent',
              color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily: "'Geist', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 13 }}>{tab.icon}</span>
            {tab.label}
            {tab.badge && (
              <span
                className="font-mono"
                style={{
                  fontSize: 8,
                  padding: '1px 5px',
                  borderRadius: 100,
                  background: tab.badge === 'LIVE'
                    ? 'rgba(248,113,113,0.2)'
                    : tab.badge === 'SBT'
                    ? 'rgba(212,175,55,0.2)'
                    : 'rgba(127,119,221,0.2)',
                  color: tab.badge === 'LIVE' ? 'var(--danger)' : tab.badge === 'SBT' ? 'var(--gold-warm)' : '#AFA9EC',
                  border: `1px solid ${tab.badge === 'LIVE' ? 'rgba(248,113,113,0.35)' : 'rgba(212,175,55,0.35)'}`,
                }}
              >
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {activeTab === 'marketplace'  && <GameMarketplace />}
      {activeTab === 'tournaments'  && <TournamentHub />}
      {activeTab === 'creators'     && <CreatorHub />}
      {activeTab === 'kids'         && <KidsZone />}
      {activeTab === 'dev'          && <DevPortal />}
      {activeTab === 'leaderboard'  && <GlobalLeaderboard />}
      {activeTab === 'assets'       && <MyLibrary />}
    </div>
  )
}
