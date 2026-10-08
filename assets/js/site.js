/* The Oberdorfer Team, website concept: shared behavior.
   Saved homes, menu, running folio, masked reveals, demo lead forms (show the routing payload,
   send nothing), search filters and map, listing gallery. */
(() => {
  'use strict';
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  /* ---------- Toast ---------- */
  const toastEl = $('[data-toast]');
  let toastTimer;
  const toast = (msg) => {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toastEl.classList.remove('show'), 1800);
  };

  /* ---------- Saved homes (per-viewer convenience; works without storage) ---------- */
  const KEY = 'oberdorfer-saved';
  let memory = [];
  const readSaved = () => {
    try { const v = JSON.parse(localStorage.getItem(KEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return memory; }
  };
  const writeSaved = (list) => {
    memory = list;
    try { localStorage.setItem(KEY, JSON.stringify(list)); } catch (e) { /* storage unavailable: keep in memory */ }
  };
  const paintSaved = () => {
    const saved = new Set(readSaved());
    $$('[data-save]').forEach((b) => {
      const on = saved.has(b.dataset.save);
      b.setAttribute('aria-pressed', String(on));
      const l = $('[data-save-label]', b);
      if (l) l.textContent = on ? 'Saved' : 'Save';
    });
    $$('[data-marker]').forEach((m) => m.classList.toggle('saved', saved.has(m.dataset.marker)));
    $$('[data-saved-count]').forEach((c) => { c.textContent = String(saved.size); });
    $$('[data-saved-link]').forEach((a) => a.classList.toggle('has', saved.size > 0));
  };
  document.addEventListener('click', (ev) => {
    const b = ev.target.closest('[data-save]');
    if (!b) return;
    ev.preventDefault();
    const id = b.dataset.save;
    const list = readSaved();
    const i = list.indexOf(id);
    if (i === -1) list.push(id); else list.splice(i, 1);
    writeSaved(list);
    paintSaved();
    toast(i === -1 ? 'Saved to your homes. Samples only.' : 'Removed from your saved homes');
    document.dispatchEvent(new CustomEvent('saved-change'));
  });
  paintSaved();

  /* ---------- Menu ---------- */
  const menuBtn = $('[data-menu]');
  const sheet = $('#menu-sheet');
  if (menuBtn && sheet) {
    const set = (open) => {
      menuBtn.setAttribute('aria-expanded', String(open));
      menuBtn.textContent = open ? 'Close' : 'Menu';
      sheet.hidden = !open;
      if (open) { const a = $('a', sheet); if (a) a.focus(); }
    };
    menuBtn.addEventListener('click', () => set(sheet.hidden));
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !sheet.hidden) { set(false); menuBtn.focus(); } });
    window.addEventListener('resize', () => { if (window.innerWidth > 1100 && !sheet.hidden) set(false); });
  }

  /* ---------- Running folio ---------- */
  const folioNow = $('.folio-now');
  const folioTitle = $('[data-folio-title]');
  const defaultTitle = folioTitle ? folioTitle.textContent : '';
  let currentTitle = defaultTitle;
  const setFolio = (t) => {
    if (!folioTitle || t === currentTitle) return;
    currentTitle = t;
    if (reduce) { folioTitle.textContent = t; return; }
    folioNow.classList.add('swap');
    setTimeout(() => { folioTitle.textContent = t; folioNow.classList.remove('swap'); }, 180);
  };
  window.__setFolio = setFolio;
  const sections = $$('[data-folio-section]');
  if (folioTitle && sections.length && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      const vis = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
      if (vis.length) setFolio(vis[0].target.dataset.folioSection);
    }, { rootMargin: '-45% 0px -50% 0px' });
    sections.forEach((s) => io.observe(s));
    window.addEventListener('scroll', () => { if (window.scrollY < 120) setFolio(defaultTitle); }, { passive: true });
  }

  /* ---------- Masked reveal: visible at rest, armed only after the first scroll ---------- */
  const reveals = $$('[data-reveal]');
  if (!reduce && reveals.length && 'IntersectionObserver' in window) {
    const rio = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { e.target.classList.add('in'); rio.unobserve(e.target); } });
    }, { threshold: 0.18 });
    window.addEventListener('scroll', () => {
      const vh = window.innerHeight;
      reveals.forEach((el) => {
        if (el.getBoundingClientRect().top > vh * 1.05) { el.classList.add('armed'); rio.observe(el); }
      });
    }, { once: true, passive: true });
  }

  /* ---------- Lead forms: validate, then show the routing payload. Nothing is sent. ---------- */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pretty = (obj) => esc(JSON.stringify(obj, null, 2))
    .replace(/^(\s*)&quot;([^&]+)&quot;:/gm, '$1<span class="k">"$2"</span>:')
    .replace(/: &quot;(.*)&quot;(,?)$/gm, ': <span class="s">"$1"</span>$2');
  const sourcePage = () => {
    const p = location.pathname;
    const i = p.indexOf('/site/');
    return (i >= 0 ? p.slice(i + 5) : p).replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
  };
  $$('[data-lead-form]').forEach((form) => {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      let ok = true;
      $$('[required]', form).forEach((input) => {
        const field = input.closest('.field');
        const err = field && $('.err', field);
        const v = input.value.trim();
        const bad = !v || (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(v));
        if (field) field.classList.toggle('error', bad);
        input.setAttribute('aria-invalid', String(bad));
        if (err) {
          err.hidden = !bad;
          err.id = err.id || ('err-' + input.id);
          if (bad) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
        }
        if (bad && ok) { input.focus(); ok = false; }
      });
      if (!ok) return;
      const btn = $('button[type="submit"]', form);
      const label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      const q = new URLSearchParams(location.search);
      const fields = {};
      new FormData(form).forEach((v, k) => { if (String(v).trim()) fields[k] = String(v).trim(); });
      const payload = {
        lead_type: form.dataset.leadType || 'general_inquiry',
        source_site: 'oberdorfer-team',
        source_page: sourcePage(),
        property_id: form.dataset.propertyId || null,
        mls_id: form.dataset.mlsId || null,
        team: 'oberdorfer-team',
        agent: form.dataset.agent || 'team-intake',
        brokerage: 'rewap-brokerage-llc',
        campaign: q.get('utm_campaign') || null,
        utm: { source: q.get('utm_source') || null, medium: q.get('utm_medium') || null },
        fields,
        submitted_at: new Date().toISOString()
      };
      const out = $('.routing', form);
      setTimeout(() => {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        if (!out) return;
        out.innerHTML = '<p><b>Nothing was sent.</b> This is a sample form. On the live site, the team\'s CRM would receive this, routed to ' +
          esc(payload.agent === 'team-intake' ? 'the team inbox' : 'Brandon') + ':</p><pre><code>' + pretty(payload) + '</code></pre>';
        out.classList.add('show');
        toast('Preview only. Nothing was sent.');
      }, reduce ? 0 : 450);
    });
  });

  /* ---------- Search: filters, sort, saved-only, map sync ---------- */
  const search = $('[data-search]');
  if (search) {
    const list = $('[data-results]');
    const rows = $$('.result', list);
    const markers = $$('[data-marker]');
    const filters = $('[data-filters]');
    const sortSel = $('[data-sort]');
    const savedOnly = $('[data-saved-only]');
    const countEl = $('[data-count]');
    const wordEl = $('[data-count-word]');
    const scopeEl = $('[data-count-scope]');
    const empty = $('[data-empty]');
    const params = new URLSearchParams(location.search);
    ['town', 'max', 'beds', 'kind'].forEach((k) => {
      const el = filters.elements[k];
      if (el && params.get(k)) el.value = params.get(k);
    });
    if (params.get('saved') === '1') savedOnly.checked = true;
    if (params.get('sort')) sortSel.value = params.get('sort');

    const apply = () => {
      const f = filters.elements;
      const town = f.town.value, max = +f.max.value || Infinity, beds = +f.beds.value || 0, kind = f.kind.value;
      const saved = new Set(readSaved());
      let n = 0;
      rows.forEach((r) => {
        const show = (!town || r.dataset.town === town) && +r.dataset.price <= max && +r.dataset.beds >= beds &&
          (!kind || r.dataset.kind === kind) && (!savedOnly.checked || saved.has(r.dataset.id));
        r.hidden = !show;
        const m = markers.find((x) => x.dataset.marker === r.dataset.id);
        if (m) m.hidden = !show;
        if (show) n++;
      });
      const [key, dir] = sortSel.value.split('-');
      const val = (r) => +r.dataset[key];
      rows.slice().sort((a, b) => (dir === 'asc' ? val(a) - val(b) : val(b) - val(a))).forEach((r) => list.appendChild(r));
      countEl.textContent = String(n);
      wordEl.textContent = n === 1 ? 'sample home' : 'sample homes';
      scopeEl.textContent = (town ? ' in ' + town : '') + (savedOnly.checked ? ', saved' : '');
      empty.classList.toggle('show', n === 0);
      const qs = new URLSearchParams();
      ['town', 'max', 'beds', 'kind'].forEach((k) => { if (f[k].value) qs.set(k, f[k].value); });
      if (savedOnly.checked) qs.set('saved', '1');
      if (sortSel.value !== 'price-asc') qs.set('sort', sortSel.value);
      history.replaceState(null, '', location.pathname + (qs.toString() ? '?' + qs : ''));
      if (window.__setFolio) window.__setFolio((town || 'All towns') + ' · ' + n + (n === 1 ? ' home' : ' homes'));
    };
    filters.addEventListener('change', apply);
    filters.addEventListener('reset', () => setTimeout(() => { savedOnly.checked = false; apply(); }, 0));
    sortSel.addEventListener('change', apply);
    savedOnly.addEventListener('change', apply);
    document.addEventListener('saved-change', () => { if (savedOnly.checked) apply(); });
    const clear = $('[data-clear]');
    if (clear) clear.addEventListener('click', () => { filters.reset(); });
    apply();

    const hot = (id, on) => {
      rows.forEach((r) => r.classList.toggle('is-hot', on && r.dataset.id === id));
      markers.forEach((m) => m.classList.toggle('is-hot', on && m.dataset.marker === id));
    };
    rows.forEach((r) => {
      r.addEventListener('mouseenter', () => hot(r.dataset.id, true));
      r.addEventListener('mouseleave', () => hot(r.dataset.id, false));
      r.addEventListener('focusin', () => hot(r.dataset.id, true));
      r.addEventListener('focusout', () => hot(r.dataset.id, false));
    });
    markers.forEach((m) => {
      m.addEventListener('mouseenter', () => hot(m.dataset.marker, true));
      m.addEventListener('mouseleave', () => hot(m.dataset.marker, false));
    });
    $$('[data-view-btn]').forEach((b) => b.addEventListener('click', () => {
      search.dataset.view = b.dataset.viewBtn;
      $$('[data-view-btn]').forEach((x) => x.setAttribute('aria-pressed', String(x === b)));
    }));
  }

  /* ---------- Gallery lightbox: photographs slide edge to edge ---------- */
  const lb = $('[data-lightbox]');
  if (lb && typeof lb.showModal === 'function') {
    const track = $('[data-lb-track]', lb);
    const figs = $$('figure', track);
    const nEl = $('[data-lb-n]', lb);
    let i = 0, opener = null;
    const go = (k) => {
      i = (k + figs.length) % figs.length;
      track.style.transform = 'translateX(' + (-100 * i) + '%)';
      nEl.textContent = String(i + 1);
      figs.forEach((f, j) => f.setAttribute('aria-hidden', String(j !== i)));
    };
    $$('[data-open]').forEach((b) => b.addEventListener('click', () => {
      opener = b;
      track.style.transition = 'none';
      go(+b.dataset.open);
      lb.showModal();
      requestAnimationFrame(() => { track.style.transition = ''; });
      $('[data-lb-next]', lb).focus();
    }));
    $('[data-lb-next]', lb).addEventListener('click', () => go(i + 1));
    $('[data-lb-prev]', lb).addEventListener('click', () => go(i - 1));
    $('[data-lb-close]', lb).addEventListener('click', () => lb.close());
    lb.addEventListener('close', () => { if (opener) opener.focus(); });
    lb.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowRight') { e.preventDefault(); go(i + 1); }
      if (e.key === 'ArrowLeft') { e.preventDefault(); go(i - 1); }
    });
    let x0 = null;
    track.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
    track.addEventListener('pointerup', (e) => {
      if (x0 === null) return;
      const dx = e.clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
    });
  }
})();
