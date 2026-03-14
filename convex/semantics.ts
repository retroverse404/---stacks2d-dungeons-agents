import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const getMapSemantics = query({
  args: { mapName: v.string() },
  handler: async (ctx, { mapName }) => {
    const [zones, objects, roles] = await Promise.all([
      ctx.db
        .query("worldZones")
        .withIndex("by_map", (q) => q.eq("mapName", mapName))
        .collect(),
      ctx.db
        .query("semanticObjects")
        .withIndex("by_map", (q) => q.eq("mapName", mapName))
        .collect(),
      ctx.db
        .query("npcRoleAssignments")
        .withIndex("by_map_roleKey", (q) => q.eq("mapName", mapName))
        .collect(),
    ]);

    return { zones, objects, roles };
  },
});

export const listZones = query({
  args: { mapName: v.string() },
  handler: async (ctx, { mapName }) => {
    return await ctx.db
      .query("worldZones")
      .withIndex("by_map", (q) => q.eq("mapName", mapName))
      .collect();
  },
});

export const listObjects = query({
  args: { mapName: v.string() },
  handler: async (ctx, { mapName }) => {
    return await ctx.db
      .query("semanticObjects")
      .withIndex("by_map", (q) => q.eq("mapName", mapName))
      .collect();
  },
});

export const listRoles = query({
  args: { mapName: v.string() },
  handler: async (ctx, { mapName }) => {
    return await ctx.db
      .query("npcRoleAssignments")
      .withIndex("by_map_roleKey", (q) => q.eq("mapName", mapName))
      .collect();
  },
});

export const upsertZone = mutation({
  args: {
    mapName: v.string(),
    zoneKey: v.string(),
    name: v.string(),
    description: v.optional(v.string()),
    zoneType: v.string(),
    x: v.number(),
    y: v.number(),
    width: v.number(),
    height: v.number(),
    tags: v.array(v.string()),
    accessType: v.optional(v.string()),
    metadataJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("worldZones")
      .withIndex("by_map_zoneKey", (q) => q.eq("mapName", args.mapName).eq("zoneKey", args.zoneKey))
      .first();
    const payload = { ...args, updatedAt: Date.now() };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert("worldZones", payload);
  },
});

export const upsertSemanticObject = mutation({
  args: {
    mapName: v.string(),
    objectKey: v.string(),
    label: v.string(),
    objectType: v.string(),
    sourceType: v.string(),
    mapObjectId: v.optional(v.id("mapObjects")),
    zoneKey: v.optional(v.string()),
    x: v.optional(v.float64()),
    y: v.optional(v.float64()),
    tags: v.array(v.string()),
    affordances: v.array(v.string()),
    valueClass: v.optional(v.string()),
    linkedAgentId: v.optional(v.string()),
    stateJson: v.optional(v.string()),
    metadataJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("semanticObjects")
      .withIndex("by_map_objectKey", (q) => q.eq("mapName", args.mapName).eq("objectKey", args.objectKey))
      .first();
    const payload = { ...args, updatedAt: Date.now() };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert("semanticObjects", payload);
  },
});

export const upsertNpcRole = mutation({
  args: {
    agentId: v.string(),
    mapName: v.string(),
    roleKey: v.string(),
    displayRole: v.optional(v.string()),
    behaviorMode: v.optional(v.string()),
    homeZoneKey: v.optional(v.string()),
    postObjectKey: v.optional(v.string()),
    permissions: v.array(v.string()),
    metadataJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("npcRoleAssignments")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();
    const payload = { ...args, updatedAt: Date.now() };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert("npcRoleAssignments", payload);
  },
});
