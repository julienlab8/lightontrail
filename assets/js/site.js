// Scroll reveal via IntersectionObserver (no scroll listeners)
  (function () {
    var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    var els = document.querySelectorAll('.reveal');
    if (reduce || !('IntersectionObserver' in window)) {
      els.forEach(function (e) { e.classList.add('in'); });
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { en.target.classList.add('in'); io.unobserve(en.target); }
      });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    els.forEach(function (e) { io.observe(e); });
  })();

  // Mobile nav toggle
  (function () {
    var toggle = document.getElementById('navToggle');
    var links = document.getElementById('navLinks');
    function setOpen(open) {
      links.classList.toggle('open', open);
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.setAttribute('aria-label', open ? 'Fermer le menu' : 'Ouvrir le menu');
    }
    toggle.addEventListener('click', function () {
      setOpen(!links.classList.contains('open'));
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') setOpen(false);
    });
  })();

  // Film: poster + custom play button, controls appear after first play
  (function () {
    var frame = document.querySelector('.film-frame');
    if (!frame) return;
    var video = frame.querySelector('.film-video');
    var btn = frame.querySelector('.film-play');
    btn.addEventListener('click', function () {
      video.setAttribute('controls', '');
      frame.classList.add('playing');
      video.play();
    });
  })();

  // Countdown to race start (Sunday 4 April 2027, 08:30 local)
  (function () {
    var root = document.getElementById('countdown');
    if (!root) return;
    var target = new Date(2027, 3, 4, 8, 30, 0).getTime();
    var out = {
      d: root.querySelector('[data-cd="d"]'),
      h: root.querySelector('[data-cd="h"]'),
      m: root.querySelector('[data-cd="m"]'),
      s: root.querySelector('[data-cd="s"]')
    };
    function pad(n) { return (n < 10 ? '0' : '') + n; }
    function tick() {
      var diff = Math.max(0, target - Date.now());
      var sec = Math.floor(diff / 1000);
      out.d.textContent = Math.floor(sec / 86400);
      out.h.textContent = pad(Math.floor(sec % 86400 / 3600));
      out.m.textContent = pad(Math.floor(sec % 3600 / 60));
      out.s.textContent = pad(sec % 60);
    }
    tick();
    setInterval(tick, 1000);
  })();

  // Newsletter: inline confirmation, no backend
  (function () {
    var form = document.getElementById('newsForm');
    if (!form) return;
    var note = document.getElementById('newsNote');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      var input = form.querySelector('input[type="email"]');
      if (!input.value || !input.checkValidity()) {
        note.textContent = 'Entrez une adresse e-mail valide.';
        input.focus();
        return;
      }
      form.reset();
      note.textContent = 'Merci ! Vous êtes inscrit·e à la newsletter LIGHT ON.';
    });
  })();
