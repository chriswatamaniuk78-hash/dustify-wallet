// ============================================================
// DUST TRAVEL — Complete Data Layer v3
// Synthesized from: Hopper, TripIt, Skyscanner, Booking.com,
// Airbnb, Google Travel, Rome2Rio, Wanderlog, PackPoint, Kayak
// ============================================================

export interface Destination {
  id: string; city: string; country: string; flag: string
  image: string; tagline: string; avgTemp: string; bestMonth: string
  estimatedCost: number; flightHours: number; trending: boolean
  dustMiles: number; priceSignal: 'BUY_NOW' | 'WAIT' | 'FAIR'
  visaRequired: boolean; timezone: string; currency: string
  safetyScore: number; carbonKg: number; localTips: string[]
}

export interface FlightResult {
  id: string; airline: string; airlineCode: string
  origin: string; destination: string; departureTime: string; arrivalTime: string
  duration: string; stops: number; stopCity?: string
  price: number; originalPrice: number; priceSignal: 'BUY_NOW' | 'WAIT' | 'FAIR'
  predictedDrop?: number; dustMilesEarned: number
  class: 'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'
  seats: number; carbonKg: number; refundable: boolean; baggage: string
}

export interface HotelResult {
  id: string; name: string; stars: number; city: string
  pricePerNight: number; originalPrice: number; rating: number; reviews: number
  image: string; amenities: string[]; freeCancellation: boolean
  dustMilesEarned: number; deal: string | null
  priceSignal: 'BUY_NOW' | 'WAIT' | 'FAIR'; distance: string; neighborhood: string
}

export interface TripItem {
  id: string; type: 'FLIGHT' | 'HOTEL' | 'ACTIVITY' | 'CAR' | 'TRAIN' | 'FERRY' | 'RESTAURANT'
  icon: string; title: string; subtitle: string; time: string; date: string
  status: 'CONFIRMED' | 'PENDING' | 'CANCELLED' | 'COMPLETED'
  confirmationCode: string; price: number; dustMilesEarned: number
  notes?: string; address?: string; gateInfo?: string; seatInfo?: string
}

export interface SavedTrip {
  id: string; name: string; destination: string; flag: string
  dateRange: string; startDate: string; endDate: string; daysLeft: number
  totalValue: number; dustMilesEarned: number; items: TripItem[]
  collaborators: string[]; budgetTotal: number; budgetSpent: number; carbonKg: number
}

export interface Experience {
  id: string; title: string; city: string; country: string; flag: string
  category: string; rating: number; reviews: number; price: number
  duration: string; dustMilesEarned: number; image: string
  description: string; highlights: string[]; maxGroupSize: number
}

export interface BudgetExploreResult {
  destination: string; flag: string; flightPrice: number
  hotelPerNight: number; totalWeek: number; bestDeal: string
  priceSignal: 'BUY_NOW' | 'WAIT' | 'FAIR'
}

export interface VisaInfo {
  country: string; flag: string
  requirement: 'VISA_FREE' | 'ETA' | 'VISA_ON_ARRIVAL' | 'VISA_REQUIRED'
  maxStay: string; cost: string | null; processingTime: string | null; notes: string
}

export interface PackingCategory {
  id: string; name: string; icon: string; items: PackingItem[]
}
export interface PackingItem {
  id: string; name: string; essential: boolean
  weather?: string[]; activities?: string[]
}

export interface EmergencyContact {
  country: string; flag: string; police: string; ambulance: string
  fire: string; canadianEmbassy: string; touristPolice?: string
}

