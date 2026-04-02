'use client'

import { useState } from 'react'
import { StatusBadge } from '@/components/ui'
import { MOCK_CREDENTIALS, credentialLabel, type Credential, type CredentialType } from '@/lib/vault-data'

const CRED_ICONS: Record<CredentialType, string> = {
  KYC_VERIFIED:         '◎',
  ACCREDITED_INVESTOR:  '◆',
  AGE_18_PLUS:          '◉',
  ORG_MEMBERSHIP:       '⬡',
  PROFESSIONAL_LICENSE: '◈',
  DUST_CERTIFIED:       '◇',
}

const CRED_COLORS: Record<CredentialType, string> = {
  KYC_VERIFIED:         '#1D9E75',
  ACCREDITED_INVESTOR:  '#D4AF37',
  AGE_18_PLUS:          '#60a5fa',
  ORG_MEMBERSHIP:       '#7F77DD',
  PROFESSIONAL_LICENSE: '#EF9F27',
  DUST_CERTIFIED:       '#D4AF37',
}

function CredentialCard({ cred }: { cred: Credential }) {
  const [generating, setGenerating] = useState(false)
  const [proofReady, setProofReady] = useState(false)
  const [sharing, setSharing] = useState(false)

  const color = CRED_COLORS[cred.type]
  const icon = CRED_ICONS[cred.type]

  const issuedDate = new Date(cred.issuedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })
  const expiryDate = cred.expiresAt
    ? new Date(cred.expiresAt).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
      })
    : 'Never'

  const daysUntilExpiry = cred.expiresAt
    ? Math.ceil((new Date(cred.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null

  const isExpiringSoon = daysUntilExpiry !== null && daysUntilExpiry < 60

  async function generateProof() {
    setGenerating(true)
    await new Promise(r => setTimeout(r, 1600))
    setGenerating(false)
    setProofReady(true)
  }

  return (
    <div
      style={{
        padding: '20px',
        background: 'var(--glass-1)',
        border: `1px solid ${color}25`,
        borderRadius: 14,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background accent */}
      <div
        style={{
          position: 'absolute',
          top: -20,
          right: -20,
          width: 80,
          height: 80,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${color}15 0%, transparent 70%)`,
          pointerEvents: 'none',
        }}
      />

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: `${color}15`,
            border: `1px solid ${color}30`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 18,
            color,
            flexShrink: 0,
          }}
        >
          {icon}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
            {cred.label}
          </div>
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
            Issued by {cred.issuedBy}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
          {cred.isActive
            ? <StatusBadge variant="success">Active</StatusBadge>
            : <StatusBadge variant="danger">Expired</StatusBadge>
          }
          {cred.zkProofAvailable && (
            <StatusBadge variant="gold">ZK</StatusBadge>
          )}
        </div>
      </div>

      {/* Details */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 8,
          marginBottom: 16,
        }}
      >
        <div style={{ padding: '10px', background: 'var(--glass-1)', border: '1px solid var(--border-void)', borderRadius: 8 }}>
          <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4 }}>ISSUED</div>
          <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{issuedDate}</div>
        </div>
        <div
          style={{
            padding: '10px',
            background: isExpiringSoon ? 'rgba(251,191,36,0.06)' : 'var(--glass-1)',
            border: isExpiringSoon ? '1px solid rgba(251,191,36,0.2)' : '1px solid var(--border-void)',
            borderRadius: 8,
          }}
        >
          <div className="font-mono" style={{ fontSize: 9, color: 'var(--text-tertiary)', marginBottom: 4 }}>EXPIRES</div>
          <div style={{ fontSize: 12, color: isExpiringSoon ? 'var(--warning)' : 'var(--text-secondary)' }}>
            {expiryDate}
            {isExpiringSoon && daysUntilExpiry !== null && (
              <span className="font-mono" style={{ fontSize: 9, display: 'block', color: 'var(--warning)', marginTop: 2 }}>
                {daysUntilExpiry}d remaining
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ZK proof action */}
      {cred.zkProofAvailable && (
        <div>
          {!proofReady ? (
            <button
              onClick={generateProof}
              disabled={generating}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: 10,
                border: `1px solid ${color}30`,
                background: `${color}08`,
                color,
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                cursor: generating ? 'wait' : 'pointer',
                transition: 'all 0.2s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {generating ? (
                <>
                  <span
                    style={{
                      display: 'inline-block',
                      width: 12,
                      height: 12,
                      border: `1.5px solid ${color}`,
                      borderTopColor: 'transparent',
                      borderRadius: '50%',
                      animation: 'spin 0.6s linear infinite',
                    }}
                  />
                  Generating ZK proof…
                </>
              ) : (
                <>Generate zero-knowledge proof</>
              )}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: 8 }}>
              <div
                style={{
                  flex: 1,
                  padding: '10px',
                  borderRadius: 10,
                  border: '1px solid rgba(74,222,128,0.3)',
                  background: 'rgba(74,222,128,0.06)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <circle cx="7" cy="7" r="5.5" stroke="var(--success)" strokeWidth="1.2" />
                  <path d="M4 7l2.5 2.5 3.5-4" stroke="var(--success)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--success)' }}>
                  Proof ready — valid for 1 hour
                </span>
              </div>
              <button
                onClick={() => setSharing(true)}
                className="btn-glass"
                style={{ padding: '10px 14px', fontSize: 12 }}
              >
                Share
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function CredentialsPanel() {
  const activeCount = MOCK_CREDENTIALS.filter(c => c.isActive).length

  return (
    <div className="animate-fade-up delay-3">
      <div className="glass" style={{ padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>
              Verifiable credentials
            </div>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
              {activeCount} active · W3C VC spec 1.1
            </div>
          </div>
          <StatusBadge variant="gold">ZK-ready</StatusBadge>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {MOCK_CREDENTIALS.map(cred => (
            <CredentialCard key={cred.id} cred={cred} />
          ))}
        </div>

        <div
          style={{
            marginTop: 16,
            padding: '12px 14px',
            background: 'var(--glass-1)',
            border: '1px solid var(--border-void)',
            borderRadius: 10,
          }}
        >
          <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', lineHeight: 1.6 }}>
            Zero-knowledge proofs let you prove a credential is valid without revealing any underlying personal data. The proof is generated locally on your device and verified on-chain.
          </div>
        </div>
      </div>
    </div>
  )
}
