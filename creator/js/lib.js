// Small helpers for the page. No framework: template strings.
import { ICONS } from "./icons.js";
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const S = { tokens: null };
export async function load() { await loadTokens(); }
export async function loadTokens() { if (!S.tokens) S.tokens = await (await fetch("data/tokens.json")).json(); return S.tokens; }

/* Icons come from the public Airtime icon set (see js/icons.js). Unknown names fall back to a neutral ring. */
export const si = (name, cls = "") => `<span class="cr-icon ${cls}" aria-hidden="true">${ICONS[name] ?? ICONS.shapeCircle}</span>`;

/* Sidebar-context wrapper: rows live in the 296px card, on its own material, in either theme. */
export const card = (inner, { compact = true, cls = "" } = {}) => `<div class="cr-sidebar ${cls}"><div class="cr-sidebar-scroll ${compact ? "is-compact" : ""}">${inner}</div></div>`;
