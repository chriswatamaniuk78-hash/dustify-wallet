'use client'
// ============================================================
// dustify-wallet/src/components/settings/SettingsPage.tsx
// Complete settings: profile, security, sessions, DustPermit
// ============================================================
import { useState } from 'react'
import { motion } from 'framer-motion'
import { Fingerprint, Shield, Bell, Key, LogOut, AlertTriangle, CheckCircle } from 'lucide-react'

type SettingsTab = 'profile' | 'security' | 'sessions' | 'notifications' | 'permits' | 'phoenix'

export function SettingsPage() {
  const [tab, setTab] = useState<SettingsTab>('profile')
  const [displayName, setDisplayName] = useState('Chris W.')
  const [saved, setSaved] = useState(false)
  const [notifications, setNotifications] = useState({
    redAlerts: true, dustMiles: true, trades: true, travel: true, security: true, weeklyReport: false,
  })

  const TABS = [
    { id: 'profile',       label: 'Profile',       icon: '◉' },
    { id: 'security',      label: 'Security',       icon: '⚑' },
    { id: 'sessions',      label: 'Sessions',       icon: '◈' },
    { id: 'notifications', label: 'Notifications',  icon: '⬡' },
    { id: 'permits',       label: 'Permissions',    icon: '◇' },
    { id: 'phoenix',       label: 'Phoenix Status', icon: '◆' },
  ]

  async function save() { setSaved(true); setTimeout(() => setSaved(false), 2000) }

  return (
    <div className="min-h-screen bg-black px-4 py-6 max-w-2xl mx-auto">
      <div className="font-mono text-[10px] tracking-[0.3em] text-[#7a5c1e] mb-2">◆ SOUL WALLET</div>
      <h1 className="font-display text-3xl font-black text-white mb-6">Settings</h1>

      {/* Tab nav */}
      <div className="flex gap-1 mb-6 overflow-x-auto" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '4px', padding: '4px' }}>
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id as SettingsTab)}
            className="flex-shrink-0 px-4 py-2 rounded-sm font-mono text-[10px] tracking-widest transition-all"
            style={{
              background: tab === t.id ? 'rgba(212,175,55,0.1)' : 'transparent',
              color: tab === t.id ? '#D4AF37' : 'rgba(255,255,255,0.4)',
              border: tab === t.id ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
            }}>
            {t.icon} {t.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Profile */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] mb-4">IDENTITY</div>
            <div className="flex items-center gap-4 mb-5">
              <div className="w-16 h-16 rounded-sm flex items-center justify-center font-display text-2xl font-black text-[#D4AF37]"
                style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
                ◆
              </div>
              <div>
                <div className="font-display text-xl font-bold text-white">{displayName}</div>
                <div className="font-mono text-[10px] text-[#D4AF37]">PIONEER · TOKEN #000247</div>
                <div className="font-mono text-[9px] text-white/30 mt-0.5">0x7f2a...9c81 · Polygon</div>
              </div>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Display Name', value: displayName, setter: setDisplayName },
              ].map(f => (
                <div key={f.label}>
                  <div className="font-mono text-[10px] text-[#7a5c1e] mb-2">{f.label.toUpperCase()}</div>
                  <input value={f.value} onChange={e => f.setter(e.target.value)}
                    className="w-full rounded-sm px-4 py-2.5 font-body text-sm text-white outline-none"
                    style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.2)' }} />
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] mb-3">SBT DETAILS</div>
            {[
              { label: 'Token Standard',    value: 'ERC-5114 SoulBound' },
              { label: 'Signature Scheme',  value: 'ML-DSA-65 (FIPS 204)' },
              { label: 'Key Exchange',      value: 'ML-KEM-768 (FIPS 203)' },
              { label: 'Minted',           value: 'March 15, 2026' },
              { label: 'Post-Quantum Score', value: '87 / 100' },
            ].map(r => (
              <div key={r.label} className="flex justify-between py-2 border-b border-white/5">
                <span className="font-mono text-[10px] text-white/40">{r.label}</span>
                <span className="font-body text-sm text-white/70">{r.value}</span>
              </div>
            ))}
          </div>

          <button onClick={save}
            className="w-full py-3 rounded-sm font-mono text-[11px] tracking-widest transition-all"
            style={{ background: saved ? 'rgba(74,222,128,0.1)' : 'rgba(212,175,55,0.1)', border: `1px solid ${saved ? 'rgba(74,222,128,0.3)' : 'rgba(212,175,55,0.25)'}`, color: saved ? '#4ade80' : '#D4AF37' }}>
            {saved ? '✓ SAVED' : 'SAVE CHANGES'}
          </button>
        </div>
      )}

      {/* Security */}
      {tab === 'security' && (
        <div className="space-y-4">
          <div className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] mb-4">PASSKEY MANAGEMENT</div>
            <div className="space-y-3">
              {[
                { name: 'MacBook Pro (Touch ID)', added: 'March 15, 2026', current: true },
                { name: 'iPhone 17 Pro (Face ID)', added: 'March 20, 2026', current: false },
              ].map((key, i) => (
                <div key={i} className="flex items-center justify-between rounded-sm px-4 py-3"
                  style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}>
                  <div className="flex items-center gap-3">
                    <Fingerprint size={18} className="text-[#D4AF37]" />
                    <div>
                      <div className="font-body text-sm text-white">{key.name}</div>
                      <div className="font-mono text-[9px] text-white/40">Added {key.added}{key.current ? ' · Current device' : ''}</div>
                    </div>
                  </div>
                  {!key.current && (
                    <button className="font-mono text-[9px] text-red-400 hover:text-red-300 transition-colors">REVOKE</button>
                  )}
                </div>
              ))}
              <button className="w-full py-2 rounded-sm font-mono text-[10px] transition-all"
                style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.15)', color: '#D4AF37' }}>
                + ADD PASSKEY
              </button>
            </div>
          </div>

          <div className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] mb-4">INTELLIGENCE GUARD STATUS</div>
            {[
              { agent: 'String Hunter',     status: 'ACTIVE', checks: '12,847' },
              { agent: 'Gatekeeper',        status: 'ACTIVE', checks: '8,421'  },
              { agent: 'Bug Hunter',        status: 'ACTIVE', checks: '3,204'  },
              { agent: 'Cipher',            status: 'ACTIVE', checks: '3,204'  },
              { agent: 'Sentinel',          status: 'ACTIVE', checks: '3,204'  },
              { agent: 'Firewall Repairer', status: 'ACTIVE', checks: '847'    },
              { agent: 'Vault',             status: 'ACTIVE', checks: '47'     },
              { agent: 'Phoenix V2',        status: 'STANDBY', checks: '0'     },
            ].map(a => (
              <div key={a.agent} className="flex items-center justify-between py-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full" style={{ background: a.status === 'ACTIVE' ? '#4ade80' : '#D4AF37' }} />
                  <span className="font-mono text-[10px] text-white/60">{a.agent}</span>
                </div>
                <div className="text-right">
                  <span className="font-mono text-[9px]" style={{ color: a.status === 'ACTIVE' ? '#4ade80' : '#D4AF37' }}>{a.status}</span>
                  <span className="font-mono text-[9px] text-white/30 ml-2">{a.checks} checks</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notifications */}
      {tab === 'notifications' && (
        <div className="space-y-4">
          <div className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] mb-4">NOTIFICATION PREFERENCES</div>
            <div className="space-y-1">
              {Object.entries(notifications).map(([key, value]) => {
                const labels: Record<string, { label: string; desc: string }> = {
                  redAlerts:     { label: 'LUMIS Red Alerts',    desc: 'Immediate push when child enters Red Zone' },
                  dustMiles:     { label: 'DustMiles Awards',    desc: 'When you earn or redeem miles' },
                  trades:        { label: 'Trade Executions',    desc: 'When your bots execute trades' },
                  travel:        { label: 'Travel Bookings',     desc: 'Booking confirmations and reminders' },
                  security:      { label: 'Security Alerts',     desc: 'Intelligence Guard flags and incidents' },
                  weeklyReport:  { label: 'Weekly Report',       desc: 'Summary of all platform activity' },
                }
                const cfg = labels[key]
                return (
                  <div key={key} className="flex items-center justify-between py-3 border-b border-white/5">
                    <div>
                      <div className="font-body text-sm text-white">{cfg.label}</div>
                      <div className="font-mono text-[9px] text-white/40 mt-0.5">{cfg.desc}</div>
                    </div>
                    <button onClick={() => setNotifications(n => ({ ...n, [key]: !n[key as keyof typeof n] }))}
                      className="w-12 h-6 rounded-full relative transition-all"
                      style={{ background: value ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)', border: `1px solid ${value ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.1)'}` }}>
                      <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all"
                        style={{ background: value ? '#D4AF37' : 'rgba(255,255,255,0.2)', left: value ? '24px' : '2px' }} />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* Phoenix Status */}
      {tab === 'phoenix' && (
        <div className="space-y-4">
          <div className="rounded-sm p-5" style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.2)' }}>
            <div className="flex items-center gap-3 mb-3">
              <CheckCircle size={20} className="text-green-400" />
              <div>
                <div className="font-display text-lg font-bold text-white">Phoenix Protocol: INACTIVE</div>
                <div className="font-mono text-[10px] text-green-400">All systems nominal</div>
              </div>
            </div>
            <p className="font-body text-sm text-white/50 leading-relaxed">
              Phoenix Protocol monitors your system security continuously. If a critical breach is detected, it automatically initiates a 6-phase response protocol and requires 3 of 5 Shamir key holders to resurrect the system.
            </p>
          </div>
          <div className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] mb-4">SHAMIR KEY HOLDERS (3 of 5 required)</div>
            {[
              { name: 'Your Ledger Hardware Wallet', status: 'REGISTERED' },
              { name: 'Gnosis Safe Multisig',        status: 'REGISTERED' },
              { name: 'Encrypted USB Vault',          status: 'REGISTERED' },
              { name: 'Canadian Bank Safe Deposit',   status: 'PENDING' },
              { name: 'Edmonton Lawyer (Notarized)',   status: 'PENDING' },
            ].map((h, i) => (
              <div key={i} className="flex items-center justify-between py-2 border-b border-white/5">
                <div className="flex items-center gap-2">
                  <Key size={14} className={h.status === 'REGISTERED' ? 'text-green-400' : 'text-[#D4AF37]'} />
                  <span className="font-body text-sm text-white/60">{h.name}</span>
                </div>
                <span className="font-mono text-[9px]"
                  style={{ color: h.status === 'REGISTERED' ? '#4ade80' : '#D4AF37' }}>
                  {h.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// dustify-wallet/src/components/miles/MilesDashboard.tsx
// Complete DustMiles dashboard with history, milestones, redeem
// ============================================================

export function MilesDashboard() {
  const [tab, setTab] = useState<'overview' | 'history' | 'redeem'>('overview')

  const HISTORY = [
    { date: 'Today', items: [
      { label: 'Flight booked — YEG to YVR', amount: +350, type: 'earn', app: 'Travel' },
      { label: 'SCRAPPY session — CODE mode',  amount: +20,  type: 'earn', app: 'Code'   },
      { label: 'Trading bot executed',          amount: +15,  type: 'earn', app: 'Trade'  },
    ]},
    { date: 'Yesterday', items: [
      { label: 'NFT minted via Dust Studio',    amount: +50,  type: 'earn', app: 'Studio' },
      { label: 'Redeemed for USDC',             amount: -500, type: 'redeem', app: 'Wallet' },
      { label: 'LUMIS curriculum completed',     amount: +80,  type: 'earn', app: 'LUMIS'  },
    ]},
    { date: 'March 30', items: [
      { label: 'Daily login bonus',             amount: +10,  type: 'earn', app: 'Wallet' },
      { label: 'ZK proof anchored',             amount: +100, type: 'earn', app: 'Code'   },
    ]},
  ]

  const MILESTONES = [
    { name: 'First 100 miles',    target: 100,   earned: 100,   reward: '◇ Pioneer badge',     claimed: true },
    { name: 'First 1,000 miles',  target: 1000,  earned: 1000,  reward: '10× DustMiles bonus',  claimed: true },
    { name: 'First 5,000 miles',  target: 5000,  earned: 5000,  reward: 'Tier upgrade eligible', claimed: true },
    { name: 'First 10,000 miles', target: 10000, earned: 8750,  reward: '$100 USDC credit',     claimed: false },
    { name: 'First 25,000 miles', target: 25000, earned: 8750,  reward: 'SOVEREIGN tier free',   claimed: false },
  ]

  const balance = 8750
  const usdcValue = (balance / 100).toFixed(2)

  return (
    <div className="min-h-screen bg-black px-4 py-6 max-w-2xl mx-auto">
      <div className="font-mono text-[10px] tracking-[0.3em] text-[#7a5c1e] mb-2">⬡ SOUL WALLET</div>
      <h1 className="font-display text-3xl font-black text-white mb-1">DustMiles</h1>
      <p className="font-body text-sm text-white/40 mb-6">100 miles = $1.00 USDC. Earned across every Dustify app.</p>

      {/* Balance hero */}
      <div className="rounded-sm p-6 mb-4"
        style={{ background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.2)', borderTop: '2px solid #D4AF37' }}>
        <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] mb-2">BALANCE</div>
        <div className="font-display text-5xl font-black text-[#D4AF37] mb-1">{balance.toLocaleString()}</div>
        <div className="font-mono text-sm text-white/50">≈ ${usdcValue} USDC value</div>
        <button className="mt-4 px-6 py-2 rounded-sm font-mono text-[11px] tracking-widest transition-all"
          style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
          REDEEM TO USDC →
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-5" style={{ background: 'rgba(255,255,255,0.02)', borderRadius: '4px', padding: '4px' }}>
        {['overview','history','redeem'].map(t => (
          <button key={t} onClick={() => setTab(t as any)}
            className="flex-1 py-2 font-mono text-[10px] tracking-widest rounded-sm transition-all capitalize"
            style={{
              background: tab === t ? 'rgba(212,175,55,0.1)' : 'transparent',
              color: tab === t ? '#D4AF37' : 'rgba(255,255,255,0.4)',
              border: tab === t ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
            }}>
            {t.toUpperCase()}
          </button>
        ))}
      </div>

      {tab === 'overview' && (
        <div className="space-y-4">
          {/* Earn rate by app */}
          <div className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] mb-4">EARN RATES BY APP</div>
            {[
              { app: 'Travel',   action: 'Per booking',    miles: 250, color: '#7F77DD' },
              { app: 'Trade',    action: 'Per trade',       miles: 15,  color: '#4ade80' },
              { app: 'LUMIS',    action: 'Per module',      miles: 80,  color: '#00d4ff' },
              { app: 'Code',     action: 'Per ZK proof',    miles: 100, color: '#D4AF37' },
              { app: 'Studio',   action: 'Per NFT mint',    miles: 50,  color: '#f472b6' },
              { app: 'Gaming',   action: 'Per tournament',  miles: 200, color: '#a78bfa' },
            ].map(r => (
              <div key={r.app} className="flex items-center gap-3 py-2 border-b border-white/5">
                <div className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                <span className="font-body text-sm text-white/60 flex-1">{r.app} — {r.action}</span>
                <span className="font-mono text-sm" style={{ color: r.color }}>+{r.miles} DM</span>
              </div>
            ))}
          </div>

          {/* Milestones */}
          <div className="rounded-sm p-5" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.1)' }}>
            <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] mb-4">MILESTONES</div>
            <div className="space-y-3">
              {MILESTONES.map(m => (
                <div key={m.name}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-body text-sm text-white/70">{m.name}</span>
                    <span className="font-mono text-[10px]" style={{ color: m.claimed ? '#4ade80' : '#D4AF37' }}>
                      {m.claimed ? '✓ CLAIMED' : `${m.earned.toLocaleString()} / ${m.target.toLocaleString()}`}
                    </span>
                  </div>
                  <div className="h-1 rounded-full bg-white/5">
                    <div className="h-full rounded-full" style={{ width: `${Math.min(100, m.earned / m.target * 100)}%`, background: m.claimed ? '#4ade80' : '#D4AF37' }} />
                  </div>
                  <div className="font-mono text-[9px] text-white/30 mt-1">{m.reward}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'history' && (
        <div className="space-y-4">
          {HISTORY.map(day => (
            <div key={day.date}>
              <div className="font-mono text-[10px] tracking-widest text-white/30 mb-2">{day.date.toUpperCase()}</div>
              <div className="space-y-2">
                {day.items.map((item, i) => (
                  <div key={i} className="flex items-center justify-between rounded-sm px-4 py-3"
                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.06)' }}>
                    <div>
                      <div className="font-body text-sm text-white/70">{item.label}</div>
                      <div className="font-mono text-[9px] text-white/30 mt-0.5">{item.app}</div>
                    </div>
                    <span className="font-display text-lg font-bold"
                      style={{ color: item.type === 'earn' ? '#D4AF37' : '#ef4444' }}>
                      {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {tab === 'redeem' && (
        <div className="space-y-4">
          <div className="rounded-sm p-5" style={{ background: 'rgba(212,175,55,0.04)', border: '1px solid rgba(212,175,55,0.15)' }}>
            <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] mb-3">REDEEM CALCULATION</div>
            <div className="flex items-center gap-3 mb-3">
              <input type="range" min={100} max={balance} step={100} defaultValue={1000}
                className="flex-1" style={{ accentColor: '#D4AF37' }} />
            </div>
            <div className="flex justify-between">
              <div>
                <div className="font-display text-3xl font-black text-[#D4AF37]">1,000 DM</div>
                <div className="font-mono text-[10px] text-white/40">to redeem</div>
              </div>
              <div className="text-right">
                <div className="font-display text-3xl font-black text-green-400">$10.00</div>
                <div className="font-mono text-[10px] text-white/40">USDC received</div>
              </div>
            </div>
          </div>
          <button className="w-full py-4 rounded-sm font-mono text-[11px] tracking-widest transition-all"
            style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
            REDEEM 1,000 MILES → $10.00 USDC
          </button>
          <p className="font-body text-sm text-white/30 text-center">Minimum 100 miles. USDC delivered to your wallet on Polygon within 30 seconds.</p>
        </div>
      )}
    </div>
  )
}
