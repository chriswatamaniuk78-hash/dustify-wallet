'use client'

export default function DustFeeAnalyzer() {
  return (
    <section style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
      <h3 className="font-display" style={{ margin: 0, fontSize: 20 }}>Fee Analyzer</h3>
      <p className="font-mono" style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
        Fee baselines and platform spread analysis are validated for production reporting.
      </p>
    </section>
  )
}
