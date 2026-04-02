'use client'

import { useState } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import {
  MOCK_HOTELS,
  MOCK_ACTIVITIES,
  MOCK_INFLUENCER_INTEL,
  formatCAD,
  formatRating,
  categoryIcon,
  categoryColor,
  type Destination,
  type HotelResult,
  type Activity,
  type ActivityCategory,
} from '@/lib/travel-data'

// ============================================================
// HOTEL SEARCH
// ============================================================

function StarRow({ stars }: { stars: number }) {
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ fontSize: 10, color: i < stars ? 'var(--gold)' : 'var(--border-glass)' }}>★</span>
      ))}
    </div>
  )
}

function HotelCard({ hotel, onBook }: { hotel: HotelResult; onBook: () => void }) {
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)

  async function handleBook() {
    setBooking(true)
    await new Promise(r => setTimeout(r, 1400))
    setBooking(false)
    setBooked(true)
    onBook()
  }

  return (
    <div
      style={{
        background: 'var(--glass-1)',
        border: `1px solid ${hotel.dustPick ? 'var(--border-gold-2)' : 'var(--border-gold-0)'}`,
        borderRadius: 14,
        overflow: 'hidden',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', gap: 0 }}>
        {/* Image placeholder */}
        <div
          style={{
            width: 140,
            flexShrink: 0,
            background: `linear-gradient(135deg, ${hotel.images[0]}, #2a2a4a)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
          }}
        >
          {hotel.dustPick && (
            <div
              className="font-mono"
              style={{
                position: 'absolute',
                top: 8,
                left: 8,
                fontSize: 8,
                padding: '2px 7px',
                borderRadius: 100,
                background: 'var(--gold)',
                color: '#000',
                fontWeight: 700,
                letterSpacing: '0.08em',
              }}
            >
              DUST PICK
            </div>
          )}
          <span style={{ fontSize: 32, opacity: 0.3 }}>⌂</span>
        </div>

        {/* Content */}
        <div style={{ flex: 1, padding: '16px 18px' }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <div style={{ fontSize: 15, fontWeight: 500 }}>{hotel.name}</div>
                <StarRow stars={hotel.stars} />
              </div>
              <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 10 }}>
                {hotel.neighborhood} · {hotel.distanceFromCenter} from centre
              </div>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 10 }}>
                {hotel.amenities.slice(0, 4).map(a => (
                  <span
                    key={a}
                    className="font-mono"
                    style={{
                      fontSize: 9,
                      padding: '2px 8px',
                      borderRadius: 100,
                      background: 'var(--glass-2)',
                      color: 'var(--text-tertiary)',
                    }}
                  >
                    {a}
                  </span>
                ))}
                {hotel.amenities.length > 4 && (
                  <span className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)' }}>
                    +{hotel.amenities.length - 4} more
                  </span>
                )}
              </div>
            </div>

            {/* Rating + price */}
            <div style={{ textAlign: 'right', flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4, justifyContent: 'flex-end' }}>
                <div
                  style={{
                    padding: '3px 8px',
                    borderRadius: 6,
                    background: 'var(--gold-glass-2)',
                    border: '1px solid var(--border-gold-1)',
                    fontFamily: "'JetBrains Mono', monospace",
                    fontSize: 13,
                    fontWeight: 500,
                    color: 'var(--gold)',
                  }}
                >
                  {formatRating(hotel.rating)}
                </div>
                <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                  {hotel.reviewCount.toLocaleString()} reviews
                </span>
              </div>
              <div className="font-display" style={{ fontSize: 22, fontWeight: 600, color: 'var(--gold)', lineHeight: 1 }}>
                {formatCAD(hotel.pricePerNight)}
              </div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 10 }}>
                /night · +{hotel.pointsEarned} pts
              </div>
              <button
                className={booked ? 'btn-glass' : 'btn-sovereign'}
                style={{
                  padding: '8px 16px',
                  fontSize: 12,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onClick={handleBook}
                disabled={booking || booked}
              >
                {booking ? <><Spinner size={12} color="#000" />Booking…</> : booked ? '✓ Reserved' : 'Reserve'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export function HotelSearch({ destination }: { destination: Destination | null }) {
  const [sortBy, setSortBy] = useState<'price' | 'rating' | 'distance'>('rating')

  const sorted = [...MOCK_HOTELS].sort((a, b) => {
    if (sortBy === 'price') return a.pricePerNight - b.pricePerNight
    if (sortBy === 'rating') return b.rating - a.rating
    return a.distanceFromCenter.localeCompare(b.distanceFromCenter)
  })

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
        <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>SORT BY</span>
        {(['rating', 'price', 'distance'] as const).map(s => (
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
        <span className="font-mono" style={{ marginLeft: 'auto', fontSize: 11, color: 'var(--text-tertiary)' }}>
          Jun 15–22 · 2 guests
        </span>
      </div>

      {sorted.map(hotel => (
        <HotelCard key={hotel.id} hotel={hotel} onBook={() => {}} />
      ))}
    </div>
  )
}

// ============================================================
// ACTIVITY FEED
// ============================================================

function ActivityCard({ activity }: { activity: Activity }) {
  const [booking, setBooking] = useState(false)
  const [booked, setBooked] = useState(false)
  const color = categoryColor(activity.category)

  async function handleBook() {
    if (!activity.bookable) return
    setBooking(true)
    await new Promise(r => setTimeout(r, 1200))
    setBooking(false)
    setBooked(true)
  }

  return (
    <div
      style={{
        padding: '16px 18px',
        background: 'var(--glass-1)',
        border: `1px solid ${activity.localSecret ? 'rgba(212,175,55,0.2)' : 'var(--border-gold-0)'}`,
        borderRadius: 14,
      }}
    >
      <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
        {/* Category icon */}
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}15`,
            border: `1px solid ${color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            flexShrink: 0,
          }}
        >
          {categoryIcon(activity.category)}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 4, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 14, fontWeight: 500, flex: 1 }}>{activity.name}</div>
            <div style={{ display: 'flex', gap: 5, flexShrink: 0 }}>
              {activity.localSecret && <StatusBadge variant="gold">Local secret</StatusBadge>}
              {activity.influencerPick && <StatusBadge variant="info">Influencer pick</StatusBadge>}
            </div>
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 12 }}>
            {activity.description}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              ⏱ {activity.duration}
            </span>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              ★ {formatRating(activity.rating)} ({activity.reviewCount.toLocaleString()})
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                padding: '2px 8px',
                borderRadius: 100,
                background: `${color}12`,
                color,
                border: `1px solid ${color}25`,
              }}
            >
              {activity.category}
            </span>
          </div>
        </div>

        {/* Price + action */}
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div className="font-display" style={{ fontSize: 20, fontWeight: 600, color: activity.price === 0 ? 'var(--success)' : 'var(--gold)', lineHeight: 1 }}>
            {activity.price === 0 ? 'Free' : formatCAD(activity.price)}
          </div>
          {activity.pointsEarned > 0 && (
            <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8 }}>
              +{activity.pointsEarned} pts
            </div>
          )}
          {activity.bookable && (
            <button
              className={booked ? 'btn-glass' : 'btn-sovereign'}
              style={{ padding: '7px 14px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 6 }}
              onClick={handleBook}
              disabled={booking || booked}
            >
              {booking ? <><Spinner size={12} color="#000" />…</> : booked ? '✓ Booked' : 'Book'}
            </button>
          )}
          {!activity.bookable && (
            <button className="btn-ghost" style={{ padding: '7px 14px', fontSize: 12 }}>
              Save
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export function ActivityFeed({ destination }: { destination: Destination | null }) {
  const [filter, setFilter] = useState<ActivityCategory | 'ALL'>('ALL')

  const categories: (ActivityCategory | 'ALL')[] = ['ALL', 'FOOD', 'CULTURE', 'ADVENTURE', 'NATURE', 'NIGHTLIFE', 'SHOPPING']

  const filtered = filter === 'ALL'
    ? MOCK_ACTIVITIES
    : MOCK_ACTIVITIES.filter(a => a.category === filter)

  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            style={{
              padding: '6px 12px',
              borderRadius: 100,
              border: `1px solid ${filter === cat ? 'var(--border-gold-2)' : 'var(--border-glass)'}`,
              background: filter === cat ? 'var(--gold-glass-2)' : 'transparent',
              color: filter === cat ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily: "'Geist', system-ui, sans-serif",
              fontSize: 12,
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              alignItems: 'center',
              gap: 5,
            }}
          >
            {cat !== 'ALL' && <span>{categoryIcon(cat as ActivityCategory)}</span>}
            {cat === 'ALL' ? 'All' : cat.charAt(0) + cat.slice(1).toLowerCase()}
          </button>
        ))}
      </div>
      {filtered.map(activity => (
        <ActivityCard key={activity.id} activity={activity} />
      ))}
    </div>
  )
}

// ============================================================
// INFLUENCER INTEL
// ============================================================

export function InfluencerFeed({ destination }: { destination: Destination | null }) {
  return (
    <div className="animate-fade-up" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div
        style={{
          padding: '14px 16px',
          background: 'var(--gold-glass-1)',
          border: '1px solid var(--border-gold-1)',
          borderRadius: 12,
        }}
      >
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--gold-warm)', lineHeight: 1.5 }}>
          ✦ Dustify-verified creators share insider tips that don't make it into guidebooks. Updated daily from live travel content.
        </div>
      </div>

      {MOCK_INFLUENCER_INTEL.map(intel => (
        <div
          key={intel.id}
          style={{
            padding: '18px 20px',
            background: 'var(--glass-1)',
            border: '1px solid var(--border-gold-0)',
            borderRadius: 14,
          }}
        >
          {/* Influencer header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
            <div
              style={{
                width: 42,
                height: 42,
                borderRadius: '50%',
                background: 'var(--gold-glass-2)',
                border: '2px solid var(--border-gold-2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: "'Playfair Display', serif",
                fontSize: 14,
                fontWeight: 600,
                color: 'var(--gold)',
                flexShrink: 0,
              }}
            >
              {intel.influencerName.split(' ').map(n => n[0]).join('')}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ fontSize: 14, fontWeight: 500 }}>{intel.influencerName}</span>
                {intel.verified && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <circle cx="7" cy="7" r="6" fill="var(--gold)" opacity="0.2"/>
                    <circle cx="7" cy="7" r="6" stroke="var(--gold)" strokeWidth="1"/>
                    <path d="M4.5 7l2 2 3-3" stroke="var(--gold)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                {intel.influencerHandle} · {intel.followers} followers
              </div>
            </div>
            <div style={{ display: 'flex', flex: 'column', alignItems: 'flex-end', gap: 4 }}>
              <span
                className="font-mono"
                style={{
                  fontSize: 9,
                  padding: '2px 8px',
                  borderRadius: 100,
                  background: `${categoryColor(intel.category)}12`,
                  color: categoryColor(intel.category),
                  border: `1px solid ${categoryColor(intel.category)}25`,
                }}
              >
                {categoryIcon(intel.category)} {intel.category}
              </span>
              <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                {intel.postedAt}
              </span>
            </div>
          </div>

          {/* The tip */}
          <div
            style={{
              padding: '14px 16px',
              background: 'var(--glass-2)',
              borderRadius: 10,
              borderLeft: `3px solid ${categoryColor(intel.category)}`,
              fontSize: 14,
              color: 'var(--text-primary)',
              lineHeight: 1.65,
              fontStyle: 'italic',
              marginBottom: 12,
            }}
          >
            "{intel.tip}"
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
              ♥ {intel.likes.toLocaleString()} likes
            </span>
            <button className="btn-ghost" style={{ padding: '5px 12px', fontSize: 11 }}>
              Save tip
            </button>
            <button className="btn-glass" style={{ padding: '5px 12px', fontSize: 11 }}>
              Add to itinerary
            </button>
          </div>
        </div>
      ))}
    </div>
  )
}

export default HotelSearch
