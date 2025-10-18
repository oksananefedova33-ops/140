<?php require_once dirname(__DIR__) . '/admin/config.php'; ?>
<!doctype html>

<!doctype html>
<html lang="ru"><head>
<meta charset="utf-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Редактор — Zerro Blog</title>
<link rel="stylesheet" href="assets/editor.css?v=<?php echo date('YmdHis'); ?>"/>
<link rel="stylesheet" href="/editor/assets/resize-nav.css?v=20250903-232413">
<!-- +++ Ручка вертикального ресайза сцены -->
<link rel="stylesheet" href="/editor/assets/resize-stage.css?v=<?php echo date('YmdHis'); ?>">
<link rel="stylesheet" href="/ui/canvas-height/canvas-height.css?v=<?php echo date('YmdHis'); ?>">

<link rel="stylesheet" href="/ui/modules/button-link/button-link.css?v=<?php echo date('YmdHis'); ?>" />
<!-- === В файле /editor/editor.php, ПЕРЕД </head> === -->

<!-- Text Beautify Module -->
<link rel="stylesheet" href="/ui/text-beautify/text-beautify.css?v=<?= time() ?>">
<link rel="stylesheet" href="/ui/text-beautify/image-generate.css?v=<?= time() ?>">

<script src="/ui/text-beautify/presets.js?v=<?= time() ?>"></script>
<script src="/ui/text-beautify/gpt-api.js?v=<?= time() ?>"></script>
<script src="/ui/text-beautify/text-beautify.js?v=<?= time() ?>"></script>
<script src="/ui/text-beautify/image-generate.js?v=<?= time() ?>"></script>
</head><body>
<div class="topbar">
  <button class="btn" id="btnAddText">Текст</button>
  <button class="btn" id="btnAddBox">Блок</button>
  <button class="btn" id="btnAddImage">Картинка</button>
  <button class="btn" id="btnAddVideo">Видео</button>
  <span class="sep"></span>
  <button class="btn" id="btnSave">Сохранить</button>
  <button class="btn" id="btnExport">Экспорт</button>
  <span class="sep"></span>
  <button class="btn ghost" data-device="desktop">Desktop</button>
  <button class="btn ghost" data-device="tablet">Tablet</button>
  <button class="btn ghost" data-device="mobile">Mobile</button>
  <label class="label" style="margin-left:8px"><input type="checkbox" id="snapChk"> Привязка к сетке</label>
  <span style="flex:1"></span>
  <a class="btn" href="/index.php" target="_blank">Открыть сайт</a>
</div>


<!-- Горизонтальный контейнер для SEO и свойств -->
<div class="horizontal-controls">
  <div id="seoBar" class="seo-bar"></div>
  <div id="props" class="props-horizontal"></div>
</div>

<!-- Горизонтальная навигация будет вставлена сюда через JS -->

<div class="wrap" style="grid-template-columns: 1fr !important;">
  <div class="panel" style="max-width: 100% !important;">
    <div class="device-toolbar"></div>
    <div class="device-frame">
      <div id="stage" class="stage"></div>
    </div>
  </div>
</div>

<!-- Встроенные стили для горизонтальной навигации -->
<style>
/* Горизонтальный контейнер для SEO и свойств */
.horizontal-controls {
  display: flex;
  gap: 12px;
  margin: 8px 12px;
  align-items: flex-start;
}

/* SEO блок слева */
#seoBar.seo-bar {
  flex: 0 0 auto;
  width: 400px;
  background: #0f1622;
  border: 1px solid #1f2b3b;
  border-radius: 12px;
  padding: 12px;
}

/* Панель свойств справа */
.props-horizontal {
  flex: 1;
  background: #0f1622;
  border: 1px solid #1f2b3b;
  border-radius: 12px;
  padding: 12px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  max-height: 120px;
  overflow-y: auto;
  overflow-x: hidden;
}

/* Стили для элементов в горизонтальной панели */
.props-horizontal .group,
.props-horizontal .form-group {
  flex: 0 0 auto;
  margin: 0 !important;
  padding: 8px !important;
  background: #111925;
  border: 1px solid #213247;
  border-radius: 8px;
}

.props-horizontal input[type="text"],
.props-horizontal input[type="number"],
.props-horizontal input[type="color"],
.props-horizontal select,
.props-horizontal textarea {
  width: 120px !important;
  padding: 6px 10px !important;
  background: #0f1723 !important;
  color: #ffffff !important;
  border: 1px solid #2d4263 !important;
  border-radius: 8px !important;
  font-size: 13px !important;
}

