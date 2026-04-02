'use client'
import { useState } from 'react'

interface Creator {
  id: string
  name: string
  handle: string
  location: string
  flag: string
  avatar: string // gradient
  specialty: string
  followers: string
  dustMilesEarned: number
  verified: boolean
  canadianCreator: boolean
  posts: Array<{ id:string; title:string; location:string; gradient:string; likes:number; dustMilesReward:number }>
}

const CREATORS: Creator[] = [
  {
    id:'c1', name:'Alex Thunder', handle:'@alexthunder_ab', location:'Edmonton, Alberta 🍁', flag:'🇨🇦',
    avatar:'linear-gradient(135deg,#D4AF37,#7a5c1e)', specialty:'Canadian Wilderness & Northern Lights',
    followers:'124K', dustMilesEarned:284000, verified:true, canadianCreator:true,
    posts:[
      { id:'p1', title:'48hrs in Jasper National Park 🍁', location:'Jasper, AB', gradient:'linear-gradient(135deg,#0a1a0a,#152d15)', likes:8420, dustMilesReward:1200 },
      { id:'p2', title:'Aurora Borealis: The Complete Guide', location:'Yellowknife, NT', gradient:'linear-gradient(135deg,#050515,#0d1a5c)', likes:14200, dustMilesReward:1800 },
      { id:'p3', title:'Edmonton to Banff Road Trip', location:'Alberta, Canada', gradient:'linear-gradient(135deg,#1a0d00,#3d2000)', likes:6100, dustMilesReward:900 },
    ]
  },
  {
    id:'c2', name:'Priya Nakamura', handle:'@priya.explores', location:'Toronto, Ontario 🍁', flag:'🇨🇦',
    avatar:'linear-gradient(135deg,#7F77DD,#534AB7)', specialty:'Urban Luxury & Food Tourism',
    followers:'89K', dustMilesEarned:198000, verified:true, canadianCreator:true,
    posts:[
      { id:'p4', title:'Best Ramen in Toronto — Ranked', location:'Toronto, ON', gradient:'linear-gradient(135deg,#1a0505,#3a0d00)', likes:11300, dustMilesReward:1400 },
      { id:'p5', title:'A Weekend in Niagara Wine Country', location:'Niagara-on-the-Lake, ON', gradient:'linear-gradient(135deg,#0a0a1a,#1a1040)', likes:7800, dustMilesReward:1000 },
      { id:'p6', title:'CN Tower to Distillery: 1-Day Itinerary', location:'Toronto, ON', gradient:'linear-gradient(135deg,#050a1a,#0a1a40)', likes:9200, dustMilesReward:1100 },
    ]
  },
  {
    id:'c3', name:'Marcus Wilde', handle:'@marcuswilde', location:'Vancouver, BC 🍁', flag:'🇨🇦',
    avatar:'linear-gradient(135deg,#00FFFF,#0066FF)', specialty:'West Coast Adventures & Surfing',
    followers:'215K', dustMilesEarned:512000, verified:true, canadianCreator:true,
    posts:[
      { id:'p7', title:'Tofino Surfing: Beginner\'s Guide', location:'Tofino, BC', gradient:'linear-gradient(135deg,#050d1a,#0a2040)', likes:18400, dustMilesReward:2200 },
      { id:'p8', title:'Vancouver Island in 7 Days', location:'Vancouver Island, BC', gradient:'linear-gradient(135deg,#050f0a,#0a2515)', likes:12600, dustMilesReward:1600 },
      { id:'p9', title:'Whistler Off-Season: Hidden Gems', location:'Whistler, BC', gradient:'linear-gradient(135deg,#0a0a1a,#151530)', likes:9800, dustMilesReward:1200 },
    ]
  },
  {
    id:'c4', name:'Yuki Sato', handle:'@yuki.wanderlust', location:'Tokyo → World', flag:'🇯🇵',
    avatar:'linear-gradient(135deg,#FF6EC7,#9B1A7A)', specialty:'Japan Culture & Asia Travel',
    followers:'342K', dustMilesEarned:890000, verified:true, canadianCreator:false,
    posts:[
      { id:'p10', title:'Hidden Kyoto: Off the Tourist Trail', location:'Kyoto', gradient:'linear-gradient(135deg,#100010,#280035)', likes:24100, dustMilesReward:3000 },
      { id:'p11', title:'Tokyo 72-Hour Food Crawl', location:'Tokyo', gradient:'linear-gradient(135deg,#0f0005,#250010)', likes:31200, dustMilesReward:3800 },
    ]
  },
]

