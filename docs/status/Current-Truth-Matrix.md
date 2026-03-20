# Current Truth Matrix

Purpose: record the current implementation truth in one place.

Audience:
- builders
- reviewers
- demo prep

Last verified: 2026-03-20

| Area | Current truth | Status |
| --- | --- | --- |
| World shell | Cozy Cabin is playable with named zones, semantic objects, world events, and 5 visible NPC roles | live |
| Agent runtime | 5 named agents have runtime state, cooldown/budget guardrails, and autonomous thought loops | live |
| Agent wallets | all 5 named agents now have testnet wallet identities and bindings | live |
| Database hygiene | agent wallet/provider/lineage data now has first-class Convex fields instead of living only in JSON blobs | live |
| Interaction surfaces | premium-offer bindings, object triggers, and event hooks now have first-class Convex fields instead of living only in object/offer JSON | live |
| Paid interactions | world-triggered premium actions use `x402` from objects/NPCs, not detached wallet-first UI | live |
| Onchain proof | `premium-access-v2` is deployed and service-side `grant-access` wiring exists | wired, verification-focused |
| x402 service | local service runs on testnet STX and returns structured premium JSON | live |
| Market data | Tenero-backed market data is integrated, but local snapshot freshness needs active backend health | partial |
| Ecosystem data | Zero Authority cache is integrated into world surfaces | live |
| SIP-009 artifacts | `floppy-disk-nft-v2`, `cassette-nft-v2`, `wax-cylinder-nft-v2` are deployed on Stacks testnet under Clarity 4; legacy `-nft` deployments remain historical | live |
| SIP-010 currency | `qtc-token` is deployed on testnet, but no live gameplay mint/spend loop is part of the current demo claim | deployed, not integrated |
| SFT layer | `sft-items` is deployed on testnet, but no live item economy loop is part of the current demo claim | deployed, not integrated |
| Agent-to-agent onchain transfers | not a current verified claim | not live |
| Dungeon loop | semantic groundwork exists, but only the media/artifact loop is becoming concrete | partial |
| Cut-scene system | labels and story primitives exist, but no dedicated scene runner is finalized yet | partial |

## Five Agents

| Agent | Role | Wallet-backed | Premium surface | AI runtime |
| --- | --- | --- | --- | --- |
| `guide.btc` | guide / educator | yes | guide brief, bookshelf brief | yes |
| `market.btc` | market / execution surface | yes | paid quote | yes |
| `quests.btc` | quests / opportunity keeper | yes | quest guidance, future reward surfaces | yes |
| `Mel` | curator / artifact signal | yes | signal, wax cylinder memory | yes |
| `Toma` | tavern / merchant / social layer | yes | social / tavern surfaces later | yes |

## Canonical Wallet Fields

The current wallet-backed agent rows should be readable directly from Convex using:

- `agentRegistry.walletProvider`
- `agentRegistry.walletStatus`
- `agentRegistry.testnetAddress`
- `agentRegistry.mainnetAddress`
- `agentRegistry.lineageSource`
- `agentRegistry.lineageRef`
- `agentAccountBindings.*` equivalents for execution/binding state
- `walletIdentities.linkedTestnetAddress`
- `walletIdentities.linkedMainnetAddress`

## Current Contract Stack

| Layer | Contract(s) | Purpose |
| --- | --- | --- |
| proof | `premium-access-v2` | post-payment access proof |
| world | `world-lobby`, `world-objects` | room/object state and access |
| artifacts | `floppy-disk-nft-v2`, `cassette-nft-v2`, `wax-cylinder-nft-v2` | unique collectible media artifacts |
| future economy | `qtc-token`, `sft-items` | fungible and repeatable item economy |

## Contract Evolution Log

- **2026-03-20 02:51:57 UTC**: First `floppy-disk-nft-v2` redeploy attempt landed on-chain as tx `3429e760dfa5472235c1b63484356dfbb66266eb50d2470958dc5856101c983a` but aborted with `use of unresolved function 'trait-of'`.
- **2026-03-20 02:52:08 UTC**: First `cassette-nft-v2` redeploy attempt landed on-chain as tx `54ccb32cab048bb6e5e0b0ec818ea39b7fc54df9652ad3a26fdd7087c2781196` but aborted with `use of unresolved function 'trait-of'`.
- **2026-03-20 03:00:39 UTC**: `floppy-disk-nft-v2` attempt `86a1c228725f78052e3792a3a60a32894e54083f1b9a6c93ecbdd59001757ad5` proved the inline `response` annotation form was invalid (`expecting 2 arguments, got 3`).
- **2026-03-20 03:06:40 UTC**: `floppy-disk-nft-v2` attempt `2b299a65915a1d7ce5b509e5abb4586e5974027b378ef4dea7889923840a2d59` proved the `use-trait` alias plus `(impl-trait sip009-nft)` path was invalid (`(impl-trait ...) expects a trait identifier`).
- **2026-03-20 03:10:00 UTC**: `floppy-disk-nft-v2` deployed successfully as `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.floppy-disk-nft-v2` in tx `cca2941d4894f25b2ac1f68a0aa20b078237587d4406a751e48a167c1ecb6956` after restoring the last known-good owner-guard structure, keeping `set-contract-owner`, and returning SIP-009 read-only values via `ok`.
- **2026-03-20 03:23:31 UTC**: `cassette-nft-v2` deployed successfully as `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.cassette-nft-v2` in tx `589305b8353192df54c642a6f408a53c488367a4057114661e0b90d6f5db403d`.
- **2026-03-20 03:24:47 UTC**: `wax-cylinder-nft-v2` deployed successfully as `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.wax-cylinder-nft-v2` in tx `25a39a2005a51765c6a540436fd8b6efadc2191360347ad432af90364217ce74`.
- **2026-03-20 03:36:32 UTC**: Render health check returned `200 OK` from `https://stackshub-x402-api.onrender.com/health` with `{\"ok\":true,\"service\":\"stacks2d-x402-api\",\"network\":\"testnet\",\"configured\":true}`.
- **2026-03-20 03:45 UTC**: Live read-only checks passed for `floppy-disk-nft-v2`, `cassette-nft-v2`, and `wax-cylinder-nft-v2`: `get-last-token-id -> (ok u0)`, `get-owner-principal -> deployer`, `get-owner(u1) -> (ok none)`, and `get-token-uri(u1) -> (ok none)`.
