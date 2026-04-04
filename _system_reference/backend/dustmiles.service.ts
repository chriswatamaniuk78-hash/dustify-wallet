/**
 * DUSTMILES WATERFALL REWARDS SERVICE
 *
 * 100 points = 1 USDC
 * Every qualifying action across all 5 apps earns DustMiles.
 * 70/30 split: 70% to the SBT holder, 30% stays on platform.
 *
 * This service is called by the BullMQ worker — never directly
 * from an API route. Always enqueue first.
 */

import { createServerClient } from '../db/client'
import type { DustMilesJob } from '../queues/redis'

export const MILES_RATES = {
  // Soul Wallet
  SEND_USDC:               5,
  RECEIVE_USDC:            2,
  // Dust Trade
  TRADE_COMPLETED_WIN:    50,
  TRADE_COMPLETED_LOSS:   10,  // Small consolation — you tried
  BOT_DAILY_ACTIVE:        5,
  // Dust Travel
  BOOKING_FLIGHT:        100,
  BOOKING_HOTEL:          50,
  BOOKING_CAR:            25,
  // Dust Gaming
  GAME_WIN:               30,
  GAME_LOSS:               5,
  GAME_DAILY_PLAY:        10,
  // Dust Code (SCRAPPY modes)
  SCRAPPY_FAST:            5,
  SCRAPPY_AUTO:           10,
  SCRAPPY_RESEARCH:       15,
  SCRAPPY_CODE:           20,
  SCRAPPY_SECURITY:       20,
  SCRAPPY_DEEP:           25,
  SCRAPPY_ZK:             30,
  SCRAPPY_SRED:           50,
  // LUMIS
  LUMIS_WACKY_RED_SESSION: 10,
  LUMIS_MODULE_COMPLETED:  20,
  LUMIS_BADGE_EARNED:     100,
  LUMIS_IEP_GOAL_MET:     200,
  // DustProof
  PROOF_CREATED:           25,
  PROOF_VERIFIED:          10,
  // Platform actions
  SBT_MINTED:            500,  // Welcome bonus
  PROFILE_COMPLETED:      50,
  REFERRAL:              200,
} as const

const WATERFALL_SPLIT = { holder: 0.70, platform: 0.30 }
const USDC_PER_POINT  = 0.01  // 100 pts = 1 USDC

// ── Main award function (called by worker) ────────────────────────────────

export async function processDustMilesAward(job: DustMilesJob): Promise<void> {
  const db = createServerClient()

  // Use a database transaction for atomic balance update
  const { data, error } = await db.rpc('award_dust_miles', {
    p_sbt_id:          job.sbtId,
    p_amount:          job.amount,
    p_reason:          job.reason,
    p_source_app:      job.sourceApp,
    p_source_entity_id: job.sourceEntityId || null,
    p_metadata:        job.metadata || {},
  })

  if (error) {
    console.error('[DUSTMILES] Award failed:', error.message, job)
    throw new Error('DustMiles award failed: ' + error.message)
  }

  console.log(`[DUSTMILES] Awarded ${job.amount} miles to ${job.sbtId} for "${job.reason}" (balance: ${data?.balance_after})`)

  // Check for milestone notifications
  if (data?.balance_after) {
    await checkMilestones(job.sbtId, data.balance_after, db)
  }
}

// ── DB function for atomic award ──────────────────────────────────────────
// This is called as a Supabase RPC function

