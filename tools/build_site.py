#!/usr/bin/env python3
"""Build the website concept (site/) from src/site/*.html fragments and tools/site_data.py.

Fragments start with a <!--meta {...} --> JSON line and may use these tokens:
  {{root}}                       relative path to the repo root
  {{folio}}                      the running folio bar
  {{img:ID|alt|class|style}}     an <img> with its real width/height
  {{fig:ID|alt|caption|class|style}}  a captioned, credited figure (Fig. numbers auto-increment)
  {{feature:LISTING_ID}}         the editorial featured-property card
  {{card:LISTING_ID}}            a compact card
  {{results}}                    every listing as a search-result row
  {{markers}}                    every listing as a map price marker
  {{townhomes:TOWN}}             compact cards for one town
  {{notes:slug,slug}}            Field Notes cards
  {{valuation}}                  the oak valuation panel
  {{townoptions}}                <option> list of towns
Listing detail pages are generated from the data, one per listing, under site/homes/.
"""
import html
import json
import os
import re
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
sys.path.insert(0, HERE)
import site_data as D  # noqa: E402

SRC = os.path.join(ROOT, 'src', 'site')
OUT = os.path.join(ROOT, 'site')
BY_ID = {l['id']: l for l in D.LISTINGS}

E = html.escape


def money(n):
    return '${:,}'.format(n)


def short_money(n):
    return '${:,.0f}K'.format(n / 1000) if n < 1_000_000 else '${:.2f}M'.format(n / 1_000_000).replace('0M', 'M')


def town_line(l):
    return l['town'] + (' · ' + l['area'] if l.get('area') else '')


def attribution(l):
    if l['own']:
        return 'Listed by The Oberdorfer Team at REWAP Brokerage LLC · MLS PIN # [sample]'
    return 'Listing courtesy of [Listing Brokerage] · Data © MLS PIN, deemed reliable but not guaranteed'


SAVE_SVG = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 3.5h12v17l-6-4-6 4z"/></svg>'


def save_btn(l, cls='save'):
    return (f'<button class="{cls}" type="button" aria-pressed="false" data-save="{l["id"]}">{SAVE_SVG}'
            f'<span data-save-label>Save</span><span class="sr-only"> {E(l["street"])}</span></button>')


