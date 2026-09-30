import { si } from "./lib.js";
import { ICON_SRC } from "./icons.js";
import * as C from "./components.js";
const { FORCE, dis, button, iconBtn, textInput, check, radio, tag, menuItem, menu, sw, sw34, seg, valueField, geo, pill, action, iconToggle, PALETTE } = C;

/* Atoms registry. Each entry: group, category, id, title, one-line use, token names, class names, states, surface, cells.
   cells = [[caption, html], ...]. Both the Overview cards and the Engineering tables are generated from this list. */
const st = (names, fn) => names.map((n) => [n, fn(FORCE[n], n)]);
const A = [];
const add = (cat, id, title, use, o) => A.push({ group: "atoms", cat, id, title, use, surface: "panel", ...o });
const SB = "side";

/* ---------- Buttons ---------- */
const B5 = ["default", "hover", "pressed", "focus", "disabled"];
add("Buttons", "btn-primary", "Primary button", "The one main action in a dialog or bar. Danger swaps the fill to red.", {
  tokens: ["accent-solid", "accent-hover", "accent-contrast", "danger-solid", "danger-hover", "shadow-button-solid", "radius-md", "opacity-disabled-button"],
  classes: ["cr-button", "is-solid", "is-md", "is-danger"], states: B5,
  cells: [...st(B5, (c, n) => button("solid", "Button", c, dis(n))), ["danger", button("solid", "Delete", "is-danger")], ["danger hover", button("solid", "Delete", "is-danger is-hover")], ["md size", button("solid", "Medium", "is-md")], ["with icon", button("solid", si("plus") + "Add")]],
});
add("Buttons", "btn-secondary", "Secondary button", "Sits next to a primary action, or stands alone for a lesser one.", {
  tokens: ["bg-panel", "bg-subtle", "text-1", "shadow-button-secondary", "radius-md"], classes: ["cr-button", "is-surface"], states: B5,
  cells: [...st(B5, (c, n) => button("surface", "Button", c, dis(n))), ["with icon", button("surface", si("duplicate") + "Copy")]],
});
add("Buttons", "btn-quiet", "Quiet button", "A bare label that fills on hover. For toolbars and low-emphasis actions.", {
  tokens: ["text-2", "text-1", "state-hover", "state-active"], classes: ["cr-button", "is-ghost"], states: [...B5, "open"],
  cells: st([...B5, "open"], (c, n) => button("ghost", "Button", c, dis(n))),
});
add("Buttons", "btn-action", "Action button", "A sidebar button that does something once: duplicate, delete, go fullscreen.", {
  surface: SB, tokens: ["state-hover", "state-active", "state-active-strong", "danger-fg", "size-row", "radius-md"], classes: ["cr-action", "cr-actions", "is-1", "is-2", "is-3", "is-compact"], states: B5,
  cells: [...st(B5, (c, n) => `<div class="w150">${action("duplicate", "Duplicate", { cls: c, dis: n === "disabled" })}</div>`), ["destructive", `<div class="w150">${action("trash", "Delete", { destructive: true })}</div>`], ["destructive hover", `<div class="w150">${action("trash", "Delete", { destructive: true, cls: "is-hover" })}</div>`]],
});
const IB = ["default", "hover", "pressed", "focus", "selected", "disabled"];
add("Buttons", "btn-icon", "Icon button", "A round, quiet button for a small action such as undo or a sidebar toggle.", {
  tokens: ["header-history-hover", "state-active", "state-active-strong", "text-3", "size-8", "opacity-disabled-icon", "shadow-focus"], classes: ["cr-iconbtn", "is-toggle", "is-quiet"], states: IB,
  cells: [...st(IB, (c, n) => iconBtn("sidebarRight", n, "is-toggle " + c, (n === "selected" ? 'aria-pressed="true"' : "") + " " + dis(n))), ["help (quiet)", iconBtn("help", "Help", "is-quiet")]],
});
add("Buttons", "btn-icontoggle", "Sidebar icon toggle", "A small round toggle in a sidebar header or row: show, hide, lock.", {
  surface: SB, tokens: ["state-hover", "state-active", "text-3", "text-1", "size-hit-header", "size-hit-inline"], classes: ["cr-icontoggle", "is-inline", "is-back"], states: IB,
  cells: [...st(IB, (c, n) => iconToggle("eye", n, { cls: c, pressed: n === "selected" ? "true" : undefined, dis: n === "disabled" })), ["inline", iconToggle("eye", "Hide layer", { cls: "is-inline" })], ["inline pressed", iconToggle("lock", "Unlock", { cls: "is-inline", pressed: "true" })]],
});
const TS = ["default", "hover", "focus", "selected", "disabled"];
const toolItem = (ic, c, n) => `<div class="cr-seg is-tool"><button type="button" class="cr-btn0 cr-seg-item ${c}" aria-label="${n}" aria-pressed="${n === "selected"}" ${dis(n)}>${si(ic)}</button></div>`;
add("Buttons", "btn-tool", "Tool-strip toggle", "A small square tool inside a strip: text alignment, bold, italic.", {
  surface: SB, tokens: ["text-3", "text-1", "state-selected", "size-control", "radius-md"], classes: ["cr-seg", "is-tool", "cr-seg-item", "is-fill"], states: TS,
  cells: [...st(TS, (c, n) => toolItem("textAlignCenter", c, n)), ["strip", seg("tool", [{ icon: "textAlignLeft", label: "Left" }, { icon: "textAlignCenter", label: "Center" }, { icon: "textAlignRight", label: "Right" }], { on: 1 })], ["toggles", seg("tool", [{ icon: "bold", label: "Bold" }, { icon: "italic", label: "Italic" }, { icon: "underline", label: "Underline" }], { mode: "toggle", on: [0, 2] })]],
});
const segState = (c, n) => `<div class="w180">${seg("segmented", [{ text: "Visible", cls: n === "selected" ? "is-selected" : "" }, { text: "Blurred", cls: n === "selected" ? "" : c, dis: n === "disabled" }, { text: "Hidden" }], { on: n === "selected" ? 0 : 0 })}</div>`;
add("Buttons", "btn-segment", "Segmented item", "Pick one of a few options. The selected item is filled.", {
  surface: SB, tokens: ["state-selected", "text-2", "text-1", "shadow-segment-track-sidebar", "size-control", "radius-lg"], classes: ["cr-seg", "is-segmented", "is-bare", "is-shape", "cr-seg-item"], states: TS,
  cells: [...st(TS, segState), ["shapes", `<div class="w180">${seg("shape", [{ icon: "maskRectangle", text: "Rect" }, { icon: "maskCircle", text: "Circle" }, { icon: "maskHexagon", text: "Hex" }], { on: 1 })}</div>`]],
});
add("Buttons", "chip", "Chip", "A small pill for a filter, a tag or a removable value.", {
  tokens: ["state-hover", "state-active", "accent-subtle", "accent-fg", "radius-full"], classes: ["cr-tag"], states: ["default", "hover", "pressed", "focus", "selected", "disabled"],
  cells: [...st(["default", "hover", "pressed", "focus", "selected", "disabled"], (c, n) => tag("Chip", c, (n === "selected" ? 'aria-pressed="true"' : "") + " " + dis(n))), ["removable", tag("Blur", "", "", true)]],
});
add("Buttons", "link", "Link", "Text that goes somewhere. Blue, underlined on hover.", {
  tokens: ["accent-fg", "accent-hover", "opacity-disabled"], classes: ["cr-link", "cr-headlink"], states: ["default", "hover", "pressed", "focus", "disabled"],
  cells: st(["default", "hover", "pressed", "focus", "disabled"], (c, n) => `<a class="cr-link ${c}" href="#a-link" ${n === "disabled" ? 'aria-disabled="true"' : ""}>Learn more</a>`),
});

