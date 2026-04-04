import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import BalanceHero from '@/components/dashboard/BalanceHero'
import StatsRow from '@/components/dashboard/StatsRow'
import TransactionFeed from '@/components/dashboard/TransactionFeed'
import BotStatusWidget from '@/components/dashboard/BotStatusWidget'
import QuickApps from '@/components/dashboard/QuickApps'
const DEFAULT_USER = { name: 'Sovereign Holder', email: '' }
const DEFAULT_WALLET = {
  id: 'sw_local',
  walletAddress: '0xD4AF3789AbCdEf012345678901234567890ABCDE',
  sbtTokenId: '847',
  usdcBalance: 0,
  pointsBalance: 0,
  rewardsTier: 'PIONEER',
  isQuantumShielded: true,
  mintedAt: new Date().toISOString(),
}
const DEFAULT_TRANSACTIONS: any[] = []
const DEFAULT_BOT_CONFIG = { isEnabled: false, strategy: 'CONSERVATIVE', maxPositionSize: 1000 }
const DEFAULT_BOT_STATS = { tradesToday: 0, pnlToday: 0, feesGeneratedToday: 0 }
const DEFAULT_POSITIONS: any[] = []


export const metadata: Metadata = {
  title: 'Dashboard',
}

// Total portfolio value from positions
function calcPortfolioValue() {
  return DEFAULT_POSITIONS.reduce((sum, pos) => sum + pos.currentValue, 0)
}

export default function DashboardPage() {
  const portfolioValue = calcPortfolioValue()

  return (
    <ShellLayout>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div
          className="font-mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.2em',
            color: 'var(--gold-warm)',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          Soul Wallet
        </div>
        <h1
          className="font-display"
          style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.1 }}
        >
          Your Sovereign Hub
        </h1>
      </div>

      {/* Balance hero — full width */}
      <BalanceHero
        wallet={DEFAULT_WALLET}
        user={DEFAULT_USER}
      />

      {/* 4-metric stats row */}
      <StatsRow
        wallet={DEFAULT_WALLET}
        portfolioValue={portfolioValue}
        botTradesToday={DEFAULT_BOT_STATS.tradesToday}
        pnlToday={DEFAULT_BOT_STATS.pnlToday}
      />

      {/* Two-column: transactions feed + right sidebar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 340px',
          gap: 16,
          alignItems: 'start',
        }}
        className="dashboard-grid"
      >
        {/* Left: transaction feed (wider) */}
        <TransactionFeed transactions={DEFAULT_TRANSACTIONS} />

        {/* Right: bot status + quick apps */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <BotStatusWidget
            config={DEFAULT_BOT_CONFIG}
            tradesToday={DEFAULT_BOT_STATS.tradesToday}
            pnlToday={DEFAULT_BOT_STATS.pnlToday}
            feesToday={DEFAULT_BOT_STATS.feesGeneratedToday}
          />
          <QuickApps />
        </div>
      </div>

      {/* Responsive override for narrow screens */}
      <style>{`
        @media (max-width: 768px) {
          .dashboard-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </ShellLayout>
  )
}
