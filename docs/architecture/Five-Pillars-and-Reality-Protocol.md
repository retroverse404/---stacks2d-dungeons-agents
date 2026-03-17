# Five Pillars and Reality Protocol

Purpose: map the world philosophy of `tinyrealms` to the technical architecture and the Reality Protocol metamodel so product decisions stay coherent.

Audience:
- builders shaping world design, agent roles, or creator-economy features
- reviewers trying to understand the conceptual backbone quickly

Last verified: 2026-03-17

## Three Layers

TinyRealms now has three different but compatible lenses:

1. world philosophy
2. product architecture
3. world metamodel

They should not be collapsed into one thing.

## 1. World Philosophy

These are the five pillars of meaning inside the world:

| Pillar | Meaning in the world | Best current examples |
| --- | --- | --- |
| `Value` | what the world treats as meaningful, useful, or worth keeping | world events, reputation, utility, tavern exchange, player history |
| `Wealth` | payment, price, liquidity, earning, trade | `market.btc`, STX, x402 premium actions, quote surfaces |
| `Beauty` | art, music, curation, taste, creator economy | `Mel`, phonograph, wax cylinder, cassette, floppy, media artifacts |
| `Power` | access, authority, gates, permission, reward control | `quests.btc`, premium access, room/object state, contract-backed proof |
| `Knowledge` | teaching, lore, research, context, explanation | `guide.btc`, bookshelf, primers, briefings, study wing |

This layer explains what the world cares about.

## 2. Product Architecture

These are the five technical pillars of the system:

| Pillar | Owns |
| --- | --- |
| `apps` | player-facing surfaces, overlays, dashboards, editors, premium panels |
| `identity` | player identity, agent identity, wallet identity, account bindings |
| `worlds` | maps, zones, objects, items, portals, labels, scenes, world state |
| `agents` | runtime state, memory, role policy, prompts, guardrails, epochs |
| `ecosystem` | payments, contracts, market data, external APIs, chain adapters |

This layer explains where systems live in code.

## 3. Reality Protocol Metamodel

Reality Protocol is the cleanest neutral model for representing what exists in the world.

| Reality Protocol concept | TinyRealms equivalent |
| --- | --- |
| `world` | Cozy Cabin, future dungeon maps, future 3D rooms, map-level state |
| `entity` | player, NPC, semantic object, world item, portal, artifact |
| `interaction` | inspect, talk, buy, unlock, play, mint, claim, move, warp |
| `schema` | the UI/action contract for a world object, NPC, or premium surface |
| `assetRef` | sprite path, audio path, GLB path, token URI, future media reference |

This layer explains how reality is represented cleanly.

## Mapping Across the Three Layers

The point of the model is that one decision can be evaluated from all three angles.

### Example: Wax Cylinder

| Lens | Interpretation |
| --- | --- |
| world philosophy | `Beauty` artifact with creator-economy meaning |
| product architecture | mostly `worlds` + `ecosystem`, with `Mel` in `agents` |
| Reality Protocol | `entity` with `assetRef`, exposed through a premium `interaction` |

### Example: Bookshelf Premium Brief

| Lens | Interpretation |
| --- | --- |
| world philosophy | `Knowledge` |
| product architecture | `worlds` + `agents` + `ecosystem` |
| Reality Protocol | semantic `entity` exposing free and premium `interaction` schemas |

### Example: Market Quote

| Lens | Interpretation |
| --- | --- |
| world philosophy | `Wealth` |
| product architecture | `agents` + `ecosystem` |
| Reality Protocol | agent `entity` exposing a paid `interaction` |

## Dungeons and Agents Mapping

The Dungeons and Dragons analogy becomes cleaner with this structure.

| D&D frame | TinyRealms meaning |
| --- | --- |
| class | agent role and pillar alignment |
| room | world zone |
| prop | semantic object |
| spell / action | affordance or premium interaction |
| gold | STX |
| loot | artifact or future collectible |
| campaign log | World Feed |
| dungeon master | the human operator shaping the world and agent rules |

## Creator Economy Fit

`Beauty` is where the creator economy belongs.

That means the creator-economy chain should be understood as:

`creator artifact -> curated by agents -> unlocked in-world -> paid in STX -> optionally owned as SIP-009`

This is why `Mel`, the phonograph, and the media artifacts matter. They are not decorative. They are the cleanest bridge between culture and onchain ownership.

## Practical Rule

When adding a new feature, test it against all three layers:

1. which world pillar does it serve
2. which technical pillar owns it
3. which Reality Protocol concept does it add or extend

If the answer is vague in any of those three layers, the feature is probably not well-shaped yet.
