# Creator design system

The visual language of the Creator app: color, type, space, shape, motion and its components, layered on top of the Airtime design system (`airtime-design-system`) tokens.

The page (`index.html`) is a static site with no build step. It has two views, switched from the header:

- **Overview** (default): foundations, then three layers of live components: atoms (single controls with every state, in light and dark), patterns (the sidebar) and areas (top bar, slide tray, stage, menus and dialogs).
- **Engineering** (`?view=eng`, remembered in the browser): the same system as data. Every token with its light, dark and resolved value, every text style, every atom, pattern and area with class names, states and tokens, the icon mapping, and links to `data/tokens.json` and `tokens/tokens.css`.

## Run

```sh
python3 -m http.server           # from the repo root, then open /creator/ on the port it prints
```

## What is here

```
creator/
  index.html          both views
  css/                base.css (page shell), human.css (page layout), sidebar.css, atoms.css, header.css,
                      tray.css, stage.css, aux.css (component styles)
  js/                 main.js (views, nav), human.js (Overview), eng.js (Engineering), atoms.js, patterns.js,
                      areas.js (the component registries), components.js (markup builders), view.js, lib.js,
                      icons.js (inline copies of public org icons), tip.js (hover, focus and tap lists), states.js (color counts in three states), system.js (the color system, scales, rules and changelog), colors.js and color.js (token counts and color formatting)
  data/               tokens.json (every token with its light and dark value and use count, the org color list, the `system` tables for the color, radius, duration, control and shadow sections, and `states`: the counts on dev, in review and target, with the color names behind them; all page counts come from it)
  tokens/
    tokens.css        Creator custom properties, prefix --cr-, [data-theme=light|dark]: the 23 Figma colors
                      (background, content, lighting, shadow, accent, modeless), the pending group, radii,
                      durations, control heights and the 23 shadow recipes. Mirrors the app's token file.
    text-styles.css   .cr-text-* classes (the 10 text styles)
    *.tokens.json     design tokens (DTCG format) per area
    org/              copy of the Airtime design system tokens that Creator tokens alias
```

## States

Every state can be shown without interaction: real pseudo-classes (`:hover`, `:active`, `:focus-visible`, `:disabled`) and forcing classes (`.is-hover`, `.is-pressed`, `.is-focus`, `.is-selected`, `.is-disabled`, `.is-error`, `.is-open`).

## Relationship to the Airtime design system

Creator tokens sit on top of the org tokens, but the colors are Figma's own and alias nothing. `tokens/org/tokens.css` is a verbatim copy of `generated/tokens.css` in this repo, and `tokens/org/org-theme.css` re-scopes its light and dark blocks to `[data-theme]`. Load order: `org/tokens.css`, `org/org-theme.css`, `tokens.css`. A non-color token whose value equals an org token is declared as an alias of it (for example `--cr-font-size-xs`); the rest are Creator's own.

## Icons

Icons are the public Airtime icons from `icons/`, inlined by `js/icons.js` and recolored to `currentColor`. The Engineering view lists which org icon each control uses, and which controls have only a near match, or no match (a neutral ring shows for those). Today every control has an org icon and a few are near matches.

## Keeping it in step with the app

`tokens/tokens.css`, `tokens/text-styles.css`, the `tokens/*.tokens.json` files and the `tokens` list in `data/tokens.json` mirror the app's token file (colors, shadows, radii, durations, sizes, text styles). When the app's tokens change, update them together so a specimen never shows a value the app no longer has. Component CSS in `css/` mirrors the app's recipes (button, menu, sidebar row, segment group, dialog and so on) as they render; compare a specimen against the running app by computed style (size, padding, radius, color, shadow) rather than by eye alone.
