# Claude Bootstrap Prompt

Use this prompt in Claude when you need it to rapidly recover accurate project context for `stacks2d (tinyrealms)`.

```md
You are joining an active coding/product session for `stacks2d (tinyrealms)`, a work-in-progress fork/remix of TinyRealms.

Do not start with brainstorming. Start by reading the current repo and project KB so you can restate the project truth accurately.

## Scan this order

### Repo

- `README.md`
- `docs/Stacks2D-Architecture.md`
- `docs/Frontend-Function-Contract.md`
- `docs/Frontend-Modularity-Assessment.md`
- `docs/Frontend-Screen-Spec.md`
- `src/App.ts`
- `src/ui/GameShell.ts`
- `src/ui/ProfileScreen.ts`
- `src/ui/AuthScreen.ts`
- `src/splash/screens/GuideNpcSplash.ts`
- `src/story/content/stacksGuideContext.ts`
- `convex/schema.ts`
- `convex/localDev.ts`
- `convex/story/storyAi.ts`
- `convex/integrations/zeroAuthority.ts`
- `convex/integrations/tenero.ts`
- `convex/integrations/x402.ts`
- `convex/agents/stateMachine.ts`

### Obsidian KB

Workspace root:
`/home/rv404/RV404-Lab/PRODUCTIVITY/Obsidian/Test-1a/PMOG-Obsidian-Research`

Read:

- `04_tech/2026-03-14 Stacks2D PRD-PRM Snapshot.md`
- `04_tech/2026-03-14 Offchain World State, Onchain Settlement and Proof.md`
- `04_tech/2026-03-14 Zero Authority Integration - Current State.md`
- `04_tech/2026-03-14 Playable World for Stacks - Positioning.md`
- `04_tech/Stacks Ecosystem Integrations Index.md`
- `01_sources/Source - Zero Authority DAO API and Context.md`
- `01_sources/Source - Tenero Analytics and Market Context.md`
- `01_sources/Source - AIBTC Context and References.md`
- `01_sources/Source - AIBTC GitHub Repos and x402 API.md`
- `01_sources/Source - Stacks x402 Integration References.md`

## Core rules

1. Distinguish clearly between:
   - live and verified
   - scaffolded but not live
   - planned/future
2. Do not overclaim x402, AIBTC, Tenero, or wallet implementation status.
3. Treat the frontend as replaceable, but preserve behavior contracts.
4. Preserve the architecture principle:
   - world/experience
   - game logic
   - backend integrations
   - payment/proof
   are separate layers.

## Product direction

The project is aiming for:

- one strong playable world / station-like scene
- ecosystem-native NPCs such as `guide.btc`
- live ecosystem data through backend adapters
- future premium content and paid services through x402 on Stacks
- future AIBTC-style agent patterns

## Output format

Respond with:

1. `Current truth`
2. `Live now`
3. `Scaffolded only`
4. `Overclaim risks`
5. `Next shippable loop`

Be concise and implementation-first.
```
