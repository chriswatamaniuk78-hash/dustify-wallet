// ============================================================
// DUSTMILES REWARDS WATERFALL — Data Layer & Types
// ============================================================
// Research Synthesis:
//   → Airlines sell miles to banks at 1.25-2¢/mile (Delta: $8.2B/yr from AmEx)
//   → 70%+ of travel/hospitality points go UNREDEEMED (breakage funding model)
//   → 54% of loyalty memberships are INACTIVE
//   → Fixed-value systems (100 pts = $1) are most trusted + transparent
//   → Blockchain tokens create secondary market demand & appreciation
//   → IFRS 15 / ASC 606: points = deferred revenue (contract liability)
//   → Canada FINTRAC: MSB registration required, AML/KYC, Travel Rule
//   → Breakage rate industry avg: 31-33% (industry relies on this)
//
// DUSTMILES INNOVATION — Why it NEVER runs dry:
//   ① Funded from PLATFORM REVENUE (trades, travel, gaming) — NOT breakage
//   ② 30% of all revenue → Reserve Pool (USDC locked on-chain)
//   ③ Reserve Pool earns DeFi yield (additional passive income)
//   ④ Smart contract prevents Dustify from touching Reserve until 2× threshold
//   ⑤ Dustify takes ONLY 1% of gross revenue — ONCE per year
//   ⑥ 60% of all revenue → active distribution to users
//   ⑦ 9% → growth pool (new features, partner deals, exchange listings)
//
// VERSUS COMPETING SYSTEMS:
//   → Aeroplan: 1.5 pts/$1 = ~1.5% return; complex rules; blackout dates
//   → Scene+: 5 pts/$1 at partners = ~1% return; Scotiabank-only
//   → Starbucks: 1 star/$1, 1 drink/50 = ~10% BUT only at Starbucks
//   → Air Miles: ~1.1% return; complex; expiry; 2 currencies
//   → DustMiles: 2.5-25% return; fixed 100=1 USDC; instant; no expiry
// ============================================================

export type PoolStatus = 'HEALTHY' | 'BUILDING' | 'CRITICAL' | 'OVERFLOW'
export type TierLevel = 'BRONZE' | 'SILVER' | 'GOLD' | 'PLATINUM' | 'OBSIDIAN' | 'TITANIUM'
export type EarnCategory = 'TRADING' | 'TRAVEL' | 'GAMING' | 'SHOPPING' | 'REFERRAL' | 'SOCIAL' | 'STAKING' | 'STREAK'
export type RedemptionType = 'USDC_DIRECT' | 'TRAVEL_CREDIT' | 'GAMING_CREDITS' | 'PARTNER_VOUCHER' | 'CHARITY' | 'REINVEST'

// ── Waterfall Pool ────────────────────────────────────────────
export interface WaterfallPool {
  // Reserve Pool — never touched except emergency
  reserveBalance: number       // USDC locked on-chain
  reserveTarget: number        // 6-month earn liability target
  reserveHealthPct: number     // % of target achieved
  reserveYieldAPY: number      // DeFi yield earning on reserve
  reserveStatus: PoolStatus

  // Earn Pool — distributed to users
  earnBalance: number          // USDC available for redemptions
  earnMonthlyInflow: number    // Monthly revenue flowing in
  earnMonthlyOutflow: number   // Monthly redemptions going out
  earnSurplusDeficit: number   // Positive = building, negative = drawing

  // Growth Pool — platform reinvestment
  growthBalance: number
  growthAllocated: number      // Committed to ongoing projects

  // Dustify Profit — 1% yearly only
  profitAccrued: number        // Accrued since last annual withdrawal
  profitLastWithdrawal: number // Last annual withdrawal amount
  profitWithdrawalDate: string // Date of next annual withdrawal
  yearToDateRevenue: number    // Gross platform revenue YTD
}

