// do-craft i18n runtime for the extra UI languages (ur, tr, it).
// The app itself only knows `ar` and `en`. For ur/tr/it the store wrapper (see apply_i18n.py) makes the app
// render its English (`en`) branch, and this module translates the rendered DOM text (text nodes + a few
// attributes) through a per-language dictionary keyed by the normalised English/Arabic source text.
// Numbers are abstracted to {0},{1}... in keys so templated strings ("Stage 3 of 30") resolve too.
const DICTS = __DICTS__; // {ur:"i18n-ur-xxxx.json",...}
export const EXTRA = { ur: 1, tr: 1, it: 1 };
export const LANGS = [["ar", "العربية"], ["en", "English"], ["ur", "اردو"], ["tr", "Türkçe"], ["it", "Italiano"]];
const LABEL = { ar: "اللغة", en: "Language", ur: "زبان", tr: "Dil", it: "Lingua" };
export const label = (l) => LABEL[l] || LABEL.en;
export const isRtl = (l) => l === "ar" || l === "ur";
const ATTRS = ["placeholder", "aria-label", "title", "alt"];
const SKIP = { SCRIPT: 1, STYLE: 1, NOSCRIPT: 1, TEXTAREA: 1, CODE: 1, SVG: 0 };
const NUM = /\d+(?:[.,:]\d+)*/g;
const LETTER = /[A-Za-z\u0600-\u06FF]/;
const B = (typeof window !== "undefined" && window.__DOCRAFT_BASE__) || "";

let cur = null, dict = null, obs = null, loading = {};
const tOrig = new WeakMap(); // text node -> [src, out]
const aOrig = new WeakMap(); // element -> {attr: [src, out]}
const cache = new Map();

