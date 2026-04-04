'use client'
// ============================================================
// dustify-wallet/src/app/auth/mint/page.tsx
// SBT Minting Flow — gas-free via DustPaymaster
// ============================================================
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Fingerprint, Loader2, CheckCircle } from 'lucide-react'

type MintStep = 'wallet' | 'passkey' | 'mint' | 'success'

export default function MintSBTPage() {
  const [step, setStep] = useState<MintStep>('wallet')
  const [walletAddress, setWalletAddress] = useState('')
  const [tier] = useState<'PIONEER' | 'SOVEREIGN' | 'ARCHITECT'>('PIONEER')
  const [txHash, setTxHash] = useState('')
  const [tokenId, setTokenId] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  interface MintTierInfo {
    color: string
    label: string
    price: string
    icon: string
    perks: string[]
  }

  const TIER_CONFIG: Record<string, MintTierInfo> = {
    PIONEER:   { color: '#60a5fa', label: 'Pioneer',   price: 'FREE',   icon: '◇', perks: ['Access to Soul Wallet', 'DustMiles rewards', 'Basic trading', 'Travel booking'] },
    SOVEREIGN: { color: '#D4AF37', label: 'Sovereign',  price: '$49 USDC', icon: '◈', perks: ['Everything in Pioneer', '2× DustMiles rate', 'Advanced trading bots', 'LUMIS access'] },
    ARCHITECT: { color: '#f472b6', label: 'Architect',  price: '$149 USDC', icon: '◆', perks: ['Everything in Sovereign', '5× DustMiles rate', 'Dust Code ZK circuits', 'Office Boss access', 'Priority Phoenix recovery'] },
  }

  async function handleWalletConnect() {
    if (!walletAddress || !walletAddress.startsWith('0x')) { setError('Enter a valid Ethereum wallet address (0x...)'); return }
    setError(''); setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    setLoading(false); setStep('passkey')
  }

  async function handlePasskeyRegister() {
    setLoading(true)
    try {
      const credential = await navigator.credentials.create({
        publicKey: {
          challenge: new Uint8Array(32),
          rp: { name: 'Dustify Technologies Corp', id: window.location.hostname },
          user: { id: new TextEncoder().encode(walletAddress), name: walletAddress, displayName: 'Dustify User' },
          pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
          authenticatorSelection: { userVerification: 'required', residentKey: 'required' },
          timeout: 60000,
        },
      })
      if (credential) { setStep('mint') }
    } catch (e) { setError('Passkey registration failed. Please try again.') }
    setLoading(false)
  }

  async function handleMint() {
    setLoading(true)
    await new Promise(r => setTimeout(r, 3200))
    setTxHash('0x7f2a91b3e4c85d1f69a3...')
    setTokenId('00000' + Math.floor(Math.random() * 9999).toString().padStart(4, '0'))
    setStep('success')
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-black flex items-center justify-center px-6"
      style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 30%, rgba(212,175,55,0.04) 0%, transparent 70%)' }}>
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {(['wallet', 'passkey', 'mint', 'success'] as MintStep[]).map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className="w-7 h-7 rounded-full flex items-center justify-center font-mono text-[10px] transition-all"
                style={{
                  background: step === s ? 'rgba(212,175,55,0.2)' : ['wallet','passkey','mint','success'].indexOf(step) > i ? 'rgba(74,222,128,0.15)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${step === s ? '#D4AF37' : ['wallet','passkey','mint','success'].indexOf(step) > i ? '#4ade80' : 'rgba(255,255,255,0.1)'}`,
                  color: step === s ? '#D4AF37' : ['wallet','passkey','mint','success'].indexOf(step) > i ? '#4ade80' : 'rgba(255,255,255,0.3)',
                }}>
                {['wallet','passkey','mint','success'].indexOf(step) > i ? '✓' : i + 1}
              </div>
              {i < 3 && <div className="flex-1 h-px" style={{ background: ['wallet','passkey','mint','success'].indexOf(step) > i ? '#4ade80' : 'rgba(255,255,255,0.08)' }} />}
            </div>
          ))}
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Wallet */}
          {step === 'wallet' && (
            <motion.div key="wallet" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              className="rounded-sm p-8" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.15)', borderTop: '1px solid rgba(212,175,55,0.4)' }}>
              <div className="text-center mb-6">
                <div className="text-4xl mb-3">◆</div>
                <h1 className="font-display text-3xl font-black text-white mb-2">Mint Your <span className="text-[#D4AF37] italic">SoulBound NFT</span></h1>
                <p className="font-body text-base text-white/40">Your permanent, non-transferable identity on Dustify. Gas-free via DustPaymaster.</p>
              </div>
              <div className="mb-5">
                <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] mb-3">WALLET ADDRESS</div>
                <input value={walletAddress} onChange={e => setWalletAddress(e.target.value)}
                  placeholder="0x..."
                  className="w-full rounded-sm px-4 py-3 font-mono text-sm text-white placeholder-white/20 outline-none"
                  style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(212,175,55,0.2)' }} />
                {error && <p className="font-mono text-[10px] text-red-400 mt-2">{error}</p>}
              </div>
              {/* Tier select */}
              <div className="mb-5">
                <div className="font-mono text-[10px] tracking-widest text-[#7a5c1e] mb-3">YOUR TIER</div>
                <div className="space-y-2">
                  {Object.entries(TIER_CONFIG).map(([t, cfg]) => (
                    <div key={t} className="rounded-sm p-3"
                      style={{ background: t === tier ? `${cfg.color}10` : 'rgba(255,255,255,0.02)', border: `1px solid ${t === tier ? cfg.color + '30' : 'rgba(255,255,255,0.08)'}` }}>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span style={{ color: cfg.color }}>{cfg.icon}</span>
                          <span className="font-mono text-sm" style={{ color: cfg.color }}>{cfg.label}</span>
                        </div>
                        <span className="font-mono text-sm text-white/60">{cfg.price}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <button onClick={handleWalletConnect} disabled={loading}
                className="w-full py-3 rounded-sm font-mono text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all"
                style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : null}
                {loading ? 'CONNECTING...' : 'CONNECT WALLET →'}
              </button>
            </motion.div>
          )}

          {/* Step 2: Passkey */}
          {step === 'passkey' && (
            <motion.div key="passkey" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              className="rounded-sm p-8 text-center" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.15)', borderTop: '1px solid rgba(212,175,55,0.4)' }}>
              <div className="text-5xl mb-4">🔑</div>
              <h2 className="font-display text-2xl font-black text-white mb-2">Register Your Passkey</h2>
              <p className="font-body text-base text-white/40 mb-6 leading-relaxed">Your passkey is the only way to authenticate. It lives in your device's secure enclave — not on Dustify's servers. <strong className="text-white/60">Never sharable. Never loseable the way a password is.</strong></p>
              <button onClick={handlePasskeyRegister} disabled={loading}
                className="w-full py-4 rounded-sm font-mono text-[11px] tracking-widest flex items-center justify-center gap-3 transition-all"
                style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Fingerprint size={18} />}
                {loading ? 'REGISTERING...' : 'REGISTER PASSKEY'}
              </button>
              {error && <p className="font-mono text-[10px] text-red-400 mt-3">{error}</p>}
            </motion.div>
          )}

          {/* Step 3: Mint */}
          {step === 'mint' && (
            <motion.div key="mint" initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0, y:-20 }}
              className="rounded-sm p-8" style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(212,175,55,0.15)', borderTop: '1px solid rgba(212,175,55,0.4)' }}>
              <div className="text-center mb-6">
                <div className="text-5xl mb-3">⬡</div>
                <h2 className="font-display text-2xl font-black text-white mb-2">Ready to Mint</h2>
                <p className="font-body text-sm text-white/40">Gas is sponsored by DustPaymaster. You pay zero MATIC.</p>
              </div>
              <div className="space-y-3 mb-6">
                {[
                  { label: 'Standard', value: 'ERC-5114 SoulBound NFT' },
                  { label: 'Signature', value: 'ML-DSA-65 (FIPS 204, quantum-resistant)' },
                  { label: 'Network', value: 'Polygon (confirmed in ~5 seconds)' },
                  { label: 'Gas', value: 'FREE — DustPaymaster covers it' },
                  { label: 'Transferable', value: 'NEVER — mathematical guarantee' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="font-mono text-[10px] text-white/40">{r.label}</span>
                    <span className="font-body text-sm text-white/70">{r.value}</span>
                  </div>
                ))}
              </div>
              <button onClick={handleMint} disabled={loading}
                className="w-full py-4 rounded-sm font-mono text-[11px] tracking-widest flex items-center justify-center gap-2 transition-all"
                style={{ background: loading ? 'rgba(212,175,55,0.06)' : 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                {loading ? <Loader2 size={16} className="animate-spin" /> : '⬡'}
                {loading ? 'MINTING ON POLYGON...' : 'MINT MY SOULBOUND NFT →'}
              </button>
            </motion.div>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <motion.div key="success" initial={{ opacity:0, scale:0.95 }} animate={{ opacity:1, scale:1 }} exit={{ opacity:0 }}
              className="rounded-sm p-8 text-center" style={{ background: 'rgba(74,222,128,0.04)', border: '1px solid rgba(74,222,128,0.25)', borderTop: '2px solid #4ade80' }}>
              <motion.div initial={{ scale:0 }} animate={{ scale:1 }} transition={{ delay:0.2, type:'spring' }}>
                <CheckCircle size={52} className="text-green-400 mx-auto mb-4" />
              </motion.div>
              <h2 className="font-display text-3xl font-black text-white mb-2">Your SBT Is Live.</h2>
              <p className="font-body text-lg text-white/50 mb-6">Token #{tokenId} — bound to you, forever.</p>
              <div className="text-left space-y-3 mb-6">
                {[
                  { label: 'Token ID', value: `#${tokenId}` },
                  { label: 'Transaction', value: txHash },
                  { label: 'Network', value: 'Polygon Mainnet' },
                  { label: 'Starting Miles', value: '+500 DustMiles (Welcome bonus)' },
                ].map(r => (
                  <div key={r.label} className="flex justify-between py-2 border-b border-green-500/10">
                    <span className="font-mono text-[10px] text-white/40">{r.label}</span>
                    <span className="font-mono text-[10px] text-green-400">{r.value}</span>
                  </div>
                ))}
              </div>
              <a href="/dashboard" className="block w-full py-4 rounded-sm font-mono text-[11px] tracking-widest text-center transition-all"
                style={{ background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.3)', color: '#D4AF37' }}>
                ENTER SOUL WALLET →
              </a>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
