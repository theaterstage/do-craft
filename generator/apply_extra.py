#!/usr/bin/env python3
"""Adds the «استعادة الدوبامين» (/restore) and «تمارين زيادة الذكاء» (/iq) sections to the mirrored app.
Runs from build.py on OUT (a fresh copy of raw/) BEFORE the base-path pass."""
import os, re, hashlib, subprocess, sys, shutil
X=os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0,X)

def rd(p): return open(p,encoding="utf8").read()
def wr(p,s): open(p,"w",encoding="utf8").write(s)
def rep(s,a,b,count=1):
    assert s.count(a)==count,("pattern count %d != %d: %s"%(s.count(a),count,a[:90]))
    return s.replace(a,b)

# (key, var, router-export, ar title, en title, item/stage id prefix, chrome icon)
TRK=[("restore","R","xr","استعادة الدوبامين","Dopamine restoration","rs"),
     ("iq","Q","xq","تمارين زيادة الذكاء","Intelligence training","iq"),
     ("brain","B","xb","تمارين مقاومة تبلد الدماغ","Brain-dullness resistance exercises","bd"),
     ("proc","P","xp","مواجهة المماطلة","Facing procrastination","pc"),
     ("dragon","D","xd","ترويض التنين الخامل","Taming the sluggish dragon","dg")]

