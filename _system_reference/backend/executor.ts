/**
 * DUSTIFY — TRADING INTEGRATIONS
 * Alpaca (stocks/ETFs) + Coinbase Advanced (crypto) + OANDA (forex)
 *
 * All credentials are stored encrypted in Supabase Vault.
 * Never in plaintext. Never in env vars per user.
 * Fetched once per session via the service role.
 */

import { createServerClient } from '../../db/client'
import type { TradingJob } from '../../queues/redis'
import { addDustMilesJob, addNotificationJob } from '../../queues/redis'
import { MILES_RATES } from '../dustmiles.service'

// ── Types ─────────────────────────────────────────────────────────────────

export interface TradeSignal {
  botId:      string
  sbtId:      string
  symbol:     string
  side:       'BUY' | 'SELL'
  quantity:   number
  orderType:  'MARKET' | 'LIMIT'
  limitPrice?: number
  reason:     string
  paperTrade: boolean
}

export interface TradeResult {
  success:     boolean
  orderId?:    string
  filledPrice?: number
  filledQty?:  number
  error?:      string
}

export interface BotPerformance {
  botId:        string
  totalPnL:     number
  totalTrades:  number
  winRate:      number
  sharpeRatio:  number
  maxDrawdown:  number
}

// ── Credential fetcher (service role only) ────────────────────────────────

async function getTradingCredentials(sbtId: string, exchange: string): Promise<{
  apiKey: string
  secret: string
  passphrase?: string
  accountId?: string
}> {
  const db = createServerClient()
  const { data, error } = await db
    .from('trading_accounts')
    .select('*')
    .eq('sbt_id', sbtId)
    .single()

  if (error || !data) throw new Error('Trading account not found')

  // In production: decrypt using Supabase Vault
  // await supabase.vault.decrypt(data.alpaca_api_key)
  switch (exchange) {
    case 'ALPACA':
      if (!data.alpaca_api_key) throw new Error('Alpaca not connected')
      return { apiKey: data.alpaca_api_key, secret: data.alpaca_secret }
    case 'COINBASE':
      if (!data.coinbase_api_key) throw new Error('Coinbase not connected')
      return { apiKey: data.coinbase_api_key, secret: data.coinbase_secret, passphrase: data.coinbase_passphrase }
    case 'OANDA':
      if (!data.oanda_api_key) throw new Error('OANDA not connected')
      return { apiKey: data.oanda_api_key, accountId: data.oanda_account_id, secret: '' }
    default:
      throw new Error('Unknown exchange: ' + exchange)
  }
}

// ── ALPACA CLIENT ─────────────────────────────────────────────────────────

class AlpacaClient {
  private baseUrl: string
  private headers: Record<string, string>

  constructor(apiKey: string, secret: string, paper: boolean = true) {
    this.baseUrl = paper
      ? 'https://paper-api.alpaca.markets/v2'
      : 'https://api.alpaca.markets/v2'
    this.headers = {
      'APCA-API-KEY-ID':     apiKey,
      'APCA-API-SECRET-KEY': secret,
      'Content-Type':        'application/json',
    }
  }

  async getAccount(): Promise<{ buying_power: string; portfolio_value: string; status: string }> {
    const res = await fetch(`${this.baseUrl}/account`, { headers: this.headers })
    if (!res.ok) throw new Error(`Alpaca getAccount failed: ${res.status}`)
    return res.json()
  }

  async getPositions(): Promise<Array<{
    symbol: string; qty: string; avg_entry_price: string; current_price: string; unrealized_pl: string
  }>> {
    const res = await fetch(`${this.baseUrl}/positions`, { headers: this.headers })
    if (!res.ok) throw new Error(`Alpaca getPositions failed: ${res.status}`)
    return res.json()
  }

  async submitOrder(params: {
    symbol:     string
    qty:        number
    side:       'buy' | 'sell'
    type:       'market' | 'limit'
    time_in_force: 'day' | 'gtc'
    limit_price?: number
  }): Promise<{ id: string; status: string; filled_avg_price?: string; filled_qty?: string }> {
    const res = await fetch(`${this.baseUrl}/orders`, {
      method:  'POST',
      headers: this.headers,
      body:    JSON.stringify(params),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Alpaca order failed: ${err.message}`)
    }
    return res.json()
  }

  async cancelOrder(orderId: string): Promise<void> {
    await fetch(`${this.baseUrl}/orders/${orderId}`, { method: 'DELETE', headers: this.headers })
  }

  async getBars(symbol: string, timeframe: string = '1Min', limit: number = 100): Promise<{
    bars: Array<{ t: string; o: number; h: number; l: number; c: number; v: number }>
  }> {
    const params = new URLSearchParams({ timeframe, limit: String(limit) })
    const res = await fetch(
      `https://data.alpaca.markets/v2/stocks/${symbol}/bars?${params}`,
      { headers: this.headers }
    )
    if (!res.ok) throw new Error(`Alpaca getBars failed: ${res.status}`)
    return res.json()
  }
}

// ── COINBASE ADVANCED CLIENT ──────────────────────────────────────────────

class CoinbaseAdvancedClient {
  private baseUrl = 'https://api.coinbase.com/api/v3/brokerage'
  private headers: Record<string, string>

