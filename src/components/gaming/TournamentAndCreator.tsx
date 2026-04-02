'use client'

import { useState } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import {
  MOCK_TOURNAMENTS,
  MOCK_CREATORS,
  MOCK_ACHIEVEMENTS,
  MOCK_GAME_ITEMS,
  MOCK_DEV_ANALYTICS,
  formatRevenue,
  rarityColor,
  tierColor,
  type Tournament,
  type Creator,
} from '@/lib/gaming-data'

// ============================================================
// TOURNAMENT SYSTEM
// ============================================================

function TournamentCard({ t }: { t: Tournament }) {
  const [entering, setEntering] = useState(false)
  const [entered, setEntered] = useState(false)
  const pct = Math.round((t.currentPlayers / t.maxPlayers) * 100)

  const statusColors = {
    LIVE: 'var(--danger)',
    UPCOMING: 'var(--gold-warm)',
    COMPLETED: 'var(--text-tertiary)',
  }

  async function enter() {
    setEntering(true)
    await new Promise(r => setTimeout(r, 1400))
    setEntering(false)
    setEntered(true)
  }

  const startDate = new Date(t.startDate)
  const dateStr = startDate.toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })

  return (
    <div
      style={{
        padding: '18px 20px',
        background: 'var(--glass-1)',
        border: `1px solid ${t.status === 'LIVE' ? 'rgba(248,113,113,0.3)' : 'var(--border-gold-0)'}`,
        borderRadius: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Game color accent */}
      <div
        style={{
          position: 'absolute',
          top: 0, left: 0, right: 0,
          height: 3,
          background: t.gameColor,
        }}
      />

      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 200 }}>
          {/* Status + game */}
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
              <div
                style={{
                  width: 7, height: 7, borderRadius: '50%',
                  background: statusColors[t.status],
                  boxShadow: t.status === 'LIVE' ? `0 0 8px ${statusColors[t.status]}` : 'none',
                }}
              />
              <span className="font-mono" style={{ fontSize: 10, color: statusColors[t.status], letterSpacing: '0.08em' }}>
                {t.status}
              </span>
            </div>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
              {t.game}
            </span>
            {t.sbtRequired && <StatusBadge variant="gold">SBT required</StatusBadge>}
          </div>

          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 4 }}>{t.title}</div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 12 }}>
            {t.bracket.replace('_', ' ')} · {dateStr}
            {t.skillRating && ` · ${t.skillRating}`}
          </div>

          {/* Player count bar */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                {t.currentPlayers} / {t.maxPlayers} players
              </span>
              <span className="font-mono" style={{ fontSize: 10, color: pct > 85 ? 'var(--danger)' : 'var(--text-tertiary)' }}>
                {pct}% full
              </span>
            </div>
            <div style={{ height: 4, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  width: `${pct}%`,
                  background: pct > 85 ? 'var(--danger)' : t.gameColor,
                  borderRadius: 100,
                }}
              />
            </div>
          </div>
        </div>

        {/* Prize + action */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>PRIZE POOL</div>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 600, color: 'var(--gold)', lineHeight: 1, marginBottom: 2 }}>
            ${t.prizePool.toLocaleString()}
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 12 }}>
            USDC · Smart contract escrow
            {t.entryFee > 0 && ` · $${t.entryFee} entry`}
            {t.entryFee === 0 && ' · Free entry'}
          </div>

          {t.status === 'LIVE' && (
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8 }}>
              👁 {t.spectators.toLocaleString()} watching
            </div>
          )}

          {t.status === 'COMPLETED' ? (
            <button className="btn-glass" style={{ padding: '8px 16px', fontSize: 12 }}>
              View results
            </button>
          ) : entered ? (
            <div>
              <StatusBadge variant="success">Registered</StatusBadge>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 6 }}>
                Smart contract holds your entry
              </div>
            </div>
          ) : (
            <button
              className="btn-sovereign"
              style={{ padding: '8px 18px', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={enter}
              disabled={entering}
            >
              {entering ? <><Spinner size={14} color="#000" />Entering…</> : t.status === 'LIVE' ? 'Spectate' : 'Register'}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function TournamentHub() {
  const [filter, setFilter] = useState<'ALL' | 'LIVE' | 'UPCOMING' | 'COMPLETED'>('ALL')

  const filtered = MOCK_TOURNAMENTS.filter(t => filter === 'ALL' || t.status === filter)

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {[
          { label: 'Live now', value: MOCK_TOURNAMENTS.filter(t => t.status === 'LIVE').length.toString(), sub: 'tournaments', color: 'var(--danger)' },
          { label: 'Total prize pools', value: '$55K', sub: 'USDC this month', color: 'var(--gold)' },
          { label: 'Active players', value: '12,847', sub: 'in tournaments', color: 'var(--success)' },
          { label: 'Dustify fee', value: '0%', sub: 'vs 10–30% elsewhere', color: 'var(--success)' },
        ].map(s => (
          <div key={s.label} style={{ padding: '14px', background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)', borderRadius: 12, textAlign: 'center' }}>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: 6, textTransform: 'uppercase' }}>{s.label}</div>
            <div className="font-mono" style={{ fontSize: 20, fontWeight: 500, color: s.color }}>{s.value}</div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 3 }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Smart contract notice */}
      <div style={{ padding: '12px 16px', background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-1)', borderRadius: 12, display: 'flex', gap: 10, alignItems: 'center' }}>
        <span style={{ fontSize: 14, flexShrink: 0 }}>◈</span>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', lineHeight: 1.6 }}>
          Prize pools are held in smart contracts — not by Dustify. Winners are paid automatically when results are verified. No tournament organizer can withhold prizes. Ever.
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6 }}>
        {(['ALL', 'LIVE', 'UPCOMING', 'COMPLETED'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: 100,
              border: `1px solid ${filter === f ? 'var(--border-gold-2)' : 'var(--border-glass)'}`,
              background: filter === f ? 'var(--gold-glass-2)' : 'transparent',
              color: filter === f ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily: "'Geist', system-ui, sans-serif",
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {f === 'LIVE' && '● '}{f.charAt(0) + f.slice(1).toLowerCase()}
          </button>
        ))}
        <button
          className="btn-sovereign"
          style={{ marginLeft: 'auto', padding: '6px 18px', fontSize: 12 }}
        >
          + Create tournament
        </button>
      </div>

      {/* Tournament list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {filtered.map(t => <TournamentCard key={t.id} t={t} />)}
      </div>
    </div>
  )
}

// ============================================================
// CREATOR HUB
// ============================================================

function CreatorCard({ creator }: { creator: Creator }) {
  const tc = tierColor(creator.tier)

  return (
    <div style={{ padding: '16px', background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)', borderRadius: 14 }}>
      {/* Avatar + name */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: 14 }}>
        <div style={{ position: 'relative', flexShrink: 0 }}>
          <div
            style={{
              width: 48, height: 48, borderRadius: '50%',
              background: creator.avatarColor + '20',
              border: `2px solid ${creator.avatarColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: "'Playfair Display', serif",
              fontSize: 16, fontWeight: 600,
              color: creator.avatarColor,
            }}
          >
            {creator.avatar}
          </div>
          {creator.streaming && (
            <div
              style={{
                position: 'absolute', bottom: 0, right: 0,
                width: 14, height: 14, borderRadius: '50%',
                background: 'var(--danger)',
                border: '2px solid var(--void)',
                boxShadow: '0 0 6px var(--danger)',
              }}
            />
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 500 }}>{creator.name}</span>
            {creator.verified && (
              <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
                <circle cx="6.5" cy="6.5" r="5.5" fill={tc} opacity="0.2"/>
                <circle cx="6.5" cy="6.5" r="5.5" stroke={tc} strokeWidth="1"/>
                <path d="M4 6.5l2 2 3-3" stroke={tc} strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
          </div>
          <div className="font-mono" style={{ fontSize: 9, color: tc, letterSpacing: '0.1em', marginBottom: 4 }}>
            {creator.tier} CREATOR · SBT #{creator.sbtId}
          </div>
          {creator.streaming && (
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--danger)' }}>
              ● LIVE · {creator.streamViewers?.toLocaleString()} viewers
            </div>
          )}
        </div>
        <button className="btn-glass" style={{ padding: '5px 12px', fontSize: 11, flexShrink: 0 }}>
          Follow
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Games', value: creator.gamesPublished.toString() },
          { label: 'Downloads', value: creator.totalDownloads >= 1_000_000 ? `${(creator.totalDownloads / 1_000_000).toFixed(1)}M` : `${(creator.totalDownloads / 1000).toFixed(0)}K` },
          { label: 'Followers', value: creator.followers >= 1000 ? `${(creator.followers / 1000).toFixed(0)}K` : creator.followers.toString() },
        ].map(s => (
          <div key={s.label} style={{ textAlign: 'center', padding: '8px', background: 'var(--glass-2)', borderRadius: 8 }}>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 3 }}>{s.label.toUpperCase()}</div>
            <div className="font-mono" style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
          Top: {creator.topGame}
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--success)', fontWeight: 500 }}>
          {formatRevenue(creator.totalRevenue)} earned
        </div>
      </div>
    </div>
  )
}

function AchievementSBTCard({ a }: { a: typeof MOCK_ACHIEVEMENTS[0] }) {
  const color = rarityColor(a.rarity)
  return (
    <div
      style={{
        padding: '14px',
        background: 'var(--glass-1)',
        border: `1px solid ${color}30`,
        borderRadius: 12,
        display: 'flex',
        gap: 12,
        alignItems: 'flex-start',
      }}
    >
      <div
        style={{
          width: 44, height: 44, borderRadius: 10,
          background: color + '15',
          border: `1px solid ${color}30`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 20, color,
          flexShrink: 0,
        }}
      >
        {a.icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 3 }}>
          <span style={{ fontSize: 13, fontWeight: 500 }}>{a.title}</span>
          <span
            className="font-mono"
            style={{ fontSize: 9, padding: '1px 7px', borderRadius: 100, background: color + '15', color, border: `1px solid ${color}25` }}
          >
            {a.rarity.replace('_', ' ')}
          </span>
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 6 }}>{a.description}</div>
        <div style={{ display: 'flex', gap: 10 }}>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{a.game}</span>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{a.holders} holders</span>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--gold-warm)', marginLeft: 'auto' }}>
            +{a.pointsValue.toLocaleString()} pts
          </span>
        </div>
      </div>
    </div>
  )
}

export function CreatorHub() {
  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Creators grid */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>Top creators</div>
          <StatusBadge variant="gold">Ranked by community rating</StatusBadge>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
          {MOCK_CREATORS.slice(0, 4).map(c => <CreatorCard key={c.id} creator={c} />)}
        </div>
      </div>

      {/* Achievement SBTs */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 500, marginBottom: 2 }}>Achievement SBTs</div>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Permanent on-chain proof of skill — viewable on your SBT vault
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {MOCK_ACHIEVEMENTS.map(a => <AchievementSBTCard key={a.id} a={a} />)}
        </div>
      </div>

      {/* In-game asset marketplace */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <div>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 500, marginBottom: 2 }}>Asset marketplace</div>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              SBT-owned in-game items · P2P trading · Developer earns 5% royalty on every sale
            </div>
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
          {MOCK_GAME_ITEMS.map(item => {
            const color = rarityColor(item.rarity)
            return (
              <div key={item.id} style={{ padding: '14px', background: 'var(--glass-1)', border: `1px solid ${color}25`, borderRadius: 12, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ width: 40, height: 40, borderRadius: 8, background: item.itemColor + '20', border: `1px solid ${item.itemColor}30`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                  ◆
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 500, marginBottom: 2 }}>{item.name}</div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    <span className="font-mono" style={{ fontSize: 9, padding: '1px 6px', borderRadius: 100, background: color + '15', color, border: `1px solid ${color}25` }}>
                      {item.rarity}
                    </span>
                    {item.crossGameCompatible && (
                      <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Cross-game</span>
                    )}
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div className="font-mono" style={{ fontSize: 14, fontWeight: 500, color: 'var(--gold)' }}>${item.price}</div>
                  <button className="btn-sovereign" style={{ marginTop: 6, padding: '4px 12px', fontSize: 10 }}>Buy</button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// DEVELOPER PORTAL
// ============================================================

export function DevPortal() {
  const [activeGame, setActiveGame] = useState('Neon Abyss II')
  const d = MOCK_DEV_ANALYTICS
  const totalRevenue = Object.values(d.revenueByPlatform).reduce((a, b) => a + b, 0)

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Revenue header */}
      <div className="glass-heavy" style={{ padding: 28 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
          <div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.15em', marginBottom: 8 }}>DEVELOPER DASHBOARD · {activeGame}</div>
            <div className="font-display" style={{ fontSize: 38, fontWeight: 600, color: 'var(--gold)', letterSpacing: '-0.02em', lineHeight: 1 }}>
              {formatRevenue(d.totalRevenue)}
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 8 }}>
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--success)' }}>+${d.revenueToday.toLocaleString()} today</span>
              <StatusBadge variant="success">5% Dustify fee vs Steam 30%</StatusBadge>
            </div>
          </div>
          <button className="btn-sovereign" style={{ padding: '10px 20px', fontSize: 13 }}>
            + Publish new game
          </button>
        </div>

        {/* Key stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 10 }}>
          {[
            { label: 'Total players', value: d.totalPlayers.toLocaleString() },
            { label: 'Daily active', value: d.dailyActivePlayers.toLocaleString() },
            { label: 'Avg session', value: `${d.avgSessionMinutes}m` },
            { label: 'Day-1 retention', value: `${d.retentionDay1}%` },
            { label: 'Crash rate', value: `${d.crashRate}%` },
          ].map(s => (
            <div key={s.label} style={{ padding: '12px', background: 'var(--glass-2)', border: '1px solid var(--border-void)', borderRadius: 10, textAlign: 'center' }}>
              <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.1em', marginBottom: 5, textTransform: 'uppercase' }}>{s.label}</div>
              <div className="font-mono" style={{ fontSize: 16, fontWeight: 500 }}>{s.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {/* Revenue by platform */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Revenue by platform</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {Object.entries(d.revenueByPlatform)
              .filter(([, v]) => v > 0)
              .sort(([, a], [, b]) => b - a)
              .map(([platform, revenue]) => {
                const pct = Math.round((revenue / totalRevenue) * 100)
                const colors: Record<string, string> = { STEAM: '#171A21', EPIC: '#313131', DUSTIFY: '#D4AF37', ITCH: '#FF2449' }
                const color = colors[platform] ?? '#888780'
                return (
                  <div key={platform}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span className="font-mono" style={{ fontSize: 11 }}>{platform}</span>
                      <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>
                        {formatRevenue(revenue)} · {pct}%
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: platform === 'DUSTIFY' ? 'var(--gold)' : 'var(--text-tertiary)', borderRadius: 100, opacity: 0.8 }} />
                    </div>
                  </div>
                )
              })}
          </div>
          <div style={{ marginTop: 14, padding: '10px 12px', background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-0)', borderRadius: 8 }}>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--gold-warm)', lineHeight: 1.5 }}>
              ✦ Dustify platform generates 25% of revenue at 5% fee (vs 30% on Steam). Net profit is significantly higher per Dustify sale.
            </div>
          </div>
        </div>

        {/* Top countries + retention */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>Top revenue countries</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
            {d.topCountries.map((c, i) => {
              const pct = Math.round((c.revenue / d.topCountries[0].revenue) * 100)
              return (
                <div key={c.country}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                    <span style={{ fontSize: 12 }}>{i + 1}. {c.country}</span>
                    <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{formatRevenue(c.revenue)}</span>
                  </div>
                  <div style={{ height: 4, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${pct}%`, background: 'var(--gold)', borderRadius: 100, opacity: 0.6 }} />
                  </div>
                </div>
              )
            })}
          </div>

          <div className="gold-divider" style={{ marginBottom: 14 }} />
          <div className="font-display" style={{ fontSize: 15, fontWeight: 500, marginBottom: 12 }}>Retention curve</div>
          <div style={{ display: 'flex', gap: 10 }}>
            {[
              { label: 'Day 1', value: d.retentionDay1, target: 40 },
              { label: 'Day 7', value: d.retentionDay7, target: 25 },
              { label: 'Day 30', value: d.retentionDay30, target: 15 },
            ].map(r => (
              <div key={r.label} style={{ flex: 1, textAlign: 'center', padding: '10px', background: 'var(--glass-2)', borderRadius: 8 }}>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4 }}>{r.label.toUpperCase()}</div>
                <div className="font-mono" style={{ fontSize: 18, fontWeight: 500, color: r.value >= r.target ? 'var(--success)' : 'var(--warning)' }}>
                  {r.value}%
                </div>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>
                  target {r.target}%
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Publish wizard teaser */}
      <div
        style={{
          padding: '20px 24px',
          background: 'var(--glass-1)',
          border: '1px solid var(--border-gold-1)',
          borderRadius: 14,
          display: 'flex',
          alignItems: 'center',
          gap: 20,
          flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 6 }}>One-click multi-platform publishing</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Submit your build once. Dustify deploys to Steam, Epic Games Store, App Store (iOS/Android), itch.io, and the Dustify Marketplace simultaneously. Revenue splits are coded into your game's smart contract at upload — automated, trustless, instant.
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {['Steam', 'Epic', 'App Store', 'itch.io', 'Dustify'].map(p => (
              <span key={p} className="font-mono" style={{ fontSize: 9, padding: '2px 8px', borderRadius: 100, background: 'var(--glass-2)', color: 'var(--text-tertiary)' }}>{p}</span>
            ))}
          </div>
          <button className="btn-sovereign" style={{ padding: '10px 20px', fontSize: 13 }}>
            Start publishing wizard
          </button>
        </div>
      </div>
    </div>
  )
}