interface InfluencerFeedProps {
  destination?: { city?: string; country?: string; region?: string } | null
}

export default function InfluencerFeed({ destination }: InfluencerFeedProps) {
  const [selectedCreator, setSelectedCreator] = useState<string|null>(null)
  const [filter, setFilter] = useState<'all'|'canada'>('canada')

  const displayed = CREATORS
    .filter(c => filter === 'all' || c.canadianCreator)
    .filter((c) => {
      if (!destination?.city) return true
      return c.location.toLowerCase().includes(destination.city.toLowerCase())
    })
  const active = selectedCreator ? CREATORS.find(c => c.id === selectedCreator) : null

  return (
    <div>
      {/* Filter */}
      <div style={{ display:'flex', gap:8, marginBottom:20, alignItems:'center' }}>
        <span style={{ fontFamily:'monospace', fontSize:10, color:'rgba(255,255,255,0.4)', letterSpacing:'0.12em' }}>CREATORS:</span>
        {([{id:'canada',label:'🍁 Canadian First'},{id:'all',label:'All Creators'}] as const).map(f => (
          <button key={f.id} onClick={() => setFilter(f.id)}
            style={{ padding:'5px 13px', borderRadius:100, fontSize:11, cursor:'pointer',
              fontFamily:"'JetBrains Mono',monospace", letterSpacing:'0.07em', border:'1px solid',
              background: filter===f.id ? 'rgba(212,175,55,0.12)' : 'transparent',
              borderColor: filter===f.id ? 'rgba(212,175,55,0.45)' : 'rgba(255,255,255,0.1)',
              color: filter===f.id ? '#D4AF37' : 'rgba(255,255,255,0.45)',
            }}>
            {f.label}
          </button>
        ))}
      </div>

      {/* Creator cards row */}
      <div style={{ display:'flex', gap:12, overflowX:'auto', paddingBottom:8, marginBottom:20 }}>
        {displayed.map(creator => (
          <div key={creator.id} onClick={() => setSelectedCreator(creator.id === selectedCreator ? null : creator.id)}
            style={{ flexShrink:0, width:180, borderRadius:12, overflow:'hidden',
              border:`1px solid ${selectedCreator===creator.id ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.08)'}`,
              background:'rgba(8,8,8,0.9)', cursor:'pointer', transition:'all .2s',
              transform: selectedCreator===creator.id ? 'translateY(-3px)' : 'none' }}>
            {/* Avatar */}
            <div style={{ height:90, background:creator.avatar, position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <div style={{ width:48, height:48, borderRadius:'50%', background:'rgba(0,0,0,0.5)', border:'2px solid rgba(212,175,55,0.5)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:20 }}>
                {creator.flag}
              </div>
              {creator.verified && (
                <div style={{ position:'absolute', bottom:8, right:8, width:18, height:18, borderRadius:'50%', background:'#D4AF37', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10 }}>✓</div>
              )}
              {creator.canadianCreator && (
                <div style={{ position:'absolute', top:6, left:6, fontFamily:'monospace', fontSize:7, padding:'1px 5px', borderRadius:100, background:'rgba(212,175,55,0.85)', color:'#000', letterSpacing:'0.1em' }}>🍁 CA</div>
              )}
            </div>
            <div style={{ padding:'10px 12px' }}>
              <div style={{ fontSize:12, fontWeight:700, marginBottom:2 }}>{creator.name}</div>
              <div style={{ fontFamily:'monospace', fontSize:9, color:'rgba(212,175,55,0.7)', marginBottom:4 }}>{creator.handle}</div>
              <div style={{ fontSize:9, color:'rgba(255,255,255,0.4)', marginBottom:8, lineHeight:1.4 }}>{creator.specialty}</div>
              <div style={{ display:'flex', justifyContent:'space-between' }}>
                <div>
                  <div style={{ fontSize:12, fontWeight:700, color:'#fff' }}>{creator.followers}</div>
                  <div style={{ fontFamily:'monospace', fontSize:7, color:'rgba(255,255,255,0.3)', letterSpacing:'0.08em' }}>FOLLOWERS</div>
                </div>
                <div style={{ textAlign:'right' }}>
                  <div style={{ fontSize:11, fontWeight:700, color:'#D4AF37' }}>{(creator.dustMilesEarned/1000).toFixed(0)}K ⬡</div>
                  <div style={{ fontFamily:'monospace', fontSize:7, color:'rgba(212,175,55,0.4)', letterSpacing:'0.08em' }}>EARNED</div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Selected creator posts OR all recent posts */}
      <div>
        <div style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.14em', color:'rgba(255,255,255,0.4)', marginBottom:14 }}>
          {active ? `${active.name.toUpperCase()}'S RECENT POSTS` : 'RECENT POSTS FROM ALL CREATORS'}
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(240px,1fr))', gap:12 }}>
          {(active ? active.posts : CREATORS.flatMap(c => c.posts.slice(0,1))).map(post => {
            const creator = CREATORS.find(c => c.posts.some(p => p.id === post.id))!
            return (
              <div key={post.id} style={{ borderRadius:10, overflow:'hidden', border:'1px solid rgba(255,255,255,0.07)', background:'rgba(8,8,8,0.9)', cursor:'pointer', transition:'all .2s' }}>
                <div style={{ height:100, background:post.gradient, position:'relative' }}>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top,rgba(0,0,0,0.6),transparent 60%)' }}/>
                  <div style={{ position:'absolute', bottom:8, left:10, fontSize:12, fontWeight:600, color:'#fff', zIndex:1, padding:'8px 10px' }}>
                    <div style={{ fontSize:11, fontWeight:600, lineHeight:1.3 }}>{post.title}</div>
                    <div style={{ fontFamily:'monospace', fontSize:8, color:'rgba(255,255,255,0.55)', marginTop:2 }}>📍 {post.location}</div>
                  </div>
                </div>
                <div style={{ padding:'10px 12px', display:'flex', alignItems:'center', justifyContent:'space-between' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                    <div style={{ width:24, height:24, borderRadius:'50%', background:creator.avatar }} />
                    <div>
                      <div style={{ fontSize:10, fontWeight:600 }}>{creator.name}</div>
                      <div style={{ fontFamily:'monospace', fontSize:8, color:'rgba(255,255,255,0.35)' }}>{creator.handle}</div>
                    </div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <div style={{ fontFamily:'monospace', fontSize:10, color:'#D4AF37', fontWeight:600 }}>+{post.dustMilesReward} ⬡</div>
                    <div style={{ fontSize:9, color:'rgba(255,255,255,0.35)' }}>♥ {post.likes.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ marginTop:18, padding:'10px 14px', borderRadius:8, background:'rgba(212,175,55,0.03)', border:'1px solid rgba(212,175,55,0.1)', fontFamily:'monospace', fontSize:9, color:'rgba(255,255,255,0.3)', letterSpacing:'0.1em', textAlign:'center' }}>
        🍁 CANADIAN CREATORS EARN 2× DUSTMILES ON EVERY BOOKING THEY INSPIRE · DUSTIFY CREATOR PROGRAM
      </div>
    </div>
  )
}
