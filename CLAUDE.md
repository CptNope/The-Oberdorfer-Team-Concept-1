# CLAUDE.md — The Oberdorfer Team, Concept 1

Brand book concept for **The Oberdorfer Team**, a residential real-estate team in Central Massachusetts / Worcester County that operates under **REWAP Brokerage LLC**. The brand book comes first; the website (WordPress FSE block theme + IDX) is built from it later.

## Read these first

| File | What it holds |
|---|---|
| `PRODUCT.md` | Product truth: users, positioning, brand commitments, what must never be invented. |
| `DESIGN.md` | The visual system as built: tokens (named as `theme.json` slugs), type scale, components, motion, accessibility, affiliation rules. |
| `.impeccable/surfaces/index-html.md` | The brand book's direction contract and the recorded adaptations from the approved comp. |
| `.impeccable/design.json` | Machine-readable sidecar of DESIGN.md (OKLCH colors, tokens, drop-in components, theme.json mapping). |

## Layout of the repo

```
index.html            Concept overview: the GitHub Pages landing page — hand-written
brand-book.html       The brand book page; links the CSS and JS below — generated
assets/css/brand-book.css   Brand book CSS (head tokens + cover + book system) — generated
assets/js/brand-book.js     Brand book script — generated
artifact.html         Single-file brand book (inline CSS/JS) for publishing as a Claude artifact — generated
site/                 Website concept — generated:
  index.html            home (ten movements)        homes.html      search + map
  shrewsbury.html       town page                   buying.html, selling.html
  field-notes.html      editorial index             field-notes/old-house-checklist.html
  team.html             team + contact              homes/<listing-id>.html  one page per sample listing
assets/css/site.css   Website CSS (edit directly; same tokens as DESIGN.md)
assets/js/site.js     Website behavior: saved homes, menu, folio, reveals, lead forms, search, gallery
assets/js/demo-nav.js Floating "Concept pages" navigator on every page (reviewing aid; page list lives here)
src/                  Brand book source parts, edited directly:
  00-head.html          <title>, fonts, root tokens, cover (comp A) CSS
  10-book.css           book system CSS (openers, pages, components, grain)
  20-cover.html         cover markup
  30-book.html          contents spread + chapters 01–12 + colophon
  40-book.js            folio, masked reveals, save toggles, sample forms, copy buttons
src/site/             Website page bodies: a <!--meta {...} --> JSON line, then HTML with {{tokens}}
                      ({{root}}, {{folio}}, {{img:...}}, {{feature:id}}, {{card:id}}, {{results}},
                      {{markers}}, {{townhomes:Town}}, {{notes:slug,...}}, {{valuation}} ...)
assets/img/           Unsplash sample photos + paper grain textures + favicon (provenance embedded in each raster)
assets/plates/        Cover photo served to the page: WebP first, JPEG fallback
tools/build.py        Builds the book (brand-book.html, artifact.html, assets/css + js), then runs build_site.py
tools/build_site.py   Website templates: header, folio, footer, cards, result rows, listing detail pages
tools/site_data.py    Sample listings, articles, photo credits/sizes, map positions (all labeled Sample)
tools/build.sh        Wrapper for build.py
tools/stitch.py       Stitches chunked viewport captures into full-page review images
tools/split_capture.py  Splits a tall PNG into parts / joins parts back (lossless)
.impeccable/          Impeccable design-workflow state:
  config.json           buildPath: comp
  mocks/                comps A, B, C (A approved; B = contents spread structure) + prompt sidecars
  build/                comp spec, regions, measured layout scaffold, build-phase state;
                        plates/cover-photo.png is the PNG plate the comp gate reads
  review/               comp diffs, readable tiles, detector output
  review/full/          brand book full-page captures split into part-NN.png
  review/site/          website captures, desktop (d_) and mobile (m_), JPEG
  surfaces/             surface briefs with direction contracts: index-html.md (brand book), site-index-html.md (website)
```

After editing `src/`, `src/site/` or `tools/site_data.py`, run `python3 tools/build.py` (or `sh tools/build.sh`) and commit the generated files. Never edit generated files by hand. `index.html` (overview), `assets/css/site.css`, `assets/js/site.js` and `assets/js/demo-nav.js` are edited directly. When adding a page, add it to `demo-nav.js`, the overview's page list and the README's "Pages in the demo" table.

Keep individual files small: no single file over ~10 MB. Tall review captures go through `python3 tools/split_capture.py split <png> <out_dir> <height>`; rejoin with `python3 tools/split_capture.py join <dir> <out.png>`.

## Rules that must hold

- **Team ≠ brokerage.** The Oberdorfer Team is the consumer brand; REWAP Brokerage LLC is the brokerage of record. The brokerage line appears wherever the team advertises, in Archivo width 82 at 60% of the wordmark size, never below 12px on screen. REWAP is shown typographically only (no REWAP logo art).
- **Nothing invented.** No testimonials, stats, awards, transaction counts, license numbers or response-time promises. Service commitments in the copy are brand-book proposals until the team confirms them. Unknowns are bracketed placeholders like `[license #]` or `[response time to confirm]`. Listings are labeled "Sample".
- **Photography** is verified Unsplash stock, credited in every caption and marked as a sample, with a replace list in chapter 07. Every raster carries its provenance (`impeccable embed-prompt --scan assets` must report 0 missing).
- **Banned:** house-roof icons, keys, location pins as logos, generic monograms, Inter/Poppins/Montserrat, purple gradients, glassmorphism, rounded card grids, eyebrow labels above headings, fake stats.
- **Type:** Inria Serif (display + reading) and Archivo on its width axis (82 labels, 100 data, 116 prices; tabular figures). **Color:** shutter green #28382D, plaster #E8E7E3, oak #B98D5A, brick #9B3A29 spot ink; only the tested pairs in DESIGN.md. Brick is never used on green; on oak only the valuation panel's submit is brick.
- **Accessibility:** WCAG 2.1 AA; fair-housing language (describe homes and places, never who should live there).

## Workflow

Design work in this repo uses the **Impeccable** skill (`/impeccable`). PRODUCT.md and DESIGN.md are its context files; keep them current rather than creating competing docs. The world is established, so new surfaces (homepage, listing page, town page) extend it rather than starting a new direction.

## Open items (as of 2026-10-07)

- Cover photo: kept as the current stock photograph (user decision). Replace when a real Worcester County shoot happens.
- 14 Orchard Lane (flagship sample listing, book and site) uses a saturated blue colonial in noon light; the website finish review asked for a lower-sun exterior. Awaiting the user's call.
- Service commitments (answering their own phones, plans in writing, weekly written updates) need the team's confirmation.
- Paper grain on green/oak was halved after the book's last review round and has not been re-reviewed.
- Polish: cover headline ~10% under comp scale; standfirst tracking; `.ladder` labels.
- Kait Oberdorfer's role and license details, brokerage address/license block, IDX vendor and MLS disclaimer text all still need to come from the team and REWAP's principal broker.
