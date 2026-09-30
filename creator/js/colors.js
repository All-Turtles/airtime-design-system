import { esc } from "./lib.js";
import * as K from "./color.js";

/* The color audit. Everything here is computed at load from data/tokens.json:
   color tokens, the org color list, the proposal settings. No count or flag is typed by hand. */
const nf = (n) => new Intl.NumberFormat().format(n);
const d1 = (n) => n.toFixed(n < 10 ? 2 : 1);

export function analyze(T) {
  const colors = T.tokens.filter((t) => t.cat === "colors");
  const orgList = T.org.colors.map((o) => ({ ...o, role: o.group }));
  const P = K.propose(colors, T.proposal, orgList);
  const finalOf = (n) => { let x = n; while (P.into.has(x)) x = P.into.get(x).into; return x; };
  const byName = new Map(colors.map((t) => [t.name, t]));
  for (const t of colors) {
    t.family = K.tokenFamily(t);
    t.alpha = K.isAlpha(t.light) || K.isAlpha(t.dark);
    t.match = K.orgMatch(t, orgList, T.roleOrg);
  }
  const pairs = [...P.groups.values()].map((list) => {
    const rep = P.rep.get(K.valueKey(list[0]));
    const tokens = [rep, ...list.filter((t) => t !== rep).sort((a, b) => b.uses - a.uses || a.name.localeCompare(b.name))];
    return { key: K.valueKey(rep), rep, tokens, light: rep.light, dark: rep.dark, family: rep.family, role: rep.role, near: [] };
  });
  for (let i = 0; i < pairs.length; i++) for (let j = i + 1; j < pairs.length; j++) {
    const d = K.pairDistance(pairs[i], pairs[j]);
    if (d <= 3) { pairs[i].near.push({ pair: pairs[j], d }); pairs[j].near.push({ pair: pairs[i], d }); }
  }
  pairs.forEach((p) => p.near.sort((a, b) => a.d - b.d));
  const cls = { exact: 0, near: 0, role: 0, none: 0 };
  colors.forEach((t) => cls[t.match.cls]++);
  const chromatic = colors.filter((t) => t.family !== "neutral");
  const fam = (f) => { const l = colors.filter((t) => f.includes(t.family)); return { names: l.length, values: new Set(l.map(K.valueKey)).size }; };
  const nearPairs = pairs.reduce((n, p) => n + p.near.length, 0) / 2;
  const stats = {
    total: colors.length,
    distinct: pairs.length,
    duplicates: colors.length - pairs.length,
    dupGroups: pairs.filter((p) => p.tokens.length > 1).length,
    chromatic: chromatic.length,
    chromaticValues: new Set(chromatic.map(K.valueKey)).size,
    neutral: colors.length - chromatic.length,
    neutralValues: pairs.filter((p) => p.family === "neutral").length,
    alpha: colors.filter((t) => t.alpha).length,
    glass: colors.filter((t) => t.role === "material" || t.role === "stage").length,
    unused: colors.filter((t) => !t.uses).length,
    nearPairs, cls, org: T.org.colors.length,
    red: fam(["red", "orange"]), blue: fam(["blue"]), green: fam(["green"]), teal: fam(["teal"]), yellow: fam(["yellow"]),
    recommended: P.steps.recommended,
    coreChromatic: (T.proposal.core ?? []).length, uniqueChromatic: (T.proposal.unique ?? []).length,
    recommendedChromatic: P.canonical.filter((t) => t.family !== "neutral").length,
    recommendedNeutral: P.canonical.filter((t) => t.family === "neutral").length,
  };
  return { colors, orgList, P, pairs, stats, finalOf, byName, T };
}

/* ---- small renderers ---- */
const half = (th, v) => `<span class="hs-half is-${th}" data-theme="${th}" style="--c:${esc(v)}"></span>`;
const pairSw = (p) => `<div class="hs-pair ca-pair">${half("light", p.light)}${half("dark", p.dark)}</div>`;
const inlineSw = (v) => `<i class="e-sw ca-sw" style="--c:${esc(v)}"></i>`;
const hx = (v) => K.hex(v);
const FAM = { red: "Red", orange: "Orange", blue: "Blue", green: "Green", teal: "Teal", yellow: "Yellow", purple: "Purple", neutral: "Neutral" };
const ORG_LABEL = { exact: "EXACT", near: "NEAR", role: "ROLE-ONLY", none: "NONE" };
const orgChip = (m) => `<span class="ca-chip is-org-${m.cls}" title="Closest org token: ${esc(m.org)}">ORG ${ORG_LABEL[m.cls]}${m.cls === "exact" || m.cls === "none" ? "" : m.cls === "near" ? ` (dE ${d1(m.d)})` : ` (dE ${d1(m.d)})`} <code>${esc(m.org)}</code></span>`;

