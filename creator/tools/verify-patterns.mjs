// Pattern conformance: computes styles of documented patterns (creator/index.html, port 3100) and of the same control in the
// live app (port 3000), per theme, and reports every property that differs.  Output: ../data/conformance.json
import { open } from "./probe.mjs";
import { launchBrowser } from "/Users/dairien/workspaces/mmhmm-tv-creator-sidebar/docs/creator-sidebar/qa/lib/paths.mjs";
import fs from "node:fs";
const BOX = ["width", "height", "paddingTop", "paddingRight", "paddingBottom", "paddingLeft", "borderTopLeftRadius", "gap"];
const TXT = ["fontSize", "fontWeight", "lineHeight", "letterSpacing", "color", "textAlign"];
const FILL = ["backgroundColor", "boxShadow", "opacity"];
const ALL = [...BOX, ...TXT, ...FILL];
// live: how to find the app element inside the sidebar; doc: selector inside the docs stage
const PAIRS = [
  { n: "card", pane: "presenter", live: { css: '[data-testid="sidebar"]', abs: 1 }, doc: "#sb-card .cr-sidebar", props: ["width", "borderTopLeftRadius", "backgroundColor", "boxShadow", "fontSize", "fontWeight", "lineHeight", "letterSpacing", "color"] },
  { n: "pane title", pane: "presenter", live: { css: "h2" }, doc: "#sb-pane-header .cr-pane-title", props: TXT.concat(["height"]) },
  { n: "header toggle (Hide)", pane: "presenter", live: { label: "Hide" }, doc: "#sb-icontoggle .cr-icontoggle", props: ["width", "height", "borderTopLeftRadius", "color", "backgroundColor"] },
  { n: "back toggle", pane: "presenter", live: { label: "Back to the slide" }, doc: "#sb-icontoggle .cr-icontoggle.is-back", props: ["width", "height", "borderTopLeftRadius", "color"] },
  { n: "action button (Duplicate)", pane: "presenter", live: { text: "Duplicate", tag: "button" }, doc: "#sb-actions .cr-actions.is-2 .cr-action", props: ALL },
  { n: "row (Border)", pane: "presenter", live: { text: "Border", tag: "button" }, doc: "#sb-row .cr-row", props: ["height", "paddingTop", "paddingLeft", "borderTopLeftRadius", "gap", "color", "backgroundColor"] },
  { n: "row label (Border)", pane: "presenter", live: { text: "Border", tag: "button", child: "span" }, doc: "#sb-row .cr-row .cr-row-label", props: TXT },
  { n: "segmented track (Background)", pane: "presenter", live: { label: "Background", role: "radiogroup" }, doc: "#sb-seg .cr-seg.is-segmented", props: ["height", "paddingTop", "paddingLeft", "borderTopLeftRadius", "gap", "boxShadow"] },
  { n: "segmented item (Blurred)", pane: "presenter", live: { text: "Blurred", role: "radio" }, doc: { css: "#sb-seg .cr-seg.is-segmented .cr-seg-item", nth: 1 }, props: ALL },
  { n: "segmented item selected (Visible)", pane: "presenter", live: { text: "Visible", role: "radio" }, doc: { css: "#sb-seg .cr-seg.is-segmented .cr-seg-item", nth: 0 }, props: ["height", "borderTopLeftRadius", "backgroundColor", "color", "boxShadow", "fontWeight"] },
  { n: "shape item (Rectangle)", pane: "presenter", live: { text: "Rectangle", role: "radio" }, doc: "#sb-seg .cr-seg.is-shape .cr-seg-item", props: ["paddingTop", "paddingBottom", "borderTopLeftRadius", "fontSize", "fontWeight", "color", "gap"] },
  { n: "shape track", pane: "presenter", live: { label: "Shape", role: "radiogroup" }, doc: "#sb-seg .cr-seg.is-shape", props: ["paddingTop", "paddingLeft", "borderTopLeftRadius", "gap", "boxShadow"] },
  { n: "aspect chip (1:1)", pane: "presenter", live: { text: "1:1", role: "radio" }, doc: { css: "#sb-seg .cr-seg.is-bare .cr-seg-item", nth: 1 }, props: ["height", "paddingLeft", "borderTopLeftRadius", "fontSize", "fontWeight", "color"] },
  { n: "value field (Opacity)", pane: "presenter", live: { label: "Opacity", tag: "input" }, doc: "#sb-field .cr-field.is-value", props: ["width", "height", "paddingLeft", "borderTopLeftRadius", "backgroundColor", "boxShadow", "fontSize", "lineHeight"] },
  { n: "geo field (X)", pane: "presenter", live: { label: "X position", tag: "input", parent: 1 }, doc: "#sb-field .cr-field.is-geo", props: ["height", "paddingLeft", "borderTopLeftRadius", "gap", "backgroundColor", "boxShadow", "fontSize"] },
  { n: "dropdown row (Effects)", pane: "presenter", live: { text: "Effects", tag: "button" }, doc: "#sb-dropdown .cr-row.is-select", props: ["height", "paddingTop", "paddingLeft", "borderTopLeftRadius", "gap", "fontSize", "lineHeight", "color"] },
  { n: "dropdown pill (Effects)", pane: "presenter", live: { text: "Effects", tag: "button", lastChild: 1 }, doc: "#sb-dropdown .cr-row.is-select .cr-field.is-pill", props: ["height", "paddingLeft", "borderTopLeftRadius", "backgroundColor", "boxShadow", "fontSize", "gap", "color"] },
  { n: "rule", pane: "presenter", live: { css: "hr" }, doc: "#sb-labels .cr-rule.is-shown", props: ["height", "marginTop", "marginBottom", "backgroundColor"] },
  { n: "tint dot", pane: "presenter", live: { label: "Blue red", role: "radio" }, doc: "#sb-swatches .cr-swatches.is-circle .cr-swatch", props: ["width", "height", "borderTopLeftRadius", "boxShadow"] },
  { n: "head link (Reset crop)", pane: "presenter", live: { text: "Reset crop", tag: "button", child: "span" }, doc: "#sb-labels .cr-headlink > span", props: ["fontSize", "fontWeight", "lineHeight", "color"] },
  { n: "layer row", pane: "slide", live: { css: '[role=group][aria-label="Layers"] > [role=button]' }, doc: "#sb-thumbrow .cr-thumbrow", props: ["height", "paddingTop", "paddingLeft", "borderTopLeftRadius", "gap", "fontSize", "lineHeight", "color", "backgroundColor"] },
  { n: "inline toggle (Hide layer)", pane: "slide", live: { label: "Hide layer" }, doc: "#sb-icontoggle .cr-icontoggle.is-inline", props: ["width", "height", "borderTopLeftRadius", "color"] },
  { n: "background tile", pane: "slide", live: { text: "Cosmic Glow", role: "radio" }, doc: { css: "#sb-swatches .cr-swatches:not(.is-circle):not(.is-square) .cr-swatch", nth: 1 }, props: ["height", "borderTopLeftRadius", "boxShadow"] },
  { n: "logo switch", pane: "slide", live: { text: "", role: "switch", tag: "button" }, doc: "#sb-thumbrow .cr-switch", props: ["width", "height"] },
  { n: "switch track", pane: "slide", live: { role: "switch", tag: "button", child: "span" }, doc: { css: "#sb-thumbrow .cr-switch > span", nth: 1 }, props: ["width", "height", "borderTopLeftRadius", "backgroundColor", "boxShadow"] },
  { n: "tall head (Layers)", pane: "slide", live: { css: '[role=group][aria-label="Layers"] > div:first-child' }, doc: "#sb-labels .cr-section-head.is-tall", props: ["minHeight", "fontSize", "fontWeight", "lineHeight", "color", "gap"] },
  // ---- header / band / tray / stage (whole document scope)
  { n: "topbar", pane: "presenter", live: { css: "header", abs: 1 }, doc: "#hd-topbar .cr-topbar", props: ["height", "paddingLeft", "gap", "backgroundColor", "boxShadow", "fontSize", "lineHeight", "zIndex", "color"] },
  { n: "title trigger", pane: "presenter", live: { label: "Document menu", abs: 1 }, doc: "#hd-topbar .cr-title", props: ["height", "paddingTop", "paddingLeft", "borderTopLeftRadius", "gap", "color", "lineHeight"] },
  { n: "title label", pane: "presenter", live: { label: "Document menu", abs: 1, child: "span:nth-child(2)" }, doc: "#hd-topbar .cr-title .label", props: ["fontSize", "fontWeight", "lineHeight", "color", "paddingTop", "paddingLeft", "borderTopLeftRadius"] },
  { n: "mode track", pane: "presenter", live: { role: "radiogroup", label: "Mode", abs: 1 }, doc: "#hd-topbar .cr-mode", props: ["height", "paddingTop", "gap", "borderTopLeftRadius", "backgroundColor", "boxShadow"] },
  { n: "mode item (unselected)", pane: "presenter", live: { css: '[role=radiogroup][aria-label="Mode"] label:last-of-type', abs: 1 }, doc: { css: "#hd-topbar .cr-mode-item", nth: 1 }, props: ["height", "paddingLeft", "borderTopLeftRadius", "fontSize", "fontWeight", "lineHeight", "color"] },
  { n: "undo (disabled)", pane: "presenter", live: { label: "Undo", abs: 1 }, doc: "#hd-topbar .cr-iconbtn", props: ["width", "height", "borderTopLeftRadius", "color", "opacity"] },
  { n: "sidebar toggle (pressed)", pane: "presenter", live: { label: "Hide sidebar", abs: 1 }, doc: "#hd-topbar .cr-iconbtn.is-toggle", props: ["width", "height", "borderTopLeftRadius", "color", "backgroundColor"] },
  { n: "help", pane: "presenter", live: { label: "Help", abs: 1 }, doc: "#hd-topbar .cr-iconbtn.is-quiet", props: ["width", "height", "color"] },
  { n: "avatar", pane: "presenter", live: { label: "Account menu", abs: 1 }, doc: "#hd-topbar .cr-avatar", props: ["width", "height", "borderTopLeftRadius", "boxShadow"] },
  { n: "record", pane: "presenter", live: { label: "Record", abs: 1 }, doc: "#hd-record .cr-record", props: ["height", "paddingLeft", "paddingRight", "borderTopLeftRadius", "gap", "backgroundColor", "boxShadow", "fontSize", "color"] },
  { n: "insert pill", pane: "presenter", live: { role: "toolbar", label: "Insert", abs: 1 }, doc: "#hd-insert .cr-hud", props: ["height", "paddingTop", "gap", "borderTopLeftRadius", "backgroundColor", "boxShadow"] },
  { n: "insert label", pane: "presenter", live: { role: "toolbar", label: "Insert", abs: 1, child: "span" }, doc: "#hd-insert .cr-hud-label", props: ["fontSize", "fontWeight", "lineHeight", "letterSpacing", "textTransform", "color", "paddingLeft", "paddingRight"] },
  { n: "insert button", pane: "presenter", live: { label: "Screenshare", abs: 1 }, doc: "#hd-insert .cr-insert", props: ["width", "height", "borderTopLeftRadius", "color"] },
  { n: "camera main", pane: "presenter", live: { label: "Turn off camera", abs: 1 }, doc: "#hd-split .cr-split .main", props: ["height", "paddingLeft", "paddingRight", "gap", "color"] },
  { n: "camera picker", pane: "presenter", live: { label: "Select a camera", abs: 1 }, doc: "#hd-split .cr-split .trigger", props: ["height", "paddingLeft", "paddingRight", "color"] },
  { n: "tray surface", pane: "presenter", live: { css: "[data-testid=tray-surface]", abs: 1 }, doc: "#tr-tray .cr-tray-surface", props: ["height", "borderTopLeftRadius", "backgroundColor", "boxShadow"] },
  { n: "tray console", pane: "presenter", live: { role: "toolbar", label: "Slide controls", abs: 1 }, doc: "#tr-tray .cr-tray-controls", props: ["height", "paddingLeft", "gap", "borderTopLeftRadius", "backgroundColor", "boxShadow"] },
  { n: "add slide", pane: "presenter", live: { text: "Add Slide", tag: "button", abs: 1 }, doc: "#tr-buttons .cr-addslide", props: ["height", "paddingLeft", "gap", "borderTopLeftRadius", "backgroundColor", "color", "fontSize", "fontWeight"] },
  { n: "tray button", pane: "presenter", live: { label: "Import slides", abs: 1 }, doc: "#tr-buttons .cr-traybtn", props: ["width", "height", "borderTopLeftRadius", "color"] },
  { n: "slide counter", pane: "presenter", live: { role: "status", label: "Slide position", abs: 1 }, doc: "#tr-buttons .cr-counter", props: ["fontSize", "lineHeight", "color"] },
  { n: "tile face", pane: "presenter", live: { label: "Slide 1", tag: "button", abs: 1 }, doc: "#tr-tile .cr-tile .face", props: ["height", "borderTopLeftRadius"] },
  { n: "tile action chip", pane: "presenter", live: { label: "Show layers for slide 1", abs: 1 }, doc: { css: "#tr-tile .cr-tile.is-selected .act.edit" }, props: ["width", "height", "borderTopLeftRadius", "backgroundColor", "color", "boxShadow"] },
  { n: "selection pill", pane: "presenter", live: { role: "toolbar", label: "Presenter controls", abs: 1 }, doc: "#st-pill .cr-glass", props: ["height", "paddingTop", "gap", "borderTopLeftRadius", "backgroundColor", "boxShadow", "color"] },
  { n: "selection button", pane: "presenter", live: { label: "Shape", abs: 1 }, doc: "#st-pill .cr-gbtn", props: ["height", "paddingLeft", "borderTopLeftRadius", "gap", "fontSize", "fontWeight", "lineHeight", "color"] },
  { n: "resize handle", pane: "presenter", live: { css: "div.slide_overlay div.handles div.handle", abs: 1 }, doc: "#st-overlay .cr-handle", props: ["width", "height", "borderTopLeftRadius", "borderTopWidth", "borderTopColor", "backgroundColor", "boxShadow"] },
  { n: "selection frame", pane: "presenter", live: { css: "div.slide_overlay div.frame", abs: 1 }, doc: "#st-overlay .cr-frame", props: ["borderTopWidth", "borderTopColor"] },
  { n: "menu content", pane: "presenter+click:Help", live: { css: "[data-part=content][role=menu]", abs: 1 }, doc: "#ax-menu .cr-menu", props: ["paddingTop", "paddingLeft", "borderTopLeftRadius", "backgroundColor", "boxShadow", "color"] },
  { n: "menu item", pane: "presenter+click:Help", live: { css: "[role=menuitem]", abs: 1 }, doc: "#ax-menu .cr-menu-item", props: ["paddingTop", "paddingLeft", "gap", "borderTopLeftRadius", "fontSize", "lineHeight", "color"] },
  { n: "tooltip", pane: "presenter+hover:Shape", live: { css: "[data-part=content][role=tooltip]", abs: 1 }, doc: "#ax-tooltip .cr-tooltip", props: ["paddingTop", "paddingLeft", "borderTopLeftRadius", "backgroundColor", "color", "boxShadow", "fontSize", "lineHeight", "borderTopWidth", "borderTopColor"] },
];
const finder = `(sb, s) => { const cands = s.abs ? [...document.querySelectorAll(s.css ?? "*")] : [...sb.querySelectorAll(s.css ?? "*")]; const norm = (x) => (x || "").trim();
  let list = cands.filter((e) => (!s.tag || e.tagName.toLowerCase() === s.tag) && (!s.role || e.getAttribute("role") === s.role) && (!s.label || e.getAttribute("aria-label") === s.label) && (!s.text || norm(e.textContent).startsWith(s.text) || (e.getAttribute("aria-label") || "").startsWith(s.text)));
  let e = list[0]; if (!e) return null; if (s.parent) e = e.parentElement; if (s.child) e = e.querySelector(s.child); if (s.lastChild) e = e.lastElementChild; return e; }`;