class Ctx:
    def __init__(self, root):
        self.root = root
        self.fig = 0

    def img(self, pid, alt, cls='', style='', loading='lazy', sizes=''):
        w, h = D.SIZE[pid]
        c = f' class="{cls}"' if cls else ''
        s = f' style="object-position:{style}"' if style else ''
        sz = f' sizes="{sizes}"' if sizes else ''
        return (f'<img src="{self.root}assets/img/{pid}.jpg" width="{w}" height="{h}" loading="{loading}" '
                f'decoding="async"{c}{s}{sz} alt="{E(alt)}">')

    def caption(self, pid, what):
        self.fig += 1
        return f'<b>Fig. {self.fig:02d}</b> — {what} Sample photograph, {E(D.CREDIT[pid])} / Unsplash.'

    def fig_html(self, pid, alt, what, cls='', style='', reveal=True, loading='lazy'):
        r = ' data-reveal' if reveal else ''
        c = f' class="{cls}"' if cls else ''
        return (f'<figure{c}{r}>{self.img(pid, alt, style=style, loading=loading)}'
                f'<figcaption class="cap">{self.caption(pid, what)}</figcaption></figure>')

    def href(self, l):
        return f'{self.root}site/homes/{l["id"]}.html'

    # ---------- listing renderers ----------
    def facts(self, l):
        return (f'<ul class="facts"><li>{l["beds"]} bd</li><li>{l["baths"]} ba</li>'
                f'<li>{l["sqft"]:,} sq ft</li>' + (f'<li>{l["lot"]}</li>' if l['lot'] != '—' else '') + '</ul>')

    def feature(self, l):
        tag = f'<span class="tag"><b>Open house</b> · {E(l["open_house"])}</span>' if l.get('open_house') else ''
        return f'''<article class="prop-feature" aria-label="{E(l['street'])}, sample listing">
  <figure class="ph" data-reveal>{self.img(l['photo'], l['alt'], style=l['pos'])}{tag}{save_btn(l)}</figure>
  <div class="info">
    <span class="sample-tag">Sample listing</span>
    <h3 class="addr"><a href="{self.href(l)}">{E(l['street'])}</a></h3>
    <p class="town" style="margin-top:-8px">{E(town_line(l))} · {E(l['kind'])}</p>
    <p class="price">{money(l['price'])}</p>
    {self.facts(l)}
    <p class="character">{E(l['character'])}</p>
    <div class="btn-row"><a class="btn" href="{self.href(l)}#showing">Request a showing</a><a class="textlink" href="{self.href(l)}">See the house</a></div>
    <p class="attr">{E(attribution(l))}</p>
  </div>
</article>'''

    def card(self, l, hl='h3'):
        oh = f'<span class="tag"><b>Open house</b> · {E(l["open_house"])}</span>' if l.get('open_house') else ''
        return f'''<article class="card">
  <figure class="ph">{self.img(l['photo'], l['alt'], style=l['pos'])}{oh}{save_btn(l)}</figure>
  <p class="town">{E(town_line(l))} · Sample</p>
  <{hl} class="addr">{E(l['street'])}</{hl}>
  <div class="price-row"><span class="price">{money(l['price'])}</span><span class="data" style="color:var(--stone)">{E(l['year'])}</span></div>
  {self.facts(l)}
  <p class="character">{E(l['character'])}</p>
  <a class="cover-link" href="{self.href(l)}"><span class="sr-only">{E(l['street'])}, {E(l['town'])}</span></a>
</article>'''

    def result(self, l):
        attr = '' if l['own'] else f'<p class="attr">{E(attribution(l))}</p>'
        return f'''<li class="result" data-id="{l['id']}" data-town="{l['town']}" data-price="{l['price']}" data-beds="{l['beds']}" data-kind="{E(l['kind'])}" data-year="{re.sub(r'[^0-9]', '', l['year'])}">
  {self.img(l['photo'], l['alt'], style=l['pos'])}
  <div><h3 class="addr"><a href="{self.href(l)}">{E(l['street'])}</a></h3><p class="town" style="margin-top:4px">{E(town_line(l))} · {E(l['kind'])}</p><ul class="facts" style="margin-top:6px"><li>{l['beds']} bd</li><li>{l['baths']} ba</li><li>{l['sqft']:,} sq ft</li><li>{E(l['year'])}</li></ul>{attr}</div>
  <div class="right"><span class="price">{money(l['price'])}</span>{save_btn(l, 'save save--line')}</div>
</li>'''

    def marker(self, l):
        x, y = l['pins']
        return (f'<a class="marker" href="{self.href(l)}" data-marker="{l["id"]}" style="left:{x}%;top:{y}%">'
                f'{short_money(l["price"])}<span class="sr-only">, {E(l["street"])}, {E(l["town"])}</span></a>')

    def valuation(self):
        return f'''<section class="panel panel--oak valuation" id="valuation" aria-labelledby="valuation-title">
  <div>
    <h2 id="valuation-title">What is your home worth?</h2>
    <p class="lead">We'll send a written range with the sales we used and what would move it, within <span class="ph-text">[turnaround to confirm]</span>. No obligation, and no automated estimate.</p>
  </div>
  <form data-lead-form data-lead-type="valuation_request" novalidate>
    <div class="field"><label for="v-addr">Home address</label><input class="input" id="v-addr" name="address" autocomplete="street-address" placeholder="Street, town" required><span class="err" hidden>Add the street and town so we can find the right sales.</span></div>
    <div class="field"><label for="v-email">Email</label><input class="input" id="v-email" name="email" type="email" autocomplete="email" required><span class="err" hidden>Add an email so we can send your range.</span></div>
    <button class="btn" type="submit">Ask what it's worth</button>
    <p class="disclose">Your request goes to The Oberdorfer Team at REWAP Brokerage LLC. We use it only to reply to you. <a class="textlink" href="#privacy">Privacy policy</a></p>
    <div class="routing" role="status" aria-live="polite"></div>
  </form>
</section>'''

    def notes(self, slugs, lead=False):
        out = []
        arts = {a['slug']: a for a in D.ARTICLES}
        for i, s in enumerate(slugs):
            a = arts[s]
            cls = 'note-card lead-note' if (lead and i == 0) else 'note-card'
            title = (f'<a href="{self.root}site/{a["href"]}">{E(a["title"])}</a>' if a['href'] else E(a['title']))
            tag = '' if a['href'] else ' · headline only'
            out.append(f'''<article class="{cls}">{self.img(a['photo'], a['alt'], style=a.get('pos', ''))}<h3>{title}</h3><p>{E(a['dek'])}</p><p class="meta">{E(a['kind'])} · {E(a['length'])} · Sample{tag}</p></article>''')
        return '<div class="notes">' + ''.join(out) + '</div>'


