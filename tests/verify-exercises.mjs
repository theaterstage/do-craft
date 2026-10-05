// Verifies the generated exercise data: /restore 30x9, /iq 20x10, /brain 30x9, /proc 18x11, /dragon 22x16.
// Usage: node tests/verify-exercises.mjs [path/to/assets/exercises-*.js]
// Independent of the generator: answers are recomputed here with its own tiny expression evaluator and rules.
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
let file = process.argv[2];
if (!file) {
  const dir = path.join(here, "..", "assets");
  const f = fs.readdirSync(dir).find((n) => /^exercises-.*\.js$/.test(n));
  if (!f) throw new Error("no assets/exercises-*.js found");
  file = path.join(dir, f);
}
const mod = await import(pathToFileURL(path.resolve(file)).href);
const { restore, iq, brain, proc, dragon, isStageUnlocked, stageProgress } = mod;

let fails = 0, checks = 0;
function ok(c, msg) { checks++; if (!c) { fails++; if (fails <= 40) console.log("FAIL:", msg); } }
function eq(a, b, msg) { ok(a === b, `${msg} (got ${a}, expected ${b})`); }

// ---------- tiny evaluator: numbers, identifiers, + - * / % **, parentheses, unary minus ----------
function evaluate(src, vars = {}) {
  const toks = src.match(/\d+(?:\.\d+)?|[A-Za-z_]\w*|\*\*|[-+*/%()]/g) || [];
  let i = 0;
  const peek = () => toks[i], next = () => toks[i++];
  function prim() {
    const t = next();
    if (t === "(") { const v = add(); eq(next(), ")", "paren " + src); return v; }
    if (t === "-") return -pow();
    if (/^\d/.test(t)) return parseFloat(t);
    if (t in vars) return vars[t];
    throw new Error("bad token " + t + " in " + src);
  }
  function pow() { const b = prim(); if (peek() === "**") { next(); return b ** pow(); } return b; }
  function mul() { let v = pow(); while (["*", "/", "%"].includes(peek())) { const o = next(), r = pow(); v = o === "*" ? v * r : o === "/" ? v / r : v % r; } return v; }
  function add() { let v = mul(); while (["+", "-"].includes(peek())) { const o = next(), r = mul(); v = o === "+" ? v + r : v - r; } return v; }
  const v = add(); if (i !== toks.length) throw new Error("trailing tokens in " + src); return v;
}

// ---------- number helpers (independent implementations) ----------
const gcd = (a, b) => { while (b) [a, b] = [b, a % b]; return a; };
const isPrime = (n) => { if (n < 2) return false; for (let d = 2; d * d <= n; d++) if (n % d === 0) return false; return true; };
const sq = (n) => { const r = Math.round(Math.sqrt(n)); return r * r === n; };
const cube = (n) => { const r = Math.round(Math.cbrt(n)); return r * r * r === n; };
const tri = (n) => { for (let k = 1; k * (k + 1) / 2 <= n; k++) if (k * (k + 1) / 2 === n) return true; return false; };
const fib = (n) => { let a = 1, b = 2; while (a < n) [a, b] = [b, a + b]; return a === n; };
const pow2 = (n) => { if (n < 1) return false; while (n > 1 && n % 2 === 0) n /= 2; return n === 1; };
const ds = (n) => [...String(n)].reduce((s, c) => s + +c, 0);
const semi = (n) => { for (let d = 2; d * d <= n; d++) if (n % d === 0) return isPrime(d) && isPrime(n / d); return false; };
const PROP = {
  even: (n) => n % 2 === 0, mult3: (n) => n % 3 === 0, mult5: (n) => n % 5 === 0, mult7: (n) => n % 7 === 0, mult11: (n) => n % 11 === 0, mult18: (n) => n % 6 === 0 && n % 9 === 0,
  square: sq, prime: isPrime, composite: (n) => n > 1 && !isPrime(n), pal: (n) => { const s = String(n); return s === [...s].reverse().join("") && s.length > 1; },
  ds9: (n) => ds(n) === 9, pow2, tri, cube, fib, mod4r1: (n) => n % 4 === 1, sqm1: (n) => sq(n + 1), asc: (n) => { const d = [...String(n)]; return d.every((c, i) => i === 0 || c > d[i - 1]); },
  semi, dsprime: (n) => isPrime(ds(n)),
  mult4: (n) => n % 4 === 0, mult6: (n) => n % 6 === 0, mult9: (n) => n % 9 === 0, gt50: (n) => n > 50,
};
const ANALOGY = { x2: (x) => 2 * x, x3: (x) => 3 * x, sq: (x) => x * x, p5: (x) => x + 5, x2p1: (x) => 2 * x + 1, cu: (x) => x ** 3, sqp1: (x) => x * x + 1, x4m3: (x) => 4 * x - 3, sqm: (x) => x * x - x, x3p2sq: (x) => 2 * x * x + 1 };
const PRIMES = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53];
const DAYS = ["السبت", "الأحد", "الاثنين", "الثلاثاء", "الأربعاء", "الخميس", "الجمعة"];

