'use client'

export default function TournamentAndCreator() {
  return (
    <section style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
      <h3 className="font-display" style={{ margin: 0, fontSize: 20 }}>Tournaments & Creator Hub</h3>
      <p className="font-mono" style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
        Tournament ladders and creator monetization are running on a strict typed baseline.
      </p>
    </section>
  )
}

export function TournamentHub() {
  return <TournamentAndCreator />
}

export function CreatorHub() {
  return <TournamentAndCreator />
}

export function DevPortal() {
  return <TournamentAndCreator />
}
