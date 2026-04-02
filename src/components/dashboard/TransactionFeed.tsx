'use client'

import { formatUSDC } from '@/types'
import type { Transaction, TransactionType } from '@/types'

// Maps transaction type → display config
function getTransactionDisplay(type: TransactionType) {
  const map: Record<TransactionType, { label: string; icon: string; color: string }> = {
    TRADE_BOT:       { label: 'Bot trade',       icon: '◉', color: '#D4AF37' },
    TRADE_STOCK:     { label: 'Stock trade',      icon: '◈', color: '#D4AF37' },
    TRADE_CRYPTO:    { label: 'Crypto trade',     icon: '◉', color: '#D4AF37' },
    TRADE_FOREX:     { label: 'Forex trade',      icon: '◈', color: '#D4AF37' },
    TRAVEL_FLIGHT:   { label: 'Flight',           icon: '▷', color: '#60a5fa' },
    TRAVEL_HOTEL:    { label: 'Hotel',            icon: '▢', color: '#60a5fa' },
    TRAVEL_ACTIVITY: { label: 'Activity',         icon: '◎', color: '#60a5fa' },
    SBT_TRANSFER:    { label: 'SBT transfer',     icon: '◆', color: '#7F77DD' },
    USDC_SEND:       { label: 'Sent USDC',        icon: '▶', color: '#f87171' },
    USDC_RECEIVE:    { label: 'Received USDC',    icon: '▶', color: '#4ade80' },
    POINTS_REDEMPTION:{ label: 'Points redeemed', icon: '◈', color: '#EF9F27' },
    GAME_PURCHASE:   { label: 'Game purchase',    icon: '▣', color: '#EF9F27' },
    GAME_REVENUE:    { label: 'Game revenue',     icon: '▣', color: '#4ade80' },
    CODE_DEPLOY:     { label: 'Code deploy',      icon: '◩', color: '#4ade80' },
    CONTENT_POST:    { label: 'Post published',   icon: '◎', color: '#C9A84C' },
    REFERRAL:        { label: 'Referral bonus',   icon: '◆', color: '#4ade80' },
  }
  return map[type] ?? { label: type, icon: '●', color: 'var(--text-tertiary)' }
}

function timeAgo(isoString: string): string {
  const diff = Date.now() - new Date(isoString).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function TransactionRow({ txn }: { txn: Transaction }) {
  const display = getTransactionDisplay(txn.type)
  const isFeeOnly = txn.amount === 0
  const isIncoming = ['USDC_RECEIVE', 'REFERRAL', 'GAME_REVENUE'].includes(txn.type)

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '12px 0',
        borderBottom: '1px solid rgba(255,255,255,0.04)',
        transition: 'background 0.15s',
      }}
    >
      {/* Icon */}
      <div
        style={{
          width: 38,
          height: 38,
          borderRadius: '50%',
          background: `${display.color}15`,
          border: `1px solid ${display.color}30`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 14,
          color: display.color,
          flexShrink: 0,
        }}
      >
        {display.icon}
      </div>

      {/* Description */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: 'var(--text-primary)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
          }}
        >
          {txn.description}
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}
        >
          {timeAgo(txn.createdAt)}
        </div>
      </div>

      {/* Amount + points */}
      <div style={{ textAlign: 'right', flexShrink: 0 }}>
        {!isFeeOnly && (
          <div
            className="font-mono"
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: isIncoming ? 'var(--success)' : 'var(--text-secondary)',
            }}
          >
            {isIncoming ? '+' : ''}{formatUSDC(txn.amount)}
          </div>
        )}
        {txn.pointsAwarded > 0 && (
          <div
            className="font-mono"
            style={{ fontSize: 11, color: 'var(--gold-warm)', marginTop: 2 }}
          >
            +{txn.pointsAwarded.toLocaleString()} pts
          </div>
        )}
        {txn.feeAmount > 0 && (
          <div
            className="font-mono"
            style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 1 }}
          >
            fee: {formatUSDC(txn.feeAmount)}
          </div>
        )}
      </div>
    </div>
  )
}

interface TransactionFeedProps {
  transactions: Transaction[]
}

export default function TransactionFeed({ transactions }: TransactionFeedProps) {
  return (
    <div className="glass animate-fade-up delay-4" style={{ padding: '24px' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 16,
        }}
      >
        <div
          className="font-display"
          style={{ fontSize: 18, fontWeight: 500 }}
        >
          Activity
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div className="live-dot">Live</div>
          <button
            className="btn-ghost"
            style={{ fontSize: 12, padding: '5px 12px' }}
          >
            View all
          </button>
        </div>
      </div>

      <div>
        {transactions.map((txn) => (
          <TransactionRow key={txn.id} txn={txn} />
        ))}
      </div>

      {transactions.length === 0 && (
        <div
          style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: 'var(--text-tertiary)',
            fontSize: 14,
          }}
        >
          No transactions yet. Start trading or traveling to earn points.
        </div>
      )}
    </div>
  )
}
