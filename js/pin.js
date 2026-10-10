(function () {
  const dots = [...document.querySelectorAll('.dot')];
  const msg = document.getElementById('msg');
  const lock = document.getElementById('lock');
  let entry = '', busy = false;
  const PIN = '2023';
  const errors = [
    "Not it. Even the owls are unimpressed.",
    "Wrong digits. The forest is judging you softly.",
    "Close, if you squint with your whole heart. Still no.",
    "That PIN belongs to a different mystery.",
    "Access denied. Have you tried remembering harder?",
    "The lock suggests a snack and another try.",
    "Incorrect. Suspicious, but incorrect."
  ];
  let ei = Math.floor(Math.random() * errors.length);
  const paint = () => dots.forEach((d, i) => d.classList.toggle('on', i < entry.length));
  function press(k) {
    if (busy) return;
    msg.textContent = '';
    if (k === 'back') entry = entry.slice(0, -1);
    else if (k === 'clear') entry = '';
    else if (entry.length < 4) entry += k;
    paint();
    if (entry.length === 4) check();
  }
  function check() {
    busy = true;
    if (entry === PIN) {
      lock.classList.add('open'); msg.textContent = 'Click. The archive opens.';
      sessionStorage.setItem('su-unlocked', '1');
      setTimeout(() => location.href = 'archive.html', 1700);
    } else {
      lock.classList.add('shake'); msg.textContent = errors[ei++ % errors.length];
      setTimeout(() => { lock.classList.remove('shake'); entry = ''; paint(); busy = false; }, 650);
    }
  }
  document.querySelectorAll('.key').forEach(b => b.addEventListener('click', () => press(b.dataset.k)));
  addEventListener('keydown', e => {
    if (/^\d$/.test(e.key)) press(e.key);
    else if (e.key === 'Backspace') press('back');
    else if (e.key === 'Escape') press('clear');
  });
})();
