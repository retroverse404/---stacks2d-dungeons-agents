# Cozy Cabin Interactables Spec

Updated: 2026-03-17

## Purpose

This note defines a minimal, implementation-ready way to model Cozy Cabin tavern interactables with the current TinyRealms architecture.

This spec should obey `docs/Backend-Contract.md`.

Do not add a new backend subsystem for this.

Use:

- `Convex` as the system of record
- `worldZones` for named regions
- `semanticObjects` for interactable anchors
- `worldEvents` for readable in-world outcomes
- `worldFacts` for persistent unlock or buff state
- `premiumContentOffers` for optional x402 metadata
- `services/x402-api` as the only paid rail boundary

## Design Rule

Treat an interactable as:

1. a semantic object
2. with optional trigger metadata
3. that appends a world event
4. and optionally resolves through an x402 offer

This keeps the world model small and executable with the current codebase.

## Current Backend Fit

The required pieces already exist:

- `convex/schema.ts`
  - `worldZones`
  - `semanticObjects`
  - `worldFacts`
  - `worldEvents`
  - `premiumContentOffers`
- `convex/localDev.ts`
  - Cozy Cabin semantic seed layer
- `convex/worldState.ts`
  - `appendEvent`
- `convex/integrations/x402.ts`
  - offer metadata
- `services/x402-api/src/server.ts`
  - paid endpoint execution boundary

## First-Pass Cozy Cabin Zones

These should be added or refined as semantic regions in `convex/localDev.ts`.

| zoneKey | name | zoneType | intent |
| --- | --- | --- | --- |
| `entry-hall` | Entry Hall | `entry` | arrival and spawn context |
| `guide-wing` | Guide Wing | `guide` | guide desk and educational surfaces |
| `market-wing` | Market Wing | `market` | market.btc and trade surfaces |
| `study-wing` | Study Wing | `study` | bookshelf, broom, and quieter lore surfaces |
| `private-room` | Private Room | `study` | premium lesson screen and quiet media surfaces |
| `bar-hub` | Bar Hub | `social` | coffee, beer, bartender, rumor interactions |
| `rest-nook` | Rest Nook | `rest` | beds, side-room, low-noise state |
| `back-room` | Back Room | `storage` | barrels, shelves, hidden hooks |
| `music-corner` | Music Corner | `music` | phonograph and future wax cylinder loop |

Notes:

- `guide-desk`, `merchant-corner`, `market-station`, `quest-board`, and `curation-desk` already exist as seeded semantic zones.
- The new room-level names above are for clearer cut-scene and portal semantics.
- Room labels in the map JSON should align with these names where possible.

## Known Interactables

### 1. Coffee

- object key: `coffee-service`
- label: `Coffee`
- tile coords: `68,23`
- observed world coords: `1637,576`
- snapped tile origin: `1630,568`
- zone: `bar-hub`
- intent:
  - tavern consumable
  - free or low-friction first
  - later can drive buffs, routine state, or social flavor

Coordinates note: this is the upper-right lounge/bedroom hallway near the bar, so tag the coffee interactable/zone there in the spec.

Pattern source:

- Eric's `buy-satoshi-a-coffee` repo is a good reference for the later paid version of this object:
  - wallet connect
  - payment action
  - memo or tribute payload
  - public event/feed rendering
- In TinyRealms, that should be adapted through `x402` plus `worldEvents`, not copied as a separate app flow.

Recommended behavior:

- free:
  - `inspect`
  - `sip`
- later optional paid variant:
  - premium roast
  - rumor unlock
  - social buff
  - tribute-style world feed entry

### 2. Bookshelf

- object key: `bookshelf-lore`
- label: `Bookshelf`
- tile coords: `37,10`
- observed world coords: `895,251`
- snapped tile origin: `888,240`
- zone: `study-wing`
- intent:
  - educational
  - lore/research surface
  - best x402 educational paywall candidate

Recommended behavior:

- free:
  - `inspect`
  - `read-titles`
