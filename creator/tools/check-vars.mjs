// Fails when any css/*.css file uses a var(--cr-*) that tokens.css does not define.
import fs from "node:fs";
const def = new Set([...fs.readFileSync(new URL("../tokens/tokens.css", import.meta.url), "utf8").matchAll(/^\s*(--cr-[\w-]+):/gm)].map((m) => m[1]));
let bad = 0;
for (const f of fs.readdirSync(new URL("../css/", import.meta.url))) {
  const css = fs.readFileSync(new URL("../css/" + f, import.meta.url), "utf8");
  for (const m of new Set([...css.matchAll(/var\((--cr-[\w-]+)/g)].map((x) => x[1]))) if (!def.has(m)) { console.log(f, "undefined", m); bad++; }
}
console.log(bad ? bad + " undefined vars" : "all css vars defined"); process.exit(bad ? 1 : 0);
