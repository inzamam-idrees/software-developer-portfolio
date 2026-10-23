# Phase 14 — Spatial editorial redesign: review checkpoint

Date: 2026-10-23. **In progress; stopped at the owner’s mandatory review gate.** This is not a completed-phase report.

## Scope and preservation

The owner rejected Phase 13’s visual direction and authorized a replacement, while retaining its working engineering. The pre-existing uncommitted Phase 13 working copy was preserved at `/tmp/spatial-phase14/phase13-working-copy.tar.gz` before editing. No commits, pushes, activation changes, package installs, canonical content changes, or other-theme/shared-component edits were made.

## Design decisions

- **frontend-design:** warm neutral near-black replaces navy; chartreuse replaces cyan. The hero relies on the canonical portrait and large typography, with the graph behind the portrait as a supporting layer.
- **frontend-design:** Inter Tight supplies compact display shapes; Fraunces italic provides the requested serif accents while remaining a Latin variable WOFF2 face. Inter supports prose; JetBrains Mono is limited to labels and dates.
- **frontend-design:** open project narratives alternate sides around large deterministic architecture visuals. The visuals use each canonical slug/stack; they are not product screenshots.
- **ui-ux-pro-max:** a 1280px/12-column foundation, fluid scale, 17–18px body text, 40–64px section headings, 64–120px hero name, and 44px minimum controls set the hierarchy.
- **ui-ux-pro-max:** consistent surfaces, 24px radii, hairline structural borders, stronger control outlines, visible focus, selected navigation and responsive layout protect usability.
- **Accessibility/motion/performance/Playwright guidance:** only transform/opacity motion, server-visible content, shared pause/reduced preferences, actual screenshot review, contrast and copy-isolation checks govern the implementation.

The design-system search returned an unsuitable FAQ/documentation layout even after a narrower retry. Its stylistic suggestions were not adopted; the owner’s editorial brief and directly applicable accessibility/layout rules took precedence.

### Tokens and fonts

Base `#0B0C0E`; surfaces `#121316` and `#181A1E`; text `#F4F4F2`; muted text `#B0B1B6`; accent `#D4FF3F`; hairlines white at 9%; control boundary `#73767C`; cool neutral graph edges `#A7AFBA`.

Muted text contrast: **9.14:1**, **8.68:1**, **8.14:1** across base/surface/raised surface. Primary text and accent also exceed AA on all three.

Spatial-only font files and OFL licenses live under `public/fonts/spatial/`. Inter Tight replaces Space Grotesk, whose unused file/license were removed after backup. Inter/JetBrains Mono remain from Phase 13. Fraunces italic replaces the example Instrument Serif because it provides a variable Latin face. Existing cached FontTools restricted weights; no dependency was added. Font display is swap; only the critical Inter Tight/Inter faces preload from Spatial’s shell.

## Implemented before the gate

- New token/type/layout foundation and clean replacement stylesheet, rather than another layer of Phase 13 overrides.
- Floating centered navigation pill, primary Contact action, native accessible mobile disclosure, motion toggle and transform-based scroll-progress hairline.
- Canonical hero: large name, refined serif headline accent, introduction, two CTAs, experience/role/project counts, large optimized priority portrait and canonical technology strip.
- Transform-based numeric reels count canonical totals on first view. Pausing/removing motion restores the original server-rendered values. The technology strip pauses on hover and follows the shared motion preference.
- Wide project features with indices, visual headers, alternating composition, canonical narratives, tags, project-detail actions and pointer-fine spotlight behavior.
- Phase 13’s SSR graph visibility fix and full/reduced/no-3D tier logic retained. Scene colors follow the new palette.

A featured project lacks canonical problem/approach/outcome fields. Explicit copy-backed `[TODO: ...]` placeholders appear for those missing fields. No narratives or outcome claims were invented.

### Self-critique and corrections

The first capture exposed unequal metric baselines when a label wrapped, and background graph edges extending into the hero prose at the middle width. A mobile 12-column grid initially exceeded its frame because eleven 32px gutters alone exceeded the available width; mobile gutters were reduced to 8px and grid children made shrinkable. Metric rows were aligned explicitly, the graph was confined to the portrait side, mobile diagram labels enlarged, and display tracking relaxed. Active navigation was changed from last-intersection-wins to a deterministic scroll-position calculation; this also avoids full-page capture changing the visible active item.

The main hierarchy now separates identity, statement, actions, evidence and portrait. Projects use alternating open narratives and large visuals rather than identical bordered boxes. The abstract visuals share a coherent architecture language; a future canonical product image will automatically replace its abstract header when present. This is a deliberate abstract treatment, not a claim to show actual product UI.

## Review artifacts

Before: `/tmp/spatial-phase14/before/{360,768,1024,1440}.png`.

Review gate captures:

- `/tmp/spatial-phase14/review/hero-{360,1024,1440}.png` (viewport)
- `/tmp/spatial-phase14/review/hero-full-{360,1024,1440}.png` (complete hero)
- `/tmp/spatial-phase14/review/projects-{360,1024,1440}.png`
- `/tmp/spatial-phase14/review/projects-full-{360,1024,1440}.png`
- `/tmp/spatial-phase14/review/full-{360,1024,1440}.png`

