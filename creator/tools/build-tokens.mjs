// Builds creator/tokens/* from the two extraction passes:
//   DECLARED  data/declared.json       (apps/airtime-creator/src/ui/tokens.ts flattened)
//   RENDERED  data/rendered-vars.json  (every --chakra-* var the live page defines, light + dark, resolved by Chromium)
//   LEDGER    data/ledger.json         (computed values across all visible elements)
// Emits: tokens/*.tokens.json (DTCG), tokens/tokens.css, data/tokens-index.json, data/unmatched.json
import fs from "node:fs"; import path from "node:path";
import { loadOrg } from "./org.mjs";
import { DERIVED, ORG_ROLE, TEXT_ROLE } from "./token-meta.mjs";
const D = (f) => JSON.parse(fs.readFileSync(new URL("../data/" + f, import.meta.url), "utf8"));
const declared = D("declared.json"), rendered = D("rendered-vars.json"), ledger = D("ledger.json");
const org = loadOrg();
const SRC = "/Users/dairien/workspaces/mmhmm-tv-creator-sidebar/apps/airtime-creator/src/ui/tokens.ts";
const srcLines = fs.readFileSync(SRC, "utf8").split("\n");

// ---------- naming ----------
const CAT = { colors: "color", shadows: "shadow", radii: "radius", sizes: "size", spacing: "space", fonts: "font-family", "font-sizes": "font-size", "line-heights": "line-height", "letter-spacings": "letter-spacing", "z-index": "z", blurs: "blur", "border-widths": "border-width", durations: "duration", easings: "easing", "aspect-ratios": "aspect", gradients: "gradient", "font-weights": "font-weight", opacity: "opacity", transitions: "transition" };
const cssName = (chakraVar) => { const m = chakraVar.match(/^--chakra-([a-z-]+?)-(.+)$/); return null; };
function toCr(chakraVar) {
  const rest = chakraVar.replace("--chakra-", "");
  for (const g of Object.keys(CAT).sort((a, b) => b.length - a.length)) if (rest === g || rest.startsWith(g + "-")) return `--cr-${CAT[g]}${rest.length > g.length ? "-" + rest.slice(g.length + 1).replace(/\./g, "-").replace(/\//g, "of") : ""}`;
  return "--cr-" + rest;
}
const px = (v) => v.replace(/(-?[\d.]+)rem/g, (_, n) => `${+(parseFloat(n) * 16).toFixed(3)}px`);
// {colors.a.b} -> var(--cr-color-a-b)
const refMap = { colors: "colors", shadows: "shadows", spacing: "spacing", sizes: "sizes", durations: "durations", easings: "easings", radii: "radii", blurs: "blurs", fonts: "fonts" };
const refToVar = (s) => s.replace(/\{([a-zA-Z]+)\.([^}]+)\}/g, (_, g, p) => `var(${toCr(`--chakra-${refMap[g] === "colors" ? "colors" : refMap[g] ?? g}-${p.replace(/\./g, "-").replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase().replace(/-default$/, "")}`).replace(/-DEFAULT$/, "")})`)
  .replace(/var\(--cr-([a-z-]+?)-(\d+)-(\d+)\)/g, "var(--cr-$1-$2-$3)");
// A path such as spacing.1.5 keeps its dot as a dash: fix numeric-dot refs handled above by replace(/\./g,"-").

function srcLine(exp, p) {
  const start = srcLines.findIndex((l) => l.startsWith(`export const ${exp}`));
  if (start < 0) return null;
  const keys = p.split("."); let i = start; let found = null;
  for (const k of keys) { const re = new RegExp(`^\\s*("?${k.replace(/\./g, "\\.")}"?|${k}):`); const j = srcLines.slice(i, i + 400).findIndex((l) => re.test(l)); if (j < 0) return found ?? start + 1; i += j; found = i + 1; i += 0; }
  return found;
}

