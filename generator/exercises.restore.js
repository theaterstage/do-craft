// ---- «استعادة الدوبامين»: 30 stages x 9 exercises ----
const NOTE_AR = "هذه ممارسة تعليمية للعادات، وليست علاجًا ولا تشخيصًا ولا بديلًا عن الطبيب أو المختص.";
const NOTE_EN = "This is educational habit practice. It is not treatment, diagnosis, or a substitute for a doctor.";
const RS_SKILL = ["metacognition","metacognition","digital","digital","digital","regulation","regulation","digital","regulation","initiation","initiation","regulation","initiation","focus","regulation","regulation","digital","confidence","regulation","focus","confidence","regulation","focus","digital","metacognition","initiation","metacognition","regulation","mastery","mastery"];
const RS_EN = ["Understand dopamine simply","Know your triggers","Your screen baseline","A notification fast","Phone at a distance","Calm breathing","Delay gratification","A screen-free morning","Light, water, movement","The two-minute rule","Micro-goals","Reward after effort","Habit stacking","A 15-minute focus session","Sleep and night environment","Short movement breaks","Reduce temptations","Small wins","Boredom is not the enemy","Design a study session","When you slip","Steady food and water","25-minute deep focus","Evening screen limits","Track your progress","Hardest first","Weekly review","Mindful pauses","An integrated routine","A 30-day steady plan"];
const RS_SLOTS = [
  ["تنفّس هادئ","Calm breathing"],["اختبار قصير","Short quiz"],["موقف واختيار","Scenario"],["مؤقت وتركيز","Timed focus"],["رتّب الخطوات","Order the steps"],
  ["صِل السبب","Match the reason"],["صنّف العادات","Sort the habits"],["تأمّل وكتابة","Reflect"],["تذكّر وتحقق","Recall and check"]];
const RS_MIN = [3,3,3,4,3,3,3,4,3];

function mcq(r, spec, id) {
  // spec: [prompt, correct, w1, w2, w3, explanation]
  const opts = [spec[1], spec[2], spec[3], spec[4]];
  const order = shuf(r, [0, 1, 2, 3]);
  const options = order.map((i) => T(opts[i]));
  const correct = order.indexOf(0);
  if (new Set(options.map((o) => o.en)).size !== 4) throw new Error("dup option " + id);
  return { prompt: T(spec[0]), options, correct, explain: T(spec[5]) };
}

