import { esc, si } from "./lib.js";
import { ICON_SRC } from "./icons.js";

/* Shared card renderer for atoms, patterns and areas. */
const min = (html) => (/w320|glass-bg/.test(html) ? 340 : /w220|w180|cr-menu|cr-input|cr-fieldset/.test(html) ? 200 : /w150|cr-progress|cr-range/.test(html) ? 164 : /w80/.test(html) ? 92 : 84);
export const grid = (cells, minv) => {
  const all = cells.map((c) => c[1]).join("");
  return `<div class="at-grid" style="--min:${minv ?? min(all)}px">${cells.map(([cap, html]) => `<figure class="at-cell"><div class="at-el">${html}</div><figcaption>${esc(cap)}</figcaption></figure>`).join("")}</div>`;
};
const body = (it) => (it.cells ? grid(it.cells, it.min) : `<div class="at-one ${it.full ? "is-full" : ""}">${it.html}</div>`);
const theme = (t, surface, inner) => `<div class="at-theme at-${surface} cr-ctx" data-theme="${t}"><span class="at-tag">${t}</span>${inner}</div>`;

export function cardHtml(it) {
  const inner = body(it);
  const surface = it.surface ?? (it.group === "atoms" ? "panel" : "window");
  const both = it.group === "atoms";
  const preview = both ? `<div class="at-pair">${theme("light", surface, inner)}${theme("dark", surface, inner)}</div>` : `<div class="at-pair is-single">${surface === "glass" ? `<div class="at-theme at-none cr-ctx">${inner}</div>` : `<div class="at-theme at-${surface} cr-ctx">${inner}</div>`}</div>`;
  const toks = (it.tokens ?? []).map((t) => `<code>${esc(t)}</code>`).join("");
  return `<article class="at-card" id="${it.id}"><div class="at-preview">${preview}</div><footer><h3>${esc(it.title)}</h3><p>${esc(it.use)}</p>${toks ? `<div class="at-toks">${toks}</div>` : ""}</footer></article>`;
}

export function iconGaps() {
  const rows = Object.entries(ICON_SRC).filter(([, v]) => v.match !== "exact");
  const li = rows.map(([k, v]) => `<li><span class="ico20">${si(k)}</span><div><b>${esc(v.note || k)}</b><small>${v.match === "gap" ? "No org icon fits. Shows a neutral ring." : "Closest org icon"}: ${esc(v.file)}</small></div></li>`).join("");
  return `<article class="at-card" id="icon-gaps"><div class="at-preview"><div class="at-pair is-single"><div class="at-theme at-window cr-ctx"><ul class="gap-list">${li}</ul></div></div></div><footer><h3>Icon gaps</h3><p>Controls where the org icon set has no exact match. Near matches use the closest org icon; gaps use a neutral ring until an icon is drawn.</p></footer></article>`;
}
