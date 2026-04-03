// ============================================================
// DUST GAMING — Types & Mock Data
// ============================================================

export type GameGenre = 'ACTION' | 'RPG' | 'PUZZLE' | 'STRATEGY' | 'SPORTS' | 'PLATFORMER' | 'HORROR' | 'EDUCATIONAL' | 'SIMULATION'
export type GamePlatform = 'STEAM' | 'EPIC' | 'IOS' | 'ANDROID' | 'ITCH' | 'DUSTIFY'
export type AgeRating = 'E' | 'E10' | 'T' | 'M' | 'AO'
export type TournamentStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED'
export type CreatorTier = 'EMERGING' | 'RISING' | 'VERIFIED' | 'ELITE'

// ── Game ──────────────────────────────────────────────────────

export interface Game {
  id: string
  title: string
  developer: string
  developerSbtId: string
  genre: GameGenre
  ageRating: AgeRating
  price: number               // CAD, 0 = free
  originalPrice?: number
  platforms: GamePlatform[]
  rating: number              // 0-10
  reviewCount: number
  downloads: number
  coverColor: string
  accentColor: string
  tags: string[]
  isExclusive: boolean
  exclusiveDaysLeft?: number
  hasFreeTrial: boolean
  hasSBTOwnership: boolean
  resellable: boolean
  dustScore: number
  pointsEarned: number
  description: string
  publishedAt: string
}

// ── Tournament ────────────────────────────────────────────────

export interface Tournament {
  id: string
  title: string
  game: string
  gameColor: string
  status: TournamentStatus
  prizePool: number           // USDC
  entryFee: number
  maxPlayers: number
  currentPlayers: number
  startDate: string
  bracket: 'SINGLE_ELIM' | 'DOUBLE_ELIM' | 'ROUND_ROBIN' | 'SWISS'
  sbtRequired: boolean
  skillRating?: string        // e.g. "Gold II+"
  spectators: number
  createdBy: string
  createdBySbt: string
}

// ── Creator ───────────────────────────────────────────────────

export interface Creator {
  id: string
  name: string
  handle: string
  sbtId: string
  tier: CreatorTier
  avatar: string              // initials
  avatarColor: string
  gamesPublished: number
  totalDownloads: number
  totalRevenue: number
  followers: number
  rating: number
  genres: GameGenre[]
  topGame: string
  joinedAt: string
  verified: boolean
  streaming: boolean
  streamViewers?: number
}

// ── Achievement SBT ───────────────────────────────────────────

export interface AchievementSBT {
  id: string
  title: string
  description: string
  game: string
  rarity: 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'WORLD_FIRST'
  earnedAt: string
  icon: string
  color: string
  holders: number
  pointsValue: number
}

// ── In-game item ──────────────────────────────────────────────

export interface GameItem {
  id: string
  name: string
  game: string
  type: 'SKIN' | 'WEAPON' | 'CHARACTER' | 'EMOTE' | 'MAP' | 'MOUNT'
  rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY'
  currentOwner: string
  price: number
  originalGame: string
  crossGameCompatible: boolean
  mintedAt: string
  transactionCount: number
  itemColor: string
}

// ── Developer analytics ───────────────────────────────────────

export interface DevAnalytics {
  gameId: string
  title: string
  totalRevenue: number
  revenueToday: number
  totalPlayers: number
  dailyActivePlayers: number
  avgSessionMinutes: number
  retentionDay1: number
  retentionDay7: number
  retentionDay30: number
  crashRate: number
  avgRating: number
  revenueByPlatform: Record<GamePlatform, number>
  topCountries: { country: string; revenue: number }[]
}

// ── Formatting ─────────────────────────────────────────────────