// ── Revenue Stream ────────────────────────────────────────────
export interface RevenueStream {
  id: string
  name: string
  icon: string
  description: string
  grossMonthly: number      // $ generated per month
  dustifyFee: number        // % Dustify keeps (small)
  poolContribution: number  // % flowing to DustMiles pool
  poolMonthly: number       // $ flowing to pool per month
  dmIssuedMonthly: number   // DM issued per month (pool$ × 100)
  color: string
  trend: 'UP' | 'DOWN' | 'STABLE'
  trendPct: number
}

// ── Tier System ───────────────────────────────────────────────
export interface DustMilesTier {
  level: TierLevel
  name: string
  color: string
  glowColor: string
  minPoints: number         // Points needed to enter tier
  earnMultiplier: number    // Base earn rate multiplier
  maxRedeemPerMonth: number // Max USDC redemption per month
  features: string[]
  icon: string
  exclusive: string[]       // Exclusive benefits
}

// ── Earn Activity ─────────────────────────────────────────────
export interface EarnActivity {
  id: string
  category: EarnCategory
  action: string
  description: string
  baseRate: number          // Base DM per unit
  unit: string              // 'per trade', 'per $100 booked', etc.
  multipliers: {
    tierMultiplier: number
    streakMultiplier: number
    partnerMultiplier: number
    totalMultiplier: number
  }
  effectiveRate: number     // Base × all multipliers
  monthlyEarned: number     // User's MTD earnings from this
  estimatedUSDC: number     // USDC equivalent
  icon: string
  color: string
  isBonus: boolean
  bonusExpiry?: string
}

// ── Redemption Option ─────────────────────────────────────────
export interface RedemptionOption {
  id: string
  type: RedemptionType
  title: string
  description: string
  minPoints: number
  rate: number              // DM per unit of value
  valuePerPoint: number     // USDC value per DM (always 0.01)
  maxPerMonth?: number      // Monthly cap
  instantSettlement: boolean
  partner?: string
  partnerLogo?: string
  icon: string
  color: string
  popular: boolean
  comparisonNote: string    // "vs Aeroplan: 0.8¢ per point"
}

// ── Partner ───────────────────────────────────────────────────
export interface RewardsPartner {
  id: string
  name: string
  category: string
  earnRate: number          // DM per $1 spent
  effectiveReturn: number   // % cashback equivalent
  description: string
  icon: string
  color: string
  isExclusive: boolean
  isNew: boolean
}

// ── Compliance Item ───────────────────────────────────────────
export interface ComplianceItem {
  regulation: string
  jurisdiction: string
  status: 'COMPLIANT' | 'PENDING' | 'MONITORING'
  description: string
  lastAudit: string
  nextReview: string
  icon: string
}

// ── Mock Data ─────────────────────────────────────────────────

export const WATERFALL_POOL: WaterfallPool = {
  reserveBalance: 2_847_420,
  reserveTarget: 3_200_000,
  reserveHealthPct: 88.98,
  reserveYieldAPY: 4.82,
  reserveStatus: 'BUILDING',
  earnBalance: 412_844,
  earnMonthlyInflow: 284_720,
  earnMonthlyOutflow: 198_450,
  earnSurplusDeficit: 86_270,
  growthBalance: 142_300,
  growthAllocated: 89_200,
  profitAccrued: 148_240,
  profitLastWithdrawal: 131_200,
  profitWithdrawalDate: 'Jan 1 2027',
  yearToDateRevenue: 14_824_000,
}

