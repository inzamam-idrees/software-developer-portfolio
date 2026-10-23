# Spatial Theme Implementation Plan

Current-contract note (Phase 11): this historical plan predates individual project pages. All themes now require five lazy slots: shell, home, projects, project, blog.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a fourth portfolio theme, `spatial`, whose 3D system model (skills graph, project ring, experience spine) is derived from canonical data and degrades to a complete server-rendered page.

**Architecture:** Server renders every section from `createSpatialPresentation(portfolio)` (view + pure graph). Small client islands share a selection context; a lazily imported, `aria-hidden` R3F canvas mirrors that selection in 3D with per-station error boundaries. A pure tier decision chooses full / reduced / none.

**Tech Stack:** Next.js 15 App Router, React 19, plain JS (`.mjs`/`.jsx`), Sass, Zod 4, existing `three@0.186`, `@react-three/fiber@9.8`, `gsap@3.15` (ScrollTrigger). Tests: `node --test` (unit, pure `.mjs` only — no JSX loader) and Playwright CLI scripts in `tests/browser/`.

**Spec:** `docs/superpowers/specs/2026-10-15-spatial-theme-design.md`

## Global Constraints

- No new dependencies. Reuse `three`, `@react-three/fiber`, `gsap`.
- Theme id `spatial`, label `Spatial`, status `available`; appended after `executive` in both `THEME_IDS` and the registry.
- Do not change `portfolio-data/settings/theme.json` (public active theme stays `coding`).
- All visible wording comes from `view.copy` (shared + `spatial`); all facts from canonical content. `no-hardcoded-copy` must pass.
- Spatial imports nothing from `themes/{coding,cinematic,executive}` or `app/components/portfolio/*`. Allowed: `themes/shared/*`, `lib/*`, `app/components/homepage/contact/contact-form`.
- Cinematic is not modified.
- Motion preference key: `portfolio-motion`, values `"enabled"` / `"paused"` (shared with Cinematic).
- Technology matching: lower-case, remove whitespace and punctuation; no schema change.
- Skill proficiency is never displayed or encoded visually.
- Styles: `app/css/spatial.scss`, every rule under `.theme-spatial`; imported from `themes/spatial/shell.jsx`, not `app/layout.js`. Font: Archivo via `next/font/google` in the shell.
- Tokens: `--sp-ground #E3E6E8`, `--sp-surface #D3D8DC`, `--sp-ink #0E1B26`, `--sp-soft #4A5763`, `--sp-signal #2347E8`, `--sp-field #0E1B26`, `--sp-field-ink #E3E6E8`, `--sp-field-signal #8EA6FF` (adjust only to pass contrast; record final values).
- Contrast: text ≥ 4.5:1; large text and UI boundaries ≥ 3:1.
- Budgets: other themes' `/`, `/project`, `/blog` first-load JS stay 124 kB; global CSS does not grow; Spatial client islands ≤ 15 kB gz; Spatial scene code ≤ 25 kB gz beyond shared vendor chunks; ≤ 20 draw calls and ≤ 15k triangles/frame desktop; CLS < 0.1.
- DPR caps: 1.5 desktop, 1 compact (< 768px), 0.75 software renderer.
- Unit tests never write the real `portfolio-data/` (use `cp -r` into a temp dir).
- **No commits or pushes.** CLAUDE.md requires explicit owner authorization; every phase ends at a checkpoint where the owner reviews and decides. Commit steps below are written as checkpoints.
- Browser scripts for Spatial use origin `http://127.0.0.1:3019`, a writable data copy in `PORTFOLIO_DATA_DIR` with `activeTheme: "spatial"` (temp copy only), and an isolated build dir `PORTFOLIO_BUILD_DIR=.next-spatial`.

## Review Focus

1. **Duplicate technologies after normalization** (`"React"` in a project and `"react"` in a role, or `"TailwindCSS"` vs `"Tailwind CSS"`) — expect one node and no duplicate edges. Test: Task 2 `dedupes normalized technologies and edges`.
2. **No featured projects** (owner unfeatures all in admin) — expect the Projects section to render the all-projects link and an empty ring without errors. Tests: Task 3 `presentation tolerates zero featured projects`; Task 11 ring renders with 0 objects (browser).
3. **Preference set to paused in Cinematic, then Spatial activated** — expect Spatial to start in the reduced tier with the control showing "enable". Test: Task 8 `reads the shared portfolio-motion key`; Task 9 `paused preference selects reduced`.
4. **Viewport crosses 768px after the scene mounted** (rotate tablet, resize window) — expect exactly one canvas and a switch between fixed and inline layouts, no leaked contexts. Test: Task 12 browser step.
5. **Long names and headlines at 320px** — expect wrapping without horizontal overflow. Test: Task 6 browser step with a long-text fixture.

