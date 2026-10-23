# Portfolio validation — 2026-10-01

Executed natively on branch `codex/cinematic-portfolio`, preserving the existing
Next.js application, original factual data/routes, credentials, and unstaged user
`.gitignore` additions. Implementation tasks ran sequentially. One independent
whole-branch reviewer follows implementation; findings and dispositions are below.

## Verification

- Unit behavior: contact validation/escaping/status, fake delivery and offline MIME serialization; resilient
  article normalization/sort/failure/abort; scene budgets and independent state;
  public-origin normalization/rejection. Thirteen named cases across four files.
- `npm run lint`: passes without lint warnings/errors. Next 15 prints the upstream
  `next lint` deprecation notice; no lint rule or build check was disabled.
- `PORTFOLIO_BUILD_DIR=.next-portfolio-polish-production-2 npm run build`: passes, including
  lint and prerendering. Home first-load JS is approximately 116 kB in Next's build
  report; shared JS 103 kB. This excludes the lazy scene and is not total transfer.
- `npm audit`: zero vulnerabilities after documented existing-dependency patches.
- Production validation ran at `http://127.0.0.1:3004`, with isolated generated output.
- Twelve Playwright files: startup, startup investigation, navigation, content,
  contact, motion, scroll-motion, metadata, accessibility, acceptance,
  performance, touch.
- Viewports: 1440×900, 1280×800, 1024×768, 768×1024, 390×844. Home, `/project`, `/blog`,
  deep links and refresh: one h1, complete content, no horizontal overflow or skipped heading levels,
  working destinations, zero unexplained application/critical-resource errors.
- Cold-start case: three fresh contexts, initial visit and reload in each; no
  syntax/page errors. Essential content also passes with JavaScript disabled.
- Mobile keyboard: skip link is first, main focus works, closed menu links are
  excluded, Enter opens, Escape restores focus, breakpoint change resets state.
  Native disclosure opens and retains native expanded semantics without JavaScript.
- Contact: required and malformed fields, held response prevents duplicates,
  success clears, 502/network failure preserves text. Three intercepted requests;
  no live email sent. Expected mocked request errors are isolated from acceptance.
- Live and initial reduced motion, pause/resume, denied WebGL, context loss,
  repeated route visits and native fallback pass. One canvas maximum.
- Contrast: warm-white/background 17.17:1, muted/background 9.61:1,
  muted/surface 8.78:1, mint/background 13.07:1. Actual input boundary is 3.33:1.
  Focus rings are visible. Header placement prevents motion control covering fields.

## Measured rendering

Browser: Chromium 154, Linux, 1440×900; renderer ANGLE/Vulkan SwiftShader
(software rendering). Test-only hooks count WebGL draw calls and GPU allocations;
none ship in product code. 120 requestAnimationFrame intervals after warmup for
idle and scrolling. No claim of constant 60 FPS or untested hardware performance.

| Sample | Idle median / p95 | Scroll median / p95 | Calls / triangles | DPR |
|---|---|---|---|---|
| Development before simplification | 66.7 / 83.4 ms | 66.7 / 100 ms | 30 / 3336 | 1 |
| Instanced / lower tessellation | 50 / 66.7 ms | 50 / 100 ms | 8 / 2088 | 1 |
| Software profile, development | 16.7 / 33.3 ms | 16.7 / 16.8 ms | 8 / 2088 | .75 |
| Software profile, production (first sample) | 33.3 / 33.4 ms | 33.3 / 33.4 ms | 8 / 2088 | .75 |
| Production repeat | 16.7 / 33.4 ms | 16.7 / 33.4 ms | 8 / 2088 | .75 |
| Final isolated production sample | 16.7 / 16.7 ms | 16.7 / 16.8 ms | 8 / 2088 | .75 |

