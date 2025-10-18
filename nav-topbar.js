(function(){
  'use strict';
  
  // Создаем горизонтальную навигацию
  function createTopbarNav() {
    // Удаляем старую навигацию если есть
    const oldNav = document.getElementById('navTopbar');
    if (oldNav) oldNav.remove();
    
    const navBar = document.createElement('div');
    navBar.id = 'navTopbar';
    navBar.className = 'nav-topbar';
    navBar.innerHTML = `
      <div class="nav-topbar-label">Страницы:</div>
      <div class="nav-topbar-pages" id="topbarPages"></div>
      <div class="nav-topbar-actions">
        <button id="btnNewPage" class="btn">+ Новая</button>
        <button id="btnPurgeHome" class="btn danger">Очистить главную</button>
      </div>
    `;
    
    // Вставляем после SEO бара
    const seoBar = document.getElementById('seoBar');
    if (seoBar) {
      seoBar.parentNode.insertBefore(navBar, seoBar.nextSibling);
    } else {
      // Или после топбара
      const topbar = document.querySelector('.topbar');
      if (topbar) {
        topbar.parentNode.insertBefore(navBar, topbar.nextSibling);
      }
    }
    
    // Привязываем обработчики
    setupActions();
  }
  
  function setupActions() {
    const btnNew = document.getElementById('btnNewPage');
    const btnPurge = document.getElementById('btnPurgeHome');
    
    if (btnNew && !btnNew.hasAttribute('data-bound')) {
      btnNew.setAttribute('data-bound', 'true');
      btnNew.addEventListener('click', async () => {
        const name = prompt('Название страницы', 'Новая');
        if (!name) return;
        
        const fd = new FormData();
        fd.append('name', name);
        fd.append('title', '');
        fd.append('description', '');
        
        const r = await fetch('/editor/api.php?action=createPage', {
          method: 'POST',
          body: fd
        });
        const j = await r.json();
        
        if (j.ok) {
          await window.refreshPages();
          await window.loadPage(j.id);
        }
      });
    }
    
    if (btnPurge && !btnPurge.hasAttribute('data-bound')) {
      btnPurge.setAttribute('data-bound', 'true');
      btnPurge.addEventListener('click', async () => {
        if (!confirm('Очистить главную страницу?')) return;
        
        let homeId = window.currentPageId || 0;
        try {
          const rr = await fetch('/editor/api.php?action=listPages', { cache: 'no-store' });
          const jj = await rr.json();
          if (jj.ok && Array.isArray(jj.pages)) {
            const home = jj.pages.find(p => (p.name || '').toLowerCase() === 'главная');
            if (home) homeId = home.id;
          }
        } catch(e){}
        
        const fd = new FormData();
        fd.append('id', homeId);
        const r = await fetch('/editor/api.php?action=purgePage', { method:'POST', body: fd, cache: 'no-store' });
        const j = await r.json();
        if (j.ok) {
          if (window.currentPageId === homeId) {
            window.deviceData.desktop = { elements: [] };
            window.deviceData.tablet  = { elements: [] };
            window.deviceData.mobile  = { elements: [] };
            document.getElementById('stage').innerHTML = '';
            window.renderProps(null);
          }
          await window.refreshPages();
          alert('Главная очищена');
        }
      });
    }
  }
  
  // Переопределяем refreshPages для горизонтальной навигации
  const originalRefreshPages = window.refreshPages;
  window.refreshPages = async function() {
    const r = await fetch('/editor/slugs.php?action=list', {cache:'no-store'});
    const j = await r.json();
    if (!j.ok) return;
    
    const container = document.getElementById('topbarPages');
    if (!container) {
      createTopbarNav();
      const newContainer = document.getElementById('topbarPages');
      if (!newContainer) return;
      container = newContainer;
    }
    
    container.innerHTML = '';
    
    (j.pages || []).forEach(p => {
      const item = document.createElement('div');
      item.className = 'nav-topbar-item';
      item.dataset.id = p.id;
      if (p.id === window.currentPageId) item.classList.add('active');
      
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = p.name;
      name.title = p.name;
      
      const btnOpen = document.createElement('button');
      btnOpen.className = 'nav-btn';
      btnOpen.textContent = 'Открыть';
      btnOpen.onclick = () => window.loadPage(p.id);
      
      item.appendChild(name);
      item.appendChild(btnOpen);
      
      if (!p.is_home) {
        const btnDel = document.createElement('button');
        btnDel.className = 'nav-btn danger';
        btnDel.textContent = '×';
        btnDel.title = 'Удалить';
        btnDel.onclick = async () => {
          if (!confirm('Удалить страницу "' + p.name + '"?')) return;
          const fd = new FormData();
          fd.append('id', p.id);
          await fetch('/editor/api.php?action=deletePage', {method:'POST', body:fd});
          if (window.currentPageId === p.id) {
            await window.loadPage(0);
          } else {
            await window.refreshPages();
          }
        };
        item.appendChild(btnDel);
      }
      
      container.appendChild(item);
    });
    
    highlightActive(window.currentPageId || 0);
  };
  
  function highlightActive(id) {
    document.querySelectorAll('.nav-topbar-item').forEach(item => {
      if (parseInt(item.dataset.id) === id) {
        item.classList.add('active');
      } else {
        item.classList.remove('active');
      }
    });
  }
  
  // Инициализация при загрузке
  function init() {
    createTopbarNav();
    
    // Переопределяем loadPage чтобы подсвечивать активную страницу
    const originalLoadPage = window.loadPage;
    if (typeof originalLoadPage === 'function') {
      window.loadPage = async function(id) {
        const result = await originalLoadPage.apply(this, arguments);
        highlightActive(id);
        return result;
      };
    }
    
    // Запускаем обновление
    if (typeof window.refreshPages === 'function') {
      setTimeout(() => window.refreshPages(), 100);
    }
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();