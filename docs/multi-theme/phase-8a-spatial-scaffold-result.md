# Phase 8A — Spatial theme scaffold and no-3D tier: result

Date: 2026-10-16
Spec: `docs/superpowers/specs/2026-10-15-spatial-theme-design.md`
Plan: `docs/superpowers/plans/2026-10-15-spatial-theme.md` (Phase 1, Tasks 1–7)
Status: implemented, not committed (awaiting owner review).

## What was built

Spatial is registered as the fourth theme (`spatial`, status `available`) and renders
every section as server HTML with no 3D or animation code. This is the tier-3 fallback
and the base for later phases.

- **Registry and data:** `THEME_IDS` and the registry list `spatial` after `executive`.
  A new strict `spatialCopySchema` validates `portfolio-data/settings/copy/spatial.json`,
  registered as document `copy-spatial` (21 documents), so it is editable in admin.
  The public active theme is unchanged (`coding`).
- **Graph (`themes/spatial/graph.mjs`):** derives categories, technologies, projects
  and roles with their links from canonical data. Technology names match ignoring case,
  spaces and punctuation. Layout is deterministic. Proficiency is not used.
  `planPoint` projects the model for a server-rendered SVG drawing.
- **Presentation:** adds the graph, skill groups, unmatched technologies, and an
  experience period that uses the copy's "Present" label.
- **Sections:** hero (name, designation, headline, actions, SVG plan of the model),
  about, experience, skills (interactive explorer), projects, education and awards,
  writing, resume, contact (shared contact form). `/project` and `/blog` pages.
- **Skills explorer:** a small client island. Technologies are `aria-pressed`
  buttons after hydration (plain text before or without JS); a polite live region
  lists the projects and roles that use the selection.
- **Styles:** `app/css/spatial.scss`, scoped under `.theme-spatial`; element defaults
  use `:where()` so component classes win. Archivo variable font via `next/font`.

## Verification (this session)

| Check | Result |
|---|---|
| `npm run lint` | No ESLint warnings or errors |
| `npm run test:unit` | 171 pass, 1 fail — the existing `theme-settings` test that expects `cinematic` while the data says `coding` (fails at HEAD too, untouched) |
| `npm run validate:content` | Canonical portfolio content is valid |
| `PORTFOLIO_BUILD_DIR=.next-spatial npm run build` | Compiled successfully |
| `tests/browser/spatial-acceptance.js` (production build, port 3019, temp data copy with `activeTheme: spatial`) | Pass at 1440, 1024, 768, 390, 320: one h1, every section, all expected facts, no horizontal overflow (also with injected 120-character hero text at 320), no 3D/GSAP scripts, keyboard selection updates the live region, touch selection at 390, mobile menu opens, skip link is the first tab stop; without JavaScript every section, technology and the model plan render; `/project` and `/blog` have one h1 |
| `tests/browser/theme-preview-security.js` (dev server, port 3017, temp data copy, Cinematic public) | Pass, now including a Spatial preview: isolated sessions, activation not exposed in preview, Spatial preview loads no heavy scripts |
| `tests/browser/spatial-bundle-isolation.js` (baseline build on 3020 vs current on 3021, Coding public) | See bundle impact below |

New unit tests: `spatial-graph` (8), `spatial-presentation` (4), `spatial-contrast` (1),
plus Spatial cases in registry, copy, document registry, preview and isolation tests.

## Bundle impact on other themes (measured, Coding page)

| Asset | Baseline | Current | Change |
|---|---|---|---|
| Route table first-load JS (`/`, `/project`, `/blog`) | 124 kB | 125 kB | +1 kB |
| Scripts downloaded (raw) | — | — | +1.1 to +2.4 kB |
| Stylesheets (raw / gzip) | 65.3 kB | 79.6 kB | +14.2 kB / +3.4 kB gz |
| Fonts | 48.4 kB | 48.4 kB | 0 (after fix) |

- **Fixed:** `next/font` was preloading the 90 kB Archivo file on every theme. It now
  uses `preload: false`, so the font downloads only where Spatial text uses it.
- **Not fixed (decision for the owner):** Next links Spatial's stylesheet and its two
  small client islands on every route, because the registry's dynamic imports put every
  theme in the route's module graph. This is the same mechanism that already ships
  Cinematic's client code to Coding visitors, and all other theme stylesheets are global
  already. The global CSS file itself is unchanged (same hash). Removing the 3.4 kB gz
  would need a build step that compiles `spatial.scss` to a static file loaded with a
  React 19 `<link precedence>` from the Spatial shell.

## Decisions (rulings)

- No commits; every task's base is HEAD `e5fa035` (CLAUDE.md).
- Tests that pin document/theme counts were updated for Spatial (store, loader,
  preview tests) — the plan had missed them.
- Added `planPoint` / `PLAN_VIEWBOX` and `experiencePeriod` (and exported `formatMonth`
  from `current-view.mjs`) so tier 3 has a real visual and the "Present" copy key is used.
- The long-text check injects text into the rendered hero instead of a second data
  fixture.
- Archivo `preload: false` (above).
- The preview-security script runs against `next dev`, as in Phase 7C: production marks
  the session cookie `Secure`, and Playwright's request context drops it on plain http.
  The admin hash must be passed with `$` escaped as `\$`, because `@next/env` expands
  `$` even in process environment variables.
- Technologies listed in `skills.all` but in no category (for example jQuery) are
  treated as unmatched, so they appear in the "Also used in projects" group.

## Data for the owner: unmatched technologies

These project or role technologies do not match a categorized skill, so they appear in
the "Also used in projects" group and do not link to a category:

Material, Theming, .NET Framework, Third parties integration, Google Maps, XAMPP,
Node.js (Express), S3 Bucket, Socket.io, Google Recaptcha, Phone Verification, PayPal,
Stripe, Social Login, Plans/Packages, Vue.js, Core PHP, jQuery, Ajax, Curl,
Vanilla JavaScript, HTML5, CSS3, DOM Manipulation, MutationObserver, Responsive Design,
Accessibility, AWS CodeCommit, CI/CD Pipeline.

Several are spelling variants of categorized skills (`HTML5`/`HTML`, `CSS3`/`CSS`,
`Node.js (Express)`/`Node.js`, `CI/CD Pipeline`/`CI/CD`, `Material`/`Material UI`).
Aligning them in the data would connect them; no schema change is needed.

## Placeholders

None. Spatial renders only existing content.

## Risks and open items

- The 3.4 kB gz stylesheet on other themes (above).
- Visual review was by screenshots at five widths in headless Chromium; real-device
  checks come in Phase 5.

## Next: Phase 2 — motion layer

Shared `portfolio-motion` preference, pause control in `#spatial-motion-slot`,
restrained state-change transitions, reduced-motion behaviour.
