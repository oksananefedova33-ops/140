// v2 — более надёжный резайзер левой панели "Навигация по страницам"
(function(){
  'use strict';
  const LS_KEY = 'zerro.nav.width';

  function setWidth(px){
    const min = 220, max = 900;
    const w = Math.max(min, Math.min(max, Math.round(px)));
    document.documentElement.style.setProperty('--nav-w', w + 'px');
    try{ localStorage.setItem(LS_KEY, String(w)); }catch(e){}
  }
  function getSaved(){
    const v = parseInt(localStorage.getItem(LS_KEY)||'', 10);
    return isFinite(v) && v>0 ? v : null;
  }

  function findNavPanel(){
    // Ищем элемент, в котором есть текст "Навигация по страницам"
    const cands = Array.from(document.querySelectorAll(
      '.panel, .sidebar, .left, .left-panel, #left, [class*="nav"]'
    ));
    let el = cands.find(n => /навигация по страницам/i.test(n.textContent||''));
    // На крайний случай предположим, что первый .panel — это левая панель
    if(!el) el = document.querySelector('.wrap .panel, .panel');
    return el || null;
  }

  function init(){
    const panel  = findNavPanel();
    const layout = document.querySelector('.wrap') || panel?.parentElement;
    if(!panel || !layout) return;

    panel.classList.add('nav-panel');

    let res = panel.querySelector('.nav-resizer');
    if(!res){
      res = document.createElement('div');
      res.className = 'nav-resizer';
      res.title = 'Потяните за границу, чтобы изменить ширину';
      panel.appendChild(res);
    }

    const saved = getSaved(); if(saved) setWidth(saved);

    let startX = 0, startW = 0, dragging = false, pid = 0;
    const onMove = (e)=>{
      if(!dragging) return;
      const dx = e.clientX - startX;
      setWidth(startW + dx);
      e.preventDefault();
    };
    const stop = ()=>{
      if(!dragging) return;
      dragging = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', stop, true);
      document.body.classList.remove('nav-resize-active');
    };

    res.addEventListener('dblclick', ()=> setWidth(280));
    res.addEventListener('pointerdown', (e)=>{
      dragging = true;
      pid = e.pointerId || 0;
      startX = e.clientX;
      startW = panel.getBoundingClientRect().width;
      try{ res.setPointerCapture(pid); }catch(_){}
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', stop, true);
      document.body.classList.add('nav-resize-active');
      e.preventDefault();
    });
  }

  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
