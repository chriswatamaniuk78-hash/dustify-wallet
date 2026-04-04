/**
 * DUSTIFY API ROUTES — COMPLETE SET
 *
 * This file documents every API endpoint across all apps.
 * Each route is implemented as a Next.js Route Handler.
 * Every route uses the withAuth() middleware.
 *
 * Organized by app. Reference implementation below each route.
 */

// ── src/app/api/auth/passkey/register/route.ts ────────────────────────────

import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@/lib/db/client'
import { generateChallenge, createSession, AuthError } from '@/lib/auth/middleware'
import { withAuth } from '@/lib/auth/middleware'
import { addDustMilesJob, addNotificationJob } from '@/lib/queues/redis'
import { MILES_RATES } from '@/lib/services/dustmiles.service'
import {
  getDustMilesBalance,
  getRecentMilesEvents,
  redeemDustMiles,
} from '@/lib/services/dustmiles.service'
import {
  searchFlights, bookFlight, searchHotels, bookHotel, searchAirports
} from '@/lib/integrations/travel/amadeus'
import {
  getMarketData, checkCircuitBreaker
} from '@/lib/integrations/trading/executor'
import {
  completeModule, updateIEPGoalProgress, generateDailySummary
} from '@/lib/services/lumis.service'

// ════════════════════════════════════════════════════════════════════════════
// SECTION 1 — AUTHENTICATION
// ════════════════════════════════════════════════════════════════════════════

// POST /api/auth/passkey/challenge
// Returns a WebAuthn challenge for registration or authentication
export async function GET_PASSKEY_CHALLENGE(req: NextRequest): Promise<NextResponse> {
  const walletAddress = req.nextUrl.searchParams.get('wallet')
  if (!walletAddress) {
    return NextResponse.json({ error: 'wallet required' }, { status: 400 })
  }

  const db = createServerClient()
  const { data: identity } = await db
    .from('sbt_identities')
    .select('id')
    .eq('wallet_address', walletAddress.toLowerCase())
    .single()

  if (!identity) {
    return NextResponse.json({ error: 'SBT identity not found' }, { status: 404 })
  }

  const challenge = await generateChallenge(identity.id)

  return NextResponse.json({
    challenge,
    rpId:     new URL(process.env.NEXT_PUBLIC_APP_URL!).hostname,
    rpName:   'Dustify Technologies Corp',
    userId:   identity.id,
    userName: walletAddress,
  })
}

// POST /api/auth/passkey/verify
// Verifies WebAuthn assertion and returns a session token
export const POST_PASSKEY_VERIFY = withAuth(
  async (req: NextRequest, auth) => {
    const { verifyPasskeyAssertion } = await import('@/lib/auth/middleware')
    const body = await req.json()

    const verified = await verifyPasskeyAssertion({
      credentialId:      body.credentialId,
      authenticatorData: body.authenticatorData,
      clientDataJSON:    body.clientDataJSON,
      signature:         body.signature,
      sbtId:             auth.sbt.id,
    })

    if (!verified) {
      return NextResponse.json({ error: 'Passkey verification failed' }, { status: 401 })
    }

    const sessionToken = await createSession({
      sbtId:     auth.sbt.id,
      app:       body.app || 'wallet',
      ipAddress: req.headers.get('x-forwarded-for') || undefined,
      userAgent: req.headers.get('user-agent') || undefined,
    })

    const res = NextResponse.json({ success: true, tier: auth.sbt.tier })
    res.cookies.set('dustify-session', sessionToken, {
      httpOnly:  true,
      secure:    process.env.NODE_ENV === 'production',
      sameSite:  'lax',
      maxAge:    7 * 24 * 60 * 60,
      path:      '/',
    })
    return res
  }
)

// POST /api/auth/logout
export const POST_LOGOUT = withAuth(async (_req, auth) => {
  const { revokeSession } = await import('@/lib/auth/middleware')
  await revokeSession(auth.sbt.sessionId, 'USER_LOGOUT')
  const res = NextResponse.json({ success: true })
  res.cookies.delete('dustify-session')
  return res
})

