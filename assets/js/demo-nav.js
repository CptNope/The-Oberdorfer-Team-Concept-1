/*
 * demo-nav.js: the "Concept pages" navigator on every page of the GitHub Pages demo.
 * It is not part of the design. It lets a reviewer move between the overview, the brand book
 * and the website concept pages, and reach the README. Set <html data-page="S1"> on each page.
 */
(function () {
  'use strict';
  if (window.top !== window) return;

  var script = document.currentScript;
  var ROOT = new URL('../../', script.src).href; // assets/js/ -> site root
  var REPO = 'https://github.com/CptNope/The-Oberdorfer-Team-Concept-1';

  var GROUPS = [
    { name: 'Overview', items: [
      { id: 'index', code: 'O', title: 'Concept overview', path: 'index.html' }
    ] },
    { name: 'Brand book', items: [
      { id: 'B1', code: 'B1', title: 'Brand Book No. 01', path: 'brand-book.html' },
      { id: 'B2', code: 'B2', title: 'Interface patterns', path: 'brand-book.html#interface' },
      { id: 'B3', code: 'B3', title: 'Affiliation and platform', path: 'brand-book.html#affiliation' }
    ] },
    { name: 'Website concept', items: [
      { id: 'S1', code: 'S1', title: 'Home', path: 'site/index.html' },
      { id: 'S2', code: 'S2', title: 'Homes for sale', path: 'site/homes.html' },
      { id: 'S3', code: 'S3', title: 'Listing · 14 Orchard Lane', path: 'site/homes/holden-14-orchard-lane.html' },
      { id: 'S4', code: 'S4', title: 'Town page · Shrewsbury', path: 'site/shrewsbury.html' },
      { id: 'S5', code: 'S5', title: 'Buying, in order', path: 'site/buying.html' },
      { id: 'S6', code: 'S6', title: 'Selling, with care', path: 'site/selling.html' },
      { id: 'S7', code: 'S7', title: 'Field Notes', path: 'site/field-notes.html' },
      { id: 'S8', code: 'S8', title: 'Article · old-house checklist', path: 'site/field-notes/old-house-checklist.html' },
      { id: 'S9', code: 'S9', title: 'Team and contact', path: 'site/team.html' },
      { id: 'S10', code: 'S10', title: 'Open houses and sign-in', path: 'site/open-houses.html' },
      { id: 'S11', code: 'S11', title: 'Saved homes', path: 'site/saved.html' },
      { id: 'S12', code: 'S12', title: 'Agents', path: 'site/agents.html' },
      { id: 'S13', code: 'S13', title: 'Agent page · Brandon Oberdorfer', path: 'site/agents/brandon-oberdorfer.html' },
      { id: 'S14', code: 'S14', title: 'Agent page template', path: 'site/agents/agent-template.html' }
    ] },
    { name: 'Platform', items: [
      { id: 'P1', code: 'P1', title: 'Lead handoff to Follow Up Boss', path: 'follow-up-boss.html' }
    ] }
  ];
  var FLAT = [];
  GROUPS.forEach(function (g) { g.items.forEach(function (it) { if (it.path.indexOf('#') === -1) FLAT.push(it); }); });

  var current = document.documentElement.getAttribute('data-page') || '';
  if (current === 'S3x') current = 'S3';
  if (current === 'S13x') current = 'S13';
  var idx = -1;
  FLAT.forEach(function (it, i) { if (it.id === current) idx = i; });
  var here = idx >= 0 ? FLAT[idx] : null;
  var prev = idx > 0 ? FLAT[idx - 1] : null;
  var next = idx >= 0 && idx < FLAT.length - 1 ? FLAT[idx + 1] : null;

  var css = [
    '.dcx{position:fixed;left:16px;bottom:16px;z-index:2147483000;font-family:Archivo,"Helvetica Neue",Arial,sans-serif;color:#E8E7E3;-webkit-font-smoothing:antialiased}',
    '.dcx *{box-sizing:border-box}',
    '.dcx-toggle{appearance:none;display:inline-flex;align-items:center;gap:10px;min-height:48px;padding:0 16px 0 12px;border:0;border-radius:0;background:#28382D;color:#E8E7E3;font:500 15px/1 Archivo,"Helvetica Neue",Arial,sans-serif;font-stretch:88%;cursor:pointer;box-shadow:0 6px 20px rgba(28,33,36,.28)}',
    '.dcx-toggle .dcx-o{display:grid;place-items:center;width:28px;height:28px;background:#E8E7E3;color:#28382D;font:400 20px/1 "Inria Serif",Georgia,serif;padding-bottom:2px}',
    '.dcx-toggle .dcx-code{font-size:13px;color:#E0937A;font-variant-numeric:tabular-nums;letter-spacing:.04em}',
    '.dcx-toggle:hover{background:#1F2D24}',
    '.dcx :focus-visible{outline:2px solid #E0937A;outline-offset:3px}',
    '.dcx-panel{position:absolute;left:0;bottom:calc(100% + 8px);width:min(372px,calc(100vw - 32px));max-height:min(660px,calc(100vh - 96px));overflow:auto;background:#28382D;border-top:3px solid #E0937A;box-shadow:0 6px 20px rgba(28,33,36,.28)}',
    '.dcx-panel[hidden]{display:none}',
    '.dcx-head{padding:16px 18px 12px;border-bottom:1px solid rgba(232,231,227,.3)}',
    '.dcx-head b{display:block;font:400 13px/1.2 "Inria Serif",Georgia,serif;letter-spacing:.3em;text-transform:uppercase;color:#E8E7E3}',
    '.dcx-head span{display:block;margin-top:7px;font-size:12px;line-height:1.4;font-stretch:88%;color:#A9B5AC}',
    '.dcx-group{padding:12px 0 4px}',
    '.dcx-group h2{margin:0;padding:0 18px 6px;font:500 12px/1 Archivo,Arial,sans-serif;font-stretch:82%;letter-spacing:.1em;text-transform:uppercase;color:#A9B5AC}',
    '.dcx-group ul{list-style:none;margin:0;padding:0}',
    '.dcx-group a{display:grid;grid-template-columns:40px 1fr;align-items:center;min-height:44px;padding:0 18px;color:#E8E7E3;text-decoration:none;font:400 15px/1.25 Archivo,Arial,sans-serif;font-stretch:92%}',
    '.dcx-group a span{font-size:12px;color:#A9B5AC;font-variant-numeric:tabular-nums}',
    '.dcx-group a:hover{background:#1F2D24}',
    '.dcx-group a[aria-current="page"]{background:#1F2D24;box-shadow:inset 3px 0 0 #E0937A}',
    '.dcx-group a[aria-current="page"] span{color:#E0937A}',
    '.dcx-foot{display:grid;grid-template-columns:1fr 1fr;border-top:1px solid rgba(232,231,227,.3)}',
    '.dcx-foot a{display:flex;flex-direction:column;justify-content:center;gap:4px;min-height:56px;padding:8px 18px;color:#E8E7E3;text-decoration:none;font:400 14px/1.2 Archivo,Arial,sans-serif;font-stretch:92%}',
    '.dcx-foot a + a{border-left:1px solid rgba(232,231,227,.3);text-align:right}',
    '.dcx-foot a small{font-size:12px;color:#A9B5AC}',
    '.dcx-foot a:hover{background:#1F2D24}',
    '.dcx-links{display:flex;flex-wrap:wrap;border-top:1px solid rgba(232,231,227,.3)}',
    '.dcx-links a{flex:1 1 50%;display:flex;align-items:center;min-height:44px;padding:0 18px;color:#E0937A;font:500 14px/1.2 Archivo,Arial,sans-serif;font-stretch:92%;text-decoration:underline;text-underline-offset:3px}',
    '.dcx-links a:hover{text-decoration-thickness:2px}',
    '@media (max-width:640px){.dcx{left:12px;bottom:12px}.dcx-toggle .dcx-label{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}}',
    '@media (max-width:900px){.has-sticky .dcx{bottom:84px}}',
    '@media print{.dcx{display:none}}'
  ].join('\n');

  function el(tag, attrs, html) {
    var n = document.createElement(tag);
    for (var k in attrs) if (attrs[k] != null) n.setAttribute(k, attrs[k]);
    if (html != null) n.innerHTML = html;
    return n;
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  function build() {
    document.head.appendChild(el('style', { 'data-dcx': '' }, css));
    var nav = el('nav', { class: 'dcx', 'aria-label': 'Concept pages' });
    var btn = el('button', { class: 'dcx-toggle', type: 'button', 'aria-expanded': 'false', 'aria-controls': 'dcx-panel' },
      '<span class="dcx-o" aria-hidden="true">O</span><span class="dcx-label">Concept pages</span>' +
      '<span class="dcx-code">' + (here ? esc(here.code) : (current === 'index' ? 'O' : '')) + '</span>');
    var panel = el('div', { class: 'dcx-panel', id: 'dcx-panel', hidden: '' });
    var h = '<div class="dcx-head"><b>The Oberdorfer Team</b><span>Brand book and website concept · October 2026 · every listing and photograph is a labeled sample</span></div>';
    GROUPS.forEach(function (g) {
      h += '<div class="dcx-group"><h2>' + esc(g.name) + '</h2><ul>';
      g.items.forEach(function (it) {
        h += '<li><a href="' + ROOT + it.path + '"' + (it.id === current ? ' aria-current="page"' : '') + '><span>' + esc(it.code) + '</span>' + esc(it.title) + '</a></li>';
      });
      h += '</ul></div>';
    });
    if (prev || next) {
      h += '<div class="dcx-foot">' +
        (prev ? '<a href="' + ROOT + prev.path + '" rel="prev"><small>Previous · ' + esc(prev.code) + '</small>' + esc(prev.title) + '</a>' : '<a href="' + ROOT + 'index.html"><small>Back to</small>Overview</a>') +
        (next ? '<a href="' + ROOT + next.path + '" rel="next"><small>Next · ' + esc(next.code) + '</small>' + esc(next.title) + '</a>' : '<a href="' + ROOT + 'index.html"><small>Back to</small>Overview</a>') +
        '</div>';
    }
    h += '<div class="dcx-links"><a href="' + REPO + '#readme">README: the full brand book</a><a href="' + REPO + '">Repository</a></div>';
    panel.innerHTML = h;
    nav.appendChild(panel);
    nav.appendChild(btn);
    document.body.appendChild(nav);

    function setOpen(open, focusBack) {
      btn.setAttribute('aria-expanded', open ? 'true' : 'false');
      if (open) { panel.removeAttribute('hidden'); var cur = panel.querySelector('[aria-current="page"]') || panel.querySelector('a'); if (cur) cur.focus(); }
      else { panel.setAttribute('hidden', ''); if (focusBack) btn.focus(); }
    }
    btn.addEventListener('click', function () { setOpen(panel.hasAttribute('hidden')); });
    nav.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !panel.hasAttribute('hidden')) { e.stopPropagation(); setOpen(false, true); } });
    document.addEventListener('click', function (e) { if (!nav.contains(e.target) && !panel.hasAttribute('hidden')) setOpen(false); });
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build);
  else build();
})();
