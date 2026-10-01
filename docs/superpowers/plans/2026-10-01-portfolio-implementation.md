# Cinematic Developer Portfolio Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans for native execution, or superpowers:subagent-driven-development if the user selects that method. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Transform the existing Inzamam Idrees portfolio into a readable, premium editorial experience with one coordinated scroll-driven 3D world.

**Architecture:** Keep Next.js App Router, JavaScript, content files, and existing routes. Server components own readable content; small client components own navigation, contact feedback, motion preferences, and one lazy canvas. GSAP writes a mutable scene-state object, and Fiber alone applies that state to camera and scene transforms.

**Tech Stack:** Existing Next.js 15.1.1, React 19, Tailwind 3.3.3, Sass, react-icons, Nodemailer; add only `three`, React-19-compatible `@react-three/fiber`, and `gsap` for the initial implementation. Node's built-in test runner and the installed Playwright CLI provide validation.

**Spec:** `docs/superpowers/specs/2026-10-01-portfolio-design.md` (approved 2026-10-01).

## Global Constraints

- One 3D world + one coordinated motion system + readable DOM content.
- Preserve Next.js, JavaScript, Sass/Tailwind, routes, and content files. Render core content on the server.
- Background `#0B0E11`; surface `#14191E`; elevated surface `#1B2229`.
- Main text `#F4F1EB`; secondary text `#AEB8C1`; accent `#91E5C1`; accent text `#0B0E11`; functional border `#59656F`; decorative rules `#29323A`.
- Retain Inter for body and display; use system monospace for chapter labels and technology metadata. Body 16–18 px with 1.6 line height; display fluid 48–104 px desktop, 40–60 px mobile; section headings fluid 32–64 px.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. Maximum page width approximately 1280 px.
- Radius: 4 px controls, 8 px surfaces. Focus: 2 px mint ring with 4 px offset. Controls at least 44×44 px.
- Interaction duration 180–240 ms; editorial reveal 650–900 ms; power2 easing; linear scroll scrubbing. Breakpoints: 640, 768, 1024, 1280 px.
- Preserve `#about`, `#experience`, `#skills`, `#education`, `#projects`, `#contact`, `/project`, and `/blog`.
- Featured work: MIS/Nexis, Group Captain, Remmi CRM. No invented metrics, AI accomplishments, availability claims, project screenshots, or professional duties.
- DPR capped at 1.5 desktop and 1 mobile; approximately 100 desktop / 30 mobile particles. No shadows or post-processing by default.
- No per-frame React state updates. Pause when hidden; honor reduced motion and live preference changes; release animation/listener/GPU resources.
- Native scroll is the baseline. Do not install Lenis, Drei, `@gsap/react`, an effect library, a new font package, or a new test framework automatically. A proposed exception needs a documented concrete benefit and compatibility/behavior evidence before inclusion.
- No live test emails. Preserve existing credentials and the user's `.gitignore` changes. Never include environment values in logs or documents.
- Keep lint/build checks enabled. No TypeScript conversion or typecheck script unless typed source is actually introduced.

## Review Focus

1. Cold visits with slow or failed scripts: primary content and links remain readable before hydration; reproduce the initial syntax error rather than dismissing it (Task 1).
2. Menu state across keyboard use, route changes, and breakpoint changes: hidden links are not tabbable, and focus remains predictable (Task 2).
3. Malformed contact data and unreliable delivery: reject invalid input, escape markup, preserve the message on failure, and prevent duplicate submission (Task 4).
4. Live motion changes, hidden tabs, context loss, and remounts: stop all decorative motion safely, retain fallback/content, and avoid duplicate animation owners (Tasks 6–7).
5. Optional external content and unconfigured deployment origin: no blank routes, indefinite waits, fabricated articles, or localhost canonical URLs (Tasks 5 and 8).

## File map and ownership

Existing personal/project/experience/skills/education files remain factual sources. New presentation data is derived from these files, not duplicated facts.

