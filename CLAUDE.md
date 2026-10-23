# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

Read this file and `README.md` before making changes. Phase designs and results live in `docs/multi-theme/` (phase-1 … phase-12); read the relevant one before touching that area.

## Project overview

A long-term, production-quality **multi-theme personal portfolio platform** for a Senior Software Engineer / Full-Stack Developer (~7 years: PHP, Laravel, CodeIgniter, JavaScript/TypeScript, React, Angular, Node.js, Python, SQL/NoSQL).

One professional identity, presented through several genuinely distinct themes, all consuming **one canonical, validated content source**. Includes a private admin area for theme preview and activation.

Audience: recruiters, hiring managers, clients, engineering teams. The site should communicate credibility, technical depth, problem-solving ability, and outcomes quickly.

## Current status

> Update this section as phases are approved and completed.

- Phases 1–6 complete (see `docs/multi-theme/phase-*-result.md`).
- Phase 7 (spec `docs/superpowers/specs/2026-10-15-admin-content-and-resume-import-design.md`): 7A resume/CV data import, 7B theme copy as data, and 7C admin content editor + content stores implemented (`docs/multi-theme/phase-7{a,b,c}-result.md`).
- Phase 9: admin redesign and route-based theme preview implemented and committed (`docs/multi-theme/phase-9-admin-redesign-result.md`).
- SEO pass (audit `docs/seo/2026-10-19-seo-audit.md`): per-route metadata, JSON-LD graph, `/llms.txt`, app icons, robots/sitemap fixes, and per-project detail pages `/project/[slug]`. Committed.
- Phase 10: static/ISR public routes and per-theme stylesheets implemented and committed with owner approval (`docs/multi-theme/phase-10-result.md`).
- Phase 8 (spec `docs/superpowers/specs/2026-10-15-spatial-theme-design.md`, plan `docs/superpowers/plans/2026-10-15-spatial-theme.md`): fourth theme **Spatial** implemented in 8A–8E (`docs/multi-theme/phase-8*-result.md`) and committed with owner approval. The public active theme is unchanged; Spatial is available for admin preview and activation.
- Phase 11: **Prism** implemented with owner-authorized local commits; reference-inspired glass cards, portrait hero, native interaction islands, independent light/dark palettes, and canonical certificates. See `docs/multi-theme/phase-11-result.md` for verification and remaining limitations.
- Phase 12: five-theme content parity — every theme renders the same canonical sections (roles, skills + levels, experience, education, awards, certificates, résumé preview, writing, contact) through shared pieces in `themes/shared/` and shared copy (`docs/multi-theme/phase-12-content-parity-result.md`). Committed with owner approval.
- Phase 13: Spatial blueprint redesign implemented with owner approval: dark tokens, Spatial-only local fonts, portrait hero, persistent SSR graphs/evidence, static reduced tier, timeline/project layouts and canonical résumé preview. See `docs/multi-theme/phase-13-spatial-redesign-result.md` for verification and limitations. Public active theme unchanged; no commit or push.
- Phase 14: Spatial editorial foundation and portrait approved. The owner subsequently authorized a whole-theme portfolio review: section/card reveals, profile tilt, lower-page hierarchy, career navigation, copy-email feedback, real PDF embedding, and hydration fixes are implemented and verified locally. See `docs/multi-theme/spatial-portfolio-review-result.md` and the Phase 14 checkpoint history. No activation, commit or push.
- `npm run admin:password`: private local admin password reset (`scripts/reset-admin-password.mjs`, `lib/admin/local-password-reset.mjs`).
- Branch `codex/multi-theme-portfolio` holds all multi-theme work (not yet merged to `master`, not pushed by Claude). Public active theme remains **Coding**.
- Stack: Next.js 15 App Router, React 19, plain JS (`.js`/`.jsx`/`.mjs`, no TypeScript), Tailwind 3 + Sass, Zod 4 schemas. Cinematic theme uses Three.js via `@react-three/fiber` and GSAP.
- Deployment: Netlify, **read-only** mode (`netlify.toml` bundles `portfolio-data/**` into the server function). Node 22 (`.nvmrc`; engines `>=20.9`).
- Database: **none** (do not introduce one without a concrete, documented requirement).
- Unverified deployment assumption: production editing uses the GitHub store (admin saves commit to `GITHUB_CONTENT_BRANCH`, Netlify redeploys). It is tested only with a mocked GitHub API; a real token and live save have not been exercised.

