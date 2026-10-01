import { si } from "./lib.js";
import { ICON_SRC } from "./icons.js";
import * as C from "./components.js";
const { FORCE, dis, button, iconBtn, textInput, check, radio, tag, menuItem, menuCheck, menu, sw, sw34, seg, valueField, geo, pill, action, iconToggle, PALETTE } = C;

/* Atoms registry. Each entry: group, category, id, title, one-line use, token names, class names, states, surface, cells.
   cells = [[caption, html], ...]. Both the Overview cards and the Engineering tables are generated from this list. */
const st = (names, fn) => names.map((n) => [n, fn(FORCE[n], n)]);
const A = [];
const add = (cat, id, title, use, o) => A.push({ group: "atoms", cat, id, title, use, surface: "panel", ...o });
const SB = "side";

/* ---------- Buttons ---------- */
const B5 = ["default", "hover", "pressed", "focus", "disabled"];
add("Buttons", "btn-primary", "Primary button", "The one main action in a dialog or bar. 32px by default, 24px in dense bars. The tone picks the fill: accent or destructive.", {
  tokens: ["modeless-teal", "modeless-destructive", "modeless-white", "lighting-shade", "filled", "control-md", "control-sm", "radius-sm", "opacity-disabled"],
  classes: ["cr-button", "is-solid", "is-sm", "is-destructive"], states: B5,
  cells: [...st(B5, (c, n) => button("solid", "Button", c, dis(n))), ["destructive", button("solid", "Delete", "is-destructive")], ["destructive hover", button("solid", "Delete", "is-destructive is-hover")], ["dense (24px)", button("solid", "Dense", "is-sm")], ["with icon", button("solid", si("plus") + "Add")]],
});
add("Buttons", "btn-secondary", "Secondary button", "Sits next to a primary action, or stands alone for a lesser one. A raised face that sinks on hover and press.", {
  tokens: ["lighting-highlight-secondary", "lighting-shade", "content-primary", "raised", "raised-pressed", "control-md", "radius-sm"], classes: ["cr-button", "is-surface", "is-sm"], states: B5,
  cells: [...st(B5, (c, n) => button("surface", "Button", c, dis(n))), ["dense (24px)", button("surface", "Dense", "is-sm")], ["with icon", button("surface", si("duplicate") + "Copy")]],
});
add("Buttons", "btn-quiet", "Quiet button", "A bare label that fills on hover. For toolbars and low-emphasis actions. The destructive tone turns the ink red.", {
  tokens: ["content-primary", "accent-destructive", "lighting-shade", "control-md", "radius-sm"], classes: ["cr-button", "is-ghost", "is-plain", "is-destructive"], states: [...B5, "open"],
  cells: [...st([...B5, "open"], (c, n) => button("ghost", "Button", c, dis(n))), ["destructive", button("ghost", "Delete", "is-destructive")]],
});
add("Buttons", "btn-action", "Action button", "A sidebar button that does something once: duplicate, delete, go fullscreen. A secondary button in a grid.", {
  surface: SB, tokens: ["lighting-highlight-secondary", "lighting-shade", "accent-destructive", "raised", "raised-pressed", "control-md", "radius-sm"], classes: ["cr-action", "cr-actions", "is-1", "is-2", "is-3", "is-compact"], states: B5,
  cells: [...st(B5, (c, n) => `<div class="w150">${action("duplicate", "Duplicate", { cls: c, dis: n === "disabled" })}</div>`), ["destructive", `<div class="w150">${action("trash", "Delete", { destructive: true })}</div>`], ["destructive hover", `<div class="w150">${action("trash", "Delete", { destructive: true, cls: "is-hover" })}</div>`]],
});
const IB = ["default", "hover", "pressed", "focus", "selected", "disabled"];
add("Buttons", "btn-icon", "Icon button", "A round, quiet 32px button for a small action in the top bar: undo, the sidebar toggle, help. The icon names the action.", {
  tokens: ["content-primary", "content-tertiary", "lighting-shade", "control-md", "radius-full", "opacity-disabled", "focus"], classes: ["cr-iconbtn", "is-toggle", "is-quiet"], states: IB,
  cells: [...st(IB, (c, n) => iconBtn("noSidebarPanel", n, "is-toggle " + c, (n === "selected" ? 'aria-pressed="true"' : "") + " " + dis(n))), ["show sidebar", iconBtn("sidebarPanel", "Show sidebar", "is-toggle")], ["help (quiet)", iconBtn("help", "Help", "is-quiet")]],
});
add("Buttons", "btn-icontoggle", "Icon toggle", "A 32px rounded square in a sidebar pane header: back, hide, lock. In a layer row it is a 24px square.", {
  surface: SB, tokens: ["content-tertiary", "content-primary", "lighting-shade", "control-md", "control-sm", "radius-md", "radius-sm"], classes: ["cr-icontoggle", "is-inline", "is-back"], states: IB,
  cells: [...st(IB, (c, n) => iconToggle("eye", n, { cls: c, pressed: n === "selected" ? "true" : undefined, dis: n === "disabled" })), ["layer row (24px)", iconToggle("eye", "Hide layer", { cls: "is-inline" })], ["layer row pressed", iconToggle("lock", "Unlock", { cls: "is-inline", pressed: "true" })]],
});
const TS = ["default", "hover", "focus", "selected", "disabled"];
const toolItem = (ic, c, n) => `<div class="cr-seg is-tool"><button type="button" class="cr-btn0 cr-seg-item ${c}" aria-label="${n}" aria-pressed="${n === "selected"}" ${dis(n)}>${si(ic)}</button></div>`;
add("Buttons", "btn-tool", "Tool-strip toggle", "A small square tool inside a strip: text alignment, bold, italic. 24px, or 32px when the strip fills the row.", {
  surface: SB, tokens: ["content-tertiary", "content-primary", "lighting-highlight-secondary", "raised", "control-sm", "control-md", "radius-sm"], classes: ["cr-seg", "is-tool", "cr-seg-item", "is-fill"], states: TS,
  cells: [...st(TS, (c, n) => toolItem("textAlignCenter", c, n)), ["strip", seg("tool", [{ icon: "textAlignLeft", label: "Left" }, { icon: "textAlignCenter", label: "Center" }, { icon: "textAlignRight", label: "Right" }], { on: 1 })], ["toggles", seg("tool", [{ icon: "bold", label: "Bold" }, { icon: "italic", label: "Italic" }, { icon: "underline", label: "Underline" }], { mode: "toggle", on: [0, 2] })]],
});
const segState = (c, n) => `<div class="w180">${seg("segmented", [{ text: "Visible", cls: n === "selected" ? "is-selected" : "" }, { text: "Blurred", cls: n === "selected" ? "" : c, dis: n === "disabled" }, { text: "Hidden" }], { on: n === "selected" ? 0 : 0 })}</div>`;
const segLook = (look) => `<div class="w180">${seg("segmented", [{ text: "Visible" }, { text: "Blurred" }, { text: "Hidden" }], { on: 1, look })}</div>`;
add("Buttons", "btn-segment", "Segmented control", "Pick one of a few options. The track is filled, outlined or ghost: a ghost has no track, so a row that must not draw the eye (Frame) shows only floating text. The selected item is lifted onto a raised face.", {
  surface: SB, tokens: ["lighting-shade", "lighting-highlight-secondary", "content-secondary", "content-primary", "raised", "inset", "control-md", "radius-md", "radius-sm"], classes: ["cr-seg", "is-segmented", "is-bare", "is-shape", "is-outline", "is-ghost", "cr-seg-item"], states: TS,
  cells: [...st(TS, segState), ["filled", segLook()], ["outline", segLook("outline")], ["ghost (Frame)", `<div class="w180">${seg("bare", [{ text: "16:9" }, { text: "1:1" }, { text: "4:3" }, { text: "Fit" }], { on: 0, look: "ghost" })}</div>`], ["shapes", `<div class="w180">${seg("shape", [{ icon: "maskRectangle", text: "Rect" }, { icon: "maskCircle", text: "Circle" }, { icon: "maskHexagon", text: "Hex" }], { on: 1 })}</div>`]],
});
add("Buttons", "chip", "Category chip", "A small pill for a filter or a category. Selected is the accent at 12% with semibold type.", {
  tokens: ["content-tertiary", "lighting-shade", "accent-teal", "control-sm", "radius-full"], classes: ["cr-tag"], states: ["default", "hover", "pressed", "focus", "selected", "disabled"],
  cells: [...st(["default", "hover", "pressed", "focus", "selected", "disabled"], (c, n) => tag("Chip", c, (n === "selected" ? 'aria-pressed="true"' : "") + " " + dis(n))), ["removable", tag("Blur", "", "", true)]],
});
add("Buttons", "link", "Link", "Text that goes somewhere. Blue, underlined on hover.", {
  tokens: ["accent-teal", "opacity-disabled"], classes: ["cr-link", "cr-headlink"], states: ["default", "hover", "pressed", "focus", "disabled"],
  cells: st(["default", "hover", "pressed", "focus", "disabled"], (c, n) => `<a class="cr-link ${c}" href="#a-link" ${n === "disabled" ? 'aria-disabled="true"' : ""}>Learn more</a>`),
});