/* ---------- Inputs ---------- */
const F5 = ["default", "hover", "focus", "error", "disabled"];
add("Inputs", "field-number", "Number field", "A short value in a sunken well. Right aligned, tabular numbers.", {
  min: 108,
  surface: SB, tokens: ["surface-inset", "shadow-field-well", "shadow-field-well-hover", "shadow-field-focus", "danger-solid", "size-field-value-w", "size-control"], classes: ["cr-field", "is-value", "is-wide", "is-geo", "is-error"], states: F5,
  cells: [...st(F5, (c, n) => valueField("42%", "is-value", c, dis(n))), ["wide (hex)", valueField("#3D7BFF", "is-wide")], ["with axis and unit", `<div style="width:84px">${geo("X", "50")}</div>`]],
});
add("Inputs", "text-input", "Text input", "One line of free text, with a label and a line of help.", {
  tokens: ["surface-inset", "shadow-field-well", "shadow-field-focus", "text-1", "text-5", "danger-fg", "size-7"], classes: ["cr-input", "cr-label", "cr-help", "cr-fieldset", "is-error"], states: F5,
  cells: st(F5, (c, n) => `<div class="cr-fieldset w180"><span class="cr-label">Name</span>${textInput(n === "error" ? "" : "Scratchpad", { ph: "Untitled", cls: c, d: dis(n) })}<span class="cr-help ${n === "error" ? "is-error" : ""}">${n === "error" ? "A name is required." : "Shown in the top bar."}</span></div>`),
});
add("Inputs", "textarea", "Text area", "Several lines of text, such as speaker notes.", {
  tokens: ["surface-inset", "shadow-field-well", "shadow-field-focus"], classes: ["cr-input", "is-area"], states: F5,
  cells: st(F5, (c, n) => `<div class="w180"><label class="cr-input is-area ${c}"><textarea rows="3" aria-label="Notes" ${dis(n)}>Open with the demo.</textarea></label></div>`),
});
add("Inputs", "select", "Select", "Choose one item from a list. Opens a popup list.", {
  surface: SB, tokens: ["pill-fill", "shadow-pill", "text-4", "size-control"], classes: ["cr-field", "is-pill", "is-fill", "is-compact"], states: ["default", "focus", "disabled"],
  cells: st(["default", "focus", "disabled"], (c) => `<div class="w150">${pill("Blur", "is-fill " + c)}</div>`),
});
add("Inputs", "combo", "Combobox with unit", "A number you can type or pick, with its unit beside it.", {
  tokens: ["surface-inset", "shadow-field-well", "text-5", "line"], classes: ["cr-input", "is-combo", "cr-unit", "cr-caret"], states: F5,
  cells: st(F5, (c, n) => `<div class="w150"><label class="cr-input ${c}"><input value="24" aria-label="Size" ${dis(n)}><span class="cr-unit">px</span><span class="cr-caret">${si("chevronDown")}</span></label></div>`),
});
add("Inputs", "search", "Search field", "Filter a list as you type. A clear button appears when there is text.", {
  tokens: ["surface-inset", "shadow-field-well", "text-4", "text-5"], classes: ["cr-input", "is-search", "cr-clear"], states: F5,
  cells: [...st(F5, (c, n) => `<div class="w180"><label class="cr-input ${c}">${si("search")}<input placeholder="Search" aria-label="Search" ${dis(n)}></label></div>`), ["with text", `<div class="w180"><label class="cr-input">${si("search")}<input value="blur" aria-label="Search"><span class="cr-clear">${si("xmark")}</span></label></div>`]],
});
add("Inputs", "stepper", "Stepper", "Nudge a number up or down by one.", {
  tokens: ["surface-inset", "shadow-field-well", "state-hover", "state-active", "size-7"], classes: ["cr-stepper", "is-disabled"], states: ["default", "hover", "pressed", "focus", "disabled"],
  cells: st(["default", "hover", "pressed", "focus", "disabled"], (c, n) => `<div class="cr-stepper ${n === "disabled" ? "is-disabled" : ""}"><button type="button" class="cr-btn0 ${n === "default" ? "" : c}" aria-label="Less" ${dis(n)}>${si("chevronBack")}</button><output>12</output><button type="button" class="cr-btn0" aria-label="More" ${dis(n)}>${si("chevronForward")}</button></div>`),
});

