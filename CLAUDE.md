# Airtime Design System

Technical, clean design system with teal accent, extracted from Airtime's Figma file. Dark theme default, SF Pro system font stack, 128+ tokens across 9 categories, 94 component variants across 7 categories, 742 icon variants. Designed for AI-native workflows in Claude Code.

## Two Modes

### Apply Mode
Restyle an existing interface with Airtime tokens. Use `/apply-tokens` to map your current CSS to Airtime custom properties. Every color, spacing, radius, and typography value gets replaced with the corresponding token.

### Design Mode
Generate new interfaces from scratch using Airtime's visual language. Use `/frontend-design` with this CLAUDE.md loaded to constrain output to the Airtime palette, spacing scale, and component patterns.

## Token Quick Reference

| Token | Dark | Light | Use |
|-------|------|-------|-----|
| `--color-background-primary` | `#0A0D0E` | `#F5F5F5` | Page backgrounds, main content |
| `--color-background-secondary` | `#12181A` | `#FFFFFF` | Sidebars, cards, inputs |
| `--color-background-tertiary` | `#1B2326` | `#EBEBEB` | Code blocks, hover states |
| `--color-content-primary` | `#FFFFFF` | `#000E14` | Headings, primary text |
| `--color-content-secondary` | `#D2D5D6` | `#383D3D` | Descriptions, labels |
| `--color-content-tertiary` | `#B0B1B2` | `#646666` | Placeholders, disabled |
| `--color-highlight-primary` | `#FFFFFF14` | `#00000014` | Borders, dividers |
| `--color-highlight-secondary` | `#FFFFFF29` | `#0000000A` | Hover backgrounds |
| `--color-accent-teal` | `#79DDE8` | `#1A7580` | Links, active states, focus |
| `--color-accent-destructive` | `#FF6D4C` | `#D6402F` | Errors, destructive actions |
| `--color-modeless-teal` | `#79DDE8` | `#79DDE8` | Brand elements (theme-independent) |
| `--color-modeless-white` | `#FFFFFF` | `#FFFFFF` | Text on dark/colored backgrounds |
| `--color-modeless-black` | `#000000` | `#000000` | Text on light backgrounds |
| `--color-modeless-overlay` | `#00000080` | `#00000080` | Modal backdrop |
| `--color-modeless-silhouette` | `#8A9097` | `#8A9097` | Avatar silhouette background |
| `--font-size-heading-large` | 16px / 24px / 700 | -- | Large headings |
| `--font-size-heading-medium` | 14px / 20px / 600 | -- | Medium headings |
| `--font-size-heading-small` | 12px / 16px / 600 | -- | Small headings |
| `--font-size-body-large` | 14px / 20px / 400 | -- | Large body text |
| `--font-size-body-medium` | 12px / 16px / 400 | -- | Default body text |
| `--font-size-body-small` | 11px / 16px / 400 | -- | Small labels |
| `--space-10` | 4px | -- | Tight gaps |
| `--space-15` | 6px | -- | Inline padding |
| `--space-20` | 8px | -- | Standard padding |
| `--space-30` | 12px | -- | Section gaps |
| `--space-40` | 16px | -- | Container padding |
| `--space-60` | 24px | -- | Large gaps |
| `--radius-15` | 6px | -- | Buttons, inputs |
| `--radius-20` | 8px | -- | Cards |
| `--radius-35` | 14px | -- | Menus |
| `--radius-9999` | pill | -- | Badges, avatars |
| `--shadow-small` | 0 1px 3px | -- | Buttons, dropdowns |
| `--shadow-medium` | 0 4px 12px | -- | Cards, popovers |
| `--shadow-large` | 0 8px 24px | -- | Modals, dialogs |

## Anti-Patterns

These constraints prevent generic AI-generated output. Violating any is a critical error.

