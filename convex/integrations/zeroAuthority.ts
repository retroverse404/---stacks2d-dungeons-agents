import { v } from "convex/values";
import { action, internalMutation, query } from "../_generated/server";
import { internal } from "../_generated/api";

const SOURCE = "zeroAuthority";
const DEFAULT_BASE_URL = "https://zeroauthoritydao.com/api";
const DEFAULT_LIMIT = 25;
const zeroAuthorityInternal: any = (internal as any)["integrations/zeroAuthority"];

type ZeroAuthorityUser = Record<string, any>;
type ZeroAuthorityOrganization = Record<string, any>;
type ZeroAuthorityOpportunity = Record<string, any>;
type OpportunityType = "bounty" | "grant" | "quest";

function getBaseUrl() {
  const env = (globalThis as any)?.process?.env ?? {};
  return (env.ZERO_AUTHORITY_BASE_URL as string | undefined) || DEFAULT_BASE_URL;
}

function buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const url = new URL(path, `${getBaseUrl()}/`);
  if (params) {
    for (const [key, value] of Object.entries(params)) {
      if (value === undefined) continue;
      url.searchParams.set(key, String(value));
    }
  }
  return url.toString();
}

function optionalString(value: unknown) {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : undefined;
}

function requiredString(value: unknown, fallback: string) {
  return optionalString(value) ?? fallback;
}

function optionalNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return undefined;
}