/* ---------- Choice and color ---------- */
add("Choice", "checkbox", "Checkbox", "Turn an option on or off in a list of options.", {
  tokens: ["accent-solid", "accent-contrast", "surface-inset", "line-strongest", "danger-solid", "size-4", "radius-xs"], classes: ["cr-check", "cr-choice", "is-error"], states: ["default", "hover", "focus", "checked", "mixed", "error", "disabled"],
  cells: [["default", check("", false)], ["hover", check("is-hover", false)], ["focus", check("is-focus", false)], ["checked", check("", true)], ["mixed", check("", "mixed")], ["error", check("is-error", false)], ["disabled", check("is-disabled", true, "disabled")], ["with label", `<span class="cr-choice">${check("", true)}Show grid</span>`]],
});
add("Choice", "radio", "Radio", "Pick exactly one of a few options.", {
  tokens: ["accent-solid", "accent-contrast", "surface-inset", "line-strongest", "size-4", "radius-full"], classes: ["cr-radio", "cr-choice"], states: ["default", "hover", "focus", "selected", "error", "disabled"],
  cells: [["default", radio("", false)], ["hover", radio("is-hover", false)], ["focus", radio("is-focus", false)], ["selected", radio("", true)], ["error", radio("is-error", false)], ["disabled", radio("is-disabled", true, "disabled")], ["with label", `<span class="cr-choice">${radio("", true)}Light</span>`]],
});
add("Choice", "switch", "Switch", "Turn something on or off right away.", {
  surface: SB, tokens: ["accent-solid", "line-strong", "knob", "shadow-switch-track", "shadow-switch-knob", "size-switch-w", "size-switch-h"], classes: ["cr-switch"], states: ["off", "off hover", "on", "on hover", "focus", "disabled"],
  cells: [["off", sw34(false)], ["off hover", sw34(false, "is-hover")], ["on", sw34(true)], ["on hover", sw34(true, "is-hover")], ["focus", sw34(true, "is-focus")], ["disabled", sw34(false, "is-disabled", "disabled")]],
});
const rng = (v, cls = "", a = "") => `<div class="w150"><input class="cr-range has-fill ${cls}" type="range" value="${v}" style="--fill:${v}%" aria-label="Opacity" ${a}></div>`;
add("Choice", "slider", "Slider", "Drag to change a value across a range. Shown with the value beside it.", {
  tokens: ["accent-solid", "state-active", "knob", "shadow-range-track", "shadow-range-thumb", "size-range-track", "size-range-thumb"], classes: ["cr-range", "has-fill", "cr-range-pop", "cr-range-line"], states: ["0", "50", "100", "hover", "focus", "disabled"],
  cells: [["0", rng(0)], ["50", rng(50)], ["100", rng(100)], ["hover", rng(50, "is-hover")], ["focus", rng(50, "is-focus")], ["disabled", rng(50, "", "disabled")], ["with value", `<div class="cr-range-line w180"><input class="cr-range has-fill" type="range" value="60" style="--fill:60%" aria-label="Size"><output>60</output></div>`]],
});
add("Choice", "swatch", "Swatch and color well", "Pick a color. The struck-through tile means none.", {
  surface: SB, tokens: ["swatch-ring-dot", "swatch-ring-tile", "swatch-none-fill", "swatch-none-slash", "dash", "shadow-swatch-selected-dot", "shadow-swatch-selected-tile", "size-tint-dot", "size-color-dot"], classes: ["cr-swatches", "is-circle", "is-square", "cr-swatch", "cr-dot", "cr-none-tile", "is-none"], states: ["default", "hover", "focus", "selected", "none"],
  cells: [["default", `<div class="cr-swatches is-circle" style="--cols:1">${sw("#3D7BFF")}</div>`], ["hover", `<div class="cr-swatches is-circle" style="--cols:1">${sw("#3D7BFF", { cls: "is-hover" })}</div>`], ["focus", `<div class="cr-swatches is-circle" style="--cols:1">${sw("#3D7BFF", { cls: "is-focus" })}</div>`], ["selected", `<div class="cr-swatches is-circle" style="--cols:1">${sw("#3D7BFF", { sel: 1 })}</div>`],
    ["none (empty ring)", `<div class="cr-swatches is-square w80" style="--cols:1">${sw("", { none: 1, cap: "None" })}</div>`], ["tile", `<div class="cr-swatches is-square w80" style="--cols:1">${sw("#FF4B3E", { cap: "Red" })}</div>`], ["tile selected", `<div class="cr-swatches is-square w80" style="--cols:1">${sw("#FF4B3E", { sel: 1, cap: "Red" })}</div>`], ["color well dot", `<span class="cr-dot" style="background:#3D7BFF"></span>`], ["dot, none", `<span class="cr-dot is-none"></span>`]],
});

