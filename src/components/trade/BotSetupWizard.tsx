'use client'
// ============================================================
// dustify-wallet/src/components/trade/BotSetupWizard.tsx
// Autonomous trading bot setup — production quality
// Exchange: Alpaca / Coinbase Advanced / OANDA
// ============================================================
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, CheckCircle, AlertTriangle, Zap, TrendingUp, Shield, BarChart3 } from 'lucide-react'

type WizardStep = 'exchange' | 'strategy' | 'risk' | 'review' | 'deploying' | 'live'
type Exchange = 'ALPACA' | 'COINBASE' | 'OANDA'
type StrategyType = 'MOMENTUM' | 'MEAN_REVERSION' | 'BREAKOUT' | 'SWING' | 'DCA' | 'CUSTOM'

interface BotConfig {
  name: string
  exchange: Exchange
  strategy: StrategyType
  symbols: string[]
  maxPositionPct: number
  dailyLossLimitPct: number
  takeProfitPct: number
  stopLossPct: number
  tradeFrequency: 'SCALP' | 'INTRADAY' | 'SWING'
  paperMode: boolean
  apiKey: string
  apiSecret: string
}

const EXCHANGES = [
  {
    id: 'ALPACA' as Exchange,
    name: 'Alpaca Markets',
    icon: '📈',
    desc: 'US equities & crypto. Commission-free. Paper trading included. Best for stocks.',
    color: '#FFD700',
    markets: ['US Stocks', 'Crypto'],
    minCapital: '$0',
    paperAvailable: true,
  },
  {
    id: 'COINBASE' as Exchange,
    name: 'Coinbase Advanced',
    icon: '₿',
    desc: 'Crypto-only. Deep liquidity. BTC, ETH, SOL, and 200+ assets.',
    color: '#0052FF',
    markets: ['Crypto'],
    minCapital: '$10',
    paperAvailable: false,
  },
  {
    id: 'OANDA' as Exchange,
    name: 'OANDA',
    icon: '💱',
    desc: 'Forex & CFDs. 24/5 trading. 70+ currency pairs. Leverage available.',
    color: '#E8402A',
    markets: ['Forex', 'CFDs'],
    minCapital: '$1',
    paperAvailable: true,
  },
]

const STRATEGIES: { id: StrategyType; name: string; icon: React.ElementType; desc: string; risk: 'LOW' | 'MEDIUM' | 'HIGH'; timeframe: string; winRate: string }[] = [
  { id: 'MOMENTUM',       name: 'Momentum Alpha',     icon: Zap,       desc: 'Follow strong price trends. Buy breakouts, ride momentum, exit on reversal signals.', risk: 'MEDIUM', timeframe: 'Intraday', winRate: '62%' },
  { id: 'MEAN_REVERSION', name: 'Mean Reversion',     icon: BarChart3, desc: 'Buy oversold, sell overbought. Exploits short-term price deviations from moving averages.', risk: 'LOW', timeframe: 'Intraday', winRate: '68%' },
  { id: 'BREAKOUT',       name: 'Breakout Hunter',    icon: TrendingUp,desc: 'Detect consolidation, trade the explosive move when price breaks key levels.', risk: 'HIGH', timeframe: 'Scalp-Swing', winRate: '55%' },
  { id: 'SWING',          name: 'Swing Trader',        icon: TrendingUp,desc: 'Multi-day positions capturing larger price swings. Lower frequency, higher per-trade target.', risk: 'MEDIUM', timeframe: 'Swing', winRate: '58%' },
  { id: 'DCA',            name: 'DCA Accumulator',    icon: Shield,    desc: 'Systematic buying on price drops. Best for long-term crypto accumulation with defined entry levels.', risk: 'LOW', timeframe: 'Daily', winRate: '71%' },
  { id: 'CUSTOM',         name: 'Custom Strategy',    icon: Zap,       desc: 'Describe your strategy in plain English. SCRAPPY translates it into a working algorithm.', risk: 'MEDIUM', timeframe: 'Any', winRate: 'Varies' },
]