function fate(A, t) {
  const m = A.P.into.get(t.name);
  if (!m) { const n = A.P.absorbed.get(t.name)?.length ?? 0; return `<span class="ca-chip is-keep">KEEP${n ? `, absorbs ${n}` : ""}</span>`; }
  const fin = A.finalOf(t.name);
  const how = m.kind === "duplicate" ? "same value" : m.kind === "half" ? `${m.theme} half, dE ${d1(m.d)}` : `dE ${d1(m.d)}${m.theme ? ", " + m.theme + " half" : ""}`;
  return `<span class="ca-chip is-${m.kind}" title="${esc(m.note ?? "")}">${m.kind === "fold" ? "FOLDS INTO" : "MERGES INTO"} <code>${esc(fin)}</code> (${how})</span>`;
}

function tokenLine(A, t, rep) {
  const dup = t !== rep ? `<span class="ca-chip is-dup">DUPLICATE OF <code>${esc(rep.name)}</code></span>` : "";
  return `<li><div class="ca-nm"><b>${esc(t.name)}</b><span class="ca-role">${esc(t.role)}</span><span class="ca-uses">${t.uses ? `${nf(t.uses)} use${t.uses === 1 ? "" : "s"}` : "unused"}</span></div><div class="ca-fl">${dup}${fate(A, t)}</div></li>`;
}
function card(A, p) {
  const near = p.near.slice(0, 3).map((n) => `<span class="ca-chip is-nearby" title="Within deltaE 3 of ${esc(n.pair.rep.name)}">NEAR <code>${esc(n.pair.rep.name)}</code> (dE ${d1(n.d)})</span>`).join("") + (p.near.length > 3 ? `<span class="ca-chip is-nearby">+${p.near.length - 3} more near</span>` : "");
  const same = p.light === p.dark || K.norm(p.light) === K.norm(p.dark);
  const vals = same ? `<code>${esc(hx(p.light))}</code><small>same in light and dark</small>` : `<code>${esc(hx(p.light))}</code><code>${esc(hx(p.dark))}</code>`;
  return `<article class="ca-card${p.tokens.length > 1 ? " has-dup" : ""}">${pairSw(p)}<div class="ca-vals">${vals}</div><ul class="ca-names">${p.tokens.map((t) => tokenLine(A, t, p.rep)).join("")}</ul><div class="ca-fl ca-card-fl">${near}${orgChip(p.rep.match)}</div></article>`;
}

const SECTIONS = [
  { id: "reds", title: "Reds", fam: ["red", "orange"], note: "The proposal is one red: the Creator danger red, rgb(215, 0, 21) in light and rgb(255, 79, 66) in dark, not the org's destructive red. Every distinct red is shown side by side." },
  { id: "blues", title: "Blues", fam: ["blue"], note: "The system blue. Most of these are the same blue in a different role name." },
  { id: "greens", title: "Greens", fam: ["green"], note: "Status: live." },
  { id: "teal-yellow", title: "Teal and yellow", fam: ["teal", "yellow", "purple"], note: "One-off brand colors." },
];
const NEUTRAL_ROLES = [
  ["ground", "Grounds", "Window, panel and raised surfaces, plus the raw light and dark ground swatches behind them."],
  ["material", "Materials and glass", "Frosted menus, sheets and the sidebar, plus scrims and overlays."],
  ["ink", "Ink steps", "Text and icon colors, stepped down in strength, plus the raw ink swatches."],
  ["line", "Lines", "Hairlines and borders."],
  ["wash", "Washes", "Hover and selected fills and the sunken wells."],
  ["stage", "Stage and wireframe", "Stage glass (dark in both themes), the empty stage, and the wireframe gray steps."],
];

