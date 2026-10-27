# Phase 17: Executive finishing result

Date: 2026-10-26. Completed locally; no commit, push or activation.
Phase 15/16 direction is retained. Public active theme remains Coding.

## Decisions and delivered behavior

1. **Certificates.** Executive filters suspicious credential IDs/URLs in its view
   layer, including URL-decoded, case-insensitive XYZ123, example, TODO, lorem and
   placeholder markers. Missing dates and other absent optional fields are omitted;
   no “not provided” line is rendered. Two legitimate sparse records remain, with
   one canonical `verified` status, so they use a compact consistent list instead of
   a card grid. A grid is reserved for at least two canonical verified statuses.
   Zero usable records hides both section and navigation. Canonical data is unchanged.
2. **Impact.** Each career role has a quiet conditional presentation slot that accepts
   an explicit outcome, never an inferred responsibility or invented metric. No
   current role has such a field, so no empty Impact label is shown. No factual schema
   field or professional data was added. The proposed schema change is below.
3. **Tags.** Career, project and expertise tags are wrapping Inter chips at 14px with
   21px line height. The first six per group use stronger text/surface treatment;
   remaining tags retain readable secondary contrast. Career overflow still uses the
   counted native disclosure. Every label remains available; none is ellipsized.
4. **Hero.** A quiet proof strip below the actions shows unique canonical employer
   names and featured technologies. Client regions were not inferred from prose.
   Intro text is 19px desktop / 18px mobile; buttons use 16px text and measured 52px
   height. Combined hero-bottom/career-top padding is 96px at desktop, previously
   128px, and 66px at mobile, previously 88px: 25% less in both cases.
5. **Sparse sections.** With fewer than three fetched articles, Writing becomes a slim
   title/latest-article strip and keeps its anchor and Writing link. Empty/unavailable
   results retain honest data-backed fallback wording. Project row padding is 38px
   top/bottom, previously 48px: approximately 20.8% less.
6. **Three motion additions.** Project details open/close through a 0fr/1fr wrapper
   plus opacity. Native details stay open during the close transition, then close;
   closing content is temporarily inert so clipped links cannot receive focus. Header
   indicator movement uses transform/opacity between equal-width navigation cells,
   avoiding geometry measurements. Career guide handoff uses a 4px transform and
   subtle opacity transition. Existing hero entrance/career progress are retained;
   no additional reveal effects, scroll listeners, measurement loops or libraries.
   Native immediate toggles remain available without JS, with reduced motion and
   with shared portfolio-motion paused. Interrupted transitions/preferences settle
   without trapping content or leaving an open native disclosure visually closed.
7. **Cross-engine/light review.** Light and dark full-page/career screenshots were
   captured at 390/1280 before and after. Firefox was installed locally through
   Playwright, without changing project dependencies, and actual Firefox checks ran.

The short plan, before findings and generic-default critique are in
`phase-17-executive-finish-plan.md`. No statistic cards, employer logos, invented
client geography or extra decoration were introduced.

## Hidden certificate for owner correction

| Canonical ID | Title / issuer | Reason hidden in Executive |
| --- | --- | --- |
| `1` | SPA - Angular Web Application / Coursera | Credential ID `XYZ123`; URL ends `/account/accomplishments/certificate/XYZ123`. Both match placeholder detection. |

The entire record is hidden, rather than merely hiding its link. It remains in
canonical data for the owner to correct. Python for Data Science / IBM and AI Engineer
/ Google remain visible. Their missing dates/URLs are omitted. “Verified” reflects
canonical status only; no external credential verification was performed.

## Impact and other data gaps

All roles lack a dedicated outcome/metric field: **Nextbridge Ltd., Xenex Media,
CodeInformatics**. Their existing highlights remain responsibilities, not fabricated
impact evidence. The current strict experience schema has no outcome field.

