// The RENDERED VALUE LEDGER: every distinct computed value of the properties a design system
// cares about, across all visible elements of the live Creator app, per theme and per
// sidebar pane.  Output: ../data/ledger.json   (scope: "app" = whole page, "sidebar" = aside)
import { open } from "./probe.mjs";
import fs from "node:fs";
const PROPS = ["color","backgroundColor","backgroundImage","borderTopColor","borderTopWidth","borderTopStyle","borderRadius","boxShadow","fontFamily","fontSize","fontWeight","lineHeight","letterSpacing","textTransform","opacity","gap","paddingTop","paddingRight","paddingBottom","paddingLeft","height","width","transitionDuration","transitionTimingFunction","zIndex","backdropFilter","outlineColor","cursor"];
const out = {};
for (const theme of ["light", "dark"]) for (const kind of ["none", "presenter", "text", "image"]) {
  const { browser, page } = await open(theme, kind);
  const key = `${theme}/${kind === "none" ? "slide" : kind}`;
  out[key] = await page.evaluate((PROPS) => {
    const led = { app: {}, sidebar: {} };
    const desc = (e) => { const t = e.tagName.toLowerCase(); const a = e.getAttribute("aria-label") || e.getAttribute("data-testid") || e.getAttribute("role") || (e.textContent||"").trim().slice(0,18); return `${t}${a ? "["+a+"]" : ""}`; };
    const sb = document.querySelector('[data-testid="sidebar"]');
    const add = (scope, p, v, e) => { const m = (led[scope][p] ??= {}); const r = (m[v] ??= { n: 0, ex: [] }); r.n++; if (r.ex.length < 3) r.ex.push(desc(e)); };
    for (const e of document.querySelectorAll("#creator_root *")) {
      const r = e.getBoundingClientRect(); if (!r.width || !r.height) continue;
      const cs = getComputedStyle(e); if (cs.visibility === "hidden" || cs.display === "none") continue;
      const inSb = sb && sb.contains(e);
      for (const p of PROPS) { const v = cs[p]; if (v == null || v === "" ) continue; add("app", p, v, e); if (inSb) add("sidebar", p, v, e); }
    }
    return led;
  }, PROPS);
  await browser.close();
  console.log(key, Object.keys(out[key].app.color).length, "colors");
}
fs.writeFileSync(new URL("../data/ledger.json", import.meta.url), JSON.stringify(out));