| Files | Responsibility |
| --- | --- |
| `app/page.js`, `app/layout.js` | Server-rendered home composition and shared semantic shell |
| `app/css/globals.scss`, new `app/css/portfolio.scss` | Global accessibility/reset rules and scoped design tokens/compositions |
| `app/components/navbar.jsx`, `footer.jsx`, `helper/scroll-to-top.jsx` | Shared navigation, credits, and accessible top link |
| New `app/components/portfolio/sections/{hero,selected-work,about,expertise,experience,education,writing,contact}.jsx` | Individual story chapters using existing data |
| New `app/components/portfolio/ui/{chapter-heading,project-summary}.jsx` | Small server-rendered display components shared across routes |
| New `utils/data/portfolio-content.js` | Featured IDs, editorial project copy derived from existing descriptions, and verified technology groupings |
| `app/project/page.js`, `app/blog/page.js`, new `app/blog/loading.jsx`, `app/not-found.jsx` | Consistent secondary routes and writing loading state |
| Existing `app/components/homepage/contact/contact-form.jsx`, `app/api/contact/route.js`; new `lib/contact.mjs` | Accessible form plus isolated request validation/template/delivery handler |
| New `lib/articles.mjs` | Bounded resilient DEV fetch and normalization |
| New `app/components/portfolio/motion/{experience-shell,motion-preferences,scroll-coordinator}.jsx`, `scene-state.mjs` | Enhancement shell, user preferences, mutable motion state, and sole scroll coordinator |
| New `app/components/portfolio/scene/{scene-layer,core-canvas,engineered-core,scene-boundary,scene-fallback}.jsx` | Lazy canvas, geometry, lifecycle/error boundary, static fallback |
| New `lib/site-origin.mjs`, `app/robots.js`, `app/sitemap.js`, `app/opengraph-image.js` | Validated production origin and social/search metadata |
| New `tests/unit/{contact,articles,scene-state,site-origin}.test.mjs` | Meaningful pure behavior and failure-path tests |
| New `tests/browser/{startup,navigation,content,contact,motion,acceptance}.js` | Single async function-expression files runnable by Playwright CLI |
| New `docs/portfolio/{startup-investigation,validation,dependency-decisions}.md` | Evidence, screenshots inventory, and measured dependency/performance decisions |

Prefer a named component export per file. Do not delete unused legacy components/assets until import tracing proves they are unreferenced and removal materially helps this task.

## Validation conventions

- Each browser file contains `async page => { ... }`, no imports/require. Assertions use `if (...) throw new Error(...)`; return a compact evidence object. CLI documentation confirms this execution format.
- Serve development on a free loopback port, for example 3001. Set the CLI session's initial URL to `http://127.0.0.1:3001`; scripts derive the test origin from `page.url()` and then preserve it when changing paths.
- Run browser cases with `playwright-cli -s=portfolio run-code --filename=tests/browser/<name>.js`. Restore routes/init scripts/media settings after each case, or use a fresh browser context created within that script.
- Unit runner: `node --test tests/unit/*.test.mjs`; add `test:unit` to package scripts in the first task needing it. No tests that merely assert CSS implementation details.
- End each implementation task with its checks, `npm run lint`, a focused diff review, and a commit containing only that task's named files when repository permissions allow. Preserve uncommitted user changes; do not stage everything.

### Task 1: Investigate cold-load failure and restore server content

**Files:** Modify `app/page.js`, `app/layout.js`; create `tests/browser/startup.js`, `docs/portfolio/startup-investigation.md`.

**Interfaces:** Produces a server `Home()` component with existing sections in DOM order and a conditional analytics boundary. No scene dependency yet. Temporary legacy sections may remain interactive, but their readable text must have server HTML.

