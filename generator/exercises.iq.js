// ---- «تمارين زيادة الذكاء»: 20 stages x 10 exercises, generated + self-verified ----
const LRI = "\u2066", PDI = "\u2069";
const ltr = (s) => LRI + s + PDI;
function evalJs(js) { return Function('"use strict";return (' + js + ")")(); }
function dispExpr(js) {
  let s = js.replace(/\(-(\d+)\)/g, "(\u2212$1)");
  s = s.replace(/\*\*2/g, "\u00B2").replace(/\*\*3/g, "\u00B3").replace(/\*\*(\d+)/g, "^$1");
  s = s.replace(/\+/g, " + ").replace(/-/g, " \u2212 ").replace(/\*/g, " \u00D7 ").replace(/\//g, " \u00F7 ").replace(/%/g, " mod ");
  return s.replace(/\s+/g, " ").replace(/\( /g, "(").replace(/ \)/g, ")").trim();
}
const gcd = (a, b) => (b ? gcd(b, a % b) : a);
const lcm = (a, b) => (a / gcd(a, b)) * b;
const isPrime = (n) => { if (n < 2) return false; for (let i = 2; i * i <= n; i++) if (n % i === 0) return false; return true; };
const isSquare = (n) => n >= 0 && Number.isInteger(Math.sqrt(n));
const isCube = (n) => Number.isInteger(Math.round(Math.cbrt(n))) && Math.round(Math.cbrt(n)) ** 3 === n;
const isTri = (n) => { const k = Math.floor((Math.sqrt(8 * n + 1) - 1) / 2); return (k * (k + 1)) / 2 === n && n > 0; };
const isPow2 = (n) => n > 0 && (n & (n - 1)) === 0;
const FIBS = [1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377];
const isFib = (n) => FIBS.includes(n);
const isPal = (n) => { const s = String(n); return s.length > 1 && s === [...s].reverse().join(""); };
const digSum = (n) => String(n).split("").reduce((a, c) => a + +c, 0);
const isAsc = (n) => { const d = String(n).split(""); return d.length > 1 && d.every((c, i) => i === 0 || c > d[i - 1]); };
const semiprime = (n) => { for (let i = 2; i * i <= n; i++) if (n % i === 0) return isPrime(i) && isPrime(n / i); return false; };

// ---- arithmetic generators (js expression is the source of truth; value is computed) ----
const ARITH = [
  { min: 1, f: (L, r) => `${ri(r, 2, 8 + 3 * L)}+${ri(r, 2, 8 + 3 * L)}` },
  { min: 1, f: (L, r) => { const a = ri(r, 6, 10 + 4 * L); return `${a}-${ri(r, 1, a - 1)}`; } },
  { min: 2, f: (L, r) => `${ri(r, 2, 4 + L)}*${ri(r, 2, 9)}` },
  { min: 2, f: (L, r) => { const b = ri(r, 2, 9); return `${b * ri(r, 2, 6 + L)}/${b}`; } },
  { min: 3, f: (L, r) => `${ri(r, 100, 60 + 80 * Math.min(L, 9))}+${ri(r, 100, 60 + 80 * Math.min(L, 9))}` },
  { min: 3, f: (L, r) => { const a = ri(r, 300, 400 + 60 * Math.min(L, 10)); return `${a}-${ri(r, 100, a - 50)}`; } },
  { min: 4, f: (L, r) => `${ri(r, 11, 9 + 8 * Math.min(L, 9))}*${ri(r, 3, 9)}` },
  { min: 5, f: (L, r) => `${ri(r, 3, 30)}+${ri(r, 2, 9)}*${ri(r, 2, 9 + L)}` },
  { min: 5, f: (L, r) => `${ri(r, 40, 90 + 4 * L)}-${ri(r, 2, 9)}*${ri(r, 2, 8)}` },
  { min: 6, f: (L, r) => `(${ri(r, 3, 20 + L)}+${ri(r, 3, 20 + L)})*${ri(r, 2, 9)}` },
  { min: 6, f: (L, r) => `${ri(r, 11, 19)}*${ri(r, 11, 12 + L)}` },
  { min: 7, f: (L, r) => `${ri(r, 6, 11 + L)}**2` },
  { min: 7, f: (L, r) => `${ri(r, 3, 12)}*${ri(r, 3, 12)}-${ri(r, 2, 9)}*${ri(r, 2, 9)}` },
  { min: 8, f: (L, r) => { const b = ri(r, 3, 9); return `${b * ri(r, 11, 60 + L)}/${b}`; } },
  { min: 8, f: (L, r) => `${pick(r, [10, 20, 25, 50, 75, 5, 15, 30, 40, 60])}*${20 * ri(r, 2, 10 + L)}/100` , text: true },
  { min: 9, f: (L, r) => `(${ri(r, 12, 25 + L)}-${ri(r, 3, 10)})*(${ri(r, 3, 12)}+${ri(r, 2, 9)})` },
  { min: 9, f: (L, r) => `${ri(r, 21, 39)}*${ri(r, 12, 29 + L)}` },
  { min: 10, f: (L, r) => `${ri(r, 100, 199 + 10 * L)}*${ri(r, 3, 9)}` },
  { min: 10, f: (L, r) => `${ri(r, 11, 12 + L)}**2` },
  { min: 11, f: (L, r) => `${ri(r, 3, 9 + (L >> 1))}**3` },
  { min: 11, f: (L, r) => `${ri(r, 20, 60)}**2-${ri(r, 10, 19)}**2` },
  { min: 12, f: (L, r) => `(-${ri(r, 3, 15)})*${ri(r, 3, 12)}+${ri(r, 10, 80)}` },
  { min: 12, f: (L, r) => `${ri(r, 2, 6 + (L >> 2))}**${ri(r, 4, 7)}` },
  { min: 13, f: (L, r) => { const b = ri(r, 12, 25); return `${b * ri(r, 12, 90 + L)}/${b}`; } },
  { min: 13, f: (L, r) => `${ri(r, 120, 400)}%${ri(r, 7, 19)}`, mod: true },
  { min: 14, f: (L, r) => `${ri(r, 101, 299)}*${ri(r, 12, 49)}` },
  { min: 14, f: (L, r) => `((${ri(r, 3, 15)}+${ri(r, 3, 15)})*${ri(r, 3, 9)}-${ri(r, 5, 30)})*${ri(r, 2, 4)}` },
  { min: 15, f: (L, r) => `${ri(r, 31, 59)}**2` },
  { min: 15, f: (L, r) => `(-${ri(r, 11, 30)})*(-${ri(r, 3, 15)})-${ri(r, 20, 90)}` },
  { min: 16, f: (L, r) => `${ri(r, 3, 6)}**4-${ri(r, 3, 9)}**3` },
  { min: 17, f: (L, r) => `${ri(r, 301, 899)}*${ri(r, 21, 78)}` },
  { min: 18, f: (L, r) => `(${ri(r, 12, 30)}**2)-(${ri(r, 3, 9)}**3)` },
  { min: 19, f: (L, r) => `${ri(r, 2, 9)}*${ri(r, 2, 9)}*${ri(r, 2, 9)}*${ri(r, 2, 9)}-${ri(r, 100, 900)}` },
  { min: 20, f: (L, r) => `(${ri(r, 41, 79)}**2)-(${ri(r, 21, 39)}**2)+${ri(r, 100, 900)}` },
];
function specialArith(L, r) {
  // text-based exact-answer problems with kind metadata
  const k = pick(r, L >= 13 ? ["gcd", "lcm", "sumto", "sqrt", "digits"] : L >= 8 ? ["sumto", "sqrt", "digits"] : ["sqrt"]);
  if (k === "gcd") { const g = ri(r, 3, 9 + L), a = g * ri(r, 3, 9), b = g * ri(r, 3, 9); if (a === b) return null; return { kind: "gcd", args: [a, b], answer: gcd(a, b), ar: `ما القاسم المشترك الأكبر للعددين ${a} و${b}؟`, en: `What is the greatest common divisor of ${a} and ${b}?`, why: `نحلّل العددين: القاسم المشترك الأكبر هو ${gcd(a, b)}.` }; }
  if (k === "lcm") { const a = ri(r, 4, 12 + (L >> 1)), b = ri(r, 4, 12 + (L >> 1)); if (a === b) return null; return { kind: "lcm", args: [a, b], answer: lcm(a, b), ar: `ما المضاعف المشترك الأصغر للعددين ${a} و${b}؟`, en: `What is the least common multiple of ${a} and ${b}?`, why: `أصغر عدد يقبل القسمة على ${a} و${b} هو ${lcm(a, b)}.` }; }
  if (k === "sumto") { const n = ri(r, 10, 20 + 4 * L); return { kind: "sumto", args: [n], answer: (n * (n + 1)) / 2, ar: `ما مجموع الأعداد الصحيحة من 1 إلى ${n}؟`, en: `What is the sum of the integers from 1 to ${n}?`, why: `القانون n(n+1)÷2 = ${n}×${n + 1}÷2 = ${(n * (n + 1)) / 2}.` }; }
  if (k === "sqrt") { const n = ri(r, 6, 12 + 2 * L); return { kind: "sqrt", args: [n * n], answer: n, ar: `ما الجذر التربيعي للعدد ${n * n}؟`, en: `What is the square root of ${n * n}?`, why: `${n} × ${n} = ${n * n}، إذن الجذر ${n}.` }; }
  const n = ri(r, 1000, 99999); return { kind: "digits", args: [n], answer: digSum(n), ar: `ما مجموع أرقام العدد ${n}؟`, en: `What is the sum of the digits of ${n}?`, why: `نجمع الأرقام: ${String(n).split("").join(" + ")} = ${digSum(n)}.` };
}
function arithQ(L, r, reg) {
  for (let tries = 0; tries < 400; tries++) {
    let q;
    if (L >= 8 && r() < 0.18) { const sp = specialArith(L, r); if (!sp) continue; q = { prompt: T(sp.ar, sp.en), answer: sp.answer, explain: T(sp.why), meta: { kind: sp.kind, args: sp.args, answer: sp.answer } }; }
    else {
      const pool = ARITH.filter((g) => g.min <= L && L - g.min <= 8);
      const g = pick(r, pool.length ? pool : ARITH.filter((x) => x.min <= L));
      const js = g.f(L, r);
      const val = evalJs(js);
      if (!Number.isInteger(val) || Math.abs(val) > 5e6 || (val < 0 && L < 12)) continue;
      if (g.text) { const m = js.match(/^(\d+)\*(\d+)\/100$/); q = { prompt: T(`ما هو ${m[1]}٪ من ${m[2]}؟`, `What is ${m[1]}% of ${m[2]}?`), answer: val, explain: T(`${m[1]}٪ من ${m[2]} = ${m[2]} × ${m[1]} ÷ 100 = ${val}.`), meta: { kind: "expr", expr: js, answer: val } }; }
      else if (g.mod) { const m = js.match(/^(\d+)%(\d+)$/); q = { prompt: T(`ما باقي قسمة ${m[1]} على ${m[2]}؟`, `What is the remainder when ${m[1]} is divided by ${m[2]}?`), answer: val, explain: T(`${m[1]} = ${m[2]} × ${Math.floor(m[1] / m[2])} + ${val}، فالباقي ${val}.`), meta: { kind: "expr", expr: js, answer: val } }; }
      else { const d = dispExpr(js); const shown = ltr(d); q = { prompt: T(`احسب: ${shown}`, `Calculate: ${shown}`), answer: val, explain: T(`${shown} = ${val}`), meta: { kind: "expr", expr: js, answer: val } }; }
    }
    if (reg.has(q.prompt.ar)) continue;
    reg.add(q.prompt.ar); return q;
  }
  throw new Error("arithQ failed L=" + L);
}
function arithMcq(L, r, reg) {
  const q = arithQ(L, r, reg), a = q.answer, cand = new Set();
  const offs = shuf(r, [1, -1, 2, -2, 10, -10, 5, -5, 3, 100, -100, Math.max(1, Math.round(Math.abs(a) * 0.1))]);
  for (const o of offs) { const v = a + o; if (v !== a && (a < 0 || v >= 0)) cand.add(v); if (cand.size >= 3) break; }
  const options = shuf(r, [a, ...cand]);
  return { prompt: q.prompt, options: options.map((v) => T(String(v))), correct: options.indexOf(a), explain: q.explain, meta: q.meta };
}

// ---- word problems (answer = js expression over generated numbers) ----
const MALE = ["أحمد", "علي", "خالد", "عمر", "يوسف", "سامي"];
const NAMES = ["أحمد", "سلمى", "علي", "منى", "خالد", "ليلى", "عمر", "هدى", "يوسف", "رنا", "سامي", "دانة"];
const WORDS = [
  { min: 1, f: (L, r) => { const p = ri(r, 2, 5 + L), n = ri(r, 2, 6); return { ar: `ثمن القلم ${p} ريالات. كم ثمن ${n} أقلام؟`, expr: `${p}*${n}`, why: `${p} × ${n} = ${p * n}.` }; } },
  { min: 1, f: (L, r) => { const a = ri(r, 10, 20 + 3 * L), b = ri(r, 3, 9); return { ar: `مع ${pick(r, MALE)} ${a} ريالًا، أنفق ${b}. كم بقي معه؟`, expr: `${a}-${b}`, why: `${a} − ${b} = ${a - b}.` }; } },
  { min: 2, f: (L, r) => { const p = ri(r, 3, 9 + L), n = ri(r, 2, 6), m = p * n + ri(r, 1, 20); return { ar: `اشترى ${pick(r, MALE)} ${n} دفاتر، سعر الواحد ${p} ريالات، ودفع ${m} ريالًا. كم الباقي؟`, expr: `${m}-${p}*${n}`, why: `الثمن ${p}×${n} = ${p * n}، والباقي ${m} − ${p * n} = ${m - p * n}.` }; } },
  { min: 3, f: (L, r) => { const v = ri(r, 30, 60 + L * 3), t = ri(r, 2, 6); return { ar: `سيارة تسير بسرعة ${v} كم/س لمدة ${t} ساعات. كم المسافة التي تقطعها؟`, expr: `${v}*${t}`, why: `المسافة = السرعة × الزمن = ${v} × ${t} = ${v * t} كم.` }; } },
  { min: 4, f: (L, r) => { const x = ri(r, 3, 8), a = ri(r, 4, 9), b = ri(r, 4, 9); return { ar: `صف فيه ${x} مقاعد في كل صف، و${a} صفوف. وفي قاعة ثانية ${b} صفوف بنفس العدد. كم مجموع المقاعد؟`, expr: `${x}*(${a}+${b})`, why: `الصفوف ${a}+${b} = ${a + b}، والمقاعد ${x}×${a + b} = ${x * (a + b)}.` }; } },
  { min: 4, f: (L, r) => { const w = ri(r, 3, 9 + L), h = ri(r, 3, 9 + L); return { ar: `مستطيل طوله ${w + h} سم وعرضه ${h} سم. ما مساحته؟`, expr: `${w + h}*${h}`, why: `المساحة = الطول × العرض = ${w + h} × ${h} = ${(w + h) * h} سم².` }; } },
  { min: 5, f: (L, r) => { const m = ri(r, 12, 40), a = ri(r, 8, 40), b = ri(r, 8, 40); return { ar: `متوسط ثلاثة أعداد ${m}. إذا كان اثنان منها ${a} و${b}، فما العدد الثالث؟`, expr: `3*${m}-${a}-${b}`, why: `المجموع الكلي 3×${m} = ${3 * m}، فالثالث ${3 * m} − ${a} − ${b} = ${3 * m - a - b}.` }; } },
  { min: 6, f: (L, r) => { const p = 50 * ri(r, 2, 10 + L), d = pick(r, [10, 20, 25, 50]); return { ar: `سعر سلعة ${p} ريالًا وعليها خصم ${d}٪. كم سعرها بعد الخصم؟`, expr: `${p}*(100-${d})/100`, why: `بعد الخصم يبقى ${100 - d}٪: ${p} × ${100 - d} ÷ 100 = ${(p * (100 - d)) / 100}.` }; } },
  { min: 7, f: (L, r) => { const n = ri(r, 2, 6), d = ri(r, 6, 12), m = pick(r, [1, 2, 3, 4, 6, 12]); const total = n * d; if (total % m) return null; return { ar: `${n} عمال ينجزون عملًا في ${d} أيام. كم يومًا يحتاج ${m} عمال بنفس السرعة؟`, expr: `${n}*${d}/${m}`, why: `حجم العمل ${n}×${d} = ${total} يوم-عامل، فنقسم على ${m} = ${total / m}.` }; } },
  { min: 8, f: (L, r) => { const k = ri(r, 2, 4), son = ri(r, 5, 12 + L); return { ar: `عمر الأب ${k} أضعاف عمر ابنه، ومجموع عمريهما ${son * (k + 1)} سنة. كم عمر الابن؟`, expr: `${son * (k + 1)}/${k + 1}`, why: `الأجزاء ${k}+1 = ${k + 1}، فعمر الابن ${son * (k + 1)} ÷ ${k + 1} = ${son}.` }; } },
  { min: 9, f: (L, r) => { const a = ri(r, 30, 60), b = ri(r, 20, 50), t = ri(r, 2, 5); return { ar: `يسير قطاران في اتجاهين متعاكسين بسرعتين ${a} و${b} كم/س. كم المسافة بينهما بعد ${t} ساعات؟`, expr: `(${a}+${b})*${t}`, why: `سرعة الابتعاد ${a}+${b} = ${a + b}، والمسافة ${a + b}×${t} = ${(a + b) * t} كم.` }; } },
  { min: 10, f: (L, r) => { const n = ri(r, 5, 12 + (L >> 1)); return { ar: `في حفل ${n} ${n > 10 ? "شخصًا" : "أشخاص"} يصافح كل شخص كل واحد من الآخرين مرة واحدة. كم عدد المصافحات؟`, expr: `${n}*(${n}-1)/2`, why: `n(n−1)÷2 = ${n}×${n - 1}÷2 = ${(n * (n - 1)) / 2}.` }; } },
  { min: 11, f: (L, r) => { const p = 100 * ri(r, 2, 9), u = pick(r, [10, 20, 25, 50]), v = pick(r, [10, 20]); return { ar: `سعر ${p} ريال زاد ${u}٪ ثم زاد المبلغ الجديد ${v}٪. كم أصبح السعر؟`, expr: `${p}*(100+${u})/100*(100+${v})/100`, why: `بعد الزيادة الأولى ${(p * (100 + u)) / 100}، ثم الثانية: ${(p * (100 + u) * (100 + v)) / 10000}.` }; } },
  { min: 12, f: (L, r) => { const a = ri(r, 4, 9), b = ri(r, 2, 6); const t = ri(r, 3, 8); return { ar: `ينتج مصنع ${a * 10} قطعة في الساعة، ويتوقف ${b} ساعات في اليوم من أصل ${b + 8}. كم قطعة ينتج في ${t} أيام؟`, expr: `${a * 10}*8*${t}`, why: `ساعات العمل 8 يوميًا: ${a * 10}×8×${t} = ${a * 10 * 8 * t}.` }; } },
  { min: 14, f: (L, r) => { const a = ri(r, 12, 30), b = ri(r, 12, 30); return { ar: `عددان مجموعهما ${a + b} وفرقهما ${Math.abs(a - b)}. ما العدد الأكبر؟`, expr: `${Math.max(a, b)}`, why: `الأكبر = (المجموع + الفرق) ÷ 2 = ${(a + b + Math.abs(a - b)) / 2}.`, special: [a + b, Math.abs(a - b)] }; } },
  { min: 15, f: (L, r) => { const x = ri(r, 3, 15), a = ri(r, 2, 9), b = ri(r, 1, 30); return { ar: `إذا كان ${a}×س + ${b} = ${a * x + b}، فما قيمة س؟`, expr: `(${a * x + b}-${b})/${a}`, why: `نطرح ${b} ثم نقسم على ${a}: (${a * x + b} − ${b}) ÷ ${a} = ${x}.` }; } },
  { min: 17, f: (L, r) => { const n = ri(r, 6, 20), d = ri(r, 2, 9), a = ri(r, 2, 20); const last = a + (n - 1) * d; return { ar: `متتالية حسابية حدها الأول ${a} والفرق بين كل حدين ${d}. ما قيمة الحد رقم ${n}؟`, expr: `${a}+(${n}-1)*${d}`, why: `الحد = ${a} + (${n}−1)×${d} = ${last}.` }; } },
];
function wordQ(L, r, reg) {
  for (let tries = 0; tries < 400; tries++) {
    const pool = WORDS.filter((w) => w.min <= L && L - w.min <= 8);
    const w = pick(r, pool.length ? pool : WORDS.filter((x) => x.min <= L));
    const o = w.f(L, r);
    if (!o || !o.expr) continue;
    const val = evalJs(o.expr);
    if (!Number.isInteger(val) || val < 0) continue;
    if (reg.has(o.ar)) continue;
    reg.add(o.ar);
    return { prompt: T(o.ar), answer: val, explain: T(o.why), meta: { kind: "expr", expr: o.expr, answer: val } };
  }
  throw new Error("wordQ failed L=" + L);
}

// ---- sequences (closed form f(n) or recurrence with cycling steps; vars: n, p, pp, i) ----
function evalF(expr, vars) { return Function(...Object.keys(vars), '"use strict";return (' + expr + ")")(...Object.values(vars)); }
const SEQS = [
  { min: 1, f: (r) => { const a = ri(r, 1, 20), d = ri(r, 2, 6); return { formula: `${a}+${d}*n`, why: (s) => `الفرق ثابت ${d}: كل حد = السابق + ${d}.` }; } },
  { min: 2, f: (r) => { const d = ri(r, 2, 7), a = ri(r, 6, 9) * d + 10; return { formula: `${a}-${d}*n`, why: () => `الأعداد تتناقص بمقدار ${d} في كل مرة.` }; } },
  { min: 3, f: (r) => { const a = ri(r, 1, 4), k = pick(r, [2, 3]); return { formula: `${a}*${k}**n`, why: () => `كل حد = السابق × ${k}.` }; } },
  { min: 4, f: (r) => { const o = ri(r, 1, 8); return { formula: `(n+${o})**2`, why: () => `أعداد مربعة متتالية.` }; } },
  { min: 5, f: (r) => { const a = ri(r, 1, 9), d = ri(r, 1, 3), e = ri(r, 1, 2); return { rec: { init: [a], steps: ["p+" + (d) + "+" + e + "*(i-1)"] }, why: () => `الفروق نفسها تزداد بمقدار ${e} في كل مرة.` }; } },
  { min: 6, f: (r) => { const a = ri(r, 1, 4), b = ri(r, 1, 5); return { rec: { init: [a, b], steps: ["p+pp"] }, why: () => `كل حد = مجموع الحدّين السابقين.` }; } },
  { min: 7, f: (r) => { const a = ri(r, 5, 15), x = ri(r, 4, 9), y = ri(r, 1, 3); return { rec: { init: [a], steps: ["p+" + x, "p-" + y] }, why: () => `نضيف ${x} ثم نطرح ${y} بالتناوب.` }; } },
  { min: 8, f: (r) => { const a = ri(r, 1, 5); return { rec: { init: [a], steps: ["p*2+1"] }, why: () => `نضرب في 2 ثم نضيف 1 في كل خطوة.` }; } },
  { min: 9, f: (r) => { const o = ri(r, 0, 3); return { formula: `(n+${o + 1})*(n+${o + 2})/2`, why: () => `أعداد مثلثية: 1، 3، 6، 10 ... (مجموع الأعداد المتتالية).` }; } },
  { min: 10, f: (r) => { const o = ri(r, 1, 4); return { formula: `(n+${o})**3`, why: () => `مكعبات الأعداد المتتالية.` }; } },
  { min: 11, f: (r) => { const a = ri(r, 2, 9), da = ri(r, 2, 5), b = ri(r, 20, 40), db = ri(r, 3, 6); return { inter: [`${a}+${da}*k`, `${b}+${db}*k`], why: () => `متتاليتان متداخلتان: الحدود الفردية تزيد ${da}، والزوجية تزيد ${db}.` }; } },
  { min: 12, f: (r) => { return { primes: ri(r, 0, 4), why: () => `هذه أعداد أولية متتالية.` }; } },
  { min: 13, f: (r) => { const a = ri(r, 2, 4), k = ri(r, 2, 4); return { rec: { init: [a], steps: ["p*3-" + k] }, why: () => `نضرب في 3 ثم نطرح ${k}.` }; } },
  { min: 14, f: (r) => { const c = ri(r, 1, 6); return { formula: `n**2+${c}*n+${c}`, why: () => `الفروق تتزايد بانتظام، وهي متتالية تربيعية.` }; } },
  { min: 15, f: (r) => { const k = ri(r, 3, 6); return { formula: `${k}**(n+1)-1`, why: () => `كل حد = ${k} مرفوع لأس متزايد ناقص 1.` }; } },
  { min: 16, f: (r) => { const a = ri(r, 1, 3), b = ri(r, 1, 3), m = ri(r, 2, 3); return { rec: { init: [a, b], steps: ["p+" + m + "*pp"] }, why: () => `كل حد = السابق + ${m} × الذي قبله.` }; } },
  { min: 17, f: (r) => { const a = ri(r, 1, 5), x = ri(r, 2, 3), y = ri(r, 2, 6); return { rec: { init: [a], steps: ["p*" + x, "p+" + y] }, why: () => `نضرب في ${x} ثم نضيف ${y} بالتناوب.` }; } },
  { min: 18, f: (r) => { const o = ri(r, 1, 5); return { formula: `(n+${o})*(n+${o + 1})`, why: () => `ناتج ضرب عددين متتاليين.` }; } },
  { min: 19, f: (r) => { const a = ri(r, 1, 3); return { rec: { init: [a], steps: ["p*i"] }, why: () => `كل حد = السابق × رقم موضعه.` }; } },
  { min: 20, f: (r) => { const a = ri(r, 1, 6), x = ri(r, 1, 4); return { rec: { init: [a], steps: ["p+" + x, "p+" + (x + 1), "p*2"] }, why: () => `ثلاث عمليات تتكرر: +${x} ثم +${x + 1} ثم ×2.` }; } },
];
const PR = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];
function seqTerms(spec, count) {
  const out = [];
  if (spec.formula) { for (let n = 0; n < count; n++) out.push(evalF(spec.formula, { n })); }
  else if (spec.inter) { for (let n = 0; n < count; n++) out.push(evalF(spec.inter[n % 2], { k: Math.floor(n / 2) })); }
  else if (spec.primes !== undefined) { for (let n = 0; n < count; n++) out.push(PR[spec.primes + n]); }
  else { const rc = spec.rec; const a = rc.init.slice(); const n0 = rc.init.length; for (let i = n0; i < count; i++) { const st = rc.steps[(i - n0) % rc.steps.length]; a.push(evalF(st, { p: a[i - 1], pp: a[i - 2] ?? 0, i })); } return a; }
  return out;
}
function seqQ(L, r, reg) {
  for (let tries = 0; tries < 400; tries++) {
    const pool = SEQS.filter((s) => s.min <= L && L - s.min <= 6);
    const sp = pick(r, pool).f(r);
    const shown = L >= 12 ? 6 : 5;
    const t = seqTerms(sp, shown + 1);
    if (t.some((x) => !Number.isInteger(x) || x < 0 || x > 1e6)) continue;
    if (new Set(t).size < t.length) continue;
    const ans = t[shown], seq = t.slice(0, shown);
    const key = seq.join(",");
    if (reg.has(key)) continue; reg.add(key);
    const last = seq[shown - 1], prev = seq[shown - 2];
    const cands = [ans + 1, ans - 1, ans + 2, ans - 2, last + (last - prev), last * 2, ans + 10, ans - 10, ans + 5, ans * 2 - last]
      .filter((v) => v !== ans && v >= 0);
    const uniq = [...new Set(cands)];
    const wrong = shuf(r, uniq).slice(0, 3);
    if (wrong.length < 3) continue;
    const options = shuf(r, [ans, ...wrong]);
    const sh = ltr(seq.join("، ") + "، ؟");
    const meta = { kind: "seq", seq, answer: ans };
    if (sp.formula) meta.formula = sp.formula; if (sp.inter) meta.inter = sp.inter; if (sp.primes !== undefined) meta.primes = sp.primes; if (sp.rec) meta.rec = sp.rec;
    return { prompt: T(`ما العدد التالي في المتتالية: ${sh}`, `What number comes next? ${ltr(seq.join(", ") + ", ?")}`), options: options.map((v) => T(String(v))), correct: options.indexOf(ans), explain: T(`${sp.why()} العدد التالي هو ${ans}.`), meta };
  }
  throw new Error("seqQ failed");
}

