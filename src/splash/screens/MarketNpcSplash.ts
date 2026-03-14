import "./MarketNpcSplash.css";
import { getConvexClient } from "../../lib/convexClient.ts";
import { api } from "../../../convex/_generated/api";
import type { SplashScreen, SplashScreenCallbacks } from "../SplashTypes.ts";

export interface MarketNpcSplashProps extends SplashScreenCallbacks {
  npcName: string;
}

type MarketTickerPayload = {
  source?: string;
  syncedAt?: number;
  items?: Array<{
    symbol: string;
    price: number;
    priceLabel: string;
    change24h: number;
  }>;
};

export function createMarketNpcSplash(props: MarketNpcSplashProps): SplashScreen {
  const { npcName, onClose } = props;
  const requestClose = () => onClose();
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
    }
  };
  window.addEventListener("keydown", handleKeydown);

  const el = document.createElement("div");
  el.className = "mns-overlay";
  el.addEventListener("click", (event) => {
    if (event.target === el) requestClose();
  });

  const card = document.createElement("div");
  card.className = "mns-card";
  card.addEventListener("click", (event) => event.stopPropagation());
  el.appendChild(card);

  const header = document.createElement("div");
  header.className = "mns-header";
  card.appendChild(header);

  const headingWrap = document.createElement("div");
  headingWrap.className = "mns-heading-wrap";
  header.appendChild(headingWrap);

  const eyebrow = document.createElement("div");
  eyebrow.className = "mns-eyebrow";
  eyebrow.textContent = "Market surface";
  headingWrap.appendChild(eyebrow);

  const title = document.createElement("h2");
  title.className = "mns-title";
  title.textContent = npcName;
  headingWrap.appendChild(title);

  const subtitle = document.createElement("div");
  subtitle.className = "mns-subtitle";
  subtitle.textContent = "Tenero-backed token pulse for the Stacks ecosystem";
  headingWrap.appendChild(subtitle);

  const closeBtn = document.createElement("button");
  closeBtn.className = "mns-close";
  closeBtn.textContent = "Close ×";
  closeBtn.addEventListener("click", () => requestClose());
  header.appendChild(closeBtn);

  const summary = document.createElement("div");
  summary.className = "mns-summary";
  card.appendChild(summary);

  const sourcePill = document.createElement("div");
  sourcePill.className = "mns-summary-card";
  sourcePill.textContent = "Loading market source…";
  summary.appendChild(sourcePill);

  const syncPill = document.createElement("div");
  syncPill.className = "mns-summary-card";
  syncPill.textContent = "Waiting for snapshot…";
  summary.appendChild(syncPill);

  const body = document.createElement("div");
  body.className = "mns-body";
  card.appendChild(body);

  const lead = document.createElement("p");
  lead.className = "mns-lead";
  lead.textContent =
    "market.btc watches live Stacks token surfaces and distills them into a compact desk view.";
  body.appendChild(lead);

  const list = document.createElement("div");
  list.className = "mns-list";
  body.appendChild(list);

  const footer = document.createElement("div");
  footer.className = "mns-footer";
  footer.textContent = "This surface is for market context, not financial advice.";
  card.appendChild(footer);

  const convex = getConvexClient();
  const teneroApi: any = (api as any)["integrations/tenero"];
  let unsub: (() => void) | null = null;

  function renderTicker(payload: MarketTickerPayload) {
    const items = Array.isArray(payload.items) ? payload.items : [];
    sourcePill.textContent =
      payload.source === "tenero" ? "Live source: Tenero" : "Source: market preview";
    syncPill.textContent = payload.syncedAt
      ? `Snapshot: ${new Date(payload.syncedAt).toLocaleString()}`
      : "Snapshot unavailable";

    list.replaceChildren();
    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "mns-empty";
      empty.textContent = "No market rows available.";
      list.appendChild(empty);
      return;
    }

    for (const item of items) {
      const row = document.createElement("div");
      row.className = "mns-row";

      const sym = document.createElement("div");
      sym.className = "mns-symbol";
      sym.textContent = prettifySymbol(item.symbol);

      const price = document.createElement("div");
      price.className = "mns-price";
      price.textContent = `$${item.priceLabel}`;

      const change = document.createElement("div");
      change.className = `mns-change ${item.change24h >= 0 ? "is-up" : "is-down"}`;
      change.textContent = `${item.change24h >= 0 ? "+" : ""}${item.change24h.toFixed(2)}%`;

      row.append(sym, price, change);
      list.appendChild(row);
    }
  }

  if (teneroApi?.tickerRows) {
    unsub = convex.onUpdate(teneroApi.tickerRows, {}, (payload: any) => {
      renderTicker(payload as MarketTickerPayload);
    });
  } else {
    renderTicker({ source: "fallback", items: [] });
  }

  return {
    el,
    destroy() {
      unsub?.();
      window.removeEventListener("keydown", handleKeydown);
      el.remove();
    },
  };
}

function prettifySymbol(symbol: string) {
  switch (symbol) {
    case "SBTC":
      return "sBTC";
    case "USDCX":
      return "USDCx";
    default:
      return symbol;
  }
}