// ---------- colour normalisation for matching ----------
function rgba(s) {
  if (!s) return null; s = s.trim().toLowerCase();
  let m;
  if ((m = s.match(/^#([0-9a-f]{3,8})$/))) { let h = m[1]; if (h.length <= 4) h = [...h].map((c) => c + c).join(""); const n = (i) => parseInt(h.slice(i, i + 2), 16); return [n(0), n(2), n(4), h.length === 8 ? +(n(6) / 255).toFixed(3) : 1]; }
  if ((m = s.match(/^rgba?\(([^)]+)\)$/))) { const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p[3] ?? 1].map((x, i) => (i < 3 ? Math.round(x) : +(+x).toFixed(3))); }
  if ((m = s.match(/^color\(srgb ([^)]+)\)$/))) { const p = m[1].split(/[ \/]+/).map(Number); return [Math.round(p[0] * 255), Math.round(p[1] * 255), Math.round(p[2] * 255), +(p[3] ?? 1).toFixed(3)]; }
  return null;
}
const same = (a, b) => { const x = rgba(a), y = rgba(b); if (!x || !y) return a === b; return x.slice(0, 3).every((v, i) => Math.abs(v - y[i]) <= 1) && Math.abs(x[3] - y[3]) <= 0.005; };

// ---------- records ----------
const recs = [];
const wantScale = (r) => ({});
for (const t of declared.tokens) {
  const both = t.value && typeof t.value === "object" && "_light" in t.value;
  const name = toCr(t.var);
  const rl = rendered.light[t.var], rd = rendered.dark[t.var];
  recs.push({
    id: `${CAT[t.group]}.${t.path}`.replace(/\.DEFAULT$/, ""), css: name, chakra: t.var, category: t.group, kind: t.group === "colors" ? (t.semantic ? "semantic" : "primitive") : t.semantic ? "semantic" : "primitive",
    themed: both,
    declared: both ? { light: t.value._light, dark: t.value._dark } : { value: t.value },
    rendered: { light: px(rl.resolved), dark: px(rd.resolved) },
    source: { file: "apps/airtime-creator/src/ui/tokens.ts", line: srcLine(t.export, t.path), export: t.export, path: t.path },
    status: "declared",
  });
}
// Chakra default scale entries the UI actually renders (weights; numeric spacing/size ladders)
const chakraExtra = (group, filter) => Object.keys(rendered.light).filter((n) => n.startsWith(`--chakra-${group}-`) && filter(n.slice(`--chakra-${group}-`.length))).map((n) => n);
const ext = [
  ...chakraExtra("font-weights", (k) => ["normal", "medium", "semibold", "bold"].includes(k)),
  ...chakraExtra("spacing", (k) => /^\d+(\.\d+)?$/.test(k) && parseFloat(k) <= 64),
  ...chakraExtra("sizes", (k) => /^\d+(\.\d+)?$/.test(k) && parseFloat(k) <= 64),
];
for (const n of ext) {
  if (recs.find((r) => r.chakra === n)) continue;
  const group = n.replace("--chakra-", "").match(/^(font-weights|spacing|sizes)/)[1];
  recs.push({ id: `${CAT[group]}.${n.replace(`--chakra-${group}-`, "")}`, css: toCr(n), chakra: n, category: group, kind: "primitive", themed: false, declared: { value: rendered.light[n].raw }, rendered: { light: px(rendered.light[n].resolved), dark: px(rendered.dark[n].resolved) }, source: { file: "@chakra-ui/react default theme (not overridden by tokens.ts)", line: null, export: "defaultThemeConfig", path: n.replace(`--chakra-${group}-`, "") }, status: "chakra-default" });
}
// Derived tokens: literals inside recipes/primitives that the app never named (see token-meta.mjs)
const MM = "/Users/dairien/workspaces/mmhmm-tv-creator-sidebar/";
const resolved = fs.existsSync(new URL("../data/resolved.json", import.meta.url)) ? D("resolved.json") : {};
for (const d of DERIVED) {
  const abs = d.source.file.startsWith("apps/") ? MM + d.source.file : MM + "apps/airtime-creator/src/" + d.source.file;
  const lines = fs.existsSync(abs) ? fs.readFileSync(abs, "utf8").split("\n") : [];
  const line = lines.findIndex((l) => l.includes(d.source.find)) + 1;
  if (!line) console.warn("derived source not found (app source moved on?):", d.id, d.source.file);
  recs.push({ ...d, chakra: null, css: d.css, kind: "derived", status: "derived", themed: false, declared: d.value, rendered: resolved[d.css] ?? null, source: { file: d.source.file.replace(/^\.\.\/teleport/, "../teleport").replace(/^apps\/airtime-creator\/src\//, ""), line: line || null, find: d.source.find } });
}

{ const seen = new Set(); for (const r of recs) { if (seen.has(r.css)) throw new Error("duplicate token " + r.css); seen.add(r.css); } }
// ---------- usage from ledger ----------
const sideVals = (prop) => { const m = {}; for (const k in ledger) for (const [v, r] of Object.entries(ledger[k].app[prop] ?? {})) m[v] = (m[v] || 0) + r.n; return m; };
const themeVals = (theme, props) => { const m = {}; for (const k in ledger) if (k.startsWith(theme)) for (const p of props) for (const [v, r] of Object.entries(ledger[k].app[p] ?? {})) m[v] = (m[v] || 0) + r.n; return m; };
const colorProps = ["color", "backgroundColor", "borderTopColor", "outlineColor"];
const lightC = themeVals("light", colorProps), darkC = themeVals("dark", colorProps);
const lightS = themeVals("light", ["boxShadow"]), darkS = themeVals("dark", ["boxShadow"]);
const ops = sideVals("opacity"); const px2 = sideVals("borderRadius"), fsz = sideVals("fontSize"), fw = sideVals("fontWeight"), dur = sideVals("transitionDuration"), z = sideVals("zIndex"), ls = sideVals("letterSpacing"), lh = sideVals("lineHeight");
const padGap = {}; for (const k in ledger) for (const p of ["gap", "paddingTop", "paddingLeft", "paddingRight", "paddingBottom"]) for (const [v, r] of Object.entries(ledger[k].app[p] ?? {})) for (const part of v.split(" ")) padGap[part] = (padGap[part] || 0) + r.n;
const hw = {}; for (const k in ledger) for (const p of ["height", "width"]) for (const [v, r] of Object.entries(ledger[k].app[p] ?? {})) hw[v] = (hw[v] || 0) + r.n;
const count = (map, test) => Object.entries(map).reduce((a, [v, n]) => a + (test(v) ? n : 0), 0);
const strip0 = (v) => v.replace(/\.0+px/, "px");
for (const r of recs) {
  const v = r.rendered; let u = null;
  if (!v) { r.used = null; continue; }
  const one = (val) => strip0(val);
  if (r.category === "colors") u = { light: count(lightC, (x) => same(x, v.light)), dark: count(darkC, (x) => same(x, v.dark)) };
  else if (r.category === "shadows") u = { light: count(lightS, (x) => x === v.light), dark: count(darkS, (x) => x === v.dark) };
  else if (r.category === "radii") u = { all: count(px2, (x) => x === one(v.light)) };
  else if (r.category === "font-sizes") u = { all: count(fsz, (x) => x === one(v.light)) };
  else if (r.category === "font-weights") u = { all: count(fw, (x) => x === v.light) };
  else if (r.category === "durations") u = { all: count(dur, (x) => x.split(", ").some((y) => y === (+(parseFloat(v.light) / (v.light.endsWith("ms") ? 1000 : 1))).toString() + "s")) };
  else if (r.category === "opacity") u = { all: count(ops, (x) => x === v.light) };
  else if (r.category === "z-index") u = { all: z[v.light] || 0 };
  else if (r.category === "letter-spacings") u = { all: count(ls, (x) => x === v.light) };
  else if (r.category === "spacing") u = { all: padGap[one(v.light)] || 0 };
  else if (r.category === "sizes") u = { all: hw[one(v.light)] || 0 };
  r.used = u;
}

// ---------- org relationship ----------
const orgAll = (theme) => ({ ...org.root, ...org[theme] });
const orgPool = (prefix) => Object.entries(org.root).filter(([k]) => k.startsWith(prefix)).map(([k, v]) => [k, v]);
function relate(r) {
  const R = ORG_ROLE[r.css];
  if (r.kind === "derived") return { relation: "creator-only", note: r.orgNote ?? "A literal in Creator recipes with no org token." };
  const L = r.rendered.light, Dk = r.rendered.dark;
  if (R) {
    if (R.creatorOnly) return { relation: "creator-only", note: R.why };
    const ol = orgAll("light")[R.org], od = orgAll("dark")[R.org];
    const cmpL = R.orgLight ? orgAll("light")[R.orgLight] : ol, cmpD = R.orgDark ? orgAll("dark")[R.orgDark] : od;
    const eq = (a, b) => (r.category === "colors" ? same(a, b) : a === b);
    const eL = cmpL && eq(L, cmpL), eD = cmpD && eq(Dk, cmpD);
    if (eL && eD) return { relation: "same", org: R.org, note: R.why ?? "" };
    return { relation: "differs", org: R.org, note: `${R.why ?? ""} (creator ${L}${L !== Dk ? " / " + Dk : ""}; org ${cmpL ?? "-"}${cmpL !== cmpD ? " / " + cmpD : ""})`.trim() };
  }
  // value pools by category (px / time / weight / family)
  const pools = { radii: "--radius-", "font-sizes": "--font-size-", "font-weights": "--font-weight-", durations: "--duration-", easings: "--easing-", "border-widths": "--border-width-", sizes: "--size-", spacing: "--space-", "z-index": "--z-" };
  const pool = pools[r.category];
  if (pool) {
    const val = strip0(r.rendered.light);
    const norm = (x) => x.replace(/ms$/, "").replace(/^(\d+)px$/, "$1px");
    const hit = orgPool(pool).find(([k, ov]) => k.startsWith(pool) && (ov === val || (ov.endsWith("ms") && val.endsWith("ms") && ov === val) || (ov.endsWith("ms") && val.endsWith("s") && parseFloat(ov) === parseFloat(val) * 1000) || (ov === val.replace(/^(\d+)ms$/, "$1ms"))) );
    if (hit) return { relation: "same", org: hit[0], note: `value ${val} equals org ${hit[0]}` };
    return { relation: "creator-only", note: `no org ${pool.replace(/^--/, "").replace(/-$/, "")} token has value ${val}` };
  }
  return { relation: "creator-only", note: "no counterpart in airtime-design-system tokens" };
}
for (const r of recs) r.org = relate(r);
// ALIAS LAYER: a token whose value equals an org token becomes `var(--org-token)`; the org system is the source of that value.
const orgDefined = new Set([...Object.keys(org.root), ...Object.keys(org.dark), ...Object.keys(org.light)]);
for (const r of recs) r.alias = r.org.relation === "same" && r.org.org && orgDefined.has(r.org.org) && r.kind !== "derived" ? r.org.org : null;

// ---------- write DTCG ----------
const dtcgType = { colors: "color", shadows: "shadow", radii: "dimension", sizes: "dimension", spacing: "dimension", fonts: "fontFamily", "font-sizes": "dimension", "line-heights": "number", "letter-spacings": "dimension", "z-index": "number", blurs: "dimension", "border-widths": "dimension", durations: "duration", easings: "cubicBezier", "aspect-ratios": "string", gradients: "gradient", "font-weights": "fontWeight" };
const FILES = { color: ["colors"], typography: ["fonts", "font-sizes", "line-heights", "letter-spacings", "font-weights"], spacing: ["spacing"], sizing: ["sizes", "aspect-ratios"], radii: ["radii"], borders: ["border-widths"], shadows: ["shadows"], materials: ["blurs", "gradients"], motion: ["durations", "easings"], "z-index": ["z-index"], opacity: ["opacity"] };
fs.mkdirSync(new URL("../tokens/", import.meta.url), { recursive: true });
const outDir = new URL("../tokens/", import.meta.url);
function put(obj, pathArr, leaf) { let o = obj; for (const k of pathArr.slice(0, -1)) o = o[k] ??= {}; o[pathArr.at(-1)] = leaf; }
const isMat = (r) => r.chakra?.startsWith("--chakra-colors-mat-") || r.chakra?.startsWith("--chakra-colors-scrim");
for (const [file, cats] of Object.entries(FILES)) {
  const doc = { $name: `Creator - ${file}`, $description: "Extracted from the rendered Creator app (localhost:3000/creator); see each token's $extensions.creator for source and org relation." };
  for (const r of recs.filter((x) => cats.includes(x.category) && x.kind !== "derived")) {
    const p = r.id.split(".");
    const ext = { creator: { css: r.css, kind: r.kind, status: r.status, source: r.source, rendered: r.rendered, org: r.org, alias: r.alias, used: r.used } };
    if (r.themed) for (const m of ["light", "dark"]) put(doc, [...p, m], { $value: refToVar(px(String(r.declared[m]))), $type: dtcgType[r.category], $extensions: { mode: m, ...ext } });
    else put(doc, p, { $value: refToVar(px(String(r.declared.value))), $type: dtcgType[r.category], $extensions: ext });
  }
  fs.writeFileSync(new URL(`${file}.tokens.json`, outDir), JSON.stringify(doc, null, 2) + "\n");
}
const dd = { $name: "Creator - derived (literals found in recipes and primitives that the app does not name)" };
for (const r of recs.filter((x) => x.kind === "derived")) put(dd, r.id.split("."), { $value: r.themed ? undefined : r.declared.value, ...(r.themed ? { light: { $value: r.declared.light }, dark: { $value: r.declared.dark } } : {}), $type: r.type, $description: r.desc, $extensions: { creator: { css: r.css, source: r.source, org: r.org, status: "derived" } } });
fs.writeFileSync(new URL("derived.tokens.json", outDir), JSON.stringify(dd, null, 2) + "\n");

// ---------- write CSS ----------
const val = (r, m) => (r.alias ? `var(${r.alias})` : refToVar(px(String(r.themed ? r.declared[m] : r.declared.value))));
const prim = recs.filter((r) => r.kind === "primitive");
const sem = recs.filter((r) => r.kind === "semantic" || r.kind === "derived");
const ordered = (list) => list.slice().sort((a, b) => a.category.localeCompare(b.category) || 0);
let css = `/* tokens.css - Creator design system. GENERATED by tools/build-tokens.mjs. Do not edit.
 * Source of truth: the rendered app (localhost:3000/creator) via data/rendered-vars.json, cross-referenced
 * with apps/airtime-creator/src/ui/tokens.ts. Prefix --cr- keeps these apart from airtime-design-system's tokens.
 * ALIAS LAYER: tokens whose value equals an airtime-design-system token are declared as var(--org-token); load tokens/org/tokens.css and
 * tokens/org/org-theme.css (copies of the org system, see tools/sync-org.mjs) BEFORE this file.
 * Themes: [data-theme="light"] (default) and [data-theme="dark"]; any element can set it, so light and dark can sit side by side.
 * Every semantic token is declared inside both theme blocks: a var() alias declared once at :root would resolve there
 * and pin the light value under a dark subtree. */\n\n`;
css += `:root {\n`; let last = "";
for (const r of ordered(prim)) { if (r.category !== last) { css += `\n  /* ${r.category} (primitive) */\n`; last = r.category; } css += `  ${r.css}: ${val(r, "light")};\n`; }
css += `}\n`;
for (const m of ["light", "dark"]) {
  css += `\n${m === "light" ? ':root,\n[data-theme="light"]' : '[data-theme="dark"]'} {\n  color-scheme: ${m};\n`; last = "";
  for (const r of ordered(sem)) { if (r.category !== last) { css += `\n  /* ${r.category} (${r.kind}) */\n`; last = r.category; } css += `  ${r.css}: ${r.alias ? `var(${r.alias})` : r.themed ? refToVar(px(String(r.declared[m]))) : refToVar(px(String(r.declared.value)))};\n`; }
  css += `}\n`;
}
fs.writeFileSync(new URL("tokens.css", outDir), css);

// ---------- text styles ----------
const ts = declared.textStyles.map((t) => {
  const roleOrg = TEXT_ROLE[t.name]; let org_ = { relation: "creator-only", note: "no org text role" };
  if (roleOrg) { const o = (k) => org.root[`--${k}-${roleOrg}`]; const c = t.value; const eq = o("font-size") === c.fontSize && o("line-height") === c.lineHeight && o("font-weight") === String(c.fontWeight); org_ = { relation: eq ? "same" : "differs", org: `--font-size-${roleOrg} ${o("font-size")}/${o("line-height")}/${o("font-weight")}`, note: `creator ${c.fontSize}/${c.lineHeight}/${c.fontWeight}` }; }
  return { ...t, css: `cr-text-${t.name.replace(/\./g, "-")}`, org: org_, source: { file: "apps/airtime-creator/src/ui/tokens.ts", export: "textStyles", line: srcLines.findIndex((l) => l.includes(`"${t.name}":`) || l.startsWith(`  ${t.name}:`)) + 1 } };
});
// ---------- unmatched (literals in the ledger that no token/derived value explains) ----------
const known = { light: new Set(), dark: new Set() };
for (const r of recs) if (r.rendered && r.category === "colors") { known.light.add(r.rendered.light); known.dark.add(r.rendered.dark); }
const unmatched = {};
for (const k in ledger) { const th = k.split("/")[0]; for (const p of ["color", "backgroundColor"]) for (const [v, r] of Object.entries(ledger[k].sidebar[p] ?? {})) { if (v === "rgba(0, 0, 0, 0)") continue; if ([...known[th]].some((x) => same(x, v))) continue; const key = `${th}|${p}|${v}`; unmatched[key] = { theme: th, prop: p, value: v, n: (unmatched[key]?.n ?? 0) + r.n, ex: r.ex, panes: [...(unmatched[key]?.panes ?? []), k] }; } }
// text-style utility classes: the app's textStyles as real CSS, values by reference where a token exists
const kebabP = (k) => k.replace(/([A-Z])/g, "-$1").toLowerCase();
let tcss = "/* text-styles.css - GENERATED by tools/build-tokens.mjs from textStyles in apps/airtime-creator/src/ui/tokens.ts. */\n";
for (const t of ts) tcss += `.${t.css} {\n` + Object.entries(t.value).map(([k, v]) => `  ${kebabP(k)}: ${v};`).join("\n") + "\n}\n";
fs.writeFileSync(new URL("text-styles.css", outDir), tcss);

// ---------- untokenized: rendered values (whole app) that no token explains ----------
const tokVals = (cats, f = (x) => x) => new Set(recs.filter((r) => cats.includes(r.category) && r.rendered).flatMap((r) => [r.rendered.light, r.rendered.dark]).map((x) => strip0(f(x))));
const pxSet = (cats) => new Set([...tokVals(cats)].filter(Boolean));
const timeS = (v) => (v.endsWith("ms") ? (parseFloat(v) / 1000) + "s" : v);
const UNT = {
  fontSize: [pxSet(["font-sizes"]), "font-size"], borderRadius: [pxSet(["radii"]), "radius"], letterSpacing: [pxSet(["letter-spacings"]), "letter-spacing"],
  opacity: [new Set(recs.filter((r) => r.category === "opacity" && r.rendered).map((r) => r.rendered.light).concat(["1", "0"])), "opacity"],
  transitionDuration: [new Set([...tokVals(["durations"])].map(timeS).concat(["0s"])), "duration"], zIndex: [new Set(recs.filter((r) => r.category === "z-index" && r.rendered).map((r) => r.rendered.light).concat(["auto"])), "z-index"],
};
const untok = {};
for (const [prop, [known_, label]] of Object.entries(UNT)) {
  const tally = {};
  for (const k in ledger) for (const [v, r] of Object.entries(ledger[k].app[prop] ?? {})) { for (const part of v.split(", ")) { if (known_.has(part) || known_.has(strip0(part)) || part === "0px" || part === "none") continue; if (prop === "letterSpacing" && part === "normal") continue; const t = (tally[part] ??= { value: part, n: 0, ex: new Set() }); t.n += r.n; r.ex.forEach((e) => t.ex.add(e)); } }
  untok[label] = Object.values(tally).map((t) => ({ ...t, ex: [...t.ex].slice(0, 4) })).sort((a, b) => b.n - a.n);
}
fs.writeFileSync(new URL("../data/untokenized.json", import.meta.url), JSON.stringify(untok, null, 1));
fs.writeFileSync(new URL("../data/unmatched.json", import.meta.url), JSON.stringify(Object.values(unmatched), null, 1));
fs.writeFileSync(new URL("../data/tokens-index.json", import.meta.url), JSON.stringify({ generated: new Date().toISOString(), tokens: recs, textStyles: ts }, null, 1));
const c = {}; for (const r of recs) c[r.category + ":" + r.kind] = (c[r.category + ":" + r.kind] || 0) + 1;
console.log(recs.length, "tokens", ts.length, "text styles", Object.keys(unmatched).length, "unmatched sidebar colours"); console.log(c);
const rel = {}; for (const r of recs) rel[r.org.relation] = (rel[r.org.relation] || 0) + 1; console.log(rel);