export const REVENUE_STREAMS: RevenueStream[] = [
  { id: 'r1', name: 'Trading Fees',        icon: '◆', description: '0.10% fee on every executed trade across Alpaca, Coinbase, OANDA', grossMonthly: 89_200,  dustifyFee: 0.09, poolContribution: 0.70, poolMonthly: 62_440,  dmIssuedMonthly: 6_244_000, color: '#4ade80', trend: 'UP',     trendPct: 12.4 },
  { id: 'r2', name: 'Travel Commissions',  icon: '✈',  description: '2.5% booking fee on flights, hotels, activities (vs 15-18% Expedia)',grossMonthly: 67_800, dustifyFee: 0.15, poolContribution: 0.50, poolMonthly: 33_900, dmIssuedMonthly: 3_390_000, color: '#60a5fa', trend: 'UP',     trendPct: 8.7  },
  { id: 'r3', name: 'Gaming Revenue',      icon: '◎',  description: '5% rake on tournament prize pools; DM boost on daily challenges',   grossMonthly: 42_100, dustifyFee: 0.10, poolContribution: 0.60, poolMonthly: 25_260, dmIssuedMonthly: 2_526_000, color: '#f472b6', trend: 'UP',     trendPct: 21.3 },
  { id: 'r4', name: 'Partner Interchange', icon: '⇄',  description: '1.5% on all purchases at partner merchants via Soul Wallet',         grossMonthly: 38_400, dustifyFee: 0.20, poolContribution: 0.60, poolMonthly: 23_040, dmIssuedMonthly: 2_304_000, color: '#D4AF37', trend: 'STABLE', trendPct: 2.1  },
  { id: 'r5', name: 'DeFi Yield',          icon: '⬡',  description: 'Reserve Pool assets deployed in USDC yield farming (Aave, Compound)', grossMonthly: 11_420, dustifyFee: 0.00, poolContribution: 1.00, poolMonthly: 11_420, dmIssuedMonthly: 1_142_000, color: '#a78bfa', trend: 'UP',     trendPct: 4.2  },
  { id: 'r6', name: 'Referral Network',    icon: '◈',  description: '40% of Dustify\'s commission when users introduce new partners',     grossMonthly: 18_200, dustifyFee: 0.00, poolContribution: 0.40, poolMonthly: 7_280,  dmIssuedMonthly: 728_000,  color: '#fbbf24', trend: 'UP',     trendPct: 34.8 },
  { id: 'r7', name: 'Vault Storage Fees',  icon: '🔒', description: 'Premium encrypted vault storage beyond free tier (optional)',         grossMonthly: 8_400,  dustifyFee: 0.30, poolContribution: 0.50, poolMonthly: 4_200,  dmIssuedMonthly: 420_000,  color: '#f87171', trend: 'UP',     trendPct: 6.1  },
]

export const TIER_SYSTEM: DustMilesTier[] = [
  { level: 'BRONZE',   name: 'Bronze',   color: '#CD7F32', glowColor: '#8B4513', minPoints: 0,         earnMultiplier: 1.0,  maxRedeemPerMonth: 100,   icon: '⬡', features: ['100 DM = 1 USDC','Monthly redemption','Basic earn rates'],                                      exclusive: [] },
  { level: 'SILVER',   name: 'Silver',   color: '#C0C0C0', glowColor: '#808080', minPoints: 10_000,    earnMultiplier: 1.25, maxRedeemPerMonth: 500,   icon: '◆', features: ['1.25× earn rate','Priority support','Silver partner perks'],                                  exclusive: ['Silver badge on SBT','Early access to new games'] },
  { level: 'GOLD',     name: 'Gold',     color: '#D4AF37', glowColor: '#9A7428', minPoints: 50_000,    earnMultiplier: 1.5,  maxRedeemPerMonth: 2000,  icon: '◎', features: ['1.5× earn rate','Gold partner perks','Bonus trading DM','Priority flights'],                 exclusive: ['Gold animated badge','Bot strategy early access','Travel VIP desk'] },
  { level: 'PLATINUM', name: 'Platinum', color: '#E5E4E2', glowColor: '#A0A0A0', minPoints: 200_000,   earnMultiplier: 2.0,  maxRedeemPerMonth: 10000, icon: '◈', features: ['2× earn rate','Platinum concierge','Zero trading fees rebated','VIP gaming tournaments'],   exclusive: ['Platinum SBT skin','Private Discord group','Quarterly bonus DM drops'] },
  { level: 'OBSIDIAN', name: 'Obsidian', color: '#1a1a2e', glowColor: '#7F77DD', minPoints: 1_000_000, earnMultiplier: 3.0,  maxRedeemPerMonth: 50000, icon: '◉', features: ['3× earn rate','White-glove service','Max monthly redemption $500','Partner board access'],  exclusive: ['Obsidian animated SBT','Revenue share on referrals','Dustify advisory input'] },
  { level: 'TITANIUM', name: 'Titanium', color: '#E8EAEB', glowColor: '#ff6b9d', minPoints: 5_000_000, earnMultiplier: 5.0,  maxRedeemPerMonth: 250000,icon: '✦', features: ['5× earn rate','No monthly redemption cap','Dustify equity discussions','VIP all-access'],    exclusive: ['Titanium genesis SBT','1% referral revenue forever','Named on partner network'] },
]

