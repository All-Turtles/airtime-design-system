// Dumps every --chakra-* custom property the rendered Creator app defines, per theme,
// with raw value and (for colors/shadows) the browser-resolved value.  Output: ../data/rendered-vars.json
import { open } from "./probe.mjs";
import fs from "node:fs";
const out = {};
for (const theme of ["light", "dark"]) {
  const { browser, page } = await open(theme, "none");
  out[theme] = await page.evaluate(() => {
    const names = new Set();
    const walk = (rules) => { for (const r of rules) { if (r.cssRules) walk(r.cssRules); if (r.style) for (const n of r.style) if (n.startsWith("--chakra-") ) names.add(n); } };
    for (const sh of document.styleSheets) { try { walk(sh.cssRules); } catch {} }
    const root = document.documentElement, cs = getComputedStyle(root);
    const probe = document.createElement("div"); probe.style.cssText = "position:fixed;left:-99px;top:0;width:1px;height:1px"; document.body.appendChild(probe);
    const res = {};
    for (const n of [...names].sort()) {
      const raw = cs.getPropertyValue(n).trim();
      let resolved = raw;
      // fully resolve var() chains via the browser
      probe.style.cssText = "position:fixed;left:-99px;top:0;width:1px;height:1px";
      if (/^chakra-(colors)/.test(n.slice(2))) { probe.style.color = ""; probe.style.color = `var(${n})`; resolved = getComputedStyle(probe).color; }
      else if (/^chakra-(shadows)/.test(n.slice(2))) { probe.style.boxShadow = `var(${n})`; resolved = getComputedStyle(probe).boxShadow; }
      else if (/var\(/.test(raw)) { probe.style.setProperty("--x", `var(${n})`); resolved = getComputedStyle(probe).getPropertyValue("--x").trim(); }
      res[n] = { raw, resolved };
    }
    return res;
  });
  await browser.close();
}
fs.writeFileSync(new URL("../data/rendered-vars.json", import.meta.url), JSON.stringify(out, null, 1));
console.log(Object.keys(out.light).length, Object.keys(out.dark).length);
