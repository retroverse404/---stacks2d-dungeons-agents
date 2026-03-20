# Artifacts & NFT Plan — Dungeons & Agents

> **Status:** Post-hackathon milestone. Contracts deployed. Creative + mint pipeline pending.
> **Last updated:** 2026-03-20 05:30 IST

---

## The Three Artifacts

| Artifact | Contract | Agent | Role |
|---|---|---|---|
| Wax Cylinder | `wax-cylinder-nft` | Mel | Flagship — music memory, editorial lore |
| Cassette | `cassette-nft` | Mel | Mid-tier media artifact |
| Floppy Disk | `floppy-disk-nft` | quests.btc | Digital relic, lore carrier |

All three are SIP-009 NFTs deployed on Stacks testnet. Contracts support `mint`, `transfer`, `set-token-uri`.

**Contract addresses:**
- `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.wax-cylinder-nft`
- `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.cassette-nft`
- `ST2JDN3QED16X524SE8GWQSTP2MW6D2005AEEGJ9S.floppy-disk-nft`

---

## Full Vision (Post-Hackathon)

```
Player pays Mel via x402 (1 STX)
        ↓
Premium content unlocks — 3D world experience (WorldLabs GLB)
        ↓
Player claims Wax Cylinder as real SIP-009 NFT
        ↓
NFT lands in wallet with Arweave metadata + 3D model URI
        ↓
GLB viewable in-wallet — the artifact IS the 3D object
```

---

## Artifact Pipeline

```
Create artwork (Canva / Figma / Midjourney)
        ↓
Build 3D scene in WorldLabs → export GLB
        ↓
Upload image + GLB + metadata JSON to Arweave → permanent ar:// URLs
        ↓
Mint NFT with Arweave metadata URI
        ↓
Wire mint to Mel x402 success callback (auto-mint on payment)
        ↓
Player pays → NFT mints to their wallet automatically
```

---

## Metadata JSON Template

```json
{
  "name": "Wax Cylinder #1",
  "description": "A memory Mel chose to preserve. The grooves hold what the feed forgets.",
  "image": "ar://YOUR_IMAGE_TX_ID",
  "animation_url": "ar://YOUR_GLB_TX_ID",
  "external_url": "https://stackshub.space",
  "attributes": [
    { "trait_type": "Agent", "value": "Mel" },
    { "trait_type": "World", "value": "Cozy Cabin" },
    { "trait_type": "Artifact", "value": "Wax Cylinder" },
    { "trait_type": "Edition", "value": "Genesis" }
  ]
}
```

---

## Arweave Upload Options

**Option A — arweave.app (no code)**
1. Install ArConnect wallet
2. Upload image → get `ar://` URL
3. Upload metadata JSON → get `ar://` URL

**Option B — Irys/Bundlr (free for files under 100KB)**
Scriptable. Claude can write the upload script.

---

## What To Show Judges TODAY (Without Full Pipeline)

**1. In-world phonograph prompt (Mel's object):**
```
"This wax cylinder holds a memory worth keeping.
 Pay 1 STX to unlock Mel's archive.
 Holders will receive the artifact as an NFT."
```

**2. Premium panel — show contract link:**
```
🎵 Wax Cylinder Memory — 1 STX
Artifact: SIP-009 NFT (mint coming soon)
Contract: ST2JDN...wax-cylinder-nft [View on Hiro ↗]
```

**3. Demo video narration:**
> "When a player pays Mel for the wax cylinder memory, they receive this as a permanent SIP-009 NFT — stored on Arweave, minted on Stacks. The contract is already deployed on testnet."
> Then cut to Hiro explorer showing the live contract.

---

## Lore (One Line Per Artifact)

- **Wax Cylinder** — *"A memory Mel chose to preserve. The grooves hold what the feed forgets."*
- **Cassette** — *"Mid-tier lore carrier. Someone recorded something worth keeping."*
- **Floppy Disk** — *"Digital relic. Contains instructions for a world that no longer runs."*

---

## Post-Hackathon Build Order

1. Create wax cylinder artwork (Midjourney/Canva brief below)
2. Build 3D scene in WorldLabs → export GLB
3. Upload to Arweave (image + GLB + metadata JSON)
4. Wire `wax-cylinder-nft.mint` to Mel's x402 success callback in `services/x402-api/src/server.ts`
5. Add cassette + floppy disk artwork + metadata
6. Wire remaining mints to their respective agent interactions

---

## Midjourney Brief (Wax Cylinder)

```
Antique wax phonograph cylinder, warm amber and sepia tones,
soft studio lighting, floating on dark background,
photorealistic, detailed grooves, nostalgic,
collectible NFT art style, square format
```

---

## Claude Insights — 2026-03-20 05:30 IST

- User confirmed artifacts are a **post-hackathon milestone** — do not block submission on them
- The WorldLabs GLB integration is the target end state — player pays → 3D world unlocks → NFT minted
- For the hackathon: show the **intention** in the game world (phonograph prompt + Hiro contract link in premium panel). Judges see the deployed contract as proof the mint is real and imminent.
- Arweave is confirmed as the storage layer — user has access to Canva, Figma, Midjourney, and can upload to Arweave
- Priority order: wax cylinder first (tied to Mel who is the most narrative agent), then cassette, then floppy disk
- The `animation_url` field in metadata should point to the GLB — standard for 3D NFTs on OpenSea/marketplaces
- Mint script can be a simple Node.js file using `@stacks/transactions` — Claude can write this when ready
- Codex: next action is artwork creation → Arweave upload → mint one wax cylinder to deployer wallet for demo
