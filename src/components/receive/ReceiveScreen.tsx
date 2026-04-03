'use client'

import { useState, useEffect, useRef } from 'react'
import { CopyButton, StatusBadge } from '@/components/ui'
import { formatWalletAddress } from '@/types'

// Wallet data — loaded from context/API in production. Mock defaults for build.
const DEFAULT_USER = { name: 'Sovereign Holder', email: '' }
const DEFAULT_WALLET = {
  walletAddress: '0xD4AF3789AbCdEf012345678901234567890ABCDE',
  sbtTokenId: '847',
  usdcBalance: 0,
  pointsBalance: 0,
  rewardsTier: 'PIONEER',
  isQuantumShielded: true,
  mintedAt: new Date().toISOString(),
}


// ── QR Code generator (pure canvas, no library) ──────────────
// Renders a stylised placeholder QR pattern in gold/black
// In production: replace canvas draw with a real QR library (qrcode.react)

function GoldQRCode({ value, size = 200 }: { value: string; size?: number }) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const s = size
    const cell = Math.floor(s / 25)
    const cols = Math.floor(s / cell)

    // Background
    ctx.fillStyle = '#080808'
    ctx.fillRect(0, 0, s, s)

    // Generate a deterministic pattern from the value string
    const seed = value.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
    const rand = (i: number) => ((seed * 1103515245 + (i * 12345)) >>> 0) % 2 === 0

    // Draw cells
    for (let row = 0; row < cols; row++) {
      for (let col = 0; col < cols; col++) {
        // Keep finder pattern corners clear
        const inCorner =
          (row < 8 && col < 8) ||
          (row < 8 && col > cols - 9) ||
          (row > cols - 9 && col < 8)

        if (inCorner) continue
        if (rand(row * 100 + col)) {
          const alpha = 0.4 + (rand(row + col * 50) ? 0.6 : 0)
          ctx.fillStyle = `rgba(212,175,55,${alpha.toFixed(1)})`
          ctx.fillRect(col * cell, row * cell, cell - 1, cell - 1)
        }
      }
    }

    // Draw finder patterns (3 corners)
    const drawFinder = (x: number, y: number) => {
      const fs = cell
      ctx.fillStyle = '#D4AF37'
      ctx.fillRect(x, y, 7 * fs, 7 * fs)
      ctx.fillStyle = '#080808'
      ctx.fillRect(x + fs, y + fs, 5 * fs, 5 * fs)
      ctx.fillStyle = '#D4AF37'
      ctx.fillRect(x + 2 * fs, y + 2 * fs, 3 * fs, 3 * fs)
    }

    drawFinder(0, 0)
    drawFinder((cols - 7) * cell, 0)
    drawFinder(0, (cols - 7) * cell)

    // Gold border glow effect
    ctx.strokeStyle = 'rgba(212,175,55,0.3)'
    ctx.lineWidth = 2
    ctx.strokeRect(1, 1, s - 2, s - 2)
  }, [value, size])

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ borderRadius: 12, display: 'block' }}
    />
  )
}

// ── Receive amount request ───────────────────────────────────

function RequestAmount() {
  const [requesting, setRequesting] = useState(false)
  const [amount, setAmount] = useState('')

  if (!requesting) {
    return (
      <button
        className="btn-ghost"
        style={{ width: '100%', padding: '11px', fontSize: 13 }}
        onClick={() => setRequesting(true)}
      >
        Request specific amount
      </button>
    )
  }

  return (
    <div style={{ display: 'flex', gap: 8 }}>
      <div
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          background: 'var(--glass-1)',
          border: '1px solid var(--border-gold-1)',
          borderRadius: 10,
          padding: '0 12px',
        }}
      >
        <span className="font-mono" style={{ fontSize: 14, color: 'var(--text-tertiary)' }}>$</span>
        <input
          type="number"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          placeholder="0.00"
          autoFocus
          style={{
            flex: 1,
            background: 'transparent',
            border: 'none',
            outline: 'none',
            color: 'var(--gold)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 15,
            padding: '10px 0',
          }}
        />
        <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>USDC</span>
      </div>
      <button
        className="btn-sovereign"
        style={{ padding: '0 16px', fontSize: 13 }}
      >
        Set
      </button>
      <button
        className="btn-ghost"
        style={{ padding: '0 12px' }}
        onClick={() => { setRequesting(false); setAmount('') }}
      >
        ×
      </button>
    </div>
  )
}

// ── Network selector ─────────────────────────────────────────

const NETWORKS = [
  { id: 'polygon', label: 'Polygon', tag: 'Recommended', color: '#8247E5' },
  { id: 'ethereum', label: 'Ethereum',  tag: 'Higher fees', color: '#627EEA' },
  { id: 'solana',  label: 'Solana',    tag: 'Fast',        color: '#9945FF' },
]

