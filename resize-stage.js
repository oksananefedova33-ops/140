// /editor/assets/resize-stage.js — вертикальная ручка для изменения высоты окна редактора (сцены)
(function(){
  'use strict';
  const LS_KEY = 'zerro.stage.height';

  function clamp(v, min, max){ return Math.max(min, Math.min(max, v)); }
  function getMinHeightPx(el){
    const v = parseFloat(getComputedStyle(el).minHeight || '0');
    return isFinite(v) ? v : 0;
  }

  function install(){
    const frame = document.querySelector('.device-frame');
    const stage = document.getElementById('stage');
    if (!frame || !stage) return;

// === PATCH 2025-09-29: make saved height robust & avoid overriding CSS scaling ===
// We store {h, vw} instead of raw number and only apply if it looks compatible.
// If an old numeric value is present and differs strongly from CSS-computed height,
// we ignore it and delete the key to avoid mismatches with the published page.
    let savedEntry = null;
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        try {
          const obj = JSON.parse(raw);
          if (obj && typeof obj.h === 'number') savedEntry = obj;
        } catch(e) {
          const num = parseInt(raw, 10);
          if (isFinite(num)) savedEntry = { h: num, vw: (window.innerWidth || 1200) };
        }
      }
    } catch(e){}

    const expectedCssHeight = Math.round(stage.getBoundingClientRect().height);

    if (savedEntry && savedEntry.h > 0) {
      // If the saved height obviously doesn't match the CSS‑based height,
      // treat it as stale (e.g., after code update) and drop it.
      const ratio = expectedCssHeight > 0 ? Math.abs(savedEntry.h - expectedCssHeight) / expectedCssHeight : 1;
      if (ratio < 0.15) { // close enough -> apply saved
        let h = savedEntry.h;
        // If saved with different viewport width, scale proportionally to current width
        if (savedEntry.vw && window.innerWidth && savedEntry.vw !== window.innerWidth) {
          h = Math.round(h * (window.innerWidth / savedEntry.vw));
        }
        stage.style.height = h + 'px';
        window.stageUserResized = true;
        window.stageAutoGrownOnce = true;
      } else {
        // stale value — remove so CSS (vw‑scaled) dictates height
        try { localStorage.removeItem(LS_KEY); } catch(e){}
      }
    }


    // ручка
    const res = document.createElement('div');
    res.className = 'stage-resizer';
    frame.appendChild(res);

    // восстановление сохранённой высоты
    try{
      const saved = parseInt(localStorage.getItem(LS_KEY)||'', 10);
      if (isFinite(saved) && saved>0){
        stage.style.height = saved + 'px';
        window.stageUserResized = true;   // выключаем авто‑подстройку
        window.stageAutoGrownOnce = true; // и считаем, что она уже была
      }
    }catch(e){}

    let dragging = false;
    let startY = 0, startH = 0;
    const minH = Math.max(getMinHeightPx(stage) || 720, 400);

    const onMove = (e)=>{
      if(!dragging) return;
      const dy = e.clientY - startY;
      const h = clamp(Math.round(startH + dy), minH, 10000);
      stage.style.height = h + 'px';
    };
    const stop = ()=>{
      if(!dragging) return;
      dragging = false;
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerup', stop, true);
      document.body.classList.remove('stage-resize-active');
      window.stageUserResized = true;
      window.stageAutoGrownOnce = true;
      try{ localStorage.setItem(LS_KEY, String(Math.round(stage.getBoundingClientRect().height))); }catch(e){}
    };
    res.addEventListener('pointerdown', (e)=>{
      dragging = true;
      startY = e.clientY;
      startH = Math.round(stage.getBoundingClientRect().height);
      document.addEventListener('pointermove', onMove);
      document.addEventListener('pointerup', stop, true);
      document.body.classList.add('stage-resize-active');
      try{ res.setPointerCapture(e.pointerId); }catch(e){}
      e.preventDefault();
    });
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', install);
  } else {
    install();
  }
})();
