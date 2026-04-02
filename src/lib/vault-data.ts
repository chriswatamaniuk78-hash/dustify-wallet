// ============================================================
// VAULT — Types & Mock Data
// ============================================================

export type FileCategory =
  | 'IDENTITY'
  | 'CONTRACT'
  | 'PROJECT_FILE'
  | 'CREDENTIAL'
  | 'GAME_ASSET'
  | 'CODE_ASSET'
  | 'MEDIA'
  | 'OTHER'

export type FilePermission = 'READ' | 'WRITE' | 'ADMIN'

export interface SbtFile {
  id: string
  name: string
  fileType: string           // mime or ext label
  sizeBytes: number
  ipfsCid: string
  fileCategory: FileCategory
  uploadedAt: string
  accessList: FileAccess[]
  isEncrypted: boolean
  thumbnailColor?: string    // for visual placeholder
}

export interface FileAccess {
  id: string
  grantedTo: string          // wallet address
  grantedToName: string      // display name
  grantedToSbt: string       // SBT ID
  permission: FilePermission
  grantedAt: string
  revokedAt: string | null
}

export type ChainEventType =
  | 'SBT_MINTED'
  | 'SBT_VERIFIED'
  | 'FILE_UPLOADED'
  | 'ACCESS_GRANTED'
  | 'ACCESS_REVOKED'
  | 'CREDENTIAL_SHARED'
  | 'TRANSMISSION_SENT'
  | 'TRANSMISSION_RECEIVED'
  | 'KEY_ROTATED'

export interface ChainEvent {
  id: string
  type: ChainEventType
  description: string
  txHash: string
  timestamp: string
  gasUsed?: number
}

export type CredentialType =
  | 'KYC_VERIFIED'
  | 'ACCREDITED_INVESTOR'
  | 'AGE_18_PLUS'
  | 'ORG_MEMBERSHIP'
  | 'PROFESSIONAL_LICENSE'
  | 'DUST_CERTIFIED'

export interface Credential {
  id: string
  type: CredentialType
  label: string
  issuedBy: string
  issuedAt: string
  expiresAt: string | null
  isActive: boolean
  zkProofAvailable: boolean  // can prove without revealing full data
}

// ── Formatting helpers ────────────────────────────────────────

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function formatCid(cid: string): string {
  if (cid.length < 12) return cid
  return `${cid.slice(0, 8)}…${cid.slice(-6)}`
}

export function categoryLabel(cat: FileCategory): string {
  const map: Record<FileCategory, string> = {
    IDENTITY:     'Identity',
    CONTRACT:     'Contract',
    PROJECT_FILE: 'Project',
    CREDENTIAL:   'Credential',
    GAME_ASSET:   'Game asset',
    CODE_ASSET:   'Code asset',
    MEDIA:        'Media',
    OTHER:        'Other',
  }
  return map[cat]
}

export function categoryColor(cat: FileCategory): string {
  const map: Record<FileCategory, string> = {
    IDENTITY:     '#7F77DD',
    CONTRACT:     '#D85A30',
    PROJECT_FILE: '#378ADD',
    CREDENTIAL:   '#1D9E75',
    GAME_ASSET:   '#EF9F27',
    CODE_ASSET:   '#60a5fa',
    MEDIA:        '#D4537E',
    OTHER:        '#888780',
  }
  return map[cat]
}

export function credentialLabel(type: CredentialType): string {
  const map: Record<CredentialType, string> = {
    KYC_VERIFIED:         'KYC Verified',
    ACCREDITED_INVESTOR:  'Accredited Investor',
    AGE_18_PLUS:          'Age 18+',
    ORG_MEMBERSHIP:       'Org Member',
    PROFESSIONAL_LICENSE: 'Professional License',
    DUST_CERTIFIED:       'Dust Certified',
  }
  return map[type]
}

// ── Mock data ─────────────────────────────────────────────────

