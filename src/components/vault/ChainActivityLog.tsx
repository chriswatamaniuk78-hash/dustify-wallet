'use client'

import { useState } from 'react'
import { CopyButton } from '@/components/ui'
import { MOCK_CHAIN_EVENTS, type ChainEvent, type ChainEventType } from '@/lib/vault-data'

const EVENT_CONFIG: Record<ChainEventType, { icon: string; color: string; label: string }> = {
  SBT_MINTED:            { icon: '◆', color: '#D4AF37', label: 'Token minted'    },
  SBT_VERIFIED:          { icon: '◎', color: '#1D9E75', label: 'Identity verified' },
  FILE_UPLOADED:         { icon: '▲', color: '#378ADD', label: 'File uploaded'    },
  ACCESS_GRANTED:        { icon: '◉', color: '#EF9F27', label: 'Access granted'   },
  ACCESS_REVOKED:        { icon: '◌', color: '#f87171', label: 'Access revoked'   },
  CREDENTIAL_SHARED:     { icon: '◈', color: '#7F77DD', label: 'Credential shared' },
  TRANSMISSION_SENT:     { icon: '▶', color: '#60a5fa', label: 'Transmission sent' },
  TRANSMISSION_RECEIVED: { icon: '◀', color: '#4ade80', label: 'Transmission rcvd' },
  KEY_ROTATED:           { icon: '⟳', color: '#D4AF37', label: 'Keys rotated'     },
}

function formatTimestamp(iso: string): { date: string; time: string } {
  const d = new Date(iso)
  return {
    date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    time: d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
  }
}

function ChainEventRow({ event }: { event: ChainEvent }) {
  const [expanded, setExpanded] = useState(false)
  const cfg = EVENT_CONFIG[event.type]
  const { date, time } = formatTimestamp(event.timestamp)

  return (
    <div
      style={{
        borderBottom: '1px solid rgba(255,255,255,0.04)',
      }}
    >
      <div
        onClick={() => setExpanded(e => !e)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          padding: '12px 8px',
          cursor: 'pointer',
          borderRadius: 10,
          transition: 'background 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'var(--glass-1)' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent' }}
      >
        {/* Icon */}
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: '50%',
            background: `${cfg.color}12`,
            border: `1px solid ${cfg.color}25`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            color: cfg.color,
            flexShrink: 0,
          }}
        >
          {cfg.icon}
        </div>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
            {event.description}
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 2 }}
          >
            {date} · {time}
          </div>
        </div>

        {/* Type tag + expand arrow */}
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0 }}>
          <span
            className="font-mono"
            style={{
              fontSize: 9,
              padding: '2px 8px',
              borderRadius: 100,
              background: `${cfg.color}10`,
              color: cfg.color,
              border: `1px solid ${cfg.color}22`,
              letterSpacing: '0.06em',
            }}
          >
            {cfg.label}
          </span>
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            style={{
              color: 'var(--text-tertiary)',
              transition: 'transform 0.2s',
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          >
            <path d="M2 4l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>

      {/* Expanded tx details */}
      {expanded && (
        <div
          style={{
            margin: '0 8px 12px',
            padding: '14px',
            background: 'var(--void-2)',
            border: '1px solid var(--border-void)',
            borderRadius: 10,
          }}
        >
          <div
            className="font-mono"
            style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 8, letterSpacing: '0.12em' }}
          >
            TRANSACTION HASH
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: 'var(--gold-warm)',
              wordBreak: 'break-all',
              lineHeight: 1.6,
              marginBottom: 10,
            }}
          >
            {event.txHash}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <CopyButton text={event.txHash} label="Copy hash" />
            <button
              className="btn-ghost"
              style={{ padding: '7px 12px', fontSize: 12 }}
              onClick={() => window.open(`https://polygonscan.com/tx/${event.txHash}`, '_blank')}
            >
              View on Polygonscan ↗
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ChainActivityLog() {
  const [showAll, setShowAll] = useState(false)

  const displayed = showAll
    ? MOCK_CHAIN_EVENTS
    : MOCK_CHAIN_EVENTS.slice(0, 5)

  return (
    <div className="glass animate-fade-up delay-4" style={{ padding: 24 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>
            On-chain activity
          </div>
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
            {MOCK_CHAIN_EVENTS.length} events · Polygon · Immutable
          </div>
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 5,
            padding: '5px 10px',
            background: 'rgba(74,222,128,0.06)',
            border: '1px solid rgba(74,222,128,0.18)',
            borderRadius: 100,
          }}
        >
          <div
            style={{
              width: 5, height: 5, borderRadius: '50%',
              background: 'var(--success)',
              boxShadow: '0 0 6px var(--success)',
            }}
          />
          <span className="font-mono" style={{ fontSize: 9, color: 'var(--success)', letterSpacing: '0.1em' }}>
            TAMPER-PROOF
          </span>
        </div>
      </div>

      <div>
        {displayed.map(event => (
          <ChainEventRow key={event.id} event={event} />
        ))}
      </div>

      {MOCK_CHAIN_EVENTS.length > 5 && (
        <button
          className="btn-ghost"
          style={{ width: '100%', marginTop: 12, padding: '10px', fontSize: 13 }}
          onClick={() => setShowAll(s => !s)}
        >
          {showAll
            ? 'Show less'
            : `Show ${MOCK_CHAIN_EVENTS.length - 5} more events`}
        </button>
      )}
    </div>
  )
}
