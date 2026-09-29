import { S, load, hydrateIcons } from "./lib.js";
import { overview } from "./overview.js";
import { audit } from "./audit.js";
import { orgrel } from "./orgrel.js";
import { simplify } from "./simplify.js";
import { foundations } from "./foundations.js";
import { sidebar } from "./sidebar.js";
import { header } from "./header.js";
import { tray } from "./tray.js";
import { stage } from "./stage.js";
import { aux } from "./aux.js";

await load();
const main = document.getElementById("main");
const mk = (id) => { const s = document.createElement("div"); s.id = id; main.appendChild(s); return s; };
const parts = [["overview", overview], ["audit", audit], ["orgrel", orgrel], ["simplify", simplify], ["foundations", foundations], ["sidebar", sidebar], ["header", header], ["tray", tray], ["stage", stage], ["aux", aux]];
for (const [id, fn] of parts) { const el = mk("area-" + id); try { await fn(el); } catch (e) { el.innerHTML = `<section><h2>${id}</h2><p class="callout">Render error: ${e.message}</p></section>`; console.error(id, e); } }
hydrateIcons(document);
// nav from headings
const nav = document.getElementById("nav");
nav.innerHTML = `<h1>Creator</h1><p>Design system for the Creator app (localhost:3000/creator), extracted from the rendered UI.</p>` +
  [...main.querySelectorAll("section[id] > h2, article.pattern > header > h3")].map((h) => { const id = h.closest("article, section").id; const l1 = h.tagName === "H2"; return `<a class="${l1 ? "l1" : "l2"}" href="#${id}">${h.textContent}</a>`; }).join("") +
  `<button class="themebtn" id="themebtn">Toggle docs theme</button>`;
document.getElementById("themebtn").onclick = () => { const r = document.documentElement; r.dataset.theme = r.dataset.theme === "dark" ? "light" : "dark"; };
try { const m = matchMedia("(prefers-color-scheme: dark)"); if (m.matches) document.documentElement.dataset.theme = "dark"; } catch {}
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