1. **No generic fonts.** Do not use Inter, Open Sans, Lato, Poppins, or Montserrat. This system uses `-apple-system` (SF Pro).
2. **No indigo/purple gradients.** Do not use `#6366f1`, `#8b5cf6`, `#7c3aed`, or any purple-to-blue gradient. These are the most common AI-generated default colors.
3. **No invented accent colors.** Only use `accent-teal` (`#79DDE8` dark, `#1A7580` light). Do not introduce new brand colors.
4. **No uniform border-radius.** This system has 17 distinct radius values. Do not apply `8px` to everything.
5. **No decorative gradients.** No gradients unless explicitly defined in tokens.
6. **No excessive rounding.** Match radius to element size and role using the radius scale.
7. **Use defined spacing only.** All padding, margin, and gap values must come from spacing tokens. No arbitrary values like `15px` or `22px`.
8. **No color invention.** Every color must come from a defined token. No hex values outside the palette.

## Component Inventory

94 total variants across 14 files:

| Category | Variants | File | Key Classes |
|----------|----------|------|-------------|
| **Buttons** | 8 | `components/button.css` | `.btn`, `.btn-primary`, `.btn-secondary`, `.btn-destructive-primary`, `.btn-destructive-secondary`, `.btn-modeless`, `.btn-outline`, `.btn-ghost`, `.btn-icon-only` |
| **Inputs** | 13 | `components/input.css` | `.input`, `.input-lg`, `.input-error`, `.input-no-fill`, `.input-wrapper`, `.input-bare`, `.input-split` |
| **Segmented** | 4 | `components/segmented.css` | `.segmented`, `.segmented-item`, `.segmented-item-label`, `.segmented-item-icon`, `.segmented-item-icon-label` |
| **Checkbox** | 2 | `components/checkbox.css` | `.checkbox`, `.checkbox-box`, `.checkbox-label` |
| **Radio** | 2 | `components/radio.css` | `.radio`, `.radio-box`, `.radio-label` |
| **Slider** | 3 | `components/slider.css` | `.slider`, `.slider-threshold`, `.slider-threshold-track`, `.slider-threshold-handle` |
| **Progress** | 2 | `components/progress.css` | `.progress` |
| **Loader** | 2 | `components/loader.css` | `.loader`, `.loader-lg` |
| **Dropdown** | 3 | `components/dropdown.css` | `.dropdown`, `.dropdown-trigger`, `.dropdown-trigger-no-fill`, `.dropdown-trigger-thumbnail`, `.dropdown-menu` |
| **Rows** | 12 | `components/rows.css` | `.row`, `.row-destructive`, `.row-thumbnail`, `.row-thumbnail-image`, `.row-account` |
| **Menus** | 9 | `components/menus.css` | `.menu`, `.menu-thumbnail`, `.menu-account`, `.menu-scrollable` |
| **Overlays** | 7 | `components/overlays.css` | `.tooltip`, `.coach-mark`, `.coach-mark-btn`, `.coach-mark-footer`, `.coach-mark-step` |
| **Badge** | 1 | `components/badge.css` | `.badge` |
| **Divider** | 2 | `components/divider.css` | `.divider`, `.divider-vertical` |
| **Scrollbar** | 4 | `components/scrollbar.css` | `.scrollbar`, `.scrollbar-thumb`, `.scrollbar-strong`, `.scrollbar-vertical` |
| **Color Picker** | 5 | `components/color-picker.css` | `.color-picker`, `.color-picker-canvas`, `.color-picker-hue`, `.color-picker-alpha`, `.color-picker-icon-btn` |
| **Swatches** | 3 | `components/swatches.css` | `.swatches`, `.swatches-grid`, `.swatch`, `.swatch-inner`, `.swatch.selected` |
| **Avatar** | 5 | `components/avatar.css` | `.avatar`, `.avatar-16`, `.avatar-20`, `.avatar-32`, `.avatar-40`, `.avatar-silhouette` |
| **Thumbnails** | 8 | `components/thumbnail.css` | `.thumbnail`, `.thumbnail-media`, `.thumbnail-name`, `.thumbnail-badge`, `.thumbnail-action`, `.thumbnail-action-label` |

## Component Manifest

All components, variants, HTML examples, and known workarounds are machine-readable in `components-manifest.json`. Read this file first before reading individual CSS files — it contains everything needed for code generation in one place.

