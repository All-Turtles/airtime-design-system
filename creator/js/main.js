import { load } from "./lib.js";
import { human } from "./human.js";

const root = document.documentElement;
const toggleTheme = () => { root.dataset.theme = root.dataset.theme === "dark" ? "light" : "dark"; };
try { if (matchMedia("(prefers-color-scheme: dark)").matches) root.dataset.theme = "dark"; } catch {}
document.getElementById("viewtheme").onclick = toggleTheme;

await load();
const humanRoot = document.getElementById("human");
try { await human(humanRoot); } catch (e) { humanRoot.innerHTML = `<section><h2>Overview</h2><p class="callout">Render error: ${e.message}</p></section>`; console.error("overview", e); }
document.getElementById("hnav").innerHTML = `<h1>Creator</h1>` + [...humanRoot.querySelectorAll("section[id]")].map((s) => { const h = s.querySelector("h1, h2"); return `<a href="#${s.id}">${s.id === "h-start" ? "Overview" : h.textContent.replace(/^Where Creator differs.*/, "Differences")}</a>`; }).join("");
if (location.hash) document.getElementById(location.hash.slice(1))?.scrollIntoView();
