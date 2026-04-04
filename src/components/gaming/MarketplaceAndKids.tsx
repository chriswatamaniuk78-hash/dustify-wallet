'use client'

export default function MarketplaceAndKids() {
  return (
    <section style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
      <h3 className="font-display" style={{ margin: 0, fontSize: 20 }}>Marketplace & Family Controls</h3>
      <p className="font-mono" style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
        Product-safe baseline is active for game ownership and parental-control surfaces.
      </p>
    </section>
  )
}

export function GameMarketplace() {
  return <MarketplaceAndKids />
}

export function KidsZone() {
  return <MarketplaceAndKids />
}
