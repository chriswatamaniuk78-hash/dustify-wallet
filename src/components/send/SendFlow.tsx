'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  GoldInput,
  AmountInput,
  StepIndicator,
  QuickAmounts,
  Spinner,
  StatusBadge,
} from '@/components/ui'
import { formatUSDC, formatWalletAddress } from '@/types'
import type { SoulWallet } from '@/types'

// Wallet defaults — replaced by real data from API/context in production
const DEFAULT_USER = { id: 'user_local', name: 'Sovereign Holder', email: 'holder@dustify.local', avatarUrl: null, kycLevel: 'EMAIL_VERIFIED', createdAt: new Date().toISOString() }
const DEFAULT_WALLET: SoulWallet = {
  id: 'sw_local',
  userId: 'user_local',
  walletAddress: '0xD4AF3789AbCdEf012345678901234567890ABCDE',
  sbtTokenId: '847',
  usdcBalance: 0,
  pointsBalance: 0,
  rewardsTier: 'SPARK',
  isQuantumShielded: true,
  tierUpdatedAt: new Date().toISOString(),
  mintedAt: new Date().toISOString(),
}
const DEFAULT_TRANSACTIONS: any[] = []
const DEFAULT_BOT_CONFIG = { isEnabled: false, strategy: 'CONSERVATIVE', maxPositionSize: 1000 }
const DEFAULT_BOT_STATS = { tradesToday: 0, pnlToday: 0, feesGeneratedToday: 0 }
const DEFAULT_POSITIONS: any[] = []


const STEPS = [
  { id: 'recipient', label: 'Recipient' },
  { id: 'amount',    label: 'Amount'    },
  { id: 'confirm',   label: 'Confirm'   },
]

type SendStep = 0 | 1 | 2 | 3  // 3 = success screen

// Known contacts for autocomplete (in production: fetched from API)
const KNOWN_CONTACTS = [
  { name: 'Alexandra Sovereign', address: '0xA3B2C4D1E5F6789012345678901234567890ABAB', sbtId: '00312' },
  { name: 'Marcus DeFi',         address: '0xB5C6D7E8F901234567890123456789012345CDCD', sbtId: '00541' },
  { name: 'Sofia Nakamoto',      address: '0xC8D9E0F1A2B3456789012345678901234567EFEF', sbtId: '00728' },
]

