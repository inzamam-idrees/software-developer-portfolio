# Prism Theme Implementation Plan

**Goal:** Recreate the approved reference presentation with canonical content and an independent rose/amber/olive palette.
**Architecture:** Five lazy theme slots, strict copy document, canonical certificates, server content with small native interaction islands. Styles compile outside the Next CSS graph.
**Tech stack:** Existing Next.js/React/Sass; no dependencies.
**Spec:** User's Step 0 request and approval dated 2026-10-22 (approval overrides earlier recommendations).

## Constraints
- No commits, pushes, activation, reference code/assets, or new dependencies.
- Canonical content only; three explicitly marked certificate placeholders.
- Native cursor retained; full reduced-motion and no-JavaScript content.
- Current five-slot contract remains intact.

## Review focus
- Empty certificate and project lists, incomplete optional fields.
- Modal/drawer keyboard trapping, Escape, focus restoration and scroll cleanup.
- Preview links stay private, including modal project links.
- Motion preferences changed while the page is open; native scrolling and SSR visibility.
- Independent light/dark contrast and mobile overflow with long professional content.

## Tasks
- [x] 1. Write failing canonical/registry/isolation tests. Add strict certificate schema/document and Prism copy registration; prove malformed URLs/dates, unknown fields and empty arrays behave correctly.
- [x] 2. Add Prism view and five lazy slots, self-contained presentation and components, compiled Sass entry, admin purpose/thumbnail. Extend tests for content mutation, copy validation and project fallbacks.
- [x] 3. Add native motion, carousel, skills filtering, marquee, decorative cursor, palette switch, accessible project dialog and drawer. Exercise keyboard/focus, reduced-motion and no-JS paths in browser tests.
- [x] 4. Verify palette contrast and all requested commands; run authenticated preview routes at 390/768/1280/1536 widths, check other themes and active-theme isolation.
- [x] 5. Correct stale slot guidance, update README/CLAUDE and write phase-11 result with palette, placeholder instructions, evidence and limitations.

Execution: inline in this checkout, as authorized by “Proceed with implementation.” No extra approval gate or commits. Each task's evidence is recorded in phase-11-result.md.
