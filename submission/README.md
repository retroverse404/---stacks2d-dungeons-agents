# Submission Pack

Purpose: provide one clean submission-oriented entry point for reviewers, judges, and future hackathon forms.

Audience:
- judges
- hackathon submission prep
- maintainers packaging evidence

Last verified: 2026-03-17

## Project

**Dungeons & Agents**

A playable Stacks-native agent world where five wallet-backed AI agents earn in STX through world-triggered premium actions.

## One-Sentence Summary

Five AI agents with real testnet wallets live inside a 2D world; players pay them in STX through x402, premium access is recorded on Stacks, and the World Feed reflects the result.

## Judge Shortcut

If someone wants the shortest possible Stacks-specific summary, use:

- [submission.json](/home/rv404/RV404-Lab/PRODUCTIVITY/Obsidian/Test-1a/Apps/tinyrealms/submission/submission.json)

That file is intentionally structured to separate:

- what is already proven
- what still needs live evidence capture
- what is explicitly not being claimed yet

## What Judges Should Look For

1. Five named agents with distinct roles and funded testnet wallets.
2. A world-triggered premium interaction from an object or NPC.
3. STX payment through x402.
4. `premium-access-v2` proof on Stacks testnet.
5. A visible World Feed consequence.

## Current Proof Surface

- 2D world with zones, semantic objects, and NPC movement.
- Convex-backed world state, events, wallets, and agent runtime.
- x402 premium endpoints for `guide.btc`, `market.btc`, and `Mel`.
- `premium-access-v2`, `world-lobby`, and `world-objects` deployed on testnet.
- `floppy-disk-nft`, `cassette-nft`, and `wax-cylinder-nft` deployed on testnet.

## Submission Truth

- `STX` is the live demo currency.
- Premium actions are world-triggered, not detached wallet-first flows.
- The collectible layer is represented by deployed SIP-009 media artifacts.
- `qtc-token` and `sft-items` are deployed on testnet, but they are not part of the current live proof claim until gameplay wiring is visible.
- `market.btc` should be described publicly as `market.btc`; AIBTC / Bitflow is the implementation lineage, not the product name.

## Files

- Machine-readable summary: [submission.json](/home/rv404/RV404-Lab/PRODUCTIVITY/Obsidian/Test-1a/Apps/tinyrealms/submission/submission.json)
- Canonical project reading order: [00-Start-Here.md](/home/rv404/RV404-Lab/PRODUCTIVITY/Obsidian/Test-1a/Apps/tinyrealms/docs/00-Start-Here.md)
- Submission-facing narrative: [Dungeons-and-Agents.md](/home/rv404/RV404-Lab/PRODUCTIVITY/Obsidian/Test-1a/Apps/tinyrealms/docs/Dungeons-and-Agents.md)
- Stacks engineering truth: [Stacks-Implementation-Status.md](/home/rv404/RV404-Lab/PRODUCTIVITY/Obsidian/Test-1a/Apps/tinyrealms/docs/Stacks-Implementation-Status.md)
- Demo checklist: [demo-checklist.md](/home/rv404/RV404-Lab/PRODUCTIVITY/Obsidian/Test-1a/Apps/tinyrealms/submission/demo-checklist.md)

## Repo Guidance

This `submission/` directory is intentionally vendor-neutral.

If a hackathon later requires a specific path such as `.initia/submission.json`, copy the contents of [submission.json](/home/rv404/RV404-Lab/PRODUCTIVITY/Obsidian/Test-1a/Apps/tinyrealms/submission/submission.json) into that required location rather than maintaining multiple conflicting sources of truth.
