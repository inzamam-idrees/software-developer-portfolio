# Phase 8B — Spatial motion layer: result

Date: 2026-10-16
Plan: `docs/superpowers/plans/2026-10-15-spatial-theme.md` (Phase 2, Task 8)
Status: implemented, not committed (awaiting owner review).

## What was built

- **Shared preference (`lib/motion/preferences.mjs`):** `MOTION_STORAGE_KEY`
  (`portfolio-motion`), `readMotionPreference(storage)` and
  `writeMotionPreference(storage, enabled)`. Same key and values as Cinematic, so
  pausing in one theme pauses the other. Missing or blocked storage means "enabled";
  writes never throw.
- **Provider and control (`themes/spatial/client/motion.jsx`):** `MotionProvider`
  wraps the whole Spatial shell and sets `data-motion="enabled|paused"`. Motion is
  enabled only when hydrated, the `animations` feature flag is on, the system does not
  ask for reduced motion, and the stored preference is not paused. `MotionControl`
  shows "Pause motion" / "Enable motion"; under system reduced motion it is disabled
  and described by the system note. It renders nothing without JavaScript or when
  `features.animations` is off.
- **Placement:** in the header from 900px; below that, inside the mobile menu panel
  (the header could not fit the name, the control and "Menu" at 320px).
- **Motion itself (restrained):** only responses to the visitor's actions — colour
  transitions on technology buttons and buttons (160 ms), a short fade-in of the skills
  result when the selection changes (200 ms), and smooth in-page scrolling. All of it
  applies only under `data-motion="enabled"`; the existing `prefers-reduced-motion`
  rule still zeroes durations. No continuous animation exists yet.

## Verification (this session)

| Check | Result |
|---|---|
| `node --test tests/unit/motion-preferences.test.mjs` | 3 pass (failed first: module missing) |
| `npm run lint` | No ESLint warnings or errors |
| `npm run test:unit` | 174 pass, 1 fail — the existing `theme-settings` test (fails at HEAD) |
| `PORTFOLIO_BUILD_DIR=.next-spatial npm run build` | Compiled successfully |
| `tests/browser/spatial-motion.js` (port 3019) | Pass: reduced motion → control disabled with system note, `data-motion="paused"`, transition 0s; motion allowed → transitions 0.16s, toggle pauses and stores `portfolio-motion=paused`; a pre-seeded `paused` (as set by Cinematic) starts paused; at 390px the menu control pauses motion; no control without JavaScript |
| `tests/browser/spatial-acceptance.js` | Pass at all five widths, now also asserting the wordmark and header tools are not clipped |

## Bundle impact

- Route table unchanged from Phase 1: 125 kB first load (`/`, `/project`, `/blog`).
- Spatial stylesheet 3.7 kB gz (was 3.4 kB), linked on every route as accepted by the
  owner for now; global CSS unchanged (13.9 kB gz, same hash).
- No 3D or GSAP code loads (asserted by the acceptance script).

## Decisions (rulings)

- The control renders directly in the header (the provider wraps the whole shell), not
  through a portal into `#spatial-motion-slot`; the slot was removed.
- No `aria-pressed` on the motion button: its label already changes, and a changing
  label plus a pressed state is confusing for screen-reader users.
- Below 900px the control lives in the mobile menu.

## Found and fixed during review

- At 320px "Menu" was pushed off-screen and hidden by the theme root's
  `overflow-x: clip`, so the page-overflow check could not see it. The acceptance script
  now checks the header's bounding boxes.
- The wordmark sat higher than the navigation links (baseline alignment inside a 44px
  box); it is now centred.

## Not covered by automated tests

- `features.animations: false` hiding the control (simple flag; no second data fixture
  was started). Will be covered with the tier tests in Phase 3.

## Next: Phase 3 — stage and hero scene

Capability detection and tier decision (`lib/motion/capability.mjs`, `tier.mjs`),
lazy scene chunk, canvas lifecycle, hero station, error boundaries, context loss.