// ---------- structure ----------
function checkStructure(name, track, nStages, nItems, prefix) {
  eq(track.stages.length, nStages, `${name} stage count`);
  eq(track.items.length, nStages * nItems, `${name} item count`);
  const ids = new Set(track.items.map((i) => i.id)); eq(ids.size, track.items.length, `${name} unique item ids`);
  track.stages.forEach((s, si) => {
    eq(s.id, prefix + String(si + 1).padStart(2, "0"), `${name} stage id`); eq(s.index, si + 1, `${name} stage index`);
    ok(s.title.ar && s.title.en && s.blurb.ar && s.blurb.en && s.skill, `${name} ${s.id} text`);
    const its = track.items.filter((i) => i.stageId === s.id);
    eq(its.length, nItems, `${name} ${s.id} has exactly ${nItems} items`);
    its.forEach((it, k) => { eq(it.index, k + 1, `${it.id} index`); eq(it.id, `${s.id}-t${String(k + 1).padStart(2, "0")}`, `${it.id} id format`); });
  });
  const titles = new Set(track.items.map((i) => i.title.ar)); eq(titles.size, track.items.length, `${name} unique titles`);
  track.items.forEach((it) => { ok(it.difficulty >= 1 && it.difficulty <= 5, `${it.id} difficulty`); ok(it.masteryThreshold === 80, `${it.id} threshold`); for (const k of ["title", "objective", "rationale", "instructions", "coachNote", "reflection"]) ok(it[k] && it[k].ar && it[k].en, `${it.id} ${k}`); });
}
function checkInteraction(it) {
  const x = it.interaction, id = it.id;
  const need = (c, m) => ok(c, `${id} ${x.type}: ${m}`);
  switch (x.type) {
    case "quiz": need(x.questions.length >= 1, "questions"); x.questions.forEach((q) => { need(q.options.length >= 3, "options"); need(new Set(q.options.map((o) => o.en)).size === q.options.length, "unique options"); need(q.correct >= 0 && q.correct < q.options.length, "correct idx"); need(q.explain.ar.length > 3, "explain"); }); if (x.seconds) need(x.seconds >= 30, "seconds"); break;
    case "calc": need(x.questions.length >= 1, "questions"); x.questions.forEach((q) => { need(Number.isFinite(q.answer), "answer"); need(q.explain.ar.length > 3, "explain"); }); break;
    case "breathe": need(x.cycles >= 3 && x.inhale >= 3 && x.exhale >= 3, "params"); break;
    case "scenario": need(x.choices.length === 3 && x.choices.some((c) => c.score >= 80) && x.choices.every((c) => c.why.ar), "choices"); need(new Set(x.choices.map((c) => c.text.en)).size === 3, "unique choices"); break;
    case "sprint": need(x.seconds >= 30 && x.checks.length >= 3, "sprint"); need(new Set(x.checks.map((c) => c.en)).size === x.checks.length, "unique checks"); break;
    case "order": need(x.items.length >= 4 && new Set(x.items.map((c) => c.en)).size === x.items.length, "order items"); break;
    case "match": need(x.pairs.length >= 3 && new Set(x.pairs.map((p) => p.left.en)).size === x.pairs.length && new Set(x.pairs.map((p) => p.right.en)).size === x.pairs.length, "pairs"); break;
    case "classify": need(x.buckets.length === 2 && x.cards.length === 6 && x.cards.every((c) => x.buckets.some((b) => b.id === c.bucket)), "classify"); need(new Set(x.cards.map((c) => c.text.en)).size === x.cards.length, "unique cards"); need(x.cards.filter((c) => c.bucket === x.buckets[0].id).length === 3, "balanced"); break;
    case "reflect": need(x.prompts.length === 2, "prompts"); break;
    case "recall": need(x.accept.length >= 1 && x.prompt.ar && x.explain.ar, "recall"); break;
    case "calibrate": need(x.question.options.length === 4 && x.question.correct >= 0 && x.question.correct < 4, "calibrate"); break;
    default: need(false, "unknown type " + x.type);
  }
}