- [ ] Capture pageerror message/stack, failed request URLs/statuses, and local script response content in a fresh browser context before navigation. Repeat cold visits and reloads with configured analytics, then with Google Tag Manager requests blocked. Keep instrumentation out of product code and redact configuration identifiers where unnecessary.
- [ ] Write `startup.js`: register pageerror/requestfailed listeners before `goto`; assert exactly one h1 and the name, project title, and contact link after initial load. With JavaScript disabled, assert name, MIS/Nexis, and contact details exist in the HTML. Initially expect the no-JavaScript content check to fail because SSR is disabled.
- [ ] Run the startup case on the baseline. Record failing assertions and whether the original syntax error recurs. Compare cold development startup, warmed development, and later production output; do not claim a root cause without a stack/resource identifying it.
- [ ] Convert `app/page.js` to server composition, remove blanket `ssr:false` imports and hydration-warning suppression, and isolate optional article loading from essential content. Gate analytics on a valid `GTM-...` identifier and place it inside the body using the existing integration. Fix a syntax-error source only when evidence identifies it.
- [ ] Rerun startup checks and lint. Document the root cause and fix, or explicitly record “unreproduced; cause unresolved” with runs and captured evidence. Carry any unresolved application failure into Task 9 as a release blocker.
- [ ] Review and commit the Task 1 files. Acceptance: readable server HTML, clean repeated local application loads, and an honest investigation record.

### Task 2: Build design system, responsive shell, and hero

**Files:** Modify `app/layout.js`, `app/page.js`, `app/css/globals.scss`, `app/components/navbar.jsx`, `footer.jsx`, `helper/scroll-to-top.jsx`, `app/not-found.jsx`; create `app/css/portfolio.scss`, `app/components/portfolio/sections/hero.jsx`, `ui/chapter-heading.jsx`, `tests/browser/navigation.js`.

**Interfaces:** `Hero()` renders `#hero`, the sole h1, `#projects` CTA, and the actual resume URL. `ChapterHeading({ id, number, title, description })` renders an h2 with the supplied ID. Navbar is a semantic disclosure, not a modal; no focus trap or dialog semantics.

- [ ] Write navigation assertions: at 390×844, a named “Open menu” button exists; closed links are absent from tab order; Enter opens it with `aria-expanded=true`; Escape closes it and returns focus to the toggle; choosing Work reaches `#projects`; resizing to desktop clears stale mobile state. Check skip-link activation moves focus to `#main-content`.
- [ ] Run navigation case to capture baseline failures.
- [ ] Implement the approved tokens, readable line lengths, global focus/selection rules, safe-area-aware spacing, and reduced-motion CSS. Build a header outside main, a single `main#main-content` with `tabIndex=-1`, and footer outside main. Use CSS class scoping to avoid breaking secondary routes.
- [ ] Implement the mobile disclosure: actual hidden state removes focusable descendants, Escape restores toggle focus, anchor activation closes without moving focus back, and breakpoint changes reset disclosure state. Desktop navigation includes Work, About, Expertise, Experience, and Contact; education/writing remain reachable in page/footer links. Preserve all old anchors.
- [ ] Implement hero with introduction before decorative visual on mobile. Render a static architectural motif for now, reserve scene space without CLS, and keep title/CTAs readable. Preserve existing social/resume destinations with named links; make scroll-to-top named and motion-aware.
- [ ] Run navigation/startup cases, inspect hero screenshots at 1440×900 and 390×844, and check `scrollWidth <= innerWidth` without masking layout problems using blanket overflow hiding. Run lint, review, and commit.

### Task 3: Deliver project storytelling and career chapters

**Files:** Create `utils/data/portfolio-content.js`, `sections/{selected-work,about,expertise,experience,education}.jsx`, `ui/project-summary.jsx`, `tests/browser/content.js`; modify `app/page.js`, `app/project/page.js`, `app/css/portfolio.scss`.

**Interfaces:** `featuredProjectIds = [1,5,4]`; `projectEditorial[id] = { problem, solution, outcome }`, all strings traceable to existing descriptions. `technologyGroups = [{ id, title, summary, technologies }]`, with technologies drawn from actual skills/project data. `ProjectSummary({ project, editorial, index, featured=false })` consumes the existing project shape and renders external links only for nonempty valid HTTP(S) destinations.