// ── Destinations ─────────────────────────────────────────────
export const DESTINATIONS: Destination[] = [
  { id: 'tyo', city: 'Tokyo', country: 'Japan', flag: '🇯🇵', image: 'tokyo', tagline: 'Neon temples, ramen at midnight', avgTemp: '8°C', bestMonth: 'Oct–Nov', estimatedCost: 3800, flightHours: 10, trending: true, dustMiles: 380, priceSignal: 'FAIR', visaRequired: false, timezone: 'JST +9', currency: 'JPY ¥', safetyScore: 9.4, carbonKg: 1840, localTips: ['Skip Tsukiji, go to Toyosu early AM', 'IC card for all transit', 'Lawson for late-night deals'] },
  { id: 'bar', city: 'Barcelona', country: 'Spain', flag: '🇪🇸', image: 'barcelona', tagline: 'Gaudí, tapas, beach all in one', avgTemp: '18°C', bestMonth: 'May–Jun', estimatedCost: 2400, flightHours: 9, trending: true, dustMiles: 240, priceSignal: 'BUY_NOW', visaRequired: false, timezone: 'CET +1', currency: 'EUR €', safetyScore: 7.8, carbonKg: 1620, localTips: ["La Boqueria is touristy — try Mercat de l'Abaceria", 'Sagrada Família book 3 weeks ahead', 'Late dinner = 10pm'] },
  { id: 'bkk', city: 'Bangkok', country: 'Thailand', flag: '🇹🇭', image: 'bangkok', tagline: 'Street food capital of earth', avgTemp: '32°C', bestMonth: 'Nov–Feb', estimatedCost: 1800, flightHours: 14, trending: false, dustMiles: 180, priceSignal: 'WAIT', visaRequired: false, timezone: 'ICT +7', currency: 'THB ฿', safetyScore: 8.1, carbonKg: 2240, localTips: ['BTS Skytrain > taxi always', 'Chatuchak market = sunrise', 'Grab is cheaper than Uber'] },
  { id: 'lis', city: 'Lisbon', country: 'Portugal', flag: '🇵🇹', image: 'lisbon', tagline: "Europe's most underrated gem", avgTemp: '20°C', bestMonth: 'Apr–Jun', estimatedCost: 2100, flightHours: 9, trending: true, dustMiles: 210, priceSignal: 'BUY_NOW', visaRequired: false, timezone: 'WET +0', currency: 'EUR €', safetyScore: 9.1, carbonKg: 1580, localTips: ['Tram 28 is beautiful but slow', 'Pastel de Nata at Pastéis de Belém', 'LX Factory Sunday market'] },
  { id: 'nyc', city: 'New York', country: 'USA', flag: '🇺🇸', image: 'newyork', tagline: 'The city that never sleeps', avgTemp: '12°C', bestMonth: 'Sep–Oct', estimatedCost: 4200, flightHours: 5, trending: false, dustMiles: 420, priceSignal: 'FAIR', visaRequired: true, timezone: 'EST -5', currency: 'USD $', safetyScore: 7.9, carbonKg: 820, localTips: ['OMNY tap for subway', 'Bagels at Russ & Daughters', 'Free: High Line, Staten Island Ferry'] },
  { id: 'yvr', city: 'Vancouver', country: 'Canada', flag: '🇨🇦', image: 'vancouver', tagline: 'Mountains meet the ocean', avgTemp: '10°C', bestMonth: 'Jun–Sep', estimatedCost: 2200, flightHours: 2, trending: false, dustMiles: 220, priceSignal: 'BUY_NOW', visaRequired: false, timezone: 'PST -8', currency: 'CAD $', safetyScore: 8.8, carbonKg: 240, localTips: ['Lynn Canyon Bridge is FREE (vs paid Capilano)', 'Granville Island Market mornings', 'SkyTrain to airport saves $40'] },
  { id: 'cnx', city: 'Chiang Mai', country: 'Thailand', flag: '🇹🇭', image: 'chiangmai', tagline: 'Temples, elephants, mountains', avgTemp: '26°C', bestMonth: 'Nov–Jan', estimatedCost: 1400, flightHours: 16, trending: true, dustMiles: 140, priceSignal: 'BUY_NOW', visaRequired: false, timezone: 'ICT +7', currency: 'THB ฿', safetyScore: 8.6, carbonKg: 2350, localTips: ['Red Songthaew taxi = $1/ride', 'Elephant Nature Park (certified ethical)', 'Night Bazaar for street food'] },
  { id: 'cdg', city: 'Paris', country: 'France', flag: '🇫🇷', image: 'paris', tagline: 'Every street a postcard', avgTemp: '14°C', bestMonth: 'Apr–Jun', estimatedCost: 3400, flightHours: 9, trending: false, dustMiles: 340, priceSignal: 'FAIR', visaRequired: false, timezone: 'CET +1', currency: 'EUR €', safetyScore: 7.4, carbonKg: 1590, localTips: ['Navigo weekly pass > day tickets', 'Louvre Wednesday nights until 9:45pm', 'Picnic by Seine > overpriced restaurants'] },
  { id: 'dxb', city: 'Dubai', country: 'UAE', flag: '🇦🇪', image: 'dubai', tagline: 'Architecture of the impossible', avgTemp: '28°C', bestMonth: 'Oct–Apr', estimatedCost: 3200, flightHours: 13, trending: false, dustMiles: 320, priceSignal: 'WAIT', visaRequired: false, timezone: 'GST +4', currency: 'AED د.إ', safetyScore: 9.2, carbonKg: 2180, localTips: ['Emirates metro > taxi', 'Dubai Frame beats Burj Khalifa price', 'Old Dubai spice souk is free'] },
  { id: 'mex', city: 'Mexico City', country: 'Mexico', flag: '🇲🇽', image: 'mexicocity', tagline: 'Food, art, culture overload', avgTemp: '20°C', bestMonth: 'Oct–Apr', estimatedCost: 1900, flightHours: 6, trending: true, dustMiles: 190, priceSignal: 'WAIT', visaRequired: false, timezone: 'CST -6', currency: 'MXN $', safetyScore: 6.8, carbonKg: 1020, localTips: ['Metro = $0.25 per ride', 'Tacos at El Turix for cochinita pibil', 'Anthropology Museum = world-class and cheap'] },
]

