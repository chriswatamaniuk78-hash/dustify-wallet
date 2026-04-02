'use client'

import { useState } from 'react'
import { StatusBadge, CopyButton } from '@/components/ui'
import { formatWalletAddress } from '@/types'
// Identity data — loaded from wallet context in production
// Pre-connection defaults shown below
const DEFAULT_USER = { name: 'Sovereign Holder', email: '' }
const DEFAULT_WALLET = {
  walletAddress: '0x0000000000000000000000000000000000000000',
  sbtTokenId: '—',
  usdcBalance: 0,
  pointsBalance: 0,
  rewardsTier: 'PIONEER',
  isQuantumShielded: true,
  mintedAt: new Date().toISOString(),
}
import { MOCK_CREDENTIALS, credentialLabel, categoryColor } from '@/lib/vault-data'

// ── Quantum security ring visualiser ─────────────────────────

function QuantumRing() {
  return (
    <div style={{ position: 'relative', width: 96, height: 96 }}>
      {/* Outer glow ring */}
      <div
        style={{
          position: 'absolute',
          inset: -8,
          borderRadius: '50%',
          border: '1px solid rgba(212,175,55,0.15)',
          animation: 'spin 12s linear infinite',
        }}
      />
      {/* Mid ring */}
      <div
        style={{
          position: 'absolute',
          inset: -4,
          borderRadius: '50%',
          border: '1px dashed rgba(212,175,55,0.2)',
          animation: 'spin 8s linear infinite reverse',
        }}
      />
      {/* Gold gradient ring */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          borderRadius: '50%',
          padding: 3,
          background: 'linear-gradient(135deg, #C9A84C, #D4AF37, #E8C547, #C9A84C)',
          boxShadow: '0 0 24px rgba(212,175,55,0.4), 0 0 48px rgba(212,175,55,0.15)',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            borderRadius: '50%',
            background: 'var(--void-2)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: "'Playfair Display', serif",
            fontSize: 28,
            fontWeight: 600,
            color: 'var(--gold)',
          }}
        >
          {DEFAULT_USER.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
        </div>
      </div>
      {/* Orbiting dot */}
      <div
        style={{
          position: 'absolute',
          inset: -10,
          borderRadius: '50%',
          animation: 'spin 4s linear infinite',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            width: 8,
            height: 8,
            borderRadius: '50%',
            background: 'var(--success)',
            boxShadow: '0 0 8px var(--success)',
            transform: 'translateY(-50%)',
          }}
        />
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

// ── ZK Proof badge ────────────────────────────────────────────

function ZKBadge({ label }: { label: string }) {
  const [proving, setProving] = useState(false)
  const [proven, setProven] = useState(false)

  async function handleProve() {
    setProving(true)
    await new Promise(r => setTimeout(r, 1400))
    setProving(false)
    setProven(true)
    setTimeout(() => setProven(false), 3000)
  }

  return (
    <button
      onClick={handleProve}
      disabled={proving}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        padding: '7px 14px',
        borderRadius: 100,
        border: proven
          ? '1px solid rgba(74,222,128,0.4)'
          : '1px solid rgba(127,119,221,0.35)',
        background: proven
          ? 'rgba(74,222,128,0.08)'
          : 'rgba(127,119,221,0.08)',
        color: proven ? 'var(--success)' : '#AFA9EC',
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: 11,
        letterSpacing: '0.06em',
        cursor: proving ? 'wait' : 'pointer',
        transition: 'all 0.2s',
        whiteSpace: 'nowrap' as const,
      }}
    >
      {proving ? (
        <>
          <span style={{ display: 'inline-block', animation: 'spin 0.6s linear infinite', width: 10, height: 10, border: '1.5px solid #AFA9EC', borderTopColor: 'transparent', borderRadius: '50%' }} />
          Generating…
        </>
      ) : proven ? (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2.5 2.5 3.5-4" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Proof ready
        </>
      ) : (
        <>
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <rect x="1.5" y="4" width="7" height="5" rx="1" stroke="currentColor" strokeWidth="1" />
            <path d="M3.5 4V3a1.5 1.5 0 013 0v1" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
          </svg>
          ZK proof — {label}
        </>
      )}
    </button>
  )
}

// ── Main SBT Identity Card ────────────────────────────────────