export const EARN_ACTIVITIES: EarnActivity[] = [
  { id: 'e1', category: 'TRADING',  action: 'Execute a trade',         description: 'Every filled order earns DM regardless of outcome',    baseRate: 15,  unit: 'per trade',      multipliers: { tierMultiplier: 1.5, streakMultiplier: 1.2, partnerMultiplier: 1.0, totalMultiplier: 1.8 }, effectiveRate: 27,  monthlyEarned: 4_320, estimatedUSDC: 43.20, icon: '◆', color: '#4ade80', isBonus: false },
  { id: 'e2', category: 'TRADING',  action: 'Phantom Flow™ signal win','description': 'Bonus DM when Phantom Flow trade closes profitable',  baseRate: 50,  unit: 'per winning trade',multipliers: { tierMultiplier: 1.5, streakMultiplier: 1.2, partnerMultiplier: 1.0, totalMultiplier: 1.8 }, effectiveRate: 90,  monthlyEarned: 3_240, estimatedUSDC: 32.40, icon: '⚡', color: '#D4AF37', isBonus: true, bonusExpiry: 'Ongoing' },
  { id: 'e3', category: 'TRAVEL',   action: 'Book a flight',           description: '250 DM per $100 booked = 2.5% cashback in USDC',        baseRate: 250, unit: 'per $100 booked', multipliers: { tierMultiplier: 1.5, streakMultiplier: 1.0, partnerMultiplier: 1.2, totalMultiplier: 1.8 }, effectiveRate: 450, monthlyEarned: 2_700, estimatedUSDC: 27.00, icon: '✈', color: '#60a5fa', isBonus: false },
  { id: 'e4', category: 'TRAVEL',   action: 'Book a hotel',            description: '200 DM per $100 booked via Soul Wallet',                baseRate: 200, unit: 'per $100 booked', multipliers: { tierMultiplier: 1.5, streakMultiplier: 1.0, partnerMultiplier: 1.0, totalMultiplier: 1.5 }, effectiveRate: 300, monthlyEarned: 900,   estimatedUSDC: 9.00,  icon: '🏨', color: '#60a5fa', isBonus: false },
  { id: 'e5', category: 'GAMING',   action: 'Complete daily challenge', description: 'Free daily skill challenges earn DM automatically',    baseRate: 100, unit: 'per challenge',  multipliers: { tierMultiplier: 1.5, streakMultiplier: 2.0, partnerMultiplier: 1.0, totalMultiplier: 3.0 }, effectiveRate: 300, monthlyEarned: 9_000, estimatedUSDC: 90.00, icon: '⚡', color: '#f472b6', isBonus: false },
  { id: 'e6', category: 'GAMING',   action: 'Win a tournament',        description: 'Bonus DM on all USDC prize tournament wins',            baseRate: 500, unit: 'per tournament win',multipliers: { tierMultiplier: 1.5, streakMultiplier: 1.0, partnerMultiplier: 1.0, totalMultiplier: 1.5 }, effectiveRate: 750, monthlyEarned: 1_500, estimatedUSDC: 15.00, icon: '🏆', color: '#f472b6', isBonus: true, bonusExpiry: 'Ongoing' },
  { id: 'e7', category: 'REFERRAL', action: 'Refer a new user',        description: '10,000 DM when referred user reaches Bronze + first trade',baseRate: 10000,unit: 'per qualified referral',multipliers: { tierMultiplier: 1.0, streakMultiplier: 1.0, partnerMultiplier: 1.0, totalMultiplier: 1.0 }, effectiveRate: 10000,monthlyEarned: 20_000,estimatedUSDC: 200.00,icon: '◈', color: '#fbbf24', isBonus: true, bonusExpiry: 'No expiry' },
  { id: 'e8', category: 'STAKING',  action: 'DustMiles staking bonus', description: 'Stake DM for 30+ days to earn 8% APY in additional DM', baseRate: 8,   unit: '% APY on staked DM',multipliers: { tierMultiplier: 1.5, streakMultiplier: 1.0, partnerMultiplier: 1.0, totalMultiplier: 1.5 }, effectiveRate: 12,  monthlyEarned: 2_400, estimatedUSDC: 24.00, icon: '⬡', color: '#a78bfa', isBonus: false },
  { id: 'e9', category: 'STREAK',   action: '7-day login streak',      description: 'Log in 7 consecutive days for DM bonus (doubles weekly)',baseRate: 500, unit: 'per week',       multipliers: { tierMultiplier: 1.5, streakMultiplier: 2.0, partnerMultiplier: 1.0, totalMultiplier: 3.0 }, effectiveRate: 1500,monthlyEarned: 6_000, estimatedUSDC: 60.00, icon: '🔥', color: '#fbbf24', isBonus: true, bonusExpiry: 'Ongoing' },
]

