# Sub-project C — Admin Content Editor and GitHub Storage Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let the authenticated admin edit every canonical document through schema-generated forms, persisting through a `ContentStore` (filesystem locally, GitHub commits in production, read-only otherwise), and move theme activation onto the same store.

**Architecture:** A single `documentRegistry` drives the loader, the editor, and the stores. Route handlers are thin wrappers over pure `.mjs` handlers so `node --test` covers authorization, validation, and conflicts. The editor is one client component rendering `z.toJSONSchema()` output.

**Tech Stack:** Next.js 15 App Router route handlers, React 19 client component, Zod 4 `toJSONSchema`, global `fetch` (Node 22), `node:crypto`.

**Spec:** `docs/superpowers/specs/2026-10-15-admin-content-and-resume-import-design.md` §4–6. Prerequisites: Sub-projects A and B merged.

## Global Constraints

- No new dependencies.
- Env vars (server-only, never `NEXT_PUBLIC_`): `PORTFOLIO_CONTENT_STORE` (`filesystem` | `github` | `readonly`; default `filesystem` when `NODE_ENV !== "production"`, else `readonly`), `GITHUB_CONTENT_TOKEN`, `GITHUB_CONTENT_REPO` (`owner/name`), `GITHUB_CONTENT_BRANCH`. GitHub content path prefix is fixed: `portfolio-data`.
- Store error codes exactly: `CONFLICT`, `UNAUTHORIZED_STORE`, `STORE_UNAVAILABLE`, `READ_ONLY`, `UNKNOWN_DOCUMENT`.
- Every mutating route: valid admin session, `requestHasSameOrigin`, body ≤ 256 KiB, registry id only.
- Commit message format: `content: update <id> via admin`.
- GitHub is exercised only with mocked `fetch`; no real commit unless the owner authorizes one.
- Commit steps run only if the owner authorized commits (CLAUDE.md rule 9).

## Review Focus

- Two browser tabs editing the same document: the second save must return `CONFLICT` and keep the user's unsaved form values on screen — Task 4 handler test (409 + issues empty) and Task 5 browser check.
- A save that is valid alone but breaks cross-document rules (e.g. removing a skill still listed in `featured`) must be rejected with the issue path shown — Task 4.
- GitHub token expired/revoked: save shows "storage credentials rejected", never a 500 stack — Task 2 (`UNAUTHORIZED_STORE` on 401/403).
- Clearing an optional nullable field in the form must submit `null`, not `""` (which `requiredText` rejects) — Task 3 `normalizeFormValue` test.
- Session expiring mid-edit: POST returns 401 and the editor tells the user to sign in again without discarding the form — Task 4 + Task 5.

---

### Task 1: Document registry and issue-reporting validation

**Files:**
- Create: `lib/portfolio/documents.mjs`
- Modify: `lib/portfolio/loader.mjs` (iterate `documentRegistry`; export `assemblePortfolio(docsById) → portfolio` and `validatePortfolio(docsById) → { ok: true, portfolio } | { ok: false, issues }`)
- Test: `tests/unit/document-registry.test.mjs` (new), `tests/unit/portfolio-loader.test.mjs`

**Interfaces:**
- Produces:
  - `documentRegistry: ReadonlyArray<{ id: string, group: "content"|"settings"|"copy", label: string, path: string, schema: ZodType, assign: (portfolio, value) => void }>` — ids: `profile, about, projects, experience, education, skills, awards, resume, articles, social, contact, site, navigation, features, theme, seo, copy-shared, copy-coding, copy-cinematic, copy-executive`.
  - `getDocumentDefinition(id) → definition` (throws `UnknownDocumentError` with `code: "UNKNOWN_DOCUMENT"`).
  - `zodIssues(error: ZodError) → Array<{ path: string, message: string }>` with dotted paths (`"items.2.label"`).
  - `validateDocument(id, value) → { ok: true, value } | { ok: false, issues }`.

- [ ] **Step 1: Failing tests** — registry ids unique and match the list above; `getDocumentDefinition("../etc/passwd")` throws `UNKNOWN_DOCUMENT`; every registry `path` exists under `portfolio-data/`; `validateDocument("profile", {...valid, name: ""})` returns `issues[0].path === "name"`; `validatePortfolio` with `skills.featured` containing an unknown skill returns an issue whose path starts with `"skills.featured"` (document-prefixed paths: `<id>.<field>`).
- [ ] **Step 2: Run** `node --test tests/unit/document-registry.test.mjs tests/unit/portfolio-loader.test.mjs` — FAIL.
- [ ] **Step 3: Implement**; `loadCanonicalPortfolio` keeps its public behaviour and error codes.
- [ ] **Step 4: Run** `npm run test:unit` — PASS.
- [ ] **Step 5: Commit** (if authorized): `refactor(content): introduce document registry`.

### Task 2: Content stores

