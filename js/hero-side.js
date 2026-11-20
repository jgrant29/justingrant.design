/* Side projects: a layout grid that assembles block by block, then a focus ring tabs through it. */
(function () {
  var host = document.getElementById('hero-fx'); if (!host) return;
  var SW = 2880, SH = 1620;
  var wrap = document.createElement('div'); wrap.className = 'sfx';
  wrap.style.cssText = 'position:absolute;left:0;top:0;width:' + SW + 'px;height:' + SH + 'px;transform-origin:0 0;background:radial-gradient(1500px 1200px at 72% 46%,#2e2119 0%,#17110e 55%,#0b0908 100%)';
  var B = [[100, 80, 800, 420, 'linear-gradient(135deg,#f4ede3,#d9ccb8)'], [940, 80, 360, 420, 'linear-gradient(160deg,#6b2f22,#3e1a12)'], [100, 540, 360, 360, 'linear-gradient(160deg,#6a4cf2,#32208f)'],
    [500, 540, 400, 170, 'linear-gradient(135deg,#f2b9a0,#d98b6c)'], [500, 740, 400, 160, 'linear-gradient(135deg,#1f2b44,#121a2b)'], [940, 540, 360, 360, 'linear-gradient(135deg,#e9e3f9,#c8bdf0)'], [100, 940, 1200, 160, 'linear-gradient(90deg,#2b211b,#3a2c23)']];
  var guides = ''; for (var i = 0; i < 7; i++) guides += '<div style="position:absolute;top:-200px;bottom:-200px;left:' + (100 + i * 200) + 'px;width:2px;background:rgba(255,235,210,.07)"></div>';
  wrap.innerHTML = '<div style="position:absolute;left:1380px;top:40px;width:1500px;height:1400px;perspective:3200px;transform:scale(1.1);transform-origin:95% 30%"><div class="pl" style="position:absolute;inset:0;transform-style:preserve-3d">' + guides +
    B.map(function (b) { return '<div class="blk" style="position:absolute;left:' + b[0] + 'px;top:' + b[1] + 'px;width:' + b[2] + 'px;height:' + b[3] + 'px;border-radius:28px;background:' + b[4] + ';box-shadow:0 60px 80px -30px rgba(0,0,0,.65)"></div>'; }).join('') +
    '<div class="rng" style="position:absolute;border-radius:40px;border:8px solid #ffd27a;box-shadow:0 0 60px rgba(255,210,122,.45)"></div></div></div>';
  host.appendChild(wrap); HeroCover(wrap, SW, SH, .7, .45, .75, .4);
  var pl = wrap.querySelector('.pl'), blks = wrap.querySelectorAll('.blk'), ring = wrap.querySelector('.rng');
  var order = [0, 1, 2, 3, 4, 5, 6], tilt = { x: 0, y: 0 }, rp = { x: 924, y: 524, w: 392, h: 392 };
  function ease(a, b, t) { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return 1 - Math.pow(1 - t, 3); }
  function frame(t) {
    var still = t < 0, T = still ? 99 : t;
    blks.forEach(function (el, i) { var e = ease(.25 + i * .22, .95 + i * .22, T); el.style.transform = 'translateZ(' + (260 * (1 - e)) + 'px)'; el.style.opacity = e; });
    var built = ease(2.2, 2.8, T), step = still ? 5 : order[Math.floor(Math.max(0, T - 2.8) / 1.6) % order.length], b = B[step];
    var tg = { x: b[0] - 16, y: b[1] - 16, w: b[2] + 32, h: b[3] + 32 }, k = still ? 1 : .14;
    rp.x += (tg.x - rp.x) * k; rp.y += (tg.y - rp.y) * k; rp.w += (tg.w - rp.w) * k; rp.h += (tg.h - rp.h) * k;
    ring.style.cssText += ';left:' + rp.x + 'px;top:' + rp.y + 'px;width:' + rp.w + 'px;height:' + rp.h + 'px;opacity:' + built;
    var tx = still ? 0 : (HeroPointer.active ? (HeroPointer.y - .45) * -6 : 0), tz = still ? 0 : (HeroPointer.active ? (HeroPointer.x - .7) * 8 : 0);
    tilt.x += (tx - tilt.x) * .06; tilt.y += (tz - tilt.y) * .06;
    pl.style.transform = 'rotateX(' + (52 + tilt.x) + 'deg) rotateZ(' + (-34 + tilt.y) + 'deg)';
  }
  HeroFX(function (dt, t) { frame(t); });
})();
