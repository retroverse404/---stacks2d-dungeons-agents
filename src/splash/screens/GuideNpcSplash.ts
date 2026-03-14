import "./GuideNpcSplash.css";
import { getConvexClient } from "../../lib/convexClient.ts";
import { api } from "../../../convex/_generated/api";
import type { SplashScreen, SplashScreenCallbacks } from "../SplashTypes.ts";
import {
  GUIDE_BTC_BRIEFING_INTRO,
  GUIDE_BTC_TOPICS,
  GUIDE_BTC_VERIFIED_CONTEXT,
  type GuideTopic,
} from "../../story/content/stacksGuideContext.ts";

export interface GuideNpcSplashProps extends SplashScreenCallbacks {
  npcName: string;
}

type SnapshotPayload = {
  users?: any[];
  bounties?: any[];
  grants?: any[];
  quests?: any[];
  syncLog?: any[];
};

export function createGuideNpcSplash(props: GuideNpcSplashProps): SplashScreen {
  const { npcName, onClose } = props;
  const premiumOfferKey = "guide-btc-premium-brief";
  const requestClose = () => onClose();
  const handleKeydown = (event: KeyboardEvent) => {
    if (event.key === "Escape") {
      event.preventDefault();
      requestClose();
    }
  };
  window.addEventListener("keydown", handleKeydown);

  const el = document.createElement("div");
  el.className = "gns-overlay";

  const card = document.createElement("div");
  card.className = "gns-card";
  el.appendChild(card);
  el.addEventListener("click", (event) => {
    if (event.target === el) requestClose();
  });
  card.addEventListener("click", (event) => event.stopPropagation());

  const topBar = document.createElement("div");
  topBar.className = "gns-top-bar";
  card.appendChild(topBar);

  const hero = document.createElement("div");
  hero.className = "gns-hero";
  topBar.appendChild(hero);

  const eyebrow = document.createElement("div");
  eyebrow.className = "gns-eyebrow";
  eyebrow.textContent = "Ecosystem";
  hero.appendChild(eyebrow);

  const title = document.createElement("div");
  title.className = "gns-title-row";
  hero.appendChild(title);

  const speaker = document.createElement("h2");
  speaker.className = "gns-name";
  speaker.textContent = npcName;
  title.appendChild(speaker);

  const subtitle = document.createElement("div");
  subtitle.className = "gns-subtitle";
  subtitle.textContent = "Zero Authority · x402";
  title.appendChild(subtitle);

  const intro = document.createElement("p");
  intro.className = "gns-intro";
  intro.textContent =
    "Sourced briefings and live Zero Authority data from inside the world.";
  hero.appendChild(intro);

  const heroMeta = document.createElement("div");
  heroMeta.className = "gns-pills";
  hero.appendChild(heroMeta);

  const makePill = (label: string) => {
    const pill = document.createElement("div");
    pill.className = "gns-pill";
    pill.textContent = label;
    return pill;
  };

  heroMeta.appendChild(makePill("Zero Authority"));
  heroMeta.appendChild(makePill("Stacks docs"));
  heroMeta.appendChild(makePill("Classified · x402"));

  const topActions = document.createElement("div");
  topActions.className = "gns-top-actions";
  topBar.appendChild(topActions);

  const status = document.createElement("div");
  status.className = "gns-status-box";
  status.textContent = "Connecting…";
  topActions.appendChild(status);

  const topCloseBtn = document.createElement("button");
  topCloseBtn.className = "gns-close-btn";
  topCloseBtn.textContent = "Close ×";
  topCloseBtn.title = "Close guide.btc (Esc)";
  topCloseBtn.addEventListener("click", () => requestClose());
  topActions.appendChild(topCloseBtn);

  const main = document.createElement("div");
  main.className = "gns-main";
  card.appendChild(main);

  const contentColumn = document.createElement("div");
  contentColumn.className = "gns-content-col";
  main.appendChild(contentColumn);

  const summaryPanel = document.createElement("div");
  summaryPanel.className = "gns-summary-grid";
  contentColumn.appendChild(summaryPanel);

  const answerCard = document.createElement("div");
  answerCard.className = "gns-answer-card";
  contentColumn.appendChild(answerCard);

  const answerHeader = document.createElement("div");
  answerHeader.className = "gns-answer-head";
  answerCard.appendChild(answerHeader);

  const answerTitle = document.createElement("div");
  answerTitle.className = "gns-answer-title-col";
  answerHeader.appendChild(answerTitle);

  const answerEyebrow = document.createElement("div");
  answerEyebrow.className = "gns-answer-eyebrow";
  answerEyebrow.textContent = "Briefing";
  answerTitle.appendChild(answerEyebrow);

  const answerHeading = document.createElement("div");
  answerHeading.className = "gns-answer-heading";
  answerHeading.textContent = "Select a topic";
  answerTitle.appendChild(answerHeading);

  const sourceTag = document.createElement("div");
  sourceTag.className = "gns-source-tag";
  sourceTag.textContent = "verified context";
  answerHeader.appendChild(sourceTag);

  const answer = document.createElement("div");
  answer.className = "gns-answer-body";
  answer.textContent = GUIDE_BTC_BRIEFING_INTRO;
  answerCard.appendChild(answer);

  const answerFooter = document.createElement("div");
  answerFooter.className = "gns-answer-footer";
  answerFooter.textContent = "Verified context. Not financial advice.";
  answerCard.appendChild(answerFooter);

  const topicsWrap = document.createElement("div");
  topicsWrap.className = "gns-topics-grid";
  contentColumn.appendChild(topicsWrap);

  const rail = document.createElement("div");
  rail.className = "gns-rail";
  main.appendChild(rail);

  const livePanel = document.createElement("div");
  livePanel.className = "gns-panel";
  rail.appendChild(livePanel);

  const liveTitle = document.createElement("div");
  liveTitle.className = "gns-panel-title";
  liveTitle.textContent = "Network pulse";
  livePanel.appendChild(liveTitle);

  const liveBody = document.createElement("div");
  liveBody.className = "gns-live-body";
  livePanel.appendChild(liveBody);

  const premiumWrap = document.createElement("div");
  premiumWrap.className = "gns-premium-panel";
  rail.appendChild(premiumWrap);

  const premiumTitle = document.createElement("div");
  premiumTitle.className = "gns-panel-title";
  premiumTitle.textContent = "Classified";
  premiumWrap.appendChild(premiumTitle);

  const premiumBody = document.createElement("div");
  premiumBody.className = "gns-premium-body";
  premiumBody.textContent = "Checking authorization…";
  premiumWrap.appendChild(premiumBody);

  const premiumBtn = document.createElement("button");
  premiumBtn.className = "gns-premium-btn";
  premiumBtn.textContent = "Unlock Premium Content";
  premiumWrap.appendChild(premiumBtn);

  const footer = document.createElement("div");
  footer.className = "gns-footer";
  card.appendChild(footer);

  const note = document.createElement("div");
  note.className = "gns-footer-note";
  note.textContent = "Esc to close";
  footer.appendChild(note);

  const closeBtn = document.createElement("button");
  closeBtn.className = "gns-footer-close";
  closeBtn.textContent = "Close guide";
  closeBtn.addEventListener("click", () => requestClose());
  footer.appendChild(closeBtn);

  let pending = false;
  let selectedTopic: GuideTopic | null = null;
  let liveContext: string | null = null;
  let snapshotCache: SnapshotPayload | null = null;
  let premiumOffer: any = null;
  let agentState: any = null;
  const topicResponseCache = new Map<string, string>();
  const buttons: HTMLButtonElement[] = [];
  let activeBtn: HTMLButtonElement | null = null;

  const setPending = (next: boolean) => {
    pending = next;
    for (const btn of buttons) btn.disabled = next;
    premiumBtn.disabled = next;
  };

  const buildStatCard = (label: string, value: string) => {
    const cardEl = document.createElement("div");
    cardEl.className = "gns-stat-card";

    const valueEl = document.createElement("div");
    valueEl.className = "gns-stat-value";
    valueEl.textContent = value;
    cardEl.appendChild(valueEl);

    const labelEl = document.createElement("div");
    labelEl.className = "gns-stat-label";
    labelEl.textContent = label;
    cardEl.appendChild(labelEl);
    return cardEl;
  };

  const renderSummaryPanel = (snapshot: SnapshotPayload | null) => {
    summaryPanel.replaceChildren();
    const users = snapshot?.users ?? [];
    const bounties = snapshot?.bounties ?? [];
    const grants = snapshot?.grants ?? [];
    const quests = snapshot?.quests ?? [];

    summaryPanel.appendChild(buildStatCard("Builders surfaced", String(users.length)));
    summaryPanel.appendChild(buildStatCard("Bounties cached", String(bounties.length)));
    summaryPanel.appendChild(buildStatCard("Grants cached", String(grants.length)));
    summaryPanel.appendChild(buildStatCard("Quests cached", String(quests.length)));
  };

  const renderListCard = (titleText: string, items: string[]) => {
    const wrap = document.createElement("div");
    wrap.className = "gns-list-card";

    const heading = document.createElement("div");
    heading.className = "gns-list-heading";
    heading.textContent = titleText;
    wrap.appendChild(heading);

    if (items.length === 0) {
      const empty = document.createElement("div");
      empty.className = "gns-list-empty";
      empty.textContent = "No cached entries yet.";
      wrap.appendChild(empty);
      return wrap;
    }

    for (const item of items) {
      const row = document.createElement("div");
      row.className = "gns-list-row";
      row.textContent = item;
      wrap.appendChild(row);
    }

    return wrap;
  };

  const renderLivePanel = (snapshot: SnapshotPayload | null) => {
    liveBody.replaceChildren();
    if (!snapshot) {
      liveBody.appendChild(renderListCard("Snapshot", ["Loading live cache…"]));
      return;
    }

    const truncAddr = (a: string) => a.length > 12 ? `${a.slice(0, 6)}…${a.slice(-4)}` : a;
    const users = (snapshot.users ?? []).slice(0, 3).map((u: any) =>
      `${u.username}${u.stxAddress ? ` · ${truncAddr(u.stxAddress)}` : ""}`,
    );
    const bounties = (snapshot.bounties ?? []).slice(0, 3).map((item: any) => {
      const reward = item.rewardUnit && item.rewardAmount != null
        ? ` · ${item.rewardAmount} ${item.rewardUnit}`
        : "";
      return `${item.title}${reward}`;
    });
    const grants = (snapshot.grants ?? []).slice(0, 2).map((item: any) => item.title);
    const sync = Array.isArray(snapshot.syncLog) ? snapshot.syncLog[0] : null;

    liveBody.appendChild(renderListCard("Builders", users));
    liveBody.appendChild(renderListCard("Bounties", bounties));
    liveBody.appendChild(renderListCard("Grants", grants));

    if (sync?.finishedAt) {
      const stamp = document.createElement("div");
      stamp.className = "gns-sync-stamp";
      stamp.textContent = `Last Zero Authority sync: ${new Date(sync.finishedAt).toLocaleString()}`;
      liveBody.appendChild(stamp);
    }
  };

  const buildLiveContext = (snapshot: SnapshotPayload) => {
    const users = Array.isArray(snapshot?.users) ? snapshot.users.slice(0, 5) : [];
    const bounties = Array.isArray(snapshot?.bounties) ? snapshot.bounties.slice(0, 4) : [];
    const grants = Array.isArray(snapshot?.grants) ? snapshot.grants.slice(0, 4) : [];
    const quests = Array.isArray(snapshot?.quests) ? snapshot.quests.slice(0, 4) : [];
    const syncLog = Array.isArray(snapshot?.syncLog) ? snapshot.syncLog[0] : null;

    const fmtOpportunity = (item: any) =>
      [
        item?.title,
        item?.organizationName ? `org=${item.organizationName}` : null,
        item?.rewardUnit ? `reward=${item.rewardAmount ?? "?"} ${item.rewardUnit}` : null,
        item?.status ? `status=${item.status}` : null,
      ]
        .filter(Boolean)
        .join(" | ");

    return [
      "Live cached Zero Authority snapshot:",
      syncLog?.finishedAt ? `lastSync=${new Date(syncLog.finishedAt).toISOString()}` : "lastSync=unknown",
      users.length > 0
        ? `users=${users.map((u: any) => `${u.username}${u.stxAddress ? ` (${u.stxAddress})` : ""}`).join("; ")}`
        : "users=none",
      bounties.length > 0 ? `bounties=${bounties.map((item: any) => fmtOpportunity(item)).join(" || ")}` : "bounties=none",
      grants.length > 0 ? `grants=${grants.map((item: any) => fmtOpportunity(item)).join(" || ")}` : "grants=none",
      quests.length > 0 ? `quests=${quests.map((item: any) => fmtOpportunity(item)).join(" || ")}` : "quests=none",
    ].join("\n");
  };

  const ensureLiveContext = async () => {
    if (liveContext && snapshotCache) return liveContext;

    const convex = getConvexClient();
    const snapshot = await convex.query((api as any)["integrations/zeroAuthority"].guideSnapshot, {});
    snapshotCache = snapshot;
    liveContext = buildLiveContext(snapshot);
    renderSummaryPanel(snapshot);
    renderLivePanel(snapshot);
    status.textContent = "Zero Authority cache loaded.";
    return liveContext;
  };

  const ensureOfferContext = async () => {
    if (premiumOffer && agentState) return { premiumOffer, agentState };

    const convex = getConvexClient();
    const [offer, state] = await Promise.all([
      convex.query((api as any)["integrations/x402"].getOffer, { offerKey: premiumOfferKey }),
      convex.query((api as any)["agents/stateMachine"].get, { agentId: "guide-btc" }),
    ]);

    premiumOffer = offer;
    agentState = state;

    if (offer) {
      premiumBody.textContent =
        `${offer.description} Target demo price: ${offer.priceAmount} ${offer.priceAsset} on ${offer.network ?? "unknown"}. ` +
        "Payment execution is not live in this build yet.";
    } else {
      premiumBody.textContent = "No premium offer is configured yet.";
      premiumBtn.disabled = true;
    }

    return { premiumOffer, agentState };
  };

  const setSelectedTopic = (topic: GuideTopic) => {
    selectedTopic = topic;
    answerHeading.textContent = topic.label;
    answerEyebrow.textContent = topic.eyebrow;
    sourceTag.textContent = topic.sourceLabel;
  };

  const askTopic = async (topic: GuideTopic) => {
    if (pending) return;
    setSelectedTopic(topic);

    // Serve from cache if available
    const cached = topicResponseCache.get(topic.id);
    if (cached) {
      answer.textContent = cached;
      sourceTag.textContent = topic.sourceLabel;
      status.textContent = liveContext ? "Live context." : "Authored notes.";
      return;
    }

    setPending(true);
    status.textContent = `Loading ${topic.label.toLowerCase()}…`;
    answer.textContent = "Retrieving briefing…";
    answer.classList.add("is-loading");

    try {
      const convex = getConvexClient();
      let systemPrompt = `${GUIDE_BTC_VERIFIED_CONTEXT}\n\n${topic.authoredContext}`;

      try {
        const snapshotContext = await ensureLiveContext();
        systemPrompt = `${GUIDE_BTC_VERIFIED_CONTEXT}\n\n${topic.authoredContext}\n\n${snapshotContext}`;
        status.textContent = "Zero Authority context loaded.";
      } catch (snapshotError) {
        console.warn("guide.btc snapshot unavailable", snapshotError);
        status.textContent = "Live cache offline. Using authored notes.";
      }

      const text = await convex.action((api as any)["story/storyAi"].generateDialogue, {
        systemPrompt,
        userMessage: topic.userPrompt,
        conversationHistory: [],
      });

      answer.classList.remove("is-loading");
      const result =
        typeof text === "string" && text.trim().length > 0
          ? text.trim()
          : "No verified response for that topic yet.";
      answer.textContent = result;
      topicResponseCache.set(topic.id, result);
      status.textContent = liveContext ? "Live context." : "Authored notes.";
    } catch (error: any) {
      answer.classList.remove("is-loading");
      answer.textContent = "The AI briefing failed. The backend path may be offline.";
      status.textContent = error?.message ?? "AI request failed";
    } finally {
      setPending(false);
    }
  };

  for (const topic of GUIDE_BTC_TOPICS) {
    const btn = document.createElement("button");
    btn.className = "gns-topic-btn";

    const btnEyebrow = document.createElement("div");
    btnEyebrow.className = "gns-topic-eyebrow";
    btnEyebrow.textContent = topic.eyebrow;
    btn.appendChild(btnEyebrow);

    const btnLabel = document.createElement("div");
    btnLabel.className = "gns-topic-label";
    btnLabel.textContent = topic.label;
    btn.appendChild(btnLabel);

    const btnDescription = document.createElement("div");
    btnDescription.className = "gns-topic-desc";
    btnDescription.textContent = topic.description;
    btn.appendChild(btnDescription);

    btn.addEventListener("click", () => {
      if (activeBtn) activeBtn.classList.remove("active");
      btn.classList.add("active");
      activeBtn = btn;
      void askTopic(topic);
    });
    buttons.push(btn);
    topicsWrap.appendChild(btn);
  }

  premiumBtn.addEventListener("click", () => {
    void (async () => {
      if (pending) return;
      setPending(true);
      status.textContent = "Checking x402 offer…";
      answerEyebrow.textContent = "Classified";
      answerHeading.textContent = "Classified";
      sourceTag.textContent = "x402 contract";

      try {
        const convex = getConvexClient();
        const { premiumOffer: offer, agentState: state } = await ensureOfferContext();
        if (!offer) {
          answer.textContent = "No premium offer is configured yet.";
          status.textContent = "No offer configured.";
          return;
        }

        if (state) {
          await convex.mutation((api as any)["agents/stateMachine"].transition, {
            agentId: "guide-btc",
            nextState: "offering-premium",
            currentIntent: "offer-premium-content",
          });
        }

        answer.textContent =
          `${offer.title}\n\n${offer.description}\n\n` +
          `Target demo price: ${offer.priceAmount} ${offer.priceAsset}\n` +
          `Provider: ${offer.provider}\n` +
          `Network: ${offer.network ?? "unknown"}\n` +
          `Endpoint: ${offer.endpointPath ?? "not-set"}\n\n` +
          "This is a backend-configured premium offer. Payment execution is not live in this build yet.";
        status.textContent = "x402 offer loaded.";
      } catch (error: any) {
        answer.textContent = "Failed to load premium content metadata.";
        status.textContent = error?.message ?? "Premium content request failed";
      } finally {
        setPending(false);
      }
    })();
  });

  renderSummaryPanel(null);
  renderLivePanel(null);

  void ensureLiveContext().catch((error) => {
    console.warn("guide.btc snapshot unavailable", error);
    status.textContent = "Offline. Authored notes available.";
  });

  void ensureOfferContext().catch((error) => {
    console.warn("guide.btc premium offer unavailable", error);
  });

  return {
    el,
    destroy() {
      window.removeEventListener("keydown", handleKeydown);
      el.remove();
    },
  };
}
