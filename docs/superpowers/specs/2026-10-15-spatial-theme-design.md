# Spatial theme — design

Date: 2026-10-15
Status: Draft for owner review
Builds on: phases 1–7 (`docs/multi-theme/`), `docs/superpowers/specs/2026-10-15-admin-content-and-resume-import-design.md`

## 1. Intent

Add a fourth theme, **Spatial**: an interactive, developer-centric portfolio in which 3D
carries meaning. The owner's skills, projects, and roles — taken only from the validated
data layer — become one system model that the camera travels through on scroll.

It must stay distinct from the existing themes:

| Theme | Character | 3D role |
|---|---|---|
| Coding | Code/IDE personality, dark | None |
| Cinematic | Editorial storytelling, near-black + mint | Optional decoration (engineered core) |
| Executive | Recruiter-first, warm cream + serif | None |
| **Spatial** | Explorable system, cool light ground | The skills graph, project objects, experience spine |

Success means: every section is readable and styled with no JavaScript or WebGL; 3D
loads lazily, only for this theme, after content is visible; nothing factual lives in
theme code; other themes' bundles do not grow; existing routes, content, preview, and
activation behave exactly as before.

### Decisions taken during brainstorming

| Topic | Decision |
|---|---|
| Name | Keep **Spatial** (`spatial`). |
| Technology matching | Match project/experience technology names to skills case-, whitespace-, and punctuation-insensitively. No schema change. Unmatched names render as project-only nodes. |
| Motion preference | Share the existing `portfolio-motion` localStorage key with Cinematic: pausing in one theme pauses both. |
| Dependencies | None added. Reuse `three`, `@react-three/fiber`, `gsap` already in the repo. |
| Skill ratings | Remain stored, not displayed (prior decision). Spatial does not encode proficiency visually either. |
| Activation | Spatial is `available` for preview and activation through the existing flow; the public active theme is not changed by this work. |

## 2. Visual concept

**Idea:** on this page, the owner's own stack — every technology, project, and role in
the data, and the edges between them — becomes one navigable system model.

### Tokens

| Token | Value | Use |
|---|---|---|
| `--sp-ground` | `#E3E6E8` | Page ground |
| `--sp-surface` | `#D3D8DC` | Panels, selected rows |
| `--sp-ink` | `#0E1B26` | Text, model edges |
| `--sp-soft` | `#4A5763` | Secondary text |
| `--sp-signal` | `#2347E8` | One element per screen: primary action, active selection |
| `--sp-field` | `#0E1B26` | Skills section ground (the one dark field) |
| `--sp-field-ink` | `#E3E6E8` | Text on field |
| `--sp-field-signal` | `#8EA6FF` | Signal on field |

All text/background pairs are verified ≥ 4.5:1 (≥ 3:1 for large text and UI boundaries)
by a unit test over the token table in Phase 1; values may be adjusted to pass, and the
final values are recorded in the phase result.

**Type:** Archivo (variable, `wght` 400/600, `wdth` axis) via `next/font/google`, one
family. Display uses an expanded width; body uses normal width at 17–19px, leading 1.5.
Four size steps: small (14px), body, lead, heading; a fluid display size for the hero.
No monospace labels, no all-caps eyebrows, no numbered markers except where the content
is a real sequence (experience, ordered by `order`).

**Material language:** a matte "architect's model": flat-shaded low-poly procedural
geometry, `MeshStandardMaterial` with low metalness, one key light plus hemisphere light,
thin `LineSegments` for edges. No bloom, post-processing, particles, textures, or loaded
models. Signal colour appears only on the active selection path.

**Motion language:** one orchestrated load moment (hero assembly). Everything else is
scroll-coupled camera movement or a response to the visitor's input. No per-section
fade-up entrances.

### Signature moments

1. **Hero assembly** — skill nodes converge into the system model once, then rest with a
   slow idle drift (pausable).
2. **Skills graph trace** — selecting a technology (DOM button or node tap) lights its
   edges to the projects and roles that use it. The "Used in" result is DOM text, so the
   interaction works fully in tier 3.
3. **Experience spine** — roles are plates along the depth axis; scroll dollies the
   camera past them.

## 3. Sections and content mapping

All wording comes from `view.copy` (shared + `spatial` copy). All facts come from
canonical content. Section `id`s match `settings.navigation` hrefs.

