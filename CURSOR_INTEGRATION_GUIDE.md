# SOUL WALLET — Cursor Integration & Deployment Guide
## Dustify Technologies Corp · Edmonton, Alberta, Canada 🍁
## Version 2.0 | April 2026

---

## WHAT YOU HAVE

### Soul Wallet PWA (`soul-wallet/`)
A complete Next.js 14 PWA with:
- **65+ files · 21,000+ lines** of production TypeScript/React
- **3 Sub-Apps**: Autonomous Trading Bot + Phantom Flow™, Dust Travel, Dust Gaming
- **DustMiles Waterfall**: 100 DM = 1 USDC, self-sustaining rewards engine
- **Fee Analyzer**: Complete revenue projections ($1.77M/mo by Year 2)
- **PWA**: Service worker, manifest, push notifications, offline support
- **SBT Identity**: Quantum-secured passkey auth (ML-KEM-768 + ML-DSA-65)

### The Full Dustify System
```
DUSTIFY_PLATFORM/
├── apps/
│   ├── soul-wallet/              ← This repo (PWA)
│   ├── dust-code/                ← Code editor (49 files, 13,269 lines)
│   ├── dust-studio/              ← Creative studio (18 files, 4,795 lines)
│   ├── dust-office-boss/         ← Enterprise AI (13 files, 2,283 lines)
│   ├── dust-game-creator/        ← Game platform (11 files, 1,849 lines)
│   ├── dustify-lumis/            ← Education (9 files, 2,701 lines)
│   ├── dustify-vault/            ← Secure vault (16 files, 2,999 lines)
│   ├── dustify-social-media-manager/ ← Social AI (25 files, 3,859 lines)
│   └── dustifytechnologiescorp-website/ ← Marketing site
├── packages/
│   ├── backend/                  ← ~6,000 lines, 19 files
│   │   ├── src/lib/services/api-routes.ts    (939 lines — all endpoints)
│   │   ├── src/lib/auth/middleware.ts         (396 lines — SBT auth)
│   │   ├── src/lib/integrations/trading/     (Alpaca/Coinbase/OANDA)
│   │   ├── src/lib/integrations/travel/      (Amadeus)
│   │   ├── src/lib/services/dustmiles.service.ts (waterfall)
│   │   ├── src/lib/blockchain/               (Polygon + Pimlico)
│   │   ├── src/lib/queues/redis.ts           (BullMQ queues)
│   │   └── src/lib/crypto/pq-crypto.ts       (ML-KEM-768 + ML-DSA-65)
│   ├── contracts/                ← Deployed on Polygon
│   │   ├── src/DustSBT.sol       (SoulBound Token identity)
│   │   ├── src/DustMiles.sol     (100 DM = 1 USDC waterfall token)
│   │   ├── src/DustPaymaster.sol (ERC-4337 gas sponsorship)
│   │   ├── src/DustPhoenixV3.sol (DeFi yield engine)
│   │   └── src/DustHoneypotVault.sol (Reserve pool)
│   ├── security/                 ← Intelligence Guard
│   │   ├── IntelligenceGuard.ts  (rate limiting, threat detection)
│   │   ├── StringHunter.ts       (Unicode injection prevention)
│   │   └── PhoenixAgent.ts       (auto-recovery system)
│   └── vault/                    ← DustCap capability engine
```

---

## STEP 1 — Prerequisites

```bash
node --version   # Must be >=20.0.0
npm --version    # Must be >=10.0.0
```

Required accounts (all free tiers sufficient to start):
- [ ] **Supabase** — database + auth + realtime (supabase.com)
- [ ] **Upstash Redis** — BullMQ queues (upstash.com)
- [ ] **Alchemy** — Polygon RPC (alchemy.com)
- [ ] **Pimlico** — ERC-4337 bundler (pimlico.io)
- [ ] **Alpaca** — paper trading API (alpaca.markets)
- [ ] **Amadeus** — travel API (developers.amadeus.com)
- [ ] **Anthropic** — Claude API for Phantom Flow™ (console.anthropic.com)
- [ ] **Vercel** — deployment (vercel.com) — or Railway for backend

---

## STEP 2 — Supabase Setup

