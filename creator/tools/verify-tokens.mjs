// Conformance check: loads tokens/tokens.css in headless Chromium and compares every token's resolved value,
// per theme, with the value the live app rendered (data/rendered-vars.json).  Exit 1 on any mismatch.
import { loadPlaywright } from "/Users/dairien/workspaces/mmhmm-tv-creator-sidebar/docs/creator-sidebar/qa/lib/paths.mjs";
import { launchBrowser } from "/Users/dairien/workspaces/mmhmm-tv-creator-sidebar/docs/creator-sidebar/qa/lib/paths.mjs";
import fs from "node:fs";
const idx = JSON.parse(fs.readFileSync(new URL("../data/tokens-index.json", import.meta.url), "utf8"));
const css = fs.readFileSync(new URL("../tokens/tokens.css", import.meta.url), "utf8");
const b = await launchBrowser([]); const page = await b.newPage();
await page.setContent(`<style>${css}</style><body>`);
const bad = [];
for (const theme of ["light", "dark"]) {
  const res = await page.evaluate(({ theme, toks }) => {
    const host = document.createElement("div"); host.setAttribute("data-theme", theme); document.body.appendChild(host);
    const probe = document.createElement("div"); host.appendChild(probe);
    const out = {};
    for (const t of toks) {
      probe.style.cssText = ""; let v;
      if (t.category === "colors") { probe.style.color = `var(${t.css})`; v = getComputedStyle(probe).color; }
      else if (t.category === "shadows") { probe.style.boxShadow = `var(${t.css})`; v = getComputedStyle(probe).boxShadow; }
      else { probe.style.setProperty("--p", `var(${t.css})`); v = getComputedStyle(probe).getPropertyValue("--p").trim(); }
      out[t.css] = v;
    }
    return out;
  }, { theme, toks: idx.tokens.filter((t) => t.rendered).map((t) => ({ css: t.css, category: t.category })) });
  for (const t of idx.tokens) { if (!t.rendered) continue; const got = res[t.css], want = t.rendered[theme];
    const nz = (s) => String(s).replace(/\s+/g, "").replace(/0\.(\d)+/g, (m) => (+m).toFixed(2)).replace(/\.0+px/g, "px").replace(/(\d)\.(\d+)px/g, (_, a, d) => a + "." + d.slice(0, 3) + "px");
    if (nz(got) !== nz(want)) bad.push({ theme, css: t.css, got, want }); }
}
await b.close();
console.log(bad.length ? bad.slice(0, 40) : "all tokens conform", bad.length, "mismatches");
process.exit(bad.length ? 1 : 0);
