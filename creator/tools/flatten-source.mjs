// Bundles apps/airtime-creator/src/ui/tokens.ts (read-only) with esbuild and flattens it into
// { varName, group, path, value, source } records: the DECLARED side of the extraction
// (extract-vars.mjs is the RENDERED side).  Output: ../data/declared.json
import { execFileSync } from "node:child_process";
import fs from "node:fs"; import path from "node:path";
const APP = "/Users/dairien/workspaces/mmhmm-tv-creator-sidebar/apps/airtime-creator";
const SRC = `${APP}/src/ui/tokens.ts`;
const tmp = path.join(path.dirname(new URL(import.meta.url).pathname), ".tokens.bundle.mjs");
execFileSync(`${APP}/node_modules/.bin/esbuild`, [SRC, "--bundle", "--format=esm", "--platform=node", `--outfile=${tmp}`, "--log-level=error"]);
const mod = await import(tmp); fs.unlinkSync(tmp);
const kebab = (s) => s.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase();
const recs = [];
const kinds = { fonts: "fonts", fontSizes: "font-sizes", lineHeights: "line-heights", letterSpacings: "letter-spacings", radii: "radii", sizes: "sizes", spacing: "spacing", aspectRatios: "aspect-ratios", zIndex: "z-index", blurs: "blurs", borderWidths: "border-widths", durations: "durations", easings: "easings", colors: "colors", semanticColors: "colors", semanticShadows: "shadows", semanticGradients: "gradients" };
const walk = (o, group, p, exp) => {
  if (o && typeof o === "object" && "value" in o) {
    const name = ["--chakra", group, ...p.map(kebab)].filter((x) => x !== "default").join("-");
    recs.push({ var: name, group, path: p.join("."), value: o.value, export: exp, semantic: exp.startsWith("semantic") });
  } else if (o && typeof o === "object") for (const [k, v] of Object.entries(o)) walk(v, group, [...p, k], exp);
};
for (const [exp, group] of Object.entries(kinds)) if (mod[exp]) walk(mod[exp], group, [], exp);
const ts = mod.textStyles ? Object.entries(mod.textStyles).map(([k, v]) => ({ name: k, value: v.value })) : [];
fs.writeFileSync(new URL("../data/declared.json", import.meta.url), JSON.stringify({ tokens: recs, textStyles: ts }, null, 1));
console.log(recs.length, "declared tokens;", ts.length, "text styles");
