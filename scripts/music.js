// scripts/animations/music.js (strict stable build)
(function(){
  'use strict';
  const $ = (s, r=document)=>r.querySelector(s);
  const $$ = (s, r=document)=>Array.from(r.querySelectorAll(s));

  // ==== CONFIG: укажи свои треки ====
  const tracks = [
    { title: 'Мой трек 1', src: '../assets/music/minipops67.mp3' },
    { title: 'Мой трек 2', src: '../assets/music/gufymer.mp3' },
  ];

  // ==== DOM ====
  const audio = $('#player');
  const canvas = $('#wave');
  const playBtn = $('#playBtn');
  const prevBtn = $('#prevBtn');
  const nextBtn = $('#nextBtn');
  const shuffleBtn = $('#shuffleBtn');
  const vol = $('#vol');
  const now = $('#now');
  const list = $('#list');

  // ==== STATE ====
  let ctx = null;
  let srcNode = null;
  let analyser = null;
  let gain = null;
  let dataArr = null;
  let raf = 0;
  let index = 0;
  let shuffle = JSON.parse(localStorage.getItem('trash-shuffle') || 'true');

  // ==== SAFETY ====
  window.addEventListener('error', (e)=>{
    console.warn('[global] Uncaught:', e.message);
  });

  // Разлочим аудио-контекст первым жестом
  (function unlockAudio(){
    const resume = async () => {
      try {
        if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
        if (ctx.state === 'suspended') await ctx.resume();
      } catch(e) { console.warn('[audio] resume fail', e); }
      document.removeEventListener('click', resume);
      document.removeEventListener('touchstart', resume);
    };
    document.addEventListener('click', resume);
    document.addEventListener('touchstart', resume);
  })();

  function ensureGraph(){
    try {
      if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
      if (!srcNode) srcNode = ctx.createMediaElementSource(audio);
      if (!analyser) analyser = ctx.createAnalyser();
      if (!gain) gain = ctx.createGain();

      analyser.fftSize = 1024;
      dataArr = new Uint8Array(analyser.frequencyBinCount);

      try { srcNode.disconnect(); } catch {}
      try { analyser.disconnect(); } catch {}
      try { gain.disconnect(); } catch {}

      srcNode.connect(analyser);
      analyser.connect(gain);
      gain.gain.value = vol ? +vol.value : 0.9;
      gain.connect(ctx.destination);
    } catch(e){
      console.warn('[audio] ensureGraph failed', e);
    }
  }

  function startDraw(){
    if (raf) return;
    const cx = canvas.getContext('2d');
    function resize(){
      const dpr = window.devicePixelRatio || 1;
      const W = Math.floor(canvas.clientWidth*dpr);
      const H = Math.floor(canvas.clientHeight*dpr);
      if (canvas.width !== W || canvas.height !== H) { canvas.width=W; canvas.height=H; }
    }
    function grad(){
      const g = cx.createLinearGradient(0,0,canvas.width,0);
      g.addColorStop(0,'#ff4d6d'); g.addColorStop(1,'#7b2cbf');
      return g;
    }
    function tick(){
      if (!analyser) { raf = 0; return; }
      resize();
      analyser.getByteTimeDomainData(dataArr);
      cx.clearRect(0,0,canvas.width,canvas.height);
      cx.beginPath();
      cx.strokeStyle = grad();
      const slice = canvas.width / dataArr.length;
      for (let i=0, x=0; i<dataArr.length; i++, x+=slice){
        const y = (dataArr[i]/128.0) * (canvas.height/2);
        if (i===0) cx.moveTo(0,y); else cx.lineTo(x,y);
      }
      cx.lineWidth = 2; cx.stroke();
      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
  }

  function renderList(){
    if (!list) return;
    list.innerHTML = tracks.map((t,i)=>`
      <div class="track ${i===index?'active':''}" data-i="${i}">
        <span class="pill">#${String(i+1).padStart(2,'0')}</span>
        <div><strong>${(t.title||('Track '+(i+1))).replace(/</g,'&lt;')}</strong></div>
        <div class="tiny">${(t.src||'').replace(/</g,'&lt;')}</div>
      </div>
    `).join('');
    $$('#list .track').forEach(el=>{
      el.addEventListener('click', ()=>{
        index = +el.dataset.i;
        select(index, true);
      });
    });
  }

  function select(i, autoplay=false){
    const t = tracks[i];
    if (!t) { console.warn('[audio] track not found:', i); return; }
    document.querySelectorAll('.track').forEach((el,k)=>el.classList.toggle('active', k===i));
    if (now) now.textContent = 'Сейчас играет: ' + (t.title || ('Track '+(i+1)));

    audio.pause();
    audio.src = t.src;
    audio.load();
    ensureGraph();
    startDraw();

    const onCanPlay = async () => {
      audio.removeEventListener('canplay', onCanPlay);
      try {
        if (autoplay) await audio.play();
      } catch(e) { console.warn('[audio] play failed', e); }
    };
    audio.addEventListener('canplay', onCanPlay);

    audio.onerror = (e) => {
      const code = (audio.error && audio.error.code) || 0;
      console.warn('[audio] error', code, t.src, e);
      alert('Ошибка загрузки аудио. Проверь путь и что ты открыл страницу через http://localhost:...');
    };
  }

  function nextIndex(){
    if (!tracks.length) return 0;
    if (!JSON.parse(localStorage.getItem('trash-shuffle')||'true'))
      return (index + 1) % tracks.length;
    if (tracks.length === 1) return 0;
    let i; do { i = Math.floor(Math.random()*tracks.length); } while(i===index);
    return i;
  }
  function prevIndex(){
    if (!tracks.length) return 0;
    if (!JSON.parse(localStorage.getItem('trash-shuffle')||'true'))
      return (index - 1 + tracks.length) % tracks.length;
    if (tracks.length === 1) return 0;
    let i; do { i = Math.floor(Math.random()*tracks.length); } while(i===index);
    return i;
  }

  // Controls
  playBtn?.addEventListener('click', async ()=>{
    if (!tracks.length) { alert('Сначала добавь треки в массив tracks.'); return; }
    if (!audio.src) { select(index, true); return; }
    if (audio.paused) { try { await audio.play(); playBtn.textContent='⏸'; } catch(e){ console.warn(e); } }
    else { audio.pause(); playBtn.textContent='▶'; }
  });
  prevBtn?.addEventListener('click', ()=> select(prevIndex(), true));
  nextBtn?.addEventListener('click', ()=> select(nextIndex(), true));
  shuffleBtn?.addEventListener('click', ()=>{
    shuffle = !shuffle;
    localStorage.setItem('trash-shuffle', JSON.stringify(shuffle));
    alert(shuffle ? '🔀 Случайный порядок' : '➡️ По порядку');
  });
  vol?.addEventListener('input', ()=> audio.volume = +vol.value);

  audio?.addEventListener('play', async ()=>{
    try { if (ctx && ctx.state==='suspended') await ctx.resume(); } catch {}
    playBtn.textContent='⏸';
  });
  audio?.addEventListener('pause', ()=> playBtn.textContent='▶');

  // Init
  document.addEventListener('DOMContentLoaded', ()=>{
    renderList();
    if (tracks.length) select(0, false);
  });
})();