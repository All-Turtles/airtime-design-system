import { si } from "./lib.js";

/* Markup builders shared by the atoms, patterns and areas. Every state is reachable through a forcing class. */
export const FORCE = { default: "", hover: "is-hover", pressed: "is-pressed", focus: "is-focus", selected: "is-selected", disabled: "is-disabled", error: "is-error", open: "is-open" };
export const dis = (state) => (state === "disabled" ? "disabled" : "");

export const iconToggle = (ic, label, { cls = "", pressed, dis: d } = {}) => `<button type="button" class="cr-btn0 cr-icontoggle ${cls}" aria-label="${label}" title="${label}" ${pressed != null ? `aria-pressed="${pressed}"` : ""} ${d ? "disabled" : ""}>${si(ic)}</button>`;
const rowLabel = (ic, text, menuItem) => `<span class="cr-row-label ${menuItem ? "is-menuitem" : ""}">${ic ? (menuItem ? `<span class="cr-slot15">${si(ic)}</span>` : si(ic)) : ""}<span>${text}</span></span>`;
export const row = (ic, text, { cls = "", trailing = "", menuItem, tag = "button", open } = {}) => tag === "div" ? `<div class="cr-row is-static ${cls}">${rowLabel(ic, text, menuItem)}${trailing}</div>` : `<button type="button" class="cr-btn0 cr-row ${cls}" ${open ? 'aria-expanded="true"' : ""}>${rowLabel(ic, text, menuItem)}${trailing}</button>`;
export const action = (ic, text, { cls = "", destructive, dis: d } = {}) => `<button type="button" class="cr-btn0 cr-action ${cls}" ${destructive ? "data-destructive" : ""} ${d ? "disabled" : ""}>${ic ? si(ic) : ""}${text}</button>`;
export const actions = (n, items, cls = "") => `<div class="cr-actions is-${n} ${cls}">${items.join("")}</div>`;
const segItem = (o, kind, on) => `<button type="button" class="cr-btn0 cr-seg-item ${o.cls ?? ""}" ${kind === "radio" ? `role="radio" aria-checked="${!!on}"` : kind === "toggle" ? `aria-pressed="${!!on}"` : ""} ${o.dis ? "disabled" : ""} ${o.label && o.icon && !o.text ? `aria-label="${o.label}" title="${o.label}"` : ""}>${o.icon ? si(o.icon) : ""}${o.text ?? ""}</button>`;
export const seg = (variant, opts, { mode = "radio", on = 0, fill, look } = {}) => `<div class="cr-seg is-${variant} ${fill ? "is-fill" : ""} ${look ? "is-" + look : ""}" role="${mode === "radio" ? "radiogroup" : "group"}" aria-label="demo">${opts.map((o, i) => (o.sep ? `<span class="cr-seg-sep" role="separator"></span>` : "") + segItem(o, o.mode ?? mode, Array.isArray(on) ? on.includes(i) : on === i)).join("")}</div>`;
export const valueField = (v, cls = "is-value", extra = "", d = "") => `<label class="cr-field ${cls} ${extra}"><input value="${v}" aria-label="value" ${d}></label>`;
export const geo = (axis, v, extra = "", d = "") => `<label class="cr-field is-geo ${extra}"><span data-affix>${axis}</span><input value="${v}" aria-label="${axis}" ${d}><span data-affix>%</span></label>`;
export const pill = (text, extra = "") => `<span class="cr-field is-pill ${extra}">${text}${si("chevronDown")}</span>`;
export const sw = (bg, { sel, cls = "", none, cap } = {}) => {
  const face = none ? '<span class="cr-none-tile"></span>' : `<span style="display:block;width:100%;height:100%;background:${bg}"></span>`;
  return `<button type="button" class="cr-btn0 cr-swatch ${cls} ${sel ? "is-selected" : ""}" role="radio" aria-checked="${!!sel}" aria-label="${none ? "None" : bg}">${cap ? `<span data-swatch>${face}</span><span data-caption>${cap}</span>` : face}</button>`;
};
export const PALETTE = ["#FFFFFF", "#8E9294", "#0B0F11", "#FF4B3E", "#FF8A3D", "#FFD23F", "#A6E22E", "#3FCF6A", "#2BC7B0", "#56C7F0", "#5C7CFA", "#3D7BFF", "#9B5CF6", "#F056B6", "#FF7AB8", "#8A5A3B"];
export const art = (a = "#3cb0a4", b = "#3b6bf0") => `<span class="cr-thumb-art" style="background:linear-gradient(135deg,${a},${b})"></span>`;
export const thumbRow = ({ name, sel, hidden, locked, cls = "", grip = true, thumb = art(), trailing, drop, dragging }) => `<div class="cr-thumbrow ${sel ? "is-selected" : ""} ${cls} ${drop ? "is-drop-" + drop : ""} ${dragging ? "is-dragging" : ""}" role="button" tabindex="0">${grip ? `<span class="cr-grip ${locked ? "is-locked" : ""}"><span>⣿</span></span>` : `<span class="cr-grip"></span>`}<span class="cr-thumb ${hidden ? "is-dimmed" : ""}">${thumb}</span><span class="cr-thumb-text">${name}</span>${trailing ?? ""}</div>`;
export const layerToggles = (hidden, locked) =>
  iconToggle(hidden ? "noEye" : "eye", hidden ? "Show layer" : "Hide layer", { cls: "is-inline", pressed: hidden }).replace("<button", "<button data-reveal") +
  iconToggle(locked ? "lock" : "lockOpen", locked ? "Unlock layer" : "Lock layer", { cls: "is-inline", pressed: locked }).replace("<button", "<button data-reveal");
