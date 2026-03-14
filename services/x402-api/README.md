# stacks2d x402 API

This service is the separate x402 payment boundary for `stacks2d`.

Current scope:
- one premium endpoint: `/api/premium/guide-btc`
- one metadata endpoint: `/api/premium/guide-btc/metadata`
- STX on testnet first

Current truth:
- this folder is a scaffolded service app
- payment execution is not verified until dependencies are installed, env vars are set, and the service is run
- the game runtime should consume this service as an external boundary, not embed payment logic into Pixi or Convex UI files

## Environment

Copy `.env.example` into your runtime environment and set:
- `SERVER_ADDRESS`
- `NETWORK`
- `FACILITATOR_URL`
- `GUIDE_PREMIUM_PRICE_STX`

## Endpoints

### `GET /health`
Health and configuration status.

### `GET /api/premium/guide-btc/metadata`
Returns the current premium guide endpoint contract without requiring payment.

### `GET /api/premium/guide-btc`
x402-protected premium endpoint for the guide briefing.

## Why this exists

This keeps the architecture clean:
- `Apps/tinyrealms` = world, UI, simulation, Convex state
- `services/x402-api` = payment-required HTTP surface

That separation is deliberate. It prevents payment logic from leaking into the core game runtime.