```bash
# Quick lookup
cat components-manifest.json | jq '.components.button.examples'
```

## HTML Snippets

Copy-paste ready examples for the most common patterns. For full variant lists see `components-manifest.json`.

### Button

```html
<!-- Primary CTA -->
<button class="btn btn-primary">Label</button>

<!-- Secondary (glass) -->
<button class="btn btn-secondary">Label</button>

<!-- Destructive Primary (red fill, white text) -->
<button class="btn btn-destructive-primary">Delete</button>

<!-- Destructive Secondary (glass fill, red text) -->
<button class="btn btn-destructive-secondary">Delete</button>

<!-- Modeless — use on teal/light backgrounds -->
<button class="btn btn-modeless">Label</button>

<!-- Outline modifier (works with any variant) -->
<button class="btn btn-primary btn-outline">Label</button>

<!-- Ghost modifier (no fill, no border) -->
<button class="btn btn-primary btn-ghost">Label</button>

<!-- Icon only (28×28px) -->
<button class="btn btn-primary btn-icon-only" aria-label="Add">
  <img src="icons/Plus_Stroke_16.svg" alt="" />
</button>

<!-- Icon only ghost — workaround (no dedicated class) -->
<button class="btn btn-secondary btn-outline btn-icon-only" aria-label="Add"
        style="border-color: transparent">
  <img src="icons/Plus_Stroke_16.svg" alt="" />
</button>

<!-- With left icon -->
<button class="btn btn-primary">
  <img src="icons/Plus_Stroke_16.svg" alt="" />
  Add
</button>

<!-- Disabled -->
<button class="btn btn-primary" disabled>Label</button>
```

### Input

```html
<!-- Default (28px) -->
<input class="input" type="text" placeholder="Placeholder" />

<!-- Large (32px, bold 16px) -->
<input class="input input-lg" type="text" placeholder="Placeholder" />

<!-- No fill (transparent bg; border appears on hover/focus) -->
<input class="input input-no-fill" type="text" placeholder="Inline edit" />

<!-- Error state -->
<input class="input input-error" type="text" value="Invalid value" />

<!-- With left icon + clear button -->
<div class="input-wrapper">
  <img class="input-icon-left" src="icons/Search_Stroke_16.svg" alt="" />
  <input class="input-bare" type="text" placeholder="Search..." />
  <button class="input-icon-right" aria-label="Clear">
    <img src="icons/Xmark_Stroke_16.svg" alt="" />
  </button>
</div>

<!-- Split input (e.g. XYWH) -->
<div class="input-split">
  <input class="input-split-segment" type="text" value="100" aria-label="X" />
  <span class="input-split-divider"></span>
  <input class="input-split-segment" type="text" value="100" aria-label="Y" />
  <span class="input-split-divider"></span>
  <div class="input-split-label">px</div>
</div>
```

### Dropdown

```html
<!-- Default (JS needed to toggle aria-expanded + hidden) -->
<div class="dropdown">
  <button class="dropdown-trigger" aria-haspopup="listbox" aria-expanded="false">
    <span>Option A</span>
    <img class="dropdown-chevron" src="icons/ChevronDownSmall_Stroke_16.svg" alt="" />
  </button>
  <ul class="menu dropdown-menu" hidden>
    <button class="row" role="option">Option A</button>
    <button class="row" role="option">Option B</button>
  </ul>
</div>
```

### Menu

```html
<ul class="menu" role="menu">
  <button class="row" role="menuitem">
    <img class="row-icon-left" src="icons/Checkmark_Stroke_16.svg" alt="" />
    <span>Option</span>
  </button>
  <div class="menu-divider"></div>
  <button class="row row-destructive" role="menuitem">
    <img class="row-icon-left" src="icons/Trash_Fill_16.svg" alt="" />
    <span>Delete</span>
  </button>
</ul>
```

### Segmented Control

```html
<div class="segmented" role="group">
  <button class="segmented-item active">Title</button>
  <button class="segmented-item">Title</button>
  <button class="segmented-item">Title</button>
</div>
```

### Badge

