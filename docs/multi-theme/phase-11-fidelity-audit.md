# Prism — reference-fidelity audit and fixes

Date: 2026-10-22. Local changes only; no commit, push, dependency change or activation.

## Comparison method

Compared the live [reference](https://personal-portfolio-website-pi-virid.vercel.app/) with authenticated `/preview/prism` at **1280×720** and **390×844** in Chromium. Captured every section at a consistent 80px scroll offset and measured computed styles/bounding boxes. Inspected hero, About/education, skills, projects, certificates, community/writing, resume, contact, footer, hover states, modal and mobile drawer. Still captures settle finite motion; animation timing and interactions are checked separately.

Session evidence: `/tmp/prism-compare-before.json`, `/tmp/prism-compare-{before,after}.log`, `/tmp/fidelity-{before,after}-*.png`. New comparison regression: `tests/browser/prism-fidelity.js`.

The table lists every presentation/interaction difference identified in those audited states, excluding the new palette, approved content omissions, and accessibility safeguards. Actual identity, professional content and portrait remain canonical; different text lengths and record counts cannot produce identical line breaks or total section heights. This is a scoped visual audit, not a claim that every possible frame or browser state is pixel-identical.

## Differences found and corrected

D = desktop (1280px), M = mobile (390px), both = both widths.

| # | Area / width | Before | Correction |
|---|---|---|---|
| 1 | Header, both | Sticky header occupied 80px before hero | Fixed overlay; hero starts at y=0 |
| 2 | Header, both | Always-solid, constant height | Transparent at top; glass after 20px scroll; 80px → 64px height |
| 3 | Brand, both | Smaller name and monospace monogram | 18px name, 14px heading-font monogram and gradient frame |
| 4 | Navigation, D | 12px links; drawer below 1240px | 14px links; desktop layout from 1024px |
| 5 | Active navigation, D | Separate nonmoving link backgrounds; different activation threshold | One measured sliding pill; active section selected at 200px scroll threshold |
| 6 | Brand/name/nav motion | No scramble | Native 28ms scramble steps, with stable accessible text and reduced-motion fallback |
| 7 | Section navigation, both | Instant jump and excessive inherited scroll margins | Native smooth scroll to 80px offset, staying in preview |
| 8 | Hero grid, D | Approximate 7:5 fractions, 64px gap | Exact 12-column 7/5 spans, 32px gap |
| 9 | Hero padding, both | 48px top and 100–120px bottom | 112px top, 64px bottom, full-viewport baseline |
| 10 | Name typography, both | Weight 700; 90px/45px lines; excessive tracking and margin | Weight 800; 72px/40px lines; reference tracking; 16px bottom margin |
| 11 | Greeting/role, both | Oversized mobile greeting; body-font role without emphasis | 14px mobile greeting; heading-font role, underline/weight and 56px/48px role area |
| 12 | Hero actions, both | 13px body-font controls and missing hover details | 14px heading-font controls, reference insets/gaps, arrow travel and resume-icon zoom |
| 13 | Hero socials, both | Extra 48px top margin and 28px border inset | Reference action separation, 16px inset, 40px icons and 12px gap |
| 14 | Portrait, both | Fluid aspect ratio, center crop and different frame | 448px maximum, 440px/380px image heights, top crop and rounded inner frame |
| 15 | Portrait effects, both | No vignette or image zoom | Theme-colored bottom vignette and 1.05× hover zoom |
| 16 | Floating badges, both | Shared 6s upward 10px motion | Independent 4s upward 8px and 4.5s downward 8px cycles, second delayed 1s |
| 17 | Scroll cue, both | Arrow instead of mouse outline | 32×48px mouse/wheel, 1.8s bob and reference spacing |
| 18 | Background, both | Grid covered every section | Grid restricted to hero; palette-aware ambient lighting retained |
| 19 | Global typography, both | 1.65 body leading; section weight/leading differed | 24px base leading; 800-weight section headings with 48px/36px lines |
| 20 | Section headings, both | Entire heading gradient, 820px width and inconsistent kicker styling | Normal prefix plus gradient emphasis; 768px frame; explicit kicker/intro styles |
| 21 | Mobile rhythm | Sections used 80px padding | 96px vertical section padding |
| 22 | About, D | Approximate columns; education detached into later section | Exact 7/5 spans; education restored to About aside |
| 23 | About panels, both | Extra focus panel replaced reference's education/philosophy arrangement | Education aside plus compact engineering-philosophy panel; substitute panel removed |
| 24 | About pillars, both | Two desktop columns and unnumbered small labels | Three desktop columns, stacked mobile, derived sequence numbers and corrected title sizing |
| 25 | Skill filters, both | Sentence-style category names and 40px separation | Canonical category labels, uppercase styling, 48px separation |
| 26 | Skill cards, both | 24px padding, generic 44px icons, multiline description | 28px padding, category-specific 48px icons, single-line description with full accessible text |
| 27 | Skill badges, both | No secondary proficiency value | Existing canonical 1–5 rating as compact secondary value; no invented verbal grades |
| 28 | Skill filtering, both | Instant category change | 500ms entrances with 100ms stagger; respects reduced motion/pause |
| 29 | Marquee, both | 100s cycles, excessive spacing and single-line chips | Opposing 30s rows, reference row spacing, framed icons and category sublabels |
| 30 | Marquee edges/hover | No fades; both rows paused on hover anywhere | 96px edge fades; row-specific hover pause; global accessible pause retained |
| 31 | Marquee contents | All skills made the decorative cycle excessively long | Twenty canonical skills, ten per row; complete skills still appear in cards |
| 32 | Project heading, D | Controls below heading | Controls beside heading/baseline; stacked below on mobile |
| 33 | Carousel controls, both | Visible extra counter and smaller active dot | Counter screen-reader-only; corrected dot dimensions/transition |
| 34 | Project card, both | Different radius, insets, stripe placement and title metrics | 16px radius, 40px/32px insets, inner 6px stripe, 30px/24px titles |
| 35 | Project text, both | Long description absent; empty metadata space; extra visible Features label | Canonical overview restored; empty metadata collapsed; semantic feature label visually hidden |
| 36 | Project sidebar/actions | Substitute role/stack sidebar and separate preview button | Unsupported metric sidebar omitted without substitute; preview shares action row; real detail link in modal |
| 37 | Carousel transition | Instant changes | 500ms exit then 500ms entrance with matching direction/easing |
| 38 | Project modal, both | 1050px maximum, no scale/fade, flat list | 672px maximum, 85vh limit, scale/fade and inset feature rows; native accessible dialog retained |
| 39 | Certificates, both | Oversized card inset/title/icon spacing | 28px inset, 20px/18px title, compact issuer row; placeholder notice retained |
| 40 | Resume, both | Oversized title and different control rhythm | 18px title and reference-aligned outer card/control spacing; date omission retained; PDF viewer subsequently added below |
| 41 | Contact grid, D | Approximate columns; 32px form inset | Exact 5/7 spans, 48px gap, 40px form inset |
| 42 | Contact channels | Bare icons, provider-name-only socials, no social copy buttons | Framed 44px icons, canonical address text, copy/check state for every actionable channel |
| 43 | Contact form | Missing hint, delivery subtitle, placeholders, required marks and send icon | Copy-backed hints/placeholders, canonical delivery address, required marks, send icon and 4-row message field |
| 44 | Contact fields | Different label/field gaps and input padding | Reference label/field spacing and 12px/16px insets; mobile 16px text retained to prevent zoom |
| 45 | Footer, D | Centered one-column composition | Exact 5/4/3 spans: identity/socials, navigation map, back-to-top/source area |
| 46 | Footer, M | Centered content, oversized copy and short bottom inset | Stacked left-aligned columns, smaller body/mono labels, 48px bottom inset, separate copyright strip |
| 47 | Drawer, M | 85% width, name in header, no slide | 75% capped at 384px, compact Menu header, 24px inset and slide transition |
| 48 | Entrance motion | One vertical 600ms reveal everywhere | 800ms left hero copy, 900ms scaled/right portrait, staged headings/cards and directional aside reveals |
| 49 | Tilt/magnetism, D | 2.5° tilt maximum and nearly constant 4px displacement | Card-specific 14°/8°/7°/6°/4° tilt, per-card spotlight and proportional magnetic motion/return |
| 50 | Decorative cursor, D | Rigid 44px ring, no dot/state | Spring-followed 32px ring, precision dot, 48px control state and 64px project View state; native cursor retained |
| 51 | Glass / spotlight, both | Panels were too opaque and global spotlight too small | 65% dark/75% light surface blends; 550px spotlight |
| 52 | Small type rhythm, both | Slightly taller kickers, tags, buttons and mono labels | Explicit 16px/20px label/button lines and matching kicker insets |
| 53 | Copy feedback / footer, both | Persistent inline copy status; mobile back-to-top aligned left | 2.5s accessible viewport toast with copied check state; mobile back-to-top centered |

## Intentional differences retained

- New palettes, independent light contrast, real identity/portrait/content and certificate placeholders.
- No unsupported availability, counters, learning progress, credential verification/competency claims, community challenge metrics, architecture statistics, WhatsApp, update date or reference-specific framework credits.
- Career evidence and awards remain available; awards are not relabeled as certificates.
- Actual article cards replace the omitted community challenge; the responsive card grid follows the reference vocabulary without fictional data.
- Accessible motion pause, visible focus, usable target sizes, stable screen-reader text, native cursor, no-JS content, reduced motion, truthful contact delivery and accessible modal/drawer semantics.
- Next public/detail/preview routes remain intact. The reference's Vite routing and demo-only 404 are not imported.

## Review fixes and implementation boundaries

Independent review identified two new keyboard regressions, both reproduced before fixing: the smooth-anchor handler scrolled the skip link without focusing main; disabling the focused carousel button during its exit dropped focus. The skip target now receives focus and retains its fragment. Carousel controls use `aria-disabled` plus a busy guard, preserving keyboard focus. Both are asserted by `prism-fidelity.js`.

Changes are concentrated in `app/css/prism.scss`, `themes/prism/`, Prism's copy/schema, and browser checks. The shared contact form gains only opt-in `rows`, `placeholders` and `submitIcon` props; defaults for other themes stay unchanged. No professional document, public active theme, package or lockfile changed in this fidelity follow-up.

## Verification

- `npm run validate:content`: passed; canonical content valid.
- `npm run test:unit`: passed, **223 tests, 0 failures**.
- `npm run lint`: passed, no warnings or errors (Next reports its existing lint-command deprecation).
- `PORTFOLIO_BUILD_DIR=.next-prism-build npm run build`: passed.
- Browser acceptance: **12 responsive route combinations, 24 dark/light screenshots**, no overflow or page errors; carousel, modal focus/Escape/return, mobile drawer, filters, reduced motion, no-JavaScript content, client-navigation marquee and other-theme isolation passed. No heavy GSAP/R3F script detected in Prism.
- Accessibility: axe WCAG 2 A/AA, 2.1 AA and 2.2 AA scans reported **0 violations** at 390px and 1280px in dark and light modes.
- Measured fidelity checks passed at **1280×720 and 390×844**: header/hero positioning, type weight and line heights, 96px section padding, 28px skill insets, 30s marquee, portrait crop, About/education placement and footer alignment. Desktop project-control alignment, animated carousel focus retention, skip-link focus and carousel navigation passed. The check explicitly enables motion so accessibility scans’ persisted pause preference cannot affect timing assertions.
- `git diff --check`: passed. Public theme settings, package manifest and lockfile unchanged. No commit made.

Browser coverage is Chromium; manual Safari/Firefox and assistive-technology testing were not performed. Accessibility automation is a targeted check, not a complete accessibility certification.

## Hero follow-up — name scramble and role rotation

Requested after the local Prism commits; this follow-up is uncommitted.

| # | Area | Difference | Correction |
|---|---|---|---|
| 54 | Name scramble | Different glyph alphabet; resolution advanced before drawing; no stable width reservation | Exact reference alphabet `ABCDEFGHJKLMNPQRSTUVWXYZ0123456789_#@%&*<>/`, 28ms ticks, initial zero resolved characters, half a character resolved per tick, mount/hover triggers, hidden real-text sizer |
| 55 | Role line | Always static; no rotation/caret | Optional canonical `profile.roles`, native pure state machine, reference timing, stable sizer/height, palette caret/underline and requested dot; single-role fallback remains static |

Reference analysis: `src/hooks/useScramble.js` and `src/sections/HeroSection.jsx` in the read-only reference checkout at `37461b2`. Scramble runs on mount and hover, never on a recurring interval; duration `(2N + 1) × 28ms`. Typewriter initially waits 100ms; types at 90ms, holds 1800ms, deletes at 45ms, waits 400ms before the next role, and loops. Its implementation takes an extra 90ms tick after the full text before entering hold and an extra 45ms tick at empty before advancing; the state machine preserves both. Caret is 2px by 32px desktop/24px mobile, with a 2s cubic-bezier(.4,0,.6,1) opacity pulse. Underline is 2px with 2px bottom padding; row minimum height is 56px desktop/48px mobile.

Live timed samples (`/tmp/prism-reference-hero.log`) confirmed changing text width, approximately 90ms typing/45ms deletion and the 2s caret. Neither source nor live computed styles contain a moving underline dot. The screenshot's dot appears to be the pointer. The requested decorative dot is therefore an intentional addition: 6px, accent token, 2s alternate ease-in-out travel along the underline. Prism reserves the longest role plus primary title, including underline padding/border and caret space (fixing a reproduced 4px mobile empty-text shift), keeping height stable rather than reproducing the reference's changing line width/reflow.

All supplied additional roles were bracketed placeholders. Only the existing primary designation is seeded. Add up to six unique, non-empty, unpadded titles of at most 80 characters at `/admin/content/profile` or `portfolio-data/content/profile.json`. During verification the profile was externally updated to also include `Senior Software Engineer` and `AI Engineer`; those edits were preserved. Concurrent certificate-content edits were also preserved; the existing placeholder isolation test now creates its own fixture rather than constraining editable canonical records to TODO values. Other themes keep their existing rendering. No professional roles were inferred from the tagline.

Animated layers are aria-hidden; real name and role list are stable accessible text. No-JS, reduced motion and global pause show the primary designation and real name. Native timers clean up on unmount/preference changes; typing suspends when hidden/off-screen, and scrambling resolves when hidden/off-screen.

Follow-up verification (actually run): `validate:content` passed; `test:unit` **226 passed, 0 failed**; lint passed with no warnings/errors (existing Next command deprecation); isolated `npm run build` passed. Extended `prism-fidelity.js` passed at 1280×720 and 390×844, including scramble/resolve, changing roles with timed samples, blinking caret, stable hero height, pause/reduced-motion/no-JS primary-title fallbacks and the prior fidelity/keyboard checks. Axe scans at 390/1280 in light/dark returned **0 violations**. Final static hero screenshots were captured at both widths.

Animation fixtures: the extended fidelity script expects `roles: ["AB", "CD"]` only in the isolated `/tmp/prism-review-data/content/profile.json` served on port 3025. Seed that temporary copy before running, and restore it from canonical `profile.json` afterward. This was done for verification; canonical data was never changed to synthetic titles. The preview copy was then synchronized with the updated canonical role list. Reference timed samples and local samples are in `/tmp/prism-reference-hero.log` and `/tmp/prism-hero-browser.log`; the checked-in pure-state tests assert each exact delay independently of browser scheduling. Final local mutation samples measured 89.9/88.4ms typing, 44.0/46.1ms deletion, 1892.4ms full-text display (90ms extra tick + 1800ms hold), and 445.3/448.3ms empty-to-next-character intervals (45ms extra tick + 400ms pause), at 1280/390 respectively. Browser timing assertions passed with scheduling tolerance. The live reference uses its own roles and natural-width reflow; Prism uses confirmed canonical roles and stable geometry. No cross-browser or screen-reader manual verification was performed. No commit or push made.

## Certificate card follow-up

| # | Area | Difference | Correction |
|---|---|---|---|
| 56 | Certificate card structure | Only an issuer row and title; no reference-style metadata hierarchy | 40px icon, issuer/year grouping, optional top-right status, 20px/18px title, 14px description, 11px competency label and 12px chips; 28px insets, 264px minimum height, 24px grid gaps |
| 57 | Certificate action | Existing records lacked credential URLs, so no action was displayed | “View certificate” anchor uses canonical `credentialUrl`, opens in a new tab with safe rel attributes, and appears only for a supplied valid HTTP(S) URL |

Optional description/competency/status fields are strict canonical data, not inferred claims. Additional certificate descriptions, dates, skills, verification status and URLs are still absent from the owner’s records and were requested. The reference person's certificate facts were not copied. Fields become available in `/admin/content/certificates`; empty/missing metadata stays omitted. Native tilt/reveal behavior, palette and accessibility remain unchanged.

Checks: validation, **227 unit tests**, lint and isolated build passed; temporary fixture browser checks at 1280/390 passed for metadata, responsive grid, safe URL action and no overflow. Real content was restored afterward. Axe scans at 390/1280 in both light/dark modes reported **0 violations**. No commit/push.

## Resume viewer follow-up

The owner approved embedding the canonical résumé. Prism now derives Google Drive’s `/preview` URL from the existing canonical `/view` link, renders a lazy native iframe (760px desktop, 560px mobile), and preserves the original “Open Resume” action to Drive in a separate tab. A compact viewer header and visible fallback guidance use Prism copy data. No inferred update date, downloaded résumé asset, third-party dependency, custom PDF parser, or factual sidebar claims were added. Other themes remain unchanged. Native Drive preview controls and fullscreen support are retained.

Verification: canonical validation, **228 unit tests**, lint and isolated production build passed. Actual Drive preview loaded résumé text in Chromium at 1280 and 390; original link/target, responsive width and no horizontal overflow passed. Axe scans at 390/1280 in light and dark returned **0 violations** (host page; Google’s cross-origin viewer is not fully covered by that scan). No commit/push.
