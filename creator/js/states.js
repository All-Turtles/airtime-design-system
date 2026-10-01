import { esc } from "./lib.js";
import * as K from "./color.js";
import { tipWrap } from "./tip.js";

/* Color counts in three states (on dev today, in review, target) read from data/tokens.json "states".
   Two numbers are always shown together: definitions (every color token written in the source) and distinct values
   (different light and dark pairs among the semantic colors, aliases resolved). Each number lists itself on hover, focus or tap. */
export const nf = (n) => new Intl.NumberFormat().format(n);
const code = (n) => `<code>${esc(n)}</code>`;
const names = (l) => `<p class="cs-names">${l.map(code).join(" ")}</p>`;
const pairSw = (g) => `<span class="cs-pair" aria-hidden="true"><i class="ca-sw" style="--c:${esc(g.light)}"></i><i class="ca-sw is-dark" style="--c:${esc(g.dark)}"></i></span>`;

/* raw (every raw color), semantic (every semantic color, aliases included), aliases (pure references; a raw color can be one too) */
export const parts = (c) => { const al = new Set(c.aliases.map((a) => a.name)); const semAl = c.aliases.filter((a) => !a.raw).length; return { raw: c.raw.length, semantic: c.semantic.length + semAl, semAliases: semAl, rawAliases: c.aliases.length - semAl, rawOwn: c.raw.filter((n) => !al.has(n)) }; };
export const breakdownText = (c) => { const p = parts(c); return `${nf(p.raw)} raw + ${nf(p.semantic)} semantic, of which ${nf(p.semAliases)} ${p.semAliases === 1 ? "is an alias" : "are aliases"}${p.rawAliases ? `; ${nf(p.rawAliases)} of the raw ones ${p.rawAliases === 1 ? "is an alias too" : "are aliases too"}` : ""}`; };

export function defTip(c) {
  const p = parts(c);
  return `<div class="cs-tip-h">${nf(c.definitions)} color definitions</div><p class="cs-tip-s">${breakdownText(c)}</p><p class="cs-tip-s">${rule()}</p>
  <h5>Raw, own value <small>${p.rawOwn.length}</small></h5>${names(p.rawOwn)}
  <h5>Semantic, own value <small>${c.semantic.length}</small></h5>${names(c.semantic)}
  <h5>Aliases <small>${c.aliases.length}</small></h5><p class="cs-tip-s">An alias is a token whose light and dark values are both plain references to another color. A reference that points to different colors in light and dark still counts: ${c.aliases.filter((a) => /\(light\)/.test(a.to)).map((a) => code(a.name) + " is " + esc(a.to)).join("; ") || "none here"}.</p><ul class="cs-alias">${c.aliases.map((a) => `<li>${code(a.name)} <span aria-label="points to">&rarr;</span> ${code(a.to)}${a.raw ? ' <small class="cs-rawtag">raw</small>' : ""}</li>`).join("")}</ul>`;
}
export function valTip(c) {
  return `<div class="cs-tip-h">${nf(c.distinct)} distinct values</div><p class="cs-tip-s">${rule()}</p><p class="cs-tip-s">Each row is one light and dark value (left half light, right half dark) and the color names that share it. Aliases count as the color they point to.</p>
  <ul class="cs-groups">${c.groups.map((g) => `<li>${pairSw(g)}<span class="cs-gv">${esc(K.hex(g.light))}${g.light === g.dark ? "" : " / " + esc(K.hex(g.dark))}</span><span class="cs-gn">${g.names.map(code).join(" ")}</span></li>`).join("")}</ul>`;
}
let cardN = null;
export const setCards = (n) => { cardN = n; };
const rule = () => `Definitions count every raw and semantic token; distinct values count unique light and dark pairs among semantic tokens; the audit cards below group raw swatches too${cardN ? ` (${nf(cardN)})` : ""}.`;
export const hasLists = (c) => !!c && Array.isArray(c.raw) && Array.isArray(c.groups);

/* one big number, optionally with its list */
export const defNum = (c) => (hasLists(c) ? tipWrap(`<b>${nf(c.definitions)}</b>`, defTip(c), { aria: `${nf(c.definitions)} color definitions, show the list` }) : `<b>${nf(c.definitions)}</b>`);
export const valNum = (c) => (hasLists(c) ? tipWrap(`<b>${nf(c.distinct)}</b>`, valTip(c), { aria: `${nf(c.distinct)} distinct color values, show the list` }) : `<b>${nf(c.distinct)}</b>`);