- [ ] Write content assertions: home contains MIS/Nexis, Group Captain, Remmi in that order; `/project` contains all eight projects; projects without demo/code have no empty destination links; deep-link anchors exist; heading order starts at one h1 and does not skip a level. Disable JavaScript in a separate context and assert featured summaries remain readable.
- [ ] Run the case before the new chapter implementation; expect featured ordering and semantic-heading failures.
- [ ] Derive concise problem/solution/outcome text from documented behavior, without quantified results. Build generous project chapters with role and technology metadata. Do not use unverified sample imagery; use labeled abstract system diagrams that cannot be mistaken for screenshots. Default to natural document scrolling rather than pinning.
- [ ] Implement about with the existing portrait using next/image and explicit dimensions; expertise with readable grouped lists; experience using `experiences` in earliest-to-latest order and unchanged dates; education retaining all records. No repeating marquee or Lottie illustration in the new homepage.
- [ ] Replace `/project` presentation with the shared summary component, one h1, home navigation, and factual full descriptions. Scope route metadata title to Projects.
- [ ] Run content/navigation cases, inspect project/experience screenshots at desktop/tablet/mobile, run lint, review copy against source data, and commit.

### Task 4: Make contact accessible and robust without live delivery tests

**Files:** Modify `app/components/homepage/contact/contact-form.jsx`, `app/api/contact/route.js`; create `sections/contact.jsx`, `lib/contact.mjs`, `tests/unit/contact.test.mjs`, `tests/browser/contact.js`; modify `app/page.js`, `app/css/portfolio.scss`, `package.json`.

**Interfaces:** `validateContact(value) -> { ok:true, data:{name,email,message} } | { ok:false, errors:{name?,email?,message?} }`; trimmed string fields only, name/email max 100 chars and message max 500 chars; reject CR/LF in name/email. `escapeHtml(string) -> string`; `buildMail(data, sender) -> { from,to,replyTo,subject,text,html }`, using configured sender as from/to and visitor email as replyTo. `handleContact(request, { sendMail, sender }) -> Promise<Response>` is dependency-injected; route `POST` delegates using the existing Nodemailer transport.

- [ ] Write unit tests for whitespace-only/missing/non-string/oversized input, malformed JSON, invalid email, header newlines, `<script>` markup escaping, replyTo/from ownership, delivery failure, and success. Assert invalid requests return 400 and invoke the fake sender zero times; unavailable sender configuration returns 503; simulated transport failure returns 502; successful fake delivery returns 200. No real transport in tests.
- [ ] Run `node --test tests/unit/contact.test.mjs` and capture failure before implementation.
- [ ] Implement validation/escaping/response helper and delegate the API handler. Keep useful plain-text email, preserve credentials/configuration, and remove only obsolete contact-specific commented sending code. Do not change unrelated API routes.
- [ ] Implement semantic form, explicit IDs/labels/autocomplete, named submit button, same-origin `/api/contact`, client validation, inline field errors and status region. Keep inputs on failure, clear on success, and prevent concurrent submission. Provide working `mailto:` and `tel:` alternatives plus the actual location.
- [ ] Write/run browser tests with every valid POST intercepted: required/invalid fields; held response keeps submit disabled; success clears fields and announces success; 502/network error preserves fields and offers email. Assert no second request on repeated submit. Do not send external messages.
- [ ] Run unit/browser checks and lint, review, and commit.

### Task 5: Make optional writing resilient

**Files:** Create `lib/articles.mjs`, `sections/writing.jsx`, `app/blog/loading.jsx`, `tests/unit/articles.test.mjs`; modify `app/blog/page.js`, `app/components/homepage/blog/blog-card.jsx`, `app/page.js`, `app/css/portfolio.scss`.

**Interfaces:** `getArticles(username, { fetchImpl=fetch, timeoutMs=4000 }={}) -> Promise<{ status:'ready'|'empty'|'unavailable', articles:Array }>`; deterministically order by publication date descending. Validate article title and HTTP(S) destination, omit malformed items, allow missing cover art, and use a reserved image region if an image is present. `Writing({ result })` renders the result with a DEV profile fallback link; homepage wraps a server loader in Suspense so it cannot delay core content.

