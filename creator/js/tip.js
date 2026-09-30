/* Hover, focus and tap lists for numbers. One tooltip open at a time.
   Markup: <span class="cs-tipwrap"><button class="cs-num" aria-describedby="id">12</button><div class="cs-tip" id="id" role="tooltip" hidden>...</div></span>
   Hover (mouse), keyboard focus and tap (touch) open it; Esc, blur and a tap outside close it; the list scrolls. */
import { esc } from "./lib.js";

let n = 0;
export function tipWrap(label, body, { cls = "", aria } = {}) {
  const id = "cs-tip-" + ++n;
  return `<span class="cs-tipwrap"><button type="button" class="cs-num ${cls}" aria-describedby="${id}"${aria ? ` aria-label="${esc(aria)}"` : ""}>${label}</button><div class="cs-tip" id="${id}" role="tooltip" tabindex="0" hidden>${body}</div></span>`;
}

let open = null, touching = false, timer = 0;
function place(w) {
  const b = w.querySelector(".cs-num"), t = w.querySelector(".cs-tip");
  const a = b.closest(".cs-chip, .cs-cell, .cs-box, .ca-strip-pairs > span") ?? b, ar = a.getBoundingClientRect(), br = b.getBoundingClientRect();
  const r = { left: br.left, top: ar.top, bottom: ar.bottom }, vw = document.documentElement.clientWidth, vh = window.innerHeight, m = 12;
  t.style.maxHeight = "";
  const width = Math.min(t.offsetWidth || 420, vw - 2 * m);
  let left = Math.max(m, Math.min(r.left, vw - width - m));
  const below = vh - r.bottom - m - 6, above = r.top - m - 6, h = t.scrollHeight;
  const up = h > below && above > below;
  const room = Math.max(140, up ? above : below);
  t.style.maxHeight = Math.min(room, h) + "px";
  const used = Math.min(room, h);
  t.style.left = left + "px";
  t.style.top = (up ? Math.max(m, r.top - 6 - used) : r.bottom + 6) + "px";
}
function show(w) {
  clearTimeout(timer);
  if (open && open !== w) hide(open);
  const t = w.querySelector(".cs-tip");
  t.hidden = false; w.classList.add("is-open"); w.querySelector(".cs-num").setAttribute("aria-expanded", "true");
  open = w; place(w);
}
function hide(w) {
  if (!w) return;
  w.querySelector(".cs-tip").hidden = true; w.classList.remove("is-open"); w.querySelector(".cs-num").removeAttribute("aria-expanded");
  if (open === w) open = null;
}
const wrapOf = (e) => e.target.closest?.(".cs-tipwrap");

export function initTips() {
  if (initTips.done) return; initTips.done = true;
  const d = document;
  d.addEventListener("pointerdown", (e) => {
    touching = e.pointerType !== "mouse";
    const w = wrapOf(e);
    if (open && open !== w) hide(open);
  }, true);
  d.addEventListener("pointerover", (e) => { if (e.pointerType !== "mouse") return; const w = wrapOf(e); if (w) show(w); });
  d.addEventListener("pointerout", (e) => {
    if (e.pointerType !== "mouse") return;
    const w = wrapOf(e); if (!w || w.contains(e.relatedTarget)) return;
    timer = setTimeout(() => { if (!w.matches(":focus-within") || touching) hide(w); }, 160);
  });
  d.addEventListener("focusin", (e) => { const w = wrapOf(e); if (w && !touching && e.target.classList.contains("cs-num")) show(w); });
  d.addEventListener("focusout", (e) => { const w = wrapOf(e); if (w && !w.contains(e.relatedTarget)) hide(w); });
  d.addEventListener("click", (e) => {
    const b = e.target.closest?.(".cs-num"); if (!b) return;
    const w = b.closest(".cs-tipwrap");
    if (touching) { if (w === open) hide(w); else show(w); touching = false; } else show(w);
  });
  d.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) { const w = open, b = w.querySelector(".cs-num"); touching = true; hide(w); b.focus({ preventScroll: true }); setTimeout(() => (touching = false), 0); e.preventDefault(); } });
  const re = () => open && place(open);
  addEventListener("resize", re);
  addEventListener("scroll", (e) => { if (open && !open.contains(e.target)) re(); }, true);
}