export default function SbtIdentityCard() {
  const [expanded, setExpanded] = useState(false)

  const activeCredentials = MOCK_CREDENTIALS.filter(c => c.isActive)
  const mintDate = DEFAULT_WALLET.mintedAt
    ? new Date(DEFAULT_WALLET.mintedAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'long', day: 'numeric',
      })
    : '—'

  return (
    <div className="animate-fade-up delay-1">
      {/* The card itself */}
      <div
        className="glass-heavy"
        style={{
          padding: 32,
          marginBottom: 16,
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background texture */}
        <div
          style={{
            position: 'absolute',
            top: -60,
            right: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(212,175,55,0.06) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />

        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
          <QuantumRing />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
            <StatusBadge variant="success" pulse>Quantum active</StatusBadge>
            <StatusBadge variant="gold">ML-DSA signed</StatusBadge>
            <div
              className="font-mono"
              style={{ fontSize: 10, color: 'var(--text-tertiary)' }}
            >
              Polygon · Block #58,249,117
            </div>
          </div>
        </div>

        {/* Name + role */}
        <div style={{ marginBottom: 20 }}>
          <h2
            className="font-display"
            style={{ fontSize: 28, fontWeight: 500, letterSpacing: '-0.02em', marginBottom: 4 }}
          >
            {DEFAULT_USER.name}
          </h2>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              letterSpacing: '0.15em',
              color: 'var(--gold-warm)',
              textTransform: 'uppercase',
            }}
          >
            Surge Tier · Soul Wallet Member
          </div>
        </div>

        {/* SBT token ID — the big number */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 14,
            padding: '14px 18px',
            background: 'var(--gold-glass-1)',
            border: '1px solid var(--border-gold-2)',
            borderRadius: 14,
            marginBottom: 20,
          }}
        >
          <div>
            <div
              className="font-mono"
              style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.15em', marginBottom: 4 }}
            >
              SOULBOUND TOKEN
            </div>
            <div
              className="font-display"
              style={{ fontSize: 32, fontWeight: 600, color: 'var(--gold)', letterSpacing: '-0.01em', lineHeight: 1 }}
            >
              #{DEFAULT_WALLET.sbtTokenId?.padStart(5, '0')}
            </div>
          </div>
          <div style={{ flex: 1, paddingLeft: 14, borderLeft: '1px solid var(--border-gold-1)' }}>
            <div
              className="font-mono"
              style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.12em', marginBottom: 6 }}
            >
              WALLET ADDRESS
            </div>
            <div
              className="font-mono"
              style={{ fontSize: 11, color: 'var(--text-secondary)', wordBreak: 'break-all', lineHeight: 1.5 }}
            >
              {DEFAULT_WALLET.walletAddress}
            </div>
          </div>
        </div>

        {/* Key details grid */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: 10,
            marginBottom: 20,
          }}
        >
          {[
            { label: 'Minted',     value: mintDate },
            { label: 'Encryption', value: 'ML-KEM-768' },
            { label: 'Signature',  value: 'ML-DSA-65' },
          ].map(item => (
            <div
              key={item.label}
              style={{
                padding: '12px',
                background: 'var(--glass-2)',
                border: '1px solid var(--border-void)',
                borderRadius: 10,
              }}
            >
              <div
                className="font-mono"
                style={{ fontSize: 9, color: 'var(--text-tertiary)', letterSpacing: '0.12em', marginBottom: 5 }}
              >
                {item.label.toUpperCase()}
              </div>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
                {item.value}
              </div>
            </div>
          ))}
        </div>

        <div className="gold-divider" style={{ marginBottom: 16 }} />

        {/* ZK Proofs — credentials that can be proven without revealing */}
        <div>
          <div
            className="font-mono"
            style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 12 }}
          >
            Zero-knowledge proofs
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {activeCredentials
              .filter(c => c.zkProofAvailable)
              .map(c => (
                <ZKBadge key={c.id} label={credentialLabel(c.type)} />
              ))}
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 10, lineHeight: 1.6 }}
          >
            Prove your credentials to third parties without revealing any underlying data. Each proof is generated locally and verified on-chain.
          </div>
        </div>

        {/* Expand toggle */}
        <button
          className="btn-ghost"
          style={{ width: '100%', marginTop: 20, padding: '10px', fontSize: 13 }}
          onClick={() => setExpanded(e => !e)}
        >
          {expanded ? 'Hide technical details' : 'Show technical details'}
        </button>

        {expanded && (
          <div
            style={{
              marginTop: 16,
              padding: '16px',
              background: 'var(--void-2)',
              border: '1px solid var(--border-void)',
              borderRadius: 12,
            }}
          >
            {[
              { label: 'DID',          value: `did:polygon:${DEFAULT_WALLET.walletAddress}` },
              { label: 'ML-KEM key',   value: 'pk_kyber768_0x4f2a...8c91 (public)' },
              { label: 'ML-DSA key',   value: 'pk_dilithium65_0x7b3d...2e04 (public)' },
              { label: 'IPFS metadata',value: 'ipfs://QmMetaSBT847...dustify' },
              { label: 'Standard',     value: 'ERC-5114 · W3C DID · VC spec 1.1' },
              { label: 'Key rotation', value: 'Last: Dec 1, 2024 · Next: Mar 1, 2025' },
            ].map(row => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  gap: 16,
                  padding: '7px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.03)',
                  alignItems: 'flex-start',
                }}
              >
                <span
                  className="font-mono"
                  style={{ fontSize: 10, color: 'var(--gold-dim)', minWidth: 100, letterSpacing: '0.06em', flexShrink: 0, paddingTop: 1 }}
                >
                  {row.label}
                </span>
                <span
                  className="font-mono"
                  style={{ fontSize: 10, color: 'var(--text-tertiary)', wordBreak: 'break-all', lineHeight: 1.6 }}
                >
                  {row.value}
                </span>
              </div>
            ))}
            <div style={{ marginTop: 12, display: 'flex', gap: 8 }}>
              <CopyButton text={DEFAULT_WALLET.walletAddress} label="Copy address" />
              <CopyButton text={`did:polygon:${DEFAULT_WALLET.walletAddress}`} label="Copy DID" />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