---

## Phase 1 — Scaffold and tier 3 (no 3D)

### Task 1: Register the theme and its copy document

**Files:**
- Modify: `lib/themes/ids.mjs`, `lib/themes/registry.mjs`
- Modify: `lib/portfolio/copy-schemas.mjs` (add `spatialCopySchema`, add to `copySchemaByTheme`)
- Modify: `lib/portfolio/documents.mjs` (register `copy-spatial`)
- Create: `portfolio-data/settings/copy/spatial.json`
- Create: `themes/spatial/view.mjs`; placeholder slot files `themes/spatial/{shell,home,projects,blog}.jsx` (minimal valid components returning the shell wrapper / `null`, replaced in Task 6)
- Test: `tests/unit/theme-registry.test.mjs`, `tests/unit/theme-copy.test.mjs`, `tests/unit/document-registry.test.mjs`, `tests/unit/theme-preview.test.mjs`, `tests/unit/theme-content-isolation.test.mjs`

**Interfaces:**
- Produces: `createSpatialView(portfolio)` → `createThemeView("spatial", portfolio)`; `copySchemaByTheme.spatial`; document id `copy-spatial`, name `copy.spatial`, label `Spatial theme copy`, path `settings/copy/spatial.json`.

`spatialCopySchema` (built with existing `strictTree`, `textKeys`, `template`):

```js
strictTree({
  navigation: textKeys("wordmarkRole"),
  footer: textKeys("backToTop", "source"),
  motion: textKeys("pause", "enable", "reduced", "systemNote"),
  home: {
    hero: textKeys("contactAction", "resumeAction", "modelDescription"),
    about: { heading: copyText, portraitAlt: template("name") },
    experience: { ...textKeys("heading", "present"), technologiesLabel: template("role") },
    skills: {
      ...textKeys("heading", "intro", "selectPrompt", "noMatches", "clearSelection",
        "unmatchedGroup", "projectsLabel", "rolesLabel"),
      usedIn: template("name"),
    },
    projects: { ...textKeys("heading", "intro", "viewProject", "viewSource"), exploreAll: template("count") },
    education: textKeys("heading", "awardsHeading"),
    writing: textKeys("heading", "empty", "unavailable", "profileAction", "loading", "loadingLabel"),
    resume: textKeys("heading", "body"),
    contact: textKeys("basedIn", "emailLabel", "socialLabel"),
  },
  project: textKeys("problem", "solution", "outcome", "features", "responsibilities", "visit", "source"),
  projects: { ...textKeys("heading", "contactAction"), count: template("count") },
  blog: {
    ...textKeys("heading", "intro", "empty", "unavailable", "profileAction", "fallbackDate"),
    readingTime: template("minutes"),
  },
})
```

Wording in `spatial.json`: plain sentence case, UI language only, no names, dates, employers, metrics or project facts.

- [ ] **Step 1: Update tests to expect Spatial**
  - `theme-registry`: ids `["coding","cinematic","executive","spatial"]`; `getThemeDefinition("spatial").label === "Spatial"`, `.status === "available"`.
  - `theme-copy`: copy keys `["cinematic","coding","executive","shared","spatial"]`; `copySchemaByTheme.spatial.safeParse(shipped).success === true`; rejects an extra key, a padded string, and `usedIn: "{title}"` (unknown placeholder).
  - `document-registry`: id list ends with `"copy-spatial"`; 21 ids; `getDocumentDefinition("copy-spatial").name === "copy.spatial"`.
  - `theme-preview`: authorized preview of `"spatial"` → `{ theme.id: "spatial", mode: "preview" }`, settings unchanged; unauthorized → active theme, `mode: "public"`.
  - `theme-content-isolation`: add `["spatial", createSpatialView]` to `themeViews`.
- [ ] **Step 2: Run** `npm run test:unit` — Expected: the updated assertions FAIL (unknown theme / missing copy).
- [ ] **Step 3: Implement** ids, registry entry, schema, document registration, `spatial.json`, `view.mjs`, minimal slot files.
- [ ] **Step 4: Run** `npm run test:unit && npm run validate:content` — Expected: all PASS, validation OK.
- [ ] **Step 5: Checkpoint** (no commit).