export const AWARD_MILES_SQL = `
CREATE OR REPLACE FUNCTION award_dust_miles(
  p_sbt_id          UUID,
  p_amount          INTEGER,
  p_reason          TEXT,
  p_source_app      TEXT,
  p_source_entity_id UUID DEFAULT NULL,
  p_metadata        JSONB DEFAULT '{}'
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_current_balance BIGINT;
  v_new_balance     BIGINT;
  v_usdc_value      NUMERIC(18,6);
BEGIN
  -- Get current balance with row lock
  SELECT balance INTO v_current_balance
  FROM dust_miles_accounts
  WHERE sbt_id = p_sbt_id
  FOR UPDATE;

  -- Create account if doesn't exist
  IF NOT FOUND THEN
    INSERT INTO dust_miles_accounts (sbt_id, balance, lifetime_earned)
    VALUES (p_sbt_id, 0, 0)
    ON CONFLICT (sbt_id) DO NOTHING;

    v_current_balance := 0;
  END IF;

  v_new_balance := v_current_balance + p_amount;
  v_usdc_value  := p_amount::NUMERIC / 100.0;

  -- Update account
  UPDATE dust_miles_accounts
  SET
    balance          = v_new_balance,
    lifetime_earned  = lifetime_earned + GREATEST(p_amount, 0),
    lifetime_redeemed = lifetime_redeemed + ABS(LEAST(p_amount, 0)),
    updated_at       = NOW()
  WHERE sbt_id = p_sbt_id;

  -- Record the event
  INSERT INTO dust_miles_events (
    sbt_id,
    amount,
    balance_after,
    event_type,
    source_app,
    reason,
    source_entity_id,
    waterfall_split,
    usdc_value,
    metadata
  ) VALUES (
    p_sbt_id,
    p_amount,
    v_new_balance,
    CASE WHEN p_amount >= 0 THEN 'EARN' ELSE 'REDEEM' END,
    p_source_app,
    p_reason,
    p_source_entity_id,
    '{"holder": 0.70, "platform": 0.30}'::JSONB,
    v_usdc_value,
    p_metadata
  );

  RETURN jsonb_build_object(
    'balance_after', v_new_balance,
    'amount',        p_amount,
    'usdc_value',    v_usdc_value
  );
END;
$$;
`

// ── Redemption ────────────────────────────────────────────────────────────

export async function redeemDustMiles(params: {
  sbtId:      string
  amount:     number    // In points
  reason:     string
  sourceApp:  string
}): Promise<{ success: boolean; usdcRedeemed: number; newBalance: number }> {

  const db = createServerClient()

  // Check sufficient balance
  const { data: account } = await db
    .from('dust_miles_accounts')
    .select('balance')
    .eq('sbt_id', params.sbtId)
    .single()

  if (!account || account.balance < params.amount) {
    return { success: false, usdcRedeemed: 0, newBalance: account?.balance || 0 }
  }

  const { data } = await db.rpc('award_dust_miles', {
    p_sbt_id:     params.sbtId,
    p_amount:     -params.amount,  // Negative = redeem
    p_reason:     params.reason,
    p_source_app: params.sourceApp,
  })

  const usdcRedeemed = params.amount / 100

  return {
    success:      true,
    usdcRedeemed,
    newBalance:   data?.balance_after || 0,
  }
}

// ── Balance query ─────────────────────────────────────────────────────────

export async function getDustMilesBalance(sbtId: string): Promise<{
  balance:         number
  lifetimeEarned:  number
  lifetimeRedeemed: number
  usdcValue:       number
}> {
  const db = createServerClient()
  const { data } = await db
    .from('dust_miles_accounts')
    .select('balance, lifetime_earned, lifetime_redeemed')
    .eq('sbt_id', sbtId)
    .single()

  return {
    balance:          data?.balance || 0,
    lifetimeEarned:   data?.lifetime_earned || 0,
    lifetimeRedeemed: data?.lifetime_redeemed || 0,
    usdcValue:        (data?.balance || 0) / 100,
  }
}

// ── Recent events ─────────────────────────────────────────────────────────

export async function getRecentMilesEvents(sbtId: string, limit: number = 20) {
  const db = createServerClient()
  const { data } = await db
    .from('dust_miles_events')
    .select('*')
    .eq('sbt_id', sbtId)
    .order('created_at', { ascending: false })
    .limit(limit)

  return data || []
}

// ── Milestone notifications ───────────────────────────────────────────────

const MILESTONES = [100, 500, 1000, 5000, 10000, 50000, 100000]

async function checkMilestones(
  sbtId:         string,
  currentBalance: number,
  db:             ReturnType<typeof createServerClient>
): Promise<void> {
  // Check if we just crossed any milestone
  const crossed = MILESTONES.filter(m => {
    // We crossed it if balance >= milestone and (balance - award) < milestone
    // We don't have the award amount here easily, so just check if balance is exactly
    // near a milestone (within the last award size)
    return currentBalance >= m && currentBalance < m + 100
  })

  if (crossed.length === 0) return

  const { addNotificationJob } = await import('../queues/redis')
  for (const milestone of crossed) {
    await addNotificationJob({
      type:           'IN_APP',
      recipientSbtId: sbtId,
      template:       'MILES_MILESTONE',
      data: {
        milestone,
        usdcValue: milestone / 100,
        balance:   currentBalance,
      },
      urgent: false,
    })
  }
}
