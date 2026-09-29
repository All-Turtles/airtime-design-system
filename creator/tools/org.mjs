// Parses the org system (airtime-design-system/generated/tokens.css + tokens/*.json) into a
// { root, dark, light } map of custom properties, for the "relationship to org system" pass.
import fs from "node:fs"; import path from "node:path";
const ORG = path.resolve(new URL("../..", import.meta.url).pathname);
export function loadOrg() {
  const css = fs.readFileSync(path.join(ORG, "generated/tokens.css"), "utf8");
  const blocks = { root: /:root\s*\{([^}]*)\}/, dark: /\n\.dark\s*\{([^}]*)\}/, light: /\n\.light\s*\{([^}]*)\}/ };
  const out = {};
  for (const [k, re] of Object.entries(blocks)) { out[k] = {}; const m = css.match(re); if (!m) continue; for (const l of m[1].matchAll(/(--[\w-]+):\s*([^;]+);/g)) out[k][l[1]] = l[2].trim(); }
  return out;
}
