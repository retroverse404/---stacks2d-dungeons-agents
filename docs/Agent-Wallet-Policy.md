# Agent Wallet Policy

This note calibrates how wallet-backed agents should work in `stacks2d (tinyrealms)` during the current testnet phase.

## Current Decision

For the current implementation phase:

- core named agents may each have their own **testnet wallet**
- wallet identity and wallet execution permissions are **not the same thing**
- only a small subset of agents should be allowed to execute payments or trades at first

## Why

This preserves:

- a clean wallet-backed agent model
- a clean onchain identity story
- low operational risk
- a sane permission model

It avoids:

- giving every NPC uncontrolled spending power
- mixing wallet logic into the core game runtime
- creating avoidable security and debugging problems

## Agent Classes

### 1. Identity-only agents

These agents have a testnet wallet address but do not actively execute payments or trades yet.

Examples:
- `guide.btc`
- `quests.btc`
- `radio.btc`

### 2. Service-capable agents

These agents can expose paid services or premium content paths, but may not directly execute onchain trades yet.

Examples:
- `guide.btc`
- `broker.btc`

### 3. Execution-capable agents

These agents can be permitted to execute limited payment, quote, or trade flows on testnet.

Examples:
- `market.btc`
- `broker.btc`

## Required Registry Shape

Each wallet-backed agent should eventually map to:

- `agentId`
- `displayName`
- `network`
- `stxAddress`
- `btcAddress` optional
- `walletRole`
- `enabledAssets`
- `status`

## Asset Focus

During the current testnet phase, the relevant assets are:

- `STX`
- `sBTC`
- later `USDCx`

## Implementation Rule

Do not scatter wallet details through UI code, NPC prompts, or renderer logic.

Wallet-backed agent identity should be represented through:

- backend registry
- semantic role assignment
- explicit permission level

## Current Recommendation

Start with a small named cast only:

- `guide.btc`
- `market.btc`
- `quests.btc`
- `broker.btc`

Then enable real execution for only one or two of them first.
