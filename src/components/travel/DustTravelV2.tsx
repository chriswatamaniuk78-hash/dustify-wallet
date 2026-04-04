'use client'

type DestinationCard = {
  id: string
  city: string
  avgPrice: number
  signal: 'BUY_NOW' | 'FAIR' | 'WATCH'
}

const DESTINATIONS: DestinationCard[] = [
  { id: 'd_1', city: 'Tokyo', avgPrice: 920, signal: 'WATCH' },
  { id: 'd_2', city: 'Lisbon', avgPrice: 610, signal: 'FAIR' },
]

export default function DustTravelV2() {
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <header>
        <h2 className="font-display" style={{ margin: 0, fontSize: 28 }}>Travel Intelligence</h2>
        <p className="font-mono" style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
          Flight and hotel discovery with clear pricing signals and wallet-native checkout.
        </p>
      </header>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {DESTINATIONS.map(dest => (
          <article key={dest.id} style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
            <div className="font-display" style={{ fontSize: 18 }}>{dest.city}</div>
            <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
              Avg fare: ${dest.avgPrice.toFixed(0)} · Signal: {dest.signal}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
