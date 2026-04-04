// ============================================================
// SOUL WALLET — API Client
// Connects to dustify-backend at api.dustifytechnologiescorp.com
// All endpoints match packages/backend/src/lib/services/api-routes.ts
// ============================================================

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001'
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ''
const SUPABASE_ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''

// ── Session token (stored in memory, never localStorage per security policy)
let _sessionToken: string | null = null
export function setSessionToken(token: string) { _sessionToken = token }
export function clearSessionToken() { _sessionToken = null }
export function getSessionToken() { return _sessionToken }

// ── Core fetch wrapper ────────────────────────────────────────
async function apiFetch<T>(
  path: string,
  options: RequestInit = {}
): Promise<{ data: T | null; error: string | null }> {
  try {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-Dustify-Client': 'soul-wallet-pwa/2.0',
      ...(options.headers as Record<string, string>),
    }
    if (_sessionToken) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${_sessionToken}`
    }

    const res = await fetch(`${API_BASE}${path}`, {
      ...options,
      headers,
    })

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }))
      return { data: null, error: err.error ?? `HTTP ${res.status}` }
    }

    const data = await res.json()
    return { data, error: null }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Network error'
    return { data: null, error: message }
  }
}

// ── AUTH ──────────────────────────────────────────────────────
export const AuthAPI = {
  /**
   * Initiate WebAuthn passkey challenge.
   * Backend: POST /api/auth/passkey/challenge
   */
  async getPasskeyChallenge(walletAddress: string) {
    return apiFetch<{ challenge: string; rpId: string }>('/api/auth/passkey/challenge', {
      method: 'POST',
      body: JSON.stringify({ walletAddress }),
    })
  },

  /**
   * Verify passkey assertion + issue session token.
   * Backend: POST /api/auth/passkey/verify
   */
  async verifyPasskey(assertion: unknown, walletAddress: string) {
    return apiFetch<{ sessionToken: string; expiresAt: string; user: unknown }>(
      '/api/auth/passkey/verify',
      {
        method: 'POST',
        body: JSON.stringify({ assertion, walletAddress }),
      }
    )
  },

  /**
   * Check current session validity.
   * Backend: GET /api/auth/me
   */
  async getMe() {
    return apiFetch<{ userId: string; walletAddress: string; sbtTokenId: string }>(
      '/api/auth/me'
    )
  },

  /**
   * Sign out — invalidate session on backend.
   * Backend: POST /api/auth/signout
   */
  async signOut() {
    return apiFetch<{ ok: boolean }>('/api/auth/signout', { method: 'POST' })
  },
}

// ── WALLET ────────────────────────────────────────────────────
export const WalletAPI = {
  /**
   * Get live wallet balance (USDC + DustMiles).
   * Backend: GET /api/wallet/balance
   */
  async getBalance(userId: string) {
    return apiFetch<{
      usdcBalance: number
      dustMilesBalance: number
      dustMilesPending: number
      tier: string
      tierMultiplier: number
    }>(`/api/wallet/${userId}/balance`)
  },

  /**
   * Get transaction history (paginated).
   * Backend: GET /api/wallet/transactions
   */
  async getTransactions(params: { page?: number; limit?: number; type?: string } = {}) {
    const qs = new URLSearchParams({
      page: String(params.page ?? 1),
      limit: String(params.limit ?? 20),
      ...(params.type ? { type: params.type } : {}),
    })
    return apiFetch<{
      items: unknown[]
      total: number
      hasMore: boolean
    }>(`/api/wallet/transactions?${qs}`)
  },

  /**
   * Send USDC to another wallet address.
   * Backend: POST /api/wallet/send (queued via BullMQ)
   */
  async sendUSDC(payload: {
    toAddress: string
    amount: number
    note?: string
    sbtSignature: string
  }) {
    return apiFetch<{
      transactionId: string
      txHash: string
      fee: number
      dustMilesEarned: number
    }>('/api/wallet/send', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  },

  /**
   * Get wallet receive address + SBT QR data.
   * Backend: GET /api/wallet/receive
   */
  async getReceiveInfo() {
    return apiFetch<{
      walletAddress: string
      sbtTokenId: string
      qrData: string
    }>('/api/wallet/receive')
  },

  /**
   * Get on-chain activity from Polygon.
   * Backend: GET /api/wallet/chain-activity
   */
  async getChainActivity(limit = 10) {
    return apiFetch<{
      transactions: unknown[]
    }>(`/api/wallet/chain-activity?limit=${limit}`)
  },
}

// ── TRADING BOT ───────────────────────────────────────────────
export const TradingAPI = {
  /**
   * List all user's bots.
   * Backend: GET /api/bots
   */
  async listBots() {
    return apiFetch<{ bots: unknown[] }>('/api/bots')
  },

  /**
   * Create and deploy a new trading bot.
   * Backend: POST /api/bots (queued via BullMQ trading worker)
   */
  async createBot(config: {
    name: string
    exchange: 'ALPACA' | 'COINBASE_ADVANCED' | 'OANDA'
    strategy: string
    symbols: string[]
    maxPositionPct: number
    dailyLossLimitPct: number
    takeProfitPct: number
    stopLossPct: number
    paperMode: boolean
    // API keys encrypted client-side before sending
    encryptedApiKey: string
    encryptedApiSecret: string
  }) {
    return apiFetch<{ botId: string; status: string }>('/api/bots', {
      method: 'POST',
      body: JSON.stringify(config),
    })
  },

  /**
   * Pause / resume a bot.
   * Backend: PATCH /api/bots/:id/status
   */
  async setBotStatus(botId: string, status: 'ACTIVE' | 'PAUSED') {
    return apiFetch<{ status: string }>(`/api/bots/${botId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    })
  },

  /**
   * Get live P&L and positions for a bot.
   * Backend: GET /api/bots/:id/portfolio
   */
  async getBotPortfolio(botId: string) {
    return apiFetch<{
      totalValue: number
      totalPnl: number
      positions: unknown[]
      recentTrades: unknown[]
    }>(`/api/bots/${botId}/portfolio`)
  },

  /**
   * Run a backtest (simulated, no live orders).
   * Backend: POST /api/bots/backtest
   */
  async runBacktest(params: {
    strategy: string
    exchange: string
    symbol: string
    startDate: string
    endDate: string
    initialCapital: number
  }) {
    return apiFetch<{
      roi: number
      maxDrawdown: number
      winRate: number
      sharpeRatio: number
      trades: unknown[]
    }>('/api/bots/backtest', {
      method: 'POST',
      body: JSON.stringify(params),
    })
  },

  /**
   * Get Phantom Flow™ signal for an asset.
   * Backend: GET /api/bots/phantom-flow/:symbol
   * Uses Claude AI for sentiment analysis + 7 technical indicators
   */
  async getPhantomFlowSignal(symbol: string) {
    return apiFetch<{
      signal: string
      confidence: number
      sentiment: number
      regime: string
      indicators: unknown[]
      entryPrice: number
      targetPrice: number
      stopLoss: number
      riskReward: number
      reasoning: string
    }>(`/api/bots/phantom-flow/${encodeURIComponent(symbol)}`)
  },
}

