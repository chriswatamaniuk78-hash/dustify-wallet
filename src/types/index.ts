// ============================================================
// SOUL WALLET — Core TypeScript Types
// ============================================================

// ── User & Identity ──────────────────────────────────────────

export type KycLevel =
  | 'NONE'
  | 'EMAIL_VERIFIED'
  | 'PHONE_VERIFIED'
  | 'ID_VERIFIED'
  | 'FULL_ACCREDITED'

export type RewardsTier =
  | 'SPARK'
  | 'FLOW'
  | 'CURRENT'
  | 'SURGE'
  | 'TSUNAMI'

export interface User {
  id: string
  name: string
  email: string
  avatarUrl: string | null
  kycLevel: KycLevel
  createdAt: string
}

export interface SoulWallet {
  id: string
  userId: string
  walletAddress: string
  sbtTokenId: string | null
  mintedAt: string | null
  usdcBalance: number
  pointsBalance: number
  rewardsTier: RewardsTier
  tierUpdatedAt: string
  isQuantumShielded: boolean
}

export interface SbtIdentity {
  walletAddress: string
  tokenId: string
  didDocument: Record<string, unknown>
  isVerified: boolean
  mintedAt: string
}

// ── Rewards ──────────────────────────────────────────────────

export interface TierConfig {
  tier: RewardsTier
  label: string
  minPoints: number
  maxPoints: number | null
  multiplier: number
  color: string
}

export const TIER_CONFIGS: TierConfig[] = [
  { tier: 'SPARK',   label: 'Spark',   minPoints: 0,      maxPoints: 999,   multiplier: 1.0, color: '#888780' },
  { tier: 'FLOW',    label: 'Flow',    minPoints: 1000,   maxPoints: 4999,  multiplier: 1.5, color: '#378ADD' },
  { tier: 'CURRENT', label: 'Current', minPoints: 5000,   maxPoints: 14999, multiplier: 2.0, color: '#1D9E75' },
  { tier: 'SURGE',   label: 'Surge',   minPoints: 15000,  maxPoints: 49999, multiplier: 3.0, color: '#EF9F27' },
  { tier: 'TSUNAMI', label: 'Tsunami', minPoints: 50000,  maxPoints: null,  multiplier: 5.0, color: '#D4AF37' },
]

export type PointsAction =
  | 'TRADE_EXECUTED'
  | 'TRAVEL_BOOKED'
  | 'GAME_PLAYED'
  | 'GAME_DEPLOYED'
  | 'CONTENT_POSTED'
  | 'CODE_DEPLOYED'
  | 'SBT_TRANSFERRED'
  | 'REFERRAL_BONUS'
  | 'STREAK_BONUS'
  | 'CHALLENGE_COMPLETED'

// ── Transactions ─────────────────────────────────────────────

export type TransactionType =
  | 'TRADE_STOCK'
  | 'TRADE_CRYPTO'
  | 'TRADE_FOREX'
  | 'TRADE_BOT'
  | 'TRAVEL_FLIGHT'
  | 'TRAVEL_HOTEL'
  | 'TRAVEL_ACTIVITY'
  | 'SBT_TRANSFER'
  | 'USDC_SEND'
  | 'USDC_RECEIVE'
  | 'POINTS_REDEMPTION'
  | 'GAME_PURCHASE'
  | 'GAME_REVENUE'
  | 'CODE_DEPLOY'
  | 'CONTENT_POST'
  | 'REFERRAL'

export type TransactionStatus = 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'

export interface Transaction {
  id: string
  type: TransactionType
  status: TransactionStatus
  amount: number        // USDC
  feeAmount: number     // Fee captured
  pointsAwarded: number
  description: string
  createdAt: string
  externalTxId: string | null
  metadata: Record<string, unknown> | null
}

// ── Trading ──────────────────────────────────────────────────

export type AssetClass = 'STOCK' | 'CRYPTO' | 'FOREX' | 'ETF' | 'OPTIONS'

export interface Position {
  symbol: string
  name: string
  assetClass: AssetClass
  quantity: number
  avgCostBasis: number
  currentPrice: number
  currentValue: number
  unrealizedPnl: number
  unrealizedPnlPct: number
  dayChangePct: number
}

export interface TradingBotConfig {
  isActive: boolean
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'
  maxPositionSizePct: number   // % of portfolio per position
  maxDailyLossPct: number      // Stop bot if daily loss exceeds this
  assetClasses: AssetClass[]
  tradingHours: 'MARKET_HOURS' | 'EXTENDED' | 'CRYPTO_24_7'
  taxLossHarvestingEnabled: boolean
  optionsEnabled: boolean
}

// ── Travel ───────────────────────────────────────────────────

export interface TravelBooking {
  id: string
  type: 'FLIGHT' | 'HOTEL' | 'ACTIVITY' | 'CAR'
  destination: string
  departureDate: string
  returnDate: string | null
  totalPrice: number
  pointsEarned: number
  status: 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
  confirmationCode: string
}

// ── Navigation ───────────────────────────────────────────────

export type NavSection =
  | 'dashboard'
  | 'trade'
  | 'travel'
  | 'gaming'
  | 'vault'

export interface NavItem {
  id: NavSection
  label: string
  href: string
}

// ── API Response wrapper ─────────────────────────────────────

export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

// ── Formatting helpers ───────────────────────────────────────

export function formatUSDC(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPoints(points: number): string {
  if (points >= 1_000_000) return `${(points / 1_000_000).toFixed(1)}M`
  if (points >= 1_000) return `${(points / 1_000).toFixed(1)}k`
  return points.toLocaleString()
}

export function formatWalletAddress(address: string): string {
  if (address.length < 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

export function getTierConfig(tier: RewardsTier): TierConfig {
  return TIER_CONFIGS.find(t => t.tier === tier) ?? TIER_CONFIGS[0]
}

export function getPointsToNextTier(
  currentPoints: number,
  currentTier: RewardsTier
): number | null {
  const currentConfig = getTierConfig(currentTier)
  if (currentConfig.maxPoints === null) return null
  return currentConfig.maxPoints - currentPoints + 1
}

export function getTierProgress(
  currentPoints: number,
  currentTier: RewardsTier
): number {
  const config = getTierConfig(currentTier)
  if (config.maxPoints === null) return 100
  const range = config.maxPoints - config.minPoints
  const progress = currentPoints - config.minPoints
  return Math.min(100, Math.round((progress / range) * 100))
}