- paid:
  - `unlock-lesson`
  - `unlock-market-brief`
  - `unlock-research-note`

### 3. Beer

- object key: `beer-service`
- label: `Beer`
- exact coordinate not yet captured
- zone: `bar-hub`
- intent:
  - future tavern x402 action
  - should route through a tavern interaction, not a generic wallet popup

Recommended behavior:

- trigger at bartender or bar surface
- prompt: `Buy a beer`
- x402 payment succeeds
- append an in-world event
- reward:
  - flavor text
  - rumor
  - minor buff
  - hidden dialogue branch

### 4. Broom

- semantic object key: `broom-stand`
- item definition name: `witchwood-broom`
- label: `Broom`
- tile coords: `49,18`
- observed world coords: `1194,443`
- snapped tile origin: `1176,432`
- zone:
  - optional at first
  - can stay unassigned until the room-label pass is complete
- intent:
  - inventory-facing pickup object
  - free inspect
  - free pickup
  - later can unlock a flight lesson, janitor quest, or academy-style dialogue branch

Recommended behavior:

- free:
  - `inspect`
  - `take`
- result:
  - add broom item to inventory
  - append readable world event
- optional follow-up:
  - unlock a lesson
  - unlock a side quest
  - unlock a themed dialogue branch

Flavor direction:

- `old flying broom`
- `academy broom`
- `witchwood broom`
- `initiate's broom`

Avoid direct Harry Potter references in shipped content.

### 5. Verification Rug

- object key: `central-rug-captcha`
- label: `Verification Rug`
- tile coords: `63,39`
- observed world coords: `1518,956`
- zone: `music-corner`
- intent:
  - silly proximity trigger
  - fake retro anti-bot popup
  - readable world event for DM-style environmental humor
  - sits on the walkable lip above the blocked pit tiles

Recommended behavior:

- trigger:
  - stepping onto the rug/carpet square
- free:
  - `inspect`
  - `verify-rug`
- spoofed premium-style CTA:
  - `claim-qtc-bonus`
- result:
  - append a readable `worldEvents` row on trigger
  - append a second `worldEvents` row on answer/dismiss
- optionally store a lightweight knowledge takeaway in `worldFacts`

### 6. Dual Stacking Screen

- object key: `dual-stacking-screen`
- label: `Dual Stacking Screen`
- tile coords: `72,11`
- observed world coords: `1749,274`
- snapped interaction anchor: `1740,288`
- zone: `private-room`
- intent:
  - premium educational video surface
  - x402 paywall in-world
  - swappable media URL for future CDN or staked media

Recommended behavior:

- free:
  - `inspect`
- paid:
  - `Pay 1 STX to watch`
- result:
  - x402 payment confirms
  - `premium-access-granted` is logged through the existing grant-access flow
  - `dual-stacking-video-played` is appended to `worldEvents`
  - video opens in a modal that pauses Cozy Cabin music and resumes it on close

Media rule:

- store `videoUrl` on the semantic object / premium offer metadata, not in a hardcoded client branch
- current demo URL:
  - `https://www.youtube.com/watch?v=bfWPr_qMQmc`
- future target:
  - replace the URL with CDN or staked media without changing the interaction pattern

Metadata rule:

- use `trigger: "proximity"`
- include `proximityCooldownMs` so the popup reads like a joke, not a spam trap
- store `tile`, `eventBindings`, and the spoofed CTA label in `metadataJson`
- do not attach a real `premiumOfferKey` for this first pass; the banner is intentionally fake
- keep the pit tiles directly below the rug blocked in the Cozy Cabin collision grid for both players and NPCs

## Minimal Data Shapes

Do not introduce new tables for this first pass.

### Zone

This already maps directly to `worldZones`.

```ts
type ZoneSeed = {
  mapName: "Cozy Cabin";
  zoneKey: string;
  name: string;
  description?: string;
  zoneType: string;
  x: number;
  y: number;
  width: number;
  height: number;
  tags: string[];
  accessType?: "public" | "restricted" | "premium";
  metadataJson?: string;
};
```