export const sw34 = (on, cls = "", d = "") => `<button type="button" class="cr-btn0 cr-switch ${cls}" role="switch" aria-checked="${on}" aria-label="Toggle" ${d}><span><span></span></span></button>`;
export const head = (title, { icon: ic, hint, link, tall } = {}) => `<div class="cr-section-head ${tall ? "is-tall" : ""} ${hint ? "has-hint" : ""} ${link ? "has-link" : ""}">${ic ? si(ic) : ""}<span class="cr-head-title">${title}</span>${hint ? `<span class="cr-head-hint">${hint}</span>` : ""}${link ? `<button type="button" class="cr-btn0 cr-headlink"><span>${link}</span></button>` : ""}</div>`;
export const paneHead = (title, { back, actions: a = "" } = {}) => `<div class="cr-pane-head ${back ? "has-back" : ""}">${back ? iconToggle("chevronBack", "Back", { cls: "is-back" }) : ""}<h3 class="cr-pane-title">${title}</h3><div class="cr-pane-actions">${a}</div></div>`;

/* atoms */
export const button = (variant, text, cls = "", attrs = "") => `<button type="button" class="cr-btn0 cr-button is-${variant} ${cls}" ${attrs}>${text}</button>`;
export const iconBtn = (ic, label, cls = "", attrs = "") => `<button type="button" class="cr-btn0 cr-iconbtn ${cls}" aria-label="${label}" ${attrs}>${si(ic)}</button>`;
export const textInput = (v, { ph = "", cls = "", d = "" } = {}) => `<label class="cr-input ${cls}"><input value="${v}" placeholder="${ph}" aria-label="${ph || "Text"}" ${d}></label>`;
export const check = (state, checked, d) => `<button type="button" class="cr-btn0 cr-check ${state ?? ""}" role="checkbox" aria-checked="${checked}" aria-label="Option" ${d ?? ""}>${si("check")}</button>`;
export const radio = (state, on, d) => `<button type="button" class="cr-btn0 cr-radio ${state ?? ""}" role="radio" aria-checked="${!!on}" aria-label="Option" ${d ?? ""}></button>`;
export const tag = (text, cls = "", attrs = "", x) => `<button type="button" class="cr-btn0 cr-tag ${cls}" ${attrs}>${text}${x ? si("xmark") : ""}</button>`;
export const menuItem = (ic, text, cls = "", attrs = "", trail = "", detail = "") => `<button type="button" class="cr-btn0 cr-menu-item ${cls}" ${attrs}>${ic ? si(ic) : ""}<span class="txt">${text}${detail ? `<span class="det">${detail}</span>` : ""}</span>${trail}</button>`;
/* the one check slot: trailing the row, the accent at rest and white when the row is highlighted */
export const menuCheck = () => `<span class="chk">${si("check")}</span>`;
export const menu = (inner, { cls = "", w } = {}) => `<div class="cr-menu ${cls}" ${w ? `style="width:${w}px"` : ""}>${inner}</div>`;
/* Note: an info glyph and quiet text, no fill. Used in the sign-in dialog. */
export const note = (text) => `<div class="cr-note" role="note">${si("info")}<span>${text}</span></div>`;
