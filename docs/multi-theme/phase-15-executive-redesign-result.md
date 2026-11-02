# Phase 15: Executive redesign result

Date: 2026-10-26. Implemented locally; no activation, commit or push.

## What changed

Executive now opens with the canonical professional designation, a natural portrait,
introduction, verified experience/focus/stack and direct contact/résumé actions.
Career experience follows immediately. A sticky guide, role anchors, active-role
marker and scroll-driven progress line make it the main motion experience. Projects
use compact evidence rows and native expandable details instead of showing every
feature and responsibility at once. Expertise, biography, education, recognition,
certificates, writing, résumé and contact remain available.

The palette is cool paper, ink and indigo, with independent dark tokens selected by
`prefers-color-scheme`. Self-hosted Inter Tight headings and Inter reading text
replace Georgia/Arial. Typography, colors, spacing and radii live in Executive's
stylesheet. Headings, dates and content hierarchy replace repeated eyebrows,
project/article numbers and decorative arrows. The decorative monogram box was
removed in the final restraint pass.

The baseline findings, palette, wireframes, alternatives and pre-build critique are
in `phase-15-executive-redesign-plan.md`. Baseline home screenshots were reviewed at
375, 768, 1280 and 1536 px before implementation.

## Behavior and architecture

- All facts still come from the validated canonical portfolio. New wording is in
  Executive copy with matching strict schema keys. Availability was not invented.
- All five registry slots and public/preview routes are retained. Public theme is
  still Coding, also confirmed in the browser while authenticated for Executive.
- Presentation lives under `themes/executive/`; `app/css/executive.scss` is a thin
  Sass forwarding entry. The existing stylesheet-source list and shared contact
  form primitives are unchanged. No theme CSS enters the Next CSS graph.
- A small client enhancement observes sections and roles. CSS view timelines own
  continuous progress where supported; the observer supplies discrete role progress
  otherwise. Only opacity and transform animate. No scroll event handler, layout
  measurement loop, new package, GSAP, Three.js, R3F or Lenis was added.
- The hero has one small entrance; skill rows settle through CSS view timelines.
  Projects expand through native details/summary controls. No section-wide reveal
  hides server content. Without JavaScript, all sections remain readable and native
  role anchors, menu and project disclosures work.
- System reduced motion and the shared `portfolio-motion` paused setting disable
  animation and dimming. If IntersectionObserver is unavailable, content stays static.
- Header section state uses underline and weight; role state uses marker, weight and
  border as well as color. Mobile gets a persistent compact section navigation row.
- Fonts are theme-local copies of existing licensed binaries with retained OFL
  notices, loaded through next/font/local. Portrait dimensions are reserved; missing
  source uses initials and a failed image preserves its footprint.

## Skills applied

| Skill | Effect on decisions |
| --- | --- |
| frontend-design | Role-led hero; career as the one expressive moment; rejected cream/serif, dashboard cards, repetitive eyebrows and decorative numbering; removed monogram. |
| ui-ux-pro-max | Prioritized readable 16px body text, semantic hierarchy, focus, touch targets, contrast and responsive behavior. Its generic blue/green trust recommendation was rejected in favor of the brief's restrained indigo. Focus-obscuring sticky navigation guidance informed anchor offsets; Next guidance kept content server-rendered with small client islands. |
| playwright-cli | Real baseline and production screenshots, viewport/media/no-JS contexts, native keyboard controls, motion states, preview navigation and mocked contact checks. |
| superpowers:using-superpowers / brainstorming | Read process guidance and explored the existing implementation; the user's explicit plan/critique/build process and instruction to proceed without approval governed this phase. |
| superpowers:verification-before-completion | Checked actual command results and browser evidence before documenting completion. |

## Verification performed in this session