# ---------- page chrome ----------
NAV = [('homes', 'Homes', 'site/homes.html'), ('towns', 'Towns', 'site/shrewsbury.html'),
       ('buying', 'Buying', 'site/buying.html'), ('selling', 'Selling', 'site/selling.html'),
       ('notes', 'Field Notes', 'site/field-notes.html'), ('team', 'Team', 'site/team.html')]


def head(meta, root):
    return f'''<!doctype html>
<html lang="en" data-page="{meta['page']}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>{E(meta['title'])}</title>
<meta name="description" content="{E(meta['description'])}">
<meta name="robots" content="noindex">
<meta name="theme-color" content="#28382D">
<link rel="icon" href="{root}assets/img/favicon.svg" type="image/svg+xml">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Archivo:ital,wdth,wght@0,62..125,100..900;1,62..125,100..900&family=Inria+Serif:ital,wght@0,300;0,400;0,700;1,300;1,400;1,700&display=swap">
<link rel="stylesheet" href="{root}assets/css/site.css">
</head>
<body{' class="has-sticky"' if meta.get('sticky') else ''}>
<a class="skip" href="#main">Skip to content</a>
'''


def header(meta, root):
    cur = meta.get('nav')
    links = ''.join(
        f'<li><a href="{root}{p}"' + (' aria-current="page"' if k == cur else '') + f'>{t}</a></li>' for k, t, p in NAV)
    sheet = ''.join(
        f'<li><a href="{root}{p}"' + (' aria-current="page"' if k == cur else '') + f'>{t}<span>{d}</span></a></li>'
        for (k, t, p), d in zip(NAV, ['Search sample homes', 'Shrewsbury', 'Six steps, in order', 'Presentation and pricing', 'Local writing', 'Brandon and Kait']))
    return f'''<header class="site-head">
  <div class="site-head-in wrap">
    <a class="lockup" href="{root}site/index.html"><span class="wm">The Oberdorfer Team</span><span class="aff">at REWAP Brokerage LLC</span></a>
    <nav class="site-nav" aria-label="Main"><ul>{links}</ul></nav>
    <div class="head-actions">
      <a class="saved-link" href="{root}site/homes.html?saved=1" data-saved-link>{SAVE_SVG}<span class="word">Saved</span> <span class="count" data-saved-count>0</span><span class="sr-only"> homes</span></a>
      <a class="btn btn--line btn--sm" href="{root}site/team.html#talk">Talk with us</a>
      <button class="btn btn--line btn--sm menu-btn" type="button" aria-expanded="false" aria-controls="menu-sheet" data-menu>Menu</button>
    </div>
  </div>
  <div class="menu-sheet" id="menu-sheet" hidden>
    <nav aria-label="Main, compact"><ul>{sheet}</ul></nav>
    <a class="btn btn--plaster" href="{root}site/team.html#talk" style="justify-self:start">Talk with us</a>
  </div>
</header>
'''


def folio(meta, root):
    return f'''<div class="folio" role="navigation" aria-label="Where you are">
  <div class="folio-in wrap">
    <a class="folio-pub" href="{root}site/index.html">The Oberdorfer Team</a>
    <p class="folio-now" aria-live="polite" style="margin:0"><span class="k">{E(meta.get('folio_k', ''))}</span><span data-folio-title>{E(meta.get('folio', ''))}</span></p>
  </div>
</div>'''