/* ---------- Menus and feedback ---------- */
const MI = ["default", "hover", "checked", "disabled", "destructive", "destructive hover", "submenu"];
add("Menus and feedback", "menu-item", "Menu item", "One choice in a menu. Blue when highlighted, red when destructive.", {
  tokens: ["accent-solid", "accent-contrast", "danger-fg", "danger-solid", "text-2", "text-4", "opacity-disabled-button", "radius-md"], classes: ["cr-menu-item", "cr-menu", "cr-menu-sep", "cr-menu-label"], states: MI,
  cells: [["default", menu(menuItem("duplicate", "Duplicate"), 180)], ["hover", menu(menuItem("duplicate", "Duplicate", "is-hover"), 180)], ["checked", menu(menuItem("check", "Autosave"), 180)], ["disabled", menu(menuItem("duplicate", "Duplicate", "is-disabled", "disabled"), 180)], ["destructive", menu(menuItem("trash", "Delete", "", "data-destructive"), 180)], ["destructive hover", menu(menuItem("trash", "Delete", "is-hover", "data-destructive"), 180)], ["submenu", menu(menuItem("", "Open recent", "", "", `<span class="ind">${si("chevronForward")}</span>`), 180)]],
});
add("Menus and feedback", "tooltip", "Tooltip", "A short name for an icon-only control. Raised surface, same in both themes.", {
  tokens: ["bg-panel", "content-primary", "highlight-primary", "shadow-tooltip", "radius-sm"], classes: ["cr-tooltip"], states: ["default"],
  cells: [["default", `<span class="cr-tooltip">Show layers</span>`], ["long", `<span class="cr-tooltip">Not available yet</span>`]],
});
add("Menus and feedback", "badge", "Badge and count", "A tiny status or number beside a label.", {
  tokens: ["highlight-primary", "status-live-fill", "status-live-text", "accent-solid", "radius-full"], classes: ["cr-badge", "cr-count", "cr-statuschip"], states: ["default", "live", "count"],
  cells: [["default", `<span class="cr-badge">Draft</span>`], ["live", `<span class="cr-badge" data-live><i></i>Recording</span>`], ["count", `<span class="cr-count">3</span>`], ["count, wide", `<span class="cr-count">12</span>`]],
});
add("Menus and feedback", "kbd", "Keyboard hint", "The shortcut for an action, shown at the end of a menu row.", {
  tokens: ["state-hover", "line-strong", "text-3", "radius-xs"], classes: ["cr-kbd"], states: ["default"],
  cells: [["single", `<span class="cr-kbd">V</span>`], ["combo", `<span style="display:inline-flex;gap:3px"><span class="cr-kbd">⌘</span><span class="cr-kbd">D</span></span>`], ["in a menu row", menu(menuItem("duplicate", "Duplicate", "", "", `<span style="display:inline-flex;gap:3px"><span class="cr-kbd">⌘</span><span class="cr-kbd">D</span></span>`), 200)]],
});
add("Menus and feedback", "avatar", "Avatar and thumbnail", "Who is signed in, and a small picture of a layer or slide.", {
  tokens: ["bg-emphasized", "shadow-avatar", "shadow-avatar-hover", "shadow-thumb-ring", "size-thumb-w", "size-thumb-h", "radius-xs"], classes: ["cr-avatar", "cr-thumb", "cr-thumb-art", "cr-checker"], states: ["default", "hover", "focus"],
  cells: [["default", `<button type="button" class="cr-btn0 cr-avatar" aria-label="Account menu"><span>D</span></button>`], ["hover", `<button type="button" class="cr-btn0 cr-avatar is-hover" aria-label="Account menu"><span>D</span></button>`], ["focus", `<button type="button" class="cr-btn0 cr-avatar is-focus" aria-label="Account menu"><span>D</span></button>`], ["thumbnail", `<span class="cr-thumb">${C.art()}</span>`], ["dimmed", `<span class="cr-thumb is-dimmed">${C.art()}</span>`], ["transparent", `<span class="cr-thumb cr-checker"></span>`]],
});
add("Menus and feedback", "progress", "Progress and loading", "Shows work in flight: a bar for known progress, a spinner for unknown.", {
  tokens: ["accent-solid", "status-live", "state-active", "radius-full"], classes: ["cr-progress", "is-live", "cr-spinner"], states: ["0", "40", "100", "live", "disabled"],
  cells: [["0%", `<div class="w150"><span class="cr-progress" style="--v:0%"><i></i></span></div>`], ["40%", `<div class="w150"><span class="cr-progress" style="--v:40%"><i></i></span></div>`], ["100%", `<div class="w150"><span class="cr-progress" style="--v:100%"><i></i></span></div>`], ["live", `<div class="w150"><span class="cr-progress is-live" style="--v:60%"><i></i></span></div>`], ["disabled", `<div class="w150"><span class="cr-progress is-disabled" style="--v:40%"><i></i></span></div>`], ["spinner", `<span class="cr-spinner" role="status" aria-label="Loading"></span>`]],
});
add("Menus and feedback", "empty", "Empty state", "What a list shows when there is nothing in it yet.", {
  tokens: ["text-2", "text-4", "text-5"], classes: ["cr-empty"], states: ["default"], wide: 1,
  cells: [["default", `<div class="cr-empty w220">${si("media")}<b>No media yet</b><span>Upload a file or browse your library.</span></div>`]],
});
add("Menus and feedback", "banner", "Banner", "A full-width message at the top of the window. Danger, neutral or live.", {
  tokens: ["danger-subtle", "danger-fg", "state-hover", "status-live-fill", "status-live-text"], classes: ["cr-notice", "is-neutral", "is-live"], states: ["danger", "neutral", "live"], wide: 1,
  cells: [["danger", `<div class="cr-notice w320" role="alert"><span>You were signed out.</span>${button("surface", "Sign In")}</div>`], ["neutral", `<div class="cr-notice is-neutral w320"><span>Changes are saved.</span></div>`], ["live", `<div class="cr-notice is-live w320"><span>Recording in progress.</span></div>`]],
});

