'use client'
// ============================================================
// dustify-wallet/src/app/notifications/page.tsx
// Full notifications center page
// ============================================================
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bell, CheckCheck, AlertTriangle, TrendingUp, Plane, Shield, Star, Zap } from 'lucide-react'

type NotifType = 'DUSTMILES' | 'ALERT' | 'TRADE' | 'TRAVEL' | 'SECURITY' | 'MILESTONE' | 'SYSTEM'

interface Notif {
  id: string; type: NotifType; title: string; body: string
  time: string; read: boolean; urgent: boolean; actionUrl?: string
}

const ICON_MAP: Record<NotifType, React.ElementType> = {
  DUSTMILES: Zap, ALERT: AlertTriangle, TRADE: TrendingUp,
  TRAVEL: Plane, SECURITY: Shield, MILESTONE: Star, SYSTEM: Bell,
}

const COLOR_MAP: Record<NotifType, string> = {
  DUSTMILES: '#D4AF37', ALERT: '#ef4444', TRADE: '#4ade80',
  TRAVEL: '#7F77DD', SECURITY: '#f472b6', MILESTONE: '#E8C547', SYSTEM: '#60a5fa',
}

const MOCK: Notif[] = [
  { id:'n1', type:'ALERT',     title:'Intelligence Guard — threat blocked',  body:'String Hunter intercepted a Unicode injection attempt on your session. The request was blocked and logged to the STARK audit trail on Polygon.', time:'2 min ago', read:false, urgent:true },
  { id:'n2', type:'TRADE',     title:'Bot executed — AAPL buy filled',       body:'Momentum Alpha bot purchased 5 shares of AAPL at $189.24. Unrealized P&L: +$32.40. Bot running on Alpaca Paper account.', time:'14 min ago', read:false, urgent:false, actionUrl:'/trade' },
  { id:'n3', type:'DUSTMILES', title:'+350 DustMiles earned',                body:'YEG → YVR return flight booked via Dust Travel. Waterfall reward credited to your SBT wallet. Balance: 8,750 DM.', time:'1h ago', read:false, urgent:false, actionUrl:'/miles' },
  { id:'n4', type:'MILESTONE', title:'Milestone: 5,000 lifetime miles',      body:"You've earned 5,000 total DustMiles. You're now eligible for a SOVEREIGN tier upgrade. Unlock 2× earn rates and advanced trading features.", time:'2h ago', read:true, urgent:false },
  { id:'n5', type:'TRAVEL',    title:'Flight reminder — tomorrow 7:15 AM',   body:'YEG → YVR AC 221 departs at 07:15. Check-in opens at 04:15. Gate information available 90 minutes before departure.', time:'4h ago', read:true, urgent:false, actionUrl:'/travel' },
  { id:'n6', type:'SECURITY',  title:'New device passkey registered',        body:'iPhone 17 Pro added as a passkey device. If this was not you, revoke it immediately in Settings → Security.', time:'Yesterday', read:true, urgent:false, actionUrl:'/settings' },
  { id:'n7', type:'TRADE',     title:'Circuit breaker triggered',            body:'Swing Trader bot paused — daily loss limit of 3% reached. Bot will resume automatically at market open tomorrow.', time:'Yesterday', read:true, urgent:false, actionUrl:'/trade' },
  { id:'n8', type:'SYSTEM',    title:'Platform update — v2.4.0',             body:'Intelligence Guard upgraded with enhanced Unicode injection detection. ML-DSA-65 signature scheme updated to FIPS 204 final spec.', time:'2 days ago', read:true, urgent:false },
]

