import { si } from "./lib.js";
import * as C from "./components.js";
const { FORCE, dis, button, iconBtn, menuItem, menu, sw, PALETTE } = C;

/* Areas registry: the header, slide tray, stage overlays, and menus, popovers and dialogs. */
const AR = [];
const add = (cat, id, title, use, o) => AR.push({ group: "areas", cat, id, title, use, ...o });
const ST5 = ["default", "hover", "pressed", "focus", "disabled"];
const st = (names, fn) => names.map((n) => [n, fn(FORCE[n], n)]);

/* ---------- Header ---------- */
const title = (cls = "", renamable) => `<button type="button" class="cr-btn0 cr-title ${cls}"><span class="glyph">${si("hamburger")}</span><span class="label ${renamable ? "is-renamable" : ""}">Scratchpad</span><span class="chev">${si("chevronForward")}</span></button>`;
const mode = (on = 0) => `<div class="cr-mode" role="radiogroup" aria-label="Mode">${["Presentation", "Video Editor"].map((t, i) => `<button type="button" class="cr-btn0 cr-mode-item ${on === i ? "is-selected" : ""}" role="radio" aria-checked="${on === i}">${t}</button>`).join("")}</div>`;
const avatar = (c = "", out) => `<button type="button" class="cr-btn0 cr-avatar ${c} ${out ? "is-silhouette" : ""}" aria-label="Account menu"><span>${out ? si("userCircleFill") : "D"}</span></button>`;
const ib = (ic, label, c = "", a = "") => iconBtn(ic, label, c, a);
const record = (c = "", d) => `<button type="button" class="cr-btn0 cr-record ${c}" ${d ? "disabled" : ""}><span class="dot">${si("record")}</span><span>Record</span></button>`;
const insBtn = (ic, label, c = "", a = "") => `<button type="button" class="cr-btn0 cr-insert ${c}" aria-label="${label}" ${a}>${si(ic)}</button>`;
const hud = (inner) => `<div class="cr-hud">${inner}</div>`;
const split = (ic, label, c = "", off, open, err) => `<div class="cr-split"><button type="button" class="main ${c}" ${off ? "data-off" : ""}>${err ? `<span class="errg">${si("warning")}</span>` : off ? `<span class="offg">${si("xmark")}</span>` : `<span class="glyph">${si(ic)}</span>`}<span class="value">${label}</span></button><button type="button" class="trigger ${open ? "is-open" : ""}" aria-label="Select"><span class="chev">${si("chevronDown")}</span></button></div>`;
const chip = (c = "", live, open) => `<button type="button" class="cr-btn0 cr-statuschip ${c} ${open ? "is-open" : ""}"><span class="sdot" ${live ? "data-live" : ""}></span><span>${live ? "Live" : "Ready"}</span><span class="cr-badge" ${live ? "data-live" : ""}>${live ? "<i></i>Recording" : "Draft"}</span></button>`;
const HS = ["default", "hover", "pressed", "focus", "selected", "disabled"];

