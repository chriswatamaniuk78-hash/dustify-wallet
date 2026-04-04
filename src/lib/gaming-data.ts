// ============================================================
// DUST GAMING — Complete Data Layer v3
// Synthesized from: Steam, Apple Arcade, Google Play Games,
// Roblox, Epic, Discord, Brawl Stars, Fortnite, Xbox GamePass
// People HATE: Ads, pay-to-win, losing progress, no community
// People LOVE: No ads, real prizes, achievement ownership, fair play
// ============================================================

export type GameCategory = 'ACTION' | 'PUZZLE' | 'STRATEGY' | 'RPG' | 'RACING' | 'SPORTS' | 'ADVENTURE' | 'KIDS' | 'CARD' | 'SIMULATION'
export type TournamentStatus = 'LIVE' | 'UPCOMING' | 'COMPLETED'
export type AchievementRarity = 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC'

export interface Game {
  id: string; title: string; developer: string; category: GameCategory; rating: string
  description: string; price: number | 'FREE'; dustMilesPerSession: number
  playerCount: string; releaseDate: string; score: number; reviews: number
  trending: boolean; featured: boolean; color: string; tags: string[]
  achievements: number; isKidsSafe: boolean; crossProgress: boolean
  noAds: boolean; noPay2Win: boolean
}

export interface Tournament {
  id: string; title: string; game: string; gameId: string; gameColor: string
  status: TournamentStatus; prizePool: number; prizeToken: 'USDC' | 'DustMiles'
  entryFee: number; maxPlayers: number; currentPlayers: number
  startDate: string; endDate?: string; format: string; region: string
  dustMilesBonus: number; verified: boolean; spectators: number
  topPrizes: { place: string; prize: string }[]
}

export interface Achievement {
  id: string; title: string; description: string; game: string; gameId: string
  rarity: AchievementRarity; progress: number; earned: boolean; earnedDate?: string
  dustMilesReward: number; isNFT: boolean; nftValue?: number; icon: string
}

export interface GameItem {
  id: string; name: string; game: string
  type: 'SKIN' | 'WEAPON' | 'CHARACTER' | 'MAP' | 'EMOTE' | 'NFT'
  rarity: AchievementRarity; owned: boolean; price: number | null
  dustMilesValue: number; tradeable: boolean; image: string
}

export interface LeaderboardEntry {
  rank: number; playerName: string; sbtId: string; game: string
  score: number; rating: string; verified: boolean; country: string
  winRate: number; dustMilesEarned: number; isUser?: boolean
}

export interface Creator {
  id: string; name: string; sbtId: string; followers: number; games: number
  totalPlays: number; revenue: number; rating: number; badge: string; country: string
}

export interface KidsGame {
  id: string; title: string; category: string; ageMin: number; ageMax: number
  description: string; educational: boolean; educationalFocus?: string
  dustMilesPerSession: number; color: string; icon: string
}