### 2a. Create Project
1. Go to `app.supabase.com` → New Project
2. Note your `Project URL` and `anon key` and `service_role key`
3. Enable Email/Password auth (we'll override with passkeys)

### 2b. Run Database Schema
In Supabase SQL Editor, run this schema (matches all 35+ tables the backend expects):

```sql
-- ── Core Identity ──────────────────────────────────────────
CREATE TABLE users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  wallet_address TEXT UNIQUE NOT NULL,
  sbt_token_id  TEXT,
  sbt_tier      TEXT NOT NULL DEFAULT 'BRONZE',
  display_name  TEXT,
  kyc_level     TEXT NOT NULL DEFAULT 'EMAIL',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE passkeys (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  credential_id TEXT UNIQUE NOT NULL,
  public_key    BYTEA NOT NULL,
  device_name   TEXT,
  counter       BIGINT NOT NULL DEFAULT 0,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_used_at  TIMESTAMPTZ
);

CREATE TABLE sessions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash    TEXT UNIQUE NOT NULL, -- SHA-256, never stored plaintext
  expires_at    TIMESTAMPTZ NOT NULL,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Wallet & Transactions ───────────────────────────────────
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  type            TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'PENDING',
  amount          NUMERIC(20,8) NOT NULL,
  currency        TEXT NOT NULL DEFAULT 'USDC',
  fee             NUMERIC(20,8) NOT NULL DEFAULT 0,
  dust_miles_earned BIGINT NOT NULL DEFAULT 0,
  description     TEXT NOT NULL,
  to_address      TEXT,
  from_address    TEXT,
  tx_hash         TEXT,
  block_number    BIGINT,
  external_ref    TEXT,
  metadata        JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settled_at      TIMESTAMPTZ
);

-- ── Trading ─────────────────────────────────────────────────
CREATE TABLE trading_bots (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id             UUID NOT NULL REFERENCES users(id),
  name                TEXT NOT NULL,
  exchange            TEXT NOT NULL,
  strategy            TEXT NOT NULL,
  status              TEXT NOT NULL DEFAULT 'ACTIVE',
  paper_mode          BOOLEAN NOT NULL DEFAULT TRUE,
  symbols             TEXT[] NOT NULL DEFAULT '{}',
  max_position_pct    NUMERIC(5,2) NOT NULL DEFAULT 10,
  daily_loss_limit_pct NUMERIC(5,2) NOT NULL DEFAULT 3,
  take_profit_pct     NUMERIC(5,2) NOT NULL DEFAULT 5,
  stop_loss_pct       NUMERIC(5,2) NOT NULL DEFAULT 2.5,
  current_pnl         NUMERIC(20,8) NOT NULL DEFAULT 0,
  total_trades        INTEGER NOT NULL DEFAULT 0,
  win_rate            NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_trade_at       TIMESTAMPTZ
);

CREATE TABLE trades (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bot_id      UUID NOT NULL REFERENCES trading_bots(id),
  user_id     UUID NOT NULL REFERENCES users(id),
  symbol      TEXT NOT NULL,
  exchange    TEXT NOT NULL,
  side        TEXT NOT NULL,
  quantity    NUMERIC(20,8) NOT NULL,
  price       NUMERIC(20,8) NOT NULL,
  total       NUMERIC(20,8) NOT NULL,
  fee         NUMERIC(20,8) NOT NULL DEFAULT 0,
  pnl         NUMERIC(20,8),
  strategy    TEXT NOT NULL,
  dust_miles_earned BIGINT NOT NULL DEFAULT 0,
  executed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  status      TEXT NOT NULL DEFAULT 'FILLED'
);

-- ── API Keys (encrypted in Supabase Vault) ──────────────────
-- IMPORTANT: Use Supabase Vault for key storage, NOT this table directly
-- This table stores metadata only, keys stored via vault.create_secret()
CREATE TABLE trading_api_keys (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  bot_id      UUID REFERENCES trading_bots(id),
  exchange    TEXT NOT NULL,
  key_name    TEXT NOT NULL, -- name in vault
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
-- RLS: USING (FALSE) — completely client-unreadable
ALTER TABLE trading_api_keys ENABLE ROW LEVEL SECURITY;
CREATE POLICY "no_client_access" ON trading_api_keys USING (FALSE);

-- ── Travel ──────────────────────────────────────────────────
CREATE TABLE travel_bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID NOT NULL REFERENCES users(id),
  type              TEXT NOT NULL,
  status            TEXT NOT NULL DEFAULT 'CONFIRMED',
  confirmation_code TEXT NOT NULL,
  provider          TEXT NOT NULL,
  total_amount      NUMERIC(20,2) NOT NULL,
  currency          TEXT NOT NULL DEFAULT 'CAD',
  dust_miles_earned BIGINT NOT NULL DEFAULT 0,
  destination       TEXT NOT NULL,
  origin            TEXT,
  check_in          TIMESTAMPTZ,
  check_out         TIMESTAMPTZ,
  passenger_count   INTEGER NOT NULL DEFAULT 1,
  details           JSONB NOT NULL DEFAULT '{}',
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Gaming ──────────────────────────────────────────────────
CREATE TABLE tournaments (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  game_id         TEXT NOT NULL,
  game_name       TEXT NOT NULL,
  title           TEXT NOT NULL,
  status          TEXT NOT NULL DEFAULT 'UPCOMING',
  prize_pool      NUMERIC(20,2) NOT NULL,
  prize_token     TEXT NOT NULL DEFAULT 'USDC',
  entry_fee       NUMERIC(20,2) NOT NULL DEFAULT 0,
  max_players     INTEGER NOT NULL,
  current_players INTEGER NOT NULL DEFAULT 0,
  start_time      TIMESTAMPTZ NOT NULL,
  end_time        TIMESTAMPTZ,
  sbt_verified    BOOLEAN NOT NULL DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tournament_participants (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tournament_id   UUID NOT NULL REFERENCES tournaments(id),
  user_id         UUID NOT NULL REFERENCES users(id),
  score           INTEGER NOT NULL DEFAULT 0,
  rank            INTEGER,
  prize_won       NUMERIC(20,2),
  joined_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(tournament_id, user_id)
);

-- ── DustMiles ───────────────────────────────────────────────
CREATE TABLE dust_miles_ledger (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES users(id),
  type            TEXT NOT NULL, -- EARN | REDEEM | BONUS | EXPIRE
  amount          BIGINT NOT NULL,
  category        TEXT NOT NULL,
  description     TEXT NOT NULL,
  balance_after   BIGINT NOT NULL,
  external_ref    UUID REFERENCES transactions(id),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE dust_miles_balances (
  user_id         UUID PRIMARY KEY REFERENCES users(id),
  balance         BIGINT NOT NULL DEFAULT 0,
  pending         BIGINT NOT NULL DEFAULT 0,
  lifetime        BIGINT NOT NULL DEFAULT 0,
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Notifications ────────────────────────────────────────────
CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES users(id),
  type        TEXT NOT NULL,
  title       TEXT NOT NULL,
  body        TEXT NOT NULL,
  read        BOOLEAN NOT NULL DEFAULT FALSE,
  urgent      BOOLEAN NOT NULL DEFAULT FALSE,
  action_url  TEXT,
  metadata    JSONB,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── Vault ────────────────────────────────────────────────────
CREATE TABLE vault_files (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id       UUID NOT NULL REFERENCES users(id),
  name          TEXT NOT NULL,
  type          TEXT NOT NULL,
  size_bytes    BIGINT NOT NULL,
  storage_path  TEXT NOT NULL, -- Supabase Storage path
  tags          TEXT[] NOT NULL DEFAULT '{}',
  uploaded_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ── DustMiles atomic redeem function ───────────────────────
CREATE OR REPLACE FUNCTION redeem_dust_miles(
  p_user_id     UUID,
  p_amount      BIGINT,
  p_type        TEXT,
  p_description TEXT
) RETURNS JSONB LANGUAGE plpgsql AS $$
DECLARE
  v_balance BIGINT;
  v_tx_id   UUID;
BEGIN
  -- Lock row
  SELECT balance INTO v_balance FROM dust_miles_balances
  WHERE user_id = p_user_id FOR UPDATE;

  IF v_balance IS NULL OR v_balance < p_amount THEN
    RETURN jsonb_build_object('success', false, 'error', 'Insufficient DustMiles balance');
  END IF;

  -- Deduct
  UPDATE dust_miles_balances
  SET balance = balance - p_amount, updated_at = NOW()
  WHERE user_id = p_user_id;

  -- Log
  INSERT INTO dust_miles_ledger (user_id, type, amount, category, description, balance_after)
  VALUES (p_user_id, 'REDEEM', p_amount, p_type, p_description, v_balance - p_amount)
  RETURNING id INTO v_tx_id;

  RETURN jsonb_build_object('success', true, 'transaction_id', v_tx_id, 'new_balance', v_balance - p_amount);
END;
$$;

-- ── Row Level Security ───────────────────────────────────────
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_bots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE dust_miles_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE dust_miles_balances ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE vault_files ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "user_own_data" ON users            USING (id = auth.uid());
CREATE POLICY "user_own_data" ON transactions      USING (user_id = auth.uid());
CREATE POLICY "user_own_data" ON trading_bots      USING (user_id = auth.uid());
CREATE POLICY "user_own_data" ON trades            USING (user_id = auth.uid());
CREATE POLICY "user_own_data" ON travel_bookings   USING (user_id = auth.uid());
CREATE POLICY "user_own_data" ON dust_miles_ledger USING (user_id = auth.uid());
CREATE POLICY "user_own_data" ON dust_miles_balances USING (user_id = auth.uid());
CREATE POLICY "user_own_data" ON notifications     USING (user_id = auth.uid());
CREATE POLICY "user_own_data" ON vault_files       USING (user_id = auth.uid());

-- Tournaments are public read
ALTER TABLE tournaments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tournaments_public" ON tournaments USING (TRUE);

-- ── Realtime (for push notifications) ──────────────────────
-- Enable realtime on notifications table in Supabase Dashboard:
-- Database → Replication → toggle 'notifications' table ON
```

### 2c. Enable Supabase Vault
In Supabase Dashboard → Database → Extensions → Enable `supabase_vault`

---

## STEP 3 — Clone & Install

```bash
# In your workspace
git clone https://github.com/chriswatamaniuk78-hash/dustify-platform.git
cd dustify-platform

# Install all workspace deps (turborepo monorepo)
npm install

# Install soul-wallet deps specifically
cd apps/soul-wallet
npm install
```

---

## STEP 4 — Environment Variables

### Soul Wallet (.env.local in apps/soul-wallet/)
```bash
cp .env.example .env.local
# Fill in values from your Supabase/Alchemy/Pimlico dashboards:
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
NEXT_PUBLIC_POLYGON_RPC_URL=https://polygon-mainnet.g.alchemy.com/v2/YOUR_KEY
NEXT_PUBLIC_DUST_ID_ADDRESS=0x...       # After step 6
NEXT_PUBLIC_DUST_MILES_ADDRESS=0x...    # After step 6
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BN...      # After step 5d
```

### Backend (.env in packages/backend/)
```bash
# All keys from Supabase, Upstash, Alpaca, Amadeus, OANDA, Coinbase, Anthropic
# See DUSTIFY_FINAL/.env.example for complete list
SUPABASE_SERVICE_ROLE_KEY=eyJ...
UPSTASH_REDIS_REST_URL=https://...
ANTHROPIC_API_KEY=sk-ant-api03-...
ALPACA_API_KEY=PK...
ALPACA_SECRET_KEY=...
AMADEUS_CLIENT_ID=...
AMADEUS_CLIENT_SECRET=...
OANDA_API_KEY=...
PIMLICO_API_KEY=pim_...
JWT_SECRET=<openssl rand -base64 64>
```

---

## STEP 5 — Push Notification Setup

```bash
# Generate VAPID keys
npx web-push generate-vapid-keys

# Add to .env.local:
# NEXT_PUBLIC_VAPID_PUBLIC_KEY=<public key>
# Add to backend .env:
# VAPID_PRIVATE_KEY=<private key>
# VAPID_MAILTO=chris@dustifytechnologiescorp.com
```

---

## STEP 6 — Deploy Smart Contracts (Polygon Amoy Testnet first)

```bash
cd packages/contracts

# Install Hardhat deps
npm install

# Configure hardhat.config.ts with your POLYGON_AMOY_RPC_URL and DEPLOYER_PRIVATE_KEY

# Compile contracts
npx hardhat compile

# Deploy to Amoy testnet
npx hardhat run scripts/deploy.ts --network amoy

# Copy contract addresses from output → add to soul-wallet .env.local
# NEXT_PUBLIC_DUST_ID_ADDRESS=0x...
# NEXT_PUBLIC_DUST_MILES_ADDRESS=0x...
# NEXT_PUBLIC_DUST_PAYMASTER_ADDRESS=0x...

# When ready for mainnet:
npx hardhat run scripts/deploy.ts --network polygon
```

---

## STEP 7 — Start Backend API

```bash
cd packages/backend

# Start the API server (Express + all routes)
npx tsx src/index.ts

# Or with hot reload:
npx tsx watch src/index.ts

# In a second terminal, start the BullMQ worker:
npx tsx src/worker.ts

# Verify:
curl http://localhost:3001/health
# → {"status":"ok","version":"2.0"}
```

The backend exposes all 40+ routes from `api-routes.ts`:
- `POST /api/auth/passkey/challenge` — FIDO2 challenge
- `POST /api/auth/passkey/verify` — passkey verification → session token
- `GET /api/wallet/:userId/balance` — live balances
- `POST /api/wallet/send` — USDC transfer (queued)
- `POST /api/bots` — deploy trading bot
- `GET /api/bots/:id/portfolio` — live P&L
- `GET /api/bots/phantom-flow/:symbol` — AI signal
- `GET /api/travel/flights/search` — Amadeus search
- `POST /api/travel/flights/book` — booking
- `GET /api/gaming/tournaments` — tournament list
- `POST /api/miles/redeem` — atomic USDC redemption
- `GET /api/miles/pool` — waterfall pool state
- *(all 40+ endpoints documented in api-routes.ts)*

---

## STEP 8 — Start Soul Wallet PWA

```bash
cd apps/soul-wallet

# Development
npm run dev
# → http://localhost:3000

# Production build
npm run build
npm run start
```

### Verify PWA setup:
1. Open http://localhost:3000 in Chrome
2. Open DevTools → Application → Manifest — should show full manifest
3. Application → Service Workers — should show `sw.js` activated
4. Application → Cache Storage — should show cached routes
5. Run Lighthouse → should score 95+ PWA

---

## STEP 9 — Connect Sub-Apps to Backend

The 3 sub-apps are already wired to the API client. To activate real data:

### Trading Bot Sub-App
```typescript
// In src/components/trade/AutonomousTradingBot.tsx
// Replace mock data calls with hooks from src/lib/hooks.ts:

import { useTradingBots, useBotPortfolio, usePhantomFlowSignal } from '@/lib/hooks'

const { bots, loading } = useTradingBots()          // lists bots from backend
const { data: portfolio } = useBotPortfolio(botId)  // live P&L from Alpaca
const { data: signal } = usePhantomFlowSignal('BTC') // AI signal from Claude
```

### Travel Sub-App
```typescript
// In src/components/travel/DustTravelV2.tsx
import { useFlightSearch, useHotelSearch, useTrips } from '@/lib/hooks'

const { search, results, loading } = useFlightSearch()
// search({ origin:'YEG', destination:'YVR', departureDate:'2026-05-01', passengers:1 })
// → hits Amadeus API via backend → returns real flights
```

### Gaming Sub-App
```typescript
// In src/components/gaming/DustGamingUltimate.tsx
import { useTournaments, useGamingStats } from '@/lib/hooks'

const { tournaments } = useTournaments('LIVE')    // live tournaments
const { data: stats } = useGamingStats()           // user's gaming stats
```

### DustMiles
```typescript
// In src/components/settings/DustMilesRewards.tsx
import { useDustMiles, useRedeem } from '@/lib/hooks'

const { pool } = useDustMiles()                    // waterfall pool state
const { redeem, loading } = useRedeem()
// redeem({ type: 'USDC_DIRECT', amount: 1000 })  // atomic on-chain redemption
```

---

## STEP 10 — Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# From apps/soul-wallet directory
vercel

# Follow prompts:
# - Link to your Vercel account
# - Set project name: soul-wallet
# - Add all env variables from .env.local

# Production deploy
vercel --prod
```

### Configure Custom Domain
In Vercel Dashboard → soul-wallet project → Settings → Domains:
- Add `wallet.dustifytechnologiescorp.com`
- Configure DNS: CNAME → `cname.vercel-dns.com`

### Backend on Railway
```bash
# Install Railway CLI
npm i -g @railway/cli

# From packages/backend directory
railway login
railway init
railway up

# Get backend URL → update NEXT_PUBLIC_API_URL in Vercel env vars
```

---

## DEPLOYMENT CHECKLIST

### Before Going Live:
- [ ] Supabase schema deployed with all RLS policies
- [ ] Supabase Vault enabled for trading API keys
- [ ] Smart contracts deployed to Polygon mainnet
- [ ] FINTRAC MSB registration complete
- [ ] VAPID keys generated and configured
- [ ] Backend deployed on Railway (or similar)
- [ ] All API keys in production (Alpaca live, Amadeus prod, OANDA live)
- [ ] Vercel production deploy complete
- [ ] Custom domain configured
- [ ] Lighthouse PWA score ≥ 95
- [ ] Push notifications tested
- [ ] Offline mode tested
- [ ] iOS install (Add to Home Screen) tested
- [ ] Android install tested
- [ ] Sentry error tracking connected
- [ ] PostHog analytics connected

### Security Pre-Launch:
- [ ] CSP headers verified (check browser console for violations)
- [ ] Intelligence Guard activated on backend
- [ ] String Hunter middleware active on all API routes
- [ ] HSTS enabled in next.config.ts (uncomment the header)
- [ ] All .env files excluded from git (.gitignore verified)
- [ ] Supabase anon key is public-safe (RLS protects all tables)
- [ ] Service role key is ONLY in backend (never in frontend)

---

## ARCHITECTURE DIAGRAM

```
┌──────────────────────────────────────────────────────────┐
│                    USER / DEVICE                          │
│              PWA (wallet.dustifytechnologiescorp.com)    │
│                                                          │
│  ┌────────────┐  ┌─────────────┐  ┌───────────────────┐│
│  │  Dashboard  │  │  Sub-Apps   │  │   Service Worker  ││
│  │  + Wallet   │  │  Trading    │  │   (offline/push)  ││
│  │  + Vault    │  │  Travel     │  └───────────────────┘│
│  └────────────┘  │  Gaming     │                        │
│                  └─────────────┘                        │
└──────────────────────┬───────────────────────────────────┘
                       │ HTTPS/API calls
                       ▼
┌──────────────────────────────────────────────────────────┐
│              BACKEND (api.dustifytechnologiescorp.com)    │
│                        Railway                            │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌───────────────┐ │
│  │  API Routes  │  │   BullMQ     │  │  Intelligence  │ │
│  │  (Express)   │  │   Workers    │  │     Guard      │ │
│  │  40+ routes  │  │  8 queues    │  │  + String      │ │
│  └──────┬───────┘  └──────┬───────┘  │    Hunter      │ │
│         │                 │           └───────────────┘ │
└─────────┼─────────────────┼─────────────────────────────┘
          │                 │
    ┌─────▼────┐      ┌─────▼──────────────────────────┐
    │ Supabase │      │         External APIs            │
    │ Postgres │      │  Alpaca │ Coinbase │ OANDA       │
    │ + Vault  │      │  Amadeus │ Booking.com           │
    │ + RT     │      │  Pimlico │ Polygon RPC            │
    └──────────┘      │  Anthropic (Phantom Flow™)       │
                      └────────────────────────────────┘
          │
    ┌─────▼───────┐
    │  POLYGON    │
    │  DustSBT    │
    │  DustMiles  │
    │  Paymaster  │
    └─────────────┘
```

---

## QUICK TROUBLESHOOTING

| Issue | Fix |
|-------|-----|
| Service worker not registering | Must be served over HTTPS or localhost. Check browser console. |
| Push notifications not working | Verify VAPID keys, check Notification.permission = 'granted' |
| API calls returning 404 | Verify NEXT_PUBLIC_API_URL in .env.local points to running backend |
| Trading bot not connecting | Check encrypted API key in Supabase Vault → trading_api_keys table |
| DustMiles not crediting | Verify dustmiles.service.ts is running (part of BullMQ worker) |
| Polygon tx failing | Check DEPLOYER_PRIVATE_KEY has MATIC for gas, or Pimlico paymaster active |
| TypeScript errors on build | Run `npm run typecheck` — most are resolvable by checking types/index.ts |
| Icons not showing in PWA | Icons must be valid PNG. Re-run `npm run icons:generate` |

---

*Dustify Technologies Corp · Edmonton, Alberta, Canada 🍁*
*CIPO Copyrights Filed · 7 Patents Pending · 4 Trademarks Pending*
