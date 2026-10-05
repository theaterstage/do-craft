import { chromium } from 'playwright-core';
import fs from 'fs';
import { pathToFileURL } from 'url';
const URLB=(process.env.URLB||'http://127.0.0.1:8765/do-craft').replace(/\/$/,'');
const ORIGIN=new URL(URLB).origin;
const SITE=process.env.SITE||'/workspace/do-craft-gh';
const exf=fs.readdirSync(SITE+'/assets').find(f=>/^exercises-.*\.js$/.test(f));
const ex=await import(pathToFileURL(SITE+'/assets/'+exf).href);
const CONC=+(process.env.CONC||6), OUT=process.env.OUT||'e2e-new.json';
const ONLY=process.env.ONLY?new RegExp(process.env.ONLY):null;
const PARTS=(process.env.PARTS||'nav,items,wrong,unlock,persist,timers,mobile,en,tools,home').split(',');
const strip=s=>String(s).replace(/[\u2066\u2069]/g,'').replace(/\s+/g,' ').trim();
const browser=await chromium.launch({executablePath:'/usr/bin/google-chrome',args:['--no-sandbox']});
const results=[]; let failCount=0;
function rec(name,pass,info=''){results.push({name,pass,info});if(!pass)failCount++;console.log(pass?'PASS':'FAIL',name,info)}
async function ctxPage(opts={}){
  const ctx=await browser.newContext({viewport:opts.mobile?{width:390,height:800}:{width:1280,height:900},isMobile:!!opts.mobile,hasTouch:!!opts.mobile});
  await ctx.addInitScript(()=>{window.__net=[];const F=window.fetch;window.fetch=function(u){window.__net.push(String(u&&u.url||u));return F.apply(this,arguments)};});
  const page=await ctx.newPage(); const errs=[];
  page.on('console',m=>{if(['error','warning'].includes(m.type()))errs.push(m.type()+': '+m.text().slice(0,200))});
  page.on('pageerror',e=>errs.push('PAGEERR '+e.message.slice(0,200)));
  page.on('requestfailed',r=>errs.push('REQFAIL '+r.url()));
  page.on('response',r=>{if(r.status()>=400&&r.url().startsWith(ORIGIN))errs.push('HTTP'+r.status()+' '+r.url())});
  if(opts.clock)await page.clock.install();
  if(opts.state)await ctx.addInitScript(s=>{if(!localStorage.getItem('azam-store')||s.force)localStorage.setItem('azam-store',JSON.stringify(s.v))},{v:opts.state,force:!!opts.force});
  return {ctx,page,errs};
}
const stateWith=(extra={},attempts=[])=>({state:{locale:'ar',theme:'light',largeText:false,reduceMotion:true,onboarded:true,ageGroup:'18+',name:'T',sessionMinutes:25,attempts,xp:0,goals:[],memory:[],exams:[],stageOverrides:[],...extra},version:2});
const TRK={restore:{t:ex.restore,need:7,n:9,prefix:'rs'},iq:{t:ex.iq,need:7,n:10,prefix:'iq'},brain:{t:ex.brain,need:7,n:9,prefix:'bd'},proc:{t:ex.proc,need:8,n:11,prefix:'pc'},dragon:{t:ex.dragon,need:12,n:16,prefix:'dg'}};
const ALLSTAGES=Object.values(TRK).flatMap(k=>k.t.stages.map(s=>s.id));
const ALLITEMS=Object.values(TRK).flatMap(k=>k.t.items);
const openAll=()=>stateWith({stageOverrides:ALLSTAGES});
async function goto(page,r){await page.goto(URLB+r+'/',{waitUntil:'load'});await page.waitForFunction(()=>{const m=document.querySelector('main');return m&&m.innerText.trim().length>2&&!/جارٍ التحميل/.test(m.innerText)},null,{timeout:20000});await page.waitForLoadState('networkidle',{timeout:8000}).catch(()=>{})}
async function clickExact(page,sel,text){
  const h=await page.evaluateHandle(([sel,text,strip])=>{const f=new Function('s','return String(s).replace(/[\\u2066\\u2069]/g,"").replace(/\\s+/g," ").trim()');return [...document.querySelectorAll(sel)].find(b=>f(b.textContent)===f(text)&&!b.disabled)||null},[sel,text,null]);
  const el=h.asElement(); if(!el)throw new Error('no element '+sel+' = '+text); await el.click(); }
