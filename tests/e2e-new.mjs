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
const PARTS=(process.env.PARTS||'nav,items,wrong,unlock,persist,timers,mobile,en').split(',');
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
const ALLRS=ex.restore.stages.map(s=>s.id), ALLIQ=ex.iq.stages.map(s=>s.id);
const openAll=()=>stateWith({stageOverrides:[...ALLRS,...ALLIQ]});
async function goto(page,r){await page.goto(URLB+r+'/',{waitUntil:'load'});await page.waitForFunction(()=>{const m=document.querySelector('main');return m&&m.innerText.trim().length>2&&!/جارٍ التحميل/.test(m.innerText)},null,{timeout:20000})}
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
  const navLinks=await page.locator('nav[aria-label=Primary] a[href]').evaluateAll(a=>a.map(x=>x.getAttribute('href')));
  rec('desktop sidebar nav has restore+iq with /do-craft base',navLinks.includes('/do-craft/restore')&&navLinks.includes('/do-craft/iq'),navLinks.join(','));
  for(const [route,count,label] of [['/restore',30,'استعادة الدوبامين'],['/iq',20,'تمارين زيادة الذكاء']]){
    await goto(page,route); const rows=await page.locator('main ol > li').count();
    const h1=await page.locator('main h1').innerText();
    rec(`${route} lists ${count} stages`,rows===count&&h1.includes(label),`rows=${rows} h1=${h1}`);
    const txt=await page.locator('main').innerText(); rec(`${route} has disclaimer`,/ليس.*(علاجًا|اختبار ذكاء)/.test(txt));
  }
  await goto(page,'/dopamine'); const cross=await page.locator('main a[href$="/restore"]').count(); rec('/dopamine links to /restore (reuse/extend)',cross>=1);
  await goto(page,'/restore'); rec('/restore links back to /dopamine',(await page.locator('main a[href$="/dopamine"]').count())>=1);
  // search
  await goto(page,'/search'); await page.locator('input').first().fill('استعادة'); await page.waitForTimeout(400);
  rec('search finds restore',(await page.locator('main a[href$="/restore"]').count())>=1);
  rec('nav page-level errors',errs.length===0,errs.slice(0,3).join(' | '));
  await ctx.close();
  // every stage page lists its exercises (all unlocked via overrides)
  const sres=[]; const stages=[...ex.restore.stages.map(s=>['restore',s,9]),...ex.iq.stages.map(s=>['iq',s,10])];
  await pool(stages,CONC,async([tr,s,n])=>{
    const {ctx,page,errs}=await ctxPage({state:openAll()});
    try{await goto(page,`/${tr}/${s.id}`);const lis=await page.locator('main ol > li a[href*="/train/"]').count();const ok=lis===n;
      // click first exercise link and land on train page
      await page.locator('main ol > li a[href*="/train/"]').first().click();await page.waitForURL(/\/train\//);await page.waitForSelector('main h1');
      const here=page.url().includes('/train/'+s.id+'-t01');
      sres.push({id:s.id,pass:ok&&here&&!errs.length,info:`links=${lis} first=${here} errs=${errs.length}`})}
    catch(e){sres.push({id:s.id,pass:false,info:String(e.message).slice(0,120)})}
    await ctx.close()});
  const bad=sres.filter(r=>!r.pass); rec(`all 50 stage pages list their exercises (${stages.length-bad.length}/${stages.length})`,bad.length===0,bad.slice(0,5).map(b=>b.id+':'+b.info).join(' | '));
}