### Interactable

This should be represented as a `semanticObject` plus a small JSON payload in `metadataJson`.

```ts
type InteractableSeed = {
  mapName: "Cozy Cabin";
  objectKey: string;
  label: string;
  objectType: string;
  sourceType: "mapObject" | "scene" | "virtual";
  zoneKey?: string;
  x?: number;
  y?: number;
  tags: string[];
  affordances: string[];
  valueClass?: "utility" | "trade" | "premium" | "cultural" | "decor";
  metadataJson?: string;
};
```

Suggested `metadataJson` shape:

```ts
type InteractableMeta = {
  tile?: { x: number; y: number };
  trigger?: "proximity" | "interact" | "timed" | "payment-complete";
  freeActions?: string[];
  paidActions?: string[];
  eventBindings?: {
    inspect?: string;
    interact?: string;
    paid?: string;
  };
  premiumOfferKey?: string;
  roomLabel?: string;
  notes?: string;
};
```

### Event Trigger

Do not make a separate persisted trigger table yet.

Represent trigger intent in `semanticObjects.metadataJson`, then resolve it in the current client/runtime and emit a `worldEvents` row through `worldState.appendEvent`.

```ts
type EventTrigger = {
  triggerType: "proximity" | "interact" | "timed" | "payment-complete";
  objectKey?: string;
  zoneKey?: string;
  eventType: string;
  summary: string;
  premiumOfferKey?: string;
  factKeyOnSuccess?: string;
};
```

### Inventory Pickup

For pickup-first objects like the broom, use the existing item layer directly:

- `itemDefs` defines what the broom is
- `worldItems` places it on the map
- optional `semanticObjects` entry can add inspect text, lore, or dialogue routing

```ts
type PickupBinding = {
  itemDefName: string;
  worldX: number;
  worldY: number;
  quantity?: number;
  pickupEventType: string;
  inspectEventType?: string;
  unlockFactKey?: string;
};
```

### Optional x402 Offer Binding

Use the existing `premiumContentOffers` row and bind it back to a world object by convention plus `metadataJson`.

```ts
type X402OfferBinding = {
  offerKey: string;
  agentId: string;
  title: string;
  description: string;
  provider: "x402-stacks";
  priceAsset: "STX" | "sBTC";
  priceAmount: string;
  network?: "testnet" | "mainnet";
  endpointPath: string;
  status: "draft" | "active" | "disabled";
  metadataJson?: string;
};
```

Suggested `metadataJson` payload:

```ts
type OfferMeta = {
  mapName: "Cozy Cabin";
  zoneKey?: string;
  objectKey?: string;
  delivery: "npc-briefing" | "lore-packet" | "rumor" | "quote-json";
  unlockEventType?: string;
  unlockFactKey?: string;
  resourceId?: string;
};
```

## Premium Interactable Contract

Premium content should be world-triggered, not wallet-first.

Minimal backend shape:

```ts
type PremiumTriggeredInteractable = {
  interactableId: string;      // maps to semanticObjects.objectKey
  zoneId?: string;             // maps to semanticObjects.zoneKey
  triggerType: "interact" | "proximity" | "payment-complete";
  premiumOfferKey?: string;    // maps to premiumContentOffers.offerKey
  freeAction?: string;         // maps to metadata.freeActions[0]
  premiumAction?: string;      // maps to metadata.paidActions[0]
  successEventType?: string;   // maps to metadata.eventBindings.paid or offer metadata
};
```

Current TinyRealms mapping:

- `interactableId` -> `semanticObjects.objectKey`
- `zoneId` -> `semanticObjects.zoneKey`
- `triggerType` -> `semanticObjects.metadataJson.trigger`
- `premiumOfferKey` -> `semanticObjects.metadataJson.premiumOfferKey`
- `freeAction` -> `semanticObjects.metadataJson.freeActions[0]`
- `premiumAction` -> `semanticObjects.metadataJson.paidActions[0]`
- `successEventType` -> `semanticObjects.metadataJson.eventBindings.paid`

