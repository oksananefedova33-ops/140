(function(){
  'use strict';

  // ---------- DOM helpers ----------
  function q(s){ return document.querySelector(s); }
  function getTitleEl(){
    const choices=[
      '#seoTitle','#seo_title','#seo-title',
      'input[name="seo_title"]','input[name="seoTitle"]','input[name="meta_title"]',
      'input[placeholder*="SEO Title" i]','input[placeholder*="Title" i]'
    ];
    for(const sel of choices){ const el=q(sel); if(el) return el; }
    return null;
  }
  function getDescrEl(){
    const choices=[
      '#seoDesc','#seo_description','#seo-description','#seoDescription',
      'textarea[name="seo_description"]','textarea[name="seoDescription"]','textarea[name="meta_description"]',
      'input[name="seo_description"]','input[name="meta_description"]',
      'textarea[placeholder*="SEO Description" i]','textarea[placeholder*="Description" i]',
      'input[placeholder*="SEO Description" i]','input[placeholder*="Description" i]'
    ];
    for(const sel of choices){ const el=q(sel); if(el) return el; }
    return null;
  }
  function grabSEO(){
    const t=getTitleEl(), d=getDescrEl();
    return {
      title: (t && 'value' in t ? String(t.value) : '').trim(),
      descr: (d && 'value' in d ? String(d.value) : '').trim()
    };
  }

  // ---------- Snapshot/Lock ----------
  const SEO = {
    snapshot: {title:'', descr:''},
    locked:   false,
    has(){ return !!((this.snapshot.title||'').length || (this.snapshot.descr||'').length); },
    setFrom(vals){ this.snapshot={title:vals.title||'', descr:vals.descr||''}; this.locked=this.has(); }
  };

  // ---------- ID helpers ----------
  function getActivePageIdFromDom(){
    const sels=['#pages .page-item.active','#pages .page-item .name.active','.page-item.active'];
    for(const s of sels){
      const el=q(s); if(!el) continue;
      const row=el.closest('.page-item')||el;
      let id=Number((row.dataset && (row.dataset.pageId||row.dataset.id))||row.getAttribute('data-page-id')||row.getAttribute('data-id')||0);
      if(id>0) return id;
      const a=row.querySelector('a[href*="?p="],a[href*="id="],a[href*="/page/"]');
      if(a){
        const m=a.href.match(/(?:\?|&)id=(\d+)|(?:\?|&)p=(\d+)|\/page\/(\d+)/);
        if(m){ id=Number(m[1]||m[2]||m[3]||0); if(id>0) return id; }
      }
    }
    return 0;
  }
  async function ensurePageId(maxWaitMs){
    let id=Number(window.currentPageId||window.__lastSavedId||0);
    if(id>0) return id;
    const end=Date.now()+(maxWaitMs||2500);
    do{
      id=Number(window.currentPageId||window.__lastSavedId||getActivePageIdFromDom()||0);
      if(id>0) return id;
      await new Promise(r=>setTimeout(r,100));
    }while(Date.now()<end);
    return 0;
  }

  // ---------- SEO API ----------
  async function saveSEO(id, title, descr){
    if(!id) return;
    const t=(title??'').trim(), d=(descr??'').trim();
    if(!t && !d) return; // никогда не перетираем пустыми
    const fd=new FormData();
    fd.append('action','save'); fd.append('id', id);
    if(t) fd.append('meta_title', t);
    if(d) fd.append('meta_description', d);
    try{ await fetch('/editor/seo.php', {method:'POST', body:fd, cache:'no-store'}); }catch(_){}
  }
  async function fetchSEO(id){
    if(!id) return null;
    try{
      const r=await fetch('/editor/seo.php?action=get&id='+id,{cache:'no-store'});
      return await r.json();
    }catch(_){ return null; }
  }

  // ---------- wrap savePage: явное «Сохранить» ----------
  (function wrapSave(){
    const tryWrap=()=>{
      const fn=window.savePage||window.save||window.saveCurrentPage;
      if(typeof fn!=='function'){ setTimeout(tryWrap,150); return; }
      const orig=fn;
      const wrapped=async function(){
        // До сохранения фиксируем значения и «включаем замок»
        const vals=grabSEO();
        if(vals.title || vals.descr) SEO.setFrom(vals);
        const resp=await orig.apply(this,arguments);
        const id=await ensurePageId(2500);
        if(id && SEO.has()) await saveSEO(id, SEO.snapshot.title, SEO.snapshot.descr);
        return resp;
      };
      if(window.savePage) window.savePage=wrapped;
      else if(window.save) window.save=wrapped;
      else window.saveCurrentPage=wrapped;
    };
    tryWrap();
  })();

  // ---------- capture «Сохранить» (страховка) ----------
  (function hookSaveBtn(){
    const tryHook=()=>{
      const b=document.getElementById('btnSave');
      const fn=window.savePage||window.save||window.saveCurrentPage;
      if(!b||typeof fn!=='function'){ setTimeout(tryHook,150); return; }
      if(b.dataset.seoHooked==='1') return; b.dataset.seoHooked='1';
      b.addEventListener('click', async function(e){
        e.preventDefault(); e.stopImmediatePropagation();
        const vals=grabSEO(); if(vals.title||vals.descr) SEO.setFrom(vals);
        const r=await fn.call(this,e);
        const id=await ensurePageId(2500);
        if(id && SEO.has()) await saveSEO(id, SEO.snapshot.title, SEO.snapshot.descr);
        return r;
      }, true);
    };
    tryHook();
  })();

  // ---------- patch fetch: приклеиваем снэпшот к любому savePage (в т.ч. автосейвы) ----------
  (function patchFetch(){
    if(!window.fetch) return;
    const orig=window.fetch.bind(window);
    window.fetch=function(input,init){
      try{
        const url=(typeof input==='string')?input:((input&&input.url)||'');
        const isSave = url && url.indexOf('/editor/api.php')!==-1 && url.indexOf('action=savePage')!==-1;
        let valsToSend=null;
        if(isSave){
          const cur=grabSEO();
          if(SEO.has()){ valsToSend={...SEO.snapshot}; }
          else if(cur.title||cur.descr){ valsToSend={...cur}; SEO.setFrom(cur); }
          if(init && init.body && (init.body instanceof FormData) && valsToSend){
            if(valsToSend.title) init.body.set('meta_title', valsToSend.title);
            if(valsToSend.descr) init.body.set('meta_description', valsToSend.descr);
          }
        }
        const p=orig(input,init);
        if(!isSave) return p;
        return p.then(async (resp)=>{
          if(!valsToSend) return resp;
          let id=Number(window.currentPageId||0);
          if(!id){
            try{
              const j=await resp.clone().json();
              id=Number((j && (j.id||(j.page&&j.page.id)||(j.data&&j.data.id)))||0);
            }catch(_){}
          }
          if(!id){ await new Promise(r=>setTimeout(r,150)); id=getActivePageIdFromDom(); }
          if(id){ window.__lastSavedId=id; await saveSEO(id, valsToSend.title, valsToSend.descr); }
          return resp;
        });
      }catch(_){ return orig(input,init); }
    };
  })();

  // ---------- предзагрузка при открытии ----------
  document.addEventListener('DOMContentLoaded', async ()=>{
    const id=Number(window.currentPageId||0);
    if(!id) return;
    const payload=await fetchSEO(id);
    const data=payload && (payload.data||payload);
    if(data){
      SEO.setFrom({title:data.meta_title||'', descr:data.meta_description||''});
      const t=getTitleEl(), d=getDescrEl();
      if(t) t.value=SEO.snapshot.title;
      if(d) d.value=SEO.snapshot.descr;
    }
  });

})();
