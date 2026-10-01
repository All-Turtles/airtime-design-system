import { si } from "./lib.js";
import * as C from "./components.js";
const { FORCE, dis, button, iconBtn, menuItem, menuCheck, menu, note, sw, PALETTE } = C;

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

add("Top bar", "hd-topbar", "Top bar", "The 52px bar on background.secondary: title on the left, mode switch in the middle, history, sidebar toggle, help and account on the right.", {
  tokens: ["background-secondary", "rule-bottom", "control-md", "space-gutter", "z-top-bar"], classes: ["cr-topbar", "grow", "end"], states: ["default"], full: 1,
  html: `<div class="cr-topbar" style="border-radius:8px"><div class="grow">${title("", true)}</div>${mode(0)}<div class="grow end">${ib("undo", "Undo", "", "disabled")}${ib("redo", "Redo", "", "disabled")}${ib("noSidebarPanel", "Hide sidebar", "is-toggle", 'aria-pressed="true"')}<span class="cr-bar-sep"></span>${ib("help", "Help", "is-quiet")}${avatar("", true)}</div></div>`,
});
add("Top bar", "hd-title", "Presentation title", "Opens the document menu. The name can be renamed in place.", {
  tokens: ["content-secondary", "lighting-shade", "control-sm", "radius-lg", "radius-xs"], classes: ["cr-title", "glyph", "label", "is-renamable", "chev"], states: ["default", "hover", "focus"],
  cells: [["default", title("", true)], ["hover", title("is-hover", true)], ["focus", title("is-focus", true)]],
});
add("Top bar", "hd-mode", "Mode switch", "Switch between presenting and the video editor. A shade track with a raised thumb.", {
  tokens: ["lighting-shade", "lighting-highlight-secondary", "content-tertiary", "content-primary", "raised", "inset", "control-sm", "radius-lg"], classes: ["cr-mode", "cr-mode-item"], states: ["selected", "hover", "focus", "disabled"],
  cells: [["Presentation", mode(0)], ["Video Editor", mode(1)], ["item hover", `<div class="cr-mode"><button class="cr-btn0 cr-mode-item is-hover">Hover</button><button class="cr-btn0 cr-mode-item is-selected">Selected</button></div>`], ["item focus", `<div class="cr-mode"><button class="cr-btn0 cr-mode-item is-focus is-selected">Focus</button><button class="cr-btn0 cr-mode-item">Other</button></div>`], ["item disabled", `<div class="cr-mode"><button class="cr-btn0 cr-mode-item is-selected">On</button><button class="cr-btn0 cr-mode-item is-disabled" disabled>Off</button></div>`]],
});
add("Top bar", "hd-record", "Record button", "Starts a recording. A background.secondary pill with a red record glyph.", {
  tokens: ["background-secondary", "accent-destructive", "card", "control-md", "radius-lg"], classes: ["cr-record", "dot"], states: ST5,
  cells: st(ST5, (c, n) => record(c, n === "disabled")),
});
add("Top bar", "hd-insert", "Insert bar", "Adds things to the stage: screen, text, media, upload, file, camera, pointer. A 32px pill; each tool is 32 by 24 and a latched tool wears the accent.", {
  tokens: ["background-secondary", "card", "content-tertiary", "lighting-shade", "modeless-teal", "modeless-white", "pending-highlight", "duration-snap"], classes: ["cr-hud", "cr-hud-label", "cr-insert", "cr-hud-sep"], states: [...HS, "fired"], wide: 1,
  cells: [["assembled", hud(`<span class="cr-hud-label">Insert</span>${insBtn("screenshare", "Screenshare")}${insBtn("addText", "Text")}${insBtn("media", "Media Library")}${insBtn("uploadArrow", "Upload")}${insBtn("file", "File")}${insBtn("cam", "Camera")}<span class="cr-hud-sep"></span>${insBtn("pointer", "Pointer")}`)],
    ...[...HS, "fired"].map((n) => [n === "selected" ? "latched" : n, hud(insBtn("addText", "Text", n === "fired" ? "is-fired" : FORCE[n], dis(n)))])],
});
add("Top bar", "hd-split", "Device split button", "Turns the camera or microphone on and off, and picks the device. A main half and a menu half in one 32px pill; each half takes its own inner layer.", {
  tokens: ["background-secondary", "card", "lighting-shade", "content-tertiary", "accent-destructive", "focus-inset", "opacity-disabled"], classes: ["cr-split", "main", "trigger", "value", "chev", "glyph", "offg"], states: ["on", "off", "hover", "focus", "open", "error", "disabled"],
  cells: [["camera on", split("cam", "Camera 1")], ["microphone off", split("noMic", "Mute", "", true)], ["hover", split("cam", "Camera 1", "is-hover")], ["focus", split("cam", "Camera 1", "is-focus")], ["picker open", split("cam", "Camera 1", "", false, true)], ["error", split("cam", "Couldn't start", "", false, false, true)], ["disabled", split("cam", "Camera 1", "is-disabled")]],
});
add("Top bar", "hd-status", "Status chip", "Shows whether the camera is ready or live.", {
  tokens: ["lighting-shade", "content-secondary", "pending-live", "pending-live-text", "control-md", "radius-lg"], classes: ["cr-statuschip", "sdot", "cr-badge"], states: ["idle", "live", "hover", "open", "focus"],
  cells: [["idle", chip()], ["live", chip("", true)], ["hover", chip("is-hover")], ["open", chip("", true, true)], ["focus", chip("is-focus")]],
});