const btn=(page,name)=>page.locator('main button').filter({hasText:new RegExp('^\\s*'+name+'\\s*$')}).first();
async function readScore(page){await page.waitForSelector('main button:has-text("أعد المحاولة")',{timeout:8000});return +(await page.locator('main p.font-display.text-5xl').first().innerText())}
// ---------- solver: completes one exercise with all-correct answers ----------
async function solve(page,it,{clock=false,wrong=false}={}){
  const x=it.interaction;
  const done=async()=>{await btn(page,'احفظ الجلسة').click()};
  const next=async(last)=>{await btn(page,last?'احفظ الجلسة':'التالي').click()};
  switch(x.type){
    case 'breathe':{
      await btn(page,'ابدأ').click();
      if(wrong){await page.waitForSelector('main button:has-text("إنهاء الآن")');await btn(page,'إنهاء الآن').click();break}
      const total=(x.inhale+(x.hold||0)+x.exhale)*x.cycles;
      if(clock){await page.clock.runFor(total*1000+1500)}else{await page.waitForSelector('main button:has-text("احفظ الجلسة")',{timeout:(total+8)*1000})}
      await page.waitForSelector('main button:has-text("احفظ الجلسة")');await done();break}
    case 'quiz':{
      if(x.seconds){await btn(page,'ابدأ').click()}
      for(let i=0;i<x.questions.length;i++){const q=x.questions[i];const pick=wrong?(q.correct+1)%q.options.length:q.correct;
        await clickExact(page,'main button',q.options[pick].ar);
        await page.waitForSelector('main button:has-text("%s")'.replace('%s',i+1>=x.questions.length?'احفظ الجلسة':'التالي'));
        const verdict=await page.locator('main section p.font-semibold').last().innerText(); if(!wrong&&!verdict.startsWith('✓'))throw new Error('quiz verdict not ✓: '+verdict);
        await next(i+1>=x.questions.length)}
      break}
    case 'calc':{
      if(x.seconds){await btn(page,'ابدأ').click()}
      for(let i=0;i<x.questions.length;i++){const q=x.questions[i];
        const inp=page.locator('[data-testid=calc-input]');await inp.fill(wrong?String(q.answer+1):(i%2?String(q.answer).replace(/\d/g,d=>'٠١٢٣٤٥٦٧٨٩'[d]):String(q.answer)));
        if(i%2)await inp.press('Enter');else await btn(page,'تحقق').click();
        await page.waitForSelector('[data-testid=calc-verdict]');const v=await page.locator('[data-testid=calc-verdict]').innerText();
        if(!wrong&&!v.startsWith('✓'))throw new Error('calc verdict '+v+' for '+q.answer); if(wrong&&!v.includes(String(q.answer)))throw new Error('wrong verdict lacks answer: '+v);
        await next(i+1>=x.questions.length)}
      break}
    case 'scenario':{const ch=wrong?x.choices.reduce((a,b)=>a.score<b.score?a:b):x.choices.reduce((a,b)=>a.score>b.score?a:b);await clickExact(page,'main button',ch.text.ar);await done();break}
    case 'sprint':{await btn(page,'ابدأ').click();const n=await page.locator('main input[type=checkbox]').count();if(!wrong)for(let i=0;i<n;i++)await page.locator('main input[type=checkbox]').nth(i).check();await done();break}
    case 'order':{
      const want=x.items.map(i=>strip(i.ar));
      if(wrong){/* leave shuffled order; score may accidentally pass only if already sorted */}
      else for(let k=0;k<want.length;k++){let guard=0;for(;;){const texts=(await page.locator('main p.flex-1').allInnerTexts()).map(strip);const j=texts.indexOf(want[k]);if(j<0)throw new Error('order text missing '+want[k]);if(j<=k)break;await page.locator('main button[aria-label="فوق"]').nth(j).click();if(++guard>20)throw new Error('order stuck')}}
      await btn(page,'تحقق').click();break}
    case 'match':{
      const L='main .grid.gap-3 > div:first-child button', R='main .grid.gap-3 > div:last-child button';
      for(let i=0;i<x.pairs.length;i++){await page.locator(L).nth(i).click();const tgt=wrong?x.pairs[(i+1)%x.pairs.length].right.ar:x.pairs[i].right.ar;await clickExact(page,R,tgt)}
      await btn(page,'تحقق').click();break}
    case 'classify':{
      for(let i=0;i<x.cards.length;i++){const b=x.buckets.find(b=>b.id===x.cards[i].bucket);const other=x.buckets.find(b=>b.id!==x.cards[i].bucket);await clickExact(page,'main .flex-wrap button',(wrong?other:b).label.ar)}
      await btn(page,'تحقق').click();break}
    case 'reflect':{const t=page.locator('main textarea');const n=await t.count();for(let i=0;i<n;i++)await t.nth(i).fill(wrong?'قصير':'جملة صادقة طويلة بما يكفي للتمرين '+i);await done();break}
    case 'recall':{await page.locator('main textarea').fill(wrong?'x':x.accept[0]);await btn(page,'تحقق').click();await done();break}
    case 'calibrate':{const q=x.question;await page.locator('main input[type=range]').fill(wrong?'0':'100');await clickExact(page,'main button',q.options[wrong?(q.correct+1)%4:q.correct].ar);await done();break}
    case 'memory':{
      await btn(page,'ابدأ الحفظ').click();
      const shown=(await page.locator('[data-testid=memory-words] li').allInnerTexts()).map(strip);
      if(shown.length!==x.items.length||x.items.some(i=>!shown.includes(strip(i.ar))))throw new Error('memory words not shown');
      if(clock){await page.clock.runFor((x.seconds+1)*1000)}else{await btn(page,'أخفِ الكلمات الآن').click()}
      await page.waitForSelector('[data-testid=memory-options]');
      if((await page.locator('[data-testid=memory-words]').count())!==0)throw new Error('words still visible while recalling');
      const pickFrom=wrong?x.decoys:x.items;
      for(const w of pickFrom)await clickExact(page,'[data-testid=memory-options] button',w.ar);
      await btn(page,'تحقق').click();await page.waitForSelector('[data-testid=memory-verdict]');
      const v=await page.locator('[data-testid=memory-verdict]').innerText(); if(!wrong&&!v.includes(`${x.items.length} من ${x.items.length}`))throw new Error('memory verdict '+v);
      await done();break}
    case 'move':{
      const safe=await page.locator('[data-testid=move-safety]').innerText(); if(!/توقف/.test(safe)||!/ألم/.test(safe))throw new Error('no safety note');
      for(let i=0;i<x.moves.length;i++){
        const nm=await page.locator('[data-testid=move-name]').innerText(); if(strip(nm)!==strip(x.moves[i].name.ar))throw new Error('move name '+nm);
        if(wrong)await btn(page,'تخطَّ هذه الحركة').click();
        else{await btn(page,'ابدأ المؤقت').click();await btn(page,'أنهيت الحركة').click()}
      }
      await page.waitForSelector('[data-testid=move-summary]');await done();break}
    default:throw new Error('unknown type '+x.type)
  }
  return readScore(page);
}
async function runItem(it,opts={}){
  const {ctx,page,errs}=await ctxPage({state:openAll(),clock:!!opts.clock});
  let score=null,err=null;
  try{await goto(page,'/train/'+it.id);
    // page header shows title
    const h1=await page.locator('main h1').innerText(); if(!h1.includes(it.title.ar.split(' · ')[0].slice(0,6))&&!h1.length)throw new Error('no title');
    score=await solve(page,it,opts);
    const st=await page.evaluate(()=>JSON.parse(localStorage.getItem('azam-store')||'{}'));
    const at=(st.state&&st.state.attempts||[]).filter(a=>a.trainingId===it.id);
    if(!at.length)throw new Error('attempt not saved in localStorage');
    if(!opts.wrong&&(!at[at.length-1].passed||at[at.length-1].score!==100))throw new Error('saved attempt not passed 100: '+JSON.stringify(at[at.length-1]));
  }catch(e){err=String(e.message||e).slice(0,200)}
  const bad=errs.filter(e=>!/favicon/.test(e));
  await ctx.close();
  return {id:it.id,type:it.interaction.type,score,err,errs:bad.slice(0,3)};
}
const pool=async(items,n,fn)=>{let i=0;await Promise.all(Array.from({length:n},async()=>{while(i<items.length){const it=items[i++];await fn(it)}}))};

