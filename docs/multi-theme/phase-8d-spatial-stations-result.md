# Phase 8D — Spatial signature stations: result

Date: 2026-10-16
Plan: `docs/superpowers/plans/2026-10-15-spatial-theme.md` (Phase 4, Tasks 11–12)
Status: implemented, not committed (awaiting owner review).

## What was built

**One fixed canvas, drawn only inside layout slots.** The stage is now a fixed,
`pointer-events: none` layer at page level. Each station has its own scene and
camera and renders into the rectangle of a DOM "slot" with scissor and viewport, so
text never sits on top of 3D, section backgrounds still work, and there is exactly one
WebGL context at every screen size.

| Station | Slot | What it shows |
|---|---|---|
| Hero | hero figure | The whole system model; assembles once, then drifts (full tier) |
| Skills | panel above the skills list (dark field) | The same graph seen from above; the selected technology, its category, and the projects and roles that use it light up in the signal colour, with the connecting links drawn over dimmed ones |
| Projects | sticky side column (≥1100px) | Featured projects as procedural objects on a ring (shape from category, facets from technology count); the project being read, hovered or focused turns to the front |
| Experience | sticky side column (≥1100px) | One plate per role along a rail; the camera dollies along it as the section scrolls (full tier); the role nearest the middle of the viewport is lit |

- **Two-way selection.** DOM buttons drive the graph, and clicking or tapping a
  technology node inside the skills slot selects it in the DOM (the button becomes
  pressed and the result panel updates). Picking uses a DOM listener and screen-space
  projection, not React Three Fiber events.
- **Phones (<768px):** hero and skills only. The skills graph folds technologies into
  their categories until a selection opens one category. Projects and experience slots
  appear only from 1100px, so they never shift layout.
- **Fallbacks:** without 3D, the hero and skills slots keep their server-drawn plans,
  and the side columns stay empty space. A station that throws is marked
  `data-station-failed` and its slot falls back to its plan while the other stations
  keep rendering. Losing the WebGL context still drops to the no-3D tier.
- **Rendering cost:** on demand. Scroll, resize and state changes request a frame; in
  the full tier the loop keeps going only while a slot is on screen and the tab is
  visible.
- **Pure helpers (`themes/spatial/scene/rig.mjs`, unit-tested):** section progress,
  nearest element to the viewport centre, slot-to-GL viewport, ring rotation, project
  shape, node picking, highlight set.

## Verification (this session)

| Check | Result |
|---|---|
| `node --test tests/unit/spatial-rig.test.mjs` | 7 pass (failed first: module missing) |
| `npm run lint` | No ESLint warnings or errors |
| `npm run test:unit` | 188 pass, 1 fail — the existing `theme-settings` test (fails at HEAD) |
| `PORTFOLIO_BUILD_DIR=.next-spatial npm run build` | Compiled successfully |
| `tests/browser/spatial-scene.js` (ports 3019, 3022 flags off, 3023 no featured projects) | Pass: DOM selection reaches the graph; clicking in the skills slot picked a node (`tech:vibecoding`) and pressed its DOM button; hovering the second featured project focused `project:1`; scrolling through Experience lit `role:1`, `role:2`, `role:3`; CLS 0.001; context loss → no-3D tier; 1440 → 390 → 1440 → 390 kept one canvas and two WebGL2 contexts (probe + scene); projects slot hidden on phones; no featured projects → scene ready, no errors; reduced, software and no-WebGL tiers and flags-off as before |
| `tests/browser/spatial-acceptance.js` | Pass at five widths; no-JS page has both the hero and skills plans |
| `tests/browser/spatial-motion.js` | Pass |

Screenshots of each station (1440 desktop, skills at 390) were reviewed after a
selection; the experience camera was reframed after the first review because a passed
plate blocked the view.

## Bundle and performance

| Item | Size |
|---|---|
| Spatial scene code (lazy, Spatial only) | 4.0 kB gz (budget 25 kB) |
| Vendor 3D chunks (three.js, React Three Fiber) | shared with Cinematic, unchanged |
| Shared client chunk (Cinematic, contact form, Spatial islands) | 11.8 kB gz (baseline 9.0 kB) — Spatial adds about 2.8 kB gz (budget 15 kB) |
| Route table first load (`/`, `/project`, `/blog`) | 127 kB (baseline 124 kB) |
| Coding page, raw downloads vs baseline | JS +9.3 to +10.6 kB raw (about 3.5 kB gz), CSS +17.3 kB raw (about 4 kB gz), fonts 0 |

Draw calls stay within the budget by design (hero 6, skills 6, projects ≤ 9 with nine
featured projects, experience ≤ 4); exact per-frame counts are measured in Phase 5.

## Decisions (rulings)

- Slot rendering instead of a full background canvas (reasons above). The canvas
  re-renders on scroll so slots follow the layout; a one-frame lag on fast scrolls is
  possible.
- The experience dolly computes section progress from the DOM in the render loop
  instead of GSAP ScrollTrigger, so Spatial loads no GSAP.
- Phones keep hero and skills only; projects and experience stations exist from 1100px.
- React Three Fiber sets `pointer-events: auto` on its container, which made the fixed
  canvas swallow every click; the container is now `pointer-events: none`.
- Errors thrown inside per-frame callbacks bypass React error boundaries, so every
  frame callback guards its refs.
- The active role is computed in the stage from scroll position (DOM state), not in the
  render loop, so it stays correct while the experience slot is off screen.

## Found and fixed during this phase

- Node picking failed because the off-screen pick camera never had its world matrix
  updated.
- Skills and projects cameras were too close (outer rings cut off); both were pulled
  back.
- Browser scripts updated for two plans on the page and for smooth scrolling under
  enabled motion (`behavior: "instant"` in the test).

## Risks and open items

- The cost to other themes keeps growing slightly (about 3.5 kB gz JS and 4 kB gz CSS
  now). The registry-level fix (per-theme client code and styles) is a decision for the
  owner before or during Phase 5.
- Fast scrolling may show a one-frame lag between slot and drawing on slow devices.
- Real-device frame rate, battery and touch picking accuracy are unverified (Phase 5).

## Next: Phase 5 — hardening and docs

Draw-call and triangle measurement, Lighthouse (needs the owner's go-ahead to run
`npx lighthouse`), accessibility pass, real-device checklist, CLAUDE.md, README and
dependency notes.