## Commands

npm only (`package-lock.json`).

```bash
npm install
npm run dev                  # theme CSS watch + next dev on :3000 (scripts/dev.mjs)
npm run admin:password       # private local reset: hidden input, hash + rotated secret in ignored .env.local
npm run build:theme-css      # compile per-theme sheets to public/theme-css (runs in prebuild and pretest:unit)
npm run validate:content     # Zod-validate portfolio-data/ (also runs automatically as prebuild)
npm run build                # prebuild validation + theme CSS + next build
npm run start
npm run lint                 # next lint
npm run test:unit            # node --test tests/unit/*.test.mjs
node --test tests/unit/theme-registry.test.mjs                 # single file
node --test --test-name-pattern="<regex>" tests/unit/x.test.mjs # single test
```

- Browser tests in `tests/browser/*.js` run against a running server with the Playwright CLI, e.g. `playwright-cli -s=portfolio run-code --filename=tests/browser/navigation.js`. Scripts with a hardcoded origin expect a specific port and theme (e.g. `admin-content.js`: port 3018, a writable data copy in `PORTFOLIO_DATA_DIR`, and an admin hash for the password in the script).
- Unit tests must never write the real `portfolio-data/`: give stores a temporary copy (`cp -r portfolio-data`) as their root.
- If another Next process uses the checkout, isolate output: `PORTFOLIO_BUILD_DIR=.next-portfolio-dev npm run dev -- --port 3001` (`next.config.js` reads it as `distDir`). Use the same value for `build` and `start`.
- Generate the admin password hash with the one-liner in `docs/multi-theme/phase-5-preview-activation-hosting.md` (uses `createPasswordHash` from `lib/admin/auth.mjs`). Escape `$` as `\$` in `.env`.

## Architecture

### Content pipeline
- All factual content is JSON under `portfolio-data/` (`content/*.json` + `settings/*.json`, including `settings/theme.json` → `activeTheme`). `PORTFOLIO_DATA_DIR` can point at an alternative root with the same layout.
- `lib/portfolio/loader.mjs` (`loadCanonicalPortfolio`) reads a fixed document manifest and validates each file against `lib/portfolio/schemas.mjs`; failures throw `PortfolioDataError` with a code and document name. Adding a content file means updating the manifest, the schema, and `canonicalPortfolioSchema`.
- `lib/portfolio/current-view.mjs` derives display fields (formatted durations, sorted featured projects, compact location). `lib/portfolio/server.mjs` is the `server-only` entry point.

