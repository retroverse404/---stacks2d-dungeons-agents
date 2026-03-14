import { v } from "convex/values";
import { mutation } from "./_generated/server";
import { internal } from "./_generated/api";
import { getRequestUserId } from "./lib/getRequestUserId";

const DEMO_MAP = "Cozy Cabin";
const DEMO_SPRITE_DEF = "local-guide-npc";
const DEMO_GUIDE_SCALE = 1.14;
const DEMO_INSTANCE = "guide-btc";
const LEGACY_DEMO_INSTANCE = "mira-guide";
const DEMO_TRADER_DEF = "local-merchant-npc";
const DEMO_TRADER_INSTANCE = "toma-merchant";
const MARKET_SPRITE_DEF = "local-market-npc";
const MARKET_INSTANCE = "market-btc";
const QUESTS_SPRITE_DEF = "local-quests-npc";
const QUESTS_INSTANCE = "quests-btc";

async function upsertZone(
  ctx: any,
  zone: {
    mapName: string;
    zoneKey: string;
    name: string;
    description?: string;
    zoneType: string;
    x: number;
    y: number;
    width: number;
    height: number;
    tags: string[];
    accessType?: string;
    metadataJson?: string;
  },
) {
  const existing = await ctx.db
    .query("worldZones")
    .withIndex("by_map_zoneKey", (q: any) => q.eq("mapName", zone.mapName).eq("zoneKey", zone.zoneKey))
    .first();
  const payload = { ...zone, updatedAt: Date.now() };
  if (existing) return await ctx.db.patch(existing._id, payload);
  return await ctx.db.insert("worldZones", payload);
}

async function upsertSemanticObject(
  ctx: any,
  object: {
    mapName: string;
    objectKey: string;
    label: string;
    objectType: string;
    sourceType: string;
    mapObjectId?: any;
    zoneKey?: string;
    x?: number;
    y?: number;
    tags: string[];
    affordances: string[];
    valueClass?: string;
    linkedAgentId?: string;
    stateJson?: string;
    metadataJson?: string;
  },
) {
  const existing = await ctx.db
    .query("semanticObjects")
    .withIndex("by_map_objectKey", (q: any) =>
      q.eq("mapName", object.mapName).eq("objectKey", object.objectKey),
    )
    .first();
  const payload = { ...object, updatedAt: Date.now() };
  if (existing) return await ctx.db.patch(existing._id, payload);
  return await ctx.db.insert("semanticObjects", payload);
}

async function upsertNpcRole(
  ctx: any,
  role: {
    agentId: string;
    mapName: string;
    roleKey: string;
    displayRole?: string;
    behaviorMode?: string;
    homeZoneKey?: string;
    postObjectKey?: string;
    permissions: string[];
    metadataJson?: string;
  },
) {
  const existing = await ctx.db
    .query("npcRoleAssignments")
    .withIndex("by_agentId", (q: any) => q.eq("agentId", role.agentId))
    .first();
  const payload = { ...role, updatedAt: Date.now() };
  if (existing) return await ctx.db.patch(existing._id, payload);
  return await ctx.db.insert("npcRoleAssignments", payload);
}

async function upsertFact(
  ctx: any,
  fact: {
    mapName?: string;
    factKey: string;
    factType: string;
    valueJson: string;
    scope?: string;
    subjectId?: string;
    source?: string;
  },
) {
  const existing = fact.mapName
    ? await ctx.db
        .query("worldFacts")
        .withIndex("by_map_factKey", (q: any) => q.eq("mapName", fact.mapName).eq("factKey", fact.factKey))
        .first()
    : await ctx.db
        .query("worldFacts")
        .withIndex("by_factKey", (q: any) => q.eq("factKey", fact.factKey))
        .first();
  const payload = { ...fact, updatedAt: Date.now() };
  if (existing) return await ctx.db.patch(existing._id, payload);
  return await ctx.db.insert("worldFacts", payload);
}

async function appendEvent(
  ctx: any,
  event: {
    mapName?: string;
    eventType: string;
    actorId?: string;
    targetId?: string;
    objectKey?: string;
    zoneKey?: string;
    summary: string;
    detailsJson?: string;
  },
) {
  return await ctx.db.insert("worldEvents", {
    ...event,
    timestamp: Date.now(),
  });
}

async function upsertAgentRegistryEntry(
  ctx: any,
  entry: {
    agentId: string;
    displayName: string;
    network: string;
    walletAddress?: string;
    bnsName?: string;
    agentType: string;
    roleKey: string;
    permissionTier: string;
    status: string;
    homeWorld?: string;
    homeMap?: string;
    homeZoneKey?: string;
    supportedAssets: string[];
    metadataJson?: string;
  },
) {
  const existing = await ctx.db
    .query("agentRegistry")
    .withIndex("by_agentId", (q: any) => q.eq("agentId", entry.agentId))
    .first();
  const payload = { ...entry, updatedAt: Date.now() };
  if (existing) return await ctx.db.patch(existing._id, payload);
  return await ctx.db.insert("agentRegistry", payload);
}

