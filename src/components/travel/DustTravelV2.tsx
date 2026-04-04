'use client'
// ============================================================
// DUST TRAVEL v2 — The Ultimate Travel Sub-App
// Best from: Hopper (price prediction), TripIt (itinerary),
// Google Travel (AI trip planning), Airbnb (experiences),
// PackPoint (packing), Skyscanner (price alerts)
// + Everything they ALL lack: DustMiles, SBT checkout, real USDC savings
// ============================================================

import { useState, useEffect } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import {
  TRENDING_DESTINATIONS, AI_TRIP_SUGGESTIONS, MOCK_FLIGHTS, MOCK_HOTELS,
  formatCAD, type Destination, type FlightResult, type HotelResult,
} from '@/lib/travel-data'
import FlightSearch from './FlightSearch'
import HotelSearch from './HotelSearch'
import ActivityFeed from './ActivityFeed'
import InfluencerFeed from './InfluencerFeed'

type TravelTab = 'plan' | 'flights' | 'hotels' | 'my-trips' | 'activities' | 'intel'

// ── Price prediction badge ─────────────────────────────────────
type PriceTrend = 'BUY_NOW' | 'WAIT' | 'GOOD_PRICE'
function PricePrediction({ trend, savings }: { trend: PriceTrend; savings?: number }) {
  const config = {
    BUY_NOW:    { label: '🔥 Buy now', color: '#ef4444', bg: 'rgba(239,68,68,0.1)',   desc: 'Prices rising. Lock this in.' },
    WAIT:       { label: '⏳ Wait',    color: '#D4AF37', bg: 'rgba(212,175,55,0.1)',  desc: `Could drop ~${savings ? formatCAD(savings) : '$40'} in 7d` },
    GOOD_PRICE: { label: '✓ Fair',    color: '#4ade80', bg: 'rgba(74,222,128,0.1)',  desc: 'This is a good price. Book now.' },
  }[trend]

  return (
    <div style={{
      display: 'inline-flex', alignItems: 'center', gap: 6,
      padding: '3px 10px 3px 8px', borderRadius: 100,
      background: config.bg, border: `1px solid ${config.color}30`,
    }}>
      <span className="font-mono" style={{ fontSize: 10, color: config.color, fontWeight: 500 }}>{config.label}</span>
      <span className="font-mono" style={{ fontSize: 9, color: config.color, opacity: 0.7 }}>· {config.desc}</span>
    </div>
  )
}

// ── Price alert setter ─────────────────────────────────────────
function PriceAlertModal({ route, onClose }: { route: string; onClose: () => void }) {
  const [threshold, setThreshold] = useState(400)
  const [set, setSet] = useState(false)

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)',
      zIndex: 100, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div className="glass-heavy" style={{ width: '100%', maxWidth: 360, padding: 28 }}>
        <div className="font-display" style={{ fontSize: 20, fontWeight: 500, marginBottom: 6 }}>
          Price Alert
        </div>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 20 }}>
          {route} · Notify when price drops below
        </div>

        <div style={{ marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Alert threshold</span>
            <span className="font-display" style={{ fontSize: 24, color: 'var(--gold)' }}>{formatCAD(threshold)}</span>
          </div>
          <input type="range" min={200} max={1000} step={10} value={threshold}
            onChange={e => setThreshold(Number(e.target.value))}
            style={{ width: '100%', accentColor: 'var(--gold)' }} />
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>$200</span>
            <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>$1,000</span>
          </div>
        </div>

        {set ? (
          <div style={{
            padding: '14px', borderRadius: 10, background: 'rgba(74,222,128,0.08)',
            border: '1px solid rgba(74,222,128,0.25)', textAlign: 'center',
          }}>
            <div style={{ fontSize: 20, marginBottom: 4 }}>✓</div>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--success)' }}>Alert set! We'll push you when the price drops.</div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 10 }}>
            <button onClick={onClose} className="btn-glass" style={{ flex: 1, padding: '12px' }}>Cancel</button>
            <button onClick={() => setSet(true)} className="btn-sovereign" style={{ flex: 2, padding: '12px' }}>
              Set Alert · {formatCAD(threshold)}
            </button>
          </div>
        )}
        {set && (
          <button onClick={onClose} className="btn-glass" style={{ width: '100%', marginTop: 10, padding: '10px' }}>
            Done
          </button>
        )}
      </div>
    </div>
  )
}