The software profile disables antialiasing and uses 30 particles. Hardware caps
remain DPR 1.5 desktop and 1 mobile, with 100/30 particles. Sparse geometry has no
post-processing or shadows. Preliminary runs included additional active test pages. Nine contexts abandoned
by earlier failing assertions were closed, and the source page was moved to the
project archive before the final isolated measurement. Browser cases now close owned
contexts in finally blocks, including on failures. Early timing rows are diagnostic
samples rather than a controlled comparison. Only the final row samples one world. Production medians varied between roughly 30 and 60 frames per second here; hardware acceleration and touch devices remain unmeasured.
Hidden and explicitly paused canvases stop drawing. Across three client-side route
remounts, relevant global listener counts did not grow; GPU allocation totals
were identical: 5 textures, 3 framebuffers, 29 buffers, 5 programs, 8 vertex arrays.

## Visual inspection

Captured and opened hero, project, about, skills, experience, writing, contact,
reduced-motion and full-page screenshots under `artifacts/portfolio/`. Production names:
`production-hero-{1440,1280,1024,768,390}.png`,
`production-{projects,about,skills,experience,writing,contact}-{1440,390}.png`,
`production-full-desktop.png`,
`production-full-mobile.png`, `production-reduced-{1440,390}.png`.
Corrected demonstrated textarea/control collision and the portrait-tablet scene
crop; checked typography, reading order, contrast, spacing, image crop, sticky header
and scene interference. Mobile touch emulation also verifies menu/anchor/form taps. A separate
`production-contact-form-390.png` captures required-field feedback. The local social image was inspected and returns image/png.

## External limitations and configuration

- Set `SITE_URL` to the verified public HTTPS origin at deployment. Unset is
  intentional: no canonical, Person URL, sitemap entries/references or absolute
  social-image metadata. Fixture `https://portfolio.example.com` was tested only
  in an isolated temporary preview; it is not stored as production configuration.
- Image route is `/social-image`; conventional automatic metadata was replaced
  because it generated localhost image URLs when no origin was configured.
- Existing project URLs were preserved. Group Captain and Remmi returned HTTP 200
  in read-only header checks. Nexis could not be reached from this environment
  (TLS broken-pipe / tool inaccessible); availability is unverified, not invented.
- Actual SMTP delivery and credentials were not exercised. Mail construction,
  validation and response behavior were tested with fakes/interception.
- The original browser syntax error remains unproven. A later generated-chunk
  recurrence identified competing `.next` writers; output isolation removes that
  condition. Fresh production visits are clean. Any unexplained recurrence is
  still a release blocker; see `startup-investigation.md` for evidence.
- Existing user development processes were left untouched. Restart a stale local
  process after dependency changes rather than mixing loaded package versions.

## Independent final review

Independent whole-branch review returned **READY**, with no Critical or Important
findings. Its one Minor finding is now resolved: the mobile disclosure closes on
wordmark activation and every pathname change. The browser regression was written
first, reproduced the stale disclosure against the previous production bundle,
and passes against the fix.

## Focused polish pass

- Preserved the existing routes, factual data, 3D world, native scrolling, motion
  system, reduced-motion behavior and rendering budgets. No dependency was added.
- Added lightweight active navigation through `usePathname`, `aria-current` and
  `IntersectionObserver`; the project archive marks Work as the current page.
- Added hero metadata using the repository's canonical `OVER 5 YEARS` value,
  clarified the factual About copy, introduced capability categories from the
  existing technology set, and converted the real article into an editorial row.
- Confirmed `nextjs-portal` is absent at every production viewport. The red/debug
  overlays observed during development were framework tooling and are not present
  in the production screenshots or DOM.
- The first isolated build attempt in the restricted worker ended during webpack
  compilation without a diagnostic. A second build from a clean isolated output
  directory in the approved native environment compiled, type-checked, linted,
  prerendered 13/13 pages and served the complete production validation suite.
  The validated bundle reports approximately 116 kB first-load JS for the home
  route and 103 kB shared JS.
- Final screenshot review found no clipping, horizontal overflow, accidental
  development overlay, content collision or hierarchy regression at any required
  viewport. The production performance sample recorded 16.7 ms median / 16.7 ms
  p95 idle and 16.7 ms median / 16.8 ms p95 while scrolling on SwiftShader, with
  8 calls, 2,088 triangles and capped 0.75 DPR.