- [ ] Write unit tests using injected fetch for valid list, empty list, HTTP failure, rejected fetch, timeout/abort, invalid JSON shape, malformed article URLs, and missing image. Assert no thrown failure escapes and no randomized ordering.
- [ ] Run tests to prove failure before creating the helper.
- [ ] Implement bounded fetch, normalize data, and add deterministic ready/empty/unavailable route states. Keep `/blog` usable on upstream failure and provide meaningful loading text. Blog titles use real heading elements and named external links.
- [ ] Run tests; verify `/blog` with working upstream and simulate failed server fetch through the helper tests rather than browser network interception (browser interception cannot control server-side requests). Inspect route screenshot and lint, review, and commit.

### Task 6: Add one lazy, adaptive 3D environment with fallback

**Files:** Create `app/components/portfolio/motion/{experience-shell,motion-preferences}.jsx`, `app/components/portfolio/motion/scene-state.mjs`, `app/components/portfolio/scene/{scene-layer,core-canvas,engineered-core,scene-boundary,scene-fallback}.jsx`, `tests/unit/scene-state.test.mjs`, `tests/browser/motion.js`, `docs/portfolio/dependency-decisions.md`; modify `app/page.js`, `app/css/portfolio.scss`, `package.json`, `package-lock.json`.

**Interfaces:** `ExperienceShell({ children })` is a client boundary accepting server-rendered children; it owns one stable ref to `createSceneState() -> { cameraX:0,cameraY:0,cameraZ:8,rotationX:0,rotationY:0,coreX:0,coreY:0,coreScale:1,spread:0,opacity:1 }`. `MotionPreferences` exposes `{ enabled, reduced, setEnabled }` through context, initialized to no motion until preference detection. `SceneLayer({ stateRef })` consumes that context and mounts at most one canvas. `CoreCanvas({ stateRef, enabled, compact, onReady, onUnavailable })` owns frame rendering and calls `onReady` once after the first successful rendered frame; `EngineeredCore({ stateRef, enabled, compact })` owns geometry/transforms. `SceneFallback()` renders a decorative static SVG with `aria-hidden`.

- [ ] Verify official package release peer requirements for React 19 and Next.js 15 before installing only three/Fiber/GSAP with bounded version ranges; record resolved versions and rationale. Preserve Tailwind 3 rather than letting `latest` resolve a breaking major when updating the lockfile; use the audited compatible major ranges for existing `latest` build dependencies. Check `npm ls --depth=0` for peer errors.
- [ ] Write scene-state tests: two factories return independent objects; initial values are finite; device profiles cap DPR at 1.5 desktop / 1 mobile and select 100 / 30 particles. Define `getSceneProfile(compact) -> { maxDpr, particleCount }` in `scene-state.mjs` for the profile test.
- [ ] Write browser checks before canvas implementation: primary text visible with WebGL contexts denied; one canvas at most when available; motion toggle has accessible “Pause motion”/“Enable motion” names; fallback visible after context loss. Expect missing controls/fallback contract to fail initially.
- [ ] Implement a no-texture low-polygon metal frame core with orbital line paths, instanced nodes, seeded point cloud, and technical grid; no Drei, shadow maps, or effect passes. Update owned transforms in Fiber's `useFrame` only, reusing scratch values. Cap DPR and reduce mobile composition/particles.
- [ ] Lazy-import the canvas from a client component with its static fallback already visible. Guard feature detection, add React error boundary and context-loss handling; on failure unmount canvas and retain fallback without trapping scroll. Only hide the static motif once the canvas signals its first successful frame. Keep canvas decorative and pointer-safe so links remain clickable.
- [ ] Suspend frame work when hidden, disable particles/idle spin and use demand rendering with motion disabled, and invalidate once on resize/state change. Dispose manually allocated resources and rely on Fiber ownership for declarative resources. Persist the user's pause choice safely; OS reduced motion always takes precedence, with visible explanation.
- [ ] Run scene-state/motion/startup tests and lint; inspect hero visual against spec; review resource ownership and chunk splitting; commit.

