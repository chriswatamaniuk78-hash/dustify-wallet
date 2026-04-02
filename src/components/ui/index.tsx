'use client'

import { useState, useEffect, useRef } from 'react'

// ── GlassCard ────────────────────────────────────────────────

interface GlassCardProps {
  children: React.ReactNode
  heavy?: boolean
  style?: React.CSSProperties
  className?: string
  onClick?: () => void
}

export function GlassCard({ children, heavy, style, className, onClick }: GlassCardProps) {
  return (
    <div
      className={heavy ? 'glass-heavy' : 'glass'}
      style={{ padding: '24px', ...style }}
      onClick={onClick}
    >
      {children}
    </div>
  )
}

// ── GoldInput ────────────────────────────────────────────────

interface GoldInputProps {
  label: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  type?: string
  prefix?: string
  suffix?: string
  hint?: string
  error?: string
  maxLength?: number
  autoFocus?: boolean
  readOnly?: boolean
}

export function GoldInput({
  label,
  value,
  onChange,
  placeholder,
  type = 'text',
  prefix,
  suffix,
  hint,
  error,
  maxLength,
  autoFocus,
  readOnly,
}: GoldInputProps) {
  const [focused, setFocused] = useState(false)

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <label
        className="font-mono"
        style={{
          fontSize: 10,
          letterSpacing: '0.15em',
          textTransform: 'uppercase',
          color: focused ? 'var(--gold-warm)' : 'var(--text-tertiary)',
          transition: 'color 0.2s',
        }}
      >
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        {prefix && (
          <div
            className="font-mono"
            style={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 15,
              color: focused ? 'var(--gold-warm)' : 'var(--text-tertiary)',
              pointerEvents: 'none',
              transition: 'color 0.2s',
            }}
          >
            {prefix}
          </div>
        )}
        <input
          type={type}
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          maxLength={maxLength}
          autoFocus={autoFocus}
          readOnly={readOnly}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={{
            width: '100%',
            background: focused ? 'var(--gold-glass-1)' : 'var(--glass-1)',
            border: `1px solid ${error ? 'var(--danger)' : focused ? 'var(--border-gold-3)' : 'var(--border-gold-1)'}`,
            borderRadius: 12,
            padding: `13px ${suffix ? '44px' : '16px'} 13px ${prefix ? '36px' : '16px'}`,
            color: 'var(--text-primary)',
            fontFamily: "'Geist', system-ui, sans-serif",
            fontSize: 15,
            outline: 'none',
            transition: 'all 0.2s ease',
            boxShadow: focused
              ? '0 0 0 3px rgba(212,175,55,0.08), 0 0 12px rgba(212,175,55,0.12)'
              : 'none',
            cursor: readOnly ? 'default' : 'text',
          }}
        />
        {suffix && (
          <div
            className="font-mono"
            style={{
              position: 'absolute',
              right: 14,
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: 12,
              color: 'var(--text-tertiary)',
              pointerEvents: 'none',
            }}
          >
            {suffix}
          </div>
        )}
      </div>
      {error && (
        <div style={{ fontSize: 12, color: 'var(--danger)' }}>{error}</div>
      )}
      {hint && !error && (
        <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
          {hint}
        </div>
      )}
    </div>
  )
}

// ── AmountInput — large gold number input ────────────────────

interface AmountInputProps {
  value: string
  onChange: (v: string) => void
  currency?: string
  maxAmount?: number
  error?: string
}