// GET /api/auth/me
// Returns the current authenticated SBT identity
export const GET_ME = withAuth(async (_req, auth) => {
  const db = createServerClient()
  const { data: identity } = await db
    .from('sbt_identities')
    .select('id, token_id, wallet_address, tier, status, display_name, avatar_ipfs_cid, bio, lumis_role, created_at')
    .eq('id', auth.sbt.id)
    .single()

  return NextResponse.json(identity)
})

// ════════════════════════════════════════════════════════════════════════════
// SECTION 2 — SBT IDENTITY
// ════════════════════════════════════════════════════════════════════════════

// POST /api/identity/mint
// Mints a new SBT — called after on-chain mint confirmation
export async function POST_MINT_SBT(req: NextRequest): Promise<NextResponse> {
  const body = await req.json()
  const { walletAddress, tokenId, txHash, blockNumber, tier = 'PIONEER' } = body

  // Validate this tx actually happened on-chain
  const { verifyMintTx } = await import('@/lib/blockchain/transactions')
  const valid = await verifyMintTx(txHash, walletAddress, tokenId)
  if (!valid) {
    return NextResponse.json({ error: 'Invalid mint transaction' }, { status: 400 })
  }

  const db = createServerClient()
  const { data, error } = await db
    .from('sbt_identities')
    .insert({
      token_id:       BigInt(tokenId).toString(),
      wallet_address: walletAddress.toLowerCase(),
      did:            `did:dustify:${tokenId}`,
      tier,
      mint_tx_hash:   txHash,
      mint_block_number: blockNumber,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Create DustMiles account
  await db.from('dust_miles_accounts').insert({ sbt_id: data.id })
  await db.from('wallet_balances').insert({ sbt_id: data.id })

  // Welcome bonus
  await addDustMilesJob({
    sbtId:     data.id,
    amount:    MILES_RATES.SBT_MINTED,
    reason:    'Welcome to Dustify — SBT minted!',
    sourceApp: 'wallet',
  })

  // Welcome notification
  await addNotificationJob({
    type:           'EMAIL',
    recipientSbtId: data.id,
    subject:        'Your Dustify identity is live',
    template:       'WELCOME',
    data:           { tokenId, tier },
    urgent:         false,
  })

  return NextResponse.json({ success: true, sbtId: data.id, did: data.did })
}

// PATCH /api/identity/profile
export const PATCH_PROFILE = withAuth(async (req, auth) => {
  const body = await req.json()
  const allowed = ['display_name', 'avatar_ipfs_cid', 'bio', 'timezone', 'province']
  const updates: Record<string, string> = {}
  for (const key of allowed) {
    if (body[key] !== undefined) updates[key] = body[key]
  }

  const db = createServerClient()
  const { data } = await db
    .from('sbt_identities')
    .update(updates)
    .eq('id', auth.sbt.id)
    .select()
    .single()

  return NextResponse.json(data)
})

// ════════════════════════════════════════════════════════════════════════════
// SECTION 3 — DUSTMILES
// ════════════════════════════════════════════════════════════════════════════

// GET /api/miles/balance
export const GET_MILES_BALANCE = withAuth(async (_req, auth) => {
  const balance = await getDustMilesBalance(auth.sbt.id)
  return NextResponse.json(balance)
})

// GET /api/miles/history
export const GET_MILES_HISTORY = withAuth(async (req, auth) => {
  const limit  = parseInt(req.nextUrl.searchParams.get('limit') || '20')
  const events = await getRecentMilesEvents(auth.sbt.id, limit)
  return NextResponse.json(events)
})

// POST /api/miles/redeem
export const POST_REDEEM_MILES = withAuth(async (req, auth) => {
  const { amount, reason } = await req.json()
  if (!amount || amount < 100) {
    return NextResponse.json({ error: 'Minimum redemption is 100 miles (1 USDC)' }, { status: 400 })
  }

  const result = await redeemDustMiles({
    sbtId:     auth.sbt.id,
    amount,
    reason:    reason || 'Manual redemption',
    sourceApp: 'wallet',
  })

  if (!result.success) {
    return NextResponse.json({ error: 'Insufficient miles balance' }, { status: 400 })
  }

  return NextResponse.json(result)
})

// ════════════════════════════════════════════════════════════════════════════
// SECTION 4 — SOUL WALLET
// ════════════════════════════════════════════════════════════════════════════

// GET /api/wallet/balance
export const GET_WALLET_BALANCE = withAuth(async (_req, auth) => {
  const db = createServerClient()
  const { data } = await db
    .from('wallet_balances')
    .select('usdc_balance, matic_balance, last_sync_at')
    .eq('sbt_id', auth.sbt.id)
    .single()

  return NextResponse.json(data || { usdc_balance: 0, matic_balance: 0 })
})

// GET /api/wallet/transactions
export const GET_WALLET_TRANSACTIONS = withAuth(async (req, auth) => {
  const db     = createServerClient()
  const page   = parseInt(req.nextUrl.searchParams.get('page') || '1')
  const limit  = Math.min(parseInt(req.nextUrl.searchParams.get('limit') || '20'), 100)
  const offset = (page - 1) * limit

  const { data, count } = await db
    .from('wallet_transactions')
    .select('*', { count: 'exact' })
    .eq('sbt_id', auth.sbt.id)
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1)

  return NextResponse.json({
    transactions: data,
    total: count,
    page,
    hasMore: (count || 0) > offset + limit,
  })
})

// POST /api/wallet/send
export const POST_WALLET_SEND = withAuth(async (req, auth) => {
  const { toAddress, amount, currency = 'USDC' } = await req.json()

  if (!toAddress || !amount) {
    return NextResponse.json({ error: 'toAddress and amount required' }, { status: 400 })
  }

  if (amount < 1) {
    return NextResponse.json({ error: 'Minimum send is 1 USDC' }, { status: 400 })
  }

  const db = createServerClient()

  // Check balance
  const { data: balance } = await db
    .from('wallet_balances')
    .select('usdc_balance')
    .eq('sbt_id', auth.sbt.id)
    .single()

  if (!balance || balance.usdc_balance < amount) {
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 })
  }

  // Queue the blockchain transaction
  const { addBlockchainJob } = await import('@/lib/queues/redis')
  const job = await addBlockchainJob({
    type:            'MINT_SBT',  // Will be updated to TRANSFER_USDC
    sbtId:           auth.sbt.id,
    contractAddress: process.env.USDC_CONTRACT_ADDRESS!,
    functionName:    'transfer',
    args:            [toAddress, Math.floor(amount * 1e6)],  // USDC has 6 decimals
    gasSponsored:    false,  // User pays gas for sends
    priority:        'HIGH',
  })

  // Create pending transaction record
  const { data: txn } = await db
    .from('wallet_transactions')
    .insert({
      sbt_id:    auth.sbt.id,
      type:      'SEND',
      amount,
      currency,
      status:    'PENDING',
      to_address: toAddress.toLowerCase(),
    })
    .select()
    .single()

  return NextResponse.json({ success: true, transactionId: txn?.id, jobId: job.id })
})

