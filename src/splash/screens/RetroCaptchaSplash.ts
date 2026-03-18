import type { SplashScreen, SplashScreenCallbacks } from "../SplashTypes.ts";
import "./RetroCaptchaSplash.css";

export type RetroCaptchaAnswer = "rug" | "not-rug" | "dismissed";

type VisualStyleDirection = {
  key: "hypercard-flat" | "stack-card" | "mono-shareware";
  label: string;
};

type RugIconIdea = {
  key: "rug-persian" | "rug-runner" | "rug-braided";
  label: string;
};

export type RetroCaptchaVariant = {
  titleBar: string;
  copy: string;
  ctaLabel: string;
  disclaimer: string;
  visualStyle: VisualStyleDirection;
  rugIconIdea: RugIconIdea;
};

const TITLE_BAR_VARIATIONS = [
  "QTC Rug Verifier 95",
  "RUGPULL PROTOCOL",
  "Quantum Time Crystal Floor Check",
  "RugScan Deluxe Registration",
  "Cozy Cabin Human Test Utility",
];

const COPY_VARIATIONS = [
  "You stepped on a suspicious rug square. Confirm the rug pull status before the Quantum Time Crystal banner advances.",
  "This carpet tile was flagged by the Quantum Time Crystal Rug Bureau. Please verify the rug pull immediately.",
  "Shareware anti-bot protection requires one rug pull judgment before continuing through Cozy Cabin.",
  "Warning: scammy crystal advertisers demand proof that you can identify a rug pull under pressure.",
  "One more footstep may enroll you in Quantum Time Crystal rug futures. Confirm the rug pull and proceed.",
];

const CTA_LABEL_VARIATIONS = [
  "Verify Furniture",
  "Confirm Rug Status",
  "Approve Human",
  "Collect QTC",
  "Continue",
];

const DISCLAIMER_VARIATIONS = [
  "No rugs were securitized during this monochrome check.",
  "By continuing you accept all fake Quantum Time Crystal warnings.",
  "Offer void in pits, parlors, and suspicious side rooms.",
  "Tiny print reviewed by a committee of nervous disk drives.",
  "This verifier was approved by absolutely no one.",
];

const VISUAL_STYLE_DIRECTIONS: VisualStyleDirection[] = [
  { key: "hypercard-flat", label: "Flat HyperCard stack window" },
  { key: "stack-card", label: "Monochrome stack card alert" },
  { key: "mono-shareware", label: "Shareware B/W nag panel" },
];

const RUG_ICON_IDEAS: RugIconIdea[] = [
  { key: "rug-persian", label: "Persian hall runner" },
  { key: "rug-runner", label: "Motel diamond carpet" },
  { key: "rug-braided", label: "Braided lodge rug" },
];