function buildRestore() {
  const stages = RS.map((s, i) => ({
    id: "rs" + pad2(i + 1), index: i + 1, skill: RS_SKILL[i],
    title: T(s.t[0], RS_EN[i]),
    blurb: T(s.b + " " + NOTE_AR, s.b + " " + NOTE_EN),
  }));
  const items = [];
  RS.forEach((s, si) => {
    const st = stages[si], n = si + 1;
    const diff = clamp(1 + Math.floor(si / 6), 1, 5);
    const mk = (slot, interaction, instr, extra = {}) => {
      const idx = slot + 1;
      items.push({
        id: st.id + "-t" + pad2(idx), stageId: st.id, index: idx, masteryThreshold: 80,
        title: T(s.t[0] + " · " + RS_SLOTS[slot][0], RS_EN[si] + " · " + RS_SLOTS[slot][1]),
        objective: T("تدرّب على: " + s.t[0] + ".", "Practice: " + RS_EN[si] + "."),
        rationale: T(s.b + " " + NOTE_AR, s.b + " " + NOTE_EN),
        instructions: T(instr),
        coachNote: T("امدح الخطوة الصغيرة التي تمّت، لا الشخص. " + NOTE_AR, "Praise the small step, not the person. " + NOTE_EN),
        interaction, difficulty: clamp(diff + (slot >= 6 ? 1 : 0), 1, 5), minutes: RS_MIN[slot], skill: st.skill,
        reflection: T(s.d[0]), ...extra,
      });
    };
    const R = (k) => rng("rs|" + n + "|" + k);
    // 1 breathe
    const cycles = 3 + Math.floor(si / 6), inhale = 4, hold = si >= 9 ? 2 : 0, exhale = si >= 9 ? 6 : 4;
    mk(0, { type: "breathe", inhale, hold, exhale, cycles, task: T("تنفّس ببطء مع الدائرة. شهيق " + inhale + " ثوانٍ" + (hold ? "، ثم احبس " + hold : "") + "، ثم زفير " + exhale + " ثوانٍ. غرضه تهدئة اللحظة قبل العمل.", "Breathe slowly with the circle: in " + inhale + "s" + (hold ? ", hold " + hold + "s" : "") + ", out " + exhale + "s.") },
       "اضغط ابدأ وتنفّس مع الدائرة حتى تُكمل الدورات. يمكنك الإنهاء مبكرًا، لكن الدرجة تتبع ما أكملته.");
    // 2 quiz (2 q)
    mk(1, { type: "quiz", questions: [mcq(R(2), s.q[0], st.id), mcq(R(3), s.q[1], st.id)] }, "اقرأ السؤال، اختر جوابًا، ثم اقرأ الشرح.");
    // 3 scenario
    const ch = shuf(R(4), s.s[1].map((c) => ({ text: T(c[0]), score: c[1], why: T(c[2]) })));
    mk(2, { type: "scenario", prompt: T(s.s[0]), choices: ch }, "اقرأ الموقف واختر التصرف الأنسب.");
    // 4 sprint
    const secs = Math.min(90, 30 + 2 * n);
    mk(3, { type: "sprint", seconds: secs, task: T("ابدأ المؤقت ونفّذ: " + s.d[0] + "، ثم " + s.d[1] + "."), checks: s.d.slice(0, 4).map((d) => T("فعلت: " + d)) }, "ابدأ المؤقت، نفّذ الخطوات، ثم علّم ما أنجزته.");
    // 5 order
    mk(4, { type: "order", showPrompt: true, prompt: T("رتّب خطوات: " + s.t[0]), items: s.d.map((d) => T(d)), explain: T("هذا هو الترتيب: " + s.d.join(" ← ")) }, "رتّب الخطوات بحيث تكون الخطوة الأولى في الأعلى، ثم اضغط تحقق.");
    // 6 match
    mk(5, { type: "match", prompt: T("صِل كل خطوة بسبب فائدتها."), pairs: [0, 1, 2].map((k) => ({ left: T(s.d[k]), right: T(s.w[k]) })) }, "اربط كل خطوة بسببها الصحيح، ثم اضغط تحقق.");
    // 7 classify
    const cards = shuf(R(8), [...s.d.slice(0, 3).map((t) => ({ text: T(t), bucket: "help" })), ...s.x.map((t) => ({ text: T(t), bucket: "hinder" }))]);
    mk(6, { type: "classify", prompt: T("صنّف كل عادة: هل تساعد على التركيز أم تعيقه؟"), buckets: [{ id: "help", label: T("تساعد", "Helps") }, { id: "hinder", label: T("تعيق", "Hinders") }], cards }, "اختر بطاقة ثم اضغط التصنيف المناسب لها.");
    // 8 reflect
    mk(7, { type: "reflect", prompts: s.r.map((p) => T(p)) }, "اكتب جملتين صادقتين على الأقل. لا توجد إجابة خاطئة.");
    // 9 recall (even stage) / calibrate (odd stage)
    if (n % 2 === 0) mk(8, { type: "recall", prompt: T(s.c[0]), accept: s.c[1].slice(), explain: T(s.c[2]), placeholder: T("اكتب الجواب هنا", "Type the answer") }, "اكتب الجواب من ذاكرتك، ثم اقرأ الشرح.");
    else { const q = mcq(R(9), s.q[2], st.id); mk(8, { type: "calibrate", question: q }, "حرّك المؤشر ليعبّر عن ثقتك، ثم اختر الجواب."); }
  });
  return { stages, items };
}
