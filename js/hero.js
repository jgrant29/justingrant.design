/* Shared loop for animated case-study heroes: 30fps, pauses off-screen, pause button, reduced-motion still. */
window.HeroFX = function (run) {
  var btn = document.getElementById('hero-toggle'), sec = document.querySelector('.fhero');
  var reduce = matchMedia('(prefers-reduced-motion: reduce)');
  var running = !reduce.matches, vis = true, last = 0, t = 0;
  function loop(now) {
    if (!running || !vis) return; requestAnimationFrame(loop);
    if (now - last < 30) return; var dt = Math.min((now - last) / 1000, .1); last = now; t += dt; run(dt, t);
  }
  function go() { if (running && vis) { last = performance.now(); requestAnimationFrame(loop); } }
  function set(v) {
    running = v; if (btn) { btn.setAttribute('aria-pressed', v ? 'false' : 'true'); btn.setAttribute('aria-label', v ? 'Pause background animation' : 'Play background animation'); btn.classList.toggle('paused', !v); }
    go();
  }
  if (btn) btn.addEventListener('click', function () { set(!running); });
  if ('IntersectionObserver' in window && sec) new IntersectionObserver(function (es) { vis = es[0].isIntersecting; go(); }).observe(sec);
  if (reduce.matches) { if (btn) btn.hidden = true; run(0, -1); } else { run(0, 0); go(); }
  return { reduced: reduce.matches };
};
/* Lay a fixed-size scene (sw x sh) over the viewport like object-fit: cover, honouring an x/y focus (0-1). */
window.HeroCover = function (el, sw, sh, fx, fy, fxm, fym, ms) {
  function fit() {
    var W = innerWidth, H = el.parentNode.clientHeight || innerHeight, m = W < 700;
    var s = Math.max(W / sw, H / sh) * (m && ms ? ms : 1), ox = (W - sw * s) * (m && fxm != null ? fxm : fx), oy = (H - sh * s) * (m && fym != null ? fym : fy);
    el.style.transform = 'translate(' + ox + 'px,' + oy + 'px) scale(' + s + ')';
  }
  addEventListener('resize', fit); fit();
};
window.HeroPointer = { x: .7, y: .45, active: false };
addEventListener('pointermove', function (e) { if (e.clientY > innerHeight) return; HeroPointer.x = e.clientX / innerWidth; HeroPointer.y = e.clientY / innerHeight; HeroPointer.active = true; }, { passive: true });