| Section (`id`) | Data | DOM (tier 3, always present) | 3D layer (tiers 1–2) |
|---|---|---|---|
| Hero | `profile.name/designation/headline`, `resume`, `contact.email` | Name, designation, headline; contact action and resume link | Model overview, assembly moment |
| About (`about`) | `about.summary/personalStatement/engineeringPhilosophy`, `profile.image`, `displayLocation` | Narrow letter column, portrait | None |
| Experience (`experience`) | `experience[]` (ordered), formatted durations from `current-view` | Ordered list: role, company, dates, highlights, technologies | Spine plates, camera dolly |
| Skills (`skills`) | `skills.categories[]`, `projects[].technologies`, `experience[].technologies` | Category groups of `aria-pressed` technology buttons; live region listing matching projects and roles | Graph: category clusters, technology nodes, edges to project/role nodes |
| Projects (`projects`) | `featuredProjects` (from current view), `projects.length` | Featured project entries with summary, role, technologies, links; link to `/project` | Procedural objects on a ring; focused object follows DOM selection/scroll |
| Education (`education`) | `education[]`, `awards[]` | Ordered lists | None |
| Writing | `articles` via `getArticles` | Article list in `Suspense`, empty/unavailable states | None |
| Resume | `resume.url`, `resume.downloadLabel` | Resume link (feature flag `resume`) | None |
| Contact (`contact`) | `contact.*`, `social` | Heading, intro, email, location, social links; shared `ContactForm` when `features.contactForm && contact.form.enabled` | None |

Feature flags (`settings.features`: `articles`, `contactForm`, `resume`, `animations`,
`threeD`) are honoured: `animations: false` forces tier 2 motion; `threeD: false` forces
tier 3 (no canvas, no 3D chunk requested).

`/project` and `/blog` render Spatial-styled DOM pages (project detail via
`themes/shared/project-detail.mjs`; blog via `getArticles`). They load no 3D.

### Graph derivation (`themes/spatial/graph.mjs`, pure)

- `normalizeTechnology(name)`: lower-case, strip whitespace and punctuation
  (`"Tailwind CSS"` ≡ `"TailwindCSS"`; `"Next.js"` ≡ `"nextjs"`).
- Nodes: one per skill category; one per categorized technology; one per project; one
  per experience role. Project/experience technologies that match no skill become
  project-only technology nodes, flagged `unmatched` and grouped outside the clusters.
- Edges: category→technology, technology→project, technology→role.
- Layout: deterministic seeded placement — categories on a ring, technologies around
  their category, projects and roles on outer rings — so output is stable across
  requests and testable without WebGL. Positions are computed on the server and passed
  to the client as plain arrays.
- Selection: `relatedTo(nodeId)` returns the connected project and role ids, used by
  both the DOM live region and the 3D highlight.

No proficiency, ratings, or invented weights are used in the graph.

## 4. Schema and registry changes

All changes are additive; no existing document's shape changes.

1. `lib/themes/ids.mjs`: append `"spatial"`. `themeSettingsSchema.activeTheme` therefore
   accepts one more value; existing `theme.json` stays valid.
2. `lib/themes/registry.mjs`: append the Spatial definition (`status: "available"`, four
   loaders).
3. `lib/portfolio/copy-schemas.mjs`: new strict `spatialCopySchema`, added to
   `copySettingsSchema`.
4. `portfolio-data/settings/copy/spatial.json`: new copy document, written in plain
   sentence-case UI language. It contains UI wording only — no facts.
5. `lib/portfolio/documents.mjs`: register `copy-spatial` (document count 20 → 21). The
   admin editor picks it up automatically through the registry.
6. `CLAUDE.md` and README references to theme and document counts updated.

`spatialCopySchema` covers: navigation (wordmark role, menu labels already shared),
motion control (`pause`, `enable`, `reduced`, `systemNote`), hero actions, section
headings and short intros, skills interaction (`selectPrompt`, `usedIn` template with
`{name}`, `noMatches`, `clearSelection`, `unmatchedGroup`), projects (`exploreAll` with
`{count}`, link labels), experience (`present`), writing states, resume, contact,
`/project` and `/blog` page copy, and an accessible description of the model
(`modelDescription`), all validated as `copyText` or `template(...)`.

## 5. Architecture

### Files

