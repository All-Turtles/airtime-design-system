// Resolves pattern source references (file + anchor text) to line numbers -> data/sources.json (read-only on apps/).
import fs from "node:fs";
const SRC = "/Users/dairien/workspaces/mmhmm-tv-creator-sidebar/apps/airtime-creator/src/";
const R = "ui/recipes/", P = "creator/sidebar/primitives/", C = "creator/sidebar/";
const M = {
  "sb.card": [[C + "Sidebar.tsx", "export function Sidebar"], [C + "SidebarBody.tsx", "data-testid=\"sidebar-scroll\""]],
  "sb.pane": [[R + "sidebarSectionSlotRecipe.ts", "paneHeader: {"], [P + "PaneHeader.tsx", "export function PaneHeader"], [P + "IconToggle.tsx", "export function IconToggle"]],
  "sb.icontoggle": [[P + "IconToggle.tsx", "export function IconToggle"]],
  "sb.section": [[R + "sidebarSectionSlotRecipe.ts", "defineSlotRecipe"], [P + "Section.tsx", "export function Section("], [P + "Section.tsx", "export function SectionHead"], [P + "Section.tsx", "export function Rule"], [P + "Section.tsx", "export function HeadLink"]],
  "sb.row": [[R + "sidebarRowRecipe.ts", "variant: {"], [P + "Row.tsx", "export function Row("], [P + "Row.tsx", "export function RowLabel"]],
  "sb.action": [[R + "sidebarRowRecipe.ts", "action: {"], [P + "Actions.tsx", "export function ActionButtons"], [P + "Actions.tsx", "export function ActionButton"]],
  "sb.seg": [[R + "sidebarSegmentSlotRecipe.ts", "variants: {"], [P + "Segmented.tsx", "export function Segmented"]],
  "sb.field": [[R + "sidebarFieldRecipe.ts", "variants: {"], [P + "CommitInput.tsx", "export"], [P + "GeoGrid.tsx", "export function GeoGrid"]],
  "sb.slider": [[P + "SliderRow.tsx", "export function SliderRow"], [P + "popupPlacement.ts", "sidebarPopupPositioning"]],
  "sb.dropdown": [[P + "Dropdown.tsx", "export function DropdownRow"], [R + "sidebarFieldRecipe.ts", "pill: {"]],
  "sb.colorwell": [[P + "ColorWellRow.tsx", "export function ColorWellRow"], [P + "Swatches.tsx", "export function Swatches"]],
  "sb.swatches": [[P + "Swatches.tsx", "export function Swatches"], [P + "Swatches.tsx", "export function NoneMark"], [P + "Swatches.tsx", "export const noneDot"]],
  "sb.bggrid": [[P + "BackgroundGrid.tsx", "export function BackgroundGrid"], [P + "Swatches.tsx", "export function NoneMark"]],
  "sb.thumbrow": [[P + "ThumbRow.tsx", "export function ThumbRow"], [P + "ThumbRow.tsx", "export function LayerRow"], [P + "ThumbRow.tsx", "export function LayoutRow"], [P + "ThumbRow.tsx", "export function LogoRow"], [P + "ThumbFrame.tsx", "export function ThumbFrame"], [P + "TransparencyChecker.tsx", "export function TransparencyChecker"]],
  "sb.icons": [[C + "icons.tsx", "const sources"], ["creator/LegacyIcon.tsx", "export function LegacyIcon"], ["../teleport/icons.js", "var AppIcons"]],
  "sb.placeholder": [[P + "Placeholder.tsx", "export function Placeholder"]],
  "sb.popup": [[P + "popupPlacement.ts", "export const sidebarPopupPositioning"], [P + "popupPlacement.ts", "export function popupAnchor"]],
  "hd.topbar": [["creator/TopBar.tsx", "export"], ["creator/PresentationTitle.tsx", "export function PresentationTitle"], ["ui/recipes/presentationTitleSlotRecipe.ts", "trigger: {"], ["ui/recipes/buttonRecipe.ts", "plain: {"]],
  "hd.mode": [["creator/ModeSwitch.tsx", "export function ModeSwitch"], ["ui/recipes/segmentGroupSlotRecipe.ts", "root: {"]],
  "hd.iconbtn": [["ui/recipes/buttonRecipe.ts", "xs: {"], ["ui/recipes/buttonRecipe.ts", "plain: {"], ["creator/UndoRedo.tsx", "export function UndoRedo"], ["creator/sidebar/SidebarToggle.tsx", "export function SidebarToggle"], ["ui/recipes/avatarRecipe.ts", "defineRecipe"]],
  "hd.record": [["ui/recipes/buttonRecipe.ts", "record: {"], ["creator/RecordingControls.tsx", "export function RecordingControls"], ["creator/RecordingStatus.tsx", "export"]],
  "hd.insert": [["creator/InsertBar.tsx", "export function InsertBar"], ["ui/recipes/buttonRecipe.ts", "insert: {"], ["ui/recipes/pillSlotRecipe.ts", "hud: {"]],
  "hd.split": [["creator/DeviceSplit.tsx", "export"], ["ui/recipes/splitButtonSlotRecipe.ts", "defineSlotRecipe"]],
  "hd.status": [["ui/recipes/statusChipSlotRecipe.ts", "defineSlotRecipe"], ["creator/RecordingStatus.tsx", "export"]],
  "tr.tray": [["creator/TrayArea.tsx", "export"], ["creator/TrayConsole.tsx", "export"], ["ui/recipes/buttonRecipe.ts", "tray: {"], ["ui/recipes/buttonRecipe.ts", "addSlide: {"]],
  "tr.tile": [["ui/recipes/slideTileSlotRecipe.ts", "defineSlotRecipe"], ["creator/SlideThumbnail.tsx", "export"]],
  "st.pill": [["creator/PresenterSelectionControls.tsx", "export"], ["ui/recipes/pillSlotRecipe.ts", "glass: {"], ["ui/recipes/buttonRecipe.ts", "stage: {"]],
  "st.popover": [["creator/StageControlPopover.tsx", "export function StageControlPopover"], ["ui/recipes/menuSlotRecipe.ts", "stage: {"], ["ui/recipes/buttonRecipe.ts", "stageOption: {"], ["ui/recipes/buttonRecipe.ts", "stageRow: {"], ["creator/StageSliderField.tsx", "export function StageSliderField"]],
  "st.overlay": [["../teleport/stage/objects/overlay.css", "div.slide_overlay div.handles div.handle {"], ["../teleport/stage/objects/overlay.css", "div.slide_overlay div.frame {"], ["../teleport/stage/objects/alignment_grid.js", "_isAnchorLine"], ["../teleport/stage/objects/overlay.css", "div.button_bar {"]],
  "ax.menu": [["ui/recipes/menuSlotRecipe.ts", "defineSlotRecipe"], ["creator/ContextMenu.tsx", "export function ContextMenu"], ["creator/menuItems.ts", "export"]],
  "ax.tooltip": [["ui/recipes/tooltipSlotRecipe.ts", "defineSlotRecipe"], ["creator/StageControlTooltip.tsx", "export function StageControlTooltip"]],
  "ax.dialog": [["ui/recipes/dialogSlotRecipe.ts", "defineSlotRecipe"], ["creator/ShareVideoDialog.tsx", "export"]],
  "ax.button": [["ui/recipes/buttonRecipe.ts", "variant: {"]],
  "ax.notice": [["creator/SessionNotice.tsx", "function Notice"]],
};
const OLD = fs.existsSync(new URL("../data/sources.json", import.meta.url)) ? JSON.parse(fs.readFileSync(new URL("../data/sources.json", import.meta.url), "utf8")) : {};
const out = {};
for (const [k, list] of Object.entries(M)) out[k] = list.map(([file, find]) => { const p = SRC + file; const lines = fs.existsSync(p) ? fs.readFileSync(p, "utf8").split("\n") : []; const line = lines.findIndex((l) => l.includes(find)) + 1; if (!line) console.warn("not found", k, file, find); const prev = OLD[k]?.find((o) => o.file === (file.startsWith("../") ? "../" + file.slice(3) : file) && o.note === (find.length < 44 ? find : ""))?.line ?? null; return { file: file.startsWith("../") ? "../" + file.slice(3) : file, line: line || prev, note: find.length < 44 ? find : "" }; });
fs.writeFileSync(new URL("../data/sources.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(Object.keys(out).length, "source groups");
