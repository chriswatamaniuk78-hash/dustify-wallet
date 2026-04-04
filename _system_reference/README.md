# Soul Wallet — System Reference Files

These are copies of the backend/contracts/security files that the Soul Wallet
integrates with. They are here for reference during Cursor development.

## Backend API (`backend/`)
- `api-routes.ts` — All 40+ API endpoints (939 lines). This is the source of truth
  for what URLs the `src/lib/api.ts` client calls.
- `middleware.ts` — SBT-based session authentication (SHA-256 token hashing)
- `executor.ts` — Trading engine: Alpaca/Coinbase/OANDA with circuit breaker
- `amadeus.ts` — Amadeus travel API integration
- `dustmiles.service.ts` — Waterfall rewards engine
- `pq-crypto.ts` — Post-quantum ML-KEM-768 + ML-DSA-65 wrapper

## Smart Contracts (`contracts/`)
- `DustSBT.sol` — SoulBound Token: non-transferable identity NFT on Polygon
- `DustMiles.sol` — Reward token: 100 DM = 1 USDC (immutable, on-chain)
- `DustPaymaster.sol` — ERC-4337 gas sponsorship (free gas for users)

## Security (`security/`)
- `IntelligenceGuard.ts` — Rate limiting, threat detection, request scoring
- `StringHunter.ts` — Unicode injection + prompt injection prevention

## Integration Points
The Soul Wallet's `src/lib/api.ts` calls all backend endpoints.
The Soul Wallet's `src/lib/hooks.ts` wraps them in React hooks.
Components import hooks — not the API client directly.

## Development Flow
1. Run backend: `cd packages/backend && npx tsx src/index.ts`
2. Run wallet: `cd apps/soul-wallet && npm run dev`
3. Set `NEXT_PUBLIC_API_URL=http://localhost:3001` in `.env.local`
4. All API calls go through the Next.js proxy to avoid CORS