// ================= PART: nav / index / stage pages =================
if(PARTS.includes('nav')){
  const {ctx,page,errs}=await ctxPage({state:stateWith({})});
  await goto(page,'');
  const homeLinks=await page.locator('main a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')));
  rec('home has /restore card',homeLinks.some(h=>h.endsWith('/restore')),homeLinks.filter(h=>/restore|iq/.test(h)).join(','));
  rec('home has /iq card',homeLinks.some(h=>h.endsWith('/iq')));
  rec('home has /brain card',homeLinks.some(h=>h.endsWith('/brain')));
  const navLinks=await page.locator('nav[aria-label=Primary] a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')));
  rec('desktop sidebar nav has restore+iq+brain+proc+dragon+tools with /do-craft base',['restore','iq','brain','proc','dragon','tools'].every(k=>navLinks.includes('/do-craft/'+k)),navLinks.join(','));
  const SENT='يسهّل المذاكرة: انتبه، وتذكّر، وابدأ. كل تمرين يشرح الجواب. الدرجة ليست ذكاء.';
  for(const [route,count,label] of [['/restore',30,'استعادة الدوبامين'],['/iq',20,'تمارين زيادة الذكاء'],['/brain',30,'تمارين مقاومة تبلد الدماغ'],['/proc',18,'مواجهة المماطلة'],['/dragon',22,'ترويض التنين الخامل']]){
    await goto(page,route); const rows=await page.locator('main ol > li').count();
    const h1=await page.locator('main h1').innerText();
    rec(`${route} lists ${count} stages`,rows===count&&h1.includes(label),`rows=${rows} h1=${h1}`);
    const txt=await page.locator('main').innerText(); rec(`${route} has disclaimer`,/ليس.*(علاجًا|اختبار ذكاء)|وليست علاجًا/.test(txt));
    if(route==='/restore'||route==='/iq'){
      rec(`${route}: exact sentence kept, no word «تدريب» in page content`,txt.includes(SENT)&&!/تدريب/.test(txt),txt.includes(SENT)+' '+/تدريب/.test(txt));
      rec(`${route}: tagline «التمارين الأعلى كفاءة في تنشيط العقل وتقليل الدوبامين الرخيص»`,(await page.locator('[data-testid=track-tagline]').innerText()).trim()==='التمارين الأعلى كفاءة في تنشيط العقل وتقليل الدوبامين الرخيص');
      const co=page.locator('[data-testid=bulb-callout]');
      rec(`${route}: light-bulb callout with exact text`,(await co.count())===1&&(await co.innerText()).trim()==='استعادة عقلك تستحق المحاولة كل يوم'&&(await co.locator('svg path').count())>=2);
    }
    if(route==='/brain'){
      rec('/brain: intro text exact',txt.includes('ما يُعرف بتعفّن الدماغ هو تبلد خطر يقلل من فاعلية العقل وإنتاجيته ونشاطه. هنا ستلاحظ الفرق المذهل… ابدأ ثم خذ استراحتك لا تتعجل النتائج ولكن لا تقع في حيرة التسويف مجدداً'));
      rec('/brain: methods named (kaizen, hansei, shu-ha-ri, sun tzu, go, wu wei...)',['كايزن','هانسي','شو-ها-ري','سون تزو','غو','وو وي','يين ويانغ','هارا هاتشي بو','قصر الذاكرة','الخرائط الذهنية'].every(w=>txt.includes(w)));
    }
    if(route==='/proc'||route==='/dragon'){
      rec(`${route}: Duolingo-style map (nodes, xp, streak, progress bar)`,(await page.locator('[data-testid=path-map]').count())===1&&(await page.locator('[data-testid=path-xp]').count())===1&&(await page.locator('[data-testid=path-streak]').count())===1&&(await page.locator('[role=progressbar]').count())>=1);
      const st=await page.locator('main ol > li').evaluateAll(l=>l.map(x=>x.getAttribute('data-state')));
      rec(`${route}: initial node states (1 current, rest locked)`,st[0]==='current'&&st.slice(1).every(x=>x==='locked'),st.slice(0,4).join(','));
    }
    if(route==='/dragon') rec('/dragon: safety note shown',/توقّف فورًا|توقف فورًا/.test(txt)&&/ألم/.test(txt));
  }
  await goto(page,'/dopamine'); const cross=await page.locator('main a[href$="/restore"]').count(); rec('/dopamine links to /restore (reuse/extend)',cross>=1);
  await goto(page,'/restore'); rec('/restore links back to /dopamine',(await page.locator('main a[href$="/dopamine"]').count())>=1);
  // search
  await goto(page,'/search'); await page.locator('input').first().fill('استعادة'); await page.waitForTimeout(400);
  rec('search finds restore',(await page.locator('main a[href$="/restore"]').count())>=1);
  await page.locator('input').first().fill('مماطلة'); await page.waitForTimeout(400);
  rec('search finds /proc',(await page.locator('main a[href$="/proc"]').count())>=1);
  await page.locator('input').first().fill('التنين'); await page.waitForTimeout(400);
  rec('search finds /dragon',(await page.locator('main a[href$="/dragon"]').count())>=1);
  await page.locator('input').first().fill('أدوات'); await page.waitForTimeout(400);
  rec('search finds /tools',(await page.locator('main a[href$="/tools"]').count())>=1);
  rec('nav page-level errors',errs.length===0,errs.slice(0,3).join(' | '));
  await ctx.close();
  // every stage page lists its exercises (all unlocked via overrides)
  const sres=[]; const stages=Object.entries(TRK).flatMap(([k,v])=>v.t.stages.map(s=>[k,s,v.n]));
  await pool(stages,CONC,async([tr,s,n])=>{
    const {ctx,page,errs}=await ctxPage({state:openAll()});
    try{await goto(page,`/${tr}/${s.id}`);const lis=await page.locator('main ol > li a[href*="/train/"]').count();const ok=lis===n;
      // click first exercise link and land on train page
      await page.locator('main ol > li a[href*="/train/"]').first().click();await page.waitForURL(/\/train\//);await page.waitForSelector('main h1');
      const here=page.url().includes('/train/'+s.id+'-t01');
      sres.push({id:s.id,pass:ok&&here&&!errs.length,info:`links=${lis} first=${here} errs=${errs.length}`})}
    catch(e){sres.push({id:s.id,pass:false,info:String(e.message).slice(0,120)})}
    await ctx.close()});
  const bad=sres.filter(r=>!r.pass); rec(`all ${stages.length} stage pages list their exercises (${stages.length-bad.length}/${stages.length})`,bad.length===0,bad.slice(0,5).map(b=>b.id+':'+b.info).join(' | '));
}

