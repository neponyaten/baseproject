// scripts/projects.js — hardened version
(function(){
  const STORAGE_KEY = 'portfolioProjects';
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }
  function load(){
    try{
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }catch(e){
      console.warn('[projects] localStorage parse failed, clearing corrupted value', e);
      try{ localStorage.removeItem(STORAGE_KEY); }catch{}
      return [];
    }
  }
  function save(list){
    try{ localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); }
    catch(e){ console.error('[projects] save failed', e); }
  }
  function escapeHtml(s=''){ return String(s).replace(/[&<>\"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c])); }

  function ensureSeed(){
    const list = load();
    if (list.length) return;
    const seed = [
      { id: uid(), title: 'Сеть магазинов "Троечка', date: '2024-11-15',
        tags: ['JavaScript','CSS','HTML'],
        desc: 'Полнофункциональный интернет-магазин',
        cover: '', demo: '', code: '' },
    ];
    save(seed);
  }

  // State
  const state = { text:'', tag:'', sort:'new' };

  function safeDateString(iso) {
    // Expect YYYY-MM-DD, fallback to today
    if (typeof iso !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
      const d = new Date(); return d.toISOString().slice(0,10);
    }
    return iso;
  }

  function render(filterText='', activeTag='', sort='new'){
    const grid = $('#projectsGrid');
    if (!grid) { console.warn('[projects] #projectsGrid not found'); return; }

    try {
      let arr = load().slice();

      // text filter
      const f = String(filterText||'').trim().toLowerCase();
      if (f) {
        arr = arr.filter(p => (
          String(p.title||'').toLowerCase().includes(f) ||
          String(p.desc||'').toLowerCase().includes(f) ||
          (Array.isArray(p.tags)?p.tags:[]).join(',').toLowerCase().includes(f)
        ));
      }
      // tag filter
      if (activeTag) {
        const wanted = String(activeTag).toLowerCase();
        arr = arr.filter(p => (Array.isArray(p.tags)?p.tags:[]).map(t=>String(t).toLowerCase()).includes(wanted));
      }
      // sort
      arr.sort((a,b)=>{
        if (sort==='new') return (safeDateString(a.date) < safeDateString(b.date)?1:-1);
        if (sort==='old') return (safeDateString(a.date) > safeDateString(b.date)?1:-1);
        if (sort==='az') return String(a.title||'').localeCompare(String(b.title||''), 'ru');
        if (sort==='za') return String(b.title||'').localeCompare(String(a.title||''), 'ru');
        return 0;
      });

      if (!arr.length) {
        grid.innerHTML = `<p style="opacity:.7">Проекты не найдены. Нажми «+ Добавить».</p>`;
        return;
      }

      grid.innerHTML = arr.map(p => {
        const d = new Date(safeDateString(p.date) + 'T00:00:00');
        const dStr = isNaN(d) ? escapeHtml(String(p.date||'')) : d.toLocaleDateString('ru-RU', { day:'2-digit', month:'long', year:'numeric' });
        const tags = (Array.isArray(p.tags)?p.tags:[]).map(t=>`<span class="chip" data-chip="${escapeHtml(String(t))}">${escapeHtml(String(t))}</span>`).join(' ');
        const cover = p.cover ? `<img class="project-cover" src="${escapeHtml(p.cover)}" alt="">` : '';
        const demoAttrs = p.demo ? `href="${escapeHtml(p.demo)}" target="_blank" rel="noopener"` : `href="#" aria-disabled="true"`;
        const codeAttrs = p.code ? `href="${escapeHtml(p.code)}" target="_blank" rel="noopener"` : `href="#" aria-disabled="true"`;

        return `
          <article class="project-card tilt fade-in-up" data-id="${escapeHtml(p.id)}">
            <div class="tilt-inner">
              ${cover}
              <h3 class="project-title" style="margin-top:.6rem;">${escapeHtml(p.title)}</h3>
              <p class="project-description">${escapeHtml(p.desc)}</p>
              <p style="opacity:.7; font-size:.9rem;"><strong>Дата:</strong> ${dStr}</p>
              <div style="margin:.5rem 0; display:flex; gap:.5rem; flex-wrap:wrap;">${tags}</div>
              <div class="project-actions">
                <a class="btn" ${demoAttrs}>Демо</a>
                <a class="btn btn-outline" ${codeAttrs}>Код</a>
                <button class="btn btn-outline js-edit">Редактировать</button>
                <button class="btn btn-outline js-delete">Удалить</button>
                <button class="btn btn-outline js-fav" title="В избранное">★</button>
              </div>
            </div>
          </article>
        `;
      }).join('');

      // tag chips inside cards -> filter
      $$('#projectsGrid .chip').forEach(ch => {
        ch.addEventListener('click', () => {
          const t = ch.textContent.trim();
          state.tag = t;
          $('#searchInput') && ($('#searchInput').value = '');
          update();
          scrollToTop();
        });
      });

      // actions
      $$('#projectsGrid .project-card').forEach(card => {
        const id = card.getAttribute('data-id');
        card.querySelector('.js-edit')?.addEventListener('click', ()=> openModal('edit', getById(id)));
        card.querySelector('.js-delete')?.addEventListener('click', ()=>{
          if (confirm('Удалить проект?')) {
            const list = load().filter(x=>x.id!==id);
            save(list); update();
          }
        });
        card.querySelector('.js-fav')?.addEventListener('click', ()=>{
          const list = load();
          const idx = list.findIndex(x=>x.id===id);
          if (idx>-1){
            const [item] = list.splice(idx,1);
            list.unshift(item);
            save(list); update(true);
          }
        });
      });

      attachTilt();
      revealOnScroll();
    } catch (err) {
      console.error('[projects] render failed:', err);
      try { window.portfolio?.showMessage?.('error','Ошибка рендера проектов. Открой консоль.'); } catch {}
    }
  }

  function getById(id){ return load().find(x=>x.id===id); }

  function renderChips(active=''){
    const host = $('#chips');
    if (!host) return;
    const all = new Set();
    load().forEach(p => (Array.isArray(p.tags)?p.tags:[]).forEach(t => all.add(String(t))));
    if (!all.size){ host.innerHTML = ''; return; }
    host.innerHTML = Array.from(all).sort((a,b)=>a.localeCompare(b,'ru')).map(t=>`
      <span class="chip ${active && active.toLowerCase()===String(t).toLowerCase()?'active':''}" data-tag="${escapeHtml(String(t))}">${escapeHtml(String(t))}</span>
    `).join('');
    $$('#chips .chip').forEach(c => c.addEventListener('click', ()=>{
      const tag = c.getAttribute('data-tag');
      state.tag = (state.tag && state.tag.toLowerCase()===String(tag).toLowerCase()) ? '' : String(tag);
      update();
    }));
  }

  // Modal
  let mode = 'add', editingId = null;
  function openModal(m='add', data=null){
    mode = m; editingId = data?.id || null;
    $('#modalTitle') && ($('#modalTitle').textContent = mode==='add' ? 'Новый проект' : 'Редактирование проекта');
    $('#pTitle') && ($('#pTitle').value = data?.title || '');
    $('#pDate') && ($('#pDate').value = data?.date || new Date().toISOString().slice(0,10));
    $('#pTags') && ($('#pTags').value = (Array.isArray(data?.tags)?data.tags:[]).join(', '));
    $('#pDesc') && ($('#pDesc').value = data?.desc || '');
    $('#pCover') && ($('#pCover').value = data?.cover || '');
    $('#pDemo') && ($('#pDemo').value = data?.demo || '');
    $('#pCode') && ($('#pCode').value = data?.code || '');
    const modal = $('#projectModal');
    if (modal) { modal.style.display = 'flex'; modal.setAttribute('aria-hidden','false'); }
  }
  function closeModal(){
    const modal = $('#projectModal');
    if (modal) { modal.style.display = 'none'; modal.setAttribute('aria-hidden','true'); }
  }

  function handleSave(e){
    e.preventDefault();
    const title = ($('#pTitle')?.value || '').trim();
    const date = $('#pDate')?.value || new Date().toISOString().slice(0,10);
    const tags = ($('#pTags')?.value || '').split(',').map(s=>s.trim()).filter(Boolean);
    const desc = ($('#pDesc')?.value || '').trim();
    const cover = ($('#pCover')?.value || '').trim();
    const demo = ($('#pDemo')?.value || '').trim();
    const code = ($('#pCode')?.value || '').trim();
    if (!title || !date || !desc){
      alert('Заполни обязательные поля: Название, Дата, Описание.');
      return;
    }
    const list = load();
    if (mode==='add'){
      list.unshift({ id: uid(), title, date: safeDateString(date), tags, desc, cover, demo, code });
      save(list);
      celebrate();
    } else if (mode==='edit' && editingId){
      const idx = list.findIndex(x=>x.id===editingId);
      if (idx>-1){ list[idx] = { ...list[idx], title, date: safeDateString(date), tags, desc, cover, demo, code }; save(list); }
    }
    closeModal();
    update();
  }

  // Effects
  function attachTilt(){
    if (prefersReduced) return;
    $$('#projectsGrid .project-card.tilt').forEach(card => {
      if (card.dataset.tiltReady) return;
      card.dataset.tiltReady = '1';
      const inner = card.querySelector('.tilt-inner') || card;
      card.addEventListener('mousemove', (e)=>{
        const r = card.getBoundingClientRect();
        const x = (e.clientX - r.left) / r.width;
        const y = (e.clientY - r.top) / r.height;
        const rx = (y - 0.5) * 6;
        const ry = (0.5 - x) * 6;
        inner.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`;
      });
      card.addEventListener('mouseleave', ()=>{
        inner.style.transform = 'rotateX(0deg) rotateY(0deg)';
      });
    });
  }
  function revealOnScroll(){
    const targets = $$('.fade-in-up:not(.in)');
    if (!targets.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if (e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); }
      });
    }, { threshold: .2, rootMargin: '0px 0px -10% 0px' });
    targets.forEach(t=>io.observe(t));
  }
  function celebrate(){
    if (prefersReduced) return;
    const grid = $('#projectsGrid');
    if (!grid) return;
    const rect = grid.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = Math.max(300, rect.width);
    canvas.height = 140;
    canvas.style.cssText = `position:fixed; left:${Math.max(0, rect.left)}px; top:${Math.max(10, rect.top-20)}px; pointer-events:none; z-index:99999;`;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const N = 140;
    const parts = Array.from({length:N}, ()=> ({
      x: Math.random()*canvas.width, y: -20 - Math.random()*60,
      vx: -1 + Math.random()*2, vy: 2 + Math.random()*3,
      s: 2 + Math.random()*3, r: Math.random()*Math.PI
    }));
    let t0;
    function step(ts){
      if (!t0) t0 = ts;
      const t = ts - t0;
      ctx.clearRect(0,0,canvas.width,canvas.height);
      parts.forEach(p=>{
        p.x += p.vx; p.y += p.vy; p.r += 0.05;
        ctx.save(); ctx.translate(p.x,p.y); ctx.rotate(p.r);
        ctx.fillStyle = `hsl(${(p.x/canvas.width)*360}, 90%, 55%)`;
        ctx.fillRect(-p.s,-p.s,p.s*2,p.s*2);
        ctx.restore();
      });
      if (t < 1200) requestAnimationFrame(step); else canvas.remove();
    }
    requestAnimationFrame(step);
  }

  function renderChipsHost(){
    const host = $('#chips');
    if (!host) return;
    renderChips(state.tag);
  }

  function scrollToTop(){
    window.scrollTo({ top: 0, behavior: prefersReduced ? 'auto' : 'smooth' });
  }

  function update(scrollTop=false){
    render(state.text, state.tag, state.sort);
    renderChips(state.tag);
    if (scrollTop) scrollToTop();
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureSeed();

    // initial fade-in
    $$('.fade-in-up').forEach(el => requestAnimationFrame(()=> el.classList.add('in')));

    // toolbar
    $('#addProjectBtn')?.addEventListener('click', ()=> openModal('add'));
    $('#cancelBtn')?.addEventListener('click', closeModal);
    $('#closeModalBtn')?.addEventListener('click', closeModal);
    $('#projectForm')?.addEventListener('submit', handleSave);
    $('#searchInput')?.addEventListener('input', (e)=>{ state.text = e.target.value; update(); });
    $('#sortSelect')?.addEventListener('change', (e)=>{ state.sort = e.target.value; update(); });

    update();
  });
})();