// ── Flights ───────────────────────────────────────────────────
export const MOCK_FLIGHTS: FlightResult[] = [
  { id: 'f1', airline: 'Air Canada', airlineCode: 'AC', origin: 'YEG', destination: 'NRT', departureTime: '14:30', arrivalTime: '17:45+1', duration: '11h 15m', stops: 0, price: 1284, originalPrice: 1560, priceSignal: 'FAIR', dustMilesEarned: 128, class: 'ECONOMY', seats: 4, carbonKg: 1840, refundable: true, baggage: '1 × 23kg' },
  { id: 'f2', airline: 'JAL', airlineCode: 'JL', origin: 'YEG', destination: 'NRT', departureTime: '09:15', arrivalTime: '14:30+1', duration: '10h 15m', stops: 1, stopCity: 'YVR', price: 987, originalPrice: 1100, priceSignal: 'BUY_NOW', dustMilesEarned: 98, class: 'ECONOMY', seats: 2, carbonKg: 1840, refundable: false, baggage: '2 × 23kg' },
  { id: 'f3', airline: 'WestJet', airlineCode: 'WS', origin: 'YEG', destination: 'YVR', departureTime: '07:00', arrivalTime: '08:15', duration: '1h 15m', stops: 0, price: 189, originalPrice: 240, priceSignal: 'BUY_NOW', dustMilesEarned: 18, class: 'ECONOMY', seats: 12, carbonKg: 124, refundable: false, baggage: 'Carry-on only' },
  { id: 'f4', airline: 'Finnair', airlineCode: 'AY', origin: 'YEG', destination: 'BCN', departureTime: '16:45', arrivalTime: '13:20+1', duration: '13h 35m', stops: 1, stopCity: 'HEL', price: 842, originalPrice: 1200, priceSignal: 'WAIT', predictedDrop: 65, dustMilesEarned: 84, class: 'ECONOMY', seats: 8, carbonKg: 1620, refundable: true, baggage: '1 × 23kg' },
  { id: 'f5', airline: 'Air Canada', airlineCode: 'AC', origin: 'YEG', destination: 'LHR', departureTime: '18:00', arrivalTime: '10:45+1', duration: '8h 45m', stops: 0, price: 1124, originalPrice: 1400, priceSignal: 'FAIR', dustMilesEarned: 112, class: 'PREMIUM_ECONOMY', seats: 3, carbonKg: 1590, refundable: true, baggage: '2 × 23kg' },
]

