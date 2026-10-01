import { si, card } from "./lib.js";
import * as C from "./components.js";
const { iconToggle, row, action, actions, seg, valueField, geo, pill, sw, sw34, head, thumbRow, layerToggles, paneHead, menu, menuItem, menuCheck, PALETTE, art } = C;

/* Patterns registry: the sidebar (right-hand inspector) built from the atoms. */
const P = [];
const add = (id, title, use, o) => P.push({ group: "patterns", cat: "Sidebar", id, title, use, ...o });
const inSide = (inner) => card(inner, { compact: true });
const gap = (n = 8) => `<div style="height:${n}px"></div>`;
const dot = (c) => `<span class="cr-dot" style="background:${c}"></span>`;

add("pt-pane", "Pane header", "The title of a sidebar pane, with a back button and actions.", {
  tokens: ["control-md", "content-primary", "lighting-shade", "radius-md"], classes: ["cr-pane-head", "has-back", "cr-pane-title", "cr-pane-actions", "cr-icontoggle"], states: ["default", "with back"],
  html: `<div class="cr-sidebar">${paneHead("Presenter", { actions: iconToggle("more", "More") })}${gap(4)}${paneHead("Background", { back: true, actions: iconToggle("xmark", "Close") })}</div>`,
});
add("pt-head", "Section head", "Names a group of controls: an icon and a title, with an optional hint or link.", {
  tokens: ["content-secondary", "content-tertiary", "accent-teal", "font-size-3xs", "space-1-5"], classes: ["cr-section", "cr-section-head", "is-tall", "has-hint", "has-link", "cr-head-title", "cr-head-hint", "cr-headlink"], states: ["default", "hint", "link"],
  html: inSide(head("Appearance", { icon: "effects" }) + gap(6) + head("Crop", { link: "Reset crop" }) + gap(6) + head("Size", { hint: "Fit to slide", tall: true })),
});
add("pt-row", "Row", "One setting: an icon, a label and its current value. Selects open a popup.", {
  tokens: ["row", "lighting-shade", "content-secondary", "radius-md", "icon", "focus"], classes: ["cr-row", "is-select", "is-static", "cr-row-label", "cr-dot", "cr-slot15"], states: ["default", "hover", "open", "focus", "disabled"],
  html: inSide(row("border", "Border", { trailing: dot("#3D7BFF") }) + row("effects", "Effects", { cls: "is-select", trailing: pill("Blur") }) + row("layout", "Layout", { trailing: si("chevronForward") }) + row("border", "Hover", { cls: "is-hover" }) + row("border", "Open", { cls: "is-open" }) + row("border", "Disabled", { cls: "is-disabled" })),
});
add("pt-actions", "Action buttons", "Do something once. One, two or three across.", {
  tokens: ["lighting-highlight-secondary", "lighting-shade", "accent-destructive", "raised", "control-md", "space-1-5"], classes: ["cr-actions", "is-1", "is-2", "is-3", "cr-action", "is-compact"], states: ["default", "hover", "destructive"],
  html: inSide(actions(2, [action("duplicate", "Duplicate"), action("trash", "Delete", { destructive: true })]) + gap(6) + actions(3, [action("expand", "Full"), action("duplicate", "Copy"), action("trash", "Delete", { destructive: true })], "is-compact") + gap(6) + actions(1, [action("expand", "Fullscreen")])),
});
add("pt-seg", "Segmented control", "Pick one of a few options: text, or shapes with icons. Three looks: filled (the default), outline and ghost. Frame uses ghost.", {
  tokens: ["lighting-shade", "lighting-highlight-secondary", "raised", "inset", "control-md", "radius-md"], classes: ["cr-seg", "is-segmented", "is-bare", "is-shape", "cr-seg-item"], states: ["default", "selected"],
  html: inSide(seg("segmented", [{ text: "Visible" }, { text: "Blurred" }, { text: "Hidden" }], { on: 0 }) + gap(8) + seg("segmented", [{ text: "Visible" }, { text: "Blurred" }, { text: "Hidden" }], { on: 1, look: "outline" }) + gap(8) + seg("bare", [{ text: "16:9" }, { text: "1:1" }, { text: "4:3" }, { text: "Fit" }, { text: "Fill" }], { on: 0, look: "ghost" }) + gap(8) + seg("shape", [{ icon: "maskRectangle", text: "Rect" }, { icon: "maskCircle", text: "Circle" }, { icon: "maskHexagon", text: "Hex" }], { on: 1 })),
});
add("pt-tool", "Tool strip", "Small square tools in a row: text alignment, bold, italic, underline.", {
  tokens: ["content-tertiary", "content-primary", "lighting-shade", "control-sm", "control-md"], classes: ["cr-seg", "is-tool", "is-fill", "cr-seg-sep"], states: ["default", "selected"],
  html: inSide(seg("tool", [{ icon: "textAlignLeft", label: "Left" }, { icon: "textAlignCenter", label: "Center" }, { icon: "textAlignRight", label: "Right" }], { on: 1, fill: true }) + gap(8) + seg("tool", [{ icon: "bold", label: "Bold" }, { icon: "italic", label: "Italic" }, { icon: "underline", label: "Underline" }], { mode: "toggle", on: [0, 2], fill: true })),
});
add("pt-fields", "Value fields", "Type a value, or drag its slider. Position fields carry an axis and a unit.", {
  tokens: ["lighting-shade", "inset", "focus", "control-md", "radius-sm", "knob"], classes: ["cr-field", "is-value", "is-wide", "is-geo", "cr-range"], states: ["default", "hover", "focus"],
  html: inSide(`<div style="display:flex;gap:8px;justify-content:flex-end;align-items:center">${valueField("42%")}${valueField("#3D7BFF", "is-wide")}</div>${gap(8)}<div style="display:flex;gap:8px">${geo("X", "50")}${geo("Y", "50")}</div>${gap(8)}<input class="cr-range" type="range" value="60" aria-label="Opacity">`),
});
add("pt-swatches", "Swatches and backgrounds", "Choose a color or a background. Circles for colors, tiles when the name matters.", {
  tokens: ["lighting-shade", "content-primary", "accent-teal", "modeless-white24", "modeless-overlay", "icon"], classes: ["cr-swatches", "is-circle", "is-square", "cr-swatch", "cr-none-tile", "cr-bggrid"], states: ["default", "hover", "selected", "none"],
  html: inSide(`<div class="cr-swatches is-circle" style="--cols:7" role="radiogroup">${PALETTE.slice(2, 9).map((c, i) => sw(c, { sel: i === 3 })).join("")}</div>${gap(6)}<div class="cr-swatches is-square" style="--cols:3" role="radiogroup">${sw("", { none: 1, cap: "None" })}${sw("#3D7BFF", { sel: 1, cap: "Blue" })}${sw("#FF4B3E", { cap: "Red" })}</div>`),
});
const lr = (o) => thumbRow({ trailing: layerToggles(!!o.hidden, !!o.locked), ...o, cls: "is-layer " + (o.cls ?? "") });
const lrCell = (cap, ...rows) => [cap, inSide(rows.join(""))];
add("pt-layers", "Layer row", "A thing you can select, hide, lock and reorder. Hover shows the toggles.", {
  note: "Drop indicator: straight line, never a border on a rounded row.",
  both: 1, min: 250,
  tokens: ["row", "modeless-teal", "modeless-white", "lighting-shade", "accent-teal", "control-sm", "opacity-disabled", "radius-sm"], classes: ["cr-thumbrow", "is-hover", "is-selected", "is-dragging", "is-drop-above", "is-drop-below", "cr-thumb", "is-dimmed", "cr-grip", "is-locked", "cr-thumb-text"], states: ["default", "hover", "selected", "dragging", "drop-above", "drop-between", "drop-below-last", "hidden", "locked"],
  cells: [
    lrCell("default", lr({ name: "Presenter" })),
    lrCell("hover", lr({ name: "Presenter", cls: "is-hover" })),
    lrCell("selected", lr({ name: "Presenter", sel: 1 })),
    lrCell("dragging", lr({ name: "Presenter", dragging: 1 })),
    lrCell("drop-above", lr({ name: "Image 1", drop: "above" }), lr({ name: "Logo" })),
    lrCell("drop-between", lr({ name: "Image 1" }), lr({ name: "Logo", drop: "above" }), lr({ name: "Text" })),
    lrCell("drop-below-last", lr({ name: "Logo" }), lr({ name: "Text", drop: "below" })),
    lrCell("hidden", lr({ name: "Logo", hidden: 1 })),
    lrCell("locked", lr({ name: "Text", locked: 1 })),
    lrCell("selected, hover", lr({ name: "Image 1", sel: 1, cls: "is-hover" })),
  ],
});
add("pt-switch", "Switch row", "A row with a name, a value and a switch.", {
  tokens: ["content-tertiary", "accent-teal", "lighting-shade", "knob", "control-sm"], classes: ["cr-switch", "cr-logo-text", "cr-logo-name", "cr-logo-value", "cr-thumbrow"], states: ["off", "on"],
  html: inSide(thumbRow({ name: "Logo", grip: false, thumb: art("#3cb0a4", "#3b6bf0"), trailing: sw34(true) }) + thumbRow({ name: "Captions", grip: false, thumb: art("#8E9294", "#0B0F11"), trailing: sw34(false) })),
});
add("pt-popups", "Popups", "A sidebar control opens the standard glass menu: a list of choices with a right-aligned check, or a grid of preview chips.", {
  tokens: ["background-tertiary", "menu", "modeless-teal", "modeless-white", "accent-teal", "blur-large", "radius-xl"], classes: ["cr-menu", "cr-menu-item", "chk", "cr-popup", "cr-popup-grid", "cr-panel-item", "cr-chip"], states: ["default", "hover", "selected"],
  html: `<div class="at-popups">${menu(["Blur", "Glow", "Shadow"].map((t, i) => menuItem("", t, i === 1 ? "is-hover" : "", "role=\"menuitemradio\" aria-checked=\"" + (i === 0) + "\"", i === 0 ? menuCheck() : "")).join(""))}${menu(`<div class="cr-popup-grid" style="grid-template-columns:repeat(3,56px)">${["Fit", "Fill", "Stretch"].map((t, i) => `<button type="button" class="cr-btn0 cr-panel-item ${i === 0 ? "is-selected" : ""}" role="radio" aria-checked="${i === 0}"><span class="cr-chip"><i></i></span>${t}</button>`).join("")}</div>`)}</div>`,
});
export const PATTERNS = P;