// ---------- restore (30 x 9) ----------
checkStructure("restore", restore, 30, 9, "rs");
const seenR = {};
restore.items.forEach((it) => {
  checkInteraction(it); ok(/تعليمي/.test(it.rationale.ar) && /treatment/.test(it.rationale.en), `${it.id} has the educational-not-treatment note`);
  seenR[it.interaction.type] = (seenR[it.interaction.type] || 0) + 1;
});
const slotTypes = ["breathe", "quiz", "scenario", "sprint", "order", "match", "classify", "reflect"];
restore.stages.forEach((s, si) => {
  const its = restore.items.filter((i) => i.stageId === s.id);
  slotTypes.forEach((t, k) => eq(its[k].interaction.type, t, `${s.id} slot ${k + 1}`));
  eq(its[8].interaction.type, (si + 1) % 2 === 0 ? "recall" : "calibrate", `${s.id} slot 9`);
  eq(its[1].interaction.questions.length, 2, `${s.id} quiz has 2 questions`);
});
{
  const sec = restore.items.filter((i) => i.interaction.type === "sprint").map((i) => i.interaction.seconds); ok(sec[29] > sec[0], "sprint timers grow with stage");
  const cyc = restore.items.filter((i) => i.interaction.type === "breathe").map((i) => i.interaction.cycles); ok(cyc[29] > cyc[0], "breathing cycles grow with stage");
  ok(restore.items[0].difficulty < restore.items[269].difficulty, "restore difficulty ramps");
  const p = restore.items.filter((i) => i.interaction.type === "quiz").flatMap((i) => i.interaction.questions.map((q) => q.prompt.ar)); eq(new Set(p).size, p.length, "restore quiz prompts unique");
}

// ---------- iq (20 x 10) ----------
checkStructure("iq", iq, 20, 10, "iq");
const iqTypes = ["calc", "quiz", "quiz", "calc", "order", "match", "quiz", "classify", "calc", "quiz"];
iq.stages.forEach((s) => { const its = iq.items.filter((i) => i.stageId === s.id); iqTypes.forEach((t, k) => eq(its[k].interaction.type, t, `${s.id} slot ${k + 1} type`)); ok(its[8].interaction.seconds > 0, `${s.id} speed timer`); ok(its[9].interaction.seconds > 0, `${s.id} mixed timer`); });
iq.items.forEach((it) => checkInteraction(it));
{ let prevD = 0; iq.stages.forEach((s) => { const d = iq.items.find((i) => i.stageId === s.id).difficulty; ok(d >= prevD, `iq difficulty non-decreasing ${s.id}`); prevD = d; });
  eq(iq.items[0].difficulty, 1, "iq starts at difficulty 1"); eq(iq.items[199].difficulty, 5, "iq ends at difficulty 5"); }

