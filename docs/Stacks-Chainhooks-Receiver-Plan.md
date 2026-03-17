# Stacks Chainhooks Receiver Plan

Date: 2026-03-15

## Position

Stacks Chainhooks should be treated as a backend ingestion layer for `stacks2d`, not a frontend feature.

Recommended flow:

`Hiro Chainhooks -> receiver endpoint -> normalized events -> Convex mutations -> worldFacts/worldEvents/agent state -> in-world UI`

## Why This Fits The Current App

The app already has:
- `worldEvents`
- `worldFacts`
- `agentRegistry`
- `agentAccountBindings`
- `premiumContentOffers`

That means chain activity can be mapped into existing tables first instead of creating a second game-state model.

## Current Backend Scaffold Added

### New table

`chainhookReceipts`

Purpose:
- dedupe incoming webhook deliveries
- store tx/block references
- track apply vs rollback state
- link normalized chain activity back to generated `worldEvents`

### New mutation

`convex/integrations/chainhooks.ts`

Current responsibility:
- ingest already-normalized chainhook events
- write idempotent receipt rows
- append `worldEvents`
- upsert or tombstone `worldFacts`
- record rollback state explicitly

This gives the receiver a stable backend target.

## Recommended Receiver Layer

Use a small backend receiver service first.

Preferred shape:
- `POST /api/chainhooks/stacks`
- validate shared secret
- inspect `apply` and `rollback`
- normalize only the events we care about
- call the Convex chainhooks ingestion mutation

## First Hook To Configure

Start with one narrow testnet contract hook.

Best first slices:
1. `contract_log` for a future premium access / receipt contract
2. `contract_call` for unlock functions

Do not start with broad wallet monitoring.

## Suggested Normalized Event Types

- `contract-called`
- `premium-unlocked`
- `premium-unlock-rollback`
- `agent-wallet-funded`
- `chainhook-receipt`

## Mapping Rules

### Apply

- append one `worldEvent`
- optionally upsert one `worldFact`
- write one `chainhookReceipt` row with status `applied`

### Rollback

- append one rollback `worldEvent`
- tombstone or reverse related `worldFact`
- update or insert one `chainhookReceipt` row with status `rolled-back`

## What Is Still Missing

- an actual HTTP receiver endpoint
- webhook secret validation
- raw Hiro payload parsing
- contract-specific normalization rules

## Recommended Next Step

Implement a minimal receiver in `services/` that:
1. accepts Hiro Chainhooks payloads
2. validates a shared secret
3. normalizes only one contract event type
4. calls `integrations/chainhooks:ingestNormalizedEvents`