export function colorBlocks(A) {
  const roleRank = (p) => p.tokens.reduce((n, t) => n + t.uses, 0);
  const sorted = (l) => [...l].sort((a, b) => roleRank(b) - roleRank(a));
  const block = (id, title, note, list) => `<div class="ca-group" id="ca-${id}"><h3>${esc(title)} <small>${list.reduce((n, p) => n + p.tokens.length, 0)} tokens, ${list.length} distinct values</small></h3><p class="hv-sub">${note}</p><div class="ca-grid">${sorted(list).map((p) => card(A, p)).join("")}</div></div>`;
  const chro = SECTIONS.map((s) => block(s.id, s.title, s.note, A.pairs.filter((p) => s.fam.includes(p.family)))).join("");
  const neu = NEUTRAL_ROLES.map(([r, t, n]) => block("n-" + r, "Neutrals: " + t, n, A.pairs.filter((p) => p.family === "neutral" && p.role === r))).join("");
  return chro + neu;
}

/* ---- summary strip and explanation ---- */
export function summary(A) {
  const s = A.stats, c = s.cls;
  const chips = [
    [s.total, "color tokens"], [s.distinct, "distinct values"], [s.duplicates, "pure duplicates"],
    [`${s.chromatic} / ${s.neutral}`, "chromatic / neutral"], [s.neutralValues, "distinct neutral values"],
    [c.exact, "exact org matches"], [c.near, "near org (dE 5 or less)"], [c.role, "org role only"], [c.none, "no org match"],
    [s.recommended, "recommended set (target)"],
  ];
  return `<div class="hv-chips ca-strip">${chips.map(([n, l]) => `<span><b>${typeof n === "number" ? nf(n) : n}</b> ${l}</span>`).join("")}</div>`;
}
export function whyMore(A) {
  const s = A.stats;
  return `<div class="ca-why"><h3>Why Creator has more colors than the org</h3><ul>
  <li><b>Translucent ink and washes.</b> ${s.alpha} of ${s.total} colors are see-through (black or white at some strength), so one token reads correctly in light and dark on any ground. The org system uses opaque text steps and two highlights instead.</li>
  <li><b>Frosted glass.</b> ${s.glass} colors are materials, scrims and stage glass for the sidebar, menus and the stage overlay. The org has no material or glass colors.</li>
  <li><b>A blue accent.</b> ${s.blue.names} names for the system blue (${s.blue.values} distinct light and dark values). The org accent is teal and its destructive red is a different red.</li>
  <li><b>Leftover duplicates.</b> ${s.duplicates} tokens repeat another token's exact light and dark values: old names that were never merged, raw swatches, and aliases.</li></ul>
  <p class="hv-foot">Only ${s.cls.exact} of ${s.total} colors match an org color exactly, and ${s.cls.none} have no org color in their role at all. The org has ${s.org} colors (${T_len(A, "themed")} themed, ${T_len(A, "modeless")} theme-independent).</p></div>`;
}
const T_len = (A, kind) => A.T.org.colors.filter((o) => (kind === "modeless") === (o.group === "modeless")).length;