export default function SendFlow() {
  const router = useRouter()
  const [step, setStep] = useState<SendStep>(0)
  const [recipient, setRecipient] = useState('')
  const [recipientName, setRecipientName] = useState('')
  const [amount, setAmount] = useState('')
  const [note, setNote] = useState('')
  const [recipientError, setRecipientError] = useState('')
  const [amountError, setAmountError] = useState('')
  const [sending, setSending] = useState(false)
  const [txHash, setTxHash] = useState('')
  const [contactFilter, setContactFilter] = useState('')

  const availableBalance = DEFAULT_WALLET.usdcBalance
  const fee = 0          // P2P sends are free
  const amountNum = parseFloat(amount) || 0
  const totalDeducted = amountNum + fee

  // ── Validation ───────────────────────────────────────────

  function validateRecipient(): boolean {
    if (!recipient.trim()) {
      setRecipientError('Enter a wallet address or SBT ID')
      return false
    }
    const isAddress = recipient.startsWith('0x') && recipient.length === 42
    const isSbt = /^\d{1,6}$/.test(recipient)
    if (!isAddress && !isSbt) {
      setRecipientError('Enter a valid 0x address or SBT token number')
      return false
    }
    setRecipientError('')
    return true
  }

  function validateAmount(): boolean {
    if (!amount || amountNum <= 0) {
      setAmountError('Enter an amount')
      return false
    }
    if (amountNum > availableBalance) {
      setAmountError(`Exceeds your balance of ${formatUSDC(availableBalance)}`)
      return false
    }
    if (amountNum < 0.01) {
      setAmountError('Minimum send is $0.01')
      return false
    }
    setAmountError('')
    return true
  }

  // ── Step navigation ──────────────────────────────────────

  function handleNext() {
    if (step === 0 && validateRecipient()) setStep(1)
    else if (step === 1 && validateAmount()) setStep(2)
  }

  function handleBack() {
    if (step > 0) setStep((step - 1) as SendStep)
  }

  function selectContact(contact: typeof KNOWN_CONTACTS[0]) {
    setRecipient(contact.address)
    setRecipientName(contact.name)
    setRecipientError('')
  }

  // ── Submit ───────────────────────────────────────────────

  async function handleSend() {
    setSending(true)
    // Simulate blockchain tx — replace with real API call
    await new Promise(resolve => setTimeout(resolve, 2200))
    setTxHash('0xABCDEF1234567890abcdef1234567890ABCDEF1234567890abcdef1234567890AB')
    setSending(false)
    setStep(3)
  }

  // ── Success screen ───────────────────────────────────────

  if (step === 3) {
    return (
      <div className="glass-heavy animate-fade-up" style={{ padding: 40, textAlign: 'center' }}>
        {/* Checkmark */}
        <div
          style={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            background: 'rgba(74,222,128,0.12)',
            border: '2px solid rgba(74,222,128,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px',
            boxShadow: '0 0 30px rgba(74,222,128,0.2)',
          }}
        >
          <svg width="32" height="32" viewBox="0 0 32 32" fill="none">
            <path d="M6 16l8 8 12-14" stroke="var(--success)" strokeWidth="2.5"
              strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <div
          className="font-display"
          style={{ fontSize: 28, fontWeight: 500, marginBottom: 8 }}
        >
          Sent successfully
        </div>
        <div style={{ color: 'var(--text-secondary)', fontSize: 15, marginBottom: 6 }}>
          {formatUSDC(amountNum)} USDC sent to{' '}
          <span style={{ color: 'var(--gold-warm)' }}>
            {recipientName || formatWalletAddress(recipient)}
          </span>
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 11, color: 'var(--text-tertiary)', marginBottom: 32 }}
        >
          +25 pts earned · Quantum-verified
        </div>

        {/* TX hash */}
        <div
          style={{
            padding: '12px 16px',
            background: 'var(--glass-2)',
            border: '1px solid var(--border-gold-0)',
            borderRadius: 12,
            marginBottom: 24,
          }}
        >
          <div className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)', marginBottom: 4 }}>
            TRANSACTION HASH
          </div>
          <div
            className="font-mono"
            style={{
              fontSize: 11,
              color: 'var(--gold-warm)',
              wordBreak: 'break-all',
              lineHeight: 1.6,
            }}
          >
            {txHash}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            className="btn-glass"
            style={{ flex: 1, padding: '13px', fontSize: 14 }}
            onClick={() => {
              setStep(0)
              setRecipient('')
              setRecipientName('')
              setAmount('')
              setNote('')
            }}
          >
            Send again
          </button>
          <button
            className="btn-sovereign"
            style={{ flex: 1, padding: '13px', fontSize: 14 }}
            onClick={() => router.push('/dashboard')}
          >
            Back to wallet
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="glass-heavy animate-fade-up" style={{ padding: 32 }}>
      <StepIndicator steps={STEPS} currentStep={step} />

      {/* ── Step 0: Recipient ─────────────────────────────── */}
      {step === 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <GoldInput
            label="Wallet address or SBT ID"
            value={recipient}
            onChange={v => { setRecipient(v); setRecipientName(''); setRecipientError('') }}
            placeholder="0x... or SBT #00312"
            error={recipientError}
            autoFocus
          />

          {/* Contact search */}
          <div>
            <div
              className="font-mono"
              style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 10 }}
            >
              Recent contacts
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
              }}
            >
              {KNOWN_CONTACTS.map(contact => (
                <button
                  key={contact.sbtId}
                  onClick={() => selectContact(contact)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px',
                    borderRadius: 12,
                    border: recipient === contact.address
                      ? '1px solid var(--border-gold-2)'
                      : '1px solid transparent',
                    background: recipient === contact.address ? 'var(--gold-glass-2)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    textAlign: 'left',
                    width: '100%',
                  }}
                  onMouseEnter={e => {
                    if (recipient !== contact.address) {
                      e.currentTarget.style.background = 'var(--glass-2)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (recipient !== contact.address) {
                      e.currentTarget.style.background = 'transparent'
                    }
                  }}
                >
                  {/* Avatar */}
                  <div
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: 'var(--gold-glass-2)',
                      border: '1px solid var(--border-gold-1)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontFamily: "'Playfair Display', serif",
                      fontSize: 13,
                      fontWeight: 600,
                      color: 'var(--gold)',
                      flexShrink: 0,
                    }}
                  >
                    {contact.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                      {contact.name}
                    </div>
                    <div
                      className="font-mono"
                      style={{ fontSize: 11, color: 'var(--text-tertiary)' }}
                    >
                      {formatWalletAddress(contact.address)} · SBT #{contact.sbtId}
                    </div>
                  </div>
                  {recipient === contact.address && (
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8l4 4 6-7" stroke="var(--gold)" strokeWidth="1.8"
                        strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Step 1: Amount ────────────────────────────────── */}
      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Recipient summary */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              padding: '12px 16px',
              background: 'var(--gold-glass-1)',
              border: '1px solid var(--border-gold-1)',
              borderRadius: 12,
            }}
          >
            <div
              className="font-mono"
              style={{ fontSize: 10, color: 'var(--text-tertiary)', minWidth: 60 }}
            >
              TO
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
                {recipientName || formatWalletAddress(recipient)}
              </div>
              {recipientName && (
                <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                  {formatWalletAddress(recipient)}
                </div>
              )}
            </div>
            <StatusBadge variant="success">SBT Verified</StatusBadge>
          </div>

          {/* Big amount input */}
          <AmountInput
            value={amount}
            onChange={v => { setAmount(v); setAmountError('') }}
            currency="USDC"
            maxAmount={availableBalance}
            error={amountError}
          />

          {/* Quick amounts */}
          <QuickAmounts
            amounts={[10, 50, 100, 500, 1000]}
            onSelect={v => { setAmount(v.toFixed(2)); setAmountError('') }}
          />

          {/* Note */}
          <GoldInput
            label="Note (optional)"
            value={note}
            onChange={setNote}
            placeholder="What's this for?"
            maxLength={120}
            hint={`${note.length}/120`}
          />

          {/* Balance */}
          <div
            className="font-mono"
            style={{
              fontSize: 12,
              color: 'var(--text-tertiary)',
              textAlign: 'center',
            }}
          >
            Available: {formatUSDC(availableBalance)}
          </div>
        </div>
      )}

      {/* ── Step 2: Confirm ───────────────────────────────── */}
      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div
            style={{
              padding: '24px',
              background: 'var(--glass-2)',
              border: '1px solid var(--border-gold-1)',
              borderRadius: 16,
            }}
          >
            {/* Amount */}
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <div
                className="font-mono"
                style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.15em', marginBottom: 8 }}
              >
                YOU ARE SENDING
              </div>
              <div
                className="font-display"
                style={{ fontSize: 44, fontWeight: 600, color: 'var(--gold)', letterSpacing: '-0.02em', lineHeight: 1 }}
              >
                {formatUSDC(amountNum)}
              </div>
              <div className="font-mono" style={{ fontSize: 13, color: 'var(--text-secondary)', marginTop: 4 }}>
                USDC
              </div>
            </div>

            <div className="gold-divider" style={{ marginBottom: 20 }} />

            {/* Row details */}
            {[
              { label: 'To', value: recipientName || formatWalletAddress(recipient) },
              { label: 'Address', value: formatWalletAddress(recipient) },
              { label: 'Network fee', value: 'Free (P2P)' },
              { label: 'Security', value: 'Quantum-signed · ML-DSA' },
              { label: 'Points earned', value: '+25 pts' },
              ...(note ? [{ label: 'Note', value: note }] : []),
            ].map(row => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  padding: '8px 0',
                  borderBottom: '1px solid rgba(255,255,255,0.04)',
                  gap: 16,
                }}
              >
                <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.08em', flexShrink: 0 }}>
                  {row.label.toUpperCase()}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', textAlign: 'right' }}>
                  {row.value}
                </span>
              </div>
            ))}

            {/* Total */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 16,
                padding: '12px 0 0',
              }}
            >
              <span
                className="font-mono"
                style={{ fontSize: 12, color: 'var(--text-secondary)', letterSpacing: '0.08em' }}
              >
                TOTAL DEDUCTED
              </span>
              <span
                className="font-display"
                style={{ fontSize: 20, fontWeight: 600, color: 'var(--gold)' }}
              >
                {formatUSDC(totalDeducted)}
              </span>
            </div>
          </div>

          {/* Quantum security notice */}
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 10,
              padding: '12px 16px',
              background: 'rgba(74,222,128,0.05)',
              border: '1px solid rgba(74,222,128,0.15)',
              borderRadius: 12,
            }}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, marginTop: 1 }}>
              <circle cx="8" cy="8" r="6.5" stroke="var(--success)" strokeWidth="1.2" />
              <path d="M8 5v4M8 11v.5" stroke="var(--success)" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--success)', lineHeight: 1.5 }}>
              This transaction will be signed with your ML-DSA quantum signature and is irreversible once confirmed.
            </div>
          </div>
        </div>
      )}

      {/* ── Navigation buttons ────────────────────────────── */}
      <div style={{ display: 'flex', gap: 10, marginTop: 28 }}>
        {step > 0 && step < 3 && (
          <button
            className="btn-ghost"
            style={{ flex: 1, padding: '14px', fontSize: 14 }}
            onClick={handleBack}
            disabled={sending}
          >
            Back
          </button>
        )}

        {step < 2 && (
          <button
            className="btn-sovereign"
            style={{ flex: 2, padding: '14px', fontSize: 14 }}
            onClick={handleNext}
          >
            Continue
          </button>
        )}

        {step === 2 && (
          <button
            className="btn-sovereign"
            style={{
              flex: 2, padding: '14px', fontSize: 14,
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            }}
            onClick={handleSend}
            disabled={sending}
          >
            {sending ? (
              <>
                <Spinner size={18} color="#000" />
                Signing & sending…
              </>
            ) : (
              'Confirm & send'
            )}
          </button>
        )}
      </div>
    </div>
  )
}
