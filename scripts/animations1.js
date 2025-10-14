// scripts/animations/animations.js
(function(){
  // ---- Helpers ----
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Fade-in on load for hero
  function revealOnLoad() {
    document.querySelectorAll('.fade-in-up').forEach((el, i) => {
      requestAnimationFrame(() => el.classList.add('in'));
    });
  }

  // Typewriter / rotating roles
  function typingRoles() {
    const el = document.getElementById('typedRole');
    if (!el) return;
    const roles = ['MIREA Student', 'Frontend Dev', 'React'];
    let roleIdx = 0, charIdx = 0, deleting = false;
    let hold = 900;

    function tick() {
      const full = roles[roleIdx];
      if (deleting) {
        charIdx--;
      } else {
        charIdx++;
      }
      el.textContent = full.slice(0, charIdx);

      let delay = deleting ? 40 : 70;

      if (!deleting && charIdx === full.length) {
        deleting = true; delay = hold;
      } else if (deleting && charIdx === 0) {
        deleting = false; roleIdx = (roleIdx + 1) % roles.length; delay = 350;
      }
      if (prefersReduced) { el.textContent = full; return; }
      setTimeout(tick, delay);
    }
    setTimeout(tick, 600);
  }

  // Animated skill bars when visible
  function animateSkillsOnView() {
    const bars = document.querySelectorAll('.skill-progress[data-level]');
    if (!bars.length) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const lvl = parseInt(e.target.getAttribute('data-level'), 10) || 0;
          requestAnimationFrame(() => e.target.style.width = (prefersReduced ? lvl : 0) + '%');
          setTimeout(() => { e.target.style.width = lvl + '%'; e.target.classList.add('pulse-once'); }, 50);
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.25 });
    bars.forEach(b => io.observe(b));
  }

  // Scroll-reveal for sections/cards
  function revealOnScroll() {
    const targets = document.querySelectorAll('.fade-in-up:not(.in)');
    if (!targets.length) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2, rootMargin: '0px 0px -10% 0px' });
    targets.forEach(t => obs.observe(t));
  }

  // Minimalist particles in hero (canvas)
  function heroParticles() {
    if (prefersReduced) return;
    const canvas = document.getElementById('heroParticles');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, dpr;

    function resize() {
      dpr = window.devicePixelRatio || 1;
      w = canvas.clientWidth;
      h = canvas.clientHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();
    window.addEventListener('resize', resize);

    // particles
    const N = 24;
    const parts = Array.from({length: N}, () => ({
      x: Math.random()*w, y: Math.random()*h, r: 1.5 + Math.random()*2.5,
      vx: (-0.3 + Math.random()*0.6), vy: (-0.3 + Math.random()*0.6), a: 0.2 + Math.random()*0.6
    }));

    function step() {
      ctx.clearRect(0,0,w,h);
      parts.forEach(p => {
        p.x += p.vx; p.y += p.vy;
        if (p.x < -10) p.x = w+10; if (p.x > w+10) p.x = -10;
        if (p.y < -10) p.y = h+10; if (p.y > h+10) p.y = -10;
        ctx.globalAlpha = p.a;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI*2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;
      requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  // Add ripple to buttons (reuses from contacts if present in core)
  function rippleButtons() {
    document.querySelectorAll('.btn').forEach((btn)=>{
      if (btn.dataset.rippleReady) return;
      btn.dataset.rippleReady = '1';
      const st = getComputedStyle(btn);
      if (st.position === 'static') btn.style.position = 'relative';
      btn.style.overflow = 'hidden';
      btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 1.25;
        const x = e.clientX - rect.left - size / 2;
        const y = e.clientY - rect.top - size / 2;
        const r = document.createElement('span');
        r.style.cssText = `position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px;border-radius:50%;background:currentColor;opacity:.16;transform:scale(0);pointer-events:none;transition:transform 420ms ease, opacity 600ms ease;mix-blend-mode:multiply;`;
        this.appendChild(r);
        requestAnimationFrame(()=>{ r.style.transform='scale(1.9)'; r.style.opacity='0'; });
        setTimeout(()=>r.remove(),650);
      });
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    revealOnLoad();
    typingRoles();
    animateSkillsOnView();
    revealOnScroll();
    heroParticles();
    rippleButtons();
  });
})();