export const REDEMPTION_OPTIONS: RedemptionOption[] = [
  { id: 'rd1', type: 'USDC_DIRECT',     title: 'Cash Out to USDC',       description: 'Instant conversion to USDC in your Soul Wallet. No delays. No fees. No minimums.',   minPoints: 100,   rate: 100, valuePerPoint: 0.01, instantSettlement: true,  icon: '💎', color: '#4ade80', popular: true,  comparisonNote: 'Aeroplan: 1¢/pt (50% less) + transfer fees' },
  { id: 'rd2', type: 'TRAVEL_CREDIT',   title: 'Travel Credits',         description: '1.2× boost: 100 DM = $1.20 in travel bookings. Best value for travellers.',            minPoints: 500,   rate: 100, valuePerPoint: 0.012,instantSettlement: false, icon: '✈', color: '#60a5fa', popular: true,  comparisonNote: 'vs Air Miles: ~0.8¢/pt + blackout dates' },
  { id: 'rd3', type: 'GAMING_CREDITS',  title: 'Gaming Credits',         description: '1.5× boost: 100 DM = $1.50 in tournament entry fees or in-game items.',               minPoints: 200,   rate: 100, valuePerPoint: 0.015,instantSettlement: true,  icon: '◎', color: '#f472b6', popular: false, comparisonNote: 'No gaming redemption option at any airline' },
  { id: 'rd4', type: 'PARTNER_VOUCHER', title: 'Partner Vouchers',       description: 'Redeem at 50+ partners. Amazon, Apple, Airbnb, Uber, Spotify and more.',              minPoints: 1000,  rate: 100, valuePerPoint: 0.011,instantSettlement: false, icon: '◈', color: '#D4AF37', popular: false, comparisonNote: 'vs Scene+: limited to Scotia partners' },
  { id: 'rd5', type: 'CHARITY',         title: 'Donate to Charity',      description: 'Donate 100% of DM value to verified charities. Receipt provided for tax purposes.',   minPoints: 100,   rate: 100, valuePerPoint: 0.01, instantSettlement: true,  icon: '❤', color: '#f87171',  popular: false, comparisonNote: 'Most programs: complicated charity process' },
  { id: 'rd6', type: 'REINVEST',        title: 'Auto-Reinvest in Bot',   description: 'Sweep DM into your trading bot as USDC capital. Compounds automatically.',            minPoints: 5000,  rate: 100, valuePerPoint: 0.01, instantSettlement: true,  icon: '⬡', color: '#a78bfa', popular: false, comparisonNote: 'Unique to DustMiles — no other program has this' },
]

