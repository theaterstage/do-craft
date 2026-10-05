import{E as Link,P as getJsx,a as Card,i as PageHeader,s as useT,lt as interop,st as getReact}from"./chrome-0wY267Au.js";
import{t as Button}from"./button-CnByHSfE.js";
const React=interop(getReact(),1);
const jsx=getJsx(),{useState,useEffect,useRef,useCallback}=React;
const h=(type,props,...kids)=>{const{key,...p}=props||{};if(kids.length===0)return jsx.jsx(type,p,key);if(kids.length===1)return jsx.jsx(type,{...p,children:kids[0]},key);return jsx.jsxs(type,{...p,children:kids},key)};
const KEY="docraft-tools-v1";
const DAYS=["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس","الجمعة","السبت"];
const iso=(d)=>{const x=d||new Date();return`${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,"0")}-${String(x.getDate()).padStart(2,"0")}`};
const uid=()=>Math.random().toString(36).slice(2,9)+Date.now().toString(36).slice(-3);
const DEFAULTS={hourglassMin:5,timerH:0,timerM:10,timerS:0,pomo:{focus:25,rest:5,done:{}},ach:[],habits:[],log:{},tasks:[],goals:{},notes:"",water:{},waterGoal:8,eyeOn:false,breathe:{in:4,hold:2,out:6}};
function load(){try{const r=JSON.parse(localStorage.getItem(KEY)||"{}");return{...DEFAULTS,...r,pomo:{...DEFAULTS.pomo,...(r.pomo||{})},breathe:{...DEFAULTS.breathe,...(r.breathe||{})}}}catch{return{...DEFAULTS}}}
function useTools(){
  const[data,setData]=useState(DEFAULTS),[ready,setReady]=useState(false);
  useEffect(()=>{setData(load());setReady(true)},[]);
  useEffect(()=>{if(ready)try{localStorage.setItem(KEY,JSON.stringify(data))}catch{}},[data,ready]);
  const up=useCallback((fn)=>setData(d=>({...d,...(typeof fn==="function"?fn(d):fn)})),[]);
  return[data,up,ready];
}
function beep(){try{const C=window.AudioContext||window.webkitAudioContext;if(!C)return;const a=new C(),o=a.createOscillator(),g=a.createGain();o.connect(g);g.connect(a.destination);o.frequency.value=880;g.gain.value=0.08;o.start();setTimeout(()=>{o.stop();a.close()},400)}catch{}}
const two=(n)=>String(n).padStart(2,"0");
const fmt=(sec)=>{sec=Math.max(0,Math.round(sec));const h2=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=sec%60;return(h2?two(h2)+":":"")+two(m)+":"+two(s)};
const inputCls="min-h-11 rounded-2xl border border-line bg-paper px-3 text-base";
// ---- generic countdown hook (Date.now based) ----
function useCountdown(onEnd){
  const[left,setLeft]=useState(0),[on,setOn]=useState(false),[total,setTotal]=useState(0),end=useRef(0),iv=useRef(null),cb=useRef(onEnd);cb.current=onEnd;
  const stop=useCallback(()=>{if(iv.current){clearInterval(iv.current);iv.current=null}setOn(false)},[]);
  useEffect(()=>()=>{if(iv.current)clearInterval(iv.current)},[]);
  const tick=useCallback(()=>{const l=Math.max(0,(end.current-Date.now())/1000);setLeft(l);if(l<=0){stop();cb.current&&cb.current()}},[stop]);
  const start=useCallback((sec,keep)=>{const s=sec??left;if(s<=0)return;stop();if(!keep)setTotal(s);end.current=Date.now()+s*1000;setLeft(s);setOn(true);iv.current=setInterval(tick,200)},[left,stop,tick]);
  const pause=useCallback(()=>{if(!on)return;const l=Math.max(0,(end.current-Date.now())/1000);stop();setLeft(l)},[on,stop]);
  const reset=useCallback((sec)=>{stop();setLeft(sec||0);setTotal(sec||0)},[stop]);
  return{left,on,total,start,pause,reset,stop};
}
function Tool({id,title,hint,children}){
  return h("section",{id:"tool-"+id,className:"scroll-mt-24 rounded-card border border-line bg-surface p-4 shadow-card","data-testid":"tool-"+id},
    h("h2",{className:"font-display text-2xl"},title),hint?h("p",{className:"mb-3 mt-1 text-sm text-muted"},hint):null,children);
}
function Num({label,value,onChange,min,max,testid}){
  return h("label",{className:"flex items-center gap-2 text-sm"},h("span",{},label),
    h("input",{type:"number",inputMode:"numeric",min,max,value,"data-testid":testid,className:inputCls+" w-20 tabular-nums",dir:"ltr",onChange:e=>{const v=Math.max(min,Math.min(max,Math.floor(Number(e.target.value)||0)));onChange(v)}}));
}
// ---- hourglass ----
function Hourglass({data,up,tr}){
  const[msg,setMsg]=useState("");
  const cd=useCountdown(()=>{setMsg(tr({en:"The sand has run out.",ar:"انتهى الرمل."}));beep()});
  const total=cd.total||data.hourglassMin*60,f=total?Math.max(0,Math.min(1,cd.left/total)):1;
  const idle=!cd.on&&cd.left===0,finished=idle&&!!msg;
  const frac=finished?0:idle?1:f;
  return h(Tool,{id:"hourglass",title:tr({en:"Hourglass",ar:"الساعة الرملية"}),hint:tr({en:"Set the minutes, then watch the sand fall.",ar:"اختر عدد الدقائق ثم راقب الرمل وهو يسقط."})},
    h("div",{className:"flex flex-wrap items-center gap-6"},
      h("svg",{viewBox:"0 0 100 140",width:"120",height:"168",role:"img","aria-label":tr({en:"Hourglass",ar:"ساعة رملية"}),"data-testid":"hourglass-svg"},
        h("defs",{},h("clipPath",{id:"hg-top"},h("polygon",{points:"20,10 80,10 50,70"})),h("clipPath",{id:"hg-bot"},h("polygon",{points:"50,70 80,130 20,130"}))),
        h("rect",{x:20,y:10+60*(1-frac),width:60,height:60*frac,fill:"currentColor",className:"text-copper",clipPath:"url(#hg-top)","data-testid":"sand-top","data-frac":frac.toFixed(3)}),
        h("rect",{x:20,y:130-60*(1-frac),width:60,height:60*(1-frac),fill:"currentColor",className:"text-copper",clipPath:"url(#hg-bot)","data-testid":"sand-bottom"}),
        cd.on&&frac>0?h("line",{x1:50,y1:70,x2:50,y2:128,stroke:"currentColor",strokeWidth:2,strokeDasharray:"3 3",className:"text-copper sand-fall"}):null,
        h("path",{d:"M18 8h64M18 132h64M20 10l30 60-30 60M80 10l-30 60 30 60",fill:"none",stroke:"currentColor",strokeWidth:3,strokeLinecap:"round",className:"text-ink"})),
      h("div",{className:"space-y-3"},
        h(Num,{label:tr({en:"Minutes",ar:"الدقائق"}),value:data.hourglassMin,min:1,max:180,testid:"hourglass-minutes",onChange:v=>{up({hourglassMin:v});if(!cd.on)cd.reset(0)}}),
        h("p",{className:"font-display text-4xl tabular-nums","data-testid":"hourglass-left"},fmt(finished?0:idle?data.hourglassMin*60:cd.left)),
        h("div",{className:"flex flex-wrap gap-2"},
          cd.on?h(Button,{type:"button",variant:"secondary",onClick:cd.pause,"data-testid":"hourglass-pause"},tr({en:"Pause",ar:"إيقاف مؤقت"})):h(Button,{type:"button",onClick:()=>{setMsg("");cd.start(idle?data.hourglassMin*60:cd.left,!idle)},"data-testid":"hourglass-start"},tr({en:idle?"Start":"Resume",ar:idle?"ابدأ":"تابع"})),
          h(Button,{type:"button",variant:"secondary",onClick:()=>{setMsg("");cd.reset(0)},"data-testid":"hourglass-reset"},tr({en:"Reset",ar:"إعادة"}))),
        msg?h("p",{className:"font-semibold","data-testid":"hourglass-done",role:"status"},msg):null)));
}
// ---- digital clock timer / stopwatch ----
function DigitalTimer({data,up,tr}){
  const[mode,setMode]=useState("down"),[msg,setMsg]=useState("");
  const cd=useCountdown(()=>{setMsg(tr({en:"Time is up.",ar:"انتهى الوقت."}));beep()});
  const[swMs,setSw]=useState(0),[swOn,setSwOn]=useState(false),[laps,setLaps]=useState([]),swStart=useRef(0),swBase=useRef(0),swIv=useRef(null);
  useEffect(()=>()=>{if(swIv.current)clearInterval(swIv.current)},[]);
  const sec=data.timerH*3600+data.timerM*60+data.timerS,idle=!cd.on&&cd.left===0;
  function swGo(){if(swOn)return;swStart.current=Date.now();swBase.current=swMs;setSwOn(true);swIv.current=setInterval(()=>setSw(swBase.current+Date.now()-swStart.current),50)}
  function swPause(){if(swIv.current){clearInterval(swIv.current);swIv.current=null}setSwOn(false)}
  const swFmt=(ms)=>{const t=Math.floor(ms/10),c=t%100,s=Math.floor(t/100)%60,m=Math.floor(t/6000);return`${two(m)}:${two(s)}.${two(c)}`};
  return h(Tool,{id:"clock",title:tr({en:"Digital clock timer",ar:"ساعة رقمية: مؤقت وعدّاد"}),hint:tr({en:"Countdown timer or stopwatch.",ar:"مؤقت تنازلي أو ساعة إيقاف."})},
    h("div",{className:"mb-3 flex gap-2",role:"tablist"},
      h(Button,{type:"button",variant:mode==="down"?"primary":"secondary","aria-pressed":mode==="down","data-testid":"mode-down",onClick:()=>setMode("down")},tr({en:"Countdown",ar:"تنازلي"})),
      h(Button,{type:"button",variant:mode==="up"?"primary":"secondary","aria-pressed":mode==="up","data-testid":"mode-up",onClick:()=>setMode("up")},tr({en:"Stopwatch",ar:"ساعة إيقاف"}))),
    mode==="down"?h("div",{className:"space-y-3"},
      h("div",{className:"flex flex-wrap gap-3"},
        h(Num,{label:tr({en:"Hours",ar:"ساعات"}),value:data.timerH,min:0,max:23,testid:"timer-h",onChange:v=>up({timerH:v})}),
        h(Num,{label:tr({en:"Minutes",ar:"دقائق"}),value:data.timerM,min:0,max:59,testid:"timer-m",onChange:v=>up({timerM:v})}),
        h(Num,{label:tr({en:"Seconds",ar:"ثوانٍ"}),value:data.timerS,min:0,max:59,testid:"timer-s",onChange:v=>up({timerS:v})})),
      h("p",{className:"rounded-2xl bg-ink px-4 py-3 text-center font-display text-5xl tabular-nums text-paper","data-testid":"timer-display",dir:"ltr"},fmt(idle?sec:cd.left)),
      h("div",{className:"flex flex-wrap gap-2"},
        cd.on?h(Button,{type:"button",variant:"secondary",onClick:cd.pause,"data-testid":"timer-pause"},tr({en:"Pause",ar:"إيقاف مؤقت"})):h(Button,{type:"button",disabled:idle&&sec<=0,onClick:()=>{setMsg("");cd.start(idle?sec:cd.left)},"data-testid":"timer-start"},tr({en:"Start",ar:"ابدأ"})),
        h(Button,{type:"button",variant:"secondary",onClick:()=>{setMsg("");cd.reset(0)},"data-testid":"timer-reset"},tr({en:"Reset",ar:"إعادة"}))),
      msg?h("p",{className:"font-semibold","data-testid":"timer-done",role:"status"},msg):null)
    :h("div",{className:"space-y-3"},
      h("p",{className:"rounded-2xl bg-ink px-4 py-3 text-center font-display text-5xl tabular-nums text-paper","data-testid":"sw-display",dir:"ltr"},swFmt(swMs)),
      h("div",{className:"flex flex-wrap gap-2"},
        swOn?h(Button,{type:"button",variant:"secondary",onClick:swPause,"data-testid":"sw-stop"},tr({en:"Stop",ar:"أوقف"})):h(Button,{type:"button",onClick:swGo,"data-testid":"sw-start"},tr({en:"Start",ar:"ابدأ"})),
        h(Button,{type:"button",variant:"secondary",disabled:!swOn,onClick:()=>setLaps(l=>[swMs,...l]),"data-testid":"sw-lap"},tr({en:"Lap",ar:"لفّة"})),
        h(Button,{type:"button",variant:"secondary",onClick:()=>{swPause();setSw(0);setLaps([])},"data-testid":"sw-reset"},tr({en:"Reset",ar:"إعادة"}))),
      laps.length?h("ol",{className:"list-decimal ps-6 tabular-nums","data-testid":"sw-laps"},laps.map((l,i)=>h("li",{key:i+"-"+l},swFmt(l)))):null));
}
// ---- pomodoro ----
function Pomodoro({data,up,tr}){
  const[phase,setPhase]=useState("focus"),[msg,setMsg]=useState("");
  const cd=useCountdown(()=>{beep();if(phase==="focus"){const d=iso();up(x=>({pomo:{...x.pomo,done:{...x.pomo.done,[d]:(x.pomo.done[d]||0)+1}}}));setPhase("rest");setMsg(tr({en:"Focus round finished. Take your rest.",ar:"انتهت جولة التركيز. خذ استراحتك."}))}else{setPhase("focus");setMsg(tr({en:"Rest finished. Ready for the next round?",ar:"انتهت الاستراحة. جاهز للجولة التالية؟"}))}});
  const secs=(phase==="focus"?data.pomo.focus:data.pomo.rest)*60,idle=!cd.on&&cd.left===0,today=data.pomo.done[iso()]||0;
  return h(Tool,{id:"pomodoro",title:tr({en:"Pomodoro",ar:"بومودورو"}),hint:tr({en:"Focus rounds followed by short rests.",ar:"جولات تركيز تتبعها استراحات قصيرة."})},
    h("div",{className:"flex flex-wrap gap-3"},
      h(Num,{label:tr({en:"Focus (min)",ar:"التركيز (د)"}),value:data.pomo.focus,min:1,max:90,testid:"pomo-focus",onChange:v=>up(x=>({pomo:{...x.pomo,focus:v}}))}),
      h(Num,{label:tr({en:"Rest (min)",ar:"الراحة (د)"}),value:data.pomo.rest,min:1,max:30,testid:"pomo-rest",onChange:v=>up(x=>({pomo:{...x.pomo,rest:v}}))})),
    h("p",{className:"mt-3 text-sm text-muted","data-testid":"pomo-phase"},phase==="focus"?tr({en:"Focus round",ar:"جولة تركيز"}):tr({en:"Rest",ar:"استراحة"})),
    h("p",{className:"font-display text-5xl tabular-nums","data-testid":"pomo-display",dir:"ltr"},fmt(idle?secs:cd.left)),
    h("div",{className:"mt-3 flex flex-wrap gap-2"},
      cd.on?h(Button,{type:"button",variant:"secondary",onClick:cd.pause,"data-testid":"pomo-pause"},tr({en:"Pause",ar:"إيقاف مؤقت"})):h(Button,{type:"button",onClick:()=>{setMsg("");cd.start(idle?secs:cd.left)},"data-testid":"pomo-start"},tr({en:"Start",ar:"ابدأ"})),
      h(Button,{type:"button",variant:"secondary",onClick:()=>{cd.reset(0);setPhase("focus");setMsg("")},"data-testid":"pomo-reset"},tr({en:"Reset",ar:"إعادة"}))),
    msg?h("p",{className:"mt-3 font-semibold",role:"status","data-testid":"pomo-msg"},msg):null,
    h("p",{className:"mt-3 text-sm tabular-nums","data-testid":"pomo-count"},tr({en:`Focus rounds today: ${today}`,ar:`جولات التركيز اليوم: ${today}`})));
}
// ---- achievements table ----
function Achievements({data,up,tr}){
  const[title,setTitle]=useState(""),[note,setNote]=useState(""),[date,setDate]=useState(iso());
  function add(e){e.preventDefault();if(!title.trim())return;up(d=>({ach:[{id:uid(),title:title.trim(),note:note.trim(),date},...d.ach]}));setTitle("");setNote("")}
  return h(Tool,{id:"achievements",title:tr({en:"Achievements tracker",ar:"جدول الإنجازات"}),hint:tr({en:"Write down what you finished. Small wins count.",ar:"سجّل ما أنجزته. الإنجازات الصغيرة تُحسب."})},
    h("form",{onSubmit:add,className:"mb-3 flex flex-wrap items-end gap-2"},
      h("label",{className:"flex flex-col text-sm"},h("span",{},tr({en:"Achievement",ar:"الإنجاز"})),h("input",{type:"text",value:title,onChange:e=>setTitle(e.target.value),className:inputCls,"data-testid":"ach-title"})),
      h("label",{className:"flex flex-col text-sm"},h("span",{},tr({en:"Note",ar:"ملاحظة"})),h("input",{type:"text",value:note,onChange:e=>setNote(e.target.value),className:inputCls,"data-testid":"ach-note"})),
      h("label",{className:"flex flex-col text-sm"},h("span",{},tr({en:"Date",ar:"التاريخ"})),h("input",{type:"date",value:date,onChange:e=>setDate(e.target.value),className:inputCls,dir:"ltr","data-testid":"ach-date"})),
      h(Button,{type:"submit","data-testid":"ach-add"},tr({en:"Add",ar:"أضف"}))),
    data.ach.length?h("div",{className:"overflow-x-auto"},h("table",{className:"w-full text-start","data-testid":"ach-table"},
      h("thead",{},h("tr",{className:"border-b border-line text-sm text-muted"},h("th",{className:"p-2 text-start"},"#"),h("th",{className:"p-2 text-start"},tr({en:"Achievement",ar:"الإنجاز"})),h("th",{className:"p-2 text-start"},tr({en:"Note",ar:"ملاحظة"})),h("th",{className:"p-2 text-start"},tr({en:"Date",ar:"التاريخ"})),h("th",{className:"p-2"},tr({en:"Delete",ar:"حذف"})))),
      h("tbody",{},data.ach.map((a,i)=>h("tr",{key:a.id,className:"border-b border-line","data-testid":"ach-row"},h("td",{className:"p-2 tabular-nums"},i+1),h("td",{className:"p-2"},a.title),h("td",{className:"p-2"},a.note),h("td",{className:"p-2 tabular-nums",dir:"ltr"},a.date),
        h("td",{className:"p-2"},h(Button,{type:"button",variant:"secondary","aria-label":tr({en:"Delete "+a.title,ar:"احذف "+a.title}),onClick:()=>up(d=>({ach:d.ach.filter(x=>x.id!==a.id)}))},"✕")))))))
    :h("p",{className:"text-muted","data-testid":"ach-empty"},tr({en:"No achievements yet.",ar:"لا توجد إنجازات بعد."})),
    data.ach.length?h("p",{className:"mt-2 text-sm tabular-nums","data-testid":"ach-count"},tr({en:`Total: ${data.ach.length}`,ar:`المجموع: ${data.ach.length}`})):null);
}
// ---- habits tracker ----
function Habits({data,up,tr}){
  const[name,setName]=useState(""),[off,setOff]=useState(0);
  const days=Array.from({length:7},(_,i)=>{const d=new Date();d.setDate(d.getDate()-6-off*7+i);return d});
  function add(e){e.preventDefault();if(!name.trim())return;up(d=>({habits:[...d.habits,{id:uid(),name:name.trim()}]}));setName("")}
  function streak(id){let n=0;const d=new Date();for(;;){if(data.log[id]&&data.log[id][iso(d)]){n++;d.setDate(d.getDate()-1)}else if(n===0&&iso(d)===iso()){d.setDate(d.getDate()-1)}else break}return n}
  return h(Tool,{id:"habits",title:tr({en:"Habits tracker",ar:"جدول العادات"}),hint:tr({en:"A daily check grid for the last seven days.",ar:"شبكة متابعة يومية لآخر سبعة أيام."})},
    h("form",{onSubmit:add,className:"mb-3 flex flex-wrap items-end gap-2"},
      h("label",{className:"flex flex-col text-sm"},h("span",{},tr({en:"New habit",ar:"عادة جديدة"})),h("input",{type:"text",value:name,onChange:e=>setName(e.target.value),className:inputCls,"data-testid":"habit-name"})),
      h(Button,{type:"submit","data-testid":"habit-add"},tr({en:"Add habit",ar:"أضف عادة"}))),
    h("div",{className:"mb-2 flex gap-2"},
      h(Button,{type:"button",variant:"secondary",onClick:()=>setOff(o=>o+1),"data-testid":"habit-prev"},tr({en:"Previous week",ar:"الأسبوع السابق"})),
      h(Button,{type:"button",variant:"secondary",disabled:off===0,onClick:()=>setOff(o=>Math.max(0,o-1)),"data-testid":"habit-next"},tr({en:"Next week",ar:"الأسبوع التالي"}))),
    data.habits.length?h("div",{className:"overflow-x-auto"},h("table",{className:"w-full","data-testid":"habit-table"},
      h("thead",{},h("tr",{className:"border-b border-line text-sm text-muted"},h("th",{className:"p-2 text-start"},tr({en:"Habit",ar:"العادة"})),days.map(d=>h("th",{key:iso(d),className:"p-2 text-center text-xs"},DAYS[d.getDay()],h("br",{}),h("span",{className:"tabular-nums"},d.getDate()))),h("th",{className:"p-2"},tr({en:"Streak",ar:"المتتالية"})),h("th",{className:"p-2"},tr({en:"Delete",ar:"حذف"})))),
      h("tbody",{},data.habits.map(hb=>h("tr",{key:hb.id,className:"border-b border-line","data-testid":"habit-row"},h("td",{className:"p-2"},hb.name),
        days.map(d=>{const k=iso(d),on=!!(data.log[hb.id]&&data.log[hb.id][k]);return h("td",{key:k,className:"p-1 text-center"},h("input",{type:"checkbox",className:"size-6 accent-current",checked:on,"data-testid":"habit-cell","aria-label":hb.name+" "+k,onChange:()=>up(x=>{const cur={...(x.log[hb.id]||{})};if(cur[k])delete cur[k];else cur[k]=true;return{log:{...x.log,[hb.id]:cur}}})}))}),
        h("td",{className:"p-2 text-center tabular-nums","data-testid":"habit-streak"},streak(hb.id)),
        h("td",{className:"p-2 text-center"},h(Button,{type:"button",variant:"secondary","aria-label":tr({en:"Delete "+hb.name,ar:"احذف "+hb.name}),onClick:()=>up(x=>{const l={...x.log};delete l[hb.id];return{habits:x.habits.filter(y=>y.id!==hb.id),log:l}})},"✕")))))))
    :h("p",{className:"text-muted","data-testid":"habit-empty"},tr({en:"No habits yet.",ar:"لا توجد عادات بعد."})));
}
// ---- tasks ----
function Tasks({data,up,tr}){
  const[t,setT]=useState("");
  function add(e){e.preventDefault();if(!t.trim())return;up(d=>({tasks:[...d.tasks,{id:uid(),text:t.trim(),done:false}]}));setT("")}
  const left=data.tasks.filter(x=>!x.done).length;
  return h(Tool,{id:"tasks",title:tr({en:"Task list",ar:"قائمة المهام"})},
    h("form",{onSubmit:add,className:"mb-3 flex gap-2"},h("input",{type:"text",value:t,onChange:e=>setT(e.target.value),className:inputCls+" flex-1","aria-label":tr({en:"New task",ar:"مهمة جديدة"}),placeholder:tr({en:"New task",ar:"مهمة جديدة"}),"data-testid":"task-input"}),h(Button,{type:"submit","data-testid":"task-add"},tr({en:"Add",ar:"أضف"}))),
    h("ul",{className:"space-y-1","data-testid":"task-list"},data.tasks.map(x=>h("li",{key:x.id,className:"flex items-center gap-2"},
      h("input",{type:"checkbox",className:"size-6",checked:x.done,"aria-label":x.text,"data-testid":"task-check",onChange:()=>up(d=>({tasks:d.tasks.map(y=>y.id===x.id?{...y,done:!y.done}:y)}))}),
      h("span",{className:x.done?"flex-1 text-muted line-through":"flex-1"},x.text),
      h(Button,{type:"button",variant:"secondary","aria-label":tr({en:"Delete "+x.text,ar:"احذف "+x.text}),onClick:()=>up(d=>({tasks:d.tasks.filter(y=>y.id!==x.id)}))},"✕")))),
    h("div",{className:"mt-3 flex items-center gap-3"},h("p",{className:"text-sm tabular-nums","data-testid":"task-left"},tr({en:`${left} left`,ar:`المتبقي ${left}`})),
      h(Button,{type:"button",variant:"secondary",disabled:!data.tasks.some(x=>x.done),onClick:()=>up(d=>({tasks:d.tasks.filter(y=>!y.done)})),"data-testid":"task-clear"},tr({en:"Clear finished",ar:"امسح المنجز"}))));
}
// ---- daily goals ----
function Goals({data,up,tr}){
  const d0=iso(),g=data.goals[d0]||[{t:"",done:false},{t:"",done:false},{t:"",done:false}];
  const set=(i,patch)=>up(x=>{const cur=(x.goals[d0]||[{t:"",done:false},{t:"",done:false},{t:"",done:false}]).map((y,j)=>j===i?{...y,...patch}:y);return{goals:{...x.goals,[d0]:cur}}});
  const done=g.filter(x=>x.done&&x.t.trim()).length;
  return h(Tool,{id:"goals",title:tr({en:"Daily goals",ar:"أهداف اليوم"}),hint:tr({en:"Three goals for today only.",ar:"ثلاثة أهداف لليوم فقط."})},
    h("ul",{className:"space-y-2"},g.map((x,i)=>h("li",{key:i,className:"flex items-center gap-2"},
      h("input",{type:"checkbox",className:"size-6",checked:x.done,"aria-label":tr({en:"Goal "+(i+1)+" done",ar:"تم الهدف "+(i+1)}),"data-testid":"goal-check",onChange:()=>set(i,{done:!x.done})}),
      h("input",{type:"text",value:x.t,className:inputCls+" flex-1","aria-label":tr({en:"Goal "+(i+1),ar:"الهدف "+(i+1)}),"data-testid":"goal-text",onChange:e=>set(i,{t:e.target.value})})))),
    h("p",{className:"mt-2 text-sm tabular-nums","data-testid":"goal-count"},tr({en:`Done ${done} of 3`,ar:`أنجزت ${done} من ٣`})));
}
// ---- breathing pacer ----
function BreathePacer({data,up,tr}){
  const[on,setOn]=useState(false),[phase,setPhase]=useState("idle"),[sec,setSec]=useState(0),[cycles,setCycles]=useState(0),iv=useRef(null),t0=useRef(0);
  const b=data.breathe,total=b.in+b.hold+b.out;
  useEffect(()=>()=>{if(iv.current)clearInterval(iv.current)},[]);
  function stop(){if(iv.current){clearInterval(iv.current);iv.current=null}setOn(false);setPhase("idle");setSec(0)}
  function start(){setOn(true);setCycles(0);t0.current=Date.now();iv.current=setInterval(()=>{const e=(Date.now()-t0.current)/1000,c=Math.floor(e/total),r=e-c*total;setCycles(c);if(r<b.in){setPhase("in");setSec(Math.ceil(b.in-r))}else if(r<b.in+b.hold){setPhase("hold");setSec(Math.ceil(b.in+b.hold-r))}else{setPhase("out");setSec(Math.ceil(total-r))}},200)}
  const label={idle:tr({en:"Ready",ar:"جاهز"}),in:tr({en:"Breathe in",ar:"شهيق"}),hold:tr({en:"Hold",ar:"احبس نفَسك"}),out:tr({en:"Breathe out",ar:"زفير"})}[phase];
  const scale=phase==="in"||phase==="hold"?1:0.55,dur=phase==="in"?b.in:phase==="out"?b.out:0.3;
  return h(Tool,{id:"breathe",title:tr({en:"Breathing pacer",ar:"منظّم التنفس"}),hint:tr({en:"If you feel dizzy, breathe normally and stop.",ar:"إن شعرت بدوار فتنفّس بشكل طبيعي وتوقف."})},
    h("div",{className:"flex flex-wrap items-center gap-6"},
      h("div",{className:"flex size-40 items-center justify-center rounded-full border border-moss bg-moss-soft","aria-hidden":true,style:{transform:`scale(${scale})`,transition:`transform ${dur}s linear`}},h("span",{className:"font-display text-4xl tabular-nums"},on?sec:"")),
      h("div",{className:"space-y-3"},
        h("div",{className:"flex flex-wrap gap-3"},
          h(Num,{label:tr({en:"In",ar:"شهيق"}),value:b.in,min:2,max:10,testid:"breathe-in",onChange:v=>up(x=>({breathe:{...x.breathe,in:v}}))}),
          h(Num,{label:tr({en:"Hold",ar:"حبس"}),value:b.hold,min:0,max:10,testid:"breathe-hold",onChange:v=>up(x=>({breathe:{...x.breathe,hold:v}}))}),
          h(Num,{label:tr({en:"Out",ar:"زفير"}),value:b.out,min:2,max:12,testid:"breathe-out",onChange:v=>up(x=>({breathe:{...x.breathe,out:v}}))})),
        h("p",{className:"font-display text-2xl","data-testid":"breathe-tool-phase",role:"status"},label),
        h("p",{className:"text-sm tabular-nums text-muted","data-testid":"breathe-tool-cycles"},tr({en:`Completed cycles: ${cycles}`,ar:`الدورات المكتملة: ${cycles}`})),
        on?h(Button,{type:"button",variant:"secondary",onClick:stop,"data-testid":"breathe-tool-stop"},tr({en:"Stop",ar:"أوقف"})):h(Button,{type:"button",onClick:start,"data-testid":"breathe-tool-start"},tr({en:"Start",ar:"ابدأ"})))));
}
// ---- notes ----
function Notes({data,up,tr}){
  return h(Tool,{id:"notes",title:tr({en:"Notes",ar:"ملاحظات"}),hint:tr({en:"Saved automatically on this device.",ar:"تُحفظ تلقائيًا على جهازك."})},
    h("label",{className:"block"},h("span",{className:"sr-only"},tr({en:"Notes",ar:"ملاحظاتك"})),h("textarea",{value:data.notes,rows:5,className:inputCls+" w-full p-3","data-testid":"notes-text",onChange:e=>up({notes:e.target.value})})),
    h("div",{className:"mt-2 flex items-center gap-3"},h("p",{className:"text-sm tabular-nums text-muted","data-testid":"notes-count"},tr({en:`${data.notes.length} characters`,ar:`${data.notes.length} حرفًا`})),
      h(Button,{type:"button",variant:"secondary",disabled:!data.notes,onClick:()=>up({notes:""}),"data-testid":"notes-clear"},tr({en:"Clear",ar:"امسح"}))));
}
// ---- 20-20-20 eye rest ----
function EyeRest({data,up,tr}){
  const[phase,setPhase]=useState("wait"),[left,setLeft]=useState(0),iv=useRef(null),end=useRef(0);
  const clear=()=>{if(iv.current){clearInterval(iv.current);iv.current=null}};
  useEffect(()=>()=>clear(),[]);
  function run(kind,secs){clear();setPhase(kind);end.current=Date.now()+secs*1000;setLeft(secs);iv.current=setInterval(()=>{const l=Math.max(0,Math.ceil((end.current-Date.now())/1000));setLeft(l);if(l<=0){clear();if(kind==="wait"){beep();run("look",20)}else{up({eyeOn:false});setPhase("idle")}}},250)}
  function on(){up({eyeOn:true});run("wait",20*60)}
  function off(){clear();up({eyeOn:false});setPhase("idle")}
  const active=data.eyeOn&&phase!=="idle";
  return h(Tool,{id:"eye",title:tr({en:"20-20-20 eye rest",ar:"راحة العين 20-20-20"}),hint:tr({en:"Every 20 minutes, look at something 20 feet (about 6 meters) away for 20 seconds.",ar:"كل ٢٠ دقيقة انظر إلى شيء يبعد نحو ٦ أمتار لمدة ٢٠ ثانية."})},
    h("p",{className:"font-display text-3xl tabular-nums","data-testid":"eye-display",dir:"ltr"},active?fmt(left):"--:--"),
    h("p",{className:"mt-1","data-testid":"eye-status",role:"status"},phase==="look"?tr({en:"Look far away now for 20 seconds.",ar:"انظر بعيدًا الآن لمدة ٢٠ ثانية."}):active?tr({en:"Next break in…",ar:"الاستراحة القادمة بعد…"}):tr({en:"Reminder is off.",ar:"التذكير متوقف."})),
    h("div",{className:"mt-3 flex flex-wrap gap-2"},active?h(Button,{type:"button",variant:"secondary",onClick:off,"data-testid":"eye-off"},tr({en:"Turn off",ar:"أوقف التذكير"})):h(Button,{type:"button",onClick:on,"data-testid":"eye-on"},tr({en:"Turn on the reminder",ar:"شغّل التذكير"})),
      active&&phase==="wait"?h(Button,{type:"button",variant:"secondary",onClick:()=>run("look",20),"data-testid":"eye-now"},tr({en:"Rest my eyes now",ar:"أريح عيني الآن"})):null),
    h("p",{className:"mt-2 text-xs text-muted"},tr({en:"The reminder works while this page stays open.",ar:"يعمل التذكير ما دامت هذه الصفحة مفتوحة."})));
}
// ---- water ----
function Water({data,up,tr}){
  const d0=iso(),n=data.water[d0]||0,goal=data.waterGoal,pct=Math.min(100,Math.round(n/goal*100));
  const set=(v)=>up(x=>({water:{...x.water,[d0]:Math.max(0,v)}}));
  return h(Tool,{id:"water",title:tr({en:"Water tracker",ar:"متابع الماء"}),hint:tr({en:"Count your cups today.",ar:"عدّ أكواب الماء اليوم."})},
    h("p",{className:"font-display text-4xl tabular-nums","data-testid":"water-count"},n," / ",goal),
    h("div",{role:"progressbar","aria-valuemin":0,"aria-valuemax":goal,"aria-valuenow":Math.min(n,goal),"aria-label":tr({en:"Water",ar:"الماء"}),className:"my-2 h-3 overflow-hidden rounded-full bg-moss-soft"},h("div",{className:"h-full bg-moss",style:{width:pct+"%"}})),
    h("div",{className:"flex flex-wrap items-center gap-2"},
      h(Button,{type:"button",onClick:()=>set(n+1),"data-testid":"water-plus"},tr({en:"+ Cup",ar:"+ كوب"})),
      h(Button,{type:"button",variant:"secondary",disabled:n===0,onClick:()=>set(n-1),"data-testid":"water-minus"},tr({en:"− Cup",ar:"− كوب"})),
      h(Num,{label:tr({en:"Goal",ar:"الهدف"}),value:goal,min:1,max:20,testid:"water-goal",onChange:v=>up({waterGoal:v})})),
    n>=goal?h("p",{className:"mt-2 font-semibold",role:"status","data-testid":"water-done"},tr({en:"Goal reached.",ar:"بلغت هدف اليوم."})):null);
}
const TOOLS=[["hourglass","الساعة الرملية","Hourglass"],["clock","ساعة رقمية","Digital timer"],["pomodoro","بومودورو","Pomodoro"],["achievements","الإنجازات","Achievements"],["habits","العادات","Habits"],["tasks","المهام","Tasks"],["goals","أهداف اليوم","Daily goals"],["breathe","التنفس","Breathing"],["notes","ملاحظات","Notes"],["eye","راحة العين","Eye rest"],["water","الماء","Water"]];
function ToolsPage(){
  const tr=useT(),[data,up,ready]=useTools();
  return h("div",{"data-testid":"tools-page"},
    h(PageHeader,{kicker:"عقل فعّال",title:tr({en:"Helper tools",ar:"أدوات المساعدة"}),lede:tr({en:"Simple tools for focus and routine. Everything you enter is saved only on this device.",ar:"أدوات بسيطة للتركيز والروتين. كل ما تكتبه يُحفظ على جهازك فقط."})}),
    h("nav",{"aria-label":tr({en:"Tools",ar:"الأدوات"}),className:"mb-6 flex flex-wrap gap-2","data-testid":"tools-index"},TOOLS.map(([id,ar,en])=>h("a",{key:id,href:"#tool-"+id,className:"inline-flex min-h-11 items-center rounded-full border border-line bg-surface px-4 text-sm hover:bg-moss-soft"},tr({en,ar})))),
    ready?h("div",{className:"grid gap-4 lg:grid-cols-2"},
      h(Hourglass,{data,up,tr}),h(DigitalTimer,{data,up,tr}),h(Pomodoro,{data,up,tr}),h(BreathePacer,{data,up,tr}),h(Achievements,{data,up,tr}),h(Habits,{data,up,tr}),h(Tasks,{data,up,tr}),h(Goals,{data,up,tr}),h(Notes,{data,up,tr}),h(EyeRest,{data,up,tr}),h(Water,{data,up,tr}))
    :h("p",{className:"text-muted"},"…"));
}
export{ToolsPage as t};
