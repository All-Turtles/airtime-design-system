import { S, badge } from "./lib.js";
export function overview(root) {
  const t = S.index.tokens, n = (f) => t.filter(f).length;
  const rel = (r) => t.filter((x) => x.org.relation === r).length;
  root.innerHTML = `<section id="overview"><h2>Creator design system</h2>
  <p class="lede">A design system for the <b>Creator app only</b>: the patterns and the token system of <code>localhost:3000/creator</code>, extracted from what the browser actually renders (computed CSS variables and computed styles in headless Chromium), cross-checked against the Chakra theme and recipes in <code>apps/airtime-creator/src/ui</code>. It sits beside the org system (<code>airtime-design-system</code>) and marks every token and pattern as ${badge("same")} ${badge("differs")} or ${badge("creator-only")} against it.</p>
  <table class="spec" style="max-width:820px"><tr><th>Tokens</th><th>Count</th></tr>
  <tr><td>Total (--cr-*)</td><td>${t.length}</td></tr>
  <tr><td>Declared in tokens.ts (rendered + verified)</td><td>${n((x) => x.status === "declared")}</td></tr>
  <tr><td>Chakra default scale entries used by number</td><td>${n((x) => x.status === "chakra-default")}</td></tr>
  <tr><td>Derived from recipe literals (not named in the app)</td><td>${n((x) => x.status === "derived")}</td></tr>
  <tr><td>Colour (semantic / primitive / derived)</td><td>${n((x) => x.category === "colors" && x.kind === "semantic")} / ${n((x) => x.category === "colors" && x.kind === "primitive")} / ${n((x) => x.category === "colors" && x.kind === "derived")}</td></tr>
  <tr><td>Text styles</td><td>${S.index.textStyles.length}</td></tr>
  <tr><td>Relationship to org system</td><td>${badge("same")} ${rel("same")} &nbsp; ${badge("differs")} ${rel("differs")} &nbsp; ${badge("creator-only")} ${rel("creator-only")}</td></tr></table>
  <p class="callout" style="margin-top:14px">The relationship is an initial pass by token value and role against <code>airtime-design-system/generated/tokens.css</code>. A CSS audit of the sidebar (docs/creator-sidebar/css-audit) will refine the deep numbers; see OPEN-QUESTIONS.</p>
  <h4>Method</h4><ol class="lede"><li><code>tools/extract-vars.mjs</code>: every <code>--chakra-*</code> property the live page defines, per theme, resolved by Chromium (723 vars).</li><li><code>tools/flatten-source.mjs</code>: tokens.ts bundled with esbuild and flattened into declared tokens with source lines.</li><li><code>tools/ledger.mjs</code>: every computed value across all visible elements for slide, presenter, text and image panes in light and dark (the "used" column, and the audit).</li><li><code>tools/build-tokens.mjs</code>: DTCG <code>tokens/*.tokens.json</code>, <code>tokens.css</code>, <code>text-styles.css</code>; <code>verify-tokens.mjs</code> proves the generated CSS resolves to the rendered values.</li></ol>
  <p class="muted">* "Used" = number of rendered elements whose computed value equals the token, counted in the resting-state ledger (hover, focus and popup states are not in it yet).</p></section>`;
}
