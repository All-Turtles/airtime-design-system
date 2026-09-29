import { pattern, si, icon, glyph, mm } from "./lib.js";
const G = (cap, html) => ({ cap, html });
const ST = [["default", ""], ["hover", "is-hover"], ["pressed", "is-pressed"], ["focus-visible", "is-focus"], ["selected", "is-selected"], ["disabled", "is-disabled"]];
const states = (fn, which = ST) => which.map(([n, c]) => G(n, fn(c, n)));
const ib = (ic, label, cls = "", attrs = "") => `<button type="button" class="cr-btn0 cr-iconbtn ${cls}" aria-label="${label}" ${attrs}>${icon(ic)}</button>`;
const helpBtn = (cls = "") => `<button type="button" class="cr-btn0 cr-iconbtn is-quiet ${cls}" aria-label="Help">${mm("Help")}</button>`;
const title = (cls = "", renamable) => `<button type="button" class="cr-btn0 cr-title ${cls}"><span class="glyph">${icon("Hamburger")}</span><span class="label ${renamable ? "is-renamable" : ""}">Scratchpad</span><span class="chev">${icon("CaretRight")}</span></button>`;
const mode = (on = 0) => `<div class="cr-mode" role="radiogroup" aria-label="Mode">${["Present", "Record"].map((t, i) => `<button type="button" class="cr-btn0 cr-mode-item ${on === i ? "is-selected" : ""}" role="radio" aria-checked="${on === i}">${t}</button>`).join("")}</div>`;
const avatar = (cls = "") => `<button type="button" class="cr-btn0 cr-avatar ${cls}" aria-label="Account menu"><span>D</span></button>`;
const insertBtn = (g, label, cls = "", attrs = "") => `<button type="button" class="cr-btn0 cr-insert ${cls}" aria-label="${label}" ${attrs}>${glyph(g)}</button>`;
const record = (cls = "", dis) => `<button type="button" class="cr-btn0 cr-record ${cls}" ${dis ? "disabled" : ""}><span class="dot">${icon("Record")}</span><span>Record</span></button>`;
const hud = (inner) => `<div class="cr-hud">${inner}</div>`;
const insertGroup = () => hud(`<span class="cr-hud-label">Insert</span>${insertBtn("ScreenShare", "Screenshare")}${insertBtn("Text", "Text")}${insertBtn("MediaLibrary", "Media Library")}${insertBtn("UploadFile", "Upload File")}${insertBtn("Giphy", "GIPHY")}${insertBtn("CameraSlide", "Add another camera")}<span class="cr-hud-sep"></span>${insertBtn("Pointer", "Pointer")}`);
const split = (g, label, cls = "", off, open) => `<div class="cr-split"><button type="button" class="main ${cls}" ${off ? "data-off" : ""}>${off ? `<span class="offg">${glyph("Xmark")}</span>` : `<span class="glyph">${glyph(g)}</span>`}<span class="value">${label}</span></button><button type="button" class="trigger ${open ? "is-open" : ""}" aria-label="Select"><span class="chev">${icon("Disclosure")}</span></button></div>`;
const chip = (cls = "", live, open) => `<button type="button" class="cr-btn0 cr-statuschip ${cls} ${open ? "is-open" : ""}"><span class="sdot" ${live ? "data-live" : ""}></span><span>${live ? "Live" : "Ready"}</span><span class="cr-badge" ${live ? "data-live" : ""}>${live ? "<i></i>Recording" : "Draft"}</span></button>`;

