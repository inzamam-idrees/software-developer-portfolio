# Phase 20: Visible Executive motion and all three certifications

Date: 2026-10-27. Implemented and verified locally. No activation, commit or push.

## What changed

The previous motion moved the hero only 16–24px, once, with most remaining movement tied to opening details or navigation. This could easily be missed. A previously stored pause or system reduced-motion preference can also disable motion; this session did not inspect the owner's own browser preferences and does not assume that was the cause.

Executive now has native choreography that is clearly measurable in the browser:

- Designation, headline words, introduction, actions and stack enter in sequence from 48px below, over 1000ms with 95ms stagger intervals.
- Portrait enters from 64px below with a small scale change, over 1350ms; its experience summary follows.
- Work surfaces, career roles, expertise, certificates and route/article content arrive from 44px below as they enter the viewport, over 950ms with bounded group staggering. Each target plays once per route visit.
- Fine-pointer project/expertise hover adds a small lift; portrait hover gently zooms the photograph; action arrows move farther. Native disclosure, header indicator and career handoff remain.
- The header visibly says **Motion on**, **Motion off**, or **Motion reduced**. The reduced status explains the system preference. The ordinary toggle still exposes its action through its accessible name.

Text stays fully opaque throughout, so movement does not lower its contrast. There are no endless loops, hidden-until-JS sections, scroll event handlers, layout measurement loops, GSAP imports or new dependencies. The existing no-GSAP constraint is retained. Native Web Animations and IntersectionObserver provide the stronger motion. The pause/system-reduction path cancels in-flight native animation as well as disabling CSS animation/transitions. Keyboard focus settles a moving target. Cleanup disconnects observers and cancels handles; blocked storage still permits pausing the current page.

## Why one certification was missing, and the revised policy

Phase 17 intentionally excluded the entire Coursera record because its canonical credential ID and URL contain `XYZ123`. The owner's new request to display all three entries supersedes that whole-record exclusion. The view now retains legitimate title, issuer, description, competencies, date and recorded status while suppressing **both credential ID and URL** if either looks like a placeholder. The canonical data is not altered.

All three entries now render:

| Entry | Issuer | Existing recorded status |
| --- | --- | --- |
| SPA - Angular Web Application | Coursera | Completed |
| Python for Data Science | IBM | Verified |
| AI Engineer | Google | In progress |

These are the existing statuses, not new verification claims. The Coursera record still needs the owner's real credential ID/URL. `XYZ123` and its link never appear in the rendered certification section. Absent metadata produces no placeholder lines. Malformed title/issuer records still do not render; an empty usable collection still hides section/navigation. The compact-list decision remains based on the canonical verified count, and rows now use consistent heading/metadata groups.

## Tests actually observed

| Check | Result |
| --- | --- |
| `npm run validate:content` | Passed, also in final prebuild. |
| `npm run build:theme-css` | Passed through the existing prebuild/unit pipeline. Other four theme stylesheet hashes stayed unchanged. |
| `npm run lint` | Passed without lint warnings/errors; existing Next lint deprecation notice remains. |
| `npm run test:unit` | 49 test files passed, zero failures, including no-hardcoded-copy and content isolation. |
| `PORTFOLIO_BUILD_DIR=.next-executive-20-build npm run build` | Passed. |
| `git diff --check` | Passed. |
| Certificate regression tests | The updated expectation first failed against the old whole-record filter, then passed after implementation. Tests cover placeholder variants, canonical immutability, all three records and unchanged statuses, sparse records and empty navigation. |
| Native motion unit tests | Passed: preference gating, sequence timing, no text opacity animation, one-shot arrivals, cancellation/pause/resume, keyboard settling and disposal. |
| Chromium layout matrix | 120 cases, zero failures: home, archive, project detail and blog × 375/390/768/1280/1536 × light/dark × standard/no-JS/reduced. No horizontal overflow/clipped text, hidden sections or page errors. |
| Actual movement in Chromium | Four cases passed: light/dark × 390/1280. Captured seven running intro animations with staggered delays, nonidentity transforms, and a running scroll-arrival transform. Pause reduced running animations to zero. |
| Actual movement in Firefox | The same four movement/certificate cases passed, zero failures. This phase did not run the full Firefox route/width matrix. |
| Keyboard and preference checks | Both Chromium and Firefox passed 12 combinations and 114 disclosure opening/closing pairs each. Covers standard/no-JS/reduced at light/dark 390/1280, native menus/details, career anchors, pause/resume and persistence. |
| Firefox certification fallback | Eight no-JS/reduced cases passed: all three titles, exactly one supplied date, no placeholder text or credential links. |
| Text resizing | 200% root text at 390/1280 in light mode: no document overflow or text beyond the viewport. |
| Runtime | Chromium: measured desktop CLS 0; no page errors; skip link focused main; contact validation focused name and marked three invalid fields; stored pause and blocked-storage pause worked. |

