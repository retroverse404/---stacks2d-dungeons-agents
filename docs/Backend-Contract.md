# Backend Contract

Updated: 2026-03-17

This note freezes the current backend contract for `tinyrealms` without rewriting the stack.

Current infrastructure decisions:

- `Convex` remains the system of record
- `services/x402-api` remains the payment boundary
- no SQL or extra infrastructure is introduced unless a shipped feature forces it

## Purpose

The goal is to stop backend drift while keeping the current MVP executable.

This contract exists to:

- make spatial gameplay first-class
- keep paid interactions coherent
- prevent external payload shapes from leaking into core game logic
- clarify who is allowed to mutate what

## Canonical Domains

Every table and function should have one primary domain owner.

| Domain | Owns | Current files/tables |
| --- | --- | --- |
| `world` | maps, portals, room topology, world facts, world events | `convex/maps.ts`, `convex/worldState.ts`, `maps`, `worldFacts`, `worldEvents` |
| `interactables` | zones, semantic objects, world items, object triggers | `convex/semantics.ts`, `convex/worldItems.ts`, `worldZones`, `semanticObjects`, `worldItems`, `itemDefs` |
| `agents` | agent registry, role assignment, npc profiles/state, agent behavior | `convex/agentRegistry.ts`, `convex/npcProfiles.ts`, `convex/npcEngine.ts`, `convex/agents/*`, `agentRegistry`, `agentAccountBindings`, `npcProfiles`, `npcRoleAssignments`, `npcState` |
| `wallets` | wallet identities, account bindings, signing intent | `convex/wallets.ts`, `walletIdentities`, `signedIntents` |
| `payments` | offers, payment state, onchain unlock proof handoff | `convex/integrations/x402.ts`, `services/x402-api`, `premiumContentOffers` |
| `integrations` | raw external snapshots, sync logs, chainhooks, normalization entrypoints | `convex/integrations/*`, `external*`, `chainhookReceipts` |

Rule:

- a file may read across domains
- a file should only *own writes* for one primary domain

## First-Class Spatial Concepts

These are now canonical backend concepts, not UI accidents.

### Zone

- backed by `worldZones`
- identifies a named region with intent and access mode

### Interactable

- backed by `semanticObjects`
- optionally linked to a `worldItem`, agent, or offer
- owns affordances, trigger metadata, and local semantics

### Trigger

- first stored in `semanticObjects.metadataJson`
- resolved by the runtime or Convex mutation
- should only use a small set of trigger types:
  - `proximity`
  - `interact`
  - `timed`
  - `payment-complete`

### Event

- backed by `worldEvents`
- records readable, durable outcomes for world, player, payment, and agent activity

## Authority and Write Paths

Write authority must be explicit.

| Writer | Can write directly | Cannot write directly |
| --- | --- | --- |
| Client | player input surfaces, presence, explicitly allowed world/interactable mutations | raw external snapshots, payment settlements, agent registry, chainhook receipts |
| Convex mutation | canonical domain tables for its domain | external provider payloads without normalization |
| Agent runtime | agent domain state, agent-authored summaries through approved mutations | wallet custody records, direct payment settlement, arbitrary world rewrites |
| x402/payment flow | payment outcome, offer fulfillment, access proof events/facts | unrelated world state, arbitrary NPC state |
| External sync job | raw snapshot/cache tables, normalized integration staging, chainhook receipts | direct player-facing derived state without normalization |

Practical rule:

- the client may request
- Convex mutations decide and persist
- integrations normalize before they become gameplay

## External Data Separation

Do not let external provider payloads become gameplay state directly.

Always separate:

1. raw external snapshot/cache
2. normalized internal domain state
3. player-facing derived state

Examples:

- Tenero ticker payloads belong in integration snapshot tables first
- Zero Authority opportunity payloads belong in external cache/normalized tables first
- wallet-provider payloads should be normalized into `walletIdentities` or account-binding records before gameplay reads them

## Naming Freeze

Prefer these terms everywhere:

- `agent`
- `wallet identity`
- `account binding`
- `offer`
- `zone`
- `interactable`
- `event`

Avoid introducing new synonyms unless a standards surface requires it.

Examples to phase out over time:

- `post` when the concept is really an interactable
- `wallet` when the concept is really a wallet identity record
- `scene prop` when the concept is really a semantic interactable

## Canonical Event Shape

`worldEvents` remains the single event log for the MVP, but it now targets this canonical shape:

```ts
type WorldEventRecord = {
  eventType: string;
  sourceType?: string;
  sourceId?: string;
  actorId?: string;
  worldId?: string;
  tileX?: number;
  tileY?: number;
  payloadJson?: string;
  timestamp: number;

  // Current compatibility fields
  mapName?: string;
  targetId?: string;
  objectKey?: string;
  zoneKey?: string;
  summary: string;
  detailsJson?: string;
};
```

Rules:

- `summary` stays because the World Feed needs a human-readable line
- `payloadJson` is the canonical machine-readable payload
- `detailsJson` remains as a compatibility alias until older callers are cleaned up
- `worldId` should usually mirror the current map/world key until a stronger multi-world identifier exists

## Current Folder Ownership Target

Do not move everything now.

This is the ownership target for incremental refactors:

- `convex/world/`
- `convex/interactables/`
- `convex/agents/`
- `convex/wallets/`
- `convex/payments/`
- `convex/integrations/`

For now:

- existing files stay where they are
- new files should prefer the target folders when the scope is clear
- broad moves should only happen when touching a file anyway

## Immediate Implementation Rules

These rules apply now, even before any folder refactor:

1. Cozy Cabin spatial logic must write through `worldZones`, `semanticObjects`, `worldItems`, and `worldEvents`.
2. Player-facing payments must cross the `services/x402-api` boundary before they mutate world access state.
3. Agent-agent background activity should prefer cheap Convex mutations and World Feed events over model calls.
4. External integration code must write raw or normalized integration state first, not ad hoc player-facing gameplay state.
5. New backend features should declare their domain owner before adding tables or mutations.

## Near-Term Refactor Priority

Do not rewrite the stack.

Do this instead:

1. keep current files working
2. standardize `worldEvents` writes around the canonical event shape
3. keep spatial gameplay on `zones`, `interactables`, `triggers`, and `events`
4. only move files into domain folders when already editing them for a real feature

## Result

If this contract is followed:

- the current MVP remains executable
- Cozy Cabin interactables have a stable backend shape
- paid interactions stop drifting into ad hoc logic
- later GameFi, NFT, SFT, and multi-agent layers can build on a clearer base