## Runtime Flow

Keep the flow world-native:

1. Player enters a zone or approaches an interactable.
2. Runtime resolves the nearest semantic object.
3. If the object has a free action, the game shows the standard interaction prompt.
4. If the object also has `premiumOfferKey`, the game shows an in-world premium action prompt.
5. On premium confirm:
   - query the mapped offer from Convex
   - resolve the `endpointPath`
   - run `x402Fetch(...)`
   - on success, append `worldEvents`
   - optionally upsert a `worldFact`
6. The result is shown back in an in-world premium panel, not a detached payment product surface.

Current implementation seam:

- interactable detection: `src/engine/Game.ts`
- offer lookup: `convex/integrations/x402.ts`
- payment boundary: `services/x402-api`
- world event/state writes: `convex/worldState.ts`

## Future Content Model

Use the same contract for these objects:

| Interactable | Free | Premium | Success |
| --- | --- | --- | --- |
| `bookshelf-lore` | inspect shelf, read titles | unlock lesson / lore packet / market brief | `bookshelf-premium-unlocked` |
| `beer-service` | inspect bar, talk to bartender | buy beer | rumor, buff, dialogue branch |
| `coffee-service` | inspect, sip | premium roast / tribute / routine buff | coffee world event or buff fact |
| `broom-stand` | inspect, take | none at first | inventory pickup / quest hook |
| `wax-cylinder` | inspect artifact | play recording / unlock archive / memory fragment | artifact event, premium memory, later NFT claim |

Principles:

- scenes may later fit a world-registry concept
- portable collectibles like wax cylinders fit an artifact/item concept
- premium access stays offchain through `x402` first
- only move onchain when provenance or ownership truly matters

## Recommended Event Names

Keep names flat and readable.

Free events:

- `coffee-inspected`
- `coffee-sipped`
- `bookshelf-inspected`
- `bookshelf-titles-read`
- `bar-entered`
- `music-corner-entered`

Paid-complete events:

- `bookshelf-premium-unlocked`
- `beer-purchased`
- `coffee-premium-purchased`
- `phonograph-premium-activated`

Pickup events:

- `broom-inspected`
- `broom-taken`

Optional persistent fact keys:

- `cozy-cabin:bookshelf:premium-unlocked`
- `cozy-cabin:beer:rumor-unlocked`
- `cozy-cabin:coffee:routine-buff`
- `cozy-cabin:broom:lesson-unlocked`

## Example Rows

### Coffee semantic object

This can be seeded now without adding new runtime systems.

```ts
await upsertSemanticObject(ctx, {
  mapName: "Cozy Cabin",
  objectKey: "coffee-service",
  label: "Coffee",
  objectType: "consumable",
  sourceType: "scene",
  zoneKey: "bar-hub",
  x: 1080,
  y: 1392,
  tags: ["coffee", "tavern", "social", "comfort"],
  affordances: ["inspect", "sip"],
  valueClass: "utility",
  metadataJson: JSON.stringify({
    tile: { x: 45, y: 58 },
    trigger: "interact",
    freeActions: ["inspect", "sip"],
    eventBindings: {
      inspect: "coffee-inspected",
      interact: "coffee-sipped",
    },
    roomLabel: "bar-hub",
    notes: "Free tavern consumable for early social state and future routine buffs.",
  }),
});
```

### Bookshelf semantic object

