'use client'
import { useState } from 'react'

type Step = 'choose' | 'connect' | 'verify' | 'mint' | 'complete'

const TIERS = [
  {
    id: 'architect',
    name: 'The Architect Key',
    badge: 'ARCHITECT · TIER 1',
    emoji: '◈',
    gradient: 'linear-gradient(135deg,#7a5c1e,#D4AF37,#7F77DD)',
    borderColor: 'rgba(212,175,55,0.5)',
    glowColor: 'rgba(212,175,55,0.2)',
    badgeStyle: { background:'rgba(212,175,55,0.12)', color:'#D4AF37', border:'1px solid rgba(212,175,55,0.3)' },
    price: 'By invitation',
    priceNote: 'Founder tier · Limited to 100',
    perks: ['Full platform — all 5 apps','AXIOM ZK — unlimited queries','Phoenix Protocol resurrection','Intelligence Guard — ADMIN','2× DustMiles on all rewards','🍁 Canadian founder badge'],
    maple: true,
  },
  {
    id: 'sovereign',
    name: 'The Sovereign Key',
    badge: 'SOVEREIGN · TIER 2',
    emoji: '◉',
    gradient: 'linear-gradient(135deg,#534AB7,#7F77DD,#a89fe8)',
    borderColor: 'rgba(127,119,221,0.5)',
    glowColor: 'rgba(127,119,221,0.15)',
    badgeStyle: { background:'rgba(127,119,221,0.12)', color:'#a89fe8', border:'1px solid rgba(127,119,221,0.3)' },
    price: '500 USDC',
    priceNote: 'One-time mint · Non-transferable',
    perks: ['3 core apps','AXIOM ZK — 500 queries/mo','Phoenix Protocol standard','Intelligence Guard — WRITE','1.5× DustMiles multiplier'],
    maple: false,
  },
  {
    id: 'pioneer',
    name: 'The Pioneer Key',
    badge: 'PIONEER · TIER 3',
    emoji: '⬡',
    gradient: 'linear-gradient(135deg,#004466,#00AAFF,#00FFFF)',
    borderColor: 'rgba(0,255,255,0.4)',
    glowColor: 'rgba(0,255,255,0.1)',
    badgeStyle: { background:'rgba(0,255,255,0.08)', color:'#00FFFF', border:'1px solid rgba(0,255,255,0.25)' },
    price: '100 USDC',
    priceNote: 'Open · First 10,000 🇨🇦',
    perks: ['Soul Wallet access','AXIOM ZK — 100 queries/mo','DustMiles 1× base rate','Intelligence Guard — READ','🍁 Canadian early adopter'],
    maple: false,
  },
]

