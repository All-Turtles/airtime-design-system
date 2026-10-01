import { esc } from "./lib.js";
import * as K from "./color.js";

/* The clean-slate token system: every number, name and value here comes from data/tokens.json "system". */
const nf = (n) => new Intl.NumberFormat().format(n);
const code = (s) => `<code>${esc(s)}</code>`;
const val = (v) => esc(K.hex(v));

/* One half of a swatch, light or dark. The checkerboard shows through see-through colors. */
const half = (v, th) => `<span class="sy-half is-${th}" style="--c:${esc(v)}" role="img" aria-label="${th} value ${val(v)}"></span>`;
const pair = (t) => `<span class="sy-pair">${half(t.light, "light")}${half(t.dark, "dark")}</span>`;
const same = (t) => t.light === t.dark;

function colorTable(g, { pending = false } = {}) {
  const rows = g.tokens.map((t) => `<tr><th scope="row">${code(t.name)}</th><td class="sy-sw">${pair(t)}</td>
    <td class="sy-val"><span><em>Light</em> ${val(t.light)}</span><span><em>Dark</em> ${same(t) ? "same" : val(t.dark)}</span></td><td class="sy-use">${esc(t.use)}</td></tr>`).join("");
  return `<div class="e-scroll"><table class="hv-table sy-table${pending ? " is-pending" : ""}"><caption class="sr-only">${esc(g.title)} colors</caption>
    <thead><tr><th scope="col">Token</th><th scope="col">Light and dark</th><th scope="col">Values</th><th scope="col">Use it for</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}

function beforeAfter(T) {
  const S = T.states, f = (st) => `<b>${nf(st.colors.distinct)}</b> distinct <small>${nf(st.colors.definitions)} definitions</small>`;
  const box = (label, st, note, cls = "") => `<div class="sy-ba ${cls}"><em>${label}</em><p>${f(st)}</p><span>${note}</span></div>`;
  return `<div class="sy-bas">${box("On dev today", S.dev, "Raw colors plus a semantic layer, many aliases and near-duplicates.")}<span class="sy-arrow" aria-hidden="true">&rarr;</span>${box("In review", S.review, "Direct color literals in components are nearly gone; the value count starts to fall.")}<span class="sy-arrow" aria-hidden="true">&rarr;</span>${box("Target", S.target, "23 named colors from Figma, plus 10 awaiting Figma.", "is-target")}</div>`;
}

export function colorSystem(T) {
  const Y = T.system, total = Y.colorGroups.reduce((n, g) => n + g.tokens.length, 0);
  return `<section id="h-system" data-group="foundations"><h2>The color system</h2>
    <p class="hv-sub">Creator colors are exactly the ${total} Colors variables in Figma, under the same names. Each one has a light and a dark value. Components use these names and nothing else. Anything the design needs that Figma does not have yet sits in a separate <a href="#h-pending">awaiting Figma</a> group.</p>
    ${beforeAfter(T)}
    <p class="hv-foot">Counts are distinct light and dark values, with the number of definitions beneath. See <a href="#h-tokens">token counts</a> for how each state is counted.</p>
    ${Y.colorGroups.map((g) => `<h3 id="sy-${g.id}">${esc(g.title)} <small class="sy-n">${g.tokens.length}</small></h3><p class="hv-sub">${esc(g.about)}</p>${colorTable(g)}`).join("")}
  </section>
  <section id="h-pending" data-group="foundations" class="sy-pending"><h2>Awaiting Figma <span class="sy-badge">${Y.pending.length} colors</span></h2>
    <p class="hv-sub">Colors the design uses that the Figma Colors variables do not have. They live in one quarantined <code>pending.*</code> group so they stay visible and cannot spread. A color leaves this group when Figma gains the variable, and nothing new may be added to it.</p>
    ${colorTable({ title: "Awaiting Figma", tokens: Y.pending }, { pending: true })}
  </section>`;
}

/* The page resolves a shadow's color references to the nearest page color so the demo is live in both themes. */
const REF = { "colors.shadow.small": "var(--sy-shadow-s)", "colors.shadow.medium": "var(--sy-shadow-m)", "colors.shadow.large": "var(--sy-shadow-l)", "colors.lighting.shade": "var(--sy-shade)", "colors.lighting.highlightPrimary": "var(--sy-hi1)", "colors.lighting.highlightSecondary": "var(--sy-hi2)", "colors.content.primary": "var(--sy-ink)", "colors.accent.teal": "var(--sy-teal)", "colors.modeless.white24": "rgba(255,255,255,.24)", "colors.modeless.white8": "rgba(255,255,255,.08)", "colors.modeless.black24": "rgba(0,0,0,.24)", "colors.modeless.black": "#000", "colors.modeless.tealOnDark": "#3B9BFF" };
function shadowCss(v, depth = 0) {
  let out = v.replace(/\{([\w.]+)\}/g, (m, k) => (k.startsWith("shadows.") ? "@" + k.slice(8) + "@" : REF[k] ?? "currentColor"));
  return out;
}
let shadowMap = {};
const resolveShadows = (list) => { shadowMap = Object.fromEntries(list.map((s) => [s.name, s.value])); const go = (v, d = 0) => shadowCss(v).replace(/@(\w+)@/g, (m, n) => (d < 3 ? go(shadowMap[n], d + 1) : "0 0 0 0 transparent")); return go; };

export function scales(T) {
  const Y = T.system, go = resolveShadows(Y.shadows);
  const shadows = Y.shadows.map((s) => `<div class="sy-sh"><span class="sy-sh-box${/^glass/.test(s.name) ? " is-glass" : ""}" style="box-shadow:${esc(go(s.value))}"></span><div><code>${esc(s.name)}</code><small>${esc(s.use)}</small></div></div>`).join("");
  const radii = Y.radii.map((r) => `<div class="sy-rad"><i style="border-radius:${esc(r.value)}"></i><code>${esc(r.name)}</code><b>${r.name === "full" ? "pill" : esc(r.value)}</b><small>${esc(r.use)}</small></div>`).join("");
  const dur = Y.durations.map((d) => `<button type="button" class="hv-motion" data-dur="${esc(d.value)}"><span class="hv-track"><i></i></span><b>${esc(d.name)}</b><span>${esc(d.value)} &middot; ${esc(d.use)}</span></button>`).join("");
  const ctl = Y.controls.map((c) => `<div class="sy-ctl"><span class="sy-ctl-box" style="height:${esc(c.value)}"></span><code>${esc(c.name)}</code><b>${esc(c.value)}</b><small>${esc(c.use)}</small></div>`).join("");
  return `<section id="h-scales" data-group="foundations"><h2>Radius, size, motion and shadow</h2>
    <p class="hv-sub">Short named scales. Nested surfaces step down one radius so their corners stay concentric.</p>
    <h3>Corner radius</h3><div class="sy-grid">${radii}</div>
    <h3>Control heights</h3><div class="sy-grid sy-ctls">${ctl}</div>
    <h3>Motion</h3><p class="hv-sub">Click to replay.</p><div class="hv-motions">${dur}</div>
    <h3>Shadows <small class="sy-n">${Y.shadows.length}</small></h3><p class="hv-sub">Each shadow is built from the colors above, so it follows the theme. The glass ones are for the always-dark stage.</p><div class="sy-grid sy-shs">${shadows}</div></section>`;
}

const RULES = [
  ["Semantic tokens only", "Components never use a color literal. They name a token such as <code>content.secondary</code>."],
  ["Tint with alpha", "A wash of a color is written with the alpha modifier, for example <code>accent.teal/12</code>, never as a new token."],
  ["New colors come from Figma first", "If the design needs a color, it is added to the Figma Colors variables, then here. Until then it waits in the awaiting Figma group."],
  ["A lint guard enforces it", "It rejects color literals, unknown color tokens and off-scale spacing, so the rules hold without review."],
];
const COMPONENTS = [
  ["Buttons", "A button takes a <code>tone</code>, accent or destructive. Tone replaces the old palettes."],
  ["Popovers", "Use <code>background.secondary</code> in light and glass in dark."],
  ["Menus", "One 16 px icon slot, and check marks aligned to the right."],
  ["Note", "A note component carries short inline messages, in place of ad hoc text styles."],
  ["Segmented controls", "Three looks: filled, outline and ghost."],
  ["Icons", "New icons: SidebarPanel and NoSidebarPanel, for showing and hiding the sidebar."],
];
export function rules() {
  const li = ([a, b]) => `<li><b>${a}</b> ${b}</li>`;
  return `<section id="h-rules" data-group="foundations"><h2>Rules and component notes</h2>
    <h3>Rules</h3><ul class="hv-dev">${RULES.map(li).join("")}</ul>
    <h3>Component notes</h3><ul class="hv-dev">${COMPONENTS.map(li).join("")}</ul></section>`;
}

export function changelog(T) {
  const d = T.states.updated;
  const items = [
    [d, "Colors reduced to the 23 Figma Colors variables, named as in Figma, plus a quarantined group of 10 colors awaiting Figma.", "Target"],
    [d, "Radius, duration, control height and shadow scales documented with their named steps.", "Target"],
    [d, "Direct color literals in components cut from 36 to 1, and distinct colors from 42 to 39.", "In review"],
    [d, "SidebarPanel and NoSidebarPanel icons added.", "Shipped"],
  ];
  return `<section id="h-changelog" data-group="more"><h2>Changelog</h2><ol class="sy-log">${items.map(([a, b, c]) => `<li><time datetime="${a}">${a}</time><span class="sy-tag">${c}</span> ${b}</li>`).join("")}</ol></section>`;
}
