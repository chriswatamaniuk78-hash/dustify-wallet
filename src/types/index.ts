// ============================================================
// SOUL WALLET — Shared TypeScript Types + Utilities
// Dustify Technologies Corp
// ============================================================

// ── Enums & Literal Unions ──────────────────────────────────

export type SBTTier = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'OBSIDIAN' | 'TITANIUM'
export type KYCLevel = 'NONE' | 'EMAIL' | 'ID_VERIFIED' | 'BIOMETRIC'
export type TradingExchange = 'ALPACA' | 'COINBASE_ADVANCED' | 'OANDA'
export type TradingStrategy = 'PHANTOM_FLOW' | 'MOMENTUM' | 'MEAN_REVERSION' | 'DCA' | 'GRID' | 'BREAKOUT' | 'SWING'
export type BotStatus = 'ACTIVE' | 'PAUSED' | 'CIRCUIT_BREAKER' | 'STOPPED' | 'ERROR'
export type BookingStatus = 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED'
export type TransactionStatus = 'PENDING' | 'CONFIRMED' | 'FAILED' | 'CANCELLED'

export type TransactionType =
  | 'TRADE_BOT' | 'TRADE_STOCK' | 'TRADE_CRYPTO' | 'TRADE_FOREX'
  | 'TRAVEL_FLIGHT' | 'TRAVEL_HOTEL' | 'TRAVEL_ACTIVITY'
  | 'SBT_TRANSFER' | 'USDC_SEND' | 'USDC_RECEIVE'
  | 'POINTS_REDEMPTION' | 'GAME_PURCHASE' | 'GAME_REVENUE'
  | 'CODE_DEPLOY' | 'CONTENT_POST' | 'REFERRAL'

// ── Core Interfaces ─────────────────────────────────────────

export interface User {
  id: string
  walletAddress?: string
  sbtTokenId?: string | null
  sbtTier?: SBTTier
  name: string
  displayName?: string | null
  email: string
  avatarUrl: string | null
  kycLevel: KYCLevel
  createdAt: string
}

export interface SoulWallet {
  id: string
  userId?: string
  walletAddress: string
  sbtTokenId: string
  mintedAt: string
  usdcBalance: number
  pointsBalance: number
  rewardsTier: string
  tierUpdatedAt?: string
  isQuantumShielded: boolean
}

export interface WalletBalance {
  usdcBalance: number
  dustMilesBalance: number
  dustMilesPending: number
  dustMilesLifetime: number
  tier: SBTTier
  tierMultiplier: number
}

export interface Transaction {
  id: string
  type: string
  status: string
  amount: number
  feeAmount: number
  pointsAwarded: number
  description: string
  createdAt: string
  externalTxId?: string | null
  metadata?: Record<string, string>
}

export interface Position {
  symbol: string
  name: string
  assetClass: 'STOCK' | 'CRYPTO' | 'ETF' | 'FOREX'
  quantity: number
  avgCostBasis: number
  currentPrice: number
  currentValue: number
  unrealizedPnl: number
  unrealizedPnlPct: number
  dayChangePct: number
}

export interface TradingBot {
  id: string
  name: string
  exchange: TradingExchange
  strategy: TradingStrategy
  status: BotStatus
  paperMode: boolean
  symbols: string[]
  currentPnl: number
  totalTrades: number
  winRate: number
  createdAt: string
}

export interface TradingBotConfig {
  isActive: boolean
  riskTolerance: 'CONSERVATIVE' | 'MODERATE' | 'AGGRESSIVE'
  maxPositionSizePct: number
  maxDailyLossPct: number
  assetClasses: string[]
  tradingHours: string
  taxLossHarvestingEnabled: boolean
  optionsEnabled: boolean
}

export interface TravelBooking {
  id: string
  type: 'FLIGHT' | 'HOTEL' | 'CAR' | 'ACTIVITY'
  status: BookingStatus | 'UPCOMING'
  confirmationCode: string
  totalAmount?: number
  totalPrice?: number
  dustMilesEarned?: number
  pointsEarned?: number
  destination: string
  origin?: string
  departureDate?: string
  returnDate?: string
  checkIn?: string
  checkOut?: string
  createdAt?: string
}

export interface Tournament {
  id: string
  gameName: string
  title: string
  status: 'UPCOMING' | 'LIVE' | 'COMPLETED'
  prizePool: number
  entryFee: number
  currentPlayers: number
  maxPlayers: number
  startTime: string
}

export interface Notification {
  id: string
  type: string
  title: string
  body: string
  read: boolean
  urgent: boolean
  actionUrl?: string
  createdAt: string
}

export interface NavItem {
  id: string
  label: string
  href: string
}

export interface APIResponse<T> {
  data: T | null
  error: string | null
}

// ── Utility Functions ───────────────────────────────────────

export function formatUSDC(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPoints(points: number): string {
  return new Intl.NumberFormat('en-US').format(Math.floor(points))
}

export function formatWalletAddress(address: string): string {
  if (!address || address.length <= 10) return address ?? ''
  return `${address.slice(0, 6)}\u2026${address.slice(-4)}`
}

// ── Tier System ─────────────────────────────────────────────

export interface TierConfig {
  label: string
  color: string
  threshold: number
}

export const TIER_CONFIGS: Record<string, TierConfig> = {
  PIONEER:  { label: 'Pioneer',  color: '#60a5fa', threshold: 0 },
  BRONZE:   { label: 'Bronze',   color: '#CD7F32', threshold: 5_000 },
  SILVER:   { label: 'Silver',   color: '#C0C0C0', threshold: 10_000 },
  GOLD:     { label: 'Gold',     color: '#D4AF37', threshold: 50_000 },
  SURGE:    { label: 'Surge',    color: '#EF9F27', threshold: 100_000 },
  PLATINUM: { label: 'Platinum', color: '#E5E4E2', threshold: 250_000 },
  OBSIDIAN: { label: 'Obsidian', color: '#1a1a2e', threshold: 500_000 },
  TITANIUM: { label: 'Titanium', color: '#878681', threshold: 1_000_000 },
}

const TIER_ORDER = Object.values(TIER_CONFIGS)

export function getTierConfig(tier: string): TierConfig {
  return TIER_CONFIGS[tier] ?? TIER_CONFIGS.PIONEER
}

export function getTierProgress(points: number): number {
  const current = TIER_ORDER.filter(t => points >= t.threshold).pop() ?? TIER_ORDER[0]
  const next = TIER_ORDER.find(t => t.threshold > points)
  if (!next) return 100
  const range = next.threshold - current.threshold
  if (range <= 0) return 100
  return Math.min(100, ((points - current.threshold) / range) * 100)
}

export function getPointsToNextTier(points: number): number {
  const next = TIER_ORDER.find(t => t.threshold > points)
  return next ? next.threshold - points : 0
}