export const MOCK_SBT_FILES: SbtFile[] = [
  {
    id: 'file_001',
    name: 'Government ID — Passport',
    fileType: 'PDF',
    sizeBytes: 2_840_000,
    ipfsCid: 'QmXnT7kW9dFvGhJ3mPqR8sUyVzA1bCeD4fGhI5jKlMnO6',
    fileCategory: 'IDENTITY',
    uploadedAt: '2024-03-15T09:20:00Z',
    isEncrypted: true,
    thumbnailColor: '#7F77DD',
    accessList: [],
  },
  {
    id: 'file_002',
    name: 'Dustify Platform Agreement v2.1',
    fileType: 'PDF',
    sizeBytes: 540_000,
    ipfsCid: 'QmYoP8lV0cEwFxH2nQrS9tUyWzB1dDfE5gHjI6kLmNo7p',
    fileCategory: 'CONTRACT',
    uploadedAt: '2024-06-01T14:30:00Z',
    isEncrypted: true,
    thumbnailColor: '#D85A30',
    accessList: [
      {
        id: 'acc_001',
        grantedTo: '0xLegalFirm...ABCD',
        grantedToName: 'Sovereign Legal LLP',
        grantedToSbt: '00012',
        permission: 'READ',
        grantedAt: '2024-06-01T14:35:00Z',
        revokedAt: null,
      },
    ],
  },
  {
    id: 'file_003',
    name: 'Dust Studio — Brand Kit v3',
    fileType: 'ZIP',
    sizeBytes: 48_200_000,
    ipfsCid: 'QmZpQ9mW1dFxGzI3oRsT0uVwXyC2eFgH6iJkL7mNpO8q',
    fileCategory: 'PROJECT_FILE',
    uploadedAt: '2024-09-12T11:00:00Z',
    isEncrypted: true,
    thumbnailColor: '#378ADD',
    accessList: [
      {
        id: 'acc_002',
        grantedTo: '0xDesigner...EFGH',
        grantedToName: 'Creative Director',
        grantedToSbt: '00234',
        permission: 'WRITE',
        grantedAt: '2024-09-12T11:05:00Z',
        revokedAt: null,
      },
      {
        id: 'acc_003',
        grantedTo: '0xMarketing...IJKL',
        grantedToName: 'Marketing Lead',
        grantedToSbt: '00398',
        permission: 'READ',
        grantedAt: '2024-09-14T09:00:00Z',
        revokedAt: null,
      },
    ],
  },
  {
    id: 'file_004',
    name: 'Dust Game Creator — Alpha Build v0.4',
    fileType: 'EXE',
    sizeBytes: 920_000_000,
    ipfsCid: 'QmArB0nX2eGyHzJ4pStU1vWxYzD3fFhI7jKmN8oQrS9t',
    fileCategory: 'GAME_ASSET',
    uploadedAt: '2024-11-28T18:00:00Z',
    isEncrypted: true,
    thumbnailColor: '#EF9F27',
    accessList: [],
  },
  {
    id: 'file_005',
    name: 'Soul Wallet — Backend API v1',
    fileType: 'TAR.GZ',
    sizeBytes: 3_100_000,
    ipfsCid: 'QmBsC1oY3fHzI5qTuV2wXyZe4gGjK8lMnO9pRsT0uW',
    fileCategory: 'CODE_ASSET',
    uploadedAt: '2024-12-10T16:20:00Z',
    isEncrypted: true,
    thumbnailColor: '#60a5fa',
    accessList: [],
  },
  {
    id: 'file_006',
    name: 'Platform Launch — Press Kit',
    fileType: 'ZIP',
    sizeBytes: 84_500_000,
    ipfsCid: 'QmCtD2pZ4gIzJ6rUvW3xYzAf5hHkL9mNpO0qSuT1vX',
    fileCategory: 'MEDIA',
    uploadedAt: '2024-12-20T10:00:00Z',
    isEncrypted: false,
    thumbnailColor: '#D4537E',
    accessList: [
      {
        id: 'acc_004',
        grantedTo: '0xPR...MNOP',
        grantedToName: 'PR Agency',
        grantedToSbt: '00521',
        permission: 'READ',
        grantedAt: '2024-12-20T10:10:00Z',
        revokedAt: null,
      },
    ],
  },
]

