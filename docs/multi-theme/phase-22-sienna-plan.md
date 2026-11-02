# Phase 22 (Sienna) — audit and plan

Date: 2026-10-29
Status: **Plan only. Awaiting owner approval. No code changed.**

> Numbering: `phase-15` … `phase-21` files already exist (Creative and Executive iterations), so Sienna is Phase 22. Result file planned: `docs/multi-theme/phase-22-sienna-result.md`.

## Sources read (this session)

- Reference repo `codewithsadee/jack-portfolio` (branch `master`): `index.html` (927 lines), `assets/css/style.css` (1337 lines), `assets/js/script.js` (104 lines), `style-guide.md`, fetched raw from GitHub and read in full. The repo has **no license file**; its images (hero/about cutouts, project PNGs, stats icons, skill logos) are not copied.
- Live demo `https://codewithsadee.github.io/jack-portfolio/` captured with Playwright CLI.
- Project: `CLAUDE.md`, `README.md`, `lib/themes/{ids,registry,create-view,stylesheet-sources}.mjs`, Creative theme (most recent, `phase-15-creative-theme-result.md`) as the structural template, Prism light/dark handling, `lib/portfolio/copy-schemas.mjs`, copy scanner, canonical data.

## A. Reference capture

Saved in `docs/multi-theme/sienna-reference/` (72 PNG, 19 MB, plus `measurements.json`):
`{dark,light}-{1440,1024,768,375}-{full,home,stats,about,skills,portfolio,contact,footer,header}.png`.
Header shots are taken in the scrolled (`.active`) state because the header is `position: fixed`.

> Risk: these screenshots contain the reference's unlicensed photos. They are comparison material only and never go into `public/`. **Recommend adding `docs/multi-theme/sienna-reference/` to `.gitignore`** so they are never committed (owner decision).

### Section order (reference)

Header (fixed) → Hero `#home` → Stats `#stats` → About `#about` → Skills `#skills` → Portfolio `#portfolio` → Contact `#contact` → Footer → fixed Go-to-top.
All sections live in one `article.container`.

### Measured layout (dark, 1440 × 900)

| Item | Value |
|---|---|
| Document height | 4498 px (1440), 8066 px (375) |
| Container | max-width 1150 px, padding-inline 10 px (content 1130 px) |
| Hero | 900 px (= 100vh), image height 100% (1062 × 900) centered |
| Hero title | Poppins 700, 48 px / 57.6 px, max-width 450, absolute `top: 50%`, white + `drop-shadow(2px 4px 10px #000)` |
| Hero button | 164 × 41, padding 10 × 25, 1 px border, radius 4, uppercase, letter-spacing 0.5 px |
| Stats | top 1000 (hero margin-bottom 100), section padding 100, cards 357 × 133, padding 25, radius 12, icon disc 60 × 60 |
| Stats number | Poppins 700, 48 px, raw-sienna; label `strong` 16 px, line-height 1.3, margin-top 5 |
| About | grid 1fr 1fr, gap 30; banner max-width 450 |
| Section title | Poppins 700, `calc(1.313rem + 1vw)` = 35.4 px @1440, max-width 460 |
| Section text | Roboto 16 / 28.8 px, color-secondary |
| Subtitle | rotated 270°, 16 px uppercase, with 60 × 2 px rule |
| Skills toggle | 196 × 45 pill, padding 5, indicator 93 px → (left 98, width 94) |
| Skill tile | 80 × 80, radius 12, shadow-1, gap 15, flex-wrap centered |
| Project grid | CSS columns: 1 (<550), 2 (≥550, gap 25), 3 (≥992); intro text is the first column item; cards radius 12, shadow `2px 4px 6px hsla(0,0%,0%,.2)`, item margin-bottom 25 |
| Load more | Roboto 22.4 px (fs-4), raw-sienna, underlined, no behaviour in reference |
| Contact | grid 1fr 1fr, gap 30; form 450 × 522, padding 20, radius 12; inputs padding 10 / left 40, radius 12, input-bg |
| Footer | 78 px, padding-block 20, bg-secondary, shadow-1, flex space-between ≥992 |
| Go-top | 45 × 45 circle, 2 px border, fixed bottom/right 25 |

