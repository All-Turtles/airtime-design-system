/* Color math for the color audit: parsing, compositing, CIEDE2000, families, duplicates and the org match.
   Pure functions, no DOM. The page computes every color statistic from data/tokens.json with these. */

export function parse(s) {
  if (s == null) return null;
  s = String(s).trim();
  let m = s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.%]+))?\s*\)$/);
  if (m) { const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]); return { r: +m[1], g: +m[2], b: +m[3], a }; }
  m = s.match(/^color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.%]+))?\s*\)$/);
  if (m) { const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]); return { r: +m[1] * 255, g: +m[2] * 255, b: +m[3] * 255, a }; }
  m = s.match(/^#([0-9a-f]{3,8})$/i);
  if (m) { let h = m[1]; if (h.length <= 4) h = [...h].map((c) => c + c).join(""); const n = (i) => parseInt(h.slice(i, i + 2), 16); return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 }; }
  if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  return null;
}

/* "#0069D9", "#000000 50%" */
export function hex(v) {
  const c = typeof v === "string" ? parse(v) : v;
  if (!c) return String(v ?? "");
  const h = "#" + [c.r, c.g, c.b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("").toUpperCase();
  return c.a < 0.9995 ? `${h} ${Math.round(c.a * 1000) / 10}%` : h;
}
export const isAlpha = (v) => { const c = parse(v); return !!c && c.a < 0.9995; };
export const over = (fg, bg) => ({ r: fg.r * fg.a + bg.r * (1 - fg.a), g: fg.g * fg.a + bg.g * (1 - fg.a), b: fg.b * fg.a + bg.b * (1 - fg.a), a: 1 });

const lin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
export function lab(c) {
  const r = lin(c.r), g = lin(c.g), b = lin(c.b);
  let x = (0.4124564 * r + 0.3575761 * g + 0.1804375 * b) / 0.95047;
  let y = 0.2126729 * r + 0.7151522 * g + 0.072175 * b;
  let z = (0.0193339 * r + 0.119192 * g + 0.9503041 * b) / 1.08883;
  const f = (t) => (t > 216 / 24389 ? Math.cbrt(t) : ((24389 / 27) * t + 16) / 116);
  x = f(x); y = f(y); z = f(z);
  return { L: 116 * y - 16, a: 500 * (x - y), b: 200 * (y - z) };
}
export function dE00(l1, l2) {
  const rad = Math.PI / 180, deg = 180 / Math.PI;
  const C1 = Math.hypot(l1.a, l1.b), C2 = Math.hypot(l2.a, l2.b), Cb = (C1 + C2) / 2;
  const G = 0.5 * (1 - Math.sqrt(Math.pow(Cb, 7) / (Math.pow(Cb, 7) + Math.pow(25, 7))));
  const a1 = (1 + G) * l1.a, a2 = (1 + G) * l2.a;
  const c1 = Math.hypot(a1, l1.b), c2 = Math.hypot(a2, l2.b);
  let h1 = Math.atan2(l1.b, a1) * deg; if (h1 < 0) h1 += 360;
  let h2 = Math.atan2(l2.b, a2) * deg; if (h2 < 0) h2 += 360;
  const dL = l2.L - l1.L, dC = c2 - c1;
  let dh = 0; if (c1 * c2 !== 0) { dh = h2 - h1; if (dh > 180) dh -= 360; else if (dh < -180) dh += 360; }
  const dH = 2 * Math.sqrt(c1 * c2) * Math.sin((dh * rad) / 2);
  const Lb = (l1.L + l2.L) / 2, Cb2 = (c1 + c2) / 2;
  let hb = h1 + h2; if (c1 * c2 !== 0) { if (Math.abs(h1 - h2) > 180) hb += h1 + h2 < 360 ? 360 : -360; hb /= 2; }
  const T = 1 - 0.17 * Math.cos((hb - 30) * rad) + 0.24 * Math.cos(2 * hb * rad) + 0.32 * Math.cos((3 * hb + 6) * rad) - 0.2 * Math.cos((4 * hb - 63) * rad);
  const dth = 30 * Math.exp(-Math.pow((hb - 275) / 25, 2));
  const Rc = 2 * Math.sqrt(Math.pow(Cb2, 7) / (Math.pow(Cb2, 7) + Math.pow(25, 7)));
  const Sl = 1 + (0.015 * Math.pow(Lb - 50, 2)) / Math.sqrt(20 + Math.pow(Lb - 50, 2));
  const Sc = 1 + 0.045 * Cb2, Sh = 1 + 0.015 * Cb2 * T;
  const Rt = -Math.sin(2 * dth * rad) * Rc;
  return Math.sqrt(Math.pow(dL / Sl, 2) + Math.pow(dC / Sc, 2) + Math.pow(dH / Sh, 2) + Rt * (dC / Sc) * (dH / Sh));
}
export const dE = (c1, c2) => dE00(lab(c1), lab(c2));

/* Translucent colors are judged over the two grounds each theme really sits on. */
const BACKDROPS = {
  light: [{ r: 255, g: 255, b: 255, a: 1 }, { r: 233, g: 233, b: 236, a: 1 }],
  dark: [{ r: 30, g: 30, b: 32, a: 1 }, { r: 19, g: 19, b: 21, a: 1 }],
};
const cache = new Map();
const P = (s) => { let c = cache.get(s); if (!c) { c = parse(s); cache.set(s, c); } return c; };

/* Largest deltaE2000 between two light/dark pairs, over both themes and both grounds. */
export function pairDistance(a, b) {
  let m = 0;
  for (const th of ["light", "dark"]) for (const bd of BACKDROPS[th]) m = Math.max(m, dE(over(P(a[th]), bd), over(P(b[th]), bd)));
  return m;
}
export const pairKey = (t) => `${t.light}|${t.dark}`;

/* Canonical form of a value, so "rgba(0, 0, 0, 0.1)" and "color(srgb 0 0 0 / 0.1)" compare equal. */
export function norm(s) {
  const c = P(s); if (!c) return String(s);
  return `${Math.round(c.r)},${Math.round(c.g)},${Math.round(c.b)},${Math.round(c.a * 1000) / 1000}`;
}
export const valueKey = (t) => `${norm(t.light)}|${norm(t.dark)}`;

/* Hue family of one color: neutral (low chroma) or by hue angle. */
export function familyOf(v) {
  const c = P(v); if (!c) return "neutral";
  const l = lab(c), ch = Math.hypot(l.a, l.b);
  if (ch < 8) return "neutral";
  let h = (Math.atan2(l.b, l.a) * 180) / Math.PI; if (h < 0) h += 360;
  if (h < 50 || h >= 340) return "red";
  if (h < 80) return "orange";
  if (h < 112) return "yellow";
  if (h < 168) return "green";
  if (h < 215) return "teal";
  if (h < 290) return "blue";
  return "purple";
}
export const tokenFamily = (t) => { const a = familyOf(t.light), b = familyOf(t.dark); return a !== "neutral" ? a : b; };

/* Org match: class per Creator token against the org color list. */
export const ORG_CLASS = { exact: "EXACT", near: "NEAR", role: "ROLE-ONLY", none: "NONE" };
export function orgMatch(t, orgList, roleOrg, { exact = 0.5, near = 5 } = {}) {
  let best = null, bestRole = null;
  const roles = roleOrg[t.role] ?? [];
  for (const o of orgList) {
    const d = pairDistance(t, o);
    if (!best || d < best.d) best = { o, d };
    if (roles.includes(o.role) && (!bestRole || d < bestRole.d)) bestRole = { o, d };
  }
  if (best.d <= exact) return { cls: "exact", org: best.o.name, d: best.d };
  if (best.d <= near) return { cls: "near", org: best.o.name, d: best.d };
  if (bestRole) return { cls: "role", org: bestRole.o.name, d: bestRole.d };
  return { cls: "none", org: best.o.name, d: best.d };
}

/* ---- Consolidation proposal --------------------------------------------------------------
   Computed from the token list plus a small config (data.proposal):
     core    names kept as the chromatic set
     unique  chromatic tokens kept because nothing else covers their role (still to decide)
     folds   [{name, into, note}] recommended merges that change a value a little (shown with deltaE)
     orgAdopt org token names offered as replacements for near Creator neutrals
   Steps, in order of risk:
     1 duplicates: same light and dark value, collapse with no change at all
     2 halves:     a one-value token (a raw swatch or stage glass) equal to one half of a themed token
     3 folds:      the recommended chromatic merges, each with its deltaE
   Nothing here is applied to the app. "Further" lists (near neighbors, org steps) are ranked options. */
const ORG_NAMED = /^(background|content|highlight)\./;
export const isThemeless = (t) => norm(t.light) === norm(t.dark);
const rank = (forced) => (a, b) => (forced.has(b.name) - forced.has(a.name)) || (ORG_NAMED.test(b.name) - ORG_NAMED.test(a.name)) || ((b.kind === "semantic") - (a.kind === "semantic")) || (b.uses - a.uses) || (a.name.length - b.name.length) || a.name.localeCompare(b.name);
const halfDist = (t, c, th) => Math.max(...BACKDROPS[th].map((bd) => dE(over(P(t.light), bd), over(P(c[th]), bd))));
const alphaClass = (t) => (t.role === "line" || t.role === "wash" ? "alpha" : t.role);

export function propose(tokens, cfg = {}, orgList = []) {
  const forced = new Set([...(cfg.core ?? []), ...(cfg.unique ?? [])]);
  const prim = new RegExp(cfg.primitives ?? "^$"), glass = new RegExp(cfg.glass ?? "^$");
  const byName = new Map(tokens.map((t) => [t.name, t]));
  const into = new Map(); // removed name -> {into, kind, d}
  const groups = new Map();
  for (const t of tokens) { const k = valueKey(t); (groups.get(k) ?? groups.set(k, []).get(k)).push(t); }
  const rep = new Map(); // pair key -> canonical token
  for (const [k, l] of groups) { const r = [...l].sort(rank(forced))[0]; rep.set(k, r); for (const t of l) if (t !== r) into.set(t.name, { into: r.name, kind: "duplicate", d: 0 }); }
  const afterDup = [...rep.values()];
  for (const f of cfg.folds ?? []) {
    const t = byName.get(f.name), c = byName.get(f.into);
    if (!t || !c || forced.has(t.name)) continue;
    const r = rep.get(valueKey(t)); if (r !== t) { into.delete(t.name); } // a fold beats the duplicate link
    into.set(t.name, { into: c.name, kind: "fold", d: f.theme ? halfDist(t, c, f.theme) : pairDistance(t, c), note: f.note, theme: f.theme });
  }
  // halves: a one-value token (raw swatch, or stage glass that only shows on dark) equal to one side of a themed token
  const themed = afterDup.filter((t) => !isThemeless(t) && !forced.has(t.name) === !forced.has(t.name) && !into.has(t.name));
  const members = (t) => groups.get(valueKey(t));
  for (const t of afterDup) {
    if (into.has(t.name) || forced.has(t.name) || !isThemeless(t)) continue;
    const m = members(t), themes = m.some((x) => prim.test(x.name)) ? ["light", "dark"] : m.some((x) => glass.test(x.name)) ? ["dark"] : [];
    let best = null;
    for (const c of themed) for (const th of themes) { const d = halfDist(t, c, th); if (d <= 3 && (!best || d < best.d - 1e-9 || (Math.abs(d - best.d) < 1e-9 && ((forced.has(c.name) - forced.has(best.c.name)) || c.uses - best.c.uses) > 0))) best = { c, d, th }; }
    if (best) into.set(t.name, { into: best.c.name, kind: "half", d: best.d, theme: best.th });
  }
  const canonical = tokens.filter((t) => !into.has(t.name));
  const absorbed = new Map();
  for (const [n, m] of into) { let to = m.into; while (into.has(to)) to = into.get(to).into; (absorbed.get(to) ?? absorbed.set(to, []).get(to)).push(n); }
  const steps = { total: tokens.length, distinctPairs: groups.size, afterDuplicates: afterDup.length, recommended: canonical.length };
  // further options (not applied): near neighbors, then org steps
  const removed = new Set(), further = [], cand = [];
  const core = new Set(cfg.core ?? []);
  for (let i = 0; i < canonical.length; i++) for (let j = i + 1; j < canonical.length; j++) {
    const a = canonical[i], b = canonical[j];
    if (core.has(a.name) && core.has(b.name)) continue;
    if (tokenFamily(a) !== tokenFamily(b) || alphaClass(a) !== alphaClass(b)) continue;
    const d = pairDistance(a, b); if (d <= 3) cand.push([d, a, b]);
  }
  cand.sort((x, y) => x[0] - y[0]);
  let left = canonical.length;
  for (const [d, a, b] of cand) {
    if (removed.has(a.name) || removed.has(b.name)) continue;
    const keep = (x) => forced.has(x.name);
    const [from, to] = keep(a) && !keep(b) ? [b, a] : keep(b) && !keep(a) ? [a, b] : a.uses < b.uses || (a.uses === b.uses && a.name.length > b.name.length) ? [a, b] : [b, a];
    removed.add(from.name); left--;
    further.push({ kind: "near", from: from.name, into: to.name, d, uses: from.uses, left });
  }
  steps.afterNear = left;
  const orgBy = new Map(orgList.map((o) => [o.name, o]));
  const adopt = [];
  for (const t of canonical) {
    if (removed.has(t.name) || forced.has(t.name) || tokenFamily(t) !== "neutral") continue;
    let best = null;
    for (const n of cfg.orgAdopt ?? []) { const o = orgBy.get(n); if (!o || !(cfg.roleOrg?.[t.role] ?? []).includes(o.group)) continue; const d = pairDistance(t, o); if (d <= 6 && (!best || d < best.d)) best = { o, d }; }
    if (best) adopt.push([best.d, t, best.o]);
  }
  adopt.sort((x, y) => x[0] - y[0]);
  for (const [d, t, o] of adopt) { removed.add(t.name); left--; further.push({ kind: "org", from: t.name, into: o.name, d, uses: t.uses, left }); }
  steps.afterOrg = left;
  return { into, canonical, absorbed, rep, groups, steps, further };
}
