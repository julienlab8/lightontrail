/* =====================================================================
   Recherche globale LIGHT ON TRAIL
   Site statique : la recherche se fait côté navigateur, à partir de
   /assets/search-index.json (généré par tools/build_md.py depuis les
   pages). Aucun service externe, aucun cookie. L'index n'est chargé
   qu'à la première ouverture du panneau.
   Déclencheurs : tout élément [data-search-open] (ex. la loupe du menu).
   ===================================================================== */
(function () {
  'use strict';

  var INDEX_URL = '/assets/search-index.json';
  var index = null;       // données chargées
  var loading = null;     // promesse de chargement
  var opener = null;      // élément qui a ouvert le panneau (pour rendre le focus)
  var overlay, input, results, hint;
  var active = -1;        // résultat surligné au clavier

  function norm(s) {
    return (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function esc(s) {
    return (s || '').toString().replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  /* ---------- Construction du panneau (une seule fois) ---------- */
  function build() {
    overlay = document.createElement('div');
    overlay.className = 'search-overlay';
    overlay.id = 'siteSearch';
    overlay.setAttribute('role', 'dialog');
    overlay.setAttribute('aria-modal', 'true');
    overlay.setAttribute('aria-label', 'Recherche sur le site');
    overlay.hidden = true;
    overlay.innerHTML =
      '<div class="search-backdrop" data-search-close></div>' +
      '<div class="search-panel">' +
        '<div class="search-bar">' +
          '<svg class="search-ico" viewBox="0 0 24 24" fill="none" aria-hidden="true"><circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"/><path d="M20 20l-3.2-3.2" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg>' +
          '<input type="search" class="search-field" id="siteSearchInput" placeholder="Rechercher sur le site\u2026" autocomplete="off" aria-label="Rechercher sur le site" />' +
          '<button type="button" class="search-close" data-search-close aria-label="Fermer la recherche"><svg viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" stroke="currentColor" stroke-width="2" stroke-linecap="round"/></svg></button>' +
        '</div>' +
        '<div class="search-results" id="siteSearchResults" role="listbox" aria-label="R\u00e9sultats de recherche"></div>' +
        '<p class="search-hint">Tapez un mot-cl\u00e9\u00a0: horaires, acc\u00e8s, h\u00e9bergement, r\u00e8glement, une course\u2026</p>' +
      '</div>';
    document.body.appendChild(overlay);

    input = overlay.querySelector('#siteSearchInput');
    results = overlay.querySelector('#siteSearchResults');
    hint = overlay.querySelector('.search-hint');

    overlay.addEventListener('click', function (e) {
      if (e.target.closest('[data-search-close]')) close();
    });
    var deb;
    input.addEventListener('input', function () {
      clearTimeout(deb);
      deb = setTimeout(run, 120);
    });
    input.addEventListener('keydown', onKey);
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && !overlay.hidden) close();
    });
  }

  /* ---------- Chargement de l'index ---------- */
  function load() {
    if (index) return Promise.resolve(index);
    if (loading) return loading;
    loading = fetch(INDEX_URL).then(function (r) { return r.json(); })
      .then(function (data) { index = data; return index; })
      .catch(function () { index = []; return index; });
    return loading;
  }

  /* ---------- Ouverture / fermeture ---------- */
  function open(trigger) {
    if (!overlay) build();
    opener = trigger || null;
    overlay.hidden = false;
    document.documentElement.classList.add('search-open');
    load().then(function () { if (input.value.trim()) run(); });
    input.focus();
    input.select();
  }
  function close() {
    if (!overlay || overlay.hidden) return;
    overlay.hidden = true;
    document.documentElement.classList.remove('search-open');
    if (opener && typeof opener.focus === 'function') opener.focus();
  }

  /* ---------- Recherche ---------- */
  function score(entry, tokens) {
    var t = norm(entry.t), d = norm(entry.d), h = norm((entry.h || []).join(' ')), b = norm(entry.b);
    var s = 0;
    for (var i = 0; i < tokens.length; i++) {
      var tok = tokens[i], hit = false;
      if (t.indexOf(tok) !== -1) { s += (t.indexOf(tok) === 0 ? 18 : 12); hit = true; }
      if (h.indexOf(tok) !== -1) { s += 6; hit = true; }
      if (d.indexOf(tok) !== -1) { s += 4; hit = true; }
      if (b.indexOf(tok) !== -1) {
        s += 1;
        var n = b.split(tok).length - 1;      // occurrences (bonus plafonné)
        s += Math.min(n, 4) * 0.5;
        hit = true;
      }
      if (!hit) return 0;                      // tous les mots doivent correspondre
    }
    return s;
  }

  function snippet(entry, tokens) {
    var src = entry.b || entry.d || '';
    var nb = norm(src), pos = -1;
    for (var i = 0; i < tokens.length; i++) {
      var p = nb.indexOf(tokens[i]);
      if (p !== -1 && (pos === -1 || p < pos)) pos = p;
    }
    if (pos === -1) pos = 0;
    var start = Math.max(0, pos - 60);
    var frag = src.slice(start, start + 170).trim();
    if (start > 0) frag = '\u2026' + frag;
    if (start + 170 < src.length) frag = frag + '\u2026';
    return highlight(frag, tokens);
  }

  function highlight(text, tokens) {
    var out = esc(text);
    tokens.forEach(function (tok) {
      if (!tok) return;
      // esc a déjà échappé le HTML ; motif tolérant aux accents pour le surlignage
      out = out.replace(new RegExp(tokLoose(tok), 'ig'), function (m) { return '<mark>' + m + '</mark>'; });
    });
    return out;
  }
  // motif tolérant aux accents (e -> [eéèêë], etc.) pour le surlignage visuel
  function tokLoose(tok) {
    var map = { a: '[aàâä]', e: '[eéèêë]', i: '[iîï]', o: '[oôö]', u: '[uùûü]', c: '[cç]' };
    return tok.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/[aeiouc]/g, function (ch) { return map[ch] || ch; });
  }

  function run() {
    var q = input.value.trim();
    active = -1;
    if (!q) { results.innerHTML = ''; hint.hidden = false; return; }
    hint.hidden = true;
    var tokens = norm(q).split(/\s+/).filter(Boolean);
    var hits = (index || []).map(function (e) { return { e: e, s: score(e, tokens) }; })
      .filter(function (x) { return x.s > 0; })
      .sort(function (a, b) { return b.s - a.s; })
      .slice(0, 8);

    if (!hits.length) {
      results.innerHTML = '<p class="search-empty">Aucun r\u00e9sultat pour \u00ab\u00a0' + esc(q) + '\u00a0\u00bb. Essayez un autre mot-cl\u00e9.</p>';
      return;
    }
    results.innerHTML = hits.map(function (x, i) {
      var e = x.e;
      var href = '/' + (e.u || '');
      return '<a class="search-hit" role="option" href="' + href + '" data-i="' + i + '" aria-selected="false">' +
        '<span class="search-hit-t">' + highlight(e.t, tokens) + '</span>' +
        '<span class="search-hit-s">' + snippet(e, tokens) + '</span>' +
      '</a>';
    }).join('');
  }

  /* ---------- Clavier ---------- */
  function onKey(e) {
    var items = results.querySelectorAll('.search-hit');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return;
      e.preventDefault();
      active += (e.key === 'ArrowDown' ? 1 : -1);
      if (active < 0) active = items.length - 1;
      if (active >= items.length) active = 0;
      items.forEach(function (it, i) {
        var on = i === active;
        it.setAttribute('aria-selected', on ? 'true' : 'false');
        it.classList.toggle('is-active', on);
        if (on) it.scrollIntoView({ block: 'nearest' });
      });
    } else if (e.key === 'Enter') {
      var target = active >= 0 && items[active] ? items[active] : items[0];
      if (target) { e.preventDefault(); window.location.href = target.getAttribute('href'); }
    }
  }

  /* ---------- Démarrage ---------- */
  function boot() {
    document.addEventListener('click', function (e) {
      var trig = e.target.closest('[data-search-open]');
      if (trig) { e.preventDefault(); open(trig); }
    });
    // précharge l'index quand la souris approche d'un déclencheur (ouverture instantanée)
    document.addEventListener('mouseover', function (e) {
      if (e.target.closest('[data-search-open]')) load();
    }, { once: true });
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