// ── Hotels ─────────────────────────────────────────────────────
export const MOCK_HOTELS: HotelResult[] = [
  { id: 'h1', name: 'Shinjuku Granbell Hotel', stars: 4, city: 'Tokyo', pricePerNight: 148, originalPrice: 200, rating: 8.7, reviews: 2840, image: 'hotel-tokyo', amenities: ['Free WiFi', 'Rooftop bar', 'City views', 'Metro 2min'], freeCancellation: true, dustMilesEarned: 74, deal: '26% off', priceSignal: 'BUY_NOW', distance: '350m from Shinjuku station', neighborhood: 'Shinjuku' },
  { id: 'h2', name: 'Hotel Arts Barcelona', stars: 5, city: 'Barcelona', pricePerNight: 340, originalPrice: 420, rating: 9.2, reviews: 1620, image: 'hotel-bcn', amenities: ['Pool', 'Beach access', 'Spa', 'Michelin restaurant'], freeCancellation: true, dustMilesEarned: 170, deal: '19% off', priceSignal: 'FAIR', distance: 'On Barceloneta beach', neighborhood: 'Barceloneta' },
  { id: 'h3', name: 'Generator Lisbon', stars: 3, city: 'Lisbon', pricePerNight: 89, originalPrice: 110, rating: 8.4, reviews: 4200, image: 'hotel-lis', amenities: ['Rooftop bar', 'Free WiFi', 'Social lounge', 'Tours desk'], freeCancellation: true, dustMilesEarned: 44, deal: '19% off', priceSignal: 'BUY_NOW', distance: '800m from Bairro Alto', neighborhood: 'Intendente' },
  { id: 'h4', name: 'The Surrey, NYC', stars: 5, city: 'New York', pricePerNight: 480, originalPrice: 620, rating: 9.1, reviews: 890, image: 'hotel-nyc', amenities: ['Central Park 1 block', 'Spa', 'Fine dining', 'Concierge'], freeCancellation: true, dustMilesEarned: 240, deal: '22% off', priceSignal: 'WAIT', distance: '1 block from Central Park', neighborhood: 'Upper East Side' },
]

// ── Experiences ────────────────────────────────────────────────
export const EXPERIENCES: Experience[] = [
  { id: 'e1', title: 'Tokyo Ramen Deep Dive', city: 'Tokyo', country: 'Japan', flag: '🇯🇵', category: 'Food & Drink', rating: 4.97, reviews: 842, price: 65, duration: '3.5 hours', dustMilesEarned: 16, image: 'ramen', description: 'Explore 5 legendary ramen shops locals actually eat at — with a Ramen sommelier.', highlights: ['Skip tourist traps', 'Meet the chefs', 'Secret back-street spots', 'Late-night tonkotsu'], maxGroupSize: 8 },
  { id: 'e2', title: 'Barcelona Street Art & Tapas', city: 'Barcelona', country: 'Spain', flag: '🇪🇸', category: 'Art & Culture', rating: 4.92, reviews: 1240, price: 45, duration: '3 hours', dustMilesEarned: 11, image: 'bcn-art', description: "Navigate El Raval's hidden murals with a local artist, ending with wine and tapas.", highlights: ['Meet street artists', 'Secret walls', 'Local tapas bar', 'Photography tips'], maxGroupSize: 10 },
  { id: 'e3', title: 'Chiang Mai Ethical Elephant Day', city: 'Chiang Mai', country: 'Thailand', flag: '🇹🇭', category: 'Nature', rating: 4.99, reviews: 2180, price: 85, duration: '8 hours', dustMilesEarned: 21, image: 'elephant', description: 'Feed, bathe, and care for rescued elephants at a certified ethical sanctuary.', highlights: ['No riding, only caring', 'Conservation education', 'Home-cooked Thai lunch', 'Pick-up included'], maxGroupSize: 12 },
]

// ── Saved Trips ────────────────────────────────────────────────
export const MOCK_SAVED_TRIPS: SavedTrip[] = [
  {
    id: 'trip-1', name: 'Vancouver Getaway', destination: 'Vancouver, BC', flag: '🇨🇦',
    dateRange: 'Feb 14 – 18', startDate: '2025-02-14', endDate: '2025-02-18',
    daysLeft: 28, totalValue: 2210, dustMilesEarned: 450,
    budgetTotal: 2500, budgetSpent: 2210, carbonKg: 248, collaborators: [],
    items: [
      { id: 'i1', type: 'FLIGHT', icon: '✈', title: 'AC 221 · YEG → YVR', subtitle: 'Air Canada Economy · Non-stop', time: '07:15 → 08:30', date: 'Feb 14', status: 'CONFIRMED', confirmationCode: 'AC8892', price: 189, dustMilesEarned: 18, gateInfo: 'Gate A22 · Terminal 1', seatInfo: '18C (Aisle)' },
      { id: 'i2', type: 'HOTEL', icon: '🏨', title: 'Fairmont Waterfront', subtitle: '4-star · Harbour View · Free cancellation', time: 'Check-in 15:00', date: 'Feb 14', status: 'CONFIRMED', confirmationCode: 'FW99821', price: 890, dustMilesEarned: 180, address: '900 Canada Place, Vancouver' },
      { id: 'i3', type: 'ACTIVITY', icon: '🏔', title: 'Capilano Suspension Bridge', subtitle: 'Treetop Adventure · 2h', time: '10:00 AM', date: 'Feb 15', status: 'CONFIRMED', confirmationCode: 'CAP3842', price: 68, dustMilesEarned: 17, address: '3735 Capilano Rd, North Vancouver' },
      { id: 'i4', type: 'RESTAURANT', icon: '🍽', title: 'Blue Water Café', subtitle: 'Dinner reservation · 4 guests', time: '19:30', date: 'Feb 15', status: 'CONFIRMED', confirmationCode: 'BWC2240', price: 320, dustMilesEarned: 32, address: '1095 Hamilton St, Vancouver' },
      { id: 'i5', type: 'FLIGHT', icon: '✈', title: 'AC 224 · YVR → YEG', subtitle: 'Air Canada Economy · Non-stop', time: '18:30 → 20:45', date: 'Feb 18', status: 'CONFIRMED', confirmationCode: 'AC8893', price: 189, dustMilesEarned: 18, gateInfo: 'Gate D14', seatInfo: '22A (Window)' },
    ],
  },
]

