# Project detail pages — plan (SEO audit M1)

Status: **approved 2026-10-20 (D1 = A, D2 = A, D3 = A) and implemented, not committed.** See "Result" at the end.

## Goal

One indexable page per project in `portfolio-data/content/projects.json` (9 today), so
long-tail queries (Remmi CRM, POS Online Ordering, …) have a landing page.

## Current state (inspected 2026-10-20)

- Projects have a numeric `id` (1–9) and no slug. `problem` / `solution` / `outcome`
  are optional but must be supplied together; only 3 of 9 projects have them
  (MIS / Nexis, Remmi CRM, Group Captain). All 9 have `features` and `responsibilities`.
- `THEME_SLOTS` is `shell, home, projects, blog`; `createThemeDefinition` rejects
  missing or extra slots, and `theme-registry.test.mjs` asserts the set.
- `themes/shared/project-detail.mjs` already derives the features/responsibilities
  sections; Cinematic, Executive and Spatial reuse it.
- `lib/seo/metadata.mjs` (`pageMetadata`) and `lib/seo/structured-data.mjs` exist
  (uncommitted SEO work). `app/sitemap.js` maps `settings.site.publicRoutes`.
- Preview: `/preview/[themeId]/project` exists; `lib/admin/preview-links.mjs` maps
  only `/`, `/project`, `/blog`.

## Decisions for the owner

### D1 — How a theme renders the detail page (architecture)

- **A (recommended): fifth slot `project`.** Each theme gets `themes/<id>/project.jsx`
  in its own visual language. Keeps "each theme is genuinely distinct" and lazy
  loading per theme. Cost: four new components, registry + test change.
- B: one shared server component, themed only through the shell. Less code, but
  every theme would show the same detail layout, which contradicts the theme rules.

### D2 — URL key

- **A (recommended): add a required, unique `slug` to `projectSchema`**
  (`/project/remmi-crm`). Readable URLs help long-tail ranking. Slugs are derived
  from existing titles, so no facts are invented. The admin editor picks it up
  from the schema automatically.
- B: numeric id (`/project/4`). No schema change, weaker URLs.

### D3 — Missing problem / solution / outcome (6 of 9 projects)

- **A (recommended): omit those sections when absent.** The page still has the
  description, role, technologies, features and responsibilities. The gaps are
  listed in this doc as `[TODO: …]` items for the owner to fill through the admin
  editor. Nothing placeholder-like reaches public visitors.
- B: write `[TODO: project problem]` etc. into `projects.json` for the 6 projects.
  Complete sections, but the placeholders render publicly until filled.

## Implementation (assuming A / A / A)

1. **Data + schema** — `slug` field (kebab-case regex, unique across the collection),
   backfill 9 slugs, schema tests.
2. **SEO libs** — `projectPage(settings, project)` helper giving
   `{ path, title, description }`: title from a new copy template
   `routes.projectTitle` (`{project} — {siteName}`), description from
   `project.shortDescription`. `projectStructuredData(portfolio, project, page)`
   returns WebSite + WebPage (`mainEntity` → CreativeWork) + CreativeWork
   (`@id` `…/project/<slug>#project`, name, description, abstract = longDescription,
   keywords, genre, image, `url` = page URL, `sameAs` = demo/source links, creator
   → Person, `isPartOf` → the `/project` CollectionPage) + Person.
   The collection `ItemList` items point `url` at the detail page instead of the demo.
3. **Route** — `app/(portfolio)/project/[slug]/page.js`: `generateMetadata` via
   `pageMetadata`, `notFound()` for unknown slugs, JSON-LD, render the theme's
   `project` slot with `{ portfolio, project }`. Preview twin at
   `app/preview/[themeId]/project/[slug]/page.js`; `preview-links.mjs` learns
   `/project/<slug>`.
4. **Themes** — `project.jsx` for Coding, Cinematic, Executive, Spatial: hero
   (title, role, category, technologies), overview (longDescription), problem /
   solution / outcome when present, features, responsibilities, demo/source
   links, back link to `/project`. All labels are new copy keys in
   `settings/copy/*.json` + `copy-schemas.mjs`. Spatial's detail page is
   server-rendered with no 3D scene.
5. **Card links** — each theme's project card/entry links its title to
   `/project/<slug>` (Coding `project-card.jsx`, Cinematic `project-summary.jsx`,
   Executive `project-card.jsx`, Spatial `project-entry.jsx`).
6. **Sitemap / llms.txt** — `app/sitemap.js` appends one URL per project;
   `llms.txt` lists project pages.
7. **Tests** — unit: `projectPage` metadata (unique titles, canonical, description),
   `projectStructuredData` graph shape, sitemap entries, slug schema, preview-link
   mapping, registry slots, copy scan. Browser: each theme renders `/project/<slug>`
   via `/preview/<theme>/project/<slug>`, unknown slug → 404.
8. **Verify** — `npm run test:unit`, `npm run lint`, `npm run build`.

## Coordination

- Starts only after the SEO fixes on `codex/multi-theme-portfolio` are committed.
- The `static-isr-public-routes` session edits public routes too; the project
  route should follow whatever caching it lands (e.g. `generateStaticParams`).

## Owner TODO (content gaps, if D3 = A)

- [TODO: problem / solution / outcome] — POS Online Ordering, GetWorker,
  XfinityClassified Ad System, Smart Destination Project, Research Support Web
  Tool (RSWT), SmartCommerce – E-Commerce Widgets.

## Result (2026-10-20)

Implemented as planned, not committed.

- Data/schema: required `slug` on `projectSchema` (kebab-case, unique per collection); 9 slugs backfilled from titles.
- `lib/portfolio/projects.mjs`: `projectPath`, `findProjectBySlug`, `projectPageInfo` (title from copy `routes.projectTitle`, description = `shortDescription`).
- `lib/seo/structured-data.mjs`: `projectStructuredData` (WebSite + WebPage → CreativeWork + Person); collection items now share the CreativeWork node and point `url` at the detail page (demo/source move to `sameAs`).
- `lib/seo/sitemap.mjs` (`sitemapEntries`) used by `app/sitemap.js`; `llms.txt` links each project to its page.
- Routes: `app/(portfolio)/project/[slug]/page.js` (`generateStaticParams`, `notFound()` for unknown slugs), preview twin `app/preview/[themeId]/project/[slug]/page.js`; `preview-links.mjs` maps `/project/<slug>`.
- Fifth theme slot `project`: `themes/{coding,cinematic,executive,spatial}/project.jsx`. Cinematic reuses `ProjectSummary` (`detail` prop); Spatial reuses `ProjectEntry` (`standalone` prop).
- Card titles link to the detail page in all four themes (Coding `project-card.jsx` via adapter `href`, Cinematic `project-summary.jsx`, Executive `project-card.jsx`, Spatial `project-entry.jsx`).
- Copy: shared `routes.projectTitle`, `projectDetail.{backToProjects, overview}`; Coding `project.{problem, solution, outcome, source}`; Cinematic `project.problem`.

Verification: `npm run test:unit` 213/214 (the failure, `theme-settings.test.mjs` expecting `cinematic` while `settings/theme.json` is `coding`, predates this work); `npm run lint` clean; `npm run build` passes with `/project/[slug]` prerendered for 9 slugs. On `next start`: unknown slug and `/project/4` return 404, title/description/canonical/JSON-LD and sitemap checked. All four themes rendered `/project/remmi-crm` (desktop) and Coding/Cinematic/Executive/Spatial at 375 px without horizontal overflow.

Not done: browser-test script under `tests/browser/`; Spatial's 3D project ring does not link to detail pages (the server-rendered entries do).
