# Sub-project A — Resume/CV Data Import Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Extend the canonical schemas for resume/CV detail and replace portfolio data with the owner's latest resume and CV, rendered in all three themes.

**Architecture:** Schema changes land in `lib/portfolio/schemas.mjs` and the loader manifest; data lands in `portfolio-data/content/*.json`; each theme renders new fields in its own components. No new dependencies.

**Tech Stack:** Next.js 15 App Router, React 19, Zod 4, `node --test`.

**Spec:** `docs/superpowers/specs/2026-10-15-admin-content-and-resume-import-design.md` §1–2. Source text: `~/Downloads/Inzamam Idrees Resume.pdf`, `~/Downloads/Inzamam Idrees CV [dev].pdf` (extract with `pdftotext -layout <file> -`).

## Global Constraints

- Never invent facts; anything absent from the PDFs stays `null`/`[]`.
- Resume wins over CV on conflicts; CV supplies project detail.
- Experience wording is "7+ years" everywhere ("5+" from the PDFs is replaced).
- Featured order: SmartCommerce 1, MIS/Nexis 2, Group Captain 3, Remmi CRM 4.
- Skill proficiency is stored, never rendered.
- Keep unchanged: education entries, social links, resume URL, contact details, existing project links and problem/solution/outcome text.
- Commit steps run only if the owner has authorized commits for this session (CLAUDE.md rule 9); otherwise leave changes staged-ready and report.
- Run `npm run validate:content && npm run test:unit` after every data or schema task.

## Review Focus

- A project with features but no responsibilities (or vice versa) must render only the present list, with no empty heading — covered in Task 4/5 tests.
- An experience entry with `highlights: []` (e.g. a future edit) must render without an empty list — Task 4.
- `skills.proficiency` key not in `skills.all` must fail validation with a path pointing at `proficiency` — Task 1.
- Award `endDate` before `startDate` must fail validation — Task 1.
- A Coding-theme skill with no icon in `utils/skill-image.js` (e.g. "RAG") must render a text badge, not a broken `<img>` — Task 5 browser assertion.

---

### Task 1: Schema extensions

**Files:**
- Modify: `lib/portfolio/schemas.mjs` (profile, experience, project, skills, new award schemas, `canonicalPortfolioSchema`)
- Modify: `lib/portfolio/loader.mjs` (manifest entry `["content","awards","content/awards.json", awardsSchema]`; `normalize` sorts awards by order)
- Test: `tests/unit/portfolio-schemas.test.mjs`, `tests/unit/portfolio-loader.test.mjs` (fixture gains `content/awards.json` and new required fields)

**Interfaces:**
- Produces: `awardSchema`, `awardsSchema` (ordered collection); `profile.tagline: string`; `experience.location: string`, `experience.highlights: string[]` (unique, may be empty); `project.features: string[]`, `project.responsibilities: string[]` (unique, may be empty, default not allowed — must be present); `skills.proficiency: Record<string, 1|2|3|4|5>`; `portfolio.content.awards`.

- [ ] **Step 1: Write failing tests** in `portfolio-schemas.test.mjs`:
  - `award schema accepts a dated award` — `{id:1,title:"Student of the Year",issuer:"University of Gujrat",location:"Sialkot, Punjab",startDate:"2015-09",endDate:"2016-08",order:1}` parses.
  - `award schema rejects reversed dates` — endDate `"2015-08"` with startDate `"2015-09"` fails with path `["endDate"]`.
  - `experience schema requires location and highlights` — missing `location` fails; `highlights:["a","a"]` fails.
  - `project schema requires features and responsibilities arrays` — missing `features` fails; `features:[]` passes.
  - `skills schema rejects proficiency for unknown skills` — `proficiency:{RAG:3}` with `all` lacking RAG fails with path `["proficiency","RAG"]`; value `6` fails.
  - `profile schema requires a tagline`.
  - Loader test: fixture without `content/awards.json` rejects with `code: "MISSING_DOCUMENT"`, `document: "awards"`.
- [ ] **Step 2: Run** `node --test tests/unit/portfolio-schemas.test.mjs tests/unit/portfolio-loader.test.mjs` — expect the new tests to FAIL.
- [ ] **Step 3: Implement** the schema fields above. Award dates use the existing `month` helper; reversed-date refine mirrors `educationSchema`. Proficiency: `z.record(requiredText, z.number().int().min(1).max(5))` checked against `all` inside the existing `skillsSchema.superRefine`. Update existing fixtures in both test files to include the new required fields.
- [ ] **Step 4: Run** the two test files — expect PASS. `npm run validate:content` is expected to FAIL here (data not yet migrated); that is resolved in Task 2.
- [ ] **Step 5: Commit** (if authorized): `feat(content): extend schemas for resume detail and awards`.