**Files:**
- Create: `lib/content-store/errors.mjs`, `lib/content-store/filesystem.mjs`, `lib/content-store/github.mjs`, `lib/content-store/readonly.mjs`, `lib/content-store/index.mjs`
- Test: `tests/unit/content-store-filesystem.test.mjs`, `tests/unit/content-store-github.test.mjs`, `tests/unit/content-store-select.test.mjs`

**Interfaces:**
- Produces:
  - `class ContentStoreError extends Error { code }`.
  - Store shape: `{ kind: "filesystem"|"github"|"readonly", capabilities: { writable: boolean, liveAfterWrite: boolean }, read(id) → Promise<{ data, revision: string }>, readAll() → Promise<Record<id, data>>, write(id, data, { expectedRevision: string, message: string }) → Promise<{ revision: string, commitUrl: string|null }> }`.
  - `createFilesystemStore({ root })`, `createGithubStore({ token, repo, branch, fetch = globalThis.fetch })`, `createReadonlyStore({ root })`, `createContentStore(env = process.env, { fetch } = {})`.
- Serialization for every store: `JSON.stringify(data, null, 2) + "\n"`.

- [ ] **Step 1: Failing tests:**
  - Filesystem: write then read round-trips and returns a new SHA-256 revision; write with stale `expectedRevision` throws `CONFLICT` and leaves the file unchanged; no `*.tmp` file remains after write.
  - GitHub (mock `fetch` recording requests): read issues `GET https://api.github.com/repos/o/r/contents/portfolio-data/content/profile.json?ref=main` with `Authorization: Bearer t`, decodes base64 `content`, returns `sha` as revision; write sends `PUT` with `{ message, content: base64, sha: expectedRevision, branch }` and returns `commitUrl` from `commit.html_url`; responses 409 and 422 → `CONFLICT`; 401/403 → `UNAUTHORIZED_STORE`; network rejection or 5xx → `STORE_UNAVAILABLE`; the token never appears in any thrown message.
  - Readonly: `write` throws `READ_ONLY`; `capabilities.writable === false`.
  - Select: `{NODE_ENV:"production"}` → readonly; `{PORTFOLIO_CONTENT_STORE:"github"}` with a missing var → throws `STORE_UNAVAILABLE` naming the missing variable; dev default → filesystem rooted at `configuredDataRoot(env)`.
- [ ] **Step 2: Run** the three files — FAIL.
- [ ] **Step 3: Implement.** Filesystem compares the current file hash to `expectedRevision` before temp-file + rename. GitHub `readAll` reads each registry document (sequential; 20 requests).
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** (if authorized): `feat(content): add filesystem, GitHub, and read-only content stores`.

### Task 3: Form model helpers

**Files:**
- Create: `lib/admin/form-model.mjs`
- Test: `tests/unit/admin-form-model.test.mjs`

**Interfaces:**
- Produces: `documentFormSchema(id) → JSONSchema` (`z.toJSONSchema(schema, { io: "input", unrepresentable: "any" })`); `setAtPath(value, path: (string|number)[], next) → newValue` (immutable); `moveItem(array, from, to) → newArray`; `emptyValueFor(jsonSchema) → value` (object → required keys filled recursively, array → `[]`, nullable → `null`, string → `""`, boolean → `false`, number → minimum or `0`, enum → first option); `normalizeFormValue(jsonSchema, value)` converts `""` to `null` where the schema allows null.

- [ ] **Step 1: Failing tests** — `documentFormSchema` succeeds for every registry id; `emptyValueFor` of the project item schema validates after filling required text; `normalizeFormValue` turns `longDescription: ""` into `null`; `moveItem([a,b,c],2,0)` → `[c,a,b]`; `setAtPath` does not mutate input.
- [ ] **Step 2–4:** Run (FAIL) → implement → run (PASS).
- [ ] **Step 5: Commit** (if authorized): `feat(admin): add schema form model helpers`.

### Task 4: Save handler and route

**Files:**
- Create: `lib/admin/content-save.mjs`, `app/admin/content/[id]/route.js`
- Test: `tests/unit/admin-content-save.test.mjs`

**Interfaces:**
- Consumes: `getDocumentDefinition`, `validateDocument`, `validatePortfolio` (Task 1); store (Task 2).
- Produces: `handleContentSave({ session, sameOrigin: boolean, id, contentLength: number, payload: { data, expectedRevision }, store }) → Promise<{ status: number, body: { ok: boolean, code?: string, issues?: Array<{path,message}>, revision?: string, commitUrl?: string|null, liveAfterWrite?: boolean } }>`.
- Status mapping: no session 401 `UNAUTHORIZED`; not same-origin 403 `FORBIDDEN`; `contentLength > 262144` 413 `TOO_LARGE`; unknown id 404 `UNKNOWN_DOCUMENT`; document or cross-document invalid 422 `INVALID` with issues; `CONFLICT` 409; `READ_ONLY` 405; `UNAUTHORIZED_STORE` 502; `STORE_UNAVAILABLE` 503; success 200.
- The route reads session via `getAdminRequestState()`, calls the handler, and on success with `store.capabilities.liveAfterWrite` calls `revalidatePath("/", "layout")`.

