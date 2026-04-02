'use client'

import { useState } from 'react'
import { StatusBadge, CopyButton } from '@/components/ui'
import {
  formatBytes,
  formatCid,
  categoryLabel,
  categoryColor,
  type SbtFile,
  type FileCategory,
  MOCK_SBT_FILES,
} from '@/lib/vault-data'

// ── File type icon ────────────────────────────────────────────

function FileTypeIcon({ ext, color }: { ext: string; color: string }) {
  return (
    <div
      style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: `${color}15`,
        border: `1px solid ${color}30`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
      }}
    >
      <div style={{ fontSize: 9, fontWeight: 700, fontFamily: "'JetBrains Mono', monospace", color, letterSpacing: '0.05em' }}>
        {ext.slice(0, 4)}
      </div>
    </div>
  )
}

// ── Access grant row ──────────────────────────────────────────

function AccessRow({ access, onRevoke }: { access: SbtFile['accessList'][0]; onRevoke: () => void }) {
  const [revoking, setRevoking] = useState(false)

  const initials = access.grantedToName
    .split(' ')
    .map(n => n[0])
    .join('')
    .slice(0, 2)

  const permColor = {
    READ:  '#60a5fa',
    WRITE: '#EF9F27',
    ADMIN: '#f87171',
  }[access.permission]

  async function handleRevoke() {
    setRevoking(true)
    await new Promise(r => setTimeout(r, 800))
    setRevoking(false)
    onRevoke()
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px',
        background: 'var(--glass-1)',
        border: '1px solid var(--border-void)',
        borderRadius: 10,
      }}
    >
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: '50%',
          background: 'var(--gold-glass-2)',
          border: '1px solid var(--border-gold-1)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: "'Playfair Display', serif",
          fontSize: 11,
          fontWeight: 600,
          color: 'var(--gold)',
          flexShrink: 0,
        }}
      >
        {initials}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>
          {access.grantedToName}
        </div>
        <div
          className="font-mono"
          style={{ fontSize: 10, color: 'var(--text-tertiary)' }}
        >
          SBT #{access.grantedToSbt}
        </div>
      </div>
      <span
        className="font-mono"
        style={{
          fontSize: 10,
          padding: '2px 8px',
          borderRadius: 100,
          background: `${permColor}12`,
          color: permColor,
          border: `1px solid ${permColor}30`,
        }}
      >
        {access.permission}
      </span>
      <button
        onClick={handleRevoke}
        disabled={revoking}
        style={{
          padding: '5px 10px',
          borderRadius: 8,
          border: '1px solid rgba(248,113,113,0.2)',
          background: 'rgba(248,113,113,0.06)',
          color: 'var(--danger)',
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          cursor: revoking ? 'wait' : 'pointer',
          opacity: revoking ? 0.6 : 1,
          transition: 'all 0.15s',
        }}
      >
        {revoking ? '…' : 'Revoke'}
      </button>
    </div>
  )
}

// ── File detail panel ─────────────────────────────────────────