export function formatRevenue(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}K`
  return `$${n}`
}

export function rarityColor(r: string): string {
  const map: Record<string, string> = {
    COMMON: '#888780',
    UNCOMMON: '#1D9E75',
    RARE: '#378ADD',
    EPIC: '#7F77DD',
    LEGENDARY: '#EF9F27',
    WORLD_FIRST: '#D4AF37',
  }
  return map[r] ?? '#888780'
}

export function genreIcon(g: GameGenre): string {
  const map: Record<GameGenre, string> = {
    ACTION: '⚡', RPG: '◆', PUZZLE: '◎', STRATEGY: '◉',
    SPORTS: '▲', PLATFORMER: '◐', HORROR: '◇',
    EDUCATIONAL: '◈', SIMULATION: '◌',
  }
  return map[g] ?? '◎'
}

export function tierColor(t: CreatorTier): string {
  return { EMERGING: '#888780', RISING: '#1D9E75', VERIFIED: '#378ADD', ELITE: '#D4AF37' }[t]
}

export function ageRatingColor(r: AgeRating): string {
  return { E: '#1D9E75', E10: '#639922', T: '#EF9F27', M: '#D85A30', AO: '#E24B4A' }[r]
}

// ── Mock data ──────────────────────────────────────────────────

export const MOCK_GAMES: Game[] = [
  {
    id: 'g1', title: 'Neon Abyss II', developer: 'PixelForge Studio', developerSbtId: '00041',
    genre: 'ACTION', ageRating: 'T', price: 24.99, platforms: ['STEAM', 'EPIC', 'DUSTIFY'],
    rating: 9.2, reviewCount: 14_821, downloads: 284_000,
    coverColor: '#0f1035', accentColor: '#7F77DD',
    tags: ['Roguelite', 'Action', 'Co-op', 'Pixel art'],
    isExclusive: false, hasFreeTrial: true, hasSBTOwnership: true, resellable: true,
    dustScore: 96, pointsEarned: 2499, description: 'Dive into the infinite abyss. Procedurally generated dungeons, 200+ items, and the most satisfying combat in roguelite history.',
    publishedAt: '2025-09-14',
  },
  {
    id: 'g2', title: 'Terra Kingdoms', developer: 'Sovereign Games', developerSbtId: '00112',
    genre: 'STRATEGY', ageRating: 'E10', price: 39.99, platforms: ['STEAM', 'DUSTIFY'],
    rating: 9.5, reviewCount: 8_204, downloads: 124_000,
    coverColor: '#1a2f1a', accentColor: '#1D9E75',
    tags: ['4X Strategy', 'City building', 'Multiplayer'],
    isExclusive: true, exclusiveDaysLeft: 14, hasFreeTrial: true, hasSBTOwnership: true, resellable: true,
    dustScore: 98, pointsEarned: 3999, description: 'Build civilizations from the ground up. Dustify exclusive for 30 days.',
    publishedAt: '2026-01-22',
  },
  {
    id: 'g3', title: 'MathQuest Adventures', developer: 'EduPlay Labs', developerSbtId: '00234',
    genre: 'EDUCATIONAL', ageRating: 'E', price: 0, platforms: ['IOS', 'ANDROID', 'DUSTIFY'],
    rating: 9.1, reviewCount: 22_140, downloads: 1_240_000,
    coverColor: '#1a2050', accentColor: '#378ADD',
    tags: ['Educational', 'Kids', 'Math', 'Free'],
    isExclusive: false, hasFreeTrial: false, hasSBTOwnership: false, resellable: false,
    dustScore: 94, pointsEarned: 0, description: 'Make math fun for ages 5-12. Adaptive curriculum, 1,200+ challenges.',
    publishedAt: '2025-04-10',
  },
  {
    id: 'g4', title: 'Hollow Realms', developer: 'DarkArc Interactive', developerSbtId: '00387',
    genre: 'RPG', ageRating: 'M', price: 59.99, originalPrice: 79.99, platforms: ['STEAM', 'EPIC', 'DUSTIFY'],
    rating: 9.7, reviewCount: 31_847, downloads: 520_000,
    coverColor: '#1a0a0a', accentColor: '#D85A30',
    tags: ['Open world', 'RPG', 'Dark fantasy', 'Soulslike'],
    isExclusive: false, hasFreeTrial: true, hasSBTOwnership: true, resellable: true,
    dustScore: 99, pointsEarned: 5999, description: 'The most acclaimed RPG of 2025. 100+ hours of dark fantasy. Sale: 25% off.',
    publishedAt: '2025-06-01',
  },
  {
    id: 'g5', title: 'Circuit Breaker', developer: 'NeonByte Labs', developerSbtId: '00521',
    genre: 'PUZZLE', ageRating: 'E', price: 9.99, platforms: ['IOS', 'ANDROID', 'STEAM', 'DUSTIFY'],
    rating: 8.9, reviewCount: 7_421, downloads: 890_000,
    coverColor: '#0a1a1a', accentColor: '#EF9F27',
    tags: ['Puzzle', 'Casual', 'Relaxing', 'Logic'],
    isExclusive: false, hasFreeTrial: true, hasSBTOwnership: true, resellable: false,
    dustScore: 91, pointsEarned: 999, description: 'Wire circuits to power cities. 500 handcrafted puzzles.',
    publishedAt: '2025-11-30',
  },
  {
    id: 'g6', title: 'Velocity Arena', developer: 'SpeedForce Games', developerSbtId: '00689',
    genre: 'SPORTS', ageRating: 'E10', price: 19.99, platforms: ['STEAM', 'EPIC', 'DUSTIFY'],
    rating: 8.7, reviewCount: 9_124, downloads: 210_000,
    coverColor: '#0a0a2a', accentColor: '#D4AF37',
    tags: ['Racing', 'Esports', 'Competitive', 'Multiplayer'],
    isExclusive: false, hasFreeTrial: false, hasSBTOwnership: true, resellable: true,
    dustScore: 89, pointsEarned: 1999, description: 'The fastest competitive racing game ever made. Real-time 64-player lobbies.',
    publishedAt: '2025-08-20',
  },
]

export const MOCK_TOURNAMENTS: Tournament[] = [
  {
    id: 't1', title: 'Velocity Arena World Championship', game: 'Velocity Arena', gameColor: '#D4AF37',
    status: 'LIVE', prizePool: 25_000, entryFee: 10, maxPlayers: 256, currentPlayers: 247,
    startDate: '2026-03-30T14:00Z', bracket: 'DOUBLE_ELIM',
    sbtRequired: true, skillRating: 'Platinum+', spectators: 8_420,
    createdBy: 'SpeedForce Games', createdBySbt: '00689',
  },
  {
    id: 't2', title: 'Hollow Realms PvP Invitational', game: 'Hollow Realms', gameColor: '#D85A30',
    status: 'UPCOMING', prizePool: 10_000, entryFee: 5, maxPlayers: 128, currentPlayers: 94,
    startDate: '2026-04-06T18:00Z', bracket: 'SINGLE_ELIM',
    sbtRequired: true, skillRating: 'Gold+', spectators: 0,
    createdBy: 'DarkArc Interactive', createdBySbt: '00387',
  },
  {
    id: 't3', title: 'Neon Abyss Speed Run Open', game: 'Neon Abyss II', gameColor: '#7F77DD',
    status: 'UPCOMING', prizePool: 5_000, entryFee: 0, maxPlayers: 512, currentPlayers: 341,
    startDate: '2026-04-13T16:00Z', bracket: 'SWISS',
    sbtRequired: true, skillRating: undefined, spectators: 0,
    createdBy: 'Community Organizer', createdBySbt: '01247',
  },
  {
    id: 't4', title: 'Terra Kingdoms Season 1 Finals', game: 'Terra Kingdoms', gameColor: '#1D9E75',
    status: 'COMPLETED', prizePool: 15_000, entryFee: 20, maxPlayers: 64, currentPlayers: 64,
    startDate: '2026-03-15T15:00Z', bracket: 'ROUND_ROBIN',
    sbtRequired: true, skillRating: 'Diamond+', spectators: 3_847,
    createdBy: 'Sovereign Games', createdBySbt: '00112',
  },
]

export const MOCK_CREATORS: Creator[] = [
  { id: 'c1', name: 'PixelForge Studio', handle: 'pixelforge', sbtId: '00041', tier: 'ELITE', avatar: 'PF', avatarColor: '#7F77DD', gamesPublished: 8, totalDownloads: 2_840_000, totalRevenue: 4_200_000, followers: 84_200, rating: 9.4, genres: ['ACTION', 'RPG', 'PLATFORMER'], topGame: 'Neon Abyss II', joinedAt: '2024-01-15', verified: true, streaming: true, streamViewers: 1_247 },
  { id: 'c2', name: 'Sovereign Games', handle: 'sovereigngames', sbtId: '00112', tier: 'ELITE', avatar: 'SG', avatarColor: '#1D9E75', gamesPublished: 4, totalDownloads: 840_000, totalRevenue: 2_100_000, followers: 41_800, rating: 9.6, genres: ['STRATEGY', 'SIMULATION'], topGame: 'Terra Kingdoms', joinedAt: '2024-03-22', verified: true, streaming: false },
  { id: 'c3', name: 'EduPlay Labs', handle: 'eduplay', sbtId: '00234', tier: 'VERIFIED', avatar: 'EP', avatarColor: '#378ADD', gamesPublished: 12, totalDownloads: 4_200_000, totalRevenue: 840_000, followers: 124_000, rating: 9.1, genres: ['EDUCATIONAL'], topGame: 'MathQuest Adventures', joinedAt: '2024-02-08', verified: true, streaming: false },
  { id: 'c4', name: 'DarkArc Interactive', handle: 'darkarc', sbtId: '00387', tier: 'ELITE', avatar: 'DA', avatarColor: '#D85A30', gamesPublished: 3, totalDownloads: 1_240_000, totalRevenue: 5_800_000, followers: 218_000, rating: 9.8, genres: ['RPG', 'ACTION', 'HORROR'], topGame: 'Hollow Realms', joinedAt: '2023-11-14', verified: true, streaming: true, streamViewers: 4_821 },
  { id: 'c5', name: 'NeonByte Labs', handle: 'neonbyte', sbtId: '00521', tier: 'RISING', avatar: 'NB', avatarColor: '#EF9F27', gamesPublished: 5, totalDownloads: 1_200_000, totalRevenue: 420_000, followers: 18_400, rating: 8.9, genres: ['PUZZLE', 'CASUAL'], topGame: 'Circuit Breaker', joinedAt: '2024-06-30', verified: false, streaming: false },
]

export const MOCK_ACHIEVEMENTS: AchievementSBT[] = [
  { id: 'ach1', title: 'World First Clear', description: 'First player globally to complete the True Ending of Hollow Realms on Nightmare difficulty', game: 'Hollow Realms', rarity: 'WORLD_FIRST', earnedAt: '2026-01-04T03:47Z', icon: '◆', color: '#D4AF37', holders: 1, pointsValue: 100_000 },
  { id: 'ach2', title: 'Velocity Champion', description: 'Won the Velocity Arena Season 1 World Championship', game: 'Velocity Arena', rarity: 'LEGENDARY', earnedAt: '2026-02-18', icon: '◉', color: '#EF9F27', holders: 1, pointsValue: 50_000 },
  { id: 'ach3', title: 'Abyss Diver', description: 'Reached floor 100 in Neon Abyss II without taking damage', game: 'Neon Abyss II', rarity: 'EPIC', earnedAt: '2025-12-21', icon: '◎', color: '#7F77DD', holders: 47, pointsValue: 10_000 },
  { id: 'ach4', title: 'Mastermind', description: 'Completed all 500 Circuit Breaker puzzles', game: 'Circuit Breaker', rarity: 'RARE', earnedAt: '2026-01-15', icon: '◈', color: '#378ADD', holders: 892, pointsValue: 2_500 },
]

export const MOCK_GAME_ITEMS: GameItem[] = [
  { id: 'i1', name: 'Abyss Dragon Skin', game: 'Neon Abyss II', type: 'SKIN', rarity: 'LEGENDARY', currentOwner: '#00847', price: 180, originalGame: 'Neon Abyss II', crossGameCompatible: true, mintedAt: '2025-10-14', transactionCount: 4, itemColor: '#7F77DD' },
  { id: 'i2', name: 'Champion\'s Helm', game: 'Hollow Realms', type: 'CHARACTER', rarity: 'EPIC', currentOwner: '#01204', price: 85, originalGame: 'Hollow Realms', crossGameCompatible: false, mintedAt: '2025-11-28', transactionCount: 2, itemColor: '#D85A30' },
  { id: 'i3', name: 'Speed Demon Mount', game: 'Velocity Arena', type: 'MOUNT', rarity: 'RARE', currentOwner: '#00312', price: 42, originalGame: 'Velocity Arena', crossGameCompatible: true, mintedAt: '2026-01-08', transactionCount: 1, itemColor: '#D4AF37' },
  { id: 'i4', name: 'Kingdom Banner', game: 'Terra Kingdoms', type: 'EMOTE', rarity: 'UNCOMMON', currentOwner: '#00541', price: 12, originalGame: 'Terra Kingdoms', crossGameCompatible: false, mintedAt: '2026-02-14', transactionCount: 3, itemColor: '#1D9E75' },
]

export const MOCK_DEV_ANALYTICS: DevAnalytics = {
  gameId: 'g1', title: 'Neon Abyss II',
  totalRevenue: 4_200_000, revenueToday: 8_420,
  totalPlayers: 284_000, dailyActivePlayers: 42_847,
  avgSessionMinutes: 47, retentionDay1: 72, retentionDay7: 48, retentionDay30: 31,
  crashRate: 0.12, avgRating: 9.2,
  revenueByPlatform: { STEAM: 2_100_000, EPIC: 840_000, IOS: 0, ANDROID: 0, ITCH: 210_000, DUSTIFY: 1_050_000 },
  topCountries: [
    { country: 'United States', revenue: 1_260_000 },
    { country: 'Canada', revenue: 630_000 },
    { country: 'United Kingdom', revenue: 420_000 },
    { country: 'Germany', revenue: 336_000 },
    { country: 'Japan', revenue: 252_000 },
  ],
}

// ── Kids Zone parent config ────────────────────────────────────

export interface ChildProfile {
  name: string
  sbtId: string
  age: number
  ageGroup: '5-8' | '9-12' | '13-17'
  dailyLimitMinutes: number
  spendingCapCAD: number
  allowedGenres: GameGenre[]
  friendsRequireApproval: boolean
  minutesPlayedToday: number
  pointsBalance: number
}

export const MOCK_CHILD_PROFILE: ChildProfile = {
  name: 'Jordan',
  sbtId: '01847',
  age: 9,
  ageGroup: '9-12',
  dailyLimitMinutes: 120,
  spendingCapCAD: 20,
  allowedGenres: ['EDUCATIONAL', 'PUZZLE', 'PLATFORMER', 'SPORTS'],
  friendsRequireApproval: true,
  minutesPlayedToday: 67,
  pointsBalance: 12_480,
}
