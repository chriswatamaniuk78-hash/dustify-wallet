'use client'
// ============================================================
// DUST GAMING v3 — THE WORLD'S MOST COMPLETE GAMING SUB-APP
// Research from: Roblox, Steam, Xbox Game Pass, Epic, Apple Arcade,
// Discord, Twitch, Clash Royale, Brawl Stars, itch.io
// Pain points solved: pay-to-win, toxic community, no real cash prizes,
// bad moderation, Kids Zone safety, creator 70% revenue share, SBT anti-cheat
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import {
  MOCK_TOURNAMENTS, MOCK_CREATORS, MOCK_ACHIEVEMENTS, MOCK_GAME_ITEMS,
  MOCK_DEV_ANALYTICS, formatRevenue, rarityColor, tierColor,
  type Tournament, type Creator,
} from '@/lib/gaming-data'
import { DustGaming }           from './DustGaming'
import { GameMarketplace, KidsZone } from './MarketplaceAndKids'
import { TournamentHub, CreatorHub, DevPortal } from './TournamentAndCreator'

type GamingTab = 'discover' | 'tournaments' | 'leaderboard' | 'creators' | 'my-library' | 'achievements' | 'kids' | 'dev-portal' | 'community'

// ─────────────────────────────────────────────────────────────
// GAME DISCOVERY FEED (Steam+Epic killer)
// Curated quality (Apple Arcade style), no paid placements,
// SBT anti-cheat verified, real USDC prize pools
// ─────────────────────────────────────────────────────────────
const FEATURED_GAMES = [
  {
    id: 'g1', name: 'Hollow Realms', genre: 'Action RPG', rating: 9.4, players: '184K', size: '2.4GB',
    desc: 'Dark fantasy open world with procedural dungeons. 200+ hour campaign, real-time multiplayer raids.',
    color: '#7F77DD', tags: ['Multiplayer', 'No pay-to-win', 'SBT verified'],
    prizePool: 5000, dustMilesPerSession: 50, isFree: false, price: 24.99,
    badge: '🏆 Tournament Active', dev: 'ShadowForge Studios',
  },
  {
    id: 'g2', name: 'Velocity Arena', genre: 'Racing', rating: 8.8, players: '92K', size: '1.1GB',
    desc: 'Futuristic anti-gravity racing. 60-player lobbies, weekly tournaments, USDC prize pools.',
    color: '#4ade80', tags: ['Competitive', 'Weekly prizes', 'Cross-platform'],
    prizePool: 2500, dustMilesPerSession: 30, isFree: true, price: 0,
    badge: '🎯 Free to Play', dev: 'NeonDrift Labs',
  },
  {
    id: 'g3', name: 'Terra Kingdoms', genre: 'Strategy', rating: 9.1, players: '67K', size: '3.2GB',
    desc: 'Build civilizations, forge alliances, conquer territory. Entirely skill-based — zero pay-to-win.',
    color: '#D4AF37', tags: ['Strategy', 'No IAP', 'Deep mechanics'],
    prizePool: 10000, dustMilesPerSession: 40, isFree: false, price: 19.99,
    badge: '⭐ Editor\'s Choice', dev: 'Epoch Interactive',
  },
  {
    id: 'g4', name: 'Circuit Breaker', genre: 'Puzzle/Hacking', rating: 8.6, players: '43K', size: '0.8GB',
    desc: 'Cyber-thriller puzzle game. Hack systems, solve cryptographic challenges, expose conspiracies.',
    color: '#00d4ff', tags: ['Solo', 'Puzzle', 'Story-rich'],
    prizePool: 1000, dustMilesPerSession: 25, isFree: false, price: 14.99,
    badge: '🧩 Indie Gem', dev: 'ByteCraft',
  },
  {
    id: 'g5', name: 'Neon Abyss II', genre: 'Roguelite', rating: 9.2, players: '228K', size: '1.6GB',
    desc: 'Rogue-lite dungeon crawler with 400+ items, procedural levels. Legendary speedrun community.',
    color: '#f472b6', tags: ['Roguelite', 'Speedrunning', 'Mod support'],
    prizePool: 7500, dustMilesPerSession: 45, isFree: false, price: 22.99,
    badge: '🔥 Community Favourite', dev: 'Abyss Games',
  },
  {
    id: 'g6', name: 'Pixel Commander', genre: 'Tower Defense', rating: 8.2, players: '31K', size: '0.4GB',
    desc: 'Retro pixel art tower defense. Pure skill, no randomness. Weekly ranked ladders.',
    color: '#f97316', tags: ['Casual', 'Skill-based', 'Weekly ranks'],
    prizePool: 500, dustMilesPerSession: 20, isFree: true, price: 0,
    badge: '🎮 Family Friendly', dev: 'Pixel Republic',
  },
]

function GameCard({ game, onSelect }: { game: typeof FEATURED_GAMES[0]; onSelect: (g: typeof FEATURED_GAMES[0]) => void }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onClick={() => onSelect(game)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '18px 18px 14px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
        background: hovered ? `${game.color}08` : 'var(--glass-1)',
        border: `1px solid ${hovered ? game.color + '40' : 'var(--border-gold-0)'}`,
        transform: hovered ? 'translateY(-2px)' : 'none',
        boxShadow: hovered ? `0 8px 30px ${game.color}20` : 'none',
        position: 'relative', overflow: 'hidden',
      }}>
      {/* Color accent top bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, background: game.color }} />

      {/* Badge */}
      <div style={{ marginBottom: 12 }}>
        <span className="font-mono" style={{
          fontSize: 9, padding: '2px 8px', borderRadius: 100,
          background: `${game.color}15`, color: game.color, border: `1px solid ${game.color}30`,
        }}>
          {game.badge}
        </span>
      </div>

      {/* Game icon placeholder */}
      <div style={{
        width: 48, height: 48, borderRadius: 12, background: `${game.color}20`,
        border: `1px solid ${game.color}30`, display: 'flex', alignItems: 'center',
        justifyContent: 'center', fontSize: 24, marginBottom: 10,
      }}>
        🎮
      </div>

      <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 2 }}>{game.name}</div>
      <div className="font-mono" style={{ fontSize: 10, color: game.color, marginBottom: 6 }}>
        {game.genre} · {game.players} playing · {game.size}
      </div>
      <div className="font-body" style={{ fontSize: 12, color: 'var(--text-tertiary)', lineHeight: 1.5, marginBottom: 10 }}>
        {game.desc}
      </div>

      {/* Tags */}
      <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap', marginBottom: 12 }}>
        {game.tags.map(tag => (
          <span key={tag} className="font-mono" style={{
            fontSize: 9, padding: '2px 8px', borderRadius: 100,
            background: 'var(--glass-2)', color: 'var(--text-tertiary)',
          }}>
            {tag}
          </span>
        ))}
      </div>

      {/* Bottom: Prize + DustMiles + Price */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border-void)' }}>
        <div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--gold)' }}>
            🏆 ${game.prizePool.toLocaleString()} prize pool
          </div>
          <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>
            +{game.dustMilesPerSession} DM / session
          </div>
        </div>
        <div className="font-display" style={{ fontSize: 18, color: game.isFree ? 'var(--success)' : 'var(--gold)' }}>
          {game.isFree ? 'FREE' : `$${game.price}`}
        </div>
      </div>
    </div>
  )
}