export function AmountInput({ value, onChange, currency = 'USDC', maxAmount, error }: AmountInputProps) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9.]/g, '')
    // Only one decimal point
    const parts = raw.split('.')
    if (parts.length > 2) return
    // Max 2 decimal places
    if (parts[1] && parts[1].length > 2) return
    onChange(raw)
  }

  return (
    <div style={{ textAlign: 'center', padding: '20px 0' }}>
      <div
        className="font-mono"
        style={{ fontSize: 11, color: 'var(--text-tertiary)', letterSpacing: '0.15em', marginBottom: 12 }}
      >
        AMOUNT
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
        <span
          className="font-display"
          style={{ fontSize: 42, color: value ? 'var(--gold)' : 'var(--text-tertiary)', lineHeight: 1 }}
        >
          $
        </span>
        <input
          type="text"
          inputMode="decimal"
          value={value}
          onChange={handleChange}
          placeholder="0.00"
          style={{
            background: 'transparent',
            border: 'none',
            outline: 'none',
            fontFamily: "'Playfair Display', serif",
            fontSize: 52,
            fontWeight: 600,
            color: value ? 'var(--gold)' : 'var(--text-tertiary)',
            letterSpacing: '-0.03em',
            width: `${Math.max(3, value.length + 1)}ch`,
            maxWidth: '100%',
            textAlign: 'center',
            lineHeight: 1,
          }}
        />
        <span
          className="font-mono"
          style={{ fontSize: 16, color: 'var(--text-tertiary)', alignSelf: 'flex-end', marginBottom: 8 }}
        >
          {currency}
        </span>
      </div>
      {maxAmount !== undefined && (
        <button
          onClick={() => onChange(maxAmount.toFixed(2))}
          style={{
            marginTop: 10,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--gold-warm)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 11,
            letterSpacing: '0.08em',
          }}
        >
          MAX: ${maxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </button>
      )}
      {error && (
        <div style={{ fontSize: 12, color: 'var(--danger)', marginTop: 8 }}>{error}</div>
      )}
    </div>
  )
}

// ── StatusBadge ──────────────────────────────────────────────

type BadgeVariant = 'success' | 'danger' | 'warning' | 'info' | 'gold' | 'gray'

interface StatusBadgeProps {
  variant: BadgeVariant
  children: React.ReactNode
  pulse?: boolean
}

const BADGE_STYLES: Record<BadgeVariant, { bg: string; color: string; border: string }> = {
  success: { bg: 'rgba(74,222,128,0.10)',  color: 'var(--success)', border: 'rgba(74,222,128,0.25)' },
  danger:  { bg: 'rgba(248,113,113,0.10)', color: 'var(--danger)',  border: 'rgba(248,113,113,0.25)' },
  warning: { bg: 'rgba(251,191,36,0.10)',  color: 'var(--warning)', border: 'rgba(251,191,36,0.25)' },
  info:    { bg: 'rgba(96,165,250,0.10)',  color: 'var(--info)',    border: 'rgba(96,165,250,0.25)' },
  gold:    { bg: 'var(--gold-glass-1)',    color: 'var(--gold-warm)', border: 'var(--border-gold-1)' },
  gray:    { bg: 'var(--glass-2)',         color: 'var(--text-secondary)', border: 'var(--border-glass)' },
}

export function StatusBadge({ variant, children, pulse }: StatusBadgeProps) {
  const s = BADGE_STYLES[variant]
  return (
    <span
      className="font-mono"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        fontSize: 10,
        fontWeight: 500,
        letterSpacing: '0.10em',
        textTransform: 'uppercase',
        padding: '3px 10px',
        borderRadius: 100,
        background: s.bg,
        color: s.color,
        border: `1px solid ${s.border}`,
      }}
    >
      {pulse && (
        <span
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: s.color,
            boxShadow: `0 0 6px ${s.color}`,
            animation: 'pulseGold 1.5s ease-in-out infinite',
            display: 'inline-block',
          }}
        />
      )}
      {children}
    </span>
  )
}

// ── Spinner ──────────────────────────────────────────────────

export function Spinner({ size = 20, color = 'var(--gold)' }: { size?: number; color?: string }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        border: `2px solid rgba(255,255,255,0.08)`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.7s linear infinite',
      }}
    />
  )
}

// ── Progress steps ───────────────────────────────────────────

interface Step { id: string; label: string }

interface StepIndicatorProps {
  steps: Step[]
  currentStep: number
}