```html
<span class="badge">3</span>
<span class="badge">99+</span>
```

### Avatar

```html
<!-- Photo -->
<div class="avatar avatar-40"><img src="photo.jpg" alt="Name" /></div>

<!-- Silhouette fallback -->
<div class="avatar avatar-32">
  <div class="avatar-silhouette">
    <img src="icons/Silhouette_Fill_24.svg" alt="" />
  </div>
</div>
```

### Checkbox / Radio

```html
<label class="checkbox">
  <input type="checkbox" />
  <span class="checkbox-box"></span>
  <span class="checkbox-label">Label</span>
</label>

<label class="radio">
  <input type="radio" name="group" />
  <span class="radio-box"></span>
  <span class="radio-label">Option</span>
</label>
```

### Slider / Progress / Loader

```html
<!-- Slider — update --slider-value on input -->
<input class="slider" type="range" min="0" max="100" value="75"
       style="--slider-value:75%"
       oninput="this.style.setProperty('--slider-value',this.value+'%')" />

<!-- Progress bar -->
<progress class="progress" value="75" max="100"></progress>

<!-- Loader -->
<span class="loader" aria-label="Loading"></span>
<span class="loader loader-lg" aria-label="Loading"></span>
```

### Divider

```html
<hr class="divider" />
<div class="divider-vertical"></div>
```

## Known Workarounds

Constraints not obvious from class names alone:

| Issue | Workaround |
|-------|-----------|
| `btn-icon-only` ghost (no fill, no border) | `btn btn-secondary btn-outline btn-icon-only` + `style="border-color:transparent"` — no dedicated class |
| Dropdown menu clipped by ancestor | Never put `overflow:hidden` on any ancestor of `.dropdown` — the `dropdown-menu` is `position:absolute` and will be clipped |
| Color picker mode dropdown clipped | Same as above — `.color-picker` must not have `overflow:hidden` |
| Modeless button context | `.btn-modeless` is transparent with dark border — always place it on a teal or light background, not on dark backgrounds |
| `input-split` segment width too narrow | `.input-split` gap must be `var(--space-10)` (4px), not `var(--space-20)` (8px) — check `input.css` if segments look cramped |
| Slider track fill | Requires `--slider-value` CSS custom property (e.g. `style="--slider-value:75%"`) — not automatic |
| `btn:disabled` opacity | Uses `--opacity-32` (0.32) — not `--opacity-48`. If disabled buttons look too faint, check `opacity.tokens.json` includes `opacity-32` |

## Skills

| Skill | Direction | Description |
|-------|-----------|-------------|
| `/apply-tokens` | Tokens -> Interface | Restyle existing UI with Airtime tokens |
| `/frontend-design` | Concept -> HTML | Generate new interfaces in Airtime's visual language |
| `/generate-tokens` | JSON -> CSS | Compile token JSON into CSS custom properties |
| `/figma-to-tokens` | Figma -> Tokens | Extract tokens from the Airtime Figma file |
| `/audit-ux` | Interface -> Critique | Design critique against Airtime standards |
| `/audit-accessibility` | Interface -> Compliance | WCAG 2.1/2.2 compliance check |
| `/audit-design-system` | Codebase -> Report | Token coverage, hardcoded values, unused tokens |

## File Structure