const grab = `(e, props) => { const c = getComputedStyle(e), o = {}; for (const p of props) o[p] = c[p]; return o; }`;
const out = [];
const ctxB = await launchBrowser([]);
for (const theme of ["light", "dark"]) {
  const live = {};
  for (const pane of [...new Set(PAIRS.map((x) => x.pane))]) {
    const [base, act] = pane.split("+");
    const { browser, page } = await open(theme, base === "slide" ? "none" : base);
    if (act) { const [kind, name] = act.split(":"); const b = page.getByRole("button", { name, exact: true }).first(); if (kind === "click") await b.click(); else { const bb = await b.boundingBox(); await page.mouse.move(bb.x + bb.width / 2 - 4, bb.y + bb.height / 2); await page.mouse.move(bb.x + bb.width / 2, bb.y + bb.height / 2, { steps: 4 }); } await page.waitForTimeout(700); }
    for (const p of PAIRS.filter((x) => x.pane === pane)) live[p.n] = await page.evaluate(({ f, g, s, props }) => { const sb = document.querySelector('[data-testid="sidebar"]'); const e = eval(f)(sb, s); if (!e) return null; return eval(g)(e, props); }, { f: finder, g: grab, s: p.live, props: p.props });
    await browser.close();
  }
  const page = await (await ctxB.newContext({ viewport: { width: 1500, height: 1000 } })).newPage();
  await page.goto("http://localhost:3100/index.html", { waitUntil: "networkidle" });
  for (const p of PAIRS) {
    const d = await page.evaluate(({ g, sel, theme, props }) => { const s = typeof sel === "string" ? { css: sel } : sel; const list = [...document.querySelectorAll(s.css)].filter((e) => e.closest(`.stage[data-theme="${theme}"]`)); const e = list[s.nth ?? 0]; if (!e) return null; return eval(g)(e, props); }, { g: grab, sel: p.doc, theme, props: p.props });
    const l = live[p.n];
    if (!l || !d) { out.push({ theme, name: p.n, status: !l ? "live element not found" : "docs element not found", diffs: [] }); continue; }
    const diffs = [];
    for (const k of p.props) { const a = l[k], b = d[k]; const num = (x) => parseFloat(x); const same = a === b || (/^-?[\d.]+(px)?$/.test(a) && /^-?[\d.]+(px)?$/.test(b) && Math.abs(num(a) - num(b)) <= 0.6) || (a.startsWith("rgb") && b.startsWith("rgb") && a.replace(/\s/g, "").replace(/\.98\d/, ".985") === b.replace(/\s/g, "").replace(/\.98\d/, ".985")) || (/^-?[\d.]+px$/.test(a) && a.replace(/\.\d+/, "") === b.replace(/\.\d+/, "") && Math.abs(num(a) - num(b)) < 0.1); if (!same) diffs.push({ prop: k, live: a, docs: b }); }
    out.push({ theme, name: p.n, status: diffs.length ? "differs" : "match", checked: p.props.length, diffs });
  }
}
await ctxB.close();
fs.writeFileSync(new URL("../data/conformance.json", import.meta.url), JSON.stringify(out, null, 1));
const bad = out.filter((o) => o.status !== "match");
for (const o of bad) console.log(o.theme, o.name, o.status, o.diffs.map((d) => `${d.prop}: live ${d.live} | docs ${d.docs}`).join(" ; "));
console.log(`${out.length - bad.length}/${out.length} pattern checks match`);
