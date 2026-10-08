# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

Static HTML/CSS concept (self-contained, deployable to GitHub Pages, matching how the REWAP brokerage concepts were delivered). The production build is planned later as a WordPress FSE block theme with an IDX integration, hosted on Jeremy's Cloudways/DigitalOcean infrastructure; the concept's structure and tokens should translate cleanly into `theme.json` and block patterns.

## Users

Primary: home buyers and home sellers in Central Massachusetts / Worcester County looking for a trusted local residential team. Buyers arrive to explore homes and towns and to understand the buying process; sellers arrive to understand what their home is worth and how it will be presented, priced, marketed and negotiated.

Secondary: people researching a move into or within the region who are not yet actively searching — they come for community and editorial content and should find it valuable on its own.

Internal: Brandon and Kait Oberdorfer (team leads) and future agents added to the team; REWAP Brokerage as the supervising brokerage.

## Product Purpose

The consumer-facing website and brand system for The Oberdorfer Team, a residential real-estate team. It replaces a broker-hosted BoldTrail/kvCORE site that had no SEO presence and an underperforming paid-lead approach (Facebook ads, premium lead services). Success means organic discovery through genuinely useful community and editorial content, a property experience that feels considered rather than transactional, and qualified buyer/seller conversations that arrive with full routing context.

## Positioning

A local residential team brand, not a brokerage and not a portal. The Oberdorfer Team owns its brand, voice and content; REWAP Brokerage LLC remains the brokerage of record and authority. The distinction from Zillow-style portals and canned agent templates is personal guidance plus place knowledge: the site should read as people who care about homes, neighborhoods and the people moving between them.

## Operating Context

- Team structure: husband-and-wife team leads Brandon and Kait Oberdorfer; Brandon holds a Massachusetts broker license. The team operates as an affiliated team under REWAP Brokerage LLC (Worcester, MA; founder Hong Tran, a real-estate attorney, as principal broker).
- Market: Central Massachusetts first; the platform must support adding agents and expanding geographically without a rebuild.
- Shared platform: REWAP and the team may run on shared technology. Data relationships to support: Brokerage → Team → Agent, Property, Community, Lead, Article — without duplicating data. The team site searches the same property data available through REWAP while keeping its own branded front end.
- IDX/MLS: vendor-neutral adapter layer (property data, team context, brokerage attribution, saved searches, saved listings, lead routing).
- Lead routing: every conversion preserves source_site, source_page, property_id, MLS_id, team, agent, brokerage, campaign, UTM, lead_type, ready for future CRM integration.
- Jeremy is expected to design, develop, host, secure, maintain and expand the platform.

## Capabilities and Constraints

- Concept scope (brief): brand book first, then website concept — homepage editorial narrative, property presentation system (featured/compact/editorial cards, search results, detail, gallery, map, open house, saved state, showing request), community pages, buying journey, selling journey with a home-valuation path, editorial content system, mobile patterns, motion.
- Brokerage affiliation must be clear and correct wherever required (navigation, footer, agent/team bios, listings, contact forms, property attribution, legal/disclosure areas) and conspicuous where required, without the brokerage visually dominating the team brand.
- Massachusetts real-estate advertising, privacy and WCAG accessibility requirements apply (a separate compliance document was prepared for this project).
- Undecided: the editorial content program's final name; final photography source; which towns/neighborhoods launch first; IDX vendor.

## Brand Commitments

- Name: **The Oberdorfer Team** (confirmed). No existing logo — the wordmark is designed from scratch.
- Affiliation: "The Oberdorfer Team" is the consumer brand; "REWAP Brokerage LLC" is the brokerage. Never present the team as the brokerage.
- Central concept set by the client brief: "New England Editorial Home" — warmth, taste, local knowledge, calm, trust, intelligence, craft, personal guidance. Must not feel corporate, generic, luxury-for-its-own-sake, salesy, flashy, Zillow-like or like a canned REALTOR template.
- Binding exclusions from the brief: no house-roof icons, keys, location-pin logos or generic monograms; no red barns, colonial clip art, leaves-everywhere, or faux handwritten farmhouse type; no Inter, Poppins or Montserrat.

## Evidence on Hand

None yet. No headshots, bios beyond the facts above, listings, photography, testimonials, market statistics, awards or sales volumes have been supplied. Every such slot uses clearly labeled placeholder or sample data. Never fabricate testimonials, statistics, awards, transaction counts, years in business or listings presented as real.

## Product Principles

1. Guidance before capture — the site earns contact by being useful; conversion paths are present and strong but never the whole page.
2. Place is the product — communities and editorial content must stand on their own for someone not yet shopping.
3. Team brand, brokerage authority — the relationship is designed, legible and correct, never bolted on.
4. Built to grow — agents, towns and a shared REWAP data layer can be added without rework.
5. Honest by default — real data or labeled placeholders, nothing invented.

## Accessibility & Inclusion

WCAG 2.1 AA minimum across all surfaces (contrast, keyboard, screen reader, reduced motion). Fair-housing-conscious language in all community and property content: describe places and homes, not who should live there.
