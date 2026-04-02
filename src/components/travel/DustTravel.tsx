'use client'

import { useState } from 'react'
import { StatusBadge, Spinner } from '@/components/ui'
import {
  TRENDING_DESTINATIONS,
  AI_TRIP_SUGGESTIONS,
  formatCAD,
  type Destination,
} from '@/lib/travel-data'
import FlightSearch from './FlightSearch'
import HotelSearch from './HotelSearch'
import ActivityFeed from './ActivityFeed'
import InfluencerFeed from './InfluencerFeed'

// ── AI Planner prompt bar ─────────────────────────────────────

function AIPlannerBar({ onSearch }: { onSearch: (dest: string) => void }) {
  const [query, setQuery] = useState('')
  const [thinking, setThinking] = useState(false)
  const [suggestions, setSuggestions] = useState<string[]>([])

  const EXAMPLE_PROMPTS = [
    'Warm beach, great food, under $3k for 10 days in July',
    'Adventure trip, mountains, solo traveler, November',
    'Cultural city break, 5 days, art and architecture',
    'Honeymoon, luxury, somewhere I\'ve never heard of',
  ]

  async function handleSearch() {
    if (!query.trim()) return
    setThinking(true)
    await new Promise(r => setTimeout(r, 1800))
    setThinking(false)
    setSuggestions(AI_TRIP_SUGGESTIONS)
    // Extract destination from query for demo
    onSearch('Tokyo')
  }

  return (
    <div
      className="glass-heavy animate-fade-up"
      style={{ padding: 28, marginBottom: 20 }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <div
          style={{
            width: 36, height: 36, borderRadius: 10,
            background: 'var(--gold-glass-2)',
            border: '1px solid var(--border-gold-2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18,
          }}
        >
          ✈
        </div>
        <div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>
            Dust Travel AI
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
            Tell me where you want to go — or let me surprise you
          </div>
        </div>
        <div style={{ marginLeft: 'auto' }}>
          <StatusBadge variant="gold">SURGE tier — 2.5% fee vs Expedia 18%</StatusBadge>
        </div>
      </div>

      {/* Search bar */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <div style={{ flex: 1, position: 'relative' }}>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Describe your dream trip in plain English..."
            style={{
              width: '100%',
              background: 'var(--glass-1)',
              border: '1px solid var(--border-gold-2)',
              borderRadius: 12,
              padding: '14px 18px',
              color: 'var(--text-primary)',
              fontFamily: "'Geist', system-ui, sans-serif",
              fontSize: 15,
              outline: 'none',
            }}
          />
        </div>
        <button
          className="btn-sovereign"
          style={{
            padding: '0 24px',
            fontSize: 14,
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            flexShrink: 0,
          }}
          onClick={handleSearch}
          disabled={thinking}
        >
          {thinking ? <><Spinner size={16} color="#000" /> Planning…</> : 'Plan trip'}
        </button>
      </div>

      {/* Example prompts */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {EXAMPLE_PROMPTS.map(p => (
          <button
            key={p}
            onClick={() => { setQuery(p); }}
            style={{
              padding: '5px 12px',
              borderRadius: 100,
              border: '1px solid var(--border-gold-0)',
              background: 'transparent',
              color: 'var(--text-tertiary)',
              fontFamily: "'JetBrains Mono', monospace",
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.15s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.borderColor = 'var(--border-gold-2)'
              e.currentTarget.style.color = 'var(--gold-warm)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.borderColor = 'var(--border-gold-0)'
              e.currentTarget.style.color = 'var(--text-tertiary)'
            }}
          >
            {p}
          </button>
        ))}
      </div>

      {/* AI suggestions */}
      {suggestions.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div
            className="font-mono"
            style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--gold-warm)', marginBottom: 10, textTransform: 'uppercase' }}
          >
            AI insights for your trip
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {suggestions.slice(0, 3).map((s, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  gap: 10,
                  padding: '10px 14px',
                  background: 'var(--glass-1)',
                  border: '1px solid var(--border-gold-0)',
                  borderRadius: 10,
                }}
              >
                <span style={{ fontSize: 14, flexShrink: 0 }}>✦</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                  {s}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Destination card ──────────────────────────────────────────

function DestinationCard({
  dest,
  onSelect,
}: {
  dest: Destination
  onSelect: (d: Destination) => void
}) {
  return (
    <div
      onClick={() => onSelect(dest)}
      style={{
        borderRadius: 14,
        overflow: 'hidden',
        border: '1px solid var(--border-gold-1)',
        cursor: 'pointer',
        transition: 'all 0.2s',
        background: 'var(--glass-1)',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)'
        e.currentTarget.style.boxShadow = '0 8px 32px rgba(212,175,55,0.15)'
        e.currentTarget.style.borderColor = 'var(--border-gold-2)'
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)'
        e.currentTarget.style.boxShadow = 'none'
        e.currentTarget.style.borderColor = 'var(--border-gold-1)'
      }}
    >
      {/* Image placeholder */}
      <div
        style={{
          height: 120,
          background: `linear-gradient(135deg, ${dest.coverImage}, #2a2a4a)`,
          display: 'flex',
          alignItems: 'flex-end',
          padding: '12px',
          position: 'relative',
        }}
      >
        {dest.trendingRank && (
          <div
            className="font-mono"
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              fontSize: 9,
              padding: '2px 8px',
              borderRadius: 100,
              background: 'rgba(212,175,55,0.2)',
              border: '1px solid rgba(212,175,55,0.4)',
              color: 'var(--gold)',
              letterSpacing: '0.1em',
            }}
          >
            #{dest.trendingRank} TRENDING
          </div>
        )}
        <div>
          <div
            className="font-display"
            style={{ fontSize: 20, fontWeight: 500, color: '#fff', lineHeight: 1.1 }}
          >
            {dest.city}
          </div>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)' }}>
            {dest.country}
          </div>
        </div>
      </div>

      {/* Details */}
      <div style={{ padding: '12px 14px' }}>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-secondary)',
            lineHeight: 1.5,
            marginBottom: 10,
          }}
        >
          {dest.tagline}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            <span style={{ fontSize: 10, color: 'var(--text-tertiary)', fontFamily: "'JetBrains Mono', monospace" }}>
              DUST SCORE
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: 13,
                fontWeight: 500,
                color: dest.dustScore >= 95 ? 'var(--gold)' : 'var(--text-secondary)',
              }}
            >
              {dest.dustScore}
            </span>
          </div>
          <div style={{ display: 'flex', gap: 4 }}>
            {dest.bestMonths.slice(0, 3).map(m => (
              <span
                key={m}
                className="font-mono"
                style={{
                  fontSize: 9,
                  padding: '2px 6px',
                  borderRadius: 100,
                  background: 'var(--glass-2)',
                  color: 'var(--text-tertiary)',
                }}
              >
                {m}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Tab navigation ────────────────────────────────────────────

type TravelTab = 'explore' | 'flights' | 'hotels' | 'activities' | 'intel'

const TABS: { id: TravelTab; label: string; icon: string }[] = [
  { id: 'explore',    label: 'Explore',    icon: '◎' },
  { id: 'flights',    label: 'Flights',    icon: '✈' },
  { id: 'hotels',     label: 'Hotels',     icon: '⌂' },
  { id: 'activities', label: 'Activities', icon: '◆' },
  { id: 'intel',      label: 'Insider intel', icon: '◉' },
]

// ── Main Dust Travel component ────────────────────────────────

export default function DustTravel() {
  const [activeTab, setActiveTab] = useState<TravelTab>('explore')
  const [selectedDest, setSelectedDest] = useState<Destination | null>(null)

  function handleDestSelect(dest: Destination) {
    setSelectedDest(dest)
    setActiveTab('flights')
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      {/* AI Planner */}
      <AIPlannerBar onSearch={() => {}} />

      {/* Tab bar */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          background: 'var(--glass-2)',
          border: '1px solid var(--border-gold-0)',
          borderRadius: 14,
          overflowX: 'auto',
        }}
      >
        {TABS.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            style={{
              flex: 1,
              minWidth: 'max-content',
              padding: '9px 12px',
              borderRadius: 10,
              border: 'none',
              background: activeTab === tab.id ? 'var(--gold-glass-3)' : 'transparent',
              color: activeTab === tab.id ? 'var(--gold)' : 'var(--text-secondary)',
              fontFamily: "'Geist', system-ui, sans-serif",
              fontSize: 12,
              fontWeight: activeTab === tab.id ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              justifyContent: 'center',
            }}
          >
            <span style={{ fontSize: 13 }}>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Selected destination badge */}
      {selectedDest && activeTab !== 'explore' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            padding: '10px 16px',
            background: 'var(--gold-glass-1)',
            border: '1px solid var(--border-gold-1)',
            borderRadius: 10,
          }}
        >
          <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>SEARCHING IN</span>
          <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--gold)' }}>
            {selectedDest.city}, {selectedDest.country}
          </span>
          <button
            onClick={() => setSelectedDest(null)}
            className="font-mono"
            style={{
              marginLeft: 'auto',
              background: 'transparent',
              border: 'none',
              color: 'var(--text-tertiary)',
              cursor: 'pointer',
              fontSize: 12,
            }}
          >
            Change ×
          </button>
        </div>
      )}

      {/* Tab content */}
      {activeTab === 'explore' && (
        <div className="animate-fade-up">
          <div
            className="font-mono"
            style={{ fontSize: 10, letterSpacing: '0.18em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 14 }}
          >
            Trending destinations — ranked by Dustify community
          </div>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 12,
            }}
          >
            {TRENDING_DESTINATIONS.map(dest => (
              <DestinationCard
                key={dest.id}
                dest={dest}
                onSelect={handleDestSelect}
              />
            ))}
          </div>

          {/* Fee comparison banner */}
          <div
            style={{
              marginTop: 16,
              padding: '16px 20px',
              background: 'var(--glass-1)',
              border: '1px solid var(--border-gold-1)',
              borderRadius: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 20,
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                DUST TRAVEL FEE
              </div>
              <div className="font-display" style={{ fontSize: 22, fontWeight: 500, color: 'var(--gold)' }}>
                2.5%
              </div>
            </div>
            <div style={{ height: 40, width: 1, background: 'var(--border-glass)' }} />
            <div>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                EXPEDIA / BOOKING FEE
              </div>
              <div className="font-display" style={{ fontSize: 22, fontWeight: 500, color: 'var(--danger)' }}>
                15–25%
              </div>
            </div>
            <div style={{ height: 40, width: 1, background: 'var(--border-glass)' }} />
            <div style={{ flex: 1 }}>
              <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>
                YOUR SAVINGS ON A $3,000 TRIP
              </div>
              <div className="font-display" style={{ fontSize: 22, fontWeight: 500, color: 'var(--success)' }}>
                {formatCAD(375)} – {formatCAD(675)}
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0 }}>
              <StatusBadge variant="success">+Waterfall points</StatusBadge>
              <StatusBadge variant="gold">SURGE 3x multiplier</StatusBadge>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'flights' && (
        <FlightSearch destination={selectedDest} />
      )}

      {activeTab === 'hotels' && (
        <HotelSearch destination={selectedDest} />
      )}

      {activeTab === 'activities' && (
        <ActivityFeed destination={selectedDest} />
      )}

      {activeTab === 'intel' && (
        <InfluencerFeed destination={selectedDest} />
      )}
    </div>
  )
}
