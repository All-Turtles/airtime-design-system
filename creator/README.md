# Creator design system

The visual language of the Creator app: color, type, space, shape, motion and the sidebar components, layered on top of the Airtime design system (`airtime-design-system`) tokens.

The page (`index.html`) is a single static Overview. It has no build step and needs no server-side code.

## Run

```sh
python3 -m http.server           # from the repo root, then open /creator/ on the port it prints
```

## What is here

```
creator/
  index.html          the Overview page
  css/                base.css (page shell), sidebar.css (component styles), human.css (Overview layout)
  js/                 main.js, human.js (Overview), components.js (markup builders), lib.js (helpers)
  data/overview.json  the numbers and color values the Overview shows
  tokens/
    tokens.css        Creator custom properties, prefix --cr-, [data-theme=light|dark]
    text-styles.css   .cr-text-* classes
    *.tokens.json     design tokens (DTCG format) per area: color, typography, spacing, sizing, radii,
                      borders, shadows, materials, motion, z-index, opacity, derived
    org/              copy of the Airtime design system tokens that Creator tokens alias
```

## Relationship to the Airtime design system

Creator tokens sit on top of the org tokens. `tokens/org/tokens.css` is a verbatim copy of `generated/tokens.css` in this repo, and `tokens/org/org-theme.css` re-scopes its light and dark blocks to `[data-theme]`. Load order: `org/tokens.css`, `org/org-theme.css`, `tokens.css`. A Creator token whose value equals an org token is declared as an alias of it (for example `--cr-radius-lg: var(--radius-25)`); the rest are Creator's own.

Each `*.tokens.json` token carries `$extensions.creator` with its CSS variable, kind, rendered value in light and dark, and its relation to the org system (`same`, `differs` or `creator-only`).

## Icons

The page does not ship icon artwork. Icon slots in the component examples use a neutral placeholder glyph; the Airtime icon set in `icons/` and `generated/icons.js` is the public icon source.
