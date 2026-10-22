# Multi-theme portfolio architecture

Current contract (updated Phase 11): five lazy slots — `shell`, `home`, `projects`, `project`, `blog`. Individual project pages were added after the original Phase 3. Registered themes are Coding, Cinematic, Executive, Spatial and Prism.

Phase 3 introduces a presentation-only theme boundary around the validated canonical
portfolio model. The active development default remains Cinematic; that is a migration
state, not a final public design decision.

## Content and presentation flow

```text
PORTFOLIO_DATA_DIR (or bundled portfolio-data/)
                    │
                    ▼
     fixed-manifest loader + strict Zod validation
                    │
                    ▼
        buildCurrentPortfolioView(portfolio)
                    │
         settings.theme.activeTheme
                    │
                    ▼
     registry ── resolves one theme definition
        │
        ├── shell slot
        ├── home slot
        ├── projects slot
        ├── project slot
        └── blog slot
                    │
                    ▼
       Coding | Cinematic | Executive placeholder
```

Professional content travels down this graph once. Themes receive the already loaded
and validated portfolio object; they do not receive filesystem access and do not own
profile, project, experience, education, skill, resume, article, social, contact, or
about data.

## Registry and contract

`lib/themes/registry.mjs` is the registry. A definition has:

- a stable lowercase `id`;
- a user-facing `label`;
- an `available` or `architecture-ready` status; and
- lazy import functions for the exact `shell`, `home`, `projects`, `project`, and `blog` slots.

The registry currently contains `coding`, `cinematic`, `executive`, `spatial`, and `prism`. Creative and
Minimal are intentionally absent. `createThemeDefinition` rejects invalid IDs,
statuses, missing slots, and extra slots. The contract remains JavaScript-native and
does not add TypeScript or another framework.

Every slot receives `{ portfolio }`. Theme view factories call `createThemeView`,
which rejects unknown themes and missing canonical domains. Theme-specific labels,
layout choices, CSS, animation, diagrams, and compatibility projections remain in the
theme layer.

## Active theme resolution

`portfolio-data/settings/theme.json` contains the single validated setting:

```json
{ "activeTheme": "cinematic" }
```

The strict Zod setting accepts only registered IDs. `resolveActiveTheme(settings)`
resolves the definition and `loadThemeSlot(settings, slot)` imports the selected slot.
The public URLs stay `/`, `/project`, and `/blog`; there are no public theme routes,
query-string selectors, preview controls, or mutation endpoints. A future validated
settings update can select another registered theme without introducing a database.

Theme preview and activation are deliberately outside Phase 3. A future preview must
render independently and must never mutate this active public setting.

## Theme implementations

### Coding

The Coding theme reproduces the `master` reference presentation: dark navy canvas,
teal/pink/purple accents, code-window hero and project cards, Lottie experience and
education artwork, skill marquee, compact navigation, repository footer, and the
existing contact interaction. `themes/coding/adapter.mjs` projects canonical records
into the legacy component shapes. It holds label compatibility only; it is not a
content store. The contact form retains the current validated `/api/contact` request
and failure behavior.

### Cinematic

The Cinematic theme moves the existing shell and route presentations behind the
registry without a visual redesign. It preserves the section order, structured Person
data, responsive navigation, contact form, reduced-motion behavior, GSAP scroll
coordination, lazy Fiber canvas, WebGL fallback, and context-loss handling.

### Executive

Executive is registered as `architecture-ready`. Its deliberately plain semantic
placeholder proves the contract and canonical data flow across all public routes. It
does not represent the future recruiter-first visual design and adds no 3D, GSAP, or
decorative animation. Full Executive design and recruiter/usability review belong to
a later explicitly approved phase.

## Lazy-loading boundary

The selected server slot controls which client components are rendered. Cinematic's
Three/Fiber/GSAP libraries remain dynamic chunks. Production browser analysis checks
the downloaded script bodies for the actual `WebGLRenderer`, `__r3f`, GreenSock, and
GSAP library signatures:

| Active theme | Script responses | Script bytes | Heavy runtime chunks | Canvas |
|---|---:|---:|---:|---:|
| Coding | 11 | 731,507 | 0 | 0 |
| Cinematic | 16 | 1,470,276 | 5 | 1 |
| Executive | 9 | 417,103 | 0 | 0 |

Next.js includes a small client-reference/controller chunk in the route manifest
because the server-rendered route can select any registered presentation. That chunk
contains deferred import calls but does not download or initialize the GSAP, Three.js,
or Fiber libraries. The network proof above verifies the meaningful heavy-dependency
boundary rather than assuming that a source-level dynamic import is sufficient.

## Adding a future theme

1. Create `themes/<id>/view.mjs` as a thin `createThemeView` wrapper.
2. Add presentation-only `shell.jsx`, `home.jsx`, `projects.jsx`, `project.jsx`, and `blog.jsx` slots.
3. Add the ID to `lib/themes/ids.mjs`, the Zod theme enum, and the registry definition.
4. Consume only the supplied canonical portfolio object. Add no theme-local JSON,
   direct `portfolio-data` reads, or legacy `utils/data` imports.
5. Add the theme to the shared-fixture, mutation, responsive, route, and downloaded
   module-isolation tests.
6. Keep theme-specific design settings inside the theme directory. Do not extend the
   canonical professional-content schema for visual preferences.

## Persistence and deployment

`PORTFOLIO_DATA_DIR` remains the configurable root. Any later runtime editing requires
a persistent writable filesystem. Normal ephemeral Vercel or Netlify deployments are
not compatible with durable runtime file persistence; a platform with a persistent
writable volume is required before the personal CMS can safely mutate these files.
