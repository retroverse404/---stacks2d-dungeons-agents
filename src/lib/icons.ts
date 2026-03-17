/**
 * Inline SVG icon strings — Lucide-style, stroke-based, 14×14 display.
 * Use via innerHTML. All icons use currentColor so they inherit parent color.
 */

const SVG_ATTRS = `width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" xmlns="http://www.w3.org/2000/svg"`;

/** Play — filled triangle */
export const IconPlay = `<svg ${SVG_ATTRS} fill="currentColor" stroke="none"><polygon points="6,3 20,12 6,21"/></svg>`;

/** Build — wrench */
export const IconBuild = `<svg ${SVG_ATTRS}><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>`;

/** Sprites — pen/edit tool */
export const IconSprites = `<svg ${SVG_ATTRS}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>`;

/** NPCs — robot/bot */
export const IconNpcs = `<svg ${SVG_ATTRS}><rect x="3" y="11" width="18" height="10" rx="2"/><circle cx="12" cy="5" r="2"/><path d="M12 7v4"/><circle cx="8" cy="16" r="1" fill="currentColor"/><circle cx="16" cy="16" r="1" fill="currentColor"/></svg>`;

/** Items — sword */
export const IconItems = `<svg ${SVG_ATTRS}><polyline points="14.5,17.5 3,6 3,3 6,3 17.5,14.5"/><line x1="13" y1="19" x2="19" y2="13"/><line x1="16" y1="16" x2="20" y2="20"/><line x1="19" y1="21" x2="21" y2="19"/></svg>`;

/** Maps — minimal globe/grid */
export const IconMaps = `<svg ${SVG_ATTRS}><circle cx="12" cy="12" r="8.5"/><path d="M3.8 12h16.4"/><path d="M12 3.5c2.4 2.2 3.8 5.2 3.8 8.5s-1.4 6.3-3.8 8.5"/><path d="M12 3.5c-2.4 2.2-3.8 5.2-3.8 8.5s1.4 6.3 3.8 8.5"/></svg>`;

/** Sound on — speaker with waves */
export const IconSoundOn = `<svg ${SVG_ATTRS}><polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;

/** Sound off — speaker with X */
export const IconSoundOff = `<svg ${SVG_ATTRS}><polygon points="11,5 6,9 2,9 2,15 6,15 11,19 11,5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>`;

/** Home — house */
export const IconHome = `<svg ${SVG_ATTRS}><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9,22 9,12 15,12 15,22"/></svg>`;

/** Chat — message bubble */
export const IconChat = `<svg ${SVG_ATTRS}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>`;

/** Character — person silhouette */
export const IconCharacter = `<svg ${SVG_ATTRS}><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;

/** Sign out — door with arrow exiting */
export const IconSignOut = `<svg ${SVG_ATTRS}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`;