// ---- odd-one-out / properties ----
const PROPS = [
  { min: 1, id: "even", name: "زوجي", f: (n) => n % 2 === 0, odd: "فردي", range: (L) => [1, 20 + 5 * L] },
  { min: 2, id: "mult3", name: "من مضاعفات 3", f: (n) => n % 3 === 0, range: (L) => [3, 40 + 6 * L] },
  { min: 3, id: "square", name: "عدد مربع كامل", f: isSquare, range: (L) => [1, 100 + 10 * L] },
  { min: 4, id: "prime", name: "عدد أولي", f: isPrime, range: (L) => [2, 40 + 5 * L] },
  { min: 5, id: "mult5", name: "من مضاعفات 5", f: (n) => n % 5 === 0, range: (L) => [5, 100 + 5 * L] },
  { min: 6, id: "pal", name: "عدد متماثل (يُقرأ بالاتجاهين)", f: isPal, range: (L) => [11, 999] },
  { min: 7, id: "composite", name: "عدد غير أولي", f: (n) => n > 1 && !isPrime(n), range: (L) => [4, 80 + 5 * L], invert: "prime" },
  { min: 8, id: "ds9", name: "مجموع أرقامه 9", f: (n) => digSum(n) === 9, range: (L) => [9, 999] },
  { min: 9, id: "pow2", name: "قوة للعدد 2", f: isPow2, range: (L) => [1, 1100] },
  { min: 10, id: "tri", name: "عدد مثلثي", f: isTri, range: (L) => [1, 400] },
  { min: 11, id: "cube", name: "مكعب كامل", f: isCube, range: (L) => [1, 1400] },
  { min: 12, id: "fib", name: "من أعداد فيبوناتشي", f: isFib, range: (L) => [1, 400] },
  { min: 13, id: "mult7", name: "من مضاعفات 7", f: (n) => n % 7 === 0, range: (L) => [7, 400] },
  { min: 14, id: "mod4r1", name: "باقي قسمته على 4 يساوي 1", f: (n) => n % 4 === 1, range: (L) => [1, 300] },
  { min: 15, id: "sqm1", name: "يساوي مربعًا ناقص 1", f: (n) => isSquare(n + 1), range: (L) => [3, 400] },
  { min: 16, id: "asc", name: "أرقامه تصاعدية", f: isAsc, range: (L) => [12, 999] },
  { min: 17, id: "mult11", name: "من مضاعفات 11", f: (n) => n % 11 === 0, range: (L) => [11, 999] },
  { min: 18, id: "semi", name: "حاصل ضرب عددين أوليين", f: semiprime, range: (L) => [4, 200] },
  { min: 19, id: "dsprime", name: "مجموع أرقامه عدد أولي", f: (n) => isPrime(digSum(n)), range: (L) => [10, 999] },
  { min: 20, id: "mult18", name: "من مضاعفات 6 و9 معًا", f: (n) => n % 18 === 0, range: (L) => [18, 999] },
];
function oddQ(L, r, reg) {
  for (let tries = 0; tries < 500; tries++) {
    const pool = PROPS.filter((p) => p.min <= L && L - p.min <= 7);
    const pr = pick(r, pool); const [lo, hi] = pr.range(L);
    const yes = [], no = [];
    for (let k = 0; k < 4000 && (yes.length < 3 || no.length < 1); k++) { const n = ri(r, lo, hi); if (pr.f(n)) { if (yes.length < 3 && !yes.includes(n)) yes.push(n); } else if (no.length < 1) no.push(n); }
    if (yes.length < 3 || no.length < 1) continue;
    const nums = shuf(r, [...yes, no[0]]);
    if (pr.id !== "even" && new Set(nums.map((n) => n % 2)).size > 1) continue;
    const key = "odd|" + nums.slice().sort((a, b) => a - b).join(",");
    if (reg.has(key)) continue; reg.add(key);
    const idx = nums.indexOf(no[0]);
    return { prompt: T(`أي عدد مختلف عن البقية؟ ${ltr(nums.join("، "))}`, `Which number is different? ${ltr(nums.join(", "))}`), options: nums.map((v) => T(String(v))), correct: idx, explain: T(`ثلاثة أعداد هي ${pr.name}، والعدد ${no[0]} ليس كذلك.`), meta: { kind: "odd", prop: pr.id, numbers: nums, oddIndex: idx } };
  }
  throw new Error("oddQ failed L=" + L);
}
const ANALOGY = [
  { min: 3, id: "x2", f: (x) => x * 2, name: "الضعف" }, { min: 3, id: "x3", f: (x) => x * 3, name: "ثلاثة أمثاله" },
  { min: 4, id: "sq", f: (x) => x * x, name: "مربعه" }, { min: 5, id: "p5", f: (x) => x + 5, name: "نضيف 5" },
  { min: 6, id: "x2p1", f: (x) => x * 2 + 1, name: "ضعفه زائد 1" }, { min: 8, id: "cu", f: (x) => x ** 3, name: "مكعبه" },
  { min: 9, id: "sqp1", f: (x) => x * x + 1, name: "مربعه زائد 1" }, { min: 11, id: "x4m3", f: (x) => x * 4 - 3, name: "أربعة أمثاله ناقص 3" },
  { min: 13, id: "sqm", f: (x) => x * x - x, name: "مربعه ناقص نفسه" }, { min: 15, id: "x3p2sq", f: (x) => x * x * 2 + 1, name: "ضعف مربعه زائد 1" },
];
function analogyQ(L, r, reg) {
  for (let tries = 0; tries < 300; tries++) {
    const pool = ANALOGY.filter((a) => a.min <= L && L - a.min <= 8); const f = pick(r, pool);
    const a = ri(r, 2, 6 + (L >> 1)), b = ri(r, 2, 9 + (L >> 1)); if (a === b) continue;
    const ans = f.f(b), x = f.f(a);
    if (ANALOGY.some((g) => g !== f && g.f(a) === x && g.f(b) !== ans)) continue; // keep the relation unambiguous
    const key = `an|${a}|${x}|${b}`; if (reg.has(key)) continue; reg.add(key);
    const cands = [...new Set([ans + 1, ans - 1, ans + b, ans - 2, ans + 2, f.f(b + 1)])].filter((v) => v !== ans && v > 0);
    const wrong = shuf(r, cands).slice(0, 3); const options = shuf(r, [ans, ...wrong]);
    return { prompt: T(`أكمل العلاقة: ${ltr(`${a} : ${x} :: ${b} : ؟`)}`, `Complete: ${ltr(`${a} : ${x} :: ${b} : ?`)}`), options: options.map((v) => T(String(v))), correct: options.indexOf(ans), explain: T(`العلاقة: ${f.name}. ${a} ← ${x}، إذن ${b} ← ${ans}.`), meta: { kind: "analogy", fn: f.id, a, b, answer: ans } };
  }
  throw new Error("analogyQ failed");
}