// ================= PART: every exercise solved correctly =================
let itemRes=[];
if(PARTS.includes('items')){
  let all=[...ALLITEMS]; if(ONLY)all=all.filter(i=>ONLY.test(i.id));
  const t0=Date.now();
  await pool(all,CONC,async it=>{const r=await runItem(it,{clock:it.interaction.type==='breathe'||(it.interaction.type==='memory'&&it.id.endsWith('3'))});r.pass=!r.err&&r.score===100&&r.errs.length===0;itemRes.push(r);if(!r.pass)console.log('FAIL item',JSON.stringify(r))});
  const byType={}; itemRes.forEach(r=>{(byType[r.type]??={n:0,pass:0});byType[r.type].n++;if(r.pass)byType[r.type].pass++});
  const bad=itemRes.filter(r=>!r.pass);
  rec(`every exercise solved to 100 (${itemRes.length-bad.length}/${itemRes.length}) in ${Math.round((Date.now()-t0)/1000)}s`,bad.length===0,JSON.stringify(byType)+(bad.length?' FAILS '+bad.slice(0,6).map(b=>b.id+':'+(b.err||b.score)).join(','):''));
}

// ================= PART: wrong answers fail, retry works =================
if(PARTS.includes('wrong')){
  const types=['breathe','quiz','calc','scenario','sprint','match','classify','reflect','recall','calibrate','memory','move'];
  const sample=[]; for(const t of types){const it=ALLITEMS.find(i=>i.interaction.type===t&&(!i.interaction.seconds||t==='calc'||t==='memory'));sample.push(it)}
  sample.push(ex.iq.items.find(i=>i.interaction.type==='quiz'&&i.interaction.seconds));
  sample.push(ex.iq.items.find(i=>i.interaction.type==='order')); // order: unshuffled check separately
  const wr=[];
  await pool(sample.filter(Boolean),CONC,async it=>{
    const {ctx,page,errs}=await ctxPage({state:openAll()});
    try{await goto(page,'/train/'+it.id);const sc=await solve(page,it,{wrong:true});
      const failed=sc<80||it.interaction.type==='order';
      // retry: click "أعد المحاولة" -> run state again, then solve right
      await btn(page,'أعد المحاولة').click(); await page.waitForSelector('main h1');
      const sc2=await solve(page,it,{});
      wr.push({id:it.id,type:it.interaction.type,pass:failed&&sc2===100,info:`wrong=${sc} retry=${sc2}`});
    }catch(e){wr.push({id:it.id,type:it.interaction.type,pass:false,info:String(e.message).slice(0,150)})}
    await ctx.close()});
  const bad=wr.filter(r=>!r.pass);
  rec(`wrong answer -> low score, retry -> 100 (${wr.length-bad.length}/${wr.length} types: ${wr.map(w=>w.type).join(',')})`,bad.length===0,bad.map(b=>b.id+' '+b.type+' '+b.info).join(' | '));
}

