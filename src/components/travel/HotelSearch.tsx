'use client'

type HotelSearchProps = {
  destination?: string | null
}

export default function HotelSearch({ destination }: HotelSearchProps) {
  return (
    <section style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
      <h4 className="font-display" style={{ margin: 0, fontSize: 18 }}>Hotel Search</h4>
      <p className="font-mono" style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
        Hotel matching{destination ? ` for ${destination}` : ''} with consistent pricing and inventory checks.
      </p>
    </section>
  )
}
