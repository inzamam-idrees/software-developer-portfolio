# Admin content management, theme copy extraction, and resume/CV import — design

Date: 2026-10-15
Status: Draft for owner review
Builds on: `docs/multi-theme/phase-2` … `phase-6`, commit `40beeda` (theme activation)

## 1. Intent

The owner wants to:

1. Manage all portfolio data from `/admin` and have every theme reflect the change.
2. Remove content hardcoded in theme code by moving it into `portfolio-data/`.
3. Refresh portfolio data from the latest resume (`Inzamam Idrees Resume.pdf`) and dev CV
   (`Inzamam Idrees CV [dev].pdf`).

Success means: no wording or fact is edited in theme code, any document can be edited
and validated through admin, saved changes reach the live Netlify site through a
versioned path, and the public data matches the resume/CV without invented facts.

### Decisions taken during brainstorming

| Topic | Decision |
|---|---|
| Production persistence | Commit validated JSON to GitHub; Netlify redeploys. |
| Theme wording | Per-theme copy files plus one shared copy file. |
| Editor UI | Forms generated from Zod schemas via `z.toJSONSchema()`. |
| Delivery order | A (resume data) → B (theme copy) → C (admin + storage), each reviewed separately. |
| Skill ratings | Stored, not displayed. |
| Experience label | "7+ years" (history starts Jan 2019); replace "5+" wherever it is copied from the resume/CV. |
| SmartCommerce | Featured first; featured order becomes SmartCommerce, MIS/Nexis, Group Captain, Remmi CRM. |
| Source precedence | Resume for profile, experience, skills, awards, education; CV for project detail. Resume wins on conflicts. |

### Assumptions

- Netlify continuous deployment is linked to the GitHub branch the admin commits to.
- Images remain static paths under `public/`; no upload flow.
- One administrator; existing scrypt + signed-cookie auth is reused unchanged.

## 2. Sub-project A — resume/CV data import

### Schema changes (`lib/portfolio/schemas.mjs`)

- **experience**: add `location` (required text) and `highlights` (array of non-empty
  unique text, may be empty). `company` holds the company name only.
- **project**: add `features` and `responsibilities` (arrays of non-empty unique text,
  may be empty).
- **awards** (new document `content/awards.json`, ordered collection): `id`, `title`,
  `issuer`, `location`, `startDate` (`YYYY-MM`), `endDate` (`YYYY-MM`), `order`.
  Added to the loader manifest and `canonicalPortfolioSchema`.
- **skills**: add `proficiency`, a record of skill name → integer 1–5; every key must
  exist in `all`. Not rendered publicly.
- **profile**: add `tagline` (required text).

### Data mapping

| Document | Content |
|---|---|
| `profile.json` | `designation`: "Senior Full Stack Engineer". `tagline`: resume header line ("Sr. Full Stack Engineer \| AI-Enabled Web Applications \| JavaScript, React, Angular, Node.js, Python", expanded to "Senior"). `longIntroduction`: both resume summary paragraphs with "7+ years". `experienceLabel`: "7+ years". Image, traits, `resumeId`, location unchanged. |
| `about.json` | `personalStatement` updated to the resume summary's first paragraph wording ("7+ years"); `summary` and `engineeringPhilosophy` unchanged. |
| `experience.json` | Nextbridge Ltd. (Lahore, Punjab) — Senior Software Engineer, 2022-07–present, highlights from the SmartCommerce, Group Captain and MIS/Nexis bullets. Xenex Media (Queensland, Australia, Remote) — Laravel Angular Developer, 2021-02–2022-07, four bullets. CodeInformatics (Islamabad) — Web Developer, 2019-01–2021-01, four bullets. `technologies` filled only with technologies named in those bullets. |
| `projects.json` | New SmartCommerce project (CV description, features, tools, responsibilities; role "Frontend / JavaScript Engineer"; no links). All existing projects gain CV `features` and `responsibilities`; missing `longDescription` filled from the CV. Existing titles, links, problem/solution/outcome text kept. Featured order per §1. |
| `skills.json` | Union of current and resume/CV skills. Categories: Frontend, Backend & Data, Engineering & Delivery (adds CI/CD, Google Cloud, Docker), new **AI & Automation** (GenAI, Agentic AI, Prompt Engineering, RAG, Vector DB, Claude, OpenAI, Cursor, Gemini, Copilot). `proficiency` from the CV's ratings, mapped onto individual skills of each rated group. |
| `awards.json` | Student of the Year (2015-09–2016-08), High GPA Achievers (2016-09–2017-08), Coding Competition Winner (2017-09–2018-08); issuer University of Gujrat, Sialkot, Punjab. |
| `seo.json` | Titles/descriptions use "Senior Full Stack Engineer"; descriptions mention AI-enabled web applications. |

Unchanged: education entries (including Matriculation), social links, resume URL,
contact details, existing project links. Nothing absent from the PDFs is added; any
gap stays `null`/empty rather than invented.

### Rendering

Each theme presents new fields in its own idiom:
- experience highlights as lists;
- project `features`/`responsibilities` on the projects page (and Cinematic/Executive
  case-study blocks);
- an Awards section beside Education in all three themes;
- Coding skill grid falls back to a text badge when `skillsImage()` has no icon.

## 3. Sub-project B — theme copy as data

- New documents: `settings/copy/shared.json`, `settings/copy/coding.json`,
  `settings/copy/cinematic.json`, `settings/copy/executive.json`, each with its own
  strict schema and section-scoped keys (e.g. `home.selectedWork.heading`,
  `blog.emptyState`).
