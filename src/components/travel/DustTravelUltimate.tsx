'use client'
// ============================================================
// DUST TRAVEL — The World's Best Travel Sub-App
// ============================================================
// Research synthesis — built into every feature:
//
// LOVED (kept & enhanced):
// → Hopper: 95% price prediction accuracy, price freeze, Watch a Trip
// → TripIt: Auto-itinerary, offline mode, real-time gate alerts, 10yr history
// → Skyscanner: Price calendar, flexible "anywhere" search, price alerts
// → PackPoint: Weather+activity packing lists, check-off system
// → Airbnb: Curated Experiences, local insider tips
// → Booking.com: Free cancellation badge prominently shown
// → Rome2Rio: Multi-modal transport options
// → Kayak: Budget Explorer ("where can I go for $X?")
// → Google Travel: AI trip planner, collaborative features
//
// HATED (fixed):
// → No paywalls — everything free in Soul Wallet
// → No spam notifications — push alerts only when you want
// → No cluttered homepage — clean tab system
// → No email parsing failures — manual import + structured data
// → No hidden fees — DustMiles 2.5% vs Expedia 18%
// → Apps don't talk — travel integrates with wallet, bot earns miles
// → No rewards with real value — DustMiles = USDC
// ============================================================

import { useState, useEffect, useRef } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import {
  DESTINATIONS, MOCK_FLIGHTS, MOCK_HOTELS, EXPERIENCES, MOCK_SAVED_TRIPS,
  BUDGET_EXPLORE, VISA_INFO, PACKING_CATEGORIES, EMERGENCY_CONTACTS,
  AI_TRIP_SUGGESTIONS, TRENDING_DESTINATIONS,
  formatCAD, type Destination, type FlightResult, type HotelResult,
  type SavedTrip, type TripItem,
} from '@/lib/travel-data'

type TravelTab = 'discover' | 'flights' | 'hotels' | 'my-trips' | 'experiences' | 'tools'

// ── Price prediction component ────────────────────────────────
function PriceBadge({ signal, savings }: { signal: 'BUY_NOW' | 'WAIT' | 'FAIR'; savings?: number }) {
  const cfg = {
    BUY_NOW: { emoji: '🔥', label: 'Buy now',   color: '#f87171', bg: 'rgba(248,113,113,0.1)', tip: 'Prices rising. Book today.' },
    WAIT:    { emoji: '⏳', label: 'Wait',      color: '#D4AF37', bg: 'rgba(212,175,55,0.1)', tip: savings ? `Could drop ~${formatCAD(savings)} in 7d` : 'Price may drop soon.' },
    FAIR:    { emoji: '✓',  label: 'Fair price', color: '#4ade80', bg: 'rgba(74,222,128,0.1)', tip: 'This is a fair price.' },
  }[signal]

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 100, background: cfg.bg, border: `1px solid ${cfg.color}25` }}>
      <span style={{ fontSize: 11 }}>{cfg.emoji}</span>
      <span className="font-mono" style={{ fontSize: 10, color: cfg.color, fontWeight: 500 }}>{cfg.label}</span>
      <span className="font-mono" style={{ fontSize: 9, color: cfg.color, opacity: 0.7 }}>· {cfg.tip}</span>
    </div>
  )
}

// ── Destination card ──────────────────────────────────────────
function DestCard({ dest, onSelect }: { dest: Destination; onSelect: (d: Destination) => void }) {
  const [hovered, setHovered] = useState(false)
  return (
    <div
      onClick={() => onSelect(dest)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        padding: '20px', borderRadius: 14, cursor: 'pointer', transition: 'all 0.2s',
        background: hovered ? 'var(--glass-2)' : 'var(--glass-1)',
        border: `1px solid ${hovered ? 'var(--border-gold-1)' : 'var(--border-gold-0)'}`,
        transform: hovered ? 'translateY(-2px)' : 'none',
      }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ fontSize: 36, lineHeight: 1 }}>{dest.flag}</div>
        <div style={{ textAlign: 'right' }}>
          {dest.trending && (
            <div className="font-mono" style={{ fontSize: 9, padding: '2px 7px', borderRadius: 100, background: 'rgba(248,113,113,0.1)', color: '#f87171', border: '1px solid rgba(248,113,113,0.25)', marginBottom: 4 }}>
              TRENDING
            </div>
          )}
          <div className="font-display" style={{ fontSize: 22, color: 'var(--gold)', fontWeight: 500 }}>{formatCAD(dest.estimatedCost)}</div>
          <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>est. 7 days</div>
        </div>
      </div>

      <div className="font-display" style={{ fontSize: 18, fontWeight: 500, marginBottom: 3 }}>{dest.city}</div>
      <div className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)', fontStyle: 'italic', marginBottom: 10 }}>{dest.tagline}</div>

      <PriceBadge signal={dest.priceSignal} />

      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        {[
          { v: dest.avgTemp, icon: '🌡' },
          { v: `${dest.flightHours}h flight`, icon: '✈' },
          { v: dest.bestMonth, icon: '📅' },
          { v: dest.visaRequired ? 'Visa needed' : 'Visa-free 🇨🇦', icon: null },
        ].map(s => (
          <div key={s.v} style={{ display: 'flex', alignItems: 'center', gap: 3, padding: '3px 8px', background: 'var(--glass-2)', borderRadius: 100, border: '1px solid var(--border-void)' }}>
            {s.icon && <span style={{ fontSize: 10 }}>{s.icon}</span>}
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{s.v}</span>
          </div>
        ))}
      </div>

      {/* Safety score */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 10 }}>
        <div style={{ flex: 1, height: 3, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden' }}>
          <div style={{ width: `${dest.safetyScore * 10}%`, height: '100%', background: dest.safetyScore >= 8 ? 'var(--success)' : dest.safetyScore >= 6 ? 'var(--warning)' : 'var(--danger)', borderRadius: 100 }} />
        </div>
        <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>Safety {dest.safetyScore}/10</span>
      </div>
    </div>
  )
}

