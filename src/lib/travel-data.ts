// ============================================================
// DUST TRAVEL — Types & Mock Data
// ============================================================

export type TripStatus = 'PLANNING' | 'BOOKED' | 'ACTIVE' | 'COMPLETED'
export type ActivityCategory = 'FOOD' | 'CULTURE' | 'ADVENTURE' | 'NIGHTLIFE' | 'NATURE' | 'SHOPPING' | 'WELLNESS'
export type TransportType = 'FLIGHT' | 'TRAIN' | 'CAR' | 'FERRY' | 'BUS'

export interface Destination {
  id: string
  city: string
  country: string
  code: string           // IATA code
  coverImage: string     // color placeholder
  tagline: string
  avgTemp: number        // celsius
  bestMonths: string[]
  dustScore: number      // 0-100 Dustify community score
  trendingRank?: number
}

export interface FlightResult {
  id: string
  airline: string
  airlineCode: string
  departure: { airport: string; time: string; date: string }
  arrival: { airport: string; time: string; date: string }
  duration: string
  stops: number
  price: number          // CAD
  seatsLeft: number
  cabinClass: 'ECONOMY' | 'PREMIUM' | 'BUSINESS' | 'FIRST'
  pointsEarned: number
}

export interface HotelResult {
  id: string
  name: string
  stars: number
  neighborhood: string
  pricePerNight: number  // CAD
  rating: number         // 0-10
  reviewCount: number
  amenities: string[]
  images: string[]       // color placeholders
  pointsEarned: number
  distanceFromCenter: string
  dustPick: boolean
}

export interface Activity {
  id: string
  name: string
  category: ActivityCategory
  price: number
  duration: string
  rating: number
  reviewCount: number
  description: string
  dustScore: number
  influencerPick: boolean
  localSecret: boolean
  bookable: boolean
  pointsEarned: number
}

export interface InfluencerIntel {
  id: string
  influencerName: string
  influencerHandle: string
  followers: string
  destination: string
  tip: string
  category: ActivityCategory
  verified: boolean       // Dustify-verified creator
  postedAt: string
  likes: number
}

export interface TripPlan {
  id: string
  destination: Destination
  departDate: string
  returnDate: string
  travelers: number
  status: TripStatus
  totalCost: number
  pointsEarned: number
  flight?: FlightResult
  hotel?: HotelResult
  activities: Activity[]
  aiSuggestions: string[]
}

// ── Formatting helpers ────────────────────────────────────────

export function formatCAD(amount: number): string {
  return `$${amount.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`
}

export function formatRating(r: number): string {
  return r.toFixed(1)
}

export function categoryIcon(cat: ActivityCategory): string {
  const map: Record<ActivityCategory, string> = {
    FOOD: '🍜', CULTURE: '🏛', ADVENTURE: '🧗', NIGHTLIFE: '🎵',
    NATURE: '🌿', SHOPPING: '🛍', WELLNESS: '🧘'
  }
  return map[cat]
}

export function categoryColor(cat: ActivityCategory): string {
  const map: Record<ActivityCategory, string> = {
    FOOD: '#D85A30', CULTURE: '#7F77DD', ADVENTURE: '#EF9F27',
    NIGHTLIFE: '#D4537E', NATURE: '#1D9E75', SHOPPING: '#378ADD', WELLNESS: '#60a5fa'
  }
  return map[cat]
}

// ── Mock data ─────────────────────────────────────────────────

export const TRENDING_DESTINATIONS: Destination[] = [
  { id: 'd1', city: 'Tokyo', country: 'Japan', code: 'TYO', coverImage: '#1a1a2e', tagline: 'Neon lights, ramen, and infinite wonder', avgTemp: 15, bestMonths: ['Mar','Apr','Oct','Nov'], dustScore: 98, trendingRank: 1 },
  { id: 'd2', city: 'Lisbon', country: 'Portugal', code: 'LIS', coverImage: '#16213e', tagline: 'Pastel tiles, port wine, and ocean sunsets', avgTemp: 18, bestMonths: ['May','Jun','Sep','Oct'], dustScore: 94, trendingRank: 2 },
  { id: 'd3', city: 'Medellín', country: 'Colombia', code: 'MDE', coverImage: '#0f3460', tagline: 'Eternal spring, innovation, and salsa', avgTemp: 22, bestMonths: ['Dec','Jan','Feb','Jul','Aug'], dustScore: 91, trendingRank: 3 },
  { id: 'd4', city: 'Chiang Mai', country: 'Thailand', code: 'CNX', coverImage: '#1a1a2e', tagline: 'Temples, mountains, and the best food per dollar', avgTemp: 25, bestMonths: ['Nov','Dec','Jan','Feb'], dustScore: 89, trendingRank: 4 },
  { id: 'd5', city: 'Cape Town', country: 'South Africa', code: 'CPT', coverImage: '#16213e', tagline: 'Mountain, ocean, vineyard — all in one view', avgTemp: 20, bestMonths: ['Nov','Dec','Jan','Feb'], dustScore: 96, trendingRank: 5 },
  { id: 'd6', city: 'Kyoto', country: 'Japan', code: 'KIX', coverImage: '#0f3460', tagline: 'Geisha districts, bamboo groves, matcha everything', avgTemp: 14, bestMonths: ['Mar','Apr','Nov'], dustScore: 97, trendingRank: 6 },
]

