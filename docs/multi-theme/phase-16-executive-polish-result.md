# Phase 16: Executive polish result

Date: 2026-10-26. Focused polish of Phase 15, implemented and verified locally.
No activation, commit or push. The active theme remains Coding.

## Decisions for the eight findings

1. **Page rhythm.** Four chapters now separate identity/career, projects,
   expertise/background/certificates, and writing/résumé/contact. Full-width bands
   alternate between paper and a restrained second ground. Career retains its sticky
   composition, projects remain expandable rows, background combines a readable
   biography and parallel record columns, and closing content uses a compact document
   panel. No chapter numbering, eyebrows, gradients, shadows or new scroll effects.
2. **Career density.** Each role shows its first three canonical highlights. The first
   uses stronger weight/color as the lead, without duplicating it. Remaining highlights
   live in native closed details with a count: 3, 1 and 1 additional responsibilities.
   The first eight technologies in canonical order are visible; the current role's
   ninth technology is available through a counted native disclosure. All facts remain
   present, including without JavaScript. Career ends with the existing Get in touch
   action. Roles with empty highlight arrays get no invented lead.
3. **Certificates.** Executive now owns its certificate presentation. Every usable
   record has title, issuer, a consistent date position, known status and a verification
   link when supplied. Missing dates say “Issue date not provided,” from copy data.
   Description, competencies, credential ID and image remain optional. Content-height
   cards align at the top instead of stretching sparse records into empty tiles.
   An Executive view filter omits blank/placeholder identities before deriving both
   cards and navigation. A real temporary empty-certificate fixture rendered neither
   the section nor its navigation link.
4. **Whitespace and background.** Section padding now uses
   `clamp(44px, 5vw, 64px)`, replacing 96px desktop / 64px mobile section padding:
   about 33% less at desktop and 31% less at mobile. Education and Recognition share
   two columns beneath the full biography, stacking on mobile. About/Education/Awards
   navigation merges into Background; legacy `about`, `education`, `awards` anchors
   remain unique, with sticky-header offsets. Background is available in desktop
   navigation and the native mobile menu.
5. **Expertise.** Numeric level annotations are removed from presentation. Existing
   categories, one-line descriptions and all technologies remain. Proficiency data is
   untouched. It does not record frequency, so daily-use labels were not inferred.
   The former skill-row scroll animation was removed to keep this chapter quiet.
6. **Résumé.** A compact card provides a copy-backed summary, original document URL
   for Download/Open, and optional canonical update metadata. Its full preview is
   closed initially. With JavaScript, opening the native disclosure mounts the iframe.
   Testing found that a nominally lazy no-JS iframe could fetch early; the final no-JS
   fallback uses a Load preview link targeting a source-less named iframe inside the
   disclosure. Opening details and selecting that native link loads the document.
   Twelve browser cases observed zero external viewer requests while closed, followed
   by a request and visible frame after the appropriate user action. Cross-origin
   downloading continues to depend on the existing Google Drive provider.
7. **Biography.** The hero uses at most two sentences from canonical shortIntroduction,
   segmented in the Executive view. This source already exists and contains two
   sentences. A tested fallback uses the first two longIntroduction sentences if the
   short field is absent/empty. The full biography and profile roles are retained in
   Background; no professional positioning copy was handwritten.
8. **Career closing CTA.** One quiet contact button follows career, using the existing
   action copy and canonical email destination.

The design plan and pre-build generic-default critique are in
`phase-16-executive-polish-plan.md`. The cool-paper/ink/indigo direction, local
Inter Tight + Inter, role-led hero and project rows remain intact.

## Tokens and measured contrast

New chapter surface: light `#EEF0F5`, dark `#20232B`.
Certificate surface: light `#FFFFFF`, dark `#2A2F3B`.
The existing paper, ink, accent, secondary text and control-border tokens remain.

Rendered small text was measured at 375, 390, 768, 1280 and 1536px in both schemes,
using actual computed colors, ancestor backgrounds and opacity. Closed, unpainted
content was excluded with native visibility checks. No sampled small text was below
4.5:1. The 1280px category minima were:

| Text category | Light | Dark |
| --- | ---: | ---: |
| Career dates/metadata, including inactive-role opacity | 5.41:1 | 8.00:1 |
| Technology names | 5.86:1 | 8.32:1 |
| Certificate text, dates and status | 6.68:1 | 6.85:1 |
| Résumé summary/metadata | 6.68:1 | 7.83:1 |
| Article metadata | 5.86:1 | 8.32:1 |
| Hero metadata and footer text | 6.23:1 | 9.21:1 |

The lowest sampled small-text ratio across all widths was 5.41:1 light / 6.85:1 dark.
No smaller-text color repair was necessary beyond applying the tested tokens to the
new presentation; the former equal-height empty-card appearance was structural.
Input boundary contrast remains 3.98:1 light / 4.24:1 dark. These are rendered browser
measurements, not a complete screen-reader or assistive-technology audit.

## Before/after height

Authenticated home, 1280×960, default closed disclosures, same canonical content:

| Measurement | Before | After |
| --- | ---: | ---: |
| Theme page height, light and dark | 10,701px | 8,749px |
| Hero section | 565px | 501px |
| Career section | 2,123px | 2,086px |
| About + Education + Awards / combined Background | 1,935px | 1,265px |
| Résumé section | 1,194px | 376px |

Overall reduction: **1,952px, approximately 18.2%**. Expanding disclosures naturally
increases height. Height observations are local measurements, not performance claims.

## Skills used

- **frontend-design:** retained the approved identity; used quiet chapter tones and
  different content compositions instead of giant chapter cards or more decoration.
  The critique rejected numbered chapters, repetitive eyebrows and new motion.
