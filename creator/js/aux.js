import { pattern, icon, glyph, mm, si } from "./lib.js";
const G = (cap, html) => ({ cap, html });
const btn = (t, cls = "", attrs = "") => `<button type="button" class="cr-btn0 cr-button ${cls}" ${attrs}>${t}</button>`;
const mi = (ic, text, cls = "", attrs = "", trail = "") => `<button type="button" class="cr-btn0 cr-menu-item ${cls}" ${attrs}>${ic ? icon(ic) : ""}<span class="txt">${text}</span>${trail}</button>`;
export function aux(root) {
  const P = [];
  const ST = [["default", ""], ["hover", "is-hover"], ["pressed", "is-pressed"], ["focus-visible", "is-focus"], ["disabled", "is-disabled"]];
  P.push(pattern({
    id: "ax-button", title: "Buttons (solid, surface, ghost, danger)", org: ["differs", "Org button.css: 32/40px teal filled/outlined; Creator: 28/32px, radius md, accent blue (danger uses system red)."], raw: true, flex: true,
    note: "Chakra Button (`sm` 28px / `md` 32px) with variant solid (accent.solid, inset light catch + 1px drop), surface (bg.panel, hairline edge), ghost (bare label, fills state.hover; open state.active). `colorPalette=danger` swaps the solid fill to system red. Press scales .97 on 160ms settle; disabled .45.",
    css: ["cr-button"], src: ["ax.button"],
    anatomy: [["Size sm / md", "h28 padding 0 12 gap 4 / h32 padding 0 14 gap 6; radius md; 13px/500", "size.7, size.8, radius.md"], ["Solid", "accent.solid on accent.contrast; hover accent.hover; shadow button-solid", "shadow.button-solid"], ["Surface", "bg.panel, text.1; hover bg.subtle; shadow button-secondary", "shadow.button-secondary"], ["Ghost", "text.2; hover state.hover + text.1", ""], ["Press", "scale .97", ""], ["Disabled", "opacity .45", "opacity.disabled-button"]],
    groups: [...["solid", "surface", "ghost"].flatMap((v) => ST.map(([n, c]) => G(`${v} · ${n}`, btn("Button", `is-${v} ${c}`, n === "disabled" ? "disabled" : "")))), ...ST.slice(0, 2).map(([n, c]) => G("danger · " + n, btn("Delete", `is-solid is-danger ${c}`))), G("md size", btn("Medium", "is-solid is-md")), G("with icon", btn(icon("Plus") + "Add", "is-surface"))],
  }));
  const menu = (inner) => `<div class="cr-menu" style="width:230px">${inner}</div>`;
  P.push(pattern({
    id: "ax-menu", title: "Menus and context menus", org: ["differs", "Org menus.css: elevated list with teal highlight; Creator: AppKit-style, near-opaque material, accent-fill highlight."], raw: true,
    note: "Chakra Menu (variant subtle): near-opaque mat.menu-solid (.98), radius 2xl (14), padding 6, min-width 190, the bevelled menu shadow. Items: padding 6 8, gap 8, 13/17, radius md; the highlighted item is the AppKit fill (accent.solid on accent.contrast), destructive turns danger.solid; disabled .45. Group labels are the 10px uppercase `label` style in text.4. The stage context menu (right-click on an object) and the document/account/help/camera menus are the same component; only the glass stage variant (see Stage) differs.",
    css: ["cr-menu", "cr-menu-item", "cr-menu-sep", "cr-menu-label"], src: ["ax.menu"],
    anatomy: [["Content", "min 190, padding 6, radius 2xl, mat.menu-solid, shadow menu", "color.mat-menu-solid, shadow.menu, radius.2xl"], ["Item", "padding 6 8, gap 8, radius md, 13/17, text.2", ""], ["Highlighted", "accent.solid / accent.contrast", "color.accent-solid, color.accent-contrast"], ["Destructive", "danger.fg; highlighted danger.solid", "color.danger-fg, color.danger-solid"], ["Separator", "1px line, margin 4 8", ""], ["Group label", "10/12/600, .055em, uppercase, text.4", "text-style label"]],
    groups: [G("menu", menu(`<div class="cr-menu-label">Presentation</div>${mi("GenericFileNav", "New presentation")}${mi("CopyTemplate", "Duplicate", "is-hover")}${mi("Checkmark", "Autosave", "", "", "")}${mi("", "Open recent", "", "", `<span class="ind">${icon("CaretRight")}</span>`)}<div class="cr-menu-sep"></div>${mi("TrashCan", "Delete", "", "data-destructive")}${mi("GearFill", "Settings", "is-disabled", "disabled")}`)), G("destructive highlighted", menu(mi("TrashCan", "Delete", "is-hover", "data-destructive"))), G("item states", menu(ST.map(([n, c]) => mi("Copy", n, c, n === "disabled" ? "disabled" : "")).join("")))],
  }));
  P.push(pattern({
    id: "ax-tooltip", title: "Tooltip", org: ["differs", "Org overlays.css tooltip is a dark inverted bubble; Creator's is a raised surface (bg.panel, hairline) the same in both themes."], raw: true, flex: true,
    note: "Chakra Tooltip, placement top, gutter 8: bg.panel, content.primary, 1px highlight.primary border, radius sm (5), padding 6 12, 12/15, tooltip shadow (0 8 16). Chakra's default inverts against the page, which under these tokens would paint a light tooltip in dark mode, so the recipe does not.",
    css: ["cr-tooltip"], src: ["ax.tooltip"],
    anatomy: [["Surface", "bg.panel, border 1px highlight.primary, radius sm", "color.bg-panel, radius.sm"], ["Padding / type", "6 12; 12/15/400; nowrap", ""], ["Shadow", "0 8 16 (.16 light / .55 dark)", "shadow.tooltip"], ["Placement", "top, gutter 8", ""]],
    groups: [G("tooltip", `<span class="cr-tooltip">Show layers</span>`), G("long", `<span class="cr-tooltip">Not available yet</span>`)],
  }));
  P.push(pattern({
    id: "ax-dialog", title: "Modals and dialogs (sm, sheet)", org: ["differs", "Org overlays.css modal: 16px radius on the org surface; Creator: mat.sheet at radius 3xl (16) with the Tahoe drop."], raw: true,
    note: "Chakra Dialog: backdrop scrim.modal (black .60 in both themes: the measured production value), content mat.sheet (.99), radius 3xl, sheet shadow. `sm` is 320-420px with 20px padding, a 13/16/600 title, text.2 body and a right-aligned footer of buttons (gap 8). `sheet` is the 800x642 (max viewport-48) pane with a 64px footer separated by a hairline on split-picker.footer (background browser, share).",
    css: ["cr-dialog", "cr-scrim"], src: ["ax.dialog"],
    anatomy: [["Backdrop", "scrim.modal", "color.scrim-modal"], ["Content", "mat.sheet, radius 3xl, shadow sheet, isolation", "color.mat-sheet, shadow.sheet, radius.3xl"], ["Header / body / footer", "20 20 8 / 0 20 / 16 20 20", "space.5"], ["Title", "heading.medium 13/16/600", "text-style heading-medium"], ["Sheet", "800x642, footer 64px + hairline", "size.sheet.width, size.sheet.height, color.split-picker-footer"]],
    groups: [G("sm dialog on scrim", `<div class="cr-scrim"><div class="cr-dialog"><div class="header"><h2 class="title">Delete this slide?</h2></div><div class="body">This removes the slide and its layers. You can undo it.</div><div class="footer">${btn("Cancel", "is-surface")}${btn("Delete", "is-solid is-danger")}</div></div></div>`), G("sheet (footer with hairline)", `<div class="cr-scrim" style="padding:20px"><div class="cr-dialog is-sheet"><div class="header"><h2 class="title">Backgrounds</h2></div><div class="body">Content</div><div class="footer">${btn("Cancel", "is-surface")}${btn("Apply", "is-solid")}</div></div></div>`)],
  }));
  P.push(pattern({
    id: "ax-notice", title: "Banner (session notice)", org: ["differs", "Org has no banner; Creator has no toast component."], raw: true,
    note: "The only transient message surface in Creator is the full-width session banner: danger.subtle background, danger.fg text at 11/14 (body.small), gap 12, padding 8 24, with an optional surface button. There is no toast component (recorded in OPEN-QUESTIONS).",
    css: ["cr-notice"], src: ["ax.notice"],
    anatomy: [["Banner", "flex centre, gap 12, padding 8 24", "color.danger-subtle, color.danger-fg"], ["Text", "body.small 11/14", "text-style body-small"], ["Action", "Button sm surface", ""]],
    groups: [G("banner", `<div class="cr-notice" role="alert"><span>You were signed out. Sign in again to reach your account.</span>${btn("Sign In", "is-surface")}</div>`)],
  }));
  root.innerHTML = `<section id="aux"><h2>Auxiliary and global</h2><p class="lede">Buttons, menus, context menus, tooltips, modals and the banner: portaled Chakra surfaces on the shared materials.</p>${P.join("")}</section>`;
}