/* ---------- Inputs ---------- */
const F5 = ["default", "hover", "focus", "error", "disabled"];
add("Inputs", "field-number", "Number field", "A short value in a 32px well with an inset hairline. Right aligned, tabular numbers.", {
  min: 108,
  surface: SB, tokens: ["lighting-shade", "inset", "focus", "accent-destructive", "control-md", "radius-sm"], classes: ["cr-field", "is-value", "is-wide", "is-geo", "is-error"], states: F5,
  cells: [...st(F5, (c, n) => valueField("42%", "is-value", c, dis(n))), ["wide (hex)", valueField("#3D7BFF", "is-wide")], ["with axis and unit", `<div style="width:84px">${geo("X", "50")}</div>`]],
});
add("Inputs", "text-input", "Text input", "One line of free text in a 32px well, with a label and a line of help. The placeholder is the field's own ink at 70%.", {
  tokens: ["lighting-shade", "inset", "focus", "content-primary", "accent-destructive", "opacity-placeholder", "control-md", "radius-sm"], classes: ["cr-input", "cr-label", "cr-help", "cr-fieldset", "is-error"], states: F5,
  cells: st(F5, (c, n) => `<div class="cr-fieldset w180"><span class="cr-label">Name</span>${textInput(n === "error" ? "" : "Scratchpad", { ph: "Untitled", cls: c, d: dis(n) })}<span class="cr-help ${n === "error" ? "is-error" : ""}">${n === "error" ? "A name is required." : "Shown in the top bar."}</span></div>`),
});
add("Inputs", "textarea", "Text area", "Several lines of text, such as speaker notes.", {
  tokens: ["lighting-shade", "inset", "focus"], classes: ["cr-input", "is-area"], states: F5,
  cells: st(F5, (c, n) => `<div class="w180"><label class="cr-input is-area ${c}"><textarea rows="3" aria-label="Notes" ${dis(n)}>Open with the demo.</textarea></label></div>`),
});
add("Inputs", "select", "Select", "Choose one item from a list. A raised pill that opens a menu.", {
  surface: SB, tokens: ["lighting-highlight-secondary", "raised", "raised-pressed", "content-tertiary", "control-md"], classes: ["cr-field", "is-pill", "is-fill"], states: ["default", "hover", "focus", "disabled"],
  cells: st(["default", "hover", "focus", "disabled"], (c) => `<div class="w150">${pill("Blur", "is-fill " + c)}</div>`),
});
add("Inputs", "combo", "Combobox with unit", "A number you can type or pick, with its unit beside it.", {
  tokens: ["lighting-shade", "inset", "content-tertiary", "control-md"], classes: ["cr-input", "is-combo", "cr-unit", "cr-caret"], states: F5,
  cells: st(F5, (c, n) => `<div class="w150"><label class="cr-input ${c}"><input value="24" aria-label="Size" ${dis(n)}><span class="cr-unit">px</span><span class="cr-caret">${si("chevronDown")}</span></label></div>`),
});
add("Inputs", "search", "Search field", "Filter a list as you type. A clear button appears when there is text.", {
  tokens: ["lighting-shade", "inset", "content-tertiary", "control-md"], classes: ["cr-input", "is-search", "cr-clear"], states: F5,
  cells: [...st(F5, (c, n) => `<div class="w180"><label class="cr-input ${c}">${si("search")}<input placeholder="Search" aria-label="Search" ${dis(n)}></label></div>`), ["with text", `<div class="w180"><label class="cr-input">${si("search")}<input value="blur" aria-label="Search"><span class="cr-clear">${si("xmark")}</span></label></div>`]],
});
add("Inputs", "stepper", "Stepper", "Nudge a number up or down by one.", {
  tokens: ["lighting-shade", "inset", "content-tertiary", "control-md"], classes: ["cr-stepper", "is-disabled"], states: ["default", "hover", "pressed", "focus", "disabled"],
  cells: st(["default", "hover", "pressed", "focus", "disabled"], (c, n) => `<div class="cr-stepper ${n === "disabled" ? "is-disabled" : ""}"><button type="button" class="cr-btn0 ${n === "default" ? "" : c}" aria-label="Less" ${dis(n)}>${si("chevronBack")}</button><output>12</output><button type="button" class="cr-btn0" aria-label="More" ${dis(n)}>${si("chevronForward")}</button></div>`),
});