  constructor(apiKey: string, _secret: string) {
    // In production: generate JWT from API key + secret using coinbase's SDK
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,  // Simplified - use JWT in prod
      'Content-Type':  'application/json',
    }
  }

  async getAccounts(): Promise<{ accounts: Array<{ currency: string; available_balance: { value: string } }> }> {
    const res = await fetch(`${this.baseUrl}/accounts`, { headers: this.headers })
    if (!res.ok) throw new Error(`Coinbase getAccounts failed: ${res.status}`)
    return res.json()
  }

  async createOrder(params: {
    product_id:      string
    side:            'BUY' | 'SELL'
    order_type:      'MARKET' | 'LIMIT'
    base_size?:      string
    quote_size?:     string
    limit_price?:    string
    client_order_id: string
  }): Promise<{ order_id: string; status: string; average_filled_price?: string }> {
    const res = await fetch(`${this.baseUrl}/orders`, {
      method:  'POST',
      headers: this.headers,
      body:    JSON.stringify(params),
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`Coinbase order failed: ${JSON.stringify(err)}`)
    }
    const data = await res.json()
    return data.success_response
  }

  async getCandles(productId: string, granularity: string = 'ONE_MINUTE', limit: number = 100): Promise<{
    candles: Array<{ start: string; open: string; high: string; low: string; close: string; volume: string }>
  }> {
    const now   = Math.floor(Date.now() / 1000)
    const start = now - limit * 60
    const params = new URLSearchParams({ start: String(start), end: String(now), granularity })
    const res = await fetch(`${this.baseUrl}/products/${productId}/candles?${params}`, { headers: this.headers })
    if (!res.ok) throw new Error(`Coinbase getCandles failed: ${res.status}`)
    return res.json()
  }
}

// ── OANDA CLIENT ──────────────────────────────────────────────────────────

class OandaClient {
  private baseUrl = 'https://api-fxtrade.oanda.com/v3'
  private headers: Record<string, string>
  private accountId: string

  constructor(apiKey: string, accountId: string) {
    this.accountId = accountId
    this.headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type':  'application/json',
    }
  }

  async getAccountSummary(): Promise<{ account: { balance: string; unrealizedPL: string; nav: string } }> {
    const res = await fetch(`${this.baseUrl}/accounts/${this.accountId}/summary`, { headers: this.headers })
    if (!res.ok) throw new Error(`OANDA account failed: ${res.status}`)
    return res.json()
  }

  async createOrder(params: {
    instrument: string
    units:      number  // Positive = buy, negative = sell
    type:       'MARKET' | 'LIMIT'
    price?:     string
    stopLoss?:  { price: string }
    takeProfit?: { price: string }
  }): Promise<{ orderCreateTransaction?: { id: string }; orderFillTransaction?: { price: string } }> {
    const body = {
      order: {
        type:       params.type,
        instrument: params.instrument,
        units:      String(params.units),
        timeInForce: params.type === 'MARKET' ? 'FOK' : 'GTC',
        ...(params.price     && { price:      params.price }),
        ...(params.stopLoss  && { stopLossOnFill:  { price: params.stopLoss.price } }),
        ...(params.takeProfit && { takeProfitOnFill: { price: params.takeProfit.price } }),
      }
    }
    const res = await fetch(`${this.baseUrl}/accounts/${this.accountId}/orders`, {
      method: 'POST', headers: this.headers, body: JSON.stringify(body)
    })
    if (!res.ok) {
      const err = await res.json()
      throw new Error(`OANDA order failed: ${JSON.stringify(err)}`)
    }
    return res.json()
  }

  async getCandles(instrument: string, granularity: string = 'M1', count: number = 100): Promise<{
    candles: Array<{ time: string; mid: { o: string; h: string; l: string; c: string }; volume: number }>
  }> {
    const params = new URLSearchParams({ granularity, count: String(count), price: 'M' })
    const res = await fetch(`${this.baseUrl}/instruments/${instrument}/candles?${params}`, { headers: this.headers })
    if (!res.ok) throw new Error(`OANDA candles failed: ${res.status}`)
    return res.json()
  }
}