// ── TRAVEL ────────────────────────────────────────────────────
export const TravelAPI = {
  /**
   * Search flights via Amadeus API.
   * Backend: GET /api/travel/flights/search
   */
  async searchFlights(params: {
    origin: string
    destination: string
    departureDate: string
    passengers: number
    cabinClass?: string
  }) {
    const qs = new URLSearchParams({
      origin: params.origin,
      destination: params.destination,
      departureDate: params.departureDate,
      passengers: String(params.passengers),
      ...(params.cabinClass ? { cabinClass: params.cabinClass } : {}),
    })
    return apiFetch<{ flights: unknown[]; priceSignal: string }>(
      `/api/travel/flights/search?${qs}`
    )
  },

  /**
   * Book a flight. Returns booking confirmation + DustMiles earned.
   * Backend: POST /api/travel/flights/book (queued via BullMQ)
   */
  async bookFlight(flightId: string, passengerDetails: unknown[]) {
    return apiFetch<{
      bookingId: string
      confirmationCode: string
      totalAmount: number
      dustMilesEarned: number
    }>('/api/travel/flights/book', {
      method: 'POST',
      body: JSON.stringify({ flightId, passengers: passengerDetails }),
    })
  },

  /**
   * Search hotels via Booking.com API.
   * Backend: GET /api/travel/hotels/search
   */
  async searchHotels(params: {
    destination: string
    checkIn: string
    checkOut: string
    guests: number
    rooms?: number
  }) {
    const qs = new URLSearchParams({
      destination: params.destination,
      checkIn: params.checkIn,
      checkOut: params.checkOut,
      guests: String(params.guests),
      rooms: String(params.rooms ?? 1),
    })
    return apiFetch<{ hotels: unknown[] }>(`/api/travel/hotels/search?${qs}`)
  },

  /**
   * Get user's trip itinerary.
   * Backend: GET /api/travel/trips
   */
  async getTrips() {
    return apiFetch<{ trips: unknown[] }>('/api/travel/trips')
  },

  /**
   * Get DustMiles price signal for a route.
   * Backend: GET /api/travel/price-signal
   */
  async getPriceSignal(origin: string, destination: string, date: string) {
    return apiFetch<{
      signal: 'BUY_NOW' | 'WAIT' | 'FAIR'
      priceHistory: unknown[]
      prediction: string
    }>(`/api/travel/price-signal?origin=${origin}&destination=${destination}&date=${date}`)
  },
}

