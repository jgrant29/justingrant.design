/* Common Voice: a live recording waveform. Phrases swell and settle; the pointer near the mic raises it. */
(function () {
  var host = document.getElementById('hero-fx'); if (!host) return;
  var c = document.createElement('canvas'); host.appendChild(c); var ctx = c.getContext('2d');
  var W, H, dpr, N = 40, boost = 0;
  function size() { dpr = Math.min(devicePixelRatio || 1, 1.5); W = host.clientWidth; H = host.clientHeight; c.width = W * dpr; c.height = H * dpr; }
  addEventListener('resize', size); size();
  function draw(t) {
    var m = W < 700, CX = m ? .62 : .76, CY = m ? .3 : .44, mx = W * CX, my = H * CY, R = Math.min(W, H);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var bg = ctx.createRadialGradient(mx, my, 0, mx, my, Math.max(W, H) * .8);
    bg.addColorStop(0, '#2a1830'); bg.addColorStop(.55, '#140f1d'); bg.addColorStop(1, '#09080d');
    ctx.fillStyle = bg; ctx.fillRect(0, 0, W, H);
    var phrase = .55 + .45 * Math.pow(Math.max(0, Math.sin(t * .9) * Math.sin(t * .37 + 1)), .6);
    var near = HeroPointer.active ? Math.exp(-(Math.pow(HeroPointer.x * W - mx, 2) + Math.pow(HeroPointer.y * H - my, 2)) / Math.pow(R * .25, 2)) : 0;
    boost += (near - boost) * .08;
    var amp0 = R * (.09 + .1 * phrase + .08 * boost);
    var g = ctx.createLinearGradient(0, 0, W, 0);
    g.addColorStop(0, '#ff6b8a'); g.addColorStop(.55, '#ff9fb4'); g.addColorStop(.8, '#b8a1ff'); g.addColorStop(1, '#6fc3ff');
    ctx.strokeStyle = g;
    for (var i = 0; i < N; i++) {
      var k = i / (N - 1), s = Math.sin(Math.PI * k), ph = k * 2.4 + t * .8, amp = amp0 * (.35 + .9 * s);
      ctx.globalAlpha = .22 + .6 * s; ctx.lineWidth = .8 + 1.6 * s; ctx.beginPath();
      for (var x = -20; x <= W + 20; x += 10) {
        var u = x / W, env = Math.exp(-Math.pow((u - CX) / .3, 2));
        var y = my + amp * env * Math.sin((u - CX) * 9.5 + ph) * Math.cos((u - CX) * 3.1 - ph * .6) + (k - .5) * R * .07 * env;
        x === -20 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    var r = R * .055, pulse = (t * .6) % 1;
    var glow = ctx.createRadialGradient(mx, my, 0, mx, my, r * 4);
    glow.addColorStop(0, 'rgba(255,125,154,.5)'); glow.addColorStop(1, 'rgba(255,125,154,0)');
    ctx.fillStyle = glow; ctx.beginPath(); ctx.arc(mx, my, r * 4, 0, 7); ctx.fill();
    if (t >= 0) { ctx.strokeStyle = 'rgba(255,255,255,' + (.5 * (1 - pulse)) + ')'; ctx.lineWidth = 2; ctx.beginPath(); ctx.arc(mx, my, r * (1 + pulse * 1.2), 0, 7); ctx.stroke(); }
    ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(mx, my, r, 0, 7); ctx.fill();
    var u2 = r / 27; ctx.save(); ctx.translate(mx, my); ctx.scale(u2, u2); ctx.translate(-12, -12);
    ctx.strokeStyle = '#e8455f'; ctx.lineWidth = 1.8; ctx.lineCap = 'round'; ctx.lineJoin = 'round';
    ctx.beginPath(); ctx.moveTo(12, 2); ctx.arcTo(15, 2, 15, 5, 3); ctx.lineTo(15, 11); ctx.arcTo(15, 14, 12, 14, 3); ctx.arcTo(9, 14, 9, 11, 3); ctx.lineTo(9, 5); ctx.arcTo(9, 2, 12, 2, 3); ctx.closePath(); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(5, 10); ctx.lineTo(5, 11); ctx.bezierCurveTo(5, 15, 8.1, 18, 12, 18); ctx.bezierCurveTo(15.9, 18, 19, 15, 19, 11); ctx.lineTo(19, 10); ctx.moveTo(12, 18); ctx.lineTo(12, 22); ctx.stroke();
    ctx.restore();
  }
  HeroFX(function (dt, t) { draw(t < 0 ? 1.8 : t); });
})();
