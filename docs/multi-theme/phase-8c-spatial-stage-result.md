# Phase 8C — Spatial stage and hero scene: result

Date: 2026-10-16
Plan: `docs/superpowers/plans/2026-10-15-spatial-theme.md` (Phase 3, Tasks 9–10)
Status: implemented, not committed (awaiting owner review).

## What was built

- **Capability and tier (pure, unit-tested):**
  - `lib/motion/capability.mjs`: `detectWebGL(document)` probes WebGL2 on a throwaway
    canvas, flags software renderers (SwiftShader, llvmpipe), and releases the probe
    context; `COMPACT_QUERY = "(max-width: 767px)"`.
  - `lib/motion/tier.mjs`: `decideSceneTier(...)` → `none` when `threeD` is off or
    WebGL2 is missing; `reduced` for system reduced motion, a paused preference,
    `animations: false`, or a software renderer; otherwise `full`.
- **Stage (`themes/spatial/client/stage.jsx`):** decides the tier after hydration and
  exposes it as `data-scene-tier` and `data-scene-status` (`idle`, `loading`, `ready`,
  `fallback`). For `full` or `reduced`, it requests the scene chunk only after the
  `load` event and an idle callback. Context loss switches it to `none` for the session.
- **Canvas (`themes/spatial/scene/canvas.jsx`):** React Three Fiber, `aria-hidden`
  canvas outside the tab order. Pixel ratio caps 1.5 desktop / 1 compact / 0.75 software
  renderer. It renders continuously only in the full tier while on screen and while the
  tab is visible; otherwise only on demand. `webglcontextlost` hands back to the stage.
  Every station sits in its own error boundary (`station-boundary.jsx`).
- **Hero station (`themes/spatial/scene/hero-model.jsx`):** the system model built from
  the same graph as the server SVG plan. Categories (cubes), technologies (small
  icosahedra), projects (octahedra) and roles (rotated cubes) are four instanced meshes;
  links are one line-segment geometry. Matte, flat-shaded materials, a hemisphere light
  and one key light, no textures, no post-processing. In the full tier it assembles once
  (1.6 s) from the centre and then drifts slowly (pausable with the motion control);
  in the reduced tier it renders the settled pose once.
- **Placement:** in this phase the canvas sits inside the hero figure, over the SVG plan.
  The plan fades to `opacity: 0` when the scene is ready but stays in the accessibility
  tree as the model's text alternative. Phase 4 moves the stage to the fixed layout.

## Verification (this session)

| Check | Result |
|---|---|
| `node --test tests/unit/spatial-tier.test.mjs` | 7 pass (failed first: modules missing) |
| `npm run lint` | No ESLint warnings or errors |
| `npm run test:unit` | 181 pass, 1 fail — the existing `theme-settings` test (fails at HEAD) |
| `PORTFOLIO_BUILD_DIR=.next-spatial npm run build` | Compiled successfully |
| `tests/browser/spatial-scene.js` (port 3019, plus port 3022 with `threeD` and `animations` off) | Pass (failed first: no stage). Full tier: ready, one `aria-hidden` canvas, 3D chunks fetched only after `load`, CLS 0.008 after scrolling, SVG plan kept. Context loss: canvas removed, tier `none`, hero intact, no errors. Reduced motion → `reduced`. Software renderer → `reduced`. No WebGL2 → `none`, no canvas, no 3D code. `/project`, `/blog`: no 3D code. Flags off → `none`, no 3D code, no motion control (closes the Phase 2 gap) |
| `tests/browser/spatial-acceptance.js` | Pass at five widths (now runs with WebGL2 blocked, as the content-tier check) |
| `tests/browser/spatial-motion.js` | Pass |

Headless Chromium uses SwiftShader, so the scene script reports a hardware renderer
name to exercise the full tier. Real GPU rendering and frame rate are manual checks.

Screenshots of the rendered model at 1440 and 390 were reviewed: matte nodes and thin
links read as an architectural model, distinct from Cinematic's metallic core.

## Bundle and performance

| Item | Size |
|---|---|
| Spatial scene code (canvas + hero model chunks) | 3.9 kB gz (budget 25 kB) |
| Shared vendor chunks loaded by the scene (three.js 88 kB gz chunk + React Three Fiber), shared with Cinematic's cache | unchanged |
| Spatial client islands (stage, motion, selection, explorer) inside the shared client chunk | about +1.6 kB gz over the baseline chunk (budget 15 kB) |
| Route table first load (`/`, `/project`, `/blog`) | 126 kB (baseline 124 kB) |
| Coding page, raw downloads vs baseline | JS +5.9 to +7.3 kB raw (about 2.5 kB gz), CSS +15.9 kB raw (3.7 kB gz), fonts 0 |

The Coding page downloads no Spatial scene chunk and no three.js (checked by listing
its script responses). Its extra JS is Spatial's small client code, linked on every
route by the same mechanism as the stylesheet the owner accepted in Phase 1.

## Decisions (rulings)

- The stage lives in the hero figure for this phase; Phase 4 re-parents it to the fixed
  layout with the camera rig.
- `spatial-acceptance.js` now blocks WebGL2 so it stays the content-tier check;
  Spatial was removed from `theme-preview-security.js`'s "light" list because it now
  loads 3D after `load`, which `spatial-scene.js` asserts.
- React Three Fiber applies `aria-hidden` to its wrapper `div`; the canvas element is
  also marked `aria-hidden` and `tabIndex=-1` on creation.
- The motion context now exposes the stored `preference` for the tier decision.

## Risks and open items

- Raw-byte cost to other themes keeps growing in small steps (about 2.5 kB gz JS and
  3.7 kB gz CSS so far). Fixing it means loading theme-specific client code and styles
  per theme rather than per route — a registry-level change worth its own decision.
- Frame rate and battery on real mid-range phones are unverified (Phase 5).

## Next: Phase 4 — signature stations

Skills graph and project ring stations synced with the DOM selection, experience spine,
scroll camera rig, compact inline graph, fixed canvas layout.