const prompts = [];
let verified = 0;
const CALC_KINDS = ["expr", "gcd", "lcm", "sumto", "sqrt", "digits"];
function calcExpected(m, id) {
  switch (m.kind) {
    case "expr": return evaluate(m.expr);
    case "gcd": return gcd(...m.args); case "lcm": return m.args[0] / gcd(...m.args) * m.args[1];
    case "sumto": return m.args[0] * (m.args[0] + 1) / 2;
    case "sqrt": { const e = Math.round(Math.sqrt(m.args[0])); ok(e * e === m.args[0], id + " perfect square"); return e; }
    case "digits": return ds(m.args[0]);
  }
  ok(false, `${id} unknown calc kind ${m.kind}`); return NaN;
}
function verifyCalc(q, id) {
  const m = q.meta; ok(CALC_KINDS.includes(m.kind), `${id} calc kind`);
  const exp = calcExpected(m, id);
  eq(exp, q.answer, `${id} calc answer`); eq(m.answer, q.answer, `${id} meta answer`); ok(Number.isInteger(q.answer), `${id} integer answer`);
  if (m.kind === "gcd" || m.kind === "lcm") m.args.forEach((a) => ok(q.prompt.ar.includes(String(a)), `${id} prompt has ${a}`));
  verified++; prompts.push(q.prompt.ar);
}
function seqTerm(m, count) {
  const out = [];
  if (m.formula) for (let n = 0; n < count; n++) out.push(evaluate(m.formula, { n }));
  else if (m.inter) for (let n = 0; n < count; n++) out.push(evaluate(m.inter[n % 2], { k: Math.floor(n / 2) }));
  else if (m.primes !== undefined) for (let n = 0; n < count; n++) out.push(PRIMES[m.primes + n]);
  else { const a = m.rec.init.slice(); for (let i = a.length; i < count; i++) a.push(evaluate(m.rec.steps[(i - m.rec.init.length) % m.rec.steps.length], { p: a[i - 1], pp: a[i - 2] ?? 0, i })); return a; }
  return out;
}
function verifyQuiz(q, id) {
  ok(q.options[q.correct], `${id} correct option exists`);
  const m = q.meta, opt = q.options[q.correct].ar; prompts.push(q.prompt.ar);
  switch (m.kind) {
    case "seq": { const t = seqTerm(m, m.seq.length + 1); eq(t.slice(0, m.seq.length).join(), m.seq.join(), `${id} seq terms`); eq(t[m.seq.length], m.answer, `${id} seq next`); eq(String(m.answer), opt, `${id} seq option`); eq(q.options.filter((o) => o.ar === String(m.answer)).length, 1, `${id} seq single correct`); ok(q.prompt.ar.includes(m.seq.join("، ")), `${id} seq prompt shows terms`); break; }
    case "odd": { const f = PROP[m.prop]; ok(f, `${id} prop ${m.prop}`); const flags = m.numbers.map(f); eq(flags.filter((x) => !x).length, 1, `${id} exactly one odd (${m.prop})`); eq(flags.indexOf(false), m.oddIndex, `${id} odd idx`); eq(m.oddIndex, q.correct, `${id} odd correct`); eq(q.options.map((o) => o.ar).join(), m.numbers.join(), `${id} odd options`); break; }
    case "analogy": { const f = ANALOGY[m.fn]; ok(f, `${id} analogy fn`); eq(f(m.b), m.answer, `${id} analogy ans`); eq(String(m.answer), opt, `${id} analogy option`); ok(q.prompt.ar.includes(`${f(m.a)}`), `${id} analogy prompt`);
      for (const [k, g] of Object.entries(ANALOGY)) if (k !== m.fn && g(m.a) === f(m.a)) ok(g(m.b) === m.answer, `${id} analogy ambiguous with ${k}`); break; }
    case "expr": case "gcd": case "lcm": case "sumto": case "sqrt": case "digits": eq(calcExpected(m, id), m.answer, `${id} mcq calc`); eq(String(m.answer), opt, `${id} mcq option`); break;
    case "order": {
      const names = m.order, rank = new Map(names.map((n, i) => [n, i])); m.stmts.forEach(([a, b]) => ok(rank.get(a) < rank.get(b), `${id} stmt consistent`));
      const below = new Map(names.map((n) => [n, new Set()]));
      for (let r = 0; r < names.length; r++) m.stmts.forEach(([a, b]) => { below.get(a).add(b); below.get(b).forEach((x) => below.get(a).add(x)); });
      const top = names.filter((n) => below.get(n).size === names.length - 1); eq(top.length, 1, `${id} unique max`);
      const lowest = names.filter((n) => below.get(n).size === 0); eq(lowest.length, 1, `${id} unique min`);
      const expect = m.ask === "max" ? top[0] : m.ask === "min" ? lowest[0] : names.filter((n) => below.get(n).size === 1)[0];
      eq(expect, m.answer, `${id} order answer`); eq(opt, m.answer, `${id} order option`); break; }
    case "syl": { const map = { valid: 0, converse: 2, some: 0 }; eq(map[m.form], m.correct, `${id} syllogism form`); eq(m.correct, q.correct, `${id} syl correct`); break; }
    case "weekday": eq(DAYS[(m.start + m.n) % 7], opt, `${id} weekday`); ok(q.prompt.ar.includes(DAYS[m.start]) && q.prompt.ar.includes(String(m.n)), `${id} weekday prompt`); break;
    case "pigeon": eq(m.colors + 1, m.answer, `${id} pigeonhole`); eq(String(m.answer), opt, `${id} pigeon option`); break;
    case "handshake": eq(m.n * (m.n - 1) / 2, m.answer, `${id} handshake`); eq(String(m.answer), opt, `${id} handshake opt`); break;
    case "ratio": eq(Math.max(m.a, m.b) * m.sum / (m.a + m.b), m.answer, `${id} ratio`); eq(String(m.answer), opt, `${id} ratio opt`); break;
    case "riddle": eq(m.answer, opt, `${id} riddle answer option`); break;
    default: ok(false, `${id} unknown quiz kind ${m.kind}`);
  }
  verified++;
}
iq.items.forEach((it) => {
  const x = it.interaction;
  if (x.type === "calc") x.questions.forEach((q) => verifyCalc(q, it.id));
  else if (x.type === "quiz") x.questions.forEach((q) => verifyQuiz(q, it.id));
  else if (x.type === "order") { const v = x.meta.exprs.map((e) => evaluate(e)); eq(v.join(), x.meta.values.join(), `${it.id} order values`); ok(v.every((a, i) => i === 0 || a > v[i - 1]), `${it.id} items listed ascending (strict)`); eq(x.items.length, 5, `${it.id} five items`); verified++; }
  else if (x.type === "match") { const v = x.meta.exprs.map((e) => evaluate(e)); x.pairs.forEach((p, i) => eq(p.right.ar, String(v[i]), `${it.id} match pair ${i}`)); eq(new Set(v).size, v.length, `${it.id} match unique`); verified++; }
  else if (x.type === "classify") { const m = x.meta, f = PROP[m.prop]; ok(f, `${it.id} classify prop ${m.prop}`); m.numbers.forEach((n, i) => eq(f(n) ? "yes" : "no", m.buckets[i], `${it.id} classify ${n}`)); x.cards.forEach((c, i) => eq(c.bucket, m.buckets[i], `${it.id} card bucket`)); verified++; }
});
{ const seen = new Map(); prompts.forEach((p) => seen.set(p, (seen.get(p) || 0) + 1)); const dup = [...seen].filter(([, c]) => c > 1).map(([p]) => p); if (dup.length) console.log("duplicate prompts:", dup); eq(dup.length, 0, `iq prompts unique (${prompts.length})`); }
console.log(`iq questions independently verified: ${verified}`);