/* ---------- Text and labels ---------- */
const INK = [["Text 1", "text-1", "What you read"], ["Text 2", "text-2", "Labels"], ["Text 3", "text-3", "Secondary"], ["Text 4", "text-4", "Hints"], ["Text 5", "text-5", "Values, units"], ["Text 6", "text-6", "Grips, disabled"]];
const inkList = INK.map(([n, k, u]) => `<div class="ink" style="color:var(--cr-color-${k})">${n}<small>${u}</small></div>`).join("");
add("Text and labels", "ink", "Ink levels", "One ink, stepped down in strength. Shown on the window, a panel and dark glass.", {
  min: 230,
  tokens: ["text-1", "text-2", "text-3", "text-4", "text-5", "text-6", "selection-text", "selection-muted"], classes: ["cr-text-*"], states: ["window", "panel", "glass"], surface: "none", wide: 1,
  cells: [["window", `<div class="ink-box" style="background:var(--cr-color-bg)">${inkList}</div>`], ["panel", `<div class="ink-box" style="background:var(--cr-color-mat-hud)">${inkList}</div>`], ["glass (always dark)", `<div class="ink-box is-glass"><div class="ink" style="color:var(--cr-color-selection-text)">Glass text<small>selection-text</small></div><div class="ink" style="color:var(--cr-color-selection-muted)">Glass muted<small>selection-muted</small></div><div class="ink" style="color:var(--cr-color-selection-disabled)">Glass disabled<small>selection-disabled</small></div></div>`], ["disabled", `<div class="ink-box" style="background:var(--cr-color-bg)"><div class="ink" style="opacity:var(--cr-opacity-disabled)">Disabled<small>opacity-disabled</small></div></div>`]],
});
add("Text and labels", "truncate", "Truncation", "Long text ends in an ellipsis in one line, or is clamped to two.", {
  tokens: ["text-2", "text-4"], classes: ["cr-trunc", "cr-clamp", "cr-head-title", "cr-thumb-text"], states: ["one line", "two lines"], surface: SB,
  cells: [["one line", `<div class="w150 cr-trunc">Presentation about the quarterly launch plan</div>`], ["two lines", `<div class="w150 cr-clamp">Presentation about the quarterly launch plan and everything after it</div>`], ["short", `<div class="w150 cr-trunc">Short name</div>`]],
});
add("Text and labels", "labels", "Labels", "The small text that names and explains: heads, rows, fields, help, units.", {
  min: 200,
  surface: SB, tokens: ["text-2", "text-4", "text-5", "accent-solid", "font-size-xs", "font-size-2xs"], classes: ["cr-section-head", "cr-head-hint", "cr-headlink", "cr-row-label", "cr-label", "cr-help", "cr-unit", "cr-logo-name", "cr-logo-value"], states: ["default"],
  cells: [["section head", `<div class="w220">${C.head("Appearance", { icon: "effects" })}</div>`], ["head + hint", `<div class="w220">${C.head("Crop", { hint: "Drag to move" })}</div>`], ["head + link", `<div class="w220">${C.head("Crop", { link: "Reset" })}</div>`], ["row label", `<div class="w220">${C.row("border", "Border", { tag: "div" })}</div>`], ["field label", `<span class="cr-label">Name</span>`], ["helper", `<span class="cr-help">Shown in the top bar.</span>`], ["value + unit", `<span class="cr-logo-text"><span class="cr-logo-name">Opacity</span><span class="cr-logo-value">60 %</span></span>`], ["count", `<span class="cr-count">7</span>`], ["shortcut", `<span class="cr-kbd">⌘</span>`], ["tooltip", `<span class="cr-tooltip">Duplicate</span>`]],
});

