# Phase 10 result — static public routes and per-theme stylesheets

Status: **implemented, verified locally, committed with owner approval.** Plan and decisions:
`phase-10-static-public-routes-plan.md` (D1-A, D2-A, D3-A approved 2026-10-20;
build-time theme stylesheets approved 2026-10-21). Closes SEO audit H4 and M6 locally.

## What changed

### Static / ISR public routes (H4)
- `lib/portfolio/render-context.mjs`: `getPortfolioRenderContext()` resolves the active
  theme only. It no longer reads cookies or admin state, so no visitor can get a
  preview on a public route, even with a forged or stale cookie.
- `app/layout.js`: `force-dynamic` removed.
- `app/(portfolio)/layout.js`: preview `noindex` branch removed (dead now).
- `app/(portfolio)/blog/page.js`: `export const revalidate = 3600` (matches the dev.to fetch).
- `app/admin/layout.js`: `export const dynamic = "force-dynamic"` (explicit); imports `admin.scss`.
- `app/preview/[themeId]/layout.js`: imports `admin.scss` (preview bar). Already `force-dynamic`.
- `app/admin/theme/preview/route.js`: keeps 401/403/400/503 checks, redirects 303 to
  `/preview/<id>` and issues no cookie; `action=end` clears any old cookie and
  redirects to `/admin/theme`. `lib/admin/server.mjs`: unused `issueThemePreview` removed.
  `getAdminRequestState()` still verifies an old cookie so the admin page can offer
  "End preview".

### Per-theme stylesheets (M6)
- Finding: theme slots are loaded with `import()` in server components, so every theme
  module sits in each route's server graph and Next links all their CSS. Spatial's
  shell import was already linked on every theme's pages. Moving imports into shells
  would not have reduced bytes.
- `scripts/build-theme-css.mjs` compiles the Sass entries listed in
  `lib/themes/stylesheet-sources.mjs` with `sass` + `postcss`/`autoprefixer` (existing
  dev dependencies; no new dependency) into `public/theme-css/<id>.<sha256-10>.css` and
  writes `lib/themes/stylesheets.generated.json`. Both outputs are gitignored. Stale
  hashed files are removed. `--watch` rebuilds on any `app/css/*.scss` change.
- `lib/themes/stylesheets.mjs`: `themeStylesheetHref(id)` reads the manifest by static
  import, so it is bundled into the server function (hourly ISR needs no extra files).
- Each shell renders `<link rel="stylesheet" href={themeStylesheetHref(id)} precedence="theme" />`.
  Rendered order in `<head>`: Next sheets (`data-precedence="next"`), then the theme sheet.
- `app/css/form-primitives.scss` (new): Cinematic's `:root` tokens and the `.button`,
  `.primary`, `.eyebrow`, `.muted` and `.form-*` rules, moved out of `portfolio.scss`.
  The shared contact form (`app/components/homepage/contact/contact-form.jsx`) is also
  rendered by Executive and Spatial and relied on these leaked rules. The first split
  showed it: Executive's and Spatial's home pages changed height. The file is compiled
  into the Cinematic, Executive and Spatial sheets.
- `app/css/not-found.scss` (new, D3): the root 404 page's few rules, scoped to `.not-found`.
- `app/layout.js` imports only `globals.scss`.
- `app/admin/preview-bar.jsx`: the theme picker does a full page load. React keeps
  hoisted stylesheets across client navigation, which was measured: after switching
  cinematic → coding, both sheets stayed. In-theme page links keep client navigation.
- `package.json`: `dev` → `node scripts/dev.mjs` (CSS watch + `next dev`; args after
  `--` pass through); `build:theme-css`; `prebuild` runs it after content validation;
  `pretest:unit` runs it (the manifest test reads its output).
- `netlify.toml`: `/theme-css/*` gets `Cache-Control: public, max-age=31536000, immutable`.

### Tests
- New `tests/unit/static-public-routes.test.mjs` (6) and `tests/unit/theme-stylesheets.test.mjs` (4).
- `tests/unit/deployment-readiness.test.mjs`: expects the new `prebuild`.
- `tests/browser/phase6-netlify-regression.js`: previews through `/preview/<id>`; checks
  the admin's own `/` stays on the public theme.
- `tests/browser/theme-preview-security.js`: legacy POST redirects to `/preview/executive`
  without a cookie; a forged preview cookie leaves `/` on the public theme.

## Verification (this session)

- `npm run test:unit`: 218 tests, 217 pass. One failure is pre-existing and unrelated:
  `theme-settings.test.mjs` expects active theme `cinematic`, and the committed data
  says `coding` (it fails at HEAD too).
