// Small helpers for the Overview page. No framework: template strings.
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const S = { data: null, tokens: null };
export async function load() {
  S.data = await (await fetch("data/overview.json")).json();
}

/* Generic placeholder glyphs. The components below show their real structure; the artwork inside icon slots is
   deliberately neutral (a chevron or a ring), because this page documents layout, color and type, not icons. */
const CHEVRONS = { chevronDown: 90, chevronForward: 0, chevronBack: 180 };
export const si = (name, cls = "") => {
  const rot = CHEVRONS[name];
  const g = rot != null
    ? `<path d="M6 3.5 10.5 8 6 12.5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" transform="rotate(${rot} 8 8)"/>`
    : `<circle cx="8" cy="8" r="4.75" fill="none" stroke="currentColor" stroke-width="1.5"/>`;
  return `<span class="cr-icon ${cls}" aria-hidden="true"><svg viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">${g}</svg></span>`;
};

/* Sidebar-context wrapper: rows live in the 296px card, on its own material, in either theme. */
export const card = (inner, { compact = true, cls = "" } = {}) => `<div class="cr-sidebar ${cls}"><div class="cr-sidebar-scroll ${compact ? "is-compact" : ""}">${inner}</div></div>`;
