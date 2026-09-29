// Rendering helpers for the single-page docs. No framework: template strings + one hydration pass for icons.
export const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
export const S = { tokens: null, sources: {}, index: null };
export async function load() {
  S.index = await (await fetch("data/tokens-index.json")).json();
  S.tokens = new Map(S.index.tokens.map((t) => [t.css, t]));
  try { S.audit = await (await fetch("data/audit.json")).json(); } catch { S.audit = null; }
  S.orglayer = await (await fetch("data/org-layer.json")).json();
  S.untok = await (await fetch("data/untokenized.json")).json();
  S.unmatched = await (await fetch("data/unmatched.json")).json();
  try { S.sources = await (await fetch("data/sources.json")).json(); } catch { S.sources = {}; }
}
export const REPO = "apps/airtime-creator/src/";
/* icons: real glyphs from assets/icons.js (AppIcons) and assets/mask-icons.js, hydrated after render */
export const icon = (name, cls = "") => `<span class="cr-icon ${cls}" data-icon="${name}" aria-hidden="true"></span>`;
export const mask = (name, cls = "") => `<span class="cr-icon ${cls}" data-mask="${name}" aria-hidden="true"></span>`;
export const mm = (name, cls = "") => `<span class="cr-icon ${cls}" data-mm="${name}" aria-hidden="true"></span>`;
export const glyph = (name, cls = "") => `<span class="cr-icon ${cls}" data-glyph="${name}" aria-hidden="true"></span>`;
export function hydrateIcons(root = document) {
  root.querySelectorAll("[data-mm]:not([data-done])").forEach((el) => { const g = window.MmhmmIcons?.[el.dataset.mm]; if (!g) return; el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${g.viewBox}" ${g.root} aria-hidden="true">${g.inner}</svg>`; el.dataset.done = "1"; });
  root.querySelectorAll("[data-glyph]:not([data-done])").forEach((el) => { const g = window.GlyphIcons?.[el.dataset.glyph]; if (!g) return; el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${g.viewBox}" fill="currentColor" aria-hidden="true">${g.inner}</svg>`; el.dataset.done = "1"; });
  root.querySelectorAll("[data-icon]:not([data-done])").forEach((el) => { const f = window.AppIcons?.[el.dataset.icon]; if (f) el.replaceChildren(f()); else el.textContent = "?"; el.dataset.done = "1"; });
  root.querySelectorAll("[data-mask]:not([data-done])").forEach((el) => { const m = window.MaskIcons?.[el.dataset.mask]; if (!m) return; el.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${m.viewBox}" fill="currentColor" aria-hidden="true"><path d="${m.d}" fill-rule="evenodd" clip-rule="evenodd"/></svg>`; el.dataset.done = "1"; });
}
/* the sidebar glyph table: SidebarIconName -> source (icons.tsx `sources`) */
export const SIDE = { border: "Border", cornerRadius: "CornerRadius", enhance: "Enhance", opacity: "Opacity", shadow: "Shadow", rotate: "Rotate", paste: "Paste", crop: "Crop", effects: "Enhance", duplicate: "CopyToClipboardStroke", copy: "Copy", trash: "TrashStroke", expand: "Expand", media: "MediaLibraryStroke", cam: "CamStroke", more: "Ellipsis", chevronBack: "ChevronBackStroke", chevronForward: "ChevronForwardStroke", chevronUp: "ChevronUpStroke", chevronDown: "ChevronDownStroke", lock: "Lock", lockOpen: "LockOpen", eye: "EyeStroke", noEye: "NoEyeStroke", sidebarToggle: "SidebarRight", padding: "Padding", virtualBackground: "LandscapeRoomFill", textAlignLeft: "TextToolbarAlignLeft", textAlignCenter: "TextToolbarAlignCenter", textAlignRight: "TextToolbarAlignRight", textAlignTop: "TextToolbarAlignTop", textAlignMiddle: "TextToolbarAlignMiddle", textAlignBottom: "TextToolbarAlignBottom", textList: "TextToolbarList", stackFront: "StackFront", stackBack: "StackBack", alignLeft: "AlignStartVertical", alignHCenter: "AlignCenterVertical", alignRight: "AlignEndVertical", alignTop: "AlignStartHorizontal", alignVCenter: "AlignCenterHorizontal", alignBottom: "AlignEndHorizontal" };
export const MASKS = { maskRectangle: "MaskRectangle", maskSquare: "MaskSquare", maskCircle: "MaskCircle", maskHexagon: "MaskHexagon" };
export const si = (n, cls = "") => (MASKS[n] ? mask(MASKS[n], cls) : icon(SIDE[n] ?? n, cls));

export const ORGTXT = { same: "same as airtime-design-system", differs: "differs", "creator-only": "creator-only" };
/* provenance (from the CSS audit) replaces the old value-only org badge */
export const BUCKET_CLS = (sub) => (sub === "airtime-design-system" ? "ds" : /^creator-v2/.test(sub) ? "rd" : /^legacy/.test(sub) ? "lg" : sub === "unmatched" ? "un" : "st");
export const provBadge = (sub) => `<span class="org prov-${BUCKET_CLS(sub)}">${esc(sub)}</span>`;
export const EXC = { "exclusive to DS": "prov-ds", "shared with prototypes": "prov-rd", "not DS": "prov-none", none: "prov-none" };
export function tokenProv(css) {
  const al = S.tokens.get(css)?.alias; const aliasHtml = al ? `<div><span class="org prov-ds">alias of ${esc(al)}</span></div>` : "";
  const a = S.audit?.tokens?.[css];
  if (!a) return aliasHtml + `<span class="from">no audit data</span>`;
  if (!a.found) return aliasHtml + `<span class="org prov-none">not in audit</span> <span class="from">no declaration with this name or literal was captured</span>`;
  const L = a.light, D = a.dark; const same = L.bucket === D.bucket && L.src === D.src;
  const one = (x, th) => `${th ? `<span class="from">${th}</span> ` : ""}${provBadge(x.sub)} <span class="from">${esc(x.src || "no source")}${x.weak ? " (weak value)" : ""}</span>`;
  const flags = [a.light.status === "overridden-everywhere" ? "dead (loses cascade)" : "", !a.light.used ? "unused rule" : ""].filter(Boolean).join(", ");
  return `${aliasHtml}${same ? one(L) : one(L, "light") + "<br>" + one(D, "dark")}<div><span class="org ${EXC[a.exclusivity] ?? "prov-none"}">${a.exclusivity}</span>${flags ? ` <span class="org prov-un">${flags}</span>` : ""}</div>`;
}
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
  let groups = (p.groups ?? []).map((g) => cell(g.cap, g.html)).join("");
  if (p.flex) groups = `<div class="cells-flex">${groups}</div>`;
  const body = p.raw ? groups : card(groups, { compact: true });
  const stage = (th) => `<div class="stage" data-theme="${th}"><div class="tag">${th}</div>${body}</div>`;
  const toks = tokensUsed(p.css ?? []);
  const rel = auditBadges(p.id);
  return `<article class="pattern" id="${p.id}"><header><h3>${p.title}</h3>${rel}</header>${p.org?.[1] ? `<p class="note muted" style="font-size:11px;margin-bottom:2px">Manual comparison with the org system: ${esc(p.org[1])}</p>` : ""}${p.note ? `<p class="note">${p.note.replace(/`([^`]+)`/g, "<code>$1</code>")}</p>` : ""}${anat}
  <div class="stage-pair">${stage("light")}${stage("dark")}</div>
  ${auditBlock(p.id)}<footer><h4 style="margin-top:0">Source</h4>${srcList(p.src)}<h4>Tokens used (scanned from ${(p.css ?? []).map((c) => "." + c).join(", ")})</h4><div class="chips">${toks.map(tokChip).join("") || '<span class="muted">none</span>'}</div></footer></article>`;
}
/* build helpers for the recurring markup */
export const btn = (cls, attrs, inner) => `<button type="button" class="cr-btn0 ${cls}" ${attrs ?? ""}>${inner}</button>`;

/* per-pattern audit: bucket mix, exclusivity, and the declarations to clean */
export function auditBadges(id) {
  const a = S.audit?.patterns?.[id]; if (!a || !a.attributable) return `<span class="org prov-none" title="No CSS declarations are attributed to this pattern's files in the audit">audit: no attributed CSS</span>`;
  const pc = (n) => Math.round((100 * n) / a.attributable);
  return `<span class="org prov-ds" title="value matches the DS (DS wins ties)">DS ${pc(a.ds)}%</span><span class="org prov-rd">redesign ${pc(a.redesign)}%</span>${a.legacy ? `<span class="org prov-lg">legacy ${pc(a.legacy)}%</span>` : ""}<span class="org prov-un">one-off ${a.unmatched}</span>${a.dead ? `<span class="org prov-un">dead ${a.dead}</span>` : ""}`;
}
export function auditBlock(id) {
  const a = S.audit?.patterns?.[id]; if (!a || !a.attributable) return "";
  const li = (arr, cls) => arr.length ? `<table class="spec"><tr><th>Property: value</th><th>Rule file</th><th>Theme</th><th>${cls === "dead" ? "Cascade" : "Matched source"}</th></tr>${arr.map((x) => `<tr><td class="src">${esc(x.prop)}: ${esc(x.value)}</td><td class="src">${esc(x.file)}</td><td>${x.themes}</td><td class="src">${esc(cls === "dead" ? x.status : x.src || "no match")}</td></tr>`).join("")}</table>` : `<div class="muted">none captured</div>`;
  return `<div class="sub auditblock"><h4>Audit: what to clean (files: ${a.files.map((f) => esc(f.split("/").pop())).join(", ")})</h4>
  <p class="lede" style="margin:0 0 6px">${a.total} distinct declarations attributed to these files: ${a.ds} value-match the DS (${a.dsExclusive} exclusively), ${a.redesign} the creator-v2 redesign, ${a.legacy} legacy/other, <b>${a.unmatched} unmatched</b>, ${a.structural} structural; <b>${a.dead} dead</b> (lose the cascade everywhere sampled), ${a.unusedRule} in rules never matched; ${a.legacyN} from legacy stylesheets. Attribution is by the component that rendered the rule, so recipe output is counted under its host component.</p>
  <details><summary><b>${a.unmatched}</b> one-off literals (unmatched, in rules that matched; first ${a.lists.oneOff.length})</summary>${li(a.lists.oneOff, "one")}</details>
  <details><summary><b>${a.dead}</b> dead declarations (first ${a.lists.dead.length})</summary>${li(a.lists.dead, "dead")}</details>
  ${a.legacyN ? `<details><summary><b>${a.legacyN}</b> legacy declarations</summary>${li(a.lists.legacy, "lg")}</details>` : ""}</div>`;
}
