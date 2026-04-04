'use client'

export default function OfflinePage() {
  return (
    <div style={{
      minHeight: '100vh', background: '#000', display: 'flex',
      alignItems: 'center', justifyContent: 'center', padding: 24,
    }}>
      <div style={{
        textAlign: 'center', padding: 48,
        border: '1px solid rgba(212,175,55,0.3)', borderRadius: 4, maxWidth: 360,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>◆</div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, color: '#D4AF37', marginBottom: 8 }}>
          Soul Wallet
        </h1>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, color: 'rgba(255,255,255,0.4)', marginBottom: 24 }}>
          No internet connection detected.
        </p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: 'rgba(255,255,255,0.25)', lineHeight: 1.7 }}>
          Your wallet is safe. Your SBT and balances are stored on Polygon and cannot be lost. Reconnect to continue.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            marginTop: 24, padding: '12px 32px',
            background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.3)',
            color: '#D4AF37', fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11, letterSpacing: '0.15em', cursor: 'pointer', borderRadius: 4,
          }}
        >
          RETRY CONNECTION
        </button>
      </div>
    </div>
  )
}