Breakpoints from source: 550 (container 550, 2-col projects), 768 (container 720, 2-col stats, btn-group row), 992 (container 980, desktop nav, rotated subtitles, 2-col sections, `--fs-2: 3rem`, `--section-padding: 100px`), 1200 (container 1150, title 460, socials/scroll at ±80 px, about banner 450).

### Behaviour (from `script.js` + CSS)

- **Header**: transparent, padding-block 15 (30 ≥992). At `scrollY >= 10` adds `.active`: bg-secondary, shadow-1, padding 12 (15 ≥992). No hide-on-scroll in reference.
- **Theme toggle**: 48 px pill (padding 4, bg-secondary, bg-primary when header active). Knob 20 × 20: dark = crescent (`inset 9px -6px color-primary`), light = sun disc (`inset 20px -20px sizzling-sunrise`, `left: 20px`). Toggles `body.dark_theme` / `light_theme`, stored as `localStorage.theme`. **Default dark**, ignores `prefers-color-scheme`. Flash of dark theme on reload for light users (script runs at end of body).
- **Mobile nav (<992)**: button rotated −55° with three bars (10 / 20 / 10 px); active → −45° and outer bars rotate 90° into a cross-ish mark. Overlay `position: fixed`, slides from `top: 100%` to `0` over 0.75 s `cubic-bezier(.71,.01,.24,.99)`; links (Poppins 2 rem) rise from `translateY(50px)` with an overshoot easing `cubic-bezier(.68,-.55,.27,2)`, delayed 0.5 s. Body scroll locked. Links underline via a 5 px raw-sienna bar (2 px on desktop) growing left→right on hover/focus. **No Escape key, no focus trap, no aria-expanded, menu does not close on link click.**
- **Skills/Tools**: two buttons; clicking either toggles both (not real tabs); list swaps `display` with 0.5 s fadeIn; pill indicator slides. No ARIA tab semantics. Tooltip (raw-sienna, white 15 px bold) above tile on hover only.
- **Load more**: button with no handler.
- **Scroll indicator**: "SCROLL" rotated 90°, 18 px uppercase with a 30 × 2 px rule; static link to `#stats`. Hero socials column with tooltips, hidden <992.
- **Back-to-top**: shown with the header state (`scrollY >= 10`), fades/translates 10 px.
- **Form**: name, email, phone, message, all `required`, `action=""` (no backend). Focus: 1 px outline, icon turns raw-sienna.
- **Focus**: `outline-color: scarlet; outline-offset: 3px` on a/button/select.
- **Font loading quirk**: Poppins is loaded **only at 700**, so every Poppins element (nav links, toggle, labels) renders bold even when `font-weight` computes to 400. Sienna will reproduce the rendered result (700).
- **En/Ar select**: unstyled `<select>`, no behaviour.

## B. Design tokens (verified against `style.css`)

| Token | Value | Notes |
|---|---|---|
| `--raw-sienna` | `hsl(24, 74%, 58%)` | source spells it `--raw-seinna`; hover `hsl(24, 74%, 64%)` |
| `--sizzling-sunrise` | `hsl(51, 95%, 54%)` | sun knob only |
| `--scarlet` | `hsl(13, 96%, 47%)` | focus outline |
| `--black` / `--white` | `hsl(0,0%,0%)` / `hsl(0,0%,100%)` | |
| `--ff-saira` | Saira Stencil One 400 | logo only |
| `--ff-poppins` | Poppins 700 | headings, nav, toggle, labels |
| `--ff-roboto` | Roboto 400/700 | body (`html`) |
| `--fs-1` | 2rem | logo, mobile nav links |
| `--fs-2` | `calc(1.813rem + 1vw)`; **3rem ≥992** | hero + stats numbers |
| `--fs-3` | `calc(1.313rem + 1vw)` | section titles |
| `--fs-4` | 1.4rem | load more |
| `--fs-5` | 1rem | h4 |
| `--fs-6` | 0.813rem | project date |
| `--fs-7` | 0.75rem | form labels |
| `--fw-400/700` | 400 / 700 | |
| `--transition-1` | `0.25s ease-in-out` | |
| `--section-padding` | 80px; **100px ≥992** | |
| `--radius-4/12` | 4px / 12px | |