// ── Games Catalog ─────────────────────────────────────────────
export const GAMES_CATALOG: Game[] = [
  { id: 'hr', title: 'Hollow Realms', developer: 'ShadowForge Studios', category: 'ACTION', rating: '16+', price: 'FREE', description: 'Fast-paced dungeon crawler with SBT-verified competitive ladder. No ads. No pay-to-win. Skill only.', dustMilesPerSession: 25, playerCount: '2.4M', releaseDate: '2024-08-12', score: 91, reviews: 18420, trending: true, featured: true, color: '#7F77DD', tags: ['No Ads', 'No P2W', 'SBT Ranked', 'Co-op'], achievements: 84, isKidsSafe: false, crossProgress: true, noAds: true, noPay2Win: true },
  { id: 'va', title: 'Velocity Arena', developer: 'NeonEdge', category: 'RACING', rating: '7+', price: 'FREE', description: 'Neon anti-gravity racing. Weekly championships with USDC prize pools. SBT anti-cheat guaranteed.', dustMilesPerSession: 20, playerCount: '1.8M', releaseDate: '2024-11-03', score: 88, reviews: 12840, trending: true, featured: false, color: '#4ade80', tags: ['Racing', 'No Ads', 'USDC Prizes', 'Tournaments'], achievements: 52, isKidsSafe: true, crossProgress: true, noAds: true, noPay2Win: true },
  { id: 'na', title: 'Neon Abyss II', developer: 'Pixelcat Games', category: 'PUZZLE', rating: '12+', price: 'FREE', description: 'Roguelite puzzle-platformer. Procedurally generated levels. Every run unique.', dustMilesPerSession: 15, playerCount: '980K', releaseDate: '2025-01-20', score: 94, reviews: 8240, trending: false, featured: true, color: '#f472b6', tags: ['Roguelite', 'No Ads', 'Daily Challenges', 'Leaderboards'], achievements: 120, isKidsSafe: false, crossProgress: true, noAds: true, noPay2Win: true },
  { id: 'tk', title: 'Terra Kingdoms', developer: 'GrandstoneGames', category: 'STRATEGY', rating: '7+', price: 'FREE', description: 'Build your empire, form alliances, compete in seasonal wars. SBT-verified guild membership.', dustMilesPerSession: 30, playerCount: '3.2M', releaseDate: '2023-06-15', score: 86, reviews: 42180, trending: false, featured: false, color: '#E8C547', tags: ['Strategy', 'Guilds', 'Seasonal', 'Alliance Wars'], achievements: 200, isKidsSafe: true, crossProgress: true, noAds: true, noPay2Win: false },
  { id: 'cb', title: 'Circuit Breaker', developer: 'Binary Pulse', category: 'ACTION', rating: '12+', price: 'FREE', description: 'Cyberpunk twin-stick shooter. 5-minute runs. Global ranking with USDC prizes.', dustMilesPerSession: 18, playerCount: '640K', releaseDate: '2025-02-08', score: 89, reviews: 4920, trending: true, featured: false, color: '#00d4ff', tags: ['Action', 'Quick Runs', 'Competitive', 'Cyber'], achievements: 68, isKidsSafe: false, crossProgress: true, noAds: true, noPay2Win: true },
  { id: 'fc', title: 'Frost Castle', developer: 'IceBreaker Interactive', category: 'STRATEGY', rating: '7+', price: 'FREE', description: 'Tower defense with deep meta. Weekly challenge runs with DustMiles rewards.', dustMilesPerSession: 12, playerCount: '420K', releaseDate: '2024-09-14', score: 82, reviews: 3180, trending: false, featured: false, color: '#7F77DD', tags: ['Tower Defense', 'Strategy', 'Weekly Challenges'], achievements: 44, isKidsSafe: true, crossProgress: false, noAds: true, noPay2Win: true },
]

// ── Kids Zone ─────────────────────────────────────────────────
export const KIDS_GAMES: KidsGame[] = [
  { id: 'k1', title: 'StarType Junior', category: 'Typing', ageMin: 5, ageMax: 9, description: 'Learn to type through galaxy adventures!', educational: true, educationalFocus: 'Typing & Keyboard Skills', dustMilesPerSession: 5, color: '#FFD700', icon: '⭐' },
  { id: 'k2', title: 'NumberNinja', category: 'Math', ageMin: 6, ageMax: 12, description: 'Master arithmetic through ninja combat. Grades 1–6.', educational: true, educationalFocus: 'Mathematics (Grades 1–6)', dustMilesPerSession: 5, color: '#FF6B6B', icon: '🥷' },
  { id: 'k3', title: 'WorldBuilder', category: 'Creativity', ageMin: 7, ageMax: 14, description: 'Build cities, learn coding basics. No ads, no purchases.', educational: true, educationalFocus: 'Spatial Reasoning & Coding', dustMilesPerSession: 8, color: '#4ECDC4', icon: '🌍' },
  { id: 'k4', title: 'ArtBot', category: 'Creativity', ageMin: 4, ageMax: 10, description: 'Paint, animate, and share art. AI helps develop unique style.', educational: false, dustMilesPerSession: 5, color: '#FF69B4', icon: '🎨' },
  { id: 'k5', title: 'SpaceQuest Math', category: 'Math', ageMin: 8, ageMax: 13, description: 'Algebra and geometry through space exploration.', educational: true, educationalFocus: 'Algebra & Geometry', dustMilesPerSession: 6, color: '#6C5CE7', icon: '🚀' },
  { id: 'k6', title: 'ReadRacer', category: 'Literacy', ageMin: 5, ageMax: 11, description: 'Reading comprehension races. Unlock levels by completing challenges.', educational: true, educationalFocus: 'Reading & Comprehension', dustMilesPerSession: 5, color: '#00B894', icon: '📚' },
]