function norm(s) { return s.replace(/\s+/g, " ").trim(); }
function lookup(s) {
  const n = norm(s);
  if (!n || !LETTER.test(n)) return null;
  if (cache.has(n)) return cache.get(n);
  let r = look1(n);
  if (r == null) {
    // composed text: translate sentence by sentence when every piece is known
    const parts = n.split(/(?<=[.!?؟۔])\s+/);
    if (parts.length > 1) {
      const t = parts.map(look1);
      if (t.every((x) => x != null)) r = t.join(" ");
    }
  }
  if (r == null) {
    // "Label: value" / "A · B" pieces
    const m = n.match(/^(.+?)(\s*[:·|—–]\s*)(.+)$/);
    if (m) { const a = look1(m[1]) ?? (LETTER.test(m[1]) ? null : m[1]), b = look1(m[3]) ?? (LETTER.test(m[3]) ? null : m[3]); if (a != null && b != null) r = a + m[2] + b; }
  }
  cache.set(n, r);
  return r;
}
function look1(n) {
  const d = dict; if (!d) return null;
  if (Object.prototype.hasOwnProperty.call(d, n)) return d[n];
  const nums = [];
  const k = n.replace(NUM, (m) => "{" + (nums.push(m) - 1) + "}");
  if (nums.length && Object.prototype.hasOwnProperty.call(d, k)) return d[k].replace(/\{(\d+)\}/g, (m, i) => nums[+i] ?? m);
  return null;
}
function skipEl(el) {
  for (let e = el; e && e.nodeType === 1; e = e.parentNode) {
    if (SKIP[e.nodeName] || e.isContentEditable || (e.hasAttribute && e.hasAttribute("data-noi18n"))) return true;
  }
  return false;
}
function doText(node) {
  const v = node.nodeValue; const rec = tOrig.get(node);
  if (rec && rec[1] === v) return; // already ours
  const src = v;
  const t = lookup(src);
  if (t == null) { if (rec) tOrig.delete(node); return; }
  const lead = src.match(/^\s*/)[0], trail = src.match(/\s*$/)[0];
  const out = lead + t + trail;
  tOrig.set(node, [src, out]);
  if (out !== v) node.nodeValue = out;
}
function doAttrs(el) {
  let rec = aOrig.get(el);
  for (const a of ATTRS) {
    if (!el.hasAttribute(a)) continue;
    const v = el.getAttribute(a); const r = rec && rec[a];
    if (r && r[1] === v) continue;
    const t = lookup(v); if (t == null) continue;
    if (!rec) aOrig.set(el, (rec = {}));
    rec[a] = [v, t]; if (t !== v) el.setAttribute(a, t);
  }
}
function walk(root) {
  if (!root) return;
  if (root.nodeType === 3) { if (!skipEl(root.parentNode)) doText(root); return; }
  if (root.nodeType !== 1 && root.nodeType !== 9 && root.nodeType !== 11) return;
  if (root.nodeType === 1 && skipEl(root)) return;
  if (root.nodeType === 1) doAttrs(root);
  const tw = document.createTreeWalker(root, 5, { acceptNode: (n) => n.nodeType === 1 ? (SKIP[n.nodeName] || n.hasAttribute("data-noi18n") ? 2 : 1) : 1 });
  let n; while ((n = tw.nextNode())) { if (n.nodeType === 3) doText(n); else doAttrs(n); }
}
function restore(root) {
  const tw = document.createTreeWalker(root, 5);
  let n; while ((n = tw.nextNode())) {
    if (n.nodeType === 3) { const r = tOrig.get(n); if (r) { if (n.nodeValue === r[1]) n.nodeValue = r[0]; tOrig.delete(n); } }
    else { const r = aOrig.get(n); if (r) { for (const a in r) if (n.getAttribute(a) === r[a][1]) n.setAttribute(a, r[a][0]); aOrig.delete(n); } }
  }
}
function start() {
  if (obs) return;
  obs = new MutationObserver((ms) => {
    if (!dict) return;
    for (const m of ms) {
      if (m.type === "characterData") { if (!skipEl(m.target.parentNode)) doText(m.target); }
      else if (m.type === "attributes") { if (!skipEl(m.target)) doAttrs(m.target); }
      else for (const n of m.addedNodes) walk(n);
    }
  });
  obs.observe(document.documentElement, { subtree: true, childList: true, characterData: true, attributes: true, attributeFilter: ATTRS });
}
function stop() { if (obs) { obs.disconnect(); obs = null; } }
function setDoc(l) {
  const h = document.documentElement;
  h.lang = l; h.dir = isRtl(l) ? "rtl" : "ltr";
}
function load(l) {
  if (!loading[l]) loading[l] = fetch(B + "/assets/" + DICTS[l]).then((r) => { if (!r.ok) throw new Error("i18n " + r.status); return r.json(); });
  return loading[l];
}
function unhide() { document.documentElement.classList.remove("i18n-wait"); }
function switchTo(l) {
  if (l === cur) { setDoc(l); return; }
  const prev = cur; cur = l; setDoc(l);
  if (!EXTRA[l]) { stop(); dict = null; cache.clear(); if (prev && EXTRA[prev]) restore(document.documentElement); unhide(); return; }
  load(l).then((d) => {
    if (cur !== l) return;
    if (dict) restore(document.documentElement);
    dict = d; cache.clear(); start(); walk(document.documentElement); setDoc(l); unhide();
  }).catch((e) => { console.warn(String(e)); unhide(); });
}

// Before React mounts: hide the page briefly while the dictionary loads, and preload it.
(function early() {
  try {
    const st = document.createElement("style");
    st.textContent = "html.i18n-wait body{visibility:hidden}" +
      "html[lang=ur] body,html[lang=ur] .font-display,html[lang=ur] .font-sans{font-family:'Noto Nastaliq Urdu','Jameel Noori Nastaleeq','Noto Sans Arabic','Segoe UI',Tahoma,system-ui,sans-serif}" +
      "html[lang=ur] body{line-height:1.75}";
    document.head.appendChild(st);
    const l = JSON.parse(localStorage.getItem("azam-store") || "{}")?.state?.locale;
    if (EXTRA[l]) {
      document.documentElement.classList.add("i18n-wait"); setDoc(l); load(l).catch(() => {});
      setTimeout(unhide, 4000);
    }
  } catch (e) {}
})();

// Called by the chrome chunk with the raw zustand store.
export function init(store) {
  const sync = () => { const s = store.getState(); if (store.persist && !store.persist.hasHydrated()) return; switchTo(s.locale || "ar"); };
  store.subscribe(sync);
  if (store.persist) { store.persist.onFinishHydration(sync); if (store.persist.hasHydrated()) sync(); }
  else sync();
}
export function getLocale() { return cur; }
// for tests / debugging
if (typeof window !== "undefined") window.__i18n = { lookup: (s) => lookup(s), get locale() { return cur; }, get ready() { return !!dict || !EXTRA[cur]; } };