export const MOCK_CREDENTIALS: Credential[] = [
  {
    id: 'cred_001',
    type: 'KYC_VERIFIED',
    label: 'KYC Verified — Tier 2',
    issuedBy: 'Persona (via Dustify)',
    issuedAt: '2024-03-15T09:30:00Z',
    expiresAt: '2026-03-15T09:30:00Z',
    isActive: true,
    zkProofAvailable: true,
  },
  {
    id: 'cred_002',
    type: 'ACCREDITED_INVESTOR',
    label: 'Accredited Investor — US',
    issuedBy: 'Dustify Compliance',
    issuedAt: '2024-04-01T12:00:00Z',
    expiresAt: '2025-04-01T12:00:00Z',
    isActive: true,
    zkProofAvailable: true,
  },
  {
    id: 'cred_003',
    type: 'AGE_18_PLUS',
    label: 'Age Verified — 18+',
    issuedBy: 'Dustify KYC',
    issuedAt: '2024-03-15T09:30:00Z',
    expiresAt: null,
    isActive: true,
    zkProofAvailable: true,
  },
  {
    id: 'cred_004',
    type: 'DUST_CERTIFIED',
    label: 'Dust Certified Creator',
    issuedBy: 'Dustify Platform',
    issuedAt: '2024-08-10T00:00:00Z',
    expiresAt: null,
    isActive: true,
    zkProofAvailable: false,
  },
]

export const MOCK_CHAIN_EVENTS: ChainEvent[] = [
  {
    id: 'ev_001',
    type: 'SBT_MINTED',
    description: 'SoulBound Token #00847 minted to wallet',
    txHash: '0xABCD1234ef567890abcd1234EF567890ABCD1234ef567890abcd1234EF5678',
    timestamp: '2024-03-15T09:12:00Z',
  },
  {
    id: 'ev_002',
    type: 'SBT_VERIFIED',
    description: 'Identity verified — KYC Tier 2 credential issued',
    txHash: '0xBCDE2345fg678901bcde2345FG678901BCDE2345fg678901bcde2345FG6789',
    timestamp: '2024-03-15T09:30:00Z',
  },
  {
    id: 'ev_003',
    type: 'FILE_UPLOADED',
    description: 'Encrypted file added to vault — Government ID',
    txHash: '0xCDEF3456gh789012cdef3456GH789012CDEF3456gh789012cdef3456GH7890',
    timestamp: '2024-03-15T09:20:00Z',
  },
  {
    id: 'ev_004',
    type: 'ACCESS_GRANTED',
    description: 'READ access granted to Sovereign Legal LLP (SBT #00012)',
    txHash: '0xDEF04567hi890123def04567HI890123DEF04567hi890123def04567HI8901',
    timestamp: '2024-06-01T14:35:00Z',
  },
  {
    id: 'ev_005',
    type: 'CREDENTIAL_SHARED',
    description: 'ZK proof of Accredited Investor credential shared',
    txHash: '0xEF015678ij901234ef015678IJ901234EF015678ij901234ef015678IJ9012',
    timestamp: '2024-07-22T10:00:00Z',
  },
  {
    id: 'ev_006',
    type: 'TRANSMISSION_SENT',
    description: 'Quantum-encrypted transmission sent to 0xA3B2…C4D1',
    txHash: '0xF0126789jk012345f0126789JK012345F0126789jk012345f0126789JK0123',
    timestamp: '2024-10-14T08:30:00Z',
  },
  {
    id: 'ev_007',
    type: 'KEY_ROTATED',
    description: 'ML-KEM quantum keys rotated — scheduled rotation',
    txHash: '0x01237890kl123456012378890KL1234560123789kl1234560123789KL12345',
    timestamp: '2024-12-01T00:00:00Z',
  },
  {
    id: 'ev_008',
    type: 'ACCESS_GRANTED',
    description: 'WRITE access granted to Creative Director (SBT #00234)',
    txHash: '0x12348901lm234567123489901LM2345671234890lm234567123489001LM2345',
    timestamp: '2024-09-12T11:05:00Z',
  },
]
