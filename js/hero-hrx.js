/* hrsimple: a slow camera drift across the painted skyline, with gentle pointer parallax. */
(function () {
  var img = document.querySelector('.fhero .bgimg img'); if (!img) return;
  var p = { x: 0, y: 0 };
  HeroFX(function (dt, t) {
    var T = t < 0 ? 0 : t, dx = Math.sin(T * .06) * 2.2, dy = Math.cos(T * .045) * 1.2;
    var tx = HeroPointer.active && t >= 0 ? (HeroPointer.x - .5) * -1.6 : 0, ty = HeroPointer.active && t >= 0 ? (HeroPointer.y - .5) * -1.2 : 0;
    p.x += (tx - p.x) * .05; p.y += (ty - p.y) * .05;
    img.style.transform = 'scale(1.1) translate(' + (dx + p.x) + '%,' + (dy + p.y) + '%)';
  });
})();
