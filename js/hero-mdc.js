/* Mozilla Data Collective: a data constellation. Brand-coloured datasets drift, link into a shifting
   mesh, and gather toward the pointer. Inspired by particle-mesh hero backgrounds. */
(function () {
  var host = document.getElementById('hero-fx'); if (!host) return;
  var c = document.createElement('canvas'); host.appendChild(c); var ctx = c.getContext('2d');
  var COL = ['#F06C13', '#E1B7E0', '#53E17C', '#FF9E5F', '#FEFAF5'], W, H, dpr, P = [], grain, seed = 11;
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 1.5); W = host.clientWidth; H = host.clientHeight; c.width = W * dpr; c.height = H * dpr;
    var n = Math.min(150, Math.round(W * H / 11000)); seed = 11; P = [];
    for (var i = 0; i < n; i++) {
      var big = rnd() < .12;
      P.push({ x: W * (.28 + .72 * Math.sqrt(rnd())), y: H * rnd(), vx: (rnd() - .5) * 14, vy: (rnd() - .5) * 14,
        r: big ? 7 + rnd() * 7 : 2 + rnd() * 3.2, sq: rnd() < .35, a: rnd() * 6.3, c: COL[Math.floor(rnd() * (big ? 3 : 5))] });
    }
    grain = document.createElement('canvas'); grain.width = grain.height = 160; var g = grain.getContext('2d'), d = g.createImageData(160, 160);
    for (var k = 0; k < d.data.length; k += 4) { var v = rnd() * 255; d.data[k] = d.data[k + 1] = d.data[k + 2] = v; d.data[k + 3] = 14; }
    g.putImageData(d, 0, 0);
  }
  addEventListener('resize', size); size();
  var focus = { x: .72, y: .42 };
  function step(dt, t) {
    var tx, ty;
    if (HeroPointer.active) { tx = HeroPointer.x; ty = HeroPointer.y; } else { tx = .72 + Math.cos(t * .11) * .14; ty = .42 + Math.sin(t * .15) * .18; }
    focus.x += (tx - focus.x) * .04; focus.y += (ty - focus.y) * .04;
    var fx = focus.x * W, fy = focus.y * H, R = Math.min(W, H) * .32;
    for (var i = 0; i < P.length; i++) {
      var p = P[i], dx = fx - p.x, dy = fy - p.y, d = Math.hypot(dx, dy) || 1;
      if (d < R) { var f = (1 - d / R) * 22; p.vx += dx / d * f * dt; p.vy += dy / d * f * dt; if (d < R * .18) { p.vx -= dx / d * 40 * dt; p.vy -= dy / d * 40 * dt; } }
      p.vx += Math.sin(t * .3 + i) * 2 * dt; p.vy += Math.cos(t * .27 + i * 1.7) * 2 * dt;
      p.vx *= .985; p.vy *= .985; var sp = Math.hypot(p.vx, p.vy); if (sp > 38) { p.vx *= 38 / sp; p.vy *= 38 / sp; }
      p.x += p.vx * dt; p.y += p.vy * dt; p.a += dt * .4;
      if (p.x < -20) p.x = W + 20; if (p.x > W + 20) p.x = -20; if (p.y < -20) p.y = H + 20; if (p.y > H + 20) p.y = -20;
    }
  }
  function draw() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.fillStyle = '#121212'; ctx.fillRect(0, 0, W, H);
    var gl = ctx.createRadialGradient(focus.x * W, focus.y * H, 0, focus.x * W, focus.y * H, Math.max(W, H) * .55);
    gl.addColorStop(0, 'rgba(240,108,19,.16)'); gl.addColorStop(.5, 'rgba(225,183,224,.05)'); gl.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = gl; ctx.fillRect(0, 0, W, H);
    var L = Math.min(W, H) * .16, L2 = L * L; ctx.lineWidth = 1;
    for (var i = 0; i < P.length; i++) for (var j = i + 1; j < P.length; j++) {
      var a = P[i], b = P[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
      if (d2 < L2) { ctx.strokeStyle = 'rgba(254,250,245,' + (.22 * (1 - d2 / L2)) + ')'; ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke(); }
    }
    for (i = 0; i < P.length; i++) {
      var p = P[i]; ctx.fillStyle = p.c;
      if (p.sq) { ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.a); ctx.fillRect(-p.r, -p.r, p.r * 2, p.r * 2); ctx.restore(); }
      else { ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, 6.3); ctx.fill(); }
      if (p.r > 6) { ctx.strokeStyle = p.c; ctx.globalAlpha = .35; ctx.beginPath(); ctx.arc(p.x, p.y, p.r * 2.2, 0, 6.3); ctx.stroke(); ctx.globalAlpha = 1; }
    }
    ctx.fillStyle = ctx.createPattern(grain, 'repeat'); ctx.fillRect(0, 0, W, H);
  }
  HeroFX(function (dt, t) {
    if (t < 0) { for (var k = 0; k < 160; k++) step(1 / 30, k / 30); draw(); return; }
    step(dt, t); draw();
  });
})();
