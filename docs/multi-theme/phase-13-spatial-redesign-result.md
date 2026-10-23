# Phase 13 — Spatial blueprint redesign

Date: 2026-10-23. Owner approved implementation, Spatial-only fonts, and these documentation updates. No commits, pushes, activation changes, dependencies, shared component edits, or canonical content edits.

## Design and implementation

The approved single-phase plan was: capture the baseline and diagnose the graph; establish tokens and fonts; rebuild the hero and section hierarchy; make every panel meaningful before JavaScript; preserve motion tiers; verify browser behavior and document evidence.

- **frontend-design:** the engineering blueprint is the signature visual, repeated across the hero, Skills, and career/project sidebars.
- **frontend-design:** large, left-aligned Space Grotesk headings and a canonical portrait anchor the hero; the graph occupies its own reserved rectangle.
- **frontend-design:** navy depth, fine cyan grid lines and restrained amber evidence labels carry the technical identity without decorative marketing claims.
- **ui-ux-pro-max:** fluid type, consistent container widths, spacing, card boundaries, readable prose and 44px controls provide the layout discipline.
- **ui-ux-pro-max:** hover, focus, selected, disabled and error styles share the same token system; the mobile navigation retains native disclosure behavior.
- **Accessibility/motion/Playwright guidance:** contrast, keyboard operation, pause/reduced-motion behavior and actual screenshots take precedence over effects.

### Palette and typography

Spatial-only CSS custom properties define ink ground `#08111f`, surface `#101f32`, raised surface `#172a40`, primary text `#edf5fc`, muted text `#afbed0`, cyan `#67e8f9`, amber `#f5c678`, and boundary `#40556b`.

Space Grotesk gives display/section headings a geometric engineering character; Inter supports long-form reading; JetBrains Mono distinguishes technologies, periods and data labels. Latin WOFF2 variable fonts are self-hosted in `public/fonts/spatial/`, restricted to 400–700 / 400–700 / 400–600 respectively, with upstream OFL licenses and source notes. Spatial alone preloads them. No `next/font` import remains in Spatial. All have `font-display: swap`.

### Components and behavior

- Hero: large canonical name, designation, headline/introduction, experience/location/focus facts, primary email and secondary canonical résumé actions, optimized priority portrait, labelled blueprint and lazy full-tier canvas.
- About: matching canonical portrait framing and readable long-form measure.
- Experience: isolated timeline cards, dates above the role body, spine markers and a populated blueprint/index sidebar.
- Skills: larger grouped controls and a server-rendered default evidence panel listing canonical projects and roles. Selection still updates related evidence and the full-tier graph.
- Projects: balanced headings/metadata, distinct cyan leading rule, problem/approach/outcome narrative and technology tags. Listing and detail routes inherit the same design.
- Education/awards/writing: editorial rules, consistent heading hierarchy and spacing. Certificates receive Spatial-scoped dark styling without changing their shared component.
- Résumé: a clean server-rendered career preview using canonical profile/experience plus the canonical résumé URL, replacing the third-party iframe. It is a career preview, not a raster or PDF reproduction of the file.
- Contact: Spatial-scoped form styles and existing labelled validation; existing shared submission logic is unchanged.
- Navigation/footer: readable controls, mobile disclosure, active-section indication, visible focus and enlarged link targets.
- Motion: CSS hero stagger, blueprint entrance/pulse, IntersectionObserver reveals and transform-based active-link indicators. Content is visible without JavaScript. Shared `portfolio-motion` pause and system reduced motion disable effects. Reduced tier uses the static SVG and loads no canvas; full tier retains the lazy existing R3F canvas. No GSAP import added.

## Baseline and Skills root cause

Before screenshots: `/tmp/spatial-phase13/before/{360,768,1024,1440}.png`; viewport diagnostic: `before/skills.png`.

The reported empty panels were reproduced in full-page captures. Experience and Projects had genuinely empty SSR side slots. Skills rendered successfully when scrolled into the live viewport in the full tier: the scene reported `full`/`ready`, and the canvas and nodes were visible. A permanently non-rendering Skills canvas was **not reproduced**.

The reproducible capture failure came from the interaction of a **single fixed, viewport-scissored canvas** with a global `html[data-spatial-scene="ready"]` CSS rule that hid **all** server SVG plans. A full-page screenshot cannot obtain offscreen draws from that fixed canvas; Skills therefore appeared empty when its fallback was hidden. Spatial now retains its labelled blueprint in every slot, independent of global canvas readiness, and side slots have server-rendered graph/index content. This changes the erroneous visibility policy rather than concealing a proven WebGL failure. The existing live renderer still runs in the full tier.

The tiny baseline portrait was confirmed. A separate black wedge beside it and live Experience text overlap were not reproduced in this checkout's baseline. Visual review caught and corrected an intermediate stretched hero portrait frame by separating it from the canvas slot.