export const PARTNER_NETWORK: RewardsPartner[] = [
  { id: 'p1',  name: 'Amazon',          category: 'Shopping',   earnRate: 200, effectiveReturn: 2.0, description: '2% back in DM on all Amazon.ca and Amazon.com purchases',          icon: '📦', color: '#FF9900', isExclusive: false, isNew: false },
  { id: 'p2',  name: 'Air Canada',      category: 'Travel',     earnRate: 300, effectiveReturn: 3.0, description: '3% in DM on Air Canada flight purchases (stackable with Aeroplan)', icon: '✈', color: '#FF0000',  isExclusive: false, isNew: false },
  { id: 'p3',  name: 'Airbnb',          category: 'Travel',     earnRate: 250, effectiveReturn: 2.5, description: '2.5% in DM on all Airbnb stays booked through Soul Wallet',        icon: '🏡', color: '#FF385C', isExclusive: false, isNew: false },
  { id: 'p4',  name: 'Uber/Uber Eats',  category: 'Transport',  earnRate: 150, effectiveReturn: 1.5, description: '1.5% in DM on rides and Uber Eats orders',                         icon: '🚗', color: '#000000', isExclusive: false, isNew: false },
  { id: 'p5',  name: 'Apple',           category: 'Tech',       earnRate: 100, effectiveReturn: 1.0, description: '1% in DM on App Store, Apple Music, Apple TV+ and hardware',       icon: '🍎', color: '#666666', isExclusive: false, isNew: true  },
  { id: 'p6',  name: 'Loblaws/PC',      category: 'Grocery',    earnRate: 200, effectiveReturn: 2.0, description: '2% in DM at Loblaws, No Frills, Real Canadian Superstore',         icon: '🛒', color: '#4ade80', isExclusive: true,  isNew: false },
  { id: 'p7',  name: 'Best Buy Canada', category: 'Tech',       earnRate: 250, effectiveReturn: 2.5, description: '2.5% in DM on all Best Buy Canada purchases',                      icon: '💻', color: '#003087', isExclusive: true,  isNew: false },
  { id: 'p8',  name: 'Tim Hortons',     category: 'Food',       earnRate: 500, effectiveReturn: 5.0, description: '5% in DM — exclusive rate not available on Tims Rewards',          icon: '☕', color: '#C8102E', isExclusive: true,  isNew: true  },
  { id: 'p9',  name: 'Cineplex',        category: 'Entertain',  earnRate: 300, effectiveReturn: 3.0, description: '3% in DM on movies, gaming, and concessions',                      icon: '🎬', color: '#E31837', isExclusive: false, isNew: false },
  { id: 'p10', name: 'LCBO/Beer Store', category: 'Retail',     earnRate: 200, effectiveReturn: 2.0, description: '2% in DM on Ontario liquor store purchases',                       icon: '🍷', color: '#722F37', isExclusive: true,  isNew: true  },
]

