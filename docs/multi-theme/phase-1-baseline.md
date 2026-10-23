# Multi-theme portfolio — Phase 1 baseline

Date: 2026-10-01  
Status: Complete; no Phase 2 implementation started

## Isolation and source state

- Reference branch: `codex/cinematic-portfolio`
- Exact source commit: `8e6af1f6c0743e8e11122d83d20181c32f00be07`
- Source commit subject: `docs: record portfolio polish validation`
- New branch: `codex/multi-theme-portfolio`
- Isolated worktree: `/home/inzamam.idrees@nextbridge.org/.codex/worktrees/multi-theme-portfolio/software-developer-portfolio`
- `master` remains at `5ee46ac4692934b5dc5ee1c2b6cac690b5b017f9` and is the Coding-theme reference.
- The original `codex/cinematic-portfolio` checkout remains at the source commit with its pre-existing `.gitignore` modification intact.
- Neither reference branch was modified, committed, merged, pushed, or used for a pull request.

The managed worktree was initially created at a detached HEAD and was then attached to the requested `codex/multi-theme-portfolio` branch. Dependencies were installed from the existing lockfile with `npm ci`.

## Dependency baseline

- 389 packages installed from `package-lock.json`
- 390 packages audited
- 0 known vulnerabilities reported by `npm ci`
- Existing warning: ESLint 9.39.5 is deprecated and no longer supported upstream. This is baseline evidence, not addressed in Phase 1.

## Automated baseline

### Unit tests

Command: `npm run test:unit`

- 13 tests passed
- 0 failed, cancelled, skipped, or todo
- Covered article normalization/failure behavior, contact validation and mail safety, scene state/budgets, and public-origin validation

### Lint

Command: `npm run lint`

- 0 warnings
- 0 errors
- Existing notice: `next lint` is deprecated for Next.js 16; the current Next.js 15.5.27 command still succeeds.

### Production build

Command: `PORTFOLIO_BUILD_DIR=.next-phase1-baseline npm run build`

- Next.js 15.5.27 production build completed successfully
- 13 static pages generated
- Home first-load JavaScript: 116 kB
- Shared first-load JavaScript: 103 kB
- Routes produced: `/`, `/project`, `/blog`, `/api/contact`, `/api/data`, `/api/google`, `/robots.txt`, `/sitemap.xml`, and `/social-image`

The temporary `.next-phase1-baseline` output was removed after verification.

## Browser baseline

The isolated production build ran at `http://127.0.0.1:3004`. All 12 existing browser scripts completed successfully:

1. `startup.js`
2. `startup-investigation.js`
3. `navigation.js`
4. `content.js`
5. `metadata.js`
6. `accessibility.js`
7. `contact.js`
8. `motion.js`
9. `scroll-motion.js`
10. `touch.js`
11. `performance.js`
12. `acceptance.js`

Verified behavior includes:

- Three cold visits and reloads without application errors
- Essential content available with JavaScript disabled
- Public `/`, `/project`, and `/blog` routes
- Mobile keyboard navigation, skip link, focus visibility, menu reset, and no horizontal overflow
- Metadata behavior with `SITE_URL` intentionally absent and local social image returning PNG
- Input boundary contrast of 3.33:1
- Mocked contact success, server failure, network failure, duplicate-submit prevention, and input preservation
- Reduced-motion behavior, live preference changes, pause/resume, scroll reversal, route remounts, denied WebGL, and context-loss fallback
- Touch navigation and contact validation at 390×844
- Full acceptance at 1440×900, 1280×800, 1024×768, 768×1024, and 390×844
- Production mode contained no Next.js development toolbar
- No failed application scripts in the acceptance matrix

The contact test intentionally generates browser console errors for its mocked HTTP 502 and aborted-network cases. Those failures are expected test inputs; the assertions passed.

## Rendering measurements

Environment: Chromium 154, Linux, ANGLE/Vulkan SwiftShader software rendering, 1440×900.

- Idle frame interval: 16.7 ms median, 16.8 ms p95, 120 samples
- Scrolling frame interval: 16.7 ms median, 16.7 ms p95, 120 samples
- Draw calls: 8
- Triangles: 2,088
- Raster pixel ratio: 0.75
- Rendering stopped while the page was hidden
- Rendering stopped while motion was paused
- Listener counts remained bounded across three remounts
- GPU resources remained unchanged across remounts: 5 textures, 3 framebuffers, 29 buffers, 5 programs, and 8 vertex arrays

These measurements describe this software-rendered test environment and are not a universal hardware performance claim.

## Generated test artifacts

The browser suite generated its established screenshots under ignored `artifacts/portfolio/`. Installed dependencies remain under ignored `node_modules/`. The Playwright session, local production server, temporary browser state, and isolated build output were closed or removed after the run.

## Phase boundary

Phase 1 made no portfolio implementation changes. The only intended branch change is this baseline record. Phase 2—canonical schemas, Zod integration, canonical content migration, and validated loading—has not started and requires explicit approval.