```ts
await upsertSemanticObject(ctx, {
  mapName: "Cozy Cabin",
  objectKey: "bookshelf-lore",
  label: "Bookshelf",
  objectType: "knowledge",
  sourceType: "scene",
  zoneKey: "guide-wing",
  x: 888,
  y: 240,
  tags: ["books", "lore", "education", "research"],
  affordances: ["inspect", "read", "unlock"],
  valueClass: "utility",
  metadataJson: JSON.stringify({
    tile: { x: 37, y: 10 },
    trigger: "interact",
    freeActions: ["inspect", "read-titles"],
    paidActions: ["unlock-lesson"],
    eventBindings: {
      inspect: "bookshelf-inspected",
      interact: "bookshelf-titles-read",
      paid: "bookshelf-premium-unlocked",
    },
    premiumOfferKey: "cozy-cabin-bookshelf-brief",
    roomLabel: "study-wing",
    notes: "Educational paywall surface for guide.btc-style premium lore and briefings.",
  }),
});
```

### Bookshelf x402 offer

This is the narrowest way to make the bookshelf premium-capable later.

```ts
await upsertOffer(ctx, {
  offerKey: "cozy-cabin-bookshelf-brief",
  agentId: "guide-btc",
  title: "Bookshelf premium brief",
  description: "Unlock a deeper lesson, market briefing, or research note from the Cozy Cabin shelf.",
  provider: "x402-stacks",
  priceAsset: "STX",
  priceAmount: "1",
  network: "testnet",
  endpointPath: "/api/premium/guide-btc/bookshelf-brief",
  status: "draft",
  metadataJson: JSON.stringify({
    mapName: "Cozy Cabin",
    zoneKey: "study-wing",
    objectKey: "bookshelf-lore",
    delivery: "lore-packet",
    unlockEventType: "bookshelf-premium-unlocked",
    unlockFactKey: "cozy-cabin:bookshelf:premium-unlocked",
    resourceId: "cozy-cabin-bookshelf-brief",
  }),
});
```

### Broom item definition

The broom should be a real item, not just a semantic prop.

```ts
await saveItem(ctx, {
  profileId,
  name: "witchwood-broom",
  displayName: "Witchwood Broom",
  description: "An old academy broom with just enough personality to suggest it once mattered.",
  type: "quest",
  rarity: "uncommon",
  stackable: false,
  value: 25,
  tags: ["broom", "academy", "flight", "quest", "lore"],
  lore: "Recovered from the Cozy Cabin. It may open a lesson, quest, or old branch of local lore.",
  visibilityType: "system",
});
```

### Broom world item

This is the correct first-pass representation for pickup behavior.

```ts
await ctx.db.insert("worldItems", {
  mapName: "Cozy Cabin",
  itemDefName: "witchwood-broom",
  x: 1176,
  y: 432,
  quantity: 1,
  updatedAt: Date.now(),
});
```

### Optional broom semantic wrapper

Add this only if inspect text or dialogue routing is needed before pickup.

```ts
await upsertSemanticObject(ctx, {
  mapName: "Cozy Cabin",
  objectKey: "broom-stand",
  label: "Broom",
  objectType: "misc",
  sourceType: "scene",
  x: 1176,
  y: 432,
  tags: ["broom", "academy", "flight", "cleanup", "lore"],
  affordances: ["inspect", "take"],
  valueClass: "utility",
  metadataJson: JSON.stringify({
    tile: { x: 49, y: 18 },
    trigger: "interact",
    freeActions: ["inspect", "take"],
    eventBindings: {
      inspect: "broom-inspected",
      interact: "broom-taken",
    },
    itemDefName: "witchwood-broom",
    notes: "Inventory-facing interactable. Pickup should flow through worldItems and profile inventory.",
  }),
});
```

## Where This Should Live

Keep it incremental.

### Data seed and semantic ownership

- `convex/localDev.ts`
  - add or refine Cozy Cabin `worldZones`
  - seed `semanticObjects` for coffee, bookshelf, beer surface, bartender surface, and optional broom wrapper
  - keep room-level semantic names stable here
- `convex/items.ts`
  - define broom item if it becomes a real pickup
- `convex/worldItems.ts`
  - use the existing pickup path for broom placement and inventory transfer

### World event emission

- `convex/worldState.ts`
  - no schema rewrite needed
  - keep using `appendEvent`

### Offer metadata

- `convex/integrations/x402.ts`
  - use existing `upsertOffer`
