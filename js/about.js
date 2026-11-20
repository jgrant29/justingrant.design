/* About page: reveal on scroll, a path line that fills as you read, counters, and icons that draw in. */
(function () {
  var reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.documentElement.classList.add(reduce ? 'still' : 'anim');
  if (reduce || !('IntersectionObserver' in window)) return;
  var io = new IntersectionObserver(function (es) {
    es.forEach(function (e) {
      if (!e.isIntersecting) return; var el = e.target; el.classList.add('in'); io.unobserve(el);
      el.querySelectorAll('[data-n]').forEach(function (n) {
        var to = +n.dataset.n, suf = n.dataset.suf || '', st = performance.now();
        (function f(now) { var k = Math.min(1, (now - st) / 1400), v = Math.round(to * (1 - Math.pow(1 - k, 3)));
          n.textContent = v.toLocaleString('en-US') + suf; if (k < 1) requestAnimationFrame(f); })(st);
      });
    });
  }, { rootMargin: '0px 0px -12% 0px' });
  document.querySelectorAll('.rv').forEach(function (el) { io.observe(el); });
  var path = document.querySelector('.path');
  if (path) {
    function upd() { var r = path.getBoundingClientRect(), v = (innerHeight * .6 - r.top) / r.height; path.style.setProperty('--p', Math.max(0, Math.min(1, v)));
      path.querySelectorAll('li').forEach(function (li) { li.classList.toggle('on', li.getBoundingClientRect().top < innerHeight * .6); }); }
    addEventListener('scroll', upd, { passive: true }); addEventListener('resize', upd); upd();
  }
})();