The lower sections in full-page captures retain their Phase 13 content/components with the new foundation. They are **not** the completed Phase 14 layout.

## Checks run at this checkpoint

- `npm run validate:content`: passed.
- `npm run lint`: passed, no warnings/errors; the existing Next lint-command deprecation notice remains.
- Focused no-hardcoded-copy/content-isolation/Spatial contrast checks: **11 tests passed**, zero failed.
- Local application ran for browser review. The initial route compilation exceeded the first navigation timeout; the settled preview was used for captures.
- Corrected review captures at 360, 1024 and 1440px: no page/console/HTTP errors; no horizontal overflow; one h1; four project features; portrait bounds inside the viewport at every width.
- An intermediate capture reported a development hot-reload hydration warning in the existing Skills IDs; reloading the settled preview produced zero errors. No suppression or Skills redesign was added.
- Final full hero and project-section screenshots were visually inspected. Mobile stat alignment, portrait clipping and graph/prose interference were corrected before handoff.

The full unit suite, production build, full five-width × three-mode matrix, final keyboard walk, other-theme font-request check and complete cross-surface review are intentionally reserved for **after** owner approval, as requested. Earlier Phase 13 results are not claimed as Phase 14 verification.

## Changed paths in this checkpoint

- `app/css/spatial.scss`
- `themes/spatial/shell.jsx`
- `themes/spatial/sections/{hero,projects,project-entry,project-visual,accent-text}.jsx`
- `themes/spatial/client/{editorial-effects,wayfinding}.jsx`
- `themes/spatial/scene/palette.mjs`
- `portfolio-data/settings/copy/spatial.json`
- Spatial keys only in `lib/portfolio/copy-schemas.mjs`
- `public/fonts/spatial/**`
- This document and the Current status entry in `CLAUDE.md`

Pre-existing Phase 13 modifications remain in the working tree outside this checkpoint’s new changes, all inside the already-authorized Spatial scope.

## Prior review gate (superseded by the whole-theme review request)

The owner’s later request to review and improve the full Spatial theme supersedes this earlier gate. The checkpoint originally said: do not build the remaining About, Experience, Skills, Education/Awards, Certificates, Writing, Résumé, Contact or footer redesigns before the owner says **continue**. Their planned layouts are the owner’s Phase 14 brief: editorial About/fact bento, sticky career index and expandable highlights, legible category/graph Skills explorer, refined rows/badges, editorial writing, canonical résumé actions, oversized contact/copy-email experience and minimal footer.

Real-device GPU quality, external résumé availability and actual contact delivery remain unverified. The full-tier local browser uses a renderer-name override on SwiftShader, not a physical GPU. The admin preview bar is shared and unchanged; bottom clearance/focus management and layering stay inside Spatial.


## Photo-only follow-up

The owner requested the reference's cutout portrait and animated surrounding circle, using Spatial's own colors. Replaced only the hero photo presentation with a canonical-photo cutout, tilted chartreuse front/back SVG orbit, orbiting lights and a gentle vertical float. Removed the graph behind this portrait; the separate Skills visualization remains intact. Identity and location still come from canonical content.

Implementation: `themes/spatial/sections/orbit-portrait.jsx`, its hero integration, Spatial SCSS, and the theme-local alpha mask and provenance notes in `themes/spatial/assets/`. Generated image color pixels are not used; only the transparency mask is applied to the original photo. The mask is source-URL-bound, with a regular-photo fallback for other URLs.

Validation: lint and all 10 focused copy/content-isolation tests passed. Portrait bounds checked at 360, 768, 1024 and 1440px. Browser checks confirmed orbit movement, Pause motion stopping it, and reduced-motion stopping the portrait animation. Final portrait screenshots were visually reviewed. A development hot-reload Skills ID warning appeared during an intermediate run; settled-page reload verification is recorded separately in `/tmp/spatial-phase14/portrait/browser.log`.

Review captures: `/tmp/spatial-phase14/portrait/hero-{360,768,1024,1440}.png` and matching `photo-*.png`. The shared preview toolbar may overlap the mobile capture; it is outside this photo-only request. Remaining Phase 14 sections still await the existing “continue” gate.


### Photo refinement v2

The owner identified a white face-edge halo and requested a larger orbit with better shirt contrast. Added a Spatial-only charcoal-shirt transparent image edit, replacing the previous alpha-over-original method. The canonical original remains untouched. Asset provenance and the exact editing prompt are in `themes/spatial/assets/README.md`. Increased ellipse radii from 335×132 to 370×150 and line opacity/width for a more visible lime arc. Existing pause and reduced-motion behavior is retained.

V2 verification: lint and both focused test files passed. Four-width browser review confirmed the new asset, orbit movement, pause and reduced-motion behavior. Desktop and mobile captures were visually inspected. The existing Skills hydration-ID warning recurred in the development preview; no change was made to Skills in this photo refinement. Captures are `/tmp/spatial-phase14/portrait/{hero,photo}-v2-{360,768,1024,1440}.png`.
