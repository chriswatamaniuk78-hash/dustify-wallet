# Soul Wallet — Dustify Technologies Corp

> Quantum-secure SBT super-app · Built in Alberta 🍁

## Sub-Apps

| App | Path | Description |
|-----|------|-------------|
| Dashboard | `/` | SBT identity, portfolio, rewards |
| Send / Receive | `/send` `/receive` | P2P transfers |
| Redeem | `/redeem` | Waterfall rewards (100 pts = 1 USDC) |
| SBT Vault | `/vault` | Document vault, ZK proofs |
| Dust Travel | `/travel` | AI travel with DustMiles |
| Dust Trade | `/trade` | Alpaca + Coinbase + OANDA |
| Dust Gaming | `/gaming` | On-chain gaming + DustMiles |

## Deploy to Vercel

1. Push repo to GitHub
2. Import to Vercel → Framework: **Next.js**
3. Add all env vars from `.env.example`
4. Set domain: `wallet.dustifytechnologiescorp.com`
5. Deploy

## DNS
```
CNAME  wallet  cname.vercel-dns.com
```

## Smart Contracts (Polygon Mainnet)
Deploy contracts in `/contracts` to Polygon before going live.  
Use Hardhat or Foundry. Set the deployed addresses in env vars.
