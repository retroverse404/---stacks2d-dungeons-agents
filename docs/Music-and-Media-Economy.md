# Music and Media Economy

This note captures how music, media, and collectible audio assets can fit into `stacks2d (tinyrealms)` without breaking the current architecture.

## Principle

Treat music and media as world objects first, economy primitives second, and onchain assets only when needed.

That keeps:
- the world playable
- the audio layer flexible
- the creator economy extensible
- onchain logic narrow and intentional

## Four Layers

### 1. Ambient Music

Use music for:
- map ambience
- station atmosphere
- faction mood
- cutscenes
- world identity

This should remain offchain.

### 2. Music and Media Objects

Examples:
- jukebox
- radio
- DJ booth
- listening station
- billboard screen
- commercial terminal
- tape deck
- vinyl shelf

These should become semantic world objects with:
- tags
- zone placement
- playback state
- optional owner or curator

## 3. Music and Media Economy

Examples:
- premium listening booth
- sponsored commercial slot
- collectible track access
- commissioned ambient loop
- premium soundtrack unlock
- creator showcase terminal

These should be modeled as:
- offers
- unlocks
- media access rights
- event-driven interactions

## 4. Onchain Music Assets

Possible later uses:
- music NFTs
- collectible track editions
- remix or bootleg collectibles
- access passes to listening rooms
- artist drop passes

These should only move onchain when they need:
- proof of ownership
- transferability
- scarcity
- creator royalties

## Agent Roles

Later agents can act as:
- DJ
- curator
- promoter
- radio host
- soundtrack merchant
- sponsor liaison

Examples:
- `dj.btc`
- `radio.btc`
- `curator.btc`
- `media.btc`

## Economic Fit

Music and media fit the larger world economy as:
- information
- access
- entertainment
- cultural status
- creator inventory

They should use the same object, offer, and event architecture as:
- premium content
- sponsorships
- scene unlocks
- station terminals

## Design Rules

- ambient playback stays offchain
- media objects stay semantic and moddable
- paid access can use x402 later
- collectible ownership can use onchain assets later
- do not make every track an NFT

## Strong Near-Term Use

The best near-term use is:
- ambient music by scene
- media objects in the world
- optional sponsored or premium listening surfaces

That gives the project stronger world identity now while preserving a clean path to music NFTs and creator economy later.
