import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

export const listAgents = query({
  args: {
    network: v.optional(v.string()),
    status: v.optional(v.string()),
  },
  handler: async (ctx, { network, status }) => {
    if (network && status) {
      return await ctx.db
        .query("agentRegistry")
        .withIndex("by_network_status", (q) => q.eq("network", network).eq("status", status))
        .collect();
    }
    return await ctx.db.query("agentRegistry").collect();
  },
});

export const getAgent = query({
  args: {
    agentId: v.string(),
  },
  handler: async (ctx, { agentId }) => {
    return await ctx.db
      .query("agentRegistry")
      .withIndex("by_agentId", (q) => q.eq("agentId", agentId))
      .first();
  },
});

export const upsertAgent = mutation({
  args: {
    agentId: v.string(),
    displayName: v.string(),
    network: v.string(),
    walletAddress: v.optional(v.string()),
    bnsName: v.optional(v.string()),
    agentType: v.string(),
    roleKey: v.string(),
    permissionTier: v.string(),
    status: v.string(),
    homeWorld: v.optional(v.string()),
    homeMap: v.optional(v.string()),
    homeZoneKey: v.optional(v.string()),
    supportedAssets: v.array(v.string()),
    metadataJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentRegistry")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();
    const payload = {
      ...args,
      updatedAt: Date.now(),
    };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert("agentRegistry", payload);
  },
});

export const getAccountBinding = query({
  args: {
    agentId: v.string(),
  },
  handler: async (ctx, { agentId }) => {
    return await ctx.db
      .query("agentAccountBindings")
      .withIndex("by_agentId", (q) => q.eq("agentId", agentId))
      .first();
  },
});

export const upsertAccountBinding = mutation({
  args: {
    agentId: v.string(),
    network: v.string(),
    ownerAddress: v.optional(v.string()),
    agentAddress: v.optional(v.string()),
    accountContractId: v.optional(v.string()),
    allowlistedContracts: v.array(v.string()),
    canPropose: v.boolean(),
    canApproveContracts: v.boolean(),
    canTradeAssets: v.boolean(),
    status: v.string(),
    metadataJson: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("agentAccountBindings")
      .withIndex("by_agentId", (q) => q.eq("agentId", args.agentId))
      .first();
    const payload = {
      ...args,
      updatedAt: Date.now(),
    };
    if (existing) {
      await ctx.db.patch(existing._id, payload);
      return existing._id;
    }
    return await ctx.db.insert("agentAccountBindings", payload);
  },
});
