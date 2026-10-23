# Spatial portfolio review — 2026-10-23

The owner approved the charcoal portrait and asked for a whole-theme review, visible section/card/profile motion, the missing PDF preview, and improvements to issues found. This supersedes the earlier hero/projects review gate. The approved palette, fonts, portrait and canonical content remain the foundation.

## Findings and changes

- Motion was enabled in the reproduced browser session, but only the hero/counters/marquee and narrow project hover rules existed. Added viewport-triggered entrances for section headings, career entries, skill groups, projects, education/awards, certificates, writing, résumé and contact. Added profile perspective tilt/orbit glow response, image/diagram zoom response, skill/certificate lift and row/chip/button feedback.
- The new observer discovers streamed Writing content and follows route changes. Animation handles, observers and pointer listeners are cleaned up on pause, route changes and unmount. Content is visible without JavaScript; it is never initially hidden by CSS.
- During verification, animation setup added diagnostic attributes before streamed Writing hydrated. Removed those DOM attribute mutations; the observer uses private weak references instead. Fresh route checks have no hydration warnings.
- Skills used React tree-position IDs that mismatched in the streamed shell. Replaced them with deterministic IDs for the single Skills explorer; every `aria-labelledby` reference resolves.
- Résumé previously rendered an HTML summary, with no iframe. It now embeds the canonical Google Drive `/preview` URL using the existing shared URL adapter, with an accessible title, original-document action and always-visible fallback. The actual PDF was visually verified at desktop and mobile; the main viewer and page image returned HTTP 200. No résumé copy or file was replaced.
- Improved About reading rhythm, removed the redundant white-background portrait, added a career rail and linked sticky company index, refined skill/card/record/writing surfaces, expanded the résumé panel, and improved contact hierarchy and field feedback. Copy email has success and failure status; the original email link remains available.

## Verification

- `npm run validate:content`: passed.
- `npm run lint`: passed; existing Next lint deprecation notice only.
- `npm run test:unit`: **234 tests passed, zero failures**.
- `PORTFOLIO_BUILD_DIR=.next-spatial-review-build npm run build`: passed in an isolated output directory.
- `git diff --check`: passed.
- Browser review at 360, 390, 768, 1024 and 1440px: no horizontal overflow, one h1 per page, and no broken labelled-by references.
- Actual profile hover produces a perspective transform; entering Education triggered eight running reveal animations in the check. Skills selection works via click and Enter. Copy email produced “Email copied.”
- Pause cancels running animations; re-enable/reduced-motion switching works. Independently loaded reduced-motion and saved-pause sessions started with zero running animations.
- Mobile menu opens by Enter, closes by Escape and returns focus to its summary. The first immediate state read raced the close; waiting for the settled result confirmed the existing handler works without changes.
- Home → project detail, project list (nine projects), and Writing route checks passed. Fresh checks showed no page errors or hydration warnings. A no-JavaScript session retained the main heading, About content and PDF iframe.
- Full scene tier rendered using the existing local renderer-name override. This exercises the code path on software rendering, not a real-device GPU performance claim. Reduced/software scene tiers still retain the independent 2D motion and readable HTML evidence.
- Coding, Executive and Prism requested zero Spatial fonts and had no page errors in the isolation check.

Browser scripts/results and screenshots are under `/tmp/spatial-review/`. Clean captures include `final-hero-{360,1440}.png`, `final-resume-{360,1440}.png` and `final-contact-{360,1440}.png`. Only the admin preview toolbar and development indicator were hidden for those captures, not product content.

## Limits

Google Drive is an external viewer and can fail if permissions or network access change; the original-document link remains available. Its unrelated YouTube iframe API request reported a local certificate-authority error, while the PDF itself rendered successfully. No suppression, proxy or certificate bypass was added.

No contact message was sent, external résumé content edited, public theme activated, commit created or push performed. Real-device GPU performance and actual contact delivery remain unverified. Existing canonical content gaps and project TODO placeholders were not filled with invented claims. This review pass does not claim every detail of the earlier full Phase 14 design brief was implemented.

## First-scroll About follow-up

Reproduced the owner's report on a fresh page: the About heading and full prose wrapper dropped to opacity 0 when they first intersected the viewport, including the stagger delay. About now keeps its sticky heading static and its prose fully opaque throughout a shorter, delay-free movement-only entrance. Other section entrances remain unchanged. An incremental desktop scroll check confirmed both elements remain at opacity 1 throughout; lint and whitespace checks passed. Browser evidence is under `/tmp/spatial-about-*.log` and screenshots `/tmp/spatial-about-fixed-*.png`.

## Canvas occlusion follow-up — actual port 3000 reproduction

The owner's screenshot showed a persistent black region, not just the initial fade. Reproduced on `localhost:3000` with the full 3D tier active: About's computed opacity was 1, yet its pixels and the hero stack strip were covered. Hiding only `.spatial-stage` immediately restored the content. The fixed canvas was clearing to opaque black above normal HTML; the elevated header, hero copy and portrait remained visible.

Corrected `themes/spatial/scene/canvas.jsx` to explicitly reset the clear color to transparent black before every full-canvas clear, including frames between visible station slots. This addresses the renderer cause instead of elevating each HTML section above it or removing the scene. The earlier About opacity adjustment addressed a transient fade only and was not sufficient for this occlusion.

Verification on port 3000: full scene reported ready, canvas clear alpha was 0, About remained rendered while scrolling, and the corrected screenshot was visually inspected. Repeated down/up scrolling was checked. Lint and the Spatial rig/tier focused test files passed. Evidence: `/tmp/spatial-3000-{probe,fixed,repeat}.log`, before `/tmp/spatial-3000-before.png`, isolation `/tmp/spatial-3000-without-canvas.png`, corrected `/tmp/spatial-3000-fixed-canvas.png`. Full-tier local browser uses the renderer override on software rendering, not a physical GPU.
