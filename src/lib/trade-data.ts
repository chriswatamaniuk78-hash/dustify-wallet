// ============================================================
// DUST TRADE — Types & Mock Data
// ============================================================

export type AssetClass = 'STOCK' | 'CRYPTO' | 'FOREX' | 'OPTIONS' | 'ETF'
export type PositionSide = 'LONG' | 'SHORT'
export type OrderStatus = 'FILLED' | 'PENDING' | 'CANCELLED' | 'PARTIAL'
export type OptionsStrategy = 'COVERED_CALL' | 'IRON_CONDOR' | 'STRADDLE' | 'PROTECTIVE_PUT' | 'CASH_SECURED_PUT'
export type BotStatus = 'ACTIVE' | 'PAUSED' | 'CIRCUIT_BREAKER'

export interface Position {
  id: string
  symbol: string
  name: string
  assetClass: AssetClass
  side: PositionSide
  quantity: number
  avgCost: number
  currentPrice: number
  marketValue: number
  unrealizedPnL: number
  unrealizedPnLPct: number
  dayChange: number
  dayChangePct: number
  allocation: number      // % of portfolio
  logoColor: string       // placeholder color
}

export interface Trade {
  id: string
  symbol: string
  assetClass: AssetClass
  side: 'BUY' | 'SELL'
  quantity: number
  price: number
  total: number
  status: OrderStatus
  executedAt: string
  initiatedBy: 'BOT' | 'HUMAN'
  dustFee: number         // 0.10% captured silently
  strategy?: string
  pointsEarned: number
}

export interface BotConfig {
  status: BotStatus
  riskLevel: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'
  maxPositionSize: number   // % of portfolio
  dailyLossLimit: number    // % of portfolio
  tradesToday: number
  dailyPnL: number
  dailyPnLPct: number
  totalTrades: number
  winRate: number
  avgReturn: number
  activeStrategies: string[]
}

export interface OptionsPosition {
  id: string
  symbol: string
  strategy: OptionsStrategy
  legs: OptionsLeg[]
  maxProfit: number
  maxLoss: number
  breakeven: number[]
  daysToExpiry: number
  currentValue: number
  costBasis: number
  unrealizedPnL: number
  greeks: { delta: number; theta: number; vega: number; gamma: number }
}

export interface OptionsLeg {
  type: 'CALL' | 'PUT'
  action: 'BUY' | 'SELL'
  strike: number
  expiry: string
  premium: number
  contracts: number
}

export interface TaxLossItem {
  symbol: string
  assetClass: AssetClass
  unrealizedLoss: number
  harvestSaving: number     // estimated tax saving
  washSaleRisk: boolean
  suggestion: string
}

export interface MarketOverview {
  symbol: string
  name: string
  price: number
  change: number
  changePct: number
  assetClass: AssetClass
  logoColor: string
}

// ── Formatting ─────────────────────────────────────────────────

export function formatPrice(n: number, decimals = 2): string {
  return `$${n.toLocaleString('en-CA', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}`
}

