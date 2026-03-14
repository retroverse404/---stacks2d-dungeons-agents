# AIBTC Integration Status

Updated: 2026-03-14

## Current Truth

AIBTC is **not yet live as an integrated agent runtime inside this app**.

Current implementation is limited to:

- architecture direction
- source/KB references
- content alignment around AIBTC-style agents
- backend scaffolding compatible with future agent patterns

## Not Implemented Yet

- agent registration
- heartbeat
- MCP/server integration
- in-world skill execution
- agent account wallet flow
- Bitflow swap execution in gameplay

## Live Today

- Braintrust AI path
- Zero Authority integration
- `guide.btc` UI/content flow
- x402 premium-offer metadata scaffold
- agent state scaffold
- AIBTC-compatible `agentRegistry` schema
- planned `agentAccountBindings` schema aligned with owner/agent/allowlist permissions

## Public Claim Rule

Safe claim:

- `stacks2d` is being designed with a modular path toward AIBTC-style agent workflows.

Unsafe claim:

- AIBTC agents are already integrated and operating in-world.

## Next Credible Step

Integrate one real AIBTC-connected agent with one narrow capability, through a modular external service layer.

## Official Schema Alignment

The current repo is now aligned to the official AIBTC direction at the schema level:

- `agentRegistry`
  - stable agent id
  - role
  - network
  - wallet identity
  - permission tier
  - supported assets
  - home world/map/zone
- `agentAccountBindings`
  - owner address
  - agent address
  - account contract id
  - allowlisted contracts
  - granular permissions for proposals / contract approval / asset trading

This matches the official AIBTC agent-account model conceptually, while remaining honest that no live account binding or tool execution is active yet.