add("Top bar", "hd-topbar", "Top bar", "The 52px bar: title on the left, mode switch in the middle, history, sidebar toggle, help and account on the right.", {
  tokens: ["header-ground", "shadow-top-bar", "size-creator-top-bar", "space-gutter", "z-top-bar"], classes: ["cr-topbar", "grow", "end"], states: ["default"], full: 1,
  html: `<div class="cr-topbar" style="border-radius:8px"><div class="grow">${title("", true)}</div>${mode(0)}<div class="grow end">${ib("undo", "Undo", "", "disabled")}${ib("redo", "Redo", "", "disabled")}${ib("sidebarRight", "Hide sidebar", "is-toggle", 'aria-pressed="true"')}<span class="cr-bar-sep"></span>${ib("help", "Help", "is-quiet")}${avatar("", true)}</div></div>`,
});
add("Top bar", "hd-title", "Presentation title", "Opens the document menu. The name can be renamed in place.", {
  tokens: ["header-title-hover", "header-title-border", "content-secondary", "size-6", "radius-lg"], classes: ["cr-title", "glyph", "label", "is-renamable", "chev"], states: ["default", "hover", "focus"],
  cells: [["default", title("", true)], ["hover", title("is-hover", true)], ["focus", title("is-focus", true)]],
});
add("Top bar", "hd-mode", "Mode switch", "Switch between presenting and the video editor.", {
  tokens: ["state-active", "bg-panel", "shadow-segment-track", "shadow-segment-thumb", "size-segment", "radius-lg"], classes: ["cr-mode", "cr-mode-item"], states: ["selected", "hover", "focus", "disabled"],
  cells: [["Presentation", mode(0)], ["Video Editor", mode(1)], ["item hover", `<div class="cr-mode"><button class="cr-btn0 cr-mode-item is-hover">Hover</button><button class="cr-btn0 cr-mode-item is-selected">Selected</button></div>`], ["item focus", `<div class="cr-mode"><button class="cr-btn0 cr-mode-item is-focus is-selected">Focus</button><button class="cr-btn0 cr-mode-item">Other</button></div>`], ["item disabled", `<div class="cr-mode"><button class="cr-btn0 cr-mode-item is-selected">On</button><button class="cr-btn0 cr-mode-item is-disabled" disabled>Off</button></div>`]],
});
add("Top bar", "hd-record", "Record button", "Starts a recording. A pill with a red record glyph.", {
  tokens: ["bg", "danger-solid", "shadow-band-pill", "size-creator-band-row", "radius-xl"], classes: ["cr-record", "dot"], states: ST5,
  cells: st(ST5, (c, n) => record(c, n === "disabled")),
});
add("Top bar", "hd-insert", "Insert group", "Adds things to the stage: screen, text, media, upload, file, camera, pointer.", {
  tokens: ["mat-hud", "shadow-band-pill", "text-3", "background-tertiary", "action-primary", "content-accent", "duration-fired"], classes: ["cr-hud", "cr-hud-label", "cr-insert", "cr-hud-sep"], states: [...HS, "fired"], wide: 1,
  cells: [["assembled", hud(`<span class="cr-hud-label">Insert</span>${insBtn("screenshare", "Screenshare")}${insBtn("addText", "Text")}${insBtn("media", "Media Library")}${insBtn("uploadArrow", "Upload")}${insBtn("file", "File")}${insBtn("cam", "Camera")}<span class="cr-hud-sep"></span>${insBtn("pointer", "Pointer")}`)],
    ...[...HS, "fired"].map((n) => [n === "selected" ? "latched" : n, hud(insBtn("addText", "Text", n === "fired" ? "is-fired" : FORCE[n], dis(n)))])],
});
add("Top bar", "hd-split", "Device button", "Turns the camera or microphone on and off, and picks the device.", {
  tokens: ["mat-hud", "shadow-band-pill", "state-hover", "state-active", "text-5", "shadow-focus-inset", "opacity-disabled-split"], classes: ["cr-split", "main", "trigger", "value", "chev", "glyph", "offg"], states: ["on", "off", "hover", "focus", "open", "error", "disabled"],
  cells: [["camera on", split("cam", "Camera 1")], ["microphone off", split("noMic", "Mute", "", true)], ["hover", split("cam", "Camera 1", "is-hover")], ["focus", split("cam", "Camera 1", "is-focus")], ["picker open", split("cam", "Camera 1", "", false, true)], ["error", split("cam", "Couldn't start", "", false, false, true)], ["disabled", split("cam", "Camera 1", "is-disabled")]],
});
add("Top bar", "hd-status", "Status chip", "Shows whether the camera is ready or live.", {
  tokens: ["state-hover", "state-active", "status-live", "status-live-fill", "status-live-text", "size-creator-status-dot"], classes: ["cr-statuschip", "sdot", "cr-badge"], states: ["idle", "live", "hover", "open", "focus"],
  cells: [["idle", chip()], ["live", chip("", true)], ["hover", chip("is-hover")], ["open", chip("", true, true)], ["focus", chip("is-focus")]],
});