export function StepIndicator({ steps, currentStep }: StepIndicatorProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 32 }}>
      {steps.map((step, idx) => {
        const done = idx < currentStep
        const active = idx === currentStep
        return (
          <div key={step.id} style={{ display: 'flex', alignItems: 'center', flex: idx < steps.length - 1 ? 1 : 0 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: done ? 'var(--gold)' : active ? 'var(--gold-glass-3)' : 'var(--glass-2)',
                  border: `1px solid ${done || active ? 'var(--gold)' : 'var(--border-glass)'}`,
                  transition: 'all 0.3s ease',
                  fontSize: 12,
                  fontWeight: 500,
                  color: done ? '#000' : active ? 'var(--gold)' : 'var(--text-tertiary)',
                }}
              >
                {done ? '✓' : idx + 1}
              </div>
              <div
                className="font-mono"
                style={{
                  fontSize: 9,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  color: active ? 'var(--gold-warm)' : 'var(--text-tertiary)',
                  whiteSpace: 'nowrap',
                }}
              >
                {step.label}
              </div>
            </div>
            {idx < steps.length - 1 && (
              <div
                style={{
                  flex: 1,
                  height: 1,
                  margin: '0 8px',
                  marginBottom: 18,
                  background: done
                    ? 'linear-gradient(90deg, var(--gold), var(--gold-warm))'
                    : 'var(--border-glass)',
                  transition: 'background 0.3s ease',
                }}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}

// ── Modal overlay ────────────────────────────────────────────

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  children: React.ReactNode
  maxWidth?: number
}

export function Modal({ isOpen, onClose, title, children, maxWidth = 480 }: ModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) document.addEventListener('keydown', handleKey)
    return () => document.removeEventListener('keydown', handleKey)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={overlayRef}
      onClick={e => { if (e.target === overlayRef.current) onClose() }}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 200,
        padding: 20,
      }}
    >
      <div
        className="glass-heavy animate-fade-up"
        style={{ width: '100%', maxWidth, padding: 32, position: 'relative' }}
      >
        {title && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
            <h2 className="font-display" style={{ fontSize: 22, fontWeight: 500 }}>{title}</h2>
            <button
              onClick={onClose}
              style={{
                width: 32, height: 32,
                borderRadius: '50%',
                background: 'var(--glass-2)',
                border: '1px solid var(--border-glass)',
                color: 'var(--text-secondary)',
                cursor: 'pointer',
                fontSize: 16,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              ×
            </button>
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

// ── Quick amount buttons ─────────────────────────────────────

interface QuickAmountsProps {
  amounts: number[]
  onSelect: (amount: number) => void
  currency?: string
}

export function QuickAmounts({ amounts, onSelect, currency = 'USDC' }: QuickAmountsProps) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {amounts.map(amt => (
        <button
          key={amt}
          onClick={() => onSelect(amt)}
          style={{
            padding: '7px 16px',
            borderRadius: 100,
            background: 'var(--glass-2)',
            border: '1px solid var(--border-gold-1)',
            color: 'var(--gold-warm)',
            fontFamily: "'JetBrains Mono', monospace",
            fontSize: 12,
            cursor: 'pointer',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => {
            const el = e.currentTarget
            el.style.background = 'var(--gold-glass-2)'
            el.style.borderColor = 'var(--border-gold-2)'
          }}
          onMouseLeave={e => {
            const el = e.currentTarget
            el.style.background = 'var(--glass-2)'
            el.style.borderColor = 'var(--border-gold-1)'
          }}
        >
          ${amt} {currency}
        </button>
      ))}
    </div>
  )
}

// ── Copy button ──────────────────────────────────────────────

export function CopyButton({ text, label = 'Copy' }: { text: string; label?: string }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // fallback — select text
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="btn-glass"
      style={{ padding: '8px 16px', fontSize: 12, gap: 6 }}
    >
      {copied ? (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="var(--success)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
            <rect x="4" y="4" width="7" height="7" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
            <path d="M3 8H2a1 1 0 01-1-1V2a1 1 0 011-1h5a1 1 0 011 1v1" stroke="currentColor" strokeWidth="1.2" />
          </svg>
          {label}
        </>
      )}
    </button>
  )
}

// ── Global spinner keyframes ─────────────────────────────────
// Injected once into the document
if (typeof document !== 'undefined') {
  const id = 'dust-spin-kf'
  if (!document.getElementById(id)) {
    const style = document.createElement('style')
    style.id = id
    style.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`
    document.head.appendChild(style)
  }
}
