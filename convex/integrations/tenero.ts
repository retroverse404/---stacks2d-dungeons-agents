import { v } from "convex/values";
import { action, internalMutation, query } from "../_generated/server";
import { api, internal } from "../_generated/api";

const SOURCE = "tenero";
const DEFAULT_BASE_URL = "https://www.tenero.io";
const DEFAULT_TICKER_ENDPOINT = "https://api.tenero.io/v1/stacks/tokens";
const DEFAULT_TICKER_MAX_AGE_MS = 5 * 60 * 1000;
const teneroInternal: any = (internal as any)["integrations/tenero"];

type TickerRow = {
  symbol: string;
  price: number;
  change24h: number;
};

const CURATED_TICKER_ORDER = ["STX", "SBTC", "USDCX", "LEO", "WELSH"] as const;
const CURATED_TICKER_SYMBOLS: ReadonlySet<string> = new Set(CURATED_TICKER_ORDER);

const FALLBACK_TICKER: TickerRow[] = [
  { symbol: "STX", price: 2.61, change24h: 4.8 },
  { symbol: "SBTC", price: 103420, change24h: 1.2 },
  { symbol: "USDCX", price: 1.0, change24h: 0.0 },
  { symbol: "LEO", price: 0.18, change24h: 6.4 },
  { symbol: "WELSH", price: 0.00042, change24h: -2.1 },
];

function getBaseUrl() {
  const env = (globalThis as any)?.process?.env ?? {};
  return (env.TENERO_BASE_URL as string | undefined) || DEFAULT_BASE_URL;
}

