---
version: 1
slug: "site-index-html"
primary_target: "site/index.html"
related_targets: ["site/homes.html","site/shrewsbury.html","site/buying.html","site/selling.html","site/field-notes.html","site/team.html"]
---

# Surface: Website concept (site/)

Scope: the demo website for The Oberdorfer Team, built from the brand book's page specs (chapters 08, 09, 12) and linked with the brand book from a root overview page. Pages: home (site/index.html), homes for sale search, listing detail (one generated page per sample listing), Shrewsbury town page, buying, selling, Field Notes index and one article, team and contact.

Visitor modes: Persuade on home, buying and selling; Operate on search and listing detail; Read on town, Field Notes and article.

Audience and job: Brandon and Kait (and later REWAP) judge whether this is the site they want to run; a buyer or seller visiting it should find homes, towns and process explained before any form.
Action: search homes, request a showing, ask what a home is worth, talk with the team. Every form is a demo: it validates, sends nothing, and shows the lead-routing payload the CRM would receive.
Proof/content: sample listings (labeled), credited Unsplash photography, real Massachusetts process facts (Offer to Purchase, P&S, attorney closings, Title 5, smoke/CO certificate, lead paint disclosure), Shrewsbury facts kept to stable geography. Market figures, bios, license numbers and response times stay bracketed placeholders.
Constraints: PRODUCT.md commitments; DESIGN.md system unchanged; REWAP typographic only; WCAG 2.1 AA; fair-housing language.

Build path: code-led (user chose "From the brand book specs"); no comps for this surface.

## Direction contract

THESIS: The website is the Quarterly's next issue. Every page opens on a colored stock band with one photograph and continues on plaster reading pages; the homepage runs as the book's ten movements. It refuses the IDX template: aerial hero with a centered search box, a twelve-card listing grid, chat bubbles and countdown banners.

OWN-WORLD: DESIGN.md as built: shutter-green and oak stocks edge to edge with paper grain, plaster pages, brick as the single spot ink, Inria Serif plus Archivo on its width axis, square corners, 2px slate rules opening every list, Fig.-numbered credited captions, price-marker maps with no pins.

STORY: A visitor understands the team is two named people at REWAP Brokerage who explain the town, the house and the process before asking for anything; they search, save, read a town, and reach a showing or valuation request that shows exactly where it would go.

FIRST VIEWPORT: Plaster header: inline lockup left, sentence-case nav right with Saved count and a line "Talk with us" button. Below, a full-bleed shutter-green band: columns 1-6 carry "Home is personal." at display scale, a lead naming Brandon and Kait at REWAP Brokerage LLC, a plaster "Start looking" button and a clay text link "Ask what your home is worth"; columns 8-12 a 4:5 autumn saltbox photograph bleeding off the right edge with a Fig. 01 caption. Directly under the band, a plaster search strip (town, price, beds, brick "Show homes").

FORM: The Quarterly extended to a new surface (seed key 459aece9, the brand book's direction); structures taken from brand book chapter 08's templates and the ten movements. Signature interaction: the running folio names the current movement, town or listing as the reader scrolls; saved homes persist across pages with a count in the header; every form reveals its lead-routing payload instead of sending.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Unresolved
- Launch towns beyond Shrewsbury (Holden, Worcester, Grafton appear as filtered searches, not town pages).
- Real listings, IDX vendor and MLS disclaimer text; portraits and bios.

## Recorded adaptations (finish review, round 1)
- Valuation submit stays brick on the oak panel: DESIGN.md's Valuation panel component specifies "a two-field form with a brick submit", the more specific rule, and the brand book does the same. The general Spot Ink Rule is otherwise kept (all text links on oak are deep ink).
- Homes for sale opens on a short green band without a photograph: it is an Operate surface and results start sooner. Team and Field Notes now use DESIGN.md's Band opener with a 32:9 strip; Shrewsbury uses the Full opener with an oak card.
- Listing pages open photography-first on plaster (DESIGN.md Property detail: full-width gallery), and the article opens on its headline (Read surface).
- 14 Orchard Lane keeps the brand book's flagship sample photograph so the book and the site show the same listing; it is on the replace-before-launch list.
- Service commitments in the copy (answering their own phones, plans in writing, weekly written updates) are the brand book's proposals; the site footer and overview say they need the team's confirmation.