export const MOCK_FLIGHTS: FlightResult[] = [
  { id: 'f1', airline: 'Air Canada', airlineCode: 'AC', departure: { airport: 'YYZ', time: '09:15', date: 'Jun 15' }, arrival: { airport: 'NRT', time: '13:45+1', date: 'Jun 16' }, duration: '13h 30m', stops: 0, price: 1247, seatsLeft: 4, cabinClass: 'ECONOMY', pointsEarned: 1247 },
  { id: 'f2', airline: 'Japan Airlines', airlineCode: 'JL', departure: { airport: 'YYZ', time: '13:30', date: 'Jun 15' }, arrival: { airport: 'NRT', time: '16:20+1', date: 'Jun 16' }, duration: '13h 50m', stops: 0, price: 1389, seatsLeft: 9, cabinClass: 'ECONOMY', pointsEarned: 1389 },
  { id: 'f3', airline: 'Air Canada', airlineCode: 'AC', departure: { airport: 'YYZ', time: '23:55', date: 'Jun 15' }, arrival: { airport: 'NRT', time: '04:30+2', date: 'Jun 17' }, duration: '14h 35m', stops: 1, price: 987, seatsLeft: 12, cabinClass: 'ECONOMY', pointsEarned: 987 },
  { id: 'f4', airline: 'ANA', airlineCode: 'NH', departure: { airport: 'YYZ', time: '11:00', date: 'Jun 15' }, arrival: { airport: 'NRT', time: '14:05+1', date: 'Jun 16' }, duration: '14h 05m', stops: 0, price: 1567, seatsLeft: 2, cabinClass: 'PREMIUM', pointsEarned: 2350 },
]

export const MOCK_HOTELS: HotelResult[] = [
  { id: 'h1', name: 'Park Hyatt Tokyo', stars: 5, neighborhood: 'Shinjuku', pricePerNight: 689, rating: 9.4, reviewCount: 2841, amenities: ['Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Concierge'], images: ['#1a1a2e'], pointsEarned: 689, distanceFromCenter: '2.1 km', dustPick: true },
  { id: 'h2', name: 'Trunk Hotel', stars: 4, neighborhood: 'Shibuya', pricePerNight: 312, rating: 9.1, reviewCount: 1204, amenities: ['Restaurant', 'Bar', 'Gym', 'Rooftop'], images: ['#16213e'], pointsEarned: 312, distanceFromCenter: '1.4 km', dustPick: true },
  { id: 'h3', name: 'Hoshinoya Tokyo', stars: 5, neighborhood: 'Otemachi', pricePerNight: 812, rating: 9.6, reviewCount: 876, amenities: ['Onsen', 'Restaurant', 'Bar', 'Spa'], images: ['#0f3460'], pointsEarned: 812, distanceFromCenter: '0.8 km', dustPick: false },
  { id: 'h4', name: 'Millennials Shinjuku', stars: 3, neighborhood: 'Shinjuku', pricePerNight: 89, rating: 8.2, reviewCount: 3201, amenities: ['Bar', 'Coworking', 'Gym'], images: ['#1a1a2e'], pointsEarned: 89, distanceFromCenter: '1.9 km', dustPick: false },
]