/* ---------- Slide tray ---------- */
const tb = (ic, label, c = "", a = "") => `<button type="button" class="cr-btn0 cr-traybtn ${c}" aria-label="${label}" ${a}>${si(ic)}</button>`;
const addSlide = (c = "", d) => `<button type="button" class="cr-btn0 cr-addslide ${c}" ${d ? "disabled" : ""}>${si("plus")}<span>Add Slide</span></button>`;
const tile = (n, c = "", a = "", g1 = "#3cb0a4", g2 = "#3b6bf0") => `<div class="cr-tile ${c}" ${a}><button type="button" class="cr-btn0 face" aria-label="Slide ${n}"><span class="art" style="background:linear-gradient(135deg,${g1},${g2})"></span></button><span class="num">${n}</span><button type="button" class="cr-btn0 act edit" aria-label="Show layers">${si("sliders")}</button><button type="button" class="cr-btn0 act menu" aria-label="Slide options">${si("more")}</button></div>`;
add("Slide tray", "tr-tray", "Slide tray", "One surface: Add Slide and Import on the left, slide position in the middle, Speaker Notes on the right, then the lane of tiles.", {
  tokens: ["mat-hud", "shadow-band-pill", "line-strong", "size-creator-tray", "radius-2xl", "z-tray"], classes: ["cr-tray", "cr-tray-bar", "cr-tray-rule", "cr-tray-lane", "cr-traybtn", "has-label", "cr-addslide", "cr-counter"], states: ["default"], full: 1,
  html: `<div class="cr-tray"><div class="cr-tray-bar"><div class="start">${addSlide()}<button type="button" class="cr-btn0 cr-traybtn has-label">${si("uploadArrow")}<span>Import slides</span></button></div><div class="mid">${tb("prev", "Previous Slide")}<span class="cr-counter" role="status" style="min-width:106px">Slide 1 / 3</span>${tb("next", "Next Slide")}</div><div class="end"><button type="button" class="cr-btn0 cr-traybtn has-label">${si("notes")}<span>Speaker Notes</span></button></div></div><div class="cr-tray-rule"></div><div class="cr-tray-lane">${tile("1", "is-selected")}${tile("2", "", "", "#e0453a", "#f0a23c")}${tile("3", "", "", "#222", "#666")}</div></div>`,
});
add("Slide tray", "tr-buttons", "Tray buttons", "Add Slide, labeled and icon buttons, and the slide counter.", {
  tokens: ["state-hover", "accent-solid", "accent-hover", "accent-contrast", "content-tertiary", "size-8", "radius-md", "opacity-disabled-button"], classes: ["cr-traybtn", "cr-addslide", "cr-counter"], states: ST5,
  cells: [...st(ST5, (c, n) => tb("prev", n, c, dis(n))).map(([a, b]) => ["icon " + a, b]), ...st(ST5, (c, n) => addSlide(c, n === "disabled")).map(([a, b]) => ["add " + a, b]), ["counter", `<span class="cr-counter">Slide 1 / 3</span>`], ["with label", `<button type="button" class="cr-btn0 cr-traybtn has-label">${si("notes")}<span>Speaker Notes</span></button>`]],
});
add("Slide tray", "tr-tile", "Slide tile", "A slide thumbnail. Selection is an outline, so nothing shifts.", {
  tokens: ["line-strong", "accent-solid", "slide-badge", "on-badge", "state-drop-indicator", "size-creator-slide-thumbnail", "radius-lg", "shadow-tile-action"], classes: ["cr-tile", "face", "num", "act", "edit", "menu"], states: ["default", "hover", "selected", "focus", "dragging", "drop"],
  cells: [["default", tile("1")], ["hover", tile("2", "is-hover")], ["selected", tile("3", "is-selected")], ["focus", tile("4", "is-focus")], ["dragging", tile("5", "is-dragging")], ["drop before", `<div style="padding-left:10px">${tile("6", "", 'data-drop-edge="before"')}</div>`], ["drop after", `<div style="padding-right:10px">${tile("7", "", 'data-drop-edge="after"')}</div>`]],
});