### Task 2: Data import

**Files:**
- Modify: `portfolio-data/content/{profile,about,experience,projects,skills}.json`, `portfolio-data/settings/seo.json`
- Create: `portfolio-data/content/awards.json`
- Test: `tests/unit/portfolio-content.test.mjs`

**Interfaces:**
- Consumes: Task 1 schemas.

- [ ] **Step 1: Write failing content tests** in `portfolio-content.test.mjs`:
  - `bundled profile reflects the latest resume` — `designation === "Senior Full Stack Engineer"`, `experienceLabel === "7+ years"`, `longIntroduction` contains `"7+ years"` and not `"5+"`.
  - `featured projects follow the approved order` — featured titles in order equal `["SmartCommerce – E-Commerce Widgets", "MIS / Nexis Project", "Group Captain Project", "Remmi CRM"]`.
  - `every project carries CV features and responsibilities` — each project has `features.length > 0` and `responsibilities.length > 0`.
  - `bundled awards match the resume` — three titles: Student of the Year, High GPA Achievers, Coding Competition Winner.
  - `AI skills are categorized` — a category with id `ai` contains `"RAG"` and `"Prompt Engineering"`; `proficiency.Angular === 5`.
  - Update the existing `includes("Figma")` assertion only if Figma is removed (it stays — Global Constraints keep current skills).
- [ ] **Step 2: Run** `node --test tests/unit/portfolio-content.test.mjs` — expect FAIL.
- [ ] **Step 3: Edit data** per spec §2 "Data mapping":
  - `profile.json`: `designation`, `tagline` ("Senior Full Stack Engineer | AI-Enabled Web Applications | JavaScript, React, Angular, Node.js, Python"), `longIntroduction` (resume summary, both paragraphs, "7+ years"), `experienceLabel: "7+ years"`.
  - `about.json`: `personalStatement` from resume paragraph 1 ("7+ years").
  - `experience.json`: company names without parentheses, `location` (Nextbridge: "Lahore, Punjab"; Xenex: "Queensland, Australia (Remote)"; CodeInformatics: "Islamabad, Pakistan"), Xenex role "Laravel Angular Developer", resume bullets as `highlights`, `technologies` only those named in the bullets.
  - `projects.json`: new project `id: 9`, `order: 9`, title "SmartCommerce – E-Commerce Widgets" (existing `order` values unchanged; archive order is independent of featured order), CV `features`/`responsibilities` for all, fill missing `longDescription` from CV, featured flags/order per Global Constraints.
  - `skills.json`: union of resume/CV skills into `all`; categories `frontend`, `backend`, `delivery`, new `ai` (label "AI & AUTOMATION", title/summary written as neutral descriptions of the listed tools only); `proficiency` from CV ratings applied to each skill of the rated group (e.g. "Angular / React 5" → Angular 5, React 5).
  - `awards.json`: three entries per spec.
  - `seo.json`: "Senior Full Stack Engineer" in titles; descriptions mention AI-enabled web applications.
- [ ] **Step 4: Run** `npm run validate:content && npm run test:unit` — expect "Canonical portfolio content is valid." and all tests PASS.
- [ ] **Step 5: Commit** (if authorized): `content: import latest resume and CV`.

### Task 3: View model for awards

**Files:**
- Modify: `lib/portfolio/current-view.mjs`, `lib/themes/create-view.mjs` (`requiredContent` adds `"awards"`)
- Test: `tests/unit/theme-content-isolation.test.mjs`

**Interfaces:**
- Produces: `portfolio.awards[]` each with `duration: string` formatted `"Sep 2015 - Aug 2016"` via existing `formatMonth`.

- [ ] **Step 1: Write failing test** `awards reach every theme view with formatted durations` — for each theme view, `view.awards === portfolio.awards` and `portfolio.awards[0].duration === "Sep 2015 - Aug 2016"`.
- [ ] **Step 2: Run** `node --test tests/unit/theme-content-isolation.test.mjs` — FAIL.
- [ ] **Step 3: Implement** in `buildCurrentPortfolioView`.
- [ ] **Step 4: Run** — PASS.
- [ ] **Step 5: Commit** (if authorized): `feat(themes): expose awards in the portfolio view`.

### Task 4: Executive and Cinematic rendering

