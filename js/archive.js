
(function () {
  const $ = id => document.getElementById(id);

  /* PIN gate: if someone opens this page directly, send them to the lock */
  if (!sessionStorage.getItem('su-unlocked')) {
    location.replace('index.html');
    return;
  }

  /* ---------- CAKE ---------- */
  const wrap = $('cakeWrap'), line = $('line'), wish = $('wishBtn'), blow = $('blowBtn'), cut = $('cutBtn');

  const say = t => {
    line.style.opacity = 0;
    setTimeout(() => {
      line.textContent = t;
      line.style.opacity = 1;
    }, 250);
  };

  wish.onclick = () => {
    wrap.classList.add('wish');
    wish.disabled = true;
    blow.disabled = false;
    say('Close your eyes. Think it, don’t say it. The candle is listening.');
  };

  blow.onclick = () => {
    wrap.classList.remove('wish');
    wrap.classList.add('out');
    blow.disabled = true;
    cut.disabled = false;
    say('Wish sent. No refunds, no exchanges, excellent odds.');
  };

  cut.onclick = () => {
    cut.disabled = true;
    wrap.classList.add('slicing');
    setTimeout(() => {
      wrap.classList.add('cut');
      confetti();
      say('Verdict: delicious. Su is legally required to eat both halves.');
    }, 900);
  };

  function confetti() {
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const cols = ['#e2be6e', '#c9a45c', '#f1e9d6', '#6f9a80'];
    const r = wrap.getBoundingClientRect();

    for (let i = 0; i < 26; i++) {
      const p = document.createElement('i');
      p.className = 'confetti';
      p.style.left = (r.left + r.width / 2 + (Math.random() - 0.5) * 120) + 'px';
      p.style.top = (r.top + r.height * 0.35) + 'px';
      p.style.background = cols[i % 4];
      p.style.setProperty('--dx', ((Math.random() - 0.5) * 360) + 'px');
      p.style.setProperty('--r', (Math.random() * 720) + 'deg');
      p.style.animationDelay = (Math.random() * 0.3) + 's';
      document.body.appendChild(p);
      setTimeout(() => p.remove(), 3200);
    }
  }

  /* ---------- VOICE NOTE ---------- */
  const a = $('aud'), wave = $('wave'), track = $('track'), N = 56;
  const audioMsg = $('audioMsg');
  const playBtn = $('playBtn');
  const replayBtn = $('replay');
  const icon = $('playIcon');

  a.src = 'assets/Auntywish.mp3';
  a.load();

  for (let i = 0; i < N; i++) {
    const b = document.createElement('i');
    b.style.height = (14 + Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.45)) * 78 + (i % 5) * 2) + '%';
    wave.appendChild(b);
  }

  const bars = [...wave.children];
  const fmt = s => Number.isFinite(s)
    ? Math.floor(s / 60) + ':' + String(Math.floor(s % 60)).padStart(2, '0')
    : '0:00';

  let dragging = false;

  function ui() {
    const d = a.duration;
    const p = Number.isFinite(d) && d > 0 ? a.currentTime / d : 0;

    bars.forEach((b, i) => b.classList.toggle('done', i / N < p));

    $('fill').style.width = (p * 100) + '%';
    $('knob').style.left = (p * 100) + '%';
    $('cur').textContent = fmt(a.currentTime);
    $('dur').textContent = fmt(d);
    wave.setAttribute('aria-valuenow', Math.round(p * 100));
  }

  function seek(el, e) {
    if (!Number.isFinite(a.duration) || a.duration <= 0) return;

    const r = el.getBoundingClientRect();
    if (r.width <= 0) return;

    a.currentTime = Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)) * a.duration;
    ui();
  }

  [wave, track].forEach(el => {
    el.addEventListener('pointerdown', e => {
      dragging = true;
      el.setPointerCapture(e.pointerId);
      seek(el, e);
    });

    el.addEventListener('pointermove', e => {
      if (dragging) seek(el, e);
    });

    el.addEventListener('pointerup', () => {
      dragging = false;
    });

    el.addEventListener('pointercancel', () => {
      dragging = false;
    });
  });

  wave.addEventListener('keydown', e => {
    if (e.key === 'ArrowRight' && Number.isFinite(a.duration)) {
      a.currentTime = Math.min(a.duration, a.currentTime + 5);
    } else if (e.key === 'ArrowLeft') {
      a.currentTime = Math.max(0, a.currentTime - 5);
    } else if (e.key === ' ') {
      e.preventDefault();
      playBtn.click();
    }
  });

  const PLAY = 'M7 4l13 8-13 8z';
  const PAUSE = 'M6 4h4v16H6zM14 4h4v16h-4z';

  function setPlayIcon(isPlaying) {
    if (icon && icon.firstElementChild) {
      icon.firstElementChild.setAttribute('d', isPlaying ? PAUSE : PLAY);
    }

    playBtn.setAttribute('aria-label', isPlaying ? 'Pause' : 'Play');
  }

  playBtn.onclick = async () => {
    audioMsg.textContent = '';

    if (!a.paused) {
      a.pause();
      return;
    }

    try {
      if (a.ended) {
        a.currentTime = 0;
      }

      await a.play();
    } catch (err) {
      audioMsg.textContent = 'Could not play audio: ' + err.message;
      setPlayIcon(false);
    }
  };

  replayBtn.onclick = async () => {
    audioMsg.textContent = '';

    try {
      a.pause();
      a.currentTime = 0;
      await a.play();
    } catch (err) {
      audioMsg.textContent = 'Could not replay audio: ' + err.message;
      setPlayIcon(false);
    }
  };

  a.addEventListener('play', () => setPlayIcon(true));
  a.addEventListener('pause', () => setPlayIcon(false));
  a.addEventListener('ended', () => {
    setPlayIcon(false);
    ui();
  });

  ['timeupdate', 'loadedmetadata', 'durationchange', 'seeked'].forEach(ev => {
    a.addEventListener(ev, ui);
  });

  a.addEventListener('error', () => {
    const code = a.error ? a.error.code : 'unknown';
    const messages = {
      1: 'Audio loading was aborted.',
      2: 'A network error occurred while loading the audio.',
      3: 'The audio file could not be decoded. Check that it is a valid MP3.',
      4: 'The audio file is missing or its format is unsupported.'
    };

    audioMsg.textContent = (messages[code] || 'The audio could not be loaded.')
      + ' File: assets/Auntywish.mp3';
    setPlayIcon(false);
  });

  /* ---------- FILM ---------- */
  const YOUTUBE_ID = 'bRMtWQle6mk';
  const img = $('thumbImg');

  img.src = 'https://i.ytimg.com/vi/' + YOUTUBE_ID + '/hqdefault.jpg';
  img.onerror = () => img.remove();

  $('thumbBtn').onclick = () => {
    const f = document.createElement('iframe');
    f.src = 'https://www.youtube.com/embed/' + YOUTUBE_ID + '?autoplay=1&rel=0&vq=hd1080';
    f.title = 'Anime film for Su';
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.allowFullscreen = true;
    $('film-box').replaceChildren(f);
  };

  ui();
})();