function pick<T>(items: readonly T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export function pickRetroCaptchaVariant(): RetroCaptchaVariant {
  return {
    titleBar: pick(TITLE_BAR_VARIATIONS),
    copy: pick(COPY_VARIATIONS),
    ctaLabel: pick(CTA_LABEL_VARIATIONS),
    disclaimer: pick(DISCLAIMER_VARIATIONS),
    visualStyle: pick(VISUAL_STYLE_DIRECTIONS),
    rugIconIdea: pick(RUG_ICON_IDEAS),
  };
}

export type RetroCaptchaSplashProps = SplashScreenCallbacks & {
  variant: RetroCaptchaVariant;
  zoneLabel: string;
  onResolve?: (answer: RetroCaptchaAnswer) => void;
};

export function createRetroCaptchaSplash(props: RetroCaptchaSplashProps): SplashScreen {
  const { onClose, onResolve, variant, zoneLabel } = props;
  let selected: RetroCaptchaAnswer | null = null;
  let typingTimer: ReturnType<typeof setInterval> | null = null;
  let resolveTimer: ReturnType<typeof setTimeout> | null = null;

  const el = document.createElement("div");
  el.className = "retro-captcha";

  const win = document.createElement("div");
  win.className = "retro-captcha__window";
  win.classList.add(`retro-captcha__window--${variant.visualStyle.key}`);
  el.appendChild(win);

  const titlebar = document.createElement("div");
  titlebar.className = "retro-captcha__titlebar";
  const title = document.createElement("div");
  title.textContent = variant.titleBar;
  const lights = document.createElement("div");
  lights.className = "retro-captcha__lights";
  for (let i = 0; i < 3; i += 1) {
    const light = document.createElement("div");
    light.className = "retro-captcha__light";
    lights.appendChild(light);
  }
  titlebar.append(title, lights);
  win.appendChild(titlebar);

  const body = document.createElement("div");
  body.className = "retro-captcha__body";
  win.appendChild(body);

  const banner = document.createElement("div");
  banner.className = "retro-captcha__banner";
  banner.textContent = "Quantum Time Crystal promotional security check";
  body.appendChild(banner);

  const copy = document.createElement("div");
  copy.className = "retro-captcha__copy";
  body.appendChild(copy);

  const copyText = document.createElement("span");
  copy.appendChild(copyText);

  const caret = document.createElement("span");
  caret.className = "retro-captcha__caret";
  caret.textContent = "_";
  copy.appendChild(caret);

  const options = document.createElement("div");
  options.className = "retro-captcha__options";
  body.appendChild(options);

  const status = document.createElement("div");
  status.className = "retro-captcha__status";
  status.textContent = `Triggered by stepping on the rug in ${zoneLabel}.`;

  const actions = document.createElement("div");
  actions.className = "retro-captcha__actions";

  const dismissButton = document.createElement("button");
  dismissButton.className = "retro-captcha__button retro-captcha__button--secondary";
  dismissButton.type = "button";
  dismissButton.textContent = "Ignore Warning";

  const submitButton = document.createElement("button");
  submitButton.className = "retro-captcha__button retro-captcha__button--primary";
  submitButton.type = "button";
  submitButton.textContent = variant.ctaLabel;
  submitButton.disabled = true;

  actions.append(dismissButton, submitButton);

  const legal = document.createElement("div");
  legal.className = "retro-captcha__legal";
  legal.textContent = variant.disclaimer;

  const styleNote = document.createElement("div");
  styleNote.className = "retro-captcha__style-note";
  styleNote.textContent = `Style: ${variant.visualStyle.label}.`;
  legal.appendChild(styleNote);

  body.append(status, actions, legal);

  const makeOption = (
    answer: Exclude<RetroCaptchaAnswer, "dismissed">,
    titleText: string,
    noteText: string,
    iconClass: string,
  ) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "retro-captcha__option";

    const icon = document.createElement("div");
    icon.className = `retro-captcha__icon ${iconClass}`;

    const optionTitle = document.createElement("div");
    optionTitle.className = "retro-captcha__option-title";
    optionTitle.textContent = titleText;

    const optionNote = document.createElement("div");
    optionNote.className = "retro-captcha__option-note";
    optionNote.textContent = noteText;

    button.append(icon, optionTitle, optionNote);
    button.addEventListener("click", () => {
      selected = answer;
      submitButton.disabled = false;
      for (const child of options.children) {
        child.classList.remove("is-selected");
      }
      button.classList.add("is-selected");
      status.textContent =
        answer === "rug"
          ? "Good instinct. The floor agrees this is very rug-adjacent."
          : "Bold claim. The room strongly suspects carpet activity.";
    });
    return button;
  };

  options.append(
    makeOption(
      "rug",
      "a) Rug pull",
      variant.rugIconIdea.label,
      `retro-captcha__icon--${variant.rugIconIdea.key}`,
    ),
    makeOption(
      "not-rug",
      "b) Not rug pull",
      "Monochrome decoy object",
      "retro-captcha__icon--not-rug",
    ),
  );

  const closeWithAnswer = (answer: RetroCaptchaAnswer) => {
    onResolve?.(answer);
    onClose();
  };

  dismissButton.addEventListener("click", () => closeWithAnswer("dismissed"));
  submitButton.addEventListener("click", () => {
    if (!selected) return;
    submitButton.disabled = true;
    dismissButton.disabled = true;
    status.textContent =
      selected === "rug"
        ? "Verification complete. Rug pull averted. Quantum Time Crystals remain stable."
        : "Incorrect. The popup insists this square remains rug pull-adjacent.";
    resolveTimer = setTimeout(() => closeWithAnswer(selected ?? "dismissed"), 520);
  });

  let i = 0;
  typingTimer = setInterval(() => {
    i += 1;
    copyText.textContent = variant.copy.slice(0, i);
    if (i >= variant.copy.length && typingTimer) {
      clearInterval(typingTimer);
      typingTimer = null;
      caret.style.display = "none";
    }
  }, 15);

  return {
    el,
    destroy() {
      if (typingTimer) clearInterval(typingTimer);
      if (resolveTimer) clearTimeout(resolveTimer);
      el.remove();
    },
  };
}