def run(out):
    A=out+"/assets"
    def find(prefix,ext=".js"):
        m=[f for f in os.listdir(A) if f.startswith(prefix) and f.endswith(ext)]
        assert len(m)==1,(prefix,m); return m[0]
    # ---------- 1. exercises data chunk ----------
    subprocess.check_call([sys.executable,X+"/assemble.py"],stdout=subprocess.DEVNULL)
    ex=rd(X+"/exercises.mjs")
    h=hashlib.sha256(ex.encode()).hexdigest()[:8]
    EXF="exercises-%s.js"%h
    wr(A+"/"+EXF,ex)

    # ---------- 2. track view + shared kit + tools page ----------
    tv=find("track-view-")
    kitsrc=rd(X+"/kit.src.js"); kh=hashlib.sha256(kitsrc.encode()).hexdigest()[:8]; KIT="kit-%s.js"%kh
    wr(A+"/"+KIT,kitsrc)
    wr(A+"/"+tv,rd(X+"/track-view.src.js").replace("__EXERCISES__",EXF).replace("__KIT__",KIT))
    toolssrc=rd(X+"/tools.src.js"); TOOLS="tools-%s.js"%hashlib.sha256(toolssrc.encode()).hexdigest()[:8]
    wr(A+"/"+TOOLS,toolssrc)

    # ---------- 3. training page engine ----------
    tf=find("_trainingId-"); s=rd(A+"/"+tf)
    s='import{restore as $RS,iq as $IQ,brain as $BD,proc as $PC,dragon as $DG,isStageUnlocked as $isU}from"./%s";'%EXF+s
    s=rep(s,"var h=o(u(),1);","var h=o(u(),1),$TRACKS={restore:$RS,iq:$IQ,brain:$BD,proc:$PC,dragon:$DG};")
    # scoring
    s=rep(s,"default:return{score:0,accuracy:0,detail:`unknown`}",
      "case`calc`:{let n=Array.isArray(t)?t:[],r=e.questions.length||1,i=0;e.questions.forEach((e,t)=>{$calcOk(n[t],e.answer)&&(i+=1)});let a=i/r;return{score:g(a*100),accuracy:a,detail:`${i}/${r}`}}"
      "case`breathe`:{let n=typeof t==`number`?t:0,r=e.cycles||1,i=Math.max(0,Math.min(1,n/r));return{score:g(i*100),accuracy:i,detail:`${n}/${r}`}}"
      "case`move`:{let n=typeof t==`number`?t:0,r=e.moves.length||1,i=Math.max(0,Math.min(1,n/r));return{score:g(i*100),accuracy:i,detail:`${n}/${r}`}}"
      "case`memory`:{let n=Array.isArray(t)?t:[],r=e.items.map(e=>e.ar),a=n.filter(e=>r.includes(e)).length,o=n.length-a,i=Math.max(0,Math.min(1,(a-o)/(r.length||1)));return{score:g(i*100),accuracy:i,detail:`${a}/${r.length}`}}"
      "default:return{score:0,accuracy:0,detail:`unknown`}")
    # renderers
    s=rep(s,"e.type===`quiz`?(0,b.jsx)(E,{questions:e.questions,onDone:e=>t(e)})","e.type===`quiz`?(0,b.jsx)($QuizTimed,{questions:e.questions,seconds:e.seconds,onDone:e=>t(e)})")
    s=rep(s,"(0,b.jsx)(k,{items:e.items.map((e,t)=>({index:t,text:r(e)})),seed:n,onDone:e=>t(e)})","(0,b.jsx)(k,{items:e.items.map((e,t)=>({index:t,text:r(e)})),seed:n,prompt:e.showPrompt?r(e.prompt):void 0,onDone:e=>t(e)})")
    s=rep(s,"function k({items:e,seed:t,onDone:n}){","function k({items:e,seed:t,onDone:n,prompt:$p}){")
    s=rep(s,"(0,b.jsxs)(`div`,{className:`space-y-2`,children:[a.map((t,n)=>","(0,b.jsxs)(`div`,{className:`space-y-2`,children:[$p?(0,b.jsx)(`p`,{className:`text-lg`,children:$p}):null,a.map((t,n)=>")
    s=rep(s,":(0,b.jsx)(`p`,{children:i.empty})}function E(",":e.type===`calc`?(0,b.jsx)($Calc,{questions:e.questions,seconds:e.seconds,onDone:e=>t(e)}):e.type===`breathe`?(0,b.jsx)($Breathe,{interaction:e,onDone:e=>t(e)}):e.type===`memory`?(0,b.jsx)($Memory,{interaction:e,onDone:e=>t(e)}):e.type===`move`?(0,b.jsx)($Move,{interaction:e,onDone:e=>t(e)}):(0,b.jsx)(`p`,{children:i.empty})}function E(")
    # quiz sink (partial answers on timeout)
    s=rep(s,"function E({questions:e,onDone:t}){","function E({questions:e,onDone:t,sink:$s}){")
    s=rep(s,"onClick:()=>f(t),children:r(e)},e.en)),d==null?null:","onClick:()=>{f(t),$s&&$s([...s,t])},children:r(e)},e.en)),d==null?null:")
    s=rep(s,"onClick:()=>{let n=[...s,d];a+1>=e.length?t(n):(u(n),f(null),o(a+1))}","onClick:()=>{let n=[...s,d];$s&&$s(n),a+1>=e.length?t(n):(u(n),f(null),o(a+1))}")
    # breadcrumbs / stage links (all new tracks)
    a='(0,b.jsx)(e,{to:`/dopamine`,className:`underline`,children:o.dopamineFull}):(0,b.jsx)(e,{to:`/learn`,className:`underline`,children:o.program})'
    ch=''.join('O?.track===`%s`?(0,b.jsx)(e,{to:`/%s`,className:`underline`,children:a({en:`%s`,ar:`%s`})}):'%(k,k,en,ar) for k,_,_,ar,en,_ in TRK)
    s=rep(s,a,'(0,b.jsx)(e,{to:`/dopamine`,className:`underline`,children:o.dopamineFull}):'+ch+'(0,b.jsx)(e,{to:`/learn`,className:`underline`,children:o.program})')
    a='(0,b.jsx)(e,{to:`/learn/$stageId`,params:{stageId:t.stageId},className:`underline`,children:k?a(k.title):t.stageId})'
    ch=''.join('O?.track===`%s`?(0,b.jsx)(e,{to:`/%s/$stageId`,params:{stageId:t.stageId},className:`underline`,children:k?a(k.title):t.stageId}):'%(k,k) for k,*_ in TRK)
    s=rep(s,":"+a,":"+ch+a)
    a='(0,b.jsx)(e,{to:`/learn/$stageId`,params:{stageId:t.stageId},children:o.stage})'
    ch=''.join('O?.track===`%s`?(0,b.jsx)(e,{to:`/%s/$stageId`,params:{stageId:t.stageId},children:o.stage}):'%(k,k) for k,*_ in TRK)
    s=rep(s,":"+a,":"+ch+a)
    # gate + new components
    s=rep(s,"return r?(0,b.jsx)(C,{training:r},r.id):","return r?(0,b.jsx)($Gate,{training:r},r.id):")
    s=rep(s,"function F(){",rd(X+"/engine.patch.js")+"function F(){")
    wr(A+"/"+tf,s)

    # ---------- 4. route chunks ----------
    chrome=find("chrome-"); index=find("index-"); trackview=tv
    page=lambda track:'import{P as e}from"./%s";import{t}from"./%s";var n=e(),r=function(){return(0,n.jsx)(t,{track:`%s`})};export{r as component};'%(chrome,trackview,track)
    stage=lambda track,exp:'import{P as e}from"./%s";import{%s as t}from"./%s";import{n}from"./%s";var r=e(),i=function(){let{stageId:e}=t.useParams();return(0,r.jsx)(n,{track:`%s`,stageId:e})};export{i as component};'%(chrome,exp,index,trackview,track)
    names={}
    for tr,v,exp,*_ in TRK:
        for kind,src in (("",page(tr)),("-stage",stage(tr,exp))):
            hh=hashlib.sha256(src.encode()).hexdigest()[:8]
            fn="%s%s-%s.js"%(tr,kind,hh); wr(A+"/"+fn,src); names[(tr,kind)]=fn
    names[("tools","")]=TOOLS

    # ---------- 5. router (index) ----------
    s=rd(A+"/"+index)
    defs=""
    for tr,v,*_ in TRK:
        defs+="$%sI=_e(`/%s/`)({component:w(()=>ye(()=>import(`./%s`),__vite__mapDeps([])),`component`)}),"%(v,tr,names[(tr,"")])
        defs+="$%sS=_e(`/%s/$stageId`)({component:w(()=>ye(()=>import(`./%s`),__vite__mapDeps([])),`component`)}),"%(v,tr,names[(tr,"-stage")])
    defs+="$TI=_e(`/tools/`)({component:w(()=>ye(()=>import(`./%s`).then(m=>({component:m.t})),__vite__mapDeps([])),`component`)}),"%TOOLS
    a="S_=_e(`/dopamine/$stageId`)({component:w(()=>ye(()=>import(`./_stageId-S1UothT8.js`),__vite__mapDeps([20,1,19,16,4,2,3])),`component`)}),"
    s=rep(s,a,a+defs)
    ups=""
    for tr,v,*_ in TRK:
        ups+="$%sIu=$%sI.update({id:`/%s/`,path:`/%s/`,getParentRoute:()=>l_}),"%(v,v,tr,tr)
        ups+="$%sSu=$%sS.update({id:`/%s/$stageId`,path:`/%s/$stageId`,getParentRoute:()=>l_}),"%(v,v,tr,tr)
    ups+="$TIu=$TI.update({id:`/tools/`,path:`/tools/`,getParentRoute:()=>l_}),"
    a="K_=S_.update({id:`/dopamine/$stageId`,path:`/dopamine/$stageId`,getParentRoute:()=>l_}),"
    s=rep(s,a,a+ups)
    s=rep(s,"DopamineStageIdRoute:K_,","DopamineStageIdRoute:K_,"+"".join("%sStageIdRoute:$%sSu,"%(tr.capitalize(),v) for tr,v,*_ in TRK))
    s=rep(s,"DopamineIndexRoute:G_,","DopamineIndexRoute:G_,"+"".join("%sIndexRoute:$%sIu,"%(tr.capitalize(),v) for tr,v,*_ in TRK)+"ToolsIndexRoute:$TIu,")
    s=rep(s,"export{O_ as a,A_ as i,P_ as n,S_ as o,M_ as r,F_ as t};","export{O_ as a,A_ as i,P_ as n,S_ as o,M_ as r,F_ as t,"+",".join("$%sS as %s"%(v,exp) for tr,v,exp,*_ in TRK)+"};")
    wr(A+"/"+index,s)

    # ---------- 6. catalog ----------
    cf=find("catalog-"); s=rd(A+"/"+cf)
    s='import{restore as $RS,iq as $IQ,brain as $BD,proc as $PC,dragon as $DG}from"./%s";'%EXF+s
    s=rep(s,"{id:`dopamine`,stages:n,items:a}]","{id:`dopamine`,stages:n,items:a},{id:`restore`,stages:$RS.stages,items:$RS.items},{id:`iq`,stages:$IQ.stages,items:$IQ.items},{id:`brain`,stages:$BD.stages,items:$BD.items},{id:`proc`,stages:$PC.stages,items:$PC.items},{id:`dragon`,stages:$DG.stages,items:$DG.items}]")
    wr(A+"/"+cf,s)

    # ---------- 7. chrome: nav + pager + attempts cap ----------
    s=rd(A+"/"+chrome)
    a="{to:`/dopamine`,label:n===`ar`?`جاهزية الدوبامين`:`Dopamine ready`,short:o.dopamine,icon:ut},"
    s=rep(s,a,a+"{to:`/restore`,label:n===`ar`?`استعادة الدوبامين`:`Dopamine restoration`,short:n===`ar`?`استعادة`:`Restore`,icon:at},{to:`/iq`,label:n===`ar`?`تمارين زيادة الذكاء`:`Intelligence training`,short:n===`ar`?`الذكاء`:`Smarts`,icon:it},{to:`/brain`,label:n===`ar`?`تمارين مقاومة تبلد الدماغ`:`Brain-dullness resistance`,short:n===`ar`?`المقاومة`:`Resist`,icon:ht},")
    a="{to:`/progress`,label:o.progress,icon:rt},"
    s=rep(s,a,"{to:`/proc`,label:n===`ar`?`مواجهة المماطلة`:`Facing procrastination`,icon:dt},{to:`/dragon`,label:n===`ar`?`ترويض التنين الخامل`:`Taming the sluggish dragon`,icon:ut},{to:`/tools`,label:n===`ar`?`أدوات المساعدة`:`Helper tools`,icon:ct},"+a)
    s=rep(s,"grid grid-cols-5 border-t","grid grid-cols-8 border-t")
    a="{to:`/dopamine`,ar:`الدوبامين`,en:`Dopamine`},"
    s=rep(s,a,a+"{to:`/restore`,ar:`استعادة الدوبامين`,en:`Restore`},{to:`/iq`,ar:`زيادة الذكاء`,en:`Smarts`},{to:`/brain`,ar:`مقاومة التبلد`,en:`Resist`},{to:`/proc`,ar:`المماطلة`,en:`Procrastination`},{to:`/dragon`,ar:`التنين الخامل`,en:`Dragon`},{to:`/tools`,ar:`الأدوات`,en:`Tools`},")
    s=rep(s,"if(e.startsWith(`/train/da`))r=3;else if(e.startsWith(`/train/px`))r=2;else if(e.startsWith(`/train/dm`))r=1;else if(e.startsWith(`/train/`))r=4;","if(e.startsWith(`/train/da`))r=3;else if(e.startsWith(`/train/rs`))r=4;else if(e.startsWith(`/train/iq`))r=5;else if(e.startsWith(`/train/bd`))r=6;else if(e.startsWith(`/train/pc`))r=7;else if(e.startsWith(`/train/dg`))r=8;else if(e.startsWith(`/train/px`))r=2;else if(e.startsWith(`/train/dm`))r=1;else if(e.startsWith(`/train/`))r=10;")
    s=rep(s,"attempts:[...e.attempts,n].slice(-500)","attempts:[...e.attempts,n].slice(-6000)")
    wr(A+"/"+chrome,s)

    # ---------- 8. home cards + bottom sections ----------
    rf=find("routes-"); s=rd(A+"/"+rf)
    a="ar:`جهّز نفسك لبدء الشغل. ليس تحليل دم.`})})]})]})"
    def card(to,img,badge,title,en,ar):
        return ",(0,b.jsxs)(e,{to:`%s`,className:`relative min-h-36 overflow-hidden rounded-card border border-line bg-photo text-on-photo shadow-card`,children:[(0,b.jsx)(`img`,{src:`%s`,alt:``,className:`absolute inset-0 h-full w-full object-cover`}),(0,b.jsx)(`span`,{className:`absolute inset-0 bg-photo/65`}),(0,b.jsxs)(`span`,{className:`relative flex h-full flex-col justify-end p-4`,children:[(0,b.jsx)(`span`,{className:`text-sm font-semibold text-copper`,children:`%s`}),(0,b.jsx)(`span`,{className:`font-display text-2xl leading-tight sm:text-3xl`,children:`%s`}),(0,b.jsx)(`span`,{className:`mt-1 text-sm`,children:t({en:`%s`,ar:`%s`})})]})]})"%(to,img,badge,title,en,ar)
    s=rep(s,a,a+card("/restore","/mark.jpg","٣٠ × ٩","استعادة الدوبامين","Thirty stages of calm, focus, and good habits. Not treatment.","٣٠ مرحلة من الهدوء والتركيز والعادات الجيدة. ليس علاجًا.")+card("/iq","/neurons.jpg","٢٠ × ١٠","تمارين زيادة الذكاء","Numbers, sequences, logic, and riddles.","أرقام، ومتتاليات، ومنطق، وأحاجٍ.")+card("/brain","/brain.jpg","٣٠ × ٩","تمارين مقاومة تبلد الدماغ","Thirty stages with Chinese and Japanese thinking methods.","٣٠ مرحلة بطرق التفكير الصينية واليابانية."))
    s='import{h as $HomeMore}from"./%s";'%KIT+s
    s=rep(s,"function C(){return r(e=>e.onboarded)?(0,b.jsx)(T,{}):(0,b.jsx)(w,{})}","function C(){let $o=r(e=>e.onboarded);return(0,b.jsxs)(b.Fragment,{children:[$o?(0,b.jsx)(T,{}):(0,b.jsx)(w,{}),(0,b.jsx)($HomeMore,{})]})}")
    wr(A+"/"+rf,s)

    # ---------- 9. search ----------
    sf=find("search-"); s=rd(A+"/"+sf)
    a="{en:`Dopamine ready`,ar:`جاهزية الدوبامين`,to:`/dopamine`},"
    s=rep(s,a,a+"{en:`Dopamine restoration`,ar:`استعادة الدوبامين`,to:`/restore`},{en:`Intelligence training`,ar:`تمارين زيادة الذكاء`,to:`/iq`},{en:`Brain-dullness resistance exercises`,ar:`تمارين مقاومة تبلد الدماغ`,to:`/brain`},{en:`Facing procrastination`,ar:`مواجهة المماطلة`,to:`/proc`},{en:`Taming the sluggish dragon`,ar:`ترويض التنين الخامل`,to:`/dragon`},{en:`Helper tools: hourglass, timer, habits`,ar:`أدوات المساعدة: ساعة رملية، ومؤقت، وعادات`,to:`/tools`},")
    wr(A+"/"+sf,s)

    # ---------- 10. css ----------
    cf=find("styles-",".css"); s=rd(A+"/"+cf)
    s+="\n.grid-cols-7{grid-template-columns:repeat(7,minmax(0,1fr))}.grid-cols-8{grid-template-columns:repeat(8,minmax(0,1fr))}nav.grid-cols-8 a{font-size:.68rem}nav.grid-cols-8 svg{width:1.15rem;height:1.15rem}@keyframes sandfall{to{stroke-dashoffset:-12}}.sand-fall{animation:sandfall .5s linear infinite}.reduce-motion .sand-fall{animation:none}.ring-4{box-shadow:0 0 0 4px var(--color-copper-soft,rgba(200,120,60,.25))}.accent-current{accent-color:currentColor}.scroll-mt-24{scroll-margin-top:6rem}.line-through{text-decoration:line-through}.list-decimal{list-style-type:decimal}.border-copper{border-color:var(--copper)}.end-2{inset-inline-end:.5rem}.h-3{height:.75rem}.inline-block{display:inline-block}.leading-snug{line-height:1.375}.max-w-32{max-width:8rem}.mb-2{margin-bottom:.5rem}.mt-10{margin-top:2.5rem}.my-2{margin-block:.5rem}.my-3{margin-block:.75rem}.opacity-20{opacity:.2}.overflow-x-auto{overflow-x:auto}.pointer-events-none{pointer-events:none}.ps-6{padding-inline-start:1.5rem}.size-40{width:10rem;height:10rem}.size-6{width:1.5rem;height:1.5rem}.space-y-1>*+*{margin-top:.25rem}.text-line{color:var(--line)}.text-paper{color:var(--paper)}.bg-ink{background-color:var(--ink)}.path-stats{display:grid;gap:.75rem}@media(min-width:640px){.path-stats{grid-template-columns:repeat(3,minmax(0,1fr))}}\n"
    wr(A+"/"+cf,s)

    # ---------- 11. static HTML shells for the new routes ----------
    tpl=open(out+"/dopamine/index.html",encoding="utf8").read()
    def shell(route,title,chunk):
        t=tpl
        t=re.sub(r"<title>.*?</title>","<title>%s</title>"%title,t,count=1,flags=re.S)
        t=t.replace('<meta property="og:title" content="عقل فعّال">','<meta property="og:title" content="%s">'%title)
        t=t.replace("/assets/dopamine-Bmqei0Aa.js","/assets/"+chunk).replace("/assets/%s"%"track-view-DHAv0TKi.js","/assets/"+tv)
        m=re.search(r'<main id="content"[^>]*>',t); e=t.index("</main>",m.end())
        t=t[:m.end()]+'<p class="text-muted">جارٍ التحميل…</p>'+t[e:]
        d=out+route; os.makedirs(d,exist_ok=True); wr(d+"/index.html",t)
    import json
    js="import('%s/%s').then(m=>{const o={};for(const k of ['restore','iq','brain','proc','dragon']){o[k]={s:m[k].stages.map(s=>[s.id,s.title.ar]),i:m[k].items.map(s=>[s.id,s.title.ar])}}console.log(JSON.stringify(o))})"%(A,EXF)
    D=json.loads(subprocess.check_output(["node","-e",js]))
    for tr,v,exp,ar,en,pre in TRK:
        shell("/"+tr,ar+" — عقل فعّال",names[(tr,"")])
        for sid,ti in D[tr]["s"]: shell("/%s/%s"%(tr,sid),ti+" — عقل فعّال",names[(tr,"-stage")])
    shell("/tools","أدوات المساعدة — عقل فعّال",TOOLS)
    ttpl=open(out+"/train/da01-t01/index.html",encoding="utf8").read()
    nshell=0
    for tr,*_ in TRK:
        for tid,ti in D[tr]["i"]:
            t=re.sub(r"<title>.*?</title>","<title>%s — عقل فعّال</title>"%ti,ttpl,count=1,flags=re.S)
            m=re.search(r'<main id="content"[^>]*>',t); e=t.index("</main>",m.end())
            t=t[:m.end()]+'<p class="text-muted">جارٍ التحميل…</p>'+t[e:]
            d=out+"/train/"+tid; os.makedirs(d,exist_ok=True); wr(d+"/index.html",t); nshell+=1

    # ---------- 12. tests + generator sources travel with the site ----------
    os.makedirs(out+"/tests",exist_ok=True); [shutil.copy(X+"/tests/"+f,out+"/tests/"+f) for f in os.listdir(X+"/tests")]
    os.makedirs(out+"/generator/data",exist_ok=True)
    for f in ("restore_data1.py","restore_data2.py","assemble.py","exercises.common.js","exercises.restore.js","exercises.iq.js","exercises.tracks.js","exercises.tail.js","apply_extra.py","engine.patch.js","track-view.src.js","kit.src.js","tools.src.js"):
        shutil.copy(X+"/"+f,out+"/generator/"+f)
    for f in os.listdir(X+"/data"): shutil.copy(X+"/data/"+f,out+"/generator/data/"+f)
    wr(out+"/package.json",'{\n  "name": "do-craft",\n  "private": true,\n  "type": "module",\n  "scripts": {"test": "node tests/verify-exercises.mjs"}\n}\n')
    return {"exercises":EXF,"chunks":{"%s%s"%k:v for k,v in names.items()},"counts":{tr:[len(D[tr]["s"]),len(D[tr]["i"])] for tr,*_ in TRK},"trainShells":nshell}

if __name__=="__main__":
    print(run(sys.argv[1]))