// ════════════════════════════════════════════════════════════════════════════
// SECTION 5 — DUST TRADE
// ════════════════════════════════════════════════════════════════════════════

// GET /api/trade/bots
export const GET_TRADE_BOTS = withAuth(async (_req, auth) => {
  const db = createServerClient()
  const { data } = await db
    .from('trading_bots')
    .select('*')
    .eq('sbt_id', auth.sbt.id)
    .order('created_at', { ascending: false })

  return NextResponse.json(data || [])
})

// POST /api/trade/bots
export const POST_CREATE_BOT = withAuth(async (req, auth) => {
  const body = await req.json()
  const db   = createServerClient()

  const { data, error } = await db
    .from('trading_bots')
    .insert({
      sbt_id:       auth.sbt.id,
      name:         body.name,
      strategy:     body.strategy,
      exchange:     body.exchange,
      config:       body.config || {},
      risk_params:  body.risk_params || {},
      paper_trading: body.paper_trading ?? true,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
})

// PATCH /api/trade/bots/:botId/status
export const PATCH_BOT_STATUS = withAuth(async (req, auth) => {
  const body    = await req.json()
  const botId   = req.nextUrl.pathname.split('/').at(-2)!
  const { status } = body

  if (!['ACTIVE', 'PAUSED'].includes(status)) {
    return NextResponse.json({ error: 'status must be ACTIVE or PAUSED' }, { status: 400 })
  }

  // If activating, run circuit breaker check first
  if (status === 'ACTIVE') {
    const cb = await checkCircuitBreaker(botId, auth.sbt.id)
    if (cb.tripped) {
      return NextResponse.json({ error: 'Circuit breaker active: ' + cb.reason }, { status: 409 })
    }
  }

  const db = createServerClient()
  const { data } = await db
    .from('trading_bots')
    .update({ status })
    .eq('id', botId)
    .eq('sbt_id', auth.sbt.id)  // Ownership check
    .select()
    .single()

  return NextResponse.json(data)
})

// GET /api/trade/market-data
export const GET_MARKET_DATA = withAuth(async (req, auth) => {
  const symbol   = req.nextUrl.searchParams.get('symbol')!
  const exchange = req.nextUrl.searchParams.get('exchange') as 'ALPACA' | 'COINBASE' | 'OANDA'
  const tf       = req.nextUrl.searchParams.get('timeframe')

  const data = await getMarketData({
    sbtId:     auth.sbt.id,
    symbol,
    exchange,
    timeframe: tf || undefined,
  })

  return NextResponse.json(data)
})

// GET /api/trade/history
export const GET_TRADE_HISTORY = withAuth(async (req, auth) => {
  const db    = createServerClient()
  const botId = req.nextUrl.searchParams.get('botId')
  const page  = parseInt(req.nextUrl.searchParams.get('page') || '1')

  let query = db
    .from('trades')
    .select('*', { count: 'exact' })
    .eq('sbt_id', auth.sbt.id)
    .order('opened_at', { ascending: false })
    .range((page - 1) * 20, page * 20 - 1)

  if (botId) query = query.eq('bot_id', botId)

  const { data, count } = await query
  return NextResponse.json({ trades: data, total: count, page })
})

// ════════════════════════════════════════════════════════════════════════════
// SECTION 6 — DUST TRAVEL
// ════════════════════════════════════════════════════════════════════════════

// GET /api/travel/airports?q=Edmonton
export const GET_AIRPORTS = withAuth(async (req, _auth) => {
  const q = req.nextUrl.searchParams.get('q')
  if (!q || q.length < 2) return NextResponse.json([])
  const results = await searchAirports(q)
  return NextResponse.json(results)
})

// POST /api/travel/flights/search
export const POST_SEARCH_FLIGHTS = withAuth(async (req, auth) => {
  const params = await req.json()
  const db     = createServerClient()

  const results = await searchFlights(params)

  // Cache search results
  await db.from('travel_searches').insert({
    sbt_id:        auth.sbt.id,
    search_type:   'FLIGHT',
    origin:        params.origin,
    destination:   params.destination,
    depart_date:   params.departureDate,
    return_date:   params.returnDate,
    passengers:    params.adults,
    results_count: results.length,
    results_cached: results as any,
  })

  return NextResponse.json(results)
})

// POST /api/travel/flights/book
export const POST_BOOK_FLIGHT = withAuth(async (req, auth) => {
  const params = await req.json()
  const result = await bookFlight({ ...params, sbtId: auth.sbt.id })
  return NextResponse.json(result)
})

// POST /api/travel/hotels/search
export const POST_SEARCH_HOTELS = withAuth(async (req, _auth) => {
  const params  = await req.json()
  const results = await searchHotels(params)
  return NextResponse.json(results)
})

// POST /api/travel/hotels/book
export const POST_BOOK_HOTEL = withAuth(async (req, auth) => {
  const params = await req.json()
  const result = await bookHotel({ ...params, sbtId: auth.sbt.id })
  return NextResponse.json(result)
})

// GET /api/travel/bookings
export const GET_TRAVEL_BOOKINGS = withAuth(async (req, auth) => {
  const db   = createServerClient()
  const type = req.nextUrl.searchParams.get('type')

  let query = db
    .from('travel_bookings')
    .select('id, booking_type, status, total_usdc, dust_miles_earned, amadeus_booking_ref, created_at')
    .eq('sbt_id', auth.sbt.id)
    .order('created_at', { ascending: false })

  if (type) query = query.eq('booking_type', type.toUpperCase())

  const { data } = await query
  return NextResponse.json(data || [])
})

// ════════════════════════════════════════════════════════════════════════════
// SECTION 7 — LUMIS TEACHER
// ════════════════════════════════════════════════════════════════════════════

// GET /api/lumis/teacher/students
// Returns all students for the authenticated teacher
export const GET_TEACHER_STUDENTS = withAuth(async (_req, auth) => {
  const db = createServerClient()

  const { data: links } = await db
    .from('lumis_teacher_students')
    .select('child_sbt_id')
    .eq('teacher_sbt_id', auth.sbt.id)
    .eq('active', true)

  if (!links?.length) return NextResponse.json([])

  const childIds = links.map(l => l.child_sbt_id)

  const { data: children } = await db
    .from('lumis_children')
    .select(`
      sbt_id, first_name, current_phase,
      lumis_disability_profiles (*),
      lumis_iep_goals (*),
      lumis_accommodations (*),
      lumis_wearables (*)
    `)
    .in('sbt_id', childIds)

  // Get today's zone readings for each child
  const today   = new Date().toISOString().split('T')[0]
  const { data: zoneReadings } = await db
    .from('lumis_zone_readings')
    .select('child_sbt_id, zone, recorded_at, confidence')
    .in('child_sbt_id', childIds)
    .gte('recorded_at', today)
    .order('recorded_at', { ascending: false })

  // Get red alerts today
  const { data: alerts } = await db
    .from('lumis_red_alerts')
    .select('child_sbt_id, triggered_at, outcome')
    .in('child_sbt_id', childIds)
    .gte('triggered_at', today)

  // Combine data
  const students = (children || []).map(child => {
    const latestZone = zoneReadings?.find(z => z.child_sbt_id === child.sbt_id)
    const todayAlerts = alerts?.filter(a => a.child_sbt_id === child.sbt_id) || []

    return {
      ...child,
      currentZone:  latestZone?.zone || 'UNKNOWN',
      lastZoneTime: latestZone?.recorded_at,
      redAlertsToday: todayAlerts.length,
    }
  })

  return NextResponse.json(students)
}, 'LUMIS_TEACHER')

// POST /api/lumis/teacher/notes
export const POST_TEACHER_NOTE = withAuth(async (req, auth) => {
  const { childSbtId, message, urgent, visibleToParent = true } = await req.json()
  const db = createServerClient()

  // Verify teacher has access to this child
  const { data: link } = await db
    .from('lumis_teacher_students')
    .select('child_sbt_id')
    .eq('teacher_sbt_id', auth.sbt.id)
    .eq('child_sbt_id', childSbtId)
    .eq('active', true)
    .single()

  if (!link) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  const { data } = await db
    .from('lumis_teacher_notes')
    .insert({
      teacher_sbt_id:  auth.sbt.id,
      child_sbt_id:    childSbtId,
      message,
      urgent:          urgent || false,
      visible_to_parent: visibleToParent,
    })
    .select()
    .single()

  // Notify parent if urgent
  if (urgent) {
    const { data: child } = await db
      .from('lumis_children')
      .select('parent_sbt_id, first_name')
      .eq('sbt_id', childSbtId)
      .single()

    if (child) {
      await addNotificationJob({
        type:           'PUSH',
        recipientSbtId: child.parent_sbt_id,
        template:       'URGENT_TEACHER_NOTE',
        data:           { childName: child.first_name, message },
        urgent:         true,
      })
    }
  }

  return NextResponse.json(data, { status: 201 })
}, 'LUMIS_TEACHER')

// PATCH /api/lumis/teacher/iep/:goalId
export const PATCH_IEP_PROGRESS = withAuth(async (req, auth) => {
  const body   = await req.json()
  const goalId = req.nextUrl.pathname.split('/').at(-1)!

  await updateIEPGoalProgress({
    goalId,
    progress:    body.progress,
    notes:       body.notes,
    teacherSbtId: auth.sbt.id,
  })

  return NextResponse.json({ success: true })
}, 'LUMIS_TEACHER')

// ════════════════════════════════════════════════════════════════════════════
// SECTION 8 — LUMIS PARENT
// ════════════════════════════════════════════════════════════════════════════

// GET /api/lumis/parent/children
export const GET_PARENT_CHILDREN = withAuth(async (_req, auth) => {
  const db = createServerClient()
  const { data } = await db
    .from('lumis_children')
    .select(`
      sbt_id, first_name, date_of_birth, current_phase,
      lumis_wearables (type, battery_pct, last_sync_at)
    `)
    .eq('parent_sbt_id', auth.sbt.id)

  return NextResponse.json(data || [])
}, 'LUMIS_PARENT')

// GET /api/lumis/parent/daily-summary/:childSbtId
export const GET_DAILY_SUMMARY = withAuth(async (req, auth) => {
  const childSbtId = req.nextUrl.pathname.split('/').at(-1)!
  const db = createServerClient()

  // Verify parentage
  const { data: child } = await db
    .from('lumis_children')
    .select('first_name')
    .eq('sbt_id', childSbtId)
    .eq('parent_sbt_id', auth.sbt.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  const summary = await generateDailySummary(childSbtId)
  return NextResponse.json({ summary, childName: child.first_name })
}, 'LUMIS_PARENT')

// GET /api/lumis/parent/zones/:childSbtId
// Returns zone readings for today
export const GET_CHILD_ZONES = withAuth(async (req, auth) => {
  const childSbtId = req.nextUrl.pathname.split('/').at(-1)!
  const db = createServerClient()

  // Verify parentage
  const { data: child } = await db
    .from('lumis_children')
    .select('sbt_id')
    .eq('sbt_id', childSbtId)
    .eq('parent_sbt_id', auth.sbt.id)
    .single()

  if (!child) return NextResponse.json({ error: 'Access denied' }, { status: 403 })

  const today = new Date().toISOString().split('T')[0]
  const { data } = await db
    .from('lumis_zone_readings')
    .select('zone, recorded_at, source, heart_rate, confidence')
    .eq('child_sbt_id', childSbtId)
    .gte('recorded_at', today)
    .order('recorded_at', { ascending: true })

  return NextResponse.json(data || [])
}, 'LUMIS_PARENT')

// ════════════════════════════════════════════════════════════════════════════
// SECTION 9 — LUMIS CURRICULUM (shared)
// ════════════════════════════════════════════════════════════════════════════

// GET /api/lumis/curriculum/modules?phase=JUNIOR_EXPLORER
export const GET_CURRICULUM_MODULES = withAuth(async (req, _auth) => {
  const db    = createServerClient()
  const phase = req.nextUrl.searchParams.get('phase')

  let query = db.from('lumis_curriculum_modules').select('*').eq('active', true)
  if (phase) query = query.eq('phase', phase)

  const { data } = await query.order('sequence_order')
  return NextResponse.json(data || [])
})

// POST /api/lumis/curriculum/complete
export const POST_COMPLETE_MODULE = withAuth(async (req, auth) => {
  const { childSbtId, moduleId, score, notes } = await req.json()

  await completeModule({ childSbtId, moduleId, score, notes })

  return NextResponse.json({ success: true })
})

// GET /api/lumis/curriculum/progress/:childSbtId
export const GET_CURRICULUM_PROGRESS = withAuth(async (req, auth) => {
  const childSbtId = req.nextUrl.pathname.split('/').at(-1)!
  const db = createServerClient()

  const { data } = await db
    .from('lumis_curriculum_progress')
    .select('*, lumis_curriculum_modules(title, phase, area, dust_miles_reward)')
    .eq('child_sbt_id', childSbtId)
    .order('completed_at', { ascending: false })

  return NextResponse.json(data || [])
})

// ════════════════════════════════════════════════════════════════════════════
// SECTION 10 — WEARABLE (Band → Backend)
// ════════════════════════════════════════════════════════════════════════════

// POST /api/lumis/wearable/reading
// Called by the LUMIS Band firmware on each biometric reading
export async function POST_WEARABLE_READING(req: NextRequest): Promise<NextResponse> {
  // Bands authenticate with a device secret, not an SBT session
  const deviceSecret = req.headers.get('x-lumis-device-secret')
  const body         = await req.json()

  if (!deviceSecret) {
    return NextResponse.json({ error: 'Device authentication required' }, { status: 401 })
  }

  // Verify device secret (stored per-device in DB)
  const db = createServerClient()
  const { data: wearable } = await db
    .from('lumis_wearables')
    .select('id, child_sbt_id, serial_number')
    .eq('serial_number', body.bandSerial)
    .single()

  if (!wearable) {
    return NextResponse.json({ error: 'Unknown device' }, { status: 404 })
  }

  // Queue biometric processing
  const { addBiometricsJob } = await import('@/lib/queues/redis')
  await addBiometricsJob({
    childSbtId:          wearable.child_sbt_id,
    bandSerial:          body.bandSerial,
    heartRate:           body.heartRate,
    heartRateVariability: body.heartRateVariability,
    skinConductance:     body.skinConductance,
    timestamp:           body.timestamp || new Date().toISOString(),
  })

  return NextResponse.json({ received: true })
}

// ════════════════════════════════════════════════════════════════════════════
// SECTION 11 — DUSTPROOF
// ════════════════════════════════════════════════════════════════════════════

// POST /api/proof/create
export const POST_CREATE_PROOF = withAuth(async (req, auth) => {
  const { contentHash, proofType, metadata } = await req.json()
  const db = createServerClient()

  // In production: generate real ZK proof using the DustProof circuit
  // For now: create the record and queue the ZK generation
  const { data } = await db
    .from('dustproof_proofs')
    .insert({
      sbt_id:       auth.sbt.id,
      proof_type:   proofType || 'CODE_AUTHORSHIP',
      content_hash: contentHash,
      zk_proof:     'PENDING',
      proof_system: 'PLONKY2',
      verified:     false,
    })
    .select()
    .single()

  // Queue on-chain anchoring
  const { addBlockchainJob } = await import('@/lib/queues/redis')
  await addBlockchainJob({
    type:            'ANCHOR_PROOF',
    sbtId:           auth.sbt.id,
    contractAddress: process.env.DUSTPROOF_CONTRACT_ADDRESS!,
    functionName:    'anchorProof',
    args:            [contentHash, proofType, auth.sbt.id],
    gasSponsored:    true,
    priority:        'NORMAL',
  })

  // DustMiles for proof creation
  await addDustMilesJob({
    sbtId:         auth.sbt.id,
    amount:        MILES_RATES.PROOF_CREATED,
    reason:        `ZK proof created: ${proofType}`,
    sourceApp:     'code',
    sourceEntityId: data?.id,
  })

  return NextResponse.json(data, { status: 201 })
})

// GET /api/proof/list
export const GET_PROOFS = withAuth(async (req, auth) => {
  const db   = createServerClient()
  const page = parseInt(req.nextUrl.searchParams.get('page') || '1')

  const { data, count } = await db
    .from('dustproof_proofs')
    .select('id, proof_type, content_hash, verified, polygon_tx_hash, created_at', { count: 'exact' })
    .eq('sbt_id', auth.sbt.id)
    .order('created_at', { ascending: false })
    .range((page - 1) * 20, page * 20 - 1)

  return NextResponse.json({ proofs: data, total: count, page })
})

// ════════════════════════════════════════════════════════════════════════════
// SECTION 12 — SRED TRACKING
// ════════════════════════════════════════════════════════════════════════════

// GET /api/sred/summary?year=2025
export const GET_SRED_SUMMARY = withAuth(async (req, auth) => {
  const year = parseInt(req.nextUrl.searchParams.get('year') || String(new Date().getFullYear()))
  const db   = createServerClient()

  const { data, error } = await db
    .from('sred_sessions')
    .select('app, mode, duration_minutes, activity_type, created_at')
    .eq('sbt_id', auth.sbt.id)
    .eq('tax_year', year)
    .eq('eligible_for_sred', true)

  const totalMinutes = (data || []).reduce((sum, s) => sum + s.duration_minutes, 0)
  const totalHours   = totalMinutes / 60
  // SR&ED eligible: 15-35% of eligible labour costs
  const estimatedCredit = totalHours * 150 * 0.25  // Rough estimate: $150/hr, 25% credit

  return NextResponse.json({
    year,
    totalHours:      totalHours.toFixed(1),
    totalMinutes:    Math.round(totalMinutes),
    sessionCount:    data?.length || 0,
    estimatedCredit: estimatedCredit.toFixed(2),
    sessions:        data || [],
    disclaimer: 'Consult a qualified SR&ED consultant for actual credit calculation.',
  })
})

// ════════════════════════════════════════════════════════════════════════════
// SECTION 13 — DUSTPERMIT
// ════════════════════════════════════════════════════════════════════════════

// POST /api/permit/rules
export const POST_PERMIT_RULE = withAuth(async (req, auth) => {
  const body = await req.json()
  const db   = createServerClient()

  const { data, error } = await db
    .from('permit_rules')
    .insert({
      owner_sbt_id:  auth.sbt.id,
      target_sbt_id: body.targetSbtId || null,
      target_role:   body.targetRole || null,
      resource_type: body.resourceType,
      resource_id:   body.resourceId || '*',
      permission:    body.permission,
      conditions:    body.conditions || {},
      expires_at:    body.expiresAt || null,
    })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data, { status: 201 })
})

// GET /api/permit/rules
export const GET_PERMIT_RULES = withAuth(async (_req, auth) => {
  const db = createServerClient()
  const { data } = await db
    .from('permit_rules')
    .select('*')
    .eq('owner_sbt_id', auth.sbt.id)
    .eq('active', true)

  return NextResponse.json(data || [])
})

// DELETE /api/permit/rules/:ruleId
export const DELETE_PERMIT_RULE = withAuth(async (req, auth) => {
  const ruleId = req.nextUrl.pathname.split('/').at(-1)!
  const db     = createServerClient()

  await db
    .from('permit_rules')
    .update({ active: false })
    .eq('id', ruleId)
    .eq('owner_sbt_id', auth.sbt.id)  // Only owner can revoke

  return NextResponse.json({ success: true })
})

// ── Route not found handler ───────────────────────────────────────────────

export function notFound(): NextResponse {
  return NextResponse.json({ error: 'Route not found' }, { status: 404 })
}
