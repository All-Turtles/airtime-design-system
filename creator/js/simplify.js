import { S, esc } from "./lib.js";
/* Simplification: what the Creator's colour, type, spacing and radius definitions reduce to, snapped to the org scale, with the measured
   change to the rendered app. Data: data/simplification.json (written by docs/creator-sidebar/css-audit/simplify/build-page-data.mjs). */
const nf = (n) => new Intl.NumberFormat().format(n);
const f1 = (n, d = 2) => (n == null || Number.isNaN(n) ? "n/a" : (+n).toFixed(d).replace(/\.?0+$/, ""));
const pc = (n, d = 2) => (n == null ? "n/a" : `${(+n).toFixed(d)}%`);
const swatch = (css) => `<i class="sw" style="background:${esc(css)}"></i>`;
const sw2 = (l, d) => `<span class="swp"><span class="swh checkerbg" style="--bg:#fff">${swatch(l)}</span><span class="swh checkerdark">${swatch(d)}</span></span>`;
const PN = { P0: "Lossless", P1: "Imperceptible", P2r: "Recommended", P2: "+ spacing", P3: "Org-strict" };
const REC = "P2r";

function line(points, { w = 420, h = 170, xl, yl, color = "var(--cr-color-accent-solid)", yMax, marks = [] }) {
  const xs = points.map((p) => p.x), ys = points.map((p) => p.y); const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = 0, y1 = yMax ?? Math.max(...ys) * 1.1;
  const px = (x) => 44 + ((x - x0) / (x1 - x0 || 1)) * (w - 60), py = (y) => h - 30 - ((y - y0) / (y1 - y0 || 1)) * (h - 46);
  const path = points.map((p, i) => `${i ? "L" : "M"}${px(p.x).toFixed(1)},${py(p.y).toFixed(1)}`).join(" ");
  return `<svg viewBox="0 0 ${w} ${h}" width="${w}" height="${h}" role="img" style="max-width:100%"><g font-size="10" fill="var(--cr-color-text-4)">
  <line x1="44" y1="${h - 30}" x2="${w - 16}" y2="${h - 30}" stroke="var(--cr-color-line-strong)"/><line x1="44" y1="16" x2="44" y2="${h - 30}" stroke="var(--cr-color-line-strong)"/>
  ${points.map((p) => `<text x="${px(p.x)}" y="${h - 16}" text-anchor="middle">${p.xl ?? p.x}</text>`).join("")}
  ${[0, 0.5, 1].map((t) => `<text x="38" y="${py(y0 + (y1 - y0) * t) + 3}" text-anchor="end">${Math.round(y0 + (y1 - y0) * t)}</text>`).join("")}
  <text x="${w / 2}" y="${h - 2}" text-anchor="middle">${esc(xl)}</text><text x="10" y="12">${esc(yl)}</text></g>
  <path d="${path}" fill="none" stroke="${color}" stroke-width="2"/>${points.map((p) => `<circle cx="${px(p.x)}" cy="${py(p.y)}" r="3" fill="${color}"><title>${esc(p.t ?? "")}</title></circle>${p.note ? `<text x="${px(p.x) + 5}" y="${py(p.y) - 6}" font-size="9" fill="var(--cr-color-text-3)">${esc(p.note)}</text>` : ""}`).join("")}</svg>`;
}

