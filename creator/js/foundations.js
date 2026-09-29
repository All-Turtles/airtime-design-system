import { S, esc, badge, hydrateIcons } from "./lib.js";

const T = (f) => S.index.tokens.filter(f);
const val = (t, m) => (t.rendered ? t.rendered[m] : "");
const short = (v, n = 150) => (v.length > n ? v.slice(0, n) + "…" : v);
const srcTxt = (t) => `${t.source.file.replace("apps/airtime-creator/src/", "")}${t.source.line ? ":" + t.source.line : ""}<br>${t.source.export ?? ""}${t.source.path ? "." + t.source.path : ""}`;
const usedTxt = (t) => (t.used ? (t.used.all ?? (t.used.light ?? 0) + "L " + (t.used.dark ?? 0) + "D") : "-");
const theme = (m, inner) => `data-theme="${m}"`;

/* one row of the token tables: preview | name | values | used | source + relationship */
function row(t, pv) {
  const same = val(t, "light") === val(t, "dark");
  const vals = t.rendered ? (same ? `<b>both</b> ${esc(short(val(t, "light")))}` : `<b>light</b> ${esc(short(val(t, "light")))}<br><b>dark</b> ${esc(short(val(t, "dark")))}`) : esc(short(String(t.declared.value ?? "")));
  const via = t.kind !== "derived" && t.declared ? "" : "";
  return `<div class="tok" id="tok-${t.css.slice(5)}"><div>${pv}</div><div><div class="name">${t.css}</div><div class="kind">${t.kind}${t.status === "chakra-default" ? " · chakra default" : t.status === "derived" ? " · derived from recipe literal" : ""}</div></div>
  <div class="vals">${vals}</div><div class="mono">${usedTxt(t)}</div>
  <div><div class="from">${srcTxt(t)}</div>${badge(t.org.relation, t.org.note)}${t.org.org ? ` <span class="from">${esc(t.org.org)}</span>` : ""}${t.org.relation === "differs" ? `<div class="from">${esc(short(t.org.note, 140))}</div>` : ""}</div></div>`;
}
const head = (extra = "") => `<div class="tok head"><div>Preview</div><div>Token</div><div>Resolved value (rendered)</div><div>Used*</div><div>Source · org relationship</div></div>`;
const table = (list, pv) => head() + list.map((t) => row(t, pv(t))).join("");

const pvColor = (t) => `<div class="pv checkerbg"><i data-theme="light" style="background:var(${t.css})"></i><i data-theme="dark" style="background:var(${t.css})"></i></div>`;
const pvShadow = (t) => `<div style="display:flex;gap:0"><div data-theme="light" style="background:var(--cr-color-bg);padding:9px 10px"><div style="width:34px;height:20px;border-radius:7px;background:var(--cr-color-bg-panel);box-shadow:var(${t.css})"></div></div><div data-theme="dark" style="background:var(--cr-color-bg);padding:9px 10px"><div style="width:34px;height:20px;border-radius:7px;background:var(--cr-color-bg-panel);box-shadow:var(${t.css})"></div></div></div>`;

const COLOR_GROUPS = [
  ["Ground, surfaces and materials", "The window ground, the content surface, the recessed well, and the fills of surfaces that float. Materials are near-opaque (0.985) so the stage never bleeds through the sidebar.", /^color\.(bg|background|mat|scrim|surface|overlay|header|split-picker|ground)(\.|$)/],
  ["Ink: content and the text ramp", "Six weights of quiet as alpha over the ground (text.1 is body; text.5 is hints), plus the three opaque content inks kept for legacy chrome.", /^color\.(content|text|fg|ink)(\.|$)/],
  ["Lines, edges and state washes", "Hairlines, the bevelled edge pair (dark outer hairline + light inner top highlight), hover/active/selected washes.", /^color\.(line|border|edge|state|highlight|dash|wire)(\.|$)/],
  ["Accent: system blue", "Spent only on selection, focus and 'on'. The org system's accent is teal.", /^color\.(accent|systemBlue)(\.|$)/],
  ["Danger: system red", "Recording and destruction.", /^color\.(danger|systemRed)(\.|$)/],
  ["Stage glass (always dark)", "The selection bar and menus that float over the stage are dark independently of the shell theme.", /^color\.selection(\.|$)/],
  ["Product and status", "Legacy Airtime actions, live status, device-off, slide badge.", /^color\.(action|status|device|slide)(\.|$)/],
  ["Chakra plumbing", "Chakra's default `gray` colour palette bound to Creator's neutrals so an unstyled Chakra control still reads as Creator; not a design decision.", /^color\.(gray|focus-ring)(\.|$)/],
];