export function formatPnL(n: number): string {
  const sign = n >= 0 ? '+' : ''
  return `${sign}$${Math.abs(n).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
}

export function formatPct(n: number): string {
  const sign = n >= 0 ? '+' : ''
  return `${sign}${n.toFixed(2)}%`
}

export function pnlColor(n: number): string {
  return n >= 0 ? 'var(--success)' : 'var(--danger)'
}

export function strategyLabel(s: OptionsStrategy): string {
  const map: Record<OptionsStrategy, string> = {
    COVERED_CALL: 'Covered call',
    IRON_CONDOR: 'Iron condor',
    STRADDLE: 'Straddle',
    PROTECTIVE_PUT: 'Protective put',
    CASH_SECURED_PUT: 'Cash-secured put',
  }
  return map[s]
}

// ── Mock data ─────────────────────────────────────────────────

export const MOCK_PORTFOLIO_STATS = {
  totalValue: 184_320.47,
  totalCost: 151_200.00,
  totalPnL: 33_120.47,
  totalPnLPct: 21.90,
  dayPnL: 1_847.32,
  dayPnLPct: 1.01,
  cashBalance: 18_420.00,
  investedValue: 165_900.47,
  dustFeesTotal: 184.32,    // 0.10% of volume — invisible to user in normal flow
  pointsEarned: 184_320,
}

export const MOCK_POSITIONS: Position[] = [
  { id: 'p1', symbol: 'NVDA', name: 'NVIDIA Corp', assetClass: 'STOCK', side: 'LONG', quantity: 45, avgCost: 487.20, currentPrice: 891.44, marketValue: 40_114.80, unrealizedPnL: 18_189.60, unrealizedPnLPct: 82.9, dayChange: 847.25, dayChangePct: 2.16, allocation: 24.2, logoColor: '#76B900' },
  { id: 'p2', symbol: 'BTC', name: 'Bitcoin', assetClass: 'CRYPTO', side: 'LONG', quantity: 0.842, avgCost: 51_200.00, currentPrice: 94_847.20, marketValue: 79_841.34, unrealizedPnL: 36_641.34, unrealizedPnLPct: 85.1, dayChange: 1_294.81, dayChangePct: 1.65, allocation: 48.1, logoColor: '#F7931A' },
  { id: 'p3', symbol: 'AAPL', name: 'Apple Inc', assetClass: 'STOCK', side: 'LONG', quantity: 60, avgCost: 172.40, currentPrice: 201.87, marketValue: 12_112.20, unrealizedPnL: 1_768.20, unrealizedPnLPct: 17.1, dayChange: -214.40, dayChangePct: -1.74, allocation: 7.3, logoColor: '#555' },
  { id: 'p4', symbol: 'ETH', name: 'Ethereum', assetClass: 'CRYPTO', side: 'LONG', quantity: 8.4, avgCost: 2_840.00, currentPrice: 3_487.20, marketValue: 29_293.08, unrealizedPnL: 5_436.48, unrealizedPnLPct: 22.8, dayChange: 412.44, dayChangePct: 1.43, allocation: 17.7, logoColor: '#627EEA' },
  { id: 'p5', symbol: 'MSFT', name: 'Microsoft', assetClass: 'STOCK', side: 'LONG', quantity: 14, avgCost: 389.10, currentPrice: 414.72, marketValue: 5_806.08, unrealizedPnL: 358.68, unrealizedPnLPct: 6.6, dayChange: -98.42, dayChangePct: -1.67, allocation: 3.5, logoColor: '#00A4EF' },
]

export const MOCK_BOT_CONFIG: BotConfig = {
  status: 'ACTIVE',
  riskLevel: 'MODERATE',
  maxPositionSize: 5,
  dailyLossLimit: 3,
  tradesToday: 12,
  dailyPnL: 847.32,
  dailyPnLPct: 0.46,
  totalTrades: 1_847,
  winRate: 68.4,
  avgReturn: 0.31,
  activeStrategies: ['Momentum scalping', 'Mean reversion', 'Options premium harvesting'],
}

export const MOCK_RECENT_TRADES: Trade[] = [
  { id: 't1', symbol: 'NVDA', assetClass: 'STOCK', side: 'BUY', quantity: 5, price: 887.20, total: 4_436.00, status: 'FILLED', executedAt: '2026-03-30T14:32:11Z', initiatedBy: 'BOT', dustFee: 4.44, strategy: 'Momentum', pointsEarned: 4436 },
  { id: 't2', symbol: 'BTC', assetClass: 'CRYPTO', side: 'SELL', quantity: 0.05, price: 95_120.00, total: 4_756.00, status: 'FILLED', executedAt: '2026-03-30T13:18:44Z', initiatedBy: 'BOT', dustFee: 4.76, strategy: 'Mean reversion', pointsEarned: 4756 },
  { id: 't3', symbol: 'AAPL', assetClass: 'STOCK', side: 'BUY', quantity: 10, price: 199.40, total: 1_994.00, status: 'FILLED', executedAt: '2026-03-30T11:05:22Z', initiatedBy: 'HUMAN', dustFee: 1.99, strategy: undefined, pointsEarned: 1994 },
  { id: 't4', symbol: 'ETH', assetClass: 'CRYPTO', side: 'BUY', quantity: 1.2, price: 3_421.00, total: 4_105.20, status: 'FILLED', executedAt: '2026-03-30T09:47:01Z', initiatedBy: 'BOT', dustFee: 4.11, strategy: 'Momentum', pointsEarned: 4105 },
  { id: 't5', symbol: 'EUR/USD', assetClass: 'FOREX', side: 'BUY', quantity: 10000, price: 1.0847, total: 10_847.00, status: 'FILLED', executedAt: '2026-03-30T08:12:30Z', initiatedBy: 'BOT', dustFee: 10.85, strategy: 'Trend following', pointsEarned: 10847 },
  { id: 't6', symbol: 'TSLA', assetClass: 'STOCK', side: 'SELL', quantity: 8, price: 174.20, total: 1_393.60, status: 'CANCELLED', executedAt: '2026-03-30T07:55:18Z', initiatedBy: 'BOT', dustFee: 0, strategy: 'Stop loss', pointsEarned: 0 },
]

export const MOCK_OPTIONS_POSITIONS: OptionsPosition[] = [
  {
    id: 'op1',
    symbol: 'NVDA',
    strategy: 'COVERED_CALL',
    legs: [
      { type: 'CALL', action: 'SELL', strike: 920, expiry: 'Apr 18', premium: 12.40, contracts: 4 },
    ],
    maxProfit: 4_960,
    maxLoss: -Infinity,
    breakeven: [474.80],
    daysToExpiry: 19,
    currentValue: 8_960,
    costBasis: 6_200,
    unrealizedPnL: 2_760,
    greeks: { delta: -0.28, theta: 18.40, vega: -42.10, gamma: -0.008 },
  },
  {
    id: 'op2',
    symbol: 'SPY',
    strategy: 'IRON_CONDOR',
    legs: [
      { type: 'PUT', action: 'BUY', strike: 480, expiry: 'Apr 18', premium: 2.10, contracts: 2 },
      { type: 'PUT', action: 'SELL', strike: 490, expiry: 'Apr 18', premium: 4.80, contracts: 2 },
      { type: 'CALL', action: 'SELL', strike: 540, expiry: 'Apr 18', premium: 4.20, contracts: 2 },
      { type: 'CALL', action: 'BUY', strike: 550, expiry: 'Apr 18', premium: 1.90, contracts: 2 },
    ],
    maxProfit: 2_000,
    maxLoss: -1_000,
    breakeven: [485.00, 545.00],
    daysToExpiry: 19,
    currentValue: 1_240,
    costBasis: 1_000,
    unrealizedPnL: 240,
    greeks: { delta: 0.04, theta: 12.80, vega: -28.40, gamma: -0.003 },
  },
]

export const MOCK_TAX_LOSS_ITEMS: TaxLossItem[] = [
  { symbol: 'TSLA', assetClass: 'STOCK', unrealizedLoss: -4_120.00, harvestSaving: 1_030.00, washSaleRisk: false, suggestion: 'Sell TSLA, buy RIVN as substitute. Captures $1,030 tax saving with similar EV exposure.' },
  { symbol: 'META', assetClass: 'STOCK', unrealizedLoss: -1_847.00, harvestSaving: 461.75, washSaleRisk: true, suggestion: 'Wash sale risk — you bought META 18 days ago. Wait 12 more days before harvesting.' },
  { symbol: 'SOL', assetClass: 'CRYPTO', unrealizedLoss: -2_341.00, harvestSaving: 585.25, washSaleRisk: false, suggestion: 'Crypto wash sale rules don\'t apply in Canada. Harvest freely, rebuy same day.' },
]

export const MOCK_MARKET_OVERVIEW: MarketOverview[] = [
  { symbol: 'BTC', name: 'Bitcoin', price: 94_847, change: 1_547, changePct: 1.65, assetClass: 'CRYPTO', logoColor: '#F7931A' },
  { symbol: 'ETH', name: 'Ethereum', price: 3_487, change: 48.20, changePct: 1.40, assetClass: 'CRYPTO', logoColor: '#627EEA' },
  { symbol: 'SPY', name: 'S&P 500 ETF', price: 514.82, change: -2.14, changePct: -0.41, assetClass: 'ETF', logoColor: '#1D9E75' },
  { symbol: 'NVDA', name: 'NVIDIA', price: 891.44, change: 18.72, changePct: 2.14, assetClass: 'STOCK', logoColor: '#76B900' },
  { symbol: 'EUR/USD', name: 'Euro / USD', price: 1.0847, change: 0.0012, changePct: 0.11, assetClass: 'FOREX', logoColor: '#378ADD' },
  { symbol: 'AAPL', name: 'Apple', price: 201.87, change: -3.62, changePct: -1.76, assetClass: 'STOCK', logoColor: '#555' },
]
