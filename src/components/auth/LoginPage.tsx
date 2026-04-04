'use client'
// ============================================================
// dustify-wallet/src/components/auth/LoginPage.tsx
// Passkey authentication — FIDO2/WebAuthn
// ============================================================
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Fingerprint, Loader2, AlertCircle, ChevronRight, Scan } from 'lucide-react'

type AuthState = 'idle' | 'challenge' | 'biometric' | 'verifying' | 'success' | 'error'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/dashboard'

  const [state, setState] = useState<AuthState>('idle')
  const [walletInput, setWalletInput] = useState('')
  const [error, setError] = useState('')
  const [passkeySupported, setPasskeySupported] = useState(true)

  useEffect(() => {
    // Check passkey support
    if (!window.PublicKeyCredential) {
      setPasskeySupported(false)
    }
    // Auto-focus
    document.getElementById('wallet-input')?.focus()
  }, [])

  async function handleAuth() {
    if (!walletInput.trim()) { setError('Enter your wallet address'); return }
    if (!walletInput.startsWith('0x') || walletInput.length < 10) {
      setError('Enter a valid wallet address starting with 0x')
      return
    }

    setError('')
    setState('challenge')

    try {
      // Step 1: Get challenge from server
      const challengeRes = await fetch(`/api/auth/passkey/challenge?wallet=${encodeURIComponent(walletInput)}`)
      if (!challengeRes.ok) {
        const err = await challengeRes.json()
        throw new Error(err.error || 'Wallet not found. Have you minted your SBT?')
      }
      const { challenge, rpId, userId } = await challengeRes.json()

      // Step 2: Trigger biometric prompt
      setState('biometric')
      const credential = await navigator.credentials.get({
        publicKey: {
          challenge: Uint8Array.from(atob(challenge.replace(/-/g, '+').replace(/_/g, '/')), c => c.charCodeAt(0)),
          rpId,
          userVerification: 'required',
          timeout: 60000,
          allowCredentials: [],
        },
      }) as PublicKeyCredential | null

      if (!credential) throw new Error('Authentication cancelled')

      const response = credential.response as AuthenticatorAssertionResponse

      // Step 3: Verify with backend
      setState('verifying')
      const verifyRes = await fetch('/api/auth/passkey/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          credentialId:      credential.id,
          authenticatorData: btoa(String.fromCharCode(...new Uint8Array(response.authenticatorData))),
          clientDataJSON:    btoa(String.fromCharCode(...new Uint8Array(response.clientDataJSON))),
          signature:         btoa(String.fromCharCode(...new Uint8Array(response.signature))),
          userId,
          app: 'wallet',
        }),
      })

      if (!verifyRes.ok) throw new Error('Verification failed. Try again.')

      setState('success')
      setTimeout(() => router.push(from), 600)

    } catch (err: unknown) {
      setState('error')
      const e = err instanceof Error ? err : new Error('Authentication failed')
      if (e.name === 'NotAllowedError') {
        setError('Biometric authentication was cancelled or denied.')
      } else {
        setError(e.message || 'Authentication failed. Please try again.')
      }
      setTimeout(() => setState('idle'), 500)
    }
  }

  const statusText: Record<AuthState, string> = {
    idle:      'AUTHENTICATE WITH PASSKEY',
    challenge: 'CHECKING WALLET...',
    biometric: 'SCAN YOUR BIOMETRIC...',
    verifying: 'VERIFYING IDENTITY...',
    success:   'AUTHENTICATED ✓',
    error:     'TRY AGAIN',
  }

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-6 py-12"
      style={{
        background: 'radial-gradient(ellipse 70% 55% at 50% 35%, rgba(212,175,55,0.055) 0%, transparent 65%)',
      }}
    >
      {/* Logo mark */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="mb-10 text-center"
      >
        <div
          className="w-16 h-16 rounded-sm mx-auto mb-5 flex items-center justify-center float"
          style={{
            background: 'rgba(212,175,55,0.08)',
            border: '1px solid rgba(212,175,55,0.3)',
            boxShadow: '0 0 40px rgba(212,175,55,0.08)',
          }}
        >
          <span className="font-mono text-3xl" style={{ color: 'var(--gold)' }}>◆</span>
        </div>
        <div className="font-mono text-[10px] tracking-[0.45em] mb-2" style={{ color: 'var(--gold-dim)' }}>
          DUSTIFY TECHNOLOGIES
        </div>
        <h1
          className="font-display text-5xl font-black leading-none tracking-tight"
          style={{ color: 'var(--text-primary)' }}
        >
          Soul
          <span className="italic" style={{ color: 'var(--gold)' }}> Wallet</span>
        </h1>
      </motion.div>

      {/* Auth card */}
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="w-full max-w-sm glass-heavy p-8"
      >
        <div className="section-label mb-6">Your SBT Identity</div>

        {/* Wallet input */}
        <div className="mb-5">
          <label
            htmlFor="wallet-input"
            className="block font-mono text-[10px] tracking-[0.25em] mb-2"
            style={{ color: 'var(--gold-dim)' }}
          >
            WALLET ADDRESS
          </label>
          <input
            id="wallet-input"
            type="text"
            value={walletInput}
            onChange={e => { setWalletInput(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && state === 'idle' && handleAuth()}
            placeholder="0x..."
            spellCheck={false}
            autoCapitalize="none"
            autoCorrect="off"
            className="w-full rounded-sm px-4 py-3 font-mono text-sm transition-all outline-none"
            style={{
              background: 'rgba(0,0,0,0.6)',
              border: `1px solid ${error ? 'rgba(248,113,113,0.5)' : 'rgba(212,175,55,0.2)'}`,
              color: 'var(--text-primary)',
            }}
          />

          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 mt-2"
              >
                <AlertCircle size={12} style={{ color: 'var(--danger)', flexShrink: 0 }} />
                <span className="font-mono text-[10px]" style={{ color: 'var(--danger)' }}>{error}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Biometric indicator */}
        <AnimatePresence mode="wait">
          {(state === 'biometric') && (
            <motion.div
              key="biometric"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex flex-col items-center gap-3 py-5 mb-5 rounded-sm"
              style={{ background: 'rgba(212,175,55,0.05)', border: '1px solid rgba(212,175,55,0.15)' }}
            >
              <motion.div
                animate={{ scale: [1, 1.1, 1], opacity: [1, 0.5, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <Fingerprint size={40} style={{ color: 'var(--gold)' }} />
              </motion.div>
              <span className="font-mono text-[10px] tracking-widest" style={{ color: 'var(--gold-dim)' }}>
                TOUCH YOUR FINGERPRINT SENSOR
              </span>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Auth button */}
        <button
          onClick={handleAuth}
          disabled={state !== 'idle' && state !== 'error'}
          className="w-full btn-sovereign relative overflow-hidden"
          style={{ padding: '14px' }}
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={state}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="flex items-center justify-center gap-2"
            >
              {(state === 'challenge' || state === 'verifying') && (
                <Loader2 size={15} className="spinner" />
              )}
              {state === 'biometric' && <Scan size={15} />}
              {state === 'idle' && <Fingerprint size={15} />}
              {state === 'success' && <span>✓</span>}
              <span>{statusText[state]}</span>
            </motion.span>
          </AnimatePresence>
        </button>

        {/* Divider */}
        <div className="gold-rule my-6" />

        {/* Register CTA */}
        <div className="text-center">
          <p className="font-body text-sm mb-3" style={{ color: 'var(--text-tertiary)' }}>
            No SBT yet?
          </p>
          <a
            href="/auth/mint"
            className="inline-flex items-center gap-2 font-mono text-[10px] tracking-[0.2em] transition-colors"
            style={{ color: 'var(--gold-dim)' }}
          >
            MINT YOUR SOULBOUND NFT
            <ChevronRight size={12} />
          </a>
        </div>
      </motion.div>

      {/* PWA install hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="mt-8 font-mono text-[9px] tracking-[0.2em] text-center"
        style={{ color: 'var(--gold-dim)' }}
      >
        DUSTIFY TECHNOLOGIES CORP · EDMONTON, ALBERTA 🍁
      </motion.p>

      {/* Not supported warning */}
      {!passkeySupported && (
        <div
          className="fixed bottom-4 left-4 right-4 p-4 rounded-sm"
          style={{ background: 'rgba(248,113,113,0.1)', border: '1px solid rgba(248,113,113,0.3)' }}
        >
          <p className="font-mono text-[10px]" style={{ color: 'var(--danger)' }}>
            Passkeys not supported in this browser. Use Safari on iOS, Chrome on Android, or a desktop browser.
          </p>
        </div>
      )}
    </div>
  )
}
