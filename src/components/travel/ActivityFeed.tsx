'use client'
import { useState } from 'react'

type ActivityType = 'experience' | 'hotel' | 'restaurant' | 'transport'

interface ActivityItem {
  id: string
  type: ActivityType
  title: string
  location: string
  flag: string
  rating: number
  reviews: number
  dustMiles: number
  price: number
  currency: string
  date: string
  gradient: string
  tags: string[]
  trending?: boolean
  canadianPick?: boolean
}

const ACTIVITIES: ActivityItem[] = [
  { id:'a1', type:'experience', title:'Northern Lights Tour', location:'Yellowknife, NT 🍁', flag:'🇨🇦', rating:4.9, reviews:847, dustMiles:2400, price:299, currency:'CAD', date:'Any clear night Nov–Mar', gradient:'linear-gradient(135deg,#050515,#0d1a5c,#1a0d40)', tags:['Aurora','Winter','Canadian Icon'], canadianPick:true, trending:true },
  { id:'a2', type:'experience', title:'Banff Gondola + Hot Springs', location:'Banff, AB 🍁', flag:'🇨🇦', rating:4.8, reviews:2341, dustMiles:1800, price:189, currency:'CAD', date:'Year-round', gradient:'linear-gradient(135deg,#0a1a0a,#1a3a1a,#0d2d2d)', tags:['Mountains','Spa','🍁 Classic'], canadianPick:true },
  { id:'a3', type:'hotel', title:'Fairmont Château Lake Louise', location:'Lake Louise, AB 🍁', flag:'🇨🇦', rating:4.9, reviews:4521, dustMiles:5200, price:450, currency:'CAD', date:'Check availability', gradient:'linear-gradient(135deg,#050d1a,#0d2040,#051a30)', tags:['Luxury','Iconic 🍁','UNESCO'], canadianPick:true, trending:true },
  { id:'a4', type:'experience', title:'Niagara Falls Helicopter', location:'Niagara Falls, ON 🍁', flag:'🇨🇦', rating:4.8, reviews:3102, dustMiles:3100, price:249, currency:'CAD', date:'Daily departures', gradient:'linear-gradient(135deg,#050a1a,#0a1a40,#050d30)', tags:['Helicopter','Wonder','Must-Do 🍁'], canadianPick:true },
  { id:'a5', type:'restaurant', title:'Canoe Restaurant & Bar', location:'Toronto, ON 🍁', flag:'🇨🇦', rating:4.7, reviews:1203, dustMiles:850, price:120, currency:'CAD', date:'Dinner service', gradient:'linear-gradient(135deg,#1a0505,#3a0d00,#2d0a00)', tags:['Fine Dining','Canadian 🍁','Skyline View'], canadianPick:true },
  { id:'a6', type:'experience', title:'TeamLab Borderless Tokyo', location:'Tokyo', flag:'🇯🇵', rating:4.9, reviews:15420, dustMiles:4800, price:38, currency:'USD', date:'Daily', gradient:'linear-gradient(135deg,#100010,#280035,#100025)', tags:['Digital Art','Immersive','World-Class'], trending:true },
  { id:'a7', type:'hotel', title:'Park Hyatt Tokyo', location:'Tokyo Shinjuku', flag:'🇯🇵', rating:4.8, reviews:6700, dustMiles:8900, price:680, currency:'USD', date:'Check availability', gradient:'linear-gradient(135deg,#05050f,#0f0f28,#080818)', tags:['Luxury','Iconic','Skyline'] },
  { id:'a8', type:'transport', title:'Rocky Mountaineer Rail', location:'Vancouver → Banff 🍁', flag:'🇨🇦', rating:4.9, reviews:5821, dustMiles:3800, price:599, currency:'CAD', date:'May–October', gradient:'linear-gradient(135deg,#0a1505,#1a2d0a,#0d2008)', tags:['Train','Scenic','🍁 Bucket List'], canadianPick:true, trending:true },
]

const TYPE_ICONS: Record<ActivityType, string> = { experience:'⭐', hotel:'🏨', restaurant:'🍽', transport:'🚄' }

interface ActivityFeedProps {
  destination?: { city?: string; country?: string; region?: string } | null
}

