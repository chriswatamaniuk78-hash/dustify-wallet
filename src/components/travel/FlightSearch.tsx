'use client'

type FlightSearchProps = {
  destination?: string | null
}

export default function FlightSearch({ destination }: FlightSearchProps) {
  return (
    <section style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
      <h4 className="font-display" style={{ margin: 0, fontSize: 18 }}>Flight Search</h4>
      <p className="font-mono" style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
        Searching flights{destination ? ` for ${destination}` : ''} with validated fare sources.
      </p>
    </section>
  )
}
