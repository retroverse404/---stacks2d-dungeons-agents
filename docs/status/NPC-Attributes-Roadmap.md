---
title: NPC Attributes Roadmap — Post Submission
date: 2026-03-19
tags:
  - tinyrealms/npcs
  - roadmap
  - post-submission
status: active
type: note
---

# NPC Attributes Roadmap — Post Submission

> Do NOT touch before hackathon submission (~2026-03-20). Judges evaluate for 4–6 days — ship this during that window to keep momentum.

## Trigger

Competitor analysis of **AlphaClaw** (https://github.com/oyingrace/AlphaClaw) — a Stacks-native trading agent platform. Their agent design has attributes our NPCs lack that would make them feel significantly more alive.

---

## What They Have That We Should Add

### 1. Confidence Scoring on Decisions
**AlphaClaw:** Every agent decision has a `confidence` (60–100%). High confidence → full allocation. Low confidence → fractional action.

**For tinyrealms NPCs:**
- NPC trade offers scale with confidence — "I'll give you 3 coins, I really want that item" vs "maybe 1 coin?"
- Dialogue reflects certainty — `"I'm sure the dungeon is clear"` vs `"I think the dungeon is clear"`
- Confidence affects mood transitions

**Schema addition:**
```ts
// npcState
decisionConfidence?: number; // 0.0–1.0
```

---

### 2. Guardrail Engine (Hard Behavioral Constraints)
**AlphaClaw:** 5 rules validated before every agent action — currency allowlists, daily limits, position caps, stop-loss, max trade size.

**For tinyrealms NPCs:**
- Merchant NPC: never sells below `minPrice`, never trades same item twice in `cooldownMs`
- Guard NPC: never leaves `postRadius`, never initiates combat without player provocation
- Scholar NPC: only discusses topics in `knowledgeDomains`

**Schema addition:**
```ts
// npcProfiles
guardrails?: {
  minTradePrice?: number;
  maxTradeQuantity?: number;
  noLeashRadius?: number;       // guard stays within X px of post
  knowledgeDomains?: string[];  // only speaks on these topics
  dailyTradeLimit?: number;
};
```

---

### 3. Per-NPC Event Timeline (Persistent Memory)
**AlphaClaw:** Every agent action logged to `agent_timeline` — what they did, when, why.

**For tinyrealms NPCs:**
- NPCs remember their history — "I traded with Ragav 3 times today"
- Players can inspect NPC logs — creates narrative depth
- World events affect NPC memory — "I saw a player kill the boss"

**New Convex table:**
```ts
// npcEvents
{
  agentId: string;
  mapName: string;
  eventType: "trade" | "dialogue" | "move" | "observed" | "decision";
  detail: string;
  confidence?: number;
  timestamp: number;
}
```

---

### 4. Custom Prompt Per NPC (Personality Soul)
**AlphaClaw:** `custom_prompt` field lets users tune agent personality.

**For tinyrealms NPCs:**
- Each NPC has a `systemPrompt` field — the "soul" of the character
- World admins or future players set it via the editor
- Feeds directly into `agentThinkAction` LLM calls

**Schema addition to `npcProfiles`:**
```ts
systemPrompt?: string; // e.g. "You are a grumpy dwarf who distrusts elves and loves gold"
```

---

## Implementation Order (Post-Submission Sprint)

1. **`systemPrompt`** — easiest, plug into existing `agentThinkAction`. High impact on judge demos.
2. **`guardrails`** — add to `npcProfiles`, validate in `npcEngine.tick` trade logic.
3. **`decisionConfidence`** — add to `npcState`, expose in dialogue and trade offers.
4. **`npcEvents` timeline** — new table, write from tick + agentThink, expose in UI.

---

## What We Already Have (Foundation)

- `mood` — emotional state (satisfied, curious, focused)
- `currentIntent` / `intentDetail` — what NPC is doing and why
- `lastTradeAt` — basic trade cooldown
- `desiredItem` — goal-driven behavior
- `behaviorMode` — at-post, patrol-surface, wander
- `agentThinkAction` — LLM reasoning already wired in

We are closer than AlphaClaw to a living world — we just need to surface the depth.

---

## Notes

- AlphaClaw is a DeFi tool, not a game — their "agents" are financial bots. Our NPCs exist in a spatial world with player interaction, which is a harder and more interesting problem.
- Their attestation model (TEE-signed proof of execution) is not relevant for us yet — future if we want verifiable on-chain NPC actions.
- Confidence scoring + guardrails together = NPCs that feel like they have *opinions* and *limits*, not just scripts.
