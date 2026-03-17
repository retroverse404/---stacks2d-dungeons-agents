---
title: Cozy Cabin Interactables Testing Log
date: 2026-03-17
updated: 2026-03-17
status: notes
tags:
  - testing
  - interactables
  - cozy-cabin
  - world-inspection
---

# Cozy Cabin Interactables Testing Log

This note captures the ongoing exploratory testing and environmental analysis for the Cozy Cabin interactables (coffee, beer, bookshelf, broom, wax cylinder, etc.). Use it to document what has been observed, what triggers were exercised, and where premium/x402 panels should appear.

## Environment Checks

- `Convex` maps (`worldZones`, `semanticObjects`, `premiumContentOffers`) were verified in `convex/localDev.ts`. Zones align with the spec (`bar-hub`, `study-wing`, `music-corner`, etc.).
- Runtime path: `src/engine/Game.ts` resolves proximity + semantic objects, `convex/worldState.ts` writes events.
- Paid rail: `convex/integrations/x402.ts` bridges to `services/x402-api`. No other premium path exists.
- Observed world coordinates with HUD:
  - coffee (tile 68,23 / X:1637 Y:576) in upper-right lounge
  - bar/beer (tile 36,33 / X:881 Y:802)
  - bookshelf (tile 37,10 / X:895 Y:251) in study wing
  - broom (tile 49,18 / X:1194 Y:443)
  - wax cylinder/phonograph (tile 78,58 / X:1891 Y:1399) in lower-right music corner

## Tested Interactions

1. Coffee inspect
   - Verified no premium when walking up to coffee table.
   - Suggest future x402 popup for `premium roast` event.
2. Beer/bar
   - Status: still a stub; no hook yet.
   - Next: map semantic object to bar counter and trigger `buy-beer`.
3. Bookshelf lore
   - Free action loads `inspect` prompt; paid action pending.
4. Broom pickup
   - Game allows walk-up; needs inventory pop-up + addition to `worldEvents`.
5. Wax cylinder
   - Area shows nothing currently; plan premium popup message `Play wax cylinder`.
   - Need event `phonograph-premium-activated` after payment.

## Next Testing Steps

1. Hook semantic object metadata:
   - Add `premiumOfferKey` for each object in `semanticObjects.metadataJson`.
   - Confirm `worldEvents`/`worldFacts` update on paid completion.
2. Simulate x402 payment:
   - Use `services/x402-api` to pull `market-btc` template; adapt for other offers.
3. Validate UI triggers:
   - Ensure interactable proximity results in popup before wallet flow.
   - Trace logs from `Game.ts` to `convex/worldState.ts`.

## Observations

- Nothing happens at the phonograph because we have not added the interactable metadata yet (no popup or premium action defined).
- Environment data should stay in this note instead of scattered screenshots; link to spec for single source of truth.

Link this log from the main spec for quick navigation.
