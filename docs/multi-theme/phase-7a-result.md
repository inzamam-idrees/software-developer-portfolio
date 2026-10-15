# Multi-theme portfolio — Phase 7A result (resume/CV data import)

Date: 2026-10-15
Status: Implemented and locally verified; not committed (commits not authorized)
Spec: `docs/superpowers/specs/2026-10-15-admin-content-and-resume-import-design.md` §2
Plan: `docs/superpowers/plans/2026-10-15-a-resume-data-import.md`

## Delivered

- **Schemas** (`lib/portfolio/schemas.mjs`, `lib/portfolio/loader.mjs`): `profile.tagline`;
  `experience.location` and `experience.highlights`; `project.features` and
  `project.responsibilities`; `skills.proficiency` (1–5, keys must exist in `skills.all`);
  a new `content/awards.json` document (ordered, reversed dates rejected).
- **Data** from the latest resume and dev CV: "Senior Full Stack Engineer", "7+ years",
  resume summary, resume bullets per role, Xenex role "Laravel Angular Developer",
  SmartCommerce added and featured first, CV features and responsibilities for every
  project, AI & Automation skill category, stored proficiency, three awards, SEO text.
- **View model**: `portfolio.awards[]` with formatted `duration`; `awards` required by
  `createThemeView`.
- **Rendering**:
  - Executive: company · location, highlight lists, features/role lists on detailed
    project cards, an Awards & honors section.
  - Cinematic: company · location, highlights, project feature/role lists, awards under
    Education, featured diagrams computed in `themes/cinematic/presentation.mjs`.
  - Coding: company · location, highlights, `features:`/`tasks:` lines in project code
    cards, award cards under Education.
- Shared helper `themes/shared/project-detail.mjs` (`projectDetailSections`).

## Decisions

- Resume wins over CV; nothing absent from the PDFs was added (SmartCommerce has no
  links or category).
- The CV's MIS/Nexis responsibilities repeat the POS feature list (item modifiers etc.);
  only "Led frontend Angular development as team lead" was imported for MIS.
- `skills.featured` and existing project technologies, links, and case-study text are
  unchanged.
- `app/components/portfolio/cinematic-presentation.js` was replaced by
  `projectDiagram()` so a featured project without diagram labels (SmartCommerce) renders
  instead of crashing.
- "Explore all eight projects" now shows the real count ("Explore all 9 projects").
- Some new labels ("KEY FEATURES", "MY ROLE", "Awards & honors", "Recognition") are
  temporary literals; Sub-project B moves them, and the Cinematic diagram labels, into
  copy files.

## Verification (this session)

| Check | Result |
|---|---|
| `npm run validate:content` | Canonical portfolio content is valid |
| `npm run test:unit` | 84 pass, 1 fail (pre-existing, see Risks) |
| `npm run lint` | No ESLint warnings or errors |
| `PORTFOLIO_BUILD_DIR=.next-a-build npm run build` | Compiled successfully |
| `tests/browser/content.js` (Cinematic, dev) | Passed |
| `tests/browser/acceptance.js` (Cinematic, dev) | Passed, 5 viewports (1440→390) × 3 routes |
| `tests/browser/executive-acceptance.js` (dev) | Passed, 5 viewports (1440→390), no overflow, no Cinematic chunks |
| `tests/browser/coding-reference-regression.js` (dev) | Passed, 6 viewports (1440→320) × 3 routes, no overflow |

Browser scripts were updated for the new facts, and screenshots now pass
`caret: "initial"` (Playwright's caret hiding mutated inputs before dev hydration,
which produced a harness-only hydration warning).

## Review

A fresh reviewer found no critical issues. Fixed, each test-first:

- A mobile Cinematic rule (`.career-timeline li` at ≤767px) indented the new highlight
  bullets by 60px; it is now scoped to `.career-timeline > li`
  (`tests/unit/theme-timeline-css.test.mjs`).
- Coding award cards sat among education cards with no label; each now shows a visible
  "Award" label (assertion in `tests/browser/coding-reference-regression.js`).

Open for the owner:

- CodeInformatics location: "Islamabad, Pakistan" (kept) vs the resume's "Islamabad, Punjab".
- MIS/Nexis responsibilities: the CV's update UI, accessibility statement page, and
  skeleton loader items were omitted as a suspected copy of the POS entry.
- "ChatGPT" (resume) is represented as "OpenAI"; RSWT's technology list omits Angular
  although its description names it.
- Cinematic home featured cards now show full feature and role lists; they could be
  limited to `/project`.
- `aria-labelledby` on a plain `div` in the Cinematic awards block has no effect.

## Risks

- **Pre-existing failing test**: `tests/unit/theme-settings.test.mjs` expects the bundled
  active theme to be `cinematic`, but commit `40beeda` set `settings/theme.json` to
  `coding`. It fails at `40beeda` without these changes; left for the owner to decide.
- The rendered page payload includes whole canonical JSON documents (seen in the dev
  RSC stream). That predates this phase and contains only public content, but is worth
  reviewing for payload size.
- Production-mode browser runs were not repeated; dev-mode runs and a production build
  were.

## Remaining work

- Sub-project B — theme copy as data.
- Sub-project C — admin content editor and GitHub storage.