// ── GAMING ────────────────────────────────────────────────────
export const GamingAPI = {
  /**
   * Get active tournaments.
   * Backend: GET /api/gaming/tournaments
   */
  async getTournaments(status?: 'UPCOMING' | 'LIVE' | 'COMPLETED') {
    const qs = status ? `?status=${status}` : ''
    return apiFetch<{ tournaments: unknown[] }>(`/api/gaming/tournaments${qs}`)
  },

  /**
   * Enter a tournament.
   * Backend: POST /api/gaming/tournaments/:id/enter
   */
  async enterTournament(tournamentId: string, entryFeePayment?: string) {
    return apiFetch<{
      participantId: string
      position: number
      confirmed: boolean
    }>(`/api/gaming/tournaments/${tournamentId}/enter`, {
      method: 'POST',
      body: JSON.stringify({ entryFeePayment }),
    })
  },

  /**
   * Get user's gaming stats and achievements.
   * Backend: GET /api/gaming/stats
   */
  async getStats() {
    return apiFetch<{
      totalGamesPlayed: number
      tournamentsWon: number
      dustMilesFromGaming: number
      achievements: unknown[]
      rank: number
      ratingPoints: number
    }>('/api/gaming/stats')
  },

  /**
   * Get global leaderboard.
   * Backend: GET /api/gaming/leaderboard
   */
  async getLeaderboard(gameId?: string, limit = 50) {
    const qs = new URLSearchParams({ limit: String(limit) })
    if (gameId) qs.set('gameId', gameId)
    return apiFetch<{ entries: unknown[]; userRank: number }>(
      `/api/gaming/leaderboard?${qs}`
    )
  },
}

// ── DUSTMILES ─────────────────────────────────────────────────
export const DustMilesAPI = {
  /**
   * Get full DustMiles history.
   * Backend: GET /api/miles/history
   */
  async getHistory(limit = 50) {
    return apiFetch<{
      transactions: unknown[]
      total: number
    }>(`/api/miles/history?limit=${limit}`)
  },

  /**
   * Redeem DustMiles → USDC or other reward.
   * Backend: POST /api/miles/redeem (atomic PostgreSQL function)
   */
  async redeem(request: {
    type: 'USDC_DIRECT' | 'TRAVEL_CREDIT' | 'GAMING_CREDITS' | 'PARTNER_VOUCHER' | 'CHARITY' | 'REINVEST'
    amount: number
    targetWallet?: string
    partnerId?: string
  }) {
    return apiFetch<{
      transactionId: string
      dustMilesDeducted: number
      valueReceived: number
      currency: string
      confirmedAt: string
    }>('/api/miles/redeem', {
      method: 'POST',
      body: JSON.stringify(request),
    })
  },

  /**
   * Get waterfall pool health.
   * Backend: GET /api/miles/pool
   */
  async getPoolState() {
    return apiFetch<{
      reserveBalance: number
      reserveTarget: number
      reserveHealthPct: number
      earnPoolBalance: number
      monthlyInflow: number
      lastUpdated: string
    }>('/api/miles/pool')
  },

  /**
   * Get earn rates for current user (includes tier multiplier).
   * Backend: GET /api/miles/earn-rates
   */
  async getEarnRates() {
    return apiFetch<{
      tier: string
      multiplier: number
      rates: { category: string; baseRate: number; effectiveRate: number }[]
    }>('/api/miles/earn-rates')
  },
}