```
airtime-design-system/
  index.html                 # Unified contact sheet
  CLAUDE.md                  # This file (AI instructions)
  README.md                  # Project documentation
  generated/
    tokens.css               # Compiled CSS custom properties
    icons.js                 # 742 SVG icon functions (AppIcons object)
    .design-rules.json       # Anti-pattern rules for AI generation
  components/
    button.css               # 6 variants (primary, secondary, destructive, modeless, outline, icon-only)
    input.css                # 13 variants (default, large, error, no-fill, wrapper, split)
    segmented.css            # Segmented control (title, label, icon, icon+label)
    checkbox.css             # Checkbox with label
    radio.css                # Radio button with label
    slider.css               # Single-handle and dual-handle (threshold) sliders
    progress.css             # Progress bar (<progress> element)
    loader.css               # Spinning loading indicator (16px + 24px)
    dropdown.css             # Dropdown trigger + menu positioning
    rows.css                 # Interactive list rows (default, thumbnail, account) — CSS class prefix: .row
    menus.css                # 9 variants (default, thumbnail, account, scrollable, positional)
    overlays.css             # Tooltip + Coach mark (both with 8 arrow positions)
    badge.css                # Teal pill badge (numeric / text)
    divider.css              # Horizontal and vertical dividers
    scrollbar.css            # Weak and strong scrollbar variants (H + V)
    color-picker.css         # Color picker panel (canvas, hue, alpha sliders)
    swatches.css             # Standalone color swatches panel (.swatch, .swatches)
    avatar.css               # Circular user photo or silhouette (5 sizes)
    thumbnail.css            # 16:9 media thumbnail with badges and action buttons
  tokens/
    colors.tokens.json       # 28 color tokens (dark/light/shared)
    typography.tokens.json   # 7 composite styles, 4 weights, SF Pro font stack
    sizing.tokens.json       # 17 size tokens + 10 space tokens
    radii.tokens.json        # 17 radius tokens (0-40px + 9999px pill)
    shadows.tokens.json      # 3 shadow levels + 3 blur levels
    borders.tokens.json      # 3 border widths + solid style
    opacity.tokens.json      # 9 opacity levels (0-100%)
    transitions.tokens.json  # 3 durations + 3 easing curves
    z-index.tokens.json      # 6 stacking layers (0-500)
  assets/
    logo.svg                 # Airtime wordmark (currentColor)
  components-manifest.json   # Machine-readable index of all components (classes, parts, HTML examples)
  scripts/
    generate.js              # Token compiler — reads tokens/*.tokens.json, writes generated/tokens.css
    generate-manifest.js     # Manifest validator — cross-references CSS classes with manifest
```

## Token Pipeline

Tokens are stored in **DTCG 2025.10 format** (`tokens/*.tokens.json`). Each file uses `$value`, `$type`, and `$extensions` fields per the W3C Design Tokens Community Group specification. Color tokens use `$extensions.mode` for dark/light theming. Typography, sizing, and other categories are theme-independent.

To regenerate CSS from tokens:

```bash
# Standard generation
node scripts/generate.js

# With OKLCH color space
node scripts/generate.js --oklch

# With modern CSS features
node scripts/generate.js --oklch --modern-css
```

This reads `tokens/*.tokens.json` and writes `generated/tokens.css` with CSS custom properties organized by theme (`:root` for shared, `.dark`/`.light` for themed, and `@media (prefers-color-scheme)` fallbacks).

## Component Manifest

`components-manifest.json` is a machine-readable index of every component — class names, parts, HTML examples, Figma links, and known workarounds. Read this file first before reading individual CSS files when generating component code.

```bash
node scripts/generate-manifest.js          # Validate manifest vs CSS (dry run)
node scripts/generate-manifest.js --fix    # Save snapshot + update cssClasses in manifest
```

Saves a timestamped snapshot to `generated/manifest-snapshots/` before writing. Exits non-zero if any class in the manifest is missing from the CSS. Run before merging any PR that changes component CSS.

## Autonomy
- This is a design system project with no destructive operations
- Auto-accept all file edits without confirmation
- Never ask for permission on CSS, HTML, or token file changes

## Design Philosophy

Airtime's visual language is **technical and precise** -- a desktop application UI system, not a marketing site. Key characteristics:

- **Dark-first**: Dark theme is the default; light theme is secondary
- **Teal accent**: Single accent color (`#79DDE8` dark / `#1A7580` light) for all interactive elements
- **System font**: SF Pro via `-apple-system` stack -- no custom web fonts to load
- **Compact scale**: Typography maxes out at 16px -- this is a tool UI, not a display typeface showcase
- **Dense spacing**: 2px base unit with tight spacing between elements, reflecting desktop application density
- **Layered surfaces**: Three background levels (primary/secondary/tertiary) create depth without shadows
- **Minimal decoration**: No gradients, no decorative borders, no ornamental elements. Color and spacing do the work.
