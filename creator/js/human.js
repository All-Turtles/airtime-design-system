import { S, esc, si, card } from "./lib.js";
import { iconToggle, row, action, actions, seg, valueField, pill, sw, sw34, head, thumbRow, layerToggles, PALETTE } from "./sidebar.js";

/* Overview: the short, human-readable page. Live components from the same builders and CSS as the Engineering view. */
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
  const t = S.tokens.get("--cr-color-" + key); if (!t) return "";
  const half = (th) => `<span class="hs-half is-${th}" data-theme="${th}" style="--c:var(--cr-color-${key})"></span>`;
  return `<figure class="hs"><div class="hs-pair">${half("light")}${half("dark")}</div><figcaption><b>${label}</b><span>${fmt(t.rendered.light)}</span><span>${fmt(t.rendered.dark)}</span></figcaption></figure>`;
};

const SAMPLE = { "heading.large": "Presenter", "heading.medium": "Background", "heading.small": "Layout", "body.large": "Fit to slide", "body.medium": "Applies to all slides", "body.small": "7 layers", button: "Duplicate", "button.segment": "Blurred", label: "APPEARANCE", accountName: "Your name", accountEmail: "you@example.com", saveState: "Saved", nano: "12 / 40", "band.readout": "00:42", "band.record": "REC 00:42", "band.label": "SLIDES", "status.badge": "LIVE", "status.lead": "Camera is on" };

const spec = (title, use, inner, cls = "") => `<article class="hv-card ${cls}"><div class="hv-spec">${inner}</div><footer><b>${title}</b><span>${use}</span></footer></article>`;
const inSide = (inner) => card(inner, { compact: true });

function components() {
  const SEG = [{ text: "Visible" }, { text: "Blurred" }, { text: "Hidden" }];
  const TOOL = [{ icon: "textAlignLeft", label: "Left" }, { icon: "textAlignCenter", label: "Center" }, { icon: "textAlignRight", label: "Right" }];
  const SHP = [{ icon: "maskRectangle", text: "Rect" }, { icon: "maskCircle", text: "Circle" }, { icon: "maskHexagon", text: "Hex" }];
  const cells = [
    spec("Section head", "Names a group of controls in the sidebar.", inSide(head("Appearance", { icon: "effects" }) + head("Crop", { link: "Reset crop" }))),
    spec("Row", "One setting: icon, label, and its current value.", inSide(row("border", "Border", { trailing: `<span class="cr-dot" style="background:#3D7BFF"></span>` }) + row("effects", "Effects", { cls: "is-select", trailing: pill("Blur") }) + row("cam", "Layout", { trailing: si("chevronForward") }))),
    spec("Action buttons", "Do something once. One, two or three across.", inSide(actions(2, [action("duplicate", "Duplicate"), action("trash", "Delete", { destructive: true })]) + `<div style="height:6px"></div>` + actions(1, [action("expand", "Fullscreen")]))),
    spec("Segmented control", "Pick one of a few options.", inSide(seg("segmented", SEG, { on: 0 }) + `<div style="height:8px"></div>` + seg("shape", SHP, { on: 1 }))),
    spec("Tool strip", "Small square tools, like text alignment.", inSide(seg("tool", TOOL, { on: 1 }) + `<div style="height:8px"></div>` + seg("tool", [{ text: "<b>B</b>", label: "Bold" }, { text: "<i>I</i>", label: "Italic" }, { text: "<u>U</u>", label: "Underline" }], { mode: "toggle", on: [0, 2] }))),
    spec("Number field", "Type a value, or drag its slider.", inSide(`<div style="display:flex;gap:8px;justify-content:flex-end;align-items:center">${valueField("42%")}${valueField("#3D7BFF", "is-wide")}</div><div class="cr-range-pop" style="margin-top:8px"><input class="cr-range" type="range" value="60" aria-label="Opacity"></div>`)),
    spec("Colour and swatches", "Choose a colour or a background.", inSide(`<div class="cr-swatches is-circle" style="--cols:7" role="radiogroup">${PALETTE.slice(2, 9).map((c, i) => sw(c, { sel: i === 3 })).join("")}</div>`)),
    spec("Layer row", "A thing you can select, hide, lock and reorder.", inSide(thumbRow({ name: "Presenter", trailing: layerToggles(false, false) }) + thumbRow({ name: "Image 1", sel: 1, trailing: layerToggles(false, false) }))),
    spec("Switch", "Turn something on or off.", inSide(`<div style="display:flex;gap:14px;align-items:center;padding:6px 0"><span>Off</span>${sw34(false)}<span>On</span>${sw34(true)}</div>`)),
    spec("Icon buttons", "Quiet round buttons for small actions.", inSide(`<div style="display:flex;gap:6px;padding:4px 0">${iconToggle("eye", "Hide")}${iconToggle("lockOpen", "Lock")}${iconToggle("more", "More")}${iconToggle("trash", "Delete")}</div>`)),
  ];
  return cells.join("");
}

