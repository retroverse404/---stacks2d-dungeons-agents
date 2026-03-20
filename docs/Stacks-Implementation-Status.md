# Stacks Implementation Status

Updated: 2026-03-20

## Scope

This note records the current Stacks-related implementation state for `tinyrealms`.
It is an engineering status document, not a submission or positioning note.

## Verified Components

- Playable `tinyrealms` client with Convex-backed persistence
- Five named agent NPCs in the Cozy Cabin world:
  - `guide.btc` — ecosystem guide (villager-jane, patrol-surface)
  - `toma-merchant` — peddler (villager4, patrol-surface)
  - `market.btc` — market analyst (villager5, patrol-surface)
  - `quests.btc` — opportunity keeper (villager3, wander)
  - `mel-curator` — curator (villager2, patrol-surface)
- All 5 agents have seeded:
  - `agentRegistry` entry
  - `agentAccountBinding` (testnet wallet address)
  - `walletIdentity` record
  - `agentState` with AI budget policy (cooldown, daily limit, model hint)
- x402 payment rail fully wired for 5 premium surfaces:
  - `guide.btc` premium briefing → `/api/premium/guide-btc`
  - `guide.btc` bookshelf unlock → `/api/premium/guide-btc/bookshelf-brief`
  - `market.btc` live ALEX quote → `/api/premium/market-btc/quote`
  - Mel curator signal → `/api/premium/mel/signal`
  - Mel wax cylinder memory → `/api/premium/mel/wax-cylinder-memory`
- After each successful payment: `grant-access` call to `premium-access-v2` on testnet + world event logged
- In-world object interaction: E = free, X = premium (proximity-triggered, yields to NPC dialogue)
- Semantic objects with `premiumOfferKey`: bookshelf, phonograph
- 10-minute agent epoch loop in `convex/agents/runtime.ts`
- AI budget guardrails: per-agent cooldown and daily limit on Braintrust/model calls
- Braintrust is currently used as the proxy/gateway for LLM calls; system prompts live in repo code, not in a hosted Braintrust prompt registry

## Verified Payment Flows

- `guide.btc` x402 flow verified end-to-end on Stacks testnet:
  - `402 Payment Required` → wallet signs → signed retry → premium payload returned
- `market.btc` paid ALEX DEX quote verified on Stacks testnet:
  - funded testnet wallet → signed retry → `200 OK` → live quote returned
- Onchain proof: after payment, `grant-access` broadcasts to testnet → txid returned in response
- World Feed: `premium-access-granted` event visible in Convex after each payment

## Deployed Testnet Contracts

