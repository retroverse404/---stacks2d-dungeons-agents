/**
 * World feed panel – collapsible event log backed by Convex world events.
 */
import { getConvexClient } from "../lib/convexClient.ts";
import { api } from "../../convex/_generated/api";
import type { ProfileData } from "../engine/types.ts";
import { IconChat } from "../lib/icons.ts";
import "./ChatPanel.css";

interface WorldEvent {
  _id: string;
  eventType: string;
  actorId?: string;
  targetId?: string;
  objectKey?: string;
  zoneKey?: string;
  summary: string;
  detailsJson?: string;
  timestamp: number;
}

export class ChatPanel {
  readonly el: HTMLElement;
  private isOpen = false;
  private toggleBtn: HTMLButtonElement;
  private panel: HTMLElement;
  private messagesEl: HTMLElement;
  private emptyEl: HTMLElement;

  private profile: ProfileData | null = null;
  private mapName: string | null = null;
  private unsub: (() => void) | null = null;
  private events: WorldEvent[] = [];
  private unreadCount = 0;
  private badgeEl: HTMLElement;
  private joinedAt = Date.now();
  private didHydrate = false;
  private seenEventIds = new Set<string>();

  constructor() {
    this.el = document.createElement("div");

    this.toggleBtn = document.createElement("button");
    this.toggleBtn.className = "chat-toggle";
    this.toggleBtn.title = "Open World Feed";
    this.toggleBtn.setAttribute("aria-label", "Open world feed");
    this.toggleBtn.innerHTML = IconChat;

    this.badgeEl = document.createElement("span");
    this.badgeEl.className = "chat-badge";
    this.badgeEl.style.display = "none";
    this.toggleBtn.appendChild(this.badgeEl);

    this.toggleBtn.addEventListener("click", () => this.open());
    this.el.appendChild(this.toggleBtn);

    this.panel = document.createElement("div");
    this.panel.className = "chat-panel";
    this.panel.style.display = "none";

    const header = document.createElement("div");
    header.className = "chat-header";

    const headerCopy = document.createElement("div");
    headerCopy.className = "chat-header-copy";

    const headerLabel = document.createElement("span");
    headerLabel.className = "chat-header-title";
    headerLabel.textContent = "World Feed";

    const headerSub = document.createElement("span");
    headerSub.className = "chat-header-subtitle";
    headerSub.textContent = "Recent world events and agent activity";

    headerCopy.append(headerLabel, headerSub);

    const closeBtn = document.createElement("button");
    closeBtn.className = "chat-close";
    closeBtn.textContent = "\u00D7";
    closeBtn.addEventListener("click", () => this.close());
    header.append(headerCopy, closeBtn);
    this.panel.appendChild(header);

    this.messagesEl = document.createElement("div");
    this.messagesEl.className = "chat-messages";
    this.emptyEl = document.createElement("p");
    this.emptyEl.className = "chat-empty";
    this.emptyEl.textContent = "No world events yet.";
    this.messagesEl.appendChild(this.emptyEl);
    this.panel.appendChild(this.messagesEl);

    this.el.appendChild(this.panel);
  }

  setContext(profile: ProfileData, mapName: string) {
    const isSameProfile = this.profile?._id === profile._id;
    const isSameMap = this.mapName === mapName;
    this.profile = profile;
    this.mapName = mapName;

    if (isSameProfile && isSameMap && this.unsub) return;

    this.joinedAt = Date.now();
    this.didHydrate = false;
    this.seenEventIds.clear();
    this.unreadCount = 0;
    this.updateBadge();
    this.subscribe();
  }

  private subscribe() {
    this.unsub?.();
    const convex = getConvexClient();
    this.unsub = convex.onUpdate(
      api.worldState.listEvents,
      { mapName: this.mapName ?? undefined, limit: 40 },
      (rows) => {
        const next = [...(rows as unknown as WorldEvent[])].reverse();

        if (!this.didHydrate) {
          this.events = next;
          this.renderEvents();
          for (const event of next) this.seenEventIds.add(String(event._id));
          this.didHydrate = true;
          return;
        }

        let newUnread = 0;
        for (const event of next) {
          const id = String(event._id);
          const isNewForClient = !this.seenEventIds.has(id);
          if (isNewForClient && event.timestamp > this.joinedAt && !this.isOpen) {
            newUnread += 1;
          }
        }

        this.events = next;
        this.renderEvents();
        for (const event of next) this.seenEventIds.add(String(event._id));

        if (newUnread > 0) {
          this.unreadCount += newUnread;
          this.updateBadge();
        }
      },
    );
  }

  private renderEvents() {
    this.messagesEl.innerHTML = "";

    if (this.events.length === 0) {
      this.messagesEl.appendChild(this.emptyEl);
      return;
    }

    let lastDateKey: string | null = null;
    for (const event of this.events) {
      const currentDateKey = this.dateKey(event.timestamp);
      if (currentDateKey !== lastDateKey) {
        const divider = document.createElement("div");
        divider.className = "chat-date-divider";
        divider.textContent = this.formatDateDivider(event.timestamp);
        this.messagesEl.appendChild(divider);
        lastDateKey = currentDateKey;
      }

      const row = document.createElement("div");
      row.className = "chat-msg chat-msg--event";

      const meta = document.createElement("div");
      meta.className = "chat-msg-meta";

      const typeEl = document.createElement("span");
      typeEl.className = "chat-msg-type";
      typeEl.textContent = this.formatEventType(event.eventType);

      const scopeEl = document.createElement("span");
      scopeEl.className = "chat-msg-scope";
      scopeEl.textContent = this.formatScope(event);

      const timeEl = document.createElement("span");
      timeEl.className = "chat-msg-time";
      timeEl.textContent = this.formatTime(event.timestamp);

      meta.append(typeEl, scopeEl, timeEl);

      const textEl = document.createElement("div");
      textEl.className = "chat-msg-text";
      textEl.textContent = event.summary;

      row.append(meta, textEl);
      this.messagesEl.appendChild(row);
    }

    this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
  }

  private formatEventType(eventType: string): string {
    return eventType
      .split(/[-_]/g)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
  }

  private formatScope(event: WorldEvent): string {
    const parts: string[] = [];
    if (event.zoneKey) parts.push(event.zoneKey);
    if (event.objectKey) parts.push(event.objectKey);
    return parts.join(" · ") || (this.mapName ?? "world");
  }

  private formatTime(ts: number): string {
    const d = new Date(ts);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  private dateKey(ts: number): string {
    const d = new Date(ts);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  }

  private formatDateDivider(ts: number): string {
    const d = new Date(ts);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const msgDay = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
    const diffDays = Math.floor((today - msgDay) / 86_400_000);
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return d.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  }

  private open() {
    this.isOpen = true;
    this.toggleBtn.style.display = "none";
    this.panel.style.display = "";
    this.unreadCount = 0;
    this.updateBadge();
    requestAnimationFrame(() => {
      this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    });
  }

  private close() {
    this.isOpen = false;
    this.toggleBtn.style.display = "";
    this.panel.style.display = "none";
  }

  private updateBadge() {
    if (this.unreadCount > 0) {
      this.badgeEl.textContent = String(this.unreadCount);
      this.badgeEl.style.display = "";
    } else {
      this.badgeEl.style.display = "none";
    }
  }

  toggle(visible: boolean) {
    this.el.style.display = visible ? "" : "none";
  }

  show() { this.el.style.display = ""; }
  hide() { this.el.style.display = "none"; }

  destroy() {
    this.unsub?.();
    this.el.remove();
  }
}