/* ---- proposal ---- */
function absorbChips(A, name) {
  return (A.P.absorbed.get(name) ?? []).map((n) => { const m = A.P.into.get(n), t = A.byName.get(n); return `<span class="ca-chip is-${m.kind}" title="${m.kind}${m.note ? ": " + esc(m.note) : ""}"><code>${esc(n)}</code>${m.d > 0.005 ? ` dE ${d1(m.d)}` : ""}</span>`; }).join(" ");
}
export function consolidation(A, { eng = false } = {}) {
  const s = A.stats, st = A.P.steps, F = A.P.further;
  const nearList = F.filter((f) => f.kind === "near"), orgList = F.filter((f) => f.kind === "org");
  const nDup = st.total - st.afterDuplicates, nFold = [...A.P.into.values()].filter((m) => m.kind === "fold").length, nHalf = [...A.P.into.values()].filter((m) => m.kind === "half").length;
  const steps = [
    ["Today", st.total, "every color token in the app"],
    ["Merge pure duplicates", st.afterDuplicates, `${nDup} tokens have exactly the same light and dark values as another; no pixel changes`],
    ["Inline raw swatches and stage glass", st.afterDuplicates - nHalf, `${nHalf} one-value tokens equal one half of a themed token (for example the raw blue is the light half of the accent)`],
    ["Fold to one red (recommended set)", st.recommended, `${nFold} tokens fold into the Creator danger red; this is the target. ${s.recommendedChromatic} chromatic (${s.coreChromatic} core plus ${s.uniqueChromatic} one-offs to decide) and ${s.recommendedNeutral} neutral`],
    ["Option: merge near neighbors (dE 3 or less)", st.afterNear, `${nearList.length} more, ranked below. Not applied`],
    ["Option: adopt the org's content and highlight steps", st.afterOrg, `${orgList.length} more, ranked below. Not applied`],
  ];
  const stepTbl = `<div class="e-scroll"><table class="hv-table ca-steps"><thead><tr><th>Step</th><th>Tokens left</th><th>What changes</th></tr></thead><tbody>${steps.map(([a, n, w], i) => `<tr class="${i === 3 ? "is-target" : i > 3 ? "is-option" : ""}"><td>${a}</td><td>${nf(n)}</td><td>${w}</td></tr>`).join("")}</tbody></table></div>`;
  const canon = (list) => `<div class="e-scroll"><table class="e-table ca-canon"><thead><tr><th>Keep</th><th>Light</th><th>Dark</th><th>Uses</th><th>Collapses into it</th></tr></thead><tbody>${list.map((t) => `<tr><td><b>${esc(t.name)}</b><span class="e-k">${esc(t.role)}</span></td><td>${inlineSw(t.light)}<span class="mono">${esc(hx(t.light))}</span></td><td>${K.norm(t.light) === K.norm(t.dark) ? '<span class="e-k">same</span>' : inlineSw(t.dark) + `<span class="mono">${esc(hx(t.dark))}</span>`}</td><td class="num">${t.uses}</td><td>${absorbChips(A, t.name) || '<span class="e-k">nothing</span>'}</td></tr>`).join("")}</tbody></table></div>`;
  const chro = A.P.canonical.filter((t) => t.family !== "neutral");
  const rank = (list, label) => `<div class="e-scroll"><table class="e-table ca-rank"><thead><tr><th>#</th><th>Replace</th><th>With</th><th>dE</th><th>Uses moved</th><th>Tokens left</th></tr></thead><tbody>${list.map((f, i) => `<tr><td class="num">${i + 1}</td><td><code>${esc(f.from)}</code></td><td>${f.kind === "org" ? `org <code>${esc(f.into)}</code>` : `<code>${esc(f.into)}</code>`}</td><td class="num">${d1(f.d)}</td><td class="num">${f.uses}</td><td class="num">${f.left}</td></tr>`).join("")}</tbody></table></div>`;
  const method = eng ? `<p class="hv-foot">Method: deltaE2000 over the two grounds of each theme, worst case of the four. Translucent colors are composited first. NEAR means 3 or less between Creator tokens, and 5 or less against the org. EXACT means 0.5 or less. The recommendation is computed from the <code>proposal</code> block in <code>data/tokens.json</code> (core set, one-offs, folds, org steps), so it regenerates when that block changes.</p>` : "";
  return `<h3>From ${nf(st.total)} to ${nf(st.recommended)}</h3><p class="hv-sub">The recommendation is the target. The two options below it are ranked ways to go further; nothing here is applied to the app.</p>${stepTbl}
  <h3>Recommended chromatic set</h3><p class="hv-sub">${s.coreChromatic} core colors (system blue and the Creator danger red, each with hover, subtle and muted) plus ${s.uniqueChromatic} one-offs that no other token covers. Everything else red or blue collapses into these.</p>${canon(chro)}
  <h3>Recommended neutral set</h3><p class="hv-sub">${s.recommendedNeutral} neutrals stay. Each row lists the tokens that collapse into it.</p>${canon(A.P.canonical.filter((t) => t.family === "neutral"))}
  <h3>Option: ranked near merges</h3><p class="hv-sub">Pairs of neutrals within deltaE 3 of each other, cheapest first. The token with fewer uses is the one replaced.</p>${rank(nearList)}
  <h3>Option: adopt the org's content and highlight steps</h3><p class="hv-sub">Creator neutrals within deltaE 6 of one of the org's three content steps or two highlights, closest first.</p>${rank(orgList)}${method}`;
}

