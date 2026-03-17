# Agent Wallet Architecture

This note records the intended plumbing direction for wallet-backed or account-backed agents in `stacks2d`.

## Naming Rule

Public-facing names should stay product-clean:

- `guide.btc`
- `market.btc`
- `quests.btc`
- `Mel`
- `Toma`

Implementation lineage can still be documented separately.

For example:

- public surface: `market.btc`
- implementation lineage: AIBTC / `market-btc-m1` from the Bitflow tutorial flow

This keeps the product presentation professional while preserving honest ecosystem alignment.

## Goal

The target is not only a single x402 payment flow.

The target is:
- a playable Stacks-facing simulation
- autonomous or semi-autonomous agents
- wallet or account-backed agent identity
- x402-linked premium or gated actions
- contract-backed world structure
- Chainhooks-fed onchain world updates

## Layering

### Convex

Convex remains the backend truth layer for:
- agent registry
- agent state
- world facts
- world events
- access state
- cached integrations

### Agent wallet/account layer

Agents should use a dedicated wallet or account layer.

This should stay separate from:
- renderer logic
- random UI state
- direct frontend-only wallet behavior

Current backend model now distinguishes:
- player payer wallets
- service receiver wallets
- agent identity wallets
- agent execution accounts
- signed intents, including future `SIP-018`-style approvals or policies

## AIBTC Lineage

The current `market.btc` path is important because it comes from a real working AIBTC implementation lineage, not a hypothetical wallet mock.

Canonical internal reference:

- AIBTC lineage: `Agents/AIBTC/Bitflow Tutorial 1`
- technical agent reference: `market-btc-m1`
- public in-world identity: `market.btc`

What this proves:

- the wallet-backed market agent pattern was first validated outside the game shell
- the TinyRealms version is a productized in-world surface, not a tutorial artifact
- the AIBTC ecosystem alignment is real and should be stated as lineage, not as public branding

### x402

`x402` stays a narrow paid-service boundary.

Best current use:
- `guide.btc`
- later premium rooms, reports, terminals, or services

### Contracts

Current coherent contract stack:

1. `premium-access-v2`
2. `world-lobby.clar`
3. `world-objects.clar`
4. deployed SIP-009 media artifacts
5. deployed `qtc-token.clar` for future fungible economy flows
6. deployed `sft-items.clar` for future repeatable item/resource flows

### Chainhooks

Chainhooks should be treated as backend event ingestion:

- Hiro Chainhooks
- webhook receiver
- Convex mutations
- world facts / world events / agent updates

## Important Distinctions

- `x402` is not the same as Clarity proof
- agent wallet identity is not the same as agent execution rights
- the browser is not the source of truth

## Current Tactical Order

1. prove one narrow x402 path
2. keep agent wallet/account architecture aligned
3. add Chainhooks ingestion
4. continue contract work for premium access, lobby state, and objects

## Current Convex Boundary

The repo now has explicit persistence surfaces for this:

- `agentRegistry`
- `agentAccountBindings`
- `walletIdentities`
- `signedIntents`

This keeps multiple wallet roles legible without pretending every actor is just a browser extension session.

## Normalized Fields

The wallet-backed agent layer should not hide canonical identity facts inside `metadataJson`.

The current database contract now treats these as first-class fields where possible:

- `walletProvider`
- `walletStatus`
- `testnetAddress`
- `mainnetAddress`
- `lineageSource`
- `lineageRef`

Use `metadataJson` for notes and secondary payloads.

Do not use `metadataJson` as the only source of truth for:

- provider lineage
- cross-network addresses
- execution-vs-identity wallet classification