- `npm run lint`: no warnings or errors.
- `npm run build` (isolated `PORTFOLIO_BUILD_DIR`, data copy with Cinematic active):
  `/`, `/blog` ○ static with 1 h revalidate (the home page shows dev.to articles),
  `/project` ○, `/project/[slug]` ● SSG, `/admin/*` and `/preview/*` ƒ.
- `next start` + `curl -sI`: `/`, `/blog` → `s-maxage=3600, stale-while-revalidate=…`,
  `/project` → `s-maxage=31536000`, all `x-nextjs-cache: HIT`; `/admin/theme`,
  `/admin/login`, `/preview/coding` → `private, no-cache, no-store`.
- Activation with the filesystem store: each of the four themes switched `/`, `/project`,
  `/blog` and `/project/mis-nexis` immediately (on-demand revalidation of static pages).
- Browser: `phase6-netlify-regression.js` and `theme-architecture.js` pass on the
  production build. `theme-preview-security.js` passes on `npm run dev` (twice).
  Against `next start` it fails at an unchanged early step, at HEAD too: the `Secure`
  session cookie is not replayed by Playwright's request API over http, so that test
  needs a dev server. `theme-responsive.js` and `spatial-bundle-isolation.js` were not
  run: they need Phase 3 fixture servers or two builds on fixed ports.
- Screenshots: every theme × `/`, `/project`, `/blog` × 1280 and 390 px, plus the 404
  page. They are pixel-identical to the pre-phase baseline (per-channel threshold 16).
- CSS linked on public `/` (raw / gzip): baseline 111,241 B / 23,530 B (all themes + admin).
  Now Coding 34,066 / 8,252, Cinematic 46,457 / 11,181, Executive 44,657 / 10,465,
  Spatial 46,700 / 10,860. The 404 page: 28,485 / 6,823.
- `npm run dev` launcher: builds the sheets, starts Next, and a Sass edit produces a new
  hash that the next page load picks up.

## Risks and open items

- **Unverified deployment assumption:** Netlify's live `Cache-Control` /
  `Netlify-CDN-Cache-Control` for prerendered pages, and the `/theme-css/*` header rule,
  are only checked after a deploy.
- **Build environment:** pages render at build, so `SITE_URL` and `NEXT_PUBLIC_GTM` must
  be set in the Netlify build environment.
- **dev.to during build:** an outage bakes `/` and `/blog` with the "unavailable" state
  until the next hourly regeneration.
- Leaving a preview through the preview bar's "Exit" link is client navigation, so the
  previewed theme's sheet stays on the admin page until reload. Before this phase every
  admin page carried all theme CSS anyway, and admin styles are `.admin-*`-scoped.
- `form-primitives.scss` keeps the old unscoped primitives in Executive and Spatial pages
  (behaviour unchanged). Scoping them to the contact form is a possible follow-up.
- In dev, theme Sass edits need a browser reload (no hot replacement for linked sheets).
- Overlap: the project-detail session edited the same checkout during this phase
  (registry `project` slot, `/project/[slug]`, schemas, `executive.scss`,
  `spatial.scss`). These builds and tests included its in-progress work. Commit the
  two sessions' files separately.

## Files

Changed: `app/layout.js`, `app/(portfolio)/layout.js`, `app/(portfolio)/blog/page.js`,
`app/admin/layout.js`, `app/admin/preview-bar.jsx`, `app/admin/theme/preview/route.js`,
`app/preview/[themeId]/layout.js`, `app/not-found.jsx`, `app/css/portfolio.scss`,
`lib/admin/server.mjs`, `lib/portfolio/render-context.mjs`, `themes/{coding,cinematic,executive,spatial}/shell.jsx`,
`package.json`, `.gitignore`, `netlify.toml`, `tests/unit/deployment-readiness.test.mjs`,
`tests/browser/phase6-netlify-regression.js`, `tests/browser/theme-preview-security.js`,
`CLAUDE.md`, `docs/seo/2026-10-19-seo-audit.md`.

New: `scripts/build-theme-css.mjs`, `scripts/dev.mjs`, `lib/themes/stylesheet-sources.mjs`,
`lib/themes/stylesheets.mjs`, `app/css/form-primitives.scss`, `app/css/not-found.scss`,
`tests/unit/static-public-routes.test.mjs`, `tests/unit/theme-stylesheets.test.mjs`,
`docs/multi-theme/phase-10-static-public-routes-plan.md`, `docs/multi-theme/phase-10-result.md`.
