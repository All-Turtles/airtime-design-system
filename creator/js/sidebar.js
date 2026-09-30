import { pattern, si, icon, mask, esc, S, hydrateIcons, badge, srcList, auditBadges, auditBlock, tokChip, tokensUsed, SIDE as SIDE_, MASKS as MASKS_ } from "./lib.js";

/* ── markup builders (the exact structure of the React primitives) ── */
export const iconToggle = (ic, label, { cls = "", pressed, dis } = {}) => `<button type="button" class="cr-btn0 cr-icontoggle ${cls}" aria-label="${label}" title="${label}" ${pressed != null ? `aria-pressed="${pressed}"` : ""} ${dis ? "disabled" : ""}>${si(ic)}</button>`;
const rowLabel = (ic, text, menuItem) => `<span class="cr-row-label ${menuItem ? "is-menuitem" : ""}">${ic ? (menuItem ? `<span class="cr-slot15">${si(ic)}</span>` : si(ic)) : ""}<span>${text}</span></span>`;
export const row = (ic, text, { cls = "", trailing = "", menuItem, tag = "button", open } = {}) => tag === "div" ? `<div class="cr-row is-static ${cls}">${rowLabel(ic, text, menuItem)}${trailing}</div>` : `<button type="button" class="cr-btn0 cr-row ${cls}" ${open ? 'aria-expanded="true"' : ""}>${rowLabel(ic, text, menuItem)}${trailing}</button>`;
export const action = (ic, text, { cls = "", destructive, dis } = {}) => `<button type="button" class="cr-btn0 cr-action ${cls}" ${destructive ? "data-destructive" : ""} ${dis ? "disabled" : ""}>${ic ? si(ic) : ""}${text}</button>`;
export const actions = (n, items, cls = "") => `<div class="cr-actions is-${n} ${cls}">${items.join("")}</div>`;
const segItem = (o, kind, on, cls = "") => `<button type="button" class="cr-btn0 cr-seg-item ${cls} ${on === true ? "" : ""}" ${kind === "radio" ? `role="radio" aria-checked="${!!on}"` : kind === "toggle" ? `aria-pressed="${!!on}"` : ""} ${o.dis ? "disabled" : ""} ${o.label && (o.icon && !o.text) ? `aria-label="${o.label}" title="${o.label}"` : ""}>${o.icon ? si(o.icon) : ""}${o.text ?? ""}</button>`;
export const seg = (variant, opts, { mode = "radio", on = 0, fill } = {}) => `<div class="cr-seg is-${variant} ${fill ? "is-fill" : ""}" role="${mode === "radio" ? "radiogroup" : "group"}" aria-label="demo">${opts.map((o, i) => (o.sep ? `<span class="cr-seg-sep" role="separator"></span>` : "") + segItem(o, o.mode ?? mode, Array.isArray(on) ? on.includes(i) : on === i)).join("")}</div>`;
export const valueField = (v, cls = "is-value", extra = "") => `<label class="cr-field ${cls} ${extra}"><input value="${v}" aria-label="value"></label>`;
export const geo = (axis, v) => `<label class="cr-field is-geo"><span data-affix>${axis}</span><input value="${v}" aria-label="${axis}"><span data-affix>%</span></label>`;
export const pill = (text, extra = "") => `<span class="cr-field is-pill ${extra}">${text}${si("chevronDown")}</span>`;
export const sw = (bg, { sel, cls = "", none, cap } = {}) => `<button type="button" class="cr-btn0 cr-swatch ${cls} ${sel ? "is-selected" : ""}" role="radio" aria-checked="${!!sel}" ${cap ? "" : ""}>${cap ? `<span data-swatch>${none ? '<span class="cr-none-tile"></span>' : `<span style="display:block;width:100%;height:100%;background:${bg}"></span>`}</span><span data-caption>${cap}</span>` : none ? '<span class="cr-none-tile"></span>' : `<span style="display:block;width:100%;height:100%;background:${bg}"></span>`}</button>`;
export const PALETTE = ["#FFFFFF", "#8E9294", "#0B0F11", "#FF4B3E", "#FF8A3D", "#FFD23F", "#A6E22E", "#3FCF6A", "#2BC7B0", "#56C7F0", "#5C7CFA", "#3D7BFF", "#9B5CF6", "#F056B6", "#FF7AB8", "#8A5A3B"];
export const art = (a, b) => `<span class="cr-thumb-art" style="background:linear-gradient(135deg,${a},${b})"></span>`;
export const thumbRow = ({ name, sel, hidden, locked, cls = "", grip = true, thumb = art("#3cb0a4", "#3b6bf0"), trailing, drop }) => `<div class="cr-thumbrow ${sel ? "is-selected" : ""} ${cls} ${drop ? "is-drop-" + drop : ""}" role="button" tabindex="0">${grip ? `<span class="cr-grip ${locked ? "is-locked" : ""}"><span>⣿</span></span>` : `<span class="cr-grip"></span>`}<span class="cr-thumb ${hidden ? "is-dimmed" : ""}">${thumb}</span><span class="cr-thumb-text">${name}</span>${trailing ?? ""}</div>`;
export const layerToggles = (hidden, locked) => iconToggle(hidden ? "noEye" : "eye", hidden ? "Show layer" : "Hide layer", { cls: "is-inline", pressed: hidden }).replace("cr-icontoggle", "cr-icontoggle").replace('<button', '<button data-reveal') + iconToggle(locked ? "lock" : "lockOpen", locked ? "Unlock layer" : "Lock layer", { cls: "is-inline", pressed: locked }).replace('<button', '<button data-reveal');
export const sw34 = (on, cls = "") => `<button type="button" class="cr-btn0 cr-switch ${cls}" role="switch" aria-checked="${on}" aria-label="Logo"><span><span></span></span></button>`;
export const head = (title, { icon: ic, hint, link, tall } = {}) => `<div class="cr-section-head ${tall ? "is-tall" : ""} ${hint ? "has-hint" : ""} ${link ? "has-link" : ""}">${ic ? si(ic) : ""}<span class="cr-head-title">${title}</span>${hint ? `<span class="cr-head-hint">${hint}</span>` : ""}${link ? `<button type="button" class="cr-btn0 cr-headlink"><span>${link}</span></button>` : ""}</div>`;
const G = (cap, html) => ({ cap, html });
const ST = [["default", ""], ["hover", "is-hover"], ["pressed", "is-pressed"], ["focus-visible", "is-focus"], ["selected", "is-selected"], ["disabled", "is-disabled"]];
const states = (fn, which = ST) => which.map(([n, c]) => G(n, fn(c, n)));
const stack = (...xs) => `<div style="display:grid;gap:6px">${xs.join("")}</div>`;

