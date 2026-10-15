# Sub-project B — Theme Copy as Data Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move every hardcoded user-visible string in theme code into validated per-theme and shared copy documents.

**Architecture:** Four new settings documents (`settings/copy/{shared,coding,cinematic,executive}.json`) with strict schemas, loaded by the canonical loader into `settings.copy`; `createThemeView` merges shared + own-theme copy into `view.copy`; components receive copy via props; a source-scanning test prevents regressions.

**Tech Stack:** Next.js 15, React 19, Zod 4, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-15-admin-content-and-resume-import-design.md` §3. Prerequisite: Sub-project A merged.

## Global Constraints

- Rendered output must stay textually identical to before extraction (except the Executive footer kicker, which becomes `profile.designation`), so existing browser acceptance scripts pass unchanged.
- Copy keys are camelCase, nested by route then section (`home.selectedWork.heading`, `blog.emptyState`).
- A theme sees only shared copy plus its own copy.
- Decorative Coding code tokens stay in code via one allowlist.
- No new dependencies; the guard test uses regex over source, not a JSX parser.
- Commit steps run only if the owner authorized commits (CLAUDE.md rule 9).

## Review Focus

- A copy value containing characters like `’`, `→`, `&` must render exactly once with no double-escaping — compare browser text before/after in Task 3–5 acceptance scripts.
- Interpolated copy (e.g. "PROJECT ARCHIVE / {count} BUILDS", "{title} technologies") must use a `{placeholder}` token filled by `formatCopy(template, values)`; a missing value must throw in development, not render `{count}` — Task 1 test.
- A theme copy file with an extra, unknown key must fail validation (strict) — Task 1.
- Removing a key from `shared.json` that a theme relies on must fail the build, not render `undefined` — Task 1 (required keys).
- Invalid copy in any copy file (empty string, wrong type) must fail `npm run validate:content` (prebuild), never render partially — Task 1 loader test with an empty `shared.notFound.heading`.

---

### Task 1: Copy schemas, loader, and view merge

**Files:**
- Create: `lib/portfolio/copy-schemas.mjs`, `lib/portfolio/format-copy.mjs`, `portfolio-data/settings/copy/{shared,coding,cinematic,executive}.json`
- Modify: `lib/portfolio/loader.mjs` (manifest: `["settings","copy.shared","settings/copy/shared.json", sharedCopySchema]` etc. — assign into `settings.copy.{shared,coding,cinematic,executive}`), `lib/portfolio/schemas.mjs` (`canonicalPortfolioSchema.settings.copy`), `lib/themes/create-view.mjs`
- Test: `tests/unit/theme-copy.test.mjs` (new), `tests/unit/portfolio-loader.test.mjs` (fixture adds four copy files)

**Interfaces:**
- Produces: `sharedCopySchema`, `copySchemaByTheme: Record<ThemeId, ZodObject>`; `formatCopy(template: string, values: Record<string,string|number>) → string`; `view.copy` = deep merge of `settings.copy.shared` and `settings.copy[themeId]` (theme wins).

- [ ] **Step 1: Inventory.** Run the grep from the spec audit (`>[^<>{}]*[A-Za-z]{3,}[^<>{}]*<` and `(aria-label|alt|title|placeholder)="..."` over `themes/`, `app/components/`, `app/not-found.jsx`) and record every string with its file; assign each a key and a document (shared if used by ≥2 themes or by `not-found`). Populate the four JSON files with today's exact wording.
- [ ] **Step 2: Write failing tests** in `theme-copy.test.mjs`:
  - `bundled copy documents validate` — loader returns `settings.copy.shared.navigation.skipToContent === "Skip to content"`.
  - `theme view merges shared and own copy only` — `createThemeView("executive", p).copy.home.selectedWork.heading === "Systems built for real operations."` and `createThemeView("coding", p).copy.home?.selectedWork?.heading` is not the executive string.
  - `copy schemas are strict` — extra key in coding copy fails.
  - `formatCopy fills placeholders and throws on missing values` — `formatCopy("PROJECT ARCHIVE / {count} BUILDS",{count:"09"}) === "PROJECT ARCHIVE / 09 BUILDS"`; missing `count` throws `Missing copy value: count`.
  - Loader: fixture missing `settings/copy/shared.json` → `MISSING_DOCUMENT`.
- [ ] **Step 3: Run** `node --test tests/unit/theme-copy.test.mjs tests/unit/portfolio-loader.test.mjs` — FAIL.
- [ ] **Step 4: Implement.** Schemas are nested `z.object(...).strict()` of `requiredText` leaves, derived from the inventory.
- [ ] **Step 5: Run** the tests plus `npm run validate:content` — PASS.
- [ ] **Step 6: Commit** (if authorized): `feat(copy): add validated theme copy documents`.

### Task 2: Guard test

**Files:**
- Create: `tests/unit/no-hardcoded-copy.test.mjs`

**Interfaces:**
- Produces: exported nothing; allowlist constant `DECORATIVE_TOKENS = ["const","coder","name:","skills:","hireable:","true","function","return","this.","project","tools:","myRole:","Description:","Demo:"]` (extend only with Coding code-syntax tokens).

- [ ] **Step 1: Write the test** scanning `.jsx` under `themes/`, `app/components/`, plus `app/not-found.jsx`; it fails listing `file:line text` for JSX text nodes or `aria-label|alt|title|placeholder` string literals with letters not in the allowlist, and for string literals passed as `title=` props to `ChapterHeading`.
- [ ] **Step 2: Run** `node --test tests/unit/no-hardcoded-copy.test.mjs` — FAIL listing the inventory from Task 1. This test stays red until Task 5; mark it `{ todo: "B task 5" }` so `npm run test:unit` stays green, and remove `todo` in Task 5.
- [ ] **Step 3: Commit** (if authorized): `test(copy): guard against hardcoded theme copy`.

### Task 3: Executive theme extraction

**Files:**
- Modify: `themes/executive/{shell,home,projects,blog,project-card}.jsx`, `themes/executive/presentation.mjs` (social labels move to copy)
- Test: `tests/unit/executive-theme-presentation.test.mjs`; browser `tests/browser/executive-acceptance.js`, `tests/browser/executive-accessibility.js`

- [ ] **Step 1:** Add a presentation test: `professionalSocials` labels come from `view.copy.social.labels` (change the fixture label, assert it propagates).
- [ ] **Step 2: Run** — FAIL. **Step 3:** Replace literals with `view.copy.*`; footer kicker uses `view.profile.designation`; Sub-project A's temporary labels ("Highlights", "Key features", "Responsibilities", "Awards & honors") move too.
- [ ] **Step 4: Run** unit tests and both executive browser scripts — PASS with unchanged text.
- [ ] **Step 5: Commit** (if authorized): `refactor(executive): render copy from data`.

### Task 4: Cinematic theme extraction

**Files:**
- Modify: `themes/cinematic/{home,projects,blog,shell}.jsx`, `themes/cinematic/presentation.mjs`, `app/components/portfolio/sections/*.jsx`, `app/components/portfolio/ui/project-summary.jsx`
- Test: `tests/unit/cinematic-canonical.test.mjs`; browser `tests/browser/acceptance.js`, `tests/browser/motion.js`, `tests/browser/accessibility.js`

- [ ] **Step 1–4:** Same cycle as Task 3. Section components gain a `copy` prop (e.g. `<Experience experiences={…} copy={view.copy.home.experience} />`); `ChapterHeading` titles come from copy; archive eyebrow uses `formatCopy`.
- [ ] **Step 5: Commit** (if authorized): `refactor(cinematic): render copy from data`.

### Task 5: Coding theme, shared components, and 404

**Files:**
- Modify: `themes/coding/*.jsx`, `themes/coding/adapter.mjs`, `app/components/homepage/**/*.jsx`, `app/components/{navbar,footer}.jsx`, `app/not-found.jsx`
- Test: `tests/unit/coding-theme-adapter.test.mjs`, `tests/unit/no-hardcoded-copy.test.mjs` (remove `todo`); browser `tests/browser/coding-reference-regression.js`, `tests/browser/contact.js`, `tests/browser/navigation.js`

- [ ] **Step 1:** Adapter test: `createCodingPresentation(p).copy` equals the merged coding view copy.
- [ ] **Step 2: Run** — FAIL. **Step 3:** Replace literals; client components (`contact-form.jsx`) receive status messages as props from their server parent; `not-found.jsx` loads `settings.copy.shared.notFound` via `getCurrentPortfolioView()`.
- [ ] **Step 4: Run** `npm run test:unit` (guard now active, must PASS), `npm run lint`, the three browser scripts — PASS.
- [ ] **Step 5: Commit** (if authorized): `refactor(coding): render copy from data`.

### Task 6: Phase verification and docs

- [ ] **Step 1:** `npm run validate:content && npm run test:unit && npm run lint && npm run build` — succeed.
- [ ] **Step 2:** Browser `/`, `/project`, `/blog`, a 404 URL for all three themes at 375px and 1440px; text unchanged versus pre-B screenshots.
- [ ] **Step 3:** Write `docs/multi-theme/phase-7b-result.md`; update `CLAUDE.md` Architecture (copy documents, guard test) and Current status.
- [ ] **Step 4: Commit** (if authorized): `docs: record phase 7b result`.