/* ---------- Choice and color ---------- */
add("Choice", "checkbox", "Checkbox", "Turn an option on or off in a list of options.", {
  tokens: ["modeless-teal", "modeless-white", "lighting-shade", "inset", "accent-destructive", "icon", "radius-xs"], classes: ["cr-check", "cr-choice", "is-error"], states: ["default", "hover", "focus", "checked", "mixed", "error", "disabled"],
  cells: [["default", check("", false)], ["hover", check("is-hover", false)], ["focus", check("is-focus", false)], ["checked", check("", true)], ["mixed", check("", "mixed")], ["error", check("is-error", false)], ["disabled", check("is-disabled", true, "disabled")], ["with label", `<span class="cr-choice">${check("", true)}Show grid</span>`]],
});
add("Choice", "radio", "Radio", "Pick exactly one of a few options.", {
  tokens: ["modeless-teal", "modeless-white", "lighting-shade", "inset", "icon", "radius-full"], classes: ["cr-radio", "cr-choice"], states: ["default", "hover", "focus", "selected", "error", "disabled"],
  cells: [["default", radio("", false)], ["hover", radio("is-hover", false)], ["focus", radio("is-focus", false)], ["selected", radio("", true)], ["error", radio("is-error", false)], ["disabled", radio("is-disabled", true, "disabled")], ["with label", `<span class="cr-choice">${radio("", true)}Light</span>`]],
});
add("Choice", "switch", "Switch", "Turn something on or off right away. A 30 by 18 track in a 34 by 24 hit box.", {
  surface: SB, tokens: ["accent-teal", "lighting-shade", "modeless-white", "knob", "shadow-small", "control-sm"], classes: ["cr-switch"], states: ["off", "off hover", "on", "on hover", "focus", "disabled"],
  cells: [["off", sw34(false)], ["off hover", sw34(false, "is-hover")], ["on", sw34(true)], ["on hover", sw34(true, "is-hover")], ["focus", sw34(true, "is-focus")], ["disabled", sw34(false, "is-disabled", "disabled")]],
});
const rng = (v, cls = "", a = "") => `<div class="w150"><input class="cr-range ${cls}" type="range" value="${v}" aria-label="Opacity" ${a}></div>`;
add("Choice", "slider", "Slider", "Drag to change a value across a range. A 4px shade track and a white knob; the value sits beside it in a number field.", {
  tokens: ["lighting-shade", "modeless-white", "knob", "shadow-small", "focus", "opacity-disabled"], classes: ["cr-range", "cr-range-line"], states: ["0", "50", "100", "hover", "focus", "disabled"],
  cells: [["0", rng(0)], ["50", rng(50)], ["100", rng(100)], ["hover", rng(50, "is-hover")], ["focus", rng(50, "is-focus")], ["disabled", rng(50, "", "disabled")], ["with value", `<div class="cr-range-line w180"><input class="cr-range" type="range" value="60" aria-label="Size"><output>60</output></div>`]],
});
add("Choice", "swatch", "Swatch and color well", "Pick a color. The struck-through tile means none.", {
  surface: SB, tokens: ["lighting-shade", "content-primary", "accent-teal", "modeless-white24", "modeless-overlay", "modeless-destructive", "icon"], classes: ["cr-swatches", "is-circle", "is-square", "cr-swatch", "cr-dot", "cr-none-tile", "is-none"], states: ["default", "hover", "focus", "selected", "none"],
  cells: [["default", `<div class="cr-swatches is-circle" style="--cols:1">${sw("#3D7BFF")}</div>`], ["hover", `<div class="cr-swatches is-circle" style="--cols:1">${sw("#3D7BFF", { cls: "is-hover" })}</div>`], ["focus", `<div class="cr-swatches is-circle" style="--cols:1">${sw("#3D7BFF", { cls: "is-focus" })}</div>`], ["selected", `<div class="cr-swatches is-circle" style="--cols:1">${sw("#3D7BFF", { sel: 1 })}</div>`],
    ["none (empty ring)", `<div class="cr-swatches is-square w80" style="--cols:1">${sw("", { none: 1, cap: "None" })}</div>`], ["tile", `<div class="cr-swatches is-square w80" style="--cols:1">${sw("#FF4B3E", { cap: "Red" })}</div>`], ["tile selected", `<div class="cr-swatches is-square w80" style="--cols:1">${sw("#FF4B3E", { sel: 1, cap: "Red" })}</div>`], ["color well dot", `<span class="cr-dot" style="background:#3D7BFF"></span>`], ["dot, none", `<span class="cr-dot is-none"></span>`]],
});