- `convex/localDev.ts`
  - seed draft or active offer rows

### Paid execution

- `services/x402-api/src/server.ts`
  - add new endpoint only when an interaction is actually ready to monetize
  - do not add placeholder endpoints for every tavern prop

### Room labels and portal targets

- `public/assets/maps/cozy-cabin.json`
  - add room-level `labels` for destination names such as `bar-hub`, `guide-wing`, `study-wing`, `music-corner`, `back-room`
  - keep furniture labels for local staging

### Frontend/runtime hookup

- `src/engine/ObjectLayer.ts`
  - stays the narrow object-interaction surface
- `src/engine/Game.ts`
  - only if a small interaction handoff is needed
- `src/splash/screens/*`
  - use these for higher-value custom premium surfaces, not for every minor prop

## Incremental Implementation Order

1. Add room-level labels to Cozy Cabin.
2. Seed `bar-hub` and `guide-wing` interactables in `convex/localDev.ts`.
3. Add broom as a real pickup using `itemDefs` + `worldItems`.
4. Emit free events for coffee, bookshelf, and broom interactions.
5. Add one paid offer only after the free interaction layer feels correct.
6. Route that paid action through `services/x402-api`.
7. Append a matching world event and optional world fact on success.

## Execution Plan

This is the recommended implementation sequence for the next sprint.

### Phase 1: Topology and labels

Goal:

- make Cozy Cabin spatially legible for semantics, portals, and future cut scenes

Files:

- `public/assets/maps/cozy-cabin.json`
- `convex/localDev.ts`

Tasks:

- add room-level map labels:
  - `entry-hall`
  - `guide-wing`
  - `market-wing`
  - `bar-hub`
  - `rest-nook`
  - `back-room`
  - `music-corner`
- keep existing furniture labels such as `phonographchair`
- seed matching `worldZones` in `localDev.ts`

Done when:

- room labels are visible and stable in the editor/runtime
- semantic zones and room labels refer to the same spaces

### Phase 2: Free semantic objects

Goal:

- prove that non-NPC objects can matter in the world before monetizing them

Files:

- `convex/localDev.ts`
- `convex/worldState.ts`
- small runtime hook only if needed:
  - `src/engine/ObjectLayer.ts`
  - `src/engine/Game.ts`

Tasks:

- seed `coffee-service`
- seed `bookshelf-lore`
- append free world events for:
  - `coffee-inspected`
  - `coffee-sipped`
  - `bookshelf-inspected`
  - `bookshelf-titles-read`

Done when:

- the objects exist in Convex
- the player can trigger a readable world event for each free interaction

### Phase 3: Real pickup item

Goal:

- prove the item/inventory loop using an in-world artifact

Files:

- `convex/items.ts`
- `convex/worldItems.ts`
- `convex/localDev.ts`

Tasks:

- create `witchwood-broom` item definition
- place broom as a `worldItems` row
- optionally add `broom-stand` semantic wrapper for inspect text
- append `broom-inspected` and `broom-taken` events

Done when:

- the broom can be picked up
- it lands in inventory
- the world feed reflects the pickup

### Phase 4: First paid object

Goal:

- attach one premium interaction to a world object without broadening the payment architecture

Files:

- `convex/integrations/x402.ts`
- `convex/localDev.ts`
- `services/x402-api/src/server.ts`
- existing guide-facing UI surface or a minimal bookshelf interaction surface

Tasks:

- seed `cozy-cabin-bookshelf-brief` offer metadata
- add one paid endpoint for bookshelf premium unlock
- on success:
  - append `bookshelf-premium-unlocked`
  - optionally set `cozy-cabin:bookshelf:premium-unlocked`

Done when:

- bookshelf has a free inspect path
- bookshelf has a paid unlock path
- the x402 result returns structured JSON
- the world feed shows the unlock outcome

### Phase 5: Flagship premium loop

Goal:

- connect the world-object foundation back to the music / wax-cylinder thesis