| Theme var | Dark | Light |
|---|---|---|
| `--bg-primary` | `hsl(0,0%,12%)` | `hsl(0,0%,90%)` |
| `--bg-secondary` | `hsl(0,0%,19%)` | `hsl(0,0%,100%)` |
| `--color-primary` | `hsl(0,0%,100%)` | `hsl(0,0%,12%)` |
| `--color-secondary` | `hsl(0,0%,62%)` | `hsl(0,0%,37%)` |
| `--card-shadow` | `hsla(0,0%,0%,.4)` | `hsla(0,0%,0%,.1)` |
| `--input-bg` | `hsl(0,0%,16%)` | `hsl(0,0%,93%)` |
| `--shadow-1` | `10px 10px 40px var(--card-shadow)` | same |

### Contrast audit (WCAG, computed) and required deviations

| Pair | Ratio | Verdict |
|---|---|---|
| raw-sienna on dark bg-primary / bg-secondary | 6.04 / 4.78 | pass |
| black on raw-sienna (Hire me) | 7.66 | pass |
| color-secondary on bg (dark 12/19, light 90/100) | 6.19 / 4.90 / 5.14 / 6.45 | pass |
| **white on raw-sienna** (tooltips, active toggle text, social hover) | **2.74** | fail |
| **raw-sienna text on light bg 90% / white / input 93%** (load more, stats numbers, input text, copyright link) | **2.19 / 2.74 / 2.35** | fail |
| **white hero title over the owner's cream shirt** | ~1.15 | fail (reference model wears dark blue) |

Planned minimal deviations (documented, colors otherwise untouched):
1. Text on a raw-sienna fill uses `--black` (7.66:1) instead of white.
2. Light mode only: sienna-colored **text** uses `--raw-sienna-ink: hsl(24, 74%, 34%)` (5.07:1 on 90%); fills, bars and icons keep raw-sienna.
3. Hero title gets a scrim (see D). Decorative fills are not text and stay as in the reference.

### Fonts

`next/font/google` (self-hosted at build, no external render-blocking stylesheet), `display: swap`, `preload: false`, variables scoped to `.theme-sienna`, same as Creative/Prism: Saira Stencil One 400, Poppins 700, Roboto 400/700. All OFL/Apache. No new dependency.

## C. Data audit and section mapping