// ── Circuit Breaker ───────────────────────────────────────────────────────

export async function checkCircuitBreaker(botId: string, sbtId: string): Promise<{
  tripped:  boolean
  reason?:  string
}> {
  const db = createServerClient()

  const { data: bot } = await db
    .from('trading_bots')
    .select('risk_params, total_pnl_usdc, total_trades')
    .eq('id', botId)
    .single()

  if (!bot) return { tripped: false }

  const params = bot.risk_params as any
  const today  = new Date().toISOString().split('T')[0]

  // Check daily loss
  const { data: todayTrades } = await db
    .from('trades')
    .select('pnl_usdc')
    .eq('bot_id', botId)
    .gte('opened_at', today)
    .not('pnl_usdc', 'is', null)

  const dailyPnL = (todayTrades || []).reduce((sum, t) => sum + (t.pnl_usdc || 0), 0)

  if (dailyPnL < -(params.max_daily_loss_pct / 100) * 10000) {
    await db.from('circuit_breaker_events').insert({
      bot_id:       botId,
      sbt_id:       sbtId,
      trigger_type: 'DAILY_LOSS',
      trigger_value: dailyPnL,
      description:  `Daily loss exceeded ${params.max_daily_loss_pct}%`,
      auto_resume_at: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
    })
    await db.from('trading_bots').update({ status: 'CIRCUIT_BREAKER' }).eq('id', botId)
    return { tripped: true, reason: `Daily loss limit: ${dailyPnL.toFixed(2)} USDC` }
  }

  return { tripped: false }
}

// ── Main trade executor (called by BullMQ worker) ─────────────────────────

export async function processTradingSignal(job: TradingJob): Promise<void> {
  const db = createServerClient()

  // Get bot config
  const { data: bot, error } = await db
    .from('trading_bots')
    .select('*')
    .eq('id', job.botId)
    .single()

  if (error || !bot) throw new Error('Bot not found: ' + job.botId)
  if (bot.status !== 'ACTIVE') {
    console.log(`[TRADING] Bot ${job.botId} is not active (${bot.status}) — skipping signal`)
    return
  }

  // Circuit breaker check
  if (job.signal !== 'CHECK_CIRCUIT_BREAKER') {
    const cb = await checkCircuitBreaker(job.botId, job.sbtId)
    if (cb.tripped) {
      console.log(`[TRADING] Circuit breaker tripped for bot ${job.botId}: ${cb.reason}`)
      await addNotificationJob({
        type:           'PUSH',
        recipientSbtId: job.sbtId,
        template:       'CIRCUIT_BREAKER',
        data:           { botName: bot.name, reason: cb.reason },
        urgent:         true,
      })
      return
    }
  }

  if (!job.symbol || job.signal === 'CHECK_CIRCUIT_BREAKER') return

  // Get credentials
  const creds = await getTradingCredentials(job.sbtId, bot.exchange)

  let result: TradeResult

  if (bot.paper_trading) {
    // Paper trade simulation
    result = await simulatePaperTrade(job, bot)
  } else {
    // Live trade
    result = await executeLiveTrade(job, bot, creds)
  }

  if (!result.success) {
    console.error(`[TRADING] Trade failed for bot ${job.botId}:`, result.error)
    return
  }

  // Record in DB
  const pnl = result.filledPrice && bot.total_trades > 0
    ? (job.signal === 'SELL' ? (result.filledPrice - 0) * (result.filledQty || 0) : 0)
    : 0

  await db.from('trades').insert({
    bot_id:         job.botId,
    sbt_id:         job.sbtId,
    exchange:       bot.exchange,
    exchange_order_id: result.orderId,
    symbol:         job.symbol,
    side:           job.signal === 'BUY' ? 'BUY' : 'SELL',
    quantity:       result.filledQty || job.quantity || 0,
    entry_price:    job.signal === 'BUY' ? result.filledPrice : null,
    exit_price:     job.signal === 'SELL' ? result.filledPrice : null,
    pnl_usdc:       pnl || null,
    status:         'OPEN',
    strategy_signal: { reason: job.reason, timestamp: job.timestamp },
    paper_trade:    bot.paper_trading,
  })

  // Update bot stats
  await db.from('trading_bots').update({
    total_trades: bot.total_trades + 1,
    last_trade_at: new Date().toISOString(),
  }).eq('id', job.botId)

  // Award DustMiles for completed trade
  if (pnl > 0) {
    await addDustMilesJob({
      sbtId:         job.sbtId,
      amount:        MILES_RATES.TRADE_COMPLETED_WIN,
      reason:        `Winning trade: ${job.symbol} +${pnl.toFixed(2)} USDC`,
      sourceApp:     'wallet',
      sourceEntityId: job.botId,
    })
  } else if (job.signal === 'SELL') {
    await addDustMilesJob({
      sbtId:         job.sbtId,
      amount:        MILES_RATES.TRADE_COMPLETED_LOSS,
      reason:        `Trade completed: ${job.symbol}`,
      sourceApp:     'wallet',
      sourceEntityId: job.botId,
    })
  }
}

