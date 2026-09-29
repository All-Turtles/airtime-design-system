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
};
const out = {};
for (const [k, list] of Object.entries(M)) out[k] = list.map(([file, find]) => { const p = SRC + file; const lines = fs.readFileSync(p, "utf8").split("\n"); const line = lines.findIndex((l) => l.includes(find)) + 1; if (!line) console.warn("not found", k, file, find); return { file: file.startsWith("../") ? "../" + file.slice(3) : file, line: line || null, note: find.length < 44 ? find : "" }; });
fs.writeFileSync(new URL("../data/sources.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(Object.keys(out).length, "source groups");