export const COMPLIANCE_ITEMS: ComplianceItem[] = [
  { regulation: 'FINTRAC MSB Registration', jurisdiction: 'Canada (Federal)', status: 'COMPLIANT', description: 'Registered as Money Services Business under PCMLTFA. AML/KYC program active. Compliance Officer appointed.', lastAudit: 'Dec 2025', nextReview: 'Dec 2026', icon: '🛡' },
  { regulation: 'IFRS 15 Deferred Revenue', jurisdiction: 'International', status: 'COMPLIANT', description: 'DustMiles treated as contract liabilities (deferred revenue). Breakage estimated quarterly using 18-month redemption curves. Point SSP = $0.0098.', lastAudit: 'Mar 2026', nextReview: 'Mar 2027', icon: '📊' },
  { regulation: 'FINTRAC Travel Rule', jurisdiction: 'Canada (Federal)', status: 'COMPLIANT', description: 'All transactions ≥ CAD $1,000 include sender/receiver data transmission. Automated collection built into Soul Wallet auth flow.', lastAudit: 'Jan 2026', nextReview: 'Jan 2027', icon: '📋' },
  { regulation: 'CSA Crypto Asset Rules', jurisdiction: 'Canada (Provincial)', status: 'COMPLIANT', description: 'DustMiles classified as utility token / loyalty instrument. Not a security under Howey Test (no profit expectation, no investment contract).', lastAudit: 'Feb 2026', nextReview: 'Feb 2027', icon: '⚖' },
  { regulation: 'CRA Tax Treatment', jurisdiction: 'Canada (Federal)', status: 'COMPLIANT', description: 'DM issued as loyalty discount (not income to user). USDC redemptions may trigger capital gains at user level. T4 issued for referral income > $500.', lastAudit: 'Jan 2026', nextReview: 'Jan 2027', icon: '🏛' },
  { regulation: 'PIPEDA / Privacy Act', jurisdiction: 'Canada (Federal)', status: 'COMPLIANT', description: 'Zero personally identifiable data stored on-chain. SBT identity is pseudonymous. Loyalty data governed by explicit user consent.', lastAudit: 'Feb 2026', nextReview: 'Feb 2027', icon: '🔒' },
  { regulation: 'Polygon Blockchain Audit', jurisdiction: 'On-Chain', status: 'COMPLIANT', description: 'Reserve Pool smart contract audited by Certik. Multi-sig 4-of-7 governance. No admin key can access Reserve before 2× target threshold.', lastAudit: 'Mar 2026', nextReview: 'Mar 2027', icon: '⬡' },
]

// ── Comparison Table Data ─────────────────────────────────────
export interface CompetitorProgram {
  name: string
  effectiveReturn: string
  fixedValue: boolean
  instantRedemption: boolean
  noExpiry: boolean
  noBlackout: boolean
  universalPartners: boolean
  cryptoNative: boolean
  transparentFunding: boolean
  userFriendly: boolean
  dustmilesWins: number
}

export const COMPETITOR_COMPARISON: CompetitorProgram[] = [
  { name: 'DustMiles ✦',  effectiveReturn: '2.5–25%', fixedValue: true,  instantRedemption: true,  noExpiry: true,  noBlackout: true,  universalPartners: true,  cryptoNative: true,  transparentFunding: true,  userFriendly: true,  dustmilesWins: 0 },
  { name: 'Aeroplan',     effectiveReturn: '1.0–1.5%',fixedValue: false, instantRedemption: false, noExpiry: true,  noBlackout: false, universalPartners: false, cryptoNative: false, transparentFunding: false, userFriendly: false, dustmilesWins: 8 },
  { name: 'Scene+',       effectiveReturn: '0.5–1.0%',fixedValue: false, instantRedemption: false, noExpiry: false, noBlackout: false, universalPartners: false, cryptoNative: false, transparentFunding: false, userFriendly: false, dustmilesWins: 9 },
  { name: 'Air Miles',    effectiveReturn: '0.8–1.1%',fixedValue: false, instantRedemption: false, noExpiry: false, noBlackout: false, universalPartners: false, cryptoNative: false, transparentFunding: false, userFriendly: false, dustmilesWins: 9 },
  { name: 'PC Optimum',   effectiveReturn: '1.0%',    fixedValue: true,  instantRedemption: false, noExpiry: true,  noBlackout: true,  universalPartners: false, cryptoNative: false, transparentFunding: false, userFriendly: true,  dustmilesWins: 6 },
  { name: 'Starbucks ★',  effectiveReturn: '5–10%*',  fixedValue: false, instantRedemption: false, noExpiry: false, noBlackout: false, universalPartners: false, cryptoNative: false, transparentFunding: false, userFriendly: true,  dustmilesWins: 6 },
  { name: 'Chase Sapphire',effectiveReturn:'1.5–2%',  fixedValue: false, instantRedemption: false, noExpiry: true,  noBlackout: false, universalPartners: true,  cryptoNative: false, transparentFunding: false, userFriendly: false, dustmilesWins: 7 },
]