/* the pair, always together: two lines */
export const pair = (c, { small = true } = {}) => `<span class="cs-line">${defNum(c)} definitions</span><span class="cs-line cs-2nd">${valNum(c)} distinct values</span>${small && hasLists(c) ? `<span class="cs-line cs-bd">${breakdownText(c)}</span>` : ""}`;
/* the pair on one line, for the audit strip */
export const inline = (c) => `${defNum(c)} definitions, ${valNum(c)} distinct values`;

export const state = (T, k) => T.states?.[k] ?? null;
export const fam = (T, k, f) => T.states?.[k]?.[f] ?? null;

/* "How many tokens": rows by family, three states plus the org */
export function countsTable(T) {
  const S = T.states, cell = (st, f) => { const v = st?.[f]; return v == null ? `<span class="hv-dash">-</span>` : nf(v); };
  const orgC = T.org.colors, orgDistinct = new Set(orgC.map((o) => o.light + "|" + o.dark)).size;
  const colorCell = (c, cls = "", label = "") => (c ? `<div class="cs-cell ${cls}">${pair(c)}${label ? `<span class="cs-line cs-bd">${label}</span>` : ""}</div>` : `<span class="hv-dash">-</span>`);
  const rows = [
    ["Colors", "definitions and distinct values, always together", colorCell(S.dev.colors), colorCell(S.review?.colors), (S.target?.colors ? colorCell(S.target.colors, "is-target", "next proposed step") : `<div class="cs-cell"><span class="cs-line"><b>To be decided</b></span><span class="cs-line cs-bd">The remaining definitions are in direct use or would shift a value.</span></div>`), `<div class="cs-cell"><span class="cs-line"><b>${nf(orgC.length)}</b> definitions</span><span class="cs-line cs-2nd"><b>${nf(orgDistinct)}</b> distinct values</span></div>`],
    ...[["Text styles", "textStyles", "one family, a handful of sizes", T.org.textStyles.length], ["Font sizes", "fontSizes", "distinct px across the text styles", T.org.fontSizes.length], ["Corner radii", "radii", "defined values; sidebar exception radii are intentionally kept", T.org.radii.length], ["Spacing steps", "spacing", "distinct values in use; snapping them is a separate, optional step", T.org.spacing.length]]
      .map(([n, f, note, org]) => [n, note, cell(S.dev, f), cell(S.review, f), S.target?.[f] == null ? `<span class="hv-dash">${f === "radii" ? "-" : "not set"}</span>` : `<b class="is-new">${nf(S.target[f])}</b>`, nf(org)]),
  ];
  return `<div class="e-scroll"><table class="hv-table cs-table"><thead><tr><th>Family</th><th>On dev today</th><th>In review</th><th>Target</th><th>Airtime org</th></tr></thead><tbody>${rows.map(([n, note, a, b, c, o]) => `<tr><td>${n}<span>${note}</span></td><td>${a}</td><td>${b}</td><td>${c}</td><td>${o}</td></tr>`).join("")}</tbody></table></div>
  <p class="hv-foot ca-rule">${rule()}</p>
  <p class="hv-foot"><b>On dev today</b> is counted from the app's main development branch. <b>In review</b> is counted from changes that are open and not merged yet; a dash means nothing is open. <b>Target</b> is a proposed step, not a promise; where none is set it reads "to be decided". Long term the goal is about 30 colors; that is a goal, not a committed target. ${T.history?.colors ? `Colors were consolidated from ${nf(T.history.colors.definitions)} definitions and ${nf(T.history.colors.distinct)} distinct values to ${nf(S.dev.colors.definitions)} and ${nf(S.dev.colors.distinct)}. ` : ""}Last updated from the app on ${esc(fmtDate(S.updated))}.</p>`;
}
export function fmtDate(iso) { const d = new Date(iso + "T12:00:00"); return isNaN(d) ? iso : d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" }); }

/* the hero chip */
export function colorChip(T) {
  const c = T.states.dev.colors, t = T.states.target?.colors;
  const atTarget = t && t.definitions === c.definitions && t.distinct === c.distinct;
  return `<span class="cs-chip">${pair(c, { small: false })}${t ? `<small class="cs-line">${atTarget ? "at its target" : `next proposed step ${nf(t.definitions)} definitions`}</small>` : ""}</span>`;
}
/* the today / proposed pair for the audit strip and the consolidation section */
export function todayProposed(T) {
  const a = T.states.dev.colors, b = T.states.target?.colors;
  const box = (label, c, cls) => `<div class="cs-box ${cls}"><em>${label}</em>${pair(c)}</div>`;
  const same = b && b.definitions === a.definitions && b.distinct === a.distinct;
  return `<div class="cs-pairs">${box("On dev today", a, "")}${b && !same ? box("Next proposed step", b, "is-target") : ""}</div>`;
}
