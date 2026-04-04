'use client'
// ============================================================
// DUSTIFY FEE STRUCTURE & REVENUE PROJECTIONS
// ============================================================
// RESEARCH SYNTHESIS — Competitor fees:
//
//  CRYPTO TRADING:
//    Coinbase:    0.40–0.60% taker (up to 1.49–3.99% instant)
//    Binance:     0.10% maker/taker (industry floor)
//    Kraken:      0.25–0.40% standard
//    Gemini:      1.49% + 1% convenience = 2.49% effective
//    MetaMask:    0.30–0.875% swap
//    Bitstamp:    0.30–0.40%
//
//  TRAVEL (OTA):
//    Expedia:     15–25% commission from partners → passed to users
//    Booking.com: 15–18% average
//    Hopper:      15–20% + HIDDEN FEES on top
//    Airbnb:      3% host + 14% guest = 17% total
//    Hotels.com:  18–22%
//
//  GAMING TOURNAMENTS:
//    Papaya Gaming: 20% rake — earns $2M/day!
//    Skillz:        30% rake + 50% developer share
//    Apple App Store: 30% additional on all in-app purchases
//
//  WALLET TRANSFERS:
//    MetaMask:      0.875% swap fee
//    Coinbase:      1.5%+ on conversions
//    Standard gas:  $1–$100 on Ethereum (pennies on Polygon)
//
// DUSTIFY OPTIMAL FEES (beat everyone, stay profitable):
//    Crypto trading:     0.08%  (vs 0.10–0.60% competitors)
//    Forex trading:      0.08%  (vs 0.10–0.50% competitors)
//    Travel bookings:    2.50%  (vs 15–25% competitors = 6-10× cheaper)
//    Gaming rake:        5.00%  (vs 20–30% competitors = 4-6× cheaper)
//    Wallet sends USDC:  0.10%  (vs 0.875% MetaMask = 8.75× cheaper)
//    DeFi swaps:         0.20%  (vs 0.875% MetaMask, 0.30% 1inch)
//    NFT marketplace:    1.50%  (vs 2.5% OpenSea = 1.67× cheaper)
//    Partner interchange:1.50%  (standard industry rate, passed from Visa/MC)
//
// The math works because:
//    Travel at 2.5% on $150M bookings = $3.75M/mo alone
//    Volume × low fee → more than high fee × no volume
//    Users STAY because fees are lowest anywhere = more transactions
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'

// ── Types ─────────────────────────────────────────────────────
type FeeCategory = 'trading' | 'travel' | 'gaming' | 'wallet' | 'defi' | 'nft'
type GrowthPhase = 'Y1' | 'Y2' | 'Y3' | 'Y5'

interface FeeRow {
  category: FeeCategory
  action: string
  dustifyFee: number        // percentage
  competitors: { name: string; fee: number; note?: string }[]
  advantage: string         // "6× cheaper than Expedia"
  color: string
  icon: string
  unit: string              // "per trade", "per booking", etc.
  dustifySavingPerUnit: number  // $ saved per $1000 transaction vs avg competitor
}

interface RevenueStream {
  id: string
  name: string
  icon: string
  color: string
  fee: number
  unit: string
  y1: { volume: number; users: number; revenue: number }
  y2: { volume: number; users: number; revenue: number }
  y3: { volume: number; users: number; revenue: number }
  y5: { volume: number; users: number; revenue: number }
  growthDrivers: string[]
}

interface PhaseMetrics {
  phase: GrowthPhase
  label: string
  activeUsers: number
  totalMonthlyRevenue: number
  totalAnnualRevenue: number
  dustmilesPoolMonthly: number  // 60% to users
  reservePoolMonthly: number    // 30% reserve
  growthPoolMonthly: number     // 9% growth
  annualDustifyProfit: number   // 1% annual
  color: string
}