export default function ActivityFeed({ destination }: ActivityFeedProps) {
  const [filter, setFilter] = useState<'all' | 'canada' | ActivityType>('all')
  const [hovered, setHovered] = useState<string|null>(null)

  const tabs = [
    { id:'all', label:'All Activities' },
    { id:'canada', label:'🍁 Canada First' },
    { id:'experience', label:'Experiences' },
    { id:'hotel', label:'Hotels' },
    { id:'restaurant', label:'Dining' },
    { id:'transport', label:'Transport' },
  ] as const

  const items = ACTIVITIES.filter(a =>
    filter === 'all' ? true :
    filter === 'canada' ? !!a.canadianPick :
    a.type === filter
  ).filter((a) => {
    if (!destination?.city) return true
    return a.location.toLowerCase().includes(destination.city.toLowerCase())
  })

  return (
    <div>
      {/* Filter bar */}
      <div style={{ display:'flex', gap:8, flexWrap:'wrap', marginBottom:20 }}>
        {tabs.map(t => (
          <button key={t.id} onClick={() => setFilter(t.id as typeof filter)}
            style={{ padding:'5px 13px', borderRadius:100, fontSize:11, cursor:'pointer',
              fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.07em', border:'1px solid',
              background: filter===t.id ? 'rgba(212,175,55,0.12)' : 'transparent',
              borderColor: filter===t.id ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.1)',
              color: filter===t.id ? '#D4AF37' : 'rgba(255,255,255,0.45)',
            }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(270px,1fr))', gap:14 }}>
        {items.map(item => (
          <div key={item.id}
            onMouseEnter={() => setHovered(item.id)}
            onMouseLeave={() => setHovered(null)}
            style={{ borderRadius:12, overflow:'hidden', border:`1px solid ${hovered===item.id?'rgba(212,175,55,0.4)':'rgba(255,255,255,0.07)'}`,
              background:'rgba(8,8,8,0.9)', cursor:'pointer', transition:'all .25s',
              transform: hovered===item.id ? 'translateY(-4px)' : 'none',
            }}>

            {/* Visual */}
            <div style={{ height:130, background:item.gradient, position:'relative', display:'flex', alignItems:'flex-end', padding:12 }}>
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.65),transparent 60%)' }}/>
              <div style={{ position:'absolute', top:10, left:10, fontFamily:'monospace', fontSize:9, letterSpacing:'0.1em',
                padding:'2px 8px', borderRadius:100, background:'rgba(0,0,0,0.6)', color:'rgba(255,255,255,0.65)',
                border:'1px solid rgba(255,255,255,0.12)', backdropFilter:'blur(4px)' }}>
                {TYPE_ICONS[item.type]} {item.type.toUpperCase()}
              </div>
              <div style={{ position:'absolute', top:10, right:10, display:'flex', flexDirection:'column', gap:3, alignItems:'flex-end' }}>
                {item.trending && <span style={{ fontFamily:'monospace', fontSize:8, padding:'2px 7px', borderRadius:100, background:'rgba(226,75,74,0.85)', color:'#fff', letterSpacing:'0.1em' }}>HOT</span>}
                {item.canadianPick && <span style={{ fontFamily:'monospace', fontSize:8, padding:'2px 7px', borderRadius:100, background:'rgba(212,175,55,0.85)', color:'#000', letterSpacing:'0.1em' }}>🍁 CA PICK</span>}
              </div>
              <div style={{ position:'relative', zIndex:1 }}>
                <div style={{ fontSize:13, fontWeight:600, color:'#fff' }}>{item.flag} {item.location}</div>
                <div style={{ fontFamily:'monospace', fontSize:9, color:'rgba(255,255,255,0.55)', letterSpacing:'0.08em' }}>{item.date}</div>
              </div>
            </div>

            {/* Info */}
            <div style={{ padding:'12px 14px' }}>
              <div style={{ fontSize:13, fontWeight:700, marginBottom:5, lineHeight:1.3 }}>{item.title}</div>
              <div style={{ display:'flex', alignItems:'center', gap:5, marginBottom:9 }}>
                <span style={{ color:'#D4AF37', fontSize:10 }}>{'★'.repeat(Math.floor(item.rating))}</span>
                <span style={{ fontSize:11, color:'#D4AF37', fontWeight:600 }}>{item.rating}</span>
                <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)' }}>({item.reviews.toLocaleString()})</span>
              </div>
              <div style={{ display:'flex', gap:4, flexWrap:'wrap', marginBottom:11 }}>
                {item.tags.map(t => (
                  <span key={t} style={{ fontSize:8, padding:'2px 6px', borderRadius:100, background:'rgba(255,255,255,0.04)', color:'rgba(255,255,255,0.4)', border:'1px solid rgba(255,255,255,0.07)', fontFamily:'monospace' }}>{t}</span>
                ))}
              </div>
              <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                <div>
                  <span style={{ fontSize:15, fontWeight:700 }}>{item.currency} ${item.price}</span>
                  <span style={{ fontSize:9, color:'rgba(255,255,255,0.3)', marginLeft:3 }}>from</span>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontFamily:'monospace', fontSize:11, color:'#D4AF37', fontWeight:600 }}>+{item.dustMiles.toLocaleString()} ⬡</div>
                  <div style={{ fontFamily:'monospace', fontSize:7, color:'rgba(212,175,55,0.45)', letterSpacing:'0.1em' }}>DUSTMILES</div>
                </div>
              </div>
            </div>

            <div style={{ padding:'0 14px 12px' }}>
              <button style={{ width:'100%', padding:'7px', borderRadius:6, fontSize:10,
                fontFamily:'monospace', letterSpacing:'0.08em', cursor:'pointer', fontWeight:600,
                background: hovered===item.id ? '#D4AF37' : 'transparent',
                color: hovered===item.id ? '#000' : '#D4AF37',
                border:'1px solid rgba(212,175,55,0.38)', transition:'all .2s' }}>
                {hovered===item.id ? `BOOK · EARN ${item.dustMiles.toLocaleString()} ⬡` : 'VIEW DETAILS'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginTop:20, padding:'10px 14px', borderRadius:8,
        background:'rgba(212,175,55,0.03)', border:'1px solid rgba(212,175,55,0.1)',
        display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8 }}>
        <span style={{ fontFamily:'monospace', fontSize:9, color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em' }}>🍁 CURATED BY DUSTIFY · EDMONTON, ALBERTA, CANADA</span>
        <span style={{ fontFamily:'monospace', fontSize:9, color:'#D4AF37', letterSpacing:'0.08em' }}>2.5% FEE · EARN DUSTMILES EVERY BOOKING</span>
      </div>
    </div>
  )
}
