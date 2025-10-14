// scripts/animations.js (Yandex maps version)
(function () {
  // ---------- Ripple на всех .btn ----------
  function attachRipple(root = document) {
    root.querySelectorAll('.btn').forEach((btn) => {
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
        r.style.cssText = `
          position:absolute; left:${x}px; top:${y}px; width:${size}px; height:${size}px;
          border-radius:50%; background:currentColor; opacity:.16; transform:scale(0);
          pointer-events:none; transition:transform 420ms ease, opacity 600ms ease; mix-blend-mode:multiply;
        `;
        this.appendChild(r);
        requestAnimationFrame(() => { r.style.transform = 'scale(1.9)'; r.style.opacity = '0'; });
        setTimeout(() => r.remove(), 650);
      });
    });
  }

  // ---------- Конфетти при первом открытии ----------
  function launchConfetti(container, duration = 1200, n = 120) {
    const canvas = document.createElement('canvas');
    const rect = container.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = Math.min(rect.height || 400, 500);
    canvas.style.cssText = 'position:absolute; left:0; top:0; pointer-events:none; z-index:3;';

    const parentWasStatic = getComputedStyle(container).position === 'static';
    if (parentWasStatic) container.style.position = 'relative';
    container.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    const pieces = Array.from({ length: n }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 60,
      s: 2 + Math.random() * 4,
      vy: 2 + Math.random() * 3,
      vx: -1 + Math.random() * 2,
      rot: Math.random() * Math.PI,
      vr: -0.25 + Math.random() * 0.5,
    }));

    let start = 0;
    function tick(ts) {
      if (!start) start = ts;
      const t = ts - start;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.x += p.vx; p.y += p.vy; p.rot += p.vr;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rot);
        ctx.fillStyle = `hsl(${(p.x / canvas.width) * 360}, 90%, 55%)`;
        ctx.fillRect(-p.s, -p.s, p.s * 2, p.s * 2);
        ctx.restore();
      });
      if (t < duration) requestAnimationFrame(tick); else canvas.remove();
    }
    requestAnimationFrame(tick);
  }

  // ---------- Карта (Яндекс): раскрытие, ленивая загрузка, модалка ----------
  function initMap() {
    const toggleBtn = document.getElementById('toggleMapBtn');
    const copyBtn = document.getElementById('copyCoordsBtn');
    const openModalBtn = document.getElementById('openMapModalBtn');

    const panel = document.getElementById('mapPanel');
    const iframe = document.getElementById('lazyMap');

    const modal = document.getElementById('mapModal');
    const modalFrame = document.getElementById('modalMapFrame');
    const closeModalBtn = document.getElementById('closeMapModalBtn');

    if (!toggleBtn || !panel || !iframe) return;

    let hasLoaded = false;
    let confettiShown = false;

    // Координаты (Москва, Красная площадь по умолчанию)
    const coords = { lat: 55.755800, lng: 37.617300 };

    // Раскрытие + ленивая загрузка карты (Яндекс-виджет)
    toggleBtn.addEventListener('click', () => {
      const opening = !panel.classList.contains('open');
      if (opening) {
        panel.classList.add('open');
        panel.style.maxHeight = '700px';
        panel.setAttribute('aria-hidden', 'false');
        toggleBtn.setAttribute('aria-expanded', 'true');
        toggleBtn.textContent = 'Скрыть карту';

        if (!hasLoaded) {
          const src = iframe.getAttribute('data-src');
          if (src) iframe.setAttribute('src', src);
          hasLoaded = true;
        }
        if (!confettiShown) {
          confettiShown = true;
          launchConfetti(panel);
        }
      } else {
        panel.classList.remove('open');
        panel.style.maxHeight = '0';
        panel.setAttribute('aria-hidden', 'true');
        toggleBtn.setAttribute('aria-expanded', 'false');
        toggleBtn.textContent = 'Показать карту';
      }
    });

    // Копирование координат
    if (copyBtn) {
      copyBtn.addEventListener('click', async () => {
        const text = `${coords.lat.toFixed(6)}, ${coords.lng.toFixed(6)}`;
        try {
          await navigator.clipboard.writeText(text);
          if (window.portfolio?.showMessage) {
            portfolio.showMessage('success', `Координаты скопированы: ${text}`);
          } else {
            alert(`Координаты скопированы: ${text}`);
          }
        } catch (e) {
          if (window.portfolio?.showMessage) {
            portfolio.showMessage('error', 'Не удалось скопировать координаты');
          } else {
            alert('Не удалось скопировать координаты');
          }
        }
      });
    }

    // Модальное окно на весь экран (тот же src Яндекс-виджета)
    if (openModalBtn && modal && modalFrame && closeModalBtn) {
      const mapSrc = iframe.getAttribute('data-src');
      openModalBtn.addEventListener('click', () => {
        if (modal.style.display !== 'flex') {
          modal.style.display = 'flex';
          modal.setAttribute('aria-hidden', 'false');
          if (!modalFrame.getAttribute('src')) modalFrame.setAttribute('src', mapSrc);
        }
      });
      const closeModal = () => {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
      };
      closeModalBtn.addEventListener('click', closeModal);
      modal.addEventListener('click', (e) => { if (e.target === modal) closeModal(); });
      document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
    }
  }

  // ---------- Init ----------
  document.addEventListener('DOMContentLoaded', () => {
    attachRipple();
    initMap();
  });
})();
