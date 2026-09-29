// Joins the CSS audit (docs/creator-sidebar/css-audit, read only) to the design system: per-token and per-pattern provenance.
// Output: ../data/audit.json  (headline numbers, per-token provenance, per-pattern declaration stats and lists)
import fs from "node:fs"; import zlib from "node:zlib";
const AUD = "/Users/dairien/workspaces/mmhmm-tv-creator-sidebar/docs/creator-sidebar/css-audit/";
const rd = (f) => fs.readFileSync(AUD + f, "utf8");
const tsv = zlib.gunzipSync(fs.readFileSync(AUD + "data/provenance-declarations.tsv.gz")).toString("utf8").split("\n");
const H = tsv[0].split("\t"); const rows = [];
for (let i = 1; i < tsv.length; i++) { if (!tsv[i]) continue; const c = tsv[i].split("\t"); const o = {}; H.forEach((h, j) => (o[h] = c[j] ?? "")); rows.push(o); }
const stats = JSON.parse(rd("data/report-stats.json"));
const report = rd("REPORT.md"), prov = rd("PROVENANCE.md");
const pick = (re, s = report) => { const m = s.match(re); if (!m) throw new Error("audit text changed: " + re); return m; };
// ---- headline (parsed from the audit's own tables so it cannot drift)
const rulesRow = pick(/\| Rules \(dominant bucket\) \| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\|/);
const declRow = pick(/\| Declarations \| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\| ([^|]+)\|/);
const num = (s) => s.trim();
const headline = {
  code: pick(/Code audited: `(\w+)`/)[1].slice(0, 9), generated: pick(/Generated (\S+)\./)[1],
  rules: { total: stats.total, style: stats.style, unused: stats.unused, unusedStyle: stats.styleUnused, unusedPct: pick(/Unused rules[^|]*\| (\d+ of \d+ = [\d.]+%)/)[1] },
  rulesByBucket: { ds: num(rulesRow[1]), redesign: num(rulesRow[2]), r3only: num(rulesRow[3]), legacy: num(rulesRow[4]), unmatched: num(rulesRow[5]), notes: num(rulesRow[6]) },
  declsByBucket: { ds: num(declRow[1]), redesign: num(declRow[2]), r3only: num(declRow[3]), legacy: num(declRow[4]), unmatched: num(declRow[5]), notes: num(declRow[6]) },
  dsExclusive: pick(/DS-exclusive \(matches DS and nothing else\): \*\*(\d+)\*\* \(([\d.]+)%\)\. Matches the DS at all \(alone or shared\): \*\*(\d+)\*\* \(([\d.]+)%\)\. Matches a redesign source but not the DS: \*\*(\d+)\*\* \(([\d.]+)%\)/, prov).slice(1, 7),
  dsPlusExplorations: pick(/\| ds\+expl \| (\d+) \| ([\d.]+)%/, prov).slice(1, 3),
  sidebarAnyMatch: pick(/In the sidebar, ([\d.]+)% of attributable declarations match some redesign source/)[1],
  legacyUnused: pick(/are ([\d.]+)% unused \((\d+)\/(\d+) rules\)/).slice(1, 4),
  neverEffective: { decls: stats.nOver, of: stats.nDeclUsed, fullyOverriddenRules: stats.fullyOver },
  customProps: { defined: stats.cp, unreferenced: stats.cpUnref },
  dupGroups: stats.dupGroups, byConf: stats.byConf, fileRows: stats.fileRows, areas: stats.areas,
  oneOffs: pick(/Bucket 4 one-off literals: (\d+) declarations \(([\d.]+)%\)\.\*\* Top properties: ([^.]*)\. Top files: ([^\n]*)/).slice(1, 5),
  states: pick(/States captured \/ element signatures \/ rules with element-catalog links \| ([^|]+)\|/)[1].trim(),
};
// ---- helpers
const sub = (src, bucket) => { if (bucket === "S") return "structural"; if (bucket === "4") return "unmatched"; if (bucket === "1") return "airtime-design-system"; if (bucket === "3") return /chakra/i.test(src) ? "legacy/other: Chakra default" : "legacy/other"; if (/r3-unified/.test(src)) return "creator-v2: r3"; if (/r2-b-select/.test(src)) return "creator-v2: r2-b"; if (/r2-a-dock|r2-shell/.test(src)) return "creator-v2: r2-a"; if (/\/v2\//.test(src)) return "creator-v2: v2 docs"; if (/hifi\//.test(src)) return "creator-v2: other exploration"; return "creator-v2"; };
const rel = (src) => src.replace("airtime-explorations/prototypes/creator/", "prototypes/creator/");
const famKind = (f) => (f === "ds" ? "exclusive to DS" : /(^|\+)ds(\+|$)/.test(f) ? "shared with prototypes" : f ? "not DS" : "none");
const legacyOrigin = (o) => o === "legacy-teleport" || o === "third-party";
// ---- tokens
const idx = JSON.parse(fs.readFileSync(new URL("../data/tokens-index.json", import.meta.url), "utf8"));
const byProp = new Map(); for (const r of rows) { const k = r.prop; (byProp.get(k) ?? byProp.set(k, []).get(k)).push(r); }
const tokens = {};
const norm = (s) => s.replace(/\s+/g, "").toLowerCase();
for (const t of idx.tokens) {
  let hits = t.chakra ? byProp.get(t.chakra) ?? [] : [];
  if (!hits.length && t.kind === "derived") { // literal inside a recipe/primitive: find the audit declaration that carries it
    const lit = norm(String(t.declared.value ?? "")).replace(/var\(--cr-[\w-]+\)/g, "").split(/[ ,]+/).find((x) => x.length > 5) ?? norm(String(t.declared.value ?? ""));
    const file = (t.source.file ?? "").split("/").pop();
    hits = rows.filter((r) => r.file.includes(file) && (norm(r.value).includes(lit.slice(0, 12)) || norm(r.resolved).includes(lit.slice(0, 12))));
    if (!hits.length) hits = rows.filter((r) => (norm(r.value) === norm(String(t.declared.value)) || norm(r.resolved) === norm(String(t.declared.value))) && r.origin !== "theme-tokens");
  }
  if (!hits.length) { tokens[t.css] = { found: false }; continue; }
  const pickRow = (th) => hits.find((h) => h.theme === th) ?? hits[0];
  const L = pickRow("light"), D = pickRow("dark");
  const b = (r) => ({ bucket: r.bucket, sub: sub(r.matched_src, r.bucket), src: rel(r.matched_src), families: r.families, weak: !!r.weak, status: r.status, used: r.used === "1", origin: r.origin, file: r.file });
  tokens[t.css] = { found: true, light: b(L), dark: b(D), exclusivity: famKind(L.families), declFile: L.file, n: hits.length };
}
// ---- patterns
const C = "apps/airtime-creator/src/creator/", SB = C + "sidebar/", PR = SB + "primitives/";
const PAT = {
  "sb-card": [SB + "Sidebar.tsx", SB + "SidebarBody.tsx"], "sb-pane-header": [PR + "PaneHeader.tsx", PR + "IconToggle.tsx"], "sb-icontoggle": [PR + "IconToggle.tsx"], "sb-labels": [PR + "Section.tsx"], "sb-row": [PR + "Row.tsx"],
  "sb-actions": [PR + "Actions.tsx", PR + "Placeholder.tsx"], "sb-seg": [PR + "Segmented.tsx"], "sb-field": [PR + "SliderRow.tsx", PR + "GeoGrid.tsx", PR + "CommitInput.tsx"], "sb-dropdown": [PR + "Dropdown.tsx"], "sb-colorwell": [PR + "ColorWellRow.tsx"],
  "sb-swatches": [PR + "Swatches.tsx", PR + "BackgroundGrid.tsx"], "sb-thumbrow": [PR + "ThumbRow.tsx", PR + "ThumbFrame.tsx", PR + "TransparencyChecker.tsx"], "sb-icons": [C + "LegacyIcon.tsx", SB + "icons.tsx"], "sb-popup": [PR + "popupPlacement.ts"], "sb-placeholder": [PR + "Placeholder.tsx"], "sb-slider": [PR + "SliderRow.tsx"],
  "hd-topbar": [C + "TopBar.tsx"], "hd-title": [C + "PresentationTitle.tsx"], "hd-mode": [C + "ModeSwitch.tsx"], "hd-iconbtn": [C + "UndoRedo.tsx", SB + "SidebarToggle.tsx"], "hd-avatar": [C + "AccountMenu.tsx"], "hd-record": [C + "RecordingControls.tsx"], "hd-insert": [C + "InsertBar.tsx"], "hd-split": [C + "DeviceSplit.tsx"], "hd-status": [C + "RecordingStatus.tsx"],
  "tr-tray": [C + "TrayArea.tsx", C + "TrayConsole.tsx"], "tr-buttons": [C + "TrayConsole.tsx"], "tr-tile": [C + "SlideThumbnail.tsx", C + "TrayArea.tsx"],
  "st-pill": [C + "PresenterSelectionControls.tsx"], "st-popover": [C + "StageControlPopover.tsx", C + "StageSliderField.tsx"], "st-overlay": ["teleport/stage/objects/overlay.css"], "st-crop": ["teleport/stage/objects/overlay.css"], "st-guides": ["teleport/stage/objects/overlay.css"],
  "ax-menu": [C + "HeaderMenu.tsx", C + "ContextMenu.tsx", C + "HelpMenu.tsx"], "ax-tooltip": [], "ax-dialog": [C + "ports/Dialogs.tsx"], "ax-notice": [C + "SessionNotice.tsx"], "ax-button": [], "sb-states": [],
};
const patterns = {};
for (const [id, files] of Object.entries(PAT)) {
  const mine = rows.filter((r) => files.some((f) => r.file.endsWith(f) || r.file.includes(f)));
  const seen = new Map(); for (const r of mine) { const k = [r.file, r.selector, r.prop, r.value].join("|"); const cur = seen.get(k); if (!cur) seen.set(k, { r, themes: [r.theme] }); else cur.themes.push(r.theme); }
  const u = [...seen.values()];
  const cnt = { total: u.length, ds: 0, redesign: 0, legacy: 0, unmatched: 0, structural: 0, dead: 0, unusedRule: 0, dsExclusive: 0 };
  const list = { oneOff: [], dead: [], legacy: [] };
  const item = ({ r, themes }) => ({ prop: r.prop, value: r.value.slice(0, 70), resolved: r.resolved.slice(0, 40), file: r.file.replace("apps/airtime-creator/", ""), sel: r.selector.slice(0, 60), themes: themes.join("+"), status: r.status, src: rel(r.matched_src) });
  for (const e of u) {
    const r = e.r; const b = r.bucket;
    if (b === "1") cnt.ds++; else if (b === "2" || b === "2b") cnt.redesign++; else if (b === "3") cnt.legacy++; else if (b === "4") cnt.unmatched++; else cnt.structural++;
    if (r.families === "ds") cnt.dsExclusive++;
    if (r.status === "overridden-everywhere") { cnt.dead++; list.dead.push(item(e)); }
    if (r.status === "unused-rule") cnt.unusedRule++;
    if (b === "4" && r.status !== "unused-rule") list.oneOff.push(item(e));
    if (legacyOrigin(r.origin) || (b === "3" && r.origin === "legacy-teleport")) list.legacy.push(item(e));
  }
  for (const k of Object.keys(list)) list[k] = list[k].slice(0, 14);
  patterns[id] = { files, ...cnt, attributable: cnt.total - cnt.structural, lists: list, legacyN: u.filter((e) => legacyOrigin(e.r.origin)).length };
}
fs.writeFileSync(new URL("../data/audit.json", import.meta.url), JSON.stringify({ headline, tokens, patterns, docs: { report: "docs/creator-sidebar/css-audit/REPORT.md", provenance: "docs/creator-sidebar/css-audit/PROVENANCE.md", fileByFile: "docs/creator-sidebar/css-audit/FILE-BY-FILE.md", unused: "docs/creator-sidebar/css-audit/UNUSED.md", data: "docs/creator-sidebar/css-audit/data/" } }, null, 1));
const f = Object.values(tokens); console.log("tokens joined:", f.filter((x) => x.found).length, "/", f.length, "| patterns:", Object.keys(patterns).length); console.log(JSON.stringify(headline, null, 1).slice(0, 1800));
for (const [k, v] of Object.entries(patterns)) console.log(k, v.total, "ds", v.ds, "rd", v.redesign, "lg", v.legacy, "un", v.unmatched, "dead", v.dead);
