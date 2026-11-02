# Phase 15 — Creative theme

Date: 2026-10-29
Status: **Implemented and verified locally. Not activated, not committed, not pushed.** Public active theme remains `coding`.

## Summary

Creative ("Modern & Personal") is the sixth available theme. It reproduces the owner-supplied concept screenshot (the website inside the "4 — Creative" presentation card; the outer number, title and caption are not part of the site): warm-white background, rounded white navigation bar with a colorful wordmark, centered links and a dark pill "Download CV" button, split hero with an outlined role badge, the bold "Code • Build • Innovate" headline with teal/pink separators, violet and outlined CTAs, the real portrait cut-out on a mint organic shape with violet hand-drawn strokes, blue and orange floating markers and a handwritten note, a six-item technology strip with brand logos, and "Featured Projects" with three colorful cards in one row. Lower sections continue the same system: about, experience timeline, skills, education and awards, certificates, writing, résumé preview, contact and footer.

## Files

Created:
- `themes/creative/{shell,home,projects,project,blog}.jsx`: the five lazy slots.
- `themes/creative/{view,presentation}.mjs`: canonical projection (navigation, skill groups, technology strip, featured projects). No content store.
- `themes/creative/{art,heading,icon,tech-icon,project-card,articles}.jsx`: presentation pieces and decorative SVG.
- `themes/creative/client/{navigation,desktop-navigation,portrait}.jsx`: `<details>`-based mobile menu (works without JS; closes on navigation, Escape and outside click), route-aware active link, portrait with cut-out → original → initials fallback.
- `app/css/creative.scss`: scoped stylesheet; palette map at the top.
- `portfolio-data/settings/copy/creative.json`: Creative's visible wording (theme copy, not factual content).
- `public/theme-thumbnails/creative.webp`: admin picker thumbnail (1440×900 hero, 800×500).

Modified (registration only):
- `lib/themes/{ids,registry,stylesheet-sources}.mjs`: `creative` appended in order.
- `lib/portfolio/copy-schemas.mjs` (`creativeCopySchema`), `lib/portfolio/documents.mjs` (`copy-creative`; registry now 24 documents).
- `app/admin/theme/theme-guide.jsx`: purpose text and thumbnail.
- Unit tests updated for the sixth theme and 24th document: `theme-registry`, `theme-preview`, `theme-stylesheets`, `theme-content-isolation`, `theme-copy`, `portfolio-loader`, `document-registry`, `content-store-filesystem`, `content-store-github`. The registry test previously asserted that no `creative` theme existed; that guard was removed.

Not modified: canonical `content/*.json`, `settings/theme.json`, content schemas, loader, Coding/Cinematic/Executive/Spatial/Prism code or styles.

## Content mapping