/* ---------- Menus and feedback ---------- */
const MI = ["default", "highlighted", "checked", "two-line", "disabled", "destructive", "destructive highlighted", "submenu"];
add("Menus and feedback", "menu-item", "Menu item", "One choice in a menu. A 24px row with a single 16px icon slot and a right-aligned check. Blue when highlighted, red when destructive; a second line gives detail.", {
  tokens: ["modeless-teal", "modeless-white", "accent-teal", "accent-destructive", "content-primary", "content-tertiary", "icon", "control-sm", "radius-sm", "opacity-disabled"], classes: ["cr-menu-item", "cr-menu", "cr-menu-sep", "cr-menu-label", "chk", "det", "cmd"], states: MI, min: 250,
  cells: [["default", menu(menuItem("duplicate", "Duplicate"))], ["highlighted", menu(menuItem("duplicate", "Duplicate", "is-hover"))], ["checked", menu(menuItem("effects", "Blur", "", "", menuCheck()))], ["two-line", menu(menuItem("cam", "FaceTime HD Camera", "", "", "", "Built-in"))], ["disabled", menu(menuItem("duplicate", "Duplicate", "is-disabled", "disabled"))], ["destructive", menu(menuItem("trash", "Delete", "", "data-destructive"))], ["destructive highlighted", menu(menuItem("trash", "Delete", "is-hover", "data-destructive"))], ["submenu", menu(menuItem("", "Open recent", "", "", `<span class="ind">${si("chevronForward")}</span>`))]],
});
add("Menus and feedback", "tooltip", "Tooltip", "A short name for an icon-only control. A small background.secondary surface with a hairline, the same in both themes.", {
  tokens: ["background-secondary", "content-primary", "lighting-shade", "md", "radius-sm"], classes: ["cr-tooltip"], states: ["default"],
  cells: [["default", `<span class="cr-tooltip">Show layers</span>`], ["long", `<span class="cr-tooltip">Not available yet</span>`]],
});
add("Menus and feedback", "badge", "Badge and count", "A tiny status or number beside a label.", {
  tokens: ["lighting-shade", "content-tertiary", "pending-live", "pending-live-text", "modeless-teal", "radius-full"], classes: ["cr-badge", "cr-count"], states: ["default", "live", "count"],
  cells: [["default", `<span class="cr-badge">Draft</span>`], ["live", `<span class="cr-badge" data-live><i></i>Recording</span>`], ["count", `<span class="cr-count">3</span>`], ["count, wide", `<span class="cr-count">12</span>`]],
});
add("Menus and feedback", "kbd", "Keyboard hint", "The shortcut for an action, shown at the end of a menu row.", {
  tokens: ["lighting-shade", "content-tertiary", "radius-xs"], classes: ["cr-kbd"], states: ["default"],
  cells: [["single", `<span class="cr-kbd">V</span>`], ["combo", `<span style="display:inline-flex;gap:3px"><span class="cr-kbd">⌘</span><span class="cr-kbd">D</span></span>`], ["in a menu row", menu(menuItem("duplicate", "Duplicate", "", "", `<span class="cmd">⌘D</span>`))]],
});
add("Menus and feedback", "avatar", "Avatar and thumbnail", "Who is signed in, and a small picture of a layer or slide.", {
  tokens: ["ring", "ring-hover", "inset", "lighting-shade", "content-secondary", "radius-xs"], classes: ["cr-avatar", "cr-thumb", "cr-thumb-art", "cr-checker"], states: ["default", "hover", "focus"],
  cells: [["default", `<button type="button" class="cr-btn0 cr-avatar" aria-label="Account menu"><span>D</span></button>`], ["hover", `<button type="button" class="cr-btn0 cr-avatar is-hover" aria-label="Account menu"><span>D</span></button>`], ["focus", `<button type="button" class="cr-btn0 cr-avatar is-focus" aria-label="Account menu"><span>D</span></button>`], ["thumbnail", `<span class="cr-thumb">${C.art()}</span>`], ["dimmed", `<span class="cr-thumb is-dimmed">${C.art()}</span>`], ["transparent", `<span class="cr-thumb cr-checker"></span>`]],
});
add("Menus and feedback", "progress", "Progress and loading", "Shows work in flight: a 4px bar for known progress, a spinner for unknown.", {
  tokens: ["accent-teal", "pending-live", "lighting-shade", "shadow-small", "radius-full"], classes: ["cr-progress", "is-live", "cr-spinner"], states: ["0", "40", "100", "live", "disabled"],
  cells: [["0%", `<div class="w150"><span class="cr-progress" style="--v:0%"><i></i></span></div>`], ["40%", `<div class="w150"><span class="cr-progress" style="--v:40%"><i></i></span></div>`], ["100%", `<div class="w150"><span class="cr-progress" style="--v:100%"><i></i></span></div>`], ["live", `<div class="w150"><span class="cr-progress is-live" style="--v:60%"><i></i></span></div>`], ["disabled", `<div class="w150"><span class="cr-progress is-disabled" style="--v:40%"><i></i></span></div>`], ["spinner", `<span class="cr-spinner" role="status" aria-label="Loading"></span>`]],
});
add("Menus and feedback", "empty", "Empty state", "What a list shows when there is nothing in it yet.", {
  tokens: ["content-secondary", "content-tertiary"], classes: ["cr-empty"], states: ["default"], wide: 1,
  cells: [["default", `<div class="cr-empty w220">${si("media")}<b>No media yet</b><span>Upload a file or browse your library.</span></div>`]],
});
add("Menus and feedback", "note", "Note", "A passing remark beside the main copy, such as what a button will also do. An info glyph and quiet text with no fill, because a filled rounded rectangle reads as an input. It shares the text's left edge, as in the sign-in dialog.", {
  tokens: ["content-tertiary", "icon"], classes: ["cr-note"], states: ["default"], wide: 1,
  cells: [["default", `<div class="w220">${C.note("Signing in saves this scratchpad to your account.")}</div>`], ["after body copy", `<div class="w220" style="display:grid;gap:12px"><span>An account is required to use PDF, PowerPoint or Keynote documents.</span>${C.note("Signing in saves this scratchpad to your account.")}</div>`]],
});
add("Menus and feedback", "banner", "Banner", "A full-width message at the top of the window. The destructive wash for problems; neutral and live are quieter.", {
  tokens: ["accent-destructive", "lighting-shade", "pending-live", "pending-live-text"], classes: ["cr-notice", "is-neutral", "is-live"], states: ["danger", "neutral", "live"], wide: 1,
  cells: [["danger", `<div class="cr-notice w320" role="alert"><span>You were signed out.</span>${button("surface", "Sign In", "is-sm")}</div>`], ["neutral", `<div class="cr-notice is-neutral w320"><span>Changes are saved.</span></div>`], ["live", `<div class="cr-notice is-live w320"><span>Recording in progress.</span></div>`]],
});