function buildUrl(path: string) {
  if (/^https?:\/\//i.test(path)) return path;
  return new URL(path.replace(/^\//, ""), `${getBaseUrl()}/`).toString();
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return null;
}

function firstFiniteNumber(...values: unknown[]): number {
  for (const value of values) {
    const parsed = coerceNumber(value);
    if (parsed !== null) return parsed;
  }
  return NaN;
}

function formatTickerSymbol(symbol: string) {
  if (symbol === "SBTC") return "sBTC";
  if (symbol === "USDCX") return "USDCx";
  return symbol;
}

function normalizeTickerRow(input: any): TickerRow | null {
  const symbol = typeof input?.symbol === "string"
    ? input.symbol
    : typeof input?.ticker === "string"
      ? input.ticker
      : typeof input?.asset === "string"
        ? input.asset
        : null;
  const normalizedSymbol = symbol ? symbol.toUpperCase() : null;
  const priceValue = firstFiniteNumber(
    input?.price?.current_price,
    input?.price?.price_usd,
    input?.price,
    input?.lastPrice,
    input?.current_price,
    input?.price_usd,
    input?.value,
  );
  const changeValue = firstFiniteNumber(
    input?.price?.price_change_1d_pct,
    input?.change24h,
    input?.changePercent24h,
    input?.percentChange24h,
    0,
  );

  if (!normalizedSymbol || !Number.isFinite(priceValue)) return null;
  return {
    symbol: normalizedSymbol,
    price: priceValue,
    change24h: Number.isFinite(changeValue) ? changeValue : 0,
  };
}

function parseTickerRows(rawJson?: string | null): TickerRow[] {
  if (!rawJson) return [];
  try {
    const parsed = JSON.parse(rawJson);
    const candidates = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed?.tokens)
        ? parsed.tokens
        : Array.isArray(parsed?.assets)
          ? parsed.assets
          : Array.isArray(parsed?.data?.rows)
            ? parsed.data.rows
          : Array.isArray(parsed?.data)
            ? parsed.data
            : [];
    return candidates
      .map((row: unknown) => normalizeTickerRow(row))
      .filter((row: TickerRow | null): row is TickerRow => !!row)
      .filter((row: TickerRow) => CURATED_TICKER_SYMBOLS.has(row.symbol));
  } catch {
    return [];
  }
}

function formatPrice(symbol: string, price: number): string {
  if (symbol === "USDCX") return price.toFixed(2);
  if (symbol === "WELSH") return price.toFixed(6);
  if (price >= 1000) return price.toLocaleString(undefined, { maximumFractionDigits: 0 });
  if (price >= 1) return price.toFixed(2);
  return price.toFixed(4);
}

function mergeCuratedTickerRows(rows: TickerRow[]) {
  const liveRows = new Map(rows.map((row) => [row.symbol, row]));
  const fallbackRows = new Map(FALLBACK_TICKER.map((row) => [row.symbol, row]));
  return CURATED_TICKER_ORDER.map((symbol) => liveRows.get(symbol) ?? fallbackRows.get(symbol)).filter(
    (row): row is TickerRow => !!row,
  );
}

async function fetchAndStoreSnapshot(
  ctx: any,
  {
    snapshotType,
    path,
    scope,
    title,
    summary,
  }: {
    snapshotType: string;
    path: string;
    scope?: string;
    title?: string;
    summary?: string;
  },
) {
  const response = await fetch(buildUrl(path), {
    headers: { Accept: "application/json, text/html;q=0.9,*/*;q=0.8" },
  });

  if (!response.ok) {
    const details = await response.text();
    throw new Error(`Tenero fetch failed: ${response.status} ${details}`);
  }

  const rawBody = await response.text();
  const syncedAt = Date.now();
  const result = await ctx.runMutation(teneroInternal.ingestSnapshot, {
    snapshotType,
    scope,
    title,
    summary,
    rawJson: rawBody,
    syncedAt,
  });

  return {
    source: SOURCE,
    snapshotType,
    syncedAt,
    ...result,
  };
}

export const syncSnapshot = action({
  args: {
    snapshotType: v.string(),
    path: v.string(),
    scope: v.optional(v.string()),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
  },
  handler: async (ctx, { snapshotType, path, scope, title, summary }): Promise<any> => {
    return await fetchAndStoreSnapshot(ctx, {
      snapshotType,
      path,
      scope,
      title,
      summary,
    });
  },
});

export const refreshTickerIfStale = action({
  args: {
    force: v.optional(v.boolean()),
    maxAgeMs: v.optional(v.number()),
  },
  handler: async (ctx, { force, maxAgeMs }): Promise<any> => {
    const latest: any = await ctx.runQuery((api as any)["integrations/tenero"].latestSnapshot, {
      snapshotType: "token-ticker",
    });
    const rows = parseTickerRows(latest?.rawJson);
    const ageMs: number = latest?.syncedAt ? Date.now() - latest.syncedAt : Number.POSITIVE_INFINITY;
    const resolvedMaxAgeMs = typeof maxAgeMs === "number" && maxAgeMs > 0
      ? maxAgeMs
      : DEFAULT_TICKER_MAX_AGE_MS;
    const stale = !latest || rows.length === 0 || ageMs > resolvedMaxAgeMs;

    if (!force && !stale) {
      return {
        ageMs,
        reason: "fresh",
        refreshed: false,
        snapshotType: "token-ticker",
        source: SOURCE,
        syncedAt: latest?.syncedAt ?? null,
      };
    }

    const result = await fetchAndStoreSnapshot(ctx, {
      snapshotType: "token-ticker",
      path: DEFAULT_TICKER_ENDPOINT,
      title: "Stacks token ticker",
      summary: "Curated token prices for HUD and market surfaces.",
    });

    return {
      ageMs: 0,
      reason: stale ? "stale" : "forced",
      refreshed: true,
      ...result,
    };
  },
});

export const latestSnapshot = query({
  args: {
    snapshotType: v.string(),
  },
  handler: async (ctx, { snapshotType }) => {
    return await ctx.db
      .query("externalMarketSnapshots")
      .withIndex("by_source_snapshotType", (q) => q.eq("source", SOURCE).eq("snapshotType", snapshotType))
      .order("desc")
      .first();
  },
});

export const tickerRows = query({
  args: {},
  handler: async (ctx) => {
    const latest = await ctx.db
      .query("externalMarketSnapshots")
      .withIndex("by_source_snapshotType", (q) => q.eq("source", SOURCE).eq("snapshotType", "token-ticker"))
      .order("desc")
      .first();

    const rows = parseTickerRows(latest?.rawJson);
    const sourceRows = mergeCuratedTickerRows(rows);
    const ageMs = latest?.syncedAt ? Date.now() - latest.syncedAt : null;
    return {
      source: rows.length > 0 ? SOURCE : "fallback",
      ageMs,
      isStale: !latest || ageMs === null ? true : ageMs > DEFAULT_TICKER_MAX_AGE_MS,
      syncedAt: latest?.syncedAt ?? Date.now(),
      items: sourceRows.map((row) => ({
        symbol: formatTickerSymbol(row.symbol),
        price: row.price,
        priceLabel: formatPrice(row.symbol, row.price),
        change24h: row.change24h,
      })),
    };
  },
});

export const ingestSnapshot = internalMutation({
  args: {
    snapshotType: v.string(),
    scope: v.optional(v.string()),
    title: v.optional(v.string()),
    summary: v.optional(v.string()),
    rawJson: v.string(),
    syncedAt: v.number(),
  },
  handler: async (ctx, { snapshotType, scope, title, summary, rawJson, syncedAt }) => {
    const existing = await ctx.db
      .query("externalMarketSnapshots")
      .withIndex("by_source_scope", (q) => q.eq("source", SOURCE).eq("scope", scope))
      .collect();

    const matching = existing.find((item) => item.snapshotType === snapshotType);
    const payload = {
      source: SOURCE,
      snapshotType,
      scope,
      title,
      summary,
      rawJson,
      syncedAt,
      updatedAt: syncedAt,
    };

    if (matching) {
      await ctx.db.patch(matching._id, payload);
      return { updated: true, snapshotId: matching._id };
    }

    const id = await ctx.db.insert("externalMarketSnapshots", payload);
    return { updated: false, snapshotId: id };
  },
});