**Files:**
- Modify: `themes/executive/home.jsx`, `themes/executive/project-card.jsx`, `app/components/portfolio/sections/experience.jsx`, `app/components/portfolio/sections/education.jsx`, `app/components/portfolio/ui/project-summary.jsx`, `themes/cinematic/home.jsx`, `app/css/executive.scss`, `app/css/portfolio.scss`
- Test: `tests/unit/executive-theme-presentation.test.mjs`, `tests/unit/cinematic-canonical.test.mjs`; browser `tests/browser/executive-acceptance.js`, `tests/browser/acceptance.js`

**Interfaces:**
- Consumes: `experience.highlights`, `project.features`, `project.responsibilities`, `portfolio.awards`.

- [ ] **Step 1: Write failing tests.** `node --test` cannot load `.jsx`, so list-shaping logic lives in `.mjs` and markup is checked in the browser:
  - Create `themes/cinematic/presentation.mjs` exporting `createCinematicPresentation(portfolio)`; `themes/cinematic/home.jsx` and `projects.jsx` switch to it.
  - Both presentations expose `projectDetailSections(project) → Array<{ kind: "features"|"responsibilities", items: string[] }>` (empty lists omitted) and `experience[].highlights` unchanged.
  - `executive-theme-presentation.test.mjs`: `projectDetailSections({features:["a"],responsibilities:[]})` deep-equals `[{kind:"features",items:["a"]}]`; `view.awards.length === 3`.
  - `cinematic-canonical.test.mjs`: same `projectDetailSections` assertions via the cinematic presentation.
  - Browser (`tests/browser/executive-acceptance.js`, `tests/browser/acceptance.js`): add assertions that `#executive-awards-title` / the cinematic awards heading exist and list three awards; an experience item renders a `ul` of highlights; no empty `ul` exists inside `.executive-timeline` or `.career-timeline`.
- [ ] **Step 3: Implement** markup in each component; headings/labels for the new blocks are temporary literals ("Highlights", "Key features", "Responsibilities", "Awards & honors") that Sub-project B moves into copy files. Styles follow each theme's existing list styles.
- [ ] **Step 4: Run** unit tests — PASS; then `npm run lint`.
- [ ] **Step 5: Browser check** — start `PORTFOLIO_BUILD_DIR=.next-portfolio-dev npm run dev -- --port 3001`, run `playwright-cli -s=portfolio run-code --filename=tests/browser/executive-acceptance.js` and `tests/browser/acceptance.js` with the theme set via admin preview; expect PASS at desktop and mobile.
- [ ] **Step 6: Commit** (if authorized): `feat(themes): render highlights, project detail, and awards`.

### Task 5: Coding theme rendering

**Files:**
- Modify: `themes/coding/adapter.mjs` (map `highlights`, `features`, `responsibilities`, `awards`), `app/components/homepage/experience/index.jsx`, `app/components/homepage/projects/project-card.jsx`, `app/components/homepage/education/index.jsx`, `app/components/homepage/skills/index.jsx`
- Test: `tests/unit/coding-theme-adapter.test.mjs`; browser `tests/browser/coding-reference-regression.js`

**Interfaces:**
- Produces: adapter fields `experiences[].highlights`, `projectsData[].features`, `projectsData[].responsibilities`, `awards[] {id,title,issuer,duration}`.

- [ ] **Step 1: Write failing tests** — `coding-theme-adapter.test.mjs`: adapter maps the four fields; `skillsData` keeps `"RAG"`. Browser (`tests/browser/coding-reference-regression.js`): the skills grid item for "RAG" contains its text and no `img`; awards cards are present under Education.
- [ ] **Step 2: Run** `node --test tests/unit/coding-theme-adapter.test.mjs` — FAIL.
- [ ] **Step 3: Implement**; project card shows features as `features: [...]` lines in the existing code-object style; awards appear as cards under Education.
- [ ] **Step 4: Run** unit tests, `npm run lint`, then the coding browser regression — PASS.
- [ ] **Step 5: Commit** (if authorized): `feat(coding): render resume detail and awards`.

### Task 6: Phase verification and docs

**Files:**
- Create: `docs/multi-theme/phase-7a-result.md`
- Modify: `CLAUDE.md` (Current status)

- [ ] **Step 1: Run** `npm run validate:content && npm run test:unit && npm run lint && npm run build` — all succeed.
- [ ] **Step 2: Browser** — `/`, `/project`, `/blog` for coding, cinematic, executive at 375px and 1440px; no console errors; no horizontal scroll.
- [ ] **Step 3: Write** the result doc: changed files, decisions, tests run with results, risks, remaining work (B, C).
- [ ] **Step 4: Commit** (if authorized): `docs: record phase 7a result`.
