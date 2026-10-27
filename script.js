/* =====================================================================
   script.js — behaviour of the birthday surprise
   Nothing here needs editing, personalise everything in config.js
   ===================================================================== */
(() => {
  'use strict';

  /* ---------- 1. Helpers ---------- */
  const C = window.BIRTHDAY || {};
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $  = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
  const rand = (a, b) => Math.random() * (b - a) + a;
  const pick = list => list[Math.floor(Math.random() * list.length)];
  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? undefined : o[k]), obj);
  const sleep = ms => new Promise(res => setTimeout(res, reduced ? Math.min(ms, 40) : ms));

  const SYMBOLS = ['♥', '❤', '♡', '✦', '✧', '❥'];
  const COLORS  = ['#ffd9df', '#ff8fa3', '#e58a9b', '#fff4e6', '#ffd36b', '#ff6b88'];

  const dom = {
    body: document.body, app: $('#app'), loader: $('#loader'), stage: $('#stage'),
    line1: $('#line1'), line2: $('#line2'), typed: $('#typed'), wishBtn: $('#wishBtn'),
    loaderFloaters: $('#loaderFloaters'), floaters: $('#floaters'), fx: $('#fx'),
    mail: $('#mail'), backBtn: $('#backBtn'), hugBtn: $('#hugBtn'), hugNote: $('#hugNote')
  };

  /* ---------- 2. Fill text from config.js ---------- */
  function bindText() {
    $$('[data-bind]').forEach(node => {
      const v = get(C, node.dataset.bind);
      if (typeof v === 'string' && v.trim()) node.textContent = v;
    });
  }

  function makeImg(src, alt) {
    const img = new Image();
    img.src = src; img.alt = alt || '';
    img.loading = 'lazy'; img.decoding = 'async';
    img.addEventListener('error', () => {
      img.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 600 600'%3E%3Crect width='600' height='600' fill='%23f8d7dd'/%3E%3Ctext x='300' y='340' text-anchor='middle' font-size='200'%3E❤️%3C/text%3E%3C/svg%3E";
    }, { once: true });
    return img;
  }

  /* ---------- 3. Floating hearts + bursts ---------- */
  function spawnFloater(layer) {
    const page = document.body.dataset.page;
    if (reduced || document.hidden || layer.childElementCount > 20) return;
    if (layer === dom.floaters && page !== 'intro' && page !== 'hub') return;
    const el = document.createElement('span');
    el.className = 'float-item';
    el.textContent = pick(SYMBOLS);
    el.style.setProperty('--x', rand(2, 96) + '%');
    el.style.setProperty('--size', rand(12, 28) + 'px');
    el.style.setProperty('--dur', rand(9, 16) + 's');
    el.style.setProperty('--drift', rand(-70, 70) + 'px');
    el.style.setProperty('--spin', rand(-45, 45) + 'deg');
    el.style.setProperty('--c', pick(COLORS));
    el.addEventListener('animationend', () => el.remove());
    layer.appendChild(el);
  }
  function startFloaters(layer, every) {
    if (reduced) return null;
    for (let i = 0; i < 4; i++) setTimeout(() => spawnFloater(layer), i * 350);
    return setInterval(() => spawnFloater(layer), every);
  }
  function burst(x, y, opts = {}) {
    if (reduced || !dom.fx.animate) return;
    const { count = 24, symbols = ['❤', '♥', '💖', '💗', '✨'], spread = 170, duration = 1500 } = opts;
    for (let i = 0; i < count; i++) {
      const el = document.createElement('span');
      el.className = 'fx-particle';
      el.textContent = pick(symbols);
      el.style.left = x + 'px'; el.style.top = y + 'px';
      el.style.fontSize = rand(14, 30) + 'px'; el.style.color = pick(COLORS);
      dom.fx.appendChild(el);
      const angle = rand(0, Math.PI * 2), dist = rand(spread * 0.35, spread);
      const dx = Math.cos(angle) * dist, dy = Math.sin(angle) * dist - rand(20, 80), spin = rand(-50, 50);
      const anim = el.animate([
        { transform: 'translate(-50%, -50%) scale(.2)', opacity: 1 },
        { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1) rotate(${spin}deg)`, opacity: 1, offset: 0.6 },
        { transform: `translate(calc(-50% + ${dx * 1.1}px), calc(-50% + ${dy + 70}px)) scale(.8) rotate(${spin * 1.5}deg)`, opacity: 0 }
      ], { duration: duration * rand(0.8, 1.2), easing: 'cubic-bezier(.2,.8,.3,1)', fill: 'forwards' });
      anim.onfinish = () => el.remove();
    }
  }

  /* ---------- 4. Cake opening → "Make a Wish" ---------- */
  function buildCakeDecor() {
    const hearts = $('#cakeHearts');
    for (let i = 0; i < 5; i++) {
      const s = document.createElement('span');
      s.textContent = '♥'; s.style.setProperty('--k', i);
      hearts.appendChild(s);
    }
    const sprinkles = $('#sprinkles');
    const cols = ['#fff4e6', '#ffd36b', '#f8d7dd', '#b3122f', '#ffffff'];
    for (let i = 0; i < 16; i++) {
      const s = document.createElement('span');
      s.style.left = rand(8, 88) + '%'; s.style.top = rand(2.2, 3.7) + 'em';
      s.style.setProperty('--r', rand(-70, 70) + 'deg');
      s.style.setProperty('--c', pick(cols)); s.style.setProperty('--k', i);
      sprinkles.appendChild(s);
    }
  }

  async function typeText(node, text, speed = 48) {
    if (reduced) { node.textContent = text; return; }
    const chars = Array.from(text);
    node.classList.add('typing');
    for (let i = 1; i <= chars.length; i++) {
      node.textContent = chars.slice(0, i).join('');
      await new Promise(r => setTimeout(r, speed));
    }
    await new Promise(r => setTimeout(r, 450));
    node.classList.remove('typing');
  }

  async function buildCake() {
    const [plate, bottom, mid, top] = [
      $('.plate', dom.stage), $('.layer-bottom', dom.stage), $('.layer-mid', dom.stage), $('.layer-top', dom.stage)
    ];
    const state = cls => dom.stage.classList.add(cls);
    let timer = null;

    await sleep(600);  plate.classList.add('show');
    await sleep(800);  bottom.classList.add('show');
    await sleep(700);  mid.classList.add('show');
    await sleep(700);  top.classList.add('show');
    await sleep(900);  state('frosted');
    timer = startFloaters(dom.loaderFloaters, 1400);
    await sleep(1200); state('decorated');
    await sleep(1000); state('candles-in');
    await sleep(1100); state('lit');

    await sleep(900);
    dom.line1.classList.add('show');
    await typeText(dom.typed, $('.sr-only', dom.line1).textContent.trim());
    await sleep(500);
    dom.line2.classList.add('show');
    await sleep(900);
    dom.wishBtn.disabled = false;
    dom.wishBtn.classList.add('show');
    dom.wishBtn.focus({ preventScroll: true });
    dom.wishBtn.addEventListener('click', () => makeAWish(timer), { once: true });
  }

  async function makeAWish(timer) {
    dom.wishBtn.disabled = true;
    dom.stage.classList.add('wished');
    $$('.flame', dom.stage).forEach((flame, i) => setTimeout(() => {
      const r = flame.getBoundingClientRect();
      burst(r.left + r.width / 2, r.top + r.height / 2, { count: 10, symbols: ['✦', '✧', '✨', '♥'], spread: 120, duration: 1400 });
    }, i * 110));
    const c = $('.cake', dom.stage).getBoundingClientRect();
    setTimeout(() => burst(c.left + c.width / 2, c.top, { count: 18, spread: 200 }), 400);
    await sleep(1700);
    if (timer) clearInterval(timer);
    dom.loader.classList.add('leaving');
    enterSite();
    await sleep(1200);
    dom.loader.hidden = true;
  }

  function enterSite() {
    dom.app.hidden = false;
    dom.body.classList.remove('loading');
    show('intro', { push: false });
    history.replaceState({ page: 'intro' }, '', '#intro');
    startFloaters(dom.floaters, 1300);
  }

  /* ---------- 5. Page router ---------- */
  const PAGES = ['intro', 'hub', 'letter', 'flower', 'song'];

  function show(name, { push = true } = {}) {
    if (!PAGES.includes(name)) name = 'hub';
    $$('.page').forEach(p => p.classList.remove('active', 'go'));
    const page = $('#page-' + name);
    page.classList.add('active');
    dom.body.dataset.page = name;
    // pause the surprise video when leaving its page
    if (name !== 'song') { const gv = $('#giftVideo'); if (gv) gv.pause(); }
    dom.backBtn.hidden = !['letter', 'flower', 'song'].includes(name);
    window.scrollTo(0, 0);
    requestAnimationFrame(() => page.classList.add('go'));
    page.focus({ preventScroll: true });
    if (push) history.pushState({ page: name }, '', '#' + name);
  }

  function setupRouter() {
    $$('[data-go]').forEach(b => b.addEventListener('click', () => show(b.dataset.go)));
    dom.backBtn.addEventListener('click', () => show('hub'));
    window.addEventListener('popstate', e => {
      if (!dom.app.hidden) show((e.state && e.state.page) || 'hub', { push: false });
    });

    let opening = false;
    dom.mail.addEventListener('click', async () => {
      if (opening) return;
      opening = true;
      dom.mail.classList.add('open');
      const r = dom.mail.getBoundingClientRect();
      setTimeout(() => burst(r.left + r.width / 2, r.top + r.height * 0.3, { count: 22, symbols: ['✦', '✧', '♥', '✨'], spread: 190 }), 450);
      await sleep(1700);
      show('hub');
      dom.mail.classList.remove('open');
      opening = false;
    });
  }

  /* ---------- 6. Pages: letter / flower / surprise gift ---------- */
  function renderLetter() {
    const L = C.letter || {};
    const box = $('#letterText');
    box.textContent = '';
    let n = 0;
    const add = (tag, text, cls) => {
      const el = document.createElement(tag);
      el.textContent = text;
      if (cls) el.className = cls;
      el.style.setProperty('--n', n++);
      box.appendChild(el);
    };
    if (L.greeting) add('h2', L.greeting, 'letter-p');
    (L.paragraphs || []).filter(t => String(t).trim()).forEach(t => add('p', String(t).trim(), 'letter-p'));
    if (L.signature) add('p', L.signature, 'letter-p signature');

    const stack = $('#photoStack');
    const photos = (L.photos || []).slice(0, 3);
    while (photos.length < 3) photos.push({ src: `images/memory-${photos.length + 1}.svg`, alt: `Photo ${photos.length + 1}` });
    photos.forEach((p, i) => {
      const fig = document.createElement('figure');
      fig.style.setProperty('--n', i);
      fig.appendChild(makeImg(p.src, p.alt || `Photo ${i + 1}`));
      stack.appendChild(fig);
    });
  }

  function renderFlower() {
    const list = ((C.flower && C.flower.messages) || []).filter(t => String(t).trim());
    const half = Math.ceil(list.length / 2);
    const fill = (ul, items, offset) => items.forEach((t, i) => {
      const li = document.createElement('li');
      li.style.setProperty('--i', offset + i * 2);
      const span = document.createElement('span');
      span.textContent = t;
      li.appendChild(span);
      ul.appendChild(li);
    });
    fill($('#chipsLeft'), list.slice(0, half), 0);
    fill($('#chipsRight'), list.slice(half), 1);
  }

  function renderSong() {
    const S = C.song || {};
    const video = $('#giftVideo');
    if (video && S.video) {
      if (S.poster) video.poster = S.poster;
      video.src = S.video;
    }

    const text = $('#songText');
    (S.paragraphs || []).filter(t => String(t).trim()).forEach(t => {
      const p = document.createElement('p');
      p.textContent = String(t).trim();
      text.appendChild(p);
    });

    [['#stripA', S.stripA], ['#stripB', S.stripB]].forEach(([sel, photos]) => {
      const strip = $(sel);
      (photos || []).forEach(p => strip.appendChild(makeImg(p.src, p.alt)));
    });
  }

  /* ---------- 7. Final hug ---------- */
  function setupHug() {
    const F = C.finale || {};
    if (F.enableHug === false) { dom.hugBtn.hidden = true; return; }
    let first = true;
    dom.hugBtn.addEventListener('click', () => {
      const r = dom.hugBtn.getBoundingClientRect();
      const x = r.left + r.width / 2, y = r.top + r.height / 2;
      const spread = Math.min(280, window.innerWidth * 0.46);
      burst(x, y, { count: 36, spread, duration: 1700 });
      setTimeout(() => burst(x, y, { count: 24, symbols: ['❤', '💕', '💋', '🤗', '✨'], spread: spread * 1.2, duration: 1900 }), 380);

      dom.hugNote.hidden = false;
      dom.hugNote.style.animation = 'none';
      void dom.hugNote.offsetWidth;
      dom.hugNote.style.animation = '';
      dom.hugBtn.textContent = F.hugAgain || 'Another one? 🤗';
      if (first) {
        first = false;
        setTimeout(() => dom.hugNote.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'center' }), 600);
      }
    });
  }

  /* ---------- 8. Start ---------- */
  function init() {
    bindText();
    buildCakeDecor();
    renderLetter();
    renderFlower();
    renderSong();
    setupRouter();
    setupHug();

    const skipCake = (C.intro && C.intro.cake === false) || /[?&]skip\b/.test(location.search);
    if (skipCake) {
      dom.loader.hidden = true;
      enterSite();
    } else {
      buildCake();
    }
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();