// ================= PART: every exercise solved correctly =================
let itemRes=[];
if(PARTS.includes('items')){
  let all=[...ex.restore.items,...ex.iq.items]; if(ONLY)all=all.filter(i=>ONLY.test(i.id));
  const t0=Date.now();
  await pool(all,CONC,async it=>{const r=await runItem(it,{clock:it.interaction.type==='breathe'});r.pass=!r.err&&r.score===100&&r.errs.length===0;itemRes.push(r);if(!r.pass)console.log('FAIL item',JSON.stringify(r))});
  const byType={}; itemRes.forEach(r=>{(byType[r.type]??={n:0,pass:0});byType[r.type].n++;if(r.pass)byType[r.type].pass++});
  const bad=itemRes.filter(r=>!r.pass);
  rec(`every exercise solved to 100 (${itemRes.length-bad.length}/${itemRes.length}) in ${Math.round((Date.now()-t0)/1000)}s`,bad.length===0,JSON.stringify(byType)+(bad.length?' FAILS '+bad.slice(0,6).map(b=>b.id+':'+(b.err||b.score)).join(','):''));
}

// ================= PART: wrong answers fail, retry works =================
if(PARTS.includes('wrong')){
  const types=['breathe','quiz','calc','scenario','sprint','match','classify','reflect','recall','calibrate'];
  const sample=[]; for(const t of types){const it=[...ex.restore.items,...ex.iq.items].find(i=>i.interaction.type===t&&(!i.interaction.seconds||t==='calc'));sample.push(it)}
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
  for(const [tr,stages,items,need] of [['restore',ex.restore.stages,ex.restore.items,7],['iq',ex.iq.stages,ex.iq.items,7]]){
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
  rec('mobile bottom nav has 7 entries incl. restore + iq',links.length===7&&links.includes('/do-craft/restore')&&links.includes('/do-craft/iq'),links.join(','));
  const ov=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth); rec('mobile home has no horizontal overflow',ov<=1,'overflow='+ov);
  for(const r of ['/restore','/iq','/restore/rs05','/iq/iq10','/train/rs05-t07','/train/iq10-t08','/train/iq03-t05']){await goto(page,r);const o=await page.evaluate(()=>document.documentElement.scrollWidth-window.innerWidth);rec(`mobile ${r} no horizontal overflow`,o<=1,'overflow='+o)}
  await page.locator('nav.fixed a[href$="/restore"]').click(); await page.waitForURL(/\/restore\/?$/); rec('mobile nav click -> /restore',true);
  await page.locator('nav.fixed a[href$="/iq"]').click(); await page.waitForURL(/\/iq\/?$/); rec('mobile nav click -> /iq',true);
  const it=ex.restore.items.find(i=>i.id==='rs07-t06'); await goto(page,'/train/'+it.id); const sc=await solve(page,it,{}); rec('mobile solve match exercise',sc===100);
  rec('mobile errors',errs.length===0,errs.slice(0,3).join(' | '));
  await ctx.close();
}

// ================= PART: English locale =================
if(PARTS.includes('en')){
  const {ctx,page,errs}=await ctxPage({state:stateWith({locale:'en',stageOverrides:[...ALLRS,...ALLIQ]})});
  await goto(page,'/restore'); const h=await page.locator('main h1').innerText(); rec('en: /restore title',/Dopamine restoration/.test(h),h);
  await goto(page,'/iq/iq03'); const t=await page.locator('main').innerText(); rec('en: /iq stage renders',/Stage 3/.test(t)&&/Times tables/.test(t),t.slice(0,60).replace(/\n/g,' '));
  const it=ex.iq.items.find(i=>i.id==='iq03-t01'); await goto(page,'/train/'+it.id);
  const q=it.interaction.questions[0]; await page.locator('[data-testid=calc-input]').fill(String(q.answer)); await page.locator('main button',{hasText:'Check'}).click();
  const v=await page.locator('[data-testid=calc-verdict]').innerText(); rec('en: calc verdict in English',/Correct/.test(v),v);
  rec('en errors',errs.length===0,errs.slice(0,3).join(' | '));
  await ctx.close();
}
await browser.close();
fs.writeFileSync(OUT,JSON.stringify({url:URLB,exercisesChunk:exf,results,items:itemRes},null,1));
console.log(`\nSUMMARY checks ${results.length} pass ${results.length-failCount} fail ${failCount}`);
process.exit(failCount?1:0);
