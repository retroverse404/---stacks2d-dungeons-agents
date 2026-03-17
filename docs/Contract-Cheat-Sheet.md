# Contract Cheat Sheet

Purpose: explain the live and planned contract layer in plain English without Clarity jargon.

Audience:
- builders who want the shortest possible explanation
- reviewers trying to map world features to contracts

Last verified: 2026-03-17

## Short Version

Use this mental model:

- `premium-access-v2`
  - **Did this wallet unlock this premium thing?**

- `world-lobby`
  - **Can this wallet enter this room?**

- `world-objects`
  - **Can this wallet use this object?**

- `SIP-009 NFT`
  - **Does this wallet own this unique artifact?**

- future `SFT`
  - **How many repeatable game items/resources does this wallet have?**

- future `SIP-010`
  - **How much fungible currency does this wallet have?**

## What `world-objects` Actually Is

`world-objects` is a custom app contract.

It is **not**:

- a token contract
- an NFT contract
- an SFT contract
- a currency contract

It is a simple permission contract for important world props.

Think of it as a **door lock list for objects**.

Examples:

- phonograph
- price board
- premium terminal
- relic console
- special quest board

It answers one question:

**Can this wallet use this object right now?**

## What `world-objects` Stores

For each object, it can store:

- object id
- zone key
- object type
- access mode
- whether the object is active

And for each wallet, it can store:

- object id
- wallet principal
- whether access was granted

## Example

### Phonograph

- object id: `phonograph-player`
- access mode: `premium`
- active: `true`

After a player pays for a memory fragment:

- `premium-access-v2` can prove the unlock happened
- `world-objects` can say that wallet may use `phonograph-player`
- `wax-cylinder-nft` can later represent ownership of the relic itself

That is why these contracts are separate.

## Why This Split Is Good

It keeps responsibilities clean:

- payment proof is not mixed with room access
- room access is not mixed with object access
- object access is not mixed with artifact ownership
- unique artifacts are not mixed with repeatable game items

## Current Live Contracts

- `premium-access-v2`
- `world-lobby`
- `world-objects`
- `floppy-disk-nft`
- `cassette-nft`
- `wax-cylinder-nft`
- `qtc-token`
- `sft-items`

## Deployed But Not Yet Live In Gameplay

- `qtc-token`
  - deployed as the future SIP-010 currency layer
  - not yet part of the live demo economy
- `sft-items`
  - deployed as the future repeatable item layer
  - not yet wired into live gameplay loops

## Practical Examples

### Bookshelf premium brief

- pay through `x402`
- proof recorded in `premium-access-v2`

### Premium room later

- room entry controlled by `world-lobby`

### Premium phonograph later

- object use controlled by `world-objects`

### Wax cylinder collectible

- ownership represented by `wax-cylinder-nft`

### Coffee / beer / dungeon keys later

- repeatable items fit the future `SFT` layer

## Item Type Examples

Use these examples as the clean taxonomy:

| Thing | Category |
|---|---|
| bookshelf | world object |
| phonograph | world object |
| broom | offchain inventory item |
| coffee | SFT item later |
| beer | SFT item later |
| tavern supply | SFT item later |
| quest credit | SFT item later |
| dungeon key | SFT item later |
| music pass | SFT item later |
| wax cylinder | NFT artifact |
| cassette | NFT artifact |
| floppy disk | NFT artifact |
| STX | live currency |
| QTC | future SIP-010 currency |
