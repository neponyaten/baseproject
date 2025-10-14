// scripts/animations/chatbot.js
// Floating auto-replier widget. Injects itself; no CSS file required.
(function(){
  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function css(){
    return `
      .cbot-wrap{position:fixed;right:16px;bottom:82px;width:320px;max-width:92vw;background:var(--card-bg,#121212);color:var(--text,#fff);
        border-radius:14px;box-shadow:0 20px 50px rgba(0,0,0,.25);display:none;flex-direction:column;overflow:hidden;z-index:99998;}
      .cbot-header{display:flex;align-items:center;gap:.5rem;padding:.6rem .8rem;background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;}
      .cbot-title{font-weight:600;}
      .cbot-close{margin-left:auto;background:transparent;border:none;color:#fff;cursor:pointer;font-size:1rem;opacity:.9}
      .cbot-body{padding:.6rem .8rem;display:flex;flex-direction:column;gap:.5rem;max-height:50vh;overflow:auto;background:rgba(0,0,0,.15);}
      .cbot-msg{border-radius:10px;padding:.5rem .6rem;max-width:85%;line-height:1.25;}
      .cbot-user{align-self:flex-end;background:rgba(255,255,255,.1);}
      .cbot-bot{align-self:flex-start;background:rgba(59,130,246,.18);}
      .cbot-input{display:flex;gap:.5rem;padding:.6rem .8rem;background:rgba(0,0,0,.2);}
      .cbot-input input{flex:1 1 auto;border-radius:8px;border:1px solid rgba(255,255,255,.15);background:transparent;color:inherit;padding:.5rem .6rem;}
      .cbot-input button{border:none;border-radius:8px;padding:.5rem .7rem;background:#3b82f6;color:#fff;cursor:pointer;}
      .cbot-fab{position:fixed;right:16px;bottom:16px;border:none;border-radius:999px;width:56px;height:56px;background:#3b82f6;color:#fff;
        box-shadow:0 10px 25px rgba(0,0,0,.25);cursor:pointer;z-index:99999;}
      .cbot-typing{opacity:.8;font-size:.85rem}
    `;
  }

  function mountStyles(){
    if (document.getElementById('cbotStyles')) return;
    const st = document.createElement('style'); st.id = 'cbotStyles'; st.textContent = css();
    document.head.appendChild(st);
  }

  function rules(){
    // простые правила ключевых слов (можно расширять)
    return [
      { test: /привет|здравствуйте/i, reply: 'Привет! Чем могу помочь? 😊' },
      { test: /проект|projects?/i, reply: 'Проекты можно посмотреть на странице «Проекты». Могу подсказать по стеку и технологиям.' },
      { test: /дневник|запис/i, reply: 'Записи ведутся в «Дневнике». Можно создавать, редактировать и экспортировать в JSON.' },
      { test: /контакт|связ/i, reply: 'Есть форма на странице «Контакты». Пиши — отвечу!' },
      { test: /тема|dark|свет/i, reply: 'Тему можно переключить кнопкой 🌓 вверху.' },
      { test: /скопир|clipboard/i, reply: 'Попробуй portfolio.copyText("текст") — скопирует в буфер.' },
      { test: /имя создателя|имя/i, reply: 'Его зовут Кирилл neponyaten' },
      { test: /цена сайта|прайс/i, reply: 'Могу написать Вам сайт за Биг Спешиал' },
      { test: /.*/, reply: 'Я пока маленький бот 🤖, но стараюсь! Задай другой вопрос или опиши, что ищешь.' }
    ];
  }

  function createUI(){
    // FAB
    const fab = document.createElement('button');
    fab.className = 'cbot-fab';
    fab.title = 'Открыть чат';
    fab.textContent = '💬';

    // Panel
    const wrap = document.createElement('div'); wrap.className = 'cbot-wrap'; wrap.setAttribute('aria-hidden','true');
    wrap.innerHTML = `
      <div class="cbot-header">
        <span class="cbot-title">Помощник</span>
        <button class="cbot-close" aria-label="Закрыть">✕</button>
      </div>
      <div class="cbot-body" id="cbotBody"></div>
      <div class="cbot-input">
        <input id="cbotInput" type="text" placeholder="Напишите сообщение…" autocomplete="off" />
        <button id="cbotSend">Отправить</button>
      </div>
    `;

    document.body.appendChild(wrap);
    document.body.appendChild(fab);
    return { fab, wrap };
  }

  function replyFor(text){
    const r = rules();
    const rule = r.find(x => x.test.test(text)) || r[r.length-1];
    return rule.reply;
  }

  function appendMsg(body, text, who='bot'){
    const el = document.createElement('div');
    el.className = `cbot-msg cbot-${who}`;
    el.textContent = text;
    body.appendChild(el);
    body.scrollTop = body.scrollHeight;
  }

  function init(){
    mountStyles();
    const { fab, wrap } = createUI();
    const body = wrap.querySelector('#cbotBody');
    const input = wrap.querySelector('#cbotInput');
    const sendBtn = wrap.querySelector('#cbotSend');
    const closeBtn = wrap.querySelector('.cbot-close');

    function open(){
      wrap.style.display = 'flex';
      wrap.setAttribute('aria-hidden','false');
      input.focus();
      if (!prefersReduced) wrap.animate([{opacity:0, transform:'translateY(8px)'},{opacity:1, transform:'translateY(0)'}], {duration:160, easing:'ease-out'});
    }
    function close(){
      if (!prefersReduced) wrap.animate([{opacity:1},{opacity:0}], {duration:120, easing:'ease-in'}).onfinish = ()=>{ wrap.style.display='none'; wrap.setAttribute('aria-hidden','true'); };
      else { wrap.style.display='none'; wrap.setAttribute('aria-hidden','true'); }
    }

    fab.addEventListener('click', open);
    closeBtn.addEventListener('click', close);

    function send(){
      const txt = (input.value || '').trim();
      if (!txt) return;
      appendMsg(body, txt, 'user');
      input.value='';
      // typing indicator
      const typing = document.createElement('div');
      typing.className = 'cbot-typing';
      typing.textContent = 'Печатает…';
      body.appendChild(typing); body.scrollTop = body.scrollHeight;
      setTimeout(()=>{
        typing.remove();
        appendMsg(body, replyFor(txt), 'bot');
      }, 380);
    }
    sendBtn.addEventListener('click', send);
    input.addEventListener('keydown', (e)=>{ if (e.key==='Enter') send(); });
  }

  if (document.readyState==='loading') document.addEventListener('DOMContentLoaded', init); else init();
})();