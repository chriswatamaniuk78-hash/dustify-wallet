
# Soul Wallet PWA — Complete File Manifest
## Dustify Technologies Corp · April 2026

### App Configuration
- `package.json` — 39 lines
- `tsconfig.json` — 24 lines
- `tailwind.config.ts` — 54 lines
- `postcss.config.js` — 6 lines
- `next.config.ts` — 114 lines
- `vercel.json` — 26 lines
- `.env.example` — 42 lines
- `.gitignore` — 36 lines

### PWA Assets
- `public/sw.js` — Service worker (caching, push, background sync)
- `public/manifest.json` — PWA manifest (shortcuts, screenshots, protocol handlers)
- `public/icons/` — 9 PNG icons (72–512px) + SVG source files

### Source Files (src/)
- `src/app/auth/login/page.tsx` — 1 lines
- `src/app/auth/mint/page.tsx` — 208 lines
- `src/app/dashboard/page.tsx` — 13 lines
- `src/app/gaming/page.tsx` — 16 lines
- `src/app/globals.css` — 204 lines
- `src/app/layout.tsx` — 130 lines
- `src/app/miles/page.tsx` — 16 lines
- `src/app/notifications/page.tsx` — 173 lines
- `src/app/offline/page.tsx` — 35 lines
- `src/app/onboard/page.tsx` — 360 lines
- `src/app/page.tsx` — 6 lines
- `src/app/receive/page.tsx` — 23 lines
- `src/app/redeem/page.tsx` — 23 lines
- `src/app/send/page.tsx` — 23 lines
- `src/app/settings/page.tsx` — 16 lines
- `src/app/trade/page.tsx` — 16 lines
- `src/app/travel/page.tsx` — 16 lines
- `src/app/vault/page.tsx` — 71 lines
- `src/components/auth/LoginPage.tsx` — 287 lines
- `src/components/dashboard/BalanceHero.tsx` — 173 lines
- `src/components/dashboard/BotStatusWidget.tsx` — 180 lines
- `src/components/dashboard/DashboardEnhanced.tsx` — 652 lines
- `src/components/dashboard/QuickApps.tsx` — 172 lines
- `src/components/dashboard/StatsRow.tsx` — 157 lines
- `src/components/dashboard/TransactionFeed.tsx` — 184 lines
- `src/components/gaming/DustGaming.tsx` — 226 lines
- `src/components/gaming/DustGamingUltimate.tsx` — 799 lines
- `src/components/gaming/DustGamingV3.tsx` — 1181 lines
- `src/components/gaming/MarketplaceAndKids.tsx` — 730 lines
- `src/components/gaming/TournamentAndCreator.tsx` — 592 lines
- `src/components/receive/ReceiveScreen.tsx` — 387 lines
- `src/components/redeem/RedeemFlow.tsx` — 564 lines
- `src/components/send/SendFlow.tsx` — 570 lines
- `src/components/settings/DustFeeAnalyzer.tsx` — 812 lines
- `src/components/settings/DustMilesRewards.tsx` — 888 lines
- `src/components/settings/SettingsAndMiles.tsx` — 407 lines
- `src/components/shell/ShellLayout.tsx` — 324 lines
- `src/components/trade/AutonomousTradingBot.tsx` — 991 lines
- `src/components/trade/AutonomousTradingBotFull.tsx` — 77 lines
- `src/components/trade/BotDashboard.tsx` — 378 lines
- `src/components/trade/BotSetupWizard.tsx` — 481 lines
- `src/components/trade/DustTrade.tsx` — 86 lines
- `src/components/trade/DustTradeV2.tsx` — 558 lines
- `src/components/trade/OptionsAndTax.tsx` — 423 lines
- `src/components/trade/PhantomFlowStrategy.tsx` — 574 lines
- `src/components/trade/PortfolioDashboard.tsx` — 372 lines
- `src/components/travel/ActivityFeed.tsx` — 148 lines
- `src/components/travel/DustTravel.tsx` — 494 lines
- `src/components/travel/DustTravelUltimate.tsx` — 886 lines
- `src/components/travel/DustTravelV2.tsx` — 675 lines
- `src/components/travel/DustTravelV3.tsx` — 4 lines
- `src/components/travel/FlightSearch.tsx` — 246 lines
- `src/components/travel/HotelSearch.tsx` — 492 lines
- `src/components/travel/InfluencerFeed.tsx` — 166 lines
- `src/components/ui/index.tsx` — 547 lines
- `src/components/vault/ChainActivityLog.tsx` — 222 lines
- `src/components/vault/CredentialsPanel.tsx` — 271 lines
- `src/components/vault/FileVault.tsx` — 616 lines
- `src/components/vault/SbtIdentityCard.tsx` — 404 lines
- `src/lib/api.ts` — 606 lines
- `src/lib/dustmiles-data.ts` — 265 lines
- `src/lib/gaming-data.ts` — 137 lines
- `src/lib/hooks.ts` — 404 lines
- `src/lib/mock-data.ts` — 220 lines
- `src/lib/trade-data.ts` — 230 lines
- `src/lib/travel-data.ts` — 222 lines
- `src/lib/vault-data.ts` — 349 lines
- `src/middleware.ts` — 37 lines
- `src/styles/globals.css` — 204 lines
- `src/types/index.ts` — 102 lines

### Documentation
- `CURSOR_INTEGRATION_GUIDE.md` — 10-step integration & deployment guide
- `FILE_MANIFEST.md` — This file

### System Reference Files (_system_reference/)
- `_system_reference/README.md` — 33 lines
- `_system_reference/backend/amadeus.ts` — 307 lines
- `_system_reference/backend/api-routes.ts` — 939 lines
- `_system_reference/backend/dustmiles.service.ts` — 275 lines
- `_system_reference/backend/executor.ts` — 514 lines
- `_system_reference/backend/middleware.ts` — 396 lines
- `_system_reference/backend/pq-crypto.ts` — 304 lines
- `_system_reference/contracts/DustMiles.sol` — 338 lines
- `_system_reference/contracts/DustPaymaster.sol` — 258 lines
- `_system_reference/contracts/DustSBT.sol` — 226 lines
- `_system_reference/security/IntelligenceGuard.ts` — 750 lines
- `_system_reference/security/StringHunter.ts` — 499 lines