async function upsertAgentAccountBinding(
  ctx: any,
  binding: {
    agentId: string;
    network: string;
    ownerAddress?: string;
    agentAddress?: string;
    accountContractId?: string;
    allowlistedContracts: string[];
    canPropose: boolean;
    canApproveContracts: boolean;
    canTradeAssets: boolean;
    status: string;
    metadataJson?: string;
  },
) {
  const existing = await ctx.db
    .query("agentAccountBindings")
    .withIndex("by_agentId", (q: any) => q.eq("agentId", binding.agentId))
    .first();
  const payload = { ...binding, updatedAt: Date.now() };
  if (existing) return await ctx.db.patch(existing._id, payload);
  return await ctx.db.insert("agentAccountBindings", payload);
}

function isLocalDeployment() {
  const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
    ?.env;
  const deployment = env?.CONVEX_DEPLOYMENT ?? "";
  const siteUrl = env?.CONVEX_SITE_URL ?? "";
  return (
    deployment.startsWith("local:") ||
    siteUrl.includes("127.0.0.1") ||
    siteUrl.includes("localhost")
  );
}

export const ensureDemoNpc = mutation({
  args: {
    mapName: v.optional(v.string()),
  },
  handler: async (ctx, { mapName }) => {
    if (!isLocalDeployment()) {
      return { seeded: false, reason: "not-local" as const };
    }

    const requestedMap = mapName ?? DEMO_MAP;
    const mapAliases = Array.from(new Set([requestedMap, DEMO_MAP, "cozy-cabin", "Cozy Cabin"]));
    let map = null;
    for (const candidate of mapAliases) {
      map = await ctx.db
        .query("maps")
        .withIndex("by_name", (q) => q.eq("name", candidate))
        .first();
      if (map) break;
    }
    if (!map) {
      return { seeded: false, reason: "map-missing" as const, mapName: requestedMap };
    }
    const targetMap = map.name;

    const userId = await getRequestUserId(ctx);
    const now = Date.now();

    let spriteDef = await ctx.db
      .query("spriteDefinitions")
      .withIndex("by_name", (q) => q.eq("name", DEMO_SPRITE_DEF))
      .first();
    if (!spriteDef) {
      const spriteDefId = await ctx.db.insert("spriteDefinitions", {
        name: DEMO_SPRITE_DEF,
        spriteSheetUrl: "/assets/characters/villager-jane.json",
        defaultAnimation: "row0",
        animationSpeed: 0.08,
        anchorX: 0.5,
        anchorY: 1,
        scale: DEMO_GUIDE_SCALE,
        isCollidable: false,
        category: "npc",
        frameWidth: 32,
        frameHeight: 48,
        npcSpeed: 26,
        npcWanderRadius: 72,
        npcDirDown: "row0",
        npcDirUp: "row1",
        npcDirRight: "row2",
        npcDirLeft: "row3",
        npcGreeting: "Welcome to stacks2d. I can teach Stacks, sBTC, agents, and where this world is headed.",
        visibilityType: "system",
        createdByUser: userId ?? undefined,
        updatedAt: now,
      });
      spriteDef = await ctx.db.get(spriteDefId);
    } else if (spriteDef.scale !== DEMO_GUIDE_SCALE) {
      await ctx.db.patch(spriteDef._id, {
        scale: DEMO_GUIDE_SCALE,
        updatedAt: now,
      });
      spriteDef = await ctx.db.get(spriteDef._id);
    }

    let traderSpriteDef = await ctx.db
      .query("spriteDefinitions")
      .withIndex("by_name", (q) => q.eq("name", DEMO_TRADER_DEF))
      .first();
    if (!traderSpriteDef) {
      const spriteDefId = await ctx.db.insert("spriteDefinitions", {
        name: DEMO_TRADER_DEF,
        spriteSheetUrl: "/assets/characters/villager5.json",
        defaultAnimation: "row0",
        animationSpeed: 0.08,
        anchorX: 0.5,
        anchorY: 1,
        scale: 1,
        isCollidable: false,
        category: "npc",
        frameWidth: 32,
        frameHeight: 48,
        npcSpeed: 28,
        npcWanderRadius: 64,
        npcDirDown: "row0",
        npcDirUp: "row1",
        npcDirRight: "row2",
        npcDirLeft: "row3",
        npcGreeting: "Got wares, gossip, and a little patience.",
        visibilityType: "system",
        createdByUser: userId ?? undefined,
        updatedAt: now,
      });
      traderSpriteDef = await ctx.db.get(spriteDefId);
    }

    let marketSpriteDef = await ctx.db
      .query("spriteDefinitions")
      .withIndex("by_name", (q) => q.eq("name", MARKET_SPRITE_DEF))
      .first();
    if (!marketSpriteDef) {
      const spriteDefId = await ctx.db.insert("spriteDefinitions", {
        name: MARKET_SPRITE_DEF,
        spriteSheetUrl: "/assets/characters/villager3.json",
        defaultAnimation: "row0",
        animationSpeed: 0.08,
        anchorX: 0.5,
        anchorY: 1,
        scale: 1,
        isCollidable: false,
        category: "npc",
        frameWidth: 32,
        frameHeight: 48,
        npcSpeed: 26,
        npcWanderRadius: 56,
        npcDirDown: "row0",
        npcDirUp: "row1",
        npcDirRight: "row2",
        npcDirLeft: "row3",
        npcGreeting: "I track price surfaces, token context, and where the market is leaning.",
        visibilityType: "system",
        createdByUser: userId ?? undefined,
        updatedAt: now,
      });
      marketSpriteDef = await ctx.db.get(spriteDefId);
    }

    let questsSpriteDef = await ctx.db
      .query("spriteDefinitions")
      .withIndex("by_name", (q) => q.eq("name", QUESTS_SPRITE_DEF))
      .first();
    if (!questsSpriteDef) {
      const spriteDefId = await ctx.db.insert("spriteDefinitions", {
        name: QUESTS_SPRITE_DEF,
        spriteSheetUrl: "/assets/characters/woman-med.json",
        defaultAnimation: "row0",
        animationSpeed: 0.08,
        anchorX: 0.5,
        anchorY: 1,
        scale: 1,
        isCollidable: false,
        category: "npc",
        frameWidth: 32,
        frameHeight: 48,
        npcSpeed: 24,
        npcWanderRadius: 52,
        npcDirDown: "row0",
        npcDirUp: "row1",
        npcDirRight: "row2",
        npcDirLeft: "row3",
        npcGreeting: "I keep the current grants, bounties, and quests in view for new arrivals.",
        visibilityType: "system",
        createdByUser: userId ?? undefined,
        updatedAt: now,
      });
      questsSpriteDef = await ctx.db.get(spriteDefId);
    }

    let npcProfile = await ctx.db
      .query("npcProfiles")
      .withIndex("by_name", (q) => q.eq("name", DEMO_INSTANCE))
      .first();
    if (!npcProfile) {
      const legacyProfile = await ctx.db
        .query("npcProfiles")
        .withIndex("by_name", (q) => q.eq("name", LEGACY_DEMO_INSTANCE))
        .first();
      if (legacyProfile) {
        await ctx.db.patch(legacyProfile._id, { name: DEMO_INSTANCE, updatedAt: now });
        npcProfile = await ctx.db.get(legacyProfile._id);
      }
    }
    if (!npcProfile) {
      const profileId = await ctx.db.insert("npcProfiles", {
        name: DEMO_INSTANCE,
        spriteDefName: DEMO_SPRITE_DEF,
        mapName: targetMap,
        displayName: "guide.btc",
        title: "Ecosystem Guide",
        backstory:
          "guide.btc is the first ecosystem-native guide in stacks2d, designed to orient new arrivals around Stacks, Bitcoin, and the future agent economy.",
        personality: "observant, welcoming, quietly curious",
        dialogueStyle: "clear, grounded, educational, ecosystem-native",
        knowledge:
          "guide.btc explains Stacks basics, sBTC, Dual Stacking, AIBTC-style agents, and the project direction toward x402-enabled interactions.",
        items: [{ name: "tea", quantity: 2 }],
        currencies: { coins: 6 },
        desiredItem: "apple",
        tags: ["guide", "starter-npc", "stacks", "education", "ecosystem"],
        visibilityType: "system",
        createdByUser: userId ?? undefined,
        updatedAt: now,
      });
      npcProfile = await ctx.db.get(profileId);
    } else {
      await ctx.db.patch(npcProfile._id, {
        spriteDefName: DEMO_SPRITE_DEF,
        mapName: targetMap,
        displayName: "guide.btc",
        title: "Ecosystem Guide",
        backstory:
          "guide.btc is the first ecosystem-native guide in stacks2d, designed to orient new arrivals around Stacks, Bitcoin, and the future agent economy.",
        personality: "observant, welcoming, quietly curious",
        dialogueStyle: "clear, grounded, educational, ecosystem-native",
        knowledge:
          "guide.btc explains Stacks basics, sBTC, Dual Stacking, AIBTC-style agents, and the project direction toward x402-enabled interactions.",
        items: [{ name: "tea", quantity: 2 }],
        currencies: { coins: 6 },
        desiredItem: "apple",
        tags: ["guide", "starter-npc", "stacks", "education", "ecosystem"],
        visibilityType: "system",
        updatedAt: now,
      });
      npcProfile = await ctx.db.get(npcProfile._id);
    }

    let traderProfile = await ctx.db
      .query("npcProfiles")
      .withIndex("by_name", (q) => q.eq("name", DEMO_TRADER_INSTANCE))
      .first();
    if (!traderProfile) {
      const profileId = await ctx.db.insert("npcProfiles", {
        name: DEMO_TRADER_INSTANCE,
        spriteDefName: DEMO_TRADER_DEF,
        mapName: targetMap,
        displayName: "Toma",
        title: "Peddler",
        backstory:
          "Toma drifts from room to room testing what travelers will trade for comfort, food, and little luxuries.",
        personality: "chatty, opportunistic, warm when business is good",
        dialogueStyle: "friendly merchant banter",
        knowledge:
          "He believes every safe room becomes a market eventually if enough people pass through it.",
        items: [{ name: "apple", quantity: 3 }],
        currencies: { coins: 10 },
        desiredItem: "tea",
        tags: ["merchant", "trader", "starter-npc"],
        visibilityType: "system",
        createdByUser: userId ?? undefined,
        updatedAt: now,
      });
      traderProfile = await ctx.db.get(profileId);
    } else {
      await ctx.db.patch(traderProfile._id, {
        spriteDefName: DEMO_TRADER_DEF,
        mapName: targetMap,
        displayName: "Toma",
        title: "Peddler",
        backstory:
          "Toma drifts from room to room testing what travelers will trade for comfort, food, and little luxuries.",
        personality: "chatty, opportunistic, warm when business is good",
        dialogueStyle: "friendly merchant banter",
        knowledge:
          "He believes every safe room becomes a market eventually if enough people pass through it.",
        items: [{ name: "apple", quantity: 3 }],
        currencies: { coins: 10 },
        desiredItem: "tea",
        tags: ["merchant", "trader", "starter-npc"],
        visibilityType: "system",
        updatedAt: now,
      });
      traderProfile = await ctx.db.get(traderProfile._id);
    }

    let marketProfile = await ctx.db
      .query("npcProfiles")
      .withIndex("by_name", (q) => q.eq("name", MARKET_INSTANCE))
      .first();
    if (!marketProfile) {
      const profileId = await ctx.db.insert("npcProfiles", {
        name: MARKET_INSTANCE,
        spriteDefName: MARKET_SPRITE_DEF,
        mapName: targetMap,
        displayName: "market.btc",
        title: "Market Analyst",
        backstory: "market.btc watches token movement and ecosystem price signals from a trading desk mindset.",
        personality: "measured, alert, analytical",
        dialogueStyle: "concise market briefings",
        knowledge: "market.btc is meant to surface price summaries, token context, and future Tenero-backed analytics.",
        items: [{ name: "ledger", quantity: 1 }],
        currencies: { coins: 12 },
        tags: ["market", "analytics", "signals", "starter-npc"],
        visibilityType: "system",
        createdByUser: userId ?? undefined,
        updatedAt: now,
      });
      marketProfile = await ctx.db.get(profileId);
    } else {
      await ctx.db.patch(marketProfile._id, {
        spriteDefName: MARKET_SPRITE_DEF,
        mapName: targetMap,
        displayName: "market.btc",
        title: "Market Analyst",
        backstory: "market.btc watches token movement and ecosystem price signals from a trading desk mindset.",
        personality: "measured, alert, analytical",
        dialogueStyle: "concise market briefings",
        knowledge: "market.btc is meant to surface price summaries, token context, and future Tenero-backed analytics.",
        items: [{ name: "ledger", quantity: 1 }],
        currencies: { coins: 12 },
        tags: ["market", "analytics", "signals", "starter-npc"],
        visibilityType: "system",
        updatedAt: now,
      });
      marketProfile = await ctx.db.get(marketProfile._id);
    }

    let questsProfile = await ctx.db
      .query("npcProfiles")
      .withIndex("by_name", (q) => q.eq("name", QUESTS_INSTANCE))
      .first();
    if (!questsProfile) {
      const profileId = await ctx.db.insert("npcProfiles", {
        name: QUESTS_INSTANCE,
        spriteDefName: QUESTS_SPRITE_DEF,
        mapName: targetMap,
        displayName: "quests.btc",
        title: "Opportunity Keeper",
        backstory: "quests.btc collects bounties, grants, and quests into one place so arrivals know what work exists.",
        personality: "organized, practical, steady",
        dialogueStyle: "clear task-oriented summaries",
        knowledge: "quests.btc should surface Zero Authority-backed opportunities and later connect them to quest and reward flows.",
        items: [{ name: "notebook", quantity: 1 }],
        currencies: { coins: 8 },
        tags: ["quests", "grants", "bounties", "starter-npc"],
        visibilityType: "system",
        createdByUser: userId ?? undefined,
        updatedAt: now,
      });
      questsProfile = await ctx.db.get(profileId);
    } else {
      await ctx.db.patch(questsProfile._id, {
        spriteDefName: QUESTS_SPRITE_DEF,
        mapName: targetMap,
        displayName: "quests.btc",
        title: "Opportunity Keeper",
        backstory: "quests.btc collects bounties, grants, and quests into one place so arrivals know what work exists.",
        personality: "organized, practical, steady",
        dialogueStyle: "clear task-oriented summaries",
        knowledge: "quests.btc should surface Zero Authority-backed opportunities and later connect them to quest and reward flows.",
        items: [{ name: "notebook", quantity: 1 }],
        currencies: { coins: 8 },
        tags: ["quests", "grants", "bounties", "starter-npc"],
        visibilityType: "system",
        updatedAt: now,
      });
      questsProfile = await ctx.db.get(questsProfile._id);
    }

    const existingObjects = await ctx.db
      .query("mapObjects")
      .withIndex("by_map", (q) => q.eq("mapName", targetMap))
      .collect();
    let demoObject = existingObjects.find((o) => o.instanceName === DEMO_INSTANCE) ?? undefined;
    if (!demoObject) {
      const legacyObject = existingObjects.find((o) => o.instanceName === LEGACY_DEMO_INSTANCE);
      if (legacyObject) {
        await ctx.db.patch(legacyObject._id, {
          instanceName: DEMO_INSTANCE,
          updatedAt: now,
        });
        demoObject = (await ctx.db.get(legacyObject._id)) ?? undefined;
      }
    }
    if (!demoObject) {
      const tileX = 25;
      const tileY = 10;
      const objectId = await ctx.db.insert("mapObjects", {
        mapName: targetMap,
        spriteDefName: DEMO_SPRITE_DEF,
        instanceName: DEMO_INSTANCE,
        x: tileX * map.tileWidth + map.tileWidth / 2,
        y: tileY * map.tileHeight + map.tileHeight,
        layer: 1,
        updatedAt: now,
      });
      demoObject = (await ctx.db.get(objectId)) ?? undefined;
    }

    let traderObject = existingObjects.find((o) => o.instanceName === DEMO_TRADER_INSTANCE) ?? undefined;
    if (!traderObject) {
      const tileX = 29;
      const tileY = 10;
      const objectId = await ctx.db.insert("mapObjects", {
        mapName: targetMap,
        spriteDefName: DEMO_TRADER_DEF,
        instanceName: DEMO_TRADER_INSTANCE,
        x: tileX * map.tileWidth + map.tileWidth / 2,
        y: tileY * map.tileHeight + map.tileHeight,
        layer: 1,
        updatedAt: now,
      });
      traderObject = (await ctx.db.get(objectId)) ?? undefined;
    }

    let marketObject = existingObjects.find((o) => o.instanceName === MARKET_INSTANCE) ?? undefined;
    if (!marketObject) {
      const tileX = 31;
      const tileY = 10;
      const objectId = await ctx.db.insert("mapObjects", {
        mapName: targetMap,
        spriteDefName: MARKET_SPRITE_DEF,
        instanceName: MARKET_INSTANCE,
        x: tileX * map.tileWidth + map.tileWidth / 2,
        y: tileY * map.tileHeight + map.tileHeight,
        layer: 1,
        updatedAt: now,
      });
      marketObject = (await ctx.db.get(objectId)) ?? undefined;
    } else if (marketObject.spriteDefName !== MARKET_SPRITE_DEF) {
      await ctx.db.patch(marketObject._id, {
        spriteDefName: MARKET_SPRITE_DEF,
        updatedAt: now,
      });
      marketObject = (await ctx.db.get(marketObject._id)) ?? undefined;
    }

    let questsObject = existingObjects.find((o) => o.instanceName === QUESTS_INSTANCE) ?? undefined;
    if (!questsObject) {
      const tileX = 23;
      const tileY = 10;
      const objectId = await ctx.db.insert("mapObjects", {
        mapName: targetMap,
        spriteDefName: QUESTS_SPRITE_DEF,
        instanceName: QUESTS_INSTANCE,
        x: tileX * map.tileWidth + map.tileWidth / 2,
        y: tileY * map.tileHeight + map.tileHeight,
        layer: 1,
        updatedAt: now,
      });
      questsObject = (await ctx.db.get(objectId)) ?? undefined;
    } else if (questsObject.spriteDefName !== QUESTS_SPRITE_DEF) {
      await ctx.db.patch(questsObject._id, {
        spriteDefName: QUESTS_SPRITE_DEF,
        updatedAt: now,
      });
      questsObject = (await ctx.db.get(questsObject._id)) ?? undefined;
    }

    const existingAgentState = await ctx.db
      .query("agentStates")
      .withIndex("by_agentId", (q) => q.eq("agentId", DEMO_INSTANCE))
      .first();
    const transitionsJson = JSON.stringify({
      idle: ["teaching", "guiding", "offering-premium"],
      teaching: ["idle", "guiding", "offering-premium"],
      guiding: ["idle", "teaching", "offering-premium"],
      "offering-premium": ["idle", "awaiting-payment"],
      "awaiting-payment": ["idle", "delivering-premium"],
      "delivering-premium": ["idle"],
    });

    if (existingAgentState) {
      await ctx.db.patch(existingAgentState._id, {
        agentType: "npc",
        state: "idle",
        currentIntent: "teach-stacks",
        memorySummary:
          "guide.btc helps players learn Stacks, discover ecosystem opportunities, and preview premium content flows.",
        transitionsJson,
        updatedAt: now,
      });
    } else {
      await ctx.db.insert("agentStates", {
        agentId: DEMO_INSTANCE,
        agentType: "npc",
        state: "idle",
        currentIntent: "teach-stacks",
        memorySummary:
          "guide.btc helps players learn Stacks, discover ecosystem opportunities, and preview premium content flows.",
        transitionsJson,
        updatedAt: now,
      });
    }

    const premiumOfferKey = "guide-btc-premium-brief";
    const existingPremiumOffer = await ctx.db
      .query("premiumContentOffers")
      .withIndex("by_offerKey", (q) => q.eq("offerKey", premiumOfferKey))
      .first();

    const premiumPayload = {
      offerKey: premiumOfferKey,
      agentId: DEMO_INSTANCE,
      title: "Premium content",
      description:
        "A deeper ecosystem briefing using Zero Authority-backed ecosystem context, designed for future x402-on-Stacks payment flow.",
      provider: "x402-stacks",
      priceAsset: "STX",
      priceAmount: "1",
      network: "testnet",
      endpointPath: "/api/premium/guide-btc",
      status: "active",
      metadataJson: JSON.stringify({
        source: "guide.btc",
        delivery: "npc-briefing",
        settlement: "planned-x402-stacks",
      }),
      updatedAt: now,
    };

    if (existingPremiumOffer) {
      await ctx.db.patch(existingPremiumOffer._id, premiumPayload);
    } else {
      await ctx.db.insert("premiumContentOffers", premiumPayload);
    }

    await upsertZone(ctx, {
      mapName: targetMap,
      zoneKey: "entry",
      name: "Entry",
      description: "Arrival area for players entering the Cozy Cabin.",
      zoneType: "entry",
      x: 22,
      y: 9,
      width: 4,
      height: 4,
      tags: ["public", "arrival", "social"],
      accessType: "public",
    });
    await upsertZone(ctx, {
      mapName: targetMap,
      zoneKey: "guide-desk",
      name: "Guide Desk",
      description: "The information point where guide.btc should hold position and brief newcomers.",
      zoneType: "guide",
      x: 24,
      y: 9,
      width: 3,
      height: 3,
      tags: ["guide", "education", "ecosystem", "social"],
      accessType: "public",
    });
    await upsertZone(ctx, {
      mapName: targetMap,
      zoneKey: "merchant-corner",
      name: "Merchant Corner",
      description: "The local trade and gossip area for Toma and future offers.",
      zoneType: "trade",
      x: 28,
      y: 9,
      width: 3,
      height: 3,
      tags: ["trade", "merchant", "offers", "social"],
      accessType: "public",
    });
    await upsertZone(ctx, {
      mapName: targetMap,
      zoneKey: "market-station",
      name: "Market Station",
      description: "A small analytics and pricing zone for market.btc and future token screens.",
      zoneType: "market",
      x: 30,
      y: 9,
      width: 3,
      height: 3,
      tags: ["market", "analytics", "prices", "signals"],
      accessType: "public",
    });
    await upsertZone(ctx, {
      mapName: targetMap,
      zoneKey: "quest-board",
      name: "Quest Board",
      description: "The opportunity zone for grants, bounties, and quest surfaces.",
      zoneType: "quest",
      x: 22,
      y: 9,
      width: 3,
      height: 3,
      tags: ["quests", "grants", "bounties", "opportunities"],
      accessType: "public",
    });

    await upsertSemanticObject(ctx, {
      mapName: targetMap,
      objectKey: "guide-post",
      label: "Guide Post",
      objectType: "npc-post",
      sourceType: "mapObject",
      mapObjectId: demoObject?._id,
      zoneKey: "guide-desk",
      x: demoObject?.x,
      y: demoObject?.y,
      tags: ["guide", "post", "education", "ecosystem"],
      affordances: ["talk", "learn", "inspect"],
      valueClass: "utility",
      linkedAgentId: DEMO_INSTANCE,
    });
    await upsertSemanticObject(ctx, {
      mapName: targetMap,
      objectKey: "merchant-post",
      label: "Merchant Post",
      objectType: "npc-post",
      sourceType: "mapObject",
      mapObjectId: traderObject?._id,
      zoneKey: "merchant-corner",
      x: traderObject?.x,
      y: traderObject?.y,
      tags: ["merchant", "trade", "gossip", "offers"],
      affordances: ["talk", "trade", "inspect"],
      valueClass: "trade",
      linkedAgentId: DEMO_TRADER_INSTANCE,
    });
    await upsertSemanticObject(ctx, {
      mapName: targetMap,
      objectKey: "market-post",
      label: "Market Post",
      objectType: "npc-post",
      sourceType: "mapObject",
      mapObjectId: marketObject?._id,
      zoneKey: "market-station",
      x: marketObject?.x,
      y: marketObject?.y,
      tags: ["market", "analytics", "post", "signals"],
      affordances: ["talk", "inspect", "query"],
      valueClass: "utility",
      linkedAgentId: MARKET_INSTANCE,
    });
    await upsertSemanticObject(ctx, {
      mapName: targetMap,
      objectKey: "quest-post",
      label: "Quest Post",
      objectType: "npc-post",
      sourceType: "mapObject",
      mapObjectId: questsObject?._id,
      zoneKey: "quest-board",
      x: questsObject?.x,
      y: questsObject?.y,
      tags: ["quests", "bounties", "grants", "post"],
      affordances: ["talk", "inspect", "read"],
      valueClass: "utility",
      linkedAgentId: QUESTS_INSTANCE,
    });
    await upsertSemanticObject(ctx, {
      mapName: targetMap,
      objectKey: "coffee-mug",
      label: "Coffee Mug",
      objectType: "consumable",
      sourceType: "scene",
      zoneKey: "guide-desk",
      tags: ["coffee", "comfort", "consumable", "cozy"],
      affordances: ["inspect"],
      valueClass: "utility",
      metadataJson: JSON.stringify({ note: "Visible in scene art; semantic placeholder for future object extraction." }),
    });
    await upsertSemanticObject(ctx, {
      mapName: targetMap,
      objectKey: "books-stack",
      label: "Books Stack",
      objectType: "knowledge",
      sourceType: "scene",
      zoneKey: "guide-desk",
      tags: ["books", "knowledge", "lore", "cozy"],
      affordances: ["inspect", "read"],
      valueClass: "utility",
      metadataJson: JSON.stringify({ note: "Visible in scene art; future lore or research surface." }),
    });
    await upsertSemanticObject(ctx, {
      mapName: targetMap,
      objectKey: "wall-sword",
      label: "Wall Sword",
      objectType: "weapon",
      sourceType: "scene",
      zoneKey: "merchant-corner",
      tags: ["weapon", "decor", "valuable"],
      affordances: ["inspect"],
      valueClass: "decor",
      metadataJson: JSON.stringify({ note: "Visible in scene art; placeholder semantic object." }),
    });
    await upsertSemanticObject(ctx, {
      mapName: targetMap,
      objectKey: "price-board",
      label: "Price Board",
      objectType: "terminal",
      sourceType: "virtual",
      zoneKey: "market-station",
      tags: ["prices", "analytics", "market", "display"],
      affordances: ["inspect", "query"],
      valueClass: "utility",
      metadataJson: JSON.stringify({ note: "Future Tenero-backed market display surface." }),
    });
    await upsertSemanticObject(ctx, {
      mapName: targetMap,
      objectKey: "opportunity-board",
      label: "Opportunity Board",
      objectType: "board",
      sourceType: "virtual",
      zoneKey: "quest-board",
      tags: ["quests", "bounties", "grants", "opportunities"],
      affordances: ["inspect", "read"],
      valueClass: "utility",
      metadataJson: JSON.stringify({ note: "Future Zero Authority-backed board for opportunities." }),
    });

    await upsertNpcRole(ctx, {
      agentId: DEMO_INSTANCE,
      mapName: targetMap,
      roleKey: "guide",
      displayRole: "Ecosystem Guide",
      behaviorMode: "at-post",
      homeZoneKey: "guide-desk",
      postObjectKey: "guide-post",
      permissions: ["teach", "guide", "offer-premium"],
      metadataJson: JSON.stringify({ primaryTopics: ["Stacks", "sBTC", "ecosystem", "agents"] }),
    });
    await upsertNpcRole(ctx, {
      agentId: DEMO_TRADER_INSTANCE,
      mapName: targetMap,
      roleKey: "merchant",
      displayRole: "Peddler",
      behaviorMode: "at-post",
      homeZoneKey: "merchant-corner",
      postObjectKey: "merchant-post",
      permissions: ["trade", "offer", "gossip"],
      metadataJson: JSON.stringify({ primaryTopics: ["trade", "supplies", "rumors"] }),
    });
    await upsertNpcRole(ctx, {
      agentId: MARKET_INSTANCE,
      mapName: targetMap,
      roleKey: "market",
      displayRole: "Market Analyst",
      behaviorMode: "patrol-surface",
      homeZoneKey: "market-station",
      postObjectKey: "market-post",
      permissions: ["quote", "analyze", "surface-signals"],
      metadataJson: JSON.stringify({
        anchorObjectKey: "price-board",
        primaryTopics: ["prices", "analytics", "sBTC", "STX", "USDCx"],
      }),
    });
    await upsertNpcRole(ctx, {
      agentId: QUESTS_INSTANCE,
      mapName: targetMap,
      roleKey: "quests",
      displayRole: "Opportunity Keeper",
      behaviorMode: "patrol-surface",
      homeZoneKey: "quest-board",
      postObjectKey: "quest-post",
      permissions: ["list-opportunities", "start-quest", "surface-bounties"],
      metadataJson: JSON.stringify({
        anchorObjectKey: "opportunity-board",
        primaryTopics: ["grants", "bounties", "quests", "work"],
      }),
    });

    await upsertFact(ctx, {
      mapName: targetMap,
      factKey: "cozy-cabin-semantic-kernel-v1",
      factType: "status",
      valueJson: JSON.stringify({ enabled: true, agents: 4 }),
      scope: "world",
      source: "localDev",
    });
    await upsertFact(ctx, {
      mapName: targetMap,
      factKey: "guide-premium-available",
      factType: "access",
      valueJson: JSON.stringify({ offerKey: premiumOfferKey, asset: "STX", amount: "1", network: "testnet" }),
      scope: "agent",
      subjectId: DEMO_INSTANCE,
      source: "localDev",
    });
    await upsertFact(ctx, {
      mapName: targetMap,
      factKey: "market-surface-ready",
      factType: "status",
      valueJson: JSON.stringify({ analytics: "planned-tenero", assets: ["STX", "sBTC", "USDCx"] }),
      scope: "agent",
      subjectId: MARKET_INSTANCE,
      source: "localDev",
    });

    await upsertAgentRegistryEntry(ctx, {
      agentId: DEMO_INSTANCE,
      displayName: "guide.btc",
      network: "testnet",
      agentType: "npc",
      roleKey: "guide",
      permissionTier: "service",
      status: "active",
      homeWorld: "stacks2d",
      homeMap: targetMap,
      homeZoneKey: "guide-desk",
      supportedAssets: ["STX", "sBTC"],
      metadataJson: JSON.stringify({
        aibtcCompatible: true,
        notes: "Guide agent with premium content surface; no live agent-account execution yet.",
      }),
    });
    await upsertAgentRegistryEntry(ctx, {
      agentId: DEMO_TRADER_INSTANCE,
      displayName: "Toma",
      network: "testnet",
      agentType: "npc",
      roleKey: "merchant",
      permissionTier: "identity-only",
      status: "active",
      homeWorld: "stacks2d",
      homeMap: targetMap,
      homeZoneKey: "merchant-corner",
      supportedAssets: ["STX"],
      metadataJson: JSON.stringify({
        aibtcCompatible: true,
        notes: "Local merchant identity with simulated economy role.",
      }),
    });
    await upsertAgentRegistryEntry(ctx, {
      agentId: MARKET_INSTANCE,
      displayName: "market.btc",
      network: "testnet",
      agentType: "service",
      roleKey: "market",
      permissionTier: "execution",
      status: "active",
      homeWorld: "stacks2d",
      homeMap: targetMap,
      homeZoneKey: "market-station",
      supportedAssets: ["STX", "sBTC", "USDCx"],
      metadataJson: JSON.stringify({
        aibtcCompatible: true,
        notes: "Primary candidate for future AIBTC agent-account binding and market execution.",
      }),
    });
    await upsertAgentRegistryEntry(ctx, {
      agentId: QUESTS_INSTANCE,
      displayName: "quests.btc",
      network: "testnet",
      agentType: "service",
      roleKey: "quests",
      permissionTier: "service",
      status: "active",
      homeWorld: "stacks2d",
      homeMap: targetMap,
      homeZoneKey: "quest-board",
      supportedAssets: ["STX", "sBTC"],
      metadataJson: JSON.stringify({
        aibtcCompatible: true,
        notes: "Opportunity/quest surface for grants, bounties, and future reward flows.",
      }),
    });

    await upsertAgentAccountBinding(ctx, {
      agentId: MARKET_INSTANCE,
      network: "testnet",
      allowlistedContracts: [],
      canPropose: false,
      canApproveContracts: false,
      canTradeAssets: false,
      status: "planned",
      metadataJson: JSON.stringify({
        source: "AIBTC official agent-account model",
        notes: "Planned binding only. No live owner/agent/account contract configured yet.",
      }),
    });

    await appendEvent(ctx, {
      mapName: targetMap,
      eventType: "world-initialized",
      summary: "Cozy Cabin semantic kernel initialized with guide, merchant, market, and quest agents.",
      detailsJson: JSON.stringify({ agents: [DEMO_INSTANCE, DEMO_TRADER_INSTANCE, MARKET_INSTANCE, QUESTS_INSTANCE] }),
    });

    await ctx.scheduler.runAfter(0, internal.npcEngine.syncMap, { mapName: targetMap });

    return {
      seeded: true,
      mapName: targetMap,
      spriteDefName: spriteDef?.name ?? DEMO_SPRITE_DEF,
      traderSpriteDefName: traderSpriteDef?.name ?? DEMO_TRADER_DEF,
      instanceName: npcProfile?.name ?? DEMO_INSTANCE,
      traderInstanceName: traderProfile?.name ?? DEMO_TRADER_INSTANCE,
      marketInstanceName: marketProfile?.name ?? MARKET_INSTANCE,
      questsInstanceName: questsProfile?.name ?? QUESTS_INSTANCE,
      mapObjectId: demoObject?._id ?? null,
      traderMapObjectId: traderObject?._id ?? null,
      marketMapObjectId: marketObject?._id ?? null,
      questsMapObjectId: questsObject?._id ?? null,
    };
  },
});
