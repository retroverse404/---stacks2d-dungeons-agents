import type { SplashScreen, SplashScreenCallbacks } from "../SplashTypes.ts";
import "./RetroCaptchaSplash.css";

export type RetroCaptchaAnswer = "table" | "not-table" | "dismissed";

type VisualStyleDirection = {
  key: "office-beige" | "shareware-blue" | "bbs-amber";
  label: string;
};

type TableIconIdea = {
  key: "table-persian" | "table-checker" | "table-clipart";
  label: string;
};

export type RetroCaptchaVariant = {
  titleBar: string;
  copy: string;
  ctaLabel: string;
  disclaimer: string;
  visualStyle: VisualStyleDirection;
  tableIconIdea: TableIconIdea;
};

const TITLE_BAR_VARIATIONS = [
  "QTC Table Verifier 95",
  "Shareware Furniture Inspector",
  "Quantum Time Crystal Safety Check",
  "TableScan Deluxe Registration",
  "Cozy Cabin Human Test Utility",
];

const COPY_VARIATIONS = [
  "You have stepped on a suspicious table-adjacent square. Please prove this is still a table.",
  "This floor tile has been flagged by the Quantum Time Crystal Furniture Bureau. Confirm the object class.",
  "Shareware anti-bot protection requires one furniture judgment before continuing your adventure.",
  "Warning: scammy crystal advertisers need to know whether you can recognize a table under pressure.",
  "One more bootstep may auto-enroll you in table futures. Verify the object and proceed responsibly.",
];

const CTA_LABEL_VARIATIONS = [
  "Verify Furniture",
  "Claim Crystal Bonus",
  "Accept Table Judgment",
  "Confirm Organic Eyeballs",
  "Proceed To Shareware",
];

const DISCLAIMER_VARIATIONS = [
  "No tables were securitized during this verification.",
  "By continuing you waive all rights to complain about fake crystal banners.",
  "Offer void in taverns, dens, and unexplained side rooms.",
  "Tiny print reviewed by a committee of extremely nervous modems.",
  "This verification utility was approved by absolutely nobody.",
];

const VISUAL_STYLE_DIRECTIONS: VisualStyleDirection[] = [
  { key: "office-beige", label: "Office beige utility window" },
  { key: "shareware-blue", label: "Shareware catalog nag screen" },
  { key: "bbs-amber", label: "Late-night BBS warning panel" },
];

const TABLE_ICON_IDEAS: TableIconIdea[] = [
  { key: "table-persian", label: "Persian cloth sample" },
  { key: "table-checker", label: "Checkered diner top" },
  { key: "table-clipart", label: "Clip-art banquet table" },
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
    tableIconIdea: pick(TABLE_ICON_IDEAS),
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
  if (variant.visualStyle.key !== "office-beige") {
    win.classList.add(`retro-captcha__window--${variant.visualStyle.key}`);
  }
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
  status.textContent = `Triggered by stepping on the table square in ${zoneLabel}.`;

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
        answer === "table"
          ? "Good instinct. The floor agrees this is very table-adjacent."
          : "Bold claim. The room strongly suspects table activity.";
    });
    return button;
  };

  options.append(
    makeOption(
      "table",
      "a) Table",
      variant.tableIconIdea.label,
      `retro-captcha__icon--${variant.tableIconIdea.key}`,
    ),
    makeOption(
      "not-table",
      "b) Not a table",
      "Beige modem decoy",
      "retro-captcha__icon--not-table",
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
      selected === "table"
        ? "Verification complete. Organic table recognition detected."
        : "Incorrect. The popup would like to remind you that this is absolutely a table.";
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
