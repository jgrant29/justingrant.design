/* Field map: animated topographic contours for the homepage hero.
   Marching squares over a drifting Perlin field, with a soft rise that follows the pointer. */
(function () {
  var c = document.getElementById('field'); if (!c || !c.getContext) return;
  var ctx = c.getContext('2d'), btn = document.getElementById('field-toggle');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var P = new Uint8Array(512), p = [];
  for (var i = 0; i < 256; i++) p[i] = i;
  var s = 7; for (i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; var j = s % (i + 1), t = p[i]; p[i] = p[j]; p[j] = t; }
  for (i = 0; i < 512; i++) P[i] = p[i & 255];
  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return a + t * (b - a); }
  function grad(h, x, y, z) { h &= 15; var u = h < 8 ? x : y, v = h < 4 ? y : (h === 12 || h === 14 ? x : z); return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); }
  function noise(x, y, z) {
    var X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255;
    x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    var u = fade(x), v = fade(y), w = fade(z);
    var A = P[X] + Y, AA = P[A] + Z, AB = P[A + 1] + Z, B = P[X + 1] + Y, BA = P[B] + Z, BB = P[B + 1] + Z;
    return lerp(lerp(lerp(grad(P[AA], x, y, z), grad(P[BA], x - 1, y, z), u), lerp(grad(P[AB], x, y - 1, z), grad(P[BB], x - 1, y - 1, z), u), v),
                lerp(lerp(grad(P[AA + 1], x, y, z - 1), grad(P[BA + 1], x - 1, y, z - 1), u), lerp(grad(P[AB + 1], x, y - 1, z - 1), grad(P[BB + 1], x - 1, y - 1, z - 1), u), v), w);
  }
  var W, H, dpr, cell, cols, rows, F, time = 0, running = true, visible = true, last = 0;
  var target = { x: .7, y: .45 }, pt = { x: .7, y: .45 }, active = false, idle = 0;
  var LEVELS = 16;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 1.5);
    W = c.clientWidth; H = c.clientHeight; c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    cell = W < 700 ? 12 : 14; cols = Math.ceil(W / cell) + 1; rows = Math.ceil(H / cell) + 1; F = new Float32Array(cols * rows);
    draw();
  }
  function field() {
    var sc = 1 / Math.max(W, H) * 2.6, k = 0, px = pt.x * W, py = pt.y * H, r = Math.min(W, H) * .22, r2 = r * r;
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++, k++) {
      var X = x * cell, Y = y * cell, v = noise(X * sc, Y * sc, time) * .9 + noise(X * sc * 2.3 + 40, Y * sc * 2.3, time * 1.6) * .32;
      var dx = X - px, dy = Y - py, d2 = dx * dx + dy * dy; v += .55 * Math.exp(-d2 / r2);
      F[k] = v;
    }
  }
  function draw() {
    if (!W) return; field();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, W, H);
    for (var l = 0; l < LEVELS; l++) {
      var iso = -.75 + l * (1.6 / LEVELS), major = l % 4 === 0;
      var hue = 22 + l * 1.6, light = 52 + l * 1.4;
      ctx.strokeStyle = 'hsla(' + hue + ',70%,' + light + '%,' + (major ? .72 : .34) + ')';
      ctx.lineWidth = major ? 1.4 : .9; ctx.beginPath();
      for (var y = 0; y < rows - 1; y++) for (var x = 0; x < cols - 1; x++) {
        var i0 = y * cols + x, a = F[i0], b = F[i0 + 1], cc = F[i0 + cols + 1], d = F[i0 + cols];
        var idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (cc > iso ? 2 : 0) | (d > iso ? 1 : 0);
        if (idx === 0 || idx === 15) continue;
        var X0 = x * cell, Y0 = y * cell;
        var tx = X0 + cell * (iso - a) / (b - a), ty = Y0,
            ry = Y0 + cell * (iso - b) / (cc - b), rx = X0 + cell,
            bx = X0 + cell * (iso - d) / (cc - d), by = Y0 + cell,
            ly = Y0 + cell * (iso - a) / (d - a), lx = X0;
        switch (idx) {
          case 1: case 14: ctx.moveTo(lx, ly); ctx.lineTo(bx, by); break;
          case 2: case 13: ctx.moveTo(bx, by); ctx.lineTo(rx, ry); break;
          case 3: case 12: ctx.moveTo(lx, ly); ctx.lineTo(rx, ry); break;
          case 4: case 11: ctx.moveTo(tx, ty); ctx.lineTo(rx, ry); break;
          case 5: ctx.moveTo(lx, ly); ctx.lineTo(tx, ty); ctx.moveTo(bx, by); ctx.lineTo(rx, ry); break;
          case 6: case 9: ctx.moveTo(tx, ty); ctx.lineTo(bx, by); break;
          case 7: case 8: ctx.moveTo(lx, ly); ctx.lineTo(tx, ty); break;
          case 10: ctx.moveTo(lx, ly); ctx.lineTo(bx, by); ctx.moveTo(tx, ty); ctx.lineTo(rx, ry); break;
        }
      }
      ctx.stroke();
    }
  }
  function tick(now) {
    if (!running || !visible) return;
    requestAnimationFrame(tick);
    if (now - last < 33) return; var dt = Math.min((now - last) / 1000, .1); last = now;
    time += dt * .045; idle += dt;
    if (!active || idle > 4) { var a = now / 9000; target.x = .68 + Math.cos(a) * .16; target.y = .45 + Math.sin(a * 1.3) * .18; }
    pt.x += (target.x - pt.x) * .05; pt.y += (target.y - pt.y) * .05;
    draw();
  }
  function start() { if (running && visible && !reduce.matches) { last = performance.now(); requestAnimationFrame(tick); } }
  function setRunning(v) { running = v; if (btn) { btn.setAttribute('aria-pressed', v ? 'false' : 'true'); btn.setAttribute('aria-label', v ? 'Pause background animation' : 'Play background animation'); btn.classList.toggle('paused', !v); } if (v) start(); }
  addEventListener('pointermove', function (e) { if (e.clientY > H) return; target.x = e.clientX / W; target.y = e.clientY / H; active = true; idle = 0; }, { passive: true });
  addEventListener('resize', size);
  if ('IntersectionObserver' in window) new IntersectionObserver(function (es) { visible = es[0].isIntersecting; start(); }).observe(c.closest('.fhero'));
  if (btn) btn.addEventListener('click', function () { setRunning(!running); });
  reduce.addEventListener && reduce.addEventListener('change', function () { if (reduce.matches) setRunning(false); });
  size();
  if (reduce.matches) { setRunning(false); if (btn) btn.hidden = true; } else start();
})();