/* ---------- Slide tray ---------- */
const tb = (ic, label, c = "", a = "") => `<button type="button" class="cr-btn0 cr-traybtn ${c}" aria-label="${label}" ${a}>${si(ic)}</button>`;
const addSlide = (c = "", d) => `<button type="button" class="cr-btn0 cr-addslide ${c}" ${d ? "disabled" : ""}>${si("plus")}<span>Add Slide</span></button>`;
const tile = (n, c = "", a = "", g1 = "#3cb0a4", g2 = "#3b6bf0") => `<div class="cr-tile ${c}" ${a}><button type="button" class="cr-btn0 face" aria-label="Slide ${n}"><span class="art" style="background:linear-gradient(135deg,${g1},${g2})"></span></button><span class="num">${n}</span><button type="button" class="cr-btn0 act menu" aria-label="Slide options">${si("more")}</button></div>`;
add("Slide tray", "tr-tray", "Slide tray", "One surface on background.secondary, the sidebar card's twin: Add Slide and Import on the left, previous, position and next in the middle, Speaker Notes on the right, a hairline, then the lane of tiles.", {
  tokens: ["background-secondary", "card", "lighting-shade", "radius-xl", "space-2", "z-tray"], classes: ["cr-tray", "cr-tray-bar", "cr-tray-rule", "cr-tray-lane", "cr-traybtn", "has-label", "cr-addslide", "cr-counter"], states: ["default"], full: 1,
  html: `<div class="cr-tray"><div class="cr-tray-bar"><div class="start">${addSlide()}<button type="button" class="cr-btn0 cr-traybtn has-label">${si("uploadArrow")}<span>Import slides</span></button></div><div class="mid">${tb("prev", "Previous Slide")}<span class="cr-counter" role="status">Slide 1 / 3</span>${tb("next", "Next Slide")}</div><div class="end"><button type="button" class="cr-btn0 cr-traybtn has-label">${si("notes")}<span>Speaker Notes</span></button></div></div><div class="cr-tray-rule"></div><div class="cr-tray-lane">${tile("1", "is-selected")}${tile("2", "", "", "#e0453a", "#f0a23c")}${tile("3", "", "", "#222", "#666")}</div></div>`,
});
add("Slide tray", "tr-buttons", "Tray buttons", "Add Slide, labeled buttons, the previous and next arrows (a 32px square with a 20px stroke arrow) and the slide position.", {
  tokens: ["modeless-teal", "modeless-white", "filled", "lighting-shade", "content-primary", "content-tertiary", "control-md", "radius-sm", "opacity-disabled"], classes: ["cr-traybtn", "cr-addslide", "cr-counter"], states: ST5,
  cells: [...st(ST5, (c, n) => tb("prev", n, c, dis(n))).map(([a, b]) => ["icon " + a, b]), ["next", tb("next", "Next Slide")], ...st(ST5, (c, n) => addSlide(c, n === "disabled")).map(([a, b]) => ["add " + a, b]), ["counter", `<span class="cr-counter">Slide 1 / 3</span>`], ["with label", `<button type="button" class="cr-btn0 cr-traybtn has-label">${si("notes")}<span>Speaker Notes</span></button>`]],
});
add("Slide tray", "tr-tile", "Slide tile", "A 16:9 slide thumbnail. Selection is an accent outline, so nothing shifts. A dark menu chip and the slide number sit on the picture.", {
  tokens: ["lighting-shade", "accent-teal", "modeless-overlay", "modeless-white", "layout-slide-thumbnail", "radius-lg", "blur-small", "duration-snap"], classes: ["cr-tile", "face", "num", "act", "menu"], states: ["default", "hover", "selected", "focus", "dragging", "drop"],
  cells: [["default", tile("1")], ["hover", tile("2", "is-hover")], ["selected", tile("3", "is-selected")], ["focus", tile("4", "is-focus")], ["dragging", tile("5", "is-dragging")], ["drop before", `<div style="padding-left:10px">${tile("6", "", 'data-drop-edge="before"')}</div>`], ["drop after", `<div style="padding-right:10px">${tile("7", "", 'data-drop-edge="after"')}</div>`]],
});
const tileMenu = (open) => menu([menuItem("layout", "Change layout"), menuItem(open ? "noSidebarPanel" : "sidebarPanel", open ? "Hide sidebar" : "Show sidebar", "is-hover"), `<div class="cr-menu-sep"></div>`, menuItem("eye", "Hide presenter"), `<div class="cr-menu-sep"></div>`, menuItem("duplicate", "Duplicate", "", "", `<span class="cmd">⌘D</span>`), `<div class="cr-menu-sep"></div>`, menuItem("trash", "Delete", "", "data-destructive")].join(""));
add("Slide tray", "tr-tilemenu", "Slide tile menu", "Opens from the tile's menu chip. The sidebar row's icon shows the action it will take: NoSidebarPanel (slashed) means Hide sidebar, SidebarPanel means Show sidebar.", {
  both: 1, min: 250, tokens: ["background-tertiary", "menu", "modeless-teal", "accent-destructive", "icon", "blur-large", "radius-xl"], classes: ["cr-menu", "cr-menu-item", "cr-menu-sep", "cmd"], states: ["sidebar open", "sidebar closed"],
  cells: [["sidebar open: Hide sidebar", tileMenu(true)], ["sidebar closed: Show sidebar", tileMenu(false)]],
});

