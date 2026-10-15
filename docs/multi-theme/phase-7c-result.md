# Multi-theme portfolio — Phase 7C result (admin content editor and content stores)

Date: 2026-10-15
Status: Implemented and locally verified; not committed
Spec: `docs/superpowers/specs/2026-10-15-admin-content-and-resume-import-design.md` §4–6
Plan: `docs/superpowers/plans/2026-10-15-c-admin-content-editor.md`

## Delivered

- **Document registry** (`lib/portfolio/documents.mjs`): one list of the 20 canonical
  documents, used by the loader, the editor, and the stores. Only registry ids can be
  addressed. The loader adds `validateDocument`, `validatePortfolio`, and
  `assemblePortfolio`; validation issues come back as `{ path, message }`.
- **Content stores** (`lib/content-store/`), selected by `PORTFOLIO_CONTENT_STORE`:

  | Store | Behaviour |
  |---|---|
  | `filesystem` | Local default. SHA-256 revisions, a per-document in-process lock, and temp-file + rename. |
  | `github` | Uses the contents API via `fetch`, with no new dependency. The blob SHA is the revision; GitHub responses 409/422 map to `CONFLICT` and 401/403 to `UNAUTHORIZED_STORE`. |
  | `readonly` | Production default. Writes are refused. |

  Every write is optimistic: it carries the revision the editor loaded and fails if the
  document has changed since.
- **Editor**:
  - `/admin/content` lists the documents by group and describes the active store.
  - `/admin/content/[id]` renders `SchemaForm` from the document's schema: text,
    numbers, toggles, dropdowns, clearable nullable fields, nested groups, lists you can
    add to, remove from and reorder, and key/value records. The articles document, a
    union type, is edited as validated JSON.
  - Errors appear next to their field with `aria-invalid`. The form keeps its values
    after conflict, session-expiry and validation errors.
- **Save endpoint**: `POST /admin/content/[id]/save` → `handleContentSave`. Checks run
  in this order: session, same origin, 256 KiB limit, registry id, payload shape, the
  document's schema, the whole portfolio, then the store write.
  - Status codes: 401, 403, 413, 404, 400, 422, 409, 405, 502, 503, and a generic 500.
  - Commit message: `content: update <id> via admin`.
  - Saves to a live store revalidate the site immediately.
- **Theme activation** goes through the same store. A GitHub-backed activation
  redirects with `pending=1`, and the Theme page says it goes live after the next
  deploy. The fixed Phase 6 issue: activation no longer writes the host's temporary
  filesystem.
- **Admin navigation** (Themes, Content, Sign out) is shared by the admin pages, and
  admin headings are now styled.
- **Configuration**: the four storage variables are in `.env.example` and the README,
  together with the GitHub token setup (fine-grained, this repository only, Contents
  read/write).

## Verification (this session)

| Check | Result |
|---|---|
| `npm run validate:content` | Canonical portfolio content is valid |
| `npm run test:unit` | 139 pass, 1 fail (the existing theme-settings default, unchanged since Phase 7A) |
| `npm run lint` | No ESLint warnings or errors |
| `PORTFOLIO_BUILD_DIR=.next-c-build npm run build` | Compiled successfully; `/admin/content/[id]` ships 4.08 kB of route JavaScript |
| `tests/browser/admin-content.js` (dev, filesystem store, temporary data copy) | Pass: anonymous redirect and 401 save, document list, edit published live, field error, two-tab conflict keeps the form, expired session keeps the form, add an item from the keyboard, invalid JSON blocked |
| `tests/browser/admin-readonly.js` (dev, read-only store) | Pass: activation disabled and explained, a direct POST redirects with a readable error, Save disabled |
| Activation through the store (curl against the dev server) | Login 303 → activate 303 → data copy updated → public page rendered the new theme |
| `tests/browser/theme-preview-security.js` | Pass (preview isolation, no activation exposed in preview, module isolation) |
| Public themes: Coding regression; Cinematic content, acceptance, navigation, contact, accessibility, motion; Executive acceptance and accessibility | Pass |
| Editor layout at 1280px and 390px | No horizontal overflow |

## Review

A fresh security-focused reviewer found no critical issues. It confirmed directly that:
- every route checks the session and origin before reading the request body;
- document lookups cannot reach other paths or pollute object prototypes;
- saves write only schema-parsed, strict data;
- the token stays on the server;
- every Review Focus item behaves as specified.

Fixed, each test-first:

- **GitHub reads.** `readAll` made 20 GitHub reads one after another, risking Netlify's
  function timeout mid-commit. They now run in parallel (unit test: 20 requests in
  flight at once).
- **Invalid JSON.** In the articles field it silently saved the last valid value. The
  form now refuses to submit while any JSON field is invalid (browser assertion).
- **Read-only activation.** Read-only deployments still offered Activate buttons, and a
  direct POST returned raw JSON. Activation is now disabled with an explanation, and
  errors redirect back with a readable message (`tests/browser/admin-readonly.js`).
- **CLAUDE.md.** It cited the deleted `AGENTS.md` and had a stale status line; both
  are fixed.

Deferred minors:

- The size limit is enforced only after reading the body when `Content-Length` is
  missing or non-numeric (admin-only exposure).
- Two different documents saved at the same moment can each pass cross-document
  validation against the other's old state.
- GitHub 403 rate limits read as "credentials rejected", and non-sha 422s read as
  conflicts.
- A document's first save may reorder its JSON keys (cosmetic diff).
- Accessibility polish in the editor:
  - focus after "Move up" and "Move down" stays on the old position;
  - every field error is announced at once;
  - nullable objects and arrays have no Clear control.
- `GITHUB_CONTENT_REPO` accepts `..` segments (operator-controlled).

## Not verified (deployment assumptions)

- **The GitHub store has been tested only with a mocked `fetch`.** No real token was
  used and no commit was made to the repository.
- **Netlify publishing on commit is assumed, not exercised.** That includes
  redeploy-on-commit to `GITHUB_CONTENT_BRANCH` and the claimed 1–2 minute delay. It
  stays unverified until the owner configures the token and does one live save.
- **`$` expansion on Netlify is unknown.** Locally, Next.js expanded `$` in
  `PORTFOLIO_ADMIN_PASSWORD_HASH` even when it was set as a shell environment variable.
  It has not been checked whether Netlify's runtime does the same; the README tells the
  owner how to tell and what to do.

## Risks

- The GitHub token can write to the repository. Mitigations: a fine-grained,
  single-repository token, a server-only variable, and session plus same-origin checks
  on every write. Rate limiting is still not implemented (an existing caveat).
- Saves through the GitHub store make 20 sequential reads for whole-portfolio
  validation, which is slower but correct.
- The filesystem lock is per process; several local server processes could still race.

## Remaining work

- Owner: configure the GitHub storage variables on Netlify and perform one live save.
