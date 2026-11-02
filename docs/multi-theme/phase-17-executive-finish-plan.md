# Phase 17: Executive finishing plan

2026-10-26. Preserve Phase 15/16 direction and chapters. Scope: Executive,
its copy/schema subtree, focused tests and phase documentation. No other theme,
activation, canonical facts, shared factual schemas, routes or dependencies change.

## Before review

Captured light/dark full page and career at 390/1280, using Phase 16's production
build. Evidence: artifacts/portfolio/phase17/before-*.png. Baseline at 1280: 8,749px.

1. Certificates still expose missing-date wording and the canonical XYZ123 credential.
   Two sparse records do not justify the existing three-column grid.
2. Roles have responsibility highlights but no structured outcome/metric field. Project
   outcome is already supported, but only three canonical projects provide it.
3. Tags are small underlined runs; first skills and overflow have equal visual weight.
4. Hero buttons use 14px text and there is no employer proof strip; two 64px paddings
   separate hero content and career content on desktop.
5. Writing has one fetched article but occupies a full section. Project rows still
   use 48px top/bottom padding.
6. Details snap open/closed, section underline jumps, role-guide emphasis changes
   instantly. Preserve the existing career progress and entrance; add only the three
   requested transitions, not further reveal effects.
7. Chromium screenshots covered both schemes; a second engine was absent previously.
   This session successfully downloaded the Playwright Firefox runtime locally. Test
   launch and actual browser behavior before claiming cross-engine support.

## Build plan

Keep paper #F6F7F9/#181A20, chapter #EEF0F5/#20232B, ink #14181F/#F2F4FA,
secondary #525D6D/#B4BDCF and indigo #3B4CCA/#A9B5FF; preserve Inter fonts.
Use existing surface tokens for chips and indigo/ink emphasis for their first six.
Tags become wrapping 14px/1.5 chips, no ellipses or horizontal clipping; overflow
continues through the existing native counted disclosure.

Filter suspicious certificate IDs/URLs in the Executive view, case-insensitively,
including URL-decoded XYZ123/example/TODO/lorem/placeholder markers. Do not mutate
canonical records. Omit absent optional fields. Fewer than two canonical `verified`
statuses yields a compact list of remaining legitimate records; zero usable records
hides section/nav. Unit-test both ID and URL markers, retained real records and counts.

Add a conditional Impact presentation slot, but do not infer impact from highlights
or create canonical fields/data. The current experience schema has no outcome/metric;
propose an optional outcome field in the result. Existing projects already use outcome.

Under hero actions show canonical employer names plus the featured stack. Do not infer
client regions from prose. Intro becomes 19px desktop/18px mobile, hero buttons 16px
and 50px minimum height. Reduce the combined hero-bottom/career-top gap 25%, using
48px instead of 64px on desktop and equivalent fluid mobile values. Project row
padding becomes roughly 38px, 20% below 48px. Sparse writing uses a title/latest-link
strip (empty/unavailable keeps honest provider copy), with the same writing anchor.

Project disclosures retain server-rendered native details and full content. With motion
enabled, a small delegated click enhancement keeps details open during close while a
0fr/1fr wrapper transitions, then closes the native element. Without JS or when paused,
use native immediate toggling. No measuring height, scroll listeners or layout loops.
Header navigation uses equal-width cells and a transform-only indicator positioned by
active section index, with no geometry measurement. Role guide links get a small
transform/opacity handoff. System reduced motion and portfolio-motion paused remove
all three additions; closing transitions settle safely if preferences change midway.

## Critique before build

Rejected logo decoration, client-region inference and a strip of statistic cards.
Employers/stack are quiet text evidence, not invented endorsement or metrics. Chips
encode grouping and priority; no new card hover/reveal effects. Indicator and handoff
serve navigation, not decoration. Keep native markers and sentence-case copy. Do not
silently call unlinked credentials independently verified: count only canonical status
and clearly state that external verification is not performed.

## Verification

Run content, CSS, lint, unit and production build checks. Repeat the 90-case matrix
(home/project/blog; five widths; two schemes; standard/no-JS/reduced). Keyboard-test
every rendered disclosure. Measure small text contrast and full-page height; inspect
light/dark full-page and career at 390/1280. Test open and close motion, header movement,
role handoff and pause/reduced static states in Chromium and Firefox if launch works.
Keep empty-certificate fixture, runtime isolation and mocked contact checks. No commit
or push.
