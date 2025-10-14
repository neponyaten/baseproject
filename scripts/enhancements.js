// scripts/animations/enhancements_fix.js
// Forces quick search bar even if #searchInput exists, and allows custom selectors.
// Usage: <script>window.__quickSearchSelector = '.project-card';</script> BEFORE this file to override.
(function(){
  const $  = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  function injectStyles(){
    if (document.getElementById('enhanceFixStyles')) return;
    const style = document.createElement('style'); style.id='enhanceFixStyles';
    style.textContent = `#quickSearchFix{flex:1 1 260px;padding:.6rem .8rem;border-radius:8px;border:1px solid rgba(0,0,0,.1);}`;
    document.head.appendChild(style);
  }

  function ensureQuickSearch(){
    // Always render quick search (even if #searchInput есть)
    if (document.getElementById('quickSearchFix')) return;
    const container = document.querySelector('.container');
    if (!container) return;

    // selector priority: explicit global -> guessed by DOM
    let selector = window.__quickSearchSelector || null;
    if (!selector) {
      if (document.getElementById('projectsGrid') || document.querySelector('.project-card')) selector = '.project-card';
      else if (document.getElementById('entriesList') || document.querySelector('.entry-card')) selector = '.entry-card';
    }
    if (!selector) return; // no content to filter

    const wrap = document.createElement('div');
    wrap.style.cssText = 'display:flex; gap:.75rem; align-items:center; margin:.5rem 0 1rem;';
    wrap.innerHTML = `<input id="quickSearchFix" type="search" placeholder="Быстрый поиск…">`;

    const sectionTitle = container.querySelector('.section-title, h1, h2');
    (sectionTitle?.parentNode || container).insertBefore(wrap, (sectionTitle?.nextSibling || container.firstChild));

    const input = wrap.querySelector('#quickSearchFix');
    const nodes = () => Array.from(document.querySelectorAll(selector));
    input.addEventListener('input', () => {
      const q = input.value.toLowerCase().trim();
      nodes().forEach(node => {
        const text = (node.textContent || '').toLowerCase();
        node.style.display = text.includes(q) ? '' : 'none';
      });
    });
  }

  function init(){ injectStyles(); ensureQuickSearch(); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init();
})();