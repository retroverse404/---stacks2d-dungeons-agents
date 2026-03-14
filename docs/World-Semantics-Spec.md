# World Semantics Spec

Updated: 2026-03-14

## Purpose

This spec defines the missing layer between:

- a playable 2D world
- and a real agentic economy/simulation

The goal is to stop NPCs from behaving like random movers and turn them into world-aware actors.

---

## Problem

Current NPC behavior is still prototype-grade:

- too much random wandering
- overlapping and spatial collisions
- weak sense of place
- weak sense of nearby objects
- weak sense of value
- weak role identity

This is not enough for:

- agentic worldbuilding
- autonomous world simulation
- GameFi / creator economy loops
- “AI town” / AIBTC-style agent behavior

---

## Design Rule

AI should not replace the engine.

AI should sit on top of structured world semantics.

Use this layering:

1. engine
2. world state
3. world semantics
4. agent state machine
5. AI reasoning / DM layer

---

## Required Semantic Layers

## 1. Zones

Maps need semantic zones, not just collision and labels.

Examples:

- `guide-zone`
- `market-zone`
- `swap-zone`
- `quest-zone`
- `arrival-zone`
- `public-lounge`
- `restricted`

Each zone should support:

- `id`
- `name`
- `type`
- `bounds`
- `tags`
- `allowedRoles`
- `priority`

Example use:

- a small rug, carpet, platform, or marked floor area can be a real semantic zone rather than decoration
- stepping onto that zone can trigger a scene, briefing, premium interaction, or sponsored placement
- this allows the same location mechanic to later support x402-gated scenes, sponsor-funded content, or branded encounters without rewriting the engine

## 2. Objects

Objects need semantic meaning.

Examples:

- quest board
- swap terminal
- market screen
- guide desk
- premium terminal
- display case
- vending machine

Each object should support:

- `id`
- `name`
- `type`
- `position`
- `interactionType`
- `tags`
- `valueType`
- `ownerRole`
- `state`

Suggested tags:

- `valuable`
- `public`
- `educational`
- `trade`
- `swap`
- `premium`
- `quest`
- `analytics`
- `identity`
- `sponsored`
- `scene-trigger`

Suggested interaction types:

- `inspect`
- `talk`
- `open-scene`
- `open-premium-scene`
- `open-sponsored-scene`

Example:

- the small red rug in `Cozy Cabin` can be treated as a `scene-trigger` surface
- that trigger can open a lore scene, premium scene, or sponsored scene
- the underlying mechanic should be generic even if the first use is advertising revenue

## 3. NPC Roles

Each NPC needs a defined world role.

Examples:

- `guide`
- `merchant`
- `broker`
- `quest-giver`
- `analyst`
- `observer`
- `builder`
- `agent-runner`

Each role should define:

- home zone
- allowed zones
- default state
- object preferences
- conversation focus
- economy permissions

## 4. Value Model

The world must know what is valuable.

Examples:

- information
- access
- credentials
- opportunities
- inventory
- tokens
- premium content

This is necessary for:

- GameFi loops
- premium content
- agent-to-agent transactions
- future x402 flows
- sponsor-funded scene placement
- paid or free branded encounters
- commercial surfaces that feel like world interactions instead of UI popups

## 5. Sponsored Scene Surfaces

Some locations should be able to act as reusable commercial or premium surfaces.

This should be modeled as world semantics, not as random ad UI.

Examples:

- a rug that triggers a sponsored scene
- a display pedestal with a branded collectible
- a wall sign that opens a featured quest or demo
- a premium corner that unlocks a paid lore sequence

Each sponsored surface should support:

- `slotId`
- `zoneId` or `objectId`
- `placementType`
- `sceneId`
- `accessRule`
- `sponsorId`
- `rewardRule`
- `eventSink`

Recommended rules:

- the world should treat these as `sponsored scene` or `featured scene` mechanics, not hardcoded ads
- x402 can gate access, unlock premium scenes, or settle sponsor-funded interactions
- the first implementation should be simple: one semantic zone, one content package, one access rule
- the same mechanic should later support ads, premium scenes, trailers, creator promos, and brand placements

---

## Agent State Model

Base states:

- `idle`
- `at-post`
- `patrolling`
- `guiding`
- `trading`
- `offering-premium`
- `awaiting-payment`
- `delivering`
- `blocked`

Required constraints:

- NPC should have assigned post or route
- NPC should have movement radius or allowed zone
- NPC should not drift endlessly
- NPC should avoid overlapping other NPCs
- NPC should prefer meaningful nearby objects

---

## Spatial Awareness Requirements

Each agent should be able to reason over:

- current map
- current zone
- nearby objects
- nearby NPCs
- nearest useful terminal
- nearest opportunity surface
- blocked tiles / walkable radius
- assigned post

This becomes the `scene context` for AI reasoning.

---

## AI / DM Layer

Gemini/Braintrust should be used for:

- scene interpretation
- world narration
- ranking useful nearby objects
- assigning meaning to environment
- helping build maps/world semantics
- high-level agent reasoning

Gemini should not be used for:

- collision
- low-level movement
- deterministic rule enforcement

---

## MVP Implementation Order

1. add semantic zone support
2. add semantic object tags
3. add sponsor / premium scene trigger support for selected zones
4. add NPC role + assigned post
5. add movement bounds / anti-overlap rules
6. add scene context builder
7. add AI reasoning over scene context

---

## Product Importance

This is a core requirement for the project.

Without this layer:

- the world feels random
- agents feel fake
- economy feels cosmetic

With this layer:

- the world becomes purposeful
- agents become believable
- GameFi loops become possible
- AIBTC/x402 can sit on top of meaningful simulation
