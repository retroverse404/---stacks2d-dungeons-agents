# Asset Placeholder Structure

Purpose: keep the submission media clean and aligned with the code before you replace each placeholder with final art/audio assets.

## Directory layout

- `public/assets/media/visuals/` — visual proofs, GIFs, or short WebM clips that reference each NFT/scene. Fill each file with a descriptive name such as `cassette-premium-preview.webm`.
- `public/assets/media/audio/` — standalone audio assets for the in-world sound emphasis (UI cues, premium unlock stingers, ambient loops).
- Each folder ships a `.gitkeep` placeholder so the directories stay tracked until you drop real files.

## How to link these assets

1. Upload or copy your final `jpg/png/webm` into `public/assets/media/visuals/`.
2. Reference the file in your narrative doc or contract metadata. Example:

```clarity
(print {
  event: "cassette-minted",
  token-id: next-token-id,
  media: "/assets/media/visuals/cassette-preview.webm"
})
```

3. For in-game audio, update the relevant sound definitions (see `src/sprited/SpriteEditorPanel.ts`) with the `/assets/media/audio/<name>.mp3` URL and play through `src/engine/AudioManager.ts`.

## Audio architecture notes

- The web audio layer is handled by `src/engine/AudioManager.ts`. It creates one `AudioContext`, separate `GainNode`s for music and SFX, and exposes `loadAndPlay`, `playAmbient`, and `playOneShot`.
- Ambient objects/NPCs call `game.audio.playAmbient(...)`; items call `playOneShot`.
- The UI playlist uses `AudioManager` plus a separate profile soundtrack element. Keep audio files under `public/assets/media/audio/` and load them via these helpers to keep volume/ducking controls unified.
- When you replace a placeholder, keep the same filename so event references don’t break; update the docs if the name changes.

## Timeline log (optional)

Add entries here as you replace assets so reviewers can see the evolution.

- `2026-03-20`: Added placeholder folders and noted the AudioManager wiring.