Proposed follow-up, **not implemented**: add `outcome: optionalText.optional()` to
`experienceSchema` in `lib/portfolio/schemas.mjs`, matching the existing project
outcome convention. This would allow a short owner-supplied, verified result, including
an actual metric when known. Existing records would remain valid with the field
absent/null. The Executive slot is prepared to display that explicit field, but it
cannot receive one through the current validated loader until the schema is extended.
Do not derive metrics from descriptions or dates.

Projects with existing qualitative outcomes: **MIS / Nexis Project, Remni CRM,
Group Captain Project**. Projects without outcome data:

- POS Online Ordering
- GetWorker
- XfinityClassified Ad System
- Smart Destination Project
- Research Support Web Tool (RSWT)
- SmartCommerce – E-Commerce Widgets

No new numerical metrics were added. IBM/Google certificate metadata still needs
owner-supplied issue dates/verification links if available. Résumé update metadata is
still null; no date was invented. Daily-use skill frequency is still not recorded.

## Measured contrast and sizing

Computed small-text colors were composited with actual ancestor backgrounds and
opacity at 375/390/768/1280/1536 in light/dark in both engines. No sampled value was
below 4.5:1. Chromium category minima at 1280px:

| Category | Light | Dark |
| --- | ---: | ---: |
| Career metadata, including receding entries | 5.41:1 | 8.00:1 |
| Technology chips | 5.86:1 | 8.32:1 |
| Certificate list text/status | 6.38:1 | 8.90:1 |
| Hero proof/overview metadata | 6.23:1 | 9.21:1 |
| Résumé metadata | 6.68:1 | 7.83:1 |

Lowest observed small text: Chromium **5.41:1 light / 7.83:1 dark**; Firefox
**5.49:1 light / 7.83:1 dark** at 1280px. Animated snapshots include computed opacity;
values are session observations, not a full assistive-technology audit. Input boundary
contrast remains 3.98:1 light / 4.24:1 dark. Palette and font families are unchanged.

## Before/after page height

Same canonical data and 960px viewport height, default closed disclosures:

| Width | Phase 16 before | Phase 17 Chromium after | Change |
| --- | ---: | ---: | ---: |
| 390px | 13,766px | 12,882px | −884px / 6.4% |
| 1280px | 8,749px | 8,284px | −465px / 5.3% |

Light/dark measurements match within each engine. Firefox after at 1280 measured
8,281px; small engine text-layout differences are expected. Height is measured on
`.theme-executive`; expanding disclosures naturally increases it.

## Skills used

- **frontend-design:** preserved the established identity and quiet chapters; kept
  proof as employer/stack text, chose a compact list for sparse credentials and avoided
  new card decoration, metric theater, logos and repeated heading adornments.
- **ui-ux-pro-max:** guided wrapping readable chips, preserved overflow labels and
  native disclosures, and informed focus handling and measured small-text contrast.
  The local chip-collection guidance specifically favored wrapping/+N over clipping.
- **playwright-cli:** captured the before/after comparisons, installed/launched
  Firefox, ran both browser matrices, every-disclosure keyboard checks, real observer
  fallback, transition states, no-JS behavior, contrast and runtime checks.
- **superpowers:verification-before-completion:** checked actual command results and
  browser observations before recording completion.

## Tests actually run in this session

