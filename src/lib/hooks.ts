// ============================================================
// SOUL WALLET — React Hooks
// All hooks connect to the API client layer (src/lib/api.ts)
// ============================================================
'use client'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

import { useState, useEffect, useCallback, useRef } from 'react'
import {
  WalletAPI, TradingAPI, TravelAPI, GamingAPI, DustMilesAPI,
  NotificationsAPI, subscribeRealtime, getSessionToken,
} from './api'

interface FlightsResponse { flights: unknown[]; priceSignal: unknown }

function pluck<K extends string>(data: unknown, key: K): unknown[] {
  if (data && typeof data === 'object' && key in data) return (data as Record<string, unknown[]>)[key] ?? []
  return []
}
function pluckNum<K extends string>(data: unknown, key: K): number {
  if (data && typeof data === 'object' && key in data) return (data as Record<string, number>)[key] ?? 0
  return 0
}

// ── Generic fetcher hook ──────────────────────────────────────
function useFetch<T>(
  fetcher: () => Promise<{ data: T | null; error: string | null }>,
  deps: unknown[] = [],
  options: { refetchMs?: number; enabled?: boolean } = {}
) {
  const [data, setData]       = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState<string | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const fetch = useCallback(async () => {
    setLoading(true)
    const res = await fetcher()
    setData(res.data)
    setError(res.error)
    setLoading(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  useEffect(() => {
    if (options.enabled === false) return
    fetch()

    if (options.refetchMs) {
      timerRef.current = setInterval(fetch, options.refetchMs)
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetch, options.enabled])

  return { data, loading, error, refetch: fetch }
}

// ── useWalletBalance ──────────────────────────────────────────
export function useWalletBalance(userId: string) {
  return useFetch(
    () => WalletAPI.getBalance(userId),
    [userId],
    { refetchMs: 30_000, enabled: !!userId }
  )
}

// ── useTransactions ───────────────────────────────────────────
export function useTransactions(params: {
  page?: number
  limit?: number
  type?: string
} = {}) {
  return useFetch(
    () => WalletAPI.getTransactions(params),
    [params.page, params.limit, params.type],
    { enabled: !!getSessionToken() }
  )
}

// ── useSendUSDC ───────────────────────────────────────────────
export function useSendUSDC() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [txHash, setTxHash]   = useState<string | null>(null)

  const send = useCallback(async (payload: {
    toAddress: string
    amount: number
    note?: string
    sbtSignature: string
  }) => {
    setLoading(true)
    setError(null)
    setTxHash(null)

    const res = await WalletAPI.sendUSDC(payload)

    if (res.error) {
      setError(res.error)
    } else if (res.data) {
      setTxHash(res.data.txHash)
    }

    setLoading(false)
    return res
  }, [])

  return { send, loading, error, txHash }
}

// ── useTradingBots ────────────────────────────────────────────
export function useTradingBots() {
  const { data, loading, error, refetch } = useFetch(
    () => TradingAPI.listBots(),
    [],
    { refetchMs: 10_000, enabled: !!getSessionToken() }
  )
  return {
    bots: pluck(data, 'bots'),
    loading, error, refetch,
  }
}

// ── useBotPortfolio ───────────────────────────────────────────
export function useBotPortfolio(botId: string) {
  return useFetch(
    () => TradingAPI.getBotPortfolio(botId),
    [botId],
    { refetchMs: 5_000, enabled: !!botId }
  )
}

// ── usePhantomFlowSignal ──────────────────────────────────────
export function usePhantomFlowSignal(symbol: string) {
  return useFetch(
    () => TradingAPI.getPhantomFlowSignal(symbol),
    [symbol],
    { refetchMs: 60_000, enabled: !!symbol }
  )
}

// ── useBotControl ─────────────────────────────────────────────
export function useBotControl() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const setStatus = useCallback(async (
    botId: string,
    status: 'ACTIVE' | 'PAUSED'
  ) => {
    setLoading(true)
    setError(null)
    const res = await TradingAPI.setBotStatus(botId, status)
    if (res.error) setError(res.error)
    setLoading(false)
    return res
  }, [])

  return { setStatus, loading, error }
}

// ── useTravelSearch ───────────────────────────────────────────
export function useFlightSearch() {
  const [results, setResults]   = useState<unknown[]>([])
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState<string | null>(null)
  const [priceSignal, setPriceSignal] = useState<string | null>(null)

  const search = useCallback(async (params: {
    origin: string
    destination: string
    departureDate: string
    passengers: number
    cabinClass?: string
  }) => {
    setLoading(true)
    setError(null)
    const res = await TravelAPI.searchFlights(params)
    if (res.data) {
      setResults(pluck(res.data, 'flights'))
      setPriceSignal(res.data && typeof res.data === 'object' && 'priceSignal' in res.data ? (res.data as FlightsResponse).priceSignal : null)
    }
    if (res.error) setError(res.error)
    setLoading(false)
  }, [])

  return { search, results, loading, error, priceSignal }
}

export function useHotelSearch() {
  const [results, setResults] = useState<unknown[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)

  const search = useCallback(async (params: {
    destination: string
    checkIn: string
    checkOut: string
    guests: number
    rooms?: number
  }) => {
    setLoading(true)
    setError(null)
    const res = await TravelAPI.searchHotels(params)
    if (res.data) setResults(pluck(res.data, 'hotels'))
    if (res.error) setError(res.error)
    setLoading(false)
  }, [])

  return { search, results, loading, error }
}

// ── useTrips ──────────────────────────────────────────────────
export function useTrips() {
  const { data, loading, error, refetch } = useFetch(
    () => TravelAPI.getTrips(),
    [],
    { enabled: !!getSessionToken() }
  )
  return {
    trips: pluck(data, 'trips'),
    loading, error, refetch,
  }
}

// ── useTournaments ────────────────────────────────────────────
export function useTournaments(status?: 'UPCOMING' | 'LIVE' | 'COMPLETED') {
  const { data, loading, error, refetch } = useFetch(
    () => GamingAPI.getTournaments(status),
    [status],
    { refetchMs: 30_000 }
  )
  return {
    tournaments: pluck(data, 'tournaments'),
    loading, error, refetch,
  }
}

// ── useGamingStats ────────────────────────────────────────────
export function useGamingStats() {
  return useFetch(
    () => GamingAPI.getStats(),
    [],
    { enabled: !!getSessionToken() }
  )
}

// ── useDustMiles ──────────────────────────────────────────────
export function useDustMiles() {
  const balance = useFetch(
    () => DustMilesAPI.getEarnRates(),
    [],
    { refetchMs: 60_000 }
  )
  const pool = useFetch(
    () => DustMilesAPI.getPoolState(),
    [],
    { refetchMs: 120_000 }
  )
  return { balance, pool }
}

// ── useRedeem ─────────────────────────────────────────────────
export function useRedeem() {
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState<string | null>(null)
  const [receipt, setReceipt] = useState<unknown | null>(null)

  const redeem = useCallback(async (request: {
    type: 'USDC_DIRECT' | 'TRAVEL_CREDIT' | 'GAMING_CREDITS' | 'PARTNER_VOUCHER' | 'CHARITY' | 'REINVEST'
    amount: number
    targetWallet?: string
    partnerId?: string
  }) => {
    setLoading(true)
    setError(null)
    const res = await DustMilesAPI.redeem(request)
    if (res.data) setReceipt(res.data)
    if (res.error) setError(res.error)
    setLoading(false)
    return res
  }, [])

  return { redeem, loading, error, receipt }
}

// ── useNotifications ──────────────────────────────────────────
export function useNotifications() {
  const { data, loading, error, refetch } = useFetch(
    () => NotificationsAPI.getAll({ limit: 50 }),
    [],
    { refetchMs: 30_000 }
  )

  const markRead = useCallback(async (id: string) => {
    await NotificationsAPI.markRead(id)
    refetch()
  }, [refetch])

  const markAllRead = useCallback(async () => {
    await NotificationsAPI.markAllRead()
    refetch()
  }, [refetch])

  return {
    notifications: pluck(data, 'notifications'),
    unreadCount: pluckNum(data, 'unreadCount'),
    loading, error, markRead, markAllRead, refetch,
  }
}

// ── useRealtime ───────────────────────────────────────────────
export function useRealtime(
  userId: string,
  onEvent: (event: { type: string; payload: unknown }) => void
) {
  useEffect(() => {
    if (!userId) return
    const unsub = subscribeRealtime(userId, onEvent)
    return unsub
  }, [userId, onEvent])
}

// ── useInstallPWA ─────────────────────────────────────────────
export function useInstallPWA() {
  const [canInstall, setCanInstall] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // Check if already installed
    const mq = window.matchMedia('(display-mode: standalone)')
    setIsInstalled(mq.matches)
    mq.addEventListener('change', e => setIsInstalled(e.matches))

    // Listen for install prompt
    const handler = () => setCanInstall(true)
    window.addEventListener('pwa-install-available', handler)

    const w = window as Window & { __pwaInstallPrompt?: BeforeInstallPromptEvent }
    if (w.__pwaInstallPrompt) setCanInstall(true)

    return () => {
      window.removeEventListener('pwa-install-available', handler)
      mq.removeEventListener('change', e => setIsInstalled(e.matches))
    }
  }, [])

  const install = useCallback(async () => {
    const w = window as Window & { __pwaInstallPrompt?: BeforeInstallPromptEvent }
    const prompt = w.__pwaInstallPrompt
    if (!prompt) return false
    prompt.prompt()
    const { outcome } = await prompt.userChoice
    if (outcome === 'accepted') {
      setCanInstall(false)
      setIsInstalled(true)
    }
    return outcome === 'accepted'
  }, [])

  return { canInstall, isInstalled, install }
}

// ── usePushNotifications ──────────────────────────────────────
export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [subscribed, setSubscribed] = useState(false)

  useEffect(() => {
    if ('Notification' in window) {
      setPermission(Notification.permission)
    }
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        reg.pushManager.getSubscription().then(sub => {
          setSubscribed(!!sub)
        })
      })
    }
  }, [])

  const subscribe = useCallback(async () => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
      return { success: false, error: 'Push not supported' }
    }

    const perm = await Notification.requestPermission()
    setPermission(perm)
    if (perm !== 'granted') {
      return { success: false, error: 'Permission denied' }
    }

    const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY
    if (!vapidKey) return { success: false, error: 'VAPID key not configured' }

    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey,
    })

    const res = await NotificationsAPI.subscribePush(sub)
    if (res.data?.ok) {
      setSubscribed(true)
      return { success: true, error: null }
    }
    return { success: false, error: res.error }
  }, [])

  return { permission, subscribed, subscribe }
}
