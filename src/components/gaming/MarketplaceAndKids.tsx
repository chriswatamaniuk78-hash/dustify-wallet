'use client'

import { useState } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import {
  MOCK_GAMES,
  MOCK_CHILD_PROFILE,
  formatRevenue,
  genreIcon,
  ageRatingColor,
  type Game,
  type GameGenre,
  type ChildProfile,
} from '@/lib/gaming-data'

// ============================================================
// GAME MARKETPLACE
// ============================================================

function GameCard({ game, onBuy }: { game: Game; onBuy: (g: Game) => void }) {
  const [buying, setBuying] = useState(false)
  const [owned, setOwned] = useState(false)
  const [trialing, setTrialing] = useState(false)

  async function handleBuy() {
    setBuying(true)
    await new Promise(r => setTimeout(r, 1600))
    setBuying(false)
    setOwned(true)
    onBuy(game)
  }

  async function handleTrial() {
    setTrialing(true)
    await new Promise(r => setTimeout(r, 1000))
    setTrialing(false)
  }

  const discount = game.originalPrice
    ? Math.round((1 - game.price / game.originalPrice) * 100)
    : 0

  return (
    <div
      style={{
        background: 'var(--glass-1)',
        border: `1px solid ${owned ? 'var(--border-gold-2)' : game.isExclusive ? game.accentColor + '40' : 'var(--border-gold-0)'}`,
        borderRadius: 16,
        overflow: 'hidden',
        transition: 'all 0.2s',
      }}
    >
      {/* Cover art */}
      <div
        style={{
          height: 130,
          background: `linear-gradient(135deg, ${game.coverColor}, ${game.accentColor}33)`,
          position: 'relative',
          display: 'flex',
          alignItems: 'flex-end',
          padding: '10px 12px',
        }}
      >
        {/* Badges */}
        <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5 }}>
          {game.isExclusive && (
            <span
              className="font-mono"
              style={{
                fontSize: 8,
                padding: '2px 7px',
                borderRadius: 100,
                background: game.accentColor,
                color: '#fff',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              EXCLUSIVE {game.exclusiveDaysLeft}D LEFT
            </span>
          )}
          {discount > 0 && (
            <span
              className="font-mono"
              style={{
                fontSize: 9,
                padding: '2px 7px',
                borderRadius: 100,
                background: 'var(--danger)',
                color: '#fff',
                fontWeight: 700,
              }}
            >
              -{discount}%
            </span>
          )}
        </div>

        {/* Age rating */}
        <div
          style={{
            position: 'absolute',
            top: 10,
            right: 10,
            width: 26,
            height: 26,
            borderRadius: 6,
            background: ageRatingColor(game.ageRating),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 10,
            fontWeight: 700,
            color: '#fff',
          }}
        >
          {game.ageRating}
        </div>

        {/* Genre + platforms */}
        <div style={{ display: 'flex', gap: 5, alignItems: 'center', flexWrap: 'wrap' }}>
          <span className="font-mono" style={{ fontSize: 9, color: 'rgba(255,255,255,0.7)' }}>
            {genreIcon(game.genre)} {game.genre}
          </span>
          <span className="font-mono" style={{ fontSize: 8, color: 'rgba(255,255,255,0.5)' }}>
            {game.platforms.slice(0, 3).join(' · ')}
          </span>
        </div>

        {/* SBT ownership badge */}
        {game.hasSBTOwnership && (
          <div style={{ position: 'absolute', bottom: 10, right: 12 }}>
            <span
              className="font-mono"
              style={{
                fontSize: 8,
                padding: '2px 6px',
                borderRadius: 100,
                background: 'rgba(212,175,55,0.2)',
                border: '1px solid rgba(212,175,55,0.4)',
                color: '#D4AF37',
              }}
            >
              SBT owned
            </span>
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ padding: '14px' }}>
        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{game.title}</div>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8 }}>
          {game.developer}
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 10 }}>
          {game.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="font-mono"
              style={{
                fontSize: 9,
                padding: '2px 7px',
                borderRadius: 100,
                background: 'var(--glass-2)',
                color: 'var(--text-tertiary)',
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Rating + dust score */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--gold)' }}>
            ★ {game.rating.toFixed(1)}
          </span>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            {game.reviewCount.toLocaleString()} reviews
          </span>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 'auto' }}>
            Dust {game.dustScore}
          </span>
        </div>

        {/* Price + actions */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <div>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 600, color: game.price === 0 ? 'var(--success)' : 'var(--gold)', lineHeight: 1 }}>
              {game.price === 0 ? 'Free' : `$${game.price}`}
            </div>
            {game.originalPrice && (
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', textDecoration: 'line-through' }}>
                ${game.originalPrice}
              </div>
            )}
          </div>
          <div style={{ flex: 1, display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
            {game.hasFreeTrial && !owned && (
              <button
                className="btn-glass"
                style={{ padding: '7px 12px', fontSize: 11, display: 'flex', alignItems: 'center', gap: 4 }}
                onClick={handleTrial}
                disabled={trialing}
              >
                {trialing ? '▶ Starting…' : '▶ Try 60min'}
              </button>
            )}
            <button
              className={owned ? 'btn-glass' : 'btn-sovereign'}
              style={{ padding: '7px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={handleBuy}
              disabled={buying || owned}
            >
              {buying ? <><Spinner size={12} color="#000" />Buying…</> : owned ? '✓ Owned' : game.price === 0 ? 'Install' : 'Buy'}
            </button>
          </div>
        </div>

        {game.hasSBTOwnership && !owned && (
          <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 6 }}>
            {game.resellable ? '↔ Resellable · ' : ''}+{game.pointsEarned.toLocaleString()} Waterfall pts
          </div>
        )}
      </div>
    </div>
  )
}