/* ---- Engineering: the full table ---- */
export function fullTable(A) {
  const order = [["Reds", (p) => ["red", "orange"].includes(p.family)], ["Blues", (p) => p.family === "blue"], ["Greens", (p) => p.family === "green"], ["Teal, yellow and other", (p) => ["teal", "yellow", "purple"].includes(p.family)], ...NEUTRAL_ROLES.map(([r, t]) => ["Neutrals: " + t, (p) => p.family === "neutral" && p.role === r])];
  const rows = [];
  for (const [title, f] of order) {
    const ps = A.pairs.filter(f); if (!ps.length) continue;
    rows.push(`<tr class="ca-grp"><th colspan="9">${esc(title)} <small>${ps.reduce((n, p) => n + p.tokens.length, 0)} tokens, ${ps.length} distinct values</small></th></tr>`);
    for (const p of ps.sort((a, b) => b.tokens.reduce((n, t) => n + t.uses, 0) - a.tokens.reduce((n, t) => n + t.uses, 0))) {
      const nr = p.near.slice(0, 3).map((n) => `<span class="ca-chip is-nearby">NEAR <code>${esc(n.pair.rep.name)}</code> ${d1(n.d)}</span>`).join("") + (p.near.length > 3 ? `<span class="ca-chip is-nearby">+${p.near.length - 3}</span>` : "");
      for (const t of p.tokens) {
        const dup = t !== p.rep ? `<span class="ca-chip is-dup">DUPLICATE OF <code>${esc(p.rep.name)}</code></span>` : "";
        const resolved = `${esc(hx(t.light))}${t.light === t.dark ? "" : " / " + esc(hx(t.dark))}`;
        rows.push(`<tr><td><b>${esc(t.name)}</b><span class="e-k">${esc(t.kind)}, ${esc(t.css)}</span></td><td>${esc(t.role)}<span class="e-k">${esc(FAM[t.family])}${t.alpha ? ", translucent" : ""}</span></td><td>${inlineSw(t.light)}<span class="mono">${esc(t.light)}</span></td><td>${t.light === t.dark ? '<span class="e-k">same</span>' : inlineSw(t.dark) + `<span class="mono">${esc(t.dark)}</span>`}</td><td class="mono">${resolved}</td><td class="num">${t.uses}</td><td>${dup}${t === p.rep ? nr : ""}</td><td>${orgChip(t.match)}</td><td>${fate(A, t)}</td></tr>`);
      }
    }
  }
  return `<div class="e-scroll"><table class="e-table ca-full"><thead><tr><th>Token</th><th>Role</th><th>Light</th><th>Dark</th><th>Resolved</th><th>Uses</th><th>Flags</th><th>Closest org token</th><th>Proposal</th></tr></thead><tbody>${rows.join("")}</tbody></table></div>`;
}

/* ---- every number on the page, from the same data file ---- */
export function counts(T, A) {
  const tk = (cat) => T.tokens.filter((t) => t.cat === cat);
  const steps = (l) => [...new Set(l.filter((t) => t.used > 0).map((t) => parseFloat(t.light)))].sort((a, b) => a - b);
  const spacing = steps(tk("spacing")), radii = steps(tk("radii"));
  const fontSizes = [...new Set(T.textStyles.map((s) => parseFloat(s.fontSize)))].sort((a, b) => a - b);
  const tg = T.targets ?? {};
  const row = (today, target, org) => ({ today, target: target ?? null, org });
  return {
    spacing, radii, fontSizes,
    rows: {
      colors: row(A.stats.total, A.stats.recommended, T.org.colors.length),
      textStyles: row(T.textStyles.length, tg.textStyles, T.org.textStyles.length),
      fontSizes: row(fontSizes.length, tg.fontSizes, T.org.fontSizes.length),
      radii: row(radii.length, tg.radii, T.org.radii.length),
      spacing: row(spacing.length, tg.spacing, T.org.spacing.length),
    },
    sharedWithOrg: T.tokens.filter((t) => t.org === "same").length,
    tokens: T.tokens.length,
  };
}