function NetworkSelector({
  selected,
  onSelect,
}: {
  selected: string
  onSelect: (id: string) => void
}) {
  return (
    <div>
      <div
        className="font-mono"
        style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}
      >
        Network
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {NETWORKS.map(net => (
          <button
            key={net.id}
            onClick={() => onSelect(net.id)}
            style={{
              flex: 1,
              padding: '10px 8px',
              borderRadius: 10,
              border: `1px solid ${selected === net.id ? net.color + '60' : 'var(--border-glass)'}`,
              background: selected === net.id ? `${net.color}12` : 'transparent',
              cursor: 'pointer',
              transition: 'all 0.15s',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 4,
            }}
          >
            <div
              style={{
                width: 8, height: 8, borderRadius: '50%',
                background: net.color,
                boxShadow: selected === net.id ? `0 0 8px ${net.color}` : 'none',
              }}
            />
            <div style={{ fontSize: 12, fontWeight: 500, color: selected === net.id ? 'var(--text-primary)' : 'var(--text-secondary)' }}>
              {net.label}
            </div>
            <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.05em' }}>
              {net.tag}
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Main Receive component ───────────────────────────────────

export default function ReceiveScreen() {
  const [network, setNetwork] = useState('polygon')
  const [tab, setTab] = useState<'address' | 'sbt'>('address')

  const walletAddress = DEFAULT_WALLET.walletAddress
  const sbtId = `SBT#${DEFAULT_WALLET.sbtTokenId?.padStart(5, '0')}`
  const displayValue = tab === 'address' ? walletAddress : sbtId
  const qrValue = tab === 'address'
    ? `usdc:${walletAddress}?network=${network}`
    : `dustify:${sbtId}`

  return (
    <div className="glass-heavy animate-fade-up" style={{ padding: 32 }}>

      {/* Tab switcher */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          padding: 4,
          background: 'var(--glass-2)',
          border: '1px solid var(--border-gold-0)',
          borderRadius: 12,
          marginBottom: 28,
        }}
      >
        {(['address', 'sbt'] as const).map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              flex: 1,
              padding: '9px',
              borderRadius: 9,
              border: 'none',
              background: tab === t ? 'var(--gold-glass-3)' : 'transparent',
              color: tab === t ? 'var(--gold)' : 'var(--text-secondary)',
              fontSize: 13,
              fontWeight: tab === t ? 500 : 400,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            {t === 'address' ? 'Wallet address' : 'SBT identity'}
          </button>
        ))}
      </div>

      {/* QR code */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20, marginBottom: 28 }}>
        <div
          style={{
            padding: 16,
            background: 'var(--void-2)',
            border: '1px solid var(--border-gold-2)',
            borderRadius: 18,
            boxShadow: '0 0 30px rgba(212,175,55,0.12)',
          }}
        >
          <GoldQRCode value={qrValue} size={196} />
        </div>

        <div style={{ textAlign: 'center' }}>
          {tab === 'address' ? (
            <>
              <div
                className="font-mono"
                style={{ fontSize: 13, color: 'var(--gold-warm)', letterSpacing: '0.04em', wordBreak: 'break-all', lineHeight: 1.6 }}
              >
                {walletAddress}
              </div>
              <div
                className="font-mono"
                style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}
              >
                {DEFAULT_USER.name}
              </div>
            </>
          ) : (
            <>
              <div
                className="font-display"
                style={{ fontSize: 32, fontWeight: 600, color: 'var(--gold)', letterSpacing: '-0.02em' }}
              >
                {sbtId}
              </div>
              <div
                className="font-mono"
                style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 4 }}
              >
                Anyone with Dustify can send to your SBT ID
              </div>
            </>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <StatusBadge variant="success" pulse>Quantum active</StatusBadge>
          <StatusBadge variant="gold">ML-DSA signed</StatusBadge>
        </div>
      </div>

      {/* Network selector — only for wallet address */}
      {tab === 'address' && (
        <div style={{ marginBottom: 20 }}>
          <NetworkSelector selected={network} onSelect={setNetwork} />
        </div>
      )}

      <div className="gold-divider" style={{ marginBottom: 20 }} />

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        <CopyButton
          text={displayValue}
          label={tab === 'address' ? 'Copy address' : 'Copy SBT ID'}
        />
        <button
          className="btn-glass"
          style={{ flex: 1, padding: '9px 16px', fontSize: 13 }}
          onClick={() => {
            if (navigator.share) {
              navigator.share({
                title: `Send USDC to ${DEFAULT_USER.name}`,
                text: `My Dustify wallet: ${displayValue}`,
              })
            }
          }}
        >
          Share
        </button>
        <button
          className="btn-glass"
          style={{ padding: '9px 14px', fontSize: 13 }}
        >
          Save QR
        </button>
      </div>

      {/* Request amount */}
      <RequestAmount />

      {/* Warning */}
      {tab === 'address' && (
        <div
          style={{
            marginTop: 16,
            padding: '10px 14px',
            background: 'var(--glass-1)',
            border: '1px solid var(--border-glass)',
            borderRadius: 10,
          }}
        >
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
            Only send USDC on {NETWORKS.find(n => n.id === network)?.label} to this address. Sending the wrong asset or using the wrong network may result in permanent loss.
          </div>
        </div>
      )}
    </div>
  )
}