/* ---------- Text and labels ---------- */
const INK = [["Content primary", "content-primary", "What you read"], ["Content secondary", "content-secondary", "Labels and rest"], ["Content tertiary", "content-tertiary", "Hints and values"]];
const inkList = INK.map(([n, k, u]) => `<div class="ink" style="color:var(--cr-color-${k})">${n}<small>${u}</small></div>`).join("");
add("Text and labels", "ink", "Content colors", "One ink in three strengths. Shown on the window, a panel and dark stage glass, where the modeless white is used instead.", {
  min: 230,
  tokens: ["content-primary", "content-secondary", "content-tertiary", "modeless-white", "opacity-disabled"], classes: ["cr-text-*"], states: ["window", "panel", "glass"], surface: "none", wide: 1,
  cells: [["window", `<div class="ink-box" style="background:var(--cr-color-background-primary)">${inkList}</div>`], ["panel", `<div class="ink-box" style="background:var(--cr-color-background-secondary)">${inkList}</div>`], ["glass (always dark)", `<div class="ink-box is-glass"><div class="ink" style="color:var(--cr-color-modeless-white)">Glass text<small>modeless.white</small></div><div class="ink" style="color:color-mix(in srgb, var(--cr-color-modeless-white) 64%, transparent)">Glass muted<small>modeless.white at 64%</small></div><div class="ink" style="color:color-mix(in srgb, var(--cr-color-modeless-white) 40%, transparent)">Glass disabled<small>modeless.white at 40%</small></div></div>`], ["disabled", `<div class="ink-box" style="background:var(--cr-color-background-primary)"><div class="ink" style="opacity:var(--cr-opacity-disabled)">Disabled<small>opacity.disabled</small></div></div>`]],
});
add("Text and labels", "truncate", "Truncation", "Long text ends in an ellipsis in one line, or is clamped to two.", {
  tokens: ["content-secondary", "content-tertiary"], classes: ["cr-trunc", "cr-clamp", "cr-head-title", "cr-thumb-text"], states: ["one line", "two lines"], surface: SB,
  cells: [["one line", `<div class="w150 cr-trunc">Presentation about the quarterly launch plan</div>`], ["two lines", `<div class="w150 cr-clamp">Presentation about the quarterly launch plan and everything after it</div>`], ["short", `<div class="w150 cr-trunc">Short name</div>`]],
});
add("Text and labels", "labels", "Labels", "The small text that names and explains: heads, rows, fields, help, units.", {
  min: 200,
  surface: SB, tokens: ["content-secondary", "content-tertiary", "accent-teal", "font-size-xs", "font-size-2xs"], classes: ["cr-section-head", "cr-head-hint", "cr-headlink", "cr-row-label", "cr-label", "cr-help", "cr-unit", "cr-logo-name", "cr-logo-value"], states: ["default"],
  cells: [["section head", `<div class="w220">${C.head("Appearance", { icon: "effects" })}</div>`], ["head + hint", `<div class="w220">${C.head("Crop", { hint: "Drag to move" })}</div>`], ["head + link", `<div class="w220">${C.head("Crop", { link: "Reset" })}</div>`], ["row label", `<div class="w220">${C.row("border", "Border", { tag: "div" })}</div>`], ["field label", `<span class="cr-label">Name</span>`], ["helper", `<span class="cr-help">Shown in the top bar.</span>`], ["value + unit", `<span class="cr-logo-text"><span class="cr-logo-name">Opacity</span><span class="cr-logo-value">60 %</span></span>`], ["count", `<span class="cr-count">7</span>`], ["shortcut", `<span class="cr-kbd">⌘</span>`], ["tooltip", `<span class="cr-tooltip">Duplicate</span>`]],
});