/* ---------- Icons ---------- */
const ICON_NAMES = ["eye", "lock", "trash", "duplicate", "expand", "effects", "border", "layout", "cam", "mic", "plus", "check", "chevronDown", "more", "undo", "redo", "help", "gear", "person", "search"];
add("Icons", "icon-sizes", "Icon sizes", "The same glyph at each size used in the app.", {
  tokens: ["size-icon-inline", "size-icon-row", "size-icon-header", "size-icon-action", "size-4", "size-5", "size-6"], classes: ["cr-icon"], states: ["12", "14", "16", "20", "24"], wide: 1,
  cells: [12, 14, 16, 20, 24].map((n) => [`${n}px`, `<span class="cr-icon" style="width:${n}px;height:${n}px;color:var(--cr-color-text-2)">${si("effects").replace(/^<span[^>]*>|<\/span>$/g, "")}</span>`]),
});
add("Icons", "icon-fill", "Stroke and fill", "Outline icons for controls, filled icons where a state needs weight.", {
  tokens: ["text-3", "text-1"], classes: ["cr-icon"], states: ["stroke", "fill"], wide: 1,
  cells: [["eye stroke", si("eye")], ["eye fill", si("eyeFill")], ["lock stroke", si("lock")], ["lock fill", si("lockFill")], ["person stroke", si("person")], ["person fill", si("personFill")]].map(([a, b]) => [a, `<span style="color:var(--cr-color-text-2);display:inline-flex;--s:20px" class="ico20">${b}</span>`]),
});
add("Icons", "icon-states", "Icon color states", "Icons take the ink of their control: quiet, hover, selected, disabled.", {
  tokens: ["text-3", "text-1", "accent-fg", "opacity-disabled"], classes: ["cr-icon"], states: ["default", "hover", "selected", "disabled", "danger"], wide: 1,
  cells: [["default", `<span class="ico20" style="color:var(--cr-color-text-3)">${si("eye")}</span>`], ["hover", `<span class="ico20" style="color:var(--cr-color-text-1)">${si("eye")}</span>`], ["selected", `<span class="ico20" style="color:var(--cr-color-accent-fg)">${si("eye")}</span>`], ["disabled", `<span class="ico20" style="color:var(--cr-color-text-3);opacity:var(--cr-opacity-disabled)">${si("eye")}</span>`], ["danger", `<span class="ico20" style="color:var(--cr-color-danger-fg)">${si("trash")}</span>`]],
});
add("Icons", "icon-set", "Icon set used", "Every icon this page uses, with the public Airtime icon it comes from.", {
  tokens: [], classes: ["cr-icon"], states: [], wide: 1, full: 1,
  cells: ICON_NAMES.map((n) => [n, `<span class="ico20" style="color:var(--cr-color-text-2)">${si(n)}</span>`]),
});

