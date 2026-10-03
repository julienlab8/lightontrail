/* =====================================================================
   Classement dynamique LIGHT ON TRAIL
   Filtres (Tous / Femmes / Hommes), recherche par nom, tri, pagination.
   S'initialise sur chaque élément [data-results] : la valeur pointe
   vers une clé de window.LOT_RESULTS (ex. "17km-2026").
   ===================================================================== */
(function () {
  'use strict';

  function norm(s) {
    return (s || '').toString().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
  function toSec(t) {
    var p = (t || '').split(':').map(Number);
    if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
    if (p.length === 2) return p[0] * 60 + p[1];
    return 0;
  }
  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) {
    return (s || '').toString().replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function init(root) {
    var key = root.getAttribute('data-results');
    var store = window.LOT_RESULTS && window.LOT_RESULTS[key];
    if (!store || !store.rows) { return; }

    var pageSize = parseInt(root.getAttribute('data-page-size'), 10) || 25;
    var all = store.rows.slice();

    var state = { sexe: 'all', cat: 'all', q: '', sort: 'clt', page: 1 };

    // catégories présentes, triées (ES, SE, M0..M9, puis autres), F et H confondus
    var catOrder = function (c) {
      var fam = c.replace(/[MF]$/, '');
      var map = { ES: 0, JU: 1, SE: 2 };
      if (fam in map) return map[fam];
      var m = fam.match(/^M(\d)$/);
      return m ? 10 + parseInt(m[1], 10) : 99;
    };
    var cats = [];
    all.forEach(function (r) { if (cats.indexOf(r.cat) === -1) cats.push(r.cat); });
    cats.sort(function (a, b) { return catOrder(a) - catOrder(b) || (a < b ? -1 : 1); });

    /* ---------- Barre d'outils ---------- */
    var toolbar = el('div', 'res-toolbar');

    var seg = el('div', 'res-seg');
    seg.setAttribute('role', 'group');
    seg.setAttribute('aria-label', 'Filtrer par sexe');
    var segDefs = [
      { v: 'all', label: 'Tous' },
      { v: 'F', label: 'Femmes' },
      { v: 'H', label: 'Hommes' }
    ];
    var segBtns = {};
    segDefs.forEach(function (d) {
      var b = el('button', 'res-seg-btn', d.label);
      b.type = 'button';
      b.setAttribute('aria-pressed', d.v === state.sexe ? 'true' : 'false');
      b.addEventListener('click', function () {
        state.sexe = d.v; state.page = 1; render();
      });
      segBtns[d.v] = b;
      seg.appendChild(b);
    });

    var search = el('div', 'res-search');
    var input = el('input');
    input.type = 'search';
    input.placeholder = 'Rechercher un nom…';
    input.setAttribute('aria-label', 'Rechercher un coureur par nom');
    input.autocomplete = 'off';
    var deb;
    input.addEventListener('input', function () {
      clearTimeout(deb);
      deb = setTimeout(function () { state.q = input.value; state.page = 1; render(); }, 150);
    });
    search.appendChild(input);

    var catWrap = el('div', 'res-sort');
    var catId = 'res-cat-' + key;
    var catLab = el('label', null, 'Catégorie');
    catLab.setAttribute('for', catId);
    var catSel = el('select');
    catSel.id = catId;
    var optAll = el('option', null, 'Toutes'); optAll.value = 'all'; catSel.appendChild(optAll);
    cats.forEach(function (c) { var o = el('option', null, c); o.value = c; catSel.appendChild(o); });
    catSel.addEventListener('change', function () { state.cat = catSel.value; state.page = 1; render(); });
    catWrap.appendChild(catLab);
    catWrap.appendChild(catSel);

    var sortWrap = el('div', 'res-sort');
    var selId = 'res-sort-' + key;
    var lab = el('label', null, 'Trier');
    lab.setAttribute('for', selId);
    var sel = el('select');
    sel.id = selId;
    [
      { v: 'clt', label: 'Classement' },
      { v: 'temps', label: 'Temps' },
      { v: 'cat', label: 'Catégorie' },
      { v: 'nom', label: 'Nom (A→Z)' }
    ].forEach(function (o) {
      var op = el('option', null, o.label); op.value = o.v; sel.appendChild(op);
    });
    sel.addEventListener('change', function () { state.sort = sel.value; state.page = 1; render(); });
    sortWrap.appendChild(lab);
    sortWrap.appendChild(sel);

    toolbar.appendChild(seg);
    toolbar.appendChild(search);
    toolbar.appendChild(catWrap);
    toolbar.appendChild(sortWrap);

    var count = el('p', 'res-count');
    count.setAttribute('aria-live', 'polite');

    /* ---------- Tableau ---------- */
    var scroll = el('div', 'res-scroll');
    var table = el('table', 'res-table');
    table.innerHTML =
      '<thead><tr>' +
      '<th scope="col" class="c-clt">Clt</th>' +
      '<th scope="col" class="c-nom">Coureur</th>' +
      '<th scope="col" class="c-cat">Cat.</th>' +
      '<th scope="col" class="c-moy">Moy.</th>' +
      '<th scope="col" class="c-tps">Temps</th>' +
      '</tr></thead><tbody></tbody>';
    var tbody = table.querySelector('tbody');
    scroll.appendChild(table);

    var pager = el('div', 'res-pager');

    root.appendChild(toolbar);
    root.appendChild(count);
    root.appendChild(scroll);
    root.appendChild(pager);

    /* ---------- Rendu ---------- */
    function compute() {
      var q = norm(state.q);
      var rows = all.filter(function (r) {
        if (state.sexe !== 'all' && r.sexe !== state.sexe) return false;
        if (state.cat !== 'all' && r.cat !== state.cat) return false;
        if (q && norm(r.nom).indexOf(q) === -1) return false;
        return true;
      });
      rows.sort(function (a, b) {
        if (state.sort === 'temps') return toSec(a.temps) - toSec(b.temps);
        if (state.sort === 'nom') return norm(a.nom) < norm(b.nom) ? -1 : 1;
        if (state.sort === 'cat') {
          if (a.cat === b.cat) return a.cltCat - b.cltCat;
          return a.cat < b.cat ? -1 : 1;
        }
        return a.clt - b.clt;
      });
      return rows;
    }

    function render() {
      Object.keys(segBtns).forEach(function (v) {
        segBtns[v].setAttribute('aria-pressed', v === state.sexe ? 'true' : 'false');
      });

      var rows = compute();
      var total = rows.length;
      var pages = Math.max(1, Math.ceil(total / pageSize));
      if (state.page > pages) state.page = pages;
      var start = (state.page - 1) * pageSize;
      var slice = rows.slice(start, start + pageSize);

      count.textContent = total
        ? total + (total > 1 ? ' coureurs' : ' coureur') + (total > pageSize ? ' · ' + (start + 1) + '–' + (start + slice.length) + ' affichés' : '')
        : 'Aucun coureur ne correspond à cette recherche.';

      tbody.innerHTML = slice.map(function (r) {
        return '<tr>' +
          '<td class="c-clt mono">' + r.clt + '</td>' +
          '<td class="c-nom"><span class="rn">' + esc(r.nom) + '</span>' +
          (r.lieu ? '<span class="rl">' + esc(r.lieu) + '</span>' : '') + '</td>' +
          '<td class="c-cat"><span class="cat-chip">' + esc(r.cat) + '</span></td>' +
          '<td class="c-moy mono">' + (r.moy ? r.moy.toFixed(2) : '') + '</td>' +
          '<td class="c-tps mono">' + esc(r.temps) + '</td>' +
          '</tr>';
      }).join('');

      renderPager(pages);
    }

    function renderPager(pages) {
      pager.innerHTML = '';
      if (pages <= 1) return;

      function btn(label, page, disabled, current) {
        var b = el('button', 'res-page' + (current ? ' is-current' : ''), label);
        b.type = 'button';
        if (disabled) b.disabled = true;
        if (current) b.setAttribute('aria-current', 'page');
        if (!disabled && !current) b.addEventListener('click', function () {
          state.page = page;
          render();
          scroll.scrollIntoView({ block: 'start', behavior: 'smooth' });
        });
        return b;
      }

      pager.appendChild(btn('‹', state.page - 1, state.page === 1));
      var win = 2, from = Math.max(1, state.page - win), to = Math.min(pages, state.page + win);
      if (from > 1) { pager.appendChild(btn('1', 1, false, state.page === 1)); if (from > 2) pager.appendChild(el('span', 'res-gap', '…')); }
      for (var p = from; p <= to; p++) pager.appendChild(btn(String(p), p, false, p === state.page));
      if (to < pages) { if (to < pages - 1) pager.appendChild(el('span', 'res-gap', '…')); pager.appendChild(btn(String(pages), pages, false, state.page === pages)); }
      pager.appendChild(btn('›', state.page + 1, state.page === pages));
    }

    render();
  }

  function boot() {
    var roots = document.querySelectorAll('[data-results]');
    for (var i = 0; i < roots.length; i++) init(roots[i]);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
