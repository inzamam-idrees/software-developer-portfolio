# Phase 21: Executive charcoal-and-gold redesign

2026-10-28. Executive presentation only. Canonical JSON, schemas, registry, routes, SEO, contact handling, Coding/Cinematic/Spatial/Prism and the active theme (Coding) are unchanged. No commit or push.

- Dark palette (#0B1014 / #151B20 / #E7B65F / #F5F1E8 / #A6B0B9 / #26323A), Playfair Display headings (self-hosted, OFL) + existing Inter body.
- Home order: hero (portrait, stats from real counts, experience card), about + quote, gold timeline, project cards, skills, education/awards, certificates, writing, résumé, contact, footer with back-to-top.
- Navigation derives from canonical content (`siteNavigation` in `presentation.mjs`); the older merged `navigation` is retained for existing tests.
- Executive copy gained keys (schema in `lib/portfolio/copy-schemas.mjs`, values in `settings/copy/executive.json`).
- Canonical headline ("Engineering with intention.") is rendered, not the mockup headline; phone number and follower counts are not shown.
- Verified: validate:content, lint, 254 unit tests, production build, no horizontal overflow at 1440/1280/1024/768/390/360, mobile menu closes on link and logo click. Other theme stylesheet hashes unchanged.
- Not run: the legacy Executive Playwright suites (they target the previous light design's markup).

## Revision 2: mockup fidelity pass

- Hero: transparent cutout portrait (`public/inzamam_profile-cutout.webp`, derived from the canonical photo by background removal only; `ExecutivePortrait` uses `<name>-cutout.webp` when present and falls back to the canonical image), handwritten note, four-row icon stat card, View Resume / Contact me, Download CV in the header.
- About: three columns (photo card with signature, copy with role tiles, quote card). Experience: rail timeline plus a code-comment card built from canonical fields. Skills: 12 icon tiles round-robin from categories, full list in a native disclosure. Education list + award cards, overlay blog cards, mountain-silhouette contact band, one-row footer.
- Animations (CSS only, off under reduced motion and the pause control): orbiting gold ring, one-shot gold shine on the accent words, drawn arrow strokes, pulsing stat icons, typewriter code lines with caret, scroll-driven timeline rail fill / dot pop / heading underline (where `animation-timeline` is supported), rotating gold conic border on card hover.
- Added Caveat (OFL) for handwritten accents. Followers/Following and phone are not in canonical data and are not shown.
- Re-verified: 254 unit tests, lint, production build, zero horizontal overflow at 1440/1280/1024/768/390/360, mobile menu closes on link and logo.
