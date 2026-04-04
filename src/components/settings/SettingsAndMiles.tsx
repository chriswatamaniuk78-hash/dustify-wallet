'use client'

import DustMilesRewards from './DustMilesRewards'

export function SettingsPage() {
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <h2 className="font-display" style={{ margin: 0, fontSize: 28 }}>Settings</h2>
      <div style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
        <p className="font-mono" style={{ margin: 0, fontSize: 12, color: 'var(--text-secondary)' }}>
          Security preferences, profile controls, and reward settings are configured for production safety.
        </p>
      </div>
      <DustMilesRewards />
    </section>
  )
}

export function MilesDashboard() {
  return <DustMilesRewards />
}