| Contract | Contract ID | Transaction |
|---|---|---|
| `premium-access-v2` | `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.premium-access-v2` | [`0x96afaf46c0e1ed8f86aceb0b0687fa6bdd284f9ea1366cd5437dc25901e969c3`](https://explorer.hiro.so/txid/0x96afaf46c0e1ed8f86aceb0b0687fa6bdd284f9ea1366cd5437dc25901e969c3?chain=testnet) |
| `world-lobby` | `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.world-lobby` | [`0xe411bff9d554b55f12a19c30fa4d278525f8c197f4deac3391cb4362b0e6d84f`](https://explorer.hiro.so/txid/e411bff9d554b55f12a19c30fa4d278525f8c197f4deac3391cb4362b0e6d84f?chain=testnet) |
| `world-objects` | `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.world-objects` | [`0x37518e87cdb28578cdc9c8afcd5ba42245fca3c45d2adda4b4dfbd0bea5d385f`](https://explorer.hiro.so/txid/37518e87cdb28578cdc9c8afcd5ba42245fca3c45d2adda4b4dfbd0bea5d385f?chain=testnet) |
| `floppy-disk-nft-v2` | `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.floppy-disk-nft-v2` | [`0xcca2941d4894f25b2ac1f68a0aa20b078237587d4406a751e48a167c1ecb6956`](https://explorer.hiro.so/txid/0xcca2941d4894f25b2ac1f68a0aa20b078237587d4406a751e48a167c1ecb6956?chain=testnet) |
| `cassette-nft-v2` | `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.cassette-nft-v2` | [`0x589305b8353192df54c642a6f408a53c488367a4057114661e0b90d6f5db403d`](https://explorer.hiro.so/txid/0x589305b8353192df54c642a6f408a53c488367a4057114661e0b90d6f5db403d?chain=testnet) |
| `wax-cylinder-nft-v2` | `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.wax-cylinder-nft-v2` | [`0x25a39a2005a51765c6a540436fd8b6efadc2191360347ad432af90364217ce74`](https://explorer.hiro.so/txid/0x25a39a2005a51765c6a540436fd8b6efadc2191360347ad432af90364217ce74?chain=testnet) |
| `qtc-token` | `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.qtc-token` | [`0x2a0ccf9cb5c22fcd16a0d8ff897c5fadf231cd41bf77558d49bd8f7d8ca032de`](https://explorer.hiro.so/txid/0x2a0ccf9cb5c22fcd16a0d8ff897c5fadf231cd41bf77558d49bd8f7d8ca032de?chain=testnet) |
| `sft-items` | `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.sft-items` | [`0xae0b7cb5b01fbd84acb5db5cf4501d9a49dcc06af4b73a1f664d583ca4952944`](https://explorer.hiro.so/txid/0xae0b7cb5b01fbd84acb5db5cf4501d9a49dcc06af4b73a1f664d583ca4952944?chain=testnet) |

## Deployed But Not Yet Integrated

- `qtc-token.clar`
  - SIP-010 fungible token for future in-game currency
  - deployed, but no live gameplay mint/spend loop is part of the current demo claim
- `sft-items.clar`
  - repeatable GameFi item/resource layer
  - deployed, but not yet wired into the current gameplay loop or seeded into the app runtime

## What Is Proven

- 5 autonomous agent NPCs live in the world with wallet identities and AI budget policies
- Stacks wallet interaction wired into the x402 payment flow
- After payment: `premium-access-v2.grant-access(resourceId, who)` called onchain
- Txid returned in every premium response — directly verifiable on Hiro explorer
- World Feed shows `premium-access-granted` events after each payment
- Clarity contracts (`premium-access-v2`, `world-lobby`, `world-objects`) deployed and callable from this repo
- `floppy-disk-nft-v2`, `cassette-nft-v2`, and `wax-cylinder-nft-v2` pass live read-only checks for owner principal, `get-last-token-id`, `get-owner(u1)`, and `get-token-uri(u1)`
- `qtc-token` and `sft-items` are now deployed on Stacks testnet from this repo
- In-world objects (bookshelf, phonograph) serve as physical payment terminals

## Current Boundaries

- `Convex` remains the system of record for world state, event propagation, and runtime coordination
- `services/x402-api` remains the payment boundary
- Clarity contracts are used for durable proof and access state, not for high-frequency world simulation
- Ambient NPC simulation is deterministic and cheap; LLM calls are bounded to premium surfaces
- SIP-009 artifact NFTs are deployed on testnet as the current `-v2` contracts, but mint/claim flows and wallet post-conditions are not wired yet
- `qtc-token` and `sft-items` are deployed, but no live GameFi economy should be claimed until minting, seeding, balances, and gameplay loops are visible

## Required Before Demo

1. Run `ensureDemoNpc` from Convex dashboard to seed all 5 agents with current coordinates
2. Start `services/x402-api` locally (`node dist/server.js` or equivalent)
3. Set environment variables: `SERVER_ADDRESS`, `DEPLOYER_PRIVATE_KEY`, `CONVEX_URL`, `NETWORK=testnet`
4. Connect Leather wallet on Stacks testnet with funded STX
5. Walk up to bookshelf or phonograph → press X → pay → verify txid on Hiro explorer
6. Check World Feed in Convex dashboard shows `premium-access-granted` event
