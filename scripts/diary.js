// scripts/animations/diary.js
(function(){
  const STORAGE_KEY = 'diaryEntries';

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ----- Utils -----
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  function loadEntries(){
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      return JSON.parse(raw) || [];
    } catch { return []; }
  }
  function saveEntries(list){
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }
  function uid(){ return Math.random().toString(36).slice(2) + Date.now().toString(36); }

  // Seed примером, если пусто
  function ensureSeed(){
    const list = loadEntries();
    if (list.length) return;
    const seed = [
      {
        id: uid(),
        title: 'Создание сайта "Троечка"',
        date: '02.10.2025',
        tags: ['css','html'],
        text: 'Создание различных вёрсток.'
      },
      {
        id: uid(),
        title: 'Сайт портфолио',
        date: '14.10.2025',
        tags: ['jss','html','css'],
        text: 'Создание плеера, различных эффектов...'
      }
    ];
    saveEntries(seed);
  }

  // ----- Render -----
  function renderEntries(filter=''){
    const wrap = $('#entriesList');
    if (!wrap) return;
    const list = loadEntries().sort((a,b)=> (a.date<b.date?1:-1)); // новые выше
    const f = filter.trim().toLowerCase();
    const filtered = f ? list.filter(e => (
      e.title.toLowerCase().includes(f) ||
      e.text.toLowerCase().includes(f) ||
      (e.tags||[]).join(',').toLowerCase().includes(f)
    )) : list;

    if (!filtered.length){
      wrap.innerHTML = `<p style="opacity:.7">Нет записей. Нажми «+ Добавить запись», чтобы создать первую.</p>`;
      return;
    }

    wrap.innerHTML = filtered.map(e => {
      const date = new Date(e.date + 'T00:00:00');
      const d = date.toLocaleDateString('ru-RU', { day:'2-digit', month:'long', year:'numeric' });
      const tags = (e.tags||[]).map(t=>`<span class="tag">${t}</span>`).join(' ');
      return `
        <article class="project-card entry-card fade-in-up" data-id="${e.id}">
          <h3>${escapeHtml(e.title)}</h3>
          <p><strong>Дата:</strong> ${d}</p>
          ${tags ? `<p>${tags}</p>` : ''}
          <div class="entry-content collapsed">${escapeHtml(e.text)}</div>
          <div class="entry-actions">
            <button class="btn btn-outline js-toggle">Развернуть</button>
            <button class="btn btn-outline js-edit">Редактировать</button>
            <button class="btn btn-outline js-delete">Удалить</button>
          </div>
        </article>
      `;
    }).join('');

    // attach handlers
    $$('.entry-card', wrap).forEach(card => {
      const id = card.getAttribute('data-id');
      card.querySelector('.js-toggle')?.addEventListener('click', () => {
        const content = card.querySelector('.entry-content');
        const expanded = !content.classList.contains('collapsed');
        content.classList.toggle('collapsed');
        card.querySelector('.js-toggle').textContent = expanded ? 'Развернуть' : 'Свернуть';
      });
      card.querySelector('.js-edit')?.addEventListener('click', () => openModal('edit', getById(id)));
      card.querySelector('.js-delete')?.addEventListener('click', () => {
        if (confirm('Удалить запись?')) {
          const list = loadEntries().filter(x => x.id !== id);
          saveEntries(list);
          renderEntries($('#searchInput')?.value || '');
        }
      });
    });

    revealOnScroll();
  }

  function getById(id){ return loadEntries().find(x=>x.id===id); }

  function escapeHtml(s=''){
    return s.replace(/[&<>"']/g, c => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'
    }[c]));
  }

  // ----- Modal -----
  let mode = 'add'; // 'add' | 'edit'
  let editingId = null;

  function openModal(m='add', data=null){
    mode = m;
    editingId = data?.id || null;
    $('#modalTitle').textContent = mode === 'add' ? 'Новая запись' : 'Редактирование записи';
    $('#entryTitle').value = data?.title || '';
    $('#entryDate').value = data?.date || new Date().toISOString().slice(0,10);
    $('#entryTags').value = (data?.tags||[]).join(', ');
    $('#entryText').value = data?.text || '';

    const modal = $('#entryModal');
    modal.style.display = 'flex';
    modal.setAttribute('aria-hidden','false');
  }
  function closeModal(){
    const modal = $('#entryModal');
    modal.style.display = 'none';
    modal.setAttribute('aria-hidden','true');
  }

  // ----- Save -----
  function handleSave(e){
    e.preventDefault();
    const title = $('#entryTitle').value.trim();
    const date = $('#entryDate').value;
    const tags = $('#entryTags').value.split(',').map(s=>s.trim()).filter(Boolean);
    const text = $('#entryText').value.trim();
    if (!title || !date || !text) {
      alert('Заполни обязательные поля: Заголовок, Дата, Текст.');
      return;
    }

    const list = loadEntries();
    if (mode === 'add'){
      list.push({ id: uid(), title, date, tags, text });
      saveEntries(list);
      confettiOnce();
    } else if (mode === 'edit' && editingId){
      const idx = list.findIndex(x=>x.id===editingId);
      if (idx > -1) {
        list[idx] = { ...list[idx], title, date, tags, text };
        saveEntries(list);
      }
    }
    closeModal();
    renderEntries($('#searchInput')?.value || '');
  }

  // ----- Animations -----
  function revealOnLoad(){
    $$('.fade-in-up').forEach(el => requestAnimationFrame(()=> el.classList.add('in')));
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
  function animateSkillBars(){
    const bars = $$('.skill-progress[data-level]');
    if (!bars.length) return;
    const io = new IntersectionObserver((entries)=>{
      entries.forEach(e=>{
        if (e.isIntersecting){
          const lvl = parseInt(e.target.getAttribute('data-level'), 10) || 0;
          if (prefersReduced){ e.target.style.width = lvl + '%'; }
          else { setTimeout(()=> e.target.style.width = lvl + '%', 40); }
          io.unobserve(e.target);
        }
      });
    }, { threshold: .25 });
    bars.forEach(b=>io.observe(b));
  }

  let confettiShown = false;
  function confettiOnce(){
    if (confettiShown || prefersReduced) return;
    confettiShown = true;
    const btn = document.getElementById('saveBtn');
    const rect = btn.getBoundingClientRect();
    const canvas = document.createElement('canvas');
    canvas.width = rect.width; canvas.height = 100;
    canvas.style.cssText = `position:fixed; left:${rect.left}px; top:${rect.top-110}px; pointer-events:none; z-index:99999;`;
    document.body.appendChild(canvas);
    const ctx = canvas.getContext('2d');
    const N = 120;
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

  function initSearch(){
    const input = $('#searchInput');
    if (!input) return;
    input.addEventListener('input', ()=> renderEntries(input.value));
  }
  function initExport(){
    $('#exportBtn')?.addEventListener('click', ()=>{
      const data = JSON.stringify(loadEntries(), null, 2);
      const blob = new Blob([data], {type:'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = 'diary-entries.json';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    ensureSeed();
    revealOnLoad();
    animateSkillBars();
    initSearch();
    initExport();

    $('#addEntryBtn')?.addEventListener('click', ()=> openModal('add'));
    $('#cancelBtn')?.addEventListener('click', closeModal);
    $('#closeModalBtn')?.addEventListener('click', closeModal);
    $('#entryForm')?.addEventListener('submit', handleSave);

    // закрытие по клику вне модалки/по Esc
    $('#entryModal')?.addEventListener('click', (e)=>{ if (e.target.id === 'entryModal') closeModal(); });
    document.addEventListener('keydown', (e)=>{ if (e.key === 'Escape') closeModal(); });

    revealOnScroll();
  });
})();