// ---- generated logic ----
const REL = [["أطول", "الأقصر", "الأطول"], ["أكبر سنًا", "الأصغر سنًا", "الأكبر سنًا"], ["أسرع", "الأبطأ", "الأسرع"], ["أثقل", "الأخف", "الأثقل"]];
function orderQ(L, r, reg) {
  for (let tries = 0; tries < 300; tries++) {
    const k = L < 6 ? 3 : L < 12 ? 4 : 5; const names = shuf(r, NAMES).slice(0, k); const rel = pick(r, REL);
    const stm = []; for (let i = 0; i < k - 1; i++) stm.push([names[i], names[i + 1]]);
    if (L >= 10 && k >= 4) { stm.pop(); stm.push([names[0], names[k - 2]]); stm.push([names[k - 2], names[k - 1]]); const uniqSt = new Set(stm.map((s) => s.join(">"))); if (uniqSt.size !== stm.length) continue; }
    const ask = pick(r, k === 3 ? ["min", "max", "mid"] : ["min", "max"]);
    const ans = ask === "min" ? names[k - 1] : ask === "max" ? names[0] : names[1];
    const text = shuf(r, stm).map(([a, b]) => `${a} ${rel[0]} من ${b}`).join("، ");
    const q = ask === "min" ? rel[1] : ask === "max" ? rel[2] : "في المنتصف";
    const prompt = `${text}. من ${ask === "mid" ? "الذي هو" : "هو"} ${q}؟`;
    if (reg.has(prompt)) continue; reg.add(prompt);
    const others = shuf(r, names.filter((n) => n !== ans)); const opts = shuf(r, [ans, ...others.slice(0, 3)]);
    if (opts.length < 3) continue;
    return { prompt: T(prompt), options: opts.map((v) => T(v)), correct: opts.indexOf(ans), explain: T(`نرتّب من الأعلى إلى الأدنى: ${names.join(" > ")}. إذن الجواب ${ans}.`), meta: { kind: "order", order: names, stmts: stm, ask, answer: ans } };
  }
  throw new Error("orderQ failed");
}
const CATS = [["التفاح", "فاكهة", "غذاء"], ["الأسود", "ثدييات", "حيوانات"], ["الورود", "نباتات", "كائنات حية"], ["الصقور", "طيور", "حيوانات"], ["الهواتف", "أجهزة", "أدوات"], ["الأقلام", "أدوات كتابة", "أدوات"], ["القاهرة", "مدن", "أماكن"], ["المربعات", "أشكال", "رسوم"]];
function syllogismQ(L, r, reg) {
  for (let tries = 0; tries < 100; tries++) {
    const [a, b, c] = pick(r, CATS); const form = pick(r, ["valid", "converse", "some"].slice(0, L < 4 ? 1 : L < 8 ? 2 : 3));
    let prompt, ans, why;
    if (form === "valid") { prompt = `كل ${a} هي ${b}، وكل ${b} هي ${c}. هل كل ${a} هي ${c}؟`; ans = 0; why = "نعم: العلاقة تنتقل عبر الحلقة الوسطى (كل أ ب، كل ب ج ⇒ كل أ ج)."; }
    else if (form === "converse") { prompt = `كل ${a} هي ${b}. شيء ما هو ${b}. هل هو بالضرورة من ${a}؟`; ans = 2; why = "لا يمكن الحكم: ليس كل ما في المجموعة الأكبر ينتمي إلى الأصغر."; }
    else { prompt = `بعض ${b} هي ${a}، وكل ${a} هي ${c}. هل بعض ${b} هي ${c}؟`; ans = 0; why = "نعم: البعض الذي هو من " + a + " هو أيضًا " + c + "."; }
    if (reg.has(prompt)) continue; reg.add(prompt);
    const options = [T("نعم بالضرورة"), T("لا، مستحيل"), T("لا يمكن الحكم")];
    return { prompt: T(prompt), options, correct: ans, explain: T(why), meta: { kind: "syl", form, correct: ans } };
  }
  throw new Error("syllogism failed");
}
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];
function weekdayQ(L, r, reg) {
  for (let t = 0; t < 100; t++) {
    const s = ri(r, 0, 6), n = ri(r, 5, 20 + 30 * L), ans = (s + n) % 7;
    if (ans === s) continue; const prompt = `اليوم ${DAYS[s]}. ما اليوم بعد ${n} يومًا؟`; if (reg.has(prompt)) continue; reg.add(prompt);
    const others = shuf(r, DAYS.filter((d, i) => i !== ans)).slice(0, 3); const opts = shuf(r, [DAYS[ans], ...others]);
    return { prompt: T(prompt), options: opts.map((d) => T(d)), correct: opts.indexOf(DAYS[ans]), explain: T(`${n} ÷ 7 باقيه ${n % 7}، فنتقدم ${n % 7} أيام من ${DAYS[s]} فنصل إلى ${DAYS[ans]}.`), meta: { kind: "weekday", start: s, n, answer: ans } };
  }
  throw new Error("weekday failed");
}
function logicNumQ(L, r, reg) {
  for (let t = 0; t < 200; t++) {
    const form = pick(r, ["pigeon", "handshake", "coins", "ratio"].slice(0, L < 6 ? 2 : 4));
    let prompt, ans, why, meta;
    if (form === "pigeon") { const c = ri(r, 2, 4 + (L >> 3)); prompt = `في كيس جوارب بـ ${c} ألوان مختلفة بكميات كبيرة. كم جوربًا يجب أن تسحب بلا نظر لتضمن وجود جوربين من نفس اللون؟`; ans = c + 1; why = `في أسوأ حال تسحب لونًا من كل ${c} ألوان، فالسحبة التالية ${c + 1} تضمن التطابق.`; meta = { kind: "pigeon", colors: c, answer: ans }; }
    else if (form === "handshake") { const n = ri(r, 4, 6 + L); prompt = `إذا صافح كل شخص من ${n} ${n > 10 ? "شخصًا" : "أشخاص"} كل الآخرين مرة واحدة فكم مصافحة تحدث؟`; ans = (n * (n - 1)) / 2; why = `n(n−1)÷2 = ${ans}.`; meta = { kind: "handshake", n, answer: ans }; }
    else if (form === "coins") { const a = ri(r, 2, 6), b = ri(r, 2, 6); prompt = `مع سلمى ${a} قطع من فئة 5 وقطعتان من فئة 10 و${b} قطع من فئة 1. كم مجموع ما معها؟`; ans = a * 5 + 20 + b; why = `${a}×5 + 2×10 + ${b}×1 = ${ans}.`; meta = { kind: "expr", expr: `${a}*5+2*10+${b}*1`, answer: ans }; }
    else { const a = ri(r, 2, 4), b = ri(r, 1, 3); if (a === b) continue; const k = ri(r, 3, 12); prompt = `النسبة بين عددين ${a}:${b} ومجموعهما ${(a + b) * k}. ما العدد الأكبر؟`; ans = Math.max(a, b) * k; why = `الجزء الواحد ${k}، فالأكبر ${Math.max(a, b)}×${k} = ${ans}.`; meta = { kind: "ratio", a, b, sum: (a + b) * k, answer: ans }; }
    if (reg.has(prompt)) continue; reg.add(prompt);
    const cands = [...new Set([ans + 1, ans - 1, ans + 2, ans * 2, ans - 2])].filter((v) => v > 0 && v !== ans); const opts = shuf(r, [ans, ...shuf(r, cands).slice(0, 3)]);
    return { prompt: T(prompt), options: opts.map((v) => T(String(v))), correct: opts.indexOf(ans), explain: T(why), meta };
  }
  throw new Error("logicNum failed");
}
// curated riddles, ordered easy -> hard; w = words riddle (wrong options drawn from other word answers), else explicit wrongs
const RID = [
 ["ما الشيء الذي له أسنان ولا يعضّ؟", "المشط", "للمشط أسنان لكنه لا يعضّ.", 1],
 ["ما الشيء الذي يكتب ولا يقرأ؟", "القلم", "القلم يكتب ولا يقرأ ما كتب.", 1],
 ["ما الشيء الذي له عين ولا يرى؟", "الإبرة", "عين الإبرة هي الثقب الذي يمر منه الخيط.", 1],
 ["ما الشيء الذي يمشي بلا رجلين ويبكي بلا عينين؟", "السحاب", "السحاب يسير في السماء ويُمطر.", 1],
 ["ما الشيء الذي يزداد كلما أخذت منه؟", "الحفرة", "كلما أخرجت منها ترابًا اتسعت.", 1],
 ["ما الذي يسمع بلا أذن ويتكلم بلا لسان؟", "الصدى", "الصدى يردّ الصوت بلا أذن ولا لسان.", 1],
 ["ما الذي يقع في الماء ولا يبتل؟", "الظل", "الظل ضوء محجوب لا مادة تبتل.", 1],
 ["شيء تملكه لكن غيرك يستعمله أكثر منك، فما هو؟", "اسمك", "الآخرون ينادونك به أكثر مما تقوله أنت.", 2],
 ["ما الشيء الذي كلما جفّ ابتلّ؟", "المنشفة", "المنشفة تجفف غيرها فتبتل.", 2],
 ["ما الذي له رقبة وليس له رأس؟", "الزجاجة", "للزجاجة عنق فقط.", 2],
 ["ما الذي له أوراق وليس شجرة وله ظهر وليس حيوانًا؟", "الكتاب", "الكتاب له أوراق وغلاف وظهر.", 2],
 ["ما الذي يوجد في وسط البحر ولا يوجد في البر؟", "حرف الحاء", "حرف الحاء في وسط كلمة «البحر» ولا يوجد في «البر».", 2],
 ["ما الشيء الذي كلما طال قصر؟", "الشمعة", "الشمعة تقصر كلما احترقت وطال وقت اشتعالها.", 2],
 ["ما الذي له مفاتيح كثيرة ولا يفتح بابًا؟", "البيانو", "للبيانو مفاتيح موسيقية لا تفتح بابًا.", 2],
 ["ما الذي يجري ولا يمشي؟", "الماء", "الماء يجري في النهر ولا قدم له.", 2],
 ["ما الشيء الذي إذا ذكرت اسمه اختفى؟", "الصمت", "بمجرد أن تتكلم يختفي الصمت.", 3],
 ["ما الذي يدور حول العالم ويبقى في مكانه؟", "الطابع البريدي", "الطابع يلصق على الرسالة فيسافر ويبقى مكانه على المظروف.", 3],
 ["ما الشيء الذي يُكسر دون أن تلمسه؟", "الوعد", "الوعد يُكسر بعدم الوفاء به.", 3],
 ["ما الحيوان الذي ينام وعيناه مفتوحتان؟", "السمك", "السمك لا جفون له فينام وعيناه مفتوحتان.", 3],
 ["أيّ شهر ميلادي هو الأقصر؟", "فبراير", "فبراير 28 أو 29 يومًا فقط.", 3],
 ["ما الشيء الذي يتغير كل يوم ولا يتغير اسمه؟", "اليوم", "كل يوم يُسمى «اليوم» حين يأتي.", 3],
 ["أنا عدد زوجي بين 20 و30 وأقبل القسمة على 7. من أنا؟", "28", "28 زوجي وبين 20 و30 ويساوي 4×7.", 4, ["24", "26", "21"]],
 ["أنا العدد الأولي الزوجي الوحيد. من أنا؟", "2", "كل عدد زوجي غير 2 يقبل القسمة على 2 فليس أوليًا.", 4, ["4", "1", "0"]],
 ["إذا كان نصف عدد ما 12 فما ثلث هذا العدد؟", "8", "العدد 24، وثلثه 8.", 4, ["4", "6", "12"]],
 ["ما العدد الذي إذا أضفته إلى أي عدد لم يتغير؟", "الصفر", "x + 0 = x دائمًا.", 4, ["1", "10", "-1"]],
 ["ما العدد الذي إذا ضربته في أي عدد بقي ذلك العدد كما هو؟", "1", "x × 1 = x دائمًا.", 4, ["0", "10", "2"]],
 ["ثلاثة أعداد متتالية مجموعها 30. ما أكبرها؟", "11", "الأعداد 9 و10 و11.", 5, ["10", "12", "9"]],
 ["كم مرة يمكنك أن تطرح 5 من 25؟", "مرة واحدة", "بعد الطرح الأول يصبح العدد 20 فلا يبقى 25.", 5, ["خمس مرات", "عشر مرات", "لا مرة"]],
 ["لدى مزارع 17 خروفًا مات منها كلها إلا 9. كم بقي؟", "9", "«كلها إلا 9» تعني أن 9 بقيت.", 5, ["8", "17", "26"]],
 ["في سباق تجاوزتَ المتسابق الذي في المركز الثاني. في أي مركز أنت الآن؟", "الثاني", "أخذتَ مكانه فقط.", 5, ["الأول", "الثالث", "لا أعلم"]],
 ["إذا تجاوزتَ المتسابق الأخير، ففي أي مركز أنت؟", "لا يمكن (لا أحد أخير خلفك)", "لا يمكن تجاوز الأخير لأنه لا يوجد من خلفه.", 5, ["قبل الأخير", "الأخير", "الأول"]],
 ["أيهما أثقل: كيلوغرام من القطن أم كيلوغرام من الحديد؟", "متساويان", "كلاهما كيلوغرام واحد.", 6, ["القطن", "الحديد", "لا يمكن المقارنة"]],
 ["في الغرفة عود ثقاب وشمعة ومصباح غازي وموقد. ما الذي تشعله أولًا؟", "عود الثقاب", "تحتاج عود الثقاب لتشعل الباقي.", 6, ["الشمعة", "المصباح", "الموقد"]],
 ["أعطاك طبيب ثلاث حبات وقال: خذ حبة كل نصف ساعة. كم من الوقت تستغرق حتى تأخذها كلها؟", "ساعة", "الأولى الآن، الثانية بعد نصف ساعة، الثالثة بعد ساعة.", 6, ["ساعة ونصف", "نصف ساعة", "ثلاث ساعات"]],
 ["لكل بنت من أربع بنات أخ واحد. كم عدد الأولاد والبنات معًا؟", "5", "الأخ نفسه واحد للجميع، فيوجد ولد واحد و4 بنات.", 7, ["8", "4", "6"]],
 ["إذا كانت 3 قطط تصطاد 3 فئران في 3 دقائق، فكم قطة تصطاد 100 فأر في 100 دقيقة؟", "3", "القطة الواحدة تصطاد فأرًا في 3 دقائق، فتصطاد 33 تقريبًا في 100 دقيقة؛ 3 قطط تصطاد 100.", 7, ["100", "33", "30"]],
 ["نبات في بركة يتضاعف حجمه كل يوم ويملأ البركة في 48 يومًا. متى يملأ نصفها؟", "اليوم 47", "قبل التضاعف الأخير بيوم يكون نصف البركة.", 8, ["اليوم 24", "اليوم 46", "اليوم 40"]],
 ["رجل ينظر إلى صورة ويقول: «ليس لي إخوة، وأبو هذا الرجل ابن أبي». من هو في الصورة؟", "ابنه", "ابن أبي هو أنا، فأبو الرجل هو أنا، وهو ابني.", 8, ["أبوه", "أخوه", "نفسه"]],
 ["أنا عدد مربع بين 50 و70 وأقبل القسمة على 4. من أنا؟", "64", "64 = 8²، ويقبل القسمة على 4.", 8, ["54", "60", "68"]],
 ["ما الذي يرتفع ولا ينزل أبدًا؟", "العمر", "عمر الإنسان يزيد ولا يعود إلى الوراء.", 3],
 ["إذا كان معك 5 تفاحات وأخذت منها 3، فكم تفاحة معك؟", "3", "التي أخذتها هي التي معك.", 5, ["2", "5", "8"]],
 ["ما العدد الموجب الذي مربعه يساوي ضعفه؟", "2", "2² = 4 = 2 × 2.", 8, ["4", "3", "1"]],
 ["ما أصغر عدد صحيح موجب له ثلاثة قواسم فقط؟", "4", "قواسم 4 هي 1 و2 و4.", 9, ["6", "8", "12"]],
 ["كم عدد القواسم الموجبة للعدد 12؟", "6", "1 و2 و3 و4 و6 و12.", 9, ["4", "5", "8"]],
];
const RIDDLES = RID.map((x) => ({ q: x[0], a: x[1], why: x[2], lvl: x[3], wrong: x[4] || null }));
function riddleQ(r, used) {
  const k = used.next++;
  const rd = RIDDLES[k % RIDDLES.length];
  const pool = RIDDLES.filter((x) => !x.wrong && x.a !== rd.a).map((x) => x.a);
  const wrong = rd.wrong ? rd.wrong : shuf(r, pool).slice(0, 3);
  const opts = shuf(r, [rd.a, ...wrong]);
  return { prompt: T(rd.q), options: opts.map((v) => T(v)), correct: opts.indexOf(rd.a), explain: T(rd.why), meta: { kind: "riddle", answer: rd.a } };
}
function logicQ(L, r, reg) {
  const kinds = [orderQ, syllogismQ, weekdayQ, logicNumQ];
  const avail = L < 3 ? [orderQ, logicNumQ] : L < 4 ? [orderQ, weekdayQ, logicNumQ] : kinds;
  return pick(r, avail)(L, r, reg);
}

