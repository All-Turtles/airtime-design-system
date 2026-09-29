// Resolves every token in tokens/tokens.css to its browser-computed value, per theme -> data/resolved.json
import { launchBrowser } from "/Users/dairien/workspaces/mmhmm-tv-creator-sidebar/docs/creator-sidebar/qa/lib/paths.mjs";
import fs from "node:fs";
const idx = JSON.parse(fs.readFileSync(new URL("../data/tokens-index.json", import.meta.url), "utf8"));
const css = fs.readFileSync(new URL("../tokens/tokens.css", import.meta.url), "utf8");
const b = await launchBrowser([]); const page = await b.newPage();
await page.setContent(`<style>${css}</style><body>`);
const out = {};
for (const theme of ["light", "dark"]) {
  const res = await page.evaluate(({ theme, toks }) => {
    const host = document.createElement("div"); host.setAttribute("data-theme", theme); document.body.appendChild(host);
    const probe = document.createElement("div"); host.appendChild(probe); const o = {};
    for (const t of toks) { probe.style.cssText = ""; let v;
      if (t.category === "colors") { probe.style.color = `var(${t.css})`; v = getComputedStyle(probe).color; }
      else if (t.category === "shadows") { probe.style.boxShadow = `var(${t.css})`; v = getComputedStyle(probe).boxShadow; }
      else { probe.style.setProperty("--p", `var(${t.css})`); v = getComputedStyle(probe).getPropertyValue("--p").trim(); }
      o[t.css] = v; } return o; }, { theme, toks: idx.tokens.map((t) => ({ css: t.css, category: t.category })) });
  for (const [k, v] of Object.entries(res)) (out[k] ??= {})[theme] = v;
}
await b.close(); fs.writeFileSync(new URL("../data/resolved.json", import.meta.url), JSON.stringify(out, null, 1)); console.log(Object.keys(out).length, "resolved");