export function header(root) {
  const P = [];
  P.push(pattern({
    id: "hd-topbar", title: "TopBar (assembled)", org: ["creator-only", "The org system has no application top bar."], raw: true,
    note: "A 52px bar at header.ground (mat.hud at 92%), a 0.5px bottom line as shadow, 16px gutters, 8px gap. Left: presentation title. Centre: mode switch. Right: undo, redo, sidebar toggle, help, account. Buttons in the bar render <code>cursor: pointer</code>; the sidebar uses <code>cursor: default</code> (a difference in the rendered UI, not in the recipes).",
    css: ["cr-topbar"], src: ["hd.topbar"],
    anatomy: [["Bar", "52px, padding 0 16, gap 8, bg header.ground, shadow top-bar, z 20", "size.creator.top-bar, space.gutter, color.header-ground, shadow.top-bar, z.top-bar"], ["Type", "13px / 17px / 400 (body.large), text.1", "text-style body-large"], ["Left / right", "flex 1 each, so the mode switch is centred on the bar", ""]],
    groups: [G("bar", `<div class="cr-topbar" style="border-radius:8px"><div class="grow">${title("", true)}</div>${mode(0)}<div class="grow end">${ib("Undo", "Undo", "", "disabled")}${ib("Redo", "Redo", "", "disabled")}${ib("SidebarRight", "Hide sidebar", "is-toggle", 'aria-pressed="true"')}${helpBtn()}${avatar()}</div></div>`)],
  }));
  P.push(pattern({
    id: "hd-title", title: "Presentation title (document menu trigger)", org: ["creator-only", "-"], raw: true, flex: true,
    note: "The document-menu trigger: a 24px button (radius lg) holding a 15px glyph, the name (12px/500 text.2 in a 4px-radius label with a transparent 1px border that shows on hover when renamable) and a rotated chevron. Hover fills header.title-hover.",
    css: ["cr-title"], src: ["hd.topbar"],
    anatomy: [["Trigger", "h24, padding 6 12, gap 6, radius lg, color content.secondary", "size.6, radius.lg, color.content-secondary"], ["Label", "max 280px (180 narrow), 12/500, radius 4, border 1px transparent", "size.creator.title, radius.title-label"], ["Hover", "header.title-hover; renamable label border header.title-border", "color.header-title-hover, color.header-title-border"]],
    groups: states((c) => `<div class="cr-topbar" style="padding:4px 8px;height:auto;box-shadow:none;background:transparent">${title(c, true)}</div>`, [ST[0], ST[1], ST[3]]),
  }));
  P.push(pattern({
    id: "hd-mode", title: "Mode switch (segment group)", org: ["differs", "Org segmented.css: 28px track; Creator: 30px track on state.active with a white raised thumb on the spring curve."], raw: true, flex: true,
    note: "Chakra SegmentGroup with the default variant: a 30px track (radius lg, padding 2, bg state.active, inset segment-track shadow), items 26px tall with 12px/500 labels; unselected content.tertiary, selected/hover content.primary. The selected thumb is a sliding indicator (bg.panel + segment-thumb shadow, spring easing); here it is drawn as the selected item's own fill.",
    css: ["cr-mode", "cr-mode-item"], src: ["hd.mode"],
    anatomy: [["Track", "padding 2, gap 2, radius lg, bg state.active", "shadow.segment-track, color.state-active"], ["Item", "h26 (size.segment), px 12, radius md, 12/500", "size.segment"], ["Thumb", "bg.panel + edge-in highlight + 0.5px edge-out + 1px drop", "shadow.segment-thumb"], ["Ease", "indicator: easing.spring", "easing.spring"]],
    groups: [G("selected: Present", mode(0)), G("selected: Record", mode(1)), G("item hover", `<div class="cr-mode"><button class="cr-btn0 cr-mode-item is-hover">Hover</button><button class="cr-btn0 cr-mode-item is-selected">Selected</button></div>`), G("item focus-visible", `<div class="cr-mode"><button class="cr-btn0 cr-mode-item is-focus is-selected">Focus</button><button class="cr-btn0 cr-mode-item">Other</button></div>`), G("item disabled", `<div class="cr-mode"><button class="cr-btn0 cr-mode-item is-selected">On</button><button class="cr-btn0 cr-mode-item is-disabled" disabled>Off</button></div>`)],
  }));
  P.push(pattern({
    id: "hd-iconbtn", title: "Icon buttons (undo, redo, sidebar toggle, help)", org: ["differs", "Org has no round ghost icon button; sizes 32px, radius full."], raw: true, flex: true,
    note: "Button recipe size <b>xs</b> (32px circle, 20px glyph) + variant <b>plain</b>: hover fills header.history-hover on 150ms ease-in-out; pressed (aria-pressed, the sidebar toggle) fills state.active and text.1, state.active-strong on hover; disabled is 0.3 (heavier than every other disabled state: the xs size overrides 0.45). Help renders in content.tertiary.",
    css: ["cr-iconbtn"], src: ["hd.iconbtn"],
    anatomy: [["Box", "32x32, radius full, glyph 20", "size.8, radius.full, size.5"], ["Hover", "header.history-hover (plain) / state.hover (toggle)", "color.header-history-hover"], ["Pressed", "bg state.active, text.1 (strong on hover)", "color.state-active, color.state-active-strong"], ["Active", "scale .97", ""], ["Disabled", "opacity .3, cursor not-allowed", "opacity.disabled-icon"]],
    groups: [...states((c, n) => ib("Undo", n, c, n === "disabled" ? "disabled" : ""), [ST[0], ST[1], ST[2], ST[3], ST[5]]).map((g) => ({ ...g, cap: "undo · " + g.cap })), G("toggle · off", ib("SidebarRight", "Show sidebar", "is-toggle", 'aria-pressed="false"')), G("toggle · on", ib("SidebarRight", "Hide sidebar", "is-toggle", 'aria-pressed="true"')), G("toggle · on, hover", ib("SidebarRight", "Hide sidebar", "is-toggle is-hover", 'aria-pressed="true"')), G("help (quiet)", helpBtn()), G("redo", ib("Redo", "Redo"))],
  }));
  P.push(pattern({
    id: "hd-avatar", title: "Account avatar", org: ["differs", "Org avatar.css sizes 24-64 with a status ring; Creator: 28px with a 0.5px edge ring."], raw: true, flex: true,
    note: "A 28px circle button holding a 26px avatar; the ring is the avatar shadow (0.5px edge-out), heavier on hover (avatar-hover).",
    css: ["cr-avatar"], src: ["hd.iconbtn"],
    anatomy: [["Box", "28px, inner 26px", ""], ["Ring", "0.5px edge.out; hover 0.30/0.78 black", "shadow.avatar, shadow.avatar-hover"]],
    groups: states((c) => avatar(c), [ST[0], ST[1], ST[3]]),
  }));
  P.push(pattern({
    id: "hd-record", title: "Record button", org: ["creator-only", "-"], raw: true, flex: true,
    note: "The band's primary control: a 38px pill (radius xl) on the window ground (bg) with the band-pill edge and a red 20px disclosure glyph. Below 800px it collapses to a 38px square. Rendered label is 13px (recipe intends 11px band.record; the unlayered button reset wins).",
    css: ["cr-record"], src: ["hd.record"],
    anatomy: [["Box", "h38, min-w 93, padding 0 16 0 12, gap 8, radius xl", "size.creator.band-row, size.creator.record-min, radius.xl"], ["Fill", "bg; hover 94% bg / 6% text.1", "color.bg"], ["Edge", "band-pill = edge highlight + hairline + upward drop", "shadow.band-pill"], ["Glyph", "20px, danger.solid", "color.danger-solid"]],
    groups: states((c, n) => record(c, n === "disabled"), [ST[0], ST[1], ST[2], ST[3], ST[5]]),
  }));
  P.push(pattern({
    id: "hd-insert", title: "INSERT group (HUD pill and insert buttons)", org: ["creator-only", "-"], raw: true,
    note: "A HUD pill (38px, padding 3, gap 2, mat.hud + band-pill) with the uppercase band label INSERT (10/600, .06em, text.4) and 32px insert buttons (radius lg, text.3). Hover and open fill background.tertiary and take content.primary; a latched tool (aria-pressed, Pointer) wears the brand (action.primary bg, background.primary text) even under the cursor; on fire the button flashes content.accent for 260ms; press scales .94; timing 120ms ease-out.",
    css: ["cr-hud", "cr-hud-label", "cr-insert", "cr-hud-sep"], src: ["hd.insert"],
    anatomy: [["Pill", "h38, padding 3, gap 2, radius xl", "shadow.band-pill, color.mat-hud"], ["Label", "band.label", "text-style band-label"], ["Button", "32px, radius lg, glyph 20", "size.8, radius.lg"], ["Fired", "content.accent flash (duration fired 260ms)", "color.content-accent, duration.fired"]],
    groups: [G("assembled", insertGroup()), G("states", `<div style="display:flex;gap:14px;align-items:center;flex-wrap:wrap">${ST.map(([n, c]) => `<div style="display:flex;flex-direction:column;align-items:center;gap:4px">${hud(insertBtn("Text", "Text", c === "is-selected" ? "is-selected" : c, n === "disabled" ? "disabled" : ""))}<span class="muted" style="font-size:10px">${n === "selected" ? "pressed (latched)" : n}</span></div>`).join("")}<div style="display:flex;flex-direction:column;align-items:center;gap:4px">${hud(insertBtn("Text", "Text", "is-fired"))}<span class="muted" style="font-size:10px">fired</span></div></div>`)],
  }));
  P.push(pattern({
    id: "hd-split", title: "Device split button (camera, microphone)", org: ["creator-only", "-"], raw: true, flex: true,
    note: "A HUD pill split into a main toggle (glyph + 88px name, 12px left padding) and a 25px picker trigger with a 9px chevron and a hairline divider inset 8px top and bottom. Each half draws its own hover wash as a 3px-inset pseudo-element so the pill's outer radius is preserved; expanded holds state.active. Off state text.5. Disabled is 0.2.",
    css: ["cr-split"], src: ["hd.split"],
    anatomy: [["Root", "h38, radius xl, overflow hidden, mat.hud + band-pill", ""], ["Main", "padding 0 8 0 12, gap 6, text.3", ""], ["Trigger", "padding 0 8; ::after hairline left, inset 8", "size.creator.hairline"], ["Wash", "::before inset 3px: state.hover, pressed state.active", "space.0-75"], ["Focus", "shadow.focus-inset inside the wash", "shadow.focus-inset"]],
    groups: [G("camera on", split("Webcam", "Camera 1")), G("microphone off", split("Microphone", "Mute", "", true)), G("main hover", split("Webcam", "Camera 1", "is-hover")), G("main focus-visible", split("Webcam", "Camera 1", "is-focus")), G("picker open", split("Webcam", "Camera 1", "", false, true)), G("disabled", `<div style="opacity:1">${split("Webcam", "Camera 1", "is-disabled")}</div>`)],
  }));
  P.push(pattern({
    id: "hd-status", title: "Status chip and badge", org: ["differs", "Org badge.css: 20px pill badges; Creator adds a live variant (status.live)."], raw: true, flex: true,
    note: "A 32px chip with a 7px status dot (idle: content.tertiary at .55; live: status.live), a 11px readout and a 20px pill badge (10/500; live: status.live-fill on status.live-text). Hover fills state.hover, open state.active.",
    css: ["cr-statuschip", "cr-badge"], src: ["hd.status"],
    anatomy: [["Chip", "h32, padding 0 16 0 12, gap 6, radius xl", ""], ["Dot", "7px; live: status.live", "size.creator.status-dot"], ["Badge", "h20, px8, radius full, 10/500", "color.highlight-primary, color.status-live-fill"]],
    groups: [G("idle", chip()), G("live", chip("", true)), G("hover", chip("is-hover")), G("open", chip("", true, true)), G("focus-visible", chip("is-focus"))],
  }));
  root.innerHTML = `<section id="header"><h2>Header and toolbar</h2><p class="lede">The TopBar and the stage band. These render on the window ground in both themes (light and dark stages below). Values are the rendered ones; where the rendered UI differs from a recipe's intent it is called out in the pattern note.</p>${P.join("")}</section>`;
}
