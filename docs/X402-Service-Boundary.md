# X402 Service Boundary

This document records the intended service boundary for x402 payment-required endpoints in `stacks2d`.

## Current Truth

- Premium offer metadata exists in Convex.
- The world UI can display premium offer details.
- The repo now contains a separate service scaffold at `services/x402-api`.
- Real x402 payment execution is **not** yet verified in this repo until that service is installed, configured, and run.

## Why a Separate Service

Payment logic should not live inside:
- Pixi rendering
- HUD code
- NPC movement
- map logic

The game should expose semantic surfaces and offers.
The x402 service should enforce payment-required access to premium resources.

## Initial Endpoint

- `GET /api/premium/guide-btc`

Supporting endpoint:
- `GET /api/premium/guide-btc/metadata`

## Initial Asset Rail

- `STX` on `testnet`

This is the narrowest credible first payment path.

## Expected Flow

1. `guide.btc` exposes a premium offer in-world.
2. The offer metadata references `/api/premium/guide-btc`.
3. The x402 API returns either:
   - metadata / health status, or
   - an HTTP 402 payment requirement
4. A wallet or agent client pays.
5. The service returns premium content.
6. Later, Convex can record a matching world event or unlock receipt.

## What Is Not Claimed Yet

- No verified payment settlement in this repo yet
- No verified facilitator integration in runtime yet
- No verified wallet client flow in the game yet
- No verified Clarity proof contract yet

## Next Steps

1. Install dependencies in `services/x402-api`
2. Run the service locally with a funded testnet address
3. Verify `GET /health`
4. Verify `GET /api/premium/guide-btc/metadata`
5. Verify the x402 402-response flow
6. Then connect the guide surface to the real endpoint
