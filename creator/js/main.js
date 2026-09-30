import { S, load, hydrateIcons } from "./lib.js";
import { human } from "./human.js";

const KEY = "creator-ds-view";
const root = document.documentElement;
const view = () => root.dataset.view;
let engBuilt = false;

/* Engineering view: exactly the original verbose page, built on first use (it is ~100k px tall) */
async function buildEng() {
  if (engBuilt) return; engBuilt = true;
  const [{ overview }, { audit }, { orgrel }, { simplify }, { foundations }, { sidebar }, { header }, { tray }, { stage }, { aux }] = await Promise.all(
    ["overview", "audit", "orgrel", "simplify", "foundations", "sidebar", "header", "tray", "stage", "aux"].map((m) => import(`./${m}.js`)));
  const main = document.getElementById("main");
  const mk = (id) => { const s = document.createElement("div"); s.id = id; main.appendChild(s); return s; };
  const parts = [["overview", overview], ["audit", audit], ["orgrel", orgrel], ["simplify", simplify], ["foundations", foundations], ["sidebar", sidebar], ["header", header], ["tray", tray], ["stage", stage], ["aux", aux]];
  for (const [id, fn] of parts) { const el = mk("area-" + id); try { await fn(el); } catch (e) { el.innerHTML = `<section><h2>${id}</h2><p class="callout">Render error: ${e.message}</p></section>`; console.error(id, e); } }
  hydrateIcons(document);
  const nav = document.getElementById("nav");
  nav.innerHTML = `<h1>Creator</h1><p>Design system for the Creator app, extracted from the rendered UI.</p>` +
    [...main.querySelectorAll("section[id] > h2, article.pattern > header > h3")].map((h) => { const id = h.closest("article, section").id; const l1 = h.tagName === "H2"; return `<a class="${l1 ? "l1" : "l2"}" href="#${id}">${h.textContent}</a>`; }).join("") +
    `<button class="themebtn" id="themebtn">Toggle docs theme</button>`;
  document.getElementById("themebtn").onclick = toggleTheme;
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}

function toggleTheme() { root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark"; }

async function apply(v, { save = false, url = false } = {}) {
  root.dataset.view = v;
  document.querySelectorAll("[data-set-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setView === v)));
  if (save) { try { localStorage.setItem(KEY, v); } catch {} }
  if (url) { try { const u = new URL(location.href); if (v === "eng") u.searchParams.set("view", "eng"); else u.searchParams.delete("view"); u.hash = ""; history.replaceState(null, "", u); } catch {} }
  document.title = v === "eng" ? "Creator Design System (Engineering)" : "Creator Design System";
  if (v === "eng") await buildEng();
  window.scrollTo(0, 0);
}

try { const m = matchMedia("(prefers-color-scheme: dark)"); if (m.matches) root.dataset.theme = "dark"; } catch {}
document.getElementById("viewtheme").onclick = toggleTheme;
document.querySelectorAll("[data-set-view]").forEach((b) => b.addEventListener("click", () => apply(b.dataset.setView, { save: true, url: true })));
document.addEventListener("click", (e) => { const a = e.target.closest("[data-view-link]"); if (!a) return; e.preventDefault(); apply(a.dataset.viewLink, { save: true, url: true }); });

await load();
const humanRoot = document.getElementById("human");
try { await human(humanRoot); } catch (e) { humanRoot.innerHTML = `<section><h2>Overview</h2><p class="callout">Render error: ${e.message}</p></section>`; console.error("overview", e); }
hydrateIcons(humanRoot);
document.getElementById("hnav").innerHTML = `<h1>Creator</h1>` + [...humanRoot.querySelectorAll("section[id]")].map((s) => { const h = s.querySelector("h1, h2"); return `<a href="#${s.id}">${s.id === "h-start" ? "Overview" : h.textContent.replace(/^Where Creator differs.*/, "Differences")}</a>`; }).join("");
document.querySelectorAll("[data-set-view]").forEach((b) => b.setAttribute("aria-pressed", String(b.dataset.setView === view())));
if (view() === "eng") { document.title = "Creator Design System (Engineering)"; await buildEng(); }
else if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
