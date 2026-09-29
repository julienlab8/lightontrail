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

  // Film: poster + custom play button, the YouTube player only loads on click
  (function () {
    var frame = document.querySelector('.film-frame');
    if (!frame) return;
    var btn = frame.querySelector('.film-play');
    btn.addEventListener('click', function () {
      var iframe = document.createElement('iframe');
      iframe.className = 'film-video';
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + frame.dataset.youtube + '?autoplay=1&rel=0&playsinline=1';
      iframe.title = 'Film du Trail Pierre-Percée';
      iframe.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      frame.querySelector('.film-video').replaceWith(iframe);
      frame.classList.add('playing');
    });
  })();

  // Countdown to race start (Sunday 4 April 2027, 07:30 local — départ du 54 KM***)
  (function () {
    var root = document.getElementById('countdown');
    if (!root) return;
    var target = new Date(2027, 3, 4, 7, 30, 0).getTime();
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

  // Newsletter: submit to Brevo via hidden iframe, inline confirmation
  (function () {
    var form = document.getElementById('newsForm');
    if (!form) return;
    var note = document.getElementById('newsNote');
    form.addEventListener('submit', function (e) {
      var input = form.querySelector('input[type="email"]');
      if (!input.value || !input.checkValidity()) {
        e.preventDefault();
        note.textContent = 'Entrez une adresse e-mail valide.';
        input.focus();
        return;
      }
      note.textContent = 'Merci ! Vérifiez votre boîte mail pour confirmer votre inscription.';
      setTimeout(function () { form.reset(); }, 200);
    });
  })();