/* ---------- Surfaces ---------- */
const tile = (bg, extra = "") => `<span class="sf" style="background:${bg};${extra}"></span>`;
add("Surfaces", "materials", "Materials", "What things are made of: window, panels, glass, sheets and the scrim behind a dialog.", {
  tokens: ["bg", "bg-panel", "mat-hud", "mat-menu-solid", "mat-sheet", "selection-material", "scrim-modal", "surface-inset", "header-ground"], classes: [], states: [], surface: "none", wide: 1,
  cells: [["window", tile("var(--cr-color-bg)")], ["panel", tile("var(--cr-color-bg-panel)")], ["sidebar and tray glass", tile("var(--cr-color-mat-hud)")], ["menu", tile("var(--cr-color-mat-menu-solid)")], ["sheet", tile("var(--cr-color-mat-sheet)")], ["stage glass", tile("linear-gradient(var(--cr-color-selection-material),var(--cr-color-selection-material)),linear-gradient(135deg,#1d3b5c,#5a2d59 60%,#2f6b5e)")], ["scrim", tile("linear-gradient(var(--cr-color-scrim-modal),var(--cr-color-scrim-modal)),repeating-linear-gradient(45deg,#8886 0 6px,#fff6 6px 12px)")], ["field well", tile("var(--cr-color-surface-inset)")], ["top bar", tile("var(--cr-color-header-ground)")]].map(([n, h]) => [n, h]),
});
add("Surfaces", "dividers", "Dividers", "Hairlines that separate groups. Half a pixel, never a box.", {
  tokens: ["line", "line-strong", "size-creator-hairline", "selection-line"], classes: ["cr-rule", "is-shown", "cr-menu-sep", "cr-hud-sep", "cr-seg-sep"], states: [], wide: 1,
  cells: [["section rule", `<div class="w150"><hr class="cr-rule is-shown"></div>`], ["menu separator", `<div class="w150"><div class="cr-menu-sep"></div></div>`], ["strong line", `<div class="w150"><div style="height:.5px;background:var(--cr-color-line-strong)"></div></div>`], ["segment separator", `<span class="cr-seg-sep" style="margin:0"></span>`]],
});
const shadowTile = (v) => `<span class="sf is-card" style="box-shadow:var(--cr-shadow-${v})"></span>`;
add("Surfaces", "shadows", "Shadows", "Elevation from hairline to dialog. Each is a stack of edge, contact and drop.", {
  tokens: ["shadow-sidebar-card", "shadow-popover", "shadow-menu", "shadow-sheet", "shadow-tooltip", "shadow-band-pill", "shadow-top-bar", "shadow-button-solid", "shadow-focus"], classes: [], states: [], wide: 1,
  cells: ["sidebar-card", "popover", "menu", "sheet", "tooltip", "band-pill", "top-bar", "button-solid", "focus"].map((n) => [n, shadowTile(n)]),
});
add("Surfaces", "focus", "Focus ring and selection", "A blue ring for keyboard focus. A blue outline or fill for what is selected.", {
  min: 130,
  tokens: ["shadow-focus", "shadow-focus-inset", "accent-solid", "state-selected", "shadow-swatch-selected-tile", "state-drop-indicator"], classes: ["is-focus", "is-selected", "cr-tile", "cr-thumbrow"], states: ["focus", "selected"], wide: 1,
  cells: [["focus ring", `<span class="sf is-card" style="box-shadow:var(--cr-shadow-focus)"></span>`], ["row selected", `<div class="cr-sidebar" style="width:170px;min-width:0"><div class="cr-sidebar-scroll is-compact">${C.thumbRow({ name: "Image 1", sel: 1, grip: false })}</div></div>`], ["tile selected", `<div class="cr-tile is-selected" style="width:96px"><span class="face" style="display:block;height:100%">${C.art()}</span></div>`], ["swatch selected", `<div class="cr-swatches is-circle" style="--cols:1">${sw("#3D7BFF", { sel: 1 })}</div>`], ["drop edge", `<div style="width:90px;height:2px;border-radius:0;background:var(--cr-color-state-drop-indicator)"></div>`]],
});

export const ATOMS = A;
export const ICON_MAP = Object.entries(ICON_SRC).map(([k, v]) => ({ control: k, file: v.file, match: v.match, note: v.note }));