.props-horizontal label {
  display: block;
  color: #9fb2c6;
  font-size: 12px;
  margin-bottom: 4px;
  font-weight: 600;
}

.props-horizontal input[type="color"] {
  width: 50px !important;
  height: 32px !important;
  cursor: pointer;
}

.props-horizontal textarea {
  width: 200px !important;
  min-height: 32px !important;
  resize: none;
}

/* Скроллбар для панели свойств */
.props-horizontal::-webkit-scrollbar {
  height: 6px;
  width: 6px;
}

.props-horizontal::-webkit-scrollbar-track {
  background: #0f1622;
  border-radius: 3px;
}

.props-horizontal::-webkit-scrollbar-thumb {
  background: #2a3441;
  border-radius: 3px;
}

.props-horizontal::-webkit-scrollbar-thumb:hover {
  background: #3a4451;
}

/* Убираем отступ у основной панели */
.wrap {
  margin-top: 8px;
}

.panel {
  padding: 0 12px !important;
}
/* Горизонтальная навигация в топбаре */
.nav-topbar {
  background: #0f1622;
  border: 1px solid #1f2b3b;
  border-radius: 12px;
  padding: 12px;
  margin: 8px 12px 6px 12px;
  display: flex;
  align-items: center;
  gap: 12px;
}

.nav-topbar-label {
  color: #9fb2c6;
  font-size: 14px;
  font-weight: 600;
  white-space: nowrap;
}

.nav-topbar-pages {
  display: flex;
  gap: 8px;
  flex: 1;
  overflow-x: auto;
  padding: 4px 0;
}

.nav-topbar-pages::-webkit-scrollbar {
  height: 6px;
}

.nav-topbar-pages::-webkit-scrollbar-track {
  background: #0f1622;
  border-radius: 3px;
}

.nav-topbar-pages::-webkit-scrollbar-thumb {
  background: #2a3441;
  border-radius: 3px;
}

.nav-topbar-item {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  background: #111925;
  border: 1px solid #213247;
  border-radius: 8px;
  white-space: nowrap;
  transition: all 0.2s;
}

.nav-topbar-item.active {
  background: #1a2533;
  border-color: #2ea8ff;
}

.nav-topbar-item .name {
  color: #e4eef9;
  font-size: 13px;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
}

.nav-topbar-item.active .name {
  color: #17c964;
  font-weight: 600;
}

.nav-topbar-item .nav-btn {
  padding: 2px 6px;
  font-size: 11px;
  background: #1a2533;
  border: 1px solid #2a3441;
  color: #9fb2c6;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.nav-topbar-item .nav-btn:hover {
  background: #2a3441;
  color: #e4eef9;
}

.nav-topbar-item .nav-btn.copy {
  padding: 4px;
  width: 24px;
  height: 24px;
  text-align: center;
  font-size: 14px;
}

.nav-topbar-item .nav-btn.ghost {
  background: transparent;
  border-color: #2a3441;
}

.nav-topbar-item .nav-btn.danger {
  background: #3a1f1f;
  border-color: #542b2b;
}

.nav-topbar-item input {
  width: 100px;
  padding: 2px 6px;
  background: #111925;
  border: 1px solid #213247;
  color: #e4eef9;
  border-radius: 6px;
  font-size: 12px;
}

.nav-topbar-actions {
  display: flex;
  gap: 8px;
}

.nav-topbar-actions .btn {
  white-space: nowrap;
  font-size: 13px;
  padding: 6px 12px;
}
/* Расширяем редактор но сохраняем функциональность */
.wrap {
  gap: 0 !important;
}

.panel:first-child {
  padding: 0 !important;
}

/* Базовые стили для всех режимов */
.device-frame {
  margin: 0 auto !important;
  transition: all 0.3s ease;
}

/* Desktop режим - полная ширина БЕЗ отступов */
.device-frame.desktop {
  width: 100% !important;
  max-width: 100% !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
}

/* Tablet режим - 768px с рамкой */
.device-frame.tablet {
  width: 768px !important;
  max-width: 768px !important;
  padding: 10px !important;
  border: 1px solid #2a3441 !important;
  background: #111925 !important;
}

/* Mobile режим - 375px с рамкой */
.device-frame.mobile {
  width: 375px !important;
  max-width: 375px !important;
  padding: 10px !important;
  border: 1px solid #2a3441 !important;
  background: #111925 !important;
}

