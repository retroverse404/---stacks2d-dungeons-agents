# stacks2d x402 API

This service is the separate x402 payment boundary for `stacks2d`.

Current scope:
- one premium endpoint: `/api/premium/guide-btc`
- one metadata endpoint: `/api/premium/guide-btc/metadata`
- one premium endpoint: `/api/premium/market-btc/quote`
- one metadata endpoint: `/api/premium/market-btc/metadata`
- STX on testnet first

Current truth:
- this folder is a real local x402 service app
- the local `guide.btc` payment path has been verified end-to-end in development
- hosted/public facilitator behavior is still a separate verification item
- the game runtime should consume this service as an external boundary, not embed payment logic into Pixi or Convex UI files

## Environment

Copy `.env.example` into your runtime environment and set:
- `SERVER_ADDRESS`
- `NETWORK`
- `FACILITATOR_URL`
- `GUIDE_PREMIUM_PRICE_STX`
- `MARKET_PREMIUM_PRICE_STX`
- `MARKET_SERVER_ADDRESS` (optional; falls back to `SERVER_ADDRESS`)
- `MARKET_NETWORK` (optional; falls back to `NETWORK`)
- `HIRO_API_KEY` (optional, server-side only)
- `HIRO_API_BASE_URL` (optional override)

Notes:
- `x402-stacks` is vendored locally under `Apps/tinyrealms/vendor/x402-stacks` because the upstream package/install path was not reliable enough for a portable demo environment.
- `FACILITATOR_URL` is optional; if omitted, this service now falls back to its own local facilitator-compatible `/supported`, `/verify`, and `/settle` endpoints.
- `HIRO_API_KEY` should never be exposed in the browser. Keep it in server-side env only.
- The current x402 middleware does not consume the Hiro key directly; this service now tracks Hiro config for backend-side settlement or broadcast work if a custom facilitator/fallback is added.

## Endpoints

### `GET /health`
Health and configuration status.

Current health response also reports:
- whether a Hiro API key is configured
- which Hiro node base URL the backend is aligned to

### `GET /api/premium/guide-btc/metadata`
Returns the current premium guide endpoint contract without requiring payment.

### `GET /api/premium/guide-btc`
x402-protected premium endpoint for the guide briefing.

Current response shape:
- structured JSON
- receipt/proof fields such as network, asset, price, and delivery time
- premium classification for the unlocked content

Important truth:
- the current verified payload is still closer to a premium receipt/proof envelope than a fully enriched classified briefing
- the next step is to keep the JSON contract and enrich the `guide.btc` briefing fields with backend-sourced context

### `GET /api/premium/market-btc/metadata`
Returns the current paid quote offer contract without requiring payment.

### `GET /api/premium/market-btc/quote`
x402-protected premium endpoint for live market quote delivery.

Current response shape:
- structured JSON
- token pair and amount input
- expected output amount
- source agent id and delivery timestamp

Important truth:
- the verified in-world payment loop for this endpoint is on testnet
- ALEX trade execution proof remains a separate mainnet AIBTC module proof

## Why this exists

This keeps the architecture clean:
- `Apps/tinyrealms` = world, UI, simulation, Convex state
- `services/x402-api` = payment-required HTTP surface

That separation is deliberate. It prevents payment logic from leaking into the core game runtime.

## Why JSON Matters

The premium payload should stay JSON-first because:

- the world UI can render it for humans
- agents can consume it directly
- future premium rooms, terminals, and objects can rely on the same interface contract

This is part of how the project scales from:
- one paid guide briefing
to:
- premium rooms (`world-lobby.clar`)
- premium objects (`world-objects.clar`)
- future passes/items (`sft-items.clar`)