function scales(D) {
  const sp = [...new Set(D.mappings.P2r.scales.spacing.rows.map((r) => r.to))].sort((a, b) => a - b);
  const orgSp = new Set(D.mappings.P2r.scales.spacing.org);
  const rad = [...new Set(D.mappings.P2r.scales.radius.rows.map((r) => r.to))].sort((a, b) => a - b);
  const spHtml = sp.map((v) => `<div class="hv-sp"><i class="${orgSp.has(v) ? "" : "is-own"}" style="width:${v * 3}px"></i><b>${v}</b></div>`).join("");
  const radHtml = rad.map((v) => `<div class="hv-rad"><i style="border-radius:${v === 9999 ? "50%" : v + "px"}"></i><b>${v === 9999 ? "round" : v}</b></div>`).join("");
  return { spHtml, radHtml, n: { sp: sp.length, rad: rad.length } };
}

function motion() {
  const ms = [["Quick", "--cr-duration-insert", 120], ["Fast", "--cr-duration-fast", 160], ["Normal", "--cr-duration-normal", 240], ["Slow", "--cr-duration-slow", 420]];
  return ms.map(([n, v, d]) => `<button type="button" class="hv-motion" data-dur="var(${v})"><span class="hv-track"><i></i></span><b>${n}</b><span>${d} ms</span></button>`).join("");
}

