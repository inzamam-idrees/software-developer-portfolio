# Phase 18: Optional experience outcome result

Date: 2026-10-26. Implemented and verified locally. No commit, push or activation.
No outcome, metric or professional fact was added to the real experience records.

## Delivered

- `experienceSchema` now includes exactly `outcome: optionalText.optional()`, matching
  the existing project convention. Absent and null remain valid; supplied strings
  are trimmed and must be non-empty. Unknown keys and invalid types remain rejected.
- The owner explicitly selected **preserve existing rules, no field maximum** after
  inspection found that project outcomes have no character limit. Long strings are
  therefore accepted identically in both schemas. The existing 256KiB admin save
  request limit still rejects oversized requests; no new limit was introduced.
- The experience document remains in the existing registry. Registry schema references,
  canonical loading, normalized records, view derivation and stores already propagate
  optional properties; no extra document or duplicated mapping was needed.
- The admin editor exposes an **Outcome** textarea for every experience record. Its
  label and guidance are shared copy data: “A short, verified result for this role;
  leave empty if unknown.” Generated JSON-schema title/description metadata supplies
  those values to SchemaForm. Help is visible and linked with `aria-describedby`;
  validation preserves both help and error references. Blank input normalizes to null,
  and Clear allows removing an existing value.
- Executive's existing quiet Impact presentation now uses a small, directly testable
  server-rendered component. It consumes only `outcome`, escapes text through React,
  and returns null for unknown/empty values: no label, wrapper or margin-producing gap.
  Long tokens wrap within the existing reading measure. No new visual treatment or
  motion was added.
- Coding, Cinematic, Spatial and Prism presentation sources were not edited. Tests
  confirm their canonical views receive the extra property but do not present it.
  In a no-JavaScript browser comparison, their rendered main text and heights were
  identical between fixtures with/without the new field, with no fixture-text leak.

## Admin validation layout repair

The extended browser check caught an existing array/grid overflow when an invalid
Outcome triggered the role's “Needs a fix” badge. The editor array now uses a
shrinkable grid column, array items may shrink, and hidden fieldset legends retain
1px width rather than inheriting the full legend width. This repairs the validation
state without clipping/hiding editor content or redesigning other pages. Save, clear,
validation and post-validation recovery were retested at 390 and 1280px.

## Verification actually observed

| Check | Result |
| --- | --- |
| `npm run validate:content` | Passed. Existing records without outcome validate unchanged. |
| `npm run build:theme-css` | Passed through the existing pipeline. |
| `npm run lint` | Passed with no lint warnings/errors; existing Next lint deprecation notice only. |
| `npm run test:unit` | 48 test files passed, zero failures, including the no-hardcoded-copy guard. |
| `PORTFOLIO_BUILD_DIR=.next-experience-18-build npm run build` | Passed. Existing registry slots and route behavior retained. |
| New focused unit tests | Six cases passed: absent/null/valid/trimmed/blank/invalid/strict data; long-text parity with projects; temporary loader/view/SSR propagation and null rendering; safe text escaping; copy-backed form metadata/blank normalization; real filesystem save/clear/request limit; real GitHub store through a mocked Contents API. |
| Executive fixture matrix | 16 cases passed: supplied/absent outcome × light/dark × 390/1280 × standard/no-JS. Exactly one Impact block for the supplied fixture; zero for absence. No horizontal overflow, including a deliberately long unbroken token. |
| Editor browser checks | Four cases passed: filesystem and mocked GitHub, each at light 1280 / dark 390. Outcome label/help/textarea, save, trimmed reload, Clear, whitespace rejection, linked help+error, recovery and no overflow were verified. |
| Filesystem save path | Actual editor POSTs used the normal content-save handler and filesystem store, writing only a disposable data copy. Save/reload/clear persisted correctly and returned liveAfterWrite=true. |
| Mocked GitHub save path | Actual editor POSTs used the normal handler and GitHub store, with a fully mocked local Contents API. Save/reload/clear persisted through the mock and returned liveAfterWrite=false. The displayed commit status/link was simulated; no real GitHub request or commit occurred. |
| Other-theme isolation | Updated unit isolation check passed. Coding/Cinematic/Spatial/Prism no-JS rendered text and main height were identical across the supplied/absent fixtures, and none displayed the test marker. |
| `git diff --check` | Passed. |