- `shared` covers: skip link, navigation/landmark aria labels, CTA labels (Get Resume,
  Contact me, Start a conversation), contact form statuses, generic empty/error states,
  404 page.
- Loader reads them into `settings.copy`; `createThemeView` exposes `view.copy` as the
  shared copy deep-merged with that theme's copy. Themes never see another theme's copy.
- Components in `app/components/homepage/*` and `app/components/portfolio/*` receive
  copy through props. `app/not-found.jsx` reads shared copy via the server loader.
- Executive footer "Senior software engineer" becomes `profile.designation`.
- Guard test `tests/unit/no-hardcoded-copy.test.mjs` scans `.jsx` under `themes/`,
  `app/components/`, and `app/not-found.jsx`, failing on JSX text or `aria-label`/`alt`/
  `title`/`placeholder` literals containing letters. A single allowlist covers the
  Coding theme's decorative code tokens (`const`, `name:`, `skills:`, `return`, …).

## 4. Sub-project C — admin content editor and storage

### Document registry

`lib/portfolio/documents.mjs` exports `documentRegistry`: `{ id, group, path, schema,
label }` for every document. The loader, editor, and stores consume it. Only registry
ids are addressable (prevents path traversal).

### `ContentStore` interface (`lib/content-store/`)

```
read(id)                                   → { data, revision }
write(id, data, { expectedRevision, message }) → { revision, commitUrl? }
capabilities                               → { writable, liveAfterWrite, kind }
```

| Store | Use | Revision | Conflict |
|---|---|---|---|
| `filesystem` | local dev / persistent volume | SHA-256 of file bytes | mismatch → `CONFLICT` |
| `github` | production | contents API blob SHA | GitHub 409/422 → `CONFLICT` |
| `readonly` | production without GitHub config | SHA-256 | writes refused (`READ_ONLY`) |

Filesystem writes use temp file + rename (as `activateTheme` does today). GitHub uses
`fetch` against `GET/PUT /repos/{repo}/contents/{prefix}/{path}?ref={branch}`; no new
dependency. Errors map to codes: `CONFLICT`, `UNAUTHORIZED_STORE`, `STORE_UNAVAILABLE`,
`READ_ONLY`.

Selection via `PORTFOLIO_CONTENT_STORE` (`filesystem` | `github` | `readonly`); default
`filesystem` when `NODE_ENV !== "production"`, otherwise `readonly`.

New server-only environment variables (documented in `.env.example` and README):

| Variable | Purpose |
|---|---|
| `PORTFOLIO_CONTENT_STORE` | Store selection. |
| `GITHUB_CONTENT_TOKEN` | Fine-grained token, Contents read/write on this repository only. |
| `GITHUB_CONTENT_REPO` | `owner/name`. |
| `GITHUB_CONTENT_BRANCH` | Branch Netlify deploys from. |

### Editor

- `/admin/content`: documents grouped (Content, Settings, Theme copy), showing store
  kind and whether saves are live or deploy-gated.
- `/admin/content/[id]`: server renders `z.toJSONSchema(schema, { io: "input" })` and
  current data + revision into a client `SchemaForm` (strings, long text, numbers,
  booleans, enums, nullable fields, nested objects, arrays with add/remove/reorder).
- `POST /admin/content/[id]`: session required, same-origin required, body size capped,
  id must be in the registry. Server validates with the document schema, then
  re-validates the full canonical portfolio with the candidate substituted (catches
  cross-document errors), then writes with `expectedRevision`.
- Responses: field-path errors rendered inline; conflict → "changed elsewhere, reload";
  success → filesystem: `revalidatePath("/", "layout")`; github: commit link and
  "live after Netlify deploys (~1–2 min)".

### Theme activation

`activateTheme` writes through the active `ContentStore` instead of the filesystem
directly, so production activation becomes a GitHub commit. Preview is unchanged.

### Out of scope

Image upload, multiple users, audit log, rate limiting (remains a documented caveat for
`/admin/session` and the save route), draft/publish workflow.

## 5. Error handling

- Invalid content never reaches storage; the build still validates via `prebuild`.
- Store failures surface as admin messages; public rendering is unaffected.
- A GitHub commit that passes validation but whose deploy fails leaves the live site on
  the previous deploy (Netlify behaviour); admin reports only what it verified.

## 6. Testing

- A: schema tests for new fields/document, loader test for `awards`, content tests for
  featured order and `proficiency` keys, theme isolation test still passing.
- B: copy schema tests, view merge test (shared + theme, no cross-theme leakage),
  no-hardcoded-copy guard.
- C: filesystem store (atomic write, conflict); GitHub store with mocked `fetch`
  (success, 409/422 conflict, 401, network error); registry (unknown id rejected);
  JSON Schema generation for every document; save route (unauthenticated, cross-origin,
  unknown id, invalid payload, cross-document failure, conflict, success); activation
  through the store.
- Each sub-project: `npm run validate:content`, `npm run test:unit`, `npm run lint`,
  `npm run build`, and browser checks of `/`, `/project`, `/blog` for all three themes at
  desktop and mobile widths. C adds a browser test of editing with the filesystem store.
- The GitHub store is verified with mocks only unless the owner authorizes a real
  commit.

## 7. Risks

- GitHub token compromise grants write access to the repository: mitigated by
  fine-grained scope, server-only variable, authenticated same-origin routes.
- Schema-generated forms are generic; field labels come from schema `.describe()` /
  `.meta()` where added.
- Copy extraction touches every theme component; regressions are covered by existing
  browser acceptance scripts plus the guard test.