// ── Tournaments ───────────────────────────────────────────────
export const MOCK_TOURNAMENTS: Tournament[] = [
  { id: 't1', title: 'Hollow Realms Grand Prix', game: 'Hollow Realms', gameId: 'hr', gameColor: '#7F77DD', status: 'LIVE', prizePool: 5000, prizeToken: 'USDC', entryFee: 0, maxPlayers: 512, currentPlayers: 441, startDate: '2025-04-04T12:00:00Z', endDate: '2025-04-04T22:00:00Z', format: 'Single Elimination', region: 'Global', dustMilesBonus: 500, verified: true, spectators: 8420, topPrizes: [{ place: '1st', prize: '$1,500 USDC' }, { place: '2nd', prize: '$750 USDC' }, { place: '3rd', prize: '$350 USDC' }] },
  { id: 't2', title: 'Velocity Arena Championship', game: 'Velocity Arena', gameId: 'va', gameColor: '#4ade80', status: 'UPCOMING', prizePool: 2500, prizeToken: 'USDC', entryFee: 5, maxPlayers: 256, currentPlayers: 189, startDate: '2025-04-06T18:00:00Z', format: 'Swiss + Top 16 Bracket', region: 'North America', dustMilesBonus: 250, verified: true, spectators: 0, topPrizes: [{ place: '1st', prize: '$800 USDC' }, { place: '2nd', prize: '$400 USDC' }, { place: '3–4th', prize: '$200 USDC' }] },
  { id: 't3', title: 'Neon Abyss Speed Run', game: 'Neon Abyss II', gameId: 'na', gameColor: '#f472b6', status: 'UPCOMING', prizePool: 1000, prizeToken: 'DustMiles', entryFee: 0, maxPlayers: 1000, currentPlayers: 724, startDate: '2025-04-08T20:00:00Z', format: 'Time Trial · Best of 3', region: 'Global', dustMilesBonus: 1000, verified: true, spectators: 0, topPrizes: [{ place: '1st', prize: '50,000 DustMiles ($500)' }, { place: '2nd', prize: '25,000 DustMiles' }, { place: '3–10th', prize: '5,000 DustMiles' }] },
  { id: 't4', title: 'Terra Kingdoms Guild Wars', game: 'Terra Kingdoms', gameId: 'tk', gameColor: '#E8C547', status: 'COMPLETED', prizePool: 10000, prizeToken: 'USDC', entryFee: 0, maxPlayers: 32, currentPlayers: 32, startDate: '2025-03-28T16:00:00Z', endDate: '2025-03-30T22:00:00Z', format: 'Guild Battle · Round Robin', region: 'Global', dustMilesBonus: 1500, verified: true, spectators: 12840, topPrizes: [{ place: 'Winner Guild', prize: '$4,000 USDC' }, { place: '2nd Guild', prize: '$2,000 USDC' }, { place: '3rd Guild', prize: '$1,000 USDC' }] },
]

// ── Achievements ──────────────────────────────────────────────
export const MOCK_ACHIEVEMENTS: Achievement[] = [
  { id: 'a1', title: 'The Abyss Starer', description: 'Complete 100 runs of Neon Abyss II without dying on Floor 10', game: 'Neon Abyss II', gameId: 'na', rarity: 'LEGENDARY', progress: 100, earned: true, earnedDate: '2025-03-18', dustMilesReward: 500, isNFT: true, nftValue: 28, icon: '👁' },
  { id: 'a2', title: 'Speed Demon', description: 'Win a Velocity Arena match in under 4 minutes', game: 'Velocity Arena', gameId: 'va', rarity: 'EPIC', progress: 100, earned: true, earnedDate: '2025-03-22', dustMilesReward: 250, isNFT: true, nftValue: 12, icon: '⚡' },
  { id: 'a3', title: 'Grand Architect', description: 'Build a city with 1M+ population in Terra Kingdoms', game: 'Terra Kingdoms', gameId: 'tk', rarity: 'RARE', progress: 82, earned: false, dustMilesReward: 100, isNFT: false, icon: '🏗' },
  { id: 'a4', title: 'Circuit Master', description: 'Win 50 consecutive matches in Circuit Breaker', game: 'Circuit Breaker', gameId: 'cb', rarity: 'MYTHIC', progress: 34, earned: false, dustMilesReward: 2000, isNFT: true, nftValue: 120, icon: '🔮' },
  { id: 'a5', title: 'Dungeon Legend', description: 'Clear all 100 floors of Hollow Realms solo', game: 'Hollow Realms', gameId: 'hr', rarity: 'LEGENDARY', progress: 67, earned: false, dustMilesReward: 1000, isNFT: true, nftValue: 65, icon: '⚔' },
  { id: 'a6', title: 'First Victory', description: 'Win your first competitive match', game: 'Velocity Arena', gameId: 'va', rarity: 'COMMON', progress: 100, earned: true, earnedDate: '2025-02-14', dustMilesReward: 25, isNFT: false, icon: '🏆' },
]

// ── Game Items ─────────────────────────────────────────────────
export const MOCK_GAME_ITEMS: GameItem[] = [
  { id: 'gi1', name: 'Quantum Blade Skin', game: 'Hollow Realms', type: 'WEAPON', rarity: 'LEGENDARY', owned: true, price: null, dustMilesValue: 2400, tradeable: true, image: 'quantum-blade' },
  { id: 'gi2', name: 'Neon Racer #247', game: 'Velocity Arena', type: 'NFT', rarity: 'EPIC', owned: true, price: null, dustMilesValue: 1200, tradeable: true, image: 'neon-racer' },
  { id: 'gi3', name: 'Shadow Cloak', game: 'Hollow Realms', type: 'SKIN', rarity: 'RARE', owned: true, price: null, dustMilesValue: 400, tradeable: false, image: 'shadow-cloak' },
  { id: 'gi4', name: 'Grand Architect Token', game: 'Terra Kingdoms', type: 'NFT', rarity: 'MYTHIC', owned: false, price: 8500, dustMilesValue: 8500, tradeable: true, image: 'architect' },
]