### Task 7: Coordinate scroll and scene transitions

**Files:** Create `app/components/portfolio/motion/scroll-coordinator.jsx`; modify `app/components/portfolio/motion/experience-shell.jsx`, `app/components/portfolio/motion/scene-state.mjs`, `app/components/portfolio/scene/core-canvas.jsx`, `tests/browser/motion.js`, `app/css/portfolio.scss`, `docs/portfolio/dependency-decisions.md`.

**Interfaces:** `ScrollCoordinator({ stateRef, rootRef })` writes only scalar fields of the Task 6 state. `ExperienceShell` owns `rootRef` around all chapters. GSAP context/matchMedia owns all timelines/triggers and reverts them on cleanup; Fiber remains the sole transform writer.

- [ ] Extend motion tests: emulating reduced motion before load shows final readable content and no moving camera; changing the preference while scrolled settles content immediately; pause/resume preserves scroll and menu usability; forward then backward scroll returns the visual world to its earlier composition; repeated navigation home/project/home retains at most one canvas and motion control.
- [ ] Run the extended tests to capture missing coordinated transitions.
- [ ] Build one main ScrollTrigger timeline from actual section positions, updating camera/core/spread/opacity for hero, projects, about, expertise, experience, education/writing, and contact. Use normalized measured stops in DOM order, invalidate/rebuild on refresh, linear scrub, and simpler compact-device state ranges. Keep data order consistent with Task 3 rather than copying an earlier illustrative chapter order.
- [ ] Add scoped hero/reveal timelines at 650–900 ms and power2 easing; animate transforms/opacity only. Content is visible by default, and animation setup may temporarily hide it only inside a successfully initialized enhancement context. No Lenis or pinned chapters in this initial implementation.
- [ ] On live reduced-motion/pause change, revert triggers/reveals and reset scene to its readable static composition; create timelines again only when enabled. Remove resize/visibility/preference listeners and GSAP context on unmount. Native hash navigation remains authoritative.
- [ ] Run motion/navigation/startup checks with scroll reversal and mobile keyboard behavior; inspect mid-scroll screenshots and confirm triggers do not move or hide essential text. Record the decision to retain native scroll and natural chapter flow, run lint, review, and commit.

### Task 8: Add truthful SEO and production-origin handling

**Files:** Create `lib/site-origin.mjs`, `app/robots.js`, `app/sitemap.js`, `app/opengraph-image.js`, `tests/unit/site-origin.test.mjs`; modify `app/layout.js`, `app/page.js`, `app/project/page.js`, `app/blog/page.js`, `.env.example`, `README.md`.

**Interfaces:** `getSiteOrigin(value=process.env.SITE_URL) -> string|null` accepts a credential-free HTTPS origin, no path/query/fragment, no localhost/loopback/private-literal host; normalization removes a terminal slash. Missing/invalid setting returns null. Use this function consistently across metadata, robots, sitemap, and JSON-LD; never serialize configuration secrets.

- [ ] Write tests for absent value, valid HTTPS origin, trailing slash, insecure URL, invalid URL, credentials, path/query/fragment, localhost and loopback IPv4/IPv6. Assert null when invalid, normalized origin when valid.
- [ ] Run tests to demonstrate failure before implementation.
- [ ] Implement origin utility and document `SITE_URL` in `.env.example` without using the README URL as proof. Without verified setting, omit absolute canonical/Person URL/sitemap references; sitemap returns no entries. With setting, generate `/`, `/project`, `/blog` entries, omit invented modification dates, and reference sitemap from robots.
- [ ] Correct title to “Inzamam Idrees | Senior Software Engineer”; add factual description and Open Graph/Twitter metadata. Render a local social image using Next ImageResponse, system fonts, approved colors, actual name/title, and no remote fetch. Inject Person JSON-LD using name/title/location/profile links with `<` escaped in serialized JSON.
- [ ] Run tests, inspect metadata/social image/robots/sitemap with configured and absent test origin, validate JSON-LD parsing, run lint, review, and commit.