def footer(root):
    return f'''<footer class="colophon" id="footer">
  <div class="wrap">
    <p class="lock-stacked" style="margin:0"><span class="wm">The Oberdorfer</span><span class="wm">Team</span><span class="aff">at REWAP Brokerage LLC</span></p>
    <div class="cols">
      <div><h2>Homes and towns</h2><ul><li><a href="{root}site/homes.html">Homes for sale</a></li><li><a href="{root}site/shrewsbury.html">Shrewsbury</a></li><li><a href="{root}site/homes.html?town=Holden">Holden</a></li><li><a href="{root}site/homes.html?town=Worcester">Worcester</a></li></ul></div>
      <div><h2>Guidance</h2><ul><li><a href="{root}site/buying.html">Buying, in order</a></li><li><a href="{root}site/selling.html">Selling, with care</a></li><li><a href="{root}site/selling.html#valuation">What is my home worth?</a></li><li><a href="{root}site/field-notes.html">Field Notes</a></li></ul></div>
      <div><h2>The team</h2><ul><li><a href="{root}site/team.html">Brandon and Kait</a></li><li><a href="{root}site/team.html#talk">Talk with us</a></li><li><a href="{root}site/team.html#join">Join the team</a></li></ul></div>
      <div><h2>Contact</h2><p>The Oberdorfer Team<br>at REWAP Brokerage LLC<br>[Phone] · [Email]<br>[Brokerage address], Worcester, MA</p></div>
    </div>
    <div class="legal" id="privacy">
      <p>The Oberdorfer Team is a team of real estate professionals affiliated with REWAP Brokerage LLC, Worcester, Massachusetts. Brokerage services are provided by REWAP Brokerage LLC. [Brokerage address] · [Phone] · [License information].</p>
      <p><span class="eho">Equal Housing Opportunity.</span> Listing information is deemed reliable but not guaranteed. [IDX disclaimer] · [Privacy policy] · [Accessibility statement]</p>
      <p>Website concept, October 2026. Every listing, price and story on this site is a labeled sample; every photograph is a credited Unsplash sample. Service commitments in the copy are proposals from the brand book until the team confirms them. <a href="{root}index.html" style="display:inline;min-height:0;font-size:12.5px;text-decoration:underline">Concept overview</a></p>
    </div>
  </div>
</footer>
<div class="toast" role="status" aria-live="polite" data-toast></div>
<script src="{root}assets/js/site.js" defer></script>
<script src="{root}assets/js/demo-nav.js" defer></script>
</body>
</html>
'''


TOKEN = re.compile(r'\{\{([a-z]+)(?::([^}]*))?\}\}')


def render(body, meta, root):
    ctx = Ctx(root)

    def sub(m):
        name, arg = m.group(1), m.group(2)
        if name == 'root':
            return root
        if name == 'folio':
            return folio(meta, root)
        if name == 'img':
            p = (arg.split('|') + ['', '', ''])[:4]
            return ctx.img(p[0], p[1], cls=p[2], style=p[3])
        if name == 'fig':
            p = (arg.split('|') + ['', '', '', ''])[:5]
            return ctx.fig_html(p[0], p[1], p[2], cls=p[3], style=p[4])
        if name == 'feature':
            return ctx.feature(BY_ID[arg])
        if name == 'card':
            return ctx.card(BY_ID[arg])
        if name == 'results':
            return '\n'.join(ctx.result(l) for l in sorted(D.LISTINGS, key=lambda l: l['price']))
        if name == 'markers':
            return '\n'.join(ctx.marker(l) for l in D.LISTINGS)
        if name == 'townlabels':
            return ''.join(f'<span class="town-label" style="left:{x}%;top:{y}%">{t}</span>' for t, (x, y) in D.TOWN_LABEL_XY.items())
        if name == 'townhomes':
            ls = [l for l in D.LISTINGS if l['town'] == arg]
            return '<div class="cards cards--2">' + ''.join(ctx.card(l) for l in ls) + '</div>'
        if name == 'notes':
            return ctx.notes(arg.split(','))
        if name == 'leadnotes':
            return ctx.notes(arg.split(','), lead=True)
        if name == 'valuation':
            return ctx.valuation()
        if name == 'townoptions':
            return ''.join(f'<option>{t}</option>' for t in D.TOWNS)
        if name == 'count':
            return str(len(D.LISTINGS))
        raise KeyError(m.group(0))

    out = TOKEN.sub(sub, body)
    # A second pass picks up tokens produced by the first (none today, kept for safety).
    return TOKEN.sub(sub, out)


def page(meta, body, root):
    return head(meta, root) + header(meta, root) + '<main id="main">\n' + render(body, meta, root) + '\n</main>\n' + footer(root)


