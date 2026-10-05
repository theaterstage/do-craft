import{E as Link,P as getJsx,c as useStore,a as Card,s as useT}from"./chrome-0wY267Au.js";
import{t as Button}from"./button-CnByHSfE.js";
const jsx=getJsx();
const h=(type,props,...kids)=>{const{key,...p}=props||{};if(kids.length===0)return jsx.jsx(type,p,key);if(kids.length===1)return jsx.jsx(type,{...p,children:kids[0]},key);return jsx.jsxs(type,{...p,children:kids},key)};
const UNLOCK=0.7;
const PROG={
  proc:{prefix:"pc",stages:18,per:11,path:"/proc",stagePath:"/proc/$stageId",title:{en:"Facing procrastination",ar:"مواجهة المماطلة"},blurb:{en:"18 stages × 11 exercises. A winding path from the first small start to a steady habit. Educational practice, not treatment.",ar:"١٨ مرحلة × ١١ تمرينًا. مسار متعرّج من أول بداية صغيرة إلى عادة ثابتة. تمارين تعليمية وليست علاجًا."}},
  dragon:{prefix:"dg",stages:22,per:16,path:"/dragon",stagePath:"/dragon/$stageId",title:{en:"Taming the sluggish dragon",ar:"ترويض التنين الخامل"},blurb:{en:"22 stages × 16 exercises with light home and desk movement, timers, and a safety note. Educational practice, not treatment.",ar:"٢٢ مرحلة × ١٦ تمرينًا مع حركات منزلية ومكتبية خفيفة ومؤقتات وتنبيه سلامة. تمارين تعليمية وليست علاجًا."}},
};
function pad2(n){return String(n).padStart(2,"0")}
function useTrackState(prefix,stages,per,attempts,overrides){
  const need=Math.ceil(per*UNLOCK),best=new Map();
  for(const a of attempts){if(!a.passed||!a.trainingId.startsWith(prefix))continue;const b=best.get(a.trainingId);if(b===undefined||a.score>b)best.set(a.trainingId,a.score)}
  const rows=[];let currentSet=false,xp=0;
  for(const v of best.values())xp+=10+Math.floor(v/10);
  for(let i=1;i<=stages;i++){
    const id=prefix+pad2(i);let passed=0;for(const k of best.keys())if(k.startsWith(id+"-t"))passed++;
    const prev=rows[i-2],open=i===1||overrides.includes(id)||(prev&&prev.passed>=need);
    const done=passed>=need;let state=!open?"locked":done?"done":"open";
    if(open&&!done&&!currentSet){state="current";currentSet=true}
    rows.push({id,index:i,passed,need,open,done,state,total:per});
  }
  return{rows,xp,doneCount:rows.filter(r=>r.done).length,cleared:best.size};
}
function Stats({xp,streak,done,total,cleared,items,tr}){
  const pct=Math.round(done/total*100);
  return h("div",{className:"mb-4 path-stats","data-testid":"path-stats"},
    h(Card,{},h("p",{className:"text-sm text-muted"},tr({en:"XP",ar:"نقاط الخبرة"})),h("p",{className:"font-display text-3xl tabular-nums","data-testid":"path-xp"},xp)),
    h(Card,{},h("p",{className:"text-sm text-muted"},tr({en:"Streak (days)",ar:"أيام متتالية"})),h("p",{className:"font-display text-3xl tabular-nums","data-testid":"path-streak"},streak)),
    h(Card,{},h("p",{className:"text-sm text-muted"},tr({en:`Stages done ${done} of ${total}`,ar:`المراحل المنجزة ${done} من ${total}`})),
      h("div",{role:"progressbar","aria-valuemin":0,"aria-valuemax":100,"aria-valuenow":pct,"aria-label":tr({en:"Progress",ar:"التقدم"}),className:"mt-2 h-3 overflow-hidden rounded-full bg-moss-soft"},h("div",{className:"h-full bg-moss",style:{width:pct+"%"},"data-testid":"path-bar"})),
      h("p",{className:"mt-2 text-sm tabular-nums text-muted"},tr({en:`${cleared} of ${items} exercises cleared`,ar:`${cleared} من ${items} تمرينًا تجاوزته`}))));
}
const GLYPH={done:"✓",current:"★",open:"●",locked:"🔒"};
function PathMap({rows,stagePath,titles,mini,tr}){
  const rowH=mini?64:108,n=rows.length,H=n*rowH,xs=rows.map((_,i)=>50+30*Math.sin(i*0.9));
  const d=rows.map((_,i)=>{const x=xs[i],y=i*rowH+(mini?26:36);if(i===0)return`M ${x} ${y}`;const px=xs[i-1],py=(i-1)*rowH+(mini?26:36),my=(py+y)/2;return`C ${px} ${my} ${x} ${my} ${x} ${y}`}).join(" ");
  const size=mini?"size-12 text-lg":"size-16 text-2xl";
  return h("div",{className:"relative mx-auto w-full max-w-md","data-testid":mini?"mini-map":"path-map"},
    h("svg",{className:"pointer-events-none absolute inset-0 h-full w-full",viewBox:`0 0 100 ${H}`,preserveAspectRatio:"none","aria-hidden":true},h("path",{d,fill:"none",stroke:"currentColor",strokeWidth:3,strokeDasharray:"2 3",className:"text-line",vectorEffect:"non-scaling-stroke"})),
    h("ol",{className:"relative",style:{height:H+"px",listStyle:"none",margin:0,padding:0}},rows.map((r,i)=>{
      const cls=r.state==="done"?"border-moss bg-moss text-on-moss":r.state==="current"?"border-copper bg-copper-soft text-ink ring-4 ring-copper-soft":r.state==="open"?"border-moss bg-moss-soft text-ink":"border-line bg-surface text-muted";
      const label=tr({en:`Stage ${r.index}`,ar:`المرحلة ${r.index}`})+(titles&&titles[i]?`: ${titles[i]}`:"")+" — "+tr({done:{en:"done",ar:"منجزة"},current:{en:"current",ar:"الحالية"},open:{en:"open",ar:"مفتوحة"},locked:{en:"locked",ar:"مقفلة"}}[r.state]);
      return h("li",{key:r.id,"data-stage":r.id,"data-state":r.state,"data-locked":r.open?"0":"1",style:{position:"absolute",top:i*rowH+"px",left:xs[i]+"%",transform:"translateX(-50%)",width:mini?"4rem":"8rem",textAlign:"center"}},
        h(Link,{to:stagePath,params:{stageId:r.id},"aria-label":label,"aria-current":r.state==="current"?"step":void 0,className:"inline-flex flex-col items-center gap-1"},
          h("span",{className:`inline-flex ${size} items-center justify-center rounded-full border-4 font-display tabular-nums shadow-card ${cls}`,"aria-hidden":true},r.state==="current"||r.state==="done"||r.state==="locked"?GLYPH[r.state]:r.index),
          mini?null:h("span",{className:"block max-w-32 text-xs leading-tight"},h("span",{className:"tabular-nums text-muted"},r.index," · "),titles&&titles[i]?titles[i]:""),
          mini?null:h("span",{className:"text-xs tabular-nums text-muted"},r.passed,"/",r.total)));
    })));
}
function HomeCard({k,cfg,tr}){
  const attempts=useStore(e=>e.attempts),ov=useStore(e=>e.stageOverrides),streak=useStore(e=>e.streak);
  const st=useTrackState(cfg.prefix,cfg.stages,cfg.per,attempts,ov),cur=st.rows.find(r=>r.state==="current")||st.rows[st.rows.length-1];
  const first=Math.max(0,Math.min(st.rows.length-5,cur.index-2)),sub=st.rows.slice(first,first+5);
  return h("section",{className:"rounded-card border border-line bg-surface p-4 shadow-card","data-testid":"home-"+k},
    h("h2",{className:"font-display text-2xl"},tr(cfg.title)),
    h("p",{className:"mt-1 text-sm text-muted"},tr(cfg.blurb)),
    h("p",{className:"mt-3 text-sm tabular-nums","data-testid":"home-"+k+"-stats"},tr({en:`XP ${st.xp} · streak ${streak} · stages ${st.doneCount}/${cfg.stages}`,ar:`النقاط ${st.xp} · المتتالية ${streak} · المراحل ${st.doneCount}/${cfg.stages}`})),
    h("div",{className:"my-3"},h(PathMap,{rows:sub,stagePath:cfg.stagePath,mini:true,tr})),
    h(Button,{asChild:true},h(Link,{to:cfg.path},tr({en:st.cleared?"Continue the path":"Start the path",ar:st.cleared?"تابع المسار":"ابدأ المسار"}))));
}
function HomeMore(){
  const tr=useT();
  return h("div",{className:"mt-10 space-y-6","data-testid":"home-more"},
    h("div",{className:"grid gap-4 lg:grid-cols-2"},h(HomeCard,{k:"proc",cfg:PROG.proc,tr}),h(HomeCard,{k:"dragon",cfg:PROG.dragon,tr})),
    h("section",{className:"rounded-card border border-line bg-surface p-4 shadow-card","data-testid":"home-tools"},
      h("h2",{className:"font-display text-2xl"},tr({en:"Helper tools",ar:"أدوات المساعدة"})),
      h("p",{className:"mt-1 text-sm text-muted"},tr({en:"Hourglass, digital timer, Pomodoro, habit and achievement tables, tasks, daily goals, breathing, notes, eye rest, and water. Everything is saved on this device.",ar:"ساعة رملية، ومؤقت رقمي، وبومودورو، وجداول للعادات والإنجازات، ومهام، وأهداف يومية، وتنفّس، وملاحظات، وراحة للعين، وماء. كل شيء محفوظ على جهازك."})),
      h("div",{className:"mt-3"},h(Button,{asChild:true},h(Link,{to:"/tools"},tr({en:"Open the toolkit",ar:"افتح صندوق الأدوات"}))))));
}
export{PROG,useTrackState,Stats,PathMap,HomeMore,HomeMore as h};