### Task 2: Pure graph derivation

**Files:**
- Create: `themes/spatial/graph.mjs`
- Test: `tests/unit/spatial-graph.test.mjs`

**Interfaces:**
- Produces:
  - `normalizeTechnology(name: string) => string`
  - `buildSpatialGraph({ skills, projects, experience }) => { nodes: SpatialNode[], edges: [string, string][] }` where `SpatialNode = { id, kind: "category"|"technology"|"project"|"role", label, categoryId: string|null, unmatched: boolean, position: [x, y, z] }`
  - Node ids: `category:<category.id>`, `tech:<normalized>`, `project:<project.id>`, `role:<experience.id>`.
  - `relatedTo(graph, nodeId) => { technologies: string[], projects: string[], roles: string[] }` (node ids, sorted by the source collections' `order`).

Layout: deterministic (no `Math.random`, no time). Categories evenly on a ring in `order`; their technologies on a small ring around each category; projects on an outer ring above the plane, roles on an outer ring below. Coordinates rounded to 3 decimals. Unmatched technologies share one cluster outside the category ring. Technology label = the `skills.all` spelling when matched, else the first spelling seen.

- [ ] **Step 1: Write failing tests**
  - `normalizes case, whitespace and punctuation`: `"Tailwind CSS"`, `"TailwindCSS"`, `"tailwind-css"` → same; `"Next.js"` → `"nextjs"`; `"Material"` ≠ `"Material UI"`.
  - `dedupes normalized technologies and edges`: fixture with `"React"` in a project and `"react"` in a role → one `tech:react` node; `edges` has no duplicate pairs.
  - `links categories, technologies, projects and roles from canonical data`: using `loadCanonicalPortfolio({ env: {} })` + `buildCurrentPortfolioView`, every category has one node; every project and role has one node; every edge endpoint exists.
  - `flags unmatched technologies`: canonical project technology `"Material"` → node `unmatched: true`, `categoryId: null`.
  - `layout is deterministic`: two builds deep-equal; all coordinates finite.
  - `relatedTo returns connected projects and roles`: for a fixture tech used by project 2 and role 1 → `{ projects: ["project:2"], roles: ["role:1"] }`; for a category id → union of its technologies' projects/roles.
  - `uses no proficiency data`: building with `proficiency: {}` deep-equals building with the canonical proficiency.
- [ ] **Step 2: Run** `node --test tests/unit/spatial-graph.test.mjs` — Expected: FAIL (module missing).
- [ ] **Step 3: Implement** `graph.mjs`.
- [ ] **Step 4: Run** the same — Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 3: Presentation model

**Files:**
- Create: `themes/spatial/presentation.mjs`
- Test: `tests/unit/spatial-presentation.test.mjs`

**Interfaces:**
- Consumes: `createSpatialView`, `buildSpatialGraph`, `projectDetailSections` (`themes/shared/project-detail.mjs`).
- Produces: `createSpatialPresentation(portfolio)` → frozen `{ ...view, graph, skillGroups, unmatchedTechnologies }` where `skillGroups = [{ id, label, title, summary, technologies: [{ nodeId, label }] }]` in category `order`, and `unmatchedTechnologies = [{ nodeId, label }]`.

- [ ] **Step 1: Write failing tests**
  - `exposes every content item the sections render`: counts of `experience`, `education`, `awards`, `featuredProjects`, `projects`, `skillGroups` equal the canonical collections; each `skillGroups[i].technologies` labels equal the category's technologies.
  - `presentation tolerates zero featured projects`: fixture with all `featured: false`, `featuredOrder: null` → `featuredProjects` is `[]`, no throw.
  - `contains no proficiency`: `JSON.stringify(skillGroups)` does not include `"proficiency"`.
- [ ] **Step 2: Run** `node --test tests/unit/spatial-presentation.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 4: Shell, tokens, font and contrast

**Files:**
- Create: `app/css/spatial.scss`
- Modify: `themes/spatial/shell.jsx` (replace placeholder)
- Test: `tests/unit/spatial-contrast.test.mjs`

**Interfaces:**
- Produces: shell markup `<div className="theme-spatial" data-theme-id="spatial">` with skip link (`copy.navigation.skipToContent`), nav from enabled `settings.navigation.items`, `<main id="main-content" tabIndex={-1}>`, `<div id="spatial-motion-slot" />`, footer (`copy.footer.*`, `settings.site`). Archivo from `next/font/google` (`subsets: ["latin"]`, `axes: ["wdth"]`, `variable: "--sp-font"`).

- [ ] **Step 1: Write failing test** `token pairs meet contrast targets`: parse `--sp-*` hex values from `app/css/spatial.scss`; assert WCAG ratios — ink/ground, ink/surface, soft/ground, signal/ground ≥ 4.5; field-ink/field, field-signal/field ≥ 4.5; signal/surface ≥ 3.
- [ ] **Step 2: Run** `node --test tests/unit/spatial-contrast.test.mjs` — Expected: FAIL (file missing).
- [ ] **Step 3: Implement** `spatial.scss` (tokens, type steps, layout primitives, `:focus-visible` 2px signal outline with offset, touch targets ≥ 44px, `@media (prefers-reduced-motion: reduce)` disables transitions) and the shell.
- [ ] **Step 4: Run** — Expected: PASS (adjust token values only if a ratio fails; record changes).
- [ ] **Step 5: Checkpoint.**

### Task 5: DOM skills explorer (client island)

**Files:**
- Create: `themes/spatial/client/selection.jsx`, `themes/spatial/client/skills-explorer.jsx`

**Interfaces:**
- Consumes: `relatedTo` (Task 2), presentation `skillGroups`, `unmatchedTechnologies`, `graph`.
- Produces: `SelectionProvider({ graph, children })`; `useSelection() => { selectedId: string|null, related: ReturnType<relatedTo>|null, select(id: string|null) }`. `SkillsExplorer({ skillGroups, unmatchedTechnologies, projects, experience, copy })` renders, per group, a heading and `<button type="button" aria-pressed>` per technology; a "clear" button (`copy.clearSelection`); a `role="status" aria-live="polite"` region showing `formatCopy(copy.usedIn, { name })` with project titles and role/company lists (or `copy.noMatches`), and `copy.selectPrompt` when nothing is selected. Pressing a selected button again clears it.

Server-rendered output (before hydration) shows all technologies as plain list text; buttons become active after hydration. Verified in Task 6's browser script.

- [ ] **Step 1: Implement** both files.
- [ ] **Step 2: Run** `npm run lint` — Expected: no errors.
- [ ] **Step 3: Checkpoint.**

### Task 6: Sections, routes and Phase 1 browser acceptance

**Files:**
- Create: `themes/spatial/sections/{hero,about,experience,skills,projects,education,writing,resume,contact}.jsx`
- Modify: `themes/spatial/{home,projects,blog}.jsx`
- Create: `tests/browser/spatial-acceptance.js`
- Modify: `tests/browser/theme-preview-security.js` (add `spatial` to the light-preview check for Phase 1)

**Interfaces:**
- Consumes: `createSpatialPresentation`, `SelectionProvider`, `SkillsExplorer`, `getArticles`, `ContactForm`, `PersonJsonLd`, `formatCopy`.
- Produces: section ids `about`, `experience`, `skills`, `projects`, `education`, `contact` (match navigation hrefs); one `h1` (profile name) in the hero; experience as `<ol>`; writing inside `Suspense` with `copy.home.writing.loading`; feature flags `articles`, `contactForm` (+ `contact.form.enabled`), `resume` honoured; `/project` lists all projects with `projectDetailSections`; `/blog` via `getArticles` with empty/unavailable states.

- [ ] **Step 1: Write `spatial-acceptance.js`** asserting, at widths 1440, 1024, 768, 390, 320:
  - `[data-theme-id="spatial"]` present; one `h1`; profile name, designation, every experience role, every featured project title, every category title, every education qualification and award title visible (expected strings hardcoded in the test from the canonical data, as `executive-acceptance.js` does — tests may contain facts; themes may not).
  - No horizontal overflow; also with a long-text fixture (name and headline 120 chars) at 320px.
  - No script body matches `/WebGLRenderer|__r3f|GreenSock|GSAP 3\./` (Phase 1 ships no 3D/motion).
  - JS disabled context (`javaScriptEnabled: false`): all section headings and technologies present.
  - Keyboard: Tab reaches skip link first; pressing a technology button sets `aria-pressed="true"` and the status region text contains a related project title.
  - Mobile (390): tapping a technology button updates the status region.
- [ ] **Step 2: Run** against a server: `PORTFOLIO_BUILD_DIR=.next-spatial npm run build && PORTFOLIO_BUILD_DIR=.next-spatial PORTFOLIO_DATA_DIR=<tmp copy> npm run start -- --port 3019`, then `playwright-cli -s=portfolio run-code --filename=tests/browser/spatial-acceptance.js` — Expected: FAIL before sections exist.
- [ ] **Step 3: Implement** sections and slot files.
- [ ] **Step 4: Run** the script again — Expected: PASS. Also run `theme-preview-security.js` (port 3017 setup per its header) — Expected: PASS for all four themes.
- [ ] **Step 5: Checkpoint.**

### Task 7: Phase 1 verification and report

**Files:**
- Create: `docs/multi-theme/phase-8a-spatial-scaffold-result.md`

- [ ] **Step 1: Run** `npm run lint`, `npm run test:unit`, `PORTFOLIO_BUILD_DIR=.next-spatial npm run build` — Expected: all pass; record real output.
- [ ] **Step 2: Compare bundles** with `.next-spatial-baseline`: route table for `/`, `/project`, `/blog` (expect 124 kB); total size of `static/css/*.css` (expect no growth in CSS loaded by other themes — check which CSS files a Coding page requests in the browser). If `spatial.scss` or the font is hoisted globally, record it.
- [ ] **Step 3: List** unmatched technologies from the canonical graph for the owner.
- [ ] **Step 4: Write** the phase result (files, decisions, tests with real results, bundle impact, risks, placeholders, next phase).
- [ ] **Step 5: Stop for owner review** (owner decides on commit).

---

## Phase 2 — Motion layer

### Task 8: Shared motion preference and control

**Files:**
- Create: `lib/motion/preferences.mjs`, `themes/spatial/client/motion.jsx`
- Modify: `themes/spatial/shell.jsx`, `app/css/spatial.scss`
- Test: `tests/unit/motion-preferences.test.mjs`, `tests/browser/spatial-motion.js`

**Interfaces:**
- Produces: `MOTION_STORAGE_KEY = "portfolio-motion"`; `readMotionPreference(storage) => "enabled"|"paused"` (missing/throwing storage → `"enabled"`); `writeMotionPreference(storage, enabled: boolean) => void` (never throws). `MotionProvider({ animationsEnabled, children })`, `useMotion() => { enabled, reduced, ready, setEnabled }` (`enabled = ready && preference==="enabled" && !reduced && animationsEnabled`); `MotionControl({ copy })` portalled into `#spatial-motion-slot`, `aria-pressed`, disabled with `copy.systemNote` when reduced. Root sets `data-motion="enabled|paused"`.

DOM motion: only state-change transitions (selection highlight, related-item emphasis, focus scroll with `behavior: "smooth"` only when `enabled`). CSS transitions apply only under `.theme-spatial[data-motion="enabled"]`.

- [ ] **Step 1: Write failing unit tests**: `reads the shared portfolio-motion key` (storage stub `{ getItem: k => k==="portfolio-motion" ? "paused" : null }` → `"paused"`); `defaults to enabled when storage throws`; `write stores "enabled"/"paused" and swallows errors`.
- [ ] **Step 2: Run** `node --test tests/unit/motion-preferences.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Implement** module, provider, control, styles.
- [ ] **Step 4: Run** unit test — PASS. Browser script `spatial-motion.js`: with `reducedMotion: "reduce"` the control is disabled and describes the system note, and computed `transition-duration` of a selected technology button is `0s`; with motion allowed, toggling sets `localStorage["portfolio-motion"]` to `"paused"` and `data-motion="paused"`; a context pre-seeded with `"paused"` starts paused. Expected: PASS.
- [ ] **Step 5: Run** lint, unit suite, build; write `docs/multi-theme/phase-8b-spatial-motion-result.md`; **stop for owner review.**

---

## Phase 3 — Stage and hero scene

### Task 9: Capability detection and tier decision

**Files:**
- Create: `lib/motion/capability.mjs`, `lib/motion/tier.mjs`
- Test: `tests/unit/spatial-tier.test.mjs`

**Interfaces:**
- Produces:
  - `detectWebGL(doc) => { webgl2: boolean, software: boolean }` — creates a canvas, requests `webgl2`, reads `UNMASKED_RENDERER_WEBGL` when available, matches `/swiftshader|llvmpipe|software/i`, loses the probe context; any throw → `{ webgl2: false, software: false }`.
  - `COMPACT_QUERY = "(max-width: 767px)"`.
  - `decideSceneTier({ threeD, animations, webgl2, software, reducedMotion, preference }) => "full"|"reduced"|"none"`: `!threeD || !webgl2` → `"none"`; `reducedMotion || preference === "paused" || !animations || software` → `"reduced"`; else `"full"`.

- [ ] **Step 1: Write failing tests**: each rule above as a case (including `paused preference selects reduced`, `threeD false wins over everything`, `software renderer selects reduced`); `detectWebGL` with a fake document whose `getContext` returns `null` → `{ webgl2: false }`, one that throws → `{ webgl2: false }`, one reporting `"SwiftShader"` → `software: true`.
- [ ] **Step 2: Run** `node --test tests/unit/spatial-tier.test.mjs` — Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 10: Stage, canvas lifecycle and hero station

**Files:**
- Create: `themes/spatial/client/stage.jsx`, `themes/spatial/scene/{canvas,stations,station-boundary,hero-model}.jsx`
- Modify: `themes/spatial/home.jsx`, `app/css/spatial.scss`
- Test: `tests/browser/spatial-scene.js`

**Interfaces:**
- Consumes: `useMotion`, `useSelection`, `detectWebGL`, `decideSceneTier`, `COMPACT_QUERY`, presentation `graph`.
- Produces: `SpatialStage({ graph, features })` renders nothing until hydrated, sets `data-scene-tier="full|reduced|none"` and `data-scene-status="idle|loading|ready|fallback"` on `.spatial-stage`; imports `scene/canvas.jsx` with `next/dynamic({ ssr: false })` only for `full|reduced`, scheduled via `requestIdleCallback` (fallback `setTimeout(…, 200)`) after `load`. `SpatialCanvas({ graph, tier, compact, software, onReady, onUnavailable })`: `aria-hidden`, `tabIndex={-1}`, DPR `[software ? 0.75 : 1, compact ? 1 : 1.5]`, frameloop `"always"` only when tier `full` and visible and on-screen, else `"demand"`; IntersectionObserver + `visibilitychange` pause; `webglcontextlost` → `onUnavailable()` (stage switches to tier `none` for the session, unmounts canvas). `StationBoundary({ name, children })` renders `null` on error and leaves siblings running. Hero station: instanced technology nodes and category nodes from `graph`, assembly animation once in `full`, static final pose in `reduced`. Matte materials, one key + hemisphere light, no textures.

- [ ] **Step 1: Write `spatial-scene.js`**: 
  - normal context → `.spatial-stage[data-scene-status="ready"]`, one `canvas[aria-hidden="true"]`, hero `h1` visible before any 3D script response (record response order);
  - init script making `getContext("webgl2")` return `null` → `data-scene-tier="none"`, no canvas, no script matching `/WebGLRenderer|__r3f/`;
  - `reducedMotion: "reduce"` → `data-scene-tier="reduced"`;
  - lose context via `WEBGL_lose_context` → canvas removed, `data-scene-tier="none"`, content intact, no page errors;
  - CLS from `PerformanceObserver("layout-shift")` < 0.1;
  - `/project` and `/blog` load no script matching `/WebGLRenderer|__r3f|GreenSock|GSAP 3\./`;
  - data copy with `features.threeD: false` → `data-scene-tier="none"` and no 3D script requested.
- [ ] **Step 2: Run** against port 3019 — Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — Expected: PASS. Update `theme-preview-security.js`: Spatial now loads 3D lazily (move it from the light list to a check that 3D scripts arrive only after `load`).
- [ ] **Step 5: Run** lint, unit, build; measure Spatial chunk sizes (gzip) vs budgets and confirm other routes still 124 kB; write `docs/multi-theme/phase-8c-spatial-stage-result.md`; **stop for owner review.**

---

## Phase 4 — Signature stations

### Task 11: Skills graph and project ring stations

**Files:**
- Create: `themes/spatial/scene/{graph-mesh,project-ring}.jsx`
- Modify: `themes/spatial/scene/stations.jsx`, `themes/spatial/sections/projects.jsx` (focus syncing), `themes/spatial/client/selection.jsx` (add `focusedProjectId`, `focusProject(id)`)
- Test: extend `tests/browser/spatial-scene.js`

**Interfaces:**
- Consumes: `useSelection` (`selectedId`, `related`, `select`, `focusedProjectId`, `focusProject`).
- Produces: graph station — edges as one `LineSegments`; selected path drawn in signal colour; R3F pointer events on nodes call `select(nodeId)` (tap and click). Project ring — one procedural object per featured project (form chosen by `category` hash, facet count by technology count, both deterministic), ring rotation follows `focusedProjectId`; projects section sets focus on hover/focus/IntersectionObserver of each entry. The stage exposes `data-selected="<nodeId|"">"` and `data-focused-project="<id|"">"` for tests (state attributes, not debug hooks).

- [ ] **Step 1: Extend the browser script**: pressing a technology button sets `.spatial-stage[data-selected]` to `tech:<normalized>`; focusing the second featured project entry sets `data-focused-project`; fixture with no featured projects → ready status, no page errors.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Checkpoint.**

### Task 12: Experience spine, scroll camera, compact mode

**Files:**
- Create: `themes/spatial/scene/{spine,camera-rig}.jsx`
- Modify: `themes/spatial/scene/stations.jsx`, `themes/spatial/client/stage.jsx`, `themes/spatial/sections/skills.jsx`, `app/css/spatial.scss`
- Test: extend `tests/browser/spatial-scene.js`

**Interfaces:**
- Produces: camera rig — one GSAP context with ScrollTrigger reading section anchors `#skills`, `#projects`, `#experience`; no pinning, no snapping; in `reduced`, poses jump on section change (IntersectionObserver) and render on demand; killed on unmount. Spine — one plate per experience role along −z in `order`. Compact (`COMPACT_QUERY` matches): stage moves the canvas into `#spatial-skills-canvas` inside the Skills section (no fixed canvas, no camera rig), graph shows category clusters until a category is selected. Exactly one canvas exists at any time; crossing the breakpoint re-parents via a single mount, disposing the previous renderer.

- [ ] **Step 1: Extend the browser script**: at 1440 the canvas is `position: fixed`; resize to 390 → exactly one canvas, inside `#skills`; resize back → one fixed canvas; `performance.memory`-independent check: count of `webglcontextcreated`-equivalent (instrument via init script wrapping `getContext`) ≤ 2 over the round trip, and the previous canvas was removed. Scrolling from top to `#experience` changes no layout (CLS < 0.1).
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement.**
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Run** lint, unit, build; write `docs/multi-theme/phase-8d-spatial-stations-result.md`; **stop for owner review.**

---

## Phase 5 — Hardening and docs

### Task 13: Performance, accessibility and device checks

**Files:**
- Modify (as findings require): `themes/spatial/**`, `app/css/spatial.scss`
- Create: `docs/multi-theme/phase-8e-spatial-hardening-result.md`

- [ ] **Step 1: Measure** draw calls and triangles with a local, uncommitted instrumentation patch that logs `gl.info.render` once per station; revert it after recording. Expected: ≤ 20 calls, ≤ 15k triangles desktop.
- [ ] **Step 2: Measure** gzip sizes of Spatial islands and scene chunks against budgets; route table vs baseline.
- [ ] **Step 3: Lighthouse** on the production build (mobile preset) for Spatial `/` — ask the owner before using `npx lighthouse` (it downloads a tool). Record LCP, CLS, TBT, labelled as headless/software-rendered.
- [ ] **Step 4: Accessibility pass** with the `impeccable` audit reference and keyboard-only walkthrough; fix findings; re-run all Spatial browser scripts plus `navigation.js`, `theme-responsive.js`, `touch.js`, `theme-preview-security.js`, `executive-acceptance.js` against their documented ports. Expected: PASS.
- [ ] **Step 5: Record** manual checks still needed on real devices (mid-range Android, iPad, iPhone Safari).

### Task 14: Documentation

**Files:**
- Modify: `CLAUDE.md` (status, theme list, document count 21, Spatial component locations), `README.md` (theme list), `docs/portfolio/dependency-decisions.md` (Spatial adds no packages; scene budget)
- Create: `docs/multi-theme/phase-8-spatial-result.md` (summary linking 8a–8e)

- [ ] **Step 1: Write** the updates.
- [ ] **Step 2: Run** `npm run lint`, `npm run test:unit`, `npm run build` one final time — record real results.
- [ ] **Step 3: Stop for owner review** (commit and any activation are the owner's decisions).
