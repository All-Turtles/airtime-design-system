# Creator design system

A design system for the **Creator app only** (`localhost:3000/creator`), extracted from what the browser renders. It lives beside the org system (`airtime-design-system`) and adds only this folder; nothing outside `creator/` is changed. Every token and pattern is marked `same as airtime-design-system`, `differs` or `creator-only`.

## Run

```sh
cd creator
python3 -m http.server 3100     # then open http://localhost:3100/
```

One static page (`index.html`): Overview, Foundations, Sidebar, Header and toolbar, Slide tray, Stage, Auxiliary. Every pattern shows anatomy, variants, all states (default, hover, pressed, focus-visible, selected, disabled) in light and dark side by side, live rendering with the tokens, source file and line in `apps/airtime-creator/src`, and the tokens it uses (scanned from the CSS).

## Structure

```
creator/
  index.html            the page (loads tokens, css, icons, js/main.js)
  tokens/
    tokens.css          GENERATED custom properties, prefix --cr-, [data-theme=light|dark]
    text-styles.css     GENERATED .cr-text-* classes from the app's textStyles
    *.tokens.json       GENERATED DTCG tokens per area (color, typography, spacing, sizing, radii, borders,
                        shadows, materials, motion, z-index, opacity, derived); each token carries
                        $extensions.creator {css, kind, status, source, rendered, org, used}
  css/                  base.css (docs shell), sidebar.css, header.css, tray.css, stage.css, aux.css: real CSS from tokens only
  js/                   main.js, lib.js (pattern renderer), overview/foundations/sidebar/header/tray/stage/aux.js
  assets/icons.js       byte-identical copy of apps/airtime-creator/teleport/icons.js (AppIcons)
  assets/mask-icons.js  GENERATED: Mask*, StrokeGlyph, BandGlyph and other mmhmm-icons paths, verbatim
  data/                 extraction evidence: rendered-vars.json, declared.json, ledger.json, resolved.json,
                        tokens-index.json, untokenized.json, sources.json, conformance.json
  tools/                pipeline (below)
```

Token status: `declared` (in `ui/tokens.ts`, value verified against the browser), `chakra-default` (Chakra scale entry the recipes use by number), `derived` (a literal inside a recipe or primitive that the app never names; source line recorded).

## Pipeline (`tools/`)

Needs the dev app on :3000 and Chromium via the QA harness in `docs/creator-sidebar/qa` (read only). Nothing under `apps/` is written.

| Script | What |
|---|---|
| `extract-vars.mjs` | every `--chakra-*` var of the live page, light and dark, resolved by Chromium |
| `flatten-source.mjs` | bundles `tokens.ts` with esbuild and flattens it to declared tokens |
| `ledger.mjs` | every computed value of every visible element (slide, presenter, text, image panes; both themes) |
| `build-tokens.mjs` | writes `tokens/*`, `data/tokens-index.json`; org relationship from `token-meta.mjs` + value pools |
| `resolve-tokens.mjs`, `verify-tokens.mjs` | proves `tokens.css` resolves to the rendered values (0 mismatches) |
| `build-sources.mjs`, `build-mask-icons.mjs` | source line map; glyph extraction |
| `verify-patterns.mjs` | computed-style comparison of documented patterns against the live app |
| `check-vars.mjs` | every `var(--cr-*)` used in `css/` exists |
| `capture.mjs` | dumps computed styles of live elements for authoring |
| `build-all.sh [--extract]` | `--extract` re-reads the live app; otherwise rebuilds and verifies offline |

## Conventions adapted from toolkit

Follows `toolkit/systems/*` (DTCG `.tokens.json` per area + generated CSS + components css). Not used: `/clone-tokens` (the source is a live Chakra SPA, not cloned static CSS), so extraction is done in headless Chromium instead. Added: `--cr-` prefix, `[data-theme]` scopes so both themes render on one page, and per-token `$extensions.creator`.
