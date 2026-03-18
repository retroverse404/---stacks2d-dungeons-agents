import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import { buildWorldEventRecord } from "./lib/worldEvents";

function parseJsonObject(value: string | undefined) {
  if (!value) return {} as Record<string, unknown>;
  try {
    const parsed = JSON.parse(value);
    return parsed && typeof parsed === "object" ? (parsed as Record<string, unknown>) : {};
  } catch {
    return {} as Record<string, unknown>;
  }
}

async function findExistingFact(
  ctx: any,
  args: {
    mapName?: string;
    factKey: string;
    scope?: string;
    subjectId?: string;
  },
) {
  if (args.mapName && args.scope && args.subjectId) {
    return await ctx.db
      .query("worldFacts")
      .withIndex("by_map_scope_subject_factKey", (q: any) =>
        q
          .eq("mapName", args.mapName)
          .eq("scope", args.scope)
          .eq("subjectId", args.subjectId)
          .eq("factKey", args.factKey),
      )
      .first();
  }

  if (args.scope && args.subjectId) {
    return await ctx.db
      .query("worldFacts")
      .withIndex("by_scope_subject_factKey", (q: any) =>
        q.eq("scope", args.scope).eq("subjectId", args.subjectId).eq("factKey", args.factKey),
      )
      .first();
  }

  if (args.mapName) {
    return await ctx.db
      .query("worldFacts")
      .withIndex("by_map_factKey", (q: any) => q.eq("mapName", args.mapName).eq("factKey", args.factKey))
      .first();
  }

  return await ctx.db
    .query("worldFacts")
    .withIndex("by_factKey", (q: any) => q.eq("factKey", args.factKey))
    .first();
}

export const listFacts = query({
  args: {
    mapName: v.optional(v.string()),
    scope: v.optional(v.string()),
    subjectId: v.optional(v.string()),
  },
  handler: async (ctx, { mapName, scope, subjectId }) => {
    if (mapName && scope && subjectId) {
      return await ctx.db
        .query("worldFacts")
        .withIndex("by_map_scope_subject", (q: any) =>
          q.eq("mapName", mapName).eq("scope", scope).eq("subjectId", subjectId),
        )
        .collect();
    }
    if (scope && subjectId) {
      return await ctx.db
        .query("worldFacts")
        .withIndex("by_scope_subject", (q: any) => q.eq("scope", scope).eq("subjectId", subjectId))
        .collect();
    }

    const rows = mapName
      ? await ctx.db
          .query("worldFacts")
          .withIndex("by_map_factKey", (q) => q.eq("mapName", mapName))
          .collect()
      : await ctx.db.query("worldFacts").collect();

    if (!scope && !subjectId) {
      return rows;
    }

    return rows.filter((row) => {
      if (scope && row.scope !== scope) return false;
      if (subjectId && row.subjectId !== subjectId) return false;
      return true;
    });
  },
});

export const listEvents = query({
  args: {
    mapName: v.optional(v.string()),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { mapName, limit }) => {
    const take = Math.max(1, Math.min(limit ?? 20, 100));
    const rows = mapName
      ? await ctx.db
          .query("worldEvents")
          .withIndex("by_map_time", (q) => q.eq("mapName", mapName))
          .order("desc")
          .take(take)
      : await ctx.db.query("worldEvents").order("desc").take(take);
    return rows;
  },
});

export const upsertFact = mutation({
  args: {
    mapName: v.optional(v.string()),
    factKey: v.string(),
    factType: v.string(),
    valueJson: v.string(),
    scope: v.optional(v.string()),
    subjectId: v.optional(v.string()),
    source: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await findExistingFact(ctx, args);
    const payload = { ...args, updatedAt: Date.now() };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert("worldFacts", payload);
  },
});

export const recordDiscovery = mutation({
  args: {
    mapName: v.optional(v.string()),
    factKey: v.string(),
    summary: v.string(),
    factType: v.optional(v.string()),
    scope: v.optional(v.string()),
    subjectId: v.optional(v.string()),
    source: v.optional(v.string()),
    objectKey: v.optional(v.string()),
    zoneKey: v.optional(v.string()),
    valueJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const existing = await findExistingFact(ctx, args);
    const existingValue = parseJsonObject(existing?.valueJson);
    const incomingValue = parseJsonObject(args.valueJson);
    const firstDiscoveredAt =
      typeof existingValue.firstDiscoveredAt === "number" ? existingValue.firstDiscoveredAt : now;
    const timesObserved =
      typeof existingValue.timesObserved === "number" ? existingValue.timesObserved + 1 : 1;

    const nextValue = {
      ...existingValue,
      ...incomingValue,
      summary: args.summary,
      objectKey: args.objectKey ?? existingValue.objectKey ?? null,
      zoneKey: args.zoneKey ?? existingValue.zoneKey ?? null,
      source: args.source ?? existingValue.source ?? null,
      firstDiscoveredAt,
      lastDiscoveredAt: now,
      timesObserved,
    };

    const payload = {
      mapName: args.mapName,
      factKey: args.factKey,
      factType: args.factType ?? "knowledge",
      valueJson: JSON.stringify(nextValue),
      scope: args.scope,
      subjectId: args.subjectId,
      source: args.source,
      updatedAt: now,
    };

    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }

    return await ctx.db.insert("worldFacts", payload);
  },
});

export const appendEvent = mutation({
  args: {
    mapName: v.optional(v.string()),
    worldId: v.optional(v.string()),
    eventType: v.string(),
    sourceType: v.optional(v.string()),
    sourceId: v.optional(v.string()),
    actorId: v.optional(v.string()),
    targetId: v.optional(v.string()),
    objectKey: v.optional(v.string()),
    zoneKey: v.optional(v.string()),
    tileX: v.optional(v.number()),
    tileY: v.optional(v.number()),
    summary: v.string(),
    payloadJson: v.optional(v.string()),
    detailsJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("worldEvents", buildWorldEventRecord(args));
  },
});