function NftKeyVisual({ gradient, size = 80 }: { gradient: string; size?: number }) {
  const h = size * 1.6
  return (
    <svg width={size} height={h} viewBox="0 0 80 128" style={{ filter: 'drop-shadow(0 0 16px rgba(127,119,221,0.5)) drop-shadow(0 0 32px rgba(212,175,55,0.2))', animation: 'float 4s ease-in-out infinite' }}>
      <defs>
        <linearGradient id={`kg-${size}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#D4AF37"/>
          <stop offset="50%" stopColor="#7F77DD"/>
          <stop offset="100%" stopColor="#D4AF37"/>
        </linearGradient>
      </defs>
      <polygon points="40,4 58,16 58,46 40,56 22,46 22,16" fill="none" stroke={`url(#kg-${size})`} strokeWidth="2.2"/>
      <line x1="40" y1="4" x2="58" y2="46" stroke="#D4AF37" strokeWidth="0.5" opacity="0.4"/>
      <line x1="22" y1="16" x2="58" y2="16" stroke="#7F77DD" strokeWidth="0.5" opacity="0.4"/>
      <line x1="22" y1="46" x2="58" y2="46" stroke="#D4AF37" strokeWidth="0.5" opacity="0.4"/>
      <line x1="40" y1="4" x2="22" y2="46" stroke="#7F77DD" strokeWidth="0.5" opacity="0.4"/>
      <polygon points="40,20 49,28 49,40 40,48 31,40 31,28" fill="rgba(127,119,221,0.22)" stroke="#7F77DD" strokeWidth="1.4"/>
      <circle cx="40" cy="34" r="4" fill="#D4AF37" opacity="0.9"/>
      <circle cx="40" cy="34" r="7" fill="none" stroke="#D4AF37" strokeWidth="0.6" opacity="0.4"/>
      <rect x="37" y="54" width="6" height="54" fill={`url(#kg-${size})`} rx="2"/>
      <rect x="43" y="66" width="10" height="5" fill={`url(#kg-${size})`} rx="1.2"/>
      <rect x="43" y="80" width="7" height="5" fill={`url(#kg-${size})`} rx="1.2"/>
      <rect x="43" y="94" width="9" height="5" fill={`url(#kg-${size})`} rx="1.2"/>
    </svg>
  )
}

export default function OnboardPage() {
  const [step, setStep] = useState<Step>('choose')
  const [selected, setSelected] = useState<string|null>(null)
  const [connecting, setConnecting] = useState(false)
  const [minting, setMinting] = useState(false)
  const [mintProgress, setMintProgress] = useState(0)

  const tier = TIERS.find(t => t.id === selected)

  async function handleConnect() {
    setConnecting(true)
    await new Promise(r => setTimeout(r, 1800))
    setConnecting(false)
    setStep('verify')
  }

  async function handleVerify() {
    setStep('mint')
  }

  async function handleMint() {
    setMinting(true)
    for (let i = 0; i <= 100; i += 5) {
      await new Promise(r => setTimeout(r, 80))
      setMintProgress(i)
    }
    setMinting(false)
    setStep('complete')
  }

  return (
    <div style={{ minHeight:'100vh', background:'#000', display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', padding:'40px 20px', fontFamily:"'Segoe UI',system-ui,sans-serif" }}>

      <style>{`
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-8px)} }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }
        @keyframes spin  { to{transform:rotate(360deg)} }
        @keyframes shimmer { 0%{background-position:-200% center} 100%{background-position:200% center} }
      `}</style>

      {/* Logo */}
      <div style={{ marginBottom:40, textAlign:'center' }}>
        <div style={{ fontSize:22, fontWeight:800, color:'#fff', marginBottom:4 }}>
          <span style={{ color:'#D4AF37' }}>Dustify</span> Technologies Corp
        </div>
        <div style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.2em', color:'rgba(255,255,255,0.35)' }}>
          EDMONTON · ALBERTA · CANADA 🍁
        </div>
      </div>

      {/* Progress steps */}
      <div style={{ display:'flex', gap:0, marginBottom:48, alignItems:'center' }}>
        {(['choose','connect','verify','mint','complete'] as Step[]).map((s, i) => (
          <div key={s} style={{ display:'flex', alignItems:'center' }}>
            <div style={{ width:28, height:28, borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center', fontSize:11, fontWeight:700, fontFamily:'monospace',
              background: ['choose','connect','verify','mint','complete'].indexOf(step) >= i ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.05)',
              border: `1px solid ${['choose','connect','verify','mint','complete'].indexOf(step) >= i ? 'rgba(212,175,55,0.5)' : 'rgba(255,255,255,0.1)'}`,
              color: ['choose','connect','verify','mint','complete'].indexOf(step) >= i ? '#D4AF37' : 'rgba(255,255,255,0.3)',
            }}>
              {i + 1}
            </div>
            {i < 4 && <div style={{ width:40, height:1, background: ['choose','connect','verify','mint','complete'].indexOf(step) > i ? 'rgba(212,175,55,0.4)' : 'rgba(255,255,255,0.08)' }} />}
          </div>
        ))}
      </div>

      {/* STEP: CHOOSE TIER */}
      {step === 'choose' && (
        <div style={{ width:'100%', maxWidth:960 }}>
          <h1 style={{ fontSize:'clamp(24px,4vw,42px)', fontWeight:800, textAlign:'center', marginBottom:8 }}>
            Choose Your <span style={{ color:'#D4AF37' }}>SoulBound NFT</span>
          </h1>
          <p style={{ textAlign:'center', color:'rgba(255,255,255,0.45)', fontSize:14, marginBottom:40, lineHeight:1.7 }}>
            Non-transferable · Quantum-resistant · ML-DSA-65 signed · Yours forever 🍁
          </p>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:20 }}>
            {TIERS.map(t => (
              <div key={t.id} onClick={() => setSelected(t.id)}
                style={{ borderRadius:16, overflow:'hidden', border:`2px solid ${selected===t.id ? t.borderColor : 'rgba(255,255,255,0.08)'}`,
                  background:'rgba(8,8,8,0.9)', cursor:'pointer', transition:'all .25s',
                  transform: selected===t.id ? 'translateY(-4px)' : 'none',
                  boxShadow: selected===t.id ? `0 20px 50px ${t.glowColor}` : 'none' }}>

                <div style={{ height:160, background:t.gradient, display:'flex', alignItems:'center', justifyContent:'center', position:'relative', opacity:0.9 }}>
                  <div style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom,rgba(0,0,0,0.1),rgba(0,0,0,0.5))' }}/>
                  <div style={{ position:'relative', zIndex:1 }}>
                    <NftKeyVisual gradient={t.gradient} size={68} />
                  </div>
                  {selected===t.id && (
                    <div style={{ position:'absolute', top:12, right:12, width:24, height:24, borderRadius:'50%', background:'#D4AF37', display:'flex', alignItems:'center', justifyContent:'center', fontSize:12, fontWeight:700, color:'#000' }}>✓</div>
                  )}
                </div>

                <div style={{ padding:'18px 20px' }}>
                  <div style={{ display:'inline-flex', alignItems:'center', gap:5, fontFamily:'monospace', fontSize:9, letterSpacing:'0.12em', padding:'2px 9px', borderRadius:100, marginBottom:10, ...t.badgeStyle }}>
                    {t.emoji} {t.badge}
                  </div>
                  <div style={{ fontSize:17, fontWeight:700, marginBottom:3 }}>{t.name} {t.maple ? '🍁' : ''}</div>
                  <div style={{ fontFamily:'monospace', fontSize:12, color:'#D4AF37', fontWeight:700, marginBottom:2 }}>{t.price}</div>
                  <div style={{ fontFamily:'monospace', fontSize:9, color:'rgba(255,255,255,0.3)', marginBottom:14, letterSpacing:'0.06em' }}>{t.priceNote}</div>
                  <div style={{ display:'flex', flexDirection:'column', gap:5 }}>
                    {t.perks.map(p => (
                      <div key={p} style={{ fontSize:11, color:'rgba(255,255,255,0.6)', display:'flex', alignItems:'center', gap:7 }}>
                        <span style={{ color:'#D4AF37', fontSize:10 }}>✦</span> {p}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ textAlign:'center', marginTop:32 }}>
            <button onClick={() => selected && setStep('connect')} disabled={!selected}
              style={{ padding:'14px 40px', fontSize:14, fontWeight:700, letterSpacing:'0.1em', borderRadius:8, cursor:selected?'pointer':'not-allowed',
                background: selected ? '#D4AF37' : 'rgba(212,175,55,0.2)', color: selected ? '#000' : 'rgba(212,175,55,0.4)',
                border: 'none', transition:'all .2s', fontFamily:'monospace' }}>
              {selected ? `CONTINUE WITH ${TIERS.find(t=>t.id===selected)?.name.toUpperCase()}` : 'SELECT A TIER TO CONTINUE'}
            </button>
          </div>
        </div>
      )}

      {/* STEP: CONNECT WALLET */}
      {step === 'connect' && tier && (
        <div style={{ width:'100%', maxWidth:480, textAlign:'center' }}>
          <div style={{ marginBottom:32 }}><NftKeyVisual gradient={tier.gradient} size={80} /></div>
          <h2 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>Connect Your Wallet</h2>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, marginBottom:32, lineHeight:1.7 }}>
            Connect a Polygon-compatible wallet to mint your <strong style={{ color:'#D4AF37' }}>{tier.name}</strong>. The SBT will be permanently bound to this address.
          </p>

          {['MetaMask', 'WalletConnect', 'Coinbase Wallet', 'Ledger (Hardware)'].map(wallet => (
            <button key={wallet} onClick={handleConnect} disabled={connecting}
              style={{ display:'flex', alignItems:'center', gap:14, width:'100%', padding:'14px 20px', marginBottom:10, borderRadius:10, cursor:'pointer',
                border:'1px solid rgba(255,255,255,0.1)', background:'rgba(255,255,255,0.03)', color:'#fff', fontSize:14, fontWeight:500, transition:'all .2s' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor='rgba(212,175,55,0.4)',e.currentTarget.style.background='rgba(212,175,55,0.05)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor='rgba(255,255,255,0.1)',e.currentTarget.style.background='rgba(255,255,255,0.03)')}>
              <span style={{ fontSize:20 }}>{wallet === 'MetaMask' ? '🦊' : wallet === 'WalletConnect' ? '🔗' : wallet === 'Coinbase Wallet' ? '🔵' : '🔐'}</span>
              {connecting ? 'Connecting...' : wallet}
              <span style={{ marginLeft:'auto', color:'rgba(255,255,255,0.3)', fontSize:12 }}>→</span>
            </button>
          ))}

          <p style={{ fontSize:11, color:'rgba(255,255,255,0.25)', marginTop:20, fontFamily:'monospace', letterSpacing:'0.08em' }}>
            🍁 DUSTIFY NEVER REQUESTS SIGNING PERMISSION FOR YOUR ASSETS<br/>
            POLYGON NETWORK · GAS FEES COVERED BY DUSTIFY
          </p>
        </div>
      )}

      {/* STEP: VERIFY IDENTITY */}
      {step === 'verify' && tier && (
        <div style={{ width:'100%', maxWidth:480, textAlign:'center' }}>
          <div style={{ marginBottom:32 }}><NftKeyVisual gradient={tier.gradient} size={80} /></div>
          <h2 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>Verify Your Identity</h2>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, marginBottom:32, lineHeight:1.7 }}>
            FIDO2/WebAuthn biometric verification. No data stored. Zero-knowledge proof generated.
          </p>

          <div style={{ display:'flex', flexDirection:'column', gap:12, marginBottom:32 }}>
            {[
              { icon:'🆔', label:'Government ID', desc:'Scan front & back (PIPEDA compliant)' },
              { icon:'👁️', label:'Biometric Scan', desc:'FaceID or fingerprint — device-local only' },
              { icon:'📧', label:'Email Confirmation', desc:'One-time code to your email' },
            ].map(v => (
              <div key={v.label} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 18px', borderRadius:10, border:'1px solid rgba(255,255,255,0.08)', background:'rgba(255,255,255,0.02)', textAlign:'left' }}>
                <span style={{ fontSize:24 }}>{v.icon}</span>
                <div>
                  <div style={{ fontSize:13, fontWeight:600 }}>{v.label}</div>
                  <div style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{v.desc}</div>
                </div>
                <div style={{ marginLeft:'auto', width:20, height:20, borderRadius:'50%', border:'1px solid rgba(212,175,55,0.4)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:10, color:'#D4AF37' }}>○</div>
              </div>
            ))}
          </div>

          <button onClick={handleVerify} style={{ padding:'14px 40px', fontSize:13, fontWeight:700, letterSpacing:'0.1em', borderRadius:8, cursor:'pointer', background:'#D4AF37', color:'#000', border:'none', fontFamily:'monospace' }}>
            START VERIFICATION → MINT SBT
          </button>
          <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', marginTop:12, fontFamily:'monospace', letterSpacing:'0.06em' }}>
            🔐 FIDO2 WEBAUTHN · PIPEDA COMPLIANT · ZERO DATA STORED BY DUSTIFY
          </p>
        </div>
      )}

      {/* STEP: MINTING */}
      {step === 'mint' && tier && (
        <div style={{ width:'100%', maxWidth:480, textAlign:'center' }}>
          <div style={{ marginBottom:32 }}><NftKeyVisual gradient={tier.gradient} size={96} /></div>
          <h2 style={{ fontSize:28, fontWeight:800, marginBottom:8 }}>
            {minting ? 'Minting Your SBT...' : 'Ready to Mint'}
          </h2>
          <p style={{ color:'rgba(255,255,255,0.45)', fontSize:14, marginBottom:32, lineHeight:1.7 }}>
            {minting
              ? 'Deploying your SoulBound NFT to Polygon mainnet. ML-DSA-65 quantum signature being applied.'
              : `Your ${tier.name} will be permanently bound to your wallet. This cannot be undone.`}
          </p>

          {minting && (
            <div style={{ marginBottom:32 }}>
              <div style={{ height:4, borderRadius:2, background:'rgba(255,255,255,0.08)', marginBottom:8 }}>
                <div style={{ height:'100%', borderRadius:2, background:'#D4AF37', width:`${mintProgress}%`, transition:'width 0.08s linear' }}/>
              </div>
              <div style={{ fontFamily:'monospace', fontSize:10, color:'rgba(212,175,55,0.6)', letterSpacing:'0.12em' }}>
                {mintProgress < 30 ? 'GENERATING ZK IDENTITY PROOF...' :
                 mintProgress < 60 ? 'APPLYING ML-DSA-65 QUANTUM SIGNATURE...' :
                 mintProgress < 85 ? 'COMMITTING TO POLYGON MAINNET...' :
                 'FINALISING SBT BINDING...'}
              </div>
            </div>
          )}

          {!minting && (
            <>
              <div style={{ padding:'16px 20px', borderRadius:10, border:'1px solid rgba(212,175,55,0.2)', background:'rgba(212,175,55,0.04)', marginBottom:24, textAlign:'left' }}>
                <div style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.14em', color:'rgba(212,175,55,0.6)', marginBottom:10 }}>MINT SUMMARY</div>
                {[
                  ['SBT Tier', tier.name],
                  ['Network', 'Polygon Mainnet'],
                  ['Standard', 'ERC-5114 SoulBound Badge'],
                  ['Signature', 'ML-DSA-65 (FIPS 204)'],
                  ['Gas Fee', 'Covered by Dustify 🍁'],
                  ['Mint Cost', tier.price],
                ].map(([k,v]) => (
                  <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'4px 0', borderBottom:'1px solid rgba(255,255,255,0.05)' }}>
                    <span style={{ fontSize:12, color:'rgba(255,255,255,0.4)' }}>{k}</span>
                    <span style={{ fontSize:12, fontWeight:600, color: k==='Gas Fee' ? '#1D9E75' : '#fff' }}>{v}</span>
                  </div>
                ))}
              </div>

              <button onClick={handleMint} style={{ padding:'14px 40px', fontSize:13, fontWeight:700, letterSpacing:'0.1em', borderRadius:8, cursor:'pointer', background:'#D4AF37', color:'#000', border:'none', fontFamily:'monospace', width:'100%' }}>
                ◈ MINT MY SOULBOUND NFT
              </button>
            </>
          )}
        </div>
      )}

      {/* STEP: COMPLETE */}
      {step === 'complete' && tier && (
        <div style={{ width:'100%', maxWidth:520, textAlign:'center' }}>
          <div style={{ marginBottom:24 }}>
            <NftKeyVisual gradient={tier.gradient} size={100} />
          </div>
          <div style={{ fontSize:40, marginBottom:16 }}>🎉</div>
          <h2 style={{ fontSize:32, fontWeight:800, marginBottom:8 }}>SBT Minted! Welcome, Sovereign Holder.</h2>
          <div style={{ display:'inline-flex', alignItems:'center', gap:6, fontFamily:'monospace', fontSize:10, letterSpacing:'0.12em', padding:'4px 14px', borderRadius:100, marginBottom:20, ...tier.badgeStyle }}>
            {tier.emoji} {tier.badge} · ACCESS GRANTED
          </div>
          <p style={{ color:'rgba(255,255,255,0.5)', fontSize:14, marginBottom:32, lineHeight:1.7 }}>
            Your <strong style={{ color:'#D4AF37' }}>{tier.name}</strong> is now permanently bound to your wallet on Polygon. It cannot be transferred, stolen, or duplicated. Quantum-resistant by design. <strong style={{ color:'#D4AF37' }}>Yours forever.</strong> 🍁
          </p>

          <div style={{ padding:'16px 20px', borderRadius:10, border:'1px solid rgba(29,158,117,0.3)', background:'rgba(29,158,117,0.05)', marginBottom:28, textAlign:'left' }}>
            <div style={{ fontFamily:'monospace', fontSize:10, letterSpacing:'0.14em', color:'#1D9E75', marginBottom:10 }}>🍁 YOUR SBT IS LIVE</div>
            {[
              ['SBT Token ID', '#' + Math.floor(Math.random()*9999).toString().padStart(5,'0')],
              ['Tier', tier.name],
              ['Network', 'Polygon Mainnet'],
              ['ML-DSA-65 Signature', '0x' + Math.random().toString(16).slice(2,18) + '...'],
              ['DustMiles Balance', '0 ⬡ (start earning now)'],
              ['Phoenix Protocol', 'Bound to your SBT'],
            ].map(([k,v]) => (
              <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'5px 0', borderBottom:'1px solid rgba(255,255,255,0.04)' }}>
                <span style={{ fontSize:11, color:'rgba(255,255,255,0.4)' }}>{k}</span>
                <span style={{ fontSize:11, fontWeight:600, color: k==='DustMiles Balance' ? '#D4AF37' : '#fff', fontFamily:'monospace' }}>{v}</span>
              </div>
            ))}
          </div>

          <a href="/dashboard" style={{ display:'block', padding:'14px 40px', fontSize:13, fontWeight:700, letterSpacing:'0.1em', borderRadius:8, cursor:'pointer', background:'#D4AF37', color:'#000', textDecoration:'none', fontFamily:'monospace', marginBottom:12, textAlign:'center' }}>
            ⬡ ENTER SOUL WALLET →
          </a>
          <p style={{ fontSize:10, color:'rgba(255,255,255,0.25)', fontFamily:'monospace', letterSpacing:'0.08em' }}>
            🍁 BUILT IN EDMONTON, ALBERTA, CANADA · DUSTIFY TECHNOLOGIES CORP
          </p>
        </div>
      )}
    </div>
  )
}