// ── Leaderboards ──────────────────────────────────────────────
export const GLOBAL_LEADERBOARD: LeaderboardEntry[] = [
  { rank: 1, playerName: 'ShadowBlade_9', sbtId: '00041', game: 'Hollow Realms', score: 9_847_320, rating: 'Grandmaster', verified: true, country: '🇨🇦', winRate: 84, dustMilesEarned: 124_800 },
  { rank: 2, playerName: 'QuantumRacer', sbtId: '00112', game: 'Velocity Arena', score: 8_204_110, rating: 'Master', verified: true, country: '🇺🇸', winRate: 79, dustMilesEarned: 98_400 },
  { rank: 3, playerName: 'AbyssDelver', sbtId: '00234', game: 'Neon Abyss II', score: 7_841_000, rating: 'Grandmaster', verified: true, country: '🇬🇧', winRate: 91, dustMilesEarned: 87_200 },
  { rank: 4, playerName: 'TerraLord', sbtId: '00387', game: 'Terra Kingdoms', score: 6_920_400, rating: 'Diamond I', verified: false, country: '🇩🇪', winRate: 72, dustMilesEarned: 62_400 },
  { rank: 5, playerName: 'CircuitMind', sbtId: '00521', game: 'Circuit Breaker', score: 5_847_230, rating: 'Diamond II', verified: true, country: '🇯🇵', winRate: 78, dustMilesEarned: 48_100 },
  { rank: 6, playerName: 'PixelStrike', sbtId: '00689', game: 'Neon Abyss II', score: 4_921_870, rating: 'Diamond I', verified: false, country: '🇨🇦', winRate: 69, dustMilesEarned: 38_200 },
  { rank: 7, playerName: 'NeonGhost (You)', sbtId: '00847', game: 'Velocity Arena', score: 3_847_120, rating: 'Platinum I', verified: true, country: '🇨🇦', winRate: 64, dustMilesEarned: 28_400, isUser: true },
]

// ── Creators ──────────────────────────────────────────────────
export const MOCK_CREATORS: Creator[] = [
  { id: 'c1', name: 'PixelForge', sbtId: '00041', followers: 128_400, games: 12, totalPlays: 4_820_000, revenue: 48_200, rating: 4.94, badge: 'Verified Creator', country: '🇨🇦' },
  { id: 'c2', name: 'NeonStudios', sbtId: '00289', followers: 84_200, games: 8, totalPlays: 2_140_000, revenue: 28_400, rating: 4.88, badge: 'Top Creator', country: '🇺🇸' },
  { id: 'c3', name: 'BinaryDreams', sbtId: '00521', followers: 42_100, games: 5, totalPlays: 980_000, revenue: 14_200, rating: 4.82, badge: 'Rising Star', country: '🇬🇧' },
]

export const MOCK_DEV_ANALYTICS = { totalPlays: 48_240, revenue: 2_412, dustMilesGenerated: 48_240, avgSession: '14m 32s', retention: '42%', rating: 4.7, topCountries: [{ country: '🇺🇸 USA', pct: 34 }, { country: '🇨🇦 Canada', pct: 28 }, { country: '🇬🇧 UK', pct: 18 }, { country: '🇯🇵 Japan', pct: 11 }] }

// ── Utility ────────────────────────────────────────────────────
export function rarityColor(rarity: AchievementRarity): string {
  const map: Record<AchievementRarity, string> = { COMMON: '#9ca3af', UNCOMMON: '#4ade80', RARE: '#60a5fa', EPIC: '#a78bfa', LEGENDARY: '#D4AF37', MYTHIC: '#f472b6' }
  return map[rarity]
}
export function rarityGlow(rarity: AchievementRarity): string { return `0 0 12px ${rarityColor(rarity)}60` }
export function tierColor(tier: string): string {
  const map: Record<string, string> = { 'Grandmaster': '#f472b6', 'Master': '#a78bfa', 'Diamond I': '#60a5fa', 'Diamond II': '#60a5fa', 'Platinum I': '#4ade80', 'Gold I': '#D4AF37' }
  return map[tier] ?? '#9ca3af'
}
export function formatRevenue(n: number): string { return n >= 1000 ? `$${(n / 1000).toFixed(1)}K` : `$${n}` }
