// Переопределение блока «Навигация по страницам» в редакторе
(function(){
  'use strict';
  const base = location.origin;

  function mkBtn(text, onClick, cls='btn'){
    const b=document.createElement('button'); b.className=cls; b.type='button';
    b.textContent=text; b.addEventListener('click', onClick); return b;
  }
  function mkLink(url){
    const a=document.createElement('a'); a.className='btn ghost link'; a.href=url; a.target='_blank'; a.rel='noopener'; a.textContent=url; return a;
  }
  function sanitizeSlug(s){ return (s||'').toLowerCase().replace(/[^a-z0-9\-]/g,'').replace(/^-+|-+$/g,''); }

  function highlightActive(id){
    document.querySelectorAll('#pages .page-item').forEach(row=>{
      const rid = parseInt(row.dataset.id||'0',10);
      const name = row.querySelector('.name');
      if(name){ if(rid===id){ row.classList.add('active'); name.classList.add('active'); } else { row.classList.remove('active'); name.classList.remove('active'); } }
    });
  }

  window.refreshPages = async function(){
    const r = await fetch('/editor/slugs.php?action=list',{cache:'no-store'});
    const j = await r.json(); 
    if(!j.ok) return;
    const list = document.querySelector('#pages'); 
    if(!list) return; 
    list.innerHTML='';

    (j.pages||[]).forEach(p=>{
      const row = document.createElement('div'); 
      row.className='page-item'; 
      row.dataset.id = p.id; 
      row.dataset.home = p.is_home ? '1' : '0';
      
      // Настройка сетки для элементов
      row.style.display = 'grid';
      row.style.gridTemplateColumns = '120px 30px 140px 90px 70px 30px';
      row.style.gap = '8px';
      row.style.alignItems = 'center';
      row.style.marginBottom = '8px';
      
      // 1. Название страницы
      const name = document.createElement('div'); 
      name.className='name'; 
      name.textContent = p.name;
      name.style.whiteSpace = 'nowrap';
      name.style.overflow = 'hidden';
      name.style.textOverflow = 'ellipsis';
      
      // 2. Кнопка копирования URL
      const urlPath = (p.slug ? '/' + p.slug : (p.is_home ? '/' : ('/?id='+p.id)));
      const relativeUrl = urlPath; // Используем только относительный путь
      
      const btnCopy = mkBtn('📋', async () => {
        try {
          await navigator.clipboard.writeText(relativeUrl);
          btnCopy.textContent = '✓';
          btnCopy.style.color = '#17c964';
          setTimeout(() => {
            btnCopy.textContent = '📋';
            btnCopy.style.color = '';
          }, 1500);
        } catch(err) {
          const textArea = document.createElement('textarea');
          textArea.value = relativeUrl;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          btnCopy.textContent = '✓';
          btnCopy.style.color = '#17c964';
          setTimeout(() => {
            btnCopy.textContent = '📋';
            btnCopy.style.color = '';
          }, 1500);
        }
      });
      btnCopy.style.padding = '4px';
      btnCopy.style.fontSize = '14px';
      btnCopy.style.width = '28px';
      btnCopy.style.height = '28px';
      btnCopy.title = 'Копировать URL: ' + relativeUrl;
      
      // 3. Поле URL (или пустое место для главной)
      const input = document.createElement('input'); 
      input.style.width='100%';
      if(!p.is_home) {
        input.placeholder='url'; 
        input.value = p.slug||''; 
        input.addEventListener('change', async ()=>{
          const v = sanitizeSlug(input.value); 
          input.value = v;
          const fd = new FormData(); 
          fd.append('action','update'); 
          fd.append('id', p.id); 
          fd.append('slug', v);
          const rr = await fetch('/editor/slugs.php', {method:'POST', body:fd}); 
          const jj = await rr.json();
          if(!jj.ok){ 
            alert(jj.error || 'Не удалось сохранить URL'); 
            return; 
          }
          const newPath = (v ? '/'+v : '/?id='+p.id);
          btnView.dataset.url = newPath;
          btnView.title = 'Открыть: ' + base + newPath;
          btnCopy.title = 'Копировать URL: ' + newPath;
        });
      } else {
        input.style.visibility = 'hidden';
      }
      
      // 4. Кнопка «Посмотреть»
      const fullUrl = base + urlPath; // Добавляем определение fullUrl
      const btnView = mkBtn('Посмотреть', ()=> window.open(fullUrl,'_blank','noopener')); 
      btnView.classList.add('ghost');
      btnView.dataset.url = urlPath;
      btnView.style.padding = '6px 8px';
      btnView.style.fontSize = '13px';
      btnView.title = 'Открыть: ' + fullUrl;
      
      // 5. Кнопка «Открыть»
      const btnOpen = mkBtn('Открыть', ()=> window.loadPage && window.loadPage(p.id));
      btnOpen.style.padding = '6px 8px';
      btnOpen.style.fontSize = '13px';
      
      // 6. Кнопка «Удалить» (крестик)
      const btnDelContainer = document.createElement('div');
      if(!p.is_home) {
        const del = mkBtn('×', async ()=>{
          if(!confirm('Удалить страницу "' + p.name + '"?')) return;
          const fd = new FormData(); 
          fd.append('id', p.id);
          await fetch('/editor/api.php?action=deletePage', {method:'POST', body:fd});
          if(window.currentPageId===p.id){ 
            await window.loadPage(0); 
          } else { 
            await window.refreshPages(); 
          }
        }, 'btn danger del');
        del.style.padding = '2px';
        del.style.fontSize = '20px';
        del.style.lineHeight = '1';
        del.style.width = '28px';
        del.style.height = '28px';
        del.style.fontWeight = 'bold';
        del.title = 'Удалить страницу';
        btnDelContainer.appendChild(del);
      }
      
      row.append(name, btnCopy, input, btnView, btnOpen, btnDelContainer);
      list.appendChild(row);
    });

    highlightActive(window.currentPageId||0);
  };

  if(!document.getElementById('nav-highlight-style')){
    const s=document.createElement('style'); s.id='nav-highlight-style';
    s.textContent='#pages .page-item .name.active, #pages .page-item.active>div:first-child{color:#17c964;font-weight:600}';
    document.head.appendChild(s);
  }

  try{ window.refreshPages(); }catch(e){}
})();