export async function human(root) {
  const D = await (await fetch("data/simplification.json")).json();
  const P = D.profiles.P2r, B = D.before, O = D.org;
  const T = S.index.tokens;
  const aliases = T.filter((t) => t.alias).length;
  const sc = scales(D);
  const pct = (D.measured?.p2r?.delta?.colors?.pctUnder2 ?? 99.5).toFixed(1);
  const rec = (n, cls = "") => `<b class="${cls}">${nf(n)}</b>`;
  const famRows = [
    ["Colours", B.colors.tokens, P.colors.tokensAfter, O.colors.tokens, `${P.colors.referencedAfter} are actually used on screen`],
    ["Text styles", B.type.textStyles, P.textStyles.after, O.type.styles, "one family, a handful of sizes"],
    ["Font sizes", B.type.renderedSizes.light, P.fontSize.after, O.type.fontSizes, "in px"],
    ["Corner radii", P.radius.before, P.radius.after, O.radii, "the org has more, in even steps"],
    ["Spacing steps", P.spacing.before, P.spacing.after, O.spacing.space, "snapping them is a separate, optional step"],
  ];
  const fam = famRows.map(([n, a, b, c, note]) => `<tr><td>${n}<span>${note}</span></td><td>${nf(a)}</td><td>${rec(b, "is-new")}</td><td>${nf(c)}</td></tr>`).join("");
  const styles = S.index.textStyles.map((s) => `<div class="hv-ts"><span class="cr-text-${s.name.replace(/\./g, "-")}" style="${s.css ? "" : ""}">${esc(SAMPLE[s.name] ?? s.name)}</span><small>${esc(s.name)} · ${s.value.fontSize} / ${s.value.fontWeight ?? 400}</small></div>`).join("");
  const deviations = [
    ["Two blues.", "The app shell uses system blue for selected and focused things. The stage frame and handles still use the older Airtime teal."],
    ["Some type sizes do not do what the code says.", "The Record button and the stage pill buttons are written as 11 and 13 px but render at 13 and 16, because a browser reset wins. This page shows what actually renders."],
    ["Four different \"disabled\" fades.", "40, 45, 30 and 20 percent, depending on the control. They could be one value."],
    ["Pointers differ by area.", "The sidebar keeps the arrow cursor, the top bar, tray and stage buttons show a pointing hand."],
    ["A few tokens are never used.", "Some sidebar shadow and material tokens are declared but not rendered. Others only appear in hover and popup states."],
    ["Not the org system's child.", `Only ${aliases} values are exactly the org's, mostly spacing, radii and type. No colour, shadow or material matches, so they are Creator's own.`],
    ["No toast.", "The session banner is the only transient message. There is no toast component."],
  ].map(([a, b]) => `<li><b>${a}</b> ${b}</li>`).join("");
  const icons = ["cam", "media", "crop", "duplicate", "trash", "expand", "copy", "paste", "eye", "noEye", "lock", "lockOpen", "opacity", "shadow", "border", "rotate", "enhance", "padding", "stackFront", "stackBack", "alignLeft", "alignHCenter", "alignRight", "textList", "maskRectangle", "maskCircle", "maskHexagon", "more"].map((n) => `<span class="hv-icon" title="${n}">${si(n)}</span>`).join("");

  root.innerHTML = `
  <section id="h-start" class="hv-hero">
    <h1>Creator design system</h1>
    <p class="hv-lede">The look of the Creator app: colour, type, shape and the components you see in its sidebar, top bar and slide tray. It sits on top of the <b>Airtime design system</b> tokens, and adds what Creator needs that the org system does not have: a blue accent, frosted glass, and translucent ink that works in light and dark.</p>
    <div class="hv-chips"><span><b>${P.colors.tokensAfter}</b> colours</span><span><b>${P.textStyles.after}</b> text styles</span><span><b>${sc.n.rad}</b> radii</span><span><b>${sc.n.sp}</b> spacing steps</span><span><b>${aliases}</b> shared with the org</span></div>
    <div class="hv-showcase">${inSide(head("Appearance", { icon: "effects" }) + row("border", "Border", { trailing: `<span class="cr-dot" style="background:#3D7BFF"></span>` }) + seg("segmented", [{ text: "Visible" }, { text: "Blurred" }, { text: "Hidden" }], { on: 0 }) + `<div style="height:8px"></div>` + actions(2, [action("duplicate", "Duplicate"), action("trash", "Delete", { destructive: true })]))}
      <div class="hv-showcase-note"><p>These are the real components, the same markup and CSS as the Engineering view. Use the light and dark toggle at the top to flip the whole page.</p><p class="muted">Looking for values, source lines or the audit? Switch to <a href="?view=eng" data-view-link="eng">Engineering</a>.</p></div></div>
  </section>

  <section id="h-tokens"><h2>How many tokens</h2>
    <p class="hv-sub">Creator grew its own token set. The simplified set below is the agreed target: it changes almost nothing you can see: measured on the built app, ${pct}% of colour values move by less than a barely visible step.</p>
    <table class="hv-table"><thead><tr><th>Family</th><th>Today</th><th>Simplified</th><th>Airtime org</th></tr></thead><tbody>${fam}</tbody></table>
    <p class="hv-foot">The org has fewer colours because Creator draws things it has no words for: a blue accent, stage glass, translucent ink and materials.</p></section>

  <section id="h-colour"><h2>Colour</h2><p class="hv-sub">Every swatch shows light on the left and dark on the right. Checkerboard means the colour is see-through.</p>
    ${GROUPS.map(([t, d, sws]) => `<h3>${t}</h3><p class="hv-sub">${d}</p><div class="hv-swatches">${sws.map(swatch).join("")}</div>`).join("")}</section>

  <section id="h-type"><h2>Type</h2><p class="hv-sub">One system font stack: SF Pro on Apple devices, then Helvetica Neue and Arial. Weights 400, 500 and 600, plus one 300 for a caption.</p>
    <div class="hv-fonts"><div class="hv-font"><span style="font-size:44px;line-height:1;font-weight:600;letter-spacing:-0.02em">Aa</span><small>Interface text</small></div><div class="hv-font"><span class="mono" style="font-size:36px;line-height:1.1;font-family:var(--cr-font-family-mono)">Aa 01</span><small>Numbers and code</small></div></div>
    <div class="hv-ts-grid">${styles}</div></section>

  <section id="h-shape"><h2>Space and shape</h2><p class="hv-sub">Gaps come from one short scale. Filled bars are steps the org system shares; outlined ones are Creator's own.</p>
    <div class="hv-sps">${sc.spHtml}</div><h3>Corner radius</h3><div class="hv-rads">${sc.radHtml}</div>
    <h3>Motion</h3><p class="hv-sub">Click to replay. Everything eases out; the panel and stage use a soft settle.</p><div class="hv-motions">${motion()}</div></section>

  <section id="h-components"><h2>Components</h2><p class="hv-sub">The sidebar patterns, live. Each one is a real control from the app.</p><div class="hv-grid">${components()}</div>
    <h3>Icons in use</h3><div class="hv-icons">${icons}</div></section>

  <section id="h-deviations"><h2>Where Creator differs from what you might expect</h2><p class="hv-sub">Honest notes on the places where the app, the code and the org system disagree.</p><ul class="hv-dev">${deviations}</ul></section>

  <section id="h-more"><h2>More</h2><p class="hv-sub">The Engineering view has every token with its resolved value, where it is used and where it comes from, every pattern in light and dark with its states, the org relationship and the audit. It is the same page, in full.</p><p><a class="hv-btn" href="?view=eng" data-view-link="eng">Open the Engineering view</a></p></section>`;

  root.querySelectorAll(".hv-motion").forEach((b) => b.addEventListener("click", () => {
    const i = b.querySelector("i"); i.style.transition = "none"; i.style.transform = "translateX(0)"; void i.offsetWidth;
    i.style.transition = `transform ${b.dataset.dur} var(--cr-easing-settle)`; i.style.transform = "translateX(var(--hv-run))";
  }));
}
