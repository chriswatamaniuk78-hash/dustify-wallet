'use client'
// ============================================================
// DUSTMILES REWARDS WATERFALL — Complete UI
// The world's most transparent, generous, self-sustaining
// rewards system. 100 DM = 1 USDC. Always. Forever.
// ============================================================

import { useState, useEffect, useRef, useCallback } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import {
  WATERFALL_POOL, REVENUE_STREAMS, TIER_SYSTEM, EARN_ACTIVITIES,
  REDEMPTION_OPTIONS, PARTNER_NETWORK, COMPLIANCE_ITEMS, COMPETITOR_COMPARISON,
  type WaterfallPool, type RevenueStream, type DustMilesTier, type EarnActivity,
  type RedemptionOption, type RewardsPartner, type ComplianceItem,
} from '@/lib/dustmiles-data'

// ── Types ─────────────────────────────────────────────────────
type MainTab = 'overview' | 'earn' | 'redeem' | 'waterfall' | 'partners' | 'tiers' | 'compare' | 'compliance'

// ── Utilities ─────────────────────────────────────────────────
function fmtUSD(n: number, d = 0) { return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'USD', minimumFractionDigits: d, maximumFractionDigits: d }).format(n) }
function fmtDM(n: number) { return n >= 1_000_000 ? `${(n/1_000_000).toFixed(2)}M DM` : n >= 1_000 ? `${(n/1_000).toFixed(1)}K DM` : `${n.toLocaleString()} DM` }
function fmtPct(n: number) { return `${n >= 0 ? '+' : ''}${n.toFixed(1)}%` }
function poolColor(pct: number) { return pct >= 100 ? '#D4AF37' : pct >= 80 ? '#4ade80' : pct >= 50 ? '#fbbf24' : '#f87171' }

