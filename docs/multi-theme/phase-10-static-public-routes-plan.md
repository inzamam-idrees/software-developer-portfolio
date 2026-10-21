# Phase 10 — Static public routes and per-theme CSS (plan)

Status: **implemented and committed.** Results: `phase-10-result.md`.

Build starts only after the SEO fixes on `codex/multi-theme-portfolio`
(`lib/seo/*`, route `page.js` changes) are committed. At planning time
(2026-10-20) they are still uncommitted.

## Current state (inspected 2026-10-20)

- `app/layout.js` sets `export const dynamic = "force-dynamic"`, so every route,
  public or not, renders per request with `Cache-Control: no-store`.
- Public routes `/`, `/project`, `/blog` call `getPortfolioRenderContext()`
  (`lib/portfolio/render-context.mjs`). It calls `getAdminRequestState()`, which
  calls `cookies()` to read the session and the older signed preview cookie
  (`portfolio_theme_preview`). That cookie read alone keeps the routes dynamic.
- The admin UI no longer uses the cookie preview. Previews live at
  `/preview/[themeId]` (own `force-dynamic` layout, session check from the URL).
  `POST /admin/theme/preview` still sets the cookie; only
  `tests/browser/phase6-netlify-regression.js` relies on it.
- Revalidation already exists: theme activation and content saves call
  `revalidatePath("/", "layout")` when the store is live (`liveAfterWrite`,
  filesystem store). The GitHub store redeploys, which rebuilds static pages.
  The production default (`readonly`) never writes.
- `/blog` fetches dev.to with `next: { revalidate: 3600 }`.
- `app/layout.js` imports `globals.scss`, `card.scss`, `portfolio.scss`,
  `executive.scss`, `admin.scss`, `coding.scss`. Spatial already imports
  `spatial.scss` from its shell, and that works with the lazy slot loader.
- `portfolio.scss` (Cinematic) is **not scoped**: `:root` tokens, `.container`,
  `.button`, `.primary`, `.secondary`, `.eyebrow`, `.accent`, `.muted`,
  `.not-found`, … apply globally today. The root 404 page (`app/not-found.jsx`)
  depends on them. `executive.scss` and `coding.scss` are scoped under
  `.theme-executive` / `.theme-coding`. `admin.scss` also styles the preview bar
  (`.admin-preview-bar`), which renders in `/preview/*`, outside `/admin`.
  `card.scss` (`.glow-card`) is used by Coding components.

## Decisions for the owner

### D1 — Static or ISR for `/`, `/project`, `/blog`

- **A (recommended): static at build, on-demand revalidation only.** `/` and
  `/project` have no time-based revalidate; they change on redeploy or through the
  existing `revalidatePath`. `/blog` gets an explicit `export const revalidate = 3600`
  to match the dev.to fetch, so new articles appear within an hour.
- B: time-based ISR on all three (for example 1 hour). Adds needless regeneration;
  content cannot change in production between deploys.

### D2 — The older cookie-based preview

- **A (recommended): public routes stop reading cookies; the POST route redirects
  to the URL preview.** `getPortfolioRenderContext()` always resolves the public
  active theme and never calls `cookies()`. `POST /admin/theme/preview` keeps its
  auth (401), same-origin (403) and theme (400) checks, but redirects 303 to
  `/preview/<themeId>` instead of setting the cookie; `action=end` clears any
  stale cookie and redirects to `/admin/theme`. The route keeps working for
  scripts, and a visitor can never get a preview on a public route, even with a
  forged or stale cookie. Remove the now-dead preview `noindex` branch in
  `app/(portfolio)/layout.js`.
- B: delete the POST route and the cookie helpers outright. Simpler, but breaks the
  route contract ("preserve routes" rule) and `theme-preview-security.js` checks.

### D3 — Shared base styles that the 404 page uses

Moving `portfolio.scss` into the Cinematic shell removes its global rules from
the other themes and from the root 404 page.

- **A (recommended):** add a small `app/css/not-found.scss`, imported by
  `app/not-found.jsx`, holding only the tokens and rules the 404 page uses
  (`.container`, `.eyebrow`, `.accent`, `.button`, `.primary`, `.not-found`),
  scoped under `.not-found` so it leaks nowhere.
- B: keep a global base sheet in the root layout. Keeps leakage into all themes.

