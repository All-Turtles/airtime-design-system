import { S, badge } from "./lib.js";
export async function overview(root) {
  let conf = []; try { conf = await (await fetch("data/conformance.json")).json(); } catch {}
  const names = [...new Set(conf.map((c) => c.name))]; const ok = conf.filter((c) => c.status === "match").length;
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
  <h4>Conformance with the running app</h4><p class="lede"><code>tools/verify-patterns.mjs</code> computes the style of ${names.length} documented controls on this page and of the same control in the live app (${conf.length} checks = controls x themes; ${ok} match, ${conf.length - ok} differ). Every check compares the properties listed in the script (box, type, colour, radius, shadow, opacity). Not yet checked live: dialog, sheet, the stage popover rows, crop bar, guides.</p>
  <h4>Rendered vs declared: findings</h4><table class="spec" style="max-width:1000px"><tr><th style="width:38%">Finding</th><th>Evidence</th></tr>
  <tr><td>Recipe type sizes on band, header and stage buttons do not render.</td><td>The unlayered <code>button { font-size: 100%; line-height: 1.15 }</code> reset wins: Record renders 13px (recipe 11px band.record); stage pill buttons render 16px/500 (recipe 13px). The design system documents the rendered values.</td></tr>
  <tr><td>Cursor differs by surface.</td><td>Sidebar controls render <code>cursor: default</code> (recipes); top bar, band, tray and stage pill buttons render <code>cursor: pointer</code>.</td></tr>
  <tr><td>Declared tokens that the sidebar does not use.</td><td><code>shadow.sidebar</code> (inset -1px hairline) and <code>color.mat.sidebar</code> are never rendered: the card is <code>mat.hud</code> with the literal <code>0 0 0 1px rgba(255,255,255,.08), 0 20px 40px .35</code> (derived token <code>shadow.sidebar-card</code>). <code>shadow.segment-track</code> is used only by the top-bar mode switch; the sidebar tracks use a different literal (<code>shadow.segment-track-sidebar</code>).</td></tr>
  <tr><td>Four disabled opacities.</td><td>0.4 (sidebar rows, fields, segments, placeholder), 0.45 (buttons, menu items), 0.3 (xs icon buttons), 0.2 (device split). None is a token in the app; they are derived tokens here.</td></tr>
  <tr><td>Two accents on one screen.</td><td>Selection, focus and 'on' are system blue (accent.*); the stage frame, handles and 'latched' insert tool are legacy Airtime teal (#99E5EE / #79DDE8).</td></tr>
  <tr><td>Alpha rounding.</td><td>mat.hud is declared 0.985 and renders 0.984 (8-bit alpha).</td></tr>
  <tr><td>No toast component.</td><td>The only transient message surface is the session banner.</td></tr></table>
  <p class="muted">* "Used" = number of rendered elements whose computed value equals the token, counted in the resting-state ledger (hover, focus and popup states are not in it yet).</p></section>`;
}