```
themes/spatial/
  view.mjs                 createSpatialView → createThemeView("spatial", …)
  presentation.mjs         view + graph (server)
  graph.mjs                pure graph derivation and layout
  shell.jsx                skip link, nav, footer, motion slot; imports spatial.scss + Archivo
  home.jsx                 sections in order; mounts SpatialStage (client) lazily
  projects.jsx, blog.jsx
  sections/*.jsx           hero, about, experience, skills, projects, education, writing, resume, contact
  client/
    selection.jsx          "use client": selection context shared by DOM controls and scene
    skills-explorer.jsx    "use client": aria-pressed buttons + live region (works without 3D)
    stage.jsx              "use client": tier decision, lazy import of scene
  scene/                   "use client", loaded only via next/dynamic(ssr:false)
    canvas.jsx             Canvas, lifecycle, DPR caps, frameloop control, context-loss
    stations.jsx           hero/skills/projects/experience stations, each in its own boundary
    graph-mesh.jsx, project-ring.jsx, spine.jsx
    camera-rig.jsx         scroll-driven camera (GSAP ScrollTrigger, no pinning)
lib/motion/
  preferences.mjs          read/write "portfolio-motion", reduced-motion query helpers (pure)
  capability.mjs           WebGL2 + software-renderer detection, compact-viewport check
app/css/spatial.scss       all rules scoped under .theme-spatial
```

Spatial imports nothing from `themes/{coding,cinematic,executive}` or
`app/components/portfolio/*`. It may use the shared `app/components/homepage/contact/contact-form`
(Executive precedent), `themes/shared/*`, and `lib/*`. Cinematic is not modified; it may
adopt `lib/motion/*` in a later, separately approved change.

### Rendering flow

1. Server: route → `getPortfolioRenderContext()` → Spatial slot → `createSpatialPresentation`
   builds view + graph → full semantic HTML for every section.
2. Client hydration: only the small islands (`selection`, `skills-explorer`, `stage`,
   motion control) hydrate.
3. `stage.jsx` decides the tier after hydration: `threeD` flag → WebGL2 capability →
   reduced motion / `portfolio-motion` / `animations` flag → compact viewport → software
   renderer. If tier 1 or 2, it requests the scene chunk via `requestIdleCallback`
   (fallback `setTimeout`) after first paint.
4. Scene: one fixed, `aria-hidden` canvas behind the content. Each station is wrapped in
   its own error boundary; a failing station disappears while the others continue.
   Selection state is shared with the DOM through the selection context.

### Fallback tiers

| Tier | Conditions | Behaviour |
|---|---|---|
| 1 Full | WebGL2, hardware renderer, motion allowed, `threeD` and `animations` on | Scroll-driven camera, assembly moment, idle drift, interactive graph and ring. DPR cap 1.5 desktop / 1 compact. |
| 2 Reduced | Reduced motion, paused via control, `animations: false`, or software renderer | Same scenes rendered on demand as static frames; camera jumps between station poses on section change; no idle drift or assembly. Software renderer: DPR 0.75, no antialias. |
| 3 None | No JS, no WebGL2, `threeD: false`, context loss, scene chunk failure | No canvas. All content and the skills selection (with JS) work in DOM. |

Compact viewports (< 768px) use tier 1/2 without the fixed canvas: the graph renders
inline inside the Skills section with technologies collapsed to category clusters until a
category is chosen; touch tap selects; no scroll-coupled camera.

### Performance and resource rules

- Frameloop `demand` when idle; `always` only while animating in tier 1.
- Rendering stops when the canvas is off-screen (IntersectionObserver) or the tab is hidden.
- Geometry and materials owned declaratively by Fiber; instanced meshes for technology
  nodes; one scratch `Object3D`; no per-frame allocation or React state updates.
- On unmount: dispose renderer, geometries, materials; kill GSAP contexts and triggers.
- `webglcontextlost` → tier 3 for the session, no retry loop.
- Budgets: Spatial client islands ≤ 15 kB gz; Spatial scene code ≤ 25 kB gz beyond the
  shared vendor chunks; draw calls ≤ 20 and ≤ 15k triangles per frame on desktop;
  CLS < 0.1 (canvas is fixed and out of flow; no layout depends on 3D); LCP element is
  server-rendered hero text.
- Other themes: `/`, `/project`, `/blog` first-load JS stays 124 kB (baseline measured
  2026-10-15 in `.next-spatial-baseline`); global CSS does not grow. `spatial.scss` and
  the Archivo font are imported from the Spatial shell; if the build shows them hoisted
  into global CSS, that is reported and all rules stay scoped under `.theme-spatial`.

