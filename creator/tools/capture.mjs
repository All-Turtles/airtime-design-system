// Captures computed styles of named live elements (any theme/pane) for authoring; usage: node capture.mjs <pane> <theme> '<json list of {n,css|text|label|tag,role,nth,kids}>'
import { open } from "./probe.mjs";
const [pane = "none", theme = "light", spec = "[]"] = process.argv.slice(2);
const P = ["width","height","paddingTop","paddingRight","paddingBottom","paddingLeft","marginTop","marginBottom","borderTopLeftRadius","gap","display","alignItems","justifyContent","flexDirection","fontSize","fontWeight","lineHeight","letterSpacing","textTransform","color","backgroundColor","backgroundImage","borderTopWidth","borderTopColor","boxShadow","opacity","backdropFilter","transitionProperty","transitionDuration","transitionTimingFunction","zIndex","cursor","position","overflow"];
const { browser, page } = await open(theme, pane);
const res = await page.evaluate(({ list, P }) => {
  const out = {};
  for (const s of list) {
    let c = [...document.querySelectorAll(s.css ?? "*")].filter((e) => (!s.tag || e.tagName.toLowerCase() === s.tag) && (!s.role || e.getAttribute("role") === s.role) && (!s.label || e.getAttribute("aria-label") === s.label) && (!s.text || (e.textContent || "").trim().startsWith(s.text)) && e.getBoundingClientRect().width > 0);
    const e = c[s.nth ?? 0]; if (!e) { out[s.n] = "NOT FOUND"; continue; }
    const one = (el) => { const cs = getComputedStyle(el), r = el.getBoundingClientRect(), o = { tag: el.tagName.toLowerCase(), cls: (el.getAttribute("class") || "").split(" ").filter((x) => !x.startsWith("css-")).join(" "), box: `${Math.round(r.x)},${Math.round(r.y)} ${+r.width.toFixed(1)}x${+r.height.toFixed(1)}` }; for (const p of P) { const v = cs[p]; if (["normal", "none", "auto", "0px", "rgba(0, 0, 0, 0)", "0", "visible", "static", "flex-start", "row", "0s", "all", "ease", "block", "start"].includes(v)) continue; o[p] = v; } return o; };
    out[s.n] = { self: one(e), kids: s.kids ? [...e.children].slice(0, 8).map(one) : undefined };
  }
  return out;
}, { list: JSON.parse(spec), P });
const fmt = (o) => `${o.tag}${o.cls ? "." + o.cls.replace(/ /g, ".") : ""} [${o.box}] ` + Object.entries(o).filter(([k]) => !["tag", "cls", "box"].includes(k)).map(([k, v]) => `${k}=${v}`).join("; ");
for (const [n, v] of Object.entries(res)) { if (typeof v === "string") { console.log(n, v); continue; } console.log("## " + n + "\n  " + fmt(v.self)); (v.kids ?? []).forEach((k, i) => console.log(`  - kid${i}: ` + fmt(k))); }
await browser.close();