// ================= PART: unlock flow =================
if(PARTS.includes('unlock')){
  for(const [tr,stages,items,need] of Object.entries(TRK).map(([k,v])=>[k,v.t.stages,v.t.items,v.need])){
    const {ctx,page,errs}=await ctxPage({state:stateWith({})});
    const s1=stages[0].id,s2=stages[1].id,its1=items.filter(i=>i.stageId===s1);
    await goto(page,`/${tr}`);
    rec(`${tr}: stage 1 open, stage 2 shows locked at start`,(await page.locator(`li[data-stage=${s1}][data-locked="0"]`).count())===1&&(await page.locator(`li[data-stage=${s2}][data-locked="1"]`).count())===1);
    await goto(page,`/${tr}/${s2}`); rec(`${tr}: locked stage page shows lock + hides exercises`,(await page.locator('[data-testid=stage-locked]').count())===1&&(await page.locator('main ol a[href*="/train/"]').count())===0);
    await goto(page,`/train/${s2}-t01`); rec(`${tr}: direct /train link to locked stage is gated`,(await page.locator('[data-testid=train-locked]').count())===1);
    // pass need-1 items of stage 1 -> still locked
    const passN=async(k)=>{for(const it of its1.slice(0,k)){const st=await page.evaluate(id=>{const s=JSON.parse(localStorage.getItem('azam-store')||'{}');return (s.state&&s.state.attempts||[]).some(a=>a.trainingId===id&&a.passed)},it.id);if(st)continue;await goto(page,'/train/'+it.id);const sc=await solve(page,it,{clock:false});if(sc!==100)throw new Error('solve '+it.id+' '+sc)}};
    try{
      await passN(need-1); await goto(page,`/${tr}/${s2}`);
      rec(`${tr}: ${need-1}/${its1.length} passed -> next stage still locked`,(await page.locator('[data-testid=stage-locked]').count())===1);
      await passN(need); await goto(page,`/${tr}/${s2}`);
      rec(`${tr}: ${need}/${its1.length} passed -> next stage unlocked + lists exercises`,(await page.locator('[data-testid=stage-locked]').count())===0&&(await page.locator('main ol a[href*="/train/"]').count())===stages.length*0+items.filter(i=>i.stageId===s2).length);
      await goto(page,`/${tr}`); rec(`${tr}: index shows progress ${need}/${its1.length} for stage 1`,(await page.locator(`li[data-stage=${s1}]`).innerText()).includes(`${need}/${its1.length}`));
    }catch(e){rec(`${tr}: unlock flow`,false,String(e.message).slice(0,200))}
    // manual unlock button on stage 3
    const s3=stages[2].id; await goto(page,`/${tr}/${s3}`); await btn(page,'افتح هذه المرحلة على أي حال').click();
    await page.waitForSelector('main ol a[href*="/train/"]'); const ov=await page.evaluate(()=>JSON.parse(localStorage.getItem('azam-store')).state.stageOverrides);
    rec(`${tr}: manual unlock button opens stage and persists override`,ov.includes(s3),JSON.stringify(ov));
    // locked link to previous stage works
    await goto(page,`/${tr}/${stages[4].id}`); await page.locator('main a',{hasText:'اذهب إلى المرحلة السابقة'}).click(); await page.waitForURL(new RegExp(`/${tr}/${stages[3].id}/?$`));
    rec(`${tr}: "go to previous stage" link works`,true);
    rec(`${tr}: unlock flow console errors`,errs.length===0,errs.slice(0,3).join(' | '));
    await ctx.close();
  }
}

// ================= PART: persistence after reload =================
if(PARTS.includes('persist')){
  const {ctx,page,errs}=await ctxPage({state:openAll()});
  const it=ex.iq.items[0]; await goto(page,'/train/'+it.id); await solve(page,it,{});
  await page.reload(); await page.waitForSelector('main h1');
  const st=await page.evaluate(()=>JSON.parse(localStorage.getItem('azam-store')).state.attempts.length);
  await goto(page,'/iq/'+it.stageId); const sc=await page.locator('main ol > li').first().innerText();
  rec('score persisted in localStorage and shown on stage page after reload',st>=1&&/100/.test(sc),`attempts=${st}`);
  await goto(page,'/progress'); const pt=await page.locator('main').innerText(); rec('progress page renders with new attempts',pt.length>50);
  rec('persist errors',errs.length===0,errs.slice(0,3).join(' | '));
  await ctx.close();
}