- Badge: `profile.designation` ("Senior Full Stack Engineer", the canonical value, not the reference's wording).
- Intro: copy template `I’m {name}, a {designation} with {experience} of experience.` filled from `profile` + `profile.shortIntroduction`.
- Technology strip: copy lists a preferred order (Laravel, React, Angular, Node.js, TypeScript, Python); only names present in `skills.all` render, padded from `skills.featured`.
- Featured projects: first three `featuredProjects` by `featuredOrder` (SmartCommerce, MIS / Nexis, Group Captain). The reference's "Fit2Hire" and "Portfolio (Multi-Theme)" do not exist in canonical data and are not shown.
- Skill levels, roles, traits, awards, certificates, résumé preview and contact form follow Phase 12 parity; empty data or disabled features hide sections.

## Assets

Reused: `public/inzamam_profile-cutout.webp` (derived from `profile.image`, untouched), react-icons (`si`, `fi`, `fa6`) for logos/UI icons.
Created: inline SVG wordmark mark, mint shape, violet strokes, blue/orange markers, note arrow; CSS project covers.
Fonts: Plus Jakarta Sans and Caveat (OFL) through `next/font/google`, `preload: false`, scoped to the Creative shell. No package or lockfile changes.

Placeholders / missing authentic assets:
- **No project has a screenshot** (`projects[].image` is null). Cards show abstract illustrative covers (window chrome, lines, tiles, project title), marked `aria-hidden`, not presented as product captures. Supplying `image` paths (16:9, ≥1280×720) via `/admin/content/projects` replaces them automatically.
- If the portrait or cut-out is missing, the frame shows initials.

## Verification (this session)

- `npm run validate:content`: valid.
- `node --test tests/unit/*.test.mjs`: 260 pass, 0 fail (includes no-hardcoded-copy, isolation, stylesheet ownership).
- `npx next lint`: no warnings or errors.
- `npm run build` with `PORTFOLIO_DATA_DIR` = a scratch copy whose `activeTheme` is `creative` and `PORTFOLIO_BUILD_DIR=.next-creative-build`: succeeded; `/`, `/project`, `/project/[slug]` static, `/blog` ISR.
- Production server (`next start`, port 3031, same data copy) with Playwright: no horizontal overflow at 1440/1280/1024/768/390/360; no console or page errors; mobile menu opens, closes after link navigation and on Escape; `/project`, `/project/smartcommerce-e-commerce-widgets`, `/blog` return 200 with correct `h1`; homepage HTML references no three/fiber/GSAP chunks.
- Text contrast (WCAG): muted on background 5.28:1, muted on tint 4.97:1, violet on white 6.06:1, white on violet 6.06:1, badge 7.35:1, status chips ≥4.87:1.
- Not verified in a browser: the final route-matching tweak that highlights "Projects" on `/project/*` and "Blog" on `/blog` (lint + unit tests only). Admin activation was not exercised in the browser; it relies on the unchanged registry-driven mechanism, covered by `theme-preview`/registry unit tests.

Screenshots (untracked, `artifacts/creative/`): `home-1440.png`, `home-1440-full.png`, `home-1280.png`, `home-1024.png`, `home-768.png`, `home-390.png`, `home-390-full.png`, `home-360.png`, `home-360-full.png`, `menu-390.png`, `route-project.png`, `route-project-smartcommerce-e-commerce-widgets.png`, `route-blog.png`.

## Remaining differences from the reference

- Badge wording and project titles follow canonical data, not the mock-up.
- Project covers are illustrations, not screenshots.
- The portrait is the owner's real photo (light shirt, arms crossed) instead of the reference model; crop and mint shape were tuned around it.
- Hero intro is longer (three lines) because it uses the canonical short introduction.
- Lower sections have no reference; they extend the same tokens.
- Tablet/mobile stack the portrait under the CTAs; the note may touch the portrait's arm at 360–390px without covering text or controls.

## Follow-up (2026-10-29): hero fidelity and motion

Owner feedback: the hero portrait did not match the mockup, and the theme had no animation.

Hero portrait, rebuilt to the mockup's composition (`themes/creative/art.jsx`, `app/css/creative.scss`):
- Mint/cyan gradient shape is now the reference's wide-top inverted trapezoid (was a round blob), sitting behind head and shoulders.
- Violet hand-drawn hatching scribbles in all four corners (generated rounded zig-zag paths, two back, two in front of the portrait's lower edge), replacing the thin arcs.
- Thin violet bracket arcs on both sides of the shape.
- Blue (bolt) and orange (play) markers with small tick marks above and below.
- Portrait is a bust crop of the existing cut-out with a curved lower edge (`border-radius` ellipse), not the full arms-crossed photo. Original-photo and initials fallbacks remain.
- Handwritten note moved left of the art on desktop; centered below the art on phones so it never sits on the portrait.

Motion (CSS keyframes plus one small client island, no new dependency):
- Hero entrance on load: badge, staggered headline words, intro, CTAs rise in; shape scales in then sways slowly; portrait rises; scribbles, arcs and note arrow draw in (`stroke-dashoffset` with `pathLength=1`); markers pop then bob continuously; note fades in.
- Scroll reveals via `themes/creative/client/motion.jsx` (IntersectionObserver, re-scans on route change): section headings, technology items, project and article cards (staggered by column), about text and card, experience cards with the timeline line growing and dots popping, skill groups with chip cascade, education and award items, certificates, résumé, contact columns, and the `/project` grid.
- Hover: tech icons tilt, project cover windows lift, existing card lift kept. Entrance keyframes set only `from`, so hover transforms keep working after an element appears.
- Safeguards: everything runs only when `features.animations` is on and `prefers-reduced-motion` is not `reduce`. Reveal hiding applies only under `@media (scripting: enabled)`; a 3 s CSS failsafe shows content if the island never runs. No-JS, reduced-motion and animations-off visitors see all content immediately.

Verification (this session): `npx next lint` clean; `node --test tests/unit/*.test.mjs` 260/260 (the copy scanner flagged a template-literal SVG path, replaced with `<line>` elements); `npm run build` with Creative active succeeded; on `next start` with Playwright, 41 animations run on the homepage with motion allowed, 0 animations and 0 hidden reveal elements with reduced motion emulated, all reveal elements become visible after scrolling, `/project` cards reveal, no horizontal overflow at 1440/1280/1024/768/390/360. The only console errors are `net::ERR_CERT_AUTHORITY_INVALID` from external resources (dev.to/Google Drive) in this sandboxed network. Screenshots in `artifacts/creative/` and the admin thumbnail were regenerated.

Remaining differences: the reference's scribbles are painted brush textures; these are vector strokes. The portrait is the owner's real photo (light shirt) rather than the mockup model.

## Follow-up (2026-10-29): skill icons

Owner feedback: many skill chips showed the generic `</>` glyph. `themes/creative/tech-icon.jsx` now covers all 52 canonical skills:
- Official CC0 marks from `simple-icons` (already a direct dependency, used the same way by Executive; server-rendered paths, no client JS): Material UI, PrimeNG, Google Cloud, OpenAI, Claude, Gemini, GitHub Copilot.
- Non-brand practices use descriptive Tabler glyphs: REST APIs, WebSockets, Web Scraping, CI/CD, GenAI, Agentic AI, Prompt Engineering, RAG, Vector DB, Vibe Coding.
- Cursor: no CC0 Cursor mark exists in the installed icon sets, so a neutral pointer glyph stands in. Replace it if an official mark becomes available.

Verified: lint clean, 260/260 unit tests, production build OK; on `next start`, all 52 skill chips render an icon and none fall back to the generic glyph (`artifacts/creative/skills-1280.png`).

## Follow-up (2026-10-29): active section highlight

`themes/creative/client/use-active-link.js` (shared by desktop and mobile navigation) highlights the nav item for the section under the sticky header while scrolling the home page: Home at the top, Projects in `#projects`, About from `#about` through the lower profile sections, Blog in `#writing`, Contact in `#contact` and at the page bottom. Other routes fall back to route matching (`/project*` → Projects, `/blog` → Blog). In-page highlights use `aria-current="location"`, route highlights `aria-current="page"`; the underline animates in. Scroll handling is rAF-throttled and passive.

Verified on `next start` with Playwright at 1440 and 390 px: Home → Projects → About → About (skills) → Blog (writing) → Contact → Contact (bottom); `/blog` and `/project` highlight their links; the open mobile menu marks Contact. Lint clean, 260/260 unit tests, production build OK.

Fix (same day): the highlight did not appear inside the admin preview because the hook only scroll-tracked on the literal path `/`, while previews are served at `/preview/<theme>[/blog|/project…]`. `use-active-link.js` now strips that prefix before matching, so preview and public pages behave identically. Verified: lint clean, 260/260 unit tests, production build OK, path-normalization checks for `/`, `/preview/creative`, `/preview/creative/blog`, `/preview/creative/project/<slug>`. A signed-in browser check of the preview was not possible here: Next's env loader applies the owner's `.env.local` admin hash over a test hash, and that file was not modified.
