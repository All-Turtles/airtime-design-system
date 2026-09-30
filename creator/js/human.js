import { S, esc, si, card } from "./lib.js";
import * as C from "./components.js";
import { ATOMS } from "./atoms.js";
import { PATTERNS } from "./patterns.js";
import { AREAS } from "./areas.js";
import { cardHtml, iconGaps } from "./view.js";

/* Overview: the short, human-readable page. Live components built from the same CSS as the app. */
const nf = (n) => new Intl.NumberFormat().format(n);

/* "rgb(0, 105, 217)" / "rgba(0,0,0,.5)" / "color(srgb r g b / a)" -> "#0069D9" or "#000000 50%" */
function fmt(v) {
  if (!v) return "";
  let r, g, b, a = 1, m;
  if ((m = v.match(/^rgba?\(([^)]+)\)$/))) { const p = m[1].split(/[ ,\/]+/).map(Number); [r, g, b] = p; if (p.length > 3) a = p[3]; }
  else if ((m = v.match(/^color\(srgb ([^)]+)\)$/))) { const p = m[1].split(/[ \/]+/).map(Number); r = p[0] * 255; g = p[1] * 255; b = p[2] * 255; if (p.length > 3) a = p[3]; }
  else return v;
  const h = "#" + [r, g, b].map((x) => Math.round(x).toString(16).padStart(2, "0")).join("").toUpperCase();
  return a < 1 ? `${h} ${Math.round(a * 100)}%` : h;
}

const GROUPS = [
  ["Surfaces", "The window behind everything, the panels on top of it, and the frosted glass the sidebar is made of.", [["Window", "bg"], ["Panel", "bg-panel"], ["Raised", "bg-subtle"], ["Inverted", "bg-inverted"], ["Sidebar glass", "mat-hud"]]],
  ["Text", "One ink, stepped down in strength. Text 1 for what you read, 4 for hints.", [["Text 1", "text-1"], ["Text 2", "text-2"], ["Text 3", "text-3"], ["Text 4", "text-4"], ["Text 5", "text-5"]]],
  ["Accent and status", "System blue means selected or focused. Red means destructive. Green means live.", [["Accent", "accent-solid"], ["Accent wash", "accent-subtle"], ["Danger", "danger-solid"], ["Live", "status-live"], ["Stage teal", "action-primary"]]],
  ["Controls and lines", "Hairlines, hover and selected washes, and the sunken well behind number fields.", [["Line", "line"], ["Line, strong", "line-strong"], ["Hover", "state-hover"], ["Selected", "state-selected"], ["Field well", "surface-inset"]]],
];
const swatch = ([label, key]) => {
  const t = S.data.swatches[key]; if (!t) return "";
  const half = (th) => `<span class="hs-half is-${th}" data-theme="${th}" style="--c:var(--cr-color-${key})"></span>`;
  return `<figure class="hs"><div class="hs-pair">${half("light")}${half("dark")}</div><figcaption><b>${label}</b><span>${fmt(t.light)}</span><span>${fmt(t.dark)}</span></figcaption></figure>`;
};

const SAMPLE = { "heading.large": "Presenter", "heading.medium": "Background", "heading.small": "Layout", "body.large": "Fit to slide", "body.medium": "Applies to all slides", "body.small": "7 layers", button: "Duplicate", "button.segment": "Blurred", label: "APPEARANCE", accountName: "Your name", accountEmail: "you@example.com", saveState: "Saved", nano: "12 / 40", "band.readout": "00:42", "band.record": "REC 00:42", "band.label": "SLIDES", "status.badge": "LIVE", "status.lead": "Camera is on" };

const cats = (list) => { const m = new Map(); list.forEach((i) => { if (!m.has(i.cat)) m.set(i.cat, []); m.get(i.cat).push(i); }); return m; };
const slug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const NOTE = {
  Buttons: "Every button and toggle, each state side by side in light and dark.",
  Inputs: "Fields for typing and choosing. Error and disabled are shown too.",
  Choice: "Check, radio, switch, slider, stepper and color wells.",
  "Menus and feedback": "Menu items, tooltips, badges, progress, empty states and banners.",
  "Text and labels": "How text looks on each surface, and the small labels around controls.",
  Icons: "Public Airtime icons only, at every size the app uses.",
  Surfaces: "Materials, dividers, shadows and the focus ring.",
  Sidebar: "The right-hand inspector, built from the atoms above.",
  "Top bar": "The bar across the top and the controls above the stage.",
  "Slide tray": "The console and the lane of slide tiles under the stage.",
  Stage: "What is drawn over the stage while you edit.",
  "Menus and dialogs": "Menus, popovers, dialogs and banners.",
};
const section = (group, cat, items, extra = "") => `<section id="${group}-${slug(cat)}" data-group="${group}"><h2>${cat}</h2><p class="hv-sub">${NOTE[cat] ?? ""}</p><div class="at-list">${items.map(cardHtml).join("")}${extra}</div></section>`;

