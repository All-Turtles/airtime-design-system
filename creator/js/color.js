/* Color parsing and formatting for the color tables. Pure functions, no DOM. */

export function parse(s) {
  if (s == null) return null;
  s = String(s).trim();
  let m = s.match(/^rgba?\(\s*([\d.]+)[,\s]+([\d.]+)[,\s]+([\d.]+)(?:\s*[,/]\s*([\d.%]+))?\s*\)$/);
  if (m) { const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]); return { r: +m[1], g: +m[2], b: +m[3], a }; }
  m = s.match(/^color\(srgb\s+([-\d.e]+)\s+([-\d.e]+)\s+([-\d.e]+)(?:\s*\/\s*([\d.%]+))?\s*\)$/);
  if (m) { const a = m[4] === undefined ? 1 : m[4].endsWith("%") ? parseFloat(m[4]) / 100 : parseFloat(m[4]); return { r: +m[1] * 255, g: +m[2] * 255, b: +m[3] * 255, a }; }
  m = s.match(/^#([0-9a-f]{3,8})$/i);
  if (m) { let h = m[1]; if (h.length <= 4) h = [...h].map((c) => c + c).join(""); const n = (i) => parseInt(h.slice(i, i + 2), 16); return { r: n(0), g: n(2), b: n(4), a: h.length === 8 ? n(6) / 255 : 1 }; }
  if (s === "transparent") return { r: 0, g: 0, b: 0, a: 0 };
  return null;
}

/* "#0069D9", "#000000 50%" */
export function hex(v) {
  const c = typeof v === "string" ? parse(v) : v;
  if (!c) return String(v ?? "");
  const h = "#" + [c.r, c.g, c.b].map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, "0")).join("").toUpperCase();
  return c.a < 0.9995 ? `${h} ${Math.round(c.a * 1000) / 10}%` : h;
}
export const isAlpha = (v) => { const c = parse(v); return !!c && c.a < 0.9995; };
