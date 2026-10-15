# Multi-theme portfolio — Phase 7B result (theme copy as data)

Date: 2026-10-15
Status: Implemented and locally verified; not committed
Spec: `docs/superpowers/specs/2026-10-15-admin-content-and-resume-import-design.md` §3
Plan: `docs/superpowers/plans/2026-10-15-b-theme-copy-as-data.md`

## Delivered

- **Copy documents** in `portfolio-data/settings/copy/`:
  - `shared.json`: navigation and landmark labels, social labels, shared contact form,
    article/project labels, the 404 page, route titles, the blog loading state, and the
    social-image headline connector.
  - `coding.json`, `cinematic.json`, `executive.json`: each theme's own headings, actions,
    empty states, and labels (Cinematic diagram labels are keyed by project id).
- **Schemas** (`lib/portfolio/copy-schemas.mjs`): strict trees, so unknown, missing, blank,
  or whitespace-padded values fail `validate:content` and the build.
- **Loading and merge**: the loader reads the four documents into `settings.copy`;
  `createThemeView` exposes `view.copy`, which is the shared copy deep-merged with that
  theme's copy (the theme wins). A theme never receives another theme's copy.
- **Helpers** (`lib/portfolio/format-copy.mjs`): `formatCopy(template, values)` for
  `{placeholder}` copy, which throws on a missing value, and
  `splitHeadline(headline, connector)`.
- **Extraction**: every theme, shared component, the 404 page, route titles, the blog
  loading state, and the social image now render copy from data. The Executive monogram
  comes from the profile name, and the Executive footer kicker from `profile.designation`.
- **Guard**: `tests/unit/no-hardcoded-copy.test.mjs`, built on
  `tests/unit/support/copy-scan.mjs`, fails on visible literals in `themes/`,
  `app/components/`, `app/(portfolio)/`, `app/not-found.jsx`, and
  `app/social-image/route.js`. Only decorative Coding code tokens are allowlisted.
- Removed two unused components: `homepage/blog/index.jsx` and
  `homepage/projects/single-project.jsx`.

## Verification (this session)

| Check | Result |
|---|---|
| `npm run validate:content` | Canonical portfolio content is valid |
| `npm run test:unit` | 96 pass, 1 fail (the existing theme-settings default; see Phase 7A) |
| `npm run lint` | No ESLint warnings or errors |
| `PORTFOLIO_BUILD_DIR=.next-b-build npm run build` | Compiled successfully |
| Rendered text, old (`fb87293` worktree) vs new, all 3 themes × `/`, `/project`, `/blog`, 404 | Identical (order-insensitive), except intended changes below |
| Browser (dev): `coding-reference-regression` | Pass |
| Browser (dev): Cinematic `content`, `acceptance`, `navigation`, `contact`, `accessibility`, `motion` | Pass |
| Browser (dev): `executive-acceptance`, `executive-accessibility` | Pass |

Intended rendered changes: decorative background images use `alt=""` instead of
`alt="Hero"`, and the Executive footer shows "Senior Full Stack Engineer" (from the
profile) instead of a hardcoded "Senior software engineer".

## Review

A fresh reviewer found no critical issues. Fixed, each test-first:

- **Placeholder validation.** A typo such as `"Read {titel}"` passed validation and then
  crashed pages at render. Template keys now declare their allowed placeholders, plain
  copy rejects `{…}`, and `formatCopy` ignores inherited properties.
- **Copy isolation.** Theme views carried every theme's copy through `settings.copy`;
  `createThemeView` now removes it, so a theme sees only `view.copy`.
- **Headline split.** `splitHeadline` splits on the first connector only and returns the
  whole headline when the connector is absent; the hero and social image then render it
  unsplit.
- **Executive link label.** It came from code for non-demo links; it now comes from
  `project.viewSource`.
- **Validation state bug.** Found while fixing the first item: a global-regex check let a
  placeholder pass after an earlier failed validation. Fixed and covered by a test.

After the fixes: 102 of 103 unit tests pass (the 1 failure is pre-existing), lint and
build pass, the old-vs-new text comparison shows only the intended changes, and all nine
browser scripts pass.

Deferred minors:

- The guard does not catch lowercase JavaScript literals, `&copy;`-style entities, or
  lowercase custom props, and it does not scan `themes/**/*.mjs`.
- The Cinematic navbar receives the whole merged copy, which enlarges the client payload.
- `loadCanonicalPortfolio` is not wrapped in React `cache()`, so a request reads the data
  several times.
- Call-to-action labels and empty states are per theme rather than shared as spec §3 lists
  them, because the wording differs per theme.

## Risks

- The guard is a regex scanner, not a JSX parser. Unusual constructs could slip past it;
  its own unit tests pin the patterns it flags and ignores.
- Contact validation messages remain in `lib/contact.mjs`, which the API shares, and are
  not editable as copy yet.
- `app/(portfolio)/blog/loading.jsx` now reads copy asynchronously (about 5 ms).
- Admin UI wording (`app/admin/*`) is out of scope; it is not a public theme.

## Remaining work

- Sub-project C: admin content editor and GitHub storage. The copy documents become
  editable there through the document registry.