- **ui-ux-pro-max:** guided progressive disclosure, native keyboard controls, target
  sizes, long-token wrapping and real text/background contrast. It also supported
  retaining factual categories rather than inferring daily-use frequency from levels.
- **playwright-cli:** supplied the before review, the production matrix, no-JS and
  keyboard tests, viewer-request checks, empty-data fixture and small-text measurements.
- **superpowers:verification-before-completion:** checked command output and final
  browser observations before recording completion. The explicit user process supplied
  the plan/critique/build sequence without an approval pause.

## Actual verification in this session

| Check | Result |
| --- | --- |
| `npm run validate:content` | Passed. |
| `npm run build:theme-css` | Passed through the existing stylesheet pipeline. |
| `npm run lint` | Passed; no lint warnings/errors, existing Next lint deprecation notice only. |
| `npm run test:unit` | 46 test files passed, zero failures. Includes six new focused Executive regression cases plus the hardcoded-copy guard, schema, isolation, registry, parity and preview checks. |
| `PORTFOLIO_BUILD_DIR=.next-executive-16-build npm run build` | Passed. Existing public static/SSG/ISR and dynamic preview/admin route behavior retained. |
| Screenshot matrix | 90 cases passed: home/project/blog × 375/390/768/1280/1536 × light/dark × standard/no-JS/reduced motion. One h1 per route; no horizontal overflow, out-of-viewport text, hidden sections or canvas. |
| New disclosures and sparse data | 12 focused cases passed: light/dark × 375/390/1280 × standard/no-JS. Initial three highlights, ≤8 tags, closed extra content, keyboard open/close, complete certificate identities, deferred viewer requests and unique background/legacy anchors. |
| Empty certificates | A separate production server using only a temporary canonical data copy with `certificates: []` produced zero certificate sections and zero certificate navigation links. Real content was unchanged. Placeholder filtering and empty career arrays were also covered by unit tests. |
| Motion regression | Three career positions in both schemes, sticky guide, native progress, observer fallback thirds, section indicators including Background, keyboard role focus and mobile menu closure passed. Shared paused preference produced static full-opacity content; reduced contexts passed in the matrix. |
| Contrast | Ten width/palette runs passed, covering rendered small text, as detailed above. |
| Runtime/contact | Sampled production CLS 0, skip link focused main, zero tested Three/Fiber/GSAP script signatures, zero canvas, zero page errors. Contact API was mocked: invalid submission focuses name, success clears fields, failure retains the message. No real email sent. |
| `git diff --check` | Passed. |

Playwright Firefox was attempted and returned “Browser firefox is not installed,”
with the expected firefox-1553 executable absent. WebKit is also absent from the
Playwright cache. **No non-Chromium engine was tested.** Observer fallback behavior
was exercised with the native progress animation explicitly disabled; this is not
claimed as a Firefox/WebKit result.

## Changed files for this polish pass

- `themes/executive/home.jsx`, `presentation.mjs`, `shell.jsx`, `styles.scss`.
- New Executive-only `certificates.jsx`, `resume.jsx`, `resume-preview.jsx`.
- `portfolio-data/settings/copy/executive.json` and only its subtree in
  `lib/portfolio/copy-schemas.mjs`.
- New `tests/unit/executive-polish.test.mjs`; updated
  `tests/unit/executive-theme-presentation.test.mjs` and
  `tests/browser/executive-acceptance.js` for the changed presentation.
- New `tests/browser/executive-polish{,-interactions,-contrast,-motion,-runtime,-review}.js`.
- This result and `phase-16-executive-polish-plan.md`.

Phase 15 changes were already uncommitted when this phase started. This file lists
Phase 16 edits, not the entire cumulative working-tree diff. Other theme sources,
active-theme data, registry slots, route/SEO code, shared components, contact handler,
font files, environment files and dependency manifests were not edited in this pass.

## Data gaps for the owner

- All three roles (Nextbridge Ltd., Xenex Media, CodeInformatics) have highlights but
  no separate outcome field or quantified outcome metadata. The first highlight is
  used as the lead. Add verified outcomes as highlights through the existing data
  model; a dedicated new field would need a separate schema decision.
- Python for Data Science and AI Engineer lack issue dates and verification URLs;
  they also lack descriptions, competencies, credential IDs and images. Their real
  titles/issuers/status remain visible. Add only known metadata.
- SPA - Angular Web Application carries canonical credential ID `XYZ123` and its
  matching URL. Confirm or replace that owner-supplied value; external credential
  verification was not performed and no credential facts were invented here.
- There is no short-summary gap: shortIntroduction exists and is used. Daily-use
  skill frequency is not recorded. Résumé metadata is null, so no update date is shown.

## Evidence, risks and remaining work

Local evidence: `artifacts/portfolio/phase16/`. Before screenshots cover the required
four widths in both schemes. The standard/nojs/reduced matrix includes all five tested
widths. Full-page and career screenshots exist at 375 and 390px in both palettes,
with and without JavaScript. Normal matrix screenshots preserve the preview controls.
Supplemental `theme-*` images and `after-*` section clips hide floating preview chrome
(and, for element clips, the sticky header/skip link) only for unobstructed visual
review; this does not change production styling. JSON observations are saved beside
screenshots for before, browser, interactions, contrast, motion, runtime and review.

No implementation work remains for the eight findings. Owner visual acceptance and
canonical metadata cleanup remain. Chromium was the only available Playwright engine;
no screen-reader session or live email delivery was tested. The résumé viewer and
cross-origin download behavior depend on the existing external provider; request
initiation and frame visibility were verified, not the provider's ongoing availability.
The shared admin preview toolbar can still overlap content and was left unchanged.
