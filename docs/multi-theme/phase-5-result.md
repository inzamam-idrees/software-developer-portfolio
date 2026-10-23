# Multi-theme portfolio — Phase 5 result

Date: 2026-10-13  
Status: Complete; activation and Phase 6 implementation not started

## Delivered

- Added private single-owner administrator sign-in using a scrypt password hash and
  HMAC-signed, HTTP-only cookies.
- Added a protected theme-management page listing only registered available themes.
- Added signed, session-bound, request-scoped preview for Coding, Cinematic, and
  Executive across `/`, `/project`, and `/blog`.
- Kept preview separate from canonical `settings.theme.activeTheme`.
- Added no-index metadata to private admin and preview responses without changing
  ordinary public metadata.
- Kept theme slot loading lazy through the existing registry and canonical loader.
- Added focused authentication, validation, isolation, and browser security tests.
- Audited Netlify and Docker configuration and documented why runtime activation is
  not currently safe.

## Intentionally deferred

- Theme activation and every canonical settings write.
- Atomic file writer, revision storage, distributed locking, backup/restore, and route
  revalidation after mutations.
- Content, project, experience, education, skill, resume, social, contact, and media
  editing.
- Creative and Minimal themes.
- A public theme selector or public theme-specific routes.
- Database, ORM, external CMS, and large authentication framework.

## Public state

`portfolio-data/settings/theme.json` remains unchanged with Cinematic active. Preview
uses cookies only and cannot modify the public active setting. An unrelated browser
session continues to render Cinematic while an authenticated session previews another
theme.

## Validation

- Unit suite: 56 tests passed; 0 failed, skipped, cancelled, or todo.
- Lint: passed with no warnings or errors; the existing Next lint deprecation notice
  remains.
- Production build: passed with `/`, `/project`, `/blog`, protected admin routes, and
  existing API/metadata routes present. Public first-load JavaScript remains 123 kB;
  shared JavaScript remains 103 kB.
- Authentication browser checks: anonymous admin access redirects to sign-in; invalid
  credentials fail generically; valid credentials reach private theme management;
  unauthorized preview POST returns 401; authenticated invalid theme returns 400.
- Preview browser checks: Executive renders on `/`, `/project`, and `/blog`; Coding
  and Executive preview responses are no-index; a separate browser session continues
  to render public Cinematic with ordinary metadata.
- Runtime isolation: Coding loaded 20 script responses and Executive loaded 18 during
  authenticated preview; neither downloaded a script containing Three.js, Fiber, or
  GSAP runtime signatures.
- Route regression: public Cinematic `/`, `/project`, and `/blog` each render one H1
  with no horizontal overflow. Executive preview project/blog routes also render one
  H1 with no horizontal overflow.
- `portfolio-data/settings/theme.json` has no Phase 5 diff and remains Cinematic.

## Phase 5 file set

New files:

- `app/(portfolio)/layout.js`
- `app/admin/layout.js`
- `app/admin/page.js`
- `app/admin/login/page.js`
- `app/admin/logout/route.js`
- `app/admin/session/route.js`
- `app/admin/theme/page.js`
- `app/admin/theme/preview/route.js`
- `app/css/admin.scss`
- `lib/admin/auth.mjs`
- `lib/admin/request-security.mjs`
- `lib/admin/server.mjs`
- `lib/portfolio/render-context.mjs`
- `lib/themes/selection.mjs`
- `tests/unit/admin-auth.test.mjs`
- `tests/unit/admin-request-security.test.mjs`
- `tests/unit/theme-preview.test.mjs`
- `tests/browser/theme-preview-security.js`
- `docs/multi-theme/phase-5-preview-activation-hosting.md`
- `docs/multi-theme/phase-5-result.md`

Moved without changing public URLs:

- `app/page.js` to `app/(portfolio)/page.js`
- `app/project/page.js` to `app/(portfolio)/project/page.js`
- `app/blog/page.js` to `app/(portfolio)/blog/page.js`
- `app/blog/loading.jsx` to `app/(portfolio)/blog/loading.jsx`

Modified:

- `.env.example`
- `README.md`
- `app/layout.js`
- `lib/themes/registry.mjs`

## Detailed architecture

See `docs/multi-theme/phase-5-preview-activation-hosting.md` for hosting findings,
security assumptions, unresolved risks, the deferred activation contract, and the
Phase 6 recommendation.
