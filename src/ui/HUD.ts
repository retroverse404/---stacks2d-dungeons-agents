/**
 * HUD overlay – shows the current mode label.
 */
import type { AppMode } from "../engine/types.ts";
import { getConvexClient } from "../lib/convexClient.ts";
import { api } from "../../convex/_generated/api";
import "./HUD.css";

const teneroApi: any = (api as any)["integrations/tenero"];
const TICKER_REFRESH_MAX_AGE_MS = 5 * 60 * 1000;

function formatAgeLabel(ageMs?: number | null) {
  if (typeof ageMs !== "number" || !Number.isFinite(ageMs) || ageMs < 0) return "";
  const minutes = Math.floor(ageMs / 60000);
  if (minutes <= 0) return "just now";
  if (minutes === 1) return "1 min ago";
  return `${minutes} min ago`;
}

export class HUD {
  readonly el: HTMLElement;
  private label: HTMLElement;
  private tickerViewport: HTMLElement;
  private tickerTrack: HTMLElement;
  private tickerSource: HTMLElement;
  private unsub: (() => void) | null = null;

  constructor(mode: AppMode) {
    this.el = document.createElement("div");
    this.el.className = "hud";

    this.label = document.createElement("div");
    this.label.className = "hud-mode-label";
    this.label.textContent = `${mode.toUpperCase()} MODE`;
    this.el.appendChild(this.label);

    const ticker = document.createElement("div");
    ticker.className = "hud-ticker";

    this.tickerViewport = document.createElement("div");
    this.tickerViewport.className = "hud-ticker-viewport";

    this.tickerTrack = document.createElement("div");
    this.tickerTrack.className = "hud-ticker-track";
    this.tickerTrack.textContent = "Loading Stacks market feed...";

    this.tickerViewport.appendChild(this.tickerTrack);

    this.tickerSource = document.createElement("div");
    this.tickerSource.className = "hud-ticker-source";
    this.tickerSource.textContent = "Market feed";

    ticker.append(this.tickerViewport, this.tickerSource);
    this.el.appendChild(ticker);

    this.subscribeTicker();
  }

  setMode(mode: AppMode) {
    this.label.textContent = `${mode.toUpperCase()} MODE`;
  }

  private subscribeTicker() {
    this.unsub?.();
    if (!teneroApi?.tickerRows) {
      this.tickerTrack.textContent = "Stacks market preview unavailable.";
      this.tickerSource.textContent = "Market feed";
      return;
    }
    const convex = getConvexClient();
    if (teneroApi?.refreshTickerIfStale) {
      void convex
        .action(teneroApi.refreshTickerIfStale, { maxAgeMs: TICKER_REFRESH_MAX_AGE_MS })
        .catch((error: unknown) => {
          console.warn("[HUD] Tenero ticker refresh failed", error);
        });
    }
    this.unsub = convex.onUpdate(teneroApi.tickerRows, {}, (payload: any) => {
      const items = Array.isArray(payload?.items) ? payload.items : [];
      const repeated = items.length > 0 ? [...items, ...items] : [];
      this.tickerTrack.innerHTML = "";

      if (repeated.length === 0) {
        this.tickerTrack.textContent = "No market feed available.";
      } else {
        for (const item of repeated) {
          const segment = document.createElement("span");
          segment.className = "hud-ticker-item";

          const symbol = document.createElement("span");
          symbol.className = "hud-ticker-symbol";
          symbol.textContent = item.symbol;

          const price = document.createElement("span");
          price.className = "hud-ticker-price";
          price.textContent = item.priceLabel;

          const change = document.createElement("span");
          change.className = `hud-ticker-change ${item.change24h >= 0 ? "is-up" : "is-down"}`;
          change.textContent = `${item.change24h >= 0 ? "+" : ""}${Number(item.change24h).toFixed(1)}%`;

          segment.append(symbol, price, change);
          this.tickerTrack.appendChild(segment);
        }
      }

      const ageLabel = formatAgeLabel(payload?.ageMs);
      if (payload?.source === "tenero") {
        this.tickerSource.textContent = payload?.isStale
          ? `Tenero market feed • stale${ageLabel ? ` (${ageLabel})` : ""}`
          : `Tenero market feed${ageLabel ? ` • ${ageLabel}` : ""}`;
      } else {
        this.tickerSource.textContent = "Stacks market preview";
      }
    });
  }

  show() { this.el.style.display = ""; }
  hide() { this.el.style.display = "none"; }
  destroy() {
    this.unsub?.();
    this.el.remove();
  }
}
