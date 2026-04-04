'use client'

type GameCard = {
  id: string
  title: string
  prizePool: number
  status: 'LIVE' | 'UPCOMING'
}

const GAMES: GameCard[] = [
  { id: 'g_1', title: 'Nebula Sprint', prizePool: 1200, status: 'LIVE' },
  { id: 'g_2', title: 'Vault Skirmish', prizePool: 800, status: 'UPCOMING' },
]

export default function DustGamingUltimate() {
  return (
    <section style={{ display: 'grid', gap: 12 }}>
      <header>
        <h2 className="font-display" style={{ fontSize: 28, margin: 0 }}>Gaming Arena</h2>
        <p className="font-mono" style={{ marginTop: 8, color: 'var(--text-secondary)', fontSize: 12 }}>
          Competitive matches with wallet-native rewards and anti-abuse controls.
        </p>
      </header>
      <div style={{ display: 'grid', gap: 10, gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))' }}>
        {GAMES.map(game => (
          <article key={game.id} style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
            <div className="font-display" style={{ fontSize: 18 }}>{game.title}</div>
            <div className="font-mono" style={{ fontSize: 12, color: 'var(--text-secondary)', marginTop: 6 }}>
              Prize pool: ${game.prizePool.toFixed(0)} USDC · {game.status}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}
