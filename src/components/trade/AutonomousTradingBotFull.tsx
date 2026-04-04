'use client'

import AutonomousTradingBot from './AutonomousTradingBot'

export default function AutonomousTradingBotFull() {
  return (
    <div style={{ display: 'grid', gap: 12 }}>
      <AutonomousTradingBot symbol="BTCUSD" />
      <AutonomousTradingBot symbol="ETHUSD" />
    </div>
  )
}
