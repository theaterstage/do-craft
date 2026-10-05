// ---- «تبلد الدماغ» (30x9), «مواجهة المماطلة» (18x11), «ترويض التنين الخامل» (22x16) ----
const SAFE_NOTE = "تمارين تعليمية وعادات عامة، وليست علاجًا ولا تشخيصًا ولا بديلًا عن الطبيب أو المختص.";
const MOVE_SAFE = "تنبيه سلامة: تحرّك بلطف ولا تتجاوز راحتك. توقف فورًا عند أي ألم أو دوار أو ضيق في النفس. هذه حركات عامة وليست علاجًا؛ استشر طبيبًا إن كانت لديك حالة صحية أو إصابة.";
const MEM_WORDS = ["قلم","نافذة","جبل","كتاب","بحر","شجرة","ساعة","مفتاح","سحابة","حديقة","جسر","مصباح","قمر","نهر","طريق","باب","كرسي","وردة","سلّم","خيمة","قارب","مطر","طائر","حجر","قهوة","تفاحة","مرآة","شمس","صحراء","غيمة","سفينة","مدينة","جدار","ورقة","خريطة","بوصلة","قنديل","سجادة","حقيبة","ميزان","فنجان","زهرة","واحة","قلعة","منارة","بستان","شلال","كهف","سهل","وادٍ","نجمة","ريشة","سلة","مظلة","زجاجة","ستارة","دفتر","مسطرة","فرشاة","حبل","شبكة","مقص","قفل","إبريق","طبق","وسادة","عربة","طائرة","قطار","دراجة","مرساة","شاطئ","جزيرة","غابة","بركة","ينبوع","تلّ","نفق","سور","برج","سوق","ميدان","مكتبة","مدرسة","ملعب","حديد","نحاس","فضة","ذهب","زيتون","تمر","عنب","رمّان","ليمون","نعناع","زعتر","قمح","شعير","عسل"];
const MOVES = {
  home: [["مشي في المكان","ارفع ركبتيك قليلًا وحرّك ذراعيك بوتيرة مريحة."],["رفع الذراعين","ارفع الذراعين للأعلى مع شهيق وأنزلهما مع زفير ببطء."],["جلوس-وقوف على كرسي ثابت","اجلس ببطء ثم قف، وكرّر بتحكم."],["ضغط الحائط","ضع كفيك على الحائط وقرّب صدرك منه ثم ادفع بلطف."],["رفع الكعبين","قف ممسكًا بحافة ثابتة وارتفع على أصابع القدمين ثم انزل ببطء."],["خطوات جانبية","اخطُ يمينًا ثم يسارًا بخطوات صغيرة متزنة."],["دوران الكتفين","ارسم دوائر كبيرة بكتفيك إلى الخلف ببطء."],["رفع الركبة بالتناوب","ارفع ركبة ثم الأخرى وأنت ممسك بشيء ثابت إن احتجت."],["قرفصاء خفيفة بإسناد","انزل قليلًا ممسكًا بحافة ثابتة ثم قف."]],
  desk: [["دوران المعصمين","ارسم دوائر صغيرة بمعصميك في الاتجاهين."],["إمالة الرقبة يمينًا","أمل رأسك نحو كتفك الأيمن بلطف دون رفع الكتف."],["إمالة الرقبة يسارًا","أمل رأسك نحو كتفك الأيسر بلطف."],["رفع الكتفين وخفضهما","ارفع كتفيك نحو أذنيك ثم أرخهما دفعة واحدة."],["فتح الصدر","اشبك يديك خلف ظهرك وافتح صدرك بلطف."],["لفّ الجذع جالسًا","أدر جذعك قليلًا ناحية اليمين ثم اليسار وأنت جالس."],["رفع الساق جالسًا","مد ساقًا أمامك وثبتها ثوانٍ ثم بدّل."],["تحريك الكاحلين","ارسم دوائر بقدميك وأنت جالس."],["نظر بعيد","انظر إلى أبعد نقطة تراها ثم أغمض عينيك قليلًا."]],
  stretch: [["تمدد الجانب","ارفع ذراعًا واملْ جذعك للجهة الأخرى بلطف."],["تمدد الفخذ الأمامي","ثنِّ ركبة للخلف وأمسك قدمك بيدك مع إسناد على حائط."],["تمدد الساق الخلفية","ضع كعبك على الأرض أمامك واملْ للأمام برفق."],["تمدد الكتف","اسحب ذراعًا أمام صدرك بيد الذراع الأخرى."],["تمدد الظهر العلوي","ضمّ كفيك أمامك وادفعهما للأمام مع تدوير الظهر قليلًا."],["تمدد الرقبة الخلفي","قرّب ذقنك من صدرك بلطف."],["تمدد الورك","اجلس على طرف الكرسي وضع كاحلًا على الركبة الأخرى برفق."],["وقفة الجبل","قف معتدلًا مع شهيق وارفع ذراعيك ثم أنزلهما بزفير."],["التفاف لطيف للجذع","قف وأدر جذعك قليلًا مع استرخاء الذراعين."]],
};
function norm(a) {
  return { t: a[0], b: a[1], d: a[2], w: a[3], x: a[4], q: a[5], s: a[6], r: a[7], c: a[8] };
}
function uniq4(arr) { return new Set(arr).size === arr.length; }
function pickOther(r, pool, avoid, n) {
  const c = shuf(r, pool.filter((p) => !avoid.includes(p)));
  const out = [];
  for (const p of c) { if (!out.includes(p)) out.push(p); if (out.length === n) break; }
  return out;
}
function mcq3(r, id, prompt, correct, wrongs, explain) {
  const opts = [correct, ...wrongs];
  if (opts.length !== 4 || !uniq4(opts)) throw new Error("bad derived mcq " + id + ": " + prompt);
  const order = shuf(r, [0, 1, 2, 3]);
  return { prompt: T(prompt), options: order.map((i) => T(opts[i])), correct: order.indexOf(0), explain: T(explain) };
}
const SLOT_LABEL = {
  quiz: ["اختبار قصير", "Short quiz"], scenario: ["موقف واختيار", "Scenario"], memory: ["لعبة الذاكرة", "Memory game"], sprint: ["مؤقت وتركيز", "Timed focus"],
  order: ["رتّب الخطوات", "Order the steps"], match: ["صِل السبب", "Match the reason"], classify: ["صنّف العادات", "Sort the habits"], reflect: ["تأمّل وكتابة", "Reflect"],
  recall: ["تذكّر وتحقق", "Recall and check"], calibrate: ["قدّر ثقتك", "Calibrate"], breathe: ["تنفّس هادئ", "Calm breathing"], dq: ["أسئلة سريعة", "Quick questions"],
  move1: ["حركة منزلية", "Home moves"], move2: ["حركة المكتب", "Desk moves"], move3: ["تمدد لطيف", "Gentle stretch"], check: ["قائمة اليوم", "Today's checklist"],
};
const SLOT_MIN = { quiz: 3, scenario: 3, memory: 3, sprint: 4, order: 3, match: 3, classify: 3, reflect: 4, recall: 3, calibrate: 3, breathe: 3, dq: 3, move1: 4, move2: 3, move3: 3, check: 3 };
function buildCustom(cfg) {
  const S = cfg.data.map(norm);
  if (S.length !== cfg.stages) throw new Error(cfg.key + " stage count " + S.length);
  const allX = S.flatMap((s) => s.x);
  const stages = S.map((s, i) => ({
    id: cfg.prefix + pad2(i + 1), index: i + 1, skill: cfg.skills[i % cfg.skills.length],
    title: T(s.t),
    blurb: T(s.b + " " + SAFE_NOTE, s.b + " Educational practice only, not treatment."),
  }));
  const items = [];
  S.forEach((s, si) => {
    const st = stages[si], n = si + 1;
    const diff = clamp(1 + Math.floor((si * 4) / cfg.stages), 1, 5);
    const R = (k) => rng(cfg.key + "|" + n + "|" + k);
    cfg.slots.forEach((kind, slot) => {
      const idx = slot + 1;
      const extra = {};
      let interaction, instr;
      switch (kind) {
        case "quiz": interaction = { type: "quiz", questions: [mcq(R("q0"), s.q[0], st.id), mcq(R("q1"), s.q[1], st.id)] }; instr = "اقرأ السؤال، اختر جوابًا، ثم اقرأ الشرح."; break;
        case "scenario": {
          const ch = shuf(R("sc"), s.s[1].map((c) => ({ text: T(c[0]), score: c[1], why: T(c[2]) })));
          interaction = { type: "scenario", prompt: T(s.s[0]), choices: ch }; instr = "اقرأ الموقف واختر التصرف الأنسب."; break; }
        case "memory": {
          const cnt = 5 + Math.floor((si * 5) / cfg.stages);
          const pool = shuf(R("mem"), MEM_WORDS.slice());
          const items2 = pool.slice(0, cnt), decoys = pool.slice(cnt, cnt + cnt);
          interaction = { type: "memory", seconds: 12 + 2 * cnt, items: items2.map((w) => T(w)), decoys: decoys.map((w) => T(w)),
            task: T("احفظ هذه الكلمات. جرّب تقطيعها في مجموعات، أو ربطها بقصة قصيرة أو بأماكن مألوفة (قصر الذاكرة). بعد انتهاء الوقت تُخفى القائمة ثم تختار ما رأيته.") };
          instr = "ابدأ الحفظ، وحين تُخفى الكلمات اختر ما رأيته ثم اضغط تحقق."; break; }
        case "sprint": {
          const secs = Math.min(120, 40 + 3 * n);
          interaction = { type: "sprint", seconds: secs, task: T("ابدأ المؤقت ونفّذ: " + s.d[0] + "، ثم " + s.d[1] + "."), checks: s.d.slice(0, 4).map((d) => T("فعلت: " + d)) };
          instr = "ابدأ المؤقت، نفّذ الخطوات، ثم علّم ما أنجزته."; break; }
        case "check": {
          interaction = { type: "sprint", seconds: 30 + n, task: T("قائمة اليوم: اختر ما ستفعله فعلًا اليوم من هذه الخطوات، وابدأ أولاها الآن."), checks: s.d.slice().reverse().map((d) => T("سأفعل: " + d)) };
          instr = "ابدأ المؤقت وعلّم ما التزمت به."; break; }
        case "order": interaction = { type: "order", showPrompt: true, prompt: T("رتّب خطوات: " + s.t), items: s.d.map((d) => T(d)), explain: T("هذا هو الترتيب المقترح: " + s.d.join(" ← ")) }; instr = "رتّب الخطوات بحيث تكون الخطوة الأولى في الأعلى، ثم اضغط تحقق."; break;
        case "match": interaction = { type: "match", prompt: T("صِل كل خطوة بسبب فائدتها."), pairs: [0, 1, 2].map((k) => ({ left: T(s.d[k]), right: T(s.w[k]) })) }; instr = "اربط كل خطوة بسببها الصحيح، ثم اضغط تحقق."; break;
        case "classify": {
          const cards = shuf(R("cl"), [...s.d.slice(0, 3).map((t) => ({ text: T(t), bucket: "help" })), ...s.x.map((t) => ({ text: T(t), bucket: "hinder" }))]);
          interaction = { type: "classify", prompt: T("صنّف كل عبارة: هل تساعد أم تعيق؟"), buckets: [{ id: "help", label: T("تساعد", "Helps") }, { id: "hinder", label: T("تعيق", "Hinders") }], cards };
          instr = "اختر بطاقة ثم اضغط التصنيف المناسب لها."; break; }
        case "reflect": interaction = { type: "reflect", prompts: s.r.map((p) => T(p)) }; instr = "اكتب جملتين صادقتين على الأقل. لا توجد إجابة خاطئة."; break;
        case "recall": interaction = { type: "recall", prompt: T(s.c[0]), accept: s.c[1].slice(), explain: T(s.c[2]), placeholder: T("اكتب الجواب هنا", "Type the answer") }; instr = "اكتب الجواب من ذاكرتك، ثم اقرأ الشرح."; break;
        case "calibrate": {
          const q = mcq3(R("cal"), st.id, "لماذا تفيد الخطوة: «" + s.d[1] + "»؟", s.w[1] === undefined ? s.w[0] : s.w[1],
            pickOther(R("calw"), S.flatMap((o) => o.w), s.w, 3), "السبب المناسب لهذه الخطوة هو: " + s.w[1]);
          interaction = { type: "calibrate", question: q }; instr = "حرّك المؤشر ليعبّر عن ثقتك، ثم اختر الجواب."; break; }
        case "breathe": {
          const cycles = 3 + Math.floor((si * 3) / cfg.stages), inhale = 4, hold = si >= cfg.stages / 3 ? 2 : 0, exhale = si >= cfg.stages / 3 ? 6 : 4;
          interaction = { type: "breathe", inhale, hold, exhale, cycles, task: T("تنفّس ببطء مع الدائرة: شهيق " + inhale + " ثوانٍ" + (hold ? "، ثم احبس " + hold : "") + "، ثم زفير " + exhale + " ثوانٍ. غرضه تهدئة اللحظة قبل العمل. إن شعرت بدوار فتنفّس بشكل طبيعي.") };
          instr = "اضغط ابدأ وتنفّس مع الدائرة حتى تُكمل الدورات. يمكنك الإنهاء مبكرًا."; break; }
        case "dq": {
          const otherD = S.flatMap((o, oi) => (oi === si ? [] : o.d)), otherW = S.flatMap((o, oi) => (oi === si ? [] : o.w));
          const qs = [
            mcq3(R("d1"), st.id, "حسب ترتيب «" + s.t + "»: ما الخطوة الأولى؟", s.d[0], [s.d[1], s.d[2], s.d[3]], "الخطوة الأولى هي: " + s.d[0]),
            mcq3(R("d2"), st.id, "في «" + s.t + "»: ما الخطوة التي تأتي مباشرة بعد «" + s.d[0] + "»؟", s.d[1], [s.d[2], s.d[3], pickOther(R("d2w"), otherD, s.d, 1)[0]], "بعدها تأتي: " + s.d[1]),
            mcq3(R("d3"), st.id, "لماذا تفيد الخطوة «" + s.d[2] + "»؟", s.w[2], [s.w[0], s.w[1], pickOther(R("d3w"), otherW, s.w, 1)[0]], s.w[2]),
          ];
          interaction = { type: "quiz", questions: qs }; instr = "ثلاثة أسئلة سريعة عن الخطوات وأسبابها."; break; }
        case "move1": case "move2": case "move3": {
          const pool = MOVES[kind === "move1" ? "home" : kind === "move2" ? "desk" : "stretch"];
          const cnt = 3 + Math.floor((si * 2) / cfg.stages), start = (si * 2 + (kind === "move2" ? 3 : kind === "move3" ? 5 : 0)) % pool.length;
          const secs = 20 + 5 * Math.floor((si * 3) / cfg.stages);
          const moves = Array.from({ length: cnt }, (_, k) => { const m = pool[(start + k) % pool.length]; return { name: T(m[0]), hint: T(m[1]), seconds: secs }; });
          interaction = { type: "move", moves, safety: T(MOVE_SAFE), task: T("روتين قصير من " + cnt + " حركات، " + secs + " ثانية لكل حركة. اضغط ابدأ المؤقت ثم «أنهيت» عند الانتهاء.") };
          instr = "نفّذ كل حركة بلطف مع المؤقت. إن شعرت بألم فتوقف وتخطَّ الحركة."; break; }
        default: throw new Error("slot " + kind);
      }
      const lab = SLOT_LABEL[kind];
      items.push({
        id: st.id + "-t" + pad2(idx), stageId: st.id, index: idx, masteryThreshold: 80,
        title: T(s.t + " · " + lab[0], s.t + " · " + lab[1]),
        objective: T("تمرّن على: " + s.t + ".", "Practice: " + s.t + "."),
        rationale: T(s.b + " " + SAFE_NOTE, s.b + " Educational practice only, not treatment."),
        instructions: T(instr),
        coachNote: T("امدح الخطوة الصغيرة التي تمّت، لا الشخص. " + SAFE_NOTE, "Praise the small step. Educational only."),
        interaction, difficulty: clamp(diff + (slot >= cfg.slots.length - 3 ? 1 : 0), 1, 5), minutes: SLOT_MIN[kind], skill: st.skill,
        reflection: T(s.d[0]), ...extra,
      });
    });
  });
  return { stages, items };
}
const BRAIN_SLOTS = ["quiz", "scenario", "memory", "sprint", "order", "match", "classify", "reflect", "recall"];
const PROC_SLOTS = ["breathe", "quiz", "scenario", "sprint", "order", "match", "classify", "reflect", "recall", "calibrate", "dq"];
const DRAGON_SLOTS = ["move1", "move2", "move3", "breathe", "quiz", "scenario", "sprint", "order", "match", "classify", "reflect", "recall", "calibrate", "dq", "memory", "check"];
const brain = buildCustom({ key: "bd", prefix: "bd", stages: 30, slots: BRAIN_SLOTS, data: BR_DATA, skills: ["metacognition", "focus", "mastery"] });
const proc = buildCustom({ key: "pc", prefix: "pc", stages: 18, slots: PROC_SLOTS, data: PR_DATA, skills: ["initiation", "regulation", "confidence"] });
const dragon = buildCustom({ key: "dg", prefix: "dg", stages: 22, slots: DRAGON_SLOTS, data: DR_DATA, skills: ["regulation", "initiation", "focus"] });
