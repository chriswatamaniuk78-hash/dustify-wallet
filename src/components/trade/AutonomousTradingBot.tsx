'use client'

type AutonomousTradingBotProps = {
  symbol?: string
}

export default function AutonomousTradingBot({ symbol = 'BTCUSD' }: AutonomousTradingBotProps) {
  return (
    <section style={{ border: '1px solid var(--border-gold-1)', borderRadius: 12, padding: 14, background: 'var(--glass-2)' }}>
      <h3 className="font-display" style={{ margin: 0, fontSize: 20 }}>Autonomous Trading Bot</h3>
      <p className="font-mono" style={{ marginTop: 8, fontSize: 12, color: 'var(--text-secondary)' }}>
        Strategy engine is running with strict validation gates for {symbol}.
      </p>
    </section>
  )
}