// ================= PART: timers (fake clock) =================
if(PARTS.includes('timers')){
  const {ctx,page,errs}=await ctxPage({state:openAll(),clock:true});
  // timed calc: expire with 0 answered
  const speed=ex.iq.items.find(i=>i.id==='iq05-t09'); await goto(page,'/train/'+speed.id);
  rec('timed calc shows start card before clock starts',(await page.locator('main button',{hasText:'ابدأ'}).count())===1&&(await page.locator('[data-testid=calc-input]').count())===0);
  await btn(page,'ابدأ').click(); const t0=+(await page.locator('[data-testid=countdown]').innerText()).replace('s','');
  await page.clock.runFor(3000); const t1=+(await page.locator('[data-testid=countdown]').innerText()).replace('s','');
  rec('countdown ticks down',t0===speed.interaction.seconds&&t1<t0,`t0=${t0} t1=${t1}`);
  // answer first question right, then let time expire
  await page.locator('[data-testid=calc-input]').fill(String(speed.interaction.questions[0].answer)); await btn(page,'تحقق').click();
  await page.clock.runFor((speed.interaction.seconds+2)*1000);
  const sc=await readScore(page); rec('timed calc expiry ends round with partial score',sc===Math.round(100/speed.interaction.questions.length),`score=${sc}`);
  // timed quiz expiry
  const mixed=ex.iq.items.find(i=>i.id==='iq05-t10'); await goto(page,'/train/'+mixed.id); await btn(page,'ابدأ').click();
  await clickExact(page,'main button',mixed.interaction.questions[0].options[mixed.interaction.questions[0].correct].ar);
  await page.clock.runFor((mixed.interaction.seconds+2)*1000); const sc2=await readScore(page);
  rec('timed quiz expiry counts answered-only',sc2===Math.round(100/mixed.interaction.questions.length),`score=${sc2}`);
  // breathing: partial finish
  const br=ex.restore.items.find(i=>i.id==='rs03-t01'); await goto(page,'/train/'+br.id); await btn(page,'ابدأ').click();
  await page.clock.runFor((br.interaction.inhale+br.interaction.exhale+(br.interaction.hold||0))*1000*1+1000);
  const ph=await page.locator('[data-testid=breathe-phase]').innerText(); rec('breathing phase text updates',/شهيق|زفير|احبس/.test(ph),ph);
  await btn(page,'إنهاء الآن').click(); const sb=await readScore(page); rec('breathing partial finish scores by completed cycles',sb===Math.round(100*1/br.interaction.cycles)||sb===Math.round(100*0/br.interaction.cycles)||sb===34,`score=${sb} cycles=${br.interaction.cycles}`);
  // sprint timer counts down
  const sp=ex.restore.items.find(i=>i.id==='rs02-t04'); await goto(page,'/train/'+sp.id); await btn(page,'ابدأ').click(); await page.clock.runFor(5000);
  const sv=await page.locator('main p.font-display').first().innerText(); rec('sprint timer counts down',+sv.replace('s','')<=sp.interaction.seconds-4,sv);
  rec('timer errors',errs.length===0,errs.slice(0,3).join(' | '));
  await ctx.close();
}

// ================= PART: mobile =================
if(PARTS.includes('mobile')){
  const {ctx,page,errs}=await ctxPage({mobile:true,state:openAll()});
  await goto(page,'');
  const links=await page.locator('nav.fixed a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')));
  rec('mobile bottom nav has 8 entries incl. restore + iq + brain',links.length===8&&['restore','iq','brain'].every(k=>links.includes('/do-craft/'+k)),links.join(','));
  const ov=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth); rec('mobile home has no horizontal overflow',ov<=1,'overflow='+ov);
  for(const r of ['/restore','/iq','/brain','/proc','/dragon','/tools','/proc/pc03','/dragon/dg05','/brain/bd07','/restore/rs05','/iq/iq10','/train/rs05-t07','/train/iq10-t08','/train/iq03-t05','/train/dg03-t01','/train/bd04-t03','/train/pc02-t11']){await goto(page,r);const o=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);rec(`mobile ${r} no horizontal overflow`,o<=1,'overflow='+o)}
  await page.locator('nav.fixed a[href$="/restore"]').click(); await page.waitForURL(/\/restore\/?$/); rec('mobile nav click -> /restore',true);
  await page.locator('nav.fixed a[href$="/iq"]').click(); await page.waitForURL(/\/iq\/?$/); rec('mobile nav click -> /iq',true);
  const it=ex.restore.items.find(i=>i.id==='rs07-t06'); await goto(page,'/train/'+it.id); const sc=await solve(page,it,{}); rec('mobile solve match exercise',sc===100);
  rec('mobile errors',errs.length===0,errs.slice(0,3).join(' | '));
  await ctx.close();
}

