/* ALEKS: algebra tiles solve x - 1 = 4 on a loop. Loose tiles drift away from the pointer. */
(function () {
  var host = document.getElementById('hero-fx'); if (!host) return;
  var NS = 'http://www.w3.org/2000/svg', SW = 2880, SH = 1620, cx = 1890, cy = 780;
  var wrap = document.createElement('div'); wrap.style.cssText = 'position:absolute;left:0;top:0;width:' + SW + 'px;height:' + SH + 'px;transform-origin:0 0';
  wrap.innerHTML = '<svg xmlns="' + NS + '" width="' + SW + '" height="' + SH + '" viewBox="0 0 ' + SW + ' ' + SH + '"><defs>' +
    '<pattern id="ag" width="60" height="60" patternUnits="userSpaceOnUse"><path d="M60 0H0V60" fill="none" stroke="#fff" stroke-opacity=".07" stroke-width="2"/></pattern>' +
    '<radialGradient id="abg" cx=".65" cy=".45" r=".8"><stop offset="0" stop-color="#17407a"/><stop offset=".6" stop-color="#0d2547"/><stop offset="1" stop-color="#07152a"/></radialGradient>' +
    '<linearGradient id="ash" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".28"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".12"/></linearGradient>' +
    '<filter id="as"><feGaussianBlur stdDeviation="14"/></filter></defs>' +
    '<rect width="' + SW + '" height="' + SH + '" fill="url(#abg)"/><rect width="' + SW + '" height="' + SH + '" fill="url(#ag)"/>' +
    '<g id="loose"></g><g transform="translate(2250,560) scale(1.12) translate(-1890,-780)"><g id="beam"></g><g id="main"></g></g></svg>';
  host.appendChild(wrap); host.style.background = '#0b2140'; HeroCover(wrap, SW, SH, .62, .5, .8, .2, .62);
  var Y = '#ffd23f', R = '#ef4b4b', G = '#3ccf8e';
  function tile(parent, w, h, c, label) {
    var g = document.createElementNS(NS, 'g');
    g.innerHTML = '<rect x="' + (-w / 2 + 8) + '" y="' + (-h / 2 + 14) + '" width="' + w + '" height="' + h + '" rx="10" fill="#000" opacity=".35" filter="url(#as)"/>' +
      '<rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="10" fill="' + c + '"/><rect x="' + (-w / 2) + '" y="' + (-h / 2) + '" width="' + w + '" height="' + h + '" rx="10" fill="url(#ash)"/>' +
      (label ? '<text x="0" y="16" text-anchor="middle" font-family="Georgia,serif" font-size="48" fill="#0b1f3a" opacity=".85">' + label + '</text>' : '');
    parent.appendChild(g); return g;
  }
  var main = wrap.querySelector('#main'), beam = wrap.querySelector('#beam'), loose = wrap.querySelector('#loose');
  beam.innerHTML = '<path d="M' + (cx - 700) + ' ' + (cy + 250) + 'H' + (cx + 430) + '" stroke="#fff" stroke-opacity=".5" stroke-width="6" stroke-linecap="round"/>' +
    '<path d="M' + (cx - 100) + ' ' + (cy + 250) + 'l-70 120h140z" fill="#fff" fill-opacity=".5"/>' +
    '<text x="' + (cx - 60) + '" y="' + (cy + 20) + '" text-anchor="middle" font-family="Georgia,serif" font-size="120" fill="#fff" opacity=".9">=</text>';
  var ans = document.createElementNS(NS, 'text'); ans.setAttribute('x', cx - 100); ans.setAttribute('y', cy - 250); ans.setAttribute('text-anchor', 'middle');
  ans.setAttribute('font-family', 'Georgia,serif'); ans.setAttribute('font-size', '110'); ans.setAttribute('fill', '#fff'); ans.textContent = 'x = 5'; beam.appendChild(ans);
  function place(g, x, y, r, o, s) { g.setAttribute('transform', 'translate(' + x + ',' + y + ') rotate(' + r + ') scale(' + (s || 1) + ')'); g.setAttribute('opacity', o); }
  var X = tile(main, 130, 330, G, 'x'), N1 = tile(main, 110, 110, R, '−1'), P1 = tile(main, 110, 110, Y, '1'), P2 = tile(main, 110, 110, Y, '1');
  var ones = [[120, -110, -3], [250, -90, 4], [120, 40, 2], [255, 55, -6]].map(function (a) { var g = tile(main, 110, 110, Y, '1'); g.d = a; return g; });
  var looseT = [[1260, 300, Y, 90, 90, 18], [2650, 330, R, 90, 90, -14], [2700, 1240, G, 100, 250, 22], [1380, 1300, Y, 90, 90, -20], [2300, 1380, R, 90, 90, 12], [2580, 700, Y, 80, 80, 30]].map(function (a) {
    var g = tile(loose, a[3], a[4], a[2]); g.b = a; g.dx = 0; g.dy = 0; return g;
  });
  function ease(a, b, t) { t = Math.max(0, Math.min(1, (t - a) / (b - a))); return t * t * (3 - 2 * t); }
  function frame(t) {
    var L = 9, p = t < 0 ? 5.2 : t % L;
    place(X, cx - 520, cy, -4, 1);
    var drop1 = ease(1.2, 2.2, p), drop2 = ease(1.6, 2.6, p), zero = ease(3.2, 4.2, p), reset = ease(7.6, 8.6, p);
    place(N1, cx - 330, cy - 60, 6, 1 - zero * (1 - reset), 1 - .4 * zero * (1 - reset));
    place(P1, cx - 330, cy + 80 - 380 * (1 - drop1), -5, drop1 * (1 - zero) * (1 - reset) + 0, 1 - .4 * zero);
    place(P2, cx + 385, cy - 20 - 380 * (1 - drop2), 5, drop2 * (1 - reset));
    ones.forEach(function (g) { place(g, cx + g.d[0], cy + g.d[1], g.d[2], 1); });
    ans.setAttribute('opacity', ease(4.4, 5.2, p) * (1 - reset));
    var px = (HeroPointer.x - 0) , py = HeroPointer.y;
    looseT.forEach(function (g, i) {
      var b = g.b, sx = b[0], sy = b[1], vx = 0, vy = 0;
      if (HeroPointer.active && t >= 0) {
        var r = wrap.getBoundingClientRect(), s = r.width / SW, gx = r.left + sx * s, gy = r.top + sy * s;
        var dx = gx - HeroPointer.x * innerWidth, dy = gy - HeroPointer.y * innerHeight, d = Math.hypot(dx, dy) || 1, f = Math.max(0, 1 - d / 260);
        vx = dx / d * f * 140; vy = dy / d * f * 140;
      }
      g.dx += (vx - g.dx) * .08; g.dy += (vy - g.dy) * .08;
      var bob = t >= 0 ? Math.sin(t * .8 + i) * 8 : 0;
      place(g, sx + g.dx, sy + g.dy + bob, b[5] + (t >= 0 ? Math.sin(t * .5 + i) * 4 : 0), 1);
    });
  }
  HeroFX(function (dt, t) { frame(t); });
})();