// ── NOTIFICATIONS ─────────────────────────────────────────────
export const NotificationsAPI = {
  /**
   * Get unread notifications.
   * Backend: GET /api/notifications
   */
  async getAll(params: { unreadOnly?: boolean; limit?: number } = {}) {
    const qs = new URLSearchParams()
    if (params.unreadOnly) qs.set('unreadOnly', 'true')
    if (params.limit) qs.set('limit', String(params.limit))
    return apiFetch<{ notifications: unknown[]; unreadCount: number }>(
      `/api/notifications?${qs}`
    )
  },

  /**
   * Mark notification as read.
   * Backend: PATCH /api/notifications/:id/read
   */
  async markRead(notificationId: string) {
    return apiFetch<{ ok: boolean }>(
      `/api/notifications/${notificationId}/read`,
      { method: 'PATCH' }
    )
  },

  /**
   * Mark all as read.
   * Backend: PATCH /api/notifications/read-all
   */
  async markAllRead() {
    return apiFetch<{ count: number }>(
      '/api/notifications/read-all',
      { method: 'PATCH' }
    )
  },

  /**
   * Register push notification subscription.
   * Backend: POST /api/notifications/subscribe
   */
  async subscribePush(subscription: PushSubscription) {
    return apiFetch<{ ok: boolean }>('/api/notifications/subscribe', {
      method: 'POST',
      body: JSON.stringify({ subscription }),
    })
  },
}

// ── VAULT ─────────────────────────────────────────────────────
export const VaultAPI = {
  /**
   * List vault files.
   * Backend: GET /api/vault/files
   */
  async listFiles() {
    return apiFetch<{ files: unknown[] }>('/api/vault/files')
  },

  /**
   * Get upload URL (pre-signed Supabase Storage URL).
   * Backend: POST /api/vault/files/upload-url
   */
  async getUploadUrl(fileName: string, contentType: string) {
    return apiFetch<{ uploadUrl: string; fileId: string }>(
      '/api/vault/files/upload-url',
      {
        method: 'POST',
        body: JSON.stringify({ fileName, contentType }),
      }
    )
  },

  /**
   * Delete a vault file.
   * Backend: DELETE /api/vault/files/:id
   */
  async deleteFile(fileId: string) {
    return apiFetch<{ ok: boolean }>(`/api/vault/files/${fileId}`, {
      method: 'DELETE',
    })
  },
}

// ── SUPABASE REALTIME HELPER ───────────────────────────────────
/**
 * Subscribe to real-time notifications via Supabase Realtime.
 * Used for: bot trade notifications, DustMiles earned alerts, tournament updates.
 *
 * Usage:
 *   const unsub = subscribeRealtime(userId, (event) => {
 *     if (event.type === 'TRADE_EXECUTED') showToast(event.payload)
 *   })
 *   return () => unsub()
 */
export function subscribeRealtime(
  userId: string,
  onEvent: (event: { type: string; payload: unknown }) => void
): () => void {
  if (!SUPABASE_URL || !SUPABASE_ANON) return () => {}

  // Supabase Realtime WebSocket
  const channel = `user:${userId}`
  const wsUrl = SUPABASE_URL.replace('https://', 'wss://').replace('http://', 'ws://')
  const ws = new WebSocket(
    `${wsUrl}/realtime/v1/websocket?apikey=${SUPABASE_ANON}&vsn=1.0.0`
  )

  ws.onopen = () => {
    ws.send(JSON.stringify({
      topic: `realtime:public:notifications:user_id=eq.${userId}`,
      event: 'phx_join',
      payload: {},
      ref: '1',
    }))
  }

  ws.onmessage = (msg) => {
    try {
      const data = JSON.parse(msg.data)
      if (data.event === 'INSERT' || data.event === 'UPDATE') {
        onEvent({
          type: data.payload?.new?.type ?? 'UNKNOWN',
          payload: data.payload?.new,
        })
      }
    } catch { /* ignore parse errors */ }
  }

  return () => ws.close()
}
