# GameFi Backlog

Purpose: keep the GameFi and SFT direction explicit without treating it as part of the current demo claim.

Audience:
- builders planning the next contract and economy layers
- reviewers who need to distinguish current proof from future scope

Last verified: 2026-03-17

## Current Position

GameFi is part of the intended direction of `tinyrealms`.

It is **not** the primary proof loop for the current submission.

Current live claim:
- STX via `x402` is the demo currency
- premium actions settle in STX
- post-payment proof lands on Stacks
- media artifacts exist as SIP-009 contracts

Backlog claim:
- repeatable game resources
- semi-fungible items
- tavern consumables as tokenized items
- quest materials
- dungeon keys
- future fungible in-game currency

## Priority Order

### 1. Current demo lane

- world-triggered premium interactions
- STX payments through `x402`
- `premium-access-v2` proof
- World Feed consequence

### 2. Current collectible lane

- `wax-cylinder-nft`
- `cassette-nft`
- `floppy-disk-nft`

### 3. Deployed but not integrated

- `sft-items.clar`
- `qtc-token.clar`

These now exist on testnet, but they still need:

- seeded item classes
- gameplay wiring
- visible balances
- mint/spend flows
- demo evidence

### 4. Later economy lane

- full tavern/dungeon itemization
- gameplay mint and burn rules
- real `QTC` distribution and spend flows

## SFT Candidates

The best SFT candidates are not unique relics. They are repeatable game-state items.

Examples:
- coffee
- beer
- tavern supplies
- dungeon keys
- crafting materials
- quest credits
- access passes

## Practical Rule

Use:
- `SIP-009` for unique artifacts with cultural or collectible meaning
- `SFT` for repeatable item classes and resources
- `SIP-010` for currency once a real gameplay economy is ready to use it

That keeps the asset model clean instead of forcing every world object into the same token type.
