// scripts/core.js — compat build (eager init + extra guards)
(function () {
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (s, r=document) => r.querySelector ? r.querySelector(s) : null;
  const $$ = (s, r=document) => r.querySelectorAll ? Array.from(r.querySelectorAll(s)) : [];

  function safeGet(key, fallback=null) { try { const v = localStorage.getItem(key); return v===null?fallback:v; } catch { return fallback; } }
  function safeSet(key, val) { try { localStorage.setItem(key, val); } catch {} }
  function smoothScrollTo(target, offset=0) {
    if (!target || !target.getBoundingClientRect) return;
    const top = (target.getBoundingClientRect().top + (window.pageYOffset||0)) - offset;
    window.scrollTo({ top, behavior: prefersReduced ? 'auto' : 'smooth' });
  }

  // Toasts (mounted ASAP if body exists, else after DOM ready)
  class Toasts {
    constructor() {
      this.host = document.createElement('div');
      this.host.id = 'toastsHost';
      this.host.style.cssText = 'position:fixed; right:16px; bottom:16px; display:flex; flex-direction:column; gap:10px; z-index:99999;';
      const mount = () => { if (document.body && !document.getElementById('toastsHost')) document.body.appendChild(this.host); };
      if (document.body) mount(); else document.addEventListener('DOMContentLoaded', mount);
    }
    show(type='info', text='') {
      const el = document.createElement('div');
      el.className = `toast toast-${type}`;
      el.setAttribute('role','status');
      el.style.cssText = `min-width:220px; max-width:420px; padding:10px 12px; border-radius:10px; color:#fff;
        backdrop-filter:blur(6px); box-shadow:0 10px 30px rgba(0,0,0,.15); display:flex; align-items:center; gap:8px;
        opacity:0; transform:translateY(8px); transition:opacity .25s ease, transform .25s ease;`;
      const icon = type==='success'?'✅': type==='error'?'❌':'ℹ️';
      el.innerHTML = `<span style="font-size:1.2rem;">${icon}</span><span style="line-height:1.25">${text}</span>
                      <button aria-label="Закрыть" style="margin-left:auto;background:transparent;border:none;color:#fff;cursor:pointer;font-size:1rem;opacity:.85;">✕</button>`;
      el.style.background = type==='success' ? 'linear-gradient(135deg,#22c55e,#16a34a)'
                        : type==='error' ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
                        : 'linear-gradient(135deg,#3b82f6,#1d4ed8)';
      const remove = () => { el.style.opacity='0'; el.style.transform='translateY(8px)'; setTimeout(()=> el.remove(), 220); };
      el.querySelector('button').addEventListener('click', remove);
      this.host.appendChild(el);
      requestAnimationFrame(()=> { el.style.opacity='1'; el.style.transform='translateY(0)'; });
      setTimeout(remove, 3200);
    }
  }

  class Portfolio {
    constructor() {
      window.portfolio = this; // expose ASAP
      this.toasts = new Toasts();
      // Initialize immediately if DOM ready, else on DOM ready
      if (document.readyState==='loading') {
        document.addEventListener('DOMContentLoaded', () => this._init());
      } else {
        this._init();
      }
    }

    _init(){
      try { this.initTheme(); } catch(e){ console.error('[core] initTheme failed', e); }
      try { this.initVisitCounter(); } catch(e){ console.error('[core] initVisitCounter failed', e); }
      try { this.initMobileMenu(); } catch(e){ console.error('[core] initMobileMenu failed', e); }
      try { this.initSmoothScroll(); } catch(e){ console.error('[core] initSmoothScroll failed', e); }
      try { this.restoreActiveNav(); } catch(e){ console.error('[core] restoreActiveNav failed', e); }
    }

    initTheme(){
      const KEY='portfolio-theme';
      const saved = safeGet(KEY);
      const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
      const initial = saved || (prefersDark?'dark':'light');
      if (document.body) document.body.classList.toggle('dark-theme', initial==='dark');

      const btn = document.getElementById('themeToggle');
      const setPressed = (isDark)=> { try { btn && btn.setAttribute('aria-pressed', String(isDark)); } catch{} };
      setPressed(initial==='dark');
      btn && btn.addEventListener('click', () => {
        if (!document.body) return;
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        safeSet(KEY, isDark?'dark':'light');
        setPressed(isDark);
      });
      if (!saved && window.matchMedia) {
        const mq = window.matchMedia('(prefers-color-scheme: dark)');
        mq.addEventListener && mq.addEventListener('change', (e)=>{
          if (document.body) document.body.classList.toggle('dark-theme', e.matches);
        });
      }
    }

    initVisitCounter(){
      const KEY='portfolio-visits';
      let visits = parseInt(safeGet(KEY,'0'),10)||0; visits += 1; safeSet(KEY, String(visits));
      const el = document.getElementById('visitCounter');
      if (el) el.textContent = `👁 ${visits}`;
    }

    initMobileMenu(){
      const menuBtn = document.getElementById('mobileMenuBtn');
      const nav = document.querySelector('.nav');
      if (!menuBtn || !nav) return;
      const toggle = ()=>{
        const active = nav.classList.toggle('active');
        menuBtn.setAttribute('aria-expanded', String(active));
        if (document.body) document.body.classList.toggle('no-scroll', active);
      };
      menuBtn.setAttribute('aria-expanded','false');
      menuBtn.setAttribute('aria-label','Открыть меню');
      menuBtn.addEventListener('click', toggle);
      document.addEventListener('keydown', (e)=>{ if (e.key==='Escape' && nav.classList.contains('active')) toggle(); });
      document.addEventListener('click', (e)=>{
        if (!nav.classList.contains('active')) return;
        const within = nav.contains(e.target) || menuBtn.contains(e.target);
        if (!within) toggle();
      }, true);
    }

    initSmoothScroll(){
      const header = document.querySelector('.header');
      const offset = header ? header.offsetHeight + 6 : 0;
      $$('a[href^="#"]').forEach(a => {
        a.addEventListener('click', (e) => {
          const id = a.getAttribute('href');
          if (!id || id==='#') return;
          const target = document.querySelector(id);
          if (!target) return;
          e.preventDefault();
          smoothScrollTo(target, offset);
        });
      });
    }

    restoreActiveNav(){
      const path = (location.pathname.split('/').pop() || 'index.html');
      $$('.nav a').forEach(a => {
        const href = a.getAttribute('href') || '';
        const isActive = href.endsWith(path);
        a.classList.toggle('active', isActive);
      });
    }

    openModal(id){
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.style.display = 'flex';
      modal.setAttribute('aria-hidden','false');
      if (document.body) document.body.style.overflow = 'hidden';
      modal.addEventListener('click', (e)=>{ if (e.target===modal) this.closeModal(id); });
      document.addEventListener('keydown', this._esc = (e)=>{ if (e.key==='Escape') this.closeModal(id); });
      const first = modal.querySelector('input,textarea,button,select,[tabindex]:not([tabindex="-1"])');
      first && first.focus();
    }
    closeModal(id){
      const modal = document.getElementById(id);
      if (!modal) return;
      modal.style.display = 'none';
      modal.setAttribute('aria-hidden','true');
      if (document.body) document.body.style.overflow = 'auto';
      if (this._esc) { document.removeEventListener('keydown', this._esc); this._esc = null; }
    }

    showMessage(type='info', text=''){ try { this.toasts.show(type, text); } catch { alert(text); } }
    async copyText(text){ try { await navigator.clipboard.writeText(text); this.showMessage('success','Скопировано'); } catch { this.showMessage('error','Не удалось скопировать'); } }
  }

  // Initialize ASAP
  if (!window.portfolio) new Portfolio();

  // Global guard: log uncaught errors for easier debugging
  window.addEventListener('error', (e)=> { console.error('[global] Uncaught:', e.error || e.message || e); });
})();