export async function simplify(root) {
  let D; try { D = await (await fetch("data/simplification.json")).json(); } catch { root.innerHTML = '<section id="simplify"><h2>Simplification</h2><p class="callout">data/simplification.json missing.</p></section>'; return; }
  const { org, before: B, profiles: P, measured: M, curves: C, mappings: MP } = D;
  const rec = P[REC];
const PK = ["P0", "P1", "P2r", "P2", "P3"];
  const cell = (n, o) => `<b>${nf(n)}</b>${o ? ` <span class="muted">${o}</span>` : ""}`;
  const fam = [
    ["Colour tokens (defined)", `${org.colors.tokens} <span class="muted">(${org.colors.themedRoles} themed roles + ${org.colors.modeless} modeless)</span>`, B.colors.tokens, (p) => p.colors.tokensAfter],
    ["Colour tokens (referenced by a rendered rule)", "", B.colors.referenced, (p) => p.colors.referencedAfter],
    ["Text styles", `${org.type.styles}`, B.type.textStyles, (p) => p.textStyles.after],
    ["Font sizes rendered (distinct)", `${org.type.fontSizes}`, B.type.renderedSizes.light, (p) => p.fontSize.after],
    ["Line heights rendered (distinct)", `${org.type.lineHeights}`, P.P0.lineHeight.before, (p) => p.lineHeight.after],
    ["Spacing steps rendered (padding, margin, gap, 2 to 64px)", `${org.spacing.space} <span class="muted">(+${org.spacing.size - org.spacing.space} size steps)</span>`, P.P0.spacing.before, (p) => p.spacing.after],
    ["Radii rendered (distinct px)", `${org.radii}`, P.P0.radius.before, (p) => p.radius.after],
  ];
  const head = `<tr><th>Family</th><th>Org</th><th>Creator today</th>${PK.map((k) => `<th>${PN[k]}${k === REC ? " *" : ""}<div class="muted" style="text-transform:none;letter-spacing:0;font-weight:400">${k}</div></th>`).join("")}</tr>`;
  const t1 = `<table class="spec">${head}${fam.map(([n, o, b, fn]) => `<tr><td>${n}</td><td>${o}</td><td><b>${nf(b)}</b></td>${PK.map((k) => `<td>${P[k] ? `<b>${nf(fn(P[k]))}</b>` : ""}</td>`).join("")}</tr>`).join("")}</table>`;

  const m2 = M.p2r;
  const mrow = (label, f) => `<tr><td>${label}</td>${["p2r", "p2", "p3"].map((k) => `<td>${M[k]?.delta ? f(M[k]) : '<span class="muted">not run</span>'}</td>`).join("")}</tr>`;
  const proof = `<table class="spec" style="max-width:920px"><tr><th>Measured on the built app (${nf(m2?.delta?.elements ?? 0)} elements, ${m2?.delta?.states ?? 0} reproducible states, light + dark)</th><th>${PN.P2r} (P2r)</th><th>${PN.P2} (P2)</th><th>${PN.P3} (P3)</th></tr>
  ${mrow("Colour declarations compared", (m) => nf(m.delta.colors.n))}
  ${mrow("Colour deltaE2000: max / mean", (m) => `${f1(m.delta.colors.max)} / ${f1(m.delta.colors.mean, 3)}`)}
  ${mrow("Colour declarations changed above deltaE 1 / 2 / 5", (m) => `${nf(m.delta.colors.over[">1"])} / ${nf(m.delta.colors.over[">2"])} / ${nf(m.delta.colors.over[">5"])}`)}
  ${mrow("Colour declarations at or under deltaE 2", (m) => pc(m.delta.colors.pctUnder2))}
  ${mrow("Font size: changed / max px", (m) => `${nf(m.delta.type.size.changed)} / ${f1(m.delta.type.size.max)}`)}
  ${mrow("Line height: changed / max px", (m) => `${nf(m.delta.type.lineHeight.changed)} / ${f1(m.delta.type.lineHeight.max)}`)}
  ${mrow("Element box moved more than 0.5 / 1 / 2 px (x or y)", (m) => { const g = m.delta.geo; const c = (k) => Math.max(g.x[k], g.y[k]); return `${nf(c(">0.5"))} / ${nf(c(">1"))} / ${nf(c(">2"))}`; })}
  ${mrow("Element box max shift x / y / w / h (px)", (m) => `${f1(m.delta.geo.x.max)} / ${f1(m.delta.geo.y.max)} / ${f1(m.delta.geo.w.max)} / ${f1(m.delta.geo.h.max)}`)}
  ${mrow("Padding / margin / gap / radius: max px shift", (m) => `${f1(m.delta.geo.pad.max)} / ${f1(m.delta.geo.margin.max)} / ${f1(m.delta.geo.gap.max)} / ${f1(m.delta.geo.radius.max)}`)}
  ${mrow("Wrap or overflow changes", (m) => `${nf(m.delta.wrapChanged)}`)}
  ${mrow("WCAG: text/surface token pairs falling across 3 / 4.5 / 7", (m) => `${m.contrast ? m.contrast.tokenPairs.light.crossAA + m.contrast.tokenPairs.dark.crossAA : "n/a"}`)}
  </table>`;

  const cur = C.colors, cprof = (rows) => rows.map((r) => ({ x: r.T, y: r.tokensAfter, xl: `ΔE ${r.T}`, t: `T ${r.T}, org ${r.orgT}: ${r.tokensAfter} tokens, max ΔE ${r.max}, mean ${r.mean}`, note: r.T === 4 ? "P2r" : r.T === 7 ? "P3" : "" }));
  const curveColors = line(cprof(cur.filter((r) => [0, 2, 3, 4, 5, 7, 10].includes(r.T))), { xl: "colour tolerance T (deltaE2000)", yl: "colour tokens after" });
  const curveRef = line(C.colorTokens.filter((r) => r.orgT === 0 || r.orgT === 5).filter((r) => r.orgT === 0).map((r) => ({ x: r.T, y: r.usedOwn, xl: `ΔE ${r.T}`, t: `${r.usedOwn} referenced` })), { xl: "colour tolerance T (deltaE2000)", yl: "referenced tokens after", color: "#34c759" });
  const scaleBars = (name, label) => { const s = C.scales[name]; return `<div class="cell" style="width:300px"><div class="cap"><b>${label}</b> (${s.distinctBefore} distinct in use, org has ${s.org})</div><table class="spec"><tr><th>tolerance</th><th>steps after</th><th>max px</th><th>values moved</th></tr>${s.series[name === "fontSize" || name === "lineHeight" ? "protect5" : "free"].map((r) => `<tr><td>±${r.t}px</td><td><b>${r.after}</b></td><td>${f1(r.max)}</td><td>${f1(r.movedPct, 1)}%</td></tr>`).join("")}</table></div>`; };

  // colour mapping (P2)
  const roles = {}; for (const c of MP.P2r.colors) (roles[c.role] ||= new Map()).set(c.leader, [...(roles[c.role].get(c.leader) || []), c]);
  const roleName = { inkAlpha: "Neutral alpha ramp (text, washes, hairlines)", text: "Text (opaque)", surface: "Surfaces", glass: "Stage glass (dark in both themes)", material: "Materials", accent: "Accent (system blue)", danger: "Danger and destructive", status: "Status", headerState: "Header hover surfaces", brandOther: "Other" };
  const colorTables = Object.entries(roles).sort((a, b) => b[1].size - a[1].size).map(([role, m]) => `<details ${["inkAlpha", "surface"].includes(role) ? "open" : ""}><summary><b>${roleName[role] || role}</b>: ${[...m.values()].reduce((a, x) => a + x.length, 0)} tokens → ${m.size} representatives</summary>
  <table class="spec"><tr><th>Representative</th><th>Light / dark</th><th>Absorbs (old token, ΔE)</th><th>Org</th></tr>${[...m.entries()].map(([leader, ms]) => { const l = ms.find((x) => x.id === leader) ?? ms[0]; const others = ms.filter((x) => x.id !== leader); return `<tr><td class="src">${esc(leader.slice(6))}</td><td>${sw2(l.leaderLight, l.leaderDark)} <span class="muted mono">${esc(l.leaderLight)} / ${esc(l.leaderDark)}</span></td><td>${others.length ? others.map((o) => `<span class="chip" title="${esc(o.light)} / ${esc(o.dark)}">${esc(o.id.slice(6))} ${f1(o.dE, 1)}</span>`).join(" ") : '<span class="muted">alone</span>'}</td><td>${l.org ? `<span class="org prov-ds">${esc(l.org.slice(2))}</span>` : ""}</td></tr>`; }).join("")}</table></details>`).join("");

  const scaleMap = (k, label, unit = "px", prof = "P2r") => { const s = MP[prof].scales[k]; return `<div class="cell" style="min-width:250px"><div class="cap"><b>${label}</b>: ${s.before} → ${s.after} (${s.org.length} org steps, ${s.creator.length} Creator-only: ${s.creator.join(", ") || "none"})</div><table class="spec"><tr><th>old</th><th>new</th><th>Δ</th><th>declarations</th></tr>${s.rows.filter((r) => r.delta !== 0 || r.n > 3000).map((r) => `<tr><td>${r.from}${unit}</td><td>${r.to}${unit}${r.org ? ' <span class="org prov-ds">org</span>' : ' <span class="org prov-rd">creator</span>'}</td><td>${r.delta > 0 ? "+" : ""}${f1(r.delta)}</td><td>${nf(r.n)}</td></tr>`).join("")}</table></div>`; };

  const tsRows = MP.P2r.textStyles.map((t) => `<tr><td class="src">${esc(t.name)}</td><td class="mono">${esc(Object.values(t.before).slice(0, 3).join(" / "))}</td><td class="mono">${esc(Object.values(t.after).slice(0, 3).join(" / "))}</td><td>${t.changed ? "changed" : ""}</td></tr>`).join("");

  // sidebar parity
  const q = D.qa;
  const stateRows = q?.rows ? q.rows.map((r) => `<tr><td>${r.mode}</td><td>${r.state}</td><td>${r.theme}</td><td>${pc(r.before, 2)}</td>${Object.keys(q.variants).map((v) => `<td>${pc(r.v[v]?.proto, 2)} <span class="muted">(${r.v[v]?.tierA ?? "?"}A, Δpx ${pc(r.v[v]?.diff, 2)})</span></td>`).join("")}</tr>`).join("") : "";

  root.innerHTML = `<section id="simplify"><h2>Simplification: colour, type, spacing and radii toward the org breadth</h2>
  <p class="lede">Experiment on branch <code>${esc(D.branch)}</code> (${esc(D.base)}, never pushed): the Creator's definitions reduced by clustering every colour, type, spacing and radius value the crawled app actually renders, snapping to the nearest org value inside a stated tolerance and merging the rest into a minimal Creator set. The reduced set is applied in the theme layer of the app and <b>measured</b> against the unchanged build: per-declaration deltaE2000 and pixel deltas across ${D.crawl.states} crawled states (light and dark), element boxes, the QA pixel-diff pipeline, and WCAG contrast. Full write-up, mapping and rollout plan: <code>docs/creator-sidebar/css-audit/TOKEN-SIMPLIFICATION.md</code>.</p>
  <div class="callout" style="background:color-mix(in srgb, var(--cr-color-accent-solid) 12%, transparent)">${D.summary}</div>
  <h3>Before and after against the org breadth</h3>
  <p class="lede">Org breadth is what <code>airtime-design-system/generated/tokens.css</code> defines (123 custom properties: ${org.colors.tokens} colours, ${org.type.styles} type styles on ${org.type.fontSizes} sizes and ${org.type.weights} weights, ${org.spacing.space} spacing and ${org.spacing.size} size steps, ${org.radii} radii, ${org.opacity} opacities, ${org.shadows} shadows). Profiles trade breadth against change; * marks the recommended one (P2r = P2 without spacing snapping). Nothing is deleted from the app, unreferenced tokens are counted separately.</p>
  ${t1}
  <div class="legend"><span><b>Lossless (P0)</b> exact duplicates aliased: pixel-identical, 0 differing pixels in all 12 QA renders</span><span><b>Imperceptible (P1)</b> colour \u0394E \u2264 2</span><span><b>Recommended (P2r)</b> colour \u0394E \u2264 4 (ramp rungs \u2264 2.5), radii \u00b11px, type size \u00b11px (max 8%) and line height \u00b11px with the popular sizes pinned, shadow alphas on one ramp, spacing kept</span><span><b>+ spacing (P2)</b> adds spacing \u00b11px</span><span><b>Org-strict (P3)</b> \u0394E \u2264 7, spacing/radii/line height \u00b12px, weight 300 \u2192 400</span></div>
  <h3>Proof: measured change to the rendered app</h3>${proof}
  <p class="lede">Noise floor: two crawls of the unchanged build differ in ${D.noise} elements (timers, hover timing); those elements are excluded from every figure above. Transients such as the 260 ms <code>data-fired</code> flash are excluded and listed in the report.</p>
  <h3>Trade-off curves</h3>
  <div class="cells-flex"><div class="cell"><div class="cap">Colour tokens defined after clustering (predicted from the crawl; deltaE bound by construction)</div>${curveColors}</div><div class="cell"><div class="cap">Colour tokens still referenced by a rendered rule</div>${curveRef}</div></div>
  <div class="cells-flex">${scaleBars("spacing", "Spacing")}${scaleBars("radius", "Radii")}${scaleBars("fontSize", "Font size")}${scaleBars("lineHeight", "Line height")}</div>
  <h3>Sidebar parity (mirror-image bar, PLAN section 17)</h3>
  <p class="lede">Mismatch against the prototype card per QA state, and tier A element mismatches, for each variant: any change in a value the prototype fixes (a 7px radius, a 13px size, a colour off by deltaE 1) counts against parity even when the eye cannot see it. Proposed rule in the report: the sidebar keeps the prototype's exact values as a named exceptions set; the rest of the app takes the simplified scale.</p>
  <table class="spec"><tr><th>mode</th><th>state</th><th>theme</th><th>baseline</th>${q ? Object.keys(q.variants).map((v) => `<th>${esc(q.variants[v])}</th>`).join("") : ""}</tr>${stateRows}</table>
  <h3>Mapping: colours (${PN.P2r}, P2r)</h3><p class="lede">Each representative keeps its value (or takes the org value where marked); every absorbed token now aliases it. Swatches are light then dark, translucent colours over a checker.</p>${colorTables}
  <h3>Mapping: spacing, radii, type</h3><div class="cells-flex">${scaleMap("spacing", "Spacing (optional P2: +-1 px)", "px", "P2")}${scaleMap("radius", "Radius")}${scaleMap("fontSize", "Font size")}${scaleMap("lineHeight", "Line height")}</div>
  <h4>Text styles</h4><table class="spec" style="max-width:760px"><tr><th>Style</th><th>Before (size / line / weight)</th><th>After</th><th></th></tr>${tsRows}</table>
  </section>`;
}