// ── Utilities ─────────────────────────────────────────────────
function fmtUSD(n: number, d = 0): string {
  if (n >= 1_000_000) return `$${(n/1_000_000).toFixed(d || 2)}M`
  if (n >= 1_000) return `$${(n/1_000).toFixed(d || 1)}K`
  return new Intl.NumberFormat('en-US',{ style:'currency', currency:'USD', minimumFractionDigits:d, maximumFractionDigits:d }).format(n)
}
function fmtPct(n: number): string { return `${n.toFixed(n < 1 ? 2 : 1)}%` }
function fmtNum(n: number): string {
  if (n >= 1_000_000) return `${(n/1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `${(n/1_000).toFixed(0)}K`
  return n.toString()
}

// ── Fee Data ───────────────────────────────────────────────────
const FEE_ROWS: FeeRow[] = [
  {
    category: 'trading', action: 'Crypto trade', icon: '◆', color: '#4ade80',
    dustifyFee: 0.08, unit: 'per trade',
    competitors: [
      { name: 'Coinbase',  fee: 0.60, note: 'taker rate' },
      { name: 'Kraken',    fee: 0.40, note: 'standard' },
      { name: 'Binance',   fee: 0.10, note: 'market floor' },
      { name: 'Gemini',    fee: 2.49, note: 'basic + convenience' },
      { name: 'MetaMask',  fee: 0.875,note: 'swap fee' },
    ],
    advantage: '1.25× cheaper than Binance · 7.5× cheaper than Coinbase',
    dustifySavingPerUnit: 5.20,
  },
  {
    category: 'trading', action: 'Forex trade (OANDA)', icon: '⇄', color: '#60a5fa',
    dustifyFee: 0.08, unit: 'per trade',
    competitors: [
      { name: 'OANDA retail', fee: 0.25, note: 'standard spread' },
      { name: 'OANDA pro',    fee: 0.10, note: 'volume discount' },
      { name: 'IG Markets',   fee: 0.30, note: 'typical spread' },
      { name: 'Pepperstone',  fee: 0.15, note: 'standard' },
    ],
    advantage: '1.25–3.75× cheaper than all forex brokers',
    dustifySavingPerUnit: 1.70,
  },
  {
    category: 'travel', action: 'Flight booking', icon: '✈', color: '#f472b6',
    dustifyFee: 2.50, unit: 'of booking value',
    competitors: [
      { name: 'Expedia',      fee: 18, note: 'average OTA' },
      { name: 'Booking.com',  fee: 17, note: 'avg hotel comm.' },
      { name: 'Hopper',       fee: 20, note: '+ hidden fees' },
      { name: 'Kayak/Skyscanner', fee: 15, note: 'standard' },
      { name: 'Direct airline', fee: 0, note: 'baseline' },
    ],
    advantage: '6–8× cheaper than any OTA → lower prices for users',
    dustifySavingPerUnit: 155,
  },
  {
    category: 'travel', action: 'Hotel booking', icon: '🏨', color: '#f472b6',
    dustifyFee: 2.50, unit: 'of booking value',
    competitors: [
      { name: 'Booking.com',  fee: 15, note: 'avg commission' },
      { name: 'Expedia/Hotels.com', fee: 20, note: 'typical' },
      { name: 'Airbnb',       fee: 14, note: 'guest service fee' },
      { name: 'Agoda',        fee: 22, note: 'high-demand areas' },
    ],
    advantage: '6–9× cheaper than OTAs → partners offer lower rates on Soul Wallet',
    dustifySavingPerUnit: 172.50,
  },
  {
    category: 'gaming', action: 'Tournament rake', icon: '🏆', color: '#D4AF37',
    dustifyFee: 5.00, unit: 'of prize pool entry fees',
    competitors: [
      { name: 'Papaya Gaming', fee: 20, note: '$2M/day revenue' },
      { name: 'Skillz',        fee: 30, note: '+ 50% dev share' },
      { name: 'Apple/Google',  fee: 30, note: 'app store cut' },
      { name: 'DraftKings',    fee: 15, note: 'skill games' },
    ],
    advantage: '3–6× lower rake → bigger prize pools → more players',
    dustifySavingPerUnit: 15.00,
  },
  {
    category: 'wallet', action: 'USDC wallet send', icon: '💎', color: '#a78bfa',
    dustifyFee: 0.10, unit: 'of send amount',
    competitors: [
      { name: 'MetaMask swap',  fee: 0.875, note: 'swap fee' },
      { name: 'Coinbase',       fee: 1.49,  note: 'basic send' },
      { name: 'PayPal crypto',  fee: 2.30,  note: 'crypto send' },
      { name: 'Venmo crypto',   fee: 1.80,  note: 'standard' },
      { name: 'Polygon gas',    fee: 0.001, note: 'network only' },
    ],
    advantage: '8.75× cheaper than MetaMask · 23× cheaper than PayPal crypto',
    dustifySavingPerUnit: 7.75,
  },
  {
    category: 'defi', action: 'DeFi token swap', icon: '⬡', color: '#fbbf24',
    dustifyFee: 0.20, unit: 'per swap',
    competitors: [
      { name: 'MetaMask',   fee: 0.875,note: 'aggregator fee' },
      { name: '1inch',      fee: 0.30, note: 'standard rate' },
      { name: 'Uniswap',   fee: 0.30, note: 'v3 0.3% pool' },
      { name: 'Paraswap',  fee: 0.35, note: 'typical' },
    ],
    advantage: '1.5× cheaper than 1inch · 4.375× cheaper than MetaMask',
    dustifySavingPerUnit: 1.00,
  },
  {
    category: 'nft', action: 'NFT / Achievement sale', icon: '◉', color: '#ff6b9d',
    dustifyFee: 1.50, unit: 'of sale price',
    competitors: [
      { name: 'OpenSea',  fee: 2.50, note: 'industry leader' },
      { name: 'Blur',     fee: 0.50, note: 'lowest, but no royalties' },
      { name: 'Rarible',  fee: 2.00, note: 'standard' },
      { name: 'Magic Eden', fee: 2.00,note: 'standard' },
    ],
    advantage: '1.67× cheaper than OpenSea · creator royalties always paid',
    dustifySavingPerUnit: 1.00,
  },
]

// ── Revenue Streams with projections ──────────────────────────
const REVENUE_STREAMS: RevenueStream[] = [
  {
    id: 'crypto', name: 'Crypto Trading', icon: '◆', color: '#4ade80', fee: 0.08, unit: '/trade value',
    y1: { volume: 15_000_000,  users: 10_000,  revenue: 12_000  },
    y2: { volume: 250_000_000, users: 100_000, revenue: 200_000 },
    y3: { volume: 1_500_000_000, users: 400_000, revenue: 1_200_000 },
    y5: { volume: 5_000_000_000, users: 1_000_000, revenue: 4_000_000 },
    growthDrivers: ['Autonomous bot drives volume', 'Phantom Flow™ signals attract traders', 'Multi-asset (stocks+crypto+forex) = 3× more trading occasions'],
  },
  {
    id: 'forex', name: 'Forex Trading', icon: '⇄', color: '#60a5fa', fee: 0.08, unit: '/trade value',
    y1: { volume: 8_000_000,   users: 2_000,  revenue: 6_400   },
    y2: { volume: 120_000_000, users: 20_000, revenue: 96_000  },
    y3: { volume: 800_000_000, users: 80_000, revenue: 640_000 },
    y5: { volume: 3_000_000_000, users: 200_000, revenue: 2_400_000 },
    growthDrivers: ['OANDA integration live', '24/7 trading via bot', 'Currency pairs × volume = massive opportunity'],
  },
  {
    id: 'travel', name: 'Travel Bookings', icon: '✈', color: '#f472b6', fee: 2.50, unit: '/booking value',
    y1: { volume: 800_000,    users: 1_000,  revenue: 20_000  },
    y2: { volume: 18_000_000, users: 15_000, revenue: 450_000 },
    y3: { volume: 150_000_000, users: 100_000, revenue: 3_750_000 },
    y5: { volume: 600_000_000, users: 300_000, revenue: 15_000_000 },
    growthDrivers: ['OTA prices are 6-10× higher → users save real money with Dustify', 'DustMiles on every booking = habit formation', 'Amadeus API gives full global inventory'],
  },
  {
    id: 'gaming', name: 'Gaming Tournaments', icon: '🏆', color: '#D4AF37', fee: 5.00, unit: '/prize pool entry',
    y1: { volume: 200_000,   users: 5_000,  revenue: 10_000  },
    y2: { volume: 6_000_000, users: 60_000, revenue: 300_000 },
    y3: { volume: 50_000_000, users: 200_000, revenue: 2_500_000 },
    y5: { volume: 200_000_000, users: 500_000, revenue: 10_000_000 },
    growthDrivers: ['Papaya makes $2M/day at 20% — at 5% with bigger user base we win on volume', 'SBT anti-cheat = only platform with verified fair play', 'Daily free challenges = massive engagement'],
  },
  {
    id: 'wallet', name: 'Wallet Sends', icon: '💎', color: '#a78bfa', fee: 0.10, unit: '/send value',
    y1: { volume: 2_000_000,   users: 10_000,  revenue: 2_000   },
    y2: { volume: 40_000_000,  users: 100_000, revenue: 40_000  },
    y3: { volume: 400_000_000, users: 400_000, revenue: 400_000 },
    y5: { volume: 2_000_000_000, users: 1_000_000, revenue: 2_000_000 },
    growthDrivers: ['Network effect: more users = more sends between users', '0.10% is 8.75× cheaper than MetaMask = people prefer Soul Wallet', 'B2B payments use case opens massive volume'],
  },
  {
    id: 'defi', name: 'DeFi Swaps', icon: '⬡', color: '#fbbf24', fee: 0.20, unit: '/swap value',
    y1: { volume: 1_000_000,  users: 3_000,  revenue: 2_000   },
    y2: { volume: 20_000_000, users: 30_000, revenue: 40_000  },
    y3: { volume: 200_000_000, users: 150_000, revenue: 400_000 },
    y5: { volume: 1_000_000_000, users: 400_000, revenue: 2_000_000 },
    growthDrivers: ['Trading bot rebalancing generates automatic swap volume', 'DeFi yield farming creates recurring swaps', 'Sub-MetaMask pricing = wallet of choice for DeFi users'],
  },
  {
    id: 'nft', name: 'NFT Marketplace', icon: '◉', color: '#ff6b9d', fee: 1.50, unit: '/sale price',
    y1: { volume: 0,          users: 0,     revenue: 0        },
    y2: { volume: 3_000_000,  users: 20_000, revenue: 45_000  },
    y3: { volume: 30_000_000, users: 100_000, revenue: 450_000 },
    y5: { volume: 200_000_000, users: 300_000, revenue: 3_000_000 },
    growthDrivers: ['Achievement NFTs from gaming create organic marketplace', 'SBT-linked identity adds provenance to NFTs', '1.5% vs OpenSea 2.5% = Dustify becomes preferred marketplace'],
  },
  {
    id: 'interchange', name: 'Partner Interchange', icon: '◈', color: '#fb923c', fee: 1.50, unit: '/partner transaction',
    y1: { volume: 2_000_000,  users: 10_000,  revenue: 30_000  },
    y2: { volume: 40_000_000, users: 100_000, revenue: 600_000 },
    y3: { volume: 300_000_000, users: 400_000, revenue: 4_500_000 },
    y5: { volume: 1_500_000_000, users: 1_000_000, revenue: 22_500_000 },
    growthDrivers: ['Every Soul Wallet card swipe generates 1.5% interchange revenue', 'Partner network grows: Amazon, Tim Hortons, Loblaws etc.', 'SBT-linked spending data = premium interchange rates from Visa/MC'],
  },
]

// ── Compute phase totals ───────────────────────────────────────
function getPhaseRevenue(phase: GrowthPhase): number {
  return REVENUE_STREAMS.reduce((sum, s) => sum + s[phase.toLowerCase() as 'y1'].revenue, 0)
}

const PHASE_DATA: PhaseMetrics[] = [
  {
    phase: 'Y1', label: 'Year 1', activeUsers: 10_000, color: '#60a5fa',
    totalMonthlyRevenue: REVENUE_STREAMS.reduce((s,r) => s + r.y1.revenue, 0),
    totalAnnualRevenue: REVENUE_STREAMS.reduce((s,r) => s + r.y1.revenue, 0) * 12,
    dustmilesPoolMonthly: REVENUE_STREAMS.reduce((s,r) => s + r.y1.revenue, 0) * 0.60,
    reservePoolMonthly: REVENUE_STREAMS.reduce((s,r) => s + r.y1.revenue, 0) * 0.30,
    growthPoolMonthly: REVENUE_STREAMS.reduce((s,r) => s + r.y1.revenue, 0) * 0.09,
    annualDustifyProfit: REVENUE_STREAMS.reduce((s,r) => s + r.y1.revenue, 0) * 12 * 0.01,
  },
  {
    phase: 'Y2', label: 'Year 2', activeUsers: 100_000, color: '#4ade80',
    totalMonthlyRevenue: REVENUE_STREAMS.reduce((s,r) => s + r.y2.revenue, 0),
    totalAnnualRevenue: REVENUE_STREAMS.reduce((s,r) => s + r.y2.revenue, 0) * 12,
    dustmilesPoolMonthly: REVENUE_STREAMS.reduce((s,r) => s + r.y2.revenue, 0) * 0.60,
    reservePoolMonthly: REVENUE_STREAMS.reduce((s,r) => s + r.y2.revenue, 0) * 0.30,
    growthPoolMonthly: REVENUE_STREAMS.reduce((s,r) => s + r.y2.revenue, 0) * 0.09,
    annualDustifyProfit: REVENUE_STREAMS.reduce((s,r) => s + r.y2.revenue, 0) * 12 * 0.01,
  },
  {
    phase: 'Y3', label: 'Year 3', activeUsers: 400_000, color: '#D4AF37',
    totalMonthlyRevenue: REVENUE_STREAMS.reduce((s,r) => s + r.y3.revenue, 0),
    totalAnnualRevenue: REVENUE_STREAMS.reduce((s,r) => s + r.y3.revenue, 0) * 12,
    dustmilesPoolMonthly: REVENUE_STREAMS.reduce((s,r) => s + r.y3.revenue, 0) * 0.60,
    reservePoolMonthly: REVENUE_STREAMS.reduce((s,r) => s + r.y3.revenue, 0) * 0.30,
    growthPoolMonthly: REVENUE_STREAMS.reduce((s,r) => s + r.y3.revenue, 0) * 0.09,
    annualDustifyProfit: REVENUE_STREAMS.reduce((s,r) => s + r.y3.revenue, 0) * 12 * 0.01,
  },
  {
    phase: 'Y5', label: 'Year 5', activeUsers: 1_000_000, color: '#ff6b9d',
    totalMonthlyRevenue: REVENUE_STREAMS.reduce((s,r) => s + r.y5.revenue, 0),
    totalAnnualRevenue: REVENUE_STREAMS.reduce((s,r) => s + r.y5.revenue, 0) * 12,
    dustmilesPoolMonthly: REVENUE_STREAMS.reduce((s,r) => s + r.y5.revenue, 0) * 0.60,
    reservePoolMonthly: REVENUE_STREAMS.reduce((s,r) => s + r.y5.revenue, 0) * 0.30,
    growthPoolMonthly: REVENUE_STREAMS.reduce((s,r) => s + r.y5.revenue, 0) * 0.09,
    annualDustifyProfit: REVENUE_STREAMS.reduce((s,r) => s + r.y5.revenue, 0) * 12 * 0.01,
  },
]

// ── Revenue Growth Chart ───────────────────────────────────────
function RevenueChart({ phase, setPhase }: { phase: GrowthPhase; setPhase: (p: GrowthPhase) => void }) {
  const phaseKey = phase.toLowerCase() as 'y1'
  const streams = REVENUE_STREAMS.filter(s => s[phaseKey].revenue > 0)
  const maxRev = Math.max(...streams.map(s => s[phaseKey].revenue))
  const totalRev = streams.reduce((s, r) => s + r[phaseKey].revenue, 0)

  const W = 500, H = 200, BAR_W = 50, GAP = 14
  const barStep = BAR_W + GAP
  const svgW = Math.max(W, streams.length * barStep + 20)

  return (
    <div className="glass-heavy" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-tertiary)', marginBottom: 4 }}>MONTHLY REVENUE BY STREAM</div>
          <div className="font-display" style={{ fontSize: 32, fontWeight: 700, color: 'var(--gold)', letterSpacing: '-0.02em' }}>
            {fmtUSD(totalRev)}/mo
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--success)' }}>
            = {fmtUSD(totalRev * 12)} annually · {fmtNum(PHASE_DATA.find(p => p.phase === phase)!.activeUsers)} users
          </div>
        </div>

        {/* Phase selector */}
        <div style={{ display: 'flex', gap: 4, background: 'var(--glass-2)', borderRadius: 10, padding: 4 }}>
          {PHASE_DATA.map(p => (
            <button key={p.phase} onClick={() => setPhase(p.phase)} style={{
              padding: '7px 14px', borderRadius: 7, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
              background: phase === p.phase ? `${p.color}15` : 'transparent',
              color: phase === p.phase ? p.color : 'var(--text-tertiary)',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
              border: `1px solid ${phase === p.phase ? `${p.color}40` : 'transparent'}`,
              fontWeight: phase === p.phase ? 600 : 400,
            }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Bar chart */}
      <div style={{ overflowX: 'auto', marginBottom: 20 }}>
        <svg width={svgW} height={H + 40} viewBox={`0 0 ${svgW} ${H + 40}`}>
          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map(p => (
            <g key={p}>
              <line x1={0} y1={H - p * H} x2={svgW} y2={H - p * H} stroke="rgba(255,255,255,0.04)" strokeDasharray="4 6" />
              <text x={0} y={H - p * H - 3} fontSize={7} fill="rgba(255,255,255,0.2)" fontFamily="JetBrains Mono">
                {fmtUSD(maxRev * p)}
              </text>
            </g>
          ))}
          {/* Bars */}
          {streams.map((s, i) => {
            const rev = s[phaseKey].revenue
            const barH = (rev / maxRev) * (H - 10)
            const x = 20 + i * barStep
            const y = H - barH
            return (
              <g key={s.id}>
                <rect x={x} y={y} width={BAR_W} height={barH} rx={4}
                  fill={s.color} fillOpacity={0.2} />
                <rect x={x} y={y} width={BAR_W} height={Math.min(barH, 4)} rx={2}
                  fill={s.color} />
                <rect x={x} y={H} width={BAR_W} height={0} fill="none" />
                {/* Value label */}
                <text x={x + BAR_W/2} y={y - 4} textAnchor="middle" fontSize={7}
                  fill={s.color} fontFamily="JetBrains Mono" fontWeight="600">
                  {fmtUSD(rev)}
                </text>
                {/* Icon */}
                <text x={x + BAR_W/2} y={H + 14} textAnchor="middle" fontSize={14}>
                  {s.icon}
                </text>
                {/* Label */}
                <text x={x + BAR_W/2} y={H + 28} textAnchor="middle" fontSize={6.5}
                  fill="rgba(255,255,255,0.4)" fontFamily="JetBrains Mono">
                  {s.name.split(' ')[0]}
                </text>
              </g>
            )
          })}
        </svg>
      </div>

      {/* Waterfall split */}
      {(() => {
        const pm = PHASE_DATA.find(p => p.phase === phase)!
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
            {[
              { label: 'Users earn (DM)', value: pm.dustmilesPoolMonthly, sub: '60% of revenue', color: '#D4AF37', icon: '◆' },
              { label: 'Reserve Pool',    value: pm.reservePoolMonthly,   sub: '30% locked on-chain', color: '#4ade80', icon: '⬡' },
              { label: 'Growth',          value: pm.growthPoolMonthly,    sub: '9% reinvested', color: '#a78bfa', icon: '◈' },
              { label: 'Dustify profit',  value: pm.annualDustifyProfit / 12, sub: '1% annual (÷12)', color: '#f87171', icon: '◎' },
            ].map(b => (
              <div key={b.label} style={{ padding: '14px', background: `${b.color}08`, border: `1px solid ${b.color}20`, borderRadius: 12, textAlign: 'center' }}>
                <div style={{ fontSize: 18, marginBottom: 4 }}>{b.icon}</div>
                <div className="font-display" style={{ fontSize: 20, color: b.color, fontWeight: 600 }}>{fmtUSD(b.value)}/mo</div>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 3 }}>{b.label}</div>
                <div className="font-mono" style={{ fontSize: 9, color: `${b.color}80`, marginTop: 2 }}>{b.sub}</div>
              </div>
            ))}
          </div>
        )
      })()}
    </div>
  )
}

// ── Fee comparison table ───────────────────────────────────────
function FeeComparisonTable() {
  const [hoveredRow, setHoveredRow] = useState<string | null>(null)
  const [filterCat, setFilterCat] = useState<FeeCategory | 'all'>('all')

  const CATS: { id: FeeCategory | 'all'; label: string }[] = [
    { id: 'all', label: 'All categories' },
    { id: 'trading', label: '◆ Trading' },
    { id: 'travel', label: '✈ Travel' },
    { id: 'gaming', label: '🏆 Gaming' },
    { id: 'wallet', label: '💎 Wallet' },
    { id: 'defi', label: '⬡ DeFi' },
    { id: 'nft', label: '◉ NFT' },
  ]

  const rows = filterCat === 'all' ? FEE_ROWS : FEE_ROWS.filter(r => r.category === filterCat)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* Filter */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {CATS.map(c => (
          <button key={c.id} onClick={() => setFilterCat(c.id)} style={{
            padding: '6px 14px', borderRadius: 100, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: filterCat === c.id ? 'var(--gold-glass-2)' : 'var(--glass-2)',
            color: filterCat === c.id ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            border: `1px solid ${filterCat === c.id ? 'var(--border-gold-1)' : 'transparent'}`,
          }}>{c.label}</button>
        ))}
      </div>

      {/* "Why low fees = more revenue" explainer */}
      <div style={{ padding: '14px 18px', background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-1)', borderRadius: 12 }}>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', lineHeight: 1.7 }}>
          ✦ <strong>The volume flywheel:</strong> Low fees → more users choose Soul Wallet → more transactions →
          more revenue than competitors charging higher fees. A 2.5% travel commission on $150M/month in bookings = $3.75M/month.
          Expedia charges 18% but has to spend $1.65B/quarter in advertising to maintain users.
          Dustify's DustMiles + lowest fees = organic retention at zero ad spend.
        </div>
      </div>

      {/* Fee rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {rows.map(row => {
          const avgComp = row.competitors.reduce((s, c) => s + c.fee, 0) / row.competitors.length
          const isHov = hoveredRow === row.action
          return (
            <div key={row.action}
              onMouseEnter={() => setHoveredRow(row.action)}
              onMouseLeave={() => setHoveredRow(null)}
              style={{
                padding: '18px 20px', borderRadius: 14, transition: 'all 0.2s',
                background: isHov ? `${row.color}08` : 'var(--glass-1)',
                border: `1px solid ${isHov ? `${row.color}30` : 'var(--border-gold-0)'}`,
              }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
                {/* Action */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                    <span style={{ fontSize: 18 }}>{row.icon}</span>
                    <span style={{ fontSize: 15, fontWeight: 500 }}>{row.action}</span>
                  </div>
                  <div className="font-mono" style={{ fontSize: 10, color: row.color, marginBottom: 8, fontWeight: 500 }}>{row.advantage}</div>

                  {/* Competitor bars */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                    {/* Dustify bar */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div className="font-mono" style={{ fontSize: 9, color: 'var(--gold)', width: 90, flexShrink: 0, fontWeight: 600 }}>✦ Dustify</div>
                      <div style={{ flex: 1, height: 14, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden', position: 'relative' }}>
                        <div style={{
                          position: 'absolute', inset: 0, width: `${Math.min((row.dustifyFee / Math.max(...row.competitors.map(c => c.fee))) * 100, 100)}%`,
                          background: 'linear-gradient(90deg, var(--gold), var(--gold-warm))', borderRadius: 100, minWidth: 2,
                          boxShadow: '0 0 8px rgba(212,175,55,0.5)',
                        }} />
                      </div>
                      <div className="font-mono" style={{ fontSize: 10, color: 'var(--gold)', width: 48, textAlign: 'right', fontWeight: 700 }}>
                        {fmtPct(row.dustifyFee)}
                      </div>
                    </div>

                    {/* Competitor bars */}
                    {row.competitors.slice(0, 4).map(comp => {
                      const pct = (comp.fee / Math.max(...row.competitors.map(c => c.fee))) * 100
                      return (
                        <div key={comp.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', width: 90, flexShrink: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{comp.name}</div>
                          <div style={{ flex: 1, height: 8, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden' }}>
                            <div style={{ height: '100%', width: `${pct}%`, background: 'rgba(248,113,113,0.4)', borderRadius: 100 }} />
                          </div>
                          <div style={{ display: 'flex', gap: 6, width: 'fit-content', alignItems: 'center' }}>
                            <span className="font-mono" style={{ fontSize: 10, color: 'var(--danger)', width: 48, textAlign: 'right' }}>{fmtPct(comp.fee)}</span>
                            {comp.note && <span className="font-mono" style={{ fontSize: 8, color: 'var(--text-tertiary)' }}>({comp.note})</span>}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Summary stats */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, flexShrink: 0, minWidth: 160 }}>
                  <div style={{ padding: '12px 16px', background: 'var(--gold-glass-2)', border: '1px solid var(--border-gold-1)', borderRadius: 12, textAlign: 'center' }}>
                    <div className="font-mono" style={{ fontSize: 8, color: 'var(--text-tertiary)', marginBottom: 4 }}>DUSTIFY FEE</div>
                    <div className="font-display" style={{ fontSize: 28, color: 'var(--gold)', fontWeight: 700 }}>{fmtPct(row.dustifyFee)}</div>
                    <div className="font-mono" style={{ fontSize: 8, color: 'var(--gold-dim)' }}>{row.unit}</div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.2)', borderRadius: 12, textAlign: 'center' }}>
                    <div className="font-mono" style={{ fontSize: 8, color: 'var(--text-tertiary)', marginBottom: 3 }}>AVG COMPETITOR</div>
                    <div className="font-display" style={{ fontSize: 20, color: 'var(--danger)', fontWeight: 600 }}>{fmtPct(avgComp)}</div>
                    <div className="font-mono" style={{ fontSize: 8, color: 'var(--danger)', opacity: 0.7 }}>
                      {(avgComp / row.dustifyFee).toFixed(1)}× higher than us
                    </div>
                  </div>
                  <div style={{ padding: '10px 14px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 12, textAlign: 'center' }}>
                    <div className="font-mono" style={{ fontSize: 8, color: 'var(--text-tertiary)', marginBottom: 3 }}>USER SAVES PER $1K</div>
                    <div className="font-display" style={{ fontSize: 20, color: 'var(--success)', fontWeight: 600 }}>{fmtUSD(row.dustifySavingPerUnit)}</div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Revenue stream detail table ────────────────────────────────
function RevenueStreamTable({ phase }: { phase: GrowthPhase }) {
  const phaseKey = phase.toLowerCase() as 'y1'
  const streams = REVENUE_STREAMS.sort((a, b) => b[phaseKey].revenue - a[phaseKey].revenue)
  const total = streams.reduce((s, r) => s + r[phaseKey].revenue, 0)

  return (
    <div className="glass" style={{ padding: '20px' }}>
      <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-tertiary)', marginBottom: 14 }}>
        {phase} REVENUE BREAKDOWN · MONTHLY
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        {streams.map((s, i) => {
          const rev = s[phaseKey].revenue
          const pct = total > 0 ? (rev / total) * 100 : 0
          const phaseData = s[phaseKey]
          return (
            <div key={s.id} style={{
              display: 'grid', gridTemplateColumns: '36px 1fr 120px 100px 80px 80px',
              alignItems: 'center', gap: 12, padding: '12px 0',
              borderBottom: i < streams.length - 1 ? '1px solid var(--border-void)' : 'none',
            }}>
              <div style={{ fontSize: 18, textAlign: 'center' }}>{s.icon}</div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: rev === 0 ? 'var(--text-tertiary)' : 'var(--text-primary)', marginBottom: 3 }}>{s.name}</div>
                <div style={{ height: 4, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${pct}%`, background: s.color, borderRadius: 100 }} />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 2 }}>VOLUME</div>
                <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{fmtUSD(phaseData.volume)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 2 }}>USERS</div>
                <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{fmtNum(phaseData.users)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 2 }}>RATE</div>
                <div className="font-mono" style={{ fontSize: 11, color: s.color }}>{fmtPct(s.fee)}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 2 }}>REVENUE</div>
                <div className="font-display" style={{ fontSize: 15, color: rev === 0 ? 'var(--text-tertiary)' : 'var(--gold)', fontWeight: rev === 0 ? 400 : 600 }}>
                  {rev === 0 ? '—' : fmtUSD(rev)}
                </div>
              </div>
            </div>
          )
        })}
        {/* Total row */}
        <div style={{ display: 'grid', gridTemplateColumns: '36px 1fr 120px 100px 80px 80px', alignItems: 'center', gap: 12, padding: '14px 0 0 0', borderTop: '1px solid var(--border-gold-1)', marginTop: 6 }}>
          <div />
          <div className="font-mono" style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>TOTAL MONTHLY REVENUE</div>
          <div /><div /><div />
          <div style={{ textAlign: 'right' }}>
            <div className="font-display" style={{ fontSize: 22, color: 'var(--gold)', fontWeight: 700 }}>{fmtUSD(total)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Growth drivers ─────────────────────────────────────────────
function GrowthDrivers({ phase }: { phase: GrowthPhase }) {
  const phaseKey = phase.toLowerCase() as 'y1'
  const topStreams = [...REVENUE_STREAMS]
    .sort((a, b) => b[phaseKey].revenue - a[phaseKey].revenue)
    .filter(s => s[phaseKey].revenue > 0)
    .slice(0, 4)

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 12 }}>
      {topStreams.map(s => (
        <div key={s.id} style={{ padding: '18px', background: `${s.color}06`, border: `1px solid ${s.color}20`, borderRadius: 14 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 38, height: 38, borderRadius: 10, background: `${s.color}12`, border: `1px solid ${s.color}25`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
              {s.icon}
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: s.color }}>{s.name}</div>
              <div className="font-display" style={{ fontSize: 18, color: 'var(--gold)', fontWeight: 600 }}>{fmtUSD(s[phaseKey].revenue)}/mo</div>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {s.growthDrivers.map((d, i) => (
              <div key={i} style={{ display: 'flex', gap: 8 }}>
                <span className="font-mono" style={{ fontSize: 10, color: s.color, flexShrink: 0 }}>→</span>
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', lineHeight: 1.5 }}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Phase comparison summary ───────────────────────────────────
function PhaseSummaryGrid() {
  const MAX = PHASE_DATA[PHASE_DATA.length - 1].totalMonthlyRevenue

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="font-mono" style={{ fontSize: 9, letterSpacing: '0.18em', color: 'var(--text-tertiary)' }}>
        5-YEAR REVENUE TRAJECTORY
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
        {PHASE_DATA.map(p => {
          const ratio = p.totalMonthlyRevenue / MAX
          return (
            <div key={p.phase} style={{ padding: '20px 16px', background: `${p.color}06`, border: `1px solid ${p.color}20`, borderRadius: 16, textAlign: 'center' }}>
              <div className="font-mono" style={{ fontSize: 10, color: p.color, marginBottom: 8, fontWeight: 600 }}>{p.label.toUpperCase()}</div>
              <div className="font-display" style={{ fontSize: 24, color: p.color, fontWeight: 700, marginBottom: 4 }}>
                {fmtUSD(p.totalMonthlyRevenue)}<span className="font-mono" style={{ fontSize: 11, fontWeight: 400 }}>/mo</span>
              </div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)', marginBottom: 10 }}>
                {fmtUSD(p.totalAnnualRevenue)}/yr
              </div>
              <div style={{ height: 6, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden', marginBottom: 10 }}>
                <div style={{ height: '100%', width: `${ratio * 100}%`, background: p.color, borderRadius: 100 }} />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>
                  {fmtNum(p.activeUsers)} users
                </div>
                <div className="font-mono" style={{ fontSize: 9, color: '#4ade80' }}>
                  {fmtUSD(p.dustmilesPoolMonthly)}/mo to users (DM)
                </div>
                <div className="font-mono" style={{ fontSize: 9, color: '#f87171' }}>
                  {fmtUSD(p.annualDustifyProfit)}/yr Dustify profit
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* The key insight */}
      <div style={{ padding: '16px 20px', background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-1)', borderRadius: 12 }}>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', lineHeight: 1.8 }}>
          ✦ <strong>The insight that makes this work:</strong> Travel at 2.5% becomes the dominant revenue stream by Year 2.
          At 100,000 users with 15% booking travel, that's $450,000/month from a 2.5% fee vs competitors charging 15-25%.
          Because fees are 6-10× lower, partners PREFER listing through Dustify = better inventory + lower prices = more bookings.
          The trading bot drives daily crypto volume automatically. Gaming creates daily active sessions.
          Combined: a platform that generates revenue from every user action, with fees low enough to win market share from every competitor.
        </div>
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────
export default function DustFeeAnalyzer() {
  const [tab, setTab] = useState<'projections' | 'fees' | 'breakdown' | 'drivers'>('projections')
  const [phase, setPhase] = useState<GrowthPhase>('Y2')

  const TABS = [
    { id: 'projections' as const, label: '◎ Revenue Projections' },
    { id: 'fees'        as const, label: '◆ Fee Comparison' },
    { id: 'breakdown'   as const, label: '⬡ Stream Breakdown' },
    { id: 'drivers'     as const, label: '▲ Growth Drivers' },
  ]

  const y2Monthly = REVENUE_STREAMS.reduce((s, r) => s + r.y2.revenue, 0)
  const y3Monthly = REVENUE_STREAMS.reduce((s, r) => s + r.y3.revenue, 0)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold-warm)', marginBottom: 4 }}>DUSTIFY REVENUE ENGINE</div>
        <h1 className="font-display" style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.025em', marginBottom: 8 }}>
          Fee Structure & Revenue Projections
        </h1>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 8 }}>
          <div style={{ padding: '6px 16px', background: 'var(--gold-glass-2)', border: '1px solid var(--border-gold-2)', borderRadius: 100 }}>
            <span className="font-display" style={{ fontSize: 14, color: 'var(--gold)', fontWeight: 600 }}>
              {fmtUSD(y2Monthly)}/mo by Year 2
            </span>
          </div>
          <div style={{ padding: '6px 16px', background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', borderRadius: 100 }}>
            <span className="font-display" style={{ fontSize: 14, color: 'var(--success)', fontWeight: 600 }}>
              {fmtUSD(y3Monthly)}/mo by Year 3
            </span>
          </div>
          <StatusBadge variant="gold">6-10× cheaper than all competitors</StatusBadge>
          <StatusBadge variant="info">Travel = biggest revenue driver</StatusBadge>
        </div>
        <div className="font-body" style={{ fontSize: 13, color: 'var(--text-tertiary)', fontStyle: 'italic', lineHeight: 1.6, maxWidth: 720 }}>
          Lower fees than every competitor in every category — but higher total revenue through volume.
          Users choose Soul Wallet because it's the cheapest. More users = more transactions = more revenue.
          The DustMiles flywheel converts revenue back into user rewards → more retention → more transactions.
        </div>
      </div>

      {/* Phase summary always visible */}
      <PhaseSummaryGrid />

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 3, overflowX: 'auto', padding: 4, background: 'var(--glass-1)', borderRadius: 12, border: '1px solid var(--border-gold-0)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
            background: tab === t.id ? 'var(--gold-glass-2)' : 'transparent',
            color: tab === t.id ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: tab === t.id ? 500 : 400,
            border: `1px solid ${tab === t.id ? 'var(--border-gold-1)' : 'transparent'}`,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'projections' && <RevenueChart phase={phase} setPhase={setPhase} />}
      {tab === 'fees'        && <FeeComparisonTable />}
      {tab === 'breakdown'   && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--glass-1)', borderRadius: 10, padding: 4 }}>
            {PHASE_DATA.map(p => (
              <button key={p.phase} onClick={() => setPhase(p.phase)} style={{
                flex: 1, padding: '7px', borderRadius: 7, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: phase === p.phase ? `${p.color}12` : 'transparent',
                color: phase === p.phase ? p.color : 'var(--text-tertiary)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: phase === p.phase ? 600 : 400,
              }}>{p.label}</button>
            ))}
          </div>
          <RevenueStreamTable phase={phase} />
        </div>
      )}
      {tab === 'drivers' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ display: 'flex', gap: 4, background: 'var(--glass-1)', borderRadius: 10, padding: 4 }}>
            {PHASE_DATA.map(p => (
              <button key={p.phase} onClick={() => setPhase(p.phase)} style={{
                flex: 1, padding: '7px', borderRadius: 7, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
                background: phase === p.phase ? `${p.color}12` : 'transparent',
                color: phase === p.phase ? p.color : 'var(--text-tertiary)',
                fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: phase === p.phase ? 600 : 400,
              }}>{p.label}</button>
            ))}
          </div>
          <GrowthDrivers phase={phase} />
        </div>
      )}
    </div>
  )
}
