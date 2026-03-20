# Codex Context — Dungeons & Agents

> Read this file at the start of every session.
> Check all linked docs. The ## Claude Insights sections have the latest state and next actions.
> Last updated: 2026-03-20 05:45 IST

---

## Project Identity

**Name:** Dungeons & Agents (Stackshub / stacks2d)
**Pitch:** "The Stacks ecosystem, made playable. An agentic sandbox for simulated worlds, wallets and transactions."
**Hackathon:** DoraHacks Stacks Build Battle — submission deadline 2026-03-20
**Repo:** `git@github.com:retroverse404/---stacks2d-dungeons-agents.git`

---

## Live Deployments

| Service | URL | Status |
|---|---|---|
| Frontend | https://stackshub.space | ✅ Live |
| Convex backend | https://zealous-bobcat-847.convex.cloud | ✅ Live |
| x402 API | https://stackshub-x402-api.onrender.com | ✅ Live (free tier — ping /health to wake) |
| x402 Health | https://stackshub-x402-api.onrender.com/health | Check before every session |

---

## Branches

| Branch | Purpose |
|---|---|
| `release/dungeons-and-agents` | **Submission branch — do not touch after submission** |
| `feature/turnkey-embedded-wallet` | Post-submission Turnkey integration |
| `main` | Base |

---

## Key Docs (read in this order)

1. **[submission/submission.json](../submission/submission.json)** — verified claims, agent wallets, contract addresses, pending evidence
2. **[submission/demo-checklist.md](../submission/demo-checklist.md)** — what's done and what's pending for submission
3. **[docs/Dungeons-and-Agents.md](Dungeons-and-Agents.md)** — pitch, demo loop, agent table, world pillars
4. **[docs/Stacks-Implementation-Status.md](Stacks-Implementation-Status.md)** — what's deployed vs scaffolded
5. **[docs/Turnkey-Integration-Plan.md](Turnkey-Integration-Plan.md)** — post-submission embedded wallet plan, "pay it forward" economy, World Ledger page
6. **[docs/Artifacts-NFT-Plan.md](Artifacts-NFT-Plan.md)** — wax cylinder / cassette / floppy disk NFT pipeline, WorldLabs GLB vision, Arweave storage
7. **[docs/deploymet.md](deploymet.md)** — Convex, Render, Vercel env vars and deployment workflow

---

## The Five Agents

| Agent | Wallet | Role | Premium action |
|---|---|---|---|
| guide.btc | ST3P76BS18H1QZN8HCQKYRHRAT9GC2XTJ0GZ0HWXE | Knowledge | Premium briefings (1 STX) |
| market.btc | ST3EGPYCJ8JTC9QETJHM2T47ZCCWNM9VX98ZEPXWT | Market | Live quotes (0.001 STX) |
| Mel | ST3YJTXH81SR6YPSG59RBJDBV5H2DD164Y1855ZK5 | Curator | Wax cylinder memory (1 STX) |
| Toma | STXE8MZ5Y35646XT8MEXHJZ3YKWS20CSE31NP92R | Merchant | Tips new players 2 STX ("pay it forward") |
| quests.btc | ST19P5Y1XSYNNYM8JM6QDX95BAP7659742WF0FEQ2 | Quests | Bounties and quest rewards |

---

## Deployed Contracts (Stacks Testnet)

| Contract | Address | Status |
|---|---|---|
| premium-access-v2 | ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.premium-access-v2 | ✅ Live — called on every x402 payment |
| world-lobby | ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.world-lobby | Deployed, not yet wired |
| world-objects | ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.world-objects | Deployed, not yet wired |
| wax-cylinder-nft | ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.wax-cylinder-nft | Deployed, mint pending |
| cassette-nft | ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.cassette-nft | Deployed, mint pending |
| floppy-disk-nft | ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.floppy-disk-nft | Deployed, mint pending |
| qtc-token | ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.qtc-token | Deployed, not yet integrated |
| sft-items | ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.sft-items | Deployed, not yet integrated |

---

## Immediate Priorities (2026-03-20)

- [ ] Capture guide.btc premium txid on live app
- [ ] Capture market.btc premium txid on live app
- [ ] Capture Mel premium txid on live app
- [ ] Screenshot World Feed showing premium-access-granted
- [ ] Record demo video (stackshub.space)
- [ ] Update submission/submission.json with txids + video URL + live URL
- [ ] Submit on DoraHacks
- [ ] Revoke exposed GitHub token ([REVOKED])

---

## Post-Submission Priorities

1. **Turnkey embedded wallet** — `feature/turnkey-embedded-wallet` branch
   - Passkey login (Face ID / Touch ID), no browser extension needed
   - Toma tips new players 2 STX on first login ("pay it forward")
   - x402 payments signed via Turnkey — works on iPad/mobile
   - Reference: `/home/rv404/Dev/finding-nakamoto/sbtc-cool-turnkey-stacks-demo`

2. **World Ledger page** — `/ledger` route
   - Live World Events feed
   - Agent earnings leaderboard
   - On-chain proof panel with Hiro explorer links
   - Frontend-only — all data already in Convex

3. **Artifact NFTs** — wax cylinder first
   - Artwork (Midjourney/Canva) → Arweave upload → mint to deployer wallet
   - Wire mint to Mel x402 success callback
   - WorldLabs GLB as the `animation_url` in metadata

---

## Tech Stack Quick Reference

| Layer | Technology |
|---|---|
| Frontend | Vanilla TypeScript + PixiJS v8 + Vite |
| Backend | Convex (serverless DB + functions + real-time) |
| Auth | @convex-dev/auth (email/password + GitHub OAuth) |
| Payments | x402-stacks protocol (Express.js service on Render) |
| AI | Braintrust proxy → Gemini 2.5 Flash |
| Blockchain | Stacks testnet + Clarity 4 |
| Wallet | @stacks/connect (Leather/Xverse) — Turnkey coming post-submission |

---

## Claude Insights — 2026-03-20 05:45 IST

- This file is the single entry point for all Codex sessions — always read this first
- The submission deadline is today (2026-03-20) — demo video and txids are the critical blockers
- `premium-access-v2` is the only contract fully wired into gameplay — all others are deployed but not integrated
- The x402 → Clarity proof loop is the core demo claim — everything else is direction
- Turnkey adds the missing "wallet" pillar to the pitch: worlds ✅ + wallets (coming) + transactions ✅
- NFT artifacts are post-hackathon but the contracts are deployed — show Hiro explorer links in the video as proof
- User is a creative (video/audio/visual) — the demo video is their strongest asset, prioritize getting them to that step
- Toma's "pay it forward" is the cultural framing of the agent economy — preserve this in all UX copy
- All session notes include ## Claude Insights with timestamps so future sessions have full context
- Codex: if submission checklist above is incomplete, help complete it before anything else
