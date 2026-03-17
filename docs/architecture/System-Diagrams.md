# System Diagrams

Purpose: provide one visual architecture pack for `tinyrealms`.

Audience:
- maintainers
- reviewers
- anyone trying to understand the stack quickly

Last verified: 2026-03-17

## 1. System Map

```mermaid
flowchart LR
  A[Apps<br/>UI, panels, splashes, editor] --> B[World Runtime<br/>Game, EntityLayer, HUD]
  B --> C[Convex<br/>system of record]
  B --> D[x402 Service<br/>premium payment boundary]
  C --> E[Agents<br/>runtime, state, memory, epochs]
  C --> F[Worlds<br/>maps, zones, semantic objects, items, events]
  C --> G[Identity<br/>profiles, agent bindings, wallet identities]
  D --> H[Clarity Contracts<br/>proof, rooms, objects, artifacts]
  C --> I[Integrations<br/>Tenero, Zero Authority, chainhooks]
```

## 2. Canonical Domain ERD

This ERD is conceptual and tracks the main relationships used in the current build.

```mermaid
erDiagram
  MAPS ||--o{ MAP_OBJECTS : contains
  MAPS ||--o{ WORLD_ZONES : defines
  MAPS ||--o{ SEMANTIC_OBJECTS : anchors
  MAPS ||--o{ WORLD_ITEMS : spawns
  MAPS ||--o{ WORLD_EVENTS : logs

  MAP_OBJECTS o|--o| NPC_PROFILES : instanceName
  WORLD_ZONES ||--o{ SEMANTIC_OBJECTS : groups
  ITEM_DEFS ||--o{ WORLD_ITEMS : instantiates

  AGENT_REGISTRY ||--o{ AGENT_STATES : drives
  AGENT_REGISTRY ||--o{ AGENT_ACCOUNT_BINDINGS : binds
  AGENT_REGISTRY ||--o{ PREMIUM_CONTENT_OFFERS : offers
  AGENT_REGISTRY ||--o{ NPC_ROLE_ASSIGNMENTS : assigns

  AGENT_ACCOUNT_BINDINGS ||--o{ WALLET_IDENTITIES : uses
  PROFILES ||--o{ PRESENCE : publishes
  PROFILES ||--o{ WORLD_EVENTS : participates

  MAPS {
    string name
    number width
    number height
  }
  WORLD_ZONES {
    string mapName
    string zoneKey
    string zoneType
  }
  SEMANTIC_OBJECTS {
    string mapName
    string objectKey
    string objectType
    string linkedAgentId
  }
  WORLD_EVENTS {
    string eventType
    string sourceId
    string actorId
    number timestamp
  }
  AGENT_REGISTRY {
    string agentId
    string roleKey
    string permissionTier
    string walletAddress
  }
  AGENT_STATES {
    string agentId
    string state
    string mood
  }
  WALLET_IDENTITIES {
    string walletId
    string ownerId
    string walletRole
    string address
  }
  PREMIUM_CONTENT_OFFERS {
    string offerKey
    string agentId
    string priceAsset
    string priceAmount
  }
```

## 3. Runtime UML

```mermaid
classDiagram
  class GameShell {
    +renderPanels()
    +mountGame()
  }

  class Game {
    +loadMap()
    +handleInteraction()
    +syncWorldState()
  }

  class EntityLayer {
    +openNpcSplash()
    +resolveProximityPrompt()
  }

  class HUD {
    +renderTicker()
    +showPrompt()
  }

  class ChatPanel {
    +renderWorldFeed()
    +renderActiveAgents()
  }

  class AgentRuntime {
    +runEpoch()
    +listRuntimeCast()
    +registerAiCall()
  }

  class StoryAI {
    +generateDialogue()
    +applyBudgetGuard()
  }

  class X402Service {
    +serveOffer()
    +settlePayment()
    +grantAccess()
  }

  class PremiumAccessV2 {
    +grant-access()
    +has-access()
  }

  GameShell --> Game
  Game --> EntityLayer
  Game --> HUD
  Game --> ChatPanel
  Game --> AgentRuntime
  EntityLayer --> StoryAI
  EntityLayer --> X402Service
  X402Service --> PremiumAccessV2
  AgentRuntime --> StoryAI
  ChatPanel --> AgentRuntime
```

## 4. Premium Interaction Sequence

```mermaid
sequenceDiagram
  participant Player
  participant Game
  participant Convex
  participant X402 as x402 API
  participant Wallet
  participant Contract as premium-access-v2

  Player->>Game: approach object or NPC
  Game->>Convex: resolve interactable / offer
  Convex-->>Game: free + premium actions
  Player->>Game: press X
  Game->>X402: request premium endpoint
  X402-->>Game: 402 Payment Required
  Game->>Wallet: request STX payment signature
  Wallet-->>Game: signed retry payload
  Game->>X402: retry with payment
  X402->>Contract: grant-access(resourceId, payer)
  X402->>Convex: append world event
  X402-->>Game: premium JSON + txid
  Game-->>Player: premium result + updated world feed
```

## 5. Autonomous Agent Epoch Sequence

```mermaid
sequenceDiagram
  participant Epoch as AgentRuntime
  participant State as agentStates
  participant Events as worldEvents
  participant AI as StoryAI
  participant Feed as ChatPanel

  Epoch->>State: select runnable agents
  Epoch->>Events: read recent world context
  Epoch->>AI: generate role-specific thought
  AI-->>Epoch: bounded response
  Epoch->>Events: append agent-thought event
  Feed->>Events: subscribe
  Events-->>Feed: live world-feed update
```

## 6. Contract Layer

```mermaid
flowchart TD
  X[x402 premium payment] --> P[premium-access-v2]
  P --> W[proof of unlock]
  W --> O[world-objects]
  W --> L[world-lobby]
  W --> N[SIP-009 media artifacts]
  N --> F[floppy-disk-nft]
  N --> C[cassette-nft]
  N --> Y[wax-cylinder-nft]
  Y --> Z[future artifact claim or reveal]
```