// ---- order / match / classify ----
function orderItems(L, r, reg) {
  for (let t = 0; t < 300; t++) {
    const exprs = []; const vals = new Set();
    for (let k = 0; k < 5; k++) { const q = arithQ(Math.max(1, L - 2), r, new Set()); if (q.meta.kind !== "expr" || vals.has(q.answer)) { k--; continue; } vals.add(q.answer); exprs.push(q); }
    const sorted = exprs.slice().sort((a, b) => a.answer - b.answer);
    const key = "ord|" + sorted.map((q) => q.answer).join(","); if (reg.has(key)) continue; reg.add(key);
    return sorted;
  }
  throw new Error("orderItems");
}
function matchPairs(L, r, reg) {
  for (let t = 0; t < 300; t++) {
    const qs = []; const vals = new Set();
    while (qs.length < 4) { const q = arithQ(Math.max(1, L - 1), r, new Set()); if (!/^احسب/.test(q.prompt.ar) || vals.has(q.answer)) continue; vals.add(q.answer); qs.push(q); }
    const key = "mat|" + qs.map((q) => q.answer).join(","); if (reg.has(key)) continue; reg.add(key);
    return qs;
  }
  throw new Error("matchPairs");
}
const CLS = [
  { min: 1, id: "even", yes: "زوجي", no: "فردي", en: ["Even", "Odd"], f: (n) => n % 2 === 0, range: [2, 30] },
  { min: 2, id: "even", yes: "زوجي", no: "فردي", en: ["Even", "Odd"], f: (n) => n % 2 === 0, range: [20, 199] },
  { min: 3, id: "gt50", yes: "أكبر من 50", no: "50 أو أقل", en: ["Over 50", "50 or less"], f: (n) => n > 50, range: [10, 100] },
  { min: 4, id: "mult3", yes: "من مضاعفات 3", no: "ليس من مضاعفات 3", en: ["Multiple of 3", "Not a multiple of 3"], f: (n) => n % 3 === 0, range: [3, 60] },
  { min: 5, id: "mult5", yes: "من مضاعفات 5", no: "ليس من مضاعفات 5", en: ["Multiple of 5", "Not a multiple of 5"], f: (n) => n % 5 === 0, range: [5, 99] },
  { min: 6, id: "prime", yes: "أولي", no: "غير أولي", en: ["Prime", "Not prime"], f: isPrime, range: [2, 30] },
  { min: 7, id: "square", yes: "مربع كامل", no: "ليس مربعًا كاملًا", en: ["Perfect square", "Not a perfect square"], f: isSquare, range: [1, 100] },
  { min: 8, id: "mult4", yes: "من مضاعفات 4", no: "ليس من مضاعفات 4", en: ["Multiple of 4", "Not a multiple of 4"], f: (n) => n % 4 === 0, range: [4, 120] },
  { min: 9, id: "prime", yes: "أولي", no: "غير أولي", en: ["Prime", "Not prime"], f: isPrime, range: [2, 60] },
  { min: 10, id: "mult6", yes: "من مضاعفات 6", no: "ليس من مضاعفات 6", en: ["Multiple of 6", "Not a multiple of 6"], f: (n) => n % 6 === 0, range: [6, 150] },
  { min: 11, id: "pow2", yes: "قوة للعدد 2", no: "ليس قوة للعدد 2", en: ["Power of 2", "Not a power of 2"], f: isPow2, range: [1, 300] },
  { min: 12, id: "mult7", yes: "من مضاعفات 7", no: "ليس من مضاعفات 7", en: ["Multiple of 7", "Not a multiple of 7"], f: (n) => n % 7 === 0, range: [7, 200] },
  { min: 13, id: "prime", yes: "أولي", no: "غير أولي", en: ["Prime", "Not prime"], f: isPrime, range: [2, 100] },
  { min: 14, id: "mult9", yes: "من مضاعفات 9", no: "ليس من مضاعفات 9", en: ["Multiple of 9", "Not a multiple of 9"], f: (n) => n % 9 === 0, range: [9, 300] },
  { min: 15, id: "tri", yes: "عدد مثلثي", no: "ليس مثلثيًا", en: ["Triangular", "Not triangular"], f: isTri, range: [1, 120] },
  { min: 16, id: "prime", yes: "أولي", no: "غير أولي", en: ["Prime", "Not prime"], f: isPrime, range: [100, 200] },
  { min: 17, id: "square", yes: "مربع كامل", no: "ليس مربعًا كاملًا", en: ["Perfect square", "Not a perfect square"], f: isSquare, range: [1, 400] },
  { min: 18, id: "mult11", yes: "من مضاعفات 11", no: "ليس من مضاعفات 11", en: ["Multiple of 11", "Not a multiple of 11"], f: (n) => n % 11 === 0, range: [11, 400] },
  { min: 19, id: "fib", yes: "من أعداد فيبوناتشي", no: "ليس منها", en: ["Fibonacci", "Not Fibonacci"], f: isFib, range: [1, 250] },
  { min: 20, id: "prime", yes: "أولي", no: "غير أولي", en: ["Prime", "Not prime"], f: isPrime, range: [200, 320] },
];
function classifyItem(L, r, reg) {
  const spec = CLS[L - 1];
  for (let t = 0; t < 400; t++) {
    const yes = [], no = [];
    for (let k = 0; k < 8000 && (yes.length < 3 || no.length < 3); k++) { const n = ri(r, spec.range[0], spec.range[1]); if (spec.f(n)) { if (yes.length < 3 && !yes.includes(n) && !no.includes(n)) yes.push(n); } else if (no.length < 3 && !no.includes(n) && !yes.includes(n)) no.push(n); }
    if (yes.length < 3 || no.length < 3) continue;
    const key = `cls|${L}|` + [...yes, ...no].sort((a, b) => a - b).join(","); if (reg.has(key)) continue; reg.add(key);
    return { spec, cards: shuf(r, [...yes.map((n) => ({ n, b: "yes" })), ...no.map((n) => ({ n, b: "no" }))]) };
  }
  throw new Error("classify");
}