/* ---------- Stage ---------- */
const G = (inner, label, c = "", a = "") => `<button type="button" class="cr-btn0 cr-gbtn ${c}" aria-label="${label}" ${a}>${inner}</button>`;
const pillBar = () => `<div class="cr-glass" role="toolbar" aria-label="Selection controls">${G(si("maskSquare"), "Shape")}${G(si("border"), "Border")}${G(si("effects"), "Effects")}<span class="cr-glass-sep"></span>${G(si("textAlignLeft"), "Alignment")}${G(si("arrange"), "Arrange")}${G(si("dropShadow"), "Drop shadow")}${G(si("more"), "More")}${G(si("expand"), "Fullscreen")}</div>`;
const onGlass = (inner, mini) => `<div class="glass-bg ${mini ? "is-mini" : ""}">${inner}</div>`;
const GS = ["default", "hover", "pressed", "focus", "open", "disabled"];
add("Stage", "st-pill", "Selection pill", "The toolbar under the selected object. Always dark glass, built from the modeless colors, in both themes. Hover is one white-8 layer, pressed two.", {
  surface: "glass", tokens: ["modeless-overlay", "modeless-white", "modeless-white8", "modeless-white24", "modeless-black24", "glass", "blur-large", "radius-lg", "control-sm"], classes: ["cr-glass", "cr-gbtn", "cr-glass-sep"], states: GS, wide: 1,
  cells: [["assembled", onGlass(pillBar())], ...st(GS, (c, n) => onGlass(`<div class="cr-glass">${G(si("maskSquare"), n, c, dis(n))}</div>`, true))],
});
add("Stage", "st-popover", "Stage popover", "Options for the selection: title, sliders, shape options, swatches, actions.", {
  surface: "glass", tokens: ["modeless-overlay", "modeless-white8", "modeless-white24", "modeless-destructive", "modeless-teal-on-dark", "glass-menu", "glass-field", "blur-large", "radius-xl", "size-layout-selection-menu-min"], classes: ["cr-gmenu", "cr-gitem", "cr-gopt", "cr-gswatch", "cr-gslider", "cr-gsep"], states: ["default", "hover", "selected", "disabled", "destructive"], wide: 1,
  cells: [["popover", onGlass(`<div class="cr-gmenu" style="width:280px"><div class="title">Border</div><div class="cr-gslider"><div class="top"><span>Width</span><span class="val">4</span></div><div class="track"><i style="width:40%"></i><b style="left:40%"></b></div></div><div class="cr-gsep"></div><div class="cr-gopts"><button class="cr-btn0 cr-gopt is-selected">${si("maskSquare")}Square</button><button class="cr-btn0 cr-gopt">${si("maskCircle")}Circle</button><button class="cr-btn0 cr-gopt is-hover">${si("maskHexagon")}Hex</button><button class="cr-btn0 cr-gopt is-disabled" disabled>${si("maskRectangle")}Rect</button></div><div class="cr-gsep"></div><div style="display:flex;gap:8px;padding:4px 7px">${["#FFFFFF", "#3D7BFF", "#FF4B3E", "#3FCF6A"].map((c, i) => `<button class="cr-btn0 cr-gswatch ${i === 1 ? "is-selected" : ""}" style="background:${c}" aria-label="${c}"></button>`).join("")}</div></div>`)],
    ["menu rows", onGlass(`<div class="cr-gmenu" style="width:240px">${["default", "hover", "pressed", "focus", "disabled"].map((n) => `<button type="button" class="cr-btn0 cr-gitem ${FORCE[n]}" ${dis(n)}>${si("duplicate")}<span style="flex:1">${n}</span></button>`).join("")}<button type="button" class="cr-btn0 cr-gitem is-hover" data-destructive>${si("trash")}<span style="flex:1">destructive hover</span></button></div>`)]],
});
add("Stage", "st-shadow", "Shadow style picker", "Choose a shadow for the selection: none, soft, hard, and their color.", {
  surface: "glass", tokens: ["modeless-overlay", "modeless-white8", "modeless-white24", "modeless-teal-on-dark", "glass-menu"], classes: ["cr-gmenu", "cr-gopts", "cr-gopt", "cr-gswatch", "cr-gslider"], states: ["default", "selected"], wide: 1,
  cells: [["picker", onGlass(`<div class="cr-gmenu" style="width:280px"><div class="title">Drop shadow</div><div class="cr-gopts">${[["None", "none", 1], ["Soft", "0 6px 14px #0008", 0], ["Hard", "6px 6px 0 #000a", 0]].map(([t, sh, s]) => `<button class="cr-btn0 cr-gopt ${s ? "is-selected" : ""}"><span style="display:block;width:30px;height:20px;border-radius:4px;background:#fff;box-shadow:${sh}"></span>${t}</button>`).join("")}</div><div class="cr-gsep"></div><div class="cr-gslider"><div class="top"><span>Blur</span><span class="val">14</span></div><div class="track"><i style="width:55%"></i><b style="left:55%"></b></div></div><div class="cr-gsep"></div><div style="display:flex;gap:8px;padding:4px 7px">${["#000000", "#3D7BFF", "#FF4B3E"].map((c, i) => `<button class="cr-btn0 cr-gswatch ${i === 0 ? "is-selected" : ""}" style="background:${c}" aria-label="${c}"></button>`).join("")}</div></div>`)]],
});
const hnd = (cls, x, y) => `<i class="cr-handle ${cls}" style="left:${x};top:${y}"></i>`;
const frame = (dims, inner = "") => `<div class="cr-stage-mock"><div class="obj" style="${dims}"></div><div class="cr-frame" style="${dims}"></div>${inner}</div>`;
const D = "left:22%;top:20%;width:40%;height:44%;";
const corners = () => hnd("is-nw", "22%", "20%") + hnd("is-ne", "62%", "20%") + hnd("is-ne", "22%", "64%") + hnd("is-nw", "62%", "64%");
const edges = () => hnd("is-ns", "42%", "20%") + hnd("is-ns", "42%", "64%") + hnd("is-ew", "22%", "42%") + hnd("is-ew", "62%", "42%");
add("Stage", "st-note", "Stage message", "Shown on the stage when something is wrong, such as the camera not starting. One line and one link.", {
  surface: "glass", tokens: ["modeless-overlay", "modeless-white", "modeless-teal-on-dark", "radius-xl"], classes: ["cr-stage-note"], states: ["default"],
  html: `<div class="cr-stage-note">${si("warning")}<span>Couldn't start camera</span><a class="cr-link" href="#st-note" style="color:var(--cr-color-modeless-teal-on-dark)">Fix camera</a></div>`,
});
add("Stage", "st-frame", "Selection frame and handles", "The frame drawn around the selected object, with square resize handles.", {
  surface: "glass", both: 1, tokens: ["modeless-teal-on-dark", "modeless-white", "modeless-black24", "selection-ring"], classes: ["cr-frame", "cr-handle", "is-nw", "is-ne", "is-ns", "is-ew", "is-rotate", "is-hover", "is-active", "cr-stem", "cr-stage-mock"], states: ["default", "hover", "active"], wide: 1,
  cells: [["frame and handles", `<div class="w320">${frame(D, corners() + edges())}</div>`], ["handle states", `<div class="cr-stage-mock" style="width:230px;background:#1d2b3c;display:flex;align-items:center;justify-content:space-around;gap:0;padding:0 12px;aspect-ratio:auto;height:96px">${[["default", ""], ["hover", "is-hover"], ["active", "is-active"]].map(([n, c]) => `<span style="display:grid;justify-items:center;gap:10px;color:#fff;font-size:10px"><span style="position:relative;display:block;width:12px;height:12px"><i class="cr-handle ${c}" style="position:absolute;left:6px;top:6px;margin:-6px 0 0 -6px;width:12px;height:12px"></i></span>${n}</span>`).join("")}</div>`], ["rotate handle", `<div class="cr-stage-mock" style="width:150px;aspect-ratio:auto;height:96px"><div class="obj" style="left:24%;top:38%;width:52%;height:46%"></div><div class="cr-frame" style="left:24%;top:38%;width:52%;height:46%"></div><i class="cr-stem" style="left:50%;top:18%;height:20%"></i>${hnd("is-rotate", "50%", "18%")}</div>`], ["with pill", `<div class="w320">${frame(D, corners() + `<div style="position:absolute;left:50%;top:72%;transform:translateX(-50%)">${pillBar()}</div>`)}</div>`]],
});
add("Stage", "st-crop", "Crop", "Edge knobs replace the corners, the cropped area dims, and a small bar confirms.", {
  surface: "glass", both: 1, tokens: ["modeless-teal-on-dark", "modeless-overlay", "modeless-white8"], classes: ["cr-handle", "crop-h", "crop-v", "cr-dim", "cr-cropbar"], states: ["default", "pressed", "disabled"], wide: 1,
  cells: [["crop mode", `<div class="w320">${frame(D, `<div class="cr-dim" style="left:0;top:0;right:0;height:20%"></div><div class="cr-dim" style="left:0;bottom:0;right:0;height:36%"></div><div class="cr-dim" style="left:0;top:20%;width:22%;height:44%"></div><div class="cr-dim" style="right:0;top:20%;width:38%;height:44%"></div>` + hnd("is-ns crop-h", "42%", "20%") + hnd("is-ns crop-h", "42%", "64%") + hnd("is-ew crop-v", "22%", "42%") + hnd("is-ew crop-v", "62%", "42%"))}</div>`], ["option bar", `<div class="cr-cropbar"><button class="cr-btn0">Cancel</button><button class="cr-btn0 is-pressed">Reset</button><button class="cr-btn0">Done</button></div>`], ["bar, disabled", `<div class="cr-cropbar"><button class="cr-btn0 is-disabled" disabled>Reset</button><button class="cr-btn0">Done</button></div>`]],
});
const line = (cls, pos) => `<i class="cr-guide ${cls}" style="${pos}"></i>`;
add("Stage", "st-guides", "Alignment guides", "Snap lines while dragging: white for thirds, red for the one it snaps to.", {
  surface: "glass", tokens: ["modeless-white", "modeless-destructive", "modeless-overlay"], classes: ["cr-guide", "is-h", "is-v", "is-hit", "cr-gridfill"], states: ["default", "hit"], wide: 1,
  cells: [["dragging near center", `<div class="w320">${frame("left:30%;top:24%;width:40%;height:40%;", line("is-v", "left:33.33%") + line("is-v", "left:66.66%") + line("is-h", "top:33.33%") + line("is-h", "top:66.66%") + line("is-v is-hit", "left:50%") + line("is-h is-hit", "top:44%"))}</div>`]],
});