| Check | Result |
| --- | --- |
| `npm run validate:content` | Passed. |
| `npm run build:theme-css` | Passed through the existing entry/pipeline. |
| `npm run lint` | Passed, no lint warnings/errors; existing Next lint deprecation notice only. |
| `npm run test:unit` | 47 test files passed, zero failures, including new credential-marker, hidden-item, proof and explicit-impact tests and the hardcoded-copy guard. |
| `PORTFOLIO_BUILD_DIR=.next-executive-17-build npm run build` | Passed, including content/CSS prebuild. Registry slots and existing static/SSG/ISR/dynamic route behavior retained. |
| Chromium screenshot matrix | 90 cases passed: home/project/blog × five requested widths × light/dark × standard/no-JS/reduced. One h1; no overflow, out-of-viewport text, hidden sections or canvas. |
| Firefox screenshot matrix | The same 90 cases passed. Separate screenshot evidence retained. |
| Every-disclosure keyboard checks | 84 open/close cycles per engine, 168 total, across all rendered theme disclosures on the three routes in standard/no-JS/reduced/paused contexts. Zero failures. |
| Three transitions, both engines | Actual grid-template-rows/opacity transitions observed on opening; native details remained open/inert during close and closed afterward. Indicator indices/transforms changed through five sections; role handoff settled at 4px/full opacity. Reduced/paused transition durations were 0s. Switching preferences with a disclosure open preserved accessibility. |
| Actual Firefox scroll fallback | Firefox 156.0 reported no native CSS view-timeline support. Its unforced observer fallback settled at 1/3, 2/3 and 1 progress for the three roles in light/dark at 390/1280. Chromium 156.0.8078.47 reported native timeline support. |
| Sparse data/no-JS | 12 focused Chromium cases passed at 375/390/1280, both palettes, standard/no-JS. No external résumé request while closed; preview loaded after user action. A temporary canonical fixture containing only the suspicious certificate rendered zero certificate sections and zero certificate navigation links. Real data was unchanged. |
| Contrast | Ten width/palette runs per engine passed, including real chip/list/proof text. |
| Runtime/contact | Sampled production CLS 0; skip link focused main; no tested Three/Fiber/GSAP script signatures, no canvas, no page errors. Mocked contact validation/success/failure passed; no real email sent. Public theme confirmed Coding. |
| `git diff --check` | Passed. |

Firefox was downloaded into Playwright's local browser cache, not added as a package.
WebKit was not installed or tested. Initial testing against the old Phase 16 build
encountered its now-stale copy schema; final evidence above uses the Phase 17 build.

## Changed files in this pass

- `themes/executive/presentation.mjs`, `certificates.jsx`: filtering, canonical verified
  count, compact-list choice and omitted absent fields.
- `themes/executive/home.jsx`, `writing.jsx`: conditional Impact, proof strip and sparse
  writing presentation.
- `themes/executive/project-card.jsx`, `enhancement.jsx`, `shell.jsx`, `styles.scss`:
  disclosure grid wrapper, bounded native enhancement, header indicator, role handoff,
  readable chips, sizing and spacing.
- `portfolio-data/settings/copy/executive.json` and its subtree in
  `lib/portfolio/copy-schemas.mjs`: proof/Impact copy; removed missing-date copy.
- New `tests/unit/executive-finish.test.mjs`; updated the prior Executive sparse-record
  test in `tests/unit/executive-polish.test.mjs` for intentional placeholder exclusion.
- New `tests/browser/executive-finish{,-contrast,-disclosures,-engine,-interactions,
  -review,-runtime,-transitions}.js`.
- This result and `phase-17-executive-finish-plan.md`.

The checkout already contained uncommitted Phase 15/16 work. This list describes
Phase 17 changes, not the cumulative diff. No other theme sources, factual content
files, factual schemas, activation, registry, routes/SEO, shared components, environment
files, contact handler or dependency manifest were edited.

## Evidence and remaining limits

Evidence is local and ignored under `artifacts/portfolio/phase17/` with a separate
`firefox/` image directory. It includes before/after light/dark full-page/career at
390/1280, both 90-case matrices, clean supplemental section clips, engine role states
and JSON results for each verification script. Supplemental `theme-*`/`detail-*` clips
hide floating preview controls and sticky chrome solely for unobstructed image review;
the main matrix and raw before/after captures preserve normal controls.

No implementation work remains for the finishing changes. Owner data correction and
an approved experience-outcome schema extension remain necessary for stronger evidence.
There was no screen-reader session, live email delivery or external credential audit.
The existing résumé provider controls remote document availability/download behavior.
The shared preview toolbar can still overlap content and was left unchanged. Browser
runtime installation changed only the local Playwright cache. No commit or push.