export function foundations(root) {
  const cols = T((t) => t.category === "colors");
  const colorHtml = COLOR_GROUPS.map(([title, note, re]) => { const l = cols.filter((t) => re.test(t.id)); return l.length ? `<h4>${title} <span class="muted">(${l.length})</span></h4><p class="lede" style="margin-bottom:4px">${note}</p>${table(l, pvColor)}` : ""; }).join("");
  const seen = new Set(COLOR_GROUPS.flatMap(([, , re]) => cols.filter((t) => re.test(t.id)).map((t) => t.css)));
  const orphans = cols.filter((t) => !seen.has(t.css));

  // ── typography ─────────────────────────────────────────
  const fam = T((t) => t.category === "fonts");
  const sizes = T((t) => t.category === "font-sizes").sort((a, b) => parseFloat(val(a, "light")) - parseFloat(val(b, "light")));
  const wts = T((t) => t.category === "font-weights");
  const lsp = T((t) => t.category === "letter-spacings"), lh = T((t) => t.category === "line-heights");
  const styles = S.index.textStyles;
  const typeHtml = `
  <h4>Families</h4>${table(fam, (t) => `<div style="font-family:var(${t.css});font-size:17px;line-height:20px">Aa Gg 123</div>`)}
  <h4>Sizes (macOS ramp)</h4>${table(sizes, (t) => `<div style="font-size:var(${t.css});line-height:1.2;white-space:nowrap">Aa ${val(t, "light")}</div>`)}
  <h4>Weights</h4>${table(wts, (t) => `<div style="font-weight:var(${t.css});font-size:15px">Aa ${val(t, "light")}</div>`)}
  <h4>Letter-spacing</h4>${table(lsp.concat(T((t) => t.css === "--cr-letter-spacing-sidebar")), (t) => `<div style="font-size:12px;letter-spacing:var(${t.css});white-space:nowrap;text-transform:uppercase">Label ${t.css.slice(5)}</div>`)}
  <h4>Line-heights</h4>${table(lh.concat(T((t) => t.css === "--cr-line-height-sidebar")), (t) => `<div class="mono">${val(t, "light")}</div>`)}
  <h4>Text styles (roles)</h4><p class="lede">A control's type is chosen by what it is. Each pairs size, line height, weight (and tracking/case) and is emitted as <code>.cr-text-*</code> in tokens/text-styles.css.</p>
  <div class="tok head" style="grid-template-columns:1.4fr 1.2fr 1.4fr 1.6fr"><div>Sample</div><div>Style</div><div>Metrics</div><div>Source · org relationship</div></div>
  ${styles.map((s) => `<div class="tok" style="grid-template-columns:1.4fr 1.2fr 1.4fr 1.6fr"><div><span class="${s.css}">The quick brown fox</span></div><div><div class="name">${s.css}</div></div><div class="vals">${Object.entries(s.value).map(([k, v]) => `${k}: ${v}`).join("; ")}</div><div><div class="from">${s.source.file.replace("apps/airtime-creator/src/", "")}:${s.source.line}</div>${badge(s.org.relation, s.org.note)} <span class="from">${esc(s.org.org ?? "")}</span> <div class="from">${esc(s.org.note)}</div></div></div>`).join("")}`;

  // ── spacing / sizes ───────────────────────────────────
  const sp = T((t) => t.category === "spacing").sort((a, b) => parseFloat(val(a, "light")) - parseFloat(val(b, "light")));
  const bar = (t) => `<div style="height:14px;width:min(${parseFloat(val(t, "light")) || 0}px,100%);background:var(--cr-color-accent-muted);border-radius:2px;box-shadow:inset 0 0 0 0.5px var(--cr-color-accent-solid)"></div>`;
  const nsz = T((t) => t.category === "sizes" && t.id.startsWith("size.creator")).sort((a, b) => a.id.localeCompare(b.id));
  const osz = T((t) => t.category === "sizes" && !t.id.startsWith("size.creator") && t.kind === "primitive" && t.status === "declared");
  const ladder = T((t) => t.category === "sizes" && t.status === "chakra-default").sort((a, b) => parseFloat(val(a, "light")) - parseFloat(val(b, "light")));
  const anat = T((t) => t.category === "sizes" && t.kind === "derived");
  const spaceHtml = `<h4>Spacing scale</h4><p class="lede">Chakra's 4px-based numeric ladder (recipes use it by number: <code>px="1.5"</code> = 6px) plus Creator's off-grid additions (0.75, 1.25, 1.75, 2.25 = 3, 5, 7, 9px) and the one <b>gutter</b> (16px) around stage, tray and sidebar. The sidebar rhythm is 6px between rows, 12px around rules, 16px side padding.</p>${table(sp, bar)}
  <h4>Sizes: named Creator dimensions</h4>${table(nsz, (t) => (/px$/.test(val(t, "light")) ? bar(t) : ""))}
  <h4>Sizes: other declared (sheet, backgroundBrowser, splitPicker, segment)</h4>${table(osz, () => "")}
  <h4>Sizes: anatomy aliases (derived from primitives/recipes)</h4><p class="lede">Component dimensions that recipes state as Chakra numbers or px literals, named here once.</p>${table(anat, (t) => (/px$/.test(val(t, "light")) ? bar(t) : ""))}
  <h4>Sizes: Chakra numeric ladder (default, referenced by number)</h4>${table(ladder, bar)}`;

  const rad = T((t) => t.category === "radii").sort((a, b) => parseFloat(val(a, "light")) - parseFloat(val(b, "light")));
  const radiiHtml = `<p class="lede">A continuous ladder, each step about 1.35x the last, so a surface nested one step down has concentric corners: sidebar card 14 (2xl), controls 7 (md), segment track 10 (lg), thumbnails 3 (xs).</p>${table(rad, (t) => `<div style="width:44px;height:26px;background:var(--cr-color-accent-muted);box-shadow:inset 0 0 0 1px var(--cr-color-accent-solid);border-radius:var(${t.css})"></div>`)}`;
  const bw = T((t) => t.category === "border-widths");
  const bordersHtml = `<p class="lede">A hairline is a device pixel: 0.5px on Retina (this page is drawn at your display's density; verify at 2x). Borders are almost never drawn as <code>border</code>: they are the 0.5px ring inside a box-shadow so a floating surface's radius stays intact.</p>${table(bw, (t) => `<div style="width:60px;height:22px;border:var(${t.css}) solid var(--cr-color-text-3);border-radius:5px"></div>`)}
  ${table(T((t) => /^--cr-shadow-(field-well|thumb-ring|placeholder|caption|input-wrapper)/.test(t.css)), pvShadow)}`;
  const shadows = T((t) => t.category === "shadows");
  const shadowsHtml = `<p class="lede">Layered: a contact shadow, an ambient one and the outer hairline in one declaration. Themed values (dark shadows are heavier; the edge hairline is 0.62 black in dark, 0.16 in light).</p>${table(shadows, pvShadow)}`;
  const mats = T((t) => /^--cr-color-(mat|scrim|overlay|surface|header-ground)/.test(t.css));
  const blur = T((t) => t.category === "blurs" && t.kind === "primitive" && /selection/.test(t.css));
  const grad = T((t) => t.category === "gradients");
  const matHtml = `<p class="lede">Materials are the fills of surfaces that float. Menus are translucent (0.86-0.88) with a blur; HUD, sheet and sidebar are 0.985+ so they read as solid. Previewed over a busy photograph-like gradient to show translucency.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr">${["light", "dark"].map((m) => `<div data-theme="${m}" style="padding:14px;background:linear-gradient(120deg,#e0453a,#f0a23c 30%,#3cb0a4 60%,#3b6bf0);display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:10px">${mats.filter((t) => /mat-|scrim|surface-raised|header-ground/.test(t.css)).map((t) => `<div style="height:64px;border-radius:10px;background:var(${t.css});backdrop-filter:blur(var(--cr-blur-selection-menu));box-shadow:var(--cr-shadow-md);padding:6px 8px;font-size:10px;color:var(--cr-color-text-1)"><b>${t.css.slice(5)}</b></div>`).join("")}</div>`).join("")}</div>
  ${table(mats, pvColor)}<h4>Blur</h4>${table(blur, () => "")}<h4>Window gradient</h4>${table(grad, (t) => `<div style="height:26px;border-radius:6px;background:var(${t.css})"></div>`)}
  <p class="callout"><b>Not tokenized:</b> the ledger also records <code>backdrop-filter: blur(28px) saturate(2)</code> on the selection bar; the saturate(2) is a literal in the component, only the blur radius has a token.</p>`;
  const dur = T((t) => t.category === "durations" && t.kind === "primitive" && t.status === "declared").sort((a, b) => parseFloat(val(a, "light")) - parseFloat(val(b, "light")));
  const eas = T((t) => t.category === "easings" && t.status === "declared");
  const trans = T((t) => t.category === "transitions");
  const curve = (v) => { const m = v.match(/cubic-bezier\(([^)]+)\)/); const p = m ? m[1].split(",").map(Number) : v === "ease-out" ? [0, 0, 0.58, 1] : v === "ease-in-out" ? [0.42, 0, 0.58, 1] : [0.25, 0.1, 0.25, 1]; return `<svg width="60" height="34" viewBox="-3 -3 66 40" aria-hidden="true"><path d="M0 34 C ${p[0] * 60} ${34 - p[1] * 34}, ${p[2] * 60} ${34 - p[3] * 34}, 60 0" fill="none" stroke="currentColor" stroke-width="1.5"/></svg>`; };
  const motionHtml = `<p class="lede">Durations and easings; click a row to play it. Reduced motion: the sidebar column drops its slide entirely (<code>_motionReduce: transition none</code>).</p>
  <h4>Durations</h4>${head()}${dur.map((t) => row(t, `<div class="mplay" data-d="${val(t, "light")}" style="height:20px;border-radius:5px;background:var(--cr-color-state-hover);position:relative;cursor:pointer;overflow:hidden"><i style="position:absolute;left:2px;top:2px;width:16px;height:16px;border-radius:4px;background:var(--cr-color-accent-solid)"></i></div>`)).join("")}
  <h4>Easings</h4>${table(eas, (t) => curve(val(t, "light")))}<h4>Composed transitions (derived)</h4>${table(trans, () => "")}`;
  const zz = T((t) => t.category === "z-index" && t.status === "declared").sort((a, b) => +val(a, "light") - +val(b, "light"));
  const zHtml = `<p class="lede">Only five layers are named: the stage, the band over it, the stage's own controls, the tray and the top bar. Chakra's own scale (popover 1500, modal 1400...) handles portaled surfaces.</p>${table(zz, (t) => `<div class="mono">${val(t, "light")}</div>`)}`;
  const ops = T((t) => t.category === "opacity");
  const focus = T((t) => /^--cr-(shadow-(focus|focus-inset|field-focus)|color-(focus-ring|accent-focus-ring|danger-focus-ring))$/.test(t.css));
  const opacityHtml = `<p class="lede">Creator does not tokenize opacity: every disabled state is a literal 0.4 in a recipe (and the unwired Placeholder). These are <b>derived</b> tokens: the audit's proposal.</p>${table(ops, (t) => `<div style="display:flex;gap:6px;align-items:center;font-size:11px"><span style="display:inline-block;padding:3px 8px;border-radius:7px;background:var(--cr-color-state-hover);opacity:var(${t.css})">Label</span></div>`)}`;
  const focusHtml = `<p class="lede">Three focus rings in use: <b>shadow.focus</b> (1px accent + 3px 34% halo, buttons, rows, segments, swatches), <b>shadow.focus-inset</b> (2px inside, for split-pill halves that are clipped), and <b>field-focus</b> (0.5px accent line + 3px 22% halo, value wells). Only <code>:focus-visible</code> draws them; range thumbs use a 3px solid accent ring. <b>Rows never use outline</b>: <code>outline: none</code> + box-shadow so the ring follows the radius.</p>
  <div style="display:grid;grid-template-columns:1fr 1fr">${["light", "dark"].map((m) => `<div class="stage" data-theme="${m}"><div class="tag">${m}</div><div style="display:flex;gap:18px;flex-wrap:wrap"><button class="cr-btn0 cr-action is-focus" style="width:120px">focus</button><div class="cr-field is-value is-focus" style="width:80px"><input value="42" aria-label="demo"></div><span style="width:70px;height:28px;border-radius:7px;box-shadow:var(--cr-shadow-focus-inset);display:inline-block"></span></div></div>`).join("")}</div>${table(focus, pvShadow)}`;
  const unt = S.untok;
  const untHtml = `<p class="lede">Rendered values (whole app, all four panes, both themes) that no token explains: the audit's list of drift. Counts are elements.</p>${Object.entries(unt).map(([k, l]) => l.length ? `<h4>${k}</h4><table class="spec"><tr><th style="width:160px">Value</th><th style="width:60px">Elements</th><th>Examples</th></tr>${l.map((t) => `<tr><td class="mono">${esc(t.value)}</td><td>${t.n}</td><td class="src">${t.ex.map(esc).join(", ")}</td></tr>`).join("")}</table>` : "").join("")}
  <h4>Sidebar colours not in any token or derived token</h4><table class="spec"><tr><th>Theme</th><th>Prop</th><th>Value</th><th>Elements</th></tr>${S.unmatched.length ? S.unmatched.map((u) => `<tr><td>${u.theme}</td><td>${u.prop}</td><td class="mono">${esc(u.value)}</td><td>${u.n}</td></tr>`).join("") : '<tr><td colspan="4">none</td></tr>'}</table>`;

  const zero = S.index.tokens.filter((t) => t.status === "declared" && t.used && ((t.used.all ?? 0) + (t.used.light ?? 0) + (t.used.dark ?? 0)) === 0 && t.category !== "aspect-ratios");
  const zeroHtml = `<h4>Declared tokens not observed in the resting ledger (${zero.length})</h4><p class="lede">Not proof they are dead: hover, focus, open popups, menus, dialogs and other panes are not in the resting ledger. Candidates for the CSS audit.</p><div class="chips">${zero.map((t) => `<span class="chip"><a href="#tok-${t.css.slice(5)}">${t.css.slice(5)}</a></span>`).join("")}</div>`;
  const sec = (id, title, lede, body) => `<section id="${id}"><h2>${title}</h2>${lede ? `<p class="lede">${lede}</p>` : ""}${body}</section>`;
  root.innerHTML = [
    sec("f-color", "Color", "Semantic (role) and primitive (raw) colours, light and dark side by side. Values are what the browser resolved from the running app, not what tokens.ts says.", colorHtml + (orphans.length ? `<h4>Other</h4>${table(orphans, pvColor)}` : "")),
    sec("f-type", "Typography", "", typeHtml),
    sec("f-space", "Spacing, gutters and sizes", "", spaceHtml),
    sec("f-radii", "Radii", "", radiiHtml),
    sec("f-borders", "Borders and hairlines", "", bordersHtml),
    sec("f-shadows", "Shadows", "", shadowsHtml),
    sec("f-materials", "Materials", "", matHtml),
    sec("f-motion", "Motion", "", motionHtml),
    sec("f-z", "Z-index", "", zHtml),
    sec("f-opacity", "Opacity and disabled", "", opacityHtml),
    sec("f-focus", "Focus ring", "", focusHtml),
    sec("f-untokenized", "Audit: untokenized values", "", untHtml + zeroHtml),
  ].join("");
  root.querySelectorAll(".mplay").forEach((el) => el.addEventListener("click", () => { const i = el.firstElementChild; const d = el.dataset.d; i.style.transition = "none"; i.style.left = "2px"; requestAnimationFrame(() => requestAnimationFrame(() => { i.style.transition = `left ${d} ease-out`; i.style.left = `calc(100% - 18px)`; })); }));
  hydrateIcons(root);
}
