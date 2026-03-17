# Platform Overview

Purpose: define the top-level architecture for `stacks2d / tinyrealms` in a way that stays stable as new chains, worlds, and agent features are added.

Audience:
- builders touching product or backend architecture
- contributors wiring new worlds, agents, payments, or UI surfaces

Last verified: 2026-03-17

## Core Thesis

TinyRealms is being shaped as a playable agent world with five persistent pillars:

| Pillar | Owns | Current implementation examples |
| --- | --- | --- |
| `apps` | player-facing surfaces, dashboards, editors, overlays, premium panels | `src/ui/*`, `src/splash/*`, `src/editor/*` |
| `identity` | player identity, agent identity, wallet identity, account bindings, permissions | `convex/profiles.ts`, `convex/wallets.ts`, `agentAccountBindings`, `walletIdentities` |
| `worlds` | maps, labels, portals, zones, scenes, objects, items, world state | `convex/maps.ts`, `convex/worldState.ts`, `worldZones`, `semanticObjects`, `worldItems` |
| `agents` | runtime state, memory summaries, role policy, AI guardrails, scheduled behavior | `convex/agents/*`, `convex/npcEngine.ts`, `convex/story/storyAi.ts` |
| `ecosystem` | payments, contracts, market data, external APIs, chain adapters | `services/x402-api`, `convex/integrations/*`, `contracts/*` |

This is the product-level architecture.

`Backend-Contract.md` remains the technical write-boundary contract for Convex tables and mutations.

## Metamodel Alignment

The strongest neutral high-level reference is the Reality Protocol material in:

- `Ecosystem/arweave/Reality.md`
- `Ecosystem/arweave/Schema.md`
- `Ecosystem/arweave/WorldGuide.md`
- `Ecosystem/arweave/AgentGuide.md`

TinyRealms should treat those as a metamodel, not as a runtime rewrite.

| Reality / Schema concept | TinyRealms equivalent |
| --- | --- |
| `World` | map + world facts + world events + labels + portals |
| `Entity` | NPC, semantic object, world item, player, portal anchor |
| `Interaction` | free action, premium action, dialogue, pickup, warp, scene trigger |
| `Schema` | UI/action contract for a world object, NPC, or premium surface |
| `AssetRef` | sprite URL, audio URL, 3D asset URL, future chain/media reference |

This matters because it keeps the world model portable even if the ecosystem layer grows from:

- Stacks and x402 now
- broader Bitcoin DeFi next
- future multi-chain adapters later

## Current Implementation Stance

These rules are current and intentional:

- `Convex` is the system of record.
- `services/x402-api` is the payment boundary.
- premium actions must be world-triggered, not detached wallet-first screens.
- Stacks is the first live ecosystem adapter.
- world logic should remain chain-neutral wherever possible.
- AI Town is the behavioral thesis.
- `midnight.city` is the information-architecture reference.
- Reality Protocol is the world/entity/interaction metamodel.

## Canonical Docs

These docs should be treated as the main entry points:

- `docs/00-Start-Here.md`
- `docs/Overview.md`
- `docs/status/Current-Truth-Matrix.md`
- `docs/status/Project-Timeline.md`
- `docs/architecture/System-Diagrams.md`
- `docs/architecture/Spatial-Intelligence-Direction.md`
- `docs/architecture/Five-Pillars-and-Reality-Protocol.md`
- `docs/Backend-Contract.md`
- `docs/Stacks-Implementation-Status.md`
- `docs/Agent-Wallet-Ledger.md`
- `docs/Agent-Wallet-Architecture.md`
- `docs/X402-Service-Boundary.md`
- `docs/Clarity-Contract-Plan.md`
- `docs/Contract-Cheat-Sheet.md`
- `docs/Operations.md`

For timestamped backlog, PM, and working strategy notes, use the Obsidian hub instead of adding more repo drift:

- [Stackshub Project Hub](/home/rv404/RV404-Lab/PRODUCTIVITY/Obsidian/Test-1a/PMOG-Obsidian-Research/00_meta/2026-03-18%20Stackshub%20Project%20Hub.md)

Everything else should be understood as either:

- a focused subsystem note
- a working note
- or an archive candidate

## Practical Build Rule

When adding a feature, decide these five things first:

1. which pillar owns it: `apps`, `identity`, `worlds`, `agents`, or `ecosystem`
2. what world/entity/interaction contract it adds
3. who writes the authoritative state
4. whether it is chain-neutral or adapter-specific
5. whether it belongs in the public product surface yet

If those are unclear, the feature is not ready to be added cleanly.
