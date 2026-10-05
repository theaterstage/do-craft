import{E as Link,P as getJsx,c as useStore,a as Card,i as PageHeader,o as useStrings,s as useT}from"./chrome-0wY267Au.js";
import{a as daStages,i as primeItems,n as mindItems,o as daItems,r as primeStages,t as mindStages}from"./socket-logic-yA78YzhR.js";
import{l as statusOf,t as statusLabels}from"./academy-view-CR5YzpcY.js";
import{t as Button}from"./button-CnByHSfE.js";
import{restore as RESTORE,iq as IQ,brain as BRAIN,proc as PROC,dragon as DRAGON,isStageUnlocked,stageProgress}from"./__EXERCISES__";
import{Stats,PathMap,useTrackState}from"./__KIT__";
const jsx=getJsx();
const TRACKS={
  mind:{path:"/mind",stagePath:"/mind/$stageId",data:{stages:mindStages,items:mindItems},title:s=>s.mindFull,
    lede:{en:"Ten stages. Ten exercises in each. Attention, memory, and finding the rule. The score is about today, not an IQ.",ar:"عشر مراحل. في كل مرحلة عشرة تمارين. انتباه، وتذكر، وإيجاد القاعدة. الدرجة عن اليوم، وليست ذكاء."}},
  prime:{path:"/prime",stagePath:"/prime/$stageId",data:{stages:primeStages,items:primeItems},title:s=>s.primeFull,
    lede:{en:"Twelve stages. Twelve exercises in each. You choose, sort, type from memory, and do a short timed step. Then you see why.",ar:"١٢ مرحلة. في كل مرحلة ١٢ تمرين. تختار، وترتّب، وتكتب من الذاكرة، وتعمل خطوة قصيرة بالوقت. ثم تشوف لماذا."}},
  dopamine:{path:"/dopamine",stagePath:"/dopamine/$stageId",data:{stages:daStages,items:daItems},title:s=>s.dopamineFull,
    lede:{en:"Nineteen stages. Fourteen exercises in each. Small moves that make starting work easier. This does not test dopamine in the blood and it is not medicine.",ar:"١٩ مرحلة. في كل مرحلة ١٤ تدريب. حركات صغيرة تسهّل بدء الشغل. هذا لا يقيس الدوبامين في الدم وليس دواء."},
    cross:{to:"/restore",label:{en:"Go deeper: Dopamine restoration — 30 stages × 9 exercises",ar:"تعمّق أكثر: استعادة الدوبامين — ٣٠ مرحلة × ٩ تمارين"}}},
  restore:{path:"/restore",stagePath:"/restore/$stageId",data:RESTORE,lock:true,title:()=>({en:"Dopamine restoration",ar:"استعادة الدوبامين"}),
    lede:{en:"Eases studying: pay attention, remember, and start. Every exercise explains the answer. The score is not intelligence.",ar:"يسهّل المذاكرة: انتبه، وتذكّر، وابدأ. كل تمرين يشرح الجواب. الدرجة ليست ذكاء."},
    tagline:{en:"The most efficient exercises for activating the mind and reducing cheap dopamine",ar:"التمارين الأعلى كفاءة في تنشيط العقل وتقليل الدوبامين الرخيص"},
    callout:{en:"Restoring your mind is worth trying every day",ar:"استعادة عقلك تستحق المحاولة كل يوم"},
    intro:{en:"Thirty stages. Nine interactive exercises in each: breathing, timers, scenarios, sorting, and reflection. Small habits that help you work and study.",ar:"٣٠ مرحلة. في كل مرحلة ٩ تمارين تفاعلية: تنفّس، ومؤقتات، ومواقف، وتصنيف، وتأمل. عادات صغيرة تساعدك على العمل والدراسة."},
    note:{en:"Educational only. This is not treatment, diagnosis, or medical advice, and it does not measure dopamine. If you struggle with sleep, mood, or daily life, talk to a doctor or a qualified professional.",ar:"تعليمي فقط. هذا ليس علاجًا ولا تشخيصًا ولا نصيحة طبية، ولا يقيس الدوبامين. إذا كنت تعاني في النوم أو المزاج أو الحياة اليومية فتحدّث مع طبيب أو مختص."},
    cross:{to:"/dopamine",label:{en:"Quick start-work moves: Dopamine ready",ar:"حركات بدء الشغل السريعة: جاهزية الدوبامين"}}},
  iq:{path:"/iq",stagePath:"/iq/$stageId",data:IQ,lock:true,title:()=>({en:"Intelligence training",ar:"تمارين زيادة الذكاء"}),
    lede:{en:"Eases studying: pay attention, remember, and start. Every exercise explains the answer. The score is not intelligence.",ar:"يسهّل المذاكرة: انتبه، وتذكّر، وابدأ. كل تمرين يشرح الجواب. الدرجة ليست ذكاء."},
    tagline:{en:"The most efficient exercises for activating the mind and reducing cheap dopamine",ar:"التمارين الأعلى كفاءة في تنشيط العقل وتقليل الدوبامين الرخيص"},
    callout:{en:"Restoring your mind is worth trying every day",ar:"استعادة عقلك تستحق المحاولة كل يوم"},
    intro:{en:"Twenty stages. Ten exercises in each: calculation, sequences, logic, and riddles. Every answer is explained right away. Difficulty rises each stage.",ar:"٢٠ مرحلة. في كل مرحلة ١٠ تمارين: حساب، ومتتاليات، ومنطق، وأحاجٍ. كل إجابة تُشرح فورًا. وتزداد الصعوبة مع كل مرحلة."},
    note:{en:"The score describes one try. It is not an IQ test and it does not measure how smart you are.",ar:"الدرجة تصف محاولة واحدة. هذه ليست اختبار ذكاء ولا تقيس مدى ذكائك."}},
  brain:{path:"/brain",stagePath:"/brain/$stageId",data:BRAIN,lock:true,title:()=>({en:"Brain-dullness resistance exercises",ar:"تمارين مقاومة تبلد الدماغ"}),
    lede:{en:"What is called brain rot is a risky dullness that reduces the mind's effectiveness, productivity, and liveliness. Here you will notice the amazing difference… Start, then take your rest. Do not rush results, and do not fall into the confusion of procrastination again.",ar:"ما يُعرف بتعفّن الدماغ هو تبلد خطر يقلل من فاعلية العقل وإنتاجيته ونشاطه. هنا ستلاحظ الفرق المذهل… ابدأ ثم خذ استراحتك لا تتعجل النتائج ولكن لا تقع في حيرة التسويف مجدداً"},
    intro:{en:"Thirty stages. Nine interactive exercises in each. A smart program that strengthens neural connections, memory, focus, and thinking, using Chinese and Japanese thinking methods wisely: kaizen, hansei, shu-ha-ri, ikigai-style reflection, Pomodoro-style focus, hara hachi bu, wu wei, yin and yang, Sun Tzu, go-style patterns, chunking, memory palaces, and mind maps.",ar:"٣٠ مرحلة. في كل مرحلة ٩ تمارين تفاعلية. برنامج ذكي يقوّي الروابط العصبية والذاكرة والتركيز وتطوير التفكير، باستعمال طرق التفكير الصينية واليابانية بحكمة: كايزن، وهانسي، وشو-ها-ري، وتأمل على طريقة إيكيغاي، وتركيز بأسلوب بومودورو، وهارا هاتشي بو، ووو وي، ويين ويانغ، وسون تزو، وأنماط غو، والتقطيع، وقصر الذاكرة، والخرائط الذهنية."},
    note:{en:"Educational only. This is not treatment, diagnosis, or medical advice. If you struggle with sleep, mood, or daily life, talk to a doctor or a qualified professional.",ar:"تعليمي فقط. هذا ليس علاجًا ولا تشخيصًا ولا نصيحة طبية. إذا كنت تعاني في النوم أو المزاج أو الحياة اليومية فتحدّث مع طبيب أو مختص."}},
  proc:{path:"/proc",stagePath:"/proc/$stageId",data:PROC,lock:true,map:true,prefix:"pc",title:()=>({en:"Facing procrastination",ar:"مواجهة المماطلة"}),
    lede:{en:"Eighteen stages. Eleven exercises in each. Follow the path: every stage you pass opens the next one.",ar:"١٨ مرحلة. في كل مرحلة ١١ تمرينًا. اتبع المسار: كل مرحلة تنجح فيها تفتح التي بعدها."},
    note:{en:"Educational only. This is not treatment, diagnosis, or medical advice.",ar:"تعليمي فقط. هذا ليس علاجًا ولا تشخيصًا ولا نصيحة طبية."}},
  dragon:{path:"/dragon",stagePath:"/dragon/$stageId",data:DRAGON,lock:true,map:true,prefix:"dg",title:()=>({en:"Taming the sluggish dragon",ar:"ترويض التنين الخامل"}),
    lede:{en:"Twenty-two stages. Sixteen exercises in each, with light movement you can do at home or at your desk. Follow the path.",ar:"٢٢ مرحلة. في كل مرحلة ١٦ تمرينًا، مع حركات خفيفة يمكنك فعلها في البيت أو على المكتب. اتبع المسار."},
    note:{en:"Safety: move gently and stop at once if you feel pain, dizziness, or shortness of breath. These are general educational exercises, not treatment. If you have a health condition or injury, ask a doctor first.",ar:"سلامة: تحرّك بلطف وتوقّف فورًا عند أي ألم أو دوار أو ضيق في النفس. هذه تمارين تعليمية عامة وليست علاجًا. إن كانت لديك حالة صحية أو إصابة فاسأل طبيبًا أولًا."}},
};
function typeLabel(type,ar){
  const m={quiz:["Choose","اختيار"],order:["Sort","رتّب"],recall:["Type","اكتب"],scenario:["Scene","موقف"],sprint:["Timer","مؤقت"],match:["Match","صِل"],classify:["Group","صنّف"],reflect:["Think","فكّر"],calibrate:["Guess","قدّر"],calc:["Calculate","احسب"],breathe:["Breathe","تنفّس"],memory:["Memory","ذاكرة"],move:["Move","حركة"]}[type]??["Do","اعمل"];
  return ar?m[1]:m[0];
}
function TrackLink({track,stageId,className,children}){
  const c=TRACKS[track];
  return stageId?jsx.jsx(Link,{to:c.stagePath,params:{stageId},className,children}):jsx.jsx(Link,{to:c.path,className,children});
}
function useProgress(c,attempts,overrides){
  const ids=new Set(attempts.filter(a=>a.passed&&c.data.items.some(i=>i.id===a.trainingId)).map(a=>a.trainingId));
  return{cleared:ids.size,unlocked:id=>!c.lock||isStageUnlocked(c.data,attempts,overrides,id)};
}
function TrackView({track}){
  const tr=useT(),s=useStrings(),attempts=useStore(e=>e.attempts),overrides=useStore(e=>e.stageOverrides),c=TRACKS[track],{stages,items}=c.data,pr=useProgress(c,attempts,overrides);
  return jsx.jsxs("div",{children:[
    jsx.jsx(PageHeader,{kicker:s.brand,title:tr(c.title(s)),lede:tr(c.lede)}),
    c.tagline?jsx.jsx("p",{className:"mb-3 font-semibold text-moss","data-testid":"track-tagline",children:tr(c.tagline)}):null,
    c.callout?jsx.jsx(Callout,{text:tr(c.callout)}):null,
    c.intro?jsx.jsx("p",{className:"mb-4","data-testid":"track-intro",children:tr(c.intro)}):null,
    c.note?jsx.jsx(Card,{className:"mb-4",children:jsx.jsx("p",{className:"text-sm","data-testid":"track-note",children:tr(c.note)})}):null,
    jsx.jsx("p",{className:"mb-4 text-sm text-muted",children:tr({en:`${pr.cleared} of ${items.length} cleared the line at least once.`,ar:`${pr.cleared} من ${items.length} تجاوزت الخط مرة واحدة على الأقل.`})}),
    c.map?jsx.jsx(MapBlock,{c,tr,attempts,overrides}):null,
    c.cross?jsx.jsx("p",{className:"mb-4",children:jsx.jsx(Link,{to:c.cross.to,className:"text-moss underline",children:tr(c.cross.label)})}):null,
    c.map?null:jsx.jsx("ol",{className:"divide-y divide-line border-y border-line",children:stages.map(st=>{
      const its=items.filter(e=>e.stageId===st.id),done=its.filter(e=>attempts.some(a=>a.trainingId===e.id&&a.passed)).length,open=pr.unlocked(st.id);
      const inner=jsx.jsxs(jsx.Fragment,{children:[
        jsx.jsx("span",{className:"font-display text-4xl text-copper tabular-nums",children:String(st.index).padStart(2,"0")}),
        jsx.jsxs("span",{children:[jsx.jsx("span",{className:"block text-lg",children:tr(st.title)}),jsx.jsx("span",{className:"mt-1 block text-sm text-muted",children:tr(st.blurb)}),open?null:jsx.jsx("span",{className:"mt-2 inline-block rounded-full bg-copper-soft px-2 py-0.5 text-xs font-semibold text-ink",children:tr({en:"Locked",ar:"مقفلة"})})]}),
        jsx.jsxs("span",{className:"text-sm tabular-nums text-muted",children:[done,"/",its.length]})]});
      return jsx.jsx("li",{"data-stage":st.id,"data-locked":open?"0":"1",children:jsx.jsx(Link,{to:c.stagePath,params:{stageId:st.id},className:"grid grid-cols-[auto_1fr_auto] items-center gap-4 py-4",children:inner})},st.id);
    })})
  ]});
}
function Callout({text}){
  return jsx.jsxs("div",{className:"relative mb-4 overflow-hidden rounded-card border border-copper bg-copper-soft p-5","data-testid":"bulb-callout",children:[
    jsx.jsxs("svg",{className:"pointer-events-none absolute inset-y-0 end-2 h-full opacity-20",viewBox:"0 0 64 64",width:"96",height:"96","aria-hidden":"true",focusable:"false",children:[
      jsx.jsx("path",{d:"M32 6c-10 0-18 7.700-18 17.500 0 6.200 3 10.500 6.500 14 2.100 2.200 3.500 4.700 3.500 7.500v2h16v-2c0-2.800 1.400-5.300 3.500-7.500 3.500-3.500 6.500-7.800 6.500-14C50 13.700 42 6 32 6z",fill:"currentColor"}),
      jsx.jsx("path",{d:"M24 52h16v4a4 4 0 0 1-4 4h-8a4 4 0 0 1-4-4v-4z",fill:"currentColor"}),
      jsx.jsx("path",{d:"M28 22c-2 2-3 4-3 7M32 2V0M8 12l-2-2M56 12l2-2",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",fill:"none"})]}),
    jsx.jsx("p",{className:"relative font-display text-2xl leading-snug",children:text})]});
}
function MapBlock({c,tr,attempts,overrides}){
  const streak=useStore(e=>e.streak),st=useTrackState(c.prefix,c.data.stages.length,c.data.items.length/c.data.stages.length,attempts,overrides);
  return jsx.jsxs("div",{className:"mb-6",children:[
    jsx.jsx(Stats,{xp:st.xp,streak,done:st.doneCount,total:c.data.stages.length,cleared:st.cleared,items:c.data.items.length,tr}),
    jsx.jsx(PathMap,{rows:st.rows,stagePath:c.stagePath,titles:c.data.stages.map(x=>tr(x.title)),tr})]});
}
function StageView({track,stageId}){
  const tr=useT(),s=useStrings(),locale=useStore(e=>e.locale),attempts=useStore(e=>e.attempts),overrides=useStore(e=>e.stageOverrides),unlock=useStore(e=>e.unlockStage),c=TRACKS[track],{stages,items}=c.data,pr=useProgress(c,attempts,overrides);
  const st=stages.find(e=>e.id===stageId);
  if(!st)return jsx.jsxs("div",{children:[jsx.jsx(PageHeader,{title:s.empty}),jsx.jsx(Link,{to:c.path,className:"text-moss underline",children:s.back})]});
  const its=items.filter(e=>e.stageId===st.id),open=pr.unlocked(st.id),idx=stages.indexOf(st),prev=idx>0?stages[idx-1]:null,pp=prev?stageProgress(items,attempts,prev.id):null,mine=stageProgress(items,attempts,st.id);
  return jsx.jsxs("div",{children:[
    jsx.jsx("p",{className:"text-sm text-muted",children:jsx.jsx(TrackLink,{track,className:"underline",children:tr(c.title(s))})}),
    jsx.jsx(PageHeader,{kicker:`${s.stage} ${st.index}`,title:tr(st.title),lede:tr(st.blurb)}),
    c.lock?jsx.jsx("p",{className:"mb-3 text-sm text-muted","data-testid":"stage-progress",children:tr({en:`Passed ${mine.passed} of ${mine.total}. Pass ${mine.need} to open the next stage.`,ar:`نجحت في ${mine.passed} من ${mine.total}. انجح في ${mine.need} لتفتح المرحلة التالية.`})}):null,
    open?null:jsx.jsx("div",{"data-testid":"stage-locked",children:jsx.jsxs(Card,{className:"mb-4",children:[
      jsx.jsx("p",{className:"font-semibold",children:tr({en:"This stage is locked.",ar:"هذه المرحلة مقفلة."})}),
      jsx.jsx("p",{className:"mt-2",children:tr({en:`Pass at least ${pp.need} of the ${pp.total} exercises in the previous stage (you have ${pp.passed}).`,ar:`انجح في ${pp.need} على الأقل من ${pp.total} تمرينًا في المرحلة السابقة (لديك ${pp.passed}).`})}),
      jsx.jsxs("div",{className:"mt-3 flex flex-wrap gap-2",children:[
        jsx.jsx(Button,{asChild:!0,children:jsx.jsx(Link,{to:c.stagePath,params:{stageId:prev.id},children:tr({en:"Go to the previous stage",ar:"اذهب إلى المرحلة السابقة"})})}),
        jsx.jsx(Button,{type:"button",variant:"secondary",onClick:()=>unlock(st.id),children:tr({en:"Unlock this stage anyway",ar:"افتح هذه المرحلة على أي حال"})})]})]})}),
    open?jsx.jsx("ol",{className:"divide-y divide-line border-y border-line",children:its.map(t=>{
      const status=statusOf(attempts,t.id,t.masteryThreshold),last=[...attempts].reverse().find(e=>e.trainingId===t.id);
      return jsx.jsx("li",{children:jsx.jsxs(Link,{to:"/train/$trainingId",params:{trainingId:t.id},className:"flex items-start justify-between gap-3 py-3",children:[
        jsx.jsxs("span",{children:[
          jsx.jsx("span",{className:"text-sm tabular-nums text-muted",children:t.index}),
          jsx.jsx("span",{className:"ms-2 rounded-full bg-moss-soft px-2 py-0.5 text-xs font-semibold text-ink",children:typeLabel(t.interaction.type,locale==="ar")}),
          jsx.jsx("span",{className:"mt-1 block text-lg",children:tr(t.title)}),
          jsxSpan(t,tr,locale,statusLabels[status])]}),
        jsx.jsx("span",{className:"font-display text-2xl tabular-nums",children:last?last.score:"—"})]})},t.id)})}):null,
    c.cross?jsx.jsx("p",{className:"mt-4",children:jsx.jsx(Link,{to:c.cross.to,className:"text-moss underline",children:tr(c.cross.label)})}):null
  ]});
}
function jsxSpan(t,tr,locale,label){
  return jsx.jsxs("span",{className:"text-sm text-muted",children:[t.minutes," ",tr({en:"min",ar:"د"})," · ",locale==="ar"?label.ar:label.en]});
}
export{StageView as n,TrackView as t};
