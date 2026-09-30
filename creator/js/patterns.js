import { si, card } from "./lib.js";
import * as C from "./components.js";
const { iconToggle, row, action, actions, seg, valueField, geo, pill, sw, sw34, head, thumbRow, layerToggles, paneHead, PALETTE, art } = C;

/* Patterns registry: the sidebar (right-hand inspector) built from the atoms. */
const P = [];
const add = (id, title, use, o) => P.push({ group: "patterns", cat: "Sidebar", id, title, use, ...o });
const inSide = (inner) => card(inner, { compact: true });
const gap = (n = 8) => `<div style="height:${n}px"></div>`;
const dot = (c) => `<span class="cr-dot" style="background:${c}"></span>`;

add("pt-pane", "Pane header", "The title of a sidebar pane, with a back button and actions.", {
  tokens: ["size-pane-header", "text-1", "line", "size-hit-header"], classes: ["cr-pane-head", "has-back", "cr-pane-title", "cr-pane-actions", "cr-icontoggle"], states: ["default", "with back"],
  html: inSide(paneHead("Presenter", { actions: iconToggle("more", "More") }) + gap(4) + paneHead("Background", { back: true, actions: iconToggle("xmark", "Close") })),
});
add("pt-head", "Section head", "Names a group of controls: an icon and a title, with an optional hint or link.", {
  tokens: ["text-2", "text-5", "accent-solid", "font-size-3xs", "space-1-5"], classes: ["cr-section", "cr-section-head", "is-tall", "has-hint", "has-link", "cr-head-title", "cr-head-hint", "cr-headlink"], states: ["default", "hint", "link"],
  html: inSide(head("Appearance", { icon: "effects" }) + gap(6) + head("Crop", { link: "Reset crop" }) + gap(6) + head("Size", { hint: "Fit to slide", tall: true })),
});
add("pt-row", "Row", "One setting: an icon, a label and its current value. Selects open a popup.", {
  tokens: ["size-row", "state-hover", "state-active", "text-2", "radius-md", "shadow-focus"], classes: ["cr-row", "is-select", "is-static", "cr-row-label", "cr-dot", "cr-slot15"], states: ["default", "hover", "open", "focus", "disabled"],
  html: inSide(row("border", "Border", { trailing: dot("#3D7BFF") }) + row("effects", "Effects", { cls: "is-select", trailing: pill("Blur") }) + row("layout", "Layout", { trailing: si("chevronForward") }) + row("border", "Hover", { cls: "is-hover" }) + row("border", "Open", { cls: "is-open" }) + row("border", "Disabled", { cls: "is-disabled" })),
});
add("pt-actions", "Action buttons", "Do something once. One, two or three across.", {
  tokens: ["state-hover", "state-active", "danger-fg", "size-row", "space-1-5"], classes: ["cr-actions", "is-1", "is-2", "is-3", "cr-action", "is-compact"], states: ["default", "hover", "destructive"],
  html: inSide(actions(2, [action("duplicate", "Duplicate"), action("trash", "Delete", { destructive: true })]) + gap(6) + actions(3, [action("expand", "Full"), action("duplicate", "Copy"), action("trash", "Delete", { destructive: true })], "is-compact") + gap(6) + actions(1, [action("expand", "Fullscreen")])),
});
add("pt-seg", "Segmented control", "Pick one of a few options: text, or shapes with icons.", {
  tokens: ["state-selected", "shadow-segment-track-sidebar", "size-control", "radius-lg"], classes: ["cr-seg", "is-segmented", "is-bare", "is-shape", "cr-seg-item"], states: ["default", "selected"],
  html: inSide(seg("segmented", [{ text: "Visible" }, { text: "Blurred" }, { text: "Hidden" }], { on: 0 }) + gap(8) + seg("shape", [{ icon: "maskRectangle", text: "Rect" }, { icon: "maskCircle", text: "Circle" }, { icon: "maskHexagon", text: "Hex" }], { on: 1 })),
});
add("pt-tool", "Tool strip", "Small square tools in a row: text alignment, bold, italic, underline.", {
  tokens: ["text-3", "text-1", "state-selected", "size-control"], classes: ["cr-seg", "is-tool", "is-fill", "cr-seg-sep"], states: ["default", "selected"],
  html: inSide(seg("tool", [{ icon: "textAlignLeft", label: "Left" }, { icon: "textAlignCenter", label: "Center" }, { icon: "textAlignRight", label: "Right" }], { on: 1, fill: true }) + gap(8) + seg("tool", [{ icon: "bold", label: "Bold" }, { icon: "italic", label: "Italic" }, { icon: "underline", label: "Underline" }], { mode: "toggle", on: [0, 2], fill: true })),
});
add("pt-fields", "Value fields", "Type a value, or drag its slider. Position fields carry an axis and a unit.", {
  tokens: ["surface-inset", "shadow-field-well", "size-field-value-w", "size-field-wide-w", "popover-range"], classes: ["cr-field", "is-value", "is-wide", "is-geo", "cr-range-pop", "cr-range"], states: ["default", "hover", "focus"],
  html: inSide(`<div style="display:flex;gap:8px;justify-content:flex-end;align-items:center">${valueField("42%")}${valueField("#3D7BFF", "is-wide")}</div>${gap(8)}<div style="display:flex;gap:8px">${geo("X", "50")}${geo("Y", "50")}</div>${gap(8)}<div class="cr-range-pop" style="width:auto"><input class="cr-range" type="range" value="60" aria-label="Opacity"></div>`),
});
add("pt-swatches", "Swatches and backgrounds", "Choose a color or a background. Circles for colors, tiles when the name matters.", {
  tokens: ["swatch-ring-dot", "swatch-ring-tile", "shadow-swatch-selected-dot", "shadow-swatch-selected-tile", "size-tint-dot"], classes: ["cr-swatches", "is-circle", "is-square", "cr-swatch", "cr-none-tile", "cr-bggrid"], states: ["default", "hover", "selected", "none"],
  html: inSide(`<div class="cr-swatches is-circle" style="--cols:7" role="radiogroup">${PALETTE.slice(2, 9).map((c, i) => sw(c, { sel: i === 3 })).join("")}</div>${gap(6)}<div class="cr-swatches is-square" style="--cols:3" role="radiogroup">${sw("", { none: 1, cap: "None" })}${sw("#3D7BFF", { sel: 1, cap: "Blue" })}${sw("#FF4B3E", { cap: "Red" })}</div>`),
});
const lr = (o) => thumbRow({ trailing: layerToggles(!!o.hidden, !!o.locked), ...o });
const lrCell = (cap, ...rows) => [cap, inSide(rows.join(""))];
add("pt-layers", "Layer row", "A thing you can select, hide, lock and reorder. Hover shows the toggles.", {
  note: "Drop indicator: straight line, never a border on a rounded row.",
  both: 1, min: 250,
  tokens: ["size-thumb-row", "accent-solid", "accent-contrast", "state-hover", "state-drop-indicator", "size-0-5", "opacity-dimmed", "radius-md"], classes: ["cr-thumbrow", "is-hover", "is-selected", "is-dragging", "is-drop-above", "is-drop-below", "cr-thumb", "is-dimmed", "cr-grip", "is-locked", "cr-thumb-text"], states: ["default", "hover", "selected", "dragging", "drop-above", "drop-between", "drop-below-last", "hidden", "locked"],
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
  tokens: ["text-5", "accent-solid", "size-switch-w", "size-switch-h"], classes: ["cr-switch", "cr-logo-text", "cr-logo-name", "cr-logo-value", "cr-thumbrow"], states: ["off", "on"],
  html: inSide(thumbRow({ name: "Logo", grip: false, thumb: art("#3cb0a4", "#3b6bf0"), trailing: sw34(true) }) + thumbRow({ name: "Captions", grip: false, thumb: art("#8E9294", "#0B0F11"), trailing: sw34(false) })),
});
add("pt-popups", "Popups", "Small popups anchored to a row: a list, a grid of choices, a color panel.", {
  tokens: ["bg-panel", "shadow-popover", "accent-solid", "accent-contrast", "size-popup-color-w", "size-popup-grid-col"], classes: ["cr-popup", "is-list", "is-grid", "is-color", "cr-popup-list", "cr-popup-grid", "cr-panel-item", "is-chip", "cr-chip", "cr-popup-label"], states: ["default", "hover", "selected"],
  html: inSide(`<div style="display:grid;gap:12px;justify-items:center"><div class="cr-popup is-list"><div class="cr-popup-list">${["Blur", "Glow", "Shadow"].map((t, i) => `<button type="button" class="cr-btn0 cr-panel-item ${i === 1 ? "is-hover" : ""}" role="menuitemradio" aria-checked="${i === 0}">${t}</button>`).join("")}</div></div><div class="cr-popup is-grid"><div class="cr-popup-grid" style="grid-template-columns:repeat(3,56px)">${["Fit", "Fill", "Stretch"].map((t, i) => `<button type="button" class="cr-btn0 cr-panel-item is-chip ${i === 0 ? "is-selected" : ""}" role="radio" aria-checked="${i === 0}"><span class="cr-chip"><i></i></span>${t}</button>`).join("")}</div></div></div>`),
});
export const PATTERNS = P;
