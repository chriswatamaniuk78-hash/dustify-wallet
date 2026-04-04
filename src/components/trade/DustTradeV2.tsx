'use client'
// ============================================================
// DUST TRADE v2 — The Ultimate Trading Sub-App
// Best from: tastytrade (journal, P&L viz, options probability),
// Webull (300+ indicators, paper trading, social), eToro (copy trading),
// Robinhood (dead-simple UX), Interactive Brokers (global access)
// + Everything they ALL lack: Free bot, DustMiles per trade, SBT identity
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import {
  MOCK_BOT_CONFIG, MOCK_RECENT_TRADES, MOCK_PORTFOLIO_STATS,
  MOCK_POSITIONS, MOCK_MARKET_OVERVIEW,
  formatPrice, formatPnL, formatPct, pnlColor,
  type BotStatus, type Trade,
} from '@/lib/trade-data'
import { PortfolioDashboard }  from './PortfolioDashboard'
import { BotDashboard }        from './BotDashboard'
import { OptionsPanel, TaxLossHarvesting } from './OptionsAndTax'
import BotSetupWizard from './BotSetupWizard'

type TradeTab = 'portfolio' | 'bot' | 'leaderboard' | 'journal' | 'options' | 'tax'

// ── Live price chart (SVG — no TradingView dependency) ─────────
function LivePriceChart({ symbol, color = '#D4AF37' }: { symbol: string; color?: string }) {
  const [data, setData] = useState<number[]>(() =>
    Array.from({ length: 60 }, (_, i) => 67000 + i * 80 + (Math.random() - 0.45) * 800)
  )
  const [hovered, setHovered] = useState<{ x: number; y: number; price: number } | null>(null)
  const [range, setRange] = useState<'5m' | '1H' | '1D' | '1W'>('1H')
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const interval = setInterval(() => {
      setData(prev => {
        const last = prev[prev.length - 1]
        const next = last + (Math.random() - 0.47) * 150
        return [...prev.slice(1), next]
      })
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  const min = Math.min(...data), max = Math.max(...data), range2 = max - min || 1
  const W = 600, H = 160
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * W
    const y = H - ((v - min) / range2) * (H - 10) - 5
    return { x, y, v }
  })

  const pathD = `M ${pts.map(p => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' L ')}`
  const fillD = `${pathD} L ${W},${H} L 0,${H} Z`
  const last = data[data.length - 1]
  const first = data[0]
  const isUp = last >= first
  const chartColor = isUp ? '#4ade80' : '#f87171'
  const changePct = ((last - first) / first * 100).toFixed(2)

  function handleMouseMove(e: React.MouseEvent<SVGSVGElement>) {
    const rect = svgRef.current?.getBoundingClientRect()
    if (!rect) return
    const x = ((e.clientX - rect.left) / rect.width) * W
    const i = Math.min(data.length - 1, Math.round((x / W) * (data.length - 1)))
    setHovered({ x: pts[i].x, y: pts[i].y, price: data[i] })
  }

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Chart header */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 12, marginBottom: 12 }}>
        <div className="font-display" style={{ fontSize: 32, fontWeight: 600, color: 'var(--gold)', letterSpacing: '-0.02em' }}>
          ${last.toLocaleString('en-US', { maximumFractionDigits: 0 })}
        </div>
        <div className="font-mono" style={{
          fontSize: 12, padding: '3px 10px', borderRadius: 100, marginBottom: 4,
          background: isUp ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
          color: isUp ? '#4ade80' : '#f87171',
          border: `1px solid ${isUp ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
        }}>
          {isUp ? '+' : ''}{changePct}%
        </div>

        {/* Range selector */}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 2, background: 'var(--glass-2)', borderRadius: 8, padding: 3 }}>
          {(['5m','1H','1D','1W'] as const).map(r => (
            <button key={r} onClick={() => setRange(r)} style={{
              padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: range === r ? 'var(--gold-glass-2)' : 'transparent',
              color: range === r ? 'var(--gold)' : 'var(--text-tertiary)',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            }}>
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* SVG chart */}
      <div style={{ position: 'relative', borderRadius: 12, overflow: 'hidden' }}>
        <svg ref={svgRef} width="100%" height={H} viewBox={`0 0 ${W} ${H}`}
          style={{ display: 'block', cursor: 'crosshair' }}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setHovered(null)}>
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={chartColor} stopOpacity="0.2" />
              <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={fillD} fill="url(#chartGrad)" />
          <path d={pathD} fill="none" stroke={chartColor} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />

          {/* Grid lines */}
          {[0.25, 0.5, 0.75].map(pct => (
            <line key={pct} x1={0} y1={pct * H} x2={W} y2={pct * H}
              stroke="rgba(255,255,255,0.04)" strokeDasharray="4 6" />
          ))}

          {/* Hover line + dot */}
          {hovered && (
            <>
              <line x1={hovered.x} y1={0} x2={hovered.x} y2={H}
                stroke="rgba(212,175,55,0.4)" strokeDasharray="3 4" />
              <circle cx={hovered.x} cy={hovered.y} r={5} fill={chartColor} />
              {/* Tooltip */}
              <foreignObject x={Math.min(hovered.x + 8, W - 120)} y={hovered.y - 36} width={110} height={30}>
                <div style={{
                  background: 'rgba(10,10,10,0.9)', border: '1px solid rgba(212,175,55,0.3)',
                  borderRadius: 6, padding: '4px 8px',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'var(--text-primary)',
                  whiteSpace: 'nowrap',
                }}>
                  ${hovered.price.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                </div>
              </foreignObject>
            </>
          )}

          {/* Live dot */}
          <circle cx={pts[pts.length - 1].x} cy={pts[pts.length - 1].y} r={4} fill={chartColor}>
            <animate attributeName="r" values="4;7;4" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
    </div>
  )
}

// ── Bot social leaderboard ─────────────────────────────────────
function BotLeaderboard() {
  const leaders = [
    { rank: 1, name: 'AlphaBot Pro',   sbt: '00041', strategy: 'Momentum',      roi30d: 28.4, winRate: 82, trades: 1847, copiers: 3240, verified: true },
    { rank: 2, name: 'QuantumTrader',  sbt: '00112', strategy: 'Mean Reversion', roi30d: 22.1, winRate: 74, trades: 924,  copiers: 1820, verified: true },
    { rank: 3, name: 'StealthArb',     sbt: '00234', strategy: 'Arbitrage',      roi30d: 18.7, winRate: 91, trades: 4821, copiers: 1240, verified: true },
    { rank: 4, name: 'TrendRider',     sbt: '00387', strategy: 'Breakout',       roi30d: 15.2, winRate: 68, trades: 412,  copiers: 840,  verified: false },
    { rank: 5, name: 'SteadyEdge',     sbt: '00521', strategy: 'DCA',            roi30d: 12.8, winRate: 78, trades: 289,  copiers: 620,  verified: true },
    { rank: 6, name: 'VixHunter',      sbt: '00689', strategy: 'Options',        roi30d: 11.4, winRate: 72, trades: 183,  copiers: 410,  verified: false },
    { rank: 7, name: 'My Bot (You)',    sbt: '00847', strategy: 'Momentum',       roi30d: 8.2,  winRate: 78, trades: 347,  copiers: null, verified: true, isUser: true },
  ]

  const rankColors = ['var(--gold)', 'rgba(192,192,192,0.9)', 'rgba(205,127,50,0.9)']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Explanation */}
      <div style={{ padding: '14px 16px', background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-1)', borderRadius: 12 }}>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', lineHeight: 1.7 }}>
          ✦ Every strategy is run by a real human with an SBT. ROI is verified and on-chain audited.
          Copiers use the exact same strategy — zero information asymmetry. Your bot runs FREE.
        </div>
      </div>

      {/* Table */}
      <div className="glass" style={{ overflow: 'hidden' }}>
        {/* Header */}
        <div style={{
          display: 'grid', gridTemplateColumns: '40px 1fr 100px 80px 80px 80px 90px',
          padding: '10px 16px', borderBottom: '1px solid var(--border-void)',
        }}>
          {['#','Trader / Strategy','30D ROI','Win Rate','Trades','Copiers',''].map(h => (
            <div key={h} className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.1em' }}>{h}</div>
          ))}
        </div>

        {leaders.map((l, i) => (
          <div key={l.rank} style={{
            display: 'grid', gridTemplateColumns: '40px 1fr 100px 80px 80px 80px 90px',
            padding: '13px 16px', borderBottom: i < leaders.length - 1 ? '1px solid var(--border-void)' : 'none',
            background: l.isUser ? 'var(--gold-glass-1)' : i < 3 ? 'rgba(255,255,255,0.01)' : 'transparent',
            transition: 'background 0.15s',
          }}
            onMouseEnter={e => !l.isUser && ((e.currentTarget as HTMLDivElement).style.background = 'var(--glass-1)')}
            onMouseLeave={e => !l.isUser && ((e.currentTarget as HTMLDivElement).style.background = i < 3 ? 'rgba(255,255,255,0.01)' : 'transparent')}>

            {/* Rank */}
            <div className="font-display" style={{ fontSize: 18, color: rankColors[l.rank - 1] ?? 'var(--text-tertiary)', fontWeight: 500 }}>
              {l.rank}
            </div>

            {/* Name + Strategy */}
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 13, fontWeight: 500, color: l.isUser ? 'var(--gold)' : 'var(--text-primary)' }}>{l.name}</span>
                {l.verified && (
                  <svg width={13} height={13} viewBox="0 0 13 13" fill="none">
                    <circle cx="6.5" cy="6.5" r="6" fill="var(--gold)" opacity="0.2" />
                    <circle cx="6.5" cy="6.5" r="6" stroke="var(--gold)" strokeWidth="1" />
                    <path d="M4 6.5l2 2L9 4" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {l.strategy} · SBT #{l.sbt}
              </div>
            </div>

            {/* ROI */}
            <div className="font-mono" style={{ fontSize: 14, color: 'var(--success)', fontWeight: 500, alignSelf: 'center' }}>
              +{l.roi30d.toFixed(1)}%
            </div>

            {/* Win rate */}
            <div className="font-mono" style={{ fontSize: 13, color: 'var(--text-primary)', alignSelf: 'center' }}>
              {l.winRate}%
            </div>

            {/* Trades */}
            <div className="font-mono" style={{ fontSize: 13, color: 'var(--text-secondary)', alignSelf: 'center' }}>
              {l.trades.toLocaleString()}
            </div>

            {/* Copiers */}
            <div className="font-mono" style={{ fontSize: 13, color: 'var(--text-secondary)', alignSelf: 'center' }}>
              {l.copiers ? l.copiers.toLocaleString() : '—'}
            </div>

            {/* CTA */}
            <div style={{ alignSelf: 'center' }}>
              {!l.isUser && (
                <button style={{
                  padding: '5px 12px', borderRadius: 100, border: '1px solid var(--border-gold-1)',
                  background: 'transparent', color: 'var(--gold)', cursor: 'pointer',
                  fontFamily: "'JetBrains Mono', monospace", fontSize: 10, transition: 'all 0.15s',
                }}
                  onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--gold-glass-2)' }}
                  onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent' }}>
                  Copy bot
                </button>
              )}
              {l.isUser && (
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--gold-dim)' }}>← You</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center' }}>
        Strategies verified on-chain via STARK proofs · All bots run FREE · +15 DustMiles per trade
      </div>
    </div>
  )
}

// ── Trading journal ─────────────────────────────────────────────
function TradingJournal() {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'wins' | 'losses'>('all')

  const journal = [
    { id: 'j1', date: 'Apr 3', sym: 'BTC',  side: 'BUY',  entry: 67200, exit: 67842, qty: 0.12, pnl: 77.04,  notes: 'Momentum signal, RSI recovery from oversold. Clean setup.',  tags: ['momentum','crypto'], dur: '2h 14m' },
    { id: 'j2', date: 'Apr 3', sym: 'NVDA', side: 'SELL', entry: 880,   exit: 875.4,  qty: 5,    pnl: 23.00,  notes: 'Tech rotation into defensive. Pre-earnings hedge.',           tags: ['earnings','tech'],   dur: '4h 30m' },
    { id: 'j3', date: 'Apr 2', sym: 'ETH',  side: 'BUY',  entry: 3450,  exit: 3380,   qty: 0.8,  pnl: -56.00, notes: 'False breakout. Lesson: wait for volume confirmation.',       tags: ['lesson','crypto'],   dur: '1h 05m' },
    { id: 'j4', date: 'Apr 2', sym: 'AAPL', side: 'BUY',  entry: 185.2, exit: 187.42, qty: 10,   pnl: 22.20,  notes: 'Cup and handle on 4H. Textbook entry.',                       tags: ['pattern','stocks'],  dur: '6h 22m' },
    { id: 'j5', date: 'Apr 1', sym: 'SPY',  side: 'BUY',  entry: 520,   exit: 522.8,  qty: 5,    pnl: 14.00,  notes: 'Index strength day. Simple trend follow.',                    tags: ['etf','index'],       dur: '3h 45m' },
  ]

  const filtered = journal.filter(t =>
    selectedFilter === 'all' || (selectedFilter === 'wins' && t.pnl > 0) || (selectedFilter === 'losses' && t.pnl < 0)
  )

  const totalPnL = journal.reduce((s, t) => s + t.pnl, 0)
  const wins = journal.filter(t => t.pnl > 0).length
  const winRate = Math.round((wins / journal.length) * 100)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'P&L This Week',  value: `${totalPnL >= 0 ? '+' : ''}$${Math.abs(totalPnL).toFixed(2)}`, color: totalPnL >= 0 ? 'var(--success)' : 'var(--danger)' },
          { label: 'Win Rate',       value: `${winRate}%`,    color: winRate >= 60 ? 'var(--success)' : 'var(--warning)' },
          { label: 'Total Trades',   value: journal.length.toString(),  color: 'var(--text-primary)' },
          { label: 'Avg Trade',      value: `$${(totalPnL / journal.length).toFixed(2)}`, color: 'var(--gold)' },
        ].map(s => (
          <div key={s.label} style={{
            padding: '14px', background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)',
            borderRadius: 12, textAlign: 'center',
          }}>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 6, letterSpacing: '0.1em' }}>
              {s.label.toUpperCase()}
            </div>
            <div className="font-display" style={{ fontSize: 22, fontWeight: 500, color: s.color }}>{s.value}</div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: 'flex', gap: 8 }}>
        {(['all','wins','losses'] as const).map(f => (
          <button key={f} onClick={() => setSelectedFilter(f)} style={{
            padding: '6px 16px', borderRadius: 100, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: selectedFilter === f ? 'var(--gold-glass-2)' : 'var(--glass-2)',
            color: selectedFilter === f ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            border: `1px solid ${selectedFilter === f ? 'var(--border-gold-1)' : 'transparent'}`,
          }}>
            {f === 'all' ? 'All trades' : f === 'wins' ? '✓ Wins' : '✗ Losses'}
          </button>
        ))}
        <button className="btn-glass" style={{ marginLeft: 'auto', padding: '6px 14px', fontSize: 11 }}>
          + Add trade
        </button>
      </div>

      {/* Journal entries */}
      {filtered.map(t => (
        <div key={t.id} className="glass" style={{ padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
            {/* Side indicator */}
            <div style={{
              width: 40, height: 40, borderRadius: 10, flexShrink: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: t.side === 'BUY' ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
              border: `1px solid ${t.side === 'BUY' ? 'rgba(74,222,128,0.25)' : 'rgba(248,113,113,0.25)'}`,
            }}>
              <span className="font-mono" style={{ fontSize: 10, color: t.side === 'BUY' ? 'var(--success)' : 'var(--danger)', fontWeight: 600 }}>
                {t.side}
              </span>
            </div>

            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{t.sym}</span>
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{t.date}</span>
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>⏱ {t.dur}</span>
                {t.tags.map(tag => (
                  <span key={tag} className="font-mono" style={{
                    fontSize: 9, padding: '2px 8px', borderRadius: 100,
                    background: 'var(--glass-2)', color: 'var(--text-tertiary)',
                  }}>
                    {tag}
                  </span>
                ))}
              </div>

              {/* Entry / Exit */}
              <div style={{ display: 'flex', gap: 20, marginBottom: 8 }}>
                {[
                  { label: 'Entry', value: `$${t.entry.toLocaleString()}` },
                  { label: 'Exit',  value: `$${t.exit.toLocaleString()}` },
                  { label: 'Qty',   value: t.qty.toString() },
                ].map(s => (
                  <div key={s.label}>
                    <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 2 }}>{s.label.toUpperCase()}</div>
                    <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{s.value}</div>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic', lineHeight: 1.5 }}>
                "{t.notes}"
              </div>
            </div>

            {/* P&L */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="font-display" style={{
                fontSize: 22, fontWeight: 500,
                color: t.pnl >= 0 ? 'var(--success)' : 'var(--danger)',
              }}>
                {t.pnl >= 0 ? '+' : ''}${Math.abs(t.pnl).toFixed(2)}
              </div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                {((t.pnl / (t.entry * t.qty)) * 100).toFixed(2)}%
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Price alert manager ─────────────────────────────────────────
function PriceAlerts() {
  const [alerts, setAlerts] = useState([
    { id: 'a1', sym: 'BTC',  type: 'BELOW', price: 65000, triggered: false, created: '2d ago' },
    { id: 'a2', sym: 'NVDA', type: 'ABOVE', price: 900,   triggered: false, created: '1d ago' },
    { id: 'a3', sym: 'ETH',  type: 'BELOW', price: 3000,  triggered: true,  created: '3d ago' },
  ])

  return (
    <div className="glass" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)' }}>
          PRICE ALERTS
        </div>
        <button className="btn-glass" style={{ padding: '6px 14px', fontSize: 11 }}>+ New alert</button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {alerts.map(a => (
          <div key={a.id} style={{
            display: 'flex', alignItems: 'center', gap: 12, padding: '10px 12px',
            borderRadius: 10, background: a.triggered ? 'rgba(74,222,128,0.05)' : 'var(--glass-1)',
            border: `1px solid ${a.triggered ? 'rgba(74,222,128,0.2)' : 'var(--border-void)'}`,
          }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: a.triggered ? 'var(--success)' : 'var(--warning)',
              boxShadow: a.triggered ? '0 0 8px var(--success)' : 'none',
            }} />
            <div style={{ flex: 1 }}>
              <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-primary)' }}>
                {a.sym} {a.type.toLowerCase()} ${a.price.toLocaleString()}
              </div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                Set {a.created} · {a.triggered ? '✓ Triggered' : 'Watching'}
              </div>
            </div>
            <button onClick={() => setAlerts(prev => prev.filter(x => x.id !== a.id))}
              style={{
                background: 'none', border: 'none', color: 'var(--text-tertiary)',
                cursor: 'pointer', fontSize: 16, padding: '2px 6px',
              }}>×</button>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main Dust Trade v2 ─────────────────────────────────────────
export default function DustTradeV2() {
  const [tab, setTab]         = useState<TradeTab>('portfolio')
  const [showSetup, setShowSetup] = useState(false)
  const [symbol, setSymbol]   = useState('BTC')

  const TABS = [
    { id: 'portfolio'  as TradeTab, label: '◎ Portfolio',    badge: null },
    { id: 'bot'        as TradeTab, label: '◆ Bot',          badge: 'FREE' },
    { id: 'leaderboard'as TradeTab, label: '▲ Leaderboard',  badge: null },
    { id: 'journal'   as TradeTab, label: '◉ Journal',      badge: null },
    { id: 'options'   as TradeTab, label: '◇ Options',      badge: null },
    { id: 'tax'       as TradeTab, label: '⬡ Tax',          badge: null },
  ]

  const WATCHLIST = [
    { sym: 'BTC',    price: '$67,842', chg: '+3.24%', up: true },
    { sym: 'ETH',    price: '$3,421',  chg: '+2.18%', up: true },
    { sym: 'NVDA',   price: '$875',    chg: '-1.24%', up: false },
    { sym: 'AAPL',   price: '$187',    chg: '+0.82%', up: true },
    { sym: 'EUR/USD',price: '1.0842',  chg: '-0.18%', up: false },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header + Watchlist */}
      <div>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold-warm)', marginBottom: 4 }}>
          Dust Trade
        </div>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 16 }}>
          <h1 className="font-display" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em' }}>
            Trading Hub
          </h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingBottom: 4 }}>
            <StatusBadge variant="success" pulse>Bot active</StatusBadge>
            <StatusBadge variant="gold">+15 DM/trade</StatusBadge>
            <StatusBadge variant="info">Paper mode</StatusBadge>
          </div>
        </div>

        {/* Watchlist strip */}
        <div style={{
          display: 'flex', gap: 0, marginTop: 16,
          background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)', borderRadius: 10, overflow: 'hidden',
        }}>
          {WATCHLIST.map((w, i) => (
            <button key={w.sym} onClick={() => setSymbol(w.sym)} style={{
              flex: 1, padding: '10px 14px', textAlign: 'center', cursor: 'pointer', border: 'none',
              borderRight: i < WATCHLIST.length - 1 ? '1px solid var(--border-void)' : 'none',
              background: symbol === w.sym ? 'var(--gold-glass-1)' : 'transparent',
              transition: 'background 0.15s',
            }}>
              <div className="font-mono" style={{ fontSize: 10, color: symbol === w.sym ? 'var(--gold)' : 'var(--text-tertiary)', marginBottom: 3 }}>
                {w.sym}
              </div>
              <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-primary)', marginBottom: 2 }}>{w.price}</div>
              <div className="font-mono" style={{ fontSize: 10, color: w.up ? 'var(--success)' : 'var(--danger)' }}>{w.chg}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Live chart */}
      <div className="glass-heavy" style={{ padding: '24px' }}>
        <LivePriceChart symbol={symbol} />
        <PriceAlerts />
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, overflowX: 'auto', padding: 4,
        background: 'var(--glass-1)', borderRadius: 12, border: '1px solid var(--border-gold-0)',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            background: tab === t.id ? 'var(--gold-glass-2)' : 'transparent',
            color: tab === t.id ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
            border: `1px solid ${tab === t.id ? 'var(--border-gold-1)' : 'transparent'}`,
            whiteSpace: 'nowrap', position: 'relative',
          }}>
            {t.label}
            {t.badge && (
              <span style={{
                marginLeft: 6, fontSize: 8, padding: '1px 5px', borderRadius: 100,
                background: t.badge === 'FREE' ? 'rgba(74,222,128,0.15)' : 'var(--gold-glass-2)',
                color: t.badge === 'FREE' ? 'var(--success)' : 'var(--gold)',
                fontWeight: 600, letterSpacing: '0.05em',
              }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'portfolio'   && <PortfolioDashboard />}
      {tab === 'bot'         && (
        showSetup
          ? <BotSetupWizard onComplete={() => setShowSetup(false)} />
          : <BotDashboard onSetupNew={() => setShowSetup(true)} />
      )}
      {tab === 'leaderboard' && <BotLeaderboard />}
      {tab === 'journal'     && <TradingJournal />}
      {tab === 'options'     && <OptionsPanel />}
      {tab === 'tax'         && <TaxLossHarvesting />}
    </div>
  )
}