function toMillis(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }
  if (typeof value === "string") {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function summarizeText(value: unknown, max = 280) {
  const text = optionalString(value);
  if (!text) return undefined;
  return text.length > max ? `${text.slice(0, max - 1)}…` : text;
}

function normalizeOrganization(org: ZeroAuthorityOrganization, syncedAt: number) {
  return {
    source: SOURCE,
    externalId: requiredString(org.id, `org-${requiredString(org.name, "unknown")}`),
    name: requiredString(org.name, "Unknown organization"),
    bio: optionalString(org.bio),
    logo: optionalString(org.logo),
    website: optionalString(org.website),
    twitter: optionalString(org.twitter),
    telegram: optionalString(org.telegram),
    instagram: optionalString(org.instagram),
    network: optionalString(org.network),
    adminExternalId: optionalString(org.adminId),
    rawJson: JSON.stringify(org),
    syncedAt,
    updatedAt: syncedAt,
  };
}

function normalizeUser(user: ZeroAuthorityUser, syncedAt: number) {
  return {
    source: SOURCE,
    externalId: requiredString(user.id, requiredString(user.stxAddress, requiredString(user.username, "unknown-user"))),
    stxAddress: optionalString(user.stxAddress) ?? optionalString(user.address),
    username: requiredString(user.username, optionalString(user.stxAddress) ?? "unknown-user"),
    avatarUrl: optionalString(user.avatarUrl),
    bio: optionalString(user.bio),
    twitter: optionalString(user.twitter),
    discord: optionalString(user.discord),
    telegram: optionalString(user.telegram),
    website: optionalString(user.website),
    githubUrl: optionalString(user.githubUrl),
    linkedin: optionalString(user.linkedin),
    bnsName: optionalString(user.bnsName),
    btcAddress: optionalString(user.btcAddress),
    isXProfileVerified: typeof user.isXProfileVerified === "boolean" ? user.isXProfileVerified : undefined,
    isDiscordProfileVerified:
      typeof user.isDiscordProfileVerified === "boolean" ? user.isDiscordProfileVerified : undefined,
    isTelegramProfileVerified:
      typeof user.isTelegramProfileVerified === "boolean" ? user.isTelegramProfileVerified : undefined,
    profileCompleteness: optionalNumber(user.profileCompleteness),
    activityScore: optionalNumber(user.activityScore),
    servicesJson: Array.isArray(user.services) ? JSON.stringify(user.services) : undefined,
    organizationsJson: Array.isArray(user.organizations) ? JSON.stringify(user.organizations) : undefined,
    rawJson: JSON.stringify(user),
    syncedAt,
    updatedAt: syncedAt,
  };
}

function endpointForType(type: OpportunityType) {
  switch (type) {
    case "bounty":
      return { path: "bounties", listKey: "data" };
    case "grant":
      return { path: "grants", listKey: "data" };
    case "quest":
      return { path: "quest/all", listKey: "data" };
  }
}

function normalizeOpportunity(type: OpportunityType, item: ZeroAuthorityOpportunity, syncedAt: number) {
  const creator = item.creator ?? {};
  const grantee = item.grantee ?? {};
  const token = item.token ?? {};
  const organization = item.organization ?? {};
  const startsAt = toMillis(item.startDate ?? item.createdAt ?? item.start_at);
  const endsAt = toMillis(item.endDate ?? item.deadline ?? item.end_at);
  const rawTitle = item.projectName ?? item.name ?? item.title ?? item.question ?? item.headline;
  const rawSummary = item.projectDescription ?? item.details ?? item.description ?? item.summary;
  const rawCategory = item.subcategory ?? item.category?.name ?? item.category;
  const rawCreatorName = creator.username ?? creator.name ?? grantee.username ?? grantee.name;
  const rawCreatorStxAddress =
    creator.stxAddress ?? creator.address ?? grantee.stxAddress ?? grantee.address;

  return {
    source: SOURCE,
    opportunityType: type,
    externalId: requiredString(item.id, `${type}-${requiredString(item.slug, requiredString(item.name, "unknown"))}`),
    slug: optionalString(item.slug),
    title: requiredString(rawTitle, `${type} opportunity`),
    summary: summarizeText(rawSummary),
    status: optionalString(item.status),
    category: optionalString(rawCategory),
    organizationName: optionalString(organization.name),
    creatorName: optionalString(rawCreatorName),
    creatorStxAddress: optionalString(rawCreatorStxAddress),
    tokenSymbol: optionalString(token.symbol),
    tokenAddress: optionalString(token.address),
    rewardAmount: optionalString(item.totalPayment) ?? optionalString(item.rewardAmount),
    rewardUnit: optionalString(token.symbol ?? item.rewardUnit),
    sourceUrl: optionalString(item.url),
    startsAt,
    endsAt,
    isActive:
      typeof item.isActive === "boolean"
        ? item.isActive
        : typeof item.isExpired === "boolean"
          ? !item.isExpired
          : undefined,
    rawJson: JSON.stringify(item),
    syncedAt,
    updatedAt: syncedAt,
  };
}

async function fetchJson(path: string, params?: Record<string, string | number | boolean | undefined>) {
  const response = await fetch(buildUrl(path, params), {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Zero Authority API error: ${response.status} ${details}`);
  }
  return await response.json();
}

export const syncUsers = action({
  args: {
    limit: v.optional(v.number()),
    page: v.optional(v.number()),
  },
  handler: async (ctx, { limit, page }): Promise<any> => {
    const startedAt = Date.now();
    const data = await fetchJson("users", {
      limit: limit ?? DEFAULT_LIMIT,
      page: page ?? 1,
    });
    const users = Array.isArray(data.users) ? data.users : [];
    const organizations = users.flatMap((user: ZeroAuthorityUser) =>
      Array.isArray(user.organizations) ? user.organizations : [],
    );

    const result = await ctx.runMutation(zeroAuthorityInternal.ingestUserSnapshot, {
      usersJson: JSON.stringify(users),
      organizationsJson: JSON.stringify(organizations),
      metadataJson: JSON.stringify({
        pagination: data.pagination ?? null,
        stats: data.stats ?? null,
        meta: data.meta ?? null,
      }),
      startedAt,
      syncedAt: Date.now(),
    });

    return {
      source: SOURCE,
      ...result,
      fetchedUsers: users.length,
      fetchedOrganizations: organizations.length,
    };
  },
});

export const syncOpportunities = action({
  args: {
    types: v.optional(
      v.array(v.union(v.literal("bounty"), v.literal("grant"), v.literal("quest"))),
    ),
    limit: v.optional(v.number()),
    page: v.optional(v.number()),
  },
  handler: async (ctx, { types, limit, page }): Promise<any> => {
    const startedAt = Date.now();
    const requestedTypes: OpportunityType[] =
      types && types.length > 0 ? (types as OpportunityType[]) : ["bounty", "grant", "quest"];
    const snapshots: Array<{ type: OpportunityType; items: ZeroAuthorityOpportunity[]; meta: any }> = [];

    for (const type of requestedTypes) {
      const config = endpointForType(type);
      const data = await fetchJson(config.path, {
        limit: limit ?? DEFAULT_LIMIT,
        page: page ?? 1,
      });
      const items = Array.isArray((data as any)[config.listKey]) ? (data as any)[config.listKey] : [];
      snapshots.push({
        type,
        items,
        meta: {
          meta: (data as any).meta ?? null,
          stats: (data as any).stats ?? null,
          filters: (data as any).filters ?? null,
          sort: (data as any).sort ?? null,
        },
      });
    }

    const result = await ctx.runMutation(zeroAuthorityInternal.ingestOpportunitySnapshot, {
      snapshotsJson: JSON.stringify(snapshots),
      startedAt,
      syncedAt: Date.now(),
    });

    return {
      source: SOURCE,
      ...result,
      fetched: snapshots.reduce((sum, snapshot) => sum + snapshot.items.length, 0),
    };
  },
});

export const syncEverything = action({
  args: {
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { limit }): Promise<any> => {
    const startedAt = Date.now();
    const userData = await fetchJson("users", {
      limit: limit ?? DEFAULT_LIMIT,
      page: 1,
    });
    const users = Array.isArray(userData.users) ? userData.users : [];
    const organizations = users.flatMap((user: ZeroAuthorityUser) =>
      Array.isArray(user.organizations) ? user.organizations : [],
    );
    const userResult = await ctx.runMutation(zeroAuthorityInternal.ingestUserSnapshot, {
      usersJson: JSON.stringify(users),
      organizationsJson: JSON.stringify(organizations),
      metadataJson: JSON.stringify({
        pagination: userData.pagination ?? null,
        stats: userData.stats ?? null,
        meta: userData.meta ?? null,
      }),
      startedAt,
      syncedAt: Date.now(),
    });

    const opportunityTypes: OpportunityType[] = ["bounty", "grant", "quest"];
    const snapshots: Array<{ type: OpportunityType; items: ZeroAuthorityOpportunity[]; meta: any }> = [];
    for (const type of opportunityTypes) {
      const config = endpointForType(type);
      const data = await fetchJson(config.path, {
        limit: limit ?? DEFAULT_LIMIT,
        page: 1,
      });
      const items = Array.isArray((data as any)[config.listKey]) ? (data as any)[config.listKey] : [];
      snapshots.push({
        type,
        items,
        meta: {
          meta: (data as any).meta ?? null,
          stats: (data as any).stats ?? null,
          filters: (data as any).filters ?? null,
          sort: (data as any).sort ?? null,
        },
      });
    }
    const opportunityResult = await ctx.runMutation(
      zeroAuthorityInternal.ingestOpportunitySnapshot,
      {
        snapshotsJson: JSON.stringify(snapshots),
        startedAt,
        syncedAt: Date.now(),
      },
    );
    return {
      source: SOURCE,
      users: {
        fetchedUsers: users.length,
        fetchedOrganizations: organizations.length,
        ...userResult,
      },
      opportunities: {
        fetched: snapshots.reduce((sum, snapshot) => sum + snapshot.items.length, 0),
        ...opportunityResult,
      },
    };
  },
});

export const listUsers = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, { limit }) => {
    return await ctx.db.query("externalUsers").take(limit ?? 20);
  },
});

export const listOpportunities = query({
  args: {
    type: v.optional(v.union(v.literal("bounty"), v.literal("grant"), v.literal("quest"))),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, { type, limit }) => {
    if (!type) {
      return await ctx.db.query("externalOpportunities").take(limit ?? 20);
    }
    return await ctx.db
      .query("externalOpportunities")
      .withIndex("by_source_type", (q) => q.eq("source", SOURCE).eq("opportunityType", type))
      .take(limit ?? 20);
  },
});

export const guideSnapshot = query({
  args: {},
  handler: async (ctx) => {
    const [users, bounties, grants, quests, syncLog] = await Promise.all([
      ctx.db
        .query("externalUsers")
        .withIndex("by_source_username", (q) => q.eq("source", SOURCE))
        .take(8),
      ctx.db
        .query("externalOpportunities")
        .withIndex("by_source_type", (q) => q.eq("source", SOURCE).eq("opportunityType", "bounty"))
        .take(6),
      ctx.db
        .query("externalOpportunities")
        .withIndex("by_source_type", (q) => q.eq("source", SOURCE).eq("opportunityType", "grant"))
        .take(6),
      ctx.db
        .query("externalOpportunities")
        .withIndex("by_source_type", (q) => q.eq("source", SOURCE).eq("opportunityType", "quest"))
        .take(6),
      ctx.db
        .query("externalSyncLog")
        .withIndex("by_source_startedAt", (q) => q.eq("source", SOURCE))
        .order("desc")
        .take(5),
    ]);

    return { users, bounties, grants, quests, syncLog };
  },
});

export const ingestUserSnapshot = internalMutation({
  args: {
    usersJson: v.string(),
    organizationsJson: v.string(),
    metadataJson: v.optional(v.string()),
    startedAt: v.number(),
    syncedAt: v.number(),
  },
  handler: async (ctx, { usersJson, organizationsJson, metadataJson, startedAt, syncedAt }) => {
    const users = JSON.parse(usersJson) as ZeroAuthorityUser[];
    const organizations = JSON.parse(organizationsJson) as ZeroAuthorityOrganization[];
    const dedupedOrganizations = new Map<string, ReturnType<typeof normalizeOrganization>>();
    for (const org of organizations) {
      const normalized = normalizeOrganization(org, syncedAt);
      dedupedOrganizations.set(normalized.externalId, normalized);
    }

    let upsertedUsers = 0;
    for (const user of users) {
      const normalized = normalizeUser(user, syncedAt);
      const existing = await ctx.db
        .query("externalUsers")
        .withIndex("by_source_externalId", (q) => q.eq("source", SOURCE).eq("externalId", normalized.externalId))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, normalized);
      } else {
        await ctx.db.insert("externalUsers", normalized);
      }
      upsertedUsers++;
    }

    let upsertedOrganizations = 0;
    for (const normalized of dedupedOrganizations.values()) {
      const existing = await ctx.db
        .query("externalOrganizations")
        .withIndex("by_source_externalId", (q) => q.eq("source", SOURCE).eq("externalId", normalized.externalId))
        .first();
      if (existing) {
        await ctx.db.patch(existing._id, normalized);
      } else {
        await ctx.db.insert("externalOrganizations", normalized);
      }
      upsertedOrganizations++;
    }

    await ctx.db.insert("externalSyncLog", {
      source: SOURCE,
      syncType: "users",
      status: "success",
      startedAt,
      finishedAt: syncedAt,
      recordsFetched: users.length,
      recordsUpserted: upsertedUsers + upsertedOrganizations,
      metadataJson,
    });

    return {
      upsertedUsers,
      upsertedOrganizations,
    };
  },
});

export const ingestOpportunitySnapshot = internalMutation({
  args: {
    snapshotsJson: v.string(),
    startedAt: v.number(),
    syncedAt: v.number(),
  },
  handler: async (ctx, { snapshotsJson, startedAt, syncedAt }) => {
    const snapshots = JSON.parse(snapshotsJson) as Array<{
      type: OpportunityType;
      items: ZeroAuthorityOpportunity[];
      meta?: unknown;
    }>;
    let upserted = 0;

    for (const snapshot of snapshots) {
      for (const item of snapshot.items) {
        const normalized = normalizeOpportunity(snapshot.type, item, syncedAt);
        const existing = await ctx.db
          .query("externalOpportunities")
          .withIndex("by_source_externalId", (q) => q.eq("source", SOURCE).eq("externalId", normalized.externalId))
          .first();
        if (existing) {
          await ctx.db.patch(existing._id, normalized);
        } else {
          await ctx.db.insert("externalOpportunities", normalized);
        }
        upserted++;
      }

      await ctx.db.insert("externalSyncLog", {
        source: SOURCE,
        syncType: snapshot.type,
        status: "success",
        startedAt,
        finishedAt: syncedAt,
        recordsFetched: snapshot.items.length,
        recordsUpserted: snapshot.items.length,
        metadataJson: snapshot.meta ? JSON.stringify(snapshot.meta) : undefined,
      });
    }

    return { upserted };
  },
});
