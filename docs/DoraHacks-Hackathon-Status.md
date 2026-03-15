# DoraHacks Hackathon Status

Updated: 2026-03-15

## Verified Today

- `Stackshub` runs as a playable 2D world on the `tinyrealms` base
- backend-driven Stacks ecosystem surfaces exist for:
  - `guide.btc`
  - `market.btc`
  - `quests.btc`
- Convex remains the persistence and integration truth layer
- local `guide.btc` x402 payment now works end-to-end on Stacks testnet
  - `402 Payment Required`
  - wallet signing
  - signed retry
  - local facilitator fallback settlement
  - premium payload returned

## What This Proves

The project now has a real technical Stacks proof, not only architecture:

- real Stacks wallet interaction
- real x402 payment challenge
- real settlement path in local development
- real premium content unlock

## JSON Scaling Logic

The premium x402 response should be understood as a JSON interface contract, not just a paywall receipt.

Why this matters:

- humans can see the result as an in-world premium card
- agents can consume the same payload directly
- future apps and world objects can rely on the same typed response shape

Current honest truth:

- the verified local payload proves payment and premium delivery
- the current content shape is still closer to a receipt/proof envelope than a fully enriched classified briefing

Why this still matters for the hackathon:

- it proves the payment rail is real
- it gives a scalable contract for richer premium payloads later
- it naturally extends into:
  - `premium-access.clar`
  - `world-lobby.clar`
  - `world-objects.clar`
  - later `sft-items.clar`

## AIBTC-Relevant State

The repo is aligned to an AIBTC-style execution model at the schema and boundary level:

- `agentRegistry`
- `agentAccountBindings`
- typed world actions for service/execution boundaries
- modular external-adapter framing

This is honest AIBTC alignment, not a claim that live AIBTC agents are already operating in-world.

## Contract Story For Judges

The strongest contract sequence is:

1. `premium-access.clar`
2. `world-lobby.clar`
3. `world-objects.clar`
4. later `sft-items.clar`

Why this order:

- `premium-access.clar` matches the verified x402 proof path
- `world-lobby.clar` makes rooms and gated spaces legible onchain
- `world-objects.clar` maps directly to semantic objects like boards, desks, and terminals
- `sft-items.clar` is the future item/pass/resource layer, not the first proof

## Recommended Hackathon Scope

Ship:

- one polished playable world slice
- three named agents
- one verified x402 premium flow
- one visible AIBTC-aligned account-binding story
- one first contract, `premium-access.clar`
- one JSON-first premium payload contract that can scale to agents and apps

Show as roadmap:

- autonomous trading agents
- multisig / basket strategy logic
- broad Chainhooks rollout
- full SFT item economy
- broader world/theme expansion

## Public Claim Rule

Safe claim:

- `Stackshub is a playable agentic sandbox for simulated worlds, wallets and transactions, with a verified local x402 premium flow on Stacks testnet and an AIBTC-aligned backend architecture.`

Unsafe claim:

- `AIBTC agents are already fully integrated and transacting autonomously in-world.`
- `Hosted production x402 settlement is already proven.`