The synthetic preview outcome is explicitly marked TEST FIXTURE ONLY, not a
professional claim. Unit tests use temporary copies. Browser servers separately used
long-outcome, absent-outcome, writable-filesystem and mocked-GitHub fixture data under
`/tmp`; none wrote real `portfolio-data/content/experience.json`.

### Outcome contrast and wrapping

Measured computed text/background colors and ancestor opacity in the preview matrix:

| Rendered element | Light minimum | Dark minimum |
| --- | ---: | ---: |
| Outcome body | 6.23:1 | 9.21:1 |
| Impact label | 16.60:1 | 15.82:1 |

Both standard/no-JS cases passed. The fixture includes repeated clearly labeled test
text plus an unbroken test token; paragraph and document scroll widths stayed within
their available widths at 390 and 1280px. These are session browser measurements,
not a complete assistive-technology audit.

## Skills used

- **frontend-design:** retained the Phase 17 hierarchy: a quiet Impact line rather
  than a new card, badge or numerical claim. Unknown outcomes render nothing.
- **ui-ux-pro-max:** guided visible field guidance, linked help/error descriptions,
  a textarea for readable editing, wrapping rather than truncation, and the responsive
  validation repair.
- **playwright-cli:** verified real editor save/clear/error flows with disposable stores,
  standard/no-JS preview rendering, light/dark contrast, mobile wrapping and other-theme
  presentation isolation.
- **superpowers:verification-before-completion:** checked actual command results and
  final browser observations before recording completion.

## Changed files in this phase

- `lib/portfolio/schemas.mjs`: optional experience outcome.
- `portfolio-data/settings/copy/shared.json`, `lib/portfolio/copy-schemas.mjs`: shared
  admin field label/help data and its strict schema.
- `lib/admin/form-schema.mjs`: inject copy-backed field title/description into the
  generated experience form schema.
- `app/admin/content/[id]/page.js`: supply shared field copy from the existing cached
  canonical view.
- `app/admin/content/schema-form.jsx`: honor field titles/descriptions, associate help
  and validation errors, use textarea sizing for outcome.
- `app/css/admin.scss`: help text styling and bounded validation layout repair.
- `themes/executive/impact.mjs`, `home.jsx`, `styles.scss`: pure conditional Impact
  rendering and long-token wrapping.
- `tests/unit/experience-outcome.test.mjs`, `tests/unit/theme-content-isolation.test.mjs`.
- `tests/browser/experience-outcome.js`, `experience-outcome-admin.js`.
- This result and `phase-18-experience-outcome-plan.md`.

The checkout contains earlier uncommitted phases. This list describes Phase 18 edits,
not the cumulative diff. The real experience file still has no outcome keys, is
unchanged in Git, and has SHA-256
`23091c1142aa978feb8ab9cc50ab17f54ccc685498e7e1f4ab78d0868f505503`.
Only UI guidance was added under portfolio-data/settings/copy; no professional outcome
text was added anywhere in the real portfolio-data content. Activation remains Coding.

## Owner checklist

The following three records still need an owner-supplied outcome, if known:

- Nextbridge Ltd. — Senior Software Engineer
- Xenex Media — Laravel Angular Developer
- CodeInformatics — Web Developer

To add one:

1. Open Admin → Content → Experience and expand the relevant role.
2. Write one short sentence in Outcome describing a result, not another responsibility.
3. Use only facts you can verify or explain. Include concrete scale or a measured
   result when evidence exists; a concrete qualitative result is also valid. Do not
   guess percentages, adoption, savings, customer counts or attribution.
4. If the result is unknown, leave the field empty or use Clear. No Impact block will
   appear for that role.
5. Save and review the role in Executive. Follow the existing store's publication
   workflow: filesystem saves are live locally; GitHub storage is deployment-gated.

## Risks and remaining work

No implementation work remains for this field. Actual professional outcomes must come
from the owner. Real GitHub credentials, remote commits, Netlify deployment and live
email were not exercised; GitHub was mocked throughout. Browser checks used Chromium;
no new screen-reader or interactive 3D audit was performed. Other-theme comparison
covered server-rendered no-JS output, not pixel-identical animated frames. Long text is
intentionally not capped at field level, matching the owner-selected existing rules;
keep real entries short and within the normal admin request limit.

Evidence is local/ignored in `artifacts/portfolio/phase18/`: supplied/empty full-page
and role screenshots, admin save/validation screenshots, and browser/admin JSON results.
The shared admin preview controls may overlay content in raw screenshots and were not
changed. No dependencies, activation, other theme designs, commit or push.