// ── Pool Health Ring ──────────────────────────────────────────
function PoolHealthRing({ pct, color, size = 100 }: { pct: number; color: string; size?: number }) {
  const r = (size - 12) / 2, c = 2 * Math.PI * r
  const dash = Math.min(pct / 100, 1) * c * 0.8
  return (
    <div style={{ position: 'relative', width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-144deg)' }}>
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="var(--glass-3)" strokeWidth={10}
          strokeDasharray={`${c * 0.8} ${c}`} strokeLinecap="round" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={`${dash} ${c}`} strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1.5s cubic-bezier(.4,0,.2,1)', filter: `drop-shadow(0 0 6px ${color}60)` }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <span className="font-display" style={{ fontSize: size * 0.2, fontWeight: 700, color, lineHeight: 1 }}>{Math.min(pct, 100).toFixed(0)}</span>
        <span className="font-mono" style={{ fontSize: size * 0.09, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>%</span>
      </div>
    </div>
  )
}

// ── Live Waterfall Animation ───────────────────────────────────
function WaterfallDiagram() {
  const [tick, setTick] = useState(0)
  const [droplets, setDroplets] = useState<{ id: number; x: number; y: number; opacity: number; stream: number }[]>([])
  const nextId = useRef(0)

  useEffect(() => {
    const t = setInterval(() => {
      setTick(p => p + 1)
      // Add new droplet from a random revenue stream
      const stream = Math.floor(Math.random() * REVENUE_STREAMS.length)
      const xBase = [10, 23, 36, 49, 62, 75, 88]
      const newDrop = { id: nextId.current++, x: xBase[stream] + (Math.random() - 0.5) * 4, y: 0, opacity: 0.9, stream }
      setDroplets(prev => [...prev.slice(-20), newDrop])
    }, 800)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    const t = setInterval(() => {
      setDroplets(prev => prev
        .map(d => ({ ...d, y: d.y + 4, opacity: d.opacity - 0.04 }))
        .filter(d => d.opacity > 0)
      )
    }, 60)
    return () => clearInterval(t)
  }, [])

  const totalMonthly = REVENUE_STREAMS.reduce((s, r) => s + r.poolMonthly, 0)
  const reservePct = (totalMonthly * 0.30 / totalMonthly) * 100
  const earnPct    = (totalMonthly * 0.60 / totalMonthly) * 100
  const growthPct  = (totalMonthly * 0.09 / totalMonthly) * 100
  const profitPct  = (totalMonthly * 0.01 / totalMonthly) * 100

  const LAYER_COLORS = REVENUE_STREAMS.map(r => r.color)

  return (
    <div className="glass-heavy" style={{ padding: '28px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 38, height: 38, borderRadius: 10, background: 'var(--gold-glass-3)', border: '1px solid var(--border-gold-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>⬇</div>
        <div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>Revenue Waterfall — Live Flow</div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            {fmtUSD(totalMonthly)}/mo flowing → pools · Animated in real-time
          </div>
        </div>
      </div>

      {/* Waterfall SVG */}
      <div style={{ position: 'relative', height: 280, background: 'var(--glass-1)', borderRadius: 14, overflow: 'hidden', marginBottom: 20, border: '1px solid var(--border-gold-0)' }}>
        <svg style={{ width: '100%', height: '100%', position: 'absolute', inset: 0 }} viewBox="0 0 100 100" preserveAspectRatio="none">
          {/* Revenue stream bars at top */}
          {REVENUE_STREAMS.map((r, i) => {
            const x = 10 + i * 13
            const h = (r.poolMonthly / totalMonthly) * 30
            return (
              <g key={r.id}>
                <rect x={x - 3} y={5} width={6} height={h} fill={r.color} opacity={0.25} rx={1} />
                <rect x={x - 3} y={5} width={6} height={h * 0.3} fill={r.color} opacity={0.7} rx={1}>
                  <animate attributeName="height" values={`${h*0.2};${h*0.35};${h*0.2}`} dur={`${2 + i*0.3}s`} repeatCount="indefinite" />
                </rect>
              </g>
            )
          })}

          {/* Funnel shape */}
          <path d="M5,42 L95,42 L75,58 L25,58 Z" fill="var(--gold-glass-1)" stroke="var(--border-gold-1)" strokeWidth="0.5" />
          <text x="50" y="52" textAnchor="middle" fontSize="3.5" fill="var(--gold)" fontFamily="JetBrains Mono">{fmtUSD(totalMonthly)}/mo</text>

          {/* Distribution waterfall */}
          {/* Reserve Pool stream (30%) */}
          <rect x="15" y="60" width="14" height="28" fill="rgba(74,222,128,0.12)" stroke="rgba(74,222,128,0.4)" strokeWidth="0.5" rx="1" />
          <text x="22" y="67" textAnchor="middle" fontSize="2.8" fill="#4ade80" fontFamily="JetBrains Mono">RESERVE</text>
          <text x="22" y="71" textAnchor="middle" fontSize="2.5" fill="#4ade80" fontFamily="JetBrains Mono">30%</text>
          <text x="22" y="75" textAnchor="middle" fontSize="2.2" fill="rgba(74,222,128,0.7)" fontFamily="JetBrains Mono">{fmtUSD(totalMonthly*0.30)}</text>
          <text x="22" y="82" textAnchor="middle" fontSize="2.2" fill="rgba(74,222,128,0.5)" fontFamily="JetBrains Mono">locked</text>

          {/* Earn Pool stream (60%) */}
          <rect x="35" y="60" width="28" height="28" fill="rgba(212,175,55,0.12)" stroke="rgba(212,175,55,0.4)" strokeWidth="0.5" rx="1" />
          <text x="49" y="67" textAnchor="middle" fontSize="2.8" fill="var(--gold)" fontFamily="JetBrains Mono">EARN POOL</text>
          <text x="49" y="71" textAnchor="middle" fontSize="2.5" fill="var(--gold)" fontFamily="JetBrains Mono">60%</text>
          <text x="49" y="75" textAnchor="middle" fontSize="2.2" fill="rgba(212,175,55,0.7)" fontFamily="JetBrains Mono">{fmtUSD(totalMonthly*0.60)}</text>
          <text x="49" y="82" textAnchor="middle" fontSize="2.2" fill="rgba(212,175,55,0.5)" fontFamily="JetBrains Mono">→ users</text>

          {/* Growth stream (9%) */}
          <rect x="68" y="60" width="12" height="28" fill="rgba(167,139,250,0.12)" stroke="rgba(167,139,250,0.4)" strokeWidth="0.5" rx="1" />
          <text x="74" y="67" textAnchor="middle" fontSize="2.8" fill="#a78bfa" fontFamily="JetBrains Mono">GROWTH</text>
          <text x="74" y="71" textAnchor="middle" fontSize="2.5" fill="#a78bfa" fontFamily="JetBrains Mono">9%</text>
          <text x="74" y="75" textAnchor="middle" fontSize="2.2" fill="rgba(167,139,250,0.7)" fontFamily="JetBrains Mono">{fmtUSD(totalMonthly*0.09)}</text>

          {/* Profit (1%) */}
          <rect x="84" y="60" width="8" height="28" fill="rgba(248,113,113,0.06)" stroke="rgba(248,113,113,0.3)" strokeWidth="0.5" rx="1" />
          <text x="88" y="67" textAnchor="middle" fontSize="2.4" fill="#f87171" fontFamily="JetBrains Mono">PROFIT</text>
          <text x="88" y="71" textAnchor="middle" fontSize="2.5" fill="#f87171" fontFamily="JetBrains Mono">1%</text>
          <text x="88" y="75" textAnchor="middle" fontSize="2.2" fill="rgba(248,113,113,0.7)" fontFamily="JetBrains Mono">ANNUAL</text>

          {/* Animated flow droplets */}
          {droplets.map(d => (
            <circle key={d.id} cx={d.x} cy={d.y > 42 ? Math.min(d.y, 60) : d.y}
              r={0.8} fill={LAYER_COLORS[d.stream] || 'var(--gold)'} opacity={d.opacity} />
          ))}
        </svg>

        {/* Stream labels */}
        <div style={{ position: 'absolute', top: 6, left: 0, right: 0, display: 'flex', justifyContent: 'space-around', padding: '0 4%' }}>
          {REVENUE_STREAMS.map(r => (
            <div key={r.id} style={{ textAlign: 'center', flex: 1 }}>
              <div style={{ fontSize: 12 }}>{r.icon}</div>
              <div className="font-mono" style={{ fontSize: 7, color: r.color, lineHeight: 1.2 }}>{r.name.split(' ')[0]}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Distribution bars */}
      <div style={{ display: 'flex', gap: 3, height: 12, borderRadius: 6, overflow: 'hidden' }}>
        {[
          { pct: 30, color: '#4ade80', label: 'Reserve 30%' },
          { pct: 60, color: '#D4AF37', label: 'Earn Pool 60%' },
          { pct: 9,  color: '#a78bfa', label: 'Growth 9%' },
          { pct: 1,  color: '#f87171', label: 'Dustify 1%' },
        ].map(b => (
          <div key={b.label} style={{ flex: b.pct, background: b.color, opacity: 0.8 }} title={b.label} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
        {[
          { label: '30% → Reserve Pool (locked)',     color: '#4ade80' },
          { label: '60% → User Earn Pool',            color: '#D4AF37' },
          { label: '9% → Growth & Partnerships',      color: '#a78bfa' },
          { label: '1% → Dustify profit (annual)',    color: '#f87171' },
        ].map(l => (
          <div key={l.label} style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: l.color, flexShrink: 0 }} />
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{l.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Pool Overview Cards ───────────────────────────────────────
function PoolOverview({ pool }: { pool: WaterfallPool }) {
  const resColor = poolColor(pool.reserveHealthPct)
  const totalMonthly = REVENUE_STREAMS.reduce((s, r) => s + r.poolMonthly, 0)
  const monthlyDMIssued = REVENUE_STREAMS.reduce((s, r) => s + r.dmIssuedMonthly, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Reserve pool */}
      <div style={{ padding: '24px', background: `${resColor}06`, border: `1px solid ${resColor}25`, borderRadius: 16, position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -30, right: -30, width: 120, height: 120, borderRadius: '50%', background: `radial-gradient(circle, ${resColor}10 0%, transparent 70%)`, pointerEvents: 'none' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <PoolHealthRing pct={pool.reserveHealthPct} color={resColor} size={100} />
          <div style={{ flex: 1 }}>
            <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-tertiary)', marginBottom: 6 }}>RESERVE POOL · LOCKED ON-CHAIN · POLYGON</div>
            <div className="font-display" style={{ fontSize: 32, fontWeight: 600, color: resColor, letterSpacing: '-0.02em', marginBottom: 4 }}>
              {fmtUSD(pool.reserveBalance)}
            </div>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 8 }}>
              of {fmtUSD(pool.reserveTarget)} target ({pool.reserveHealthPct.toFixed(1)}%)
              · {fmtUSD(pool.reserveTarget - pool.reserveBalance)} to full
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              <StatusBadge variant="success">{pool.reserveYieldAPY}% APY DeFi yield</StatusBadge>
              <StatusBadge variant="gold">Smart contract locked</StatusBadge>
              <StatusBadge variant="info">4-of-7 multi-sig</StatusBadge>
            </div>
          </div>
        </div>
        <div style={{ marginTop: 16, height: 8, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ height: '100%', width: `${Math.min(pool.reserveHealthPct, 100)}%`, background: resColor, borderRadius: 100, transition: 'width 1.5s ease', boxShadow: `0 0 10px ${resColor}50` }} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>CRITICAL</span>
          <span className="font-mono" style={{ fontSize: 9, color: resColor }}>BUILDING — {pool.reserveHealthPct.toFixed(0)}%</span>
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--gold)' }}>OVERFLOW</span>
        </div>
        <div style={{ marginTop: 10, padding: '10px 14px', background: 'var(--glass-1)', borderRadius: 10, border: '1px solid var(--border-void)' }}>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
            ⚡ Reserve grows by {fmtUSD(totalMonthly * 0.30)}/month.
            Once Reserve exceeds 2× target ({fmtUSD(pool.reserveTarget * 2)}), overflow goes directly to Earn Pool → more rewards for users.
            DeFi yield earns {fmtUSD(pool.reserveBalance * (pool.reserveYieldAPY/100) / 12)}/month additional passive income.
            Dustify CANNOT access Reserve below 2× target — enforced by smart contract.
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
        {[
          { label: 'Monthly Pool Inflow',  value: fmtUSD(totalMonthly),     sub: '7 revenue streams',     color: 'var(--success)',   icon: '▲' },
          { label: 'Monthly DM Issued',    value: fmtDM(monthlyDMIssued),   sub: `= ${fmtUSD(monthlyDMIssued/100)} USDC`,  color: 'var(--gold)',     icon: '◆' },
          { label: 'Earn Pool Balance',    value: fmtUSD(pool.earnBalance),  sub: `${fmtUSD(pool.earnSurplusDeficit)}/mo surplus`, color: 'var(--gold)',     icon: '◎' },
          { label: 'Dustify Profit (YTD)', value: fmtUSD(pool.profitAccrued),sub: `Next: ${pool.profitWithdrawalDate}`,   color: 'var(--text-tertiary)', icon: '1%' },
        ].map(s => (
          <div key={s.label} style={{ padding: '16px', background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)', borderRadius: 14 }}>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 6, letterSpacing: '0.1em' }}>{s.label.toUpperCase()}</div>
            <div className="font-display" style={{ fontSize: 22, color: s.color, fontWeight: 600, marginBottom: 4 }}>{s.value}</div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{s.sub}</div>
          </div>
        ))}
      </div>

      {/* Revenue streams */}
      <div className="glass" style={{ padding: '20px' }}>
        <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-tertiary)', marginBottom: 14 }}>REVENUE STREAMS FEEDING THE WATERFALL</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {REVENUE_STREAMS.map((r, i) => (
            <div key={r.id} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < REVENUE_STREAMS.length - 1 ? '1px solid var(--border-void)' : 'none' }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: `${r.color}12`, border: `1px solid ${r.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, flexShrink: 0 }}>
                {r.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 13, fontWeight: 500 }}>{r.name}</span>
                  <span className="font-mono" style={{ fontSize: 9, padding: '1px 7px', borderRadius: 100, color: r.trend === 'UP' ? 'var(--success)' : r.trend === 'DOWN' ? 'var(--danger)' : 'var(--text-tertiary)', background: r.trend === 'UP' ? 'rgba(74,222,128,0.08)' : 'var(--glass-2)' }}>
                    {r.trend === 'UP' ? '▲' : r.trend === 'DOWN' ? '▼' : '◆'} {fmtPct(r.trendPct)}
                  </span>
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{r.description}</div>
              </div>
              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div className="font-mono" style={{ fontSize: 12, color: r.color, fontWeight: 500 }}>{fmtUSD(r.poolMonthly)}/mo</div>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{fmtDM(r.dmIssuedMonthly)}</div>
              </div>
              <div style={{ width: 60, height: 4, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden', flexShrink: 0 }}>
                <div style={{ height: '100%', width: `${(r.poolMonthly / Math.max(...REVENUE_STREAMS.map(s => s.poolMonthly))) * 100}%`, background: r.color, borderRadius: 100 }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, padding: '10px 14px', background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-1)', borderRadius: 10 }}>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', lineHeight: 1.7 }}>
            ✦ <strong>Why it never runs dry:</strong> Every stream funds the pool from platform revenue — not from user breakage.
            Unlike airlines (funded by 70%+ unredeemed miles), DustMiles is funded whether or not you redeem.
            Reserve Pool grows every month. DeFi yield adds passive income. Dustify takes 1% only once per year.
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Earn Engine ────────────────────────────────────────────────
function EarnEngine() {
  const totalMonthlyEarned = EARN_ACTIVITIES.reduce((s, a) => s + a.monthlyEarned, 0)
  const totalMonthlyUSDC = EARN_ACTIVITIES.reduce((s, a) => s + a.estimatedUSDC, 0)
  const categoryColors: Record<string, string> = { TRADING: '#4ade80', TRAVEL: '#60a5fa', GAMING: '#f472b6', SHOPPING: '#D4AF37', REFERRAL: '#fbbf24', SOCIAL: '#a78bfa', STAKING: '#a78bfa', STREAK: '#fbbf24' }

  const userBalance = 48_240
  const userTier = TIER_SYSTEM[2] // GOLD
  const userStreak = 14

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* User snapshot */}
      <div style={{ padding: '20px', background: `${userTier.color}08`, border: `1px solid ${userTier.color}30`, borderRadius: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 4 }}>{userTier.icon}</div>
            <div className="font-display" style={{ fontSize: 14, color: userTier.color, fontWeight: 600 }}>{userTier.name}</div>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Tier</div>
          </div>
          <div style={{ height: 60, width: 1, background: 'var(--border-void)' }} />
          <div style={{ flex: 1 }}>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4 }}>YOUR DUSTMILES BALANCE</div>
            <div className="font-display" style={{ fontSize: 36, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.03em', marginBottom: 2 }}>
              {fmtDM(userBalance)}
            </div>
            <div className="font-mono" style={{ fontSize: 12, color: 'var(--success)' }}>≡ {fmtUSD(userBalance / 100, 2)} USDC · Ready to redeem</div>
          </div>
          <div style={{ height: 60, width: 1, background: 'var(--border-void)' }} />
          <div>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4 }}>THIS MONTH</div>
            <div className="font-display" style={{ fontSize: 24, color: 'var(--gold)', fontWeight: 500 }}>{fmtDM(totalMonthlyEarned)}</div>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--success)' }}>≡ {fmtUSD(totalMonthlyUSDC, 2)}</div>
          </div>
          <div style={{ height: 60, width: 1, background: 'var(--border-void)' }} />
          <div style={{ textAlign: 'center' }}>
            <div className="font-display" style={{ fontSize: 28, color: '#fbbf24', fontWeight: 700 }}>🔥{userStreak}</div>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Day streak</div>
            <div className="font-mono" style={{ fontSize: 9, color: '#fbbf24' }}>2× multiplier</div>
          </div>
        </div>
      </div>

      {/* Earn activities */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 12 }}>
        {EARN_ACTIVITIES.map(a => {
          const color = categoryColors[a.category] ?? 'var(--gold)'
          return (
            <div key={a.id} style={{ padding: '18px', background: `${color}06`, border: `1px solid ${color}20`, borderRadius: 14, position: 'relative', overflow: 'hidden' }}>
              {a.isBonus && (
                <div style={{ position: 'absolute', top: 10, right: 10 }}>
                  <span className="font-mono" style={{ fontSize: 8, padding: '2px 8px', borderRadius: 100, background: 'var(--gold-glass-2)', color: 'var(--gold)', border: '1px solid var(--border-gold-1)' }}>
                    {a.bonusExpiry}
                  </span>
                </div>
              )}
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ fontSize: 20, flexShrink: 0 }}>{a.icon}</div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: color, marginBottom: 3 }}>{a.action}</div>
                  <div className="font-body" style={{ fontSize: 11, color: 'var(--text-tertiary)', fontStyle: 'italic', marginBottom: 10, lineHeight: 1.4 }}>{a.description}</div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                    <div style={{ padding: '8px', background: 'var(--glass-1)', borderRadius: 8 }}>
                      <div className="font-mono" style={{ fontSize: 8, color: 'var(--text-tertiary)', marginBottom: 3 }}>BASE RATE</div>
                      <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{a.baseRate} DM {a.unit}</div>
                    </div>
                    <div style={{ padding: '8px', background: `${color}10`, borderRadius: 8 }}>
                      <div className="font-mono" style={{ fontSize: 8, color: 'var(--text-tertiary)', marginBottom: 3 }}>WITH YOUR MULTIPLIER</div>
                      <div className="font-mono" style={{ fontSize: 12, color, fontWeight: 600 }}>{a.effectiveRate} DM</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8 }}>
                    <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>MTD: {fmtDM(a.monthlyEarned)}</span>
                    <span className="font-mono" style={{ fontSize: 9, color: 'var(--success)' }}>≡ {fmtUSD(a.estimatedUSDC, 2)}</span>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Multiplier breakdown */}
      <div className="glass" style={{ padding: '20px' }}>
        <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-tertiary)', marginBottom: 14 }}>YOUR MULTIPLIER BREAKDOWN · GOLD TIER</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
          {([
            { label: 'Tier Bonus',    value: '1.5×', desc: 'Gold tier',      color: '#D4AF37', bold: false },
            { label: 'Streak Bonus',  value: '2.0×', desc: '14-day streak',  color: '#fbbf24', bold: false },
            { label: 'Partner Bonus', value: '1.2×', desc: 'Active partners', color: '#4ade80', bold: false },
            { label: 'Total',         value: '3.6×', desc: 'vs Bronze base', color: '#ff6b9d', bold: true },
          ] as const).map(m => (
            <div key={m.label} style={{ padding: '14px', background: `${m.color}08`, border: `1px solid ${m.color}20`, borderRadius: 12, textAlign: 'center' }}>
              <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 5 }}>{m.label.toUpperCase()}</div>
              <div className="font-display" style={{ fontSize: 26, color: m.color, fontWeight: m.bold ? 700 : 500 }}>{m.value}</div>
              <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 3 }}>{m.desc}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Redemption Center ─────────────────────────────────────────
function RedemptionCenter() {
  const [amount, setAmount] = useState(1000)
  const [selectedOption, setSelectedOption] = useState('rd1')
  const [redeeming, setRedeeming] = useState(false)
  const [redeemed, setRedeemed] = useState(false)

  const option = REDEMPTION_OPTIONS.find(o => o.id === selectedOption)
  const usdcValue = option ? (amount / 100) * option.valuePerPoint * 100 : amount / 100

  async function doRedeem() {
    setRedeeming(true)
    await new Promise(r => setTimeout(r, 2000))
    setRedeeming(false)
    setRedeemed(true)
    setTimeout(() => setRedeemed(false), 4000)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Instant settlement banner */}
      <div style={{ padding: '14px 18px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 12 }}>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--success)', lineHeight: 1.7 }}>
          ✓ <strong>Fixed forever: 100 DustMiles = 1 USDC</strong> — This rate is immutable and stored on Polygon.
          Dustify cannot change it. No devaluation. No "dynamic pricing". No blackout dates. No minimums on USDC direct.
          Instant settlement to your Soul Wallet. Compare: Aeroplan devalued 25% in 2023 with 2 weeks notice.
        </div>
      </div>

      {/* Options grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
        {REDEMPTION_OPTIONS.map(opt => (
          <div key={opt.id} onClick={() => setSelectedOption(opt.id)} style={{
            padding: '18px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
            background: selectedOption === opt.id ? `${opt.color}10` : 'var(--glass-1)',
            border: `1px solid ${selectedOption === opt.id ? `${opt.color}40` : 'var(--border-gold-0)'}`,
            position: 'relative', overflow: 'hidden',
          }}>
            {opt.popular && (
              <div style={{ position: 'absolute', top: 10, right: 10 }}>
                <span className="font-mono" style={{ fontSize: 8, padding: '2px 8px', borderRadius: 100, background: 'var(--gold-glass-2)', color: 'var(--gold)', border: '1px solid var(--border-gold-1)' }}>POPULAR</span>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ fontSize: 24 }}>{opt.icon}</div>
              <div>
                <div style={{ fontSize: 14, fontWeight: 500, color: selectedOption === opt.id ? opt.color : 'var(--text-primary)' }}>{opt.title}</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span className="font-mono" style={{ fontSize: 9, color: opt.color, fontWeight: 600 }}>
                    100 DM = {fmtUSD(opt.valuePerPoint * 100, 2)}
                  </span>
                  {opt.instantSettlement && <span className="font-mono" style={{ fontSize: 9, color: 'var(--success)' }}>⚡ Instant</span>}
                </div>
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8, lineHeight: 1.4 }}>{opt.description}</div>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', fontStyle: 'italic', padding: '4px 8px', background: 'var(--glass-2)', borderRadius: 6 }}>
              vs {opt.comparisonNote}
            </div>
            {selectedOption === opt.id && (
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 2, background: opt.color }} />
            )}
          </div>
        ))}
      </div>

      {/* Redeem calculator */}
      <div className="glass-heavy" style={{ padding: '24px' }}>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)', marginBottom: 16 }}>REDEMPTION CALCULATOR</div>

        <div style={{ display: 'flex', gap: 20, alignItems: 'flex-end', marginBottom: 20, flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: '0.1em' }}>HOW MANY DUSTMILES?</div>
            <input type="range" min={100} max={48240} step={100} value={amount} onChange={e => setAmount(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--gold)', marginBottom: 4 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>100 DM</span>
              <span className="font-mono" style={{ fontSize: 9, color: 'var(--gold)' }}>{fmtDM(amount)}</span>
              <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>48,240 DM</span>
            </div>
          </div>
          <div style={{ textAlign: 'center', padding: '16px 24px', background: 'var(--gold-glass-2)', border: '1px solid var(--border-gold-2)', borderRadius: 12 }}>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4 }}>YOU RECEIVE</div>
            <div className="font-display" style={{ fontSize: 36, color: 'var(--gold)', fontWeight: 700, lineHeight: 1 }}>
              {fmtUSD(usdcValue, 2)}
            </div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>USDC · {option?.title}</div>
          </div>
        </div>

        {redeemed ? (
          <div style={{ padding: '16px', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.4)', borderRadius: 12, textAlign: 'center' }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>✅</div>
            <div className="font-display" style={{ fontSize: 18, color: 'var(--success)', fontWeight: 500 }}>Redeemed! {fmtUSD(usdcValue, 2)} USDC sent.</div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>Arrived in your Soul Wallet · 0 fees · 0 delays</div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={doRedeem} disabled={redeeming || amount < (option?.minPoints ?? 100)} className="btn-sovereign" style={{ flex: 1, padding: '14px', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {redeeming ? <Spinner size={18} /> : '◆'}
              {redeeming ? 'Redeeming...' : `Redeem ${fmtDM(amount)} → ${fmtUSD(usdcValue, 2)}`}
            </button>
          </div>
        )}

        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center', marginTop: 10 }}>
          No fees · No minimums on USDC Direct · Instant settlement · Fixed rate guaranteed on-chain
        </div>
      </div>
    </div>
  )
}

// ── Tier Showcase ─────────────────────────────────────────────
function TierShowcase() {
  const [hovered, setHovered] = useState<string | null>(null)
  const userTier = 'GOLD'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '12px 16px', background: 'var(--glass-1)', borderRadius: 12, border: '1px solid var(--border-gold-0)' }}>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Tiers are earned by accumulating DustMiles — not by spending money. Everyone starts at Bronze.
          Your tier multiplies everything you earn. Once you reach a tier, you keep it as long as your 12-month rolling balance stays above the threshold.
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {TIER_SYSTEM.map(tier => {
          const isUser = tier.level === userTier
          const isHovered = hovered === tier.level
          return (
            <div key={tier.level}
              onMouseEnter={() => setHovered(tier.level)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: '20px', borderRadius: 16, transition: 'all 0.2s', cursor: 'default',
                background: isUser ? `${tier.color}10` : isHovered ? `${tier.color}06` : 'var(--glass-1)',
                border: `1px solid ${isUser ? `${tier.color}50` : isHovered ? `${tier.color}25` : 'var(--border-gold-0)'}`,
                boxShadow: isUser ? `0 0 30px ${tier.glowColor}20` : 'none',
              }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{
                  width: 56, height: 56, borderRadius: 14, flexShrink: 0,
                  background: `${tier.color}15`, border: `2px solid ${tier.color}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24,
                  boxShadow: isUser || isHovered ? `0 0 20px ${tier.glowColor}30` : 'none',
                }}>
                  {tier.icon}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                    <span className="font-display" style={{ fontSize: 20, fontWeight: 600, color: tier.color }}>{tier.name}</span>
                    {isUser && <StatusBadge variant="gold">Your tier</StatusBadge>}
                    <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>from {fmtDM(tier.minPoints)}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                    {tier.features.map(f => (
                      <span key={f} className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>✓ {f}</span>
                    ))}
                  </div>
                </div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div className="font-display" style={{ fontSize: 30, color: tier.color, fontWeight: 700 }}>{tier.earnMultiplier}×</div>
                  <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>earn rate</div>
                  <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Max {fmtUSD(tier.maxRedeemPerMonth)}/mo</div>
                </div>
              </div>
              {tier.exclusive.length > 0 && (
                <div style={{ marginTop: 12, padding: '10px 14px', background: `${tier.color}08`, borderRadius: 10, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                  {tier.exclusive.map(e => (
                    <span key={e} className="font-mono" style={{ fontSize: 9, color: tier.color, padding: '2px 8px', borderRadius: 100, background: `${tier.color}12`, border: `1px solid ${tier.color}20` }}>⭐ {e}</span>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Competitor Comparison ─────────────────────────────────────
function CompetitorComparison() {
  const cols = [
    { key: 'effectiveReturn', label: 'Effective Return' },
    { key: 'fixedValue', label: 'Fixed Value' },
    { key: 'instantRedemption', label: 'Instant Payout' },
    { key: 'noExpiry', label: 'No Expiry' },
    { key: 'noBlackout', label: 'No Blackout' },
    { key: 'universalPartners', label: 'Universal Partners' },
    { key: 'cryptoNative', label: 'Crypto Native' },
    { key: 'transparentFunding', label: 'Transparent Funding' },
    { key: 'userFriendly', label: 'User Friendly' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '14px 16px', background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-1)', borderRadius: 12 }}>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', lineHeight: 1.7 }}>
          ✦ <strong>DustMiles beats every competing program on every dimension.</strong>
          The nearest competitor (PC Optimum) wins on 3 out of 9 criteria and offers 1% return.
          DustMiles offers 2.5-25% return. Aeroplan's 95% one-star reviews tell the real story — airline miles are broken.
        </div>
      </div>

      {/* Table */}
      <div style={{ overflowX: 'auto' }}>
        <div style={{ minWidth: 700, background: 'var(--glass-1)', borderRadius: 14, overflow: 'hidden', border: '1px solid var(--border-gold-0)' }}>
          {/* Header */}
          <div style={{ display: 'grid', gridTemplateColumns: `160px repeat(${cols.length}, 1fr)`, background: 'var(--glass-2)', padding: '12px 14px', borderBottom: '1px solid var(--border-gold-1)' }}>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>PROGRAM</div>
            {cols.map(c => (
              <div key={c.key} className="font-mono" style={{ fontSize: 8, color: 'var(--text-tertiary)', textAlign: 'center', lineHeight: 1.3 }}>{c.label.toUpperCase()}</div>
            ))}
          </div>

          {/* Rows */}
          {COMPETITOR_COMPARISON.map((prog, i) => {
            const isDust = prog.name.includes('DustMiles')
            return (
              <div key={prog.name} style={{
                display: 'grid', gridTemplateColumns: `160px repeat(${cols.length}, 1fr)`,
                padding: '12px 14px', borderBottom: i < COMPETITOR_COMPARISON.length - 1 ? '1px solid var(--border-void)' : 'none',
                background: isDust ? 'var(--gold-glass-1)' : 'transparent',
                border: isDust ? '1px solid var(--border-gold-1)' : 'none',
                borderRadius: isDust ? 10 : 0,
                margin: isDust ? '4px' : 0,
              }}>
                <div className="font-mono" style={{ fontSize: isDust ? 12 : 11, color: isDust ? 'var(--gold)' : 'var(--text-primary)', fontWeight: isDust ? 600 : 400, alignSelf: 'center' }}>
                  {prog.name}
                </div>
                {cols.map(c => {
                  const val = prog[c.key as keyof typeof prog]
                  const isBool = typeof val === 'boolean'
                  const winner = isDust ? (isBool ? val : true) : false
                  const loser = !isDust && isBool && !val
                  return (
                    <div key={c.key} style={{ textAlign: 'center', alignSelf: 'center' }}>
                      {isBool ? (
                        <span style={{ fontSize: 14, color: val ? (isDust ? 'var(--gold)' : 'var(--success)') : 'var(--text-tertiary)', filter: val && !isDust ? 'none' : undefined }}>
                          {val ? '✓' : '✗'}
                        </span>
                      ) : (
                        <span className="font-mono" style={{ fontSize: isDust ? 11 : 10, color: isDust ? 'var(--gold)' : 'var(--text-primary)', fontWeight: isDust ? 600 : 400 }}>
                          {val}
                        </span>
                      )}
                    </div>
                  )
                })}
              </div>
            )
          })}
        </div>
      </div>

      {/* Win count */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {COMPETITOR_COMPARISON.filter(p => !p.name.includes('Dust')).map(p => (
          <div key={p.name} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{ width: 120, flexShrink: 0 }}>
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{p.name}</span>
            </div>
            <div style={{ flex: 1, height: 8, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${((9 - p.dustmilesWins) / 9) * 100}%`, background: 'var(--text-tertiary)', borderRadius: 100, opacity: 0.4 }} />
            </div>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', flexShrink: 0 }}>{9 - p.dustmilesWins}/9 criteria</span>
          </div>
        ))}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 120, flexShrink: 0 }}>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--gold)', fontWeight: 600 }}>DustMiles ✦</span>
          </div>
          <div style={{ flex: 1, height: 8, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: '100%', background: 'var(--gold)', borderRadius: 100, boxShadow: '0 0 10px var(--gold-warm)' }} />
          </div>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--gold)', flexShrink: 0, fontWeight: 600 }}>9/9 criteria ✓</span>
        </div>
      </div>
    </div>
  )
}

// ── Partner Network ────────────────────────────────────────────
function PartnerNetworkView() {
  const cats = ['All', 'Shopping', 'Travel', 'Food', 'Tech', 'Transport', 'Grocery', 'Retail', 'Entertain']
  const [filter, setFilter] = useState('All')
  const filtered = PARTNER_NETWORK.filter(p => filter === 'All' || p.category === filter)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {cats.map(c => (
          <button key={c} onClick={() => setFilter(c)} style={{
            padding: '6px 14px', borderRadius: 100, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: filter === c ? 'var(--gold-glass-2)' : 'var(--glass-2)',
            color: filter === c ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            border: `1px solid ${filter === c ? 'var(--border-gold-1)' : 'transparent'}`,
          }}>{c}</button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
        {filtered.map(p => (
          <div key={p.id} style={{ padding: '18px', background: `${p.color === '#000000' ? '#ffffff' : p.color}06`, border: `1px solid ${p.color === '#000000' ? 'var(--border-glass)' : p.color}20`, borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: `${p.color === '#000000' ? '#ffffff' : p.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>
                {p.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{p.name}</span>
                  {p.isExclusive && <span className="font-mono" style={{ fontSize: 8, padding: '1px 6px', borderRadius: 100, background: 'var(--gold-glass-2)', color: 'var(--gold)', border: '1px solid var(--border-gold-1)' }}>EXCLUSIVE</span>}
                  {p.isNew && <span className="font-mono" style={{ fontSize: 8, padding: '1px 6px', borderRadius: 100, background: 'rgba(74,222,128,0.1)', color: 'var(--success)' }}>NEW</span>}
                </div>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{p.category}</div>
              </div>
            </div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8, lineHeight: 1.4 }}>{p.description}</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div className="font-display" style={{ fontSize: 20, color: 'var(--gold)', fontWeight: 600 }}>{p.effectiveReturn}%</div>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>cashback equiv.</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)' }}>{p.earnRate} DM/$1</div>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>earn rate</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div style={{ padding: '12px 16px', background: 'var(--glass-1)', borderRadius: 12 }}>
        <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1.7 }}>
          New partners added monthly. Exclusive rates negotiated by Dustify — often 2-3× higher than direct loyalty programs.
          Partners pay Dustify a commission, which flows directly into the DustMiles Earn Pool.
          Your earn rate is always shown upfront — no "points that expire before you can use them" tricks.
        </div>
      </div>
    </div>
  )
}

// ── Compliance Center ─────────────────────────────────────────
function ComplianceCenter() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ padding: '16px 18px', background: 'rgba(74,222,128,0.06)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span style={{ fontSize: 24 }}>⚖</span>
          <div>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 500, color: 'var(--success)' }}>Full Regulatory Compliance</div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Canada FINTRAC · IFRS 15 · CSA · CRA · Polygon Audit · PIPEDA</div>
          </div>
          <div style={{ marginLeft: 'auto' }}>
            <StatusBadge variant="success">All systems compliant</StatusBadge>
          </div>
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--success)', lineHeight: 1.7 }}>
          DustMiles is structured as a <strong>utility loyalty token</strong>, NOT a security.
          It does not meet the Howey Test (no expectation of profit from others' efforts; earned through platform activity).
          Fixed 100:1 USDC rate is stored immutably on Polygon and never changes without a governance vote requiring 67% quorum.
          All compliance documentation available on request for institutional partners.
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {COMPLIANCE_ITEMS.map(item => (
          <div key={item.regulation} style={{ padding: '18px 20px', background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)', borderRadius: 14 }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, flexShrink: 0 }}>
                {item.icon}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 500 }}>{item.regulation}</span>
                  <span className="font-mono" style={{ fontSize: 9, padding: '2px 8px', borderRadius: 100, color: 'var(--success)', background: 'rgba(74,222,128,0.1)', border: '1px solid rgba(74,222,128,0.25)' }}>
                    ✓ {item.status}
                  </span>
                  <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{item.jurisdiction}</span>
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1.6, marginBottom: 8 }}>{item.description}</div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Last audit: {item.lastAudit}</span>
                  <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Next review: {item.nextReview}</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* IFRS 15 accounting note */}
      <div className="glass" style={{ padding: '20px' }}>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', marginBottom: 12 }}>IFRS 15 / ASC 606 ACCOUNTING TREATMENT</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            { label: 'Point classification',    value: 'Contract liability (deferred revenue)' },
            { label: 'Standalone selling price', value: '$0.0098 per DM (net of 2% est. breakage)' },
            { label: 'Breakage estimate',        value: '2% (vs industry 31-33%) — we WANT redemptions' },
            { label: 'Redemption rate target',   value: '98%+ (funded from revenue, not breakage)' },
            { label: 'Revenue recognition',      value: 'On redemption or at point expiry (3 years inactive)' },
            { label: 'On-chain verification',    value: 'Polygon smart contract is source of truth for balance' },
          ].map(r => (
            <div key={r.label} style={{ display: 'flex', gap: 10, padding: '10px 0', borderBottom: '1px solid var(--border-void)' }}>
              <div style={{ width: 200, flexShrink: 0 }}>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{r.label}</span>
              </div>
              <div>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-primary)' }}>{r.value}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Main DustMiles Component ───────────────────────────────────
export default function DustMilesRewards() {
  const [tab, setTab] = useState<MainTab>('overview')

  const TABS: { id: MainTab; label: string; badge?: string; desc: string }[] = [
    { id: 'overview',   label: '◎ Overview',     badge: 'LIVE',  desc: 'Pool health & revenue streams' },
    { id: 'waterfall',  label: '⬇ Waterfall',    badge: null,    desc: 'Live animated flow diagram' },
    { id: 'earn',       label: '▲ Earn',          badge: null,    desc: 'All ways to earn DustMiles' },
    { id: 'redeem',     label: '◆ Redeem',        badge: null,    desc: 'Instant USDC conversion' },
    { id: 'tiers',      label: '✦ Tiers',         badge: null,    desc: 'Bronze → Titanium progression' },
    { id: 'partners',   label: '◈ Partners',      badge: '50+',   desc: 'Earn at partner merchants' },
    { id: 'compare',    label: '⇄ Compare',       badge: null,    desc: 'vs every competing program' },
    { id: 'compliance', label: '⚖ Compliance',   badge: null,    desc: 'FINTRAC, IFRS 15, on-chain audit' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold-warm)', marginBottom: 4 }}>DUSTMILES REWARDS WATERFALL</div>
        <h1 className="font-display" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', marginBottom: 8 }}>
          The world's most generous rewards system.
        </h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 4 }}>
          <div style={{ padding: '5px 14px', background: 'var(--gold-glass-2)', border: '1px solid var(--border-gold-2)', borderRadius: 100 }}>
            <span className="font-display" style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 600 }}>100 DM = 1 USDC</span>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginLeft: 8 }}>fixed · immutable · on-chain</span>
          </div>
          <StatusBadge variant="success">Self-sustaining</StatusBadge>
          <StatusBadge variant="gold">Never runs dry</StatusBadge>
          <StatusBadge variant="info">Dustify: 1% annual profit only</StatusBadge>
          <StatusBadge variant="success">Fully FINTRAC compliant</StatusBadge>
        </div>
        <div className="font-body" style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic', lineHeight: 1.6 }}>
          Funded from platform revenue — never from your unredeemed points. 60% of everything goes to you.
          Dustify takes 1% once a year. That's it.
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto', padding: 4, background: 'var(--glass-1)', borderRadius: 12, border: '1px solid var(--border-gold-0)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '8px 14px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap', position: 'relative',
            background: tab === t.id ? 'var(--gold-glass-2)' : 'transparent',
            color: tab === t.id ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: tab === t.id ? 500 : 400,
            border: `1px solid ${tab === t.id ? 'var(--border-gold-1)' : 'transparent'}`,
          }}>
            {t.label}
            {t.badge && (
              <span style={{ marginLeft: 6, fontSize: 8, padding: '1px 5px', borderRadius: 100, background: tab === t.id ? 'var(--gold-glass-3)' : 'var(--glass-2)', color: 'var(--gold)', fontWeight: 600 }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'overview'   && <PoolOverview pool={WATERFALL_POOL} />}
      {tab === 'waterfall'  && <WaterfallDiagram />}
      {tab === 'earn'       && <EarnEngine />}
      {tab === 'redeem'     && <RedemptionCenter />}
      {tab === 'tiers'      && <TierShowcase />}
      {tab === 'partners'   && <PartnerNetworkView />}
      {tab === 'compare'    && <CompetitorComparison />}
      {tab === 'compliance' && <ComplianceCenter />}
    </div>
  )
}