// ── Trip itinerary manager (TripIt-killer) ─────────────────────
function TripItinerary() {
  const trips = [
    {
      id: 'trip-1',
      name: 'Los Angeles',
      flag: '🇺🇸',
      dateRange: 'Feb 14 – 18',
      daysLeft: 28,
      items: [
        { type: 'FLIGHT',  icon: '✈', desc: 'AC 221 · YEG→LAX · 07:15',  time: 'Feb 14, 07:15', status: 'CONFIRMED', code: 'AC8892' },
        { type: 'HOTEL',   icon: '🏨', desc: 'The LINE LA · Check-in 15:00', time: 'Feb 14, 15:00', status: 'CONFIRMED', code: 'HTL99821' },
        { type: 'ACTIVITY',icon: '🎭', desc: 'Getty Center · 10:00 tour',  time: 'Feb 15, 10:00', status: 'CONFIRMED', code: 'VIAT3842' },
        { type: 'FLIGHT',  icon: '✈', desc: 'AC 224 · LAX→YEG · 18:30',  time: 'Feb 18, 18:30', status: 'CONFIRMED', code: 'AC8893' },
      ],
      dustMilesEarned: 450,
      totalValue: 2210,
    },
  ]

  const [expandedTrip, setExpandedTrip] = useState<string | null>('trip-1')

  const statusColor = (s: string) => s === 'CONFIRMED' ? 'var(--success)' : s === 'PENDING' ? 'var(--warning)' : 'var(--danger)'

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {trips.map(trip => (
        <div key={trip.id} className="glass" style={{ overflow: 'hidden' }}>
          {/* Trip header */}
          <div
            style={{ padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, cursor: 'pointer' }}
            onClick={() => setExpandedTrip(expandedTrip === trip.id ? null : trip.id)}>
            <span style={{ fontSize: 32 }}>{trip.flag}</span>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>{trip.name}</div>
                <div style={{
                  padding: '2px 8px', borderRadius: 100, background: 'var(--gold-glass-1)',
                  border: '1px solid var(--border-gold-1)',
                }}>
                  <span className="font-mono" style={{ fontSize: 10, color: 'var(--gold)' }}>{trip.daysLeft}d away</span>
                </div>
              </div>
              <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
                {trip.dateRange} · {trip.items.length} bookings · +{trip.dustMilesEarned} DustMiles earned
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Total</div>
              <div className="font-display" style={{ fontSize: 18, color: 'var(--gold)' }}>{formatCAD(trip.totalValue)}</div>
            </div>
          </div>

          {/* Trip timeline */}
          {expandedTrip === trip.id && (
            <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-void)' }}>
              <div style={{ marginTop: 16, position: 'relative' }}>
                {/* Timeline line */}
                <div style={{
                  position: 'absolute', left: 17, top: 24, bottom: 24,
                  width: 1, background: 'var(--border-gold-0)',
                }} />

                {trip.items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 14, marginBottom: i < trip.items.length - 1 ? 14 : 0 }}>
                    {/* Icon */}
                    <div style={{
                      width: 34, height: 34, borderRadius: 10, flexShrink: 0, zIndex: 1,
                      display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                      background: 'var(--glass-2)', border: '1px solid var(--border-gold-1)',
                    }}>
                      {item.icon}
                    </div>

                    {/* Details */}
                    <div style={{ flex: 1, paddingTop: 6 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{item.desc}</div>
                        <div className="font-mono" style={{ fontSize: 9, color: statusColor(item.status) }}>
                          ● {item.status}
                        </div>
                      </div>
                      <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}>
                        {item.time} · Ref: {item.code}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
                <button className="btn-glass" style={{ flex: 1, padding: '10px', fontSize: 12 }}>
                  📤 Share trip
                </button>
                <button className="btn-glass" style={{ flex: 1, padding: '10px', fontSize: 12 }}>
                  📱 Download offline
                </button>
                <button className="btn-sovereign" style={{ flex: 1, padding: '10px', fontSize: 12 }}>
                  ✈ Check-in status
                </button>
              </div>
            </div>
          )}
        </div>
      ))}

      <button className="btn-glass" style={{ width: '100%', padding: '12px', fontSize: 13 }}>
        + Import booking (forward confirmation email)
      </button>
    </div>
  )
}

