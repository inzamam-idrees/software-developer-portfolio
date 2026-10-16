# Phase 8E — Spatial hardening, review and docs: result

Date: 2026-10-16
Plan: `docs/superpowers/plans/2026-10-15-spatial-theme.md` (Phase 5, Tasks 13–14)
Status: implemented, not committed (awaiting owner review).

## Owner decisions carried into this phase

- Per-theme loading of client code and styles (a registry change) was not approved, so
  it was not done.
- Lighthouse was not approved (it downloads a tool). LCP and CLS were measured instead
  with Playwright's performance observers under CPU and network throttling. This
  downloads nothing.

## Measurements (this session, headless Chromium)

`tests/browser/spatial-performance.js` wraps the WebGL draw functions to count real
draw calls and triangles per animation frame.

| Station (1440 × 900) | Max draw calls / frame | Max triangles / frame |
|---|---|---|
| Hero | 5 | 1,736 |
| Skills (with a selection) | 6 | 1,736 |
| Projects | 4 | 92 |
| Experience | 3 | 36 |

Budgets: 20 draw calls and 15,000 triangles per frame. Frames rendered while no slot is
on screen: **0**. Rendering stops when nothing 3D is visible.

| Throttled phone (390 × 844, 4× CPU, 150 ms latency, 1.6 Mbps) | LCP | CLS |
|---|---|---|
| Full tier (hardware renderer name) | 756 ms | 0.035 |
| Default headless (software renderer → reduced tier) | 844 ms | 0.035 |

Targets: LCP < 2.5 s, CLS < 0.1. These are headless approximations; real mid-range phone
numbers are still a manual check.

Bundle (unchanged from Phase 8D apart from small fixes):
- Spatial scene code: 4.0 kB gz.
- Route table: 127 kB, against the 124 kB baseline.
- Cost to other themes: about 3.5 kB gz JS and about 4 kB gz CSS (accepted for now).

## Accessibility (this session)

`tests/browser/spatial-accessibility.js` injects axe-core 4.10.2 (already installed
through `eslint-plugin-jsx-a11y`) and runs the WCAG 2.0/2.1 A and AA rules. It found
**0 violations** in each run:
- desktop with 3D
- phone with 3D
- desktop with reduced motion
- `/project`
- `/blog`

A keyboard walk visited 101 tab stops. Each was visible and showed a 2px focus outline,
and none entered the canvas. Earlier contrast reports were samples taken in the middle of
the 160–200 ms colour transitions; the audit now waits for them to settle.

## Regression of other themes (new build)

| Script | Result |
|---|---|
| `executive-acceptance.js` (Executive, port 3016) | Pass, no heavy scripts |
| `coding-reference-regression.js` (Coding, port 3014) | Pass |
| Cinematic `accessibility.js`, `navigation.js`, `touch.js`, `performance.js` (port 3015) | Pass |
| `theme-responsive.js` | Fails on both the baseline and the new build: it looks for an old "PHASE THREE FIXTURE" name. Pre-existing; not touched |

## Whole-branch review

A fresh reviewer read the full change set and returned "ready with fixes": no critical
issues and five important ones. One minor was re-graded to important. All six were
fixed in one pass, each test-first (red, then green):

| Finding | Test | Fix |
|---|---|---|
| A scene chunk that fails to load (for example, removed by a redeploy) or a renderer that cannot start would replace the whole page with Next's error screen | `spatial-scene.js` aborts scene chunks after load → stage must reach tier `none` with no page errors | `client/scene-boundary.jsx` around the lazy canvas; failure behaves like context loss |
| A long profile name pushed "Menu" off a 320px screen, hidden by the theme's overflow clip | `spatial-acceptance.js` injects a long name and checks the Menu stays inside the viewport | The wordmark can shrink and truncates with an ellipsis; the link's `aria-label` keeps the full name |
| Normalization merged C, C++ and C# (and could produce an empty key) | `spatial-graph` unit test | `+` → `plus`, `#` → `sharp` before stripping; empty keys fall back to the trimmed lower-case name |
| The 0.75 pixel-ratio cap for software renderers was not applied | `spatial-scene.js` checks canvas pixel ratio at device scale 2 | `dpr={software ? 0.75 : [1, compact ? 1 : 1.5]}` |
| The phone menu stayed open over the page after a link was chosen (re-graded from minor) | `spatial-acceptance.js` opens the menu, follows a link, expects it closed | `client/mobile-menu.jsx` closes the disclosure on link click |
| The README linked to a summary doc that did not exist yet | — | This file and `phase-8-spatial-result.md` |

Deferred minors are listed in `phase-8-spatial-result.md`.

## Final verification (this session)

| Check | Result |
|---|---|
| `npm run lint` | No ESLint warnings or errors |
| `npm run test:unit` | 189 pass, 1 fail — the existing `theme-settings` test (fails at HEAD) |
| `PORTFOLIO_BUILD_DIR=.next-spatial npm run build` | Compiled successfully |
| `spatial-acceptance.js`, `spatial-scene.js`, `spatial-motion.js`, `spatial-performance.js`, `spatial-accessibility.js` | All pass |

## Docs updated

- `CLAUDE.md`: Phase 8 status, Spatial component locations, `lib/motion/`, 21
  documents, and Spatial in the theme principles.
- `README.md`: Spatial theme section.
- `docs/portfolio/dependency-decisions.md`: no packages added; scene budget.

## Still manual

- Frame rate, battery and tap-picking accuracy on a real mid-range Android phone, an
  iPad, and iPhone Safari.
- Real-GPU rendering quality (headless runs use SwiftShader).
- Lighthouse, if the owner approves running it.