/* ---------- Menus, popovers and dialogs ---------- */
const mi = menuItem;
const sub = (ic, t, c = "") => mi(ic, t, c, "", `<span class="ind">${si("chevronForward")}</span>`);
add("Menus and dialogs", "mn-document", "Document menu", "Opens from the title: file actions for the presentation. Glass on background.tertiary with a 16px radius; one icon slot, checks on the right.", {
  both: 1, min: 250, tokens: ["background-tertiary", "menu", "blur-large", "radius-xl", "modeless-teal", "accent-destructive", "content-tertiary"], classes: ["cr-menu", "cr-menu-item", "cr-menu-label", "cr-menu-sep"], states: ["default", "hover", "checked", "disabled", "destructive"],
  html: menu(`<div class="cr-menu-label">Presentation</div>${mi("plus", "New presentation")}${mi("newFromTemplate", "New from template...")}${mi("open", "Open")}${mi("allPresentations", "All presentations")}${mi("duplicate", "Duplicate", "is-hover")}${mi("shareCopy", "Share a copy")}${mi("notes", "Speaker notes")}${mi("", "Autosave", "", "", menuCheck())}${sub("", "Open recent")}<div class="cr-menu-sep"></div>${mi("trash", "Delete", "", "data-destructive")}${mi("gear", "Settings", "is-disabled", "disabled")}`),
});
add("Menus and dialogs", "mn-account", "Account menu", "Opens from the avatar: theme, language, legal, and sign in or create an account.", {
  both: 1, min: 250, tokens: ["background-tertiary", "menu", "content-tertiary", "lighting-shade"], classes: ["cr-menu", "cr-menu-item", "cr-menu-sep", "ind"], states: ["default", "hover"],
  html: menu(`${sub("theme", "Theme")}${sub("language", "Language", "is-hover")}<div class="cr-menu-sep"></div>${sub("legal", "Legal")}<div class="cr-menu-sep"></div>${mi("personFill", "Sign In")}${mi("invite", "Create account")}<div class="cr-menu-sep"></div>${mi("signout", "Sign out")}`),
});
add("Menus and dialogs", "mn-help", "Help menu", "Opens from the help button: tutorials, about slides, help center, support.", {
  both: 1, min: 250, tokens: ["background-tertiary", "menu", "modeless-teal", "lighting-shade"], classes: ["cr-menu", "cr-menu-item", "cr-menu-sep"], states: ["default", "hover"],
  html: menu(`${mi("video", "Watch tutorial videos")}${mi("help", "About slides", "is-hover")}${mi("keyboard", "Keyboard shortcuts")}<div class="cr-menu-sep"></div>${mi("search", "Search our help center")}${mi("ask", "Contact support")}`),
});
add("Menus and dialogs", "mn-context", "Context menu", "Right-click on an object: arrange, copy, delete.", {
  both: 1, min: 250, tokens: ["background-tertiary", "menu", "accent-destructive", "modeless-teal"], classes: ["cr-menu", "cr-menu-item"], states: ["default", "hover", "destructive"],
  html: menu(`${mi("duplicate", "Duplicate")}${mi("arrangeToFront", "Bring to front", "is-hover")}${mi("arrange", "Bring forward")}${mi("arrangeBackward", "Send backward")}${mi("arrangeToBack", "Send to back")}${mi("paste", "Paste settings", "is-disabled", "disabled")}<div class="cr-menu-sep"></div>${mi("trash", "Delete", "", "data-destructive")}`),
});
add("Menus and dialogs", "mn-device", "Device popover", "Opens from a device button: pick the camera or microphone. The widest menu, 298px at least; each device is a two-line row with the selected one checked.", {
  both: 1, min: 330, tokens: ["background-tertiary", "menu", "layout-device-popover", "content-tertiary", "accent-teal", "icon"], classes: ["cr-menu", "is-device", "cr-menu-item", "det", "chk"], states: ["default", "hover", "checked"],
  html: menu(`<div class="cr-menu-label">Camera</div>${mi("cam", "FaceTime HD Camera", "", "", menuCheck(), "Built-in")}${mi("cam", "Studio Display Camera", "is-hover", "", "", "External")}${mi("xmark", "None")}`, { cls: "is-device" }),
});
add("Menus and dialogs", "mn-popover", "Popover", "A floating panel with more content than a menu. Opaque background.secondary in light, because glass washes out over a dark camera feed; glass in dark.", {
  both: 1, min: 280, tokens: ["background-secondary", "background-tertiary", "menu", "blur-large", "radius-xl"], classes: ["cr-menu", "cr-popover"], states: ["light", "dark"],
  html: `<div class="cr-menu cr-popover" style="width:250px"><div class="cr-menu-label">Name tag color</div><div class="cr-swatches is-circle" style="--cols:7;padding:4px 8px 8px" role="radiogroup">${PALETTE.slice(2, 9).map((c, i) => sw(c, { sel: i === 3 })).join("")}</div></div>`,
});
add("Menus and dialogs", "mn-dialog", "Dialog", "A small confirmation on the modeless overlay. background.secondary at the large radius, Cancel and a primary or destructive action.", {
  both: 1, tokens: ["background-secondary", "modeless-overlay", "menu", "radius-xl", "content-primary", "content-secondary"], classes: ["cr-scrim", "cr-dialog", "header", "body", "footer"], states: ["default"], wide: 1,
  html: `<div class="cr-scrim"><div class="cr-dialog"><div class="header"><h2 class="title">Delete this slide?</h2></div><div class="body">This removes the slide and its layers. You can undo it.</div><div class="footer">${button("surface", "Cancel")}${button("solid", "Delete", "is-destructive")}</div></div></div>`,
});
add("Menus and dialogs", "mn-signin", "Sign-in dialog", "Asks for an account before an action that needs one. The Note under the copy says what signing in will also do; it has no fill, so it does not read as an input.", {
  both: 1, tokens: ["background-secondary", "modeless-overlay", "content-tertiary", "menu", "radius-xl"], classes: ["cr-scrim", "cr-dialog", "close", "cr-note"], states: ["default"], wide: 1,
  html: `<div class="cr-scrim"><div class="cr-dialog"><button type="button" class="cr-btn0 close" aria-label="Close">${si("xmark")}</button><div class="header"><h2 class="title">Sign in to continue</h2></div><div class="body"><span>An account is required to use PDF, PowerPoint, or Keynote documents.</span>${note("Signing in saves this scratchpad to your account.")}</div><div class="footer">${button("surface", "Sign In")}${button("solid", "Create account")}</div></div></div>`,
});
add("Menus and dialogs", "mn-sheet", "Sheet", "A large pane for browsing, with a footer separated by a hairline.", {
  both: 1, tokens: ["background-secondary", "lighting-shade", "modeless-overlay", "sheet-width", "sheet-height", "radius-xl"], classes: ["cr-dialog", "is-sheet", "footer"], states: ["default"], wide: 1,
  html: `<div class="cr-scrim" style="padding:20px"><div class="cr-dialog is-sheet"><div class="header"><h2 class="title">Backgrounds</h2></div><div class="body">Content</div><div class="footer">${button("surface", "Cancel")}${button("solid", "Apply")}</div></div></div>`,
});
add("Menus and dialogs", "mn-toast", "Toast", "A short message, floating at the bottom of the window: a glass pill with the menu shadow. An error toast adds a destructive hairline and icon.", {
  both: 1, tokens: ["background-tertiary", "menu", "blur-large", "radius-full", "content-primary", "accent-destructive"], classes: ["cr-toast", "is-error", "cr-button"], states: ["default", "error"], wide: 1,
  cells: [["default", `<div class="cr-toast" role="status"><span>Background effects stopped working.</span>${button("solid", "Reload", "is-sm")}</div>`], ["error", `<div class="cr-toast is-error" role="status">${si("info")}<span>Couldn't save your changes.</span></div>`]],
});
add("Menus and dialogs", "mn-banner", "Session banner", "A full-width message under the top bar: signed out, or presentations could not load. The destructive wash at 12%.", {
  tokens: ["accent-destructive", "content-primary"], classes: ["cr-notice"], states: ["default"], full: 1,
  html: `<div class="cr-notice" role="alert"><span>You were signed out. Sign in again to reach your account.</span>${button("surface", "Sign In", "is-sm")}</div>`,
});
export const AREAS = AR;