/* Stage базовые стили */
.stage {
  margin: 0 !important;
  border-radius: 8px !important;
  min-height: calc(100vh - 200px) !important;
  position: relative !important;
  overflow: visible !important;
  width: 100% !important;
}

/* Stage для desktop без скруглений */
.device-frame.desktop .stage {
  border-radius: 0 !important;
}

/* Stage для tablet и mobile со скруглениями */
.device-frame.tablet .stage,
.device-frame.mobile .stage {
  border-radius: 8px !important;
}

/* Состояние по умолчанию = desktop */
.device-frame:not(.tablet):not(.mobile) {
  width: 100% !important;
  max-width: 100% !important;
  padding: 0 !important;
  border: none !important;
  background: transparent !important;
}

.device-frame:not(.tablet):not(.mobile) .stage {
  border-radius: 0 !important;
}
</style>

<link rel="stylesheet" href="/ui/rte-mini/rte-mini.css?v=<?php echo date('YmdHis'); ?>" />
<script defer src="/ui/rte-mini/rte-mini.js?v=<?php echo date('YmdHis'); ?>"></script>
<script>
// Прокидываем базовую высоту холста из конфига
window.EDITOR_BASE_H = <?php echo (int)(defined('CANVAS_H') ? CANVAS_H : 1500); ?>;
</script>

<script src="assets/editor.js?v=<?php echo date('YmdHis'); ?>"></script>
<script defer src="/ui/canvas-height/canvas-height.js?v=<?php echo date('YmdHis'); ?>"></script>

<!-- +++ Ручка вертикального ресайза сцены -->
<script src="/editor/assets/resize-stage.js?v=<?php echo date('YmdHis'); ?>"></script>
<script src="assets/nav_override.js?v=<?php echo date('YmdHis'); ?>"></script>

<script src="assets/seo_override.js?v=fix-20250903-9"></script>

<script src="seo-topbar.js?v=<?php echo date('YmdHis'); ?>"></script>