export function GameMarketplace() {
  const [filter, setFilter] = useState<GameGenre | 'ALL'>('ALL')
  const [sortBy, setSortBy] = useState<'rating' | 'price' | 'downloads'>('rating')
  const [search, setSearch] = useState('')
  const [ownedGames, setOwnedGames] = useState<Set<string>>(new Set())

  const filtered = MOCK_GAMES
    .filter(g => filter === 'ALL' || g.genre === filter)
    .filter(g => !search || g.title.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'price') return a.price - b.price
      return b.downloads - a.downloads
    })

  const genres: (GameGenre | 'ALL')[] = ['ALL', 'ACTION', 'RPG', 'STRATEGY', 'PUZZLE', 'EDUCATIONAL', 'SPORTS']

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      {/* Header */}
      <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search games…"
          style={{
            flex: 1,
            minWidth: 200,
            background: 'var(--glass-1)',
            border: '1px solid var(--border-gold-1)',
            borderRadius: 10,
            padding: '9px 14px',
            color: 'var(--text-primary)',
            fontFamily: "'Geist', system-ui, sans-serif",
            fontSize: 13,
            outline: 'none',
          }}
        />
        <select
          value={sortBy}
          onChange={e => setSortBy(e.target.value as typeof sortBy)}
          style={{
            background: 'var(--glass-2)',
            border: '1px solid var(--border-gold-1)',
            borderRadius: 10,
            padding: '9px 12px',
            color: 'var(--text-primary)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="rating">Top rated</option>
          <option value="downloads">Most downloaded</option>
          <option value="price">Price: low to high</option>
        </select>
      </div>

      {/* Genre filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {genres.map(g => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            style={{
              padding: '6px 14px',
              borderRadius: 100,
              border: `1px solid ${filter === g ? 'var(--border-gold-2)' : 'var(--border-glass)'}`,
              background: filter === g ? 'var(--gold-glass-2)' : 'transparent',
              color: filter === g ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily: "'Geist', system-ui, sans-serif",
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
          >
            {g !== 'ALL' && genreIcon(g as GameGenre) + ' '}
            {g === 'ALL' ? 'All games' : g.charAt(0) + g.slice(1).toLowerCase()}
          </button>
        ))}
      </div>

      {/* SBT ownership explainer */}
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--gold-glass-1)',
          border: '1px solid var(--border-gold-1)',
          borderRadius: 12,
          display: 'flex',
          gap: 16,
          alignItems: 'center',
          flexWrap: 'wrap',
        }}
      >
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', lineHeight: 1.6, flex: 1 }}>
          ✦ SBT game ownership = your licence lives on-chain, not on a server. Games cannot be taken away. You can resell any SBT-licensed game and the developer automatically earns a 5% royalty on every resale.
        </div>
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <StatusBadge variant="gold">True ownership</StatusBadge>
          <StatusBadge variant="success">5% dev royalty</StatusBadge>
        </div>
      </div>

      {/* Game grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 14 }}>
        {filtered.map(game => (
          <GameCard
            key={game.id}
            game={game}
            onBuy={g => setOwnedGames(prev => new Set([...prev, g.id]))}
          />
        ))}
      </div>
    </div>
  )
}

// ============================================================
// KIDS ZONE
// ============================================================

function ChildSafetyMeter({ minutesPlayed, limit }: { minutesPlayed: number; limit: number }) {
  const pct = Math.min(100, (minutesPlayed / limit) * 100)
  const color = pct < 60 ? 'var(--success)' : pct < 85 ? 'var(--warning)' : 'var(--danger)'
  const remaining = limit - minutesPlayed

  return (
    <div style={{ padding: '14px 16px', background: 'var(--glass-2)', border: `1px solid ${color}25`, borderRadius: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
        <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.12em' }}>SCREEN TIME TODAY</span>
        <span className="font-mono" style={{ fontSize: 11, color, fontWeight: 500 }}>
          {minutesPlayed}m / {limit}m
        </span>
      </div>
      <div style={{ height: 8, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden', marginBottom: 6 }}>
        <div
          style={{
            height: '100%',
            width: `${pct}%`,
            background: color,
            borderRadius: 100,
            transition: 'width 0.5s ease',
          }}
        />
      </div>
      <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
        {remaining > 0 ? `${remaining} minutes remaining today` : '⚠ Daily limit reached'}
      </div>
    </div>
  )
}

function GenreToggle({
  genre,
  allowed,
  onToggle,
}: {
  genre: GameGenre
  allowed: boolean
  onToggle: () => void
}) {
  return (
    <div
      onClick={onToggle}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        padding: '8px 12px',
        borderRadius: 10,
        border: `1px solid ${allowed ? 'rgba(74,222,128,0.3)' : 'var(--border-glass)'}`,
        background: allowed ? 'rgba(74,222,128,0.06)' : 'transparent',
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      <span style={{ fontSize: 14 }}>{genreIcon(genre)}</span>
      <span style={{ fontSize: 12, flex: 1 }}>{genre.charAt(0) + genre.slice(1).toLowerCase()}</span>
      <div
        style={{
          width: 32,
          height: 18,
          borderRadius: 100,
          background: allowed ? 'var(--success)' : 'var(--glass-3)',
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 2,
            left: allowed ? 16 : 2,
            width: 14,
            height: 14,
            borderRadius: '50%',
            background: '#fff',
            transition: 'left 0.2s',
          }}
        />
      </div>
    </div>
  )
}

export function KidsZone() {
  const [child, setChild] = useState<ChildProfile>({ ...MOCK_CHILD_PROFILE })
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const allGenres: GameGenre[] = ['EDUCATIONAL', 'PUZZLE', 'PLATFORMER', 'SPORTS', 'ACTION', 'STRATEGY', 'SIMULATION', 'RPG']

  function toggleGenre(g: GameGenre) {
    setChild(prev => ({
      ...prev,
      allowedGenres: prev.allowedGenres.includes(g)
        ? prev.allowedGenres.filter(x => x !== g)
        : [...prev.allowedGenres, g],
    }))
    setSaved(false)
  }

  async function handleSave() {
    setSaving(true)
    await new Promise(r => setTimeout(r, 1200))
    setSaving(false)
    setSaved(true)
  }

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* Child profile header */}
      <div className="glass-heavy" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 20 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'var(--gold-glass-2)',
              border: '2px solid var(--border-gold-2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: "'Playfair Display', serif",
              fontSize: 22,
              fontWeight: 600,
              color: 'var(--gold)',
            }}
          >
            {child.name[0]}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>{child.name}'s profile</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <StatusBadge variant="info">Age {child.age} · {child.ageGroup}</StatusBadge>
              <StatusBadge variant="gold">SBT #{child.sbtId}</StatusBadge>
              <StatusBadge variant="success">{child.pointsBalance.toLocaleString()} pts earned</StatusBadge>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>SPENDING CAP</div>
            <div className="font-display" style={{ fontSize: 22, color: 'var(--gold)' }}>
              ${child.spendingCapCAD}/mo
            </div>
          </div>
        </div>

        {/* Screen time meter */}
        <ChildSafetyMeter
          minutesPlayed={child.minutesPlayedToday}
          limit={child.dailyLimitMinutes}
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Time & spending controls */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 500, marginBottom: 20 }}>
            Time & spending limits
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Daily time limit */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
                  DAILY TIME LIMIT
                </span>
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--gold-warm)', fontWeight: 500 }}>
                  {child.dailyLimitMinutes}m ({Math.floor(child.dailyLimitMinutes / 60)}h {child.dailyLimitMinutes % 60}m)
                </span>
              </div>
              <input
                type="range"
                min={15}
                max={240}
                step={15}
                value={child.dailyLimitMinutes}
                onChange={e => { setChild(p => ({ ...p, dailyLimitMinutes: parseInt(e.target.value) })); setSaved(false) }}
                style={{ width: '100%', accentColor: 'var(--gold)' }}
              />
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>15 min</span>
                <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>4 hours</span>
              </div>
            </div>

            {/* Monthly spending cap */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>
                  MONTHLY SPENDING CAP
                </span>
                <span className="font-mono" style={{ fontSize: 12, color: 'var(--gold-warm)', fontWeight: 500 }}>
                  {child.spendingCapCAD === 0 ? 'No spending' : `$${child.spendingCapCAD} CAD`}
                </span>
              </div>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={child.spendingCapCAD}
                onChange={e => { setChild(p => ({ ...p, spendingCapCAD: parseInt(e.target.value) })); setSaved(false) }}
                style={{ width: '100%', accentColor: 'var(--gold)' }}
              />
            </div>

            {/* Friend approval toggle */}
            <div
              onClick={() => { setChild(p => ({ ...p, friendsRequireApproval: !p.friendsRequireApproval })); setSaved(false) }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '12px 14px',
                background: child.friendsRequireApproval ? 'rgba(74,222,128,0.06)' : 'var(--glass-1)',
                border: `1px solid ${child.friendsRequireApproval ? 'rgba(74,222,128,0.25)' : 'var(--border-glass)'}`,
                borderRadius: 10,
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>Friend requests require approval</div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                  You approve every new friend before {child.name} can play with them
                </div>
              </div>
              <div
                style={{
                  width: 36,
                  height: 20,
                  borderRadius: 100,
                  background: child.friendsRequireApproval ? 'var(--success)' : 'var(--glass-3)',
                  position: 'relative',
                  transition: 'background 0.2s',
                  flexShrink: 0,
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 2,
                    left: child.friendsRequireApproval ? 18 : 2,
                    width: 16,
                    height: 16,
                    borderRadius: '50%',
                    background: '#fff',
                    transition: 'left 0.2s',
                  }}
                />
              </div>
            </div>

            {/* Educational bonus notice */}
            <div
              style={{
                padding: '10px 14px',
                background: 'var(--gold-glass-1)',
                border: '1px solid var(--border-gold-0)',
                borderRadius: 10,
              }}
            >
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--gold-warm)', lineHeight: 1.6 }}>
                ✦ Educational games earn 3× Waterfall points. {child.name} has earned {child.pointsBalance.toLocaleString()} pts — worth ${(child.pointsBalance / 100).toFixed(2)} CAD in your shared account.
              </div>
            </div>
          </div>
        </div>

        {/* Genre whitelist */}
        <div className="glass" style={{ padding: 24 }}>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 500, marginBottom: 6 }}>
            Allowed game genres
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 16 }}>
            {child.name} can only play games in enabled categories
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {allGenres.map(g => (
              <GenreToggle
                key={g}
                genre={g}
                allowed={child.allowedGenres.includes(g)}
                onToggle={() => toggleGenre(g)}
              />
            ))}
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="glass" style={{ padding: 24 }}>
        <div className="font-display" style={{ fontSize: 16, fontWeight: 500, marginBottom: 16 }}>
          Recent activity
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { time: '2:34 PM', event: 'Played MathQuest Adventures', duration: '42 min', pts: '+126 pts (3×)' },
            { time: '1:47 PM', event: 'Attempted to add friend "Gamer_2847"', duration: '', pts: 'Pending your approval' },
            { time: '12:15 PM', event: 'Completed Circuit Breaker puzzle pack 3', duration: '25 min', pts: '+75 pts (3×)' },
            { time: '11:02 AM', event: 'Attempted to play "Hollow Realms" (M rated)', duration: '', pts: 'Blocked — not in allowed genres' },
          ].map((event, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                gap: 12,
                padding: '10px 12px',
                background: event.pts.startsWith('Blocked') ? 'rgba(248,113,113,0.05)' : event.pts.startsWith('Pending') ? 'rgba(251,191,36,0.05)' : 'var(--glass-1)',
                border: `1px solid ${event.pts.startsWith('Blocked') ? 'rgba(248,113,113,0.15)' : event.pts.startsWith('Pending') ? 'rgba(251,191,36,0.15)' : 'var(--border-void)'}`,
                borderRadius: 10,
                alignItems: 'center',
              }}
            >
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', minWidth: 55, flexShrink: 0 }}>
                {event.time}
              </span>
              <span style={{ fontSize: 12, flex: 1 }}>{event.event}</span>
              {event.duration && (
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', flexShrink: 0 }}>
                  {event.duration}
                </span>
              )}
              <span
                className="font-mono"
                style={{
                  fontSize: 10,
                  color: event.pts.startsWith('Blocked') ? 'var(--danger)' : event.pts.startsWith('Pending') ? 'var(--warning)' : 'var(--success)',
                  flexShrink: 0,
                }}
              >
                {event.pts}
              </span>
              {event.pts.startsWith('Pending') && (
                <div style={{ display: 'flex', gap: 4, flexShrink: 0 }}>
                  <button className="btn-sovereign" style={{ padding: '3px 10px', fontSize: 10 }}>Approve</button>
                  <button className="btn-glass" style={{ padding: '3px 8px', fontSize: 10, color: 'var(--danger)' }}>Deny</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Save button */}
      <button
        className={saved ? 'btn-ghost' : 'btn-sovereign'}
        style={{
          padding: '14px',
          fontSize: 14,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        }}
        onClick={handleSave}
        disabled={saving || saved}
      >
        {saving ? <><Spinner size={18} color="#000" />Saving to chain…</> : saved ? '✓ Rules saved to SBT' : 'Save parental controls'}
      </button>

      {saved && (
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--success)', textAlign: 'center' }}>
          Rules deployed on-chain via DustPermit · Block #58,249,901 · Updates apply instantly across all devices
        </div>
      )}
    </div>
  )
}
