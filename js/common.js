/* Shared: pine silhouettes + drifting fireflies */
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const f = document.querySelector('.forest');
  if (f) {
    let s = 7; const r = () => (s = (s * 16807) % 2147483647) / 2147483647;
    let out = '';
    [['#0a1511', 1], ['#060d0a', 1.35]].forEach(([c, k]) => {
      for (let x = -20; x < 1220; x += 38 + r() * 40) {
        const h = (110 + r() * 150) * k, w = h * 0.32, y = 400;
        out += `<polygon fill="${c}" points="${x},${y} ${x + w / 2},${y - h} ${x + w},${y}"/>`;
        out += `<polygon fill="${c}" points="${x + 4},${y - h * .35} ${x + w / 2},${y - h * 1.12} ${x + w - 4},${y - h * .35}"/>`;
      }
    });
    f.innerHTML = `<svg viewBox="0 0 1200 400" preserveAspectRatio="xMidYMax slice" aria-hidden="true">${out}</svg>`;
  }
  const c = document.getElementById('fireflies');
  if (!c || reduce) return;
  const g = c.getContext('2d'); let W, H;
  const fl = Array.from({ length: 28 }, () => ({ x: Math.random(), y: Math.random(), p: Math.random() * 6, v: .00008 + Math.random() * .0002 }));
  const size = () => { W = c.width = innerWidth; H = c.height = innerHeight; };
  addEventListener('resize', size); size();
  (function draw(t) {
    g.clearRect(0, 0, W, H);
    for (const o of fl) {
      o.y -= o.v; o.x += Math.sin(t / 2500 + o.p) * .0002;
      if (o.y < -.02) { o.y = 1.02; o.x = Math.random(); }
      const a = .25 + .35 * Math.sin(t / 900 + o.p);
      g.beginPath(); g.fillStyle = `rgba(226,190,110,${Math.max(a, .05)})`;
      g.shadowColor = '#e2be6e'; g.shadowBlur = 10;
      g.arc(o.x * W, o.y * H, 1.6, 0, 7); g.fill();
    }
    requestAnimationFrame(draw);
  })(0);
})();