const IQ_TITLES = [
  ["جمع وطرح بسيط", "Easy adding and subtracting"], ["أعداد حتى المئة", "Numbers to a hundred"], ["جدول الضرب", "Times tables"], ["القسمة والأنماط", "Division and patterns"], ["ترتيب العمليات", "Order of operations"],
  ["مسائل كلامية", "Word problems"], ["المربعات والأنماط", "Squares and patterns"], ["النسب المئوية", "Percentages"], ["متتاليات أصعب", "Harder sequences"], ["منطق وأحاجٍ", "Logic and riddles"],
  ["ضرب الأعداد الكبيرة", "Bigger products"], ["الأعداد الأولية والمضاعفات", "Primes and multiples"], ["القاسم والمضاعف المشترك", "GCD and LCM"], ["تفكير جبري مبسّط", "Light algebra thinking"], ["متتاليات مركّبة", "Compound sequences"],
  ["الأعداد السالبة والقوى", "Negatives and powers"], ["منطق متقدم", "Advanced logic"], ["السرعة والدقة", "Speed and accuracy"], ["تحدٍّ مختلط", "Mixed challenge"], ["التحدي الأكبر", "The grand challenge"]];
const IQ_SLOTS = [["احسب", "Calculate"], ["أكمل المتتالية", "Complete the sequence"], ["الشاذ والعلاقات", "Odd one out and analogies"], ["مسائل كلامية", "Word problems"], ["رتّب القيم", "Order the values"], ["صِل العملية بالناتج", "Match to the result"], ["منطق وأحاجٍ", "Logic and riddles"], ["صنّف الأعداد", "Sort the numbers"], ["جولة السرعة", "Speed round"], ["التحدي المختلط", "Mixed challenge"]];
const IQ_SKILL = ["focus", "recall", "focus", "comprehension", "mastery", "recall", "metacognition", "focus", "regulation", "mastery"];
const IQ_NOTE = "الدرجة تصف محاولة تمرين واحدة، وليست قياسًا لذكائك ولا تشخيصًا.";

