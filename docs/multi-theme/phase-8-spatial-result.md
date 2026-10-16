# Phase 8 — Spatial theme: summary

Date: 2026-10-16
Spec: `docs/superpowers/specs/2026-10-15-spatial-theme-design.md`
Plan: `docs/superpowers/plans/2026-10-15-spatial-theme.md`
Status: implemented, verified, and committed with owner approval
(2026-10-16). The public active theme is unchanged (`coding`).

## What Spatial is

A fourth theme that shows the canonical content as an explorable system model. Every
section is server-rendered from validated data and works without JavaScript or WebGL.
After the page loads, one lazy canvas draws four stations into reserved layout panels:
- **Hero:** the whole system model.
- **Skills graph:** two-way selection with the DOM.
- **Project ring:** featured projects.
- **Experience spine:** the career history.

It runs in one of three tiers:
- **Full:** animated.
- **Reduced:** static, for reduced motion, a paused preference, or software rendering.
- **None:** no 3D.

## Phases

| Phase | Result doc | Delivered |
|---|---|---|
| 8A | `phase-8a-spatial-scaffold-result.md` | Registry entry, `copy-spatial` document and schema (21 documents), graph derivation, every section without 3D, DOM skills explorer, scoped styles and font |
| 8B | `phase-8b-spatial-motion-result.md` | Shared `portfolio-motion` preference, pause control, restrained state-change motion |
| 8C | `phase-8c-spatial-stage-result.md` | Capability and tier decision, lazy stage, canvas lifecycle, hero model, context-loss fallback |
| 8D | `phase-8d-spatial-stations-result.md` | Slot rendering, skills graph with picking, project ring, experience spine, phone layout |
| 8E | `phase-8e-spatial-hardening-result.md` | Draw-call, LCP and CLS measurement, axe audit, regression runs, whole-branch review fixes, docs |

## Rulings made during implementation

These are decisions taken on the owner's behalf, with the cost if they are wrong.
- **No commits.** Every review is of the working tree against `e5fa035`. Cost: none.
- **Count-pinning tests updated for 21 documents and four themes.** The plan had
  missed them. Cost: none.
- **Server-drawn plan and "Present" label.** `planPoint` and `experiencePeriod` were
  added, and `formatMonth` is now exported from `current-view.mjs`. Cost: two small
  helpers.
- **Long-text check in the browser.** It injects text into the rendered page instead of
  using a second data fixture. Cost: it would miss server-side truncation (none exists).
- **Archivo with `preload: false`.** It was preloading 90 kB on every theme. Cost:
  possible font swap on first Spatial paint.
- **Spatial CSS and small client code on every route.** This comes from the registry's
  dynamic imports. The owner accepted it for now. Cost: about 4 kB gz CSS and 3.5 kB gz
  JS on other themes.
- **Preview-security script run against `next dev`, with the admin hash `$` escaped.**
  Production cookies are `Secure`, and `@next/env` expands `$` even in process
  environment variables. Cost: none.
- **Uncategorized `skills.all` entries treated as unmatched.** Cost: they appear in the
  "Also used in projects" group.
- **Motion control rendered directly, without `aria-pressed`, and in the menu below
  900px.** Cost: one extra tap to pause on phones.
- **Stage and canvas re-parented between phases.** The stage lived in the hero figure
  in Phase 3 and moved to page level in Phase 4. Cost: none at the end.
- **Acceptance script blocks WebGL2; the preview script no longer lists Spatial as
  "light".** Cost: none.
- **Headless runs report a hardware renderer name to reach the full tier.** Cost:
  real-GPU behaviour is unverified.
- **One fixed canvas drawn into layout slots, not a background canvas.** Cost: the
  canvas re-renders on scroll, with a possible one-frame lag.
- **Experience dolly computed from the DOM, not GSAP.** Cost: none; Spatial loads no
  GSAP.
- **Phones get hero and skills only; projects and experience appear from 1100px.**
  Cost: no ring or spine on phones and small tablets.
- **Canvas wrapper set to `pointer-events: none`.** React Three Fiber's default
  intercepted every click on the page. Cost: none.
- **Per-frame callbacks guard their refs.** Errors thrown there bypass error
  boundaries. Cost: none.
- **Active role computed in the stage from scroll position.** Cost: none.
- **axe waits 600 ms after a click so transitions settle.** Cost: none.
- **Phone menu staying open re-graded from minor to important and fixed.** Cost: none.

## Deferred minors (from the whole-branch review; not fixed)

1. The full tier keeps requesting frames while any slot is visible, even when the
   stations are settled; it could request frames only while something moves.
2. The highlighted-path line buffer is replaced on each selection without deleting the
   old GPU buffer, and its bounding sphere goes stale. The leak is small and grows
   per click.
3. The project ring turns the long way when focus wraps from the last project to the
   first.
4. Duplicate React keys are possible (role and company, technology, and highlight
   strings).
5. The skills slot shows a pointer cursor where nothing is clickable (no-3D tier; phone
   before a selection).
6. The picking camera duplicates the station camera.
7. An empty grey side panel appears at 1100px and wider when there are no featured
   projects or no roles.
8. An article reading time of 0 would render a literal "0".
9. A technology listed in two categories is dropped from the later one.
10. `spatial-bundle-isolation.js` reports sizes but enforces no budget.
11. The reduced-motion note on the disabled motion button is reachable only in
    screen-reader browse mode.

## Data the owner may want to align

29 project and role technologies do not match a categorized skill. Several are spelling
variants: `HTML5`/`HTML`, `CSS3`/`CSS`, `Node.js (Express)`/`Node.js`,
`CI/CD Pipeline`/`CI/CD`, `Material`/`Material UI`. The full list is in
`phase-8a-spatial-scaffold-result.md`.

## Open decisions for the owner

- Commit the work. Optionally activate or preview Spatial publicly; it is previewable
  in admin today.
- Load each theme's client code and styles only on its own pages (registry change).
- Run Lighthouse.
- Manual real-device checks (see 8E).
