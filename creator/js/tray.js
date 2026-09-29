import { pattern, icon, glyph, mm } from "./lib.js";
const G = (cap, html) => ({ cap, html });
const tb = (ic, label, cls = "", attrs = "") => `<button type="button" class="cr-btn0 cr-traybtn ${cls}" aria-label="${label}" ${attrs}>${icon(ic)}</button>`;
const add = (cls = "", dis) => `<button type="button" class="cr-btn0 cr-addslide ${cls}" ${dis ? "disabled" : ""}>${icon("Plus")}<span>Add Slide</span></button>`;
const art = (a, b) => `<span class="art" style="background:linear-gradient(135deg,${a},${b})"></span>`;
const tile = (n, cls = "", attrs = "", a = "#3cb0a4", b = "#3b6bf0") => `<div class="cr-tile ${cls}" ${attrs}><button type="button" class="cr-btn0 face" aria-label="Slide ${n}">${art(a, b)}</button><span class="num">${n}</span><button type="button" class="cr-btn0 act edit" aria-label="Show layers">${glyph("Sliders")}</button><button type="button" class="cr-btn0 act menu" aria-label="Slide options">${icon("Ellipsis")}</button></div>`;
export function tray(root) {
  const P = [];
  P.push(pattern({
    id: "tr-tray", title: "Slide tray (assembled)", org: ["creator-only", "-"], raw: true,
    note: "The tray area sits under the stage (z 15): a floating 40px console (Add Slide, Import, Speaker Notes, counter, previous, next, About) straddling the top of a 116px surface (radius 2xl, mat.hud, band-pill) holding a scrolling lane of 78px-tall 16:10 tiles on a 12px gap.",
    css: ["cr-tray-area", "cr-tray-surface", "cr-tray-controls"], src: ["tr.tray"],
    anatomy: [["Area", "padding-top 16 (gutter), gap 4, z 15", "size.creator.tray, z.tray"], ["Surface", "116px, radius 2xl, mat.hud, band-pill", "radius.2xl, shadow.band-pill"], ["Console", "40px, padding 0 6, gap 4, radius xl, tray-console shadow", "shadow.tray-console"], ["Lane", "tiles 78px tall, gap 12", "size.creator.slide-thumbnail"]],
    groups: [G("assembled", `<div class="cr-tray-area" style="padding-top:0"><div class="cr-tray-controls">${add()}${tb("NewImportPresentation", "Import slides")}${tb("SpeakerNotes", "Speaker Notes")}<span class="cr-counter" role="status">01 / 03</span>${tb("SlidePrevious", "Previous Slide", "", "disabled")}${tb("SlideNext", "Next Slide")}${tb("InfoTip", "About slides")}</div><div class="cr-tray-surface">${tile("1", "is-selected")}${tile("2", "", "", "#e0453a", "#f0a23c")}${tile("3", "", "", "#222", "#666")}</div></div>`)],
  }));
  const st = [["default", ""], ["hover", "is-hover"], ["pressed", "is-pressed"], ["focus-visible", "is-focus"], ["disabled", "is-disabled"]];
  P.push(pattern({
    id: "tr-buttons", title: "Tray buttons, Add Slide and counter", org: ["differs", "Org button.css primary is teal 32-40px; Add Slide is the accent-blue 32px solid button (radius md)."], raw: true, flex: true,
    note: "`tray` variant icon buttons are 32px, radius md, transparent, hover state.hover; Add Slide is the `addSlide` variant (accent.solid on accent.contrast, 13px/500, hover accent.hover). The counter is 12px content.tertiary with tabular numerals in a 46px box.",
    css: ["cr-traybtn", "cr-addslide", "cr-counter", "cr-tray-controls"], src: ["tr.tray"],
    anatomy: [["Icon button", "32x32, radius md, glyph 20", "size.8, radius.md"], ["Add Slide", "h32, padding 0 8, gap 4, radius md, accent.solid", "color.accent-solid, color.accent-hover"], ["Counter", "12/15, content.tertiary, tabular, 46px", "size.creator.slide-counter"], ["Disabled", "opacity .45", "opacity.disabled-button"]],
    groups: [...st.map(([n, c]) => G("icon · " + n, tb("Redo", n, c, n === "disabled" ? "disabled" : ""))), ...st.map(([n, c]) => G("add · " + n, add(c, n === "disabled"))), G("counter", `<span class="cr-counter">01 / 03</span>`)],
  }));
  P.push(pattern({
    id: "tr-tile", title: "Slide tile (default, hover, selected, dragging, drop edge, actions)", org: ["creator-only", "Org thumbnail.css is a media tile; a slide tile carries its own outline, number badge and hover actions."], raw: true, flex: true,
    note: "The tile is a 78px-tall 16:10 button (radius lg). State is drawn with a 2px <b>outline</b> at 1px offset (transparent at rest, line.strong on hover, accent.solid selected) so the tile never reflows. The slide number sits bottom-right in a dark 9px badge; two 24px chips (layers/edit at left, options at right; slide.badge black 80%, white art in both themes) fade in on hover, focus-within and when selected. Dragging is opacity .5; the drop target shows a 2px accent bar centred in the 12px gap.",
    css: ["cr-tile"], src: ["tr.tile"],
    anatomy: [["Tile", "h78, aspect 16/10, radius lg, outline 2px offset 1px", "size.creator.slide-thumbnail, radius.lg"], ["Hover", "outline line.strong", "color.line-strong"], ["Selected", "outline accent.solid; actions always shown", "color.accent-solid"], ["Number", "9px/11, tabular, slide.badge, ink.dark.primary", "text-style nano, color.slide-badge"], ["Action chip", "24px, radius 6px, slide.badge, on-badge; edit adds a drop shadow", "shadow.tile-action, color.on-badge"], ["Drop edge", "2px accent bar at -6px (half the lane gap)", "color.state-drop-indicator"], ["Dragging", "opacity .5", ""]],
    groups: [G("default", tile("1")), G("hover (actions shown)", tile("2", "is-hover")), G("selected", tile("3", "is-selected")), G("focus-visible", tile("4", "is-focus")), G("dragging", tile("5", "is-dragging")), G("drop before", `<div style="padding-left:10px">${tile("6", "", 'data-drop-edge="before"')}</div>`), G("drop after", `<div style="padding-right:10px">${tile("7", "", 'data-drop-edge="after"')}</div>`)],
  }));
  root.innerHTML = `<section id="tray"><h2>Slide tray</h2><p class="lede">Tiles, selection, the tile hover menu and the console. The counter, previous/next and add slide live in the floating console above the lane.</p>${P.join("")}</section>`;
}
