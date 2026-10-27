# Phase 19: Executive refined redesign result

Date: 2026-10-26. Local implementation. No activation, commit or push.

## Direction and delivered design

The owner selected **Light and refined: airy layout, restrained color, elegant typography** from the three proposed directions. This choice supersedes the dark studio proposal. Executive now uses white and sage surfaces, dark green typography, restrained teal controls and a portrait-led composition. Its dark palette is independently defined rather than inferred from the light palette.

The canonical “Engineering with intention.” headline leads the opening, with the actual designation, introduction, portrait, location, experience label and focus nearby. The local Inter/Inter Tight fonts remain; larger display type, lighter display weight and stronger secondary headings establish hierarchy. Contact and résumé actions are 52px tall. Desktop introduction text is 19px.

A quiet employer band uses the three actual employers. Selected work now follows the opening, ahead of detailed career history. Projects use generous two-column surfaces with their real category, title, role, description, existing outcome, readable technology chips and native detail disclosures. No invented product screens, brand logos, metrics or credentials were created. Career retains the complete contributions and technologies behind counted disclosures and its sticky guide. Expertise, biography, education, awards, compact credentials, sparse writing, résumé, contact, projects archive, project details and blog receive the same coherent visual system.

## Motion and accessibility

One coordinated entrance moves the hero copy and portrait into place over 800/1000ms. Text remains fully opaque throughout, preserving contrast during movement. Existing grid-row disclosure transitions, header indicator and career handoff remain. Button arrows provide short action feedback. There are no continuous decorative loops, scroll event handlers, layout measurement loops, WebGL or new dependencies.

A new copy-backed header control pauses/enables animation. It uses the shared `portfolio-motion` preference, persists where storage is available, synchronizes storage changes and works for the current page even when storage access throws. System reduced motion always wins and removes the toggle. All animation and transition effects, including pseudo-elements, stop when paused or reduced. Native content and disclosures remain usable without JavaScript; the motion control is progressively added.

The larger-text check found minimum-content grid widths and a nonwrapping header brand could widen the phone page. Shrinkable columns, word wrapping, a wrapping brand/navigation, proportional anchor clearance and a flowing portrait summary repair that cause. At 200% root text size, both 390 and 1280px had zero document overflow and no text extending past the viewport. Text is not clipped or silently truncated.

## Verification actually observed

- `npm run validate:content`: passed, including through final prebuild.
- `npm run build:theme-css`: passed in the existing pipeline, including final prebuild/unit setup. Other theme stylesheet hashes remained unchanged.
- `npm run lint`: passed, no lint errors/warnings. Existing Next lint deprecation notice remains.
- `npm run test:unit`: 48 files passed, zero failures. Includes strict copy schemas, no-hardcoded-copy, content isolation, credential safeguards and experience outcome tests.
- `PORTFOLIO_BUILD_DIR=.next-executive-19-final npm run build`: passed, including static project pages and unchanged preview/admin route architecture.
- `git diff --check`: passed.
- Chromium final responsive matrix: **120 cases, zero failures**: home, projects, project detail and blog × 375/390/768/1280/1536 × light/dark × standard/no-JS/reduced. Verified one h1, no overflow or clipped text, no hidden sections, successful portrait loading and no empty Impact blocks. No page errors recorded.
- Chromium keyboard/motion: **12 combinations, 114 disclosure opening/closing pairs, zero failures** across light/dark, 390/1280 and standard/no-JS/reduced. Includes project, responsibility, technology, résumé and mobile-menu disclosures; career anchors; pause/resume; persisted preference and system reduction.
- Firefox compatibility: **48 layout cases, zero failures**: the same four routes × 390/1280 × light/dark × standard/no-JS/reduced. Its separate keyboard/motion run also passed **12 combinations and 114 disclosure pairs**, zero failures. Other Firefox widths were not checked this phase.
- Final Chromium runtime: no page errors; layout shift (CLS) **0** in the measured desktop load; skip link reached and focused main content; empty contact submission focused `contact-name` and exposed three invalid fields; persisted pause and blocked-storage pause both worked. The focus harness waits for anchor navigation before asserting the resulting focus.
- Larger-text check: 200% root text at 390/1280 in light mode, zero document overflow or text outside the viewport. This does not claim testing every browser zoom or assistive technology.

The first no-hardcoded-copy run flagged SVG path strings held in a lookup object as prose. Paths now live directly in SVG `d` attributes; the guard was not weakened or allowlisted. The initial restricted build failed; the normal build with access for existing project build requirements passed. An early Firefox matrix waited indefinitely on `document.fonts.ready` in no-JS mode; the harness now waits on that JavaScript promise only in JavaScript-enabled modes. These were session findings, not successful checks.