| Check | Actual result |
| --- | --- |
| `npm run validate:content` | Passed. |
| `npm run build:theme-css` | Passed; Executive sheet compiled through existing pipeline. |
| `npm run lint` | Passed, no warnings/errors; Next's existing lint deprecation notice remains. |
| `npm run test:unit` | Final result: 45 test files passed, zero failures, including hardcoded-copy, content isolation, registry, parity, preview and stylesheet checks. |
| `PORTFOLIO_BUILD_DIR=.next-executive-15-build npm run build` | Passed, including validation and CSS prebuild. Public project routes remain static/SSG; blog remains ISR; preview/admin remain dynamic. |
| Screenshot matrix | 72 cases passed: 3 routes × 4 widths × 2 color schemes × standard/no-JS/reduced modes. No horizontal overflow, out-of-viewport text, hidden sections or canvas. One h1 on every route. |
| Career motion | Captured all three roles in both palettes. Native progress transforms reached 0, ~0.644 and 1; sticky guide held at 120px once pinned. Observer fallback, with native animation explicitly disabled, produced 1/3, 2/3 and 1. |
| Keyboard and state | Role anchors focus the target role with indigo focus, the skip link focuses main, native disclosure opens, mobile menu opens, focus is 3px, mobile navigation closes after choosing a section, and preview navigation returns to Executive with section observation reinitialized. |
| Motion preference | Shared paused preference yields no role animation and full opacity. Reduced contexts in the matrix use paused state. |
| Portrait failure | Simulated error produces canonical initials and preserves the 96×120 mobile footprint. |
| Contact | Mocked API only: invalid submission focuses name; success clears fields; HTTP failure retains message and shows feedback. No email was sent. |
| Layout stability | Observed CLS 0 in the sampled production desktop page load. This is a laboratory observation, not field performance data. |
| Runtime isolation | Sampled production Executive requested no script containing tested Three/Fiber/GSAP signatures and rendered zero canvases; no page errors. |
| Contrast | Light: body 16.60, secondary 6.23, accent 6.38, button 6.83, input boundary 3.98. Dark: body 15.82, secondary 9.21, accent/button 8.90, input boundary 4.24. Ratios cover palette pairs; this is not a complete assistive-technology audit. |
| `git diff --check` | Passed. |

The initial development-server matrix was interrupted by hot reload/auth state and
was not used as final evidence. Final screenshots and checks use the production
build. Earlier unit failures from a stale copy expectation and the copy scanner's
capability-name literal were fixed without loosening the scanner.

## Evidence

Local, ignored evidence is in `artifacts/portfolio/phase15/`:

- `before-{width}.png`, `before-hero-{width}.png`: baseline home.
- `{standard|nojs|reduced}-{light|dark}-{width}-{home|project|blog}.png`: matrix.
- `career-{light|dark}-{1|2|3}.png`: scroll positions.
- `section-{light|dark}-{projects|skills|contact}.png`: lower-page samples.
- `browser-results.json`, `interactions-results.json`, `runtime-results.json`:
  machine-readable observations.

Browser checks are repeatable through the three new `executive-redesign*.js` scripts
using Playwright CLI against an authenticated source page on localhost:3025.

## Changed files

- `themes/executive/home.jsx`, `shell.jsx`, `project-card.jsx`, `project.jsx`,
  `projects.jsx`, `blog.jsx`, `writing.jsx`: layout, navigation and row presentation.
- `themes/executive/styles.scss`: complete theme tokens, layouts, dark mode and motion.
- `themes/executive/enhancement.jsx`, `portrait.jsx`: small progressive client islands.
- `themes/executive/fonts.jsx`, `fonts/`: self-hosted fonts and license notices.
- `app/css/executive.scss`: compilation entry.
- `portfolio-data/settings/copy/executive.json`, `lib/portfolio/copy-schemas.mjs`:
  Executive-only wording/schema additions.
- `tests/unit/theme-copy.test.mjs`: merge expectation follows canonical Executive copy.
- `tests/browser/executive-{acceptance,accessibility}.js`: role-led heading expectations.
- `tests/browser/executive-redesign.js`, `executive-redesign-interactions.js`,
  `executive-redesign-runtime.js`: matrix, interaction and runtime/contact checks.
- This result and `phase-15-executive-redesign-plan.md`.

No other theme implementation, activation setting, environment file, dependency
manifest, registry, SEO renderer or contact handler was edited by this phase.

## Risks and remaining work

No implementation work remains for this phase. Owner visual acceptance is still
subjective. Browser verification used Chromium; Firefox/WebKit and screen-reader
sessions were not exercised. The observer fallback was simulated by disabling native
animation, not tested in a separate engine without scroll timelines. Contact delivery
was mocked; production credentials and real email delivery were not tested. The
canonical résumé still depends on its external viewer/provider. The existing shared
admin preview toolbar can overlap content, especially without JavaScript; it was
left unchanged and does not appear on public pages. A collapsed toolbar was used for
interactive scroll evidence; the matrix preserves the normal preview controls.