/* ---------- Stage ---------- */
const G = (inner, label, c = "", a = "") => `<button type="button" class="cr-btn0 cr-gbtn ${c}" aria-label="${label}" ${a}>${inner}</button>`;
const pillBar = () => `<div class="cr-glass" role="toolbar" aria-label="Selection controls">${G(si("maskSquare"), "Shape")}${G(si("border"), "Border")}${G(si("effects"), "Effects")}<span class="cr-glass-sep"></span>${G(si("textAlignLeft"), "Alignment")}${G(si("arrange"), "Arrange")}${G(si("dropShadow"), "Drop shadow")}${G(si("more"), "More")}${G(si("expand"), "Fullscreen")}</div>`;
const onGlass = (inner, mini) => `<div class="glass-bg ${mini ? "is-mini" : ""}">${inner}</div>`;
const GS = ["default", "hover", "pressed", "focus", "open", "disabled"];
add("Stage", "st-pill", "Selection pill", "The toolbar under the selected object. Always dark glass, in both themes.", {
  surface: "glass", tokens: ["selection-material", "selection-hover", "selection-active", "selection-line", "selection-disabled", "shadow-selection-bar", "blur-selection-bar", "radius-xl"], classes: ["cr-glass", "cr-gbtn", "cr-glass-sep"], states: GS, wide: 1,
  cells: [["assembled", onGlass(pillBar())], ...st(GS, (c, n) => onGlass(`<div class="cr-glass">${G(si("maskSquare"), n, c, dis(n))}</div>`, true))],
});
add("Stage", "st-popover", "Stage popover", "Options for the selection: title, sliders, shape options, swatches, actions.", {
  surface: "glass", tokens: ["selection-material", "selection-track", "selection-destructive", "selection-hover", "shadow-selection-menu", "blur-selection-menu", "radius-4xl", "size-creator-selection-menu-min", "size-creator-selection-menu-max"], classes: ["cr-gmenu", "cr-gitem", "cr-gopt", "cr-gswatch", "cr-gslider", "cr-gsep"], states: ["default", "hover", "selected", "disabled", "destructive"], wide: 1,
  cells: [["popover", onGlass(`<div class="cr-gmenu" style="width:280px"><div class="title">Border</div><div class="cr-gslider"><div class="top"><span>Width</span><span class="val">4</span></div><div class="track"><i style="width:40%"></i><b style="left:40%"></b></div></div><div class="cr-gsep"></div><div class="cr-gopts"><button class="cr-btn0 cr-gopt is-selected">${si("maskSquare")}Square</button><button class="cr-btn0 cr-gopt">${si("maskCircle")}Circle</button><button class="cr-btn0 cr-gopt is-hover">${si("maskHexagon")}Hex</button><button class="cr-btn0 cr-gopt is-disabled" disabled>${si("maskRectangle")}Rect</button></div><div class="cr-gsep"></div><div style="display:flex;gap:8px;padding:4px 7px">${["#FFFFFF", "#3D7BFF", "#FF4B3E", "#3FCF6A"].map((c, i) => `<button class="cr-btn0 cr-gswatch ${i === 1 ? "is-selected" : ""}" style="background:${c}" aria-label="${c}"></button>`).join("")}</div></div>`)],
    ["menu rows", onGlass(`<div class="cr-gmenu" style="width:240px">${["default", "hover", "pressed", "focus", "disabled"].map((n) => `<button type="button" class="cr-btn0 cr-gitem ${FORCE[n]}" ${dis(n)}>${si("duplicate")}<span style="flex:1">${n}</span></button>`).join("")}<button type="button" class="cr-btn0 cr-gitem is-hover" data-destructive>${si("trash")}<span style="flex:1">destructive hover</span></button></div>`)]],
});
add("Stage", "st-shadow", "Shadow style picker", "Choose a shadow for the selection: none, soft, hard, and their color.", {
  surface: "glass", tokens: ["selection-material", "selection-active", "selection-hover", "shadow-selection-swatch", "shadow-selection-swatch-selected"], classes: ["cr-gmenu", "cr-gopts", "cr-gopt", "cr-gswatch", "cr-gslider"], states: ["default", "selected"], wide: 1,
  cells: [["picker", onGlass(`<div class="cr-gmenu" style="width:280px"><div class="title">Drop shadow</div><div class="cr-gopts">${[["None", "none", 1], ["Soft", "0 6px 14px #0008", 0], ["Hard", "6px 6px 0 #000a", 0]].map(([t, sh, s]) => `<button class="cr-btn0 cr-gopt ${s ? "is-selected" : ""}"><span style="display:block;width:30px;height:20px;border-radius:4px;background:#fff;box-shadow:${sh}"></span>${t}</button>`).join("")}</div><div class="cr-gsep"></div><div class="cr-gslider"><div class="top"><span>Blur</span><span class="val">14</span></div><div class="track"><i style="width:55%"></i><b style="left:55%"></b></div></div><div class="cr-gsep"></div><div style="display:flex;gap:8px;padding:4px 7px">${["#000000", "#3D7BFF", "#FF4B3E"].map((c, i) => `<button class="cr-btn0 cr-gswatch ${i === 0 ? "is-selected" : ""}" style="background:${c}" aria-label="${c}"></button>`).join("")}</div></div>`)]],
});
const hnd = (cls, x, y) => `<i class="cr-handle ${cls}" style="left:${x};top:${y}"></i>`;
const frame = (dims, inner = "") => `<div class="cr-stage-mock"><div class="obj" style="${dims}"></div><div class="cr-frame" style="${dims}"></div>${inner}</div>`;
const D = "left:22%;top:20%;width:40%;height:44%;";
const corners = () => hnd("is-nw", "22%", "20%") + hnd("is-ne", "62%", "20%") + hnd("is-ne", "22%", "64%") + hnd("is-nw", "62%", "64%");
const edges = () => hnd("is-ns", "42%", "20%") + hnd("is-ns", "42%", "64%") + hnd("is-ew", "22%", "42%") + hnd("is-ew", "62%", "42%");
add("Stage", "st-note", "Stage message", "Shown on the stage when something is wrong, such as the camera not starting. One line and one link.", {
  surface: "glass", tokens: ["ground-dark-window", "ink-dark-primary", "ink-dark-tertiary", "action-primary", "radius-2xl"], classes: ["cr-stage-note"], states: ["default"],
  html: `<div class="cr-stage-note">${si("warning")}<span>Couldn't start camera</span><a class="cr-link" href="#st-note" style="color:var(--cr-color-action-primary)">Fix camera</a></div>`,
});
add("Stage", "st-frame", "Selection frame and handles", "The frame drawn around the selected object, with square resize handles.", {
  surface: "glass", tokens: ["stage-frame", "handle-fill", "size-frame-width", "size-handle", "radius-handle", "shadow-handle"], classes: ["cr-frame", "cr-handle", "is-nw", "is-ne", "is-ns", "is-ew", "cr-stage-mock"], states: ["default"], wide: 1,
  cells: [["frame and handles", `<div class="w320">${frame(D, corners() + edges())}</div>`], ["with pill", `<div class="w320">${frame(D, corners() + `<div style="position:absolute;left:50%;top:72%;transform:translateX(-50%)">${pillBar()}</div>`)}</div>`]],
});
add("Stage", "st-crop", "Crop", "Edge knobs replace the corners, the cropped area dims, and a small bar confirms.", {
  surface: "glass", tokens: ["stage-frame", "size-handle"], classes: ["cr-handle", "crop-h", "crop-v", "cr-dim", "cr-cropbar"], states: ["default", "pressed", "disabled"], wide: 1,
  cells: [["crop mode", `<div class="w320">${frame(D, `<div class="cr-dim" style="left:0;top:0;right:0;height:20%"></div><div class="cr-dim" style="left:0;bottom:0;right:0;height:36%"></div><div class="cr-dim" style="left:0;top:20%;width:22%;height:44%"></div><div class="cr-dim" style="right:0;top:20%;width:38%;height:44%"></div>` + hnd("is-ns crop-h", "42%", "20%") + hnd("is-ns crop-h", "42%", "64%") + hnd("is-ew crop-v", "22%", "42%") + hnd("is-ew crop-v", "62%", "42%"))}</div>`], ["option bar", `<div class="cr-cropbar"><button class="cr-btn0">Cancel</button><button class="cr-btn0 is-pressed">Reset</button><button class="cr-btn0">Done</button></div>`], ["bar, disabled", `<div class="cr-cropbar"><button class="cr-btn0 is-disabled" disabled>Reset</button><button class="cr-btn0">Done</button></div>`]],
});
const line = (cls, pos) => `<i class="cr-guide ${cls}" style="${pos}"></i>`;
add("Stage", "st-guides", "Alignment guides", "Snap lines while dragging: white for thirds, red for the one it snaps to.", {
  surface: "glass", tokens: ["stage-guide", "stage-guide-hit", "stage-grid-fill"], classes: ["cr-guide", "is-h", "is-v", "is-hit", "cr-gridfill"], states: ["default", "hit"], wide: 1,
  cells: [["dragging near center", `<div class="w320">${frame("left:30%;top:24%;width:40%;height:40%;", line("is-v", "left:33.33%") + line("is-v", "left:66.66%") + line("is-h", "top:33.33%") + line("is-h", "top:66.66%") + line("is-v is-hit", "left:50%") + line("is-h is-hit", "top:44%"))}</div>`]],
});