# ---------- listing detail ----------
def detail_page(l):
    root = '../../'
    ctx = Ctx(root)
    gal = [D.INTERIORS[i] for i in l['gallery']]
    photos = [(l['photo'], l['alt'], 'Front', l['pos'])] + [(p, a, n, '') for p, a, n in gal]
    total = len(photos)
    cap_front = ctx.caption(l['photo'], 'Front of the house.')
    lb = ''.join(
        f'<figure>{ctx.img(p, a, style=pos)}<figcaption>{i + 1} of {total} · {E(n)}. Sample photograph, {E(D.CREDIT[p])} / Unsplash.'
        + (' Interior samples are not of this house.' if i else '') + '</figcaption></figure>'
        for i, (p, a, n, pos) in enumerate(photos))
    oh = f'<p class="note" style="margin:0"><b style="color:var(--brick)">Open house</b> · {E(l["open_house"])}</p>' if l.get('open_house') else ''
    others = [x for x in D.LISTINGS if x['id'] != l['id'] and (x['town'] == l['town'] or abs(x['price'] - l['price']) < 120000)][:3]
    if len(others) < 3:
        others += [x for x in D.LISTINGS if x['id'] != l['id'] and x not in others][:3 - len(others)]
    lead_attrs = (f'data-lead-form data-lead-type="showing_request" data-property-id="{l["id"]}" '
                  f'data-mls-id="[MLS PIN number]" data-agent="{"brandon-oberdorfer" if l["own"] else "team-intake"}"')
    meta = dict(page='S3' if l['id'] == D.FEATURED else 'S3x', nav='homes', sticky=True,
                title=f'{l["street"]}, {l["town"]}: sample listing · The Oberdorfer Team',
                description=f'Sample listing: {l["character"]}',
                folio_k=f'{town_line(l)} ·', folio=f'{l["street"]} · {money(l["price"])}')
    body = f'''{folio(meta, root)}
<div class="wrap" style="padding-top:clamp(12px,1.4vw,24px)">
  <div class="gallery" data-gallery>
    <figure class="main">{ctx.img(l['photo'], l['alt'], style=l['pos'], loading='eager')}<button type="button" data-open="0"><span class="sr-only">Open photo 1 of {total}</span></button></figure>
    <figure class="more">{ctx.img(gal[0][0], gal[0][1])}<button type="button" data-open="1"><span class="sr-only">Open photo 2 of {total}</span></button></figure>
    <figure class="more">{ctx.img(gal[1][0], gal[1][1])}<button type="button" data-open="2"><span class="sr-only">Open photo 3 of {total}</span></button><button class="all" type="button" data-open="0">All {total} photos</button></figure>
  </div>
  <p class="cap" style="margin-top:8px">{cap_front} Interior photographs in this gallery are samples and are not of this house.</p>
</div>
<div class="page wrap" style="padding-top:clamp(28px,3vw,48px)">
  <div class="detail">
    <div class="detail-main">
      <div class="detail-head">
        <span class="sample-tag">Sample listing</span>
        <h1 class="h1">{E(l['street'])}</h1>
        <p class="town">{E(town_line(l))} · {E(l['kind'])}</p>
        <div class="price-line"><p class="price">{money(l['price'])}</p>{save_btn(l, 'save save--line')}</div>
        {oh}
      </div>
      <dl class="fact-table">
        <div><dt>Bedrooms</dt><dd>{l['beds']}</dd></div><div><dt>Baths</dt><dd>{l['baths']}</dd></div><div><dt>Living area</dt><dd>{l['sqft']:,} ft²</dd></div><div><dt>Lot</dt><dd>{E(l['lot'])}</dd></div>
        <div><dt>Built</dt><dd>{E(l['year'])}</dd></div><div><dt>Style</dt><dd class="sm">{E(l['style'])}</dd></div><div><dt>Heat</dt><dd class="sm">{E(l['heat'])}</dd></div><div><dt>Taxes</dt><dd>{E(l['taxes'])}</dd></div>
      </dl>
      <h2 class="title">The house</h2>
      <p class="character" style="font-size:var(--fs-lead);line-height:1.4;max-width:40ch;margin:0 0 20px">{E(l['character'])}</p>
      <div class="prose">{''.join(f'<p>{E(p)}</p>' for p in l['story'])}<p class="note">Sample copy. On the real site this story is written by the team after walking the house, never generated from listing fields.</p></div>
      <h2 class="title" style="margin-top:clamp(36px,4vw,64px)">Where it is</h2>
      <div class="map map--street" role="img" aria-label="Illustrative map of a residential street in {E(l['town'])}, with a marker at the sample listing.">
        <svg class="base" viewBox="0 0 800 450" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
          <rect width="800" height="450" fill="#D9D7CF"/>
          <path d="M520 0 C 560 90, 640 120, 800 140 L 800 0 Z" fill="#B9C6BE"/>
          <path d="M0 330 C 120 300, 200 360, 330 340 S 520 300, 600 450 L 0 450 Z" fill="#C3CCB8"/>
          <g fill="none" stroke="#F2F1EE" stroke-linecap="round">
            <path d="M-10 120 C 180 140, 330 90, 520 160 S 760 240, 820 230" stroke-width="14"/>
            <path d="M300 -10 C 330 120, 380 250, 360 470" stroke-width="10"/>
            <path d="M600 -10 L 560 470" stroke-width="8"/>
            <path d="M-10 250 L 820 300" stroke-width="7"/>
            <path d="M120 -10 L 170 470" stroke-width="6"/>
          </g>
          <rect x="410" y="200" width="14" height="14" fill="#2A3136"/>
        </svg>
        <span class="marker" style="left:52%;top:44%">{short_money(l['price'])}</span>
      </div>
      <p class="cap" style="margin-top:8px">Illustrative map. Address: {E(l['street'])}, {E(l['town'])}, MA (sample).</p>
      <p class="attr" style="margin-top:28px">{E(attribution(l))}</p>
    </div>
    <aside class="detail-side" aria-label="Request a showing">
      <div class="panel panel--paper" id="showing">
        <h2 class="title" style="margin:0">Request a showing</h2>
        <form class="form-grid" style="grid-template-columns:1fr" {lead_attrs} novalidate>
          <div class="field"><label for="sh-name">Your name</label><input class="input" id="sh-name" name="name" autocomplete="name" required><span class="err" hidden>Add your name so we know who we're meeting.</span></div>
          <div class="field"><label for="sh-contact">Email or phone</label><input class="input" id="sh-contact" name="contact" autocomplete="email" required><span class="err" hidden>Add an email or phone so we can confirm a time.</span></div>
          <div class="field"><label for="sh-when">When works</label><select class="input" id="sh-when" name="when"><option>This weekend</option><option>A weekday evening</option>{'<option>The open house, ' + E(l['open_house']) + '</option>' if l.get('open_house') else ''}<option>Call me to arrange</option></select></div>
          <button class="btn" type="submit">Request a showing</button>
          <p class="disclose">Your request goes to The Oberdorfer Team at REWAP Brokerage LLC. We reply within <span class="ph-text">[response time to confirm]</span>.</p>
          <div class="routing" role="status" aria-live="polite"></div>
        </form>
      </div>
    </aside>
  </div>
</div>
<section class="wrap" style="padding-bottom:var(--page-block)" aria-labelledby="nearby">
  <div style="border-top:1px solid var(--rule);padding-top:var(--section-block)">
    <h2 class="h2" id="nearby" style="margin-bottom:clamp(24px,2.6vw,40px)">Nearby, and close in price</h2>
    <div class="cards">{''.join(ctx.card(x) for x in others)}</div>
  </div>
</section>
<div class="sticky-actions">{save_btn(l, 'save save--line')}<a class="btn" href="#showing">Request a showing</a></div>
<dialog class="lightbox" aria-label="Photographs of {E(l['street'])}" data-lightbox>
  <div class="lb-bar"><span><span class="n" data-lb-n>1</span> of {total} · {E(l['street'])} · Sample photographs</span><button class="lb-btn" type="button" data-lb-close>Close</button></div>
  <div class="lb-track-wrap"><div class="lb-track" data-lb-track>{lb}</div></div>
  <div class="lb-nav"><button class="lb-btn" type="button" data-lb-prev>Previous</button><button class="lb-btn" type="button" data-lb-next>Next</button></div>
</dialog>'''
    return page(meta, body, root)


def main():
    os.makedirs(os.path.join(OUT, 'homes'), exist_ok=True)
    os.makedirs(os.path.join(OUT, 'field-notes'), exist_ok=True)
    written = []
    for name in sorted(os.listdir(SRC)):
        if not name.endswith('.html'):
            continue
        raw = open(os.path.join(SRC, name), encoding='utf-8').read()
        m = re.match(r'\s*<!--meta (\{.*?\}) -->\n', raw, re.S)
        meta = json.loads(m.group(1))
        body = raw[m.end():]
        out_rel = meta.get('out', name)
        depth = out_rel.count('/') + 1
        root = '../' * depth
        path = os.path.join(OUT, out_rel)
        os.makedirs(os.path.dirname(path), exist_ok=True)
        open(path, 'w', encoding='utf-8').write(page(meta, body, root))
        written.append('site/' + out_rel)
    for l in D.LISTINGS:
        open(os.path.join(OUT, 'homes', l['id'] + '.html'), 'w', encoding='utf-8').write(detail_page(l))
        written.append('site/homes/' + l['id'] + '.html')
    for w in written:
        print(w)


if __name__ == '__main__':
    main()