/* ---------- Icons ---------- */
const ICON_NAMES = ["eye", "lock", "trash", "duplicate", "expand", "effects", "border", "layout", "cam", "mic", "plus", "check", "chevronDown", "more", "undo", "redo", "help", "gear", "person", "search", "sidebarPanel", "noSidebarPanel", "prev", "next", "info"];
add("Icons", "icon-sizes", "Icon sizes", "The same glyph at each size used in the app. 16px is the icon slot for rows, menus and fields; the top bar and tray draw 20px.", {
  tokens: ["icon", "control-sm", "control-md"], classes: ["cr-icon"], states: ["12", "16", "20", "24"], wide: 1,
  cells: [12, 16, 20, 24].map((n) => [`${n}px`, `<span class="cr-icon" style="width:${n}px;height:${n}px;color:var(--cr-color-content-secondary)">${si("effects").replace(/^<span[^>]*>|<\/span>$/g, "")}</span>`]),
});
add("Icons", "icon-fill", "Stroke and fill", "Outline icons for controls, filled icons where a state needs weight.", {
  tokens: ["content-tertiary", "content-primary"], classes: ["cr-icon"], states: ["stroke", "fill"], wide: 1,
  cells: [["eye stroke", si("eye")], ["eye fill", si("eyeFill")], ["lock stroke", si("lock")], ["lock fill", si("lockFill")], ["person stroke", si("person")], ["person fill", si("personFill")]].map(([a, b]) => [a, `<span style="color:var(--cr-color-content-secondary);display:inline-flex" class="ico20">${b}</span>`]),
});
add("Icons", "icon-states", "Icon color states", "Icons take the ink of their control: quiet, hover, selected, disabled.", {
  tokens: ["content-tertiary", "content-primary", "accent-teal", "accent-destructive", "opacity-disabled"], classes: ["cr-icon"], states: ["default", "hover", "selected", "disabled", "danger"], wide: 1,
  cells: [["default", `<span class="ico20" style="color:var(--cr-color-content-tertiary)">${si("eye")}</span>`], ["hover", `<span class="ico20" style="color:var(--cr-color-content-primary)">${si("eye")}</span>`], ["selected", `<span class="ico20" style="color:var(--cr-color-accent-teal)">${si("eye")}</span>`], ["disabled", `<span class="ico20" style="color:var(--cr-color-content-tertiary);opacity:var(--cr-opacity-disabled)">${si("eye")}</span>`], ["danger", `<span class="ico20" style="color:var(--cr-color-accent-destructive)">${si("trash")}</span>`]],
});
add("Icons", "icon-set", "Icon set used", "Every icon this page uses, with the public Airtime icon it comes from. The sidebar icons name the action: the open sidebar shows the slashed panel, the closed one the plain panel.", {
  tokens: [], classes: ["cr-icon"], states: [], wide: 1, full: 1,
  cells: ICON_NAMES.map((n) => [n, `<span class="ico20" style="color:var(--cr-color-content-secondary)">${si(n)}</span>`]),
});

