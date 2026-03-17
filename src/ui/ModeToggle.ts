/**
 * Mode toggle buttons – play / build / sprite-edit + sound toggle + sign-out.
 */
import type { AppMode } from "../engine/types.ts";
import { IconPlay, IconBuild, IconSprites, IconNpcs, IconItems, IconMaps, IconSoundOn, IconSoundOff, IconSignOut } from "../lib/icons.ts";
import "./ModeToggle.css";

const modes: { key: AppMode; label: string; icon: string }[] = [
  { key: "play",        label: "Play",    icon: IconPlay },
  { key: "build",       label: "Build",   icon: IconBuild },
  { key: "sprite-edit", label: "Sprites", icon: IconSprites },
  { key: "npc-edit",    label: "NPCs",    icon: IconNpcs },
  { key: "item-edit",   label: "Items",   icon: IconItems },
];

export interface ModeToggleOptions {
  initialMode: AppMode;
  isAdmin: boolean;
  onChange: (mode: AppMode) => void;
  onToggleSound?: () => boolean; // returns new muted state
  onOpenMaps?: () => void;       // open map browser
}

export class ModeToggle {
  readonly el: HTMLElement;
  private buttons: HTMLButtonElement[] = [];
  private mode: AppMode;
  private onChange: (mode: AppMode) => void;
  private soundBtn: HTMLButtonElement | null = null;

  constructor(opts: ModeToggleOptions) {
    this.mode = opts.initialMode;
    this.onChange = opts.onChange;

    this.el = document.createElement("div");
    this.el.className = "mode-toggle";

    const btnGroup = document.createElement("div");
    btnGroup.className = "mode-toggle-buttons";

    for (const m of modes) {
      // Hide build/sprite-edit/npc-edit for non-admins
      if (!opts.isAdmin && (m.key === "build" || m.key === "sprite-edit" || m.key === "npc-edit" || m.key === "item-edit")) continue;

      const btn = document.createElement("button");
      btn.className = `mode-toggle-btn ${this.mode === m.key ? "active" : ""}`;
      btn.dataset.mode = m.key;
      btn.title = m.label;
      btn.innerHTML = `<span class="mode-icon">${m.icon}</span><span class="mode-label">${m.label}</span>`;
      btn.addEventListener("click", () => this.select(m.key));
      btnGroup.appendChild(btn);
      this.buttons.push(btn);
    }

    // Maps button (available to all players)
    if (opts.onOpenMaps) {
      const onMaps = opts.onOpenMaps;
      const mapsBtn = document.createElement("button");
      mapsBtn.className = "mode-toggle-btn maps-btn portal-btn";
      mapsBtn.title = "Maps";
      mapsBtn.innerHTML = IconMaps;
      mapsBtn.addEventListener("click", () => onMaps());
      btnGroup.appendChild(mapsBtn);
    }

    // Sound toggle
    if (opts.onToggleSound) {
      const onToggle = opts.onToggleSound;
      this.soundBtn = document.createElement("button");
      this.soundBtn.className = "mode-toggle-btn sound-btn";
      this.soundBtn.title = "Toggle Sound (M)";
      this.soundBtn.innerHTML = IconSoundOn;
      this.soundBtn.addEventListener("click", () => {
        const muted = onToggle();
        this.setSoundIcon(muted);
      });
      btnGroup.appendChild(this.soundBtn);
    }

    const signOut = document.createElement("button");
    signOut.className = "mode-toggle-btn signout-btn";
    signOut.title = "Back to Agent Select";
    signOut.innerHTML = IconSignOut;
    signOut.addEventListener("click", () => window.location.reload());

    this.el.append(btnGroup, signOut);
  }

  /** Update the sound button icon */
  setSoundIcon(muted: boolean) {
    if (this.soundBtn) {
      this.soundBtn.innerHTML = muted ? IconSoundOff : IconSoundOn;
      this.soundBtn.title = muted ? "Unmute (M)" : "Mute (M)";
    }
  }

  private select(mode: AppMode) {
    this.mode = mode;
    for (const btn of this.buttons) {
      btn.classList.toggle("active", btn.dataset.mode === mode);
    }
    this.onChange(mode);
  }

  show() { this.el.style.display = ""; }
  hide() { this.el.style.display = "none"; }
  destroy() { this.el.remove(); }
}
