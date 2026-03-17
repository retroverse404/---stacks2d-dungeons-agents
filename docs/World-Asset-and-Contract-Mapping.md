# World Asset and Contract Mapping

This note sorts the current TinyRealms sandbox assets into a clean world model so contract work and future wiring stay aligned.

## Current World Zones

These already exist in the seeded local sandbox as semantic zones.

| zoneKey | Name | Purpose | Current access | Future contract fit |
|---|---|---|---|---|
| `entry` | Entry | player arrival and social entry | public | `world-lobby.clar` room state |
| `guide-desk` | Guide Desk | ecosystem onboarding and premium briefing | public | `world-lobby.clar` or premium room later |
| `merchant-corner` | Merchant Corner | trade and gossip area | public | `world-lobby.clar` trade room later |
| `market-station` | Market Station | quotes, analytics, signals | public | `world-lobby.clar` or premium analytics room |
| `quest-board` | Quest Board | grants, bounties, opportunities | public | `world-lobby.clar` event/opportunity room |

## Current Semantic Objects

These are the important in-world objects already represented in the semantic layer.

### NPC Posts

These are the best first objects to map into contract-backed world logic.

| objectKey | Label | objectType | Zone | Affordances | Future contract fit |
|---|---|---|---|---|---|
| `guide-post` | Guide Post | `npc-post` | `guide-desk` | `talk`, `learn`, `inspect` | object access / premium briefing |
| `merchant-post` | Merchant Post | `npc-post` | `merchant-corner` | `talk`, `trade`, `inspect` | trade access / vendor logic |
| `market-post` | Market Post | `npc-post` | `market-station` | `talk`, `inspect`, `query` | quote access / market services |
| `quest-post` | Quest Post | `npc-post` | `quest-board` | `talk`, `inspect`, `read` | gated quests / opportunity services |

### Scene and Virtual Objects

These are already useful as semantic placeholders even if they are not yet contract-backed.

| objectKey | Label | objectType | Zone | Affordances | Value class | Future fit |
|---|---|---|---|---|---|---|
| `coffee-mug` | Coffee Mug | `consumable` | `guide-desk` | `inspect` | `utility` | later consumable or social prop |
| `books-stack` | Books Stack | `knowledge` | `guide-desk` | `inspect`, `read` | `utility` | later lore / research surface |
| `wall-sword` | Wall Sword | `weapon` | `merchant-corner` | `inspect` | `decor` | later collectible or tradeable prop |
| `price-board` | Price Board | `terminal` | `market-station` | `inspect`, `query` | `utility` | market terminal / premium analytics |
| `opportunity-board` | Opportunity Board | `board` | `quest-board` | `inspect`, `read` | `utility` | grants / bounties / quest board |

## Current Offchain Item Model

TinyRealms already has a usable offchain item system.

- `itemDefs`
  - template definitions for items
- `worldItems`
  - placed pickups in the world
- `profiles.items`
  - player inventory
- `npcProfiles.items`
  - NPC inventory

This means the contracts do **not** need to replace the game database.

## Asset Category Split

Use this split to avoid confusion:

| Category | Best fit | Current status |
|---|---|---|
| world props / terminals | `world-objects.clar` + semantic objects | live contract, partial app use |
| normal inventory items | Convex `itemDefs` / `worldItems` / profile inventory | live |
| repeatable onchain item classes | `sft-items.clar` | deployed, not integrated |
| unique relics / media artifacts | SIP-009 contracts | deployed |
| fungible currency | STX now, `qtc-token.clar` later | STX live, QTC deployed but not integrated |

## Contract Mapping

### `premium-access-v2`

Use for:

- paid premium briefing proof
- resource-specific access proof
- current `guide.btc` premium unlock

### `world-lobby.clar`

Use for:

- zone or room registry
- room membership
- open / closed state
- public vs gated room access

Recommended first room keys:

- `entry`
- `guide-desk`
- `market-station`
- `quest-board`

### `world-objects.clar`

Use for:

- object registry
- object active/inactive state
- object access assignment
- public vs assigned object use

Recommended first object keys:

- `guide-post`
- `market-post`
- `price-board`
- `opportunity-board`

## What Comes Later

These should fit the same model later without changing the contract spine.

### Future media objects

- vinyl display
- cassette rack
- wax cylinder terminal
- listening booth
- tip jar
- artist board

Suggested semantic types later:

- `media`
- `terminal`
- `display`
- `collectible`
- `board`

### Future item layer

Use `sft-items.clar` for:

- tickets
- passes
- collectible recordings
- keys
- modules
- upgrade items

## Practical Rule

Keep the contracts thin.

- Convex remains the rich world database
- Clarity proves access, registry, and ownership state
- future assets only need wiring once the contract spine is in place

## Current GameFi Truth

- `qtc-token.clar` is deployed on testnet as the future fungible in-game currency layer
- `sft-items.clar` is deployed on testnet as the future repeatable item/resource layer
- the current demo still uses `STX` as the live currency
- no live QTC mint/spend loop or seeded SFT gameplay economy should be claimed yet