Files:

- `convex/localDev.ts`
- phonograph interaction surface
- `services/x402-api/src/server.ts`
- any supporting story or UI files needed for the single premium quest flow

Tasks:

- make phonograph interaction meaningful
- introduce wax-cylinder discovery or claim path
- unlock music or proof state
- append world event and optional onchain proof

Done when:

- the player can complete one artifact loop end to end

## Recommended Order of Shipping

Ship in this order:

1. room labels and zones
2. coffee free interaction
3. broom pickup
4. bookshelf free interaction
5. bookshelf paid unlock
6. phonograph premium quest loop
7. beer later

## Resource Requirements

Required now:

- current local Convex environment
- one stable AI provider path
- one player testnet wallet once bookshelf payment starts
- one service wallet for x402 grant flow

Not required for the first three phases:

- more AI providers
- USDCx
- SFT infrastructure
- separate funded wallets for every agent

## Agent-Agent Cadence and UI

Use a two-layer model.

### 1. Fast background simulation

Keep the existing server NPC loop as the cheap heartbeat.

- `convex/npcEngine.ts` already runs a self-scheduling tick every `1500ms`
- it already simulates nearby NPC trade with a cooldown and coin/item transfer
- this layer should stay deterministic and low-cost

Use this layer for:

- movement
- post patrol
- proximity trade checks
- inventory and coin deltas
- intent and mood updates

Do not call paid AI models from this loop.

### 2. 10-minute economic epoch

If we want a Bitcoin-like cadence, make it a settlement rhythm, not a per-agent popup rhythm.

Recommended shape:

- keep micro-actions offchain in Convex during the fast loop
- every 10 minutes, run one scheduled digest/settlement mutation
- summarize meaningful changes into a small number of durable outcomes

That 10-minute job should do things like:

- aggregate recent NPC-to-NPC trades
- write one or a few `worldEvents` rows for the epoch
- update any zone-level or agent-level `worldFacts`
- optionally mark one trade, rumor, or premium change as player-visible

This keeps the world active without spamming the feed or burning API credits.

### 3. When AI calls are allowed

Only call Braintrust/OpenAI/Gemini when a state change is material.

Good triggers:

- player initiates a premium action
- an epoch produces a new rumor or market summary worth showing
- an unlock or quest milestone is reached
- an agent needs to generate one digest, briefing, or narration block

Bad triggers:

- every background trade
- every patrol change
- every 10-minute tick regardless of state

### 4. Popup and UI hierarchy

Do not treat all interactions equally.

Use four UI levels:

1. ambient world feed
   - for routine agent-agent activity
   - examples: `market.btc traded 1 map fragment to toma-merchant`
2. small toast / nearby chip
   - for local state changes near the player
   - examples: `Rumor unlocked`, `Coffee buff active`
3. speech bubble / lightweight panel
   - for nearby agent-agent interactions that matter to the story
   - only if the player is close enough to care
4. full splash / premium modal
   - for player-facing paid actions, quest decisions, or collectible claims

Rule:

- routine autonomous interactions should show up in the World Feed first
- popups should be reserved for material, local, or premium events

### 5. Recommended next implementation

Do not add a new cron service outside Convex.

Instead:

1. keep `npcEngine` as the fast loop
2. add one internal scheduled epoch job in Convex for every 10 minutes
3. have that job write aggregated `worldEvents`
4. expose those events through the existing world feed UI
5. only after that, add richer nearby agent-agent presentation if needed

This is the cheapest path to an autonomous-feeling world that still reads clearly in the demo.

## Recommendation

The best first premium interactable here is the bookshelf, not the beer.

Reason:

- it fits the existing `guide.btc` educational surface
- it has a natural free-to-paid ladder
- it uses the current x402 architecture cleanly
- it does not require a new tavern-service UI pattern first

Coffee should be the first free semantic object.
Broom should be the first real pickup item.
Bookshelf should be the first paid semantic object.
Beer should come after the bar interaction pattern exists.
