// Rendering helpers for the single-page docs. No framework: template strings + one hydration pass for icons.
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const S = { tokens: null, sources: {}, index: null };
export async function load() {
  S.index = await (await fetch("data/tokens-index.json")).json();
  S.tokens = new Map(S.index.tokens.map((t) => [t.css, t]));
  S.untok = await (await fetch("data/untokenized.json")).json();
  S.unmatched = await (await fetch("data/unmatched.json")).json();
  try { S.sources = await (await fetch("data/sources.json")).json(); } catch { S.sources = {}; }
}
export const REPO = "apps/airtime-creator/src/";
/* icons: real glyphs from assets/icons.js (AppIcons) and assets/mask-icons.js, hydrated after render */
export const icon = (name, cls = "") => `<span class="cr-icon ${cls}" data-icon="${name}" aria-hidden="true"></span>`;
export const mask = (name, cls = "") => `<span class="cr-icon ${cls}" data-mask="${name}" aria-hidden="true"></span>`;
export function hydrateIcons(root = document) {
  root.querySelectorAll("[data-icon]:not([data-done])").forEach((el) => { const f = window.AppIcons?.[el.dataset.icon]; if (f) el.replaceChildren(f()); else el.textContent = "?"; el.dataset.done = "1"; });
  root.querySelectorAll("[data-mask]:not([data-done])").forEach((el) => { const m = window.MaskIcons?.[el.dataset.mask]; if (!m) return; el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${m.viewBox}" fill="currentColor" aria-hidden="true"><path d="${m.d}" fill-rule="evenodd" clip-rule="evenodd"/></svg>`; el.dataset.done = "1"; });
}
/* the sidebar glyph table: SidebarIconName -> source (icons.tsx `sources`) */
export const SIDE = { border: "Border", cornerRadius: "CornerRadius", enhance: "Enhance", opacity: "Opacity", shadow: "Shadow", rotate: "Rotate", paste: "Paste", crop: "Crop", effects: "Enhance", duplicate: "CopyToClipboardStroke", copy: "Copy", trash: "TrashStroke", expand: "Expand", media: "MediaLibraryStroke", cam: "CamStroke", more: "Ellipsis", chevronBack: "ChevronBackStroke", chevronForward: "ChevronForwardStroke", chevronUp: "ChevronUpStroke", chevronDown: "ChevronDownStroke", lock: "Lock", lockOpen: "LockOpen", eye: "EyeStroke", noEye: "NoEyeStroke", sidebarToggle: "SidebarRight", padding: "Padding", virtualBackground: "LandscapeRoomFill", textAlignLeft: "TextToolbarAlignLeft", textAlignCenter: "TextToolbarAlignCenter", textAlignRight: "TextToolbarAlignRight", textAlignTop: "TextToolbarAlignTop", textAlignMiddle: "TextToolbarAlignMiddle", textAlignBottom: "TextToolbarAlignBottom", textList: "TextToolbarList", stackFront: "StackFront", stackBack: "StackBack", alignLeft: "AlignStartVertical", alignHCenter: "AlignCenterVertical", alignRight: "AlignEndVertical", alignTop: "AlignStartHorizontal", alignVCenter: "AlignCenterHorizontal", alignBottom: "AlignEndHorizontal" };
export const MASKS = { maskRectangle: "MaskRectangle", maskSquare: "MaskSquare", maskCircle: "MaskCircle", maskHexagon: "MaskHexagon" };
export const si = (n, cls = "") => (MASKS[n] ? mask(MASKS[n], cls) : icon(SIDE[n] ?? n, cls));

export const ORGTXT = { same: "same as airtime-design-system", differs: "differs", "creator-only": "creator-only" };
export const badge = (rel, note) => `<span class="org ${rel}" title="${esc(note ?? "")}">${ORGTXT[rel]}</span>`;

/* tokens a class family uses: scans the loaded stylesheets, so it can never drift from the CSS shown */
export function tokensUsed(classes) {
  const found = new Set();
  const re = classes.map((c) => new RegExp(`\\.${c}(?![\\w-])`));
  const scan = (rules) => { for (const r of rules) { if (r.cssRules) scan(r.cssRules); if (!r.selectorText) continue; if (!re.some((x) => x.test(r.selectorText))) continue; for (const m of r.cssText.matchAll(/var\((--cr-[\w-]+)/g)) found.add(m[1]); } };
  for (const sh of document.styleSheets) { try { scan(sh.cssRules); } catch {} }
  return [...found].sort();
}
export const tokChip = (css) => { const t = S.tokens.get(css); return `<span class="chip"><a href="#tok-${css.slice(5)}" title="${esc(t ? t.org.relation : "unknown token")}">${css.slice(5)}</a></span>`; };
export const srcList = (keys) => (keys ?? []).flatMap((k) => S.sources[k] ?? [{ file: k, line: null }]).map((s) => `<div class="src">${esc(REPO + s.file)}${s.line ? ":" + s.line : ""}${s.note ? ` <span class="muted">${esc(s.note)}</span>` : ""}</div>`).join("");

/* Sidebar-context wrapper: rows live in the 296px card, on its own material, in either theme. */
export const card = (inner, { compact = true, cls = "" } = {}) => `<div class="cr-sidebar ${cls}"><div class="cr-sidebar-scroll ${compact ? "is-compact" : ""}">${inner}</div></div>`;
export const cell = (cap, html) => `<div class="cell"><div class="cap">${cap}</div>${html}</div>`;

/* One pattern: anatomy table, live light|dark stages, source, tokens, org relation. */
export function pattern(p) {
  const anat = p.anatomy?.length ? `<div class="sub"><h4>Anatomy</h4><table class="spec"><tr><th style="width:150px">Part</th><th>Spec</th><th style="width:34%">Tokens / measure</th></tr>${p.anatomy.map(([a, b, c]) => `<tr><td>${a}</td><td>${b}</td><td>${c ?? ""}</td></tr>`).join("")}</table></div>` : "";
  const groups = (p.groups ?? []).map((g) => cell(g.cap, g.html)).join("");
  const body = p.raw ? groups : card(groups, { compact: true });
  const stage = (th) => `<div class="stage" data-theme="${th}"><div class="tag">${th}</div>${body}</div>`;
  const toks = tokensUsed(p.css ?? []);
  const rel = p.org ? badge(p.org[0], p.org[1]) : "";
  return `<article class="pattern" id="${p.id}"><header><h3>${p.title}</h3>${rel}<span class="muted">${p.org?.[1] ? esc(p.org[1]) : ""}</span></header>${p.note ? `<p class="note">${p.note.replace(/`([^`]+)`/g, "<code>$1</code>")}</p>` : ""}${anat}
  <div class="stage-pair">${stage("light")}${stage("dark")}</div>
  <footer><h4 style="margin-top:0">Source</h4>${srcList(p.src)}<h4>Tokens used (scanned from ${(p.css ?? []).map((c) => "." + c).join(", ")})</h4><div class="chips">${toks.map(tokChip).join("") || '<span class="muted">none</span>'}</div></footer></article>`;
}
/* build helpers for the recurring markup */
export const btn = (cls, attrs, inner) => `<button type="button" class="cr-btn0 ${cls}" ${attrs ?? ""}>${inner}</button>`;