Computed palette ratios remained: light body 12.24:1, secondary 6.20:1, accent/button 6.38:1, secondary on section surface 5.74:1; dark body 14.39:1, secondary 9.10:1, accent/button 9.99:1, secondary on section surface 7.77:1. Form boundary ratios: 3.84:1 light / 5.35:1 dark. These focused checks do not constitute a complete accessibility audit.

## Files changed in this phase

- `themes/executive/motion.mjs`: new native choreography controller.
- `themes/executive/enhancement.jsx`: preference/focus/lifecycle integration.
- `themes/executive/home.jsx`: canonical headline word spans; wording remains canonical.
- `themes/executive/motion-control.jsx`, `styles.scss`: visible motion status, responsive control space, hover states and replacement of the former quiet hero keyframes.
- `themes/executive/presentation.mjs`: retain certificate facts while suppressing placeholder credentials; report suppressed metadata separately from hidden records.
- `themes/executive/certificates.jsx`: consistent heading/metadata/competency groups.
- `portfolio-data/settings/copy/executive.json`, `lib/portfolio/copy-schemas.mjs`: strict copy-backed status labels/help.
- `tests/unit/executive-motion.test.mjs`: controller tests; updated `executive-finish.test.mjs` and `executive-polish.test.mjs` for the owner's revised certificate policy.
- `tests/browser/executive-motion-certificates.js`: actual running animation and certificate assertions. The existing refined matrix/interaction/runtime harnesses were reused with a temporary local origin; no weakening of assertions.
- This result and `phase-20-executive-motion-plan.md`.

The checkout also contains earlier uncommitted phases; this list describes only the current changes. Real certificate data has no diff and SHA256 `bdcf5cadfa054d9f41d6dd461e87df7bded1baf392ba9c0b99cef875a7e17f30`. Factual portfolio content, other themes, active-theme setting, admin forms, routes, SEO and dependencies were not edited.

## Skills, evidence and limits

Frontend-design and ui-ux-pro-max informed the stronger content choreography while preserving the light/refined direction, readable text, touch/keyboard behavior and system preferences. GSAP core/React/timeline/performance guidance informed sequencing, transform-only movement and cleanup principles; native APIs implement them to honor the existing no-GSAP constraint. Playwright CLI verified running transforms, timing, preferences and native content, rather than relying on source inspection or screenshots as proof of animation.

Local ignored evidence lives under `artifacts/portfolio/phase20/`: JSON results, light/dark phone/desktop captures, a clean certificate-section image, and `executive-motion-demo.webm` showing entrance, scroll arrival, detail interaction and pause. The recording and presentation captures hide only the floating preview toolbar; raw matrix screenshots retain it. Existing preview-toolbar behavior is unchanged.

No WebKit, screen-reader session, live email delivery, real GitHub save, remote credential audit or deployment was tested. Reduced motion and an explicit saved pause intentionally suppress animation; the header now makes that state visible. Public active theme remains Coding. No commit or push.