// ── Packing list generator ─────────────────────────────────────
function PackingList({ destination, days, activities }: { destination: string; days: number; activities: string[] }) {
  const [checked, setChecked] = useState<Set<string>>(new Set())

  const BASE_LIST = [
    { cat: 'Documents', items: ['Passport', 'Flight confirmation', 'Hotel booking', 'Travel insurance'] },
    { cat: 'Electronics', items: ['Phone charger', 'Power bank', 'Universal adapter', 'Earbuds'] },
    { cat: 'Health', items: ['Prescription meds', 'Pain reliever', 'Sunscreen SPF50', 'Hand sanitizer'] },
    { cat: 'Clothing', items: ['Underwear × 5', 'T-shirts × 4', 'Pants × 2', 'Light jacket', 'Comfortable shoes'] },
  ]

  function toggle(item: string) {
    setChecked(prev => {
      const next = new Set(prev)
      next.has(item) ? next.delete(item) : next.add(item)
      return next
    })
  }

  const totalItems = BASE_LIST.reduce((s, c) => s + c.items.length, 0)
  const checkedCount = checked.size
  const pct = Math.round((checkedCount / totalItems) * 100)

  return (
    <div className="glass" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="font-display" style={{ fontSize: 16, fontWeight: 500 }}>Packing for {destination}</div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            {days} days · {activities.join(', ')}
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div className="font-display" style={{ fontSize: 22, color: pct === 100 ? 'var(--success)' : 'var(--gold)' }}>
            {pct}%
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>packed</div>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 4, background: 'var(--glass-3)', borderRadius: 100, marginBottom: 18, overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${pct}%`, borderRadius: 100,
          background: pct === 100 ? 'var(--success)' : 'var(--gold)',
          transition: 'width 0.4s ease',
        }} />
      </div>

      {BASE_LIST.map(cat => (
        <div key={cat.cat} style={{ marginBottom: 16 }}>
          <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-tertiary)', marginBottom: 8 }}>
            {cat.cat.toUpperCase()}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {cat.items.map(item => (
              <div key={item}
                onClick={() => toggle(item)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '7px 10px',
                  borderRadius: 8, cursor: 'pointer', transition: 'background 0.15s',
                  background: checked.has(item) ? 'rgba(74,222,128,0.05)' : 'transparent',
                }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${checked.has(item) ? 'var(--success)' : 'var(--border-glass)'}`,
                  background: checked.has(item) ? 'var(--success)' : 'transparent', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0, transition: 'all 0.2s',
                }}>
                  {checked.has(item) && (
                    <svg width={10} height={10} viewBox="0 0 10 10">
                      <path d="M2 5l2.5 2.5L8 3" stroke="var(--void)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
                    </svg>
                  )}
                </div>
                <span style={{
                  fontSize: 13, color: checked.has(item) ? 'var(--text-tertiary)' : 'var(--text-primary)',
                  textDecoration: checked.has(item) ? 'line-through' : 'none',
                  transition: 'all 0.2s',
                }}>
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Currency converter ─────────────────────────────────────────
function CurrencyConverter() {
  const [amount, setAmount] = useState('100')
  const [from, setFrom] = useState('CAD')
  const [to, setTo] = useState('USD')

  const RATES: Record<string, Record<string, number>> = {
    CAD: { USD: 0.728, EUR: 0.672, GBP: 0.578, JPY: 109.4, AUD: 1.124, MXN: 12.48, AED: 2.674 },
    USD: { CAD: 1.373, EUR: 0.923, GBP: 0.794, JPY: 150.2, AUD: 1.545, MXN: 17.15, AED: 3.673 },
    EUR: { CAD: 1.487, USD: 1.083, GBP: 0.860, JPY: 162.7, AUD: 1.674, MXN: 18.58, AED: 3.978 },
    GBP: { CAD: 1.729, USD: 1.260, EUR: 1.163, JPY: 189.3, AUD: 1.948, MXN: 21.62, AED: 4.630 },
    JPY: { CAD: 0.00914, USD: 0.00666, EUR: 0.00615, GBP: 0.00528, AUD: 0.01030, MXN: 0.1141, AED: 0.02446 },
    AUD: { CAD: 0.890, USD: 0.648, EUR: 0.598, GBP: 0.514, JPY: 97.1, MXN: 11.10, AED: 2.380 },
    MXN: { CAD: 0.0801, USD: 0.0583, EUR: 0.0538, GBP: 0.0463, JPY: 8.75, AUD: 0.0901, AED: 0.2143 },
    AED: { CAD: 0.374, USD: 0.272, EUR: 0.251, GBP: 0.216, JPY: 40.9, AUD: 0.420, MXN: 4.666 },
  }

  const rate = RATES[from]?.[to] ?? 1
  const converted = (Number(amount) * rate).toFixed(2)
  const CURRENCIES = ['CAD','USD','EUR','GBP','JPY','AUD','MXN','AED']

  return (
    <div className="glass" style={{ padding: '20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <div style={{
          width: 32, height: 32, borderRadius: 8, background: 'var(--gold-glass-2)',
          border: '1px solid var(--border-gold-1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
        }}>
          💱
        </div>
        <div>
          <div className="font-display" style={{ fontSize: 14, fontWeight: 500 }}>Currency Converter</div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>Live rates · XE powered</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
        <div style={{ flex: 1 }}>
          <input
            type="number" value={amount}
            onChange={e => setAmount(e.target.value)}
            style={{
              width: '100%', background: 'var(--glass-1)', border: '1px solid var(--border-gold-1)',
              borderRadius: 10, padding: '10px 14px', color: 'var(--text-primary)',
              fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 500, outline: 'none',
            }}
          />
        </div>
        <select value={from} onChange={e => setFrom(e.target.value)}
          style={{
            background: 'var(--glass-2)', border: '1px solid var(--border-glass)', borderRadius: 10,
            padding: '10px 12px', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: 'none',
          }}>
          {CURRENCIES.map(c => <option key={c} value={c} style={{ background: '#0c0c0c' }}>{c}</option>)}
        </select>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '4px 0 14px' }}>
        <button onClick={() => { const tmp = from; setFrom(to); setTo(tmp) }}
          style={{
            background: 'var(--glass-2)', border: '1px solid var(--border-gold-1)', borderRadius: '50%',
            width: 32, height: 32, cursor: 'pointer', color: 'var(--gold)', fontSize: 14,
          }}>
          ⇅
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 16 }}>
        <div style={{
          flex: 1, background: 'var(--gold-glass-1)', border: '1px solid var(--border-gold-2)',
          borderRadius: 10, padding: '10px 14px',
          fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 500, color: 'var(--gold)',
        }}>
          {converted}
        </div>
        <select value={to} onChange={e => setTo(e.target.value)}
          style={{
            background: 'var(--glass-2)', border: '1px solid var(--border-glass)', borderRadius: 10,
            padding: '10px 12px', color: 'var(--text-primary)', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, outline: 'none',
          }}>
          {CURRENCIES.map(c => <option key={c} value={c} style={{ background: '#0c0c0c' }}>{c}</option>)}
        </select>
      </div>

      <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', textAlign: 'center' }}>
        1 {from} = {rate.toFixed(4)} {to} · Updated live
      </div>
    </div>
  )
}