/* ---------- Menus, popovers and dialogs ---------- */
const mi = menuItem;
add("Menus and dialogs", "mn-document", "Document menu", "Opens from the title: file actions for the presentation.", {
  tokens: ["mat-menu-solid", "shadow-menu", "radius-2xl", "accent-solid", "danger-fg", "text-4"], classes: ["cr-menu", "cr-menu-item", "cr-menu-label", "cr-menu-sep"], states: ["default", "hover", "checked", "disabled", "destructive"],
  html: menu(`<div class="cr-menu-label">Presentation</div>${mi("plus", "New presentation")}${mi("duplicate", "Duplicate", "is-hover")}${mi("check", "Autosave")}${mi("", "Open recent", "", "", `<span class="ind">${si("chevronForward")}</span>`)}<div class="cr-menu-sep"></div>${mi("trash", "Delete", "", "data-destructive")}${mi("gear", "Settings", "is-disabled", "disabled")}`),
});
add("Menus and dialogs", "mn-account", "Account menu", "Opens from the avatar: theme, language, legal, and sign in or create an account.", {
  tokens: ["mat-menu-solid", "shadow-menu", "text-2", "text-4", "line"], classes: ["cr-menu", "cr-menu-item", "cr-menu-sep", "ind"], states: ["default", "hover"],
  html: menu(`${mi("theme", "Theme", "", "", `<span class="ind">${si("chevronForward")}</span>`)}${mi("language", "Language", "is-hover", "", `<span class="ind">${si("chevronForward")}</span>`)}<div class="cr-menu-sep"></div>${mi("legal", "Legal", "", "", `<span class="ind">${si("chevronForward")}</span>`)}<div class="cr-menu-sep"></div>${mi("personFill", "Sign In")}${mi("invite", "Create account")}`, 145),
});
add("Menus and dialogs", "mn-help", "Help menu", "Opens from the help button: tutorials, about slides, help center, support.", {
  tokens: ["mat-menu-solid", "shadow-menu", "accent-solid", "line"], classes: ["cr-menu", "cr-menu-item", "cr-menu-sep"], states: ["default", "hover"],
  html: menu(`${mi("video", "Watch tutorial videos")}${mi("help", "About slides", "is-hover")}<div class="cr-menu-sep"></div>${mi("search", "Search our help center")}${mi("ask", "Contact support")}`, 190),
});
add("Menus and dialogs", "mn-context", "Context menu", "Right-click on an object: arrange, copy, delete.", {
  tokens: ["mat-menu-solid", "shadow-menu", "danger-fg", "danger-solid"], classes: ["cr-menu", "cr-menu-item"], states: ["default", "hover", "destructive"],
  html: menu(`${mi("duplicate", "Duplicate")}${mi("arrange", "Bring to front", "is-hover")}${mi("paste", "Paste settings", "is-disabled", "disabled")}<div class="cr-menu-sep"></div>${mi("trash", "Delete", "", "data-destructive")}`, 220),
});
add("Menus and dialogs", "mn-dialog", "Dialog", "A small confirmation on a dimmed window. Cancel, and a primary or danger action.", {
  tokens: ["mat-sheet", "scrim-modal", "shadow-sheet", "radius-3xl", "text-1", "text-2"], classes: ["cr-scrim", "cr-dialog", "header", "body", "footer"], states: ["default"], wide: 1,
  html: `<div class="cr-scrim"><div class="cr-dialog"><div class="header"><h2 class="title">Delete this slide?</h2></div><div class="body">This removes the slide and its layers. You can undo it.</div><div class="footer">${button("surface", "Cancel")}${button("solid", "Delete", "is-danger")}</div></div></div>`,
});
add("Menus and dialogs", "mn-sheet", "Sheet", "A large pane for browsing, with a footer separated by a hairline.", {
  tokens: ["mat-sheet", "split-picker-footer", "line", "size-sheet-width", "size-sheet-height", "radius-3xl"], classes: ["cr-dialog", "is-sheet", "footer"], states: ["default"], wide: 1,
  html: `<div class="cr-scrim" style="padding:20px"><div class="cr-dialog is-sheet"><div class="header"><h2 class="title">Backgrounds</h2></div><div class="body">Content</div><div class="footer">${button("surface", "Cancel")}${button("solid", "Apply")}</div></div></div>`,
});
add("Menus and dialogs", "mn-toast", "Toast", "A short message with one action, floating at the bottom of the window.", {
  tokens: ["mat-menu-solid", "shadow-menu", "radius-full", "text-1", "accent-solid"], classes: ["cr-toast", "cr-button"], states: ["default"],
  html: `<div class="cr-toast" role="status"><span>Background effects stopped working.</span>${button("solid", "Reload")}</div>`,
});
add("Menus and dialogs", "mn-banner", "Session banner", "A full-width message under the top bar: signed out, or presentations could not load.", {
  tokens: ["danger-subtle", "danger-fg"], classes: ["cr-notice"], states: ["default"], full: 1,
  html: `<div class="cr-notice" role="alert"><span>You were signed out. Sign in again to reach your account.</span>${button("surface", "Sign In")}</div>`,
});
export const AREAS = AR;