### Accessibility

- Semantic landmarks, one `h1`, section headings in order, skip link, visible focus
  (`:focus-visible` with a 2px signal outline offset from the element).
- Canvas is `aria-hidden` and `tabIndex=-1`; every fact and every interaction exists in
  the DOM. Skills buttons use `aria-pressed`; results update a polite live region.
- Motion control (shared preference) is always reachable in the shell; it is disabled
  with an explanation when the system requests reduced motion.
- No flashing; camera moves are eased and bounded; no scroll-jacking or pinning.
- Touch targets ≥ 44px.

### Error handling

| Failure | Result |
|---|---|
| Invalid/missing Spatial copy | Content validation fails the build (existing loader behaviour) |
| Scene chunk fails to load | Tier 3, content unchanged |
| Station throws | That station's boundary renders nothing; others continue |
| WebGL context lost | Canvas removed; tier 3 for the session |
| `getArticles` fails | Existing unavailable copy |
| Preview cookie invalid | Existing silent fallback to public theme |

## 6. Testing

Unit (`node --test`, temporary data copies only):

- Registry: Spatial resolves, order matches `THEME_IDS`, four slots load.
- Copy: `spatialCopySchema` accepts the shipped document; rejects unknown keys, empty
  strings, unknown placeholders; `no-hardcoded-copy` covers `themes/spatial`.
- Documents: registry lists 21 documents, `copy-spatial` addressable in admin.
- Theme isolation: Spatial added to `theme-content-isolation` (fact changes reach it;
  no factual literals in the theme).
- Graph: normalization equivalences, unmatched handling, edge correctness against
  fixture data, deterministic layout, `relatedTo` results.
- Rendering: each section renders every fixture item (server render to string).
- Preview isolation: preview of `spatial` affects only the authorized session; public
  stays on the active theme.
- Tier selection: pure decision function covering flags, capability, reduced motion,
  stored preference, compact, software renderer.
- Contrast: token pairs meet the stated ratios.

Browser (Playwright CLI scripts in `tests/browser/`): Spatial preview via admin; no-JS
render; forced no-WebGL; reduced motion emulation; keyboard path through skills
selection; mobile/tablet/desktop layouts; touch selection; context-loss simulation;
other themes unchanged.

Each phase runs `npm run lint`, `npm run test:unit`, and `npm run build` and reports
real results. There is no TypeScript in this repo, so no type-check step exists.
Lighthouse runs locally against the production build; headless software rendering
numbers are labelled as such, and real mid-range device checks are listed as manual.

## 7. Phases

1. **Scaffold + tier 3** — ids/registry, copy schema + document, view/presentation,
   graph.mjs, all sections and `/project`, `/blog` as production-quality DOM; skills
   selection in DOM; scoped styles and font; tests above except scene-specific ones.
   Bundle check: other themes unchanged.
2. **Motion layer** — `lib/motion/*`, shared pause control, restrained DOM motion,
   reduced-motion behaviour, `animations` flag.
3. **Stage + hero scene** — tier decision, lazy scene chunk, canvas lifecycle, hero
   station with assembly moment, error boundaries, context loss.
4. **Signature stations** — skills graph, project ring, experience spine, scroll camera;
   compact inline graph; each station independently degradable.
5. **Hardening** — performance budgets, Lighthouse, responsive and touch checks,
   accessibility audit, docs (`docs/multi-theme/phase-8-*`), dependency-decisions note
   (no new packages).

After each phase: report files changed, decisions, tests with real results,
bundle/performance impact, risks, placeholders, next phase. No commits or pushes
without explicit approval.

## 8. Risks and open items

- **Mobile GPU cost** — mitigated by compact mode, DPR caps, demand frameloop; tier 2 is
  the safe default for software renderers.
- **CSS/font hoisting** — Next may include shell-imported CSS globally; measured in Phase 1.
- **Headless WebGL** — automated visual and performance checks run on a software
  renderer; real-device verification is manual.
- **Technology vocabulary drift** — normalization does not join different names
  (`"Material"` vs `"Material UI"`); these stay as unmatched nodes and are listed in the
  Phase 1 result so the owner can align the data if desired.
- **Placeholders** — none expected; Spatial uses only existing content. Any gap found is
  reported as `[TODO: …]` in copy, never invented.