export const MOCK_ACTIVITIES: Activity[] = [
  { id: 'a1', name: 'Tsukiji Outer Market Food Tour', category: 'FOOD', price: 89, duration: '3 hours', rating: 9.7, reviewCount: 4201, description: 'Navigate the legendary market with a local guide. Sushi breakfast, tamagoyaki, and fresh uni straight from the source.', dustScore: 98, influencerPick: true, localSecret: false, bookable: true, pointsEarned: 89 },
  { id: 'a2', name: 'Yanaka Cemetery Night Walk', category: 'CULTURE', price: 0, duration: '2 hours', rating: 9.2, reviewCount: 891, description: 'The neighbourhood that survived the earthquake and the bombs. Old Tokyo, completely free, completely off the tourist trail.', dustScore: 95, influencerPick: false, localSecret: true, bookable: false, pointsEarned: 0 },
  { id: 'a3', name: 'TeamLab Borderless', category: 'CULTURE', price: 32, duration: '3-4 hours', rating: 9.8, reviewCount: 18420, description: 'The most immersive art experience on the planet. 60+ interconnected digital art installations across 10,000 sq meters.', dustScore: 99, influencerPick: true, localSecret: false, bookable: true, pointsEarned: 32 },
  { id: 'a4', name: 'Yakitori Alley, Yurakucho', category: 'FOOD', price: 45, duration: '2 hours', rating: 9.5, reviewCount: 2140, description: 'Squeeze under the train tracks with salarymen and smoke-grilled chicken skewers and cold Sapporo. This is Tokyo.', dustScore: 97, influencerPick: false, localSecret: true, bookable: true, pointsEarned: 45 },
  { id: 'a5', name: 'Mt Fuji Sunrise Hike', category: 'ADVENTURE', price: 124, duration: 'Full day', rating: 9.6, reviewCount: 5601, description: 'Summit the iconic peak for sunrise. Guided, includes transport from Tokyo, all equipment, and a summit certificate.', dustScore: 96, influencerPick: true, localSecret: false, bookable: true, pointsEarned: 124 },
  { id: 'a6', name: 'Koenji Vintage Shopping', category: 'SHOPPING', price: 0, duration: 'Half day', rating: 9.0, reviewCount: 1204, description: 'The neighbourhood the fashion world is watching. 200+ vintage stores within a 10-minute walk. Budget $50-$500 for finds.', dustScore: 92, influencerPick: true, localSecret: false, bookable: false, pointsEarned: 0 },
]

export const MOCK_INFLUENCER_INTEL: InfluencerIntel[] = [
  { id: 'i1', influencerName: 'Mia Tanaka', influencerHandle: '@miatravels', followers: '2.1M', destination: 'Tokyo', tip: 'Skip Shibuya crossing at golden hour — too crowded. Go at 11pm on a Tuesday. Just you and the lights.', category: 'CULTURE', verified: true, postedAt: '2 days ago', likes: 48200 },
  { id: 'i2', influencerName: 'Chef Marco Rossi', influencerHandle: '@marcocooks', followers: '890K', destination: 'Tokyo', tip: 'Ichiran ramen at 3am after the clubs. Order the special richness level 5, noodle firmness hard, green onion all. No exceptions.', category: 'FOOD', verified: true, postedAt: '1 week ago', likes: 31400 },
  { id: 'i3', influencerName: 'Søren Lindqvist', influencerHandle: '@sorenexplores', followers: '445K', destination: 'Tokyo', tip: 'Rent a bicycle and ride the Arakawa river path at dawn. You will see the real city waking up. Completely free.', category: 'NATURE', verified: true, postedAt: '3 days ago', likes: 22100 },
  { id: 'i4', influencerName: 'Luna Park', influencerHandle: '@lunagoesplaces', followers: '3.8M', destination: 'Tokyo', tip: 'Golden Gai in Shinjuku has 200 tiny bars. Pick the one with a handwritten menu and no English sign. That is the right one.', category: 'NIGHTLIFE', verified: true, postedAt: '5 days ago', likes: 89300 },
]

export const AI_TRIP_SUGGESTIONS: string[] = [
  'Based on your SURGE tier status, you qualify for priority hotel upgrades at 847 properties in Tokyo',
  'Flying on a Tuesday saves you $312 vs weekend — your preferred dates show high demand',
  'Your trading activity suggests you prefer flexibility — consider refundable hotel rates (+$40/night)',
  'TeamLab Borderless books out 6 weeks ahead — book today for your Jun 15 arrival',
  '4 Dustify members in your network visited Tokyo recently — check their local tips',
  'Adding Kyoto (2-night add-on, $180 train) turns this into a perfect 10-day itinerary',
]