function GameDiscovery() {
  const [filter, setFilter] = useState<'all' | 'free' | 'top-rated' | 'new' | 'prize-pools'>('all')
  const [selectedGame, setSelectedGame] = useState<typeof FEATURED_GAMES[0] | null>(null)
  const [installing, setInstalling] = useState(false)
  const [installed, setInstalled] = useState<Set<string>>(new Set())

  const FILTERS = [
    { id: 'all' as const,        label: 'All Games' },
    { id: 'free' as const,       label: '🆓 Free' },
    { id: 'top-rated' as const,  label: '⭐ Top Rated' },
    { id: 'new' as const,        label: '🆕 New' },
    { id: 'prize-pools' as const,label: '🏆 Prize Pools' },
  ]

  const filtered = FEATURED_GAMES.filter(g => {
    if (filter === 'free')       return g.isFree
    if (filter === 'top-rated')  return g.rating >= 9.0
    if (filter === 'prize-pools')return g.prizePool >= 2000
    return true
  })

  async function install(gameId: string) {
    setInstalling(true)
    await new Promise(r => setTimeout(r, 1500))
    setInstalled(prev => new Set(prev).add(gameId))
    setInstalling(false)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Platform promise */}
      <div style={{
        padding: '14px 18px', background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-1)',
        borderRadius: 12, display: 'flex', gap: 20, flexWrap: 'wrap',
      }}>
        {[
          { icon: '🚫', text: 'Zero pay-to-win — ever' },
          { icon: '🔒', text: 'SBT anti-cheat — 1 human, 1 account' },
          { icon: '💰', text: '70% creator revenue share (vs 70% Steam takes)' },
          { icon: '🏆', text: 'Real USDC prize pools — not fake tokens' },
        ].map(p => (
          <div key={p.text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span>{p.icon}</span>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--gold-warm)' }}>{p.text}</span>
          </div>
        ))}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', gap: 6 }}>
        {FILTERS.map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)} style={{
            padding: '7px 14px', borderRadius: 100, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: filter === f.id ? 'var(--gold-glass-2)' : 'var(--glass-2)',
            color: filter === f.id ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            border: `1px solid ${filter === f.id ? 'var(--border-gold-1)' : 'transparent'}`,
          }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Game modal */}
      {selectedGame && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)',
          zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div className="glass-heavy" style={{ width: '100%', maxWidth: 520, padding: '28px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, marginBottom: 20 }}>
              <div style={{
                width: 64, height: 64, borderRadius: 16, background: `${selectedGame.color}20`,
                border: `2px solid ${selectedGame.color}40`, display: 'flex', alignItems: 'center',
                justifyContent: 'center', fontSize: 32, flexShrink: 0,
              }}>
                🎮
              </div>
              <div style={{ flex: 1 }}>
                <div className="font-display" style={{ fontSize: 22, fontWeight: 500, marginBottom: 2 }}>{selectedGame.name}</div>
                <div className="font-mono" style={{ fontSize: 10, color: selectedGame.color }}>{selectedGame.genre} · by {selectedGame.dev}</div>
              </div>
              <button onClick={() => setSelectedGame(null)}
                style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 22 }}>×</button>
            </div>

            <div className="font-body" style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 16, lineHeight: 1.7 }}>
              {selectedGame.desc}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 20 }}>
              {[
                { label: 'Rating',     value: `${selectedGame.rating}/10` },
                { label: 'Players',    value: selectedGame.players },
                { label: 'Prize Pool', value: `$${selectedGame.prizePool.toLocaleString()}` },
                { label: 'DM/Session', value: `+${selectedGame.dustMilesPerSession}` },
              ].map(s => (
                <div key={s.label} style={{ padding: '10px 12px', background: 'var(--glass-2)', borderRadius: 10 }}>
                  <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4 }}>{s.label.toUpperCase()}</div>
                  <div className="font-mono" style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 500 }}>{s.value}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={() => setSelectedGame(null)} className="btn-glass" style={{ flex: 1, padding: '12px', fontSize: 13 }}>
                Cancel
              </button>
              {installed.has(selectedGame.id) ? (
                <button className="btn-sovereign" style={{ flex: 2, padding: '12px', fontSize: 13 }}>
                  ▶ Play Now
                </button>
              ) : (
                <button onClick={() => install(selectedGame.id)} disabled={installing}
                  className="btn-sovereign" style={{ flex: 2, padding: '12px', fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                  {installing ? <Spinner size={16} /> : null}
                  {installing ? 'Installing...' : selectedGame.isFree ? '⬇ Install Free' : `⬇ Install $${selectedGame.price}`}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Game grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {filtered.map(game => (
          <GameCard key={game.id} game={game} onSelect={setSelectedGame} />
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// LIVE TOURNAMENT BRACKETS
// Real-time updates, USDC prizes, SBT-verified participants
// ─────────────────────────────────────────────────────────────
function LiveTournamentBrackets() {
  const TOURNAMENTS = [
    {
      id: 't1', game: 'Hollow Realms', status: 'LIVE' as const,
      prizePool: 5000, entry: 10, participants: 128,
      bracket: [
        { round: 'QF', matches: [
          { p1: 'ShadowBlade_9', p2: 'NeonGhost',   score1: 3, score2: 1, done: true },
          { p1: 'QuantumRacer',  p2: 'TerraLord',   score1: 2, score2: 3, done: true },
          { p1: 'AbyssDelver',   p2: 'PixelStrike',  score1: 3, score2: 0, done: true },
          { p1: 'CircuitMind',   p2: 'VoidWalker',   score1: null, score2: null, done: false },
        ]},
        { round: 'SF', matches: [
          { p1: 'ShadowBlade_9', p2: 'TerraLord',   score1: null, score2: null, done: false },
          { p1: 'AbyssDelver',   p2: 'TBD',          score1: null, score2: null, done: false },
        ]},
        { round: 'F',  matches: [
          { p1: 'TBD',           p2: 'TBD',          score1: null, score2: null, done: false },
        ]},
      ],
      prizeBreakdown: { first: 2500, second: 1250, third: 625, fourth: 312 },
    },
    {
      id: 't2', game: 'Velocity Arena', status: 'UPCOMING' as const,
      prizePool: 2500, entry: 5, participants: 64,
      bracket: [],
      prizeBreakdown: { first: 1250, second: 625, third: 312, fourth: 156 },
    },
  ]

  const [selected, setSelected] = useState(TOURNAMENTS[0])
  const [countdown, setCountdown] = useState({ h: 2, m: 34, s: 18 })

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown(prev => {
        let { h, m, s } = prev
        s -= 1
        if (s < 0) { s = 59; m -= 1 }
        if (m < 0) { m = 59; h -= 1 }
        if (h < 0) { h = 0; m = 0; s = 0 }
        return { h, m, s }
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const statusColors = { LIVE: 'var(--danger)', UPCOMING: 'var(--gold-warm)', COMPLETED: 'var(--text-tertiary)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Tournament selector */}
      <div style={{ display: 'flex', gap: 10 }}>
        {TOURNAMENTS.map(t => (
          <button key={t.id} onClick={() => setSelected(t)} style={{
            flex: 1, padding: '14px 16px', borderRadius: 12, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: selected.id === t.id ? 'var(--gold-glass-2)' : 'var(--glass-1)',
            border: `1px solid ${selected.id === t.id ? 'var(--border-gold-2)' : 'var(--border-gold-0)'}`,
            textAlign: 'left',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: statusColors[t.status] }} />
              <span className="font-mono" style={{ fontSize: 10, color: statusColors[t.status] }}>{t.status}</span>
            </div>
            <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{t.game}</div>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--gold)' }}>${t.prizePool.toLocaleString()} prize</div>
          </button>
        ))}
      </div>

      {/* Tournament details */}
      <div className="glass-heavy" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20, gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="font-display" style={{ fontSize: 24, fontWeight: 500, marginBottom: 4 }}>{selected.game} Championship</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <StatusBadge variant="gold">{selected.participants} players</StatusBadge>
              <StatusBadge variant="success">SBT-verified participants</StatusBadge>
              <StatusBadge variant="info">${selected.entry} entry</StatusBadge>
            </div>
          </div>

          {/* Countdown or prize breakdown */}
          {selected.status === 'LIVE' ? (
            <div style={{ textAlign: 'center' }}>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--danger)', letterSpacing: '0.12em', marginBottom: 6 }}>● LIVE NOW</div>
              <div style={{ display: 'flex', gap: 8 }}>
                {[
                  { val: String(countdown.h).padStart(2,'0'), label: 'H' },
                  { val: String(countdown.m).padStart(2,'0'), label: 'M' },
                  { val: String(countdown.s).padStart(2,'0'), label: 'S' },
                ].map(u => (
                  <div key={u.label} style={{ textAlign: 'center' }}>
                    <div className="font-display" style={{ fontSize: 28, color: 'var(--danger)', fontWeight: 600 }}>{u.val}</div>
                    <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{u.label}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div>
              <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 8 }}>STARTS IN 3 DAYS</div>
              <button className="btn-sovereign" style={{ padding: '10px 20px', fontSize: 13 }}>Register · ${selected.entry}</button>
            </div>
          )}
        </div>

        {/* Prize breakdown */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 20 }}>
          {[
            { place: '1st 🥇', prize: selected.prizeBreakdown.first,  color: 'var(--gold)' },
            { place: '2nd 🥈', prize: selected.prizeBreakdown.second, color: 'rgba(192,192,192,0.9)' },
            { place: '3rd 🥉', prize: selected.prizeBreakdown.third,  color: 'rgba(205,127,50,0.9)' },
            { place: '4th',    prize: selected.prizeBreakdown.fourth, color: 'var(--text-secondary)' },
          ].map(p => (
            <div key={p.place} style={{
              padding: '10px', background: 'var(--glass-2)', borderRadius: 10, textAlign: 'center',
              border: `1px solid ${p.color}25`,
            }}>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>{p.place}</div>
              <div className="font-display" style={{ fontSize: 16, color: p.color, fontWeight: 500 }}>
                ${p.prize.toLocaleString()}
                <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginLeft: 2 }}>USDC</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bracket visualization */}
        {selected.bracket.length > 0 && (
          <div>
            <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', marginBottom: 14 }}>
              TOURNAMENT BRACKET
            </div>
            <div style={{ display: 'flex', gap: 16, overflowX: 'auto' }}>
              {selected.bracket.map(round => (
                <div key={round.round} style={{ minWidth: 180, flexShrink: 0 }}>
                  <div className="font-mono" style={{ fontSize: 10, color: 'var(--gold)', letterSpacing: '0.1em', marginBottom: 10, textAlign: 'center' }}>
                    {round.round === 'QF' ? 'Quarter Finals' : round.round === 'SF' ? 'Semi Finals' : 'Final'}
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {round.matches.map((match, i) => (
                      <div key={i} style={{
                        padding: '10px 12px', borderRadius: 10,
                        background: match.done ? 'var(--glass-2)' : 'var(--glass-1)',
                        border: `1px solid ${match.done ? 'var(--border-gold-1)' : 'var(--border-void)'}`,
                      }}>
                        {[{ name: match.p1, score: match.score1, won: match.done && (match.score1 ?? 0) > (match.score2 ?? 0) },
                          { name: match.p2, score: match.score2, won: match.done && (match.score2 ?? 0) > (match.score1 ?? 0) },
                        ].map((player, pi) => (
                          <div key={pi} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '3px 0', borderBottom: pi === 0 ? '1px solid var(--border-void)' : 'none' }}>
                            <span className="font-mono" style={{ fontSize: 11, color: player.won ? 'var(--gold)' : match.done ? 'var(--text-tertiary)' : 'var(--text-primary)', fontWeight: player.won ? 600 : 400 }}>
                              {player.won ? '▶ ' : ''}{player.name}
                            </span>
                            {player.score !== null && (
                              <span className="font-mono" style={{ fontSize: 12, color: player.won ? 'var(--gold)' : 'var(--text-tertiary)', fontWeight: 600 }}>
                                {player.score}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// GLOBAL LEADERBOARD v2 (SBT-verified, anti-bot, anti-smurfs)
// Solving: Roblox alt accounts, toxic players, cheaters
// ─────────────────────────────────────────────────────────────
function GlobalLeaderboard() {
  const [game, setGame] = useState('All Games')
  const [timeframe, setTimeframe] = useState<'weekly' | 'monthly' | 'alltime'>('weekly')

  const GAMES = ['All Games', 'Hollow Realms', 'Velocity Arena', 'Terra Kingdoms', 'Neon Abyss II']

  const players = [
    { rank: 1,  name: 'ShadowBlade_9', sbt: '00041', game: 'Hollow Realms',  score: 9_847_320, rating: 'Diamond I',  verified: true,  country: '🇨🇦', winRate: 82, earnings: 2340 },
    { rank: 2,  name: 'QuantumRacer',  sbt: '00112', game: 'Velocity Arena', score: 8_204_110, rating: 'Master',     verified: true,  country: '🇺🇸', winRate: 79, earnings: 1870 },
    { rank: 3,  name: 'AbyssDelver',   sbt: '00234', game: 'Neon Abyss II',  score: 7_841_000, rating: 'Grandmaster',verified: true,  country: '🇬🇧', winRate: 91, earnings: 1420 },
    { rank: 4,  name: 'TerraLord',     sbt: '00387', game: 'Terra Kingdoms', score: 6_920_400, rating: 'Diamond II', verified: false, country: '🇩🇪', winRate: 74, earnings: 980 },
    { rank: 5,  name: 'CircuitMind',   sbt: '00521', game: 'Circuit Breaker', score: 5_847_230, rating: 'Platinum I', verified: true,  country: '🇯🇵', winRate: 78, earnings: 650 },
    { rank: 6,  name: 'PixelStrike',   sbt: '00689', game: 'Neon Abyss II',  score: 4_921_870, rating: 'Diamond I', verified: false, country: '🇨🇦', winRate: 71, earnings: 420 },
    { rank: 7,  name: 'You (#00847)',  sbt: '00847', game: 'Hollow Realms',  score: 3_847_120, rating: 'Master',     verified: true,  country: '🇨🇦', winRate: 78, earnings: 185, isUser: true },
    { rank: 8,  name: 'NeonGhost',     sbt: '00923', game: 'Velocity Arena', score: 2_923_450, rating: 'Platinum II',verified: true,  country: '🇰🇷', winRate: 65, earnings: 80 },
  ]

  const rankColors = ['var(--gold)', 'rgba(192,192,192,0.9)', 'rgba(205,127,50,0.9)']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Anti-cheat guarantee */}
      <div style={{
        padding: '14px 18px', background: 'rgba(74,222,128,0.06)',
        border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12,
      }}>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--success)', lineHeight: 1.7 }}>
          ✓ Every rank is SBT-verified — one human, one account. No bots. No alts. No smurfs.
          Anti-cheat violations permanently mark your SBT reputation across ALL games.
        </div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
        <select value={game} onChange={e => setGame(e.target.value)}
          style={{
            background: 'var(--glass-2)', border: '1px solid var(--border-gold-0)', borderRadius: 10,
            padding: '8px 14px', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12, outline: 'none',
          }}>
          {GAMES.map(g => <option key={g} value={g} style={{ background: '#0c0c0c' }}>{g}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 4, background: 'var(--glass-1)', borderRadius: 10, padding: 3 }}>
          {(['weekly','monthly','alltime'] as const).map(tf => (
            <button key={tf} onClick={() => setTimeframe(tf)} style={{
              padding: '6px 14px', borderRadius: 7, border: 'none', cursor: 'pointer',
              background: timeframe === tf ? 'var(--gold-glass-2)' : 'transparent',
              color: timeframe === tf ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11, textTransform: 'capitalize',
              border: `1px solid ${timeframe === tf ? 'var(--border-gold-1)' : 'transparent'}`,
            }}>
              {tf === 'alltime' ? 'All Time' : tf.charAt(0).toUpperCase() + tf.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Leaderboard table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        <div style={{
          display: 'grid', gridTemplateColumns: '50px 1fr 100px 90px 80px 90px',
          padding: '10px 16px', borderBottom: '1px solid var(--border-void)',
          background: 'var(--glass-1)',
        }}>
          {['#','Player','Score','Win Rate','USDC Earned',''].map(h => (
            <div key={h} className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>{h}</div>
          ))}
        </div>

        {players.map((p, i) => (
          <div key={p.rank} style={{
            display: 'grid', gridTemplateColumns: '50px 1fr 100px 90px 80px 90px',
            padding: '12px 16px',
            borderBottom: i < players.length - 1 ? '1px solid var(--border-void)' : 'none',
            background: p.isUser ? 'var(--gold-glass-1)' : 'transparent',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => !p.isUser && ((e.currentTarget as HTMLDivElement).style.background = 'var(--glass-1)')}
            onMouseLeave={e => !p.isUser && ((e.currentTarget as HTMLDivElement).style.background = 'transparent')}>

            {/* Rank */}
            <div className="font-display" style={{
              fontSize: 20, color: rankColors[p.rank - 1] ?? 'var(--text-tertiary)',
              fontWeight: 500, alignSelf: 'center',
            }}>
              {p.rank}
            </div>

            {/* Player info */}
            <div style={{ alignSelf: 'center' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 500, color: p.isUser ? 'var(--gold)' : 'var(--text-primary)' }}>
                  {p.country} {p.name}
                </span>
                {p.verified && (
                  <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="6" fill="var(--gold)" opacity="0.2" />
                    <circle cx="6.5" cy="6.5" r="6" stroke="var(--gold)" strokeWidth="1" />
                    <path d="M4 6.5l2 2L9 4" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}>
                {p.game} · {p.rating} · SBT #{p.sbt}
              </div>
            </div>

            <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)', alignSelf: 'center' }}>
              {p.score.toLocaleString()}
            </div>
            <div className="font-mono" style={{ fontSize: 13, color: p.winRate >= 80 ? 'var(--success)' : 'var(--text-secondary)', alignSelf: 'center' }}>
              {p.winRate}%
            </div>
            <div className="font-mono" style={{ fontSize: 13, color: 'var(--gold)', alignSelf: 'center', fontWeight: 500 }}>
              ${p.earnings}
            </div>
            <div style={{ alignSelf: 'center' }}>
              {!p.isUser && (
                <button style={{
                  padding: '5px 12px', borderRadius: 100, border: '1px solid var(--border-gold-1)',
                  background: 'transparent', color: 'var(--gold)', cursor: 'pointer', transition: 'all 0.15s',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10,
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-glass-2)'}
                  onMouseLeave={e => (e.currentTarget as HTMLButtonElement).style.background = 'transparent'}>
                  Challenge
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// ACHIEVEMENT SYSTEM (Steam-killer)
// SBT-backed, cross-game, beautiful display, USDC rewards
// ─────────────────────────────────────────────────────────────
function AchievementWall() {
  const categories = ['All', 'Combat', 'Explorer', 'Social', 'Speed', 'Milestone']
  const [cat, setCat] = useState('All')
  const [showLocked, setShowLocked] = useState(true)

  const achievements = [
    { id: 'a1', name: 'First Blood',      desc: 'Win your first tournament match',   cat: 'Combat',    rarity: 'Common',   pts: 50,   earned: true,  date: 'Jan 15', icon: '⚔', reward: null },
    { id: 'a2', name: 'Unstoppable',      desc: 'Win 10 matches without losing',     cat: 'Combat',    rarity: 'Rare',     pts: 200,  earned: true,  date: 'Jan 28', icon: '🔥', reward: null },
    { id: 'a3', name: 'World Traveler',   desc: 'Play in 10 different game worlds',  cat: 'Explorer',  rarity: 'Epic',     pts: 500,  earned: true,  date: 'Feb 2',  icon: '🌍', reward: 5 },
    { id: 'a4', name: 'Speed Demon',      desc: 'Top 0.1% speedrun globally',        cat: 'Speed',     rarity: 'Legendary',pts: 2000, earned: false, date: null,     icon: '⚡', reward: 25 },
    { id: 'a5', name: 'Community Legend', desc: 'Refer 100 players to Dust Gaming',  cat: 'Social',    rarity: 'Epic',     pts: 1000, earned: false, date: null,     icon: '👑', reward: 15 },
    { id: 'a6', name: 'DustMiles Mogul',  desc: 'Earn 100,000 DustMiles from gaming',cat: 'Milestone', rarity: 'Legendary',pts: 5000, earned: false, date: null,     icon: '💎', reward: 50 },
    { id: 'a7', name: 'Tournament Titan', desc: 'Win 3 tournament championships',    cat: 'Combat',    rarity: 'Legendary',pts: 3000, earned: false, date: null,     icon: '🏆', reward: 100 },
    { id: 'a8', name: 'Social Butterfly', desc: 'Play with 50 different SBT players',cat: 'Social',    rarity: 'Rare',     pts: 300,  earned: true,  date: 'Mar 1',  icon: '🦋', reward: null },
  ]

  const rarityColors: Record<string, string> = {
    Common: '#9ca3af', Rare: '#60a5fa', Epic: '#a78bfa', Legendary: '#D4AF37',
  }

  const filtered = achievements.filter(a =>
    (cat === 'All' || a.cat === cat) && (showLocked || a.earned)
  )

  const earned = achievements.filter(a => a.earned).length
  const totalPts = achievements.filter(a => a.earned).reduce((s, a) => s + a.pts, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
        {[
          { label: 'Earned',       value: `${earned}/${achievements.length}`, color: 'var(--gold)' },
          { label: 'Total Points', value: totalPts.toLocaleString(),           color: 'var(--success)' },
          { label: 'USDC Rewards', value: '$45 earned',                        color: 'var(--gold-warm)' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '14px', background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)',
            borderRadius: 12, textAlign: 'center',
          }}>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>{s.label.toUpperCase()}</div>
            <div className="font-display" style={{ fontSize: 20, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
        {categories.map(c => (
          <button key={c} onClick={() => setCat(c)} style={{
            padding: '5px 12px', borderRadius: 100, border: 'none', cursor: 'pointer',
            background: cat === c ? 'var(--gold-glass-2)' : 'var(--glass-2)',
            color: cat === c ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            border: `1px solid ${cat === c ? 'var(--border-gold-1)' : 'transparent'}`,
          }}>
            {c}
          </button>
        ))}
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, marginLeft: 'auto', cursor: 'pointer' }}>
          <input type="checkbox" checked={showLocked} onChange={e => setShowLocked(e.target.checked)}
            style={{ accentColor: 'var(--gold)' }} />
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Show locked</span>
        </label>
      </div>

      {/* Achievement grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {filtered.map(a => (
          <div key={a.id} style={{
            padding: '14px 16px', borderRadius: 12, transition: 'all 0.15s',
            background: a.earned ? `${rarityColors[a.rarity]}08` : 'var(--glass-1)',
            border: `1px solid ${a.earned ? rarityColors[a.rarity] + '30' : 'var(--border-void)'}`,
            opacity: a.earned ? 1 : 0.6, cursor: 'pointer',
          }}>
            <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                background: a.earned ? `${rarityColors[a.rarity]}15` : 'var(--glass-2)',
                border: `1px solid ${a.earned ? rarityColors[a.rarity] + '30' : 'var(--border-void)'}`,
                filter: a.earned ? 'none' : 'grayscale(1)',
              }}>
                {a.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{a.name}</span>
                  <span className="font-mono" style={{ fontSize: 8, color: rarityColors[a.rarity] }}>
                    ◆ {a.rarity.toUpperCase()}
                  </span>
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>{a.desc}</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--gold)' }}>+{a.pts.toLocaleString()} pts</span>
                  {a.reward && <span className="font-mono" style={{ fontSize: 10, color: 'var(--success)' }}>+${a.reward} USDC</span>}
                  {a.earned && a.date && <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{a.date}</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// KIDS ZONE v2 (Solving Roblox's biggest failures)
// SBT parent controls, content filtering, time limits,
// no chat with strangers, no predatory IAP, safe moderation
// ─────────────────────────────────────────────────────────────
function KidsZoneV2() {
  const [locked, setLocked] = useState(true)
  const [pin, setPin] = useState('')
  const [unlocked, setUnlocked] = useState(false)
  const [parentTab, setParentTab] = useState<'limits' | 'content' | 'social' | 'purchases'>('limits')
  const [dailyLimit, setDailyLimit] = useState(120) // minutes
  const [contentRating, setContentRating] = useState<'E' | 'E10' | 'T'>('E')
  const [chatEnabled, setChatEnabled] = useState(false)
  const [strangerChat, setStrangerChat] = useState(false)
  const [purchasesEnabled, setPurchasesEnabled] = useState(false)
  const [purchaseLimit, setPurchaseLimit] = useState(5) // $ per month

  function tryPin() {
    if (pin === '1234') { setUnlocked(true) }
    setPin('')
  }

  const SAFE_GAMES = [
    { id: 'k1', name: 'Rainbow Builder', genre: 'Creative', age: 'E',  rating: 9.2, players: '45K', icon: '🌈', desc: 'Build colorful worlds, no chat required.' },
    { id: 'k2', name: 'Space Explorers', genre: 'Education', age: 'E',  rating: 9.0, players: '38K', icon: '🚀', desc: 'Learn about the solar system through fun missions.' },
    { id: 'k3', name: 'Dino Quest',      genre: 'Puzzle',   age: 'E',  rating: 8.8, players: '29K', icon: '🦕', desc: 'Educational dinosaur puzzle adventure.' },
    { id: 'k4', name: 'Math Kingdom',    genre: 'Education', age: 'E',  rating: 8.6, players: '22K', icon: '📐', desc: 'Math learning disguised as an RPG kingdom builder.' },
    { id: 'k5', name: 'Animal Rescue',   genre: 'Sim',      age: 'E10', rating: 9.1, players: '67K', icon: '🐾', desc: 'Rescue and care for animals. Teaches empathy.' },
    { id: 'k6', name: 'Code Adventure',  genre: 'STEM',     age: 'E10', rating: 9.4, players: '18K', icon: '💻', desc: 'Learn Scratch-style coding through game challenges.' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Header */}
      <div style={{ padding: '20px', background: 'linear-gradient(135deg, rgba(74,222,128,0.08) 0%, rgba(96,165,250,0.06) 100%)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div style={{ fontSize: 40 }}>👨‍👩‍👧</div>
          <div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 500, color: '#4ade80' }}>Kids Zone</div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
              SBT-verified parental controls · No predatory IAP · Zero toxic chat
            </div>
            <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
              <StatusBadge variant="success">COPPA Compliant</StatusBadge>
              <StatusBadge variant="info">SBT Parent Controls</StatusBadge>
              <StatusBadge variant="gold">AI Moderation</StatusBadge>
            </div>
          </div>
        </div>
      </div>

      {/* Two column: Kids games + Parent controls */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 16 }} className="kids-grid">

        {/* Games side */}
        <div>
          <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', marginBottom: 12 }}>
            CURATED SAFE GAMES — {contentRating === 'E' ? 'Ages 6+' : contentRating === 'E10' ? 'Ages 10+' : 'Ages 13+'}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {SAFE_GAMES
              .filter(g => contentRating === 'T' || g.age === 'E' || (contentRating === 'E10' && g.age !== 'T'))
              .map(game => (
                <div key={game.id} style={{
                  display: 'flex', gap: 12, padding: '14px 16px', borderRadius: 12,
                  background: 'var(--glass-1)', border: '1px solid rgba(74,222,128,0.12)',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                  onMouseEnter={e => (e.currentTarget as HTMLDivElement).style.background = 'rgba(74,222,128,0.05)'}
                  onMouseLeave={e => (e.currentTarget as HTMLDivElement).style.background = 'var(--glass-1)'}>
                  <div style={{ fontSize: 28, flexShrink: 0 }}>{game.icon}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{game.name}</span>
                      <span className="font-mono" style={{ fontSize: 9, padding: '2px 7px', borderRadius: 100, background: 'rgba(74,222,128,0.12)', color: '#4ade80' }}>
                        {game.age}
                      </span>
                    </div>
                    <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                      {game.genre} · {game.players} playing · ⭐ {game.rating}
                    </div>
                    <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{game.desc}</div>
                  </div>
                  <button className="btn-glass" style={{ padding: '7px 14px', fontSize: 11, flexShrink: 0, alignSelf: 'center' }}>
                    ▶ Play
                  </button>
                </div>
              ))
            }
          </div>
        </div>

        {/* Parent controls side */}
        <div>
          {/* Lock overlay */}
          {locked && !unlocked ? (
            <div className="glass" style={{ padding: '24px', textAlign: 'center' }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>🔒</div>
              <div className="font-display" style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Parent Controls</div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 16 }}>
                Enter parent PIN (linked to your SBT)
              </div>
              <input type="password" value={pin} onChange={e => setPin(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && tryPin()}
                placeholder="● ● ● ●"
                maxLength={4}
                style={{
                  width: '100%', background: 'var(--glass-1)', border: '1px solid var(--border-gold-2)',
                  borderRadius: 10, padding: '12px', textAlign: 'center', color: 'var(--gold)',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 20, outline: 'none', letterSpacing: '0.4em',
                  marginBottom: 12,
                }} />
              <button onClick={tryPin} className="btn-sovereign" style={{ width: '100%', padding: '12px', fontSize: 13 }}>
                Unlock Parent Controls
              </button>
              <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 10 }}>
                PIN: 1234 (demo)
              </div>
            </div>
          ) : (
            <div className="glass" style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                <div className="font-display" style={{ fontSize: 16, fontWeight: 500 }}>🔓 Parent Controls</div>
                <button onClick={() => { setLocked(true); setUnlocked(false) }}
                  style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 12 }}>
                  Lock
                </button>
              </div>

              {/* Tab nav */}
              <div style={{ display: 'flex', gap: 3, background: 'var(--glass-2)', borderRadius: 8, padding: 3, marginBottom: 16 }}>
                {(['limits','content','social','purchases'] as const).map(t => (
                  <button key={t} onClick={() => setParentTab(t)} style={{
                    flex: 1, padding: '6px 4px', borderRadius: 6, border: 'none', cursor: 'pointer',
                    background: parentTab === t ? 'var(--gold-glass-2)' : 'transparent',
                    color: parentTab === t ? 'var(--gold)' : 'var(--text-tertiary)',
                    fontFamily: "'JetBrains Mono', monospace", fontSize: 9, textTransform: 'capitalize',
                    border: `1px solid ${parentTab === t ? 'var(--border-gold-1)' : 'transparent'}`,
                  }}>
                    {t}
                  </button>
                ))}
              </div>

              {parentTab === 'limits' && (
                <div>
                  <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8 }}>
                    DAILY PLAYTIME LIMIT
                  </div>
                  <div className="font-display" style={{ fontSize: 28, color: 'var(--gold)', marginBottom: 8 }}>
                    {Math.floor(dailyLimit / 60)}h {dailyLimit % 60}m
                  </div>
                  <input type="range" min={30} max={240} step={15} value={dailyLimit}
                    onChange={e => setDailyLimit(Number(e.target.value))}
                    style={{ width: '100%', accentColor: 'var(--gold)', marginBottom: 16 }} />
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>30 min</span>
                    <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>4 hours</span>
                  </div>
                  <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 14, lineHeight: 1.6 }}>
                    📊 Today's play: 47 min of {dailyLimit} min
                    <br />⏰ Automatic lock at limit — no overrides
                    <br />🔔 15-min warning before session ends
                  </div>
                </div>
              )}

              {parentTab === 'content' && (
                <div>
                  <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 10 }}>CONTENT RATING</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {[
                      { rating: 'E' as const,   label: 'E — Ages 6+',   desc: 'Everyone. Simple, safe, no violence.' },
                      { rating: 'E10' as const,  label: 'E10 — Ages 10+', desc: 'Mild violence, mild themes.' },
                      { rating: 'T' as const,    label: 'T — Ages 13+',  desc: 'Teen content. Some intense themes.' },
                    ].map(r => (
                      <div key={r.rating} onClick={() => setContentRating(r.rating)} style={{
                        padding: '10px 12px', borderRadius: 10, cursor: 'pointer',
                        background: contentRating === r.rating ? 'var(--gold-glass-2)' : 'var(--glass-1)',
                        border: `1px solid ${contentRating === r.rating ? 'var(--border-gold-2)' : 'var(--border-void)'}`,
                      }}>
                        <div className="font-mono" style={{ fontSize: 11, color: contentRating === r.rating ? 'var(--gold)' : 'var(--text-primary)', marginBottom: 2 }}>
                          {r.label}
                        </div>
                        <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{r.desc}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {parentTab === 'social' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { label: 'Enable any chat',         value: chatEnabled,     setter: setChatEnabled,     warn: 'Off = no text chat at all' },
                    { label: 'Chat with strangers',     value: strangerChat,    setter: setStrangerChat,    warn: 'On = can chat with non-friends' },
                  ].map(s => (
                    <div key={s.label} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--glass-1)', borderRadius: 10 }}>
                      <div style={{ flex: 1 }}>
                        <div className="font-mono" style={{ fontSize: 11, marginBottom: 2 }}>{s.label}</div>
                        <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{s.warn}</div>
                      </div>
                      <div onClick={() => s.setter(!s.value)} style={{
                        width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
                        background: s.value ? 'var(--success)' : 'var(--glass-3)',
                        border: `1px solid ${s.value ? 'rgba(74,222,128,0.4)' : 'var(--border-void)'}`,
                        position: 'relative', transition: 'all 0.2s',
                      }}>
                        <div style={{
                          width: 16, height: 16, borderRadius: '50%', background: 'white',
                          position: 'absolute', top: 2, transition: 'left 0.2s',
                          left: s.value ? 20 : 2,
                        }} />
                      </div>
                    </div>
                  ))}
                  <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
                    ✓ All communications are AI-moderated in real-time
                    <br />✓ Predator patterns trigger instant block + parent alert
                    <br />✓ Friend requests require parent SBT approval
                  </div>
                </div>
              )}

              {parentTab === 'purchases' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px', background: 'var(--glass-1)', borderRadius: 10, marginBottom: 14 }}>
                    <div style={{ flex: 1 }}>
                      <div className="font-mono" style={{ fontSize: 11, marginBottom: 2 }}>Allow any purchases</div>
                      <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Requires parent SBT to approve each purchase</div>
                    </div>
                    <div onClick={() => setPurchasesEnabled(!purchasesEnabled)} style={{
                      width: 40, height: 22, borderRadius: 11, cursor: 'pointer',
                      background: purchasesEnabled ? 'var(--success)' : 'var(--glass-3)',
                      position: 'relative', transition: 'all 0.2s',
                    }}>
                      <div style={{
                        width: 16, height: 16, borderRadius: '50%', background: 'white',
                        position: 'absolute', top: 2, transition: 'left 0.2s',
                        left: purchasesEnabled ? 20 : 2,
                      }} />
                    </div>
                  </div>

                  {purchasesEnabled && (
                    <div>
                      <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>MONTHLY LIMIT</div>
                      <div className="font-display" style={{ fontSize: 24, color: 'var(--gold)', marginBottom: 6 }}>${purchaseLimit}/mo</div>
                      <input type="range" min={0} max={50} step={5} value={purchaseLimit}
                        onChange={e => setPurchaseLimit(Number(e.target.value))}
                        style={{ width: '100%', accentColor: 'var(--gold)' }} />
                    </div>
                  )}

                  <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 14, lineHeight: 1.6 }}>
                    ⚠️ Zero pay-to-win on Dust Gaming
                    <br />✓ Cosmetics only — no gameplay advantages
                    <br />✓ Every purchase needs parent SBT approval
                    <br />✓ Monthly spend summary sent to parent
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <style>{`@media(max-width:800px){.kids-grid{grid-template-columns:1fr!important}}`}</style>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// COMMUNITY HUB (Discord-killer — built-in)
// No external Discord required, SBT-verified discussions
// ─────────────────────────────────────────────────────────────
function CommunityHub() {
  const posts = [
    { id: 'p1', author: 'ShadowBlade_9', sbt: '00041', game: 'Hollow Realms',  time: '2m',  likes: 48, replies: 12, text: 'Finally cracked the 3-star Abyss run. Pro tip: save your heals for phase 3. AMA.', verified: true },
    { id: 'p2', author: 'TerraLord',     sbt: '00387', game: 'Terra Kingdoms', time: '8m',  likes: 31, replies: 7,  text: 'New desert expansion is incredible. Alliance wars start tomorrow at 20:00 UTC. Get your troops ready.', verified: false },
    { id: 'p3', author: 'AbyssDelver',   sbt: '00234', game: 'Neon Abyss II',  time: '15m', likes: 89, replies: 24, text: 'New world record: 47:23 on full run. Here\'s my annotated speedrun breakdown with timestamps.', verified: true },
    { id: 'p4', author: 'VoidWalker',    sbt: '00612', game: 'Circuit Breaker', time: '1h', likes: 19, replies: 5,  text: 'Level 42 solution: you need to exploit the buffer overflow before switching nodes. No spoilers — just a nudge.', verified: true },
  ]

  const [liked, setLiked] = useState<Set<string>>(new Set())

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10 }}>
        {[
          { label: 'Active Members', value: '184K', icon: '👥' },
          { label: 'Posts Today',    value: '4,821', icon: '💬' },
          { label: 'Zero toxicity',  value: 'SBT-enforced', icon: '🔒' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '14px', background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)',
            borderRadius: 12, textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, marginBottom: 4 }}>{s.icon}</div>
            <div className="font-display" style={{ fontSize: 18, color: 'var(--gold)' }}>{s.value}</div>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 14px', background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-1)', borderRadius: 10 }}>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--gold-warm)' }}>
          ✦ SBT reputation system: Toxic behaviour permanently marks your on-chain profile.
          Verified players get priority in matchmaking, tournaments, and creator programs.
        </div>
      </div>

      {/* Post composer */}
      <div className="glass" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold-glass-2)', border: '1px solid var(--border-gold-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0 }}>
            ◆
          </div>
          <input placeholder="Share your gaming moment, strategy, or achievement..."
            style={{
              flex: 1, background: 'transparent', border: 'none', outline: 'none',
              color: 'var(--text-primary)', fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 14,
            }} />
          <button className="btn-sovereign" style={{ padding: '8px 16px', fontSize: 12 }}>Post</button>
        </div>
      </div>

      {/* Posts */}
      {posts.map(p => (
        <div key={p.id} className="glass" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
            <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--gold-glass-2)', border: '1px solid var(--border-gold-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, color: 'var(--gold)', flexShrink: 0 }}>
              {p.author.slice(0, 2).toUpperCase()}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500 }}>{p.author}</span>
                {p.verified && (
                  <svg width={12} height={12} viewBox="0 0 12 12" fill="none">
                    <circle cx="6" cy="6" r="5.5" fill="var(--gold)" opacity="0.2" />
                    <circle cx="6" cy="6" r="5.5" stroke="var(--gold)" strokeWidth="1" />
                    <path d="M3.5 6l2 2L8 3" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
                <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>SBT #{p.sbt}</span>
              </div>
              <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{p.game} · {p.time} ago</div>
            </div>
          </div>
          <div className="font-body" style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 12 }}>
            {p.text}
          </div>
          <div style={{ display: 'flex', gap: 16 }}>
            {[
              { icon: liked.has(p.id) ? '♥' : '♡', count: p.likes + (liked.has(p.id) ? 1 : 0), action: () => setLiked(prev => { const n = new Set(prev); n.has(p.id) ? n.delete(p.id) : n.add(p.id); return n }), active: liked.has(p.id) },
              { icon: '💬', count: p.replies, action: () => {}, active: false },
              { icon: '↗', count: null, action: () => {}, active: false },
            ].map((btn, i) => (
              <button key={i} onClick={btn.action} style={{
                display: 'flex', alignItems: 'center', gap: 5, background: 'none', border: 'none',
                cursor: 'pointer', color: btn.active ? 'var(--danger)' : 'var(--text-tertiary)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 12, padding: '4px 8px', borderRadius: 6,
                transition: 'color 0.15s',
              }}>
                {btn.icon} {btn.count}
              </button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────
// MAIN DUST GAMING V3
// ─────────────────────────────────────────────────────────────
export default function DustGamingV3() {
  const [tab, setTab] = useState<GamingTab>('discover')

  const TABS: { id: GamingTab; label: string; icon: string; badge?: string }[] = [
    { id: 'discover',     label: 'Discover',    icon: '◎' },
    { id: 'tournaments',  label: 'Tournaments', icon: '🏆', badge: '2 LIVE' },
    { id: 'leaderboard',  label: 'Leaderboard', icon: '▲' },
    { id: 'achievements', label: 'Achievements',icon: '⭐' },
    { id: 'my-library',   label: 'My Library',  icon: '◇' },
    { id: 'creators',     label: 'Creators',    icon: '◉' },
    { id: 'kids',         label: 'Kids Zone',   icon: '👨‍👩‍👧', badge: 'SBT' },
    { id: 'community',    label: 'Community',   icon: '💬' },
    { id: 'dev-portal',   label: 'Dev Portal',  icon: '◈' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold-warm)', marginBottom: 4 }}>
          DUST GAMING
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
          <h1 className="font-display" style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em' }}>
            Play. Win. <span style={{ color: 'var(--gold)', fontStyle: 'italic' }}>Earn real USDC.</span>
          </h1>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', paddingBottom: 4 }}>
            <StatusBadge variant="danger" pulse>● 2 Live Tournaments</StatusBadge>
            <StatusBadge variant="gold">Zero pay-to-win</StatusBadge>
            <StatusBadge variant="success">SBT anti-cheat</StatusBadge>
          </div>
        </div>
      </div>

      {/* Live stats ticker */}
      <div style={{ display: 'flex', gap: 0, background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)', borderRadius: 10, overflow: 'hidden' }}>
        {[
          { label: 'Players online', value: '184,291', color: 'var(--success)' },
          { label: 'Active tournaments', value: '7', color: 'var(--danger)' },
          { label: 'Prize pools today', value: '$42,500', color: 'var(--gold)' },
          { label: 'DustMiles earned today', value: '2.4M', color: 'var(--gold-warm)' },
        ].map((s, i) => (
          <div key={s.label} style={{
            flex: 1, padding: '10px 16px', textAlign: 'center',
            borderRight: i < 3 ? '1px solid var(--border-void)' : 'none',
          }}>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 3 }}>{s.label.toUpperCase()}</div>
            <div className="font-mono" style={{ fontSize: 14, fontWeight: 600, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{
        display: 'flex', gap: 3, overflowX: 'auto', padding: 4,
        background: 'var(--glass-1)', borderRadius: 12, border: '1px solid var(--border-gold-0)',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            background: tab === t.id ? 'var(--gold-glass-2)' : 'transparent',
            color: tab === t.id ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            border: `1px solid ${tab === t.id ? 'var(--border-gold-1)' : 'transparent'}`,
            whiteSpace: 'nowrap', flexShrink: 0, position: 'relative',
          }}>
            {t.icon} {t.label}
            {t.badge && (
              <span style={{
                position: 'absolute', top: 2, right: 2, fontSize: 7, padding: '1px 4px', borderRadius: 100,
                background: t.badge.includes('LIVE') ? 'var(--danger)' : 'var(--gold)',
                color: 'white', fontWeight: 700,
              }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'discover'    && <GameDiscovery />}
      {tab === 'tournaments' && <LiveTournamentBrackets />}
      {tab === 'leaderboard' && <GlobalLeaderboard />}
      {tab === 'achievements'&& <AchievementWall />}
      {tab === 'my-library'  && <GameMarketplace />}
      {tab === 'creators'    && <CreatorHub />}
      {tab === 'kids'        && <KidsZoneV2 />}
      {tab === 'community'   && <CommunityHub />}
      {tab === 'dev-portal'  && <DevPortal />}
    </div>
  )
}
