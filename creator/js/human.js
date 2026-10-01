import { S, esc, si, card } from "./lib.js";
import * as C from "./components.js";
import { ATOMS } from "./atoms.js";
import { PATTERNS } from "./patterns.js";
import { AREAS } from "./areas.js";
import { cardHtml, iconGaps } from "./view.js";
import { colorChip, countsTable } from "./states.js";
import { counts } from "./colors.js";
import { colorSystem, scales as newScales, rules, changelog } from "./system.js";

/* Overview: the short, human-readable page. Live components built from the same CSS as the app. */
const nf = (n) => new Intl.NumberFormat().format(n);

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
  "Slide tray": "The control row and the lane of slide tiles under the stage.",
  Stage: "What is drawn over the stage while you edit.",
  "Menus and dialogs": "Menus, popovers, dialogs and banners.",
};
const section = (group, cat, items, extra = "") => `<section id="${group}-${slug(cat)}" data-group="${group}"><h2>${cat}</h2><p class="hv-sub">${NOTE[cat] ?? ""}</p><div class="at-list">${items.map(cardHtml).join("")}${extra}</div></section>`;

function scales(N, T) {
  const orgSp = new Set(T.org.spacing);
  const spHtml = N.spacing.map((v) => `<div class="hv-sp"><i class="${orgSp.has(v) ? "" : "is-own"}" style="width:${v * 3}px"></i><b>${v}</b></div>`).join("");
  const orgRad = new Set(T.org.radii);
  const radHtml = N.radii.map((v) => `<div class="hv-rad"><i class="${orgRad.has(v) ? "" : "is-own"}" style="border-radius:${v === 9999 ? "50%" : v + "px"}"></i><b>${v === 9999 ? "round" : v}</b></div>`).join("");
  return { spHtml, radHtml, n: { sp: N.spacing.length, rad: N.radii.length } };
}
export async function human(root) {
  const T = S.tokens, N = counts(T), aliases = N.sharedWithOrg, sc = scales(N, T), RW = N.rows;
  const styles = T.textStyles.map((s) => `<div class="hv-ts"><span class="cr-text-${s.name.replace(/\./g, "-")}">${esc(SAMPLE[s.name] ?? s.name)}</span><small>${esc(s.name)} · ${s.fontSize} / ${s.lineHeight ?? "auto"} / ${s.fontWeight}</small></div>`).join("");
  const deviations = [
    ["One disabled fade.", "A disabled control is the whole control at 40 percent. A field's placeholder is its own ink at 70 percent."],
    ["Pointers differ by area.", "Most controls keep the arrow cursor. The device buttons, status chip, slide tiles and the stage buttons show a pointing hand."],
    ["Icons are 16 px in rows, menus and fields.", "The top bar and the tray draw 20 px icons. The sidebar toggle draws its 24 px artwork at 16 or 20."],
    ["The stage overlay is not part of the token system.", "The selection frame, its handles and the alignment guides are drawn by the stage itself. Their sizes are shown here as they render; only the glass around them uses the modeless colors."],
    ["Colors are Figma's, not the org's.", `Creator's 23 colors carry the Figma Colors names and values, so they are not aliases of the org colors. ${aliases} other tokens are exactly the org's, mostly spacing, radii and type.`],
    ["Two kinds of message.", "A full-width banner under the top bar for session problems, and a floating toast for short notices with one action."],
  ].map(([a, b]) => `<li><b>${a}</b> ${b}</li>`).join("");
  const A = cats(ATOMS), P = cats(PATTERNS), R = cats(AREAS);

  root.innerHTML = `
  <section id="h-start" class="hv-hero" data-group="start">
    <h1>Creator design system</h1>
    <p class="hv-lede">The look of the Creator app: color, type, shape and the components in its sidebar, top bar, slide tray and stage. It sits on top of the <b>Airtime design system</b> tokens, and adds what Creator needs that the org system does not have: a blue accent, frosted glass, and translucent ink that works in light and dark.</p>
    <div class="hv-chips">${colorChip(T)}<span><b>${RW.textStyles.today}</b> text styles</span><span><b>${sc.n.rad}</b> radii</span><span><b>${sc.n.sp}</b> spacing steps</span><span><b>${ATOMS.length + PATTERNS.length + AREAS.length}</b> components</span></div>
    <div class="hv-showcase">${card(C.head("Appearance", { icon: "effects" }) + C.row("border", "Border", { trailing: `<span class="cr-dot" style="background:#3D7BFF"></span>` }) + C.seg("segmented", [{ text: "Visible" }, { text: "Blurred" }, { text: "Hidden" }], { on: 0 }) + `<div style="height:8px"></div>` + C.actions(2, [C.action("duplicate", "Duplicate"), C.action("trash", "Delete", { destructive: true })]))}
      <div class="hv-showcase-note"><p>These are live components built from the same CSS as the app. The page reads in three layers: <b>atoms</b> (single controls and their states), <b>patterns</b> (the sidebar) and <b>areas</b> (top bar, tray, stage, menus). Use the toggle at the top to flip the whole page between light and dark.</p></div></div>
  </section>

  <section id="h-tokens" data-group="foundations"><h2>How many tokens</h2>
    <p class="hv-sub">Creator grew its own token set. Each family is counted in three states: what is on the main development branch, what is in open changes that are not merged yet, and the target for the simplification. Every number on this page is counted from one data file when the page loads. Hover, focus or tap a color number to list what it counts.</p>
    ${countsTable(T)}
    <p class="hv-foot">The org has fewer colors because Creator draws things it has no words for: a blue accent, stage glass, translucent ink and materials. <a href="#h-system">The color system</a> lists every color with its light and dark value.</p></section>

  ${colorSystem(T)}
  ${newScales(T)}
  ${rules()}

  <section id="h-type" data-group="foundations"><h2>Type</h2><p class="hv-sub">One system font stack: SF Pro on Apple devices, then Helvetica Neue and Arial. Weights 400, 500 and 600, plus one 300 for a caption. Each style shows size / line height / weight.</p>
    <div class="hv-fonts"><div class="hv-font"><span style="font-size:44px;line-height:1;font-weight:600;letter-spacing:-0.02em">Aa</span><small>Interface text</small></div><div class="hv-font"><span class="mono" style="font-size:36px;line-height:1.1;font-family:var(--cr-font-family-mono)">Aa 01</span><small>Numbers and code</small></div></div>
    <div class="hv-ts-grid">${styles}</div></section>

  <section id="h-shape" data-group="foundations"><h2>Spacing</h2><p class="hv-sub">Gaps come from one short scale. Filled bars are steps the org system shares; outlined ones are Creator's own.</p>
    <div class="hv-sps">${sc.spHtml}</div></section>

  ${[...A].map(([cat, items]) => section("atoms", cat, items, cat === "Icons" ? iconGaps() : "")).join("")}
  ${[...P].map(([cat, items]) => section("patterns", cat, items)).join("")}
  ${[...R].map(([cat, items]) => section("areas", cat, items)).join("")}

  <section id="h-deviations" data-group="more"><h2>Where Creator differs</h2><p class="hv-sub">Where the app, the code and the org system disagree.</p><ul class="hv-dev">${deviations}</ul></section>

  ${changelog(T)}`;

  root.querySelectorAll(".hv-motion").forEach((b) => b.addEventListener("click", () => {
    const i = b.querySelector("i"); i.style.transition = "none"; i.style.transform = "translateX(0)"; void i.offsetWidth;
    i.style.transition = `transform ${b.dataset.dur} var(--cr-easing-settle)`; i.style.transform = "translateX(var(--hv-run))";
  }));
}