## Verification evidence

All commands below were actually run in this session. Logs and browser scripts are in `/tmp/spatial-phase13/`.

| Check | Result |
|---|---|
| `npm run validate:content` | Passed; canonical content valid |
| `npm run lint` | Passed; no warnings/errors (Next reports its command deprecation) |
| `npm run test:unit` | 234 tests passed, 0 failed, with unrestricted Node reporting |
| Isolation/copy/Spatial contrast targeted tests | 11 tests passed, 0 failed |
| `PORTFOLIO_BUILD_DIR=.next-spatial-13-build npm run build` | Passed; optimized production build and 24 static pages generated |
| Earlier accessibility audit | No WCAG A/AA violations; axe marks some contrast checks for manual review |
| Earlier keyboard walk | 130 stops sampled, each visible and showing a solid focus outline |
| Muted contrast across surfaces | Ground 10.00:1; surface 8.78:1; raised surface 7.70:1 |
| Other-theme font requests | Public Coding page requested zero `/fonts/spatial/` resources |

The sandboxed Node runner initially reported file-level totals; the suite was rerun outside that process sandbox to obtain the 234 individual-test result. The first restricted build failed without detailed webpack diagnostics; a network-enabled build passed. An intermediate browser matrix hit an asset race: the development CSS watcher removed a hash referenced by a concurrently running production server, leaving a no-JS capture unstyled. The watcher was stopped and production was rebuilt/restarted for final verification. No registry/build pipeline changes were made for this local verification issue.

### Stable production browser results

- Full-page screenshots at **360, 768, 1024, 1440, 1920 px**, each in full tier, reduced motion, and JavaScript-disabled mode: `/tmp/spatial-phase13/after/{full,reduced,nojs}-<width>.png`.
- All 15 combinations: no horizontal overflow, exactly one h1, zero empty graph slots and no page/console/HTTP errors in the settled production matrix.
- Explicit no-WebGL check: tier `none`, zero canvases, four server blueprints and visible default Skills evidence.
- Full-tier DOM skill selection reached the scene (`tech:angular`). The full-tier rendering code ran under a simulated hardware renderer name on SwiftShader.
- Measured CLS: full **0.00212**, reduced **0.00247**. No-JS observer code cannot execute; the stored zero does **not** establish a no-JS CLS measurement.
- Production axe: **0 violations** for the WCAG A/AA tags checked; `color-contrast` includes manual-review items. The explicit muted-text checks above cover every authored surface.
- Production keyboard walk: **130 stops**, all visible, all with solid focus outlines and at least 44×44px rectangles.
- Production Coding page: **zero Spatial font requests**.
- Motion pause changes the tier to reduced/static and removes the canvas; active-section tracking reached Awards. Project listing, project detail and blog previews each rendered one h1 without horizontal overflow.
- All screenshot modes/widths were reviewed using first-viewport and section contact sheets (`after/review-*.jpg`), plus full-size hero/Skills diagnostic captures. No text/graphic overlap, stray portrait wedge, blank panels or résumé black bars were observed.

Final interaction review found that the shared admin preview intercepts click events at document capture, before the old React mobile-menu handler can run. Spatial now closes its menu from a window capture listener and supports Escape, without editing preview code. The Writing suspense fallback now supplies a heading, useful copy and the canonical dev.to profile link, so no-JS readers have a destination instead of an indefinite loading label. Final recaptures verify these two repairs: the menu open attribute is removed after following About; no-JS Writing displays its heading, explanatory copy and usable profile link. Keyboard submission of the empty form triggered two invalid inputs without sending a message.

Implementation is complete within the approved scope. Unverified items are listed below; no additional implementation phase is proposed.

## Changed files

- `app/css/spatial.scss`
- `portfolio-data/settings/copy/spatial.json`
- `themes/spatial/shell.jsx`
- `themes/spatial/client/{mobile-menu,skills-explorer,stage,wayfinding}.jsx`
- `themes/spatial/scene/palette.mjs`
- `themes/spatial/sections/{about,experience,hero,model-plan,projects,resume,writing}.jsx`
- `themes/spatial/home.jsx`
- `public/fonts/spatial/`: three WOFF2 files, three OFL license files and source notes
- This result document and the Current status entry in `CLAUDE.md`

## Limits and remaining manual checks

Headless Chromium's full tier uses a test override of the software renderer's reported name; it exercises the full-tier code on SwiftShader, not a physical GPU. Real-device GPU quality, battery use and Safari behavior remain manual. No deployment was performed. Contact delivery was not exercised, to avoid sending a message; empty-form validation was checked without delivery. The existing form requires JavaScript; the canonical email link remains usable without it. The résumé action uses the original canonical Drive URL; this phase does not verify external document availability or manufacture a download file. Fonts cover the approved Latin subset; other scripts use fallback glyphs.
