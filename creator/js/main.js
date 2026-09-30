import { load } from "./lib.js";
import { human } from "./human.js";
import { eng } from "./eng.js";

const root = document.documentElement;
const toggleTheme = () => { root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark"; };
try { if (matchMedia("(prefers-color-scheme: dark)").matches) root.dataset.theme = "dark"; } catch {}
document.getElementById("viewtheme").onclick = toggleTheme;

const NAV_GROUPS = [["start", "Start"], ["foundations", "Foundations"], ["atoms", "Atoms"], ["patterns", "Patterns"], ["areas", "Areas"], ["more", "More"], ["eng", "Engineering"]];
const LABEL = (s) => (s.id === "e-about" ? "About" : s.id === "h-start" ? "Overview" : s.id === "h-deviations" ? "Differences" : s.id === "h-tokens" ? "Token counts" : s.querySelector("h1, h2").textContent.replace(/ \d+$/, ""));
function buildNav(main) {
  const by = {};
  [...main.querySelectorAll(":scope > section[id]")].forEach((s) => (by[s.dataset.group] ??= []).push(s));
  document.getElementById("hnav").innerHTML = `<h1>Creator</h1>` + NAV_GROUPS.filter(([g]) => by[g]).map(([g, t]) => (g === "start" ? "" : `<h2>${t}</h2>`) + by[g].map((s) => `<a href="#${s.id}">${LABEL(s)}</a>`).join("")).join("");
}

let engBuilt = false, humanBuilt = false, current = root.dataset.view;
async function show(view, { save = true, push = true } = {}) {
  current = view;
  root.dataset.view = view;
  document.querySelectorAll("[data-set-view]").forEach((b) => b.hasAttribute("aria-pressed") && b.setAttribute("aria-pressed", String(b.dataset.setView === view)));
  if (save) { try { localStorage.setItem("creator-ds-view", view); } catch {} }
  if (push) { const u = new URL(location.href); if (view === "eng") u.searchParams.set("view", "eng"); else u.searchParams.delete("view"); history.replaceState(null, "", u); }
  document.title = view === "eng" ? "Creator Design System: Engineering" : "Creator Design System";
  if (view === "eng" && !engBuilt) { engBuilt = true; try { await eng(document.getElementById("eng")); } catch (e) { console.error("engineering", e); document.getElementById("eng").innerHTML = `<section><h2>Engineering</h2><p class="callout">Render error: ${e.message}</p></section>`; } }
  if (view === "overview" && !humanBuilt) return;
  buildNav(document.getElementById(view === "eng" ? "eng" : "human"));
  if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
}
document.querySelectorAll("[data-set-view]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); show(b.dataset.setView); window.scrollTo(0, 0); }));

await load();
const humanRoot = document.getElementById("human");
try { await human(humanRoot); } catch (e) { humanRoot.innerHTML = `<section><h2>Overview</h2><p class="callout">Render error: ${e.message}</p></section>`; console.error("overview", e); }
humanBuilt = true;
await show(current, { save: false, push: false });