function scales(D) {
  const orgSp = new Set(D.spacingOrg);
  const spHtml = D.spacingSteps.map((v) => `<div class="hv-sp"><i class="${orgSp.has(v) ? "" : "is-own"}" style="width:${v * 3}px"></i><b>${v}</b></div>`).join("");
  const radHtml = D.radiusSteps.map((v) => `<div class="hv-rad"><i style="border-radius:${v === 9999 ? "50%" : v + "px"}"></i><b>${v === 9999 ? "round" : v}</b></div>`).join("");
  return { spHtml, radHtml, n: { sp: D.spacingSteps.length, rad: D.radiusSteps.length } };
}
function motion() {
  const ms = [["Quick", "--cr-duration-insert", 120], ["Fast", "--cr-duration-fast", 160], ["Normal", "--cr-duration-normal", 240], ["Slow", "--cr-duration-slow", 420]];
  return ms.map(([n, v, d]) => `<button type="button" class="hv-motion" data-dur="var(${v})"><span class="hv-track"><i></i></span><b>${n}</b><span>${d} ms</span></button>`).join("");
}

export async function human(root) {
  const D = S.data, C0 = D.counts, aliases = D.sharedWithOrg, sc = scales(D);
  const rec = (n, cls = "") => `<b class="${cls}">${nf(n)}</b>`;
  const famRows = [["Colors", C0.colors, `${C0.colors.used} are actually used on screen`], ["Text styles", C0.textStyles, "one family, a handful of sizes"], ["Font sizes", C0.fontSizes, "in px"], ["Corner radii", C0.radii, "the org has more, in even steps"], ["Spacing steps", C0.spacing, "snapping them is a separate, optional step"]];
  const fam = famRows.map(([n, c, note]) => `<tr><td>${n}<span>${note}</span></td><td>${nf(c.today)}</td><td>${rec(c.simplified, "is-new")}</td><td>${nf(c.org)}</td></tr>`).join("");
  const styles = D.textStyles.map((s) => `<div class="hv-ts"><span class="cr-text-${s.name.replace(/\./g, "-")}">${esc(SAMPLE[s.name] ?? s.name)}</span><small>${esc(s.name)} · ${s.fontSize} / ${s.lineHeight ?? "auto"} / ${s.fontWeight}</small></div>`).join("");
  const deviations = [
    ["Two blues.", "The app shell uses system blue for selected and focused things. The stage frame and handles still use the older Airtime teal."],
    ["Some type sizes render larger than written.", "The Record button and the stage pill buttons are written as 11 and 13 px but render at 13 and 16. This page shows what renders."],
    ["Four different disabled fades.", "40, 45, 30 and 20 percent, depending on the control."],
    ["Pointers differ by area.", "The sidebar keeps the arrow cursor. The top bar, tray and stage buttons show a pointing hand."],
    ["Some tokens are only used in hover and popup states.", "A few sidebar shadow and material tokens are declared but not visible at rest."],
    ["Mostly its own values.", `Only ${aliases} values are exactly the org's, mostly spacing, radii and type. No color, shadow or material matches, so they are Creator's own.`],
    ["No toast.", "The session banner is the only transient message."],
  ].map(([a, b]) => `<li><b>${a}</b> ${b}</li>`).join("");
  const A = cats(ATOMS), P = cats(PATTERNS), R = cats(AREAS);

  root.innerHTML = `
  <section id="h-start" class="hv-hero" data-group="start">
    <h1>Creator design system</h1>
    <p class="hv-lede">The look of the Creator app: color, type, shape and the components in its sidebar, top bar, slide tray and stage. It sits on top of the <b>Airtime design system</b> tokens, and adds what Creator needs that the org system does not have: a blue accent, frosted glass, and translucent ink that works in light and dark.</p>
    <div class="hv-chips"><span><b>${C0.colors.simplified}</b> colors</span><span><b>${C0.textStyles.simplified}</b> text styles</span><span><b>${sc.n.rad}</b> radii</span><span><b>${sc.n.sp}</b> spacing steps</span><span><b>${ATOMS.length + PATTERNS.length + AREAS.length}</b> components</span></div>
    <div class="hv-showcase">${card(C.head("Appearance", { icon: "effects" }) + C.row("border", "Border", { trailing: `<span class="cr-dot" style="background:#3D7BFF"></span>` }) + C.seg("segmented", [{ text: "Visible" }, { text: "Blurred" }, { text: "Hidden" }], { on: 0 }) + `<div style="height:8px"></div>` + C.actions(2, [C.action("duplicate", "Duplicate"), C.action("trash", "Delete", { destructive: true })]))}
      <div class="hv-showcase-note"><p>These are live components built from the same CSS as the app. The page reads in three layers: <b>atoms</b> (single controls and their states), <b>patterns</b> (the sidebar) and <b>areas</b> (top bar, tray, stage, menus). Use the toggle at the top to flip the whole page between light and dark.</p></div></div>
  </section>

  <section id="h-tokens" data-group="foundations"><h2>How many tokens</h2>
    <p class="hv-sub">Creator grew its own token set. The simplified column is the agreed target.</p>
    <table class="hv-table"><thead><tr><th>Family</th><th>Today</th><th>Simplified</th><th>Airtime org</th></tr></thead><tbody>${fam}</tbody></table>
    <p class="hv-foot">The org has fewer colors because Creator draws things it has no words for: a blue accent, stage glass, translucent ink and materials.</p></section>

  <section id="h-color" data-group="foundations"><h2>Color</h2><p class="hv-sub">Every swatch shows light on the left and dark on the right. Checkerboard means the color is see-through.</p>
    ${GROUPS.map(([t, d, sws]) => `<h3>${t}</h3><p class="hv-sub">${d}</p><div class="hv-swatches">${sws.map(swatch).join("")}</div>`).join("")}</section>

  <section id="h-type" data-group="foundations"><h2>Type</h2><p class="hv-sub">One system font stack: SF Pro on Apple devices, then Helvetica Neue and Arial. Weights 400, 500 and 600, plus one 300 for a caption. Each style shows size / line height / weight.</p>
    <div class="hv-fonts"><div class="hv-font"><span style="font-size:44px;line-height:1;font-weight:600;letter-spacing:-0.02em">Aa</span><small>Interface text</small></div><div class="hv-font"><span class="mono" style="font-size:36px;line-height:1.1;font-family:var(--cr-font-family-mono)">Aa 01</span><small>Numbers and code</small></div></div>
    <div class="hv-ts-grid">${styles}</div></section>

  <section id="h-shape" data-group="foundations"><h2>Space and shape</h2><p class="hv-sub">Gaps come from one short scale. Filled bars are steps the org system shares; outlined ones are Creator's own.</p>
    <div class="hv-sps">${sc.spHtml}</div><h3>Corner radius</h3><div class="hv-rads">${sc.radHtml}</div>
    <h3>Motion</h3><p class="hv-sub">Click to replay. Everything eases out; the panel and stage use a soft settle.</p><div class="hv-motions">${motion()}</div></section>

  ${[...A].map(([cat, items]) => section("atoms", cat, items, cat === "Icons" ? iconGaps() : "")).join("")}
  ${[...P].map(([cat, items]) => section("patterns", cat, items)).join("")}
  ${[...R].map(([cat, items]) => section("areas", cat, items)).join("")}

  <section id="h-deviations" data-group="more"><h2>Where Creator differs</h2><p class="hv-sub">Where the app, the code and the org system disagree.</p><ul class="hv-dev">${deviations}</ul></section>`;

  root.querySelectorAll(".hv-motion").forEach((b) => b.addEventListener("click", () => {
    const i = b.querySelector("i"); i.style.transition = "none"; i.style.transform = "translateX(0)"; void i.offsetWidth;
    i.style.transition = `transform ${b.dataset.dur} var(--cr-easing-settle)`; i.style.transform = "translateX(var(--hv-run))";
  }));
}