### Computed palette contrast

Ratios measured from browser-computed semantic color values. Normal text exceeds 4.5:1; meaningful form boundaries exceed 3:1. Portrait caption uses the same fixed dark ink on a pale photographic surround. This is a focused check, not a complete assistive-technology audit.

| Pair | Light | Dark |
| --- | ---: | ---: |
| Body / page | 12.24:1 | 14.39:1 |
| Secondary / page | 6.20:1 | 9.10:1 |
| Accent / page | 6.38:1 | 9.99:1 |
| Primary button text / fill | 6.38:1 | 9.99:1 |
| Secondary / section surface | 5.74:1 | 7.77:1 |
| Form boundary / input surface | 3.84:1 | 5.35:1 |

### Before/after page height

Chromium, 960px viewport height, canonical records, closed disclosures. Light and dark matched at each width. The increased height is intentional: larger portrait, more display space and more generous project surfaces.

| Width | Before | After |
| --- | ---: | ---: |
| 390px | 12,882px | 13,688px |
| 1280px | 8,284px | 9,172px |

## Changed files in this phase

- `themes/executive/home.jsx`: new opening composition, employer band and work-before-career ordering. Existing canonical content retained.
- `themes/executive/styles.scss`: replaces the accumulated visual rules with one responsive token/style system covering all Executive routes and states.
- `themes/executive/icon.jsx`: small authored decorative SVG set.
- `themes/executive/motion-control.jsx`: accessible pause/enable control and preference handling.
- `themes/executive/enhancement.jsx`: local preference event handling, including blocked storage and lifecycle cleanup.
- `themes/executive/shell.jsx`: header motion-control placement.
- `themes/executive/project-card.jsx`: consistent disclosure action/icon treatment.
- `portfolio-data/settings/copy/executive.json`, `lib/portfolio/copy-schemas.mjs`: strict copy-backed motion labels. No professional content changed.
- `tests/browser/executive-refined.js`, `executive-refined-interactions.js`, `executive-refined-runtime.js`: layout, native disclosure, preferences, keyboard, contrast, form validation and stability checks.
- This result and `phase-19-executive-refined-plan.md`.

The checkout already contained uncommitted Phases 15–18 work. This list describes the current redesign, not every entry in the cumulative working-tree diff. Other theme sources, activation data, factual content, dependencies, registry, routes, SEO, admin form and contact handler were not changed in this phase.

## Installed skill contributions

Applied the skills relevant to this portfolio redesign; unrelated spreadsheet, document, deployment, image-generation and 3D workflows were unnecessary.

- **frontend-design:** distinct portrait-led composition, canonical headline, restrained palette and critique against generic dark studio/card/metric defaults.
- **ui-ux-pro-max:** local design-system/UX searches; readable type, touch targets, independent light/dark contrast, native navigation, reduced motion and text resizing.
- **design-system:** semantic page/surface/ink/accent/control tokens, typography, spacing and component states kept within Executive.
- **ui-styling:** responsive layouts and accessible native control states within the existing Sass pipeline; no component package installation.
- **gsap-performance:** compositor-friendly transforms, minimal simultaneous movement and bounded lifecycle principles. Executive does not load GSAP.
- **Impeccable:** replacement-world critique, craft-floor review and mechanical detector. Detector returned an empty finding list; it does not replace browser checks.
- **playwright-cli:** actual Chromium/Firefox browser checks, screenshots, keyboard interaction, preferences and runtime evidence.
- **Superpowers planning/debugging/verification guidance:** documented direction, traced observed validation/layout failures before repair and recorded real verification results.

## Owner data gaps and limits

All three experience records still lack owner-supplied outcomes: **Nextbridge Ltd. — Senior Software Engineer; Xenex Media — Laravel Angular Developer; CodeInformatics — Web Developer.** Empty outcomes continue to render no Impact label or gap. No data was inferred. The real experience file retains SHA256 `23091c1142aa978feb8ab9cc50ab17f54ccc685498e7e1f4ab78d0868f505503`.

The existing **SPA - Angular Web Application / Coursera** certificate remains hidden in Executive because its credential ID/URL contains `XYZ123`. The Python for Data Science / IBM and AI Engineer / Google records retain their existing statuses and omitted optional metadata. No external credential verification was performed.

Evidence is local/ignored under `artifacts/portfolio/phase19/`, including raw before/after full pages, career captures, route captures and JSON results. `final-*` presentation captures hide only the shared floating preview toolbar for unobstructed review; regular matrix screenshots retain it. The toolbar itself is unchanged. No screen-reader session, live email delivery, real GitHub content save, deployment, activation or WebKit test was performed. Existing résumé and article providers remain externally controlled. Public active theme remains **Coding**.
