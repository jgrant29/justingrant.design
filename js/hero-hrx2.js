/* hrsimple: an abstract painted skyline. Brushed towers in the hrsimple artwork palette breathe like an
   equaliser, windows switch on at dusk, and the water reflects them. The pointer lifts nearby towers. */
(function () {
  var host = document.getElementById('hero-fx'); if (!host) return;
  var c = document.createElement('canvas'); host.appendChild(c); var ctx = c.getContext('2d');
  var PAL = ['#f2c14e', '#e8505b', '#3fb8d9', '#9b5de5', '#f78c3a', '#ff6fb5', '#3dd6a3', '#5a7cf0'];
  var W, H, dpr, T = [], seed = 5, lift = [];
  function rnd() { seed = (seed * 16807) % 2147483647; return seed / 2147483647; }
  function tower(x, w, h, col, layer) {
    var cv = document.createElement('canvas'), cw = Math.ceil(w), ch = Math.ceil(h * 1.25); cv.width = cw; cv.height = ch; var g = cv.getContext('2d');
    g.fillStyle = col; g.fillRect(0, 0, cw, ch);
    for (var s = 0; s < cw; s += 3) { g.fillStyle = 'rgba(' + (rnd() < .5 ? '255,255,255' : '0,0,0') + ',' + (rnd() * .16) + ')'; g.fillRect(s, 0, 2 + rnd() * 3, ch); }
    var win = []; for (var y = 10; y < ch - 10; y += 14) for (var xx = 6; xx < cw - 8; xx += 12) if (rnd() < .5) win.push([xx, y, rnd() * 20, .4 + rnd() * .6]);
    return { x: x, w: w, h: h, cv: cv, layer: layer, ph: rnd() * 6.3, sp: .35 + rnd() * .5, win: win };
  }
  function size() {
    dpr = Math.min(devicePixelRatio || 1, 1.5); W = host.clientWidth; H = host.clientHeight; c.width = W * dpr; c.height = H * dpr;
    seed = 5; T = []; var m = W < 700;
    for (var layer = 0; layer < 2; layer++) {
      var x = -20;
      while (x < W + 20) {
        var w = (layer ? 34 : 26) + rnd() * (layer ? 70 : 50), bias = Math.min(1, Math.max(0, (x / W - .25) / .6));
        var h = H * ((layer ? .14 : .2) + rnd() * (layer ? .26 : .22) + bias * (layer ? .22 : .12)) * (m ? 1.1 : 1);
        T.push(tower(x, w, h, PAL[Math.floor(rnd() * PAL.length)], layer)); x += w + (layer ? 4 + rnd() * 18 : 2 + rnd() * 8);
      }
    }
    lift = T.map(function () { return 0; });
  }
  addEventListener('resize', size); size();
  function draw(t) {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var hz = H * (W < 700 ? .62 : .74);
    var sky = ctx.createLinearGradient(0, 0, 0, hz); sky.addColorStop(0, '#0f0b1c'); sky.addColorStop(.6, '#2a1638'); sky.addColorStop(1, '#5a2340');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, W, hz);
    var sun = ctx.createRadialGradient(W * .72, hz, 0, W * .72, hz, W * .45); sun.addColorStop(0, 'rgba(247,140,58,.45)'); sun.addColorStop(1, 'rgba(247,140,58,0)');
    ctx.fillStyle = sun; ctx.fillRect(0, 0, W, hz);
    var dusk = t < 0 ? 1 : Math.min(1, (t % 24) / 10);
    for (var i = 0; i < T.length; i++) {
      var b = T[i], near = 0;
      if (HeroPointer.active && t >= 0) { var dx = (b.x + b.w / 2) - HeroPointer.x * W; near = Math.exp(-dx * dx / (W * W * .006)); }
      lift[i] += (near - lift[i]) * .08;
      var tt = t < 0 ? 0 : t, h = b.h * (1 + .07 * Math.sin(tt * b.sp + b.ph) + .18 * lift[i]);
      var dim = b.layer ? 1 : .55, top = hz - h;
      ctx.globalAlpha = dim; ctx.drawImage(b.cv, 0, 0, b.cv.width, b.cv.height, b.x, top, b.w, h);
      if (b.layer) for (var k = 0; k < b.win.length; k++) {
        var wv = b.win[k]; if (wv[1] > h - 6) continue;
        var on = dusk * 20 > wv[2] ? wv[3] * (.75 + .25 * Math.sin(tt * 2 + k)) : 0; if (!on) continue;
        ctx.fillStyle = 'rgba(255,236,190,' + on * .55 + ')'; ctx.fillRect(b.x + wv[0] * b.w / b.cv.width, top + wv[1], 5, 3);
      }
      ctx.globalAlpha = dim * .28;
      for (var r = 0; r < h * .7; r += 4) {
        var off = Math.sin(r * .09 + tt * 1.6) * (1.5 + r * .03);
        ctx.drawImage(b.cv, 0, (r / h) * b.cv.height, b.cv.width, 4 * b.cv.height / h, b.x + off, hz + r, b.w, 4);
      }
    }
    ctx.globalAlpha = 1;
    var water = ctx.createLinearGradient(0, hz, 0, H); water.addColorStop(0, 'rgba(15,11,28,.2)'); water.addColorStop(1, 'rgba(10,8,16,.95)');
    ctx.fillStyle = water; ctx.fillRect(0, hz, W, H - hz);
    ctx.fillStyle = 'rgba(255,220,180,.35)'; ctx.fillRect(0, hz, W, 1);
  }
  HeroFX(function (dt, t) { draw(t); });
})();
