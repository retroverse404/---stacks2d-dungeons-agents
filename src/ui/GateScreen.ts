import {
  getGateSessionDurationMs,
  getInviteCodeFromUrl,
  markGateUnlocked,
  stripInviteCodeFromUrl,
  validateInviteCode,
} from "../lib/gateAccess.ts";
import "./GateScreen.css";

const DEFAULT_PLACEHOLDER_COPY =
  "A hosted dungeon lobby for evaluating agentic world simulation, Stacks auth, wallet-connected premium actions, and x402 transaction flows.";

function getGateImageUrl() {
  const url = import.meta.env.VITE_GATE_IMAGE_URL as string | undefined;
  return url?.trim() || "";
}

export class GateScreen {
  readonly el: HTMLElement;
  private statusEl: HTMLElement;
  private inputEl: HTMLInputElement;
  private buttonEl: HTMLButtonElement;
  private onUnlocked: () => void;

  constructor(onUnlocked: () => void) {
    this.onUnlocked = onUnlocked;

    this.el = document.createElement("div");
    this.el.className = "gate-screen";

    const shell = document.createElement("div");
    shell.className = "gate-shell";
    this.el.appendChild(shell);

    const imagePanel = document.createElement("div");
    imagePanel.className = "gate-image-panel";
    shell.appendChild(imagePanel);

    const imageCard = document.createElement("div");
    imageCard.className = "gate-image-card";
    imagePanel.appendChild(imageCard);

    const imageUrl = getGateImageUrl();
    if (imageUrl) {
      const image = document.createElement("img");
      image.src = imageUrl;
      image.alt = "Stackshub gate artwork";
      imageCard.appendChild(image);
    } else {
      const placeholder = document.createElement("div");
      placeholder.className = "gate-image-placeholder";
      placeholder.innerHTML = `
        <div class="gate-image-placeholder-copy">
          <h2>Stackshub</h2>
          <p>${DEFAULT_PLACEHOLDER_COPY}</p>
        </div>
      `;
      imageCard.appendChild(placeholder);
    }

    const loginPanel = document.createElement("div");
    loginPanel.className = "gate-login-panel";
    shell.appendChild(loginPanel);

    const loginContent = document.createElement("div");
    loginContent.className = "gate-login-content";
    loginPanel.appendChild(loginContent);

    const title = document.createElement("h1");
    title.textContent = "Enter";
    loginContent.appendChild(title);

    const subtitle = document.createElement("p");
    subtitle.className = "gate-subtitle";
    subtitle.textContent = `Invite-only hosted access. A live session stays open for ${Math.round(getGateSessionDurationMs() / 60000)} minutes.`;
    loginContent.appendChild(subtitle);

    const form = document.createElement("div");
    form.className = "gate-form";
    loginContent.appendChild(form);

    this.inputEl = document.createElement("input");
    this.inputEl.className = "gate-input";
    this.inputEl.type = "password";
    this.inputEl.placeholder = "Enter invite code";
    this.inputEl.autocomplete = "off";
    form.appendChild(this.inputEl);

    this.buttonEl = document.createElement("button");
    this.buttonEl.className = "gate-button";
    this.buttonEl.textContent = "Enter with Invite Code";
    this.buttonEl.addEventListener("click", () => this.tryUnlock());
    form.appendChild(this.buttonEl);

    this.statusEl = document.createElement("div");
    this.statusEl.className = "gate-status";
    form.appendChild(this.statusEl);

    const helper = document.createElement("p");
    helper.className = "gate-helper";
    helper.textContent = "Request an invite code if you need access to the hosted evaluation build.";
    loginContent.appendChild(helper);

    this.inputEl.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        event.preventDefault();
        this.tryUnlock();
      }
    });

    const inviteFromUrl = getInviteCodeFromUrl();
    if (inviteFromUrl) {
      this.inputEl.value = inviteFromUrl;
      queueMicrotask(() => this.tryUnlock(true));
    }
  }

  destroy() {
    this.el.remove();
  }

  private tryUnlock(fromQuery = false) {
    const candidate = this.inputEl.value;
    if (!validateInviteCode(candidate)) {
      this.showStatus("Invite code not recognized.", true);
      if (!fromQuery) this.inputEl.select();
      return;
    }

    this.buttonEl.disabled = true;
    markGateUnlocked();
    stripInviteCodeFromUrl();
    this.showStatus("Access granted. Opening Stackshub...", false, true);
    window.setTimeout(() => this.onUnlocked(), 180);
  }

  private showStatus(message: string, isError = false, isSuccess = false) {
    this.statusEl.textContent = message;
    this.statusEl.className = `gate-status${isError ? " error" : ""}${isSuccess ? " success" : ""}`;
  }
}