### Task 9: Validate, visually refine, and report production evidence

**Files:** Create `tests/browser/acceptance.js`, `docs/portfolio/validation.md`; modify implementation files only to fix verified findings. Screenshot outputs: `artifacts/portfolio/` within the workspace, with descriptive viewport/chapter filenames.

**Interfaces:** Acceptance script uses the user-facing DOM interfaces above. It returns viewport/route/error/failure evidence, not private environment data. Report real frame timing; no unconditional claim of 60 FPS.

- [ ] Implement/run the viewport matrix: 1440×900, 1280×800, 768×1024, 390×844; assert no overflow, one h1, complete anchor destinations, readable chapter content, and no overlapping primary controls. Test menu and keyboard flows at mobile/tablet, every relevant route, refresh, deep links, resume/project/social hrefs, contact alternatives, and mocked form paths.
- [ ] Run reduced-motion-before-load and live-change cases; JS-disabled and WebGL-denied cases; context loss and route remount cases. Monitor application console errors/failed critical requests throughout. Distinguish optional analytics/article/provider failures. Inspect external project destinations read-only; report restricted/authenticated destinations rather than treating them as broken merely because access is blocked.
- [ ] Capture hero, featured projects, experience, contact, and full-page mobile screenshots with normal and reduced motion. Open and visually inspect each screenshot for typography, contrast, crop, spacing, clipping, sticky overlap, and scene/content competition. Fix concrete findings and rerun the affected cases.
- [ ] Sample requestAnimationFrame timing after warmup during idle and scrolling; report median/p95 frame interval, viewport, browser/GPU context, and limitations. Inspect canvas draw calls/triangle counts during development using renderer information without leaving a public debug overlay. Confirm hidden-page rendering suspension and bounded listener/trigger/resource counts across remounts. If timing degrades, simplify geometry/particles/DPR first.
- [ ] Run `npm run test:unit`, `npm run lint`, and `npm run build`. Investigate failures rather than disabling checks. If external font fetch prevents build, document environmental evidence and use an authorized local/offline font path if available; do not fabricate a passed build.
- [ ] Serve production output on a separate free port; repeat cold-load/refresh, viewport, motion/fallback, navigation, and contact-mock tests. Revisit Task 1's syntax error investigation with production evidence; any recurrent unexplained application syntax error remains a blocker.
- [ ] Inspect the final diff for factual claims, accidental user-file changes, dependency additions, credentials, disabled checks, dead heavy homepage imports, and cleanup defects. Remove only demonstrated unreferenced redesign artifacts; retain source content and useful existing routes.
- [ ] Record commands/results, screenshot paths, actual dependency decisions, measured performance, and unresolved external limitations. Review/commit scoped final changes and provide the user with preview access and a concise completion report. If a required check remains blocked, report the task as incomplete rather than claiming completion.

## Plan self-review

- Spec coverage: tokens/responsive shell (2), all factual story sections/routes (3–5), one world/fallback/performance (6), scroll/reduced motion/cleanup (6–7), SEO/origin (8), browser screenshots/build/error investigation (1 and 9).
- Interface consistency: one `stateRef` factory and owner, one `rootRef`, one contact handler contract, one article result union, one production origin validator. Subsequent tasks consume these names.
- All five Review Focus items have behavior assertions in their owning tasks. Review includes plain DOM without JS/WebGL, malformed input, live media changes, remounts, failed optional fetch, and missing origin.
- No automatic Lenis/Drei/post-processing installation, no new test framework, no generic app rewrite, no per-frame React state, and no invented screenshots/AI claims.
- Browser assertions emphasize user behavior; reversible styling refinements use screenshot review rather than tests that mirror CSS.
- Implementation has not started. The next step is user plan review and execution-method selection.
