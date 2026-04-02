'use client'

import { useState } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import { MOCK_FLIGHTS, formatCAD, type FlightResult, type Destination } from '@/lib/travel-data'

function StopBadge({ stops }: { stops: number }) {
  return (
    <span
      className="font-mono"
      style={{
        fontSize: 10,
        padding: '2px 8px',
        borderRadius: 100,
        background: stops === 0 ? 'rgba(74,222,128,0.1)' : 'var(--glass-2)',
        color: stops === 0 ? 'var(--success)' : 'var(--text-tertiary)',
        border: `1px solid ${stops === 0 ? 'rgba(74,222,128,0.25)' : 'var(--border-glass)'}`,
      }}
    >
      {stops === 0 ? 'Nonstop' : `${stops} stop`}
    </span>
  )
}

function FlightCard({
  flight,
  onBook,
}: {
  flight: FlightResult
  onBook: (f: FlightResult) => void
}) {
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)

  async function handleBook() {
    setBooking(true)
    await new Promise(r => setTimeout(r, 1600))
    setBooking(false)
    setBooked(true)
    onBook(flight)
  }

  return (
    <div
      style={{
        padding: '18px 20px',
        background: 'var(--glass-1)',
        border: `1px solid ${booked ? 'var(--border-gold-2)' : 'var(--border-gold-0)'}`,
        borderRadius: 14,
        transition: 'all 0.2s',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>

        {/* Airline */}
        <div style={{ minWidth: 100 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 2 }}>
            {flight.airline}
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            {flight.airlineCode} · {flight.cabinClass}
          </div>
        </div>

        {/* Times */}
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ textAlign: 'center' }}>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 500, lineHeight: 1 }}>
              {flight.departure.time}
            </div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
              {flight.departure.airport}
            </div>
          </div>

          {/* Flight path */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
              {flight.duration}
            </div>
            <div style={{ width: '100%', display: 'flex', alignItems: 'center', gap: 4 }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border-gold-1)' }} />
              <span style={{ fontSize: 12, color: 'var(--gold-warm)' }}>✈</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border-gold-1)' }} />
            </div>
            <StopBadge stops={flight.stops} />
          </div>

          <div style={{ textAlign: 'center' }}>
            <div className="font-display" style={{ fontSize: 20, fontWeight: 500, lineHeight: 1 }}>
              {flight.arrival.time}
            </div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
              {flight.arrival.airport}
            </div>
          </div>
        </div>

        {/* Price + book */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="font-display" style={{ fontSize: 26, fontWeight: 600, color: 'var(--gold)', lineHeight: 1 }}>
            {formatCAD(flight.price)}
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2, marginBottom: 10 }}>
            +{flight.pointsEarned.toLocaleString()} pts · {flight.seatsLeft} seats left
          </div>
          <button
            className={booked ? 'btn-glass' : 'btn-sovereign'}
            style={{
              padding: '9px 20px',
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
            }}
            onClick={handleBook}
            disabled={booking || booked}
          >
            {booking ? <><Spinner size={14} color="#000" />Booking…</> : booked ? '✓ Booked' : 'Book now'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function FlightSearch({ destination }: { destination: Destination | null }) {
  const [sortBy, setSortBy] = useState<'price' | 'duration' | 'stops'>('price')
  const [filterNonstop, setFilterNonstop] = useState(false)
  const [bookedFlight, setBookedFlight] = useState<FlightResult | null>(null)

  const sorted = [...MOCK_FLIGHTS]
    .filter(f => !filterNonstop || f.stops === 0)
    .sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      if (sortBy === 'stops') return a.stops - b.stops
      return a.duration.localeCompare(b.duration)
    })

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>

      {/* Search header */}
      <div
        style={{
          padding: '16px 20px',
          background: 'var(--glass-2)',
          border: '1px solid var(--border-gold-1)',
          borderRadius: 14,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <div>
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>ROUTE</div>
            <div style={{ fontSize: 15, fontWeight: 500 }}>
              Toronto (YYZ) → {destination?.code ?? 'NRT'} · Jun 15 · 2 passengers
            </div>
          </div>
          <button className="btn-glass" style={{ marginLeft: 'auto', padding: '7px 14px', fontSize: 12 }}>
            Modify search
          </button>
        </div>
      </div>

      {/* Sort + filter */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>SORT BY</span>
        {(['price', 'duration', 'stops'] as const).map(s => (
          <button
            key={s}
            onClick={() => setSortBy(s)}
            style={{
              padding: '6px 14px',
              borderRadius: 100,
              border: `1px solid ${sortBy === s ? 'var(--border-gold-2)' : 'var(--border-glass)'}`,
              background: sortBy === s ? 'var(--gold-glass-2)' : 'transparent',
              color: sortBy === s ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily: "'Geist', system-ui, sans-serif",
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.15s',
              textTransform: 'capitalize',
            }}
          >
            {s}
          </button>
        ))}
        <button
          onClick={() => setFilterNonstop(n => !n)}
          style={{
            marginLeft: 8,
            padding: '6px 14px',
            borderRadius: 100,
            border: `1px solid ${filterNonstop ? 'rgba(74,222,128,0.4)' : 'var(--border-glass)'}`,
            background: filterNonstop ? 'rgba(74,222,128,0.08)' : 'transparent',
            color: filterNonstop ? 'var(--success)' : 'var(--text-secondary)',
            fontFamily: "'Geist', system-ui, sans-serif",
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
        >
          Nonstop only
        </button>
        <span className="font-mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)' }}>
          {sorted.length} flights found
        </span>
      </div>

      {/* Flight list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {sorted.map(flight => (
          <FlightCard
            key={flight.id}
            flight={flight}
            onBook={f => setBookedFlight(f)}
          />
        ))}
      </div>

      {/* Price alert */}
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--glass-1)',
          border: '1px solid var(--border-gold-0)',
          borderRadius: 12,
          display: 'flex',
          gap: 10,
          alignItems: 'center',
        }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="5.5" stroke="var(--gold)" strokeWidth="1.2"/>
          <path d="M7 4v3.5l2 1.5" stroke="var(--gold)" strokeWidth="1.2" strokeLinecap="round"/>
        </svg>
        <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', flex: 1 }}>
          Prices to Tokyo from YYZ are 12% below the 90-day average. Dust AI recommends booking within 48 hours.
        </span>
        <button className="btn-glass" style={{ padding: '5px 12px', fontSize: 11, flexShrink: 0 }}>
          Set price alert
        </button>
      </div>
    </div>
  )
}
