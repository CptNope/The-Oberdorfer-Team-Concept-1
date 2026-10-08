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
index.html            GitHub Pages entry: markup only, links the CSS and JS below — generated
assets/css/brand-book.css   All page CSS (head tokens + cover + book system) — generated
assets/js/brand-book.js     Page script — generated
artifact.html         Single-file version (inline CSS/JS) for publishing as a Claude artifact — generated
src/                  Source parts, edited directly:
  00-head.html          <title>, fonts, root tokens, cover (comp A) CSS
  10-book.css           book system CSS (openers, pages, components, grain)
  20-cover.html         cover markup
  30-book.html          contents spread + chapters 01–12 + colophon
  40-book.js            folio, masked reveals, save toggles, sample forms, copy buttons
assets/img/           Unsplash sample photos + paper grain textures (provenance embedded in each file)
assets/plates/        Cover photo served to the page: WebP first, JPEG fallback
tools/build.py        Rebuilds index.html, artifact.html and assets/css + assets/js from src/
tools/build.sh        Wrapper for build.py
tools/stitch.py       Stitches chunked viewport captures into full-page review images
tools/split_capture.py  Splits a tall PNG into parts / joins parts back (lossless)
.impeccable/          Impeccable design-workflow state:
  config.json           buildPath: comp
  mocks/                comps A, B, C (A approved; B = contents spread structure) + prompt sidecars
  build/                comp spec, regions, measured layout scaffold, build-phase state;
                        plates/cover-photo.png is the PNG plate the comp gate reads
  review/               comp diffs, readable tiles, detector output
  review/full/desktop/  full-page desktop capture split into part-NN.png (3000px each)
  review/full/mobile/   full-page mobile capture split into part-NN.png (6000px each)
  surfaces/             surface brief with the direction contract
```

After editing anything in `src/`, run `python3 tools/build.py` (or `sh tools/build.sh`) and commit all four generated files. Never edit the generated files by hand.

Keep individual files small: no single file over ~10 MB. Tall review captures go through `python3 tools/split_capture.py split <png> <out_dir> <height>`; rejoin with `python3 tools/split_capture.py join <dir> <out.png>`.

## Rules that must hold

- **Team ≠ brokerage.** The Oberdorfer Team is the consumer brand; REWAP Brokerage LLC is the brokerage of record. The brokerage line appears wherever the team advertises, in Archivo width 82 at 60% of the wordmark size, never below 12px on screen. REWAP is shown typographically only (no REWAP logo art).
- **Nothing invented.** No testimonials, stats, awards, transaction counts, license numbers or response-time promises. Unknowns are bracketed placeholders like `[license #]` or `[response time to confirm]`. Listings are labeled "Sample".
- **Photography** is verified Unsplash stock, credited in every caption and marked as a sample, with a replace list in chapter 07. Every raster carries its provenance (`impeccable embed-prompt --scan assets` must report 0 missing).
- **Banned:** house-roof icons, keys, location pins as logos, generic monograms, Inter/Poppins/Montserrat, purple gradients, glassmorphism, rounded card grids, eyebrow labels above headings, fake stats.
- **Type:** Inria Serif (display + reading) and Archivo on its width axis (82 labels, 100 data, 116 prices; tabular figures). **Color:** shutter green #28382D, plaster #E8E7E3, oak #B98D5A, brick #9B3A29 spot ink; only the tested pairs in DESIGN.md. Brick is never used on green.
- **Accessibility:** WCAG 2.1 AA; fair-housing language (describe homes and places, never who should live there).

## Workflow

Design work in this repo uses the **Impeccable** skill (`/impeccable`). PRODUCT.md and DESIGN.md are its context files; keep them current rather than creating competing docs. The world is established, so new surfaces (homepage, listing page, town page) extend it rather than starting a new direction.

## Open items (as of 2026-10-07)

- Cover photo is the closest stock match to approved comp A, not a match; the final finish review scored it partial. Decide: accept, shoot a real Worcester County house, or use a labeled generated image.
- Paper grain on green/oak was halved after the last review round and has not been re-reviewed.
- Polish: cover headline ~10% under comp scale; standfirst tracking; `.ladder` labels.
- Kait Oberdorfer's role and license details, brokerage address/license block, IDX vendor and MLS disclaimer text all still need to come from the team and REWAP's principal broker.
