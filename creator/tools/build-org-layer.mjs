// Builds the ORG LAYER report from data/tokens-index.json (+ audit.json, css/*.css, the org token copy):
//   tokens/org-aliases.json         every Creator token that aliases an org token (var(--org-token))
//   tokens/override-manifest.json   every token that is NOT an alias: value, nearest org token and distance, usage, audit bucket, recommendation
//   data/org-layer.json             both plus per-family summary (read by js/orgrel.js)
// Re-run: node tools/build-org-layer.mjs   (after build-tokens.mjs and audit-join.mjs)
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
import { loadOrg } from "./org.mjs";
const D = (f) => JSON.parse(fs.readFileSync(new URL("../data/" + f, import.meta.url), "utf8"));
const idx = D("tokens-index.json"), audit = fs.existsSync(new URL("../data/audit.json", import.meta.url)) ? D("audit.json") : null;
const org = loadOrg(); const orgAll = (th) => ({ ...org.root, ...org[th] });
// ---- drift check of the org copy
const ORGF = path.resolve(new URL("../..", import.meta.url).pathname, "generated/tokens.css");
const sha = crypto.createHash("sha256").update(fs.readFileSync(ORGF)).digest("hex").slice(0, 16);
const rec = JSON.parse(fs.readFileSync(new URL("../tokens/org/SOURCE.json", import.meta.url), "utf8"));
const drift = sha !== rec.sha256_16; if (drift) console.warn("DRIFT: airtime-design-system/generated/tokens.css changed since tokens/org was synced; run tools/sync-org.mjs");
// ---- colour maths: sRGB -> Lab (D65), CIEDE2000
const parse = (s) => { s = String(s).trim().toLowerCase(); let m;
  if ((m = s.match(/^#([0-9a-f]{3,8})$/))) { let h = m[1]; if (h.length <= 4) h = [...h].map((c) => c + c).join(""); const n = (i) => parseInt(h.slice(i, i + 2), 16); return [n(0), n(2), n(4), h.length === 8 ? n(6) / 255 : 1]; }
  if ((m = s.match(/^rgba?\(([^)]+)\)$/))) { const p = m[1].split(/[ ,\/]+/).filter(Boolean).map(Number); return [p[0], p[1], p[2], p[3] ?? 1]; }
  if ((m = s.match(/^color\(srgb ([^)]+)\)$/))) { const p = m[1].split(/[ \/]+/).map(Number); return [p[0] * 255, p[1] * 255, p[2] * 255, p[3] ?? 1]; }
  return null; };
const over = (c, bg) => [0, 1, 2].map((i) => c[i] * c[3] + bg[i] * (1 - c[3]));
const lab = ([r, g, b]) => { const f = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; }; const [R, G, B] = [f(r), f(g), f(b)];
  const X = (0.4124 * R + 0.3576 * G + 0.1805 * B) / 0.95047, Y = 0.2126 * R + 0.7152 * G + 0.0722 * B, Z = (0.0193 * R + 0.1192 * G + 0.9505 * B) / 1.08883;
  const t = (v) => (v > 0.008856 ? Math.cbrt(v) : 7.787 * v + 16 / 116); return [116 * t(Y) - 16, 500 * (t(X) - t(Y)), 200 * (t(Y) - t(Z))]; };
const dE2000 = (a, b) => { const [L1, a1, b1] = a, [L2, a2, b2] = b, rad = Math.PI / 180;
  const C1 = Math.hypot(a1, b1), C2 = Math.hypot(a2, b2), Cm = (C1 + C2) / 2, G = 0.5 * (1 - Math.sqrt(Cm ** 7 / (Cm ** 7 + 25 ** 7)));
  const ap1 = (1 + G) * a1, ap2 = (1 + G) * a2, Cp1 = Math.hypot(ap1, b1), Cp2 = Math.hypot(ap2, b2);
  const hp = (x, y) => { const h = Math.atan2(y, x) / rad; return h < 0 ? h + 360 : h; }; const h1 = hp(ap1, b1), h2 = hp(ap2, b2);
  const dL = L2 - L1, dC = Cp2 - Cp1; let dh = h2 - h1; if (Cp1 * Cp2 === 0) dh = 0; else if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  const dH = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin((dh * rad) / 2), Lm = (L1 + L2) / 2, Cpm = (Cp1 + Cp2) / 2;
  let hm = h1 + h2; if (Cp1 * Cp2 === 0) hm = h1 + h2; else if (Math.abs(h1 - h2) > 180) hm += h1 + h2 < 360 ? 360 : -360; hm /= 2;
  const T = 1 - 0.17 * Math.cos((hm - 30) * rad) + 0.24 * Math.cos(2 * hm * rad) + 0.32 * Math.cos((3 * hm + 6) * rad) - 0.2 * Math.cos((4 * hm - 63) * rad);
  const dth = 30 * Math.exp(-(((hm - 275) / 25) ** 2)), Rc = 2 * Math.sqrt(Cpm ** 7 / (Cpm ** 7 + 25 ** 7)), Sl = 1 + (0.015 * (Lm - 50) ** 2) / Math.sqrt(20 + (Lm - 50) ** 2), Sc = 1 + 0.045 * Cpm, Sh = 1 + 0.015 * Cpm * T, Rt = -Math.sin(2 * dth * rad) * Rc;
  return Math.sqrt((dL / Sl) ** 2 + (dC / Sc) ** 2 + (dH / Sh) ** 2 + Rt * (dC / Sc) * (dH / Sh)); };
