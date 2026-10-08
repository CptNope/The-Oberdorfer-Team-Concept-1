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

  /* ---------- Lead forms: validate, then show the Follow Up Boss event they would send. Nothing is sent. ----------
     Production path: the browser posts to the team's own WordPress endpoint, which adds the API key and the
     X-System headers server-side and forwards the event to POST https://api.followupboss.com/v1/events. */
  const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const pretty = (obj) => esc(JSON.stringify(obj, null, 2))
    .replace(/^(\s*)&quot;([^&]+)&quot;:/gm, '$1<span class="k">"$2"</span>:')
    .replace(/: &quot;(.*)&quot;(,?)$/gm, ': <span class="s">"$1"</span>$2');
  const FUB = {
    source: document.body.dataset.fubSource || '[team website domain]',
    system: document.body.dataset.fubSystem || 'OberdorferTeamSite'
  };
  const sourcePage = () => {
    const p = location.pathname;
    const i = p.indexOf('/site/');
    return (i >= 0 ? p.slice(i + 5) : p).replace(/\.html$/, '').replace(/\/index$/, '/') || '/';
  };
  const digits = (v) => v.replace(/\D/g, '');
  const parseJSON = (v) => { try { return JSON.parse(v); } catch (e) { return null; } };
  const PROPS = parseJSON(($('#fub-properties') || {}).textContent || 'null') || {};

  const campaign = () => {
    const q = new URLSearchParams(location.search);
    if (!q.get('utm_source')) return null; // Follow Up Boss requires campaign.source whenever campaign is sent
    const c = { source: q.get('utm_source') };
    ['medium', 'term', 'content', 'campaign'].forEach((k) => { if (q.get('utm_' + k)) c[k] = q.get('utm_' + k); });
    return c;
  };

  const validate = (form) => {
    let firstBad = null;
    const mark = (input, bad, msg) => {
      const field = input.closest('.field');
      const err = field && $('.err', field);
      if (field) field.classList.toggle('error', bad);
      input.setAttribute('aria-invalid', String(bad));
      if (err) {
        if (msg) err.textContent = msg;
        err.hidden = !bad;
        err.id = err.id || ('err-' + input.id);
        if (bad) input.setAttribute('aria-describedby', err.id); else input.removeAttribute('aria-describedby');
      }
      if (bad && !firstBad) firstBad = input;
    };
    $$('[required]', form).forEach((input) => {
      const v = input.value.trim();
      mark(input, !v || (input.type === 'email' && !/^\S+@\S+\.\S+$/.test(v)));
    });
    const email = $('input[name="email"]', form), phone = $('input[name="phone"]', form);
    if (email && phone) {
      const ev = email.value.trim(), pv = phone.value.trim();
      const emailBad = (!ev && !pv) || (ev && !/^\S+@\S+\.\S+$/.test(ev));
      mark(email, emailBad, !ev && !pv ? 'Add an email or a phone number so we can reply.' : 'Check the email address: it needs an @ and a domain.');
      mark(phone, !!pv && digits(pv).length < 10, 'Use a ten-digit phone number, or leave it blank and add an email.');
    }
    if (firstBad) firstBad.focus();
    return !firstBad;
  };

  const person = (form, f, extraTags) => {
    const p = {};
    if (f.first_name) p.firstName = f.first_name;
    if (f.last_name) p.lastName = f.last_name;
    if (f.email) p.emails = [{ value: f.email, type: 'home' }];
    if (f.phone) p.phones = [{ value: f.phone, type: 'mobile' }];
    const tags = ['Website'].concat((form.dataset.tags || '').split(',').filter(Boolean), extraTags || []);
    if (f.consent_contact === 'yes') tags.push('Call/text consent');
    p.tags = [...new Set(tags)];
    if (form.dataset.assignedTo) p.assignedTo = form.dataset.assignedTo;
    p.customBrokerage = 'REWAP Brokerage LLC';
    return p;
  };

  const describe = (form, f, extra) => {
    const lines = ['Form: ' + (form.dataset.formName || 'Website form') + ' on ' + sourcePage()];
    if (f.timing) lines.push('Timing: ' + f.timing);
    if (f.has_agent) lines.push('Working with an agent: ' + (f.has_agent === 'yes' ? 'yes' : 'not yet'));
    if (f.also_selling === 'yes') lines.push('Also thinking about selling their current home.');
    (extra || []).forEach((l) => lines.push(l));
    lines.push(f.consent_contact === 'yes'
      ? 'Call/text consent: yes, ' + new Date().toISOString() + '. Text shown: "' + (($('.consent span', form) || {}).firstChild || { textContent: '' }).textContent.trim() + '"'
      : 'Call/text consent: not given. Reply by email.');
    lines.push('Brokerage of record: REWAP Brokerage LLC. Team: The Oberdorfer Team.');
    return lines.join('\n');
  };

  const baseEvent = (type, form, f, extraTags, extraLines) => {
    const ev = { source: FUB.source, system: FUB.system, type: type };
    if (f.message) ev.message = f.message;
    ev.description = describe(form, f, extraLines);
    ev.person = person(form, f, extraTags);
    const c = campaign(); if (c) ev.campaign = c;
    ev.pageTitle = document.title;
    ev.pageUrl = 'https://' + FUB.source + sourcePage();
    if (document.referrer) ev.pageReferrer = document.referrer;
    ev.occurredAt = new Date().toISOString();
    return ev;
  };

  const buildEvents = (form) => {
    const f = {};
    new FormData(form).forEach((v, k) => { if (String(v).trim()) f[k] = String(v).trim(); });
    let type = form.dataset.fubType || 'General Inquiry';
    const tags = [];
    if (f.interest === 'buying') tags.push('Buyer');
    if (f.interest === 'selling') { type = 'Seller Inquiry'; tags.push('Seller'); }
    if (f.interest === 'both') tags.push('Buyer', 'Seller');
    if (f.interest === 'joining_team') tags.push('Agent recruit');
    if (f.interest === 'just_reading') tags.push('Nurture');
    if (type === 'Seller Inquiry') tags.push('Seller');
    if (type === 'Visited Open House') tags.push('Buyer');
    if (f.also_selling === 'yes') tags.push('Seller');

    if (type === 'Registration' && form.hasAttribute('data-saved-events')) {
      const ids = readSaved();
      const reg = baseEvent('Registration', form, f, tags.concat(['Saved homes']), ['Saved homes on this device: ' + ids.length]);
      const saved = ids.filter((id) => PROPS[id]).map((id) => {
        const e = baseEvent('Saved Property', form, f, tags);
        e.property = PROPS[id];
        delete e.message;
        e.description = 'Saved from the website before registering.';
        return e;
      });
      return [reg].concat(saved);
    }
    const ev = baseEvent(type, form, f, tags);
    const prop = parseJSON(form.dataset.fubProperty || 'null');
    if (prop) ev.property = prop;
    if (f.address) {
      const parts = f.address.split(',').map((x) => x.trim()).filter(Boolean);
      ev.property = { street: parts[0] || f.address, city: parts[1] || '', state: 'MA' };
      if (parts[2] && /\d{5}/.test(parts[2])) ev.property.code = parts[2].match(/\d{5}/)[0];
    }
    if (form.hasAttribute('data-search-form') && window.__currentSearch) ev.propertySearch = window.__currentSearch();
    return [ev];
  };

  const showEvents = (form, events) => {
    const out = $('.routing', form);
    if (!out) return;
    const body = events.length === 1 ? events[0] : events;
    const lead = events.length === 1
      ? 'a <b>' + esc(events[0].type) + '</b> event'
      : events.length + ' events (' + esc(events.map((e) => e.type).join(', ')) + '), one request each';
    out.innerHTML = '<p><b>Nothing was sent.</b> This is a sample form. On the live site, Follow Up Boss would receive ' + lead +
      ', relayed through the team\'s own server so the API key never reaches the browser:</p>' +
      '<pre class="req"><code>POST https://api.followupboss.com/v1/events\nAuthorization: Basic [API key, server-side only]\nX-System: ' + esc(FUB.system) + '\nX-System-Key: [issued when the site is registered]\nContent-Type: application/json</code></pre>' +
      '<pre><code>' + pretty(body) + '</code></pre>' +
      '<p class="note" style="margin:0">Follow Up Boss matches the person by email or phone, so a repeat visitor updates one contact instead of creating a duplicate. <a class="textlink" href="' + (document.body.dataset.root || '') + 'follow-up-boss.html">How the handoff works</a></p>';
    out.classList.add('show');
  };

  $$('[data-lead-form]').forEach((form) => {
    form.addEventListener('submit', (ev) => {
      ev.preventDefault();
      if (!validate(form)) return;
      const btn = $('button[type="submit"]', form);
      const label = btn ? btn.textContent : '';
      if (btn) { btn.disabled = true; btn.textContent = 'Sending…'; }
      const events = buildEvents(form);
      if (form.hasAttribute('data-search-form') && window.__saveSearch) window.__saveSearch();
      setTimeout(() => {
        if (btn) { btn.disabled = false; btn.textContent = label; }
        showEvents(form, events);
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
    const SKEY = 'oberdorfer-searches';
    const readSearches = () => { try { const v = JSON.parse(localStorage.getItem(SKEY) || '[]'); return Array.isArray(v) ? v : []; } catch (e) { return []; } };
    window.__currentSearch = () => {
      const f = filters.elements;
      const ps = { state: 'MA' };
      if (f.kind.value) ps.type = f.kind.value;
      if (f.town.value) ps.city = f.town.value;
      if (+f.max.value) ps.maxPrice = +f.max.value;
      if (+f.beds.value) ps.minBedrooms = +f.beds.value;
      return ps;
    };
    window.__saveSearch = () => {
      const f = filters.elements;
      const label = [f.town.value || 'All towns', +f.max.value ? 'up to $' + (+f.max.value).toLocaleString() : 'any price',
        +f.beds.value ? f.beds.value + '+ bedrooms' : 'any bedrooms', f.kind.value || 'any type'].join(' · ');
      const list = readSearches().filter((x) => x.label !== label);
      list.unshift({ label, qs: location.search });
      try { localStorage.setItem(SKEY, JSON.stringify(list.slice(0, 8))); } catch (e) { /* storage unavailable */ }
    };
    const saveBtn = $('[data-save-search-open]');
    const savePanel = $('[data-save-search-panel]');
    if (saveBtn && savePanel) {
      saveBtn.addEventListener('click', () => {
        const open = savePanel.hidden;
        savePanel.hidden = !open;
        saveBtn.setAttribute('aria-expanded', String(open));
        const lbl = $('[data-search-label]', savePanel);
        if (lbl) { const s = window.__currentSearch(); lbl.textContent = (s.city || 'All towns') + (s.maxPrice ? ', up to $' + s.maxPrice.toLocaleString() : '') + (s.minBedrooms ? ', ' + s.minBedrooms + '+ bedrooms' : '') + (s.type ? ', ' + s.type : ''); }
        if (open) { const i = $('input', savePanel); if (i) i.focus(); }
      });
    }
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

  /* ---------- Saved homes page ---------- */
  const savedWrap = $('[data-saved-cards]');
  if (savedWrap) {
    const render = () => {
      const ids = readSaved();
      let n = 0;
      $$('[data-saved-card]', savedWrap).forEach((c) => { const on = ids.includes(c.dataset.savedCard); c.hidden = !on; if (on) n++; });
      $$('[data-saved-n]').forEach((x) => { x.textContent = String(n); });
      $$('[data-saved-word]').forEach((x) => { x.textContent = n === 1 ? 'home' : 'homes'; });
      const empty = $('[data-saved-empty]');
      if (empty) empty.hidden = n > 0;
      savedWrap.hidden = n === 0;
      const reg = $('[data-saved-events]');
      if (reg) reg.closest('section').classList.toggle('is-empty', n === 0);
    };
    render();
    document.addEventListener('saved-change', render);
    const list = $('[data-saved-searches]');
    if (list) {
      let searches = [];
      try { searches = JSON.parse(localStorage.getItem('oberdorfer-searches') || '[]'); } catch (e) { searches = []; }
      if (searches.length) {
        list.innerHTML = searches.map((x) => '<li><a href="homes.html' + esc(x.qs || '') + '">' + esc(x.label) + '</a></li>').join('');
        const none = $('[data-searches-empty]'); if (none) none.hidden = true;
      }
    }
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