- [ ] **Step 1: Failing tests** covering every status above with an in-memory fake store; cross-document case: removing `"Angular"` from `skills.all` while it remains in `featured` → 422 with an issue path starting `skills.featured`; success calls `store.write` with `message: "content: update profile via admin"`.
- [ ] **Step 2–4:** Run (FAIL) → implement → run (PASS).
- [ ] **Step 5: Commit** (if authorized): `feat(admin): add validated content save endpoint`.

### Task 5: Editor pages and form component

**Files:**
- Create: `app/admin/content/page.js`, `app/admin/content/[id]/page.js`, `app/admin/content/schema-form.jsx` (`"use client"`), `app/admin/admin-nav.jsx`
- Modify: `app/admin/theme/page.js` (add nav), `app/admin/page.js` (redirect target unchanged), `app/css/admin.scss`
- Test: `tests/browser/admin-content.js` (new)

**Interfaces:**
- `SchemaForm({ documentId, jsonSchema, initialData, revision, writable, liveAfterWrite })` posts JSON to `/admin/content/{id}` with `{ data: normalizeFormValue(...), expectedRevision }`; on 200 updates `revision` and shows status (`liveAfterWrite` → "Saved. Live now." else "Committed — live after Netlify deploys (~1–2 min)" with link); on 409/401/422 keeps form state and shows the message/issues next to fields (match by dotted path).
- Field rendering by JSON Schema: `string` → input (textarea when key matches `/description|introduction|statement|summary|philosophy/i`), `number`/`integer` → number input, `boolean` → checkbox, `enum` → select, nullable → value + "Clear" button, `object` → fieldset with legend, `array` → list with Add / Remove / Move up / Move down buttons, all keyboard-operable with labels.

- [ ] **Step 1: Write browser test** (filesystem store, `PORTFOLIO_DATA_DIR` pointed at a temp copy of `portfolio-data`): sign in, open `/admin/content/profile`, change `headline`, save, see "Saved. Live now.", visit `/` and see the new headline in the active theme; submit empty `name` → field error shown on `name`; edit in a second tab after a save in the first → conflict message, form values retained.
- [ ] **Step 2: Run** — FAIL (pages missing).
- [ ] **Step 3: Implement**; pages redirect to `/admin/login` without session; `/admin/content` lists documents grouped content/settings/copy with store kind; readonly store renders the form disabled with an explanation.
- [ ] **Step 4: Run** the browser test, `npm run lint`, and `tests/browser/accessibility.js`-style keyboard check on the editor — PASS.
- [ ] **Step 5: Commit** (if authorized): `feat(admin): add schema-driven content editor`.

### Task 6: Activation through the store

**Files:**
- Modify: `lib/themes/activation.mjs` (`activateTheme(themeId, { store, onActivated })`, writes `theme` document with `expectedRevision` from `store.read("theme")`), `app/admin/theme/activate/route.js`, `app/admin/theme/page.js` (message reflects `liveAfterWrite`)
- Test: `tests/unit/theme-activation.test.mjs`

- [ ] **Step 1:** Update tests to pass a filesystem store; add: readonly store → `ThemeActivationError` with code `READ_ONLY`; GitHub fake store → result includes `commitUrl` and `liveAfterWrite: false`.
- [ ] **Step 2–4:** Run (FAIL) → implement → run (PASS).
- [ ] **Step 5: Commit** (if authorized): `refactor(themes): activate themes through the content store`.

### Task 7: Configuration docs, deployment guard, verification

**Files:**
- Modify: `.env.example`, `README.md` (admin content editing + GitHub token setup: fine-grained token, single repo, Contents read/write), `tests/unit/deployment-readiness.test.mjs`, `CLAUDE.md`
- Create: `docs/multi-theme/phase-7c-result.md`

- [ ] **Step 1:** Deployment test asserts `.env.example` lists the four new variables with comments and none is prefixed `NEXT_PUBLIC_`; no source file references `process.env.NEXT_PUBLIC_GITHUB`.
- [ ] **Step 2:** `npm run validate:content && npm run test:unit && npm run lint && npm run build` — succeed.
- [ ] **Step 3:** Browser: admin editor flow (Task 5 test), all three themes on `/`, `/project`, `/blog` at 375px and 1440px.
- [ ] **Step 4:** Result doc states explicitly: GitHub store verified with mocks only; Netlify redeploy-on-commit is an unverified deployment assumption until the owner configures the token and performs a live save.
- [ ] **Step 5: Commit** (if authorized): `docs: record phase 7c result`.