// ── Destination detail modal ──────────────────────────────────
function DestDetail({ dest, onClose }: { dest: Destination; onClose: () => void }) {
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(12px)', zIndex: 100, overflow: 'auto', padding: 20, display: 'flex', alignItems: 'flex-start', justifyContent: 'center' }}>
      <div className="glass-heavy" style={{ width: '100%', maxWidth: 560, padding: 28, borderRadius: 20, marginTop: 20 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
            <span style={{ fontSize: 48 }}>{dest.flag}</span>
            <div>
              <h2 className="font-display" style={{ fontSize: 28, fontWeight: 500, marginBottom: 4 }}>{dest.city}, {dest.country}</h2>
              <p className="font-body" style={{ fontSize: 14, color: 'var(--text-secondary)', fontStyle: 'italic' }}>{dest.tagline}</p>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer', fontSize: 22, padding: '4px 8px' }}>×</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 20 }}>
          {[
            { label: 'Estimated 7 days', value: formatCAD(dest.estimatedCost), color: 'var(--gold)' },
            { label: 'Best time to visit', value: dest.bestMonth, color: 'var(--text-primary)' },
            { label: 'Flight from YEG', value: `~${dest.flightHours}h`, color: 'var(--text-primary)' },
            { label: 'Safety score', value: `${dest.safetyScore}/10`, color: dest.safetyScore >= 8 ? 'var(--success)' : 'var(--warning)' },
            { label: 'Carbon footprint', value: `${dest.carbonKg.toLocaleString()} kg CO₂`, color: 'var(--text-secondary)' },
            { label: 'Currency', value: dest.currency, color: 'var(--text-primary)' },
          ].map(s => (
            <div key={s.label} style={{ padding: '12px 14px', background: 'var(--glass-1)', borderRadius: 10, border: '1px solid var(--border-void)' }}>
              <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4, letterSpacing: '0.1em' }}>{s.label.toUpperCase()}</div>
              <div className="font-mono" style={{ fontSize: 14, color: s.color, fontWeight: 500 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* Visa info */}
        <div style={{ padding: '14px 16px', borderRadius: 10, marginBottom: 16, background: dest.visaRequired ? 'rgba(251,191,36,0.08)' : 'rgba(74,222,128,0.05)', border: `1px solid ${dest.visaRequired ? 'rgba(251,191,36,0.25)' : 'rgba(74,222,128,0.2)'}` }}>
          <div className="font-mono" style={{ fontSize: 11, color: dest.visaRequired ? 'var(--warning)' : 'var(--success)', fontWeight: 500 }}>
            {dest.visaRequired ? '⚠ Visa required for Canadians' : '✓ Visa-free entry for Canadians'}
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 3 }}>Timezone: {dest.timezone}</div>
        </div>

        {/* Local tips */}
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-tertiary)', marginBottom: 10 }}>LOCAL INSIDER TIPS</div>
        {dest.localTips.map((tip, i) => (
          <div key={i} style={{ display: 'flex', gap: 8, padding: '8px 0', borderBottom: i < dest.localTips.length - 1 ? '1px solid var(--border-void)' : 'none' }}>
            <span style={{ color: 'var(--gold)', fontSize: 12, flexShrink: 0 }}>◆</span>
            <span className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{tip}</span>
          </div>
        ))}

        <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
          <button onClick={onClose} className="btn-glass" style={{ flex: 1, padding: '12px' }}>Back</button>
          <button className="btn-sovereign" style={{ flex: 2, padding: '12px', fontSize: 14 }}>
            Search flights to {dest.city} →
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Flight card ────────────────────────────────────────────────
function FlightCard({ flight }: { flight: FlightResult }) {
  const [booked, setBooked] = useState(false)
  const [booking, setBooking] = useState(false)

  async function book() {
    setBooking(true); await new Promise(r => setTimeout(r, 1600)); setBooking(false); setBooked(true)
  }

  const discount = Math.round(((flight.originalPrice - flight.price) / flight.originalPrice) * 100)

  return (
    <div style={{
      padding: '18px 20px', background: 'var(--glass-1)', borderRadius: 14,
      border: `1px solid ${booked ? 'var(--border-gold-2)' : 'var(--border-gold-0)'}`, marginBottom: 10,
    }}>
      {/* Top: airline + price */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: 'var(--glass-2)', border: '1px solid var(--border-void)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span className="font-mono" style={{ fontSize: 12, color: 'var(--gold)', fontWeight: 600 }}>{flight.airlineCode}</span>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 500 }}>{flight.airline}</div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{flight.class.replace('_', ' ')} · {flight.baggage}</div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="font-display" style={{ fontSize: 24, color: 'var(--gold)', fontWeight: 500 }}>{formatCAD(flight.price)}</div>
          {discount > 0 && <div className="font-mono" style={{ fontSize: 10, color: 'var(--success)' }}>{discount}% off · was {formatCAD(flight.originalPrice)}</div>}
        </div>
      </div>

      {/* Route visualization */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
        <div style={{ textAlign: 'center' }}>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 600 }}>{flight.origin}</div>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{flight.departureTime}</div>
        </div>
        <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
          <div style={{ flex: 1, height: 1, background: 'var(--border-gold-1)' }} />
          <div style={{ padding: '4px 10px', background: 'var(--glass-2)', border: '1px solid var(--border-void)', borderRadius: 100, whiteSpace: 'nowrap' }}>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>
              {flight.duration} · {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop${flight.stops > 1 ? 's' : ''}${flight.stopCity ? ` (${flight.stopCity})` : ''}`}
            </span>
          </div>
          <div style={{ flex: 1, height: 1, background: 'var(--border-gold-1)' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 600 }}>{flight.destination}</div>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>{flight.arrivalTime}</div>
        </div>
      </div>

      {/* Badges row */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center' }}>
        <PriceBadge signal={flight.priceSignal} savings={flight.predictedDrop} />
        {flight.refundable && (
          <div className="font-mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(74,222,128,0.08)', color: 'var(--success)', border: '1px solid rgba(74,222,128,0.2)' }}>
            Free cancellation
          </div>
        )}
        <div className="font-mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'var(--gold-glass-1)', color: 'var(--gold-warm)', border: '1px solid var(--border-gold-0)' }}>
          +{flight.dustMilesEarned} DM
        </div>
        <div className="font-mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'var(--glass-2)', color: 'var(--text-tertiary)' }}>
          {flight.carbonKg.toLocaleString()} kg CO₂
        </div>
        {flight.seats <= 4 && (
          <div className="font-mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(248,113,113,0.08)', color: 'var(--danger)', border: '1px solid rgba(248,113,113,0.2)', animation: 'pulseGold 2s ease-in-out infinite' }}>
            Only {flight.seats} seats left
          </div>
        )}
      </div>

      {/* Book button */}
      {booked ? (
        <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', textAlign: 'center' }}>
          <div className="font-mono" style={{ fontSize: 12, color: 'var(--success)' }}>✓ Booked · Confirmation emailed · +{flight.dustMilesEarned} DustMiles earned</div>
        </div>
      ) : (
        <button onClick={book} disabled={booking} className="btn-sovereign" style={{ width: '100%', padding: '12px', fontSize: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          {booking ? <Spinner size={16} /> : null}
          {booking ? 'Booking with SBT...' : `Book · ${formatCAD(flight.price)}`}
        </button>
      )}
    </div>
  )
}

// ── Hotel card ─────────────────────────────────────────────────
function HotelCard({ hotel }: { hotel: HotelResult }) {
  const [booked, setBooked] = useState(false)
  const [booking, setBooking] = useState(false)
  async function book() { setBooking(true); await new Promise(r => setTimeout(r, 1600)); setBooking(false); setBooked(true) }
  const discount = Math.round(((hotel.originalPrice - hotel.pricePerNight) / hotel.originalPrice) * 100)
  return (
    <div style={{ padding: '18px 20px', background: 'var(--glass-1)', borderRadius: 14, border: `1px solid ${booked ? 'var(--border-gold-2)' : 'var(--border-gold-0)'}`, marginBottom: 10 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
        <div style={{ flex: 1, paddingRight: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
            <span className="font-display" style={{ fontSize: 16, fontWeight: 500 }}>{hotel.name}</span>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--gold)' }}>{'★'.repeat(hotel.stars)}</span>
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8 }}>
            {hotel.neighborhood} · {hotel.distance}
          </div>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {hotel.amenities.slice(0, 3).map(a => (
              <div key={a} style={{ padding: '2px 8px', background: 'var(--glass-2)', borderRadius: 100, fontSize: 10, fontFamily: "'JetBrains Mono', monospace", color: 'var(--text-secondary)' }}>{a}</div>
            ))}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="font-display" style={{ fontSize: 24, color: 'var(--gold)', fontWeight: 500 }}>{formatCAD(hotel.pricePerNight)}</div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>/night</div>
          {discount > 0 && <div className="font-mono" style={{ fontSize: 10, color: 'var(--success)' }}>{discount}% off</div>}
        </div>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <span style={{ color: 'var(--gold)' }}>★</span>
          <span className="font-mono" style={{ fontSize: 12, fontWeight: 500 }}>{hotel.rating}</span>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>({hotel.reviews.toLocaleString()} reviews)</span>
        </div>
        <PriceBadge signal={hotel.priceSignal} />
        {hotel.freeCancellation && <div className="font-mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(74,222,128,0.08)', color: 'var(--success)', border: '1px solid rgba(74,222,128,0.2)' }}>Free cancellation</div>}
        {hotel.deal && <div className="font-mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'rgba(248,113,113,0.08)', color: '#f87171', border: '1px solid rgba(248,113,113,0.2)' }}>{hotel.deal}</div>}
        <div className="font-mono" style={{ fontSize: 10, padding: '2px 8px', borderRadius: 100, background: 'var(--gold-glass-1)', color: 'var(--gold-warm)', border: '1px solid var(--border-gold-0)' }}>+{hotel.dustMilesEarned} DM/night</div>
      </div>
      {booked ? (
        <div style={{ padding: '12px', borderRadius: 10, background: 'rgba(74,222,128,0.08)', border: '1px solid rgba(74,222,128,0.25)', textAlign: 'center' }}>
          <div className="font-mono" style={{ fontSize: 12, color: 'var(--success)' }}>✓ Reserved · Confirmation emailed · +{hotel.dustMilesEarned} DustMiles/night</div>
        </div>
      ) : (
        <button onClick={book} disabled={booking} className="btn-sovereign" style={{ width: '100%', padding: '12px', fontSize: 14 }}>
          {booking ? 'Reserving...' : `Reserve · ${formatCAD(hotel.pricePerNight)}/night`}
        </button>
      )}
    </div>
  )
}

// ── Trip itinerary (TripIt-killer) ─────────────────────────────
function TripItinerary() {
  const [expanded, setExpanded] = useState<string | null>('trip-1')
  const [checked, setChecked] = useState<Set<string>>(new Set())

  function statusColor(s: string) { return { CONFIRMED: 'var(--success)', PENDING: 'var(--warning)', CANCELLED: 'var(--danger)', COMPLETED: 'var(--text-tertiary)' }[s] ?? 'var(--text-tertiary)' }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'rgba(74,222,128,0.05)', border: '1px solid rgba(74,222,128,0.2)', borderRadius: 10 }}>
        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 8px var(--success)' }} />
        <span className="font-mono" style={{ fontSize: 11, color: 'var(--success)' }}>Offline mode active · All itineraries available without internet</span>
      </div>

      {MOCK_SAVED_TRIPS.map(trip => (
        <div key={trip.id} className="glass" style={{ overflow: 'hidden' }}>
          {/* Header */}
          <div style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }} onClick={() => setExpanded(expanded === trip.id ? null : trip.id)}>
            <span style={{ fontSize: 36 }}>{trip.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 3 }}>
                <span className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>{trip.name}</span>
                <span style={{ padding: '2px 8px', borderRadius: 100, background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-1)' }}>
                  <span className="font-mono" style={{ fontSize: 9, color: 'var(--gold)' }}>{trip.daysLeft}d away</span>
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                {trip.dateRange} · {trip.items.length} bookings · +{trip.dustMilesEarned.toLocaleString()} DM earned
              </div>
              {/* Budget bar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                <div style={{ flex: 1, height: 3, background: 'var(--glass-3)', borderRadius: 100, overflow: 'hidden' }}>
                  <div style={{ width: `${(trip.budgetSpent / trip.budgetTotal) * 100}%`, height: '100%', background: trip.budgetSpent > trip.budgetTotal * 0.9 ? 'var(--warning)' : 'var(--success)', borderRadius: 100 }} />
                </div>
                <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', whiteSpace: 'nowrap' }}>{formatCAD(trip.budgetSpent)} / {formatCAD(trip.budgetTotal)}</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="font-display" style={{ fontSize: 22, color: 'var(--gold)' }}>{formatCAD(trip.totalValue)}</div>
              <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{trip.carbonKg} kg CO₂</div>
            </div>
          </div>

          {/* Timeline */}
          {expanded === trip.id && (
            <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-void)' }}>
              <div style={{ position: 'relative', marginTop: 20 }}>
                <div style={{ position: 'absolute', left: 17, top: 24, bottom: 24, width: 1, background: 'var(--border-gold-0)' }} />
                {trip.items.map((item, i) => (
                  <div key={item.id} style={{ display: 'flex', gap: 14, marginBottom: 14 }}>
                    <div style={{ width: 34, height: 34, borderRadius: 10, flexShrink: 0, zIndex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, background: 'var(--glass-2)', border: '1px solid var(--border-gold-1)' }}>
                      {item.icon}
                    </div>
                    <div style={{ flex: 1, paddingTop: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{item.title}</div>
                          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 3 }}>{item.subtitle}</div>
                          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                            {item.date} · {item.time}
                            {item.gateInfo && <span style={{ marginLeft: 8, color: 'var(--gold-dim)' }}>· {item.gateInfo}</span>}
                            {item.seatInfo && <span style={{ marginLeft: 8, color: 'var(--gold-dim)' }}>· {item.seatInfo}</span>}
                          </div>
                        </div>
                        <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 12 }}>
                          <div className="font-mono" style={{ fontSize: 9, color: statusColor(item.status), marginBottom: 4 }}>● {item.status}</div>
                          <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>{item.confirmationCode}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                <button className="btn-glass" style={{ flex: 1, padding: '10px', fontSize: 12 }}>📤 Share</button>
                <button className="btn-glass" style={{ flex: 1, padding: '10px', fontSize: 12 }}>📥 Export PDF</button>
                <button className="btn-sovereign" style={{ flex: 2, padding: '10px', fontSize: 12 }}>🔔 Gate alerts ON</button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button className="btn-glass" style={{ padding: '12px', fontSize: 13 }}>+ Import booking (forward confirmation email)</button>
    </div>
  )
}

// ── Packing list ───────────────────────────────────────────────
function PackingList() {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [destination, setDestination] = useState('Vancouver')
  const [days, setDays] = useState(5)

  function toggle(id: string) { setChecked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n }) }

  const allItems = PACKING_CATEGORIES.flatMap(c => c.items)
  const pct = Math.round((checked.size / allItems.length) * 100)

  return (
    <div className="glass" style={{ padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Packing for {destination}</div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{days} nights · {allItems.length} items</div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="font-display" style={{ fontSize: 28, color: pct === 100 ? 'var(--success)' : 'var(--gold)' }}>{pct}%</div>
          <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>packed</div>
        </div>
      </div>

      <div style={{ height: 4, background: 'var(--glass-3)', borderRadius: 100, marginBottom: 24, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--gold)', borderRadius: 100, transition: 'width 0.4s ease' }} />
      </div>

      {PACKING_CATEGORIES.map(cat => {
        const catChecked = cat.items.filter(i => checked.has(i.id)).length
        return (
          <div key={cat.id} style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 16 }}>{cat.icon}</span>
              <span className="font-mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-tertiary)' }}>{cat.name.toUpperCase()}</span>
              <span className="font-mono" style={{ fontSize: 10, color: catChecked === cat.items.length ? 'var(--success)' : 'var(--text-tertiary)' }}>({catChecked}/{cat.items.length})</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {cat.items.map(item => (
                <div key={item.id} onClick={() => toggle(item.id)} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '8px 10px', borderRadius: 8, cursor: 'pointer',
                  background: checked.has(item.id) ? 'rgba(74,222,128,0.04)' : 'transparent', transition: 'background 0.15s',
                }}>
                  <div style={{
                    width: 18, height: 18, borderRadius: 5, flexShrink: 0, transition: 'all 0.2s',
                    border: `1.5px solid ${checked.has(item.id) ? 'var(--success)' : 'var(--border-glass)'}`,
                    background: checked.has(item.id) ? 'var(--success)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    {checked.has(item.id) && (
                      <svg width={10} height={10} viewBox="0 0 10 10"><path d="M2 5l2.5 2.5L8 3" stroke="var(--void)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" /></svg>
                    )}
                  </div>
                  <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 6 }}>
                    <span style={{ fontSize: 13, color: checked.has(item.id) ? 'var(--text-tertiary)' : 'var(--text-primary)', textDecoration: checked.has(item.id) ? 'line-through' : 'none', transition: 'all 0.2s' }}>
                      {item.name}
                    </span>
                    {item.essential && !checked.has(item.id) && (
                      <span className="font-mono" style={{ fontSize: 8, padding: '1px 5px', borderRadius: 100, background: 'rgba(248,113,113,0.1)', color: '#f87171' }}>ESSENTIAL</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Budget Explorer (Kayak-killer) ─────────────────────────────
function BudgetExplorer() {
  const [budget, setBudget] = useState(1500)

  const inRange = BUDGET_EXPLORE.filter(d => d.totalWeek <= budget)

  return (
    <div className="glass" style={{ padding: '24px' }}>
      <div className="font-display" style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Budget Explorer</div>
      <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 20 }}>Where can you go from Edmonton for your budget?</div>

      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
          <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Your budget (7 nights all-in)</span>
          <span className="font-display" style={{ fontSize: 24, color: 'var(--gold)' }}>{formatCAD(budget)}</span>
        </div>
        <input type="range" min={800} max={6000} step={100} value={budget} onChange={e => setBudget(Number(e.target.value))}
          style={{ width: '100%', accentColor: 'var(--gold)' }} />
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>$800</span>
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>$6,000</span>
        </div>
      </div>

      {inRange.length === 0 ? (
        <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-tertiary)', textAlign: 'center', padding: 20 }}>
          Increase budget to see destinations
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {inRange.map(d => (
            <div key={d.destination} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)', borderRadius: 12,
            }}>
              <span style={{ fontSize: 24 }}>{d.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 3 }}>{d.destination}</div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{d.bestDeal}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>✈ {formatCAD(d.flightPrice)}</span>
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>🏨 {formatCAD(d.hotelPerNight)}/night</span>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-display" style={{ fontSize: 20, color: 'var(--gold)' }}>{formatCAD(d.totalWeek)}</div>
                <PriceBadge signal={d.priceSignal} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Visa checker ───────────────────────────────────────────────
function VisaChecker() {
  const reqColors = { VISA_FREE: 'var(--success)', ETA: 'var(--gold)', VISA_ON_ARRIVAL: '#60a5fa', VISA_REQUIRED: 'var(--danger)' }
  const reqLabels = { VISA_FREE: '✓ Visa-free', ETA: 'ETA required', VISA_ON_ARRIVAL: 'Visa on arrival', VISA_REQUIRED: '✗ Visa required' }

  return (
    <div className="glass" style={{ padding: '24px' }}>
      <div className="font-display" style={{ fontSize: 18, fontWeight: 500, marginBottom: 4 }}>Visa Requirements</div>
      <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 20 }}>For Canadian passport holders (as of April 2026)</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {VISA_INFO.map(v => (
          <div key={v.country} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 14px', background: 'var(--glass-1)', borderRadius: 10, border: '1px solid var(--border-void)' }}>
            <span style={{ fontSize: 22, flexShrink: 0 }}>{v.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{v.country}</div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{v.notes}</div>
            </div>
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div className="font-mono" style={{ fontSize: 10, color: reqColors[v.requirement], fontWeight: 500 }}>{reqLabels[v.requirement]}</div>
              <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {v.cost && `${v.cost} · `}{v.maxStay}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Emergency SOS ──────────────────────────────────────────────
function EmergencySOS() {
  return (
    <div className="glass" style={{ padding: '24px', border: '1px solid rgba(248,113,113,0.2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>🆘</div>
        <div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>Emergency Travel Help</div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Works offline · Pre-loaded to your SBT</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {[
          { label: 'Lost passport', icon: '🛂', tip: '1. Report to local police for a report number\n2. Go to nearest Canadian embassy\n3. Get Emergency Travel Document (issued same day)\n4. Call Consular Emergency: +1-613-996-8885' },
          { label: 'Medical emergency', icon: '🏥', tip: '1. Call local ambulance (see below)\n2. Contact travel insurance (24/7 hotline on your card)\n3. Notify Soul Wallet — your SBT has medical info stored' },
          { label: 'Stolen wallet', icon: '💳', tip: '1. File police report immediately\n2. Contact bank to freeze cards\n3. Soul Wallet USDC is always accessible via your SBT biometric\n4. DustMiles can be converted to USDC for emergency cash' },
        ].map(tip => (
          <button key={tip.label} style={{
            padding: '10px 14px', borderRadius: 10, border: '1px solid rgba(248,113,113,0.3)',
            background: 'rgba(248,113,113,0.06)', color: '#f87171', cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11, transition: 'all 0.15s',
          }}
            onMouseEnter={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.12)')}
            onMouseLeave={e => (e.currentTarget.style.background = 'rgba(248,113,113,0.06)')}>
            {tip.icon} {tip.label}
          </button>
        ))}
      </div>

      {EMERGENCY_CONTACTS.map(e => (
        <div key={e.country} style={{ marginBottom: 14, padding: '14px', background: 'var(--glass-1)', borderRadius: 10, border: '1px solid var(--border-void)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>{e.flag}</span>
            <span style={{ fontSize: 14, fontWeight: 500 }}>{e.country}</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
            {[
              { label: 'Police', value: e.police },
              { label: 'Ambulance', value: e.ambulance },
              { label: 'Canadian Embassy', value: e.canadianEmbassy },
              { label: 'Tourist Police', value: e.touristPolice ?? 'Use main police' },
            ].map(s => (
              <div key={s.label}>
                <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 2 }}>{s.label.toUpperCase()}</div>
                <div className="font-mono" style={{ fontSize: 12, color: 'var(--danger)', fontWeight: 500 }}>{s.value}</div>
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center' }}>
        🇨🇦 Global Affairs Canada Emergency: +1-613-996-8885 · Available 24/7
      </div>
    </div>
  )
}

// ── AI Planner ─────────────────────────────────────────────────
function AIPlanner() {
  const [query, setQuery] = useState('')
  const [thinking, setThinking] = useState(false)
  const [results, setResults] = useState<typeof AI_TRIP_SUGGESTIONS>([])
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null)

  async function plan() {
    if (!query.trim()) return
    setThinking(true)
    await new Promise(r => setTimeout(r, 2000))
    setResults(AI_TRIP_SUGGESTIONS)
    setThinking(false)
  }

  const PROMPTS = [
    'Warm beach, great food, under $3k, 10 days in July',
    'Adventure mountains, solo, November, under $4k',
    'Honeymoon, luxury, somewhere unexpected, any month',
    'Family + kids, summer, easy flights from Edmonton',
    'City break, 5 days, art, architecture, amazing food',
    'Backpacking Asia, 3 weeks, under $2500 all-in',
  ]

  return (
    <div>
      <div className="glass-heavy" style={{ padding: '28px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
          <div style={{ width: 42, height: 42, borderRadius: 12, background: 'var(--gold-glass-2)', border: '1px solid var(--border-gold-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>✈</div>
          <div>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 500 }}>Dust Travel AI</div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Describe your dream trip. No filters, no forms — just plain English.</div>
          </div>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
            <StatusBadge variant="gold">2.5% fee vs Expedia 18%</StatusBadge>
            <StatusBadge variant="success">+250 DM/booking</StatusBadge>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
          <textarea
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && (e.preventDefault(), plan())}
            placeholder="E.g. 'warm beach vacation in July, budget $3k, 2 adults, love local food and can't handle too many tourist traps...'"
            rows={2}
            style={{
              flex: 1, background: 'var(--glass-1)', border: '1px solid var(--border-gold-2)', borderRadius: 12,
              padding: '14px 18px', color: 'var(--text-primary)', fontFamily: "'Cormorant Garamond', Georgia, serif",
              fontSize: 15, outline: 'none', resize: 'none', lineHeight: 1.6,
            }}
          />
          <button onClick={plan} disabled={thinking || !query.trim()} className="btn-sovereign"
            style={{ padding: '0 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0, alignSelf: 'stretch' }}>
            {thinking ? <Spinner size={16} /> : '◆'}
            {thinking ? 'Planning...' : 'Plan it'}
          </button>
        </div>

        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', alignSelf: 'center' }}>Try:</span>
          {PROMPTS.map(p => (
            <button key={p} onClick={() => setQuery(p)} style={{
              padding: '4px 10px', borderRadius: 100, border: '1px solid var(--border-gold-0)', background: 'transparent',
              color: 'var(--gold-dim)', cursor: 'pointer', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, transition: 'all 0.15s',
            }}
              onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-gold-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)' }}
              onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-gold-0)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold-dim)' }}>
              {p}
            </button>
          ))}
        </div>

        {results.length > 0 && (
          <div style={{ marginTop: 24 }}>
            <div className="gold-divider" style={{ marginBottom: 16 }} />
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.15em', marginBottom: 14 }}>AI RECOMMENDATIONS</div>
            {results.map(s => (
              <div key={s.destination} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px', background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)', borderRadius: 12, marginBottom: 10 }}>
                <span style={{ fontSize: 32 }}>{s.flag}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 3 }}>{s.destination}</div>
                  <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 6 }}>{s.why}</div>
                  <PriceBadge signal={s.priceSignal} />
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="font-display" style={{ fontSize: 22, color: 'var(--gold)' }}>{formatCAD(s.estimatedCost)}</div>
                  <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Best: {s.bestMonth}</div>
                  <button className="btn-sovereign" style={{ padding: '6px 12px', fontSize: 11, marginTop: 6 }}>Search flights →</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Trending destinations */}
      <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)', marginBottom: 14 }}>TRENDING NOW</div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 14 }}>
        {TRENDING_DESTINATIONS.map(d => (
          <DestCard key={d.id} dest={d} onSelect={setSelectedDest} />
        ))}
      </div>

      {selectedDest && <DestDetail dest={selectedDest} onClose={() => setSelectedDest(null)} />}
    </div>
  )
}

// ── Experiences ────────────────────────────────────────────────
function ExperiencesTab() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-1)', borderRadius: 12, marginBottom: 20 }}>
        <span style={{ fontSize: 18 }}>✦</span>
        <span className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', lineHeight: 1.6 }}>
          All experiences are led by SBT-verified local guides. Pay with DustMiles or USDC. Free cancellation up to 24h before.
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {EXPERIENCES.map(exp => (
          <div key={exp.id} className="glass" style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
              <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--gold-glass-2)', border: '1px solid var(--border-gold-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, flexShrink: 0 }}>
                {exp.flag}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div>
                    <div style={{ fontSize: 15, fontWeight: 500, marginBottom: 2 }}>{exp.title}</div>
                    <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{exp.city} · {exp.category} · {exp.duration} · Max {exp.maxGroupSize} people</div>
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, paddingLeft: 12 }}>
                    <div className="font-display" style={{ fontSize: 22, color: 'var(--gold)' }}>{formatCAD(exp.price)}</div>
                    <div className="font-mono" style={{ fontSize: 10, color: 'var(--gold-dim)' }}>+{exp.dustMilesEarned} DM</div>
                  </div>
                </div>
                <p className="font-body" style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 10, lineHeight: 1.5 }}>{exp.description}</p>
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                  {exp.highlights.map(h => (
                    <div key={h} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                      <span className="font-mono" style={{ fontSize: 10, color: 'var(--gold)' }}>→</span>
                      <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{h}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ color: 'var(--gold)' }}>★</span>
                    <span className="font-mono" style={{ fontSize: 12, fontWeight: 500 }}>{exp.rating}</span>
                    <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>({exp.reviews.toLocaleString()})</span>
                  </div>
                  <button className="btn-sovereign" style={{ marginLeft: 'auto', padding: '8px 20px', fontSize: 13 }}>Book experience</button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Tools hub ──────────────────────────────────────────────────
function ToolsHub() {
  const [tool, setTool] = useState<'packing' | 'budget' | 'visa' | 'sos' | 'currency'>('packing')

  const TOOLS = [
    { id: 'packing' as const, label: '🎒 Packing List', desc: 'Weather + activity based' },
    { id: 'budget' as const, label: '💰 Budget Explorer', desc: 'Where can you go for $X?' },
    { id: 'visa' as const, label: '🛂 Visa Checker', desc: 'Canadian passport' },
    { id: 'sos' as const, label: '🆘 Emergency SOS', desc: 'Works offline' },
  ]

  return (
    <div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
        {TOOLS.map(t => (
          <button key={t.id} onClick={() => setTool(t.id)} style={{
            padding: '10px 16px', borderRadius: 10, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: tool === t.id ? 'var(--gold-glass-2)' : 'var(--glass-1)',
            border: `1px solid ${tool === t.id ? 'var(--border-gold-2)' : 'var(--border-void)'}`,
            color: tool === t.id ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
          }}>
            <div>{t.label}</div>
            <div style={{ fontSize: 9, opacity: 0.6, marginTop: 2 }}>{t.desc}</div>
          </button>
        ))}
      </div>
      {tool === 'packing'  && <PackingList />}
      {tool === 'budget'   && <BudgetExplorer />}
      {tool === 'visa'     && <VisaChecker />}
      {tool === 'sos'      && <EmergencySOS />}
    </div>
  )
}

// ── Main Dust Travel Ultimate ─────────────────────────────────
export default function DustTravelUltimate() {
  const [tab, setTab] = useState<TravelTab>('discover')

  const TABS: { id: TravelTab; label: string; badge?: string }[] = [
    { id: 'discover',     label: '✦ Discover' },
    { id: 'flights',      label: '✈ Flights' },
    { id: 'hotels',       label: '🏨 Hotels' },
    { id: 'my-trips',     label: '📍 My Trips', badge: '1' },
    { id: 'experiences',  label: '🎭 Experiences' },
    { id: 'tools',        label: '◈ Tools' },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold-warm)', marginBottom: 4 }}>Dust Travel</div>
        <h1 className="font-display" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.1 }}>
          The world awaits.
        </h1>
        <div className="font-body" style={{ fontSize: 14, color: 'var(--text-tertiary)', fontStyle: 'italic', marginTop: 4 }}>
          No hidden fees · No paywalls · No spam · Pay with DustMiles · Earn on every booking
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, overflowX: 'auto', padding: 4, background: 'var(--glass-1)', borderRadius: 12, border: '1px solid var(--border-gold-0)' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            background: tab === t.id ? 'var(--gold-glass-2)' : 'transparent',
            color: tab === t.id ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
            border: `1px solid ${tab === t.id ? 'var(--border-gold-1)' : 'transparent'}`,
            whiteSpace: 'nowrap', position: 'relative',
          }}>
            {t.label}
            {t.badge && (
              <span style={{ position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: '50%', background: 'var(--danger)', color: 'white', fontSize: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'discover'    && <AIPlanner />}
      {tab === 'flights'     && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 14 }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Showing YEG → all destinations</span>
              <StatusBadge variant="gold">Price prediction ON</StatusBadge>
            </div>
          </div>
          {MOCK_FLIGHTS.map(f => <FlightCard key={f.id} flight={f} />)}
        </div>
      )}
      {tab === 'hotels'      && MOCK_HOTELS.map(h => <HotelCard key={h.id} hotel={h} />)}
      {tab === 'my-trips'    && <TripItinerary />}
      {tab === 'experiences' && <ExperiencesTab />}
      {tab === 'tools'       && <ToolsHub />}
    </div>
  )
}