<!-- Встроенный скрипт для горизонтальной навигации -->
<script>
(function(){
  'use strict';
  
  const base = location.origin;
  
  function sanitizeSlug(s){ 
    return (s||'').toLowerCase().replace(/[^a-z0-9\-]/g,'').replace(/^-+|-+$/g,''); 
  }
  
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
        <button id="btnNewPageTop" class="btn">+ Новая</button>
        <button id="btnPurgeHomeTop" class="btn danger">Очистить главную</button>
      </div>
    `;
    
    // Вставляем после контейнера horizontal-controls
const horizontalControls = document.querySelector('.horizontal-controls');
if (horizontalControls && horizontalControls.nextSibling) {
  horizontalControls.parentNode.insertBefore(navBar, horizontalControls.nextSibling);
} else if (horizontalControls) {
  horizontalControls.parentNode.appendChild(navBar);
} else {
  // Фоллбэк - вставляем после topbar
  const topbar = document.querySelector('.topbar');
  if (topbar && topbar.nextSibling) {
    topbar.parentNode.insertBefore(navBar, topbar.nextSibling);
  }
}
    
    // Привязываем обработчики
    setupActions();
  }
  
  function setupActions() {
    const btnNew = document.getElementById('btnNewPageTop');
    const btnPurge = document.getElementById('btnPurgeHomeTop');
    
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
            if (typeof window.renderProps === 'function') window.renderProps(null);
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
    // Сначала создаем навигацию если её нет
    if (!document.getElementById('navTopbar')) {
      createTopbarNav();
    }
    
    const r = await fetch('/editor/slugs.php?action=list', {cache:'no-store'});
    const j = await r.json();
    if (!j.ok) return;
    
    const container = document.getElementById('topbarPages');
    if (!container) return;
    
    container.innerHTML = '';
    
    (j.pages || []).forEach(p => {
      const item = document.createElement('div');
      item.className = 'nav-topbar-item';
      item.dataset.id = p.id;
      item.dataset.home = p.is_home ? '1' : '0';
      if (p.id === window.currentPageId) item.classList.add('active');
      
      // 1. Название страницы
      const name = document.createElement('div');
      name.className = 'name';
      name.textContent = p.name;
      name.title = p.name;
      
      // 2. Кнопка копирования URL
      const urlPath = (p.slug ? '/' + p.slug : (p.is_home ? '/' : ('/?id='+p.id)));
      const fullUrl = base + urlPath;
      // Для экспортированных сайтов используем .html расширение
      const exportPath = p.is_home ? '/index.html' : (p.slug ? '/' + p.slug + '.html' : '/page_' + p.id + '.html');
      
      const btnCopy = document.createElement('button');
      btnCopy.className = 'nav-btn copy';
      btnCopy.textContent = '📋';
      btnCopy.title = 'Копировать путь: ' + exportPath;
      btnCopy.onclick = async () => {
        try {
          await navigator.clipboard.writeText(exportPath);
          btnCopy.textContent = '✔';
          btnCopy.style.color = '#17c964';
          setTimeout(() => {
            btnCopy.textContent = '📋';
            btnCopy.style.color = '';
          }, 1500);
        } catch(err) {
          const textArea = document.createElement('textarea');
          textArea.value = exportPath;
          textArea.style.position = 'fixed';
          textArea.style.left = '-999999px';
          document.body.appendChild(textArea);
          textArea.select();
          document.execCommand('copy');
          document.body.removeChild(textArea);
          btnCopy.textContent = '✔';
          btnCopy.style.color = '#17c964';
          setTimeout(() => {
            btnCopy.textContent = '📋';
            btnCopy.style.color = '';
          }, 1500);
        }
      };
      
      // 3. Поле URL (только для не-главной)
      let inputUrl = null;
      if (!p.is_home) {
        inputUrl = document.createElement('input');
        inputUrl.placeholder = 'url';
        inputUrl.value = p.slug || '';
        inputUrl.addEventListener('change', async () => {
          const v = sanitizeSlug(inputUrl.value);
          inputUrl.value = v;
          const fd = new FormData();
          fd.append('action', 'update');
          fd.append('id', p.id);
          fd.append('slug', v);
          const rr = await fetch('/editor/slugs.php', {method:'POST', body:fd});
          const jj = await rr.json();
          if (!jj.ok) {
            alert(jj.error || 'Не удалось сохранить URL');
            return;
          }
          const newPath = (v ? '/'+v : '/?id='+p.id);
          const newFullUrl = base + newPath;
          btnView.dataset.url = newPath;
          btnView.title = 'Открыть: ' + newFullUrl;
          btnCopy.title = 'Копировать URL: ' + newFullUrl;
        });
      }
      
      // 4. Кнопка "Посмотреть"
      const btnView = document.createElement('button');
      btnView.className = 'nav-btn ghost';
      btnView.textContent = 'Посмотреть';
      btnView.dataset.url = urlPath;
      btnView.title = 'Открыть: ' + fullUrl;
      btnView.onclick = () => window.open(fullUrl, '_blank', 'noopener');
      
      // 5. Кнопка "Открыть"
      const btnOpen = document.createElement('button');
      btnOpen.className = 'nav-btn';
      btnOpen.textContent = 'Открыть';
      btnOpen.onclick = () => window.loadPage(p.id);
      
      // Добавляем элементы
      item.appendChild(name);
      item.appendChild(btnCopy);
      if (inputUrl) item.appendChild(inputUrl);
      item.appendChild(btnView);
      item.appendChild(btnOpen);
      
      // 6. Кнопка удаления (только для не-главной)
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
    setTimeout(() => {
      if (typeof window.refreshPages === 'function') {
        window.refreshPages();
      }
    }, 500);
  }
  
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 100);
  }
})();
</script>

<style id="seo-topbar-override">
#seoBar.seo-bar {
  display: block;
  margin: 0 !important;
  padding: 12px !important;
  background: #0f1622 !important;
  border: 1px solid #1f2b3b !important;
  box-shadow: none !important;
  border-radius: 12px !important;
}

#seoBar .label {
  margin: 0 0 4px;
  color: #9fb2c6;
  font-size: 13px;
  font-weight: 600;
}

#seoBar .row {
  display: flex !important;
  flex-direction: column !important;
  gap: 8px !important;
}

#seoBar .row > * {
  margin: 0 !important;
  padding: 0 !important;
  width: 100%;
}

#seoBar .form-group,
#seoBar .group,
#seoBar .field {
  margin: 0 !important;
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
}

#seoBar input,
#seoBar textarea {
  width: 100%;
  background: #0f1723;
  color: #ffffff;
  border: 1px solid #2d4263;
  border-radius: 8px;
  padding: 8px 12px;
  font-size: 13px;
  box-sizing: border-box;
}

#seoBar input {
  height: 36px;
}

#seoBar textarea {
  height: 36px;
  min-height: 36px;
  max-height: 36px;
  resize: none;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  line-height: 20px;
}

#seoBar input::placeholder,
#seoBar textarea::placeholder {
  color: #9fb2c6;
  opacity: .85;
}

#seoBar input:focus,
#seoBar textarea:focus {
  outline: none;
  border-color: #3a78f2;
  box-shadow: 0 0 0 2px rgba(58,120,242,.2);
}

#seoBar .seo-count {
  font-weight: 600;
  padding-left: 4px;
  font-size: 12px;
}

#seoBar .seo-count.ok {
  color: #8ec07c;
}

#seoBar .seo-count.over {
  color: #ff6464;
}

#seoBar *:where(.hint,.recommendation) {
  display: none !important;
}
</style>
<script src="assets/resize-nav.js?v=20250903-230849"></script>
<script defer src="/ui/modules/button-link/button-link.js?v=<?php echo date('YmdHis'); ?>"></script>

<!-- Модуль замены ссылок -->
<link rel="stylesheet" href="/ui/link-replacer/link-replacer.css?v=<?php echo date('YmdHis'); ?>">
<script src="/ui/link-replacer/link-replacer.js?v=<?php echo date('YmdHis'); ?>"></script>
<!-- Модуль кнопка-файл -->
<link rel="stylesheet" href="/ui/button-file/button-file.css?v=<?php echo date('YmdHis'); ?>">
<script src="/ui/button-file/button-file.js?v=<?php echo date('YmdHis'); ?>"></script>
<script src="/ui/button-file/file-manager.js?v=<?php echo date('YmdHis'); ?>"></script>
<link rel="stylesheet" href="/ui/langs/langs.css?v=<?php echo date('YmdHis'); ?>">
<script src="/ui/langs/langs.js?v=<?php echo date('YmdHis'); ?>"></script>
<!-- Модуль переводов -->
<link rel="stylesheet" href="/ui/translations/translations.css?v=<?php echo date('YmdHis'); ?>">
<script src="/ui/translations/translations.js?v=<?php echo date('YmdHis'); ?>"></script>
<!-- Модуль Telegram уведомлений -->
<link rel="stylesheet" href="/ui/tg-notify/tg-notify.css?v=<?php echo date('YmdHis'); ?>">
<script src="/ui/tg-notify/tg-notify.js?v=<?php echo date('YmdHis'); ?>"></script>
<!-- Модуль удаленного управления сайтами -->
<link rel="stylesheet" href="/ui/remote-sites/remote-sites.css?v=<?php echo date('YmdHis'); ?>">
<script src="/ui/remote-sites/remote-sites.js?v=<?php echo date('YmdHis'); ?>"></script>
<!-- SEO модуль -->
<link rel="stylesheet" href="/ui/seo/seo-settings.css?v=<?php echo date('YmdHis'); ?>">
<script src="/ui/seo/seo-settings.js?v=<?php echo date('YmdHis'); ?>"></script>
<!-- Статистика (кнопка + модалка) -->
<link rel="stylesheet" href="/ui/stats/stats.css?v=<?php echo date('YmdHis'); ?>">
<script src="/ui/stats/stats.js?v=<?php echo date('YmdHis'); ?>"></script>

</body></html>
<script>
// Принудительное переключение режимов устройств
document.querySelectorAll('[data-device]').forEach(btn => {
  btn.addEventListener('click', function() {
    const device = this.dataset.device;
    const frame = document.querySelector('.device-frame');
    const stage = document.getElementById('stage');
    
    // Удаляем все классы устройств
    frame.classList.remove('desktop', 'tablet', 'mobile');
    document.body.removeAttribute('data-device');
    
    // Добавляем нужный класс
    frame.classList.add(device);
    frame.setAttribute('data-device', device);
    document.body.setAttribute('data-device', device);
    
    // Обновляем активную кнопку
    document.querySelectorAll('[data-device]').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    
    // Принудительно применяем стили
    if(device === 'mobile') {
      frame.style.width = '375px';
      frame.style.maxWidth = '375px';
    } else if(device === 'tablet') {
      frame.style.width = '768px';
      frame.style.maxWidth = '768px';
    } else {
      frame.style.width = '100%';
      frame.style.maxWidth = '100%';
    }
  });
});
</script>