Side effect to check: today Coding, Executive and Spatial pages also receive the
unscoped Cinematic rules (for example `.primary`, `.button`, `.container`,
`:root` tokens). Removing them may change how those themes look. Step 6 compares
screenshots before and after for every theme and route; any rule a theme
silently depended on moves into that theme's own sheet.

## Finding during build (2026-10-20): shell imports do not split theme CSS

The baseline build links `spatial.scss` (imported only from `themes/spatial/shell.jsx`)
on **every** theme's pages, public `/` included. Theme slots are loaded with `import()`
inside server components, so every theme module stays in each route's server module
graph and Next links all of their CSS. Moving `portfolio.scss`, `executive.scss` and
`coding.scss` into their shells would therefore change ownership but not the bytes a
visitor downloads. Route-level splits do work: moving `admin.scss` into the admin and
preview layouts removed it from public pages.

Measured CSS linked on public `/` (Cinematic active):

| | raw | gzip |
|---|---|---|
| before | 111,241 B (3 files) | 23,530 B |
| after `admin.scss` move | 81,111 B (2 files) | 17,523 B |

A real per-theme split needs a mechanism outside the server module graph, for
example compiling each theme sheet at build time to a hashed static file and having
each shell render `<link rel="stylesheet" precedence="theme">` (React 19 hoists and
dedupes it). That needs owner approval before step 4 continues.

### Approved approach (owner, 2026-10-21): build-time per-theme stylesheets

- `scripts/build-theme-css.mjs` compiles one Sass entry per theme with `sass`
  (+ `postcss`/`autoprefixer`, both already dev dependencies), compressed:
  `coding` = `card.scss` + `coding.scss`, `cinematic` = `portfolio.scss`,
  `executive` = `executive.scss`, `spatial` = `spatial.scss`. Output:
  `public/theme-css/<id>.<sha256-10>.css` plus a manifest
  `lib/themes/stylesheets.generated.json` (`{ id: href }`). Both are generated and
  gitignored; stale hashed files are removed on each run.
- `lib/themes/stylesheets.mjs` exports `themeStylesheetHref(id)` (throws on an
  unknown id). The manifest is a static import, so it is bundled into the server
  function and hourly ISR regeneration on Netlify needs no extra files.
- Each shell renders `<link rel="stylesheet" href={…} precedence="theme" />`.
  React 19 hoists it into `<head>`, dedupes it, and holds client navigation until
  it loads, so there is no flash of unstyled content.
- `app/layout.js` keeps only `globals.scss`; `not-found.scss` (D3) stays a normal
  Next import from `app/not-found.jsx`.
- npm scripts: `prebuild` runs the CSS build after content validation;
  `dev` becomes `node scripts/dev.mjs`, which runs the CSS build in watch mode and
  `next dev` side by side (no new dependency). Theme Sass edits in dev then need a
  browser reload instead of hot replacement.
- `netlify.toml` serves `/theme-css/*` with
  `Cache-Control: public, max-age=31536000, immutable` (file names are hashed).
- Verification: CSS linked per theme contains only that theme's rules; before/after
  screenshot diff for every theme, route and viewport and the 404 page; cascade
  order (theme sheet after `globals`) checked in the rendered `<head>`.

## Implementation steps

1. **Render context.** `getPortfolioRenderContext()` returns
   `{ portfolio, selection: resolveThemeSelection({ settings }) }` with no
   admin state. `getPreviewRenderContext()` is unchanged (it stays dynamic).
2. **Cookie preview route** per D2: redirect to `/preview/<id>`, stop issuing the
   cookie, clear it on `end`. Keep `THEME_PREVIEW_COOKIE` for the clear.
   `getAdminRequestState()` can stop verifying the preview cookie; keep the
   return shape (`preview: null`) so callers do not break.
3. **Route segment config.** Remove `force-dynamic` from `app/layout.js`. Add
   `export const dynamic = "force-dynamic"` to `app/admin/layout.js` so every
   admin page stays dynamic explicitly (the preview layout already has it).
   Add `export const revalidate = 3600` to `app/(portfolio)/blog/page.js`.
   Leave `sitemap.js` and `llms.txt` as they are (out of scope; note below).
4. **CSS moves.**
   - `portfolio.scss` → `themes/cinematic/shell.jsx`
   - `executive.scss` → `themes/executive/shell.jsx`
   - `coding.scss` and `card.scss` → `themes/coding/shell.jsx`
   - `admin.scss` → `app/admin/layout.js` **and** `app/preview/[themeId]/layout.js`
     (the preview bar needs it)
   - `globals.scss` stays in the root layout (reset, focus, skip link)
   - `not-found.scss` → `app/not-found.jsx` (D3)
   - Check whether `card.scss` or `.glow-card` rules in `portfolio.scss` are also
     used by Cinematic; keep the import in each shell that renders them.
   - Check the `.theme-coding` rules at the end of `globals.scss`; move them to
     `coding.scss` if they are Coding-only.
5. **Tests.**
   - Update `tests/unit/theme-preview.test.mjs` / add a unit test that
     `render-context.mjs` does not import or call admin request state (pure
     public selection).
   - Add a unit test (source scan, like the copy scanner) that `app/layout.js`
     imports no theme or admin stylesheet and has no `force-dynamic`, and that each
     theme shell imports its own sheet.
   - Update `tests/browser/phase6-netlify-regression.js` to preview through
     `/preview/<id>` instead of the cookie; assert that a valid preview cookie set
     on a public route has no effect.
   - Extend `tests/browser/theme-preview-security.js`: `POST /admin/theme/preview`
     redirects to `/preview/<id>`; 400/401/403 unchanged.
6. **Verification.**
   - `npm run test:unit`, `npm run lint`, `npm run build`. The build output must
     list `/`, `/project` as static (○) and `/blog` as ISR with 1 h revalidate;
     `/admin/*` and `/preview/*` as dynamic (ƒ).
   - `npm run start` (isolated `PORTFOLIO_BUILD_DIR`), then `curl -sI` on `/`,
     `/project`, `/blog`: expect `s-maxage=…` instead of `no-store`, plus
     `x-nextjs-cache: HIT` / prerender headers. `curl -sI /admin/theme` and
     `/preview/coding` must stay `no-store`.
   - Activate each theme in turn with a writable data copy and the filesystem store
     (`PORTFOLIO_DATA_DIR`, `PORTFOLIO_CONTENT_STORE=filesystem`) and confirm `/`
     switches theme immediately (on-demand revalidation works on static pages).
   - Run `theme-preview-security.js`, `phase6-netlify-regression.js`,
     `theme-architecture.js`, `theme-responsive.js`, `spatial-bundle-isolation.js`.
   - CSS: for each theme as active theme, record the CSS bytes linked from `/`;
     confirm no other theme's or admin's rules are present. Screenshot every theme
     on `/`, `/project`, `/blog` at mobile and desktop before and after; fix any
     regression from removed unscoped rules. Check the 404 page.
7. **Docs.** `docs/multi-theme/phase-10-result.md`; update `CLAUDE.md` current
   status and the architecture notes (no cookie preview on public routes, per-theme
   CSS ownership); mark H4/M6 in the SEO audit.

## Risks and assumptions

- **Netlify cache headers (unverified deployment assumption).** The Netlify Next.js
  runtime serves prerendered pages from its CDN and rewrites `Cache-Control`
  (typically `public, max-age=0, must-revalidate` for the browser plus a durable
  `Netlify-CDN-Cache-Control`). Local `next start` headers prove the routes are
  static; the live headers can only be confirmed after a deploy.
- **Build-time environment.** Pages now render during `next build`, so `SITE_URL`,
  `PORTFOLIO_DATA_DIR` and `NEXT_PUBLIC_GTM` must be set in the Netlify **build**
  environment, not only the function runtime, or canonical URLs and JSON-LD are
  baked without them.
- **dev.to at build.** If dev.to is down during the build, `/blog` is baked with
  the "unavailable" state until the next hourly regeneration.
- **Cascade changes.** Removing the global Cinematic rules can alter other themes
  (D3). Mitigated by the screenshot comparison in step 6.
- **CSS chunking.** Spatial proves a theme shell can own its sheet, but Next may
  still group CSS from lazily imported slots that share a route. Step 6 measures
  the CSS actually linked per theme rather than assuming it.
- **Project detail pages** (`docs/seo/2026-10-20-project-pages-plan.md`, proposed)
  would add `/project/[slug]`; once they land they should use
  `generateStaticParams` to stay static.

## Out of scope

- `app/sitemap.js` and `app/llms.txt/route.js` keep `force-dynamic`. Both could be
  static as well; small follow-up if wanted.
- Any change to content stores, activation logic, or the admin UI beyond the
  preview POST redirect.