function FileDetail({
  file,
  onClose,
}: {
  file: SbtFile
  onClose: () => void
}) {
  const [accessList, setAccessList] = useState(file.accessList)
  const [shareInput, setShareInput] = useState('')
  const [sharePermission, setSharePermission] = useState<'READ' | 'WRITE'>('READ')
  const [sharing, setSharing] = useState(false)
  const [shared, setShared] = useState(false)
  const color = categoryColor(file.fileCategory)

  const uploadDate = new Date(file.uploadedAt).toLocaleDateString('en-US', {
    year: 'numeric', month: 'short', day: 'numeric',
  })

  async function handleShare() {
    if (!shareInput.trim()) return
    setSharing(true)
    await new Promise(r => setTimeout(r, 1000))
    setAccessList(prev => [...prev, {
      id: `acc_new_${Date.now()}`,
      grantedTo: shareInput,
      grantedToName: shareInput.startsWith('0x') ? 'New collaborator' : shareInput,
      grantedToSbt: '—',
      permission: sharePermission,
      grantedAt: new Date().toISOString(),
      revokedAt: null,
    }])
    setSharing(false)
    setShared(true)
    setShareInput('')
    setTimeout(() => setShared(false), 2500)
  }

  return (
    <div
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
      onClick={e => { if (e.target === e.currentTarget) onClose() }}
    >
      <div
        className="glass-heavy animate-fade-up"
        style={{ width: '100%', maxWidth: 540, padding: 28, maxHeight: '90vh', overflow: 'auto' }}
      >
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, marginBottom: 24 }}>
          <FileTypeIcon ext={file.fileType} color={color} />
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 16, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 4 }}>
              {file.name}
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
              <span
                className="font-mono"
                style={{
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 100,
                  background: `${color}12`,
                  color,
                  border: `1px solid ${color}25`,
                }}
              >
                {categoryLabel(file.fileCategory)}
              </span>
              <span className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>
                {formatBytes(file.sizeBytes)} · {file.fileType}
              </span>
              {file.isEncrypted
                ? <StatusBadge variant="success">Encrypted</StatusBadge>
                : <StatusBadge variant="warning">Unencrypted</StatusBadge>
              }
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 30, height: 30,
              borderRadius: '50%',
              background: 'var(--glass-2)',
              border: '1px solid var(--border-glass)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              fontSize: 16,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            ×
          </button>
        </div>

        {/* IPFS details */}
        <div
          style={{
            padding: '14px',
            background: 'var(--glass-2)',
            border: '1px solid var(--border-gold-0)',
            borderRadius: 12,
            marginBottom: 20,
          }}
        >
          {[
            { label: 'IPFS CID',  value: file.ipfsCid },
            { label: 'Uploaded',  value: uploadDate },
            { label: 'Encryption', value: file.isEncrypted ? 'ML-KEM-768 (quantum-safe)' : 'None' },
          ].map(row => (
            <div
              key={row.label}
              style={{
                display: 'flex',
                gap: 12,
                padding: '6px 0',
                borderBottom: '1px solid rgba(255,255,255,0.03)',
                alignItems: 'flex-start',
              }}
            >
              <span
                className="font-mono"
                style={{ fontSize: 10, color: 'var(--text-tertiary)', minWidth: 80, flexShrink: 0, paddingTop: 1 }}
              >
                {row.label.toUpperCase()}
              </span>
              <span
                className="font-mono"
                style={{ fontSize: 11, color: 'var(--text-secondary)', wordBreak: 'break-all', lineHeight: 1.5 }}
              >
                {row.value}
              </span>
            </div>
          ))}
          <div style={{ marginTop: 10 }}>
            <CopyButton text={file.ipfsCid} label="Copy CID" />
          </div>
        </div>

        {/* Access control */}
        <div style={{ marginBottom: 20 }}>
          <div
            className="font-mono"
            style={{ fontSize: 10, letterSpacing: '0.15em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 12 }}
          >
            Access control ({accessList.length} {accessList.length === 1 ? 'person' : 'people'})
          </div>
          {accessList.length === 0 ? (
            <div
              style={{
                padding: '16px',
                textAlign: 'center',
                color: 'var(--text-tertiary)',
                fontSize: 13,
                background: 'var(--glass-1)',
                borderRadius: 10,
              }}
            >
              Only you can access this file
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {accessList.map(acc => (
                <AccessRow
                  key={acc.id}
                  access={acc}
                  onRevoke={() => setAccessList(prev => prev.filter(a => a.id !== acc.id))}
                />
              ))}
            </div>
          )}
        </div>

        {/* Grant access form */}
        <div
          style={{
            padding: '16px',
            background: 'var(--glass-1)',
            border: '1px solid var(--border-gold-0)',
            borderRadius: 12,
            marginBottom: 16,
          }}
        >
          <div
            className="font-mono"
            style={{ fontSize: 10, letterSpacing: '0.12em', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginBottom: 12 }}
          >
            Grant access
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <input
              value={shareInput}
              onChange={e => setShareInput(e.target.value)}
              placeholder="0x address or SBT ID"
              style={{
                flex: 1,
                background: 'var(--glass-1)',
                border: '1px solid var(--border-gold-1)',
                borderRadius: 10,
                padding: '10px 14px',
                color: 'var(--text-primary)',
                fontFamily: "'Geist', system-ui, sans-serif",
                fontSize: 13,
                outline: 'none',
              }}
            />
            <select
              value={sharePermission}
              onChange={e => setSharePermission(e.target.value as 'READ' | 'WRITE')}
              style={{
                background: 'var(--glass-2)',
                border: '1px solid var(--border-gold-1)',
                borderRadius: 10,
                padding: '10px 12px',
                color: 'var(--text-primary)',
                fontFamily: "'JetBrains Mono', monospace",
                fontSize: 12,
                cursor: 'pointer',
                outline: 'none',
              }}
            >
              <option value="READ">READ</option>
              <option value="WRITE">WRITE</option>
            </select>
            <button
              className={shared ? 'btn-glass' : 'btn-sovereign'}
              style={{ padding: '10px 16px', fontSize: 13, whiteSpace: 'nowrap', minWidth: 80 }}
              onClick={handleShare}
              disabled={sharing || !shareInput.trim()}
            >
              {sharing ? '…' : shared ? 'Granted' : 'Grant'}
            </button>
          </div>
          <div
            className="font-mono"
            style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 8, lineHeight: 1.5 }}
          >
            Access is signed by your SBT and recorded on-chain. You can revoke at any time.
          </div>
        </div>

        {/* Action row */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-glass" style={{ flex: 1, padding: '11px', fontSize: 13 }}>
            Download
          </button>
          <button
            className="btn-glass"
            style={{ flex: 1, padding: '11px', fontSize: 13, color: 'var(--danger)', borderColor: 'rgba(248,113,113,0.25)' }}
          >
            Delete file
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Category filter ───────────────────────────────────────────

const ALL_CATEGORIES: { id: FileCategory | 'ALL'; label: string }[] = [
  { id: 'ALL',          label: 'All' },
  { id: 'IDENTITY',     label: 'Identity' },
  { id: 'CONTRACT',     label: 'Contracts' },
  { id: 'PROJECT_FILE', label: 'Projects' },
  { id: 'GAME_ASSET',   label: 'Game assets' },
  { id: 'CODE_ASSET',   label: 'Code' },
  { id: 'MEDIA',        label: 'Media' },
]

// ── Main File Vault component ─────────────────────────────────

export default function FileVault() {
  const [files] = useState<SbtFile[]>(MOCK_SBT_FILES)
  const [selectedFile, setSelectedFile] = useState<SbtFile | null>(null)
  const [filterCat, setFilterCat] = useState<FileCategory | 'ALL'>('ALL')
  const [search, setSearch] = useState('')

  const filtered = files.filter(f => {
    const catOk = filterCat === 'ALL' || f.fileCategory === filterCat
    const searchOk = !search || f.name.toLowerCase().includes(search.toLowerCase())
    return catOk && searchOk
  })

  const totalSize = files.reduce((sum, f) => sum + f.sizeBytes, 0)

  return (
    <div className="animate-fade-up delay-2">
      <div className="glass" style={{ padding: 24 }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
          <div>
            <div className="font-display" style={{ fontSize: 18, fontWeight: 500 }}>
              Encrypted vault
            </div>
            <div className="font-mono" style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>
              {files.length} files · {formatBytes(totalSize)} · IPFS + Filecoin
            </div>
          </div>
          <button className="btn-sovereign" style={{ padding: '9px 18px', fontSize: 13 }}>
            + Upload file
          </button>
        </div>

        {/* Search + filter */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search files…"
            style={{
              flex: 1,
              minWidth: 160,
              background: 'var(--glass-1)',
              border: '1px solid var(--border-gold-1)',
              borderRadius: 10,
              padding: '9px 14px',
              color: 'var(--text-primary)',
              fontFamily: "'Geist', system-ui, sans-serif",
              fontSize: 13,
              outline: 'none',
            }}
          />
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {ALL_CATEGORIES.map(cat => (
              <button
                key={cat.id}
                onClick={() => setFilterCat(cat.id as FileCategory | 'ALL')}
                style={{
                  padding: '8px 12px',
                  borderRadius: 8,
                  border: `1px solid ${filterCat === cat.id ? 'var(--border-gold-2)' : 'var(--border-glass)'}`,
                  background: filterCat === cat.id ? 'var(--gold-glass-2)' : 'transparent',
                  color: filterCat === cat.id ? 'var(--gold)' : 'var(--text-secondary)',
                  fontFamily: "'Geist', system-ui, sans-serif",
                  fontSize: 12,
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                  whiteSpace: 'nowrap' as const,
                }}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* File list */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(file => {
            const color = categoryColor(file.fileCategory)
            const hasAccess = file.accessList.length > 0
            const uploadDate = new Date(file.uploadedAt).toLocaleDateString('en-US', {
              month: 'short', day: 'numeric', year: 'numeric',
            })

            return (
              <div
                key={file.id}
                onClick={() => setSelectedFile(file)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px',
                  borderRadius: 12,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                  border: '1px solid transparent',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'var(--glass-2)'
                  e.currentTarget.style.borderColor = 'var(--border-gold-0)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'transparent'
                  e.currentTarget.style.borderColor = 'transparent'
                }}
              >
                <FileTypeIcon ext={file.fileType} color={color} />

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 500,
                      color: 'var(--text-primary)',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {file.name}
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 3, alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                      {formatBytes(file.sizeBytes)}
                    </span>
                    <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                      {formatCid(file.ipfsCid)}
                    </span>
                    <span className="font-mono" style={{ fontSize: 10, color: 'var(--text-tertiary)' }}>
                      {uploadDate}
                    </span>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  {file.isEncrypted && (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                      <rect x="1.5" y="5.5" width="9" height="6" rx="1.5" stroke="var(--success)" strokeWidth="1" />
                      <path d="M3.5 5.5V4a2.5 2.5 0 015 0v1.5" stroke="var(--success)" strokeWidth="1" strokeLinecap="round" />
                    </svg>
                  )}
                  {hasAccess && (
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 10,
                        padding: '2px 7px',
                        borderRadius: 100,
                        background: 'var(--info-dim, rgba(96,165,250,0.1))',
                        color: 'var(--info)',
                        border: '1px solid rgba(96,165,250,0.2)',
                      }}
                    >
                      {file.accessList.length} shared
                    </span>
                  )}
                  <span
                    className="font-mono"
                    style={{
                      fontSize: 10,
                      padding: '2px 8px',
                      borderRadius: 100,
                      background: `${color}12`,
                      color,
                      border: `1px solid ${color}25`,
                    }}
                  >
                    {categoryLabel(file.fileCategory)}
                  </span>
                </div>
              </div>
            )
          })}

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-tertiary)', fontSize: 13 }}>
              No files match that filter
            </div>
          )}
        </div>
      </div>

      {selectedFile && (
        <FileDetail file={selectedFile} onClose={() => setSelectedFile(null)} />
      )}
    </div>
  )
}
