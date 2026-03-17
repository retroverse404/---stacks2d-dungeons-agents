# Project Timeline

Purpose: give a chronological map of the important milestones so the project can be understood in sequence.

Audience:
- maintainers
- reviewers
- demo prep

Last verified: 2026-03-17

## 2026-03-14 Foundation

- project reframed around a Stacks-facing TinyRealms fork
- semantic world model, agent economy framing, and x402 boundary documented
- AIBTC and Stacks integration direction clarified as modular, not engine-native
- SFT/GameFi noted as future architecture, not current implementation

Key notes:
- `Current State - Live Connectors, Agent Surfaces and x402 Scaffold`
- `AIBTC Integration Status - Current Truth`
- `Stacks GameFi SFT Context for Stacks2D`

## 2026-03-15 Payment Spine

- local `guide.btc` x402 flow verified
- premium payload contract clarified as JSON-first
- `premium-access-v2` deployed on Stacks testnet
- payment rail and contract proof separation documented cleanly

Key notes:
- `guide.btc End-to-End x402 Local Payment Verified`
- `premium-access-v2 Testnet Deployment Verified`
- `x402 Verification Progress - guide.btc`

## 2026-03-16 World Contracts and Market Loop

- `world-lobby` and `world-objects` deployed on testnet
- `market.btc` paid quote loop verified on testnet
- midnight.city and AI Town framing sharpened for product structure
- contract scope for assets and world objects clarified

Key notes:
- `world-lobby and world-objects deployed on testnet`
- `market-btc Testnet x402 Loop Verified`
- `Current TinyRealms Asset Mapping for Contract Scope`

## 2026-03-17 Runtime and Artifact Layer

- backend contract frozen around canonical domains
- 5-agent wallet/account bindings completed
- autonomous agent loop and guarded AI path expanded
- x402 `grant-access` wiring aligned with deployed proof contract
- three SIP-009 media artifact contracts deployed on testnet under Clarity 4:
  - `floppy-disk-nft`
  - `cassette-nft`
  - `wax-cylinder-nft`
- SFT and GameFi direction kept as an explicit backlog lane instead of being mixed into the live demo claim

## Reading the Timeline

The actual build sequence is:

1. world shell
2. semantic layer
3. x402 payment rail
4. proof contracts
5. wallet-backed agents
6. autonomous runtime
7. collectible artifact layer

That is the real dependency order.