export function sidebar(root) {
  const P = [];

  // ── 1. card
  P.push(pattern({
    id: "sb-card", title: "Sidebar card and pane body", org: ["creator-only", "The org system has no inspector panel; it is a 296px push column over the stage."],
    note: "The right-hand column. Opening it takes 296px and the stage column yields (420ms flow curve); closed it leaves layout by its own width. The card is a HUD material with a 14px radius; type is set once on the card and inherited by every descendant.",
    css: ["cr-sidebar", "cr-sidebar-scroll"], src: ["sb.card"],
    anatomy: [["Card", "296 wide, radius 2xl (14px), bg mat.hud, shadow sidebar-card, isolation:isolate", "size.creator.sidebar, radius.2xl, color.mat.hud, shadow.sidebar-card"], ["Base type", "12px / 400 / 15px line, -0.036px tracking, start aligned", "font-size.sidebar, line-height.sidebar, letter-spacing.sidebar"], ["Scroll body", "padding 12 16 48; bottom corners clipped to the card", "space.3, space.4, space.12"], ["Header", "44px band, never scrolls (see Pane header)", "size.pane-header"]],
    groups: [G("Slide pane sample", `<div style="margin:-12px -16px 12px" class="cr-pane-head">${'<h2 class="cr-pane-title">Slide</h2>'}</div>${head("Layout", { tall: true })}${row("cam", "Layout", { trailing: si("chevronForward") })}<hr class="cr-rule is-shown">${head("Background", { tall: true, hint: "12 options" })}<div class="cr-swatches" style="--cols:4">${sw("linear-gradient(135deg,#3cb0a4,#3b6bf0)", { sel: 1 })}${sw("#333")}${sw("#c33")}${sw("#3c3")}</div>`)],
  }));

  // ── 2. pane header
  P.push(pattern({
    id: "sb-pane-header", title: "Pane header", org: ["creator-only", "No org equivalent."],
    note: "A full-bleed 44px strip above the scroller. The hairline is a pseudo-element inset 16px left and 12px right, never a border, so it does not touch the card's corners. With a back button the strip starts 6px earlier (the button's 26px hit box sits at x=10).",
    css: ["cr-pane-head", "cr-pane-title", "cr-pane-actions"], src: ["sb.pane"],
    anatomy: [["Band", "44px, padding 0 12 0 16 (0 12 0 10 with back), gap 8", "size.pane-header, space.4, space.3, space.2, space.2-5"], ["Hairline", "::after, left 16, right 12, bottom 0, 0.5px, color line", "size.creator.hairline, color.line"], ["Back", "IconToggle back: 26px box, 20px chevron", "size.hit-header, size.5"], ["Title", "13px / 500 / 15px, text.1, ellipsis, no tracking", "color.text.1"], ["Actions", "header IconToggles (Hide, Lock), 2px apart, 6px into the right padding", "space.0-5, space.1-5"]],
    groups: [
      G("Object pane (back, title, hide, lock)", `<div style="margin:-12px -16px" class="cr-pane-head has-back">${iconToggle("chevronBack", "Back", { cls: "is-back" })}<h2 class="cr-pane-title">Presenter</h2><div class="cr-pane-actions">${iconToggle("eye", "Hide", { pressed: false })}${iconToggle("lock", "Lock", { pressed: true })}</div></div><div style="height:12px"></div>`),
      G("Long title truncates", `<div style="margin:0 -16px" class="cr-pane-head has-back">${iconToggle("chevronBack", "Back", { cls: "is-back" })}<h2 class="cr-pane-title">A very long presentation object name that truncates</h2><div class="cr-pane-actions">${iconToggle("eye", "Hide", { pressed: true })}${iconToggle("lock", "Lock", { pressed: false })}</div></div>`),
    ],
  }));

  // ── 3. icon toggle
  const itStates = (extra, ic = "eye") => (c, n) => iconToggle(ic, n, { cls: `${extra} ${c}`, pressed: n === "selected" ? true : undefined, dis: n === "disabled" });
  P.push(pattern({
    id: "sb-icontoggle", title: "Icon toggle (header, inline, back) and header toggles", org: ["creator-only", "The org has icon buttons in button.css but not this round ghost toggle."],
    note: "A round ghost icon button: header size (26px box, 16px glyph), back (26px box, 20px glyph), inline (22px box, 14px glyph, radius md, used by layer rows and revealed on hover). In the header, pressed fills the button; inline pressed never fills, it only strengthens the text.",
    css: ["cr-icontoggle"], src: ["sb.icontoggle"],
    anatomy: [["Box", "26px circle (header/back); inline 22px radius md", "size.hit-header, size.hit-inline, radius.full, radius.md"], ["Glyph", "16 / 20 / 14px, fill:currentColor", "size.icon-header, size.5, size.icon-inline"], ["Colour", "rest text.3, hover text.1 on state.hover, pressed text.1 on state.active", "color.text.3, color.state.hover, color.state.active"], ["Focus", "shadow.focus (outline none)", "shadow.focus"], ["Disabled", "opacity .4", "opacity.disabled"]],
    groups: [...states(itStates("")).map((g) => ({ ...g, cap: "header · " + g.cap })), G("back", iconToggle("chevronBack", "Back", { cls: "is-back" })), ...states(itStates("is-inline"), [ST[0], ST[1], ST[4]]).map((g) => ({ ...g, cap: "inline · " + g.cap })), G("sidebar toggle (top bar, header-size)", iconToggle("sidebarToggle", "Hide sidebar", { pressed: true }))],
  }));

  // ── 4. labels, heads, rules
  P.push(pattern({
    id: "sb-labels", title: "Labels: section heads, hints, HeadLink, row labels, helper text, rules", org: ["creator-only", "Org has heading-* text roles (14/12px); Creator sidebar heads are 13px/500."],
    note: "Section rhythm: a 13px/500 head in text.2, 12px above the first control (head margin = 12 minus the body gap), a 6px-gap body, and hairline rules with 12px above and below that never open or close a pane. The slide pane uses the tall 21px head with a quiet 9px hint on the title's baseline; HeadLink is 11px accent text that underlines on hover.",
    css: ["cr-section", "cr-section-head", "cr-head-title", "cr-head-hint", "cr-headlink", "cr-rule", "cr-row-label"], src: ["sb.section"],
    anatomy: [["Head", "13px / 15px / 500, text.2, gap 6, icon 20px optional", "color.text.2"], ["Tall head", "min-height 21, baseline aligned, gap 8 (slide pane: Layout, Layers, Background, Logo bug)", ""], ["Hint", "9px, 1.3 line, text.5, right aligned, truncates", "font-size.3xs, color.text.5"], ["HeadLink", "11px / 500, accent.solid, underline on hover, focus ring", "color.accent.solid, font-size.xs"], ["Row label", "12px / 15px / 400 text.2 (body.medium)", "text-style body-medium"], ["Rule", "hr 0.5px, color line, margin 12 0, hidden when first or last child", "size.creator.hairline, color.line, space.3"], ["Helper text", "text.4/text.5 at 10-11px (no dedicated helper style; see Untokenized audit)", "color.text.4, color.text.5"]],
    groups: [
      G("Object-pane head (bare 15px, 12px below)", head("Frame")),
      G("Head with icon", head("Appearance", { icon: "effects" })),
      G("Tall head with hint", head("Layers", { tall: true, hint: "7 layers" })),
      G("Head with HeadLink", head("Crop", { link: "Reset crop" })),
      G("HeadLink states", `<div style="display:flex;gap:18px"><button class="cr-btn0 cr-headlink"><span>default</span></button><button class="cr-btn0 cr-headlink is-hover"><span>hover</span></button><button class="cr-btn0 cr-headlink is-focus"><span>focus</span></button><button class="cr-btn0 cr-headlink is-disabled" disabled><span>disabled</span></button></div>`),
      G("Rule between sections (forced visible)", `<hr class="cr-rule is-shown">`),
      G("Row label + helper text", `<div class="cr-row-label">${si("opacity")}<span>Opacity</span></div><div style="color:var(--cr-color-text-4);font-size:11px;line-height:14px;margin-top:4px">Helper text sits at text.4, 11px</div><div style="color:var(--cr-color-text-5);font-size:10px;margin-top:2px">Quiet hint at text.5, 10px</div>`),
    ],
  }));

  // ── 5. rows
  P.push(pattern({
    id: "sb-row", title: "Rows (row, select, static, menu item)", org: ["differs", "Org rows (rows.css) are 32/40px list rows on a teal-tinted ground; Creator's are 30px ghost rows with no rest fill."],
    note: "The 30px row: icon, label, optional trailing value. Rest state has no fill; hover uses state.hover, an open popup (aria-expanded) holds state.active. A label-only row (Tint) is a div with no hover. `select` keeps the sidebar's type instead of the menu item's line/tracking reset; `menuItem` uses a 15px icon slot and 8px gap (Copy/Paste settings).",
    css: ["cr-row", "cr-row-label"], src: ["sb.row"],
    anatomy: [["Box", "min-height 30, padding 4 6, gap 6, radius md (7)", "size.row, radius.md, space.1, space.1-5"], ["Label", "20px icon + 12px text.2, truncates", "size.icon-row"], ["Hover / open", "state.hover / state.active", "color.state.hover, color.state.active"], ["Focus", "shadow.focus", ""], ["Disabled", "opacity .4, no hover fill", "opacity.disabled"]],
    groups: [...states((c, n) => row("border", "Border", { cls: c, trailing: `<span class="cr-dot" style="background:#3D7BFF"></span>`, open: n === "pressed" }), [ST[0], ST[1], ST[2], ST[3], ST[5]]).map((g) => (g.cap === "pressed" ? { ...g, cap: "open (aria-expanded)" } : g)), G("static label row (no hover)", row("padding", "Tint", { tag: "div", trailing: `<span class="cr-dot is-none"></span>` })), G("menu item metrics (Copy settings)", row("copy", "Copy settings", { menuItem: true }) + row("paste", "Paste settings", { menuItem: true })), G("select row with pill", row("effects", "Effects", { cls: "is-select", trailing: pill("None") }))],
  }));

  // ── 6. action buttons
  const a2 = (c = "", d) => actions(2, [action("duplicate", "Duplicate", { cls: c }), action("trash", "Delete", { destructive: true, cls: c })]);
  P.push(pattern({
    id: "sb-actions", title: "Action buttons (1, 2, 3-up, compact, destructive, disabled)", org: ["differs", "Org button.css has primary/secondary/tertiary/destructive filled buttons; Creator's sidebar action is one quiet raised wash, with destructive coloured only on hover."],
    note: "Text buttons in a Grid (so no basis/gap coupling): one wide, two side by side, or three. `compact` is for three-up where a label is wider than its ~77px cell: padding tightens and the label wraps to a centred second line. `destructive` colours only the hover (danger.fg). An unwired action is a Placeholder: 40% opacity, inert.",
    css: ["cr-action", "cr-actions"], src: ["sb.action", "sb.placeholder"],
    anatomy: [["Box", "min-height 30, padding 0 8, radius md, gap 6, centred", "size.row, radius.md, space.2"], ["Fill", "state.hover at rest; state.active hover; state.active-strong pressed", "color.state.*"], ["Edge", "top highlight edge.in + 1px drop", "shadow.action-button"], ["Glyph", "18px", "size.icon-action"], ["Type", "inherits the sidebar root: 12/400/15, -0.036px", ""], ["Grid", "gap 6; columns 1/2/3, minmax(0,1fr)", "space.1-5"]],
    groups: [G("1-up", actions(1, [action("expand", "Fullscreen")])), G("2-up", a2()), G("3-up compact (wrapping label)", actions(3, [action("crop", "Adjust crop"), action("duplicate", "Apply to all slides"), action("media", "See all")], "is-compact")), G("destructive (hover shows red)", actions(2, [action("trash", "Delete", { destructive: true, cls: "is-hover" }), action("trash", "Delete", { destructive: true })])), ...states((c, n) => action("duplicate", "Duplicate", { cls: c, dis: n === "disabled" }), [ST[0], ST[1], ST[2], ST[3], ST[5]]), G("placeholder (unwired)", `<div class="cr-placeholder"><div>${a2()}</div></div>`)],
  }));

  // ── 7. segmented
  const SEGO = [{ text: "Visible" }, { text: "Blurred" }, { text: "Hidden" }];
  const SHP = [{ icon: "maskRectangle", text: "Rect" }, { icon: "maskSquare", text: "Square" }, { icon: "maskCircle", text: "Circle" }, { icon: "maskHexagon", text: "Hex" }];
  const TOOL = [{ icon: "textAlignLeft", label: "Left" }, { icon: "textAlignCenter", label: "Center" }, { icon: "textAlignRight", label: "Right" }, { icon: "textList", label: "List", sep: 1, mode: "toggle" }];
  const ASP = ["Auto", "16:9", "4:3", "1:1", "3:4", "9:16"].map((t) => ({ text: t }));
  P.push(pattern({
    id: "sb-seg", title: "Segmented controls (segmented, bare, shape, tool; radio, toggle, action)", org: ["differs", "Org segmented.css: a 28px track with elevated selected thumb; Creator's selected is a darkening wash (state.selected) in both themes and there is no thumb shadow."],
    note: "Every selectable segment in the sidebar shares one recipe. The selected look is driven by aria-checked / aria-pressed / data-state alone: a rgba(0,0,0,.15) wash and text.1 in both themes. `segmented` sits in a hairline track (Visible/Blurred/Hidden); `bare` are the aspect chips; `shape` is icon over a 10px label in four columns; `tool` are 24px square format tools (with `fill` they spread across the row). Modes: radio (one of, arrows move), toggle (each independent), action (plain buttons, nothing selected). An option's own mode overrides the group's.",
    css: ["cr-seg", "cr-seg-item", "cr-seg-sep"], src: ["sb.seg"],
    anatomy: [["Track", "grid, radius lg (10), padding 2, gap 2, inset ring + 1px inner drop", "radius.lg, shadow.segment-track-sidebar"], ["Item", "24px tall, radius md, 12px/500, text.2; hover text.1", "size.control, radius.md"], ["Selected", "bg state.selected (always .15 black), text.1, no shadow", "color.state.selected"], ["Shape item", "column, 22px glyph over 10px/400 label, text.3", "size.icon-shape"], ["Tool", "24x24, text.3 (fill: text.4, 16px glyph, flex 1)", ""], ["Separator", "1x15px, line colour, 4px margins", "color.line"], ["Focus/disabled", "shadow.focus; opacity .4", ""]],
    groups: [
      G("segmented · radio", seg("segmented", SEGO, { on: 0 })),
      G("bare (aspect chips)", seg("bare", ASP, { on: 1 })),
      G("shape", seg("shape", SHP, { on: 2 })),
      G("tool · mixed radio + toggle (separator)", seg("tool", TOOL, { on: [0, 3] })),
      G("tool fill (Align / Arrange rows)", seg("tool", TOOL.slice(0, 3).concat([{ icon: "alignTop", label: "Top" }, { icon: "alignBottom", label: "Bottom" }]), { on: 1, fill: true })),
      G("toggle mode (B I U)", seg("tool", [{ text: "<b>B</b>", label: "Bold" }, { text: "<i>I</i>", label: "Italic" }, { text: "<u>U</u>", label: "Underline" }], { mode: "toggle", on: [0, 2] })),
      G("action mode (nothing selected)", seg("segmented", SEGO, { mode: "action", on: -1 })),
      ...["default", "hover", "focus-visible", "selected", "disabled"].map((n) => G("item · " + n, `<div class="cr-seg is-segmented" style="grid-template-columns:96px"><button class="cr-btn0 cr-seg-item ${{ hover: "is-hover", "focus-visible": "is-focus", selected: "is-selected", disabled: "is-disabled" }[n] ?? ""}" ${n === "disabled" ? "disabled" : ""}>Visible</button></div>`)),
    ],
  }));

  // ── 8. fields + range
  P.push(pattern({
    id: "sb-field", title: "Value fields and range popup", org: ["differs", "Org input.css has 32-40px labelled text fields; Creator's are 24px right-aligned numeric wells."],
    note: "The value well sits at the end of a slider row: 54px wide (112px `wide` for a hex code), 24px tall, tabular numerals, 11px type. A well is an inset hairline ring on surface.inset; hover strengthens the ring (line.strong); focus draws a 0.5px accent line inside a 3px 22% halo. `geo` is the 30px position/size well with an axis letter and % suffix in text.5. Focusing a slider row's field opens the range popup below it.",
    css: ["cr-field", "cr-range-pop", "cr-range"], src: ["sb.field", "sb.slider"],
    anatomy: [["Value", "54x24, padding 0 9, radius md, right aligned, 11px, bg surface.inset", "size.field-value-w, size.control, space.2-25"], ["Wide", "112x24 (hex)", "size.field-wide-w"], ["Geo", "30px tall, padding 0 8, gap 4, affix 10px text.5, axis letter 600", "size.row"], ["States", "hover ring line.strong; focus field-focus; disabled .4", "shadow.field-well, shadow.field-well-hover, shadow.field-focus"], ["Range popup", "250px, padding 12 10 8, bg bg.panel, radius md; track 4px state.active; thumb 15px white", "size.popup-range-w, shadow.popover-range, size.range-thumb"]],
    groups: [
      ...["default", "hover", "focus-visible", "disabled"].map((n) => G("value · " + n, `<div style="display:flex;justify-content:flex-end">${valueField(n === "disabled" ? "0%" : "42%", "is-value", { hover: "is-hover", "focus-visible": "is-focus", disabled: "is-disabled" }[n] ?? "")}</div>`)),
      G("wide (hex)", `<div style="display:flex;justify-content:flex-end">${valueField("#3D7BFF", "is-wide")}</div>`),
      G("geo (position and size)", `<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px">${geo("X", 50)}${geo("Y", 50)}${geo("W", 100)}${geo("H", 100)}</div>`),
      G("slider row + range popup (open)", `${row("opacity", "Opacity", { tag: "div", trailing: valueField("70%", "is-value", "is-focus") })}<div class="cr-range-pop" style="margin-top:4px;margin-left:auto;width:250px"><input class="cr-range" type="range" value="70" aria-label="Opacity"></div>`),
      G("range thumb focus-visible", `<div class="cr-range-pop"><input class="cr-range is-focus" type="range" value="30" aria-label="focus"></div>`),
    ],
  }));

  // ── 9. dropdown
  const panelList = ["None", "Blur", "Glow", "Noise"].map((t, i) => `<button class="cr-btn0 cr-panel-item ${i === 1 ? "is-selected" : ""} ${i === 2 ? "is-hover" : ""}" role="radio" aria-checked="${i === 1}">${t}</button>`).join("");
  const SH = ["none", "0 2px 4px rgba(0,0,0,.35)", "0 6px 12px rgba(0,0,0,.35)", "0 10px 22px rgba(0,0,0,.4)", "0 0 0 3px rgba(0,0,0,.25)", "0 14px 30px rgba(0,0,0,.5)"];
  const panelGrid = ["None", "Soft", "Medium", "Hard", "Outline", "Deep"].map((t, i) => `<button class="cr-btn0 cr-panel-item is-chip ${i === 2 ? "is-selected" : ""}" role="radio" aria-checked="${i === 2}"><span class="cr-chip"><i style="box-shadow:${i === 0 ? "inset 0 0 0 1px rgba(0,0,0,.14)" : SH[i]}"></i></span>${t}</button>`).join("");
  P.push(pattern({
    id: "sb-dropdown", title: "Dropdown pill and panels (list, grid, chip)", org: ["differs", "Org dropdown.css is a 32px bordered select with a menu; Creator's is a raised translucent pill inside a 30px row."],
    note: "The whole row is the trigger; the pill is its value. The panel opens below and right-aligned to the pill (see Popup placement). `list` is a vertical radio menu whose hover is the accent fill; `grid` is three 56px columns of preview chips with labels (Drop shadow), the selected chip drawn with a 2px accent ring. `compact` lets two pills share a Grid row (Font + Size).",
    css: ["cr-field", "cr-popup", "cr-panel-item", "cr-chip", "cr-popup-list", "cr-popup-grid"], src: ["sb.dropdown", "sb.popup"],
    anatomy: [["Pill", "24px, padding 0 10, gap 6, fill rgba(255,255,255,.12) in both themes, 13px, 9px chevron text.4", "color.pill-fill, shadow.pill, size.icon-chevron"], ["Row", "select variant (30px)", ""], ["Panel", "bg bg.panel, radius md, shadow popover; list padding 4, grid padding 10", "shadow.popover"], ["List item", "30px, padding 0 8, 13px; hover accent.solid on accent.contrast; checked text.1/500", "color.accent.solid, color.accent.contrast"], ["Grid chip", "56x40 chip on #E6E6EC, 26x18 card, label 10px text.4; selected 2px accent ring", "color.chip-ground, size.popup-grid-col"]],
    groups: [G("row with pill (closed / open)", row("effects", "Effects", { cls: "is-select", trailing: pill("Blur") }) + row("effects", "Effects", { cls: "is-select", open: true, trailing: pill("Blur").replace("chevronDown", "chevronUp") })), G("compact pills (Font + Size)", `<div style="display:grid;grid-template-columns:2fr 1fr;gap:6px">${pill("SF Pro", "is-fill is-compact")}${pill("13", "is-fill is-compact")}</div>`), G("list panel", `<div class="cr-popup is-list"><div class="cr-popup-list" role="radiogroup" style="width:150px">${panelList}</div></div>`), G("grid panel with chips", `<div class="cr-popup is-grid"><div class="cr-popup-grid" role="radiogroup">${panelGrid}</div></div>`), G("pill focus-visible / disabled", `<div style="display:flex;gap:12px">${pill("Blur", "is-focus")}<span style="opacity:var(--cr-opacity-disabled)">${pill("Blur")}</span></div>`)],
  }));

  // ── 10. color well + swatches
  const circ = ["none", ...PALETTE.slice(0, 11)].map((c, i) => (c === "none" ? `<button class="cr-btn0 cr-swatch is-none-dot" role="radio" aria-checked="false"></button>` : sw(c, { sel: i === 4 })));
  P.push(pattern({
    id: "sb-colorwell", title: "Color well row and popover", org: ["differs", "Org color-picker.css is a full picker; Creator's well is a 20px dot that opens a 16-colour palette + hex field."],
    note: "A row whose trailing value is a 20px dot (inset white ring; the None dot is a red diagonal on a faint fill). It opens a 240px popover: a six-column circle swatch grid (None first), then a 'Custom color' row with a 112px hex field, then room for extra controls (Border width). Placement: see Popup placement.",
    css: ["cr-dot", "cr-popup", "cr-popup-label", "cr-swatches", "cr-field"], src: ["sb.colorwell", "sb.swatches"],
    anatomy: [["Dot", "20px circle, inset ring rgba(255,255,255,.24)", "size.color-dot, color.swatch-ring-dot"], ["None dot", "diagonal rgb(255,69,58) over rgba(255,255,255,.08)", "color.swatch-none-slash, color.swatch-none-fill"], ["Popover", "240px, padding 8, bg.panel, radius md", "size.popup-color-w, shadow.popover"], ["Custom row", "flex, space-between, padding 4 6, text.3 11px + wide field", "font-size.xs"]],
    groups: [G("row (colour / none)", row("border", "Border", { trailing: `<span class="cr-dot" style="background:#3D7BFF"></span>` }) + row("border", "Border", { trailing: `<span class="cr-dot is-none"></span>` })), G("popover", `<div class="cr-popup is-color"><div class="cr-swatches is-circle" role="radiogroup" style="--cols:6">${circ.join("")}</div><label class="cr-popup-label">Custom color${valueField("#3D7BFF", "is-wide")}</label></div>`)],
  }));

  P.push(pattern({
    id: "sb-swatches", title: "Swatch grids and background grid (None cell)", org: ["creator-only", "No swatch grids in the org system (org swatches.css is a colour picker strip)."],
    note: "Every 'pick one visual' grid: tint dots (`circle`, 24px, 7 columns), background and virtual-background tiles (`tile`, 16:10, radius sm, 4 columns in the slide's Background grid; the prototype's 5 x 3 was replaced 4 x 3 by an approved deviation), and captioned square tiles for the blur chooser. The None tile is a dashed frame with one hairline diagonal; the selected tile has a 2px accent ring (dots: 2.5px outside a white inner hairline). Hover on a dot scales it 1.14 on the spring curve.",
    css: ["cr-swatches", "cr-swatch", "cr-none-tile", "cr-bggrid"], src: ["sb.swatches", "sb.bggrid"],
    anatomy: [["Dot", "24px, 50%, ring inset .24 white", "size.tint-dot"], ["Tile", "16:10, radius sm (5), 1px ring rgba(255,255,255,.16)", "radius.sm, color.swatch-ring-tile"], ["Grid", "gap 4 (tile) / 7 (dot) / 6 (square); padding 2 6 / 2 4", "space.1, space.1-75, space.1-5"], ["Selected", "2px accent ring", "shadow.swatch-selected-tile, shadow.swatch-selected-dot"], ["None", "dashed 1px + diagonal, color dash", "color.dash"], ["Caption", "10px, text.4; selected text.1/500, tracking .55px", ""]],
    groups: [G("tint dots", `<div class="cr-swatches is-circle" style="--cols:7" role="radiogroup">${PALETTE.slice(0, 7).map((c, i) => sw(c, { sel: i === 3, cls: i === 1 ? "is-hover" : "" })).join("")}</div>`), G("background grid (4 x 3, None first, one selected)", `<div class="cr-bggrid"><div class="cr-swatches" style="--cols:4" role="radiogroup">${sw("", { none: 1 })}${["#3cb0a4,#3b6bf0", "#e0453a,#f0a23c", "#222,#555", "#f6d365,#fda085", "#a1c4fd,#c2e9fb", "#84fab0,#8fd3f4", "#fbc2eb,#a6c1ee", "#ffecd2,#fcb69f", "#667eea,#764ba2", "#43e97b,#38f9d7", "#fa709a,#fee140"].map((g, i) => sw(`linear-gradient(135deg,${g})`, { sel: i === 1 })).join("")}</div></div>`), G("None tile · states", `<div class="cr-swatches" style="--cols:4" role="radiogroup">${sw("", { none: 1 })}${sw("", { none: 1, sel: 1 })}${sw("", { none: 1, cls: "is-focus" })}</div>`), G("captioned squares (blur chooser)", `<div class="cr-swatches is-square" style="--cols:3" role="radiogroup">${sw("linear-gradient(135deg,#3cb0a4,#3b6bf0)", { cap: "Light" })}${sw("linear-gradient(135deg,#3cb0a4,#3b6bf0)", { cap: "Medium", sel: 1 })}${sw("linear-gradient(135deg,#3cb0a4,#3b6bf0)", { cap: "Heavy" })}</div>`)],
  }));

  // ── 11. thumbnails and rows
  P.push(pattern({
    id: "sb-thumbrow", title: "Thumbnails and list rows (layer, layout, logo, checker)", org: ["creator-only", "Org thumbnail.css is a media tile; Creator's is a 36px list row with a 48x28 thumb slot."],
    note: "One 36px row: optional grip lane, a 48x28 thumbnail (radius xs, clipped, 0.5px inset hairline), the text, trailing controls. The layer list, layout row and logo bug are all this. Selected fills the row with the accent (thumb slot becomes a white 18% well). A hidden layer's thumbnail fades to .45; a locked layer's grip to .3; the eye and lock are revealed on hover/focus or when on. Drag shows a 2px accent insertion line on the row's top or bottom edge. The logo row's thumb is a TransparencyChecker (#FFF / #D4D4DA, 8px period).",
    css: ["cr-thumbrow", "cr-thumb", "cr-grip", "cr-switch", "cr-checker", "cr-logo-name"], src: ["sb.thumbrow"],
    anatomy: [["Row", "min-height 36, padding 4 6, gap 12, radius md, 13/17", "size.thumb-row, space.3"], ["Grip", "6px lane, ⣿ 10px text.6 tracking -1px", "color.text.6"], ["Thumb", "48x28, radius xs, bg wire.void, ring line.strong", "size.thumb-w, size.thumb-h, color.wire-void, shadow.thumb-ring"], ["Selected", "accent.solid on accent.contrast", "color.accent.solid"], ["Reveal", "eye/lock inline toggles: opacity 0 until hover/focus-within/pressed", ""], ["Switch", "30x18 track in a 34x26 hit box, 14px white knob, on = accent.solid, knob +12px", "size.switch-w, size.switch-h, size.switch-knob"]],
    groups: [
      G("layer row · default", thumbRow({ name: "Presenter", trailing: layerToggles(false, false) })), G("hover (toggles revealed)", thumbRow({ name: "Title text", cls: "is-hover", trailing: layerToggles(false, false) })), G("selected", thumbRow({ name: "Image 1", sel: 1, trailing: layerToggles(false, false) })), G("hidden + locked", thumbRow({ name: "Logo", hidden: 1, locked: 1, trailing: layerToggles(true, true) })), G("drop before / after", thumbRow({ name: "Above", drop: "before", trailing: "" }) + thumbRow({ name: "Below", drop: "after", trailing: "" })), G("focus-visible", thumbRow({ name: "Focused", cls: "is-focus", trailing: "" })),
      G("layout row", thumbRow({ name: "Side by side", grip: false, trailing: si("chevronForward") })),
      G("logo row (off / on)", ["off", "on"].map((s) => thumbRow({ name: "", grip: false, thumb: `<span class="cr-thumb-art cr-checker"><span style="width:14px;height:14px;border-radius:50%;background:#3D7BFF"></span></span>`, trailing: "" }).replace('<span class="cr-thumb-text"></span>', `<span class="cr-thumb-text"><span class="cr-logo-text"><span class="cr-logo-name">Airtime bug</span><span class="cr-logo-value">Bottom right</span></span></span>${iconToggle("more", "More", { cls: "is-back" })}${sw34(s === "on")}`)).join("")),
      G("switch · off / on / focus", `<div style="display:flex;gap:10px">${sw34(false)}${sw34(true)}${sw34(true, "is-focus")}</div>`),
      G("transparency checker", `<div style="display:flex;gap:10px"><span class="cr-thumb"><span class="cr-thumb-art cr-checker"></span></span></div>`),
    ],
  }));

  // ── 12. icons
  const SZ = { chevronBack: "20 (back) ", chevronUp: "9 (pill)", chevronDown: "9 (pill)", chevronForward: "20 (row trailing)", eye: "16 header / 14 inline", noEye: "16 / 14", lock: "16 / 14", lockOpen: "16 / 14", more: "20 (back size)", sidebarToggle: "20 (top bar)", crop: "18 (action)", duplicate: "18 (action)", trash: "18 (action)", expand: "18 (action)", copy: "18 (action)", paste: "18 (action)", media: "18 (action)", cam: "18 (action)", maskRectangle: "22 (shape)", maskSquare: "22 (shape)", maskCircle: "22 (shape)", maskHexagon: "22 (shape)", textAlignLeft: "20 tool / 16 fill", textAlignCenter: "20 tool / 16 fill", textAlignRight: "20 tool / 16 fill", textList: "20 tool" };
  const names = [...Object.keys(SIDE_), ];
  const cell = (n) => `<div class="iconcell"><div class="box"><span data-theme="light" style="background:var(--cr-color-bg);color:var(--cr-color-text-2);padding:6px;border-radius:6px;display:inline-flex">${si(n)}</span><span data-theme="dark" style="background:var(--cr-color-bg);color:var(--cr-color-text-2);padding:6px;border-radius:6px;display:inline-flex">${si(n)}</span></div><b>${n}</b><span class="muted">${MASKS_[n] ? "mmhmm-icons " + MASKS_[n] : "AppIcons." + SIDE_[n]}</span><span class="muted">${SZ[n] ?? "20 (row default)"}</span></div>`;
  P.push(`<article class="pattern" id="sb-icons"><header><h3>Icons in use</h3>${auditBadges("sb-icons")}</header><p class="note muted" style="font-size:11px">Manual comparison with the org system: org icons are 748 Figma-exported SVG files (icons/*.svg); Creator draws AppIcons from teleport/icons.js as inline SVG.</p>
  <p class="note">Nothing is drawn for the sidebar. Each glyph is an <code>AppIcons</code> entry rendered verbatim from <code>teleport/icons.js</code> (a byte-identical copy in assets/icons.js), or a <code>mmhmm-icons</code> component where AppIcons has no equivalent (the four mask shapes). Colour rule (LegacyIcon.tsx): the svg is painted with <code>fill: currentColor</code>, so a glyph takes the text colour of its control (text.2 in rows, text.3 in toggles at rest, text.1 on hover or selected, accent.contrast in a selected list row, text.4 for chevrons). Default box is 20px (size.icon-row); other boxes: 18px action, 16px header toggle, 14px inline toggle, 22px shape, 9px pill chevron.</p>
  <div class="sub"><h4>Size and colour rules</h4><table class="spec"><tr><th>Context</th><th>Box</th><th>Colour</th></tr><tr><td>Row icon</td><td>20px</td><td>text.2 (row), hover follows row</td></tr><tr><td>Action button</td><td>18px</td><td>text.2, destructive hover danger.fg</td></tr><tr><td>Header toggle</td><td>16px in a 26px box</td><td>text.3, hover/pressed text.1</td></tr><tr><td>Back</td><td>20px in a 26px box</td><td>text.3</td></tr><tr><td>Inline toggle (layer)</td><td>14px in 22px</td><td>text.3, pressed text.2</td></tr><tr><td>Shape segment</td><td>22px over 10px label</td><td>text.3, selected text.1</td></tr><tr><td>Tool</td><td>20px (fill rows 16px)</td><td>text.3 (fill text.4), selected text.1</td></tr><tr><td>Pill chevron</td><td>9px</td><td>text.4</td></tr><tr><td>Selected list row</td><td>as above</td><td>accent.contrast</td></tr></table></div>
  <div class="stage-pair one"><div class="stage" data-theme="light"><div class="tag">each cell: light | dark</div>${Object.keys(SIDE_).concat(Object.keys(MASKS_)).map(cell).join("")}</div></div>
  ${auditBlock("sb-icons")}<footer><h4 style="margin-top:0">Source</h4>${srcList(["sb.icons"])}</footer></article>`);

  // ── 13. popup placement
  const mini = (cls, label, place) => `<div style="position:relative;height:150px;border-radius:12px;background:var(--cr-color-mat-hud);box-shadow:var(--cr-shadow-sidebar-card);margin-bottom:8px;overflow:hidden"><div style="position:absolute;inset:0;padding:0 16px">${place}</div><div style="position:absolute;left:8px;bottom:6px;font-size:10px;color:var(--cr-color-text-4)">${label}</div></div>`;
  const anchor = (top) => `<div style="position:absolute;left:16px;right:16px;top:${top}px;height:30px;border-radius:7px;background:var(--cr-color-state-active);display:flex;align-items:center;justify-content:space-between;padding:0 6px;color:var(--cr-color-text-2)"><span>Row</span><span class="cr-field is-pill" style="height:24px">Value${si("chevronDown")}</span></div>`;
  const pop = (top, h = 56) => `<div class="cr-popup" style="position:absolute;right:16px;top:${top}px;width:150px;height:${h}px"></div>`;
  P.push(pattern({
    id: "sb-popup", title: "Popup placement rules", org: ["creator-only", "Org menus/overlays have no anchored-to-control rule."],
    note: "Every sidebar sub-menu (range popups, dropdown panels, color-well popovers, the Border popover) uses one rule and nothing per control: <b>bottom-end</b> (below the row, right-aligned to the trigger CONTROL, never left-aligned to the row cell); <b>flip</b> above the row when the space below inside the sidebar card is too small, so it never covers the row that opened it; <b>slide + boundary</b> measured against the sidebar card with 16px overflow padding so a popup never leaves the column; <b>gutter 4px</b> between the ROW's edge and the popup (anchor = the row's top and bottom with the control's left and right). Popups are portaled out of the card into the chrome portal layer.",
    css: ["cr-popup"], src: ["sb.popup"], raw: true,
    anatomy: [["placement", "bottom-end", ""], ["gutter", "4px from the row edge", "size.popup-gutter"], ["overflowPadding", "16px inside the card", "size.popup-edge"], ["flip / slide", "true / true, boundary = [data-chrome=sidebar]", ""], ["anchor", "row's vertical extent x control's horizontal extent", ""]],
    groups: [G("below, right-aligned to the pill (default)", mini("", "bottom-end", anchor(20) + pop(54))), G("flips above when space below is short", mini("", "flip", anchor(96) + pop(36, 54)))],
  }));

  // ── 14. placeholder + disabled
  P.push(pattern({
    id: "sb-placeholder", title: "Placeholder and disabled treatment", org: ["differs", "Org uses a 0.5 disabled opacity token (opacity-50); Creator uses a literal 0.4 everywhere."],
    note: "Disabled dims the whole control once at 0.4 with no hover fill. An unwired control (no backing model yet) is a Placeholder: the wrapper (not the child) takes 0.4 opacity and the tooltip hover; the inner box is inert and a grid so the child stretches. A disabled slider row dims the row once and its field stays at full strength inside it.",
    css: ["cr-placeholder"], src: ["sb.placeholder"],
    anatomy: [["Opacity", "0.4 (literal in every recipe; token proposed: opacity.disabled)", "opacity.disabled"], ["Interaction", "inert, pointer-events none, cursor default", ""], ["Tooltip", "'Not available yet' via StageControlTooltip", ""]],
    groups: [G("disabled row", row("border", "Border", { cls: "is-disabled" })), G("placeholder action pair", `<div class="cr-placeholder"><div>${a2()}</div></div>`), G("placeholder more button", `<div class="cr-placeholder" style="display:inline-block"><div>${iconToggle("more", "Logo options", { cls: "is-back" })}</div></div>`), G("disabled slider row", `<div style="opacity:var(--cr-opacity-disabled)">${row("opacity", "Opacity", { tag: "div", trailing: valueField("0%") })}</div>`)],
  }));

  // ── 15. states summary
  P.push(pattern({
    id: "sb-states", title: "Focus and hover summary", org: ["creator-only", "Org has no shared focus ring."],
    note: "Every interactive sidebar control shows focus with box-shadow (never outline): <code>shadow.focus</code> for rows, buttons, segments, swatches, toggles and links; <code>field-focus</code> (softer) for value wells; a 3px solid accent ring on range thumbs. Hover always uses state.hover (rows, actions, toggles), a text colour lift (segments, tools), the accent fill (list panel items) or a 1.14 scale (tint dots). Open (aria-expanded) holds state.active.",
    css: ["cr-row", "cr-action", "cr-seg-item", "cr-icontoggle", "cr-swatch", "cr-field"], src: ["sb.row"], 
    anatomy: [["Row / toggle / action hover", "state.hover -> state.active on press (actions: state.active-strong)", ""], ["Segment hover", "text.2 -> text.1 (no fill)", ""], ["Panel item hover", "accent.solid fill, accent.contrast text", ""], ["Dot hover", "scale(1.14) 160ms spring", "easing.spring"], ["Focus", "shadow.focus / field-focus / range 3px", "shadow.focus, shadow.field-focus"]],
    groups: [G("row", row("border", "Border", { cls: "is-focus" }) + row("border", "Border", { cls: "is-hover" })), G("action", actions(2, [action("copy", "Copy", { cls: "is-focus" }), action("paste", "Paste", { cls: "is-hover" })])), G("segments", seg("segmented", SEGO, { on: 0 }).replace('cr-seg-item ', 'cr-seg-item is-focus ')), G("toggle + swatch", `<div style="display:flex;gap:14px;align-items:center">${iconToggle("eye", "Hide", { cls: "is-focus" })}<div class="cr-swatches is-circle" style="--cols:2;padding:0">${sw("#3D7BFF", { cls: "is-focus" })}${sw("#FF4B3E", { cls: "is-hover" })}</div></div>`)],
  }));

  root.innerHTML = `<section id="sidebar"><h2>Sidebar</h2><p class="lede">The right-hand inspector, built first and completely. Every pattern is live CSS from css/sidebar.css using only --cr tokens, shown in light and dark, with its anatomy, states, exact source and the tokens it uses (scanned from the CSS). The sidebar is a Chakra recipe set (sidebarRow, sidebarField, sidebarSegment, sidebarSection) plus primitives; several values are literals in those recipes: those are the <em>derived</em> tokens.</p>${P.join("")}</section>`;
}