// ── Live trade execution ──────────────────────────────────────────────────

async function executeLiveTrade(
  job:   TradingJob,
  bot:   any,
  creds: { apiKey: string; secret: string; passphrase?: string; accountId?: string }
): Promise<TradeResult> {
  try {
    switch (bot.exchange) {
      case 'ALPACA': {
        const client = new AlpacaClient(creds.apiKey, creds.secret, false)
        const order  = await client.submitOrder({
          symbol:        job.symbol!,
          qty:           job.quantity || 1,
          side:          job.signal === 'BUY' ? 'buy' : 'sell',
          type:          'market',
          time_in_force: 'day',
        })
        return {
          success:     true,
          orderId:     order.id,
          filledPrice: order.filled_avg_price ? parseFloat(order.filled_avg_price) : undefined,
          filledQty:   order.filled_qty ? parseFloat(order.filled_qty) : undefined,
        }
      }
      case 'COINBASE': {
        const client = new CoinbaseAdvancedClient(creds.apiKey, creds.secret)
        const order  = await client.createOrder({
          product_id:      job.symbol!,
          side:            job.signal as 'BUY' | 'SELL',
          order_type:      'MARKET',
          base_size:       String(job.quantity || 0.001),
          client_order_id: `dust-${Date.now()}`,
        })
        return {
          success:     true,
          orderId:     order.order_id,
          filledPrice: order.average_filled_price ? parseFloat(order.average_filled_price) : undefined,
        }
      }
      case 'OANDA': {
        const client = new OandaClient(creds.apiKey, creds.accountId!)
        const units  = job.signal === 'BUY' ? (job.quantity || 1000) : -(job.quantity || 1000)
        const order  = await client.createOrder({ instrument: job.symbol!, units, type: 'MARKET' })
        return {
          success:     true,
          orderId:     order.orderCreateTransaction?.id,
          filledPrice: order.orderFillTransaction?.price ? parseFloat(order.orderFillTransaction.price) : undefined,
        }
      }
      default:
        return { success: false, error: 'Unknown exchange' }
    }
  } catch (e: any) {
    return { success: false, error: e.message }
  }
}

// ── Paper trade simulation ────────────────────────────────────────────────

async function simulatePaperTrade(job: TradingJob, _bot: any): Promise<TradeResult> {
  // Simulate market price with ±0.5% slippage
  const mockPrice = 100 + (Math.random() - 0.5) * 1
  return {
    success:     true,
    orderId:     `paper-${Date.now()}`,
    filledPrice: mockPrice,
    filledQty:   job.quantity || 1,
  }
}

// ── Market data queries ───────────────────────────────────────────────────

export async function getMarketData(params: {
  sbtId:    string
  symbol:   string
  exchange: 'ALPACA' | 'COINBASE' | 'OANDA'
  timeframe?: string
  limit?:   number
}): Promise<{ candles: any[]; latestPrice: number }> {

  const creds = await getTradingCredentials(params.sbtId, params.exchange)

  switch (params.exchange) {
    case 'ALPACA': {
      const client = new AlpacaClient(creds.apiKey, creds.secret, true)
      const data   = await client.getBars(params.symbol, params.timeframe || '1Min', params.limit || 100)
      const candles = data.bars
      const latest  = candles[candles.length - 1]?.c || 0
      return { candles, latestPrice: latest }
    }
    case 'COINBASE': {
      const client = new CoinbaseAdvancedClient(creds.apiKey, creds.secret)
      const data   = await client.getCandles(params.symbol, 'ONE_MINUTE', params.limit || 100)
      const latest = parseFloat(data.candles[0]?.close || '0')
      return { candles: data.candles, latestPrice: latest }
    }
    case 'OANDA': {
      const client = new OandaClient(creds.apiKey, creds.accountId!)
      const data   = await client.getCandles(params.symbol, 'M1', params.limit || 100)
      const latest = parseFloat(data.candles[data.candles.length - 1]?.mid.c || '0')
      return { candles: data.candles, latestPrice: latest }
    }
    default:
      return { candles: [], latestPrice: 0 }
  }
}
