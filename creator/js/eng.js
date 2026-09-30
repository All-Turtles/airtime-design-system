import { S, esc, loadTokens } from "./lib.js";
import { ATOMS, ICON_MAP } from "./atoms.js";
import { PATTERNS } from "./patterns.js";
import { AREAS } from "./areas.js";
import { analyze, counts, summary, whyMore, consolidation, fullTable } from "./colors.js";

/* Engineering view: the same system as data. Built only from public-safe fields. */
const PREFIX = ["color-", "shadow-", "size-", "radius-", "space-", "opacity-", "font-size-", "blur-", "z-", "duration-", "easing-", "border-width-", "transition-", ""];
const cell = (v) => (v == null ? "" : typeof v === "object" ? esc(JSON.stringify(v)) : esc(v));
const swatchOf = (v) => (/^(rgb|#|color\()/.test(v ?? "") ? `<i class="e-sw" style="background:${esc(v)}"></i>` : "");
const CATS = { colors: "Color", fonts: "Font families", "font-sizes": "Font sizes", "font-weights": "Font weights", "line-heights": "Line heights", "letter-spacings": "Letter spacing", spacing: "Spacing", sizes: "Sizes", radii: "Radii", "border-widths": "Border widths", shadows: "Shadows", blurs: "Blurs", opacity: "Opacity", durations: "Durations", easings: "Easings", transitions: "Transitions", "z-index": "Z-index", "aspect-ratios": "Aspect ratios", gradients: "Gradients" };

export async function eng(root) {
  const T = await loadTokens();
  const byCss = new Map(T.tokens.map((t) => [t.css, t]));
  const resolve = (n) => { for (const p of PREFIX) { const t = byCss.get(`--cr-${p}${n}`); if (t) return t.css; } return null; };
  const tokChips = (list) => list.map((n) => { const c = resolve(n); return c ? `<code>${esc(c)}</code>` : `<code class="e-un">${esc(n)}</code>`; }).join(" ");
  const cats = {}; T.tokens.forEach((t) => (cats[t.cat] ??= []).push(t));
  const A = analyze(T), N = counts(T, A);

  const tokenTable = (list) => `<div class="e-scroll"><table class="e-table"><thead><tr><th>Token</th><th>CSS variable</th><th>Light</th><th>Dark</th><th>Declared</th><th>Alias of</th><th>Uses</th></tr></thead><tbody>${list.map((t) => `<tr><td>${esc(t.id)}<span class="e-k">${esc(t.kind)}</span></td><td><code>${esc(t.css)}</code></td><td>${swatchOf(t.light)}<span class="mono">${cell(t.light)}</span></td><td>${t.dark === t.light ? '<span class="e-k">same</span>' : swatchOf(t.dark) + `<span class="mono">${cell(t.dark)}</span>`}</td><td class="mono">${cell(t.value)}</td><td>${t.alias ? `<code>${esc(t.alias)}</code>` : ""}</td><td class="num">${t.used ?? ""}</td></tr>`).join("")}</tbody></table></div>`;
  const tokenSections = Object.keys(CATS).filter((k) => cats[k] && k !== "colors").map((k) => `<h3 id="e-tok-${k}">${CATS[k]} <small>${cats[k].length}</small></h3>${tokenTable(cats[k])}`).join("");

  const tsTable = `<div class="e-scroll"><table class="e-table"><thead><tr><th>Style</th><th>Class</th><th>Size</th><th>Line</th><th>Weight</th><th>Other</th></tr></thead><tbody>${T.textStyles.map((s) => `<tr><td>${esc(s.name)}</td><td><code>.${esc(s.css)}</code></td><td>${esc(s.fontSize ?? "")}</td><td>${esc(s.lineHeight ?? "")}</td><td>${esc(s.fontWeight ?? "")}</td><td class="mono">${cell(Object.keys(s.extra).length ? s.extra : "")}</td></tr>`).join("")}</tbody></table></div>`;

  const reg = (items) => `<div class="e-scroll"><table class="e-table"><thead><tr><th>Item</th><th>Use</th><th>Classes</th><th>States</th><th>Tokens</th></tr></thead><tbody>${items.map((i) => `<tr id="e-${i.id}"><td><b>${esc(i.title)}</b><span class="e-k">${esc(i.cat)}</span></td><td>${esc(i.use)}${i.note ? `<br><b>Note:</b> ${esc(i.note)}` : ""}</td><td>${(i.classes ?? []).map((c) => `<code>.${esc(c)}</code>`).join(" ")}</td><td>${(i.states ?? []).map((s) => `<span class="e-st">${esc(s)}</span>`).join(" ")}</td><td>${tokChips(i.tokens ?? [])}</td></tr>`).join("")}</tbody></table></div>`;

  const iconTable = `<div class="e-scroll"><table class="e-table"><thead><tr><th>Control</th><th>Org icon file</th><th>Match</th><th>Note</th></tr></thead><tbody>${ICON_MAP.map((i) => `<tr><td>${esc(i.control)}</td><td><code>icons/${esc(i.file)}</code></td><td><span class="e-st ${i.match === "gap" ? "is-gap" : i.match === "near" ? "is-near" : ""}">${esc(i.match)}</span></td><td>${esc(i.note)}</td></tr>`).join("")}</tbody></table></div>`;

  const spacing = (cats.spacing ?? []).map((t) => `<span class="e-chip">${esc(t.css.replace("--cr-space-", ""))} <b>${esc(t.light)}</b></span>`).join("");
  const radii = (cats.radii ?? []).map((t) => `<span class="e-chip">${esc(t.css.replace("--cr-radius-", ""))} <b>${esc(t.light)}</b></span>`).join("");

  const files = [["Tokens as JSON (flat, with light and dark values)", "data/tokens.json"], ["Tokens as CSS custom properties", "tokens/tokens.css"], ["Text style classes", "tokens/text-styles.css"], ["Org token layer (copy)", "tokens/org/tokens.css"], ["Design tokens, DTCG format", "tokens/color.tokens.json"], ["Component CSS: sidebar", "css/sidebar.css"], ["Component CSS: atoms", "css/atoms.css"], ["Component CSS: header", "css/header.css"], ["Component CSS: tray", "css/tray.css"], ["Component CSS: stage", "css/stage.css"], ["Component CSS: menus and dialogs", "css/aux.css"]];
  root.innerHTML = `
  <section id="e-about" data-group="eng"><h1>Creator design system: Engineering</h1>
    <p class="hv-lede">The same system as data: every token with its light and dark value, every text style, and every atom, pattern and area with its class names, states and tokens. Load order: <code>tokens/org/tokens.css</code>, <code>tokens/org/org-theme.css</code>, <code>tokens/tokens.css</code>, <code>tokens/text-styles.css</code>, then the component CSS. Set <code>data-theme="light"</code> or <code>"dark"</code> on any element.</p>
    <div class="hv-chips"><span><b>${N.tokens}</b> tokens</span><span><b>${A.stats.total}</b> colors <small>target ${A.stats.recommended}</small></span><span><b>${T.textStyles.length}</b> text styles</span><span><b>${ATOMS.length}</b> atoms</span><span><b>${PATTERNS.length}</b> patterns</span><span><b>${AREAS.length}</b> areas</span><span><b>${ICON_MAP.length}</b> mapped icons</span></div>
    <p class="hv-sub">States are forced with classes so they can be shown without interaction: <code>.is-hover</code>, <code>.is-pressed</code>, <code>.is-focus</code>, <code>.is-selected</code>, <code>.is-disabled</code>, <code>.is-error</code>, <code>.is-open</code>. Real pseudo-classes work the same way.</p></section>
  <section id="e-downloads" data-group="eng"><h2>Downloads</h2><ul class="e-files">${files.map(([n, f]) => `<li><a href="${f}" ${f.endsWith(".json") || f.endsWith(".css") ? "download" : ""}>${esc(n)}</a><code>${f}</code></li>`).join("")}</ul></section>
  <section id="e-colors" data-group="eng"><h2>Every color in the app</h2><p class="hv-sub">All ${A.stats.total} color tokens, computed at load from <code>data/tokens.json</code>. Uses counts references to the token in the app's code. Flags: DUPLICATE OF (same light and dark values), NEAR (deltaE 3 or less, cheapest first), closest org token with class EXACT, NEAR (deltaE 5 or less), ROLE-ONLY or NONE, and the proposal for the token. Nothing is applied to the app.</p>${summary(A)}${whyMore(A)}${fullTable(A)}</section>
  <section id="e-consolidation" data-group="eng"><h2>Proposed color consolidation</h2>${consolidation(A, { eng: true })}</section>
  <section id="e-tokens" data-group="eng"><h2>Other tokens</h2><p class="hv-sub">Everything except color. Uses counts how many rules use the token in the rendered UI. Colors are in the sections above.</p>${tokenSections}</section>
  <section id="e-text" data-group="eng"><h2>Text styles</h2>${tsTable}</section>
  <section id="e-scales" data-group="eng"><h2>Spacing and radii</h2><h3>Spacing</h3><div class="e-chips">${spacing}</div><h3>Radii</h3><div class="e-chips">${radii}</div></section>
  <section id="e-atoms" data-group="eng"><h2>Atoms</h2>${reg(ATOMS)}</section>
  <section id="e-patterns" data-group="eng"><h2>Patterns</h2>${reg(PATTERNS)}</section>
  <section id="e-areas" data-group="eng"><h2>Areas</h2>${reg(AREAS)}</section>
  <section id="e-icons" data-group="eng"><h2>Icon mapping</h2><p class="hv-sub">Each control uses an icon from the public Airtime icon set in <code>icons/</code>. Match is exact, near (closest available) or gap (no fit, neutral ring shown).</p>${iconTable}</section>`;
  const un = [...root.querySelectorAll(".e-un")].map((e) => e.textContent);
  if (un.length) console.info("unresolved token names", [...new Set(un)].join(", "));
}
