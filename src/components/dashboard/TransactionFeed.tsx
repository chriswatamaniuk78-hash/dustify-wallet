'use client'

import type { Transaction } from '@/types'

const SAMPLE_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx_1',
    type: 'SEND',
    amount: 24.5,
    status: 'COMPLETED',
    feeAmount: 0.02,
    pointsAwarded: 2,
    description: 'Sample transfer',
    createdAt: new Date().toISOString(),
  },
]

export default function TransactionFeed() {
  return (
    <div style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
      <h3 className="font-display" style={{ margin: 0, fontSize: 18 }}>Recent Transactions</h3>
      <ul style={{ margin: '10px 0 0', padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
        {SAMPLE_TRANSACTIONS.map(tx => (
          <li key={tx.id} className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
            {tx.type} {tx.amount} USDC · {tx.status}
          </li>
        ))}
      </ul>
    </div>
  )
}