const hex2 = (c) => "#" + [0, 1, 2].map((i) => Math.round(c[i]).toString(16).padStart(2, "0")).join("").toUpperCase() + (c[3] < 0.995 ? Math.round(c[3] * 255).toString(16).padStart(2, "0").toUpperCase() : "");
// ---- pools of org tokens
const num = (v) => { const m = String(v).match(/^(-?[\d.]+)(px|ms|s|rem)?$/); if (!m) return null; let n = parseFloat(m[1]); if (m[2] === "rem") n *= 16; if (m[2] === "s") n *= 1000; return n; };
const POOL = { radii: ["--radius-"], spacing: ["--space-"], sizes: ["--size-", "--space-"], "font-sizes": ["--font-size-"], "font-weights": ["--font-weight-"], durations: ["--duration-"], blurs: ["--blur-"], "border-widths": ["--border-width-"], "z-index": ["--z-"], opacity: ["--opacity-"] };
const poolOf = (prefixes) => Object.entries(org.root).filter(([k, v]) => prefixes.some((p) => k.startsWith(p)) && num(v) != null && !/^--font-size-.*-(?:\w+)$/.test(k) || false).map(([k, v]) => [k, num(v), v]);
const fsPool = Object.entries(org.root).filter(([k]) => k.startsWith("--font-size-") && !/^--font-size-[a-z-]+$/.test(k) === false && /px$/.test(org.root[k])).map(([k, v]) => [k, num(v), v]);
const ORGCOL = (th) => Object.entries(orgAll(th)).filter(([k, v]) => k.startsWith("--color-") && parse(v)).map(([k, v]) => [k, parse(v)]);
const ORGSHADOW = (th) => Object.entries(orgAll(th)).filter(([k]) => /^--shadow-(small|medium|large)$/.test(k));
const keyLayer = (str) => { const layers = String(str).split(/,(?![^(]*\))/).map((x) => x.trim()).filter((x) => x && !/inset/.test(x)); let best = null; for (const l of layers) { const nums = (l.replace(/rgba?\([^)]*\)|#[0-9a-f]+/gi, "").match(/-?[\d.]+px|\b0\b/g) || []).map(parseFloat); const [, oy = 0, blur = 0, spread = 0] = nums; if (!best || blur > best.blur) best = { oy, blur, spread }; } return best; };
// ---- where used: pattern cards -> tokens (parse js specs for id+css classes, scan css files for var(--cr-*))
const jsDir = new URL("../js/", import.meta.url), cssDir = new URL("../css/", import.meta.url);
const cssText = fs.readdirSync(cssDir).map((f) => fs.readFileSync(new URL(f, cssDir), "utf8")).join("\n");
const rules = [...cssText.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((m) => ({ sel: m[1], vars: [...m[2].matchAll(/var\((--cr-[\w-]+)/g)].map((x) => x[1]) }));
const usedIn = {}; // token -> Set(pattern ids)
for (const f of fs.readdirSync(jsDir)) { const t = fs.readFileSync(new URL(f, jsDir), "utf8");
  for (const m of t.matchAll(/id: "([\w-]+)",[\s\S]*?css: \[([^\]]*)\]/g)) { const id = m[1], classes = [...m[2].matchAll(/"([\w-]+)"/g)].map((x) => x[1]); const res = classes.map((c) => new RegExp(`\\.${c}(?![\\w-])`));
    for (const r of rules) if (res.some((x) => x.test(r.sel))) for (const v of r.vars) (usedIn[v] ??= new Set()).add(id); } }
// derived tokens referencing other tokens count as used where the derived one is used
const byCss = new Map(idx.tokens.map((t) => [t.css, t]));
for (let pass = 0; pass < 3; pass++) for (const t of idx.tokens) if (t.kind === "derived" && usedIn[t.css]) for (const m of String(t.declared.value ?? "").matchAll(/var\((--cr-[\w-]+)/g)) for (const id of usedIn[t.css]) (usedIn[m[1]] ??= new Set()).add(id);
// ---- families
const FAM = (t) => t.category === "colors" ? (/^--cr-color-(mat|scrim|overlay|surface|header-ground)/.test(t.css) ? "materials" : "color") : ["fonts", "font-sizes", "line-heights", "letter-spacings", "font-weights"].includes(t.category) ? "typography" : ["spacing", "sizes", "aspect-ratios"].includes(t.category) ? "spacing and sizes" : t.category === "radii" ? "radii" : t.category === "shadows" ? "shadows" : ["durations", "easings", "transitions"].includes(t.category) ? "motion" : ["blurs", "gradients"].includes(t.category) ? "materials" : "borders, z-index, opacity";
// ---- per token
const aliases = [], manifest = [];
for (const t of idx.tokens) {
  const fam = FAM(t), au = audit?.tokens?.[t.css];
  if (t.alias) { aliases.push({ token: t.css, org: t.alias, value: t.rendered?.light ?? String(t.declared.value), family: fam, audit: au?.found ? au.light.sub : null }); continue; }
  const L = t.rendered?.light ?? "", Dk = t.rendered?.dark ?? "";
  let near = null;
  if (t.category === "colors") {
    const best = {};
    for (const th of ["light", "dark"]) { const c = parse(th === "light" ? L : Dk); if (!c) continue; const bgc = parse(orgAll(th)["--color-background-primary"]); let b = null;
      for (const [k, oc] of ORGCOL(th).filter(([, o]) => (c[3] < 0.9) === (o[3] < 0.995))) { const d = dE2000(lab(over(c, bgc)), lab(over(oc, bgc))) + Math.abs(c[3] - oc[3]) * 60; if (!b || d < b.d) b = { org: k, d, mine: hex2(c), theirs: hex2(oc), da: +Math.abs(c[3] - oc[3]).toFixed(2) }; }
      if (b) best[th] = b; }
    const pick = best.light && best.dark ? (best.light.d <= best.dark.d ? best.light : best.dark) : best.light ?? best.dark;
    if (pick) near = { org: pick.org, metric: "delta E2000 of the appearance composited over the org window ground (+60 x alpha diff); a token below 0.9 alpha is compared with translucent org tokens only, others with solid ones", unit: "dE", distance: +pick.d.toFixed(1), detail: ["light", "dark"].filter((k) => best[k]).map((k) => `${k}: ${best[k].mine} vs ${best[k].theirs} (${best[k].org.replace("--color-", "")}, dE ${best[k].d.toFixed(1)})`).join("; ") };
  } else if (POOL[t.category]) {
    const mine = num(L); const pool = t.category === "font-sizes" ? fsPool : poolOf(POOL[t.category]);
    if (mine != null) { let b = null; for (const [k, n, raw] of pool) { const d = Math.abs(n - mine); if (!b || d < b.d) b = { k, d, raw }; } if (b) near = { unit: t.category === "durations" ? "ms" : t.category === "font-weights" || t.category === "z-index" || t.category === "opacity" ? "" : "px", org: b.k, metric: /px|rem/.test(L) || ["radii", "spacing", "sizes", "font-sizes", "blurs", "border-widths"].includes(t.category) ? "px diff" : t.category === "durations" ? "ms diff" : "abs diff", distance: +b.d.toFixed(2), detail: `${L} vs ${b.raw}` }; }
  } else if (t.category === "shadows") {
    const mk = keyLayer(L); if (mk) { let b = null; for (const [k, v] of ORGSHADOW("light")) { const ok = keyLayer(v); const d = Math.abs(ok.oy - mk.oy) + Math.abs(ok.blur - mk.blur); if (!b || d < b.d) b = { k, d, ok }; } near = { unit: "px", org: b.k, metric: "|dy| + |dblur| of the largest non-inset layer", distance: b.d, detail: `y ${mk.oy} blur ${mk.blur} vs y ${b.ok.oy} blur ${b.ok.blur}` }; }
  } else if (t.category === "fonts") near = { org: "--font-family-primary", metric: "stack text", distance: null, detail: "same system stack family, different order" };
  else if (t.category === "easings") near = L === "ease-out" || L === "ease-in-out" ? null : { org: "--easing-default", metric: "none: org has ease-out / ease-in / ease-in-out only", distance: null, detail: L };
  const used = usedIn[t.css] ? [...usedIn[t.css]].sort() : [];
  const lit = t.kind === "derived";
  const status = au?.found ? au : null;
  // recommendation (rule-based; see DECISIONS)
  const px = near && /px diff|ms diff/.test(near.metric) ? near.distance : null;
  let rec, why;
  const identity = /accent|danger|focus-ring|selection-|stage-frame|status-live/.test(t.css);
  if (t.status === "chakra-default" && !used.length && !(t.used && (t.used.all || t.used.light || t.used.dark))) { rec = "candidate to delete"; why = "Chakra ladder entry not observed in the ledger or any pattern"; }
  else if (t.category === "colors" && near && near.distance <= 3) { rec = "snap to nearest org token"; why = `dE ${near.distance} to ${near.org}`; }
  else if (px != null && px <= 1 && t.category !== "z-index") { rec = "snap to nearest org token"; why = `${near.distance}${near.metric.startsWith("ms") ? "ms" : "px"} from ${near.org}`; }
  else if (lit && status && status.light.bucket === "4") { rec = "one-off literal: snap or delete"; why = "audit: unmatched in every source"; }
  else if (!used.length && t.used && !(t.used.all || t.used.light || t.used.dark) && t.status === "declared") { rec = "candidate to delete"; why = "not observed in the resting ledger nor in any pattern (verify hover/popup states first)"; }
  else if (!identity && ["materials", "motion"].includes(fam) || (!identity && /state-|edge-|line|shadow-(focus|sm|md|lg|menu|sheet|tooltip)/.test(t.css) && used.length)) { rec = "candidate to upstream"; why = "generic (no product identity), used by shipped patterns, no org equivalent"; }
  else { rec = "keep as creator-only"; why = identity ? "Creator identity (system blue/red, glass, status)" : "redesign value with no org equivalent"; }
  manifest.push({ token: t.css, family: fam, kind: t.kind, status: t.status, light: L || String(t.declared.value ?? ""), dark: Dk || String(t.declared.value ?? ""), orgRole: t.org.relation === "differs" ? { org: t.org.org, note: t.org.note } : null, relation: t.org.relation, nearest: near, usedIn: used, ledgerUsed: t.used, audit: au?.found ? { bucket: au.light.bucket, sub: au.light.sub, src: au.light.src, exclusivity: au.exclusivity, dead: au.light.status === "overridden-everywhere", unusedRule: !au.light.used } : null, oneOffLiteral: !!(lit && status && status.light.bucket === "4"), recommendation: rec, why });
}
// ---- summary
const fams = {}; for (const t of idx.tokens) { const f = FAM(t); const e = (fams[f] ??= { total: 0, aliased: 0, overridden: 0, creatorOnly: 0 }); e.total++; if (t.alias) e.aliased++; else if (t.org.relation === "differs") e.overridden++; else e.creatorOnly++; }
const recs = {}; for (const m of manifest) recs[m.recommendation] = (recs[m.recommendation] || 0) + 1;
const gaps = manifest.filter((m) => m.nearest && m.nearest.distance != null && m.usedIn.length).map((m) => ({ token: m.token, family: m.family, metric: m.nearest.metric, distance: m.nearest.distance, org: m.nearest.org, detail: m.nearest.detail, usedIn: m.usedIn.length })).sort((a, b) => (b.family === "color") - (a.family === "color") || b.distance - a.distance);
const colours = manifest.filter((m) => m.family === "color" || m.family === "materials").filter((m) => m.nearest);
const summary = { total: idx.tokens.length, aliased: aliases.length, overridden: manifest.filter((m) => m.relation === "differs").length, creatorOnly: manifest.filter((m) => m.relation !== "differs").length, families: fams, recommendations: recs, orgTokens: Object.keys(org.root).length + "+" + Object.keys(org.dark).length, colours: { total: idx.tokens.filter((t) => t.category === "colors").length, aliased: aliases.filter((a) => a.family === "color" || a.family === "materials").length, nearestUnder3: colours.filter((m) => m.nearest.distance <= 3).length, medianDeltaE: (() => { const d = colours.map((m) => m.nearest.distance).sort((a, b) => a - b); return d.length ? d[Math.floor(d.length / 2)] : null; })() }, orgSyncSha: rec.sha256_16, drift, generated: new Date().toISOString() };
fs.writeFileSync(new URL("../tokens/org-aliases.json", import.meta.url), JSON.stringify({ description: "Creator tokens whose value equals an airtime-design-system token; declared in tokens.css as var(--org-token).", aliases }, null, 1));
fs.writeFileSync(new URL("../tokens/override-manifest.json", import.meta.url), JSON.stringify({ description: "Creator tokens that are not org aliases: explicit override list with nearest org token, distance, usage and recommendation.", summary, overrides: manifest }, null, 1));
fs.writeFileSync(new URL("../data/org-layer.json", import.meta.url), JSON.stringify({ summary, aliases, overrides: manifest, gaps: gaps.slice(0, 60) }));
console.log(JSON.stringify({ ...summary, families: undefined }, null, 1)); console.log(fams); console.log(recs);