// ── Budget Explorer ────────────────────────────────────────────
export const BUDGET_EXPLORE: BudgetExploreResult[] = [
  { destination: 'Cancún', flag: '🇲🇽', flightPrice: 480, hotelPerNight: 65, totalWeek: 1025, bestDeal: 'All-inclusive deals available', priceSignal: 'BUY_NOW' },
  { destination: 'San José CR', flag: '🇨🇷', flightPrice: 520, hotelPerNight: 80, totalWeek: 1080, bestDeal: 'Eco-lodge packages from $95/night', priceSignal: 'BUY_NOW' },
  { destination: 'Havana', flag: '🇨🇺', flightPrice: 340, hotelPerNight: 55, totalWeek: 825, bestDeal: 'Direct flights from YEG weekly', priceSignal: 'FAIR' },
  { destination: 'Bogotá', flag: '🇨🇴', flightPrice: 680, hotelPerNight: 45, totalWeek: 995, bestDeal: 'Gateway to coffee region', priceSignal: 'WAIT' },
  { destination: 'Panama City', flag: '🇵🇦', flightPrice: 590, hotelPerNight: 70, totalWeek: 1080, bestDeal: 'Canal tours from $28', priceSignal: 'FAIR' },
  { destination: 'Guatemala City', flag: '🇬🇹', flightPrice: 620, hotelPerNight: 40, totalWeek: 900, bestDeal: 'Antigua day trips included', priceSignal: 'BUY_NOW' },
]

// ── Visa info ──────────────────────────────────────────────────
export const VISA_INFO: VisaInfo[] = [
  { country: 'Japan', flag: '🇯🇵', requirement: 'VISA_FREE', maxStay: '90 days', cost: null, processingTime: null, notes: 'Canadian passport: visa-free entry' },
  { country: 'Spain / EU', flag: '🇪🇸', requirement: 'VISA_FREE', maxStay: '90 days per 180', cost: null, processingTime: null, notes: 'Schengen zone applies' },
  { country: 'USA', flag: '🇺🇸', requirement: 'ETA', maxStay: '6 months', cost: 'USD $6', processingTime: '72 hours', notes: 'No interview required for Canadians' },
  { country: 'Australia', flag: '🇦🇺', requirement: 'ETA', maxStay: '3 months', cost: 'AUD $20', processingTime: 'Instant', notes: 'eVisitor via app or website' },
  { country: 'China', flag: '🇨🇳', requirement: 'VISA_REQUIRED', maxStay: '30 days', cost: 'CAD $75', processingTime: '4-7 days', notes: 'Apply via Chinese embassy' },
  { country: 'India', flag: '🇮🇳', requirement: 'VISA_ON_ARRIVAL', maxStay: '60 days', cost: 'USD $25', processingTime: 'At airport (2h)', notes: 'e-Visa online strongly recommended' },
]

