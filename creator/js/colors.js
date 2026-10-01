import { esc } from "./lib.js";

/* Every number on the overview that is counted from the token data, in one place. */
export function counts(T) {
  const tk = (cat) => T.tokens.filter((t) => t.cat === cat);
  const steps = (l) => [...new Set(l.filter((t) => t.used > 0).map((t) => parseFloat(t.light)))].sort((a, b) => a - b);
  const spacing = steps(tk("spacing")), radii = [...new Set(tk("radii").map((t) => parseFloat(t.light)))].sort((a, b) => a - b);
  const fontSizes = [...new Set(T.textStyles.map((s) => parseFloat(s.fontSize)))].sort((a, b) => a - b);
  const tg = T.targets ?? {};
  const row = (today, target, org) => ({ today, target: target ?? null, org });
  return {
    spacing, radii, fontSizes,
    rows: {
      textStyles: row(T.textStyles.length, tg.textStyles, T.org.textStyles.length),
      fontSizes: row(fontSizes.length, tg.fontSizes, T.org.fontSizes.length),
      radii: row(radii.length, tg.radii, T.org.radii.length),
      spacing: row(spacing.length, tg.spacing, T.org.spacing.length),
    },
    sharedWithOrg: T.tokens.filter((t) => t.org === "same").length,
    tokens: T.tokens.length,
    colors: tk("colors"),
  };
}

/* The color tokens as a plain table (Engineering view): name, both values, and where the page uses it. */
export function colorTable(T, swatchOf, cell) {
  const rows = tkColors(T).map((t) => `<tr><td>${esc(t.id)}<span class="e-k">${esc(t.group)}</span></td><td><code>${esc(t.css)}</code></td><td>${swatchOf(t.light)}<span class="mono">${cell(t.light)}</span></td><td>${t.dark === t.light ? '<span class="e-k">same</span>' : swatchOf(t.dark) + `<span class="mono">${cell(t.dark)}</span>`}</td><td class="num">${t.used ?? ""}</td></tr>`).join("");
  return `<div class="e-scroll"><table class="e-table"><thead><tr><th>Token</th><th>CSS variable</th><th>Light</th><th>Dark</th><th>Uses</th></tr></thead><tbody>${rows}</tbody></table></div>`;
}
const tkColors = (T) => T.tokens.filter((t) => t.cat === "colors");
