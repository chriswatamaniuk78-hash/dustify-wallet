import type { Metadata } from 'next'
import ShellLayout from '@/components/shell/ShellLayout'
import SbtIdentityCard from '@/components/vault/SbtIdentityCard'
import FileVault from '@/components/vault/FileVault'
import CredentialsPanel from '@/components/vault/CredentialsPanel'
import ChainActivityLog from '@/components/vault/ChainActivityLog'

export const metadata: Metadata = { title: 'SBT Vault' }

export default function VaultPage() {
  return (
    <ShellLayout>
      {/* Page header */}
      <div style={{ marginBottom: 28 }}>
        <div
          className="font-mono"
          style={{
            fontSize: 10,
            letterSpacing: '0.2em',
            color: 'var(--gold-warm)',
            textTransform: 'uppercase',
            marginBottom: 4,
          }}
        >
          DustID Security
        </div>
        <h1
          className="font-display"
          style={{ fontSize: 32, fontWeight: 500, letterSpacing: '-0.025em', lineHeight: 1.1 }}
        >
          Your SBT Vault
        </h1>
        <p style={{ fontSize: 14, color: 'var(--text-secondary)', marginTop: 6, maxWidth: 520, lineHeight: 1.6 }}>
          Your quantum-secured SoulBound identity, encrypted files, verifiable credentials, and immutable on-chain history — all in one sovereign vault.
        </p>
      </div>

      {/* Two-column layout: identity card left, rest right */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: 16,
          alignItems: 'start',
        }}
        className="vault-grid"
      >
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <SbtIdentityCard />
          <CredentialsPanel />
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <FileVault />
          <ChainActivityLog />
        </div>
      </div>

      {/* Responsive collapse to single column */}
      <style>{`
        @media (max-width: 860px) {
          .vault-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </ShellLayout>
  )
}