Canonical data present: profile (name, designation, headline, tagline, shortIntroduction, longIntroduction, experienceLabel "7+ years", traits, 3 roles, image `/inzamam_profile.jpg`), about (summary, personalStatement, engineeringPhilosophy), 3 experience records (earliest start 2019-01, current role since 2022-07), 3 education, 3 awards, 3 certificates (owner-supplied; Prism's placeholders were replaced), 9 projects (4 featured, **no images, no dates**), skills (52 in `all`, 4 categories: frontend 14, backend 17, delivery 8, AI 11; proficiency map), resume (Google Drive URL, `features.resume: true`), articles (dev.to `inzamam-idrees`), social (github, linkedIn, facebook, x, stackOverflow, leetcode, dev), contact (email, one phone, location, heading, introduction, form enabled). Navigation settings: Work, About, Expertise, Experience, Contact.

| Reference | Sienna source | Notes |
|---|---|---|
| Logo "Jack." | first token of `profile.name` + raw-sienna dot | dot is decorative markup |
| Nav "Home. About. …" | `content-navigation.mjs` entries (data labels) + decorative dot | adds Experience; Blog link when articles on |
| Hero title (h2) | `profile.headline` as the page **h1** | reference has no subline; see E3 |
| Hero subline | `profile.designation` (optional small line) | owner decision E3 |
| "Get in touch" | copy `home.hero.cta` → `#contact` | |
| Hero socials (FB/Twitter/LinkedIn) | `social` (all present keys, react-icons) | 7 instead of 3; column grows upward |
| Scroll indicator | copy label → `#stats` | |
| Hero photo | `public/inzamam_profile-cutout.webp` (RGBA cutout of `profile.image`) | see D |
| Stats 1 "12+ Years of Experience" | years derived from earliest `experience.startDate` to now (2019-01 → **7+**) | cross-check `profile.experienceLabel` |
| Stats 2 "230+ Completed Projects" | `projects.length` (**9**) | |
| Stats 3 "95+ Happy Clients" | **no source → replace with `skills.all.length` "Technologies" (52)** | alternatives: certificates (3), companies (3). Never invent a client count |
| Stats card links | 1 → `#experience`, 2 → `#portfolio`, 3 → `#skills` | reference links are `#` |
| Stats icons (PNG) | react-icons glyphs in the sienna disc | no reference PNGs |
| About image | same cutout, mirrored splash shape | only one portrait exists; see D |
| About title / text | `about.summary` / `profile.longIntroduction` | |
| Hire me | `#contact` (or `mailto:contact.email`) | |
| Download CV | `resume.url` (Drive), shown only when `features.resume` | present ✓ |
| Skills/Tools tabs | **Skills** = frontend + backend categories (31), **Tools** = delivery + AI (19); tab→category ids in sienna copy | pill widths become content-driven |
| Skill tiles + tooltip | `TechIcon`-style map with react-icons / simple-icons (already installed); tooltip = skill name; proficiency from `skills.proficiency` via `themes/shared/skill-level.jsx` in the tooltip | 31 tiles vs 12 → more rows |
| **Experience (new)** | `experience[]` as a vertical timeline in the section-content language (rotated subtitle, cards bg-secondary, shadow-1, radius 12) | dates via `formatMonth`, current → copy "Present" |
| **Education (new)** | `education[]` cards | |
| Awards (parity) | `awards[]` compact list under Education | Phase 12 parity |
| **Certificates (new)** | `themes/shared/certificates.jsx` with Sienna styles | uses existing owner data, no dummy data added |
| Résumé preview (parity) | `themes/shared/resume.jsx` | |
| Portfolio "My Works" | `projects`, featured first by `featuredOrder`, then `order`; card → `/project/[slug]` | |
| Card image | **no project images** → original flat-color cover (palette rotation of the reference's flat backgrounds) with project category glyph + initial; `aria-hidden` | supply `projects[].image` to replace |
| Card date | `project.date` is null for all → show `category` (or role) chip | |
| Load more | first **6** cards; button reveals the next 6; no-JS: all cards visible, button hidden | |
| **Blog (new)** | dev.to via `lib/articles.mjs` on `/blog`; home "Writing" teaser with 3 latest in card style | |
| Contact left | `contact.location`, `contact.phone`, `contact.email`, `social` | one phone/email each |
| Contact form | shared `ContactForm` (`/api/contact`, reCAPTCHA, `form-primitives.scss`) | **no phone field** (API does not accept it) |
| Footer | logo + `© {year} {name}` | reference credits its author; we credit the owner |
| Go-top | copy label, `#top` | |

## D. Profile photo

- A transparent cutout **exists**: `public/inzamam_profile-cutout.webp`, 800 × 800 RGBA (head to waist, arms crossed, cream shirt). No masking is needed.
- The reference splash is painted into its PNG. Sienna draws an **original SVG paint-splash** (blobs + spatter in raw-sienna → scarlet with opacity) behind the cutout. No reference asset is used.
- Size: the reference renders the hero image at 900 px tall on 1440 × 900. The cutout is 800 px square with transparent margins; the subject is ~720 px tall, so it will be **upscaled ~1.25×** and look soft on desktop/retina.
- Shirt: white hero text over a cream shirt is unreadable (~1.15:1). Plan: a soft dark radial scrim behind the title/button (only ≥992 where text overlays the photo) to reach ≥4.5:1.

**For a perfect result, supply:** a transparent PNG/WebP cutout, **≥ 1800 px tall** (2× for 900 px), head to waist, subject centered, ~10% headroom, no shadow, ideally a **darker top** (the reference relies on it for white text). Optional second cutout (different pose, e.g. hand on chin) at ≥ 1000 px tall for About. Nothing will be generated or fabricated.

## E. Decisions for the owner (recommended default first)

1. **En/Ar language toggle and RTL** — *omit* (Arabic copy would be invented; copy schema is single-language). The theme toggle takes its slot.
2. **Theme id/name** — *`sienna` / "Sienna"*.
3. **Hero text** — *h1 = `profile.headline` + small `profile.designation` line above the button* (minor addition vs reference). Alternative: headline only (exact reference).
4. **Section order** — *Hero → Stats → About → Skills → Experience → Portfolio → Education (+ Awards) → Certificates → Résumé → Writing → Contact → Footer*.
5. **Stats third card** — *Technologies (52)*. Alternatives: Certificates (3), Companies (3).
6. **Default color mode** — *dark, as the reference* (stored choice wins). Alternative: follow `prefers-color-scheme` when nothing is stored.
7. **Header hide-on-scroll** (requested in the motion brief, not in the reference) — *implement*, but never hide while the mobile menu is open or focus is inside the header.
8. **Contrast deviations** in B — *apply*.
9. **Reference screenshots in git** — *gitignore `docs/multi-theme/sienna-reference/`*.

## F. Motion plan

Static layout matches the reference; motion is an additive layer: `transform`/`opacity` only, space reserved, no CLS.

Gate: shell renders `data-motion="on|off"` from `features.animations`. A tiny inline script (below) adds `.js-ready` to the theme root. Reveal-hiding CSS applies only under `.theme-sienna.js-ready[data-motion=on]` **and** `@media (prefers-reduced-motion: no-preference)` **and** `@media (scripting: enabled)`, plus a 3 s CSS failsafe animation that reveals anything the observer missed. No-JS users see everything.

| Effect | Implementation |
|---|---|
| Hero entrance | CSS keyframes, staggered via `--i`: splash scale+fade from 0.92 with slow drift, cutout rise 24 px + fade, title/subline/CTA/socials/scroll stagger 80 ms; idle float ±6 px on the cutout (8 s) |
| Scroll indicator | CSS loop: rule scales X 0→1→0 with transform-origin switch, 2.4 s |
| Section reveals | one shared `IntersectionObserver` (`threshold .15`, `rootMargin 0 0 -10%`) in `client/motion.jsx`; `data-reveal` on headings, text, cards, tiles; `--i` stagger; unobserve after first reveal |
| Stats count-up | server HTML contains the final value; client replaces text with rAF count from 0 over 1.2 s (ease-out) on first intersect; `aria-label`/`aria-live` not changed (final value stays in an `sr-only` span) |
| Skills tabs | proper `role=tablist` with roving tabindex, ←/→/Home/End; indicator slides with `transform: translateX` + width from measured button; panel cross-fade 0.25 s; no-JS: both lists visible stacked with their labels |
| Skill tiles | hover/focus lift `translateY(-5px)` with shadow-1; tooltip also on `:focus-visible`. Marquee: *not planned* (would alter the reference look) |
| Project cards | hover/focus: cover `scale(1.06)`, overlay + title/date rise (reference timings); pointer tilt ±4° only on `(hover:hover) and (pointer:fine)`; on touch, title chips always visible (reference hides them, unreadable on touch) |
| Primary buttons | reference fill swap; magnetic offset ≤ 6 px on fine pointers via one delegated `pointermove` listener |
| Header | `.active` at `scrollY >= 10` (reference) + hide on scroll-down/show on scroll-up after 120 px; rAF-throttled passive listener; active-section highlight via the shared observer, `aria-current="location"` |
| Mobile menu | reference overlay + link rise easings; plus `aria-expanded`, `aria-controls`, Escape, focus trap, focus return, close on link click, body scroll lock |
| Theme toggle | `document.startViewTransition` when available, else 0.25 s color transition on tokens; stored as `localStorage["sienna-color"]` |
| No-flash | inline `<script>` right after the theme root opens: reads storage, sets `data-sienna-mode` on `document.currentScript.parentElement`, adds `js-ready`. Static string, no interpolated data; CSP-safe via a documented `sha256-` hash if a CSP is added later (none is configured today) |
| Back-to-top | reference fade + 10 px slide, shown after `scrollY >= 10` |
| Scroll progress | 3 px raw-sienna bar fixed at top, `transform: scaleX(var(--p))` updated in the same rAF loop |
| Reduced motion | all keyframes/transitions/tilt/magnet/count-up/view-transition disabled; instant states |

Budget: client islands only for `motion.jsx` (observer, header, progress, count-up, magnet/tilt), `navigation.jsx` (mobile menu), `color-toggle.jsx`, `skills-tabs.jsx`, `load-more.jsx`. No animation library, no GSAP/Three.js/R3F, nothing imported from Cinematic or another theme.

## File / directory plan

Create:
- `themes/sienna/{shell,home,projects,project,blog}.jsx` — five slots.
- `themes/sienna/{view,presentation}.mjs` — `createThemeView("sienna", …)` + pure projections: nav, stats (derived numbers), skill tabs, ordered projects, contact rows.
- `themes/sienna/stats.mjs` — pure `yearsOfExperience(experience, now)` etc. (unit-tested).
- `themes/sienna/{heading,icon,tech-icon,splash,project-card,articles}.jsx`.
- `themes/sienna/client/{motion,navigation,color-toggle,skills-tabs,load-more}.jsx`.
- `app/css/sienna.scss` — tokens, light/dark maps, all styles scoped under `.theme-sienna`.
- `portfolio-data/settings/copy/sienna.json` — all visible wording.
- `public/theme-thumbnails/sienna.webp` — admin thumbnail from our own render.
- `tests/unit/sienna-presentation.test.mjs`, `tests/unit/sienna-copy.test.mjs` (or extend `theme-copy`), `tests/browser/sienna-*.js`.

Modify (registration only, same as Creative): `lib/themes/{ids,registry,stylesheet-sources}.mjs` (append `sienna` last), `lib/portfolio/copy-schemas.mjs` (`siennaCopySchema`), `lib/portfolio/documents.mjs` (`copy-sienna`, 25 documents), `app/admin/theme/theme-guide.jsx`, the theme-count/document-count unit tests, `CLAUDE.md` status, and optionally `.gitignore`.

Not modified: canonical `content/*.json`, `settings/theme.json` (stays `coding`), other themes' code/styles/copy, loader, schemas of content, dependencies.

## Test plan

- Unit: registry/IDs order with 7 themes; stylesheet sources; `siennaCopySchema` strict (unknown keys rejected); `createSiennaView` required keys; pure helpers (`yearsOfExperience` across current/ended roles and month boundaries, project ordering featured-first, tab grouping that drops unknown skills, load-more batching); `no-hardcoded-copy` and `theme-content-isolation` include `themes/sienna`.
- Commands: `npm run validate:content`, `npm run lint`, `npm run test:unit`, `npm run build` (isolated `PORTFOLIO_BUILD_DIR`, scratch `PORTFOLIO_DATA_DIR` with `activeTheme: sienna`).
- Browser (Playwright on `next start`): 375/768/1024/1440 × dark/light, no horizontal overflow; JS disabled (all sections, all projects, both skill lists visible); reduced motion (0 running animations, nothing hidden); keyboard (skip link, nav, tabs arrows, menu Escape/focus trap, visible focus); theme toggle persists across reload with no first-paint mismatch (screenshot at `domcontentloaded`); mobile nav; `/project`, `/project/[slug]`, `/blog` 200; Coding/Executive pages do not request `sienna.*.css` or Sienna chunks and vice versa; `/preview/sienna` noindex.
- 2F: re-screenshot at the same viewports/modes and compare section by section against `sienna-reference/` (box metrics from `measurements.json` + visual diff); document intentional differences.

## Risks

- **Pixel fidelity limits**: content differs (longer intro text, 31/19 skill tiles, 9 projects without images, 7 socials, extra sections), so total page height and section heights will not match; per-component metrics (sizes, spacing, type, radii, colors, states) will.
- Upscaled cutout looks soft until a ≥1800 px asset is supplied.
- Contrast fixes and hero scrim deviate slightly from the reference colors.
- Header hide-on-scroll and tilt/magnet are additions to the reference.
- Admin preview bar is fixed-position and may overlap the reference's fixed header/back-to-top in preview only.
- Copy-scanner false positives on decorative SVG paths (Creative hit this) → use elements, not literal path strings, or add file exceptions.
- 19 MB of unlicensed reference screenshots in `docs/` unless gitignored.

## Sub-phases after approval

2A registration + copy schema + skeleton + tokens → 2B shell, hero, stats → 2C about, skills, experience, education, certificates → 2D works/projects/detail, blog → 2E contact, motion layer, SEO reuse, preview noindex check → 2F pixel comparison and result doc. A report after each.
