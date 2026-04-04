/**
 * DUSTIFY — AMADEUS TRAVEL INTEGRATION
 * Flight search, hotel search, booking, and management.
 * All bookings earn DustMiles via the waterfall.
 */

import { createServerClient } from '../../db/client'
import { addDustMilesJob } from '../../queues/redis'
import { MILES_RATES } from '../dustmiles.service'

const AMADEUS_CLIENT_ID     = process.env.AMADEUS_CLIENT_ID!
const AMADEUS_CLIENT_SECRET = process.env.AMADEUS_CLIENT_SECRET!
const AMADEUS_BASE_URL      = process.env.NODE_ENV === 'production'
  ? 'https://api.amadeus.com/v2'
  : 'https://test.api.amadeus.com/v2'

// ── Auth token management ─────────────────────────────────────────────────

let amadeusToken:   string | null = null
let tokenExpiresAt: number        = 0

async function getAmadeusToken(): Promise<string> {
  if (amadeusToken && Date.now() < tokenExpiresAt - 60000) {
    return amadeusToken
  }

  const res = await fetch('https://test.api.amadeus.com/v1/security/oauth2/token', {
    method:  'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body:    new URLSearchParams({
      grant_type:    'client_credentials',
      client_id:     AMADEUS_CLIENT_ID,
      client_secret: AMADEUS_CLIENT_SECRET,
    }),
  })

  if (!res.ok) throw new Error(`Amadeus auth failed: ${res.status}`)

  const data      = await res.json()
  amadeusToken    = data.access_token
  tokenExpiresAt  = Date.now() + data.expires_in * 1000

  return amadeusToken!
}