export default function NotificationsPage() {
  const [notifs, setNotifs] = useState(MOCK)
  const [filter, setFilter] = useState<'all' | 'unread' | 'urgent'>('all')

  const unread = notifs.filter(n => !n.read).length
  const urgent = notifs.filter(n => n.urgent && !n.read).length

  const visible = notifs.filter(n => {
    if (filter === 'unread') return !n.read
    if (filter === 'urgent') return n.urgent
    return true
  })

  function markRead(id: string) {
    setNotifs(prev => prev.map(n => n.id === id ? { ...n, read: true } : n))
  }

  function markAllRead() {
    setNotifs(prev => prev.map(n => ({ ...n, read: true })))
  }

  return (
    <div className="min-h-screen px-4 py-8 max-w-lg mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="font-mono text-[10px] tracking-[0.3em] text-[#7a5c1e] mb-1">◆ SOUL WALLET</div>
          <h1 className="font-display text-3xl font-black text-white">Notifications</h1>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead}
            className="flex items-center gap-2 px-3 py-2 rounded-sm font-mono text-[10px] transition-all"
            style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: '#D4AF37' }}>
            <CheckCheck size={14} />
            MARK ALL READ
          </button>
        )}
      </div>

      {/* Summary pills */}
      {urgent > 0 && (
        <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }}
          className="flex items-center gap-3 px-4 py-3 rounded-sm mb-4"
          style={{ background: 'rgba(192,57,43,0.1)', border: '1px solid rgba(192,57,43,0.35)' }}>
          <AlertTriangle size={16} className="text-red-400" />
          <span className="font-mono text-[10px] text-red-400">{urgent} URGENT ALERT{urgent > 1 ? 'S' : ''} REQUIRE YOUR ATTENTION</span>
        </motion.div>
      )}

      {/* Filter tabs */}
      <div className="flex gap-1 mb-5 p-1 rounded-sm" style={{ background: 'rgba(255,255,255,0.02)' }}>
        {[
          { id: 'all',    label: `All (${notifs.length})` },
          { id: 'unread', label: `Unread (${unread})` },
          { id: 'urgent', label: `Urgent (${urgent})` },
        ].map(f => (
          <button key={f.id} onClick={() => setFilter(f.id as 'all' | 'unread' | 'urgent')}
            className="flex-1 py-2 rounded-sm font-mono text-[10px] tracking-widest transition-all"
            style={{
              background: filter === f.id ? 'rgba(212,175,55,0.1)' : 'transparent',
              color: filter === f.id ? '#D4AF37' : 'rgba(255,255,255,0.4)',
              border: filter === f.id ? '1px solid rgba(212,175,55,0.25)' : '1px solid transparent',
            }}>
            {f.label.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Notifications list */}
      <AnimatePresence>
        <div className="space-y-2">
          {visible.length === 0 ? (
            <div className="text-center py-16">
              <Bell size={32} className="mx-auto mb-3 text-white/10" />
              <p className="font-body text-sm text-white/30">No notifications</p>
            </div>
          ) : visible.map(notif => {
            const Icon = ICON_MAP[notif.type]
            const color = COLOR_MAP[notif.type]
            return (
              <motion.div key={notif.id}
                initial={{ opacity:0, x:-10 }} animate={{ opacity:1, x:0 }}
                layout
                onClick={() => markRead(notif.id)}
                className="rounded-sm p-4 cursor-pointer transition-all"
                style={{
                  background: notif.read ? 'rgba(255,255,255,0.02)' : `${color}06`,
                  border: `1px solid ${notif.read ? 'rgba(255,255,255,0.06)' : color + '25'}`,
                }}>
                <div className="flex items-start gap-3">
                  {/* Icon */}
                  <div className="w-9 h-9 rounded-sm flex items-center justify-center flex-shrink-0 mt-0.5"
                    style={{ background: `${color}12`, border: `1px solid ${color}25` }}>
                    <Icon size={16} style={{ color }} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-body text-sm font-semibold text-white leading-snug">{notif.title}</span>
                      {notif.urgent && (
                        <span className="font-mono text-[7px] px-1.5 py-0.5 rounded-full bg-red-500/15 border border-red-500/30 text-red-400 flex-shrink-0">URGENT</span>
                      )}
                      {!notif.read && (
                        <div className="w-1.5 h-1.5 rounded-full ml-auto flex-shrink-0" style={{ background: color }} />
                      )}
                    </div>
                    <p className="font-body text-xs text-white/50 leading-relaxed mb-2">{notif.body}</p>
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[8px] text-white/25">{notif.time}</span>
                      {notif.actionUrl && (
                        <a href={notif.actionUrl}
                          onClick={e => e.stopPropagation()}
                          className="font-mono text-[9px] transition-colors"
                          style={{ color }}>
                          VIEW →
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </AnimatePresence>

      {/* Notification settings link */}
      <div className="mt-8 text-center">
        <a href="/settings" className="font-mono text-[10px] text-[#7a5c1e] hover:text-[#D4AF37] transition-colors">
          Manage notification preferences →
        </a>
      </div>
    </div>
  )
}