/* ---------- Surfaces ---------- */
const tile = (bg, extra = "") => `<span class="sf" style="background:${bg};${extra}"></span>`;
add("Surfaces", "materials", "Materials", "What things are made of: the window, opaque panels, translucent glass, the dark stage glass and the overlay behind a dialog.", {
  tokens: ["background-primary", "background-secondary", "background-tertiary", "modeless-overlay", "lighting-shade", "lighting-highlight-primary", "lighting-highlight-secondary"], classes: [], states: [], surface: "none", wide: 1,
  cells: [["background.primary: window", tile("var(--cr-color-background-primary)")], ["background.secondary: panels, sidebar, tray, dialogs", tile("var(--cr-color-background-secondary)")], ["background.tertiary: glass for menus and toasts", tile("var(--cr-color-background-tertiary)", "box-shadow:inset 0 0 0 0.5px var(--cr-color-lighting-shade)")], ["modeless.overlay: stage glass", tile("linear-gradient(var(--cr-color-modeless-overlay),var(--cr-color-modeless-overlay)),linear-gradient(135deg,#1d3b5c,#5a2d59 60%,#2f6b5e)")], ["dialog backdrop", tile("linear-gradient(var(--cr-color-modeless-overlay),var(--cr-color-modeless-overlay)),repeating-linear-gradient(45deg,#8886 0 6px,#fff6 6px 12px)")], ["lighting.shade: wells and layers", tile("var(--cr-color-lighting-shade)")], ["lighting.highlight.secondary: raised faces", tile("var(--cr-color-lighting-highlight-secondary)", "box-shadow:var(--cr-shadow-raised)")]],
});
add("Surfaces", "dividers", "Dividers", "Hairlines that separate groups. Half a pixel, never a box.", {
  tokens: ["lighting-shade", "border-width-hair", "rule-top", "rule-bottom", "rule-end"], classes: ["cr-rule", "is-shown", "cr-menu-sep", "cr-hud-sep", "cr-seg-sep"], states: [], wide: 1,
  cells: [["section rule", `<div class="w150"><hr class="cr-rule is-shown"></div>`], ["menu separator", `<div class="w150"><div class="cr-menu-sep"></div></div>`], ["segment separator", `<span class="cr-seg-sep" style="margin:0"></span>`]],
});
const shadowTile = (v) => `<span class="sf is-card" style="box-shadow:var(--cr-shadow-${v})"></span>`;
const SHADOWS = ["sm", "md", "lg", "raised", "filled", "card", "menu", "inset", "ring", "knob", "focus", "glass"];
add("Surfaces", "shadows", "Shadows", "Elevation from hairline to dialog, 23 named recipes in all. Each is built from the shadow and lighting colors, so it follows the theme. A selection of them is shown.", {
  tokens: ["sm", "md", "lg", "raised", "filled", "card", "menu", "inset", "ring", "knob", "focus", "glass"], classes: [], states: [], wide: 1,
  cells: SHADOWS.map((n) => [n, shadowTile(n)]),
});
add("Surfaces", "focus", "Focus ring and selection", "A blue ring for keyboard focus. A blue outline or fill for what is selected.", {
  min: 130,
  tokens: ["focus", "focus-inset", "selection-ring", "accent-teal", "modeless-teal", "modeless-teal-on-dark"], classes: ["is-focus", "is-selected", "cr-tile", "cr-thumbrow"], states: ["focus", "selected"], wide: 1,
  cells: [["focus ring", `<span class="sf is-card" style="box-shadow:var(--cr-shadow-focus)"></span>`], ["row selected", `<div class="cr-sidebar" style="width:170px;min-width:0"><div class="cr-sidebar-scroll is-compact">${C.thumbRow({ name: "Image 1", sel: 1, grip: false })}</div></div>`], ["tile selected", `<div class="cr-tile is-selected" style="width:96px;height:54px"><span class="face" style="display:block;height:100%;border-radius:12px;overflow:hidden">${C.art()}</span></div>`], ["swatch selected", `<div class="cr-swatches is-circle" style="--cols:1">${sw("#3D7BFF", { sel: 1 })}</div>`], ["selection ring (stage)", `<span class="sf is-card" style="box-shadow:var(--cr-shadow-selection-ring)"></span>`]],
});

export const ATOMS = A;
export const ICON_MAP = Object.entries(ICON_SRC).map(([k, v]) => ({ control: k, file: v.file, match: v.match, note: v.note }));