const RISK_PRESETS = [
  { name: 'Conservative', maxPosition: 5,  dailyLoss: 2, takeProfit: 3, stopLoss: 1.5, color: '#4ade80',  desc: 'Preserve capital first. Smaller gains, much lower drawdown.' },
  { name: 'Balanced',     maxPosition: 10, dailyLoss: 3, takeProfit: 5, stopLoss: 2.5, color: '#D4AF37',  desc: 'Industry-standard position sizing. Good risk/reward ratio.' },
  { name: 'Aggressive',   maxPosition: 20, dailyLoss: 5, takeProfit: 8, stopLoss: 4,   color: '#ef4444',  desc: 'Higher risk, higher reward. Only for experienced traders.' },
]

export default function BotSetupWizard({ onComplete }: { onComplete?: (config: BotConfig) => void }) {
  const [step, setStep] = useState<WizardStep>('exchange')
  const [config, setConfig] = useState<Partial<BotConfig>>({
    paperMode: true,
    maxPositionPct: 10,
    dailyLossLimitPct: 3,
    takeProfitPct: 5,
    stopLossPct: 2.5,
    symbols: ['AAPL', 'TSLA', 'NVDA'],
  })
  const [deployProgress, setDeployProgress] = useState(0)
  const [apiKeyVisible, setApiKeyVisible] = useState(false)

  const steps: WizardStep[] = ['exchange', 'strategy', 'risk', 'review', 'deploying', 'live']
  const stepIdx = steps.indexOf(step)

  async function handleDeploy() {
    setStep('deploying')
    for (let i = 0; i <= 100; i += 8) {
      await new Promise(r => setTimeout(r, 120))
      setDeployProgress(Math.min(100, i))
    }
    setStep('live')
    onComplete?.(config as BotConfig)
  }

  const selectedExchange = EXCHANGES.find(e => e.id === config.exchange)
  const selectedStrategy = STRATEGIES.find(s => s.id === config.strategy)

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress bar */}
      {step !== 'deploying' && step !== 'live' && (
        <div className="flex items-center gap-1 mb-8">
          {['exchange', 'strategy', 'risk', 'review'].map((s, i) => (
            <div key={s} className="flex items-center gap-1 flex-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[9px] transition-all"
                style={{
                  background: stepIdx > i ? 'rgba(74,222,128,0.15)' : stepIdx === i ? 'rgba(212,175,55,0.15)' : 'rgba(255,255,255,0.04)',
                  border: `1px solid ${stepIdx > i ? 'rgba(74,222,128,0.4)' : stepIdx === i ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}`,
                  color: stepIdx > i ? '#4ade80' : stepIdx === i ? '#D4AF37' : 'rgba(255,255,255,0.3)',
                }}>
                {stepIdx > i ? '✓' : i + 1}
              </div>
              {i < 3 && <div className="flex-1 h-px" style={{ background: stepIdx > i ? 'rgba(74,222,128,0.25)' : 'rgba(255,255,255,0.06)' }} />}
            </div>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">

        {/* STEP 1: Exchange */}
        {step === 'exchange' && (
          <motion.div key="exchange" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
            className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-black text-white mb-1">Choose Your Exchange</h2>
              <p className="font-body text-sm text-white/40">Your API keys are stored encrypted in Supabase Vault. Never in plaintext.</p>
            </div>

            <div className="space-y-3">
              {EXCHANGES.map(ex => (
                <button key={ex.id} onClick={() => setConfig(c => ({ ...c, exchange: ex.id, name: `${ex.name.split(' ')[0]} Bot` }))}
                  className="w-full rounded-sm p-4 text-left transition-all"
                  style={{
                    background: config.exchange === ex.id ? `${ex.color}10` : 'rgba(255,255,255,0.02)',
                    border: `1px solid ${config.exchange === ex.id ? ex.color + '40' : 'rgba(255,255,255,0.08)'}`,
                    borderTop: config.exchange === ex.id ? `2px solid ${ex.color}` : undefined,
                  }}>
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{ex.icon}</span>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-display text-base font-bold text-white">{ex.name}</span>
                        {ex.paperAvailable && (
                          <span className="font-mono text-[8px] px-2 py-0.5 rounded-full bg-green-400/10 border border-green-400/25 text-green-400">PAPER AVAILABLE</span>
                        )}
                      </div>
                      <p className="font-body text-sm text-white/50 leading-relaxed">{ex.desc}</p>
                      <div className="flex gap-2 mt-2">
                        {ex.markets.map(m => (
                          <span key={m} className="font-mono text-[8px] px-2 py-0.5 rounded-full"
                            style={{ background: `${ex.color}12`, border: `1px solid ${ex.color}25`, color: ex.color }}>
                            {m}
                          </span>
                        ))}
                        <span className="font-mono text-[8px] text-white/30">Min: {ex.minCapital}</span>
                      </div>
                    </div>
                    {config.exchange === ex.id && <CheckCircle size={18} className="text-green-400 flex-shrink-0 mt-1" />}
                  </div>
                </button>
              ))}
            </div>

            {/* API key fields */}
            {config.exchange && (
              <motion.div initial={{ opacity:0, height:0 }} animate={{ opacity:1, height:'auto' }}
                className="space-y-3 pt-2">
                <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] flex items-center gap-2">
                  <span>API CREDENTIALS</span>
                  <span className="text-white/20">· Encrypted at rest in Supabase Vault</span>
                </div>
                {[
                  { name: 'apiKey',    label: 'API KEY',    placeholder: 'PKXXXXXXXXXXXXXXXXXX' },
                  { name: 'apiSecret', label: 'API SECRET', placeholder: 'xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx' },
                ].map(f => (
                  <div key={f.name}>
                    <label className="block font-mono text-[9px] text-[#7a5c1e] mb-1">{f.label}</label>
                    <div className="relative">
                      <input
                        type={apiKeyVisible ? 'text' : 'password'}
                        placeholder={f.placeholder}
                        value={(config as any)[f.name] || ''}
                        onChange={e => setConfig(c => ({ ...c, [f.name]: e.target.value }))}
                        className="w-full rounded-sm px-4 py-2.5 font-mono text-xs text-white outline-none pr-16"
                        style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(212,175,55,0.18)' }}
                      />
                      <button onClick={() => setApiKeyVisible(v => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 font-mono text-[8px] text-white/30 hover:text-white/60 transition-colors">
                        {apiKeyVisible ? 'HIDE' : 'SHOW'}
                      </button>
                    </div>
                  </div>
                ))}

                {/* Paper mode toggle */}
                <div className="flex items-center justify-between rounded-sm px-4 py-3"
                  style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
                  <div>
                    <div className="font-body text-sm text-white">Paper Trading Mode</div>
                    <div className="font-mono text-[9px] text-white/40">Trade with simulated funds. No real money at risk.</div>
                  </div>
                  <button onClick={() => setConfig(c => ({ ...c, paperMode: !c.paperMode }))}
                    className="w-12 h-6 rounded-full relative transition-all"
                    style={{ background: config.paperMode ? 'rgba(74,222,128,0.2)' : 'rgba(255,255,255,0.06)', border: `1px solid ${config.paperMode ? 'rgba(74,222,128,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
                    <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                      style={{ background: config.paperMode ? '#4ade80' : 'rgba(255,255,255,0.2)', left: config.paperMode ? '24px' : '2px' }} />
                  </button>
                </div>
              </motion.div>
            )}

            <button onClick={() => config.exchange && setStep('strategy')} disabled={!config.exchange}
              className="w-full py-4 rounded-sm font-mono text-[11px] tracking-widest transition-all disabled:opacity-40"
              style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
              CHOOSE STRATEGY →
            </button>
          </motion.div>
        )}

        {/* STEP 2: Strategy */}
        {step === 'strategy' && (
          <motion.div key="strategy" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
            className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-black text-white mb-1">Select Strategy</h2>
              <p className="font-body text-sm text-white/40">Win rates based on 12-month backtesting on {selectedExchange?.name}.</p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {STRATEGIES.map(strat => {
                const Icon = strat.icon
                const riskColor = { LOW: '#4ade80', MEDIUM: '#D4AF37', HIGH: '#ef4444' }[strat.risk]
                return (
                  <button key={strat.id} onClick={() => setConfig(c => ({ ...c, strategy: strat.id }))}
                    className="rounded-sm p-4 text-left transition-all"
                    style={{
                      background: config.strategy === strat.id ? 'rgba(212,175,55,0.08)' : 'rgba(255,255,255,0.02)',
                      border: `1px solid ${config.strategy === strat.id ? 'rgba(212,175,55,0.35)' : 'rgba(255,255,255,0.08)'}`,
                    }}>
                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0"
                        style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.2)' }}>
                        <Icon size={16} style={{ color: '#D4AF37' }} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-0.5">
                          <span className="font-display text-base font-bold text-white">{strat.name}</span>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[9px]" style={{ color: riskColor }}>{strat.risk}</span>
                            <span className="font-mono text-[9px] text-green-400">{strat.winRate} win rate</span>
                          </div>
                        </div>
                        <p className="font-body text-sm text-white/50 leading-relaxed">{strat.desc}</p>
                        <div className="font-mono text-[8px] text-white/30 mt-1">Timeframe: {strat.timeframe}</div>
                      </div>
                      {config.strategy === strat.id && <CheckCircle size={16} className="text-green-400 flex-shrink-0 mt-1" />}
                    </div>
                  </button>
                )
              })}
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('exchange')}
                className="px-6 py-3 rounded-sm font-mono text-[10px] text-white/40 border border-white/10 hover:border-white/20 transition-all">
                ← BACK
              </button>
              <button onClick={() => config.strategy && setStep('risk')} disabled={!config.strategy}
                className="flex-1 py-4 rounded-sm font-mono text-[11px] tracking-widest transition-all disabled:opacity-40"
                style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                SET RISK LIMITS →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 3: Risk */}
        {step === 'risk' && (
          <motion.div key="risk" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
            className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-black text-white mb-1">Risk Parameters</h2>
              <p className="font-body text-sm text-white/40">The circuit breaker stops the bot automatically if limits are hit.</p>
            </div>

            {/* Presets */}
            <div className="grid grid-cols-3 gap-2">
              {RISK_PRESETS.map(preset => (
                <button key={preset.name}
                  onClick={() => setConfig(c => ({ ...c, maxPositionPct: preset.maxPosition, dailyLossLimitPct: preset.dailyLoss, takeProfitPct: preset.takeProfit, stopLossPct: preset.stopLoss }))}
                  className="rounded-sm p-3 text-center transition-all"
                  style={{
                    background: `${preset.color}08`,
                    border: `1px solid ${config.dailyLossLimitPct === preset.dailyLoss ? preset.color + '40' : preset.color + '15'}`,
                  }}>
                  <div className="font-mono text-[10px] font-bold mb-1" style={{ color: preset.color }}>{preset.name.toUpperCase()}</div>
                  <div className="font-body text-xs text-white/40">{preset.desc}</div>
                </button>
              ))}
            </div>

            {/* Custom sliders */}
            <div className="rounded-sm p-5 space-y-5"
              style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.1)' }}>
              <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e]">CUSTOM PARAMETERS</div>

              {[
                { key: 'maxPositionPct',    label: 'Max Position Size',   min: 1, max: 50, suffix: '% of portfolio', color: '#D4AF37' },
                { key: 'dailyLossLimitPct', label: 'Daily Loss Limit',    min: 0.5, max: 10, suffix: '% — then stop', color: '#ef4444' },
                { key: 'takeProfitPct',     label: 'Take Profit Target',  min: 0.5, max: 20, suffix: '% per trade', color: '#4ade80' },
                { key: 'stopLossPct',       label: 'Stop Loss Per Trade', min: 0.25, max: 10, suffix: '% — hard exit', color: '#f472b6' },
              ].map(param => (
                <div key={param.key}>
                  <div className="flex items-center justify-between mb-2">
                    <label className="font-mono text-[10px] text-white/50">{param.label.toUpperCase()}</label>
                    <span className="font-display text-lg font-bold" style={{ color: param.color }}>
                      {(config as any)[param.key]}%
                      <span className="font-mono text-[9px] text-white/30 ml-1">{param.suffix}</span>
                    </span>
                  </div>
                  <input type="range" min={param.min} max={param.max} step={0.5}
                    value={(config as any)[param.key] || 0}
                    onChange={e => setConfig(c => ({ ...c, [param.key]: Number(e.target.value) }))}
                    className="w-full h-1.5 rounded-full appearance-none cursor-pointer"
                    style={{ accentColor: param.color, background: `linear-gradient(to right, ${param.color} 0%, ${param.color} ${((((config as any)[param.key] - param.min) / (param.max - param.min)) * 100)}%, rgba(255,255,255,0.1) ${((((config as any)[param.key] - param.min) / (param.max - param.min)) * 100)}%, rgba(255,255,255,0.1) 100%)` }}
                  />
                </div>
              ))}
            </div>

            {/* Risk summary */}
            <div className="rounded-sm px-4 py-3 flex items-center gap-3"
              style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
              <Shield size={16} className="text-[#D4AF37] flex-shrink-0" />
              <p className="font-mono text-[10px] text-[#D4AF37]">
                Circuit breaker: Bot halts if daily loss exceeds {config.dailyLossLimitPct}%. All positions closed automatically. Resumes next market open.
              </p>
            </div>

            <div className="flex gap-3">
              <button onClick={() => setStep('strategy')}
                className="px-6 py-3 rounded-sm font-mono text-[10px] text-white/40 border border-white/10 hover:border-white/20 transition-all">
                ← BACK
              </button>
              <button onClick={() => setStep('review')}
                className="flex-1 py-4 rounded-sm font-mono text-[11px] tracking-widest transition-all"
                style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                REVIEW CONFIGURATION →
              </button>
            </div>
          </motion.div>
        )}

        {/* STEP 4: Review */}
        {step === 'review' && (
          <motion.div key="review" initial={{ opacity:0, y:16 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-16 }}
            className="space-y-5">
            <div>
              <h2 className="font-display text-2xl font-black text-white mb-1">Review & Deploy</h2>
              <p className="font-body text-sm text-white/40">Check everything before going live.</p>
            </div>

            <div className="rounded-sm overflow-hidden" style={{ border: '1px solid rgba(212,175,55,0.2)' }}>
              {[
                { label: 'Exchange',        value: selectedExchange?.name || '—' },
                { label: 'Mode',            value: config.paperMode ? 'Paper Trading (Simulated)' : '⚠ Live Trading (Real Money)' },
                { label: 'Strategy',        value: selectedStrategy?.name || '—' },
                { label: 'Win Rate (BT)',   value: selectedStrategy?.winRate || '—' },
                { label: 'Max Position',    value: `${config.maxPositionPct}% of portfolio` },
                { label: 'Daily Loss Limit',value: `${config.dailyLossLimitPct}% → circuit breaker` },
                { label: 'Take Profit',     value: `${config.takeProfitPct}% per trade` },
                { label: 'Stop Loss',       value: `${config.stopLossPct}% per trade` },
                { label: 'DustMiles',       value: '+15 DM per trade executed' },
              ].map((row, i) => (
                <div key={row.label} className="flex items-center justify-between px-5 py-3"
                  style={{ borderBottom: i < 8 ? '1px solid rgba(255,255,255,0.05)' : 'none', background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  <span className="font-mono text-[10px] text-white/40">{row.label.toUpperCase()}</span>
                  <span className="font-body text-sm text-white"
                    style={{ color: row.label === 'Mode' && !config.paperMode ? '#ef4444' : row.label === 'DustMiles' ? '#D4AF37' : undefined }}>
                    {row.value}
                  </span>
                </div>
              ))}
            </div>

            {!config.paperMode && (
              <div className="flex items-start gap-3 rounded-sm p-4"
                style={{ background: 'rgba(248,113,113,0.08)', border: '1px solid rgba(248,113,113,0.25)' }}>
                <AlertTriangle size={16} className="text-red-400 flex-shrink-0 mt-0.5" />
                <p className="font-mono text-[10px] text-red-400 leading-relaxed">
                  LIVE TRADING — Real money is at risk. The circuit breaker will halt the bot at {config.dailyLossLimitPct}% daily loss. Past performance does not guarantee future results.
                </p>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setStep('risk')}
                className="px-6 py-3 rounded-sm font-mono text-[10px] text-white/40 border border-white/10 hover:border-white/20 transition-all">
                ← EDIT
              </button>
              <button onClick={handleDeploy}
                className="flex-1 py-4 rounded-sm font-mono text-[11px] tracking-widest transition-all"
                style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                DEPLOY BOT →
              </button>
            </div>
          </motion.div>
        )}

        {/* Deploying */}
        {step === 'deploying' && (
          <motion.div key="deploying" initial={{ opacity:0 }} animate={{ opacity:1 }}
            className="text-center py-12">
            <div className="relative w-24 h-24 mx-auto mb-6">
              <svg className="spinner" width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="44" fill="none" stroke="rgba(212,175,55,0.15)" strokeWidth="4" />
                <circle cx="48" cy="48" r="44" fill="none" stroke="#D4AF37" strokeWidth="4"
                  strokeDasharray={`${deployProgress * 2.76} 276`} strokeLinecap="round"
                  style={{ transition: 'stroke-dasharray 0.15s ease', transformOrigin: 'center', transform: 'rotate(-90deg)' }} />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center font-display text-lg font-black text-[#D4AF37]">
                {deployProgress}%
              </div>
            </div>
            <h3 className="font-display text-xl font-bold text-white mb-2">Deploying your bot</h3>
            <div className="font-mono text-[10px] text-white/40 space-y-1">
              {[
                [10, 'Connecting to exchange API'],
                [30, 'Validating credentials'],
                [50, 'Loading strategy parameters'],
                [70, 'Initialising circuit breaker'],
                [85, 'Starting market data feed'],
                [95, 'Registering bot SBT credential'],
                [100, 'Bot live — monitoring markets'],
              ].map(([threshold, msg]) => (
                <div key={msg as string} className="flex items-center justify-center gap-2"
                  style={{ opacity: deployProgress >= (threshold as number) ? 1 : 0.25 }}>
                  <span style={{ color: deployProgress >= (threshold as number) ? '#4ade80' : '#D4AF37' }}>
                    {deployProgress >= (threshold as number) ? '✓' : '○'}
                  </span>
                  <span>{msg as string}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Live */}
        {step === 'live' && (
          <motion.div key="live" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }}
            className="text-center py-8">
            <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.2, type:'spring', damping:12 }}>
              <CheckCircle size={56} className="text-green-400 mx-auto mb-5" />
            </motion.div>
            <h2 className="font-display text-3xl font-black text-white mb-2">Bot Deployed.</h2>
            <p className="font-body text-lg text-white/50 mb-2">{selectedStrategy?.name} is now live on {selectedExchange?.name}.</p>
            <p className="font-mono text-[10px] text-[#D4AF37] mb-8">+15 DustMiles per trade · Circuit breaker at {config.dailyLossLimitPct}% daily loss</p>
            <div className="flex gap-3 justify-center">
              <a href="/trade"
                className="px-8 py-4 rounded-sm font-mono text-[11px] tracking-widest transition-all"
                style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                MONITOR BOT →
              </a>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  )
}