// ---------- new wording rule: the word «تدريب» is not used on /restore and /iq ----------
{
  const strings = [];
  (function walk(o) { if (typeof o === "string") strings.push(o); else if (Array.isArray(o)) o.forEach(walk); else if (o && typeof o === "object") Object.values(o).forEach(walk); })([restore, iq]);
  eq(strings.filter((t) => /تدريب/.test(t)).length, 0, "no «تدريب» in restore/iq data");
}

// ---------- brain (30 x 9), proc (18 x 11), dragon (22 x 16) ----------
const SPECS = {
  brain: { track: brain, S: 30, N: 9, prefix: "bd", slots: ["quiz", "scenario", "memory", "sprint", "order", "match", "classify", "reflect", "recall"], need: 7 },
  proc: { track: proc, S: 18, N: 11, prefix: "pc", slots: ["breathe", "quiz", "scenario", "sprint", "order", "match", "classify", "reflect", "recall", "calibrate", "quiz"], need: 8 },
  dragon: { track: dragon, S: 22, N: 16, prefix: "dg", slots: ["move", "move", "move", "breathe", "quiz", "scenario", "sprint", "order", "match", "classify", "reflect", "recall", "calibrate", "quiz", "memory", "sprint"], need: 12 },
};
function checkNewInteraction(it) {
  const x = it.interaction, id = it.id, need = (c, m) => ok(c, `${id} ${x.type}: ${m}`);
  const mc = (q) => { need(q.options.length === 4 && new Set(q.options.map((o) => o.ar)).size === 4, "4 unique options"); need(q.correct >= 0 && q.correct < 4 && q.explain.ar.length > 3, "correct+explain"); };
  switch (x.type) {
    case "quiz": need(x.questions.length >= 2, "questions"); x.questions.forEach(mc); break;
    case "scenario": need(x.choices.length === 3 && x.choices.some((c) => c.score >= 80) && x.choices.every((c) => c.why.ar), "choices"); break;
    case "sprint": need(x.seconds >= 30 && x.checks.length === 4, "sprint"); break;
    case "order": need(x.items.length === 4 && x.showPrompt, "order"); break;
    case "match": need(x.pairs.length === 3, "pairs"); break;
    case "classify": need(x.buckets.length === 2 && x.cards.length === 5 && x.cards.filter((c) => c.bucket === "help").length === 3, "classify"); break;
    case "reflect": need(x.prompts.length === 2, "prompts"); break;
    case "recall": need(x.accept.length >= 1 && x.explain.ar, "recall"); break;
    case "calibrate": mc(x.question); break;
    case "breathe": need(x.cycles >= 3 && x.inhale >= 3 && x.exhale >= 3, "params"); break;
    case "memory": { const a = x.items.map((i) => i.ar), b = x.decoys.map((i) => i.ar); need(a.length >= 5 && a.length === b.length && new Set([...a, ...b]).size === a.length * 2 && x.seconds > 10, "memory sets"); break; }
    case "move": need(x.moves.length >= 3 && x.moves.every((m) => m.seconds >= 20 && m.name.ar && m.hint.ar) && /توقف/.test(x.safety.ar) && /ألم/.test(x.safety.ar) && /وليست علاجًا/.test(x.safety.ar), "moves + safety note"); break;
    default: need(false, "unknown type " + x.type);
  }
}
for (const [name, sp] of Object.entries(SPECS)) {
  const t = sp.track;
  checkStructure(name, t, sp.S, sp.N, sp.prefix);
  t.items.forEach((it) => {
    checkNewInteraction(it);
    ok(/تعليمي/.test(it.rationale.ar) || /ليست علاجًا/.test(it.rationale.ar), `${it.id} educational note`);
  });
  t.stages.forEach((s) => {
    const its = t.items.filter((i) => i.stageId === s.id);
    sp.slots.forEach((ty, k) => eq(its[k].interaction.type, ty, `${s.id} slot ${k + 1} type`));
    // independent cross-check of derived questions against the stage's own ordered steps and reasons
    const ord = its.find((i) => i.interaction.type === "order").interaction.items.map((i) => i.ar);
    const mat = its.find((i) => i.interaction.type === "match").interaction.pairs;
    eq(ord.length, 4, `${s.id} four steps`); mat.forEach((p, k) => eq(p.left.ar, ord[k], `${s.id} match step ${k} = order step ${k}`));
    const correctText = (q) => q.options[q.correct].ar;
    if (name !== "brain") {
      const dq = its.filter((i) => i.interaction.type === "quiz")[1].interaction.questions;
      eq(dq.length, 3, `${s.id} dq has 3 questions`);
      eq(correctText(dq[0]), ord[0], `${s.id} dq first step`); eq(correctText(dq[1]), ord[1], `${s.id} dq second step`); eq(correctText(dq[2]), mat[2].right.ar, `${s.id} dq reason`);
      const cal = its.find((i) => i.interaction.type === "calibrate").interaction.question; eq(correctText(cal), mat[1].right.ar, `${s.id} calibrate reason`);
    }
    // quiz answers are not always in the same position
  });
  const pos = t.items.filter((i) => i.interaction.type === "quiz").flatMap((i) => i.interaction.questions.map((q) => q.correct));
  ok(new Set(pos).size === 4, `${name} correct-answer positions vary`);
  const qp = t.items.filter((i) => i.interaction.type === "quiz").flatMap((i) => i.interaction.questions.map((q) => q.prompt.ar)); eq(new Set(qp).size, qp.length, `${name} quiz prompts unique`);
  eq(stageProgress(t.items, [], sp.prefix + "01").need, sp.need, `${name} unlock need`);
  ok(isStageUnlocked(t, [], [], sp.prefix + "01") && !isStageUnlocked(t, [], [], sp.prefix + "02"), `${name} lock state at start`);
  const s1 = t.items.filter((i) => i.stageId === sp.prefix + "01"), att = (n) => s1.slice(0, n).map((i) => ({ trainingId: i.id, passed: true }));
  ok(!isStageUnlocked(t, att(sp.need - 1), [], sp.prefix + "02") && isStageUnlocked(t, att(sp.need), [], sp.prefix + "02"), `${name} unlock at ${sp.need}/${sp.N}`);
}
const moveItems = dragon.items.filter((i) => i.interaction.type === "move");
eq(moveItems.length, 22 * 3, "dragon has 3 physical move routines per stage");
ok(moveItems[moveItems.length - 1].interaction.moves.length > moveItems[0].interaction.moves.length, "move routines grow");
const allIds = [...restore.items, ...iq.items, ...brain.items, ...proc.items, ...dragon.items].map((i) => i.id);
eq(new Set(allIds).size, allIds.length, "all exercise ids unique across tracks");