// ── Packing categories ─────────────────────────────────────────
export const PACKING_CATEGORIES: PackingCategory[] = [
  { id: 'docs', name: 'Documents', icon: '📄', items: [
    { id: 'passport', name: 'Passport (6+ months validity)', essential: true },
    { id: 'visa', name: 'Visa / eTA printout', essential: false },
    { id: 'flight', name: 'Flight confirmations', essential: true },
    { id: 'hotel', name: 'Hotel bookings', essential: true },
    { id: 'insurance', name: 'Travel insurance card', essential: true },
    { id: 'emergency', name: 'Emergency contacts printed', essential: true },
    { id: 'copies', name: 'Passport photo copies (×2)', essential: true },
  ]},
  { id: 'tech', name: 'Electronics', icon: '🔌', items: [
    { id: 'phone', name: 'Phone + charger', essential: true },
    { id: 'adapter', name: 'Universal power adapter', essential: true },
    { id: 'powerbank', name: 'Power bank (10,000mAh+)', essential: true },
    { id: 'buds', name: 'Earbuds / headphones', essential: false },
    { id: 'camera', name: 'Camera', essential: false },
  ]},
  { id: 'health', name: 'Health & Safety', icon: '💊', items: [
    { id: 'meds', name: 'Prescription medications', essential: true },
    { id: 'pain', name: 'Pain reliever (ibuprofen)', essential: true },
    { id: 'sun', name: 'Sunscreen SPF50', essential: false, weather: ['sunny'] },
    { id: 'bug', name: 'Insect repellent DEET', essential: false, activities: ['nature'] },
    { id: 'sanitizer', name: 'Hand sanitizer', essential: true },
    { id: 'bandages', name: 'Blister bandages', essential: false },
  ]},
  { id: 'clothes', name: 'Clothing', icon: '👕', items: [
    { id: 'underwear', name: 'Underwear (×5)', essential: true },
    { id: 'socks', name: 'Socks (×4 pairs)', essential: true },
    { id: 'tshirts', name: 'T-shirts (×4)', essential: true },
    { id: 'pants', name: 'Pants (×2)', essential: true },
    { id: 'jacket', name: 'Light jacket', essential: false, weather: ['cool'] },
    { id: 'shoes', name: 'Comfortable walking shoes', essential: true },
    { id: 'swimwear', name: 'Swimwear', essential: false, activities: ['beach'] },
  ]},
  { id: 'misc', name: 'Miscellaneous', icon: '🎒', items: [
    { id: 'lock', name: 'TSA luggage lock', essential: true },
    { id: 'bag', name: 'Day backpack', essential: true },
    { id: 'water', name: 'Reusable water bottle', essential: true },
    { id: 'cards', name: 'No-fee travel credit card', essential: true },
    { id: 'cash', name: 'Local currency (small notes)', essential: true },
    { id: 'pillow', name: 'Travel neck pillow', essential: false },
  ]},
]

// ── Emergency contacts ─────────────────────────────────────────
export const EMERGENCY_CONTACTS: EmergencyContact[] = [
  { country: 'Japan', flag: '🇯🇵', police: '110', ambulance: '119', fire: '119', canadianEmbassy: '+81-3-5412-6200', touristPolice: 'English available: 110' },
  { country: 'Spain', flag: '🇪🇸', police: '091', ambulance: '112', fire: '080', canadianEmbassy: '+34-91-382-8400', touristPolice: '902 102 112' },
  { country: 'Thailand', flag: '🇹🇭', police: '191', ambulance: '1669', fire: '199', canadianEmbassy: '+66-2-636-0540', touristPolice: '1155' },
  { country: 'USA', flag: '🇺🇸', police: '911', ambulance: '911', fire: '911', canadianEmbassy: '+1-202-682-1740' },
  { country: 'France', flag: '🇫🇷', police: '17', ambulance: '15', fire: '18', canadianEmbassy: '+33-1-44-43-29-02', touristPolice: '3117' },
]

export const TRENDING_DESTINATIONS = DESTINATIONS.filter(d => d.trending)
export const AI_TRIP_SUGGESTIONS = [
  { destination: 'Lisbon', flag: '🇵🇹', estimatedCost: 2100, bestMonth: 'April', why: 'Perfect spring weather, low crowds, incredible food & architecture', priceSignal: 'BUY_NOW' as const },
  { destination: 'Chiang Mai', flag: '🇹🇭', estimatedCost: 1400, bestMonth: 'November', why: 'Mountains, temples, best Thai food. 40% cheaper than Bangkok.', priceSignal: 'BUY_NOW' as const },
  { destination: 'Mexico City', flag: '🇲🇽', estimatedCost: 1900, bestMonth: 'October', why: 'Día de los Muertos, incredible street food, world-class museums', priceSignal: 'FAIR' as const },
]

export function formatCAD(amount: number): string {
  return new Intl.NumberFormat('en-CA', { style: 'currency', currency: 'CAD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 0, maximumFractionDigits: 0 }).format(amount)
}