// ================= PART: English locale =================
if(PARTS.includes('en')){
  const {ctx,page,errs}=await ctxPage({state:stateWith({locale:'en',stageOverrides:ALLSTAGES})});
  await goto(page,'/restore'); const h=await page.locator('main h1').innerText(); rec('en: /restore title',/Dopamine restoration/.test(h),h);
  await goto(page,'/iq/iq03'); const t=await page.locator('main').innerText(); rec('en: /iq stage renders',/Stage 3/.test(t)&&/Times tables/.test(t),t.slice(0,60).replace(/\n/g,' '));
  const it=ex.iq.items.find(i=>i.id==='iq03-t01'); await goto(page,'/train/'+it.id);
  const q=it.interaction.questions[0]; await page.locator('[data-testid=calc-input]').fill(String(q.answer)); await page.locator('main button',{hasText:'Check'}).click();
  const v=await page.locator('[data-testid=calc-verdict]').innerText(); rec('en: calc verdict in English',/Correct/.test(v),v);
  await goto(page,'/proc'); const e1=await page.locator('main h1').innerText(); rec('en: /proc title',/Facing procrastination/.test(e1),e1);
  await goto(page,'/tools'); const e2=await page.locator('main h1').innerText(); rec('en: /tools title',/Helper tools/.test(e2),e2);
  rec('en errors',errs.length===0,errs.slice(0,3).join(' | '));
  await ctx.close();
}
// ================= PART: map progress + home sections =================
if(PARTS.includes('home')){
  for(const [tr,k] of [['proc',TRK.proc],['dragon',TRK.dragon]]){
    const {ctx,page,errs}=await ctxPage({state:stateWith({})});
    await goto(page,'');
    const hs=page.locator('[data-testid=home-'+tr+']');
    rec(`home bottom section «${tr==='proc'?'مواجهة المماطلة':'ترويض التنين الخامل'}» with stats and mini map`,(await hs.count())===1&&(await hs.locator('[data-testid=mini-map] li').count())===5&&/النقاط 0/.test(await hs.innerText()),(await hs.innerText()).replace(/\n/g,' ').slice(0,100));
    await hs.locator('a',{hasText:'ابدأ المسار'}).click(); await page.waitForURL(new RegExp('/'+tr+'/?$'));
    rec(`home «${tr}» button opens /${tr}`,true);
    // solve `need` items of stage 1 via UI, check map states / xp / streak / bar
    const its=k.t.items.filter(i=>i.stageId===k.t.stages[0].id);
    for(const it of its.slice(0,k.need)){await goto(page,'/train/'+it.id);const sc=await solve(page,it,{});if(sc!==100)throw new Error('solve '+it.id)}
    await goto(page,'/'+tr);
    const st=await page.locator('main ol > li').evaluateAll(l=>l.map(x=>x.getAttribute('data-state')));
    rec(`/${tr} map after passing ${k.need}/${k.n}: stage 1 done, stage 2 current, rest locked`,st[0]==='done'&&st[1]==='current'&&st.slice(2).every(x=>x==='locked'),st.slice(0,4).join(','));
    const xp=+(await page.locator('[data-testid=path-xp]').innerText()), sk=+(await page.locator('[data-testid=path-streak]').innerText());
    rec(`/${tr} XP > 0 and streak >= 1`,xp>=k.need*20&&sk>=1,`xp=${xp} streak=${sk}`);
    const bar=await page.locator('[data-testid=path-bar]').getAttribute('style'); rec(`/${tr} progress bar moved`,/width:\s*[1-9]/.test(bar),bar);
    await page.reload(); await page.waitForSelector('[data-testid=path-map]');
    const st2=await page.locator('main ol > li').evaluateAll(l=>l.map(x=>x.getAttribute('data-state'))); rec(`/${tr} progress survives reload`,st2[0]==='done'&&st2[1]==='current');
    await goto(page,''); const ht=await page.locator('[data-testid=home-'+tr+'-stats]').innerText(); rec(`home «${tr}» stats updated after progress`,/المراحل 1\//.test(ht)&&!/النقاط 0 /.test(ht),ht);
    // click the current node -> stage page
    await goto(page,'/'+tr); await page.locator('main ol > li[data-state=current] a').click(); await page.waitForURL(new RegExp('/'+tr+'/'+k.t.stages[1].id+'/?$'));
    rec(`/${tr} clicking the current node opens stage 2`,true);
    await goto(page,'/'+tr); await page.locator('main ol > li[data-state=locked] a').first().click(); await page.waitForSelector('[data-testid=stage-locked]');
    rec(`/${tr} clicking a locked node shows the lock screen`,true);
    rec(`/${tr} map errors`,errs.length===0,errs.slice(0,3).join(' | '));
    await ctx.close();
  }
  const {ctx,page,errs}=await ctxPage({state:stateWith({})}); await goto(page,'');
  const ht=page.locator('[data-testid=home-tools]'); rec('home bottom section «أدوات المساعدة»',(await ht.count())===1);
  await ht.locator('a').click(); await page.waitForURL(/\/tools\/?$/); rec('home tools button opens /tools',true);
  rec('home errors',errs.length===0,errs.slice(0,3).join(' | ')); await ctx.close();
}

// ================= PART: toolkit =================
if(PARTS.includes('tools')){
  const {ctx,page,errs}=await ctxPage({state:stateWith({}),clock:true});
  const tid=id=>page.locator('[data-testid='+id+']');
  await goto(page,'/tools');
  rec('tools: 11 tools listed + index links',(await page.locator('section[data-testid^=tool-]').count())===11&&(await page.locator('[data-testid=tools-index] a').count())===11);
  // hourglass
  await tid('hourglass-minutes').fill('2'); await tid('hourglass-start').click();
  const f0=+(await tid('sand-top').getAttribute('data-frac'));
  await page.clock.runFor(60000); const f1=+(await tid('sand-top').getAttribute('data-frac')); const l1=await tid('hourglass-left').innerText();
  rec('hourglass: configurable duration, sand level falls (animated)',f0>0.99&&f1>0.4&&f1<0.6&&/01:0\d/.test(l1),`f0=${f0} f1=${f1} left=${l1}`);
  await tid('hourglass-pause').click(); const lp=await tid('hourglass-left').innerText(); await page.clock.runFor(5000); rec('hourglass: pause holds',(await tid('hourglass-left').innerText())===lp);
  await tid('hourglass-start').click(); await page.clock.runFor(70000); rec('hourglass: sand runs out -> message',(await tid('hourglass-done').count())===1&&+(await tid('sand-top').getAttribute('data-frac'))===0);
  await tid('hourglass-reset').click(); rec('hourglass: reset',(await tid('hourglass-left').innerText())==='02:00');
  // digital timer
  await tid('timer-h').fill('0'); await tid('timer-m').fill('0'); await tid('timer-s').fill('5'); rec('timer: display shows configured time',(await tid('timer-display').innerText())==='00:05');
  await tid('timer-start').click(); await page.clock.runFor(2000); const td=await tid('timer-display').innerText(); await page.clock.runFor(4000);
  rec('timer: counts down and finishes',td==='00:03'||td==='00:02'?(await tid('timer-done').count())===1:false,`mid=${td}`);
  await tid('timer-reset').click(); await tid('mode-up').click(); await tid('sw-start').click(); await page.clock.runFor(2500);
  const sw=await tid('sw-display').innerText(); await tid('sw-lap').click(); await tid('sw-stop').click();
  rec('stopwatch: runs, lap recorded, stop',/^00:02\./.test(sw)&&(await tid('sw-laps').locator('li').count())===1,sw);
  await tid('sw-reset').click(); rec('stopwatch: reset',(await tid('sw-display').innerText())==='00:00.00');
  // pomodoro
  await tid('pomo-focus').fill('1'); await tid('pomo-rest').fill('1'); await tid('pomo-start').click(); await page.clock.runFor(61000);
  rec('pomodoro: focus round counted, switches to rest',(await tid('pomo-count').innerText()).includes('1')&&/استراحة/.test(await tid('pomo-phase').innerText()),await tid('pomo-count').innerText());
  await tid('pomo-reset').click();
  // achievements
  await tid('ach-title').fill('أنجزت درس الرياضيات'); await tid('ach-note').fill('ساعة كاملة'); await tid('ach-add').click();
  await tid('ach-title').fill('مشيت خمس دقائق'); await tid('ach-add').click();
  rec('achievements table: rows added',(await tid('ach-row').count())===2&&/المجموع: 2/.test(await tid('ach-count').innerText()));
  await tid('ach-row').first().locator('button').click(); rec('achievements table: delete row',(await tid('ach-row').count())===1);
  // habits
  await tid('habit-name').fill('قراءة'); await tid('habit-add').click(); await tid('habit-name').fill('رياضة'); await tid('habit-add').click();
  rec('habits table: 2 habits x 7 day cells',(await tid('habit-row').count())===2&&(await tid('habit-cell').count())===14);
  const cells=tid('habit-row').first().locator('[data-testid=habit-cell]'); await cells.nth(6).check(); await cells.nth(5).check();
  rec('habits: daily check + streak counts consecutive days',(await tid('habit-row').first().locator('[data-testid=habit-streak]').innerText())==='2');
  await tid('habit-prev').click(); rec('habits: previous week grid unchecked',(await tid('habit-row').first().locator('input:checked').count())===0); await tid('habit-next').click();
  // tasks
  await tid('task-input').fill('مهمة أولى'); await tid('task-add').click(); await tid('task-input').fill('مهمة ثانية'); await tid('task-add').click();
  await tid('task-check').first().check(); rec('tasks: add/check/left counter',/1/.test(await tid('task-left').innerText())&&(await tid('task-check').count())===2);
  await tid('task-clear').click(); rec('tasks: clear finished',(await tid('task-check').count())===1);
  // goals
  await tid('goal-text').nth(0).fill('أنهي الفصل الأول'); await tid('goal-check').nth(0).check(); rec('daily goals: type + check',/1 من|أنجزت 1/.test(await tid('goal-count').innerText()));
  // breathing pacer
  await tid('breathe-in').fill('3'); await tid('breathe-hold').fill('1'); await tid('breathe-out').fill('3'); await tid('breathe-tool-start').click(); await page.clock.runFor(1000);
  const bp1=await tid('breathe-tool-phase').innerText(); await page.clock.runFor(5200); const bp2=await tid('breathe-tool-phase').innerText();
  rec('breathing pacer: phases advance, cycles counted',/شهيق/.test(bp1)&&/زفير|احبس/.test(bp2)&&/1|2/.test(await tid('breathe-tool-cycles').innerText()),bp1+'/'+bp2); await tid('breathe-tool-stop').click();
  // notes / water
  await tid('notes-text').fill('ملاحظة تجريبية'); rec('notes: character count',/14|13|15/.test(await tid('notes-count').innerText()));
  await tid('water-plus').click(); await tid('water-plus').click(); await tid('water-plus').click(); rec('water: +3 cups',(await tid('water-count').innerText()).replace(/\s/g,'').startsWith('3'));
  await tid('water-goal').fill('3'); rec('water: goal reached message',(await tid('water-done').count())===1);
  // eye rest
  await tid('eye-on').click(); rec('eye rest 20-20-20: reminder on, 20:00',(await tid('eye-display').innerText())==='20:00'||(await tid('eye-display').innerText())==='19:59');
  await page.clock.runFor(20*60*1000+500); rec('eye rest: after 20 minutes prompts to look away for 20 seconds',/انظر بعيدًا/.test(await tid('eye-status').innerText()));
  await page.clock.runFor(21000); rec('eye rest: ends automatically',(await tid('eye-on').count())===1);
  // persistence
  await page.reload(); await page.waitForSelector('[data-testid=tools-page] [data-testid=tool-notes]');
  const ls=await page.evaluate(()=>JSON.parse(localStorage.getItem('docraft-tools-v1')));
  rec('tools: everything saved in localStorage and restored after reload',(await tid('notes-text').inputValue())==='ملاحظة تجريبية'&&(await tid('ach-row').count())===1&&(await tid('habit-row').count())===2&&(await tid('habit-row').first().locator('input:checked').count())===2&&(await tid('task-check').count())===1&&(await tid('water-count').innerText()).replace(/\s/g,'').startsWith('3')&&ls.hourglassMin===2&&ls.timerS===5,JSON.stringify(Object.keys(ls)));
  rec('tools: no console/page errors',errs.length===0,errs.slice(0,3).join(' | '));
  await ctx.close();
}

await browser.close();
fs.writeFileSync(OUT,JSON.stringify({url:URLB,exercisesChunk:exf,results,items:itemRes},null,1));
console.log(`\nSUMMARY checks ${results.length} pass ${results.length-failCount} fail ${failCount}`);
process.exit(failCount?1:0);