function buildIq() {
  const stages = IQ_TITLES.map((t, i) => ({ id: "iq" + pad2(i + 1), index: i + 1, skill: i < 10 ? "focus" : "mastery", title: T(t[0], t[1]), blurb: T(`أرقام وحساب وأسئلة ذكية بمستوى صعوبة ${i + 1} من 20. ${IQ_NOTE}`, `Numbers, calculation, and smart questions at difficulty ${i + 1} of 20. The score describes one practice try, not your intelligence.`) }));
  const items = []; const reg = new Set(); const used = { next: 0 };
  stages.forEach((st, si) => {
    const L = si + 1, diff = clamp(Math.ceil(L / 4), 1, 5);
    const R = (k) => rng(`iq|${L}|${k}`);
    const mk = (slot, interaction, instr, reflection) => {
      const idx = slot + 1;
      items.push({ id: st.id + "-t" + pad2(idx), stageId: st.id, index: idx, masteryThreshold: 80,
        title: T(`${IQ_TITLES[si][0]} · ${IQ_SLOTS[slot][0]}`, `${IQ_TITLES[si][1]} · ${IQ_SLOTS[slot][1]}`),
        objective: T(`مستوى ${L}/20: ${IQ_SLOTS[slot][0]}.`, `Level ${L}/20: ${IQ_SLOTS[slot][1]}.`),
        rationale: T(`تمرين على الحساب والمنطق مع شرح فوري لكل إجابة. ${IQ_NOTE}`, `Practice in calculation and logic with an instant explanation for each answer. The score describes one practice try, not your intelligence.`),
        instructions: T(instr), coachNote: T("امدح المحاولة والطريقة، لا الدرجة وحدها."), interaction,
        difficulty: diff, minutes: slot >= 8 ? 4 : 5, skill: IQ_SKILL[slot], reflection: T(reflection) });
    };
    const mapCalc = (q) => ({ prompt: q.prompt, answer: q.answer, explain: q.explain, meta: q.meta });
    const mapQ = (q) => ({ prompt: q.prompt, options: q.options, correct: q.correct, explain: q.explain, meta: q.meta });
    // 1 calc x5
    { const r = R(1); const qs = []; for (let k = 0; k < 5; k++) qs.push(mapCalc(arithQ(L, r, reg))); mk(0, { type: "calc", questions: qs }, "اكتب الناتج في الخانة ثم اضغط تحقق لترى الشرح فورًا.", "راجع الطريقة: قسّم العملية إلى خطوات صغيرة."); }
    // 2 sequences x4
    { const r = R(2); const qs = []; for (let k = 0; k < 4; k++) qs.push(mapQ(seqQ(L, r, reg))); mk(1, { type: "quiz", questions: qs }, "ابحث عن القاعدة التي تربط الحدود، ثم اختر العدد التالي.", "ابحث دائمًا عن الفرق أو النسبة بين الحدود المتجاورة."); }
    // 3 odd x2 + analogy x2
    { const r = R(3); const qs = [oddQ(L, r, reg), oddQ(L, r, reg)]; if (L >= 3) { qs.push(analogyQ(L, r, reg)); qs.push(analogyQ(L, r, reg)); } else { qs.push(oddQ(L, r, reg)); qs.push(oddQ(L, r, reg)); } mk(2, { type: "quiz", questions: qs.map(mapQ) }, "اكتشف الخاصية المشتركة أو العلاقة، ثم اختر الجواب.", "الخاصية المشتركة تظهر حين تفحص كل عدد على حدة."); }
    // 4 word problems x4
    { const r = R(4); const qs = []; for (let k = 0; k < 4; k++) qs.push(mapCalc(wordQ(L, r, reg))); mk(3, { type: "calc", questions: qs }, "اقرأ المسألة ببطء، حدّد المعطيات، واكتب الناتج.", "اكتب المعطيات والمطلوب قبل أن تحسب."); }
    // 5 order
    { const r = R(5); const sorted = orderItems(L, r, reg); const shown = sorted.map((q) => q.prompt.ar.replace(/^احسب: /, ""));
      const its = sorted.map((q) => T(q.prompt.ar.replace(/^احسب: /, "").replace(/^Calculate: /, ""), q.prompt.en.replace(/^Calculate: /, "")));
      mk(4, { type: "order", showPrompt: true, prompt: T("رتّب العمليات من الأصغر ناتجًا إلى الأكبر."), items: its, values: sorted.map((q) => q.answer), meta: { kind: "order-values", exprs: sorted.map((q) => q.meta.expr), values: sorted.map((q) => q.answer) } },
         "احسب ناتج كل عملية ثم رتّبها من الأصغر (في الأعلى) إلى الأكبر.", "الترتيب الصحيح: " + sorted.map((q, i) => `${ltr(shown[i])} = ${q.answer}`).join(" ← ")); }
    // 6 match
    { const r = R(6); const qs = matchPairs(L, r, reg);
      mk(5, { type: "match", prompt: T("صِل كل عملية بناتجها الصحيح."), pairs: qs.map((q) => ({ left: T(q.prompt.ar.replace(/^احسب: /, ""), q.prompt.en.replace(/^Calculate: /, "")), right: T(String(q.answer)) })), meta: { kind: "match-values", exprs: qs.map((q) => q.meta.expr), values: qs.map((q) => q.answer) } },
         "اختر عملية من اليمين ثم ناتجها من القائمة الثانية. احسب ذهنيًا ثم اضغط تحقق.", "النواتج: " + qs.map((q) => `${ltr(q.prompt.ar.replace(/^احسب: /, ""))} = ${q.answer}`).join("، ")); }
    // 7 logic: 2 riddles + 2 logic
    { const r = R(7); const qs = [riddleQ(r, used), logicQ(L, r, reg), riddleQ(r, used), logicQ(L, r, reg)]; mk(6, { type: "quiz", questions: qs.map(mapQ) }, "فكّر بهدوء. الأحاجي تحتاج قراءة دقيقة للكلمات.", "في الأحاجي، كلمة واحدة قد تغيّر المعنى كله."); }
    // 8 classify
    { const r = R(8); const c = classifyItem(L, r, reg);
      mk(7, { type: "classify", prompt: T("صنّف كل عدد حسب الخاصية: " + c.spec.yes + " أو " + c.spec.no + ".", "Sort each number: " + c.spec.en[0] + " or " + c.spec.en[1] + "."), buckets: [{ id: "yes", label: T(c.spec.yes, c.spec.en[0]) }, { id: "no", label: T(c.spec.no, c.spec.en[1]) }], cards: c.cards.map((x) => ({ text: T(String(x.n)), bucket: x.b })), meta: { kind: "classify", prop: c.spec.id, level: L, numbers: c.cards.map((x) => x.n), buckets: c.cards.map((x) => x.b) } },
         "اختر عددًا ثم اضغط الفئة المناسبة له، وكرر حتى تصنّف الكل.", "الأعداد " + c.spec.yes + ": " + c.cards.filter((x) => x.b === "yes").map((x) => x.n).join("، ") + ". والبقية: " + c.cards.filter((x) => x.b === "no").map((x) => x.n).join("، ") + "."); }
    // 9 speed round (calc x8, timed)
    { const r = R(9); const qs = []; for (let k = 0; k < 8; k++) qs.push(mapCalc(arithQ(Math.max(1, L - 1), r, reg))); mk(8, { type: "calc", seconds: 150 - 3 * L, questions: qs }, "جولة سريعة: اضغط ابدأ ثم أجب عن أكبر عدد ممكن قبل انتهاء الوقت.", "السرعة تأتي من الدقة المتكررة، لا من الاستعجال."); }
    // 10 mixed timed challenge (quiz x5, timed)
    { const r = R(10); const qs = [seqQ(L, r, reg), oddQ(L, r, reg), arithMcq(L, r, reg), logicQ(L, r, reg), L >= 3 ? analogyQ(L, r, reg) : seqQ(L, r, reg)]; mk(9, { type: "quiz", seconds: 180 - 3 * L, questions: qs.map(mapQ) }, "تحدٍّ مختلط بوقت محدد: اضغط ابدأ ثم أجب عن تسلسل وشاذ وحساب ومنطق. الأسئلة التي لا تصلها تُحتسب خطأ.", "راجع الأسئلة التي أخطأت فيها واكتب القاعدة التي فاتتك."); }
  });
  return { stages, items };
}
