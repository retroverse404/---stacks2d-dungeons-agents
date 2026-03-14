# AIBTC Agent Ingress

Updated: 2026-03-14

## Purpose

This note defines how external AIBTC-style agents should join `stacks2d` without being allowed to mutate the world arbitrarily.

The world should accept agents through:

- identity
- role
- permission tier
- supported assets
- world placement
- typed action boundaries

## Official AIBTC Basis

This design is calibrated to the official AIBTC `agent-account` model:

- owner-controlled withdrawals
- agent-specific permissions
- explicit contract allowlisting
- optional trading permissions

It does **not** claim that live AIBTC execution is already wired into the game.

## Core Tables

### `agentRegistry`

Tracks the canonical in-world identity of agents.

Fields:

- `agentId`
- `displayName`
- `network`
- `walletAddress`
- `bnsName`
- `agentType`
- `roleKey`
- `permissionTier`
- `status`
- `homeWorld`
- `homeMap`
- `homeZoneKey`
- `supportedAssets`
- `metadataJson`

### `agentAccountBindings`

Tracks optional AIBTC-style execution bindings for agents that need onchain powers.

Fields:

- `agentId`
- `network`
- `ownerAddress`
- `agentAddress`
- `accountContractId`
- `allowlistedContracts`
- `canPropose`
- `canApproveContracts`
- `canTradeAssets`
- `status`
- `metadataJson`

## Permission Tiers

- `identity-only`
  - wallet identity only
  - no service or execution rights
- `service`
  - can expose premium content, priced access, or information surfaces
  - no live onchain execution yet
- `execution`
  - intended future AIBTC agent-account binding
  - still subject to contract allowlists and DM approval

## Ingress Model

An external AIBTC-style agent should only join by:

1. registering identity metadata
2. declaring role and supported assets
3. being assigned a permission tier
4. being placed into a world/map/zone
5. interacting through typed world actions

## Typed World Actions

External agents should never patch arbitrary state.

They should only request allowed actions such as:

- `inspect`
- `talk`
- `offerPremium`
- `readBoard`
- `requestQuote`
- `settlePayment`
- `startQuest`

## Current Reality

Live now:

- registry scaffolding exists
- core named agents are seeded into the registry on testnet
- one planned `agentAccountBinding` exists for `market.btc`

Not live yet:

- real wallet addresses
- deployed agent accounts
- allowlisted contracts
- live tool execution
- external agent join flow
