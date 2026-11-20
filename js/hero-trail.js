/* About: a career trail drawn across faint terrain. The path draws itself through each role,
   a traveller walks it on a loop, and the terrain swells toward the pointer. */
(function () {
  var host = document.getElementById('hero-fx'); if (!host) return;
  var c = document.createElement('canvas'); host.appendChild(c); var ctx = c.getContext('2d');
  var P = new Uint8Array(512), p = [], s = 3, i;
  for (i = 0; i < 256; i++) p[i] = i;
  for (i = 255; i > 0; i--) { s = (s * 16807) % 2147483647; var j = s % (i + 1), t0 = p[i]; p[i] = p[j]; p[j] = t0; }
  for (i = 0; i < 512; i++) P[i] = p[i & 255];
  function fade(t) { return t * t * t * (t * (t * 6 - 15) + 10); }
  function lerp(a, b, t) { return a + t * (b - a); }
  function grad(h, x, y, z) { h &= 15; var u = h < 8 ? x : y, v = h < 4 ? y : (h === 12 || h === 14 ? x : z); return ((h & 1) ? -u : u) + ((h & 2) ? -v : v); }
  function noise(x, y, z) {
    var X = Math.floor(x) & 255, Y = Math.floor(y) & 255, Z = Math.floor(z) & 255; x -= Math.floor(x); y -= Math.floor(y); z -= Math.floor(z);
    var u = fade(x), v = fade(y), w = fade(z), A = P[X] + Y, AA = P[A] + Z, AB = P[A + 1] + Z, B = P[X + 1] + Y, BA = P[B] + Z, BB = P[B + 1] + Z;
    return lerp(lerp(lerp(grad(P[AA], x, y, z), grad(P[BA], x - 1, y, z), u), lerp(grad(P[AB], x, y - 1, z), grad(P[BB], x - 1, y - 1, z), u), v),
      lerp(lerp(grad(P[AA + 1], x, y, z - 1), grad(P[BA + 1], x - 1, y, z - 1), u), lerp(grad(P[AB + 1], x, y - 1, z - 1), grad(P[BB + 1], x - 1, y - 1, z - 1), u), v), w);
  }
  var STOPS = [['2015', 'Sales'], ['2017', 'Content'], ['2019', 'UX design'], ['2023', 'McGraw Hill'], ['2023', 'Indeed'], ['2024', 'Mozilla'], ['2026', 'JPMorganChase']];
  var DESK = [[.66, .76, 1], [.77, .65, 1], [.69, .53, 1], [.83, .43, 1], [.72, .31, -1], [.85, .2, 1], [.93, .09, -1]];
  var MOB = [[.1, .43, 1], [.38, .38, 1], [.14, .32, 1], [.6, .28, 1], [.24, .22, 1], [.52, .17, 1], [.86, .1, -1]];
  var W, H, dpr, cell, cols, rows, F, pts, curve, len;
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 1.5); W = host.clientWidth; H = host.clientHeight; c.width = W * dpr; c.height = H * dpr;
    cell = 18; cols = Math.ceil(W / cell) + 1; rows = Math.ceil(H / cell) + 1; F = new Float32Array(cols * rows);
    var src = W < 700 ? MOB : DESK; pts = src.map(function (q) { return { x: q[0] * W, y: q[1] * H, side: q[2] }; });
    curve = []; for (var k = 0; k < pts.length - 1; k++) {
      var p0 = pts[Math.max(0, k - 1)], p1 = pts[k], p2 = pts[k + 1], p3 = pts[Math.min(pts.length - 1, k + 2)];
      for (var u = 0; u < 1; u += .02) { var u2 = u * u, u3 = u2 * u;
        curve.push({ x: .5 * ((2 * p1.x) + (-p0.x + p2.x) * u + (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * u2 + (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * u3),
                     y: .5 * ((2 * p1.y) + (-p0.y + p2.y) * u + (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * u2 + (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * u3), k: k + u }); }
    } curve.push({ x: pts[pts.length - 1].x, y: pts[pts.length - 1].y, k: pts.length - 1 });
    len = curve.length;
  }
  addEventListener('resize', size); size();
  var focus = { x: .78, y: .45 };
  function terrain(time) {
    var sc = 2.4 / Math.max(W, H), k = 0, px = focus.x * W, py = focus.y * H, r2 = Math.pow(Math.min(W, H) * .25, 2);
    for (var y = 0; y < rows; y++) for (var x = 0; x < cols; x++, k++) {
      var X = x * cell, Y = y * cell, dx = X - px, dy = Y - py;
      F[k] = noise(X * sc, Y * sc, time) + .45 * Math.exp(-(dx * dx + dy * dy) / r2);
    }
    ctx.lineWidth = 1;
    for (var l = 0; l < 12; l++) {
      var iso = -.6 + l * .12; ctx.strokeStyle = 'rgba(214,170,120,' + (l % 4 ? .1 : .2) + ')'; ctx.beginPath();
      for (y = 0; y < rows - 1; y++) for (x = 0; x < cols - 1; x++) {
        var i0 = y * cols + x, a = F[i0], b = F[i0 + 1], cc = F[i0 + cols + 1], d = F[i0 + cols];
        var idx = (a > iso ? 8 : 0) | (b > iso ? 4 : 0) | (cc > iso ? 2 : 0) | (d > iso ? 1 : 0); if (!idx || idx === 15) continue;
        var X0 = x * cell, Y0 = y * cell, tx = X0 + cell * (iso - a) / (b - a), rx = X0 + cell, ry = Y0 + cell * (iso - b) / (cc - b),
            bx = X0 + cell * (iso - d) / (cc - d), by = Y0 + cell, ly = Y0 + cell * (iso - a) / (d - a);
        switch (idx) {
          case 1: case 14: ctx.moveTo(X0, ly); ctx.lineTo(bx, by); break; case 2: case 13: ctx.moveTo(bx, by); ctx.lineTo(rx, ry); break;
          case 3: case 12: ctx.moveTo(X0, ly); ctx.lineTo(rx, ry); break; case 4: case 11: ctx.moveTo(tx, Y0); ctx.lineTo(rx, ry); break;
          case 6: case 9: ctx.moveTo(tx, Y0); ctx.lineTo(bx, by); break; case 7: case 8: ctx.moveTo(X0, ly); ctx.lineTo(tx, Y0); break;
          case 5: ctx.moveTo(X0, ly); ctx.lineTo(tx, Y0); ctx.moveTo(bx, by); ctx.lineTo(rx, ry); break;
          case 10: ctx.moveTo(X0, ly); ctx.lineTo(bx, by); ctx.moveTo(tx, Y0); ctx.lineTo(rx, ry); break;
        }
      } ctx.stroke();
    }
  }
  function draw(t) {
    var still = t < 0, T = still ? 99 : t;
    var tx = HeroPointer.active && !still ? HeroPointer.x : .78 + Math.cos(T * .1) * .1, ty = HeroPointer.active && !still ? HeroPointer.y : .45 + Math.sin(T * .13) * .15;
    focus.x += (tx - focus.x) * (still ? 1 : .04); focus.y += (ty - focus.y) * (still ? 1 : .04);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var bg = ctx.createRadialGradient(W * .75, H * .45, 0, W * .75, H * .45, Math.max(W, H) * .8);
    bg.addColorStop(0, '#1f1913'); bg.addColorStop(.6, '#110e0b'); bg.addColorStop(1, '#0a0909'); ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    terrain(T * .035);
    var drawn = Math.min(len, Math.floor(len * Math.min(1, T / 4.2)));
    ctx.save(); ctx.setLineDash([2, 10]); ctx.lineCap = 'round'; ctx.lineWidth = 2.4; ctx.strokeStyle = 'rgba(255,214,160,.85)';
    ctx.beginPath(); for (var k = 0; k < drawn; k++) k ? ctx.lineTo(curve[k].x, curve[k].y) : ctx.moveTo(curve[k].x, curve[k].y); ctx.stroke(); ctx.restore();
    var reached = drawn ? curve[drawn - 1].k : 0, fs = W < 700 ? 11 : 13;
    pts.forEach(function (q, n) {
      if (n > reached + .001) return;
      var pop = still ? 1 : Math.min(1, (T - n * 4.2 / (pts.length - 1)) * 3), last = n === pts.length - 1;
      ctx.globalAlpha = Math.max(0, pop);
      ctx.fillStyle = last ? '#ffb15c' : '#f6e7d2'; ctx.beginPath(); ctx.arc(q.x, q.y, last ? 7 : 5, 0, 7); ctx.fill();
      if (last && !still) { var ph = (T * .7) % 1; ctx.strokeStyle = 'rgba(255,177,92,' + (1 - ph) * .7 + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(q.x, q.y, 7 + ph * 26, 0, 7); ctx.stroke(); }
      ctx.textAlign = q.side > 0 ? 'left' : 'right'; var lx = q.x + q.side * 16;
      ctx.font = '600 ' + fs + 'px "Instrument Sans", system-ui, sans-serif'; ctx.fillStyle = 'rgba(255,214,160,.95)'; ctx.fillText(STOPS[n][0], lx, q.y - 2);
      ctx.font = '400 ' + (fs + 2) + 'px "Instrument Sans", system-ui, sans-serif'; ctx.fillStyle = 'rgba(246,238,226,.9)'; ctx.fillText(STOPS[n][1], lx, q.y + fs + 3);
      ctx.globalAlpha = 1;
    });
    if (!still && drawn === len) {
      var w = curve[Math.floor(((T - 4.2) * 14) % len)];
      var g = ctx.createRadialGradient(w.x, w.y, 0, w.x, w.y, 18); g.addColorStop(0, 'rgba(255,214,160,.9)'); g.addColorStop(1, 'rgba(255,214,160,0)');
      ctx.fillStyle = g; ctx.beginPath(); ctx.arc(w.x, w.y, 18, 0, 7); ctx.fill();
    }
  }
  (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(function () { HeroFX(function (dt, t) { draw(t); }); });
})();