### Theme rendering
- `lib/themes/ids.mjs` (`THEME_IDS`) and `lib/themes/registry.mjs` must list themes in the same order (asserted at import). Each theme provides exactly five lazy-loaded slots: `shell`, `home`, `projects`, `project`, `blog` (`THEME_SLOTS`); missing or extra slots throw.
- Routes in `app/(portfolio)/` (`/`, `/project`, `/blog`) call `getPortfolioRenderContext()` (`lib/portfolio/render-context.mjs`), which loads content (no cookies or admin state) and resolves the active theme via `lib/themes/selection.mjs`, then render the selected theme's slot with `portfolio` as a prop. The layout renders the `shell` slot.
- Each theme in `themes/<id>/` has a `view.mjs` wrapping `createThemeView` (`lib/themes/create-view.mjs`), which asserts required canonical keys. `themes/shared/` holds cross-theme, theme-neutral pieces used by every theme: `certificates.jsx`, `resume.jsx` + `resume-preview.mjs` (embed URL conversion), `profile-roles.jsx`, `skill-level.jsx`, `content-navigation.mjs` (nav entries for populated sections, respecting disabled entries and feature switches), `project-detail.mjs`. Themes may import `themes/shared/` but never another theme.
- Presentation component locations: Coding uses `app/components/homepage/*` (the original template's components); Cinematic uses `app/components/portfolio/*` (sections, GSAP motion, lazy R3F scene with error boundary + fallback); Executive is self-contained in `themes/executive/`; Spatial is self-contained in `themes/spatial/` (server sections in `sections/`, client islands in `client/`, lazy R3F scene in `scene/`, pure graph and rig helpers in `graph.mjs` and `scene/rig.mjs`). Styles are in `app/css/`. The root layout imports only `globals.scss`; `admin.scss` is imported by the admin and preview layouts; `not-found.scss` by the 404 page. Theme sheets never enter the Next CSS graph (server `import()` of theme slots would link every theme's CSS on every page): `scripts/build-theme-css.mjs` compiles the entries in `lib/themes/stylesheet-sources.mjs` (`form-primitives.scss` is shared by Cinematic, Executive and Spatial for the shared contact form) to hashed `public/theme-css/<id>.<hash>.css` plus the gitignored manifest `lib/themes/stylesheets.generated.json`, and each shell renders `<link rel="stylesheet" href={themeStylesheetHref(id)} precedence="theme" />`. React keeps hoisted sheets across client navigation, so anything that switches theme must do a full page load (the preview bar's theme picker does). Shared motion helpers (`portfolio-motion` preference, WebGL capability, scene tier) live in `lib/motion/`.
- Tests enforce theme isolation (`theme-content-isolation.test.mjs`) — themes must not embed factual content.
- **All visible wording is data too.** `portfolio-data/settings/copy/{shared,coding,cinematic,executive,spatial,prism}.json` (strict schemas in `lib/portfolio/copy-schemas.mjs`) load into `settings.copy`; `createThemeView` exposes `view.copy` = shared deep-merged with that theme's copy. Use `formatCopy(template, values)` for `{placeholder}` strings. `tests/unit/no-hardcoded-copy.test.mjs` (scanner in `tests/unit/support/copy-scan.mjs`) fails on any literal UI text in themes, components, `app/(portfolio)`, the 404 page, or the social image — add a copy key instead (decorative Coding code tokens are allowlisted there).

- `content/certificates.json` is a strict canonical array with stable IDs and optional credential metadata. All five themes receive it through `createThemeView` and render the same optional metadata in their own visual styles. Certificate records are owner-editable; unknown optional metadata may be null and competencies may be empty. Status values are `in-progress`, `completed`, or `verified`. Empty arrays hide the section.
- Prism owns presentation and client islands under `themes/prism/`; its palette maps and stylesheet are in `app/css/prism.scss`. It uses the existing Inter body font plus Space Grotesk through `next/font/google` with theme-only preload disabled.
- Content parity (phase 12): all five themes render the same canonical sections and optional record details; empty arrays or disabled features/navigation hide sections. The contact form needs both the global feature switch and the document-level switch; contact details stay visible when the form is hidden. Shared section styles live in `app/css/_content-sections.scss`.

### SEO
- `lib/seo/`: `metadata.mjs` (per-route title, description, canonical, Open Graph, Twitter from `settings/seo.json`), `structured-data.mjs` (WebSite + ProfilePage + Person on `/`, CollectionPage ItemLists for projects/blog, per-project data), `llms.mjs` (`/llms.txt` from canonical data), `sitemap.mjs`, `icon.jsx`. Routes, not themes, render JSON-LD via `app/components/seo/json-ld.jsx`, so every theme gets it.
- `app/robots.js` disallows `/admin`, `/api/`, `/preview`; `app/sitemap.js`, `app/icon.jsx`, `app/apple-icon.jsx`, `app/social-image/route.js`.
- Project slugs and lookup: `lib/portfolio/projects.mjs` (`findProjectBySlug`, `projectPath`, `projectPageInfo`); `/project/[slug]` uses `generateStaticParams`.

### Admin, preview, activation
- `lib/admin/auth.mjs`: scrypt password verification and HMAC-signed session/preview tokens. `lib/admin/server.mjs`: cookie names (`portfolio_admin_session`, `portfolio_theme_preview`), cookie options, `getAdminRequestState()`. `lib/admin/request-security.mjs`: same-origin checks for POSTs.
- Routes: `app/admin/{login,session,logout,theme,theme/preview,theme/activate,content,content/[id],content/[id]/save}`. Preview pages: `app/preview/[themeId]/{,project,project/[slug],blog}`. All mutating routes require a valid session **and** same-origin.
- Preview: the admin UI opens `/preview/[themeId]` (+ `/project`, `/blog`, in `app/preview/`), rendered via `getPreviewRenderContext` from the URL, not a cookie, so `/` keeps the live theme even for the admin. Session required (anonymous → `/admin/login`), unknown/unavailable theme → 404, always noindex. `app/admin/preview-bar.jsx` is the floating control and rewrites the theme's own `/`, `/project`, `/blog` links into the preview (`lib/admin/preview-links.mjs`). The public routes never read cookies (`getPortfolioRenderContext` always resolves the active theme), so they render statically: `/project` and `/project/[slug]` fully static, `/blog` ISR at 1 h (`revalidate = 3600`) and dev.to fetches cached 1 h (`lib/articles.mjs`); activation and live content saves revalidate them on demand. `/admin/*` and `/preview/*` are `force-dynamic`. `POST /admin/theme/preview` keeps its auth/origin/theme checks but only redirects to `/preview/<id>`; `action=end` clears any old preview cookie.
- Admin UI: `app/admin/admin-shell.jsx` (sidebar/top bar, store badge), `icons.jsx` (authored SVG), Themes page with inline activation confirm (`theme/activate-control.jsx`), collapsible schema editor with outline, sticky save bar, ⌘/Ctrl+S and leave guard. Styles and tokens (light + dark) in `app/css/admin.scss`. Results: `docs/multi-theme/phase-9-admin-redesign-result.md`.
- `lib/portfolio/documents.mjs` (`documentRegistry`) is the single list of the 23 canonical documents (id, file path, schema, canonical location); the loader, editor, and stores all use it, and only registry ids are addressable. `validateDocument` / `validatePortfolio` in the loader return `{ path, message }` issues.
- `lib/content-store/` — `createContentStore(env)` picks `filesystem` (dev default; sha256 revisions, per-document lock, temp+rename), `github` (contents API via `fetch`; blob sha is the revision, 409/422 → `CONFLICT`), or `readonly` (production default) via `PORTFOLIO_CONTENT_STORE`. Every write passes `expectedRevision` (optimistic locking).
- Content editor: `/admin/content/[id]` renders `SchemaForm` (client, `app/admin/content/schema-form.jsx`) from `z.toJSONSchema` (`lib/admin/form-schema.mjs`, server-only); browser-safe helpers live in `lib/admin/form-model.mjs` (keep Zod/schemas out of it). Saves POST to `/admin/content/[id]/save` → `handleContentSave` (`lib/admin/content-save.mjs`): auth → origin → 256 KiB → registry id → document + whole-portfolio validation → store write; issue paths are relative to the edited document.
- Activation (`lib/themes/activation.mjs`) requires a store and writes the `theme` document through it; live stores revalidate immediately, the GitHub store redirects with `pending=1`.

### Other server code
- `app/api/contact/route.js` + `lib/contact.mjs` (Gmail via nodemailer, reCAPTCHA verify with server-only `RECAPTCHA_SECRET_KEY`); `app/api/google/route.js` is the template's standalone reCAPTCHA verify endpoint; `lib/articles.mjs` fetches dev.to posts for the username in `content/articles.json`.
- `lib/site-origin.mjs`: canonical URLs/sitemap only when `SITE_URL` is a valid HTTPS origin; otherwise they are omitted.
- Environment variables are documented in `.env.example`; secrets never use the `NEXT_PUBLIC_` prefix. `NEXT_PUBLIC_GTM` is used only when it matches `GTM-…` (`app/layout.js`). `TELEGRAM_*` and `NEXT_PUBLIC_APP_URL` remain in `.env.example` from the original template but no code reads them.

## Architecture principles

### Content
- All content passes **strict schema validation** with clear, actionable error messages. Invalid content must fail the build/validation step, not render silently.
- Themes **never** contain factual content (names, dates, roles, metrics, project details). They only render data from the shared data layer.

### Themes
- Each theme must have a distinct visual purpose — not a recolor of another theme:
  - **Coding** — developer-centric, code-inspired, strong technical personality.
  - **Cinematic** — premium editorial design, coordinated motion, optional 3D.
  - **Executive** — recruiter-first, highly readable, focused on career evidence.
  - **Prism** — portrait-led glass panels, warm gradients, filterable skills and a project showcase; native motion with keyboard and reduced-motion safeguards.
  - **Spatial** — interactive system model: skills graph, project ring and experience spine derived from canonical data; one fixed canvas drawn into layout slots, with full / reduced / no-3D tiers.
- Shared logic (data access, SEO, accessibility primitives) lives outside themes; no theme imports another theme's components.

### Public site vs. admin
- Keep separate: **public rendering**, **private administration**, **theme preview**, **theme activation**.
- Theme preview is **session-scoped** and must never affect what public visitors see.
- Runtime content writes go only through a `ContentStore` (revisions + optimistic locking; GitHub history is the backup). Never write the deployment filesystem directly from request handlers.
- Keep a path open to a future multi-user platform, but do not build multi-user infrastructure now.

## Quality bar

- **Responsive:** mobile, tablet, laptop, desktop.
- **Accessibility:** semantic HTML, full keyboard access, visible focus states, sufficient contrast, `prefers-reduced-motion` respected.
- **Performance:** minimal JavaScript; lazy-load heavy assets; 3D/WebGL only in themes that need it (Coding, Executive and Prism must not pull in the Cinematic or Spatial 3D runtime).
- **Graceful fallbacks** for WebGL, animation, and JavaScript failure — server-rendered content stays readable without either.
- **Tests** for: content validation, theme resolution, admin access control, preview isolation, routes, responsive behavior.

## Working rules (must follow)

1. Before coding, inspect the repository, requirements, available skills, and deployment target.
2. Propose a concise architecture and phased plan before major changes.
3. Implement **one approved phase at a time**. After each phase, report: changed files, decisions, tests run (and results), risks, remaining work.
4. **Never invent** professional experience, achievements, client names, metrics, or project facts. Use explicit placeholders such as `[TODO: project outcome metric]`.
5. Never trade accessibility, security, performance, or maintainability for visual effects.
6. Do not add dependencies or infrastructure without stating a clear reason (record decisions in `docs/portfolio/dependency-decisions.md`).
7. Preserve existing routes, content, and functionality unless a change is explicitly approved.
8. Never claim tests, builds, deployments, or integrations succeeded unless actually verified in this session.
9. No destructive Git operations, no overwriting user changes, and **no commits or pushes without explicit authorization**.
10. Clearly label what is implemented vs. planned vs. an unresolved deployment assumption.

## Conventions

- Import alias `@/` maps to the repo root (`jsconfig.json`).
- Server-only modules import `"server-only"`; keep pure logic in `.mjs` files so `node --test` can import it without Next.
- Comment style: no comments on the first two lines of a file; prefer short section headings like `// ── Constants ──`; JSDoc only when intent or constraints need explaining.
- No formatter is configured; match surrounding style.
