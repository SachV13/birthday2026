(function () {
  const $ = id => document.getElementById(id);
  /* PIN gate: if someone opens this page directly, send them to the lock */
  if (!sessionStorage.getItem('su-unlocked')) { location.replace('index.html'); return; }

  /* ---------- CAKE ---------- */
  const wrap = $('cakeWrap'), line = $('line'), wish = $('wishBtn'), blow = $('blowBtn'), cut = $('cutBtn');
  const say = t => { line.style.opacity = 0; setTimeout(() => { line.textContent = t; line.style.opacity = 1; }, 250); };
  wish.onclick = () => {
    wrap.classList.add('wish'); wish.disabled = true; blow.disabled = false;
    say('Close your eyes. Think it, don\u2019t say it. The candle is listening.');
  };
  blow.onclick = () => {
    wrap.classList.remove('wish'); wrap.classList.add('out'); blow.disabled = true; cut.disabled = false;
    say('Wish sent. No refunds, no exchanges, excellent odds.');
  };
  cut.onclick = () => {
    cut.disabled = true; wrap.classList.add('slicing');
    setTimeout(() => { wrap.classList.add('cut'); confetti(); say('Verdict: delicious. Su is legally required to eat both halves.'); }, 900);
  };
  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const cols = ['#e2be6e', '#c9a45c', '#f1e9d6', '#6f9a80'];
    const r = wrap.getBoundingClientRect();
    for (let i = 0; i < 26; i++) {
      const p = document.createElement('i'); p.className = 'confetti';
      p.style.left = (r.left + r.width / 2 + (Math.random() - .5) * 120) + 'px';
      p.style.top = (r.top + r.height * .35) + 'px';
      p.style.background = cols[i % 4];
      p.style.setProperty('--dx', ((Math.random() - .5) * 360) + 'px');
      p.style.setProperty('--r', (Math.random() * 720) + 'deg');
      p.style.animationDelay = (Math.random() * .3) + 's';
      document.body.appendChild(p); setTimeout(() => p.remove(), 3200);
    }
  }

  /* ---------- VOICE NOTE ---------- */
  const a = $('aud'), wave = $('wave'), track = $('track'), N = 56;
  a.src = AUDIO_FILE;
  for (let i = 0; i < N; i++) {
    const b = document.createElement('i');
    b.style.height = (14 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * .45)) * 78 + (i % 5) * 2) + '%';
    wave.appendChild(b);
  }
  const bars = [...wave.children];
  const fmt = s => isFinite(s) ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0') : '0:00';
  let dragging = false;
  function ui() {
    const d = a.duration, p = d ? a.currentTime / d : 0;
    bars.forEach((b, i) => b.classList.toggle('done', i / N < p));
    $('fill').style.width = $('knob').style.left = (p * 100) + '%';
    $('cur').textContent = fmt(a.currentTime); $('dur').textContent = fmt(d);
    wave.setAttribute('aria-valuenow', Math.round(p * 100));
  }
  function seek(el, e) {
    if (!a.duration) return;
    const r = el.getBoundingClientRect();
    a.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * a.duration; ui();
  }
  [wave, track].forEach(el => {
    el.addEventListener('pointerdown', e => { dragging = true; el.setPointerCapture(e.pointerId); seek(el, e); });
    el.addEventListener('pointermove', e => dragging && seek(el, e));
    el.addEventListener('pointerup', () => dragging = false);
    el.addEventListener('pointercancel', () => dragging = false);
  });
  wave.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight') a.currentTime += 5; else if (e.key === 'ArrowLeft') a.currentTime -= 5;
    else if (e.key === ' ') { e.preventDefault(); $('playBtn').click(); }
  });
  const icon = $('playIcon'), PLAY = 'M7 4l13 8-13 8z', PAUSE = 'M6 4h4v16H6zM14 4h4v16h-4z';
  $('playBtn').onclick = () => a.paused ? a.play().catch(() => {}) : a.pause();
  $('replay').onclick = () => { a.currentTime = 0; a.play().catch(() => {}); };
  a.addEventListener('play', () => { icon.firstElementChild.setAttribute('d', PAUSE); $('playBtn').setAttribute('aria-label', 'Pause'); });
  ['pause', 'ended'].forEach(ev => a.addEventListener(ev, () => { icon.firstElementChild.setAttribute('d', PLAY); $('playBtn').setAttribute('aria-label', 'Play'); }));
  ['timeupdate', 'loadedmetadata', 'durationchange'].forEach(ev => a.addEventListener(ev, ui));
  a.addEventListener('error', () => { $('audioMsg').textContent = 'Voice note not found yet. Add "' + AUDIO_FILE + '" to the project.'; });

  /* ---------- FILM ---------- */
  const img = $('thumbImg');
  img.src = 'https://i.ytimg.com/vi/' + YOUTUBE_ID + '/hqdefault.jpg';
  img.onerror = () => img.remove();
  $('thumbBtn').onclick = () => {
    const f = document.createElement('iframe');
    f.src = 'https://youtu.be/bRMtWQle6mk?si=A2-k_JtULSGerUVM' + YOUTUBE_ID + '?autoplay=1&rel=0';
    f.title = 'Anime film for Su'; f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen'; f.allowFullscreen = true;
    $('film-box').replaceChildren(f);
  };
  ui();
})();