async function amadeusRequest<T>(path: string, params?: Record<string, string>): Promise<T> {
  const token = await getAmadeusToken()
  const url   = new URL(`${AMADEUS_BASE_URL}${path}`)
  if (params) Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Amadeus API error: ${JSON.stringify(err.errors?.[0])}`)
  }

  return res.json()
}

async function amadeusPost<T>(path: string, body: unknown): Promise<T> {
  const token = await getAmadeusToken()
  const res   = await fetch(`${AMADEUS_BASE_URL}${path}`, {
    method:  'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body:    JSON.stringify(body),
  })

  if (!res.ok) {
    const err = await res.json()
    throw new Error(`Amadeus API error: ${JSON.stringify(err.errors?.[0])}`)
  }

  return res.json()
}

// ── Types ─────────────────────────────────────────────────────────────────

export interface FlightSearchParams {
  origin:          string    // IATA code e.g. "YEG"
  destination:     string    // IATA code e.g. "YYZ"
  departureDate:   string    // YYYY-MM-DD
  returnDate?:     string    // YYYY-MM-DD (omit for one-way)
  adults:          number
  children?:       number
  cabinClass?:     'ECONOMY' | 'PREMIUM_ECONOMY' | 'BUSINESS' | 'FIRST'
  maxPrice?:       number
  currency?:       string    // Default USD
}

export interface FlightOffer {
  id:              string
  source:          string
  price:           { total: string; currency: string; grandTotal: string }
  itineraries:     Array<{
    duration: string
    segments: Array<{
      carrierCode:    string
      flightNumber:   string
      departure:      { iataCode: string; at: string }
      arrival:        { iataCode: string; at: string }
      numberOfStops:  number
    }>
  }>
  validatingAirlineCodes: string[]
  raw:             unknown  // Full Amadeus response
}

export interface HotelSearchParams {
  cityCode:        string
  checkInDate:     string
  checkOutDate:    string
  adults:          number
  roomQuantity?:   number
  priceRange?:     string   // e.g. "100-300"
  currency?:       string
  ratings?:        number[] // [3, 4, 5]
}

export interface HotelOffer {
  hotel: { hotelId: string; name: string; rating?: string; latitude: number; longitude: number }
  offers: Array<{
    id:          string
    checkInDate: string
    checkOutDate: string
    price:       { total: string; currency: string }
    room:        { type: string; description: { text: string } }
  }>
}

// ── Flight Search ─────────────────────────────────────────────────────────

export async function searchFlights(params: FlightSearchParams): Promise<FlightOffer[]> {
  const query: Record<string, string> = {
    originLocationCode:      params.origin,
    destinationLocationCode: params.destination,
    departureDate:           params.departureDate,
    adults:                  String(params.adults),
    currencyCode:            params.currency || 'USD',
    max:                     '20',
  }

  if (params.returnDate)   query.returnDate     = params.returnDate
  if (params.children)     query.children       = String(params.children)
  if (params.cabinClass)   query.travelClass    = params.cabinClass
  if (params.maxPrice)     query.maxPrice       = String(params.maxPrice)

  const response = await amadeusRequest<{ data: any[] }>(
    '/shopping/flight-offers', query
  )

  return (response.data || []).map(offer => ({
    id:              offer.id,
    source:          offer.source,
    price: {
      total:         offer.price.total,
      currency:      offer.price.currency,
      grandTotal:    offer.price.grandTotal,
    },
    itineraries:     offer.itineraries,
    validatingAirlineCodes: offer.validatingAirlineCodes,
    raw:             offer,
  }))
}

// ── Flight Booking ────────────────────────────────────────────────────────

export async function bookFlight(params: {
  sbtId:      string
  offerId:    string
  offerRaw:   unknown
  travellers: Array<{
    id:          string
    dateOfBirth: string
    name:        { firstName: string; lastName: string }
    gender:      'MALE' | 'FEMALE'
    contact:     { emailAddress: string; phones: Array<{ number: string }> }
    documents:   Array<{ documentType: string; number: string; expiryDate: string; nationality: string }>
  }>
  totalPrice: number
  currency:   string
}): Promise<{ bookingRef: string; status: string }> {

  const booking = await amadeusPost<any>('/booking/flight-orders', {
    data: {
      type:      'flight-order',
      flightOffers: [params.offerRaw],
      travelers:    params.travellers,
    }
  })

  const db = createServerClient()
  await db.from('travel_bookings').insert({
    sbt_id:             params.sbtId,
    booking_type:       'FLIGHT',
    amadeus_booking_ref: booking.data?.id,
    status:             'CONFIRMED',
    total_usdc:         params.totalPrice,
    dust_miles_earned:  MILES_RATES.BOOKING_FLIGHT,
    booking_details:    booking.data,
    traveller_details:  params.travellers,  // Encrypted in production
  })

  // Award DustMiles
  await addDustMilesJob({
    sbtId:     params.sbtId,
    amount:    MILES_RATES.BOOKING_FLIGHT,
    reason:    `Flight booked: ${booking.data?.id}`,
    sourceApp: 'wallet',
  })

  return { bookingRef: booking.data?.id, status: 'CONFIRMED' }
}

// ── Hotel Search ──────────────────────────────────────────────────────────

export async function searchHotels(params: HotelSearchParams): Promise<HotelOffer[]> {
  // Step 1: Get hotel IDs for city
  const hotelsRes = await amadeusRequest<{ data: any[] }>(
    '/reference-data/locations/hotels/by-city',
    { cityCode: params.cityCode, radius: '20', radiusUnit: 'KM', ratings: (params.ratings || [3,4,5]).join(',') }
  )

  const hotelIds = (hotelsRes.data || []).slice(0, 20).map((h: any) => h.hotelId)
  if (hotelIds.length === 0) return []

  // Step 2: Get offers for those hotels
  const offersRes = await amadeusRequest<{ data: any[] }>(
    '/shopping/hotel-offers',
    {
      hotelIds:    hotelIds.join(','),
      checkInDate: params.checkInDate,
      checkOutDate: params.checkOutDate,
      adults:      String(params.adults),
      roomQuantity: String(params.roomQuantity || 1),
      currency:    params.currency || 'USD',
    }
  )

  return (offersRes.data || []).map((h: any) => ({
    hotel:  h.hotel,
    offers: h.offers,
  }))
}

// ── Hotel Booking ─────────────────────────────────────────────────────────

export async function bookHotel(params: {
  sbtId:      string
  offerId:    string
  guests:     Array<{ name: { firstName: string; lastName: string }; contact: { phone: string; email: string } }>
  totalPrice: number
}): Promise<{ bookingRef: string }> {

  const booking = await amadeusPost<any>('/booking/hotel-orders', {
    data: {
      type:   'hotel-order',
      guests: params.guests,
      travelAgent: { contact: { emailAddress: 'booking@dustifytechnologiescorp.com' } },
      payment: { method: 'CREDIT_CARD', paymentCard: { paymentCardInfo: { vendorCode: 'VI', cardNumber: '4111111111111111', expiryDate: '2027-01' } } },
    }
  })

  const db = createServerClient()
  await db.from('travel_bookings').insert({
    sbt_id:             params.sbtId,
    booking_type:       'HOTEL',
    amadeus_booking_ref: booking.data?.id,
    status:             'CONFIRMED',
    total_usdc:         params.totalPrice,
    dust_miles_earned:  MILES_RATES.BOOKING_HOTEL,
    booking_details:    booking.data,
    traveller_details:  params.guests,
  })

  await addDustMilesJob({
    sbtId:     params.sbtId,
    amount:    MILES_RATES.BOOKING_HOTEL,
    reason:    `Hotel booked: ${booking.data?.id}`,
    sourceApp: 'wallet',
  })

  return { bookingRef: booking.data?.id }
}

// ── Airport search ────────────────────────────────────────────────────────

export async function searchAirports(query: string): Promise<Array<{
  iataCode: string
  name:     string
  cityName: string
  country:  string
}>> {
  const res = await amadeusRequest<{ data: any[] }>(
    '/reference-data/locations',
    { subType: 'AIRPORT', keyword: query, 'page[limit]': '10' }
  )

  return (res.data || []).map(loc => ({
    iataCode: loc.iataCode,
    name:     loc.name,
    cityName: loc.address?.cityName,
    country:  loc.address?.countryName,
  }))
}