// ── Destination weather card ───────────────────────────────────
function DestinationWeather() {
  const DESTINATIONS = [
    { city: 'Los Angeles', country: 'US', flag: '🇺🇸', temp: 23, feels: 21, condition: 'Sunny', icon: '☀️', humidity: 45, wind: '12 km/h SW' },
    { city: 'Tokyo',       country: 'JP', flag: '🇯🇵', temp: 8,  feels: 5,  condition: 'Cloudy', icon: '☁️', humidity: 72, wind: '8 km/h NW' },
    { city: 'Paris',       country: 'FR', flag: '🇫🇷', temp: 12, feels: 9,  condition: 'Rainy',  icon: '🌧',  humidity: 85, wind: '22 km/h W' },
  ]
  const [selected, setSelected] = useState(0)
  const dest = DESTINATIONS[selected]

  return (
    <div className="glass" style={{ padding: '20px' }}>
      <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)', marginBottom: 14 }}>
        DESTINATION WEATHER
      </div>

      {/* City tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
        {DESTINATIONS.map((d, i) => (
          <button key={d.city} onClick={() => setSelected(i)} style={{
            padding: '5px 12px', borderRadius: 100, border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: selected === i ? 'var(--gold-glass-2)' : 'var(--glass-2)',
            color: selected === i ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 11,
            border: `1px solid ${selected === i ? 'var(--border-gold-1)' : 'transparent'}`,
          }}>
            {d.flag} {d.city}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 52, lineHeight: 1 }}>{dest.icon}</div>
        <div>
          <div className="font-display" style={{ fontSize: 40, fontWeight: 500, color: 'var(--gold)', lineHeight: 1 }}>
            {dest.temp}°C
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-secondary)', marginTop: 3 }}>
            Feels like {dest.feels}°C · {dest.condition}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 14 }}>
        {[
          { label: 'Humidity', value: `${dest.humidity}%` },
          { label: 'Wind',     value: dest.wind },
        ].map(s => (
          <div key={s.label} style={{
            padding: '8px 12px', background: 'var(--glass-1)', borderRadius: 8,
            border: '1px solid var(--border-void)',
          }}>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 3 }}>{s.label.toUpperCase()}</div>
            <div className="font-mono" style={{ fontSize: 13, color: 'var(--text-primary)' }}>{s.value}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ── AI Trip Planner ───────────────────────────────────────────
function AIPlannerBar({ onSearch }: { onSearch: (dest: string) => void }) {
  const [query, setQuery]     = useState('')
  const [thinking, setThinking] = useState(false)
  const [suggestions, setSuggestions] = useState<typeof AI_TRIP_SUGGESTIONS>([])

  const PROMPTS = [
    'Warm beach, great food, under $3k, 10 days in July',
    'Adventure trip, mountains, solo traveler, November',
    'Honeymoon, luxury, somewhere unexpected',
    'Family trip with kids, summer, easy flights from Edmonton',
  ]

  async function plan() {
    if (!query.trim()) return
    setThinking(true)
    await new Promise(r => setTimeout(r, 1800))
    setSuggestions(AI_TRIP_SUGGESTIONS)
    setThinking(false)
    onSearch('Tokyo')
  }

  return (
    <div className="glass-heavy" style={{ padding: '28px', marginBottom: 20 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div style={{
          width: 38, height: 38, borderRadius: 10, background: 'var(--gold-glass-2)',
          border: '1px solid var(--border-gold-2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
        }}>
          ✈
        </div>
        <div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>Dust Travel AI</div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            Tell me where you want to go — or let me surprise you
          </div>
        </div>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <StatusBadge variant="gold">2.5% fee vs Expedia 18%</StatusBadge>
          <StatusBadge variant="success">+250 DustMiles/booking</StatusBadge>
        </div>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <input
          value={query} onChange={e => setQuery(e.target.value)} onKeyDown={e => e.key === 'Enter' && plan()}
          placeholder="Describe your dream trip in plain English..."
          style={{
            flex: 1, background: 'var(--glass-1)', border: '1px solid var(--border-gold-2)',
            borderRadius: 12, padding: '14px 18px', color: 'var(--text-primary)',
            fontFamily: "'Cormorant Garamond', Georgia, serif", fontSize: 15, outline: 'none',
          }}
        />
        <button onClick={plan} disabled={thinking || !query.trim()} className="btn-sovereign"
          style={{ padding: '0 24px', fontSize: 14, display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0 }}>
          {thinking ? <Spinner size={16} /> : null}
          {thinking ? 'Planning...' : 'Plan trip'}
        </button>
      </div>

      {/* Example prompts */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {PROMPTS.map(p => (
          <button key={p} onClick={() => setQuery(p)} style={{
            padding: '5px 12px', borderRadius: 100, border: '1px solid var(--border-gold-0)',
            background: 'transparent', color: 'var(--gold-dim)', cursor: 'pointer',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 10, transition: 'all 0.15s',
          }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-gold-2)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold)' }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border-gold-0)'; (e.currentTarget as HTMLButtonElement).style.color = 'var(--gold-dim)' }}>
            {p}
          </button>
        ))}
      </div>

      {/* AI suggestions */}
      {suggestions.length > 0 && (
        <div style={{ marginTop: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div className="gold-divider" />
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', letterSpacing: '0.15em' }}>
            AI RECOMMENDATIONS
          </div>
          {suggestions.map(s => (
            <div key={s.destination} style={{
              display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
              background: 'var(--glass-1)', border: '1px solid var(--border-gold-0)', borderRadius: 12,
            }}>
              <span style={{ fontSize: 28 }}>{s.flag}</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{s.destination}</div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>{s.why}</div>
                <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
                  <PricePrediction trend="GOOD_PRICE" />
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div className="font-display" style={{ fontSize: 20, color: 'var(--gold)' }}>
                  {formatCAD(s.estimatedCost)}
                </div>
                <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                  {s.bestMonth}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Dust Travel v2 ───────────────────────────────────────
export default function DustTravelV2() {
  const [tab, setTab]               = useState<TravelTab>('plan')
  const [selectedDest, setSelectedDest] = useState<string | null>(null)
  const [alertRoute, setAlertRoute] = useState<string | null>(null)

  const TABS = [
    { id: 'plan' as TravelTab,       label: '✦ AI Planner',    badge: null },
    { id: 'flights' as TravelTab,    label: '✈ Flights',       badge: null },
    { id: 'hotels' as TravelTab,     label: '🏨 Hotels',       badge: null },
    { id: 'my-trips' as TravelTab,   label: '📍 My Trips',     badge: '1' },
    { id: 'activities' as TravelTab, label: '🎭 Activities',   badge: null },
    { id: 'intel' as TravelTab,      label: '◈ Intel',         badge: null },
  ]

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Header */}
      <div>
        <div className="font-mono" style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--gold-warm)', marginBottom: 4 }}>
          Dust Travel
        </div>
        <h1 className="font-display" style={{ fontSize: 30, fontWeight: 500, letterSpacing: '-0.025em', marginBottom: 4 }}>
          The world awaits.
        </h1>
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          <span style={{ color: 'var(--success)' }}>●</span> Offline itinerary available · SBT checkout · DustMiles on every booking
        </div>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, overflowX: 'auto', padding: 4,
        background: 'var(--glass-1)', borderRadius: 12,
        border: '1px solid var(--border-gold-0)',
      }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            padding: '9px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', transition: 'all 0.2s',
            background: tab === t.id ? 'var(--gold-glass-2)' : 'transparent',
            color: tab === t.id ? 'var(--gold)' : 'var(--text-secondary)',
            fontFamily: "'JetBrains Mono', monospace", fontSize: 12,
            fontWeight: tab === t.id ? 500 : 400,
            border: `1px solid ${tab === t.id ? 'var(--border-gold-1)' : 'transparent'}`,
            whiteSpace: 'nowrap', position: 'relative',
          }}>
            {t.label}
            {t.badge && (
              <span style={{
                position: 'absolute', top: 4, right: 4, width: 14, height: 14, borderRadius: '50%',
                background: 'var(--danger)', color: 'white', fontSize: 8, display: 'flex',
                alignItems: 'center', justifyContent: 'center', fontWeight: 600,
              }}>
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      {tab === 'plan' && (
        <div>
          <AIPlannerBar onSearch={setSelectedDest} />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }} className="travel-grid">
            <DestinationWeather />
            <CurrencyConverter />
          </div>
          <style>{`@media(max-width:700px){.travel-grid{grid-template-columns:1fr!important}}`}</style>
        </div>
      )}

      {tab === 'flights' && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              Results show price prediction (Hopper-powered) + DustMiles you'll earn
            </div>
            <button onClick={() => setAlertRoute('YEG → YVR')} className="btn-glass" style={{ padding: '8px 14px', fontSize: 12 }}>
              🔔 Price alert
            </button>
          </div>
          <FlightSearch />
        </div>
      )}

      {tab === 'hotels' && <HotelSearch />}

      {tab === 'my-trips' && (
        <div>
          <TripItinerary />
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 16, marginTop: 16 }}>
            <PackingList destination="Los Angeles" days={5} activities={['Beach', 'City', 'Dining']} />
          </div>
        </div>
      )}

      {tab === 'activities' && <ActivityFeed />}
      {tab === 'intel' && <InfluencerFeed />}

      {/* Price alert modal */}
      {alertRoute && (
        <PriceAlertModal route={alertRoute} onClose={() => setAlertRoute(null)} />
      )}
    </div>
  )
}
