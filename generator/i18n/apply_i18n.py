#!/usr/bin/env python3
"""Adds the extra UI languages (ur, tr, it) to the built site in OUT/assets.
- writes assets/i18n-<lang>-<hash>.json from generator/i18n/dict/<lang>.json and assets/i18n-<hash>.js (runtime)
- patches the chrome chunk (store wrapper, <html lang/dir>, language select) and the profile language button.
Safe to re-run: when the chunks are already patched only the runtime/dictionary files and the import are refreshed."""
import os, re, sys, json, hashlib
X = os.path.dirname(os.path.abspath(__file__))
OUT = sys.argv[1] if len(sys.argv) > 1 else os.path.abspath(X + "/../..")
A = OUT + "/assets"
LANGS = ["ur", "tr", "it"]
def rd(p): return open(p, encoding="utf8").read()
def wr(p, s): open(p, "w", encoding="utf8").write(s)
def h8(s): return hashlib.sha256(s.encode()).hexdigest()[:8]
def find(prefix):
    m = [f for f in os.listdir(A) if f.startswith(prefix) and f.endswith(".js")]
    assert len(m) == 1, (prefix, m); return m[0]
def rep(s, a, b):
    assert s.count(a) == 1, ("pattern count %d: %s" % (s.count(a), a[:100])); return s.replace(a, b)

# old generated files
for f in os.listdir(A):
    if re.match(r"i18n-([a-z]{2}-)?[0-9a-f]{8}\.js(on)?$", f): os.remove(A + "/" + f)
dicts = {}
for l in LANGS:
    d = json.load(open(X + "/dict/%s.json" % l, encoding="utf8"))
    s = json.dumps(d, ensure_ascii=False, separators=(",", ":"), sort_keys=True)
    name = "i18n-%s-%s.json" % (l, h8(s)); wr(A + "/" + name, s); dicts[l] = name
rt = rd(X + "/runtime.src.js").replace("__DICTS__", json.dumps(dicts))
RT = "i18n-%s.js" % h8(rt); wr(A + "/" + RT, rt)

ch = find("chrome-"); s = rd(A + "/" + ch)
if "$I18N" in s:
    s = re.sub(r'import\*as \$I18N from"\./i18n-[0-9a-f]{8}\.js";', 'import*as $I18N from"./%s";' % RT, s, count=1)
else:
    s = 'import*as $I18N from"./%s";' % RT + s
    s = rep(s, "$=da()(ma(", "$r=da()(ma(")
    s = rep(s, "migrate:(e,t)=>t<2?{...e,locale:`ar`}:e}));",
        "migrate:(e,t)=>t<2?{...e,locale:`ar`}:e}));var $=$wrapStore($r);$I18N.init($r);"
        # the app sees `en` for ur/tr/it (it renders its English branch; the runtime translates the DOM)
        "function $wrapStore(r){const X=$I18N.EXTRA,c=new WeakMap,m=s=>{if(!s||!X[s.locale])return s;let v=c.get(s);return v||(v={...s,locale:`en`},c.set(s,v)),v},"
        "f=(s,q)=>r(s?e=>s(m(e)):m,q);Object.assign(f,r);f.getState=()=>m(r.getState());f.subscribe=l=>r.subscribe((a,b)=>l(m(a),m(b)));f.raw=r;return f}")
    s = rep(s, "finishOnboarding:t=>e(e=>({...t,", "finishOnboarding:t=>e(e=>({...t,...($I18N.EXTRA[e.locale]&&t.locale===`en`?{locale:e.locale}:{}),")
    s = rep(s, "i.lang=t===`ar`?`ar`:`en`,i.dir=t===`ar`?`rtl`:`ltr`", "i.lang=$r.getState().locale||t,i.dir=$I18N.isRtl(i.lang)?`rtl`:`ltr`")
    m = re.search(r"function us\(\)\{.*?\}function ds\(\)\{", s)
    assert m and m.group(0).count("function us()") == 1
    s = s.replace(m.group(0),
        "function us(){let e=$r(e=>e.locale),t=$r(e=>e.setLocale);return(0,z.jsx)(`select`,{\"data-testid\":`lang-select`,\"data-noi18n\":``,value:e,"
        "onChange:e=>t(e.target.value),\"aria-label\":$I18N.label(e),className:`min-h-11 max-w-28 rounded-full border border-line bg-surface px-2 text-sm text-ink sm:px-3`,"
        "children:$I18N.LANGS.map(([e,t])=>(0,z.jsx)(`option`,{value:e,lang:e,children:t},e))})}function ds(){", 1)
wr(A + "/" + ch, s)

pf = find("profile-"); s = rd(A + "/" + pf)
if "$rl" not in s:
    s = rep(s, "s=n(e=>e.locale),p=n(e=>e.setLocale),", "s=n(e=>e.locale),$rl=n.raw(e=>e.locale),p=n(e=>e.setLocale),")
    s = rep(s, "onClick:()=>p(s===`en`?`ar`:`en`),children:[i.lang,`: `,s===`en`?`English`:`العربية`]",
        "\"data-testid\":`profile-lang`,onClick:()=>{let e=[`ar`,`en`,`ur`,`tr`,`it`];p(e[(e.indexOf($rl)+1)%e.length])},children:[i.lang,`: `,(0,d.jsx)(`span`,{\"data-noi18n\":``,lang:$rl,children:({ar:`العربية`,en:`English`,ur:`اردو`,tr:`Türkçe`,it:`Italiano`})[$rl]||$rl})]")
    s = rep(s, "locale:e.locale,baseline:e.baseline", "locale:n.raw.getState().locale,baseline:e.baseline")
    wr(A + "/" + pf, s)
print("i18n:", RT, dicts)
