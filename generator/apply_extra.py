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

    # ---------- 2. track view (rewritten, supports 5 tracks) ----------
    tv=find("track-view-")
    wr(A+"/"+tv,rd(X+"/track-view.src.js").replace("__EXERCISES__",EXF))

    # ---------- 3. training page engine ----------
    tf=find("_trainingId-"); s=rd(A+"/"+tf)
    s='import{restore as $RS,iq as $IQ,isStageUnlocked as $isU}from"./%s";'%EXF+s
    s=rep(s,"var h=o(u(),1);","var h=o(u(),1),$TRACKS={restore:$RS,iq:$IQ};")
    # scoring
    s=rep(s,"default:return{score:0,accuracy:0,detail:`unknown`}",
      "case`calc`:{let n=Array.isArray(t)?t:[],r=e.questions.length||1,i=0;e.questions.forEach((e,t)=>{$calcOk(n[t],e.answer)&&(i+=1)});let a=i/r;return{score:g(a*100),accuracy:a,detail:`${i}/${r}`}}"
      "case`breathe`:{let n=typeof t==`number`?t:0,r=e.cycles||1,i=Math.max(0,Math.min(1,n/r));return{score:g(i*100),accuracy:i,detail:`${n}/${r}`}}"
      "default:return{score:0,accuracy:0,detail:`unknown`}")
    # renderers
    s=rep(s,"e.type===`quiz`?(0,b.jsx)(E,{questions:e.questions,onDone:e=>t(e)})","e.type===`quiz`?(0,b.jsx)($QuizTimed,{questions:e.questions,seconds:e.seconds,onDone:e=>t(e)})")
    s=rep(s,"(0,b.jsx)(k,{items:e.items.map((e,t)=>({index:t,text:r(e)})),seed:n,onDone:e=>t(e)})","(0,b.jsx)(k,{items:e.items.map((e,t)=>({index:t,text:r(e)})),seed:n,prompt:e.showPrompt?r(e.prompt):void 0,onDone:e=>t(e)})")
    s=rep(s,"function k({items:e,seed:t,onDone:n}){","function k({items:e,seed:t,onDone:n,prompt:$p}){")
    s=rep(s,"(0,b.jsxs)(`div`,{className:`space-y-2`,children:[a.map((t,n)=>","(0,b.jsxs)(`div`,{className:`space-y-2`,children:[$p?(0,b.jsx)(`p`,{className:`text-lg`,children:$p}):null,a.map((t,n)=>")
    s=rep(s,":(0,b.jsx)(`p`,{children:i.empty})}function E(",":e.type===`calc`?(0,b.jsx)($Calc,{questions:e.questions,seconds:e.seconds,onDone:e=>t(e)}):e.type===`breathe`?(0,b.jsx)($Breathe,{interaction:e,onDone:e=>t(e)}):(0,b.jsx)(`p`,{children:i.empty})}function E(")
    # quiz sink (partial answers on timeout)
    s=rep(s,"function E({questions:e,onDone:t}){","function E({questions:e,onDone:t,sink:$s}){")
    s=rep(s,"onClick:()=>f(t),children:r(e)},e.en)),d==null?null:","onClick:()=>{f(t),$s&&$s([...s,t])},children:r(e)},e.en)),d==null?null:")
    s=rep(s,"onClick:()=>{let n=[...s,d];a+1>=e.length?t(n):(u(n),f(null),o(a+1))}","onClick:()=>{let n=[...s,d];$s&&$s(n),a+1>=e.length?t(n):(u(n),f(null),o(a+1))}")
    # breadcrumbs / stage links
    def crumb(p,tail_to): return None
    T_RS="{en:`Dopamine restoration`,ar:`استعادة الدوبامين`}"; T_IQ="{en:`Intelligence training`,ar:`تمارين زيادة الذكاء`}"
    a='(0,b.jsx)(e,{to:`/dopamine`,className:`underline`,children:o.dopamineFull}):(0,b.jsx)(e,{to:`/learn`,className:`underline`,children:o.program})'
    s=rep(s,a,'(0,b.jsx)(e,{to:`/dopamine`,className:`underline`,children:o.dopamineFull}):O?.track===`restore`?(0,b.jsx)(e,{to:`/restore`,className:`underline`,children:a(%s)}):O?.track===`iq`?(0,b.jsx)(e,{to:`/iq`,className:`underline`,children:a(%s)}):(0,b.jsx)(e,{to:`/learn`,className:`underline`,children:o.program})'%(T_RS,T_IQ))
    a='(0,b.jsx)(e,{to:`/learn/$stageId`,params:{stageId:t.stageId},className:`underline`,children:k?a(k.title):t.stageId})'
    s=rep(s,":"+a,":O?.track===`restore`?(0,b.jsx)(e,{to:`/restore/$stageId`,params:{stageId:t.stageId},className:`underline`,children:k?a(k.title):t.stageId}):O?.track===`iq`?(0,b.jsx)(e,{to:`/iq/$stageId`,params:{stageId:t.stageId},className:`underline`,children:k?a(k.title):t.stageId}):"+a)
    a='(0,b.jsx)(e,{to:`/learn/$stageId`,params:{stageId:t.stageId},children:o.stage})'
    s=rep(s,":"+a,":O?.track===`restore`?(0,b.jsx)(e,{to:`/restore/$stageId`,params:{stageId:t.stageId},children:o.stage}):O?.track===`iq`?(0,b.jsx)(e,{to:`/iq/$stageId`,params:{stageId:t.stageId},children:o.stage}):"+a)
    # gate + new components
    s=rep(s,"return r?(0,b.jsx)(C,{training:r},r.id):","return r?(0,b.jsx)($Gate,{training:r},r.id):")
    s=rep(s,"function F(){",rd(X+"/engine.patch.js")+"function F(){")
    wr(A+"/"+tf,s)

    # ---------- 4. route chunks ----------
    chrome=find("chrome-"); index=find("index-"); trackview=tv
    page=lambda track:'import{P as e}from"./%s";import{t}from"./%s";var n=e(),r=function(){return(0,n.jsx)(t,{track:`%s`})};export{r as component};'%(chrome,trackview,track)
    stage=lambda track,exp:'import{P as e}from"./%s";import{%s as t}from"./%s";import{n}from"./%s";var r=e(),i=function(){let{stageId:e}=t.useParams();return(0,r.jsx)(n,{track:`%s`,stageId:e})};export{i as component};'%(chrome,exp,index,trackview,track)
    names={}
    for tr,exp in (("restore","xr"),("iq","xq")):
        for kind,src in (("",page(tr)),("-stage",stage(tr,exp))):
            hh=hashlib.sha256(src.encode()).hexdigest()[:8]
            fn="%s%s-%s.js"%(tr,kind,hh); wr(A+"/"+fn,src); names[(tr,kind)]=fn

    # ---------- 5. router (index) ----------
    s=rd(A+"/"+index)
    defs=""
    for tr,v in (("restore","R"),("iq","Q")):
        defs+="$%sI=_e(`/%s/`)({component:w(()=>ye(()=>import(`./%s`),__vite__mapDeps([])),`component`)}),"%(v,tr,names[(tr,"")])
        defs+="$%sS=_e(`/%s/$stageId`)({component:w(()=>ye(()=>import(`./%s`),__vite__mapDeps([])),`component`)}),"%(v,tr,names[(tr,"-stage")])
    a="S_=_e(`/dopamine/$stageId`)({component:w(()=>ye(()=>import(`./_stageId-S1UothT8.js`),__vite__mapDeps([20,1,19,16,4,2,3])),`component`)}),"
    s=rep(s,a,a+defs)
    ups=""
    for tr,v in (("restore","R"),("iq","Q")):
        ups+="$%sIu=$%sI.update({id:`/%s/`,path:`/%s/`,getParentRoute:()=>l_}),"%(v,v,tr,tr)
        ups+="$%sSu=$%sS.update({id:`/%s/$stageId`,path:`/%s/$stageId`,getParentRoute:()=>l_}),"%(v,v,tr,tr)
    a="K_=S_.update({id:`/dopamine/$stageId`,path:`/dopamine/$stageId`,getParentRoute:()=>l_}),"
    s=rep(s,a,a+ups)
    s=rep(s,"DopamineStageIdRoute:K_,","DopamineStageIdRoute:K_,RestoreStageIdRoute:$RSu,IqStageIdRoute:$QSu,")
    s=rep(s,"DopamineIndexRoute:G_,","DopamineIndexRoute:G_,RestoreIndexRoute:$RIu,IqIndexRoute:$QIu,")
    s=rep(s,"export{O_ as a,A_ as i,P_ as n,S_ as o,M_ as r,F_ as t};","export{O_ as a,A_ as i,P_ as n,S_ as o,M_ as r,F_ as t,$RS as xr,$QS as xq};")
    wr(A+"/"+index,s)

    # ---------- 6. catalog ----------
    cf=find("catalog-"); s=rd(A+"/"+cf)
    s='import{restore as $RS,iq as $IQ}from"./%s";'%EXF+s
    s=rep(s,"{id:`dopamine`,stages:n,items:a}]","{id:`dopamine`,stages:n,items:a},{id:`restore`,stages:$RS.stages,items:$RS.items},{id:`iq`,stages:$IQ.stages,items:$IQ.items}]")
    wr(A+"/"+cf,s)

    # ---------- 7. chrome: nav + pager ----------
    s=rd(A+"/"+chrome)
    a="{to:`/dopamine`,label:n===`ar`?`جاهزية الدوبامين`:`Dopamine ready`,short:o.dopamine,icon:ut},"
    s=rep(s,a,a+"{to:`/restore`,label:n===`ar`?`استعادة الدوبامين`:`Dopamine restoration`,short:n===`ar`?`استعادة`:`Restore`,icon:at},{to:`/iq`,label:n===`ar`?`تمارين زيادة الذكاء`:`Intelligence training`,short:n===`ar`?`الذكاء`:`Smarts`,icon:it},")
    s=rep(s,"grid grid-cols-5 border-t","grid grid-cols-7 border-t")
    a="{to:`/dopamine`,ar:`الدوبامين`,en:`Dopamine`},"
    s=rep(s,a,a+"{to:`/restore`,ar:`استعادة الدوبامين`,en:`Restore`},{to:`/iq`,ar:`زيادة الذكاء`,en:`Smarts`},")
    s=rep(s,"if(e.startsWith(`/train/da`))r=3;else if(e.startsWith(`/train/px`))r=2;else if(e.startsWith(`/train/dm`))r=1;else if(e.startsWith(`/train/`))r=4;","if(e.startsWith(`/train/da`))r=3;else if(e.startsWith(`/train/rs`))r=4;else if(e.startsWith(`/train/iq`))r=5;else if(e.startsWith(`/train/px`))r=2;else if(e.startsWith(`/train/dm`))r=1;else if(e.startsWith(`/train/`))r=6;")
    wr(A+"/"+chrome,s)

    # ---------- 8. home cards ----------
    rf=find("routes-"); s=rd(A+"/"+rf)
    a="ar:`جهّز نفسك لبدء الشغل. ليس تحليل دم.`})})]})]})"
    def card(to,img,badge,title,en,ar):
        return ",(0,b.jsxs)(e,{to:`%s`,className:`relative min-h-36 overflow-hidden rounded-card border border-line bg-photo text-on-photo shadow-card`,children:[(0,b.jsx)(`img`,{src:`%s`,alt:``,className:`absolute inset-0 h-full w-full object-cover`}),(0,b.jsx)(`span`,{className:`absolute inset-0 bg-photo/65`}),(0,b.jsxs)(`span`,{className:`relative flex h-full flex-col justify-end p-4`,children:[(0,b.jsx)(`span`,{className:`text-sm font-semibold text-copper`,children:`%s`}),(0,b.jsx)(`span`,{className:`font-display text-2xl leading-tight sm:text-3xl`,children:`%s`}),(0,b.jsx)(`span`,{className:`mt-1 text-sm`,children:t({en:`%s`,ar:`%s`})})]})]})"%(to,img,badge,title,en,ar)
    s=rep(s,a,a+card("/restore","/mark.jpg","٣٠ × ٩","استعادة الدوبامين","Thirty stages of calm, focus, and good habits. Not treatment.","٣٠ مرحلة من الهدوء والتركيز والعادات الجيدة. ليس علاجًا.")+card("/iq","/neurons.jpg","٢٠ × ١٠","تمارين زيادة الذكاء","Numbers, sequences, logic, and riddles.","أرقام، ومتتاليات، ومنطق، وأحاجٍ."))
    wr(A+"/"+rf,s)

    # ---------- 9. search ----------
    sf=find("search-"); s=rd(A+"/"+sf)
    a="{en:`Dopamine ready`,ar:`جاهزية الدوبامين`,to:`/dopamine`},"
    s=rep(s,a,a+"{en:`Dopamine restoration`,ar:`استعادة الدوبامين`,to:`/restore`},{en:`Intelligence training`,ar:`تمارين زيادة الذكاء`,to:`/iq`},")
    wr(A+"/"+sf,s)

    # ---------- 10. css ----------
    cf=find("styles-",".css"); s=rd(A+"/"+cf)
    s+="\n.grid-cols-7{grid-template-columns:repeat(7,minmax(0,1fr))}\n"
    wr(A+"/"+cf,s)

    # ---------- 11. static HTML shells for the new routes ----------
    tpl=open(out+"/dopamine/index.html",encoding="utf8").read()
    import importlib; ex_mod=None
    def shell(route,title,chunk):
        t=tpl
        t=re.sub(r"<title>.*?</title>","<title>%s</title>"%title,t,count=1,flags=re.S)
        t=t.replace('<meta property="og:title" content="عقل فعّال">','<meta property="og:title" content="%s">'%title)
        t=t.replace("/assets/dopamine-Bmqei0Aa.js","/assets/"+chunk).replace("/assets/%s"%"track-view-DHAv0TKi.js","/assets/"+tv)
        m=re.search(r'<main id="content"[^>]*>',t); e=t.index("</main>",m.end())
        t=t[:m.end()]+'<p class="text-muted">جارٍ التحميل…</p>'+t[e:]
        d=out+route; os.makedirs(d,exist_ok=True); wr(d+"/index.html",t)
    import json
    node=subprocess.check_output(["node","-e","import('%s/%s').then(m=>console.log(JSON.stringify({r:m.restore.stages.map(s=>[s.id,s.title.ar]),i:m.iq.stages.map(s=>[s.id,s.title.ar]),ri:m.restore.items.map(s=>[s.id,s.title.ar]),ii:m.iq.items.map(s=>[s.id,s.title.ar])})))"%(A,EXF)])
    D=json.loads(node)
    shell("/restore","استعادة الدوبامين — عقل فعّال",names[("restore","")])
    shell("/iq","تمارين زيادة الذكاء — عقل فعّال",names[("iq","")])
    for sid,ti in D["r"]: shell("/restore/"+sid,ti+" — عقل فعّال",names[("restore","-stage")])
    for sid,ti in D["i"]: shell("/iq/"+sid,ti+" — عقل فعّال",names[("iq","-stage")])
    # train shells reuse the existing training chunk
    tm=re.search(r'/assets/(_trainingId-[^"]+\.js)',open(out+"/train/da01-t01/index.html",encoding="utf8").read()).group(1)
    ttpl=open(out+"/train/da01-t01/index.html",encoding="utf8").read()
    for tid,ti in D["ri"]+D["ii"]:
        t=re.sub(r"<title>.*?</title>","<title>%s — عقل فعّال</title>"%ti,ttpl,count=1,flags=re.S)
        m=re.search(r'<main id="content"[^>]*>',t); e=t.index("</main>",m.end())
        t=t[:m.end()]+'<p class="text-muted">جارٍ التحميل…</p>'+t[e:]
        d=out+"/train/"+tid; os.makedirs(d,exist_ok=True); wr(d+"/index.html",t)
    # ---------- 12. tests + generator sources travel with the site ----------
    os.makedirs(out+"/tests",exist_ok=True); [shutil.copy(X+"/tests/"+f,out+"/tests/"+f) for f in os.listdir(X+"/tests")]
    os.makedirs(out+"/generator",exist_ok=True)
    for f in ("restore_data1.py","restore_data2.py","assemble.py","exercises.common.js","exercises.restore.js","exercises.iq.js","exercises.tail.js","apply_extra.py","engine.patch.js","track-view.src.js"):
        shutil.copy(X+"/"+f,out+"/generator/"+f)
    wr(out+"/package.json",'{\n  "name": "do-craft",\n  "private": true,\n  "type": "module",\n  "scripts": {"test": "node tests/verify-exercises.mjs"}\n}\n')
    return {"exercises":EXF,"chunks":names,"restoreStages":len(D["r"]),"iqStages":len(D["i"]),"trainShells":len(D["ri"])+len(D["ii"])}

if __name__=="__main__":
    print(run(sys.argv[1]))