// ---------- unlock helper ----------
{
  const t = restore, s1 = t.items.filter((i) => i.stageId === "rs01");
  ok(isStageUnlocked(t, [], [], "rs01"), "stage 1 always open"); ok(!isStageUnlocked(t, [], [], "rs02"), "stage 2 locked at start");
  const need = stageProgress(t.items, [], "rs01").need; eq(need, 7, "restore need = ceil(0.7*9)");
  const att = (n) => s1.slice(0, n).map((i) => ({ trainingId: i.id, passed: true }));
  ok(!isStageUnlocked(t, att(need - 1), [], "rs02"), "6/9 does not unlock"); ok(isStageUnlocked(t, att(need), [], "rs02"), "7/9 unlocks");
  ok(isStageUnlocked(t, [], ["rs02"], "rs02"), "manual override unlocks"); ok(!isStageUnlocked(t, [], [], "rs30"), "stage 30 locked");
  eq(stageProgress(iq.items, [], "iq01").need, 7, "iq need = 7/10");
}
console.log(`restore: ${restore.stages.length} stages x 9 = ${restore.items.length} exercises; types`, JSON.stringify(seenR));
console.log(`iq: ${iq.stages.length} stages x 10 = ${iq.items.length} exercises`);
for (const [n, sp] of Object.entries(SPECS)) console.log(`${n}: ${sp.track.stages.length} stages x ${sp.N} = ${sp.track.items.length} exercises`);
console.log(`${checks} checks, ${fails} failed`);
if (fails) { console.log("RESULT: FAIL"); process.exit(1); }
console.log("RESULT: PASS (restore 30x9=270, iq 20x10=200, brain 30x9=270, proc 18x11=198, dragon 22x16=352)");
