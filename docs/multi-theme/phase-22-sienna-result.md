# Phase 22 — Sienna theme (result log)

Plan: `phase-22-sienna-plan.md` (approved 2026-10-29 with the recommended defaults plus three owner additions: data-backed third stat, data-driven hero cutout and project images, review stop after 2B).
Status: **2A, 2B (hero approved after four review rounds) and 2C implemented and verified locally. Not activated, not committed.** Public active theme remains `coding`.

## 2A — registration, copy, data, skeleton

Changed:
- `lib/themes/{ids,registry,stylesheet-sources}.mjs`: `sienna` appended last (order assertion holds); stylesheet entry `form-primitives.scss` + `sienna.scss`.
- `lib/portfolio/copy-schemas.mjs`: strict `siennaCopySchema` for the whole theme (all sub-phases), registered in `copySchemaByTheme`.
- `lib/portfolio/documents.mjs`: `copy-sienna` (registry now 25 documents).
- `lib/portfolio/schemas.mjs`: **schema change** — optional, nullable `profile.cutoutImage` (path or HTTP(S) URL). Existing documents stay valid without it.
- `portfolio-data/content/profile.json`: `"cutoutImage": "/inzamam_profile-cutout.webp"` (the existing cutout file).
- `portfolio-data/settings/copy/sienna.json`: all visible Sienna wording.
- `app/admin/theme/theme-guide.jsx`: purpose text (thumbnail is added in 2F; the picker shows an empty frame until then).
- Tests: theme/document counts and lists updated (`theme-registry`, `theme-preview`, `theme-stylesheets`, `theme-content-isolation`, `theme-copy`, `portfolio-loader`, `document-registry`, `content-store-filesystem`, `content-store-github`); new `tests/unit/sienna-theme.test.mjs` (10 tests); `tests/unit/support/copy-scan.mjs` allows the SVG keyword `in="SourceGraphic"` in `themes/sienna/splash.jsx` only.
- `.gitignore`: `/docs/multi-theme/sienna-reference/` (decision 9).

Data-driven images (owner addition 2):
- Hero: `profile.cutoutImage` if set, else `profile.image` with an organic-mask photo fallback and a local scrim for the text. Swapping in a sharper cutout is a content edit (admin profile editor or the JSON file).
- Projects: `projects[].image` already exists in the schema (nullable); 2D renders it when set and falls back to the generated flat-color cover. No schema change needed.

Third stat (owner addition 1): **Companies Worked With = 3** (distinct `experience[].company`). Chosen over Technologies (52) and Certifications because it is the closest data-backed analogue of the reference's "Happy Clients" (organizations served), comes straight from employment records, and needs no interpretation; a certification count would mix one in-progress record with completed ones, and a technology count inflates the bar. Only the years figure carries "+" (it is a lower bound); projects (9) and companies (3) are exact counts.

## 2B — shell, hero, stats

Created: `themes/sienna/{shell,home,projects,project,blog}.jsx` (route slots are placeholders until 2D), `{view,presentation,stats,color-script}.mjs`, `{icon,splash}.jsx`, `client/{header,color-toggle,motion}.jsx`, `app/css/sienna.scss`.

Decisions:
- Fonts: Saira Stencil One 400, Poppins 700, Roboto 400/700 via `next/font/google`, `preload: false`, scoped variables.
- Icons: Ionicons 5 through `react-icons/io5` (the reference's icon family, already installed), plus `fa6`/`si` for DEV, X and LeetCode. No reference PNGs.
- Splash: original SVG (generated blob/streak/spatter geometry, turbulence roughening, raw-sienna to scarlet gradient).
- Header: reference states (transparent; solid + shadow after 10 px; 30/15 px padding ≥992), plus hide on scroll-down / show on scroll-up after 120 px (not while the menu is open or focus is inside), active-section highlight (`aria-current="location"`), 3 px scroll-progress bar. Mobile overlay uses the reference timings with `transform` instead of `top`, plus `aria-expanded`/`aria-controls`, Escape with focus return, focus trap, scroll lock, close on link and on resize to desktop. Without JS the nav is an inline list and the toggle buttons are hidden.
- Color mode: default dark; `localStorage["sienna-color"]`; inline pre-paint script (`color-script.mjs`) as the theme root's first child sets `data-mode` and `.js-ready` before paint; View Transition cross-fade where supported, else a 350 ms color transition. No CSP is configured today; if one is added, allow the script by its SHA-256 hash.
- **Hero (riskiest call, three owner review rounds)**. The reference hero is one raster (`hero-banner.png`): a model in a navy shirt over a dense watercolor splash, dissolving into dark spatter at the waist, with white text on the shirt.
  - Round 1: grey radial scrim measured 1.87:1 behind the title, rejected. Dark-brown alpha-clipped grade (≥9.2:1) shown to the owner.
  - Round 2 (owner: lighter): tan grade, 5.03:1. Owner then asked for the demo look.
  - **Final (round 3):** the designation line is removed (as in the reference), so title and button sit at the reference coordinates. The shirt is toned navy by an inline SVG filter (`ShirtTone` in `themes/sienna/splash.jsx`, applied as `filter: url(#sienna-shirt-tone)` to the cutout only): a color key (alpha = 24·(B−R) + 5·G − 1.2) selects light, low-saturation shirt pixels and multiplies them with navy `rgb(33,69,143)`; skin, hair, beard and watch fail the key. An untinted copy of the cutout masked to the top 43–47.5% keeps face highlights natural. A soft chin shadow covers the open collar under the first title line (where the reference has a dark tie). The splash is redrawn as a 1200×800 watercolor cloud (orange core left, scarlet right, displaced edges, cloudy translucent wash, ~140 droplets) placed like the reference (wider than the figure, centered on the chest), plus a dark spatter layer over the waist (`SplashForeground`). Small screens use a smaller figure inside the splash as in the reference's small banner.
  - Measured with text hidden (dark and light identical): title background 6.67:1 at the 98th percentile, 5.3:1 at 99.5%, **0.0% of pixels below 3:1** (large-text AA); button 9.23:1.
  - This recolors the owner's shirt in the hero only. Supplying a cutout photographed in a dark top lets the filter be removed (delete the `sienna-hero-cutout` filter rule).
  - Known small artifacts: neutral-grey fingernails and a few cream fold highlights at the shirt edges take a light blue tint or stay cream; the splash is vector art, so it is cleaner than the reference's painted texture.
- **Hero round 4 — owner-supplied artwork (current).** The owner supplied a composed hero image (their portrait in a navy shirt and tie over an orange splash, 1363×1154, black background, no alpha). Same aspect as the reference banner (1062×900).
  - Asset: `public/inzamam_profile-hero.webp` (RGBA, 270 KB). Background removal (revised after owner feedback about black gaps in light mode):
    - Silhouette: the existing `public/inzamam_profile-cutout.webp` is the same photo and pose; its alpha was aligned to the artwork by grid search (scale 1.385, offset 134,2; IoU 0.89) and eroded 3 px. Inside it pixels stay opaque.
    - Head (y < 520, revised after the owner marked the hair crown, right hair and right jaw): the background is flooded inward from outside the head through pure black (≤ 6), saturated splash (g < 0.55·r, b < 0.35·r, so skin and ears do not qualify) and the artwork's dark-red cut rim. Everything the flood cannot reach is head and stays solid, so dark hair and beard no longer turn into holes. The old cutout is not used above y 520 (its outline sits above the real hairline). The head edge is eroded 2 px, which removes the pink/red cut rim, and feathered 1.2 px; 1–3 px black seams between the jaw and the splash take the neighbouring splash colour (211 px).
    - Everything else, including the waist dissolve (ramp y 920–1030): colour-to-alpha from black (alpha = max channel ÷ 210 for orange, ÷ 140 for blue, colours un-premultiplied). Every black or black-blended pixel therefore becomes transparent or tinted, never dark.
    - No pixels were painted or generated. The one-off scripts lived in the session scratchpad and are not part of the repo.
  - **Schema change:** optional, nullable `profile.heroImage` ("composed hero artwork, used as-is"); `profile.json` points it at the asset. `heroPortrait()` picks `heroImage` → `cutoutImage` (SVG splash + navy shirt tone, round 3) → `image` (masked photo + scrim). Unit-tested.
  - Rendering follows the reference CSS exactly: ≥992 px image `height: 100%; width: auto`, overflow centred (flex) and `max-width: none` (the global `img { max-width: 100% }` otherwise squeezed it at 1024); <992 px banner `width: 125%; max-width: 500px`. No filters, splash SVG or chin shadow are applied to artwork.
  - Measured image box = reference: 1440 → 189,0 1063×900 (ref 189,0 1062×900); 1024 → −19,0 1063×900 (ref −19,0 1062×900); 768 → 500×423 (ref 500×424); 375 → 444×376 (ref 444×376). Title 495,450 450×115 and button 638,595 164×41 at 1440, identical to the reference. (The 44 px vertical offset at 768/375 in the screenshots comes from the capture height 812 vs the reference's 900; the hero is centred in 100vh.)
  - Contrast with text hidden (dark and light identical): title 11.41:1 at the 98th percentile, 10.49:1 at 99.5%, 0.01% of pixels below 3:1; button 12.46:1.
  - Contrast after the revised key: title 11.36:1 at the 98th percentile (0.01% below 3:1), button 12.34:1, dark and light identical.
  - Known limits: in light mode the waist dissolve now fades to transparent (pale blue/orange) instead of dark, so it is lighter than in dark mode; the artwork's thin red rim around the hair is removed by the 2 px head-edge erosion. A transparent export of the same artwork would give an exact light-mode dissolve.
- Contrast deviations (AA): black text on raw-sienna fills (tooltips); light-mode sienna text uses `hsl(24,74%,34%)` (stats numbers, active nav, copyright name).

Verification (this session, production build with a scratch data copy where `activeTheme` = `sienna`, `PORTFOLIO_BUILD_DIR=.next-sienna-build`, `next start` on 3042, Playwright CLI):
- `npm run validate:content`: valid. `npx next lint`: clean. `node --test tests/unit/*.test.mjs`: **270 pass, 0 fail**. `npm run build`: succeeded (`/` static, `/project` static, `/project/[slug]` SSG, `/blog` ISR 1 h).
- Metrics vs reference at 1440×900: hero 900 px, title box 495,450 450×115, button 638,595 164×41, stats section at y 1000 height 333, cards 357×133 — all identical to the reference.
- No horizontal overflow at 1440/1024/768/375 in dark and light; no console or page errors.
- Mode persistence: stored `light` is applied with **all JS bundles held back** (pre-hydration screenshot `artifacts/sienna/2b-prehydration-light.png`); toggling back to dark persists across reload; `aria-pressed` follows.
- Keyboard: first Tab reaches the skip link; mobile menu opens with `aria-expanded="true"`, Escape closes it and returns focus to the toggle.
- Header: solid + hidden on scroll-down, shown on scroll-up; back-to-top visible once scrolled.
- No JS (375): `js-ready` absent, all nav links visible inline, toggles hidden, stats show 7/9/3, nothing hidden, back-to-top visible.
- Reduced motion: 0 running animations, 0 hidden reveal elements, final numbers shown. With motion: 20 animations on load; count-up ends at 7/9/3.

Screenshots (untracked, `artifacts/sienna/`): `2b-{dark,light}-{1440,1024,768,375}-{hero,stats}.png`, `2b-mobile-sheet.png`, `2b-menu-375.png`, `2b-nojs-375.png`, `2b-{dark,light}-1440-scrim-bg.png` (contrast samples), `2b-prehydration-light.png`.

Not verified yet: `/preview/sienna` in a signed-in browser (registry-driven, covered by unit tests); that Coding/Executive pages load no Sienna CSS/JS (planned for the final verification build with default data).

Known issues / risks:
- The cutout is 800 px and is shown at 900 px tall on desktop: slightly soft. Supply a ≥1800 px tall transparent cutout via `profile.cutoutImage`.
- The tonal grade recolors the shirt in the hero only; if the owner supplies a photo with a dark top, the grade can be dropped.
- Stats are computed at build time (static page): the years figure updates on the next deploy/revalidation.
- Pre-existing, not changed: `httpUrl` in `lib/portfolio/schemas.mjs` throws `Invalid URL` (instead of returning a validation issue) when a `mediaReference` string is neither a `/` path nor a URL.

## 2C — about, skills, experience, education, certificates

Created: `themes/sienna/sections.jsx` (About, Skills, Experience, Education + Awards, Certificates, shared `SectionHeading`), `themes/sienna/tech-icon.jsx` (skill tile marks), `themes/sienna/client/skills-tabs.jsx`.
Changed: `themes/sienna/{home.jsx,presentation.mjs,icon.jsx}`, `app/css/sienna.scss`, `tests/unit/sienna-theme.test.mjs` (+4 tests).

Decisions:
- About follows the reference `.about` exactly (grid 1fr 1fr, gap 30, banner max-width 400 / 450 ≥1200, buttons full-width < 768). Title = `about.summary`, text = `profile.longIntroduction`, extra roles via shared `ProfileRoles`. Hire me → `#contact`; Download CV → `resume.url` (Google Drive), only when `features.resume` is on. The portrait is the existing cutout (cream shirt, arms crossed) over a mirrored copy of the original SVG splash; the reference uses a second pose (hand on chin). A second composed About image can be added as data later if the owner supplies one.
- Skills follow `.skills`, `.skills-toggle`, `.skill-card`: 80×80 tiles, radius 12, shadow-1, gap 15, pill 196×45 with the sliding indicator (measured to the content-driven tab width). The two tabs come from `copy.home.skills.groups` (Skills = frontend + backend, 31 tiles; Tools = delivery + AI + uncategorised Figma/jQuery, 21 tiles); `groupSkills()` guarantees every canonical skill appears exactly once. Real ARIA tabs: `role=tablist/tab/tabpanel`, roving tabindex, ←/→/Home/End. Tooltip on hover shows the name and the proficiency level from `skills.proficiency`; screen readers get the same text in an sr-only span. Brand marks: react-icons `si`/`fa`/`tb` plus `simple-icons` (all already installed); monochrome marks use the text colour so they work in both modes. No reference PNGs.
- AA deviation: the active tab text is black on raw sienna (reference: white, 2.7:1).
- Experience (new, same visual language): vertical timeline with raw-sienna dots, cards bg-secondary / radius 12 / shadow-1, role (Poppins), company · location, period "Jul 2022 – Present" (`present` from copy), highlights and technology chips.
- Education & Awards (new): two columns ≥768, icon cards with qualification/institution/years and award/issuer/location/period.
- Certificates (new): the three owner-supplied canonical records, three columns ≥992, status pill, competencies, credential ID and link. No dummy data was added.
- Rotated section labels: at ≥992 a heading block reserves 190 px (label + its 60 px rule measure up to ~185 px), so longer labels ("Certificates") no longer overflow one-line headings. Labels are not reveal-animated: the reveal transform would replace their rotation and make them spin in.

Bug found and fixed: a literal `·` in `sienna.scss` made Sass emit a UTF-8 BOM, which landed mid-file when the theme sheet was concatenated with `form-primitives.scss`; the browser then dropped the whole `.theme-sienna{…}` root rule (transparent background, Inter font, no tokens). The separator is now a drawn dot and a unit test asserts the compiled sheet is pure ASCII and contains the root rule.

Verification (this session, production build with Sienna active on port 3042):
- `npx next lint` clean; `node --test tests/unit/*.test.mjs` **274 pass, 0 fail** (twice).
- Metrics vs reference at 1440: About title 775,y 460×85 (reference 460×85), banner 450×450, skills pill 196×45 (reference 196×45), tiles 80×80.
- No horizontal overflow at 1440/1024/768/375 in dark and light; no console or page errors.
- Tabs: ArrowRight moves selection and focus to Tools and shows only the Tools panel.
- No JS: tablist hidden, both panels shown with their group titles, nothing hidden.

Screenshots (untracked, `artifacts/sienna/`): `2c-{dark,light}-{1440,1024,768,375}-{about,skills,experience,education,certificates}.png`, `2c-dark-1440-skills-{tools,hover}.png`, `2c-nojs-1440-skills.png`, `cmp-2c-{dark,light}.png`, `2c-{dark,light}-1440-lower.png`. Tall element screenshots at 375 px show the fixed header and skip link stitched in; on the live page the skip link is off-screen (bottom −21 px) until focused.

Remaining: 2D works grid + project index/detail + blog, 2E contact + remaining motion + SEO checks, 2F pixel comparison, thumbnail. (2C done.)

Previous remaining list: 2C about/skills/experience/education/certificates, 2D works grid + project index/detail + blog, 2E contact + remaining motion + SEO checks, 2F pixel comparison, thumbnail, CLAUDE.md status.

## 2C review fixes (owner feedback: empty Tools tab, heading overlaps)

- **Tools tab.** Not reproducible in this session's builds (production :3042 and an isolated dev server, 375–1440 px, switching before and after scrolling): all 21 tiles showed. The likely failure is that hidden-panel tiles depended on the shared IntersectionObserver to clear their `data-reveal` pre-state. Now only the first panel's tiles carry `data-reveal`; later panels show at once and fade in as a whole (`sections.jsx` `SkillTile reveal`). Verified: Tools tiles opacity 1 without any reveal class, at all four widths.
- **Section headings.** At ≥992 px the rotated label plus its 60 px rule ran down into the full-width content below it. On Experience it met the timeline spine. It also forced a ~200 px dead gap (`min-height: 190px`). The rotated label now applies only to the side-by-side About and Skills layouts, as in the reference. Experience, Education & Awards and Certificates keep the stacked label with its underline, and their titles can use up to 600 px. The 460 px title cap at ≥1200 px is scoped to About and Skills.
- **Certificate cards** are top-aligned (`align-items: start`) instead of stretching to the tallest card.
- **Skip link** is hidden with a transform instead of `top: -60px`, so stitched screenshots no longer show it. It still appears on focus.
- Verification: `npm run lint` clean; `npm run test:unit` 274/274; production build with Sienna data OK. Playwright checks:
  - No-JS: both panels are shown, with 31 and 21 tiles.
  - Reduced motion: 0 animations; Tools tiles are visible.
  - Keyboard: ArrowRight and Home move between tabs once the page has hydrated.
  - Viewport screenshots: `artifacts/sienna/fix/vp-{1440,1024,768,375}-*.png`, `after.png`.

## Section heading alignment with the reference (owner feedback)

Measured the live demo and Sienna side by side at 1440, 768 and 375 px, checking computed box, font size, line height, weight, family, margins and letter spacing of the subtitle, title, text, buttons and skills toggle. Sizes and fonts already matched; the layout differences were fixed:

- **Heading block.** At ≥992 px every `.sienna-section-content` uses the reference rotated label again (`padding-left: 40px`). The `min-height: 190px` that left a gap under headings is gone. Title max-width follows the reference at every breakpoint: 350, then 380 at ≥550, 430 at ≥768 and 460 at ≥1200.
- **Skills.** The toggle now sits inside the heading block (`.sienna-skills-content.sienna-section-content`), as in the reference markup. At ≥992 the grid is `1fr 1fr`, `align-items: center`, `gap: 50px`; below that, the heading block has a 50 px margin and the toggle is centred. The toggle labels drop to weight 400, as in the reference. The active label stays black instead of white, for AA contrast.
- **About text** uses `about.personalStatement` (603 chars), falling back to `profile.longIntroduction` (978 chars). The reference paragraph is about 490 chars.
- **Experience, Education & Awards, Certificates** (not in the reference) follow its two-column grammar at ≥992. The heading column (rotated label, title, intro) sits beside the content and is sticky at 120 px. New copy keys: `home.experience.intro` and `home.education.intro`, added to the strict schema and `sienna.json`. Inside the right column, education/awards and certificate cards stack in a single column.
- **Measured at 1440:** subtitle, title, text and toggle offsets within About and Skills equal the reference (for example, title 460×85 at section top + 100 px; toggle 196×45 at 30 px under the text). The remaining height differences come from data (a longer About text, 31 skill tiles against 12).
- Verification:
  - `validate:content`, lint, unit tests 274/274, and the production build all pass.
  - No horizontal overflow at 375, 768, 1024 or 1440 px.
  - No-JS shows both panels; keyboard tabs and reduced motion work.
  - Screenshots: `artifacts/sienna/fix/align-{1440,1024,375}.png`.

## Owner review: colours, header, About, compact sections, My Works

- **Colours.** The Sienna tokens already equal the reference values: dark `bg-primary` 12% / `bg-secondary` 19% / text 100% / muted 62%; light 90% / 100% / 12% / 37%. However, the body kept the global colour of the other themes, `rgb(11,14,17)`, which showed around the theme root. `body:has(.theme-sienna)` now paints the reference background in each mode (verified: rgb(31,31,31) dark, rgb(230,230,230) light).
- **Header.** It no longer hides on scroll. It behaves like the reference: fixed, transparent at the top, and a solid `bg-secondary` bar with a shadow once the page has scrolled 10 px. Verified: header top stays at 0 px after scrolling down. This overrides the "header hide/show" item of the original motion brief, at the owner's request.
- **About.** The banner is a new original SVG (`AboutPortrait` in `splash.jsx`): a tall, generated brush stroke with a displaced edge, streaks and drops. The portrait is clipped into it, so the head rises above the stroke and the shoulders end on its painted edge, like the reference composition. A cut-out keeps everything above the chest line; a square photo is clipped to the stroke. `aboutCutout` is derived from `profile.cutoutImage`. The old wide splash, the mask fade and the extra space are gone.
- **Experience / Education / Certificates.** These are full width again (heading block then content), so the empty left column is gone. Each role shows its first 4 points in two columns at ≥992 px. Any further points sit in a native `<details>` disclosure ("Show {count} more" / "Show less"; new copy keys `home.experience.more` and `less`), so they stay readable without JS.
- **My Works (`#projects`)**, after Skills as in the reference:
  - Layout: masonry CSS columns, 1 column, then 2 at ≥550 (intro spans all) and 3 at ≥992 (intro is the first item with a 25 px margin).
  - Cards link to `/project/[slug]`. On hover or focus they show chips with the title and category.
  - Cover images are data-driven (`projects[].image`). None are set today, so the cards use flat-colour covers showing the category and title, with staggered heights (16/10 on phones).
  - Load more: the first 6 cards show, and "Load more work" reveals the next batch and focuses the first new card. The extra cards are hidden only behind `.js-ready`, so the page does not shift on load. Without JS all 9 cards show and the button is hidden.
- **Verification:**
  - Lint clean; unit tests 274/274; production build OK.
  - No horizontal overflow at 375, 768 and 1440 px.
  - No-JS: 9 cards visible, no Load more button.
  - Load more reveals 3 more cards and removes the button; the disclosure opens.
  - Screenshots: `artifacts/sienna/fix/s-{about,works,lower,mob}.png`.
- **Still open:** the `/project`, `/project/[slug]` and `/blog` pages (rest of 2D), contact (2E), card tilt and magnetic buttons, and the admin thumbnail.

## Owner review 2: label overlap, About field, Skills/Works spacing, Load more

- **Rotated label overlap (Experience, Education, Certificates).** The label was absolutely positioned, so on short headings its 60 px rule ran into the content below. It is now a 24 px flow column beside a `.sienna-section-main` wrapper (`display: flex; gap: 16px` at ≥992 px). It uses `writing-mode: vertical-rl` rotated 180°, so it still reads bottom to top, and the rule is a `::before` 20 px below the text. The style is unchanged, but the heading block is now always at least as tall as the label, so following content can never overlap it. Measured at 1024 and 1440 px: every label ends inside its heading block, the content starts 50 px below it, and the main column sits 40 px in (same as the reference). The heading markup now has `SectionLabel` + `.sienna-section-main`; the Skills toggle and the Works intro use the same structure.
- **About background.** The field is redrawn to match the reference: a broad, near-rectangular stroke (x 30–425, y 128–446 of 450) with a left-to-right sienna gradient, short dry-brush spikes on the top and left edges, and background-coloured brush bites on the right and bottom edges. Everything goes through a light displacement filter. The head sits fully above the field; the shoulders sit inside it and end on its ragged bottom edge. The cut-out is drawn at scale 0.66. The field is generated by a scratch script; no reference pixels are used.
- **Skills spacing.** At ≥992 px the heading tops out (`align-items: start`) and is sticky at 120 px, instead of being centred against a 7-row tile grid. This removes the empty band above it.
- **Load more** uses the reference outlined button (`.sienna-btn-primary`), centred 25 px below the grid. It is still hidden without JS.
- **Verification:** lint clean; unit tests 274/274; production build OK; no page errors. Screenshots: `artifacts/sienna/fix2/` (`s1440.png`, `s1024.png`, `s375.png`, `about-z.png`, `skills-works.png`, `final.png`).

## Owner review 3: About background

The About field was redrawn again from a close study of the reference's shape language. The path is generated by a scratch script; no tracing or reference pixels are used. It is a rounded block, narrower at the top and full width at about 55 % of its height, roughly 1.25 : 1 like the reference:
- **Sides:** horizontal dry-brush streaks. Dark streaks bite in up to about 80 px on the left and 60 px on the right, paint tongues stick out, and the streaks bunch in clusters along each edge.
- **Top edge:** wavy, with a few tall flicks.
- **Bottom:** a ragged band rising about 40 px from left to right, with thin diagonal strokes and small paint chunks below it.
- **Inside:** dark wisps near both side edges. The shape goes through a horizontally stretched displacement (`baseFrequency .12 .02`, scale 5).
- **Gradient:** left to right, hsl(24 82% 60%), then hsl(19 90% 54%), then hsl(13 95% 47%).
- **Cut-out placement:** scale 0.6, centred. The head is above the field; the shoulders sit about 50 px inside each side. The straight bottom edge of the source image sits below the field, so it never shows.
- **Light mode:** the dark marks use `--bg-primary`.

Verified: production build, no page errors, unit tests 274/274, lint clean. Screenshot: `artifacts/sienna/fix2/about-final.png` (reference, dark, light, 375 px).

## Owner review 4: About background, closer original match

The owner chose to keep an original drawing rather than copy the unlicensed reference art, matched as closely as possible. The field is regenerated by a scratch generator, picking seed 63 from several candidates; it is not traced from the reference. Changes from the previous version:
- **Corner:** a diagonal cut over the top-right corner, with dry strokes trailing off it.
- **Sides:** chunky background-coloured wedges instead of hairline streaks, plus small notches and paint tongues. The right edge is rougher than the left, and there are thin wisps along the right edge.
- **Bottom:** a ragged band rising 44 px to the right, with upward chunks, paint fringes below it, and diagonal strokes reaching over the shirt.
- **Shape:** the top of the field is at mouth level, with a narrow top and a rounded bottom-left corner.
- **Portrait:** scale 0.62, with the shoulders about 50 px inside each side.
- **Filter:** displacement `baseFrequency .2 .05`, scale 6.

I also tried a version built from stacked horizontal brush strokes and rejected it: it read as a comb.

Verified: lint clean, unit tests 274/274, production build OK, no page errors. Screenshot: `artifacts/sienna/fix2/about-final2.png` (reference crop, dark, light, 375 px).

## 2D — project index, project detail, blog, résumé preview

- **`/project`** (`projects.jsx`): the home My Works masonry without a batch limit. The heading is the first item, with an h1 title.
  - `works.jsx` now exports `WorkList` (heading item + cards, with an optional batch and Load more) and `WorkCover` (project image or flat-colour cover).
  - Cards use `next/link`.
  - The Load more list id comes from the heading id.
- **`/project/[slug]`** (`project.jsx`): a back link, then the heading block with a rotated label. The label is the category, or "Project details" when there is none.
  - h1 title, short description, and Visit (secondary) and Source (primary) buttons when the links exist.
  - Cover at the side (4:3 flat cover in the grid's tone for that project, or `project.image`).
  - Body: overview, problem / solution / outcome, then features / responsibilities via `themes/shared/project-detail.mjs`, styled as the timeline points.
  - Sticky aside card with role and stack chips (`aria-label` from `projects.technologiesLabel`).
  - At ≥992 px the head is 1fr 1fr and the body 2fr 1fr.
- **`/blog`** (`blog.jsx`) and the home teaser (`writing.jsx`, `#writing`, which the "Blog." nav entry targets):
  - Article cards (dev.to via `lib/articles.mjs`, or manual entries) in a 1 / 2 / 3-column grid. Each card has a cover, date and reading time, title, description and an external cue.
  - The whole card is clickable through the title link's overlay, with a focus ring on the card.
  - Loading uses a Suspense fallback; empty or unavailable states show the copy plus the DEV profile button.
  - The teaser shows 3 articles and a "Read all articles" button, and is gated by `features.articles`.
- **Résumé preview** (`Resume` in `sections.jsx`): a card with the document title, "Open Resume" and an embedded preview from `themes/shared/resume-preview.mjs`, plus the fallback note. It is gated by `features.resume`.
- **Home order:** hero, stats, about, skills, works, experience, education, certificates, résumé, writing.
- **Copy:** only existing keys are used (`home.resume`, `home.writing`, `project`, `projects`, `blog`, plus shared `projectDetail`, `contentSections.resume`, `blogLoading`). The copy scanner allowlists `"UTC"` (the Intl time zone) in `writing.jsx`.
- **Verification:**
  - Lint clean; unit tests 274/274; production build OK (`/project/[slug]` static, `/blog` ISR 1 h).
  - Playwright on `/`, `/project`, `/project/mis-nexis` and `/blog` at 1440 dark, 768 light and 375 dark: exactly one h1 per page, no horizontal overflow, no console or page errors.
  - The index shows all 9 cards with no Load more; the home résumé iframe is present.
  - dev.to returned 1 article and its cover loads (natural width 1000).
  - Screenshots: `artifacts/sienna/2d/`.
- **Not verified:** the signed-in `/preview/sienna/project` and `/preview/sienna/blog` routes (they need an admin session), and the Google Drive embed loading inside headless Chromium.
- **Remaining:** 2E contact (shared contact form), card tilt and magnetic buttons, SEO/noindex checks; 2F pixel pass, admin thumbnail, cross-theme isolation check, final report.

## 2E — contact, pointer effects, SEO and preview checks

- **Contact** (`contact.jsx`, `#contact`), following the reference `.contact` layout:
  - Heading block (label "Contact", `contact.heading`, `contact.introduction`), the availability line, then a details list: address (`<address>`), phone (`tel:` link) and email (`mailto:` link), with outline icons.
  - Social circles with tooltips, plus a form card holding the shared `ContactForm`.
  - Form card style: Poppins labels, `--input-bg` fields with 12 px radius, and a full-width inverted submit button. The focus ring is scarlet and errors use `--scarlet`.
  - Breakpoints as in the reference: the form is capped at 450 px at ≥768 and sits in a 1fr 1fr grid at ≥992, with the details list pulled under the label column.
  - The form needs both `features.contactForm` and `contact.form.enabled`; the details stay visible without it (single column). No new copy keys.
- **Pointer effects** (`client/motion.jsx`), only with hover and a fine pointer, motion on and no reduced-motion preference:
  - Project cards tilt up to 6°; `.sienna-btn` elements drift up to 6 px toward the pointer.
  - One delegated passive `pointermove` listener, throttled with rAF, writing inline transforms only. They reset on leave and on cleanup.
  - CSS eases the transform only inside the motion gate.
- **SEO:** the routes already render the JSON-LD (2 blocks on `/`, `/project`, `/project/mis-nexis` and `/blog`). Public pages carry no robots meta.
- **Verification:**
  - Lint clean; unit tests 274/274; production build OK.
  - Contact at 1440 dark, 768 light and 375 dark: 3 details, 7 social links, form present, no overflow.
  - An empty submit focuses `#contact-name` and shows 3 errors (nothing is sent).
  - Tilt gives `perspective(800px) rotateX(2.4deg) rotateY(2.4deg)` and magnet gives `translate(5.4px, 0.1px)`; both clear on leave and are off under reduced motion.
- **Preview (signed in with a throwaway local admin hash):**
  - `/preview/sienna`, `/preview/sienna/project`, `/preview/sienna/project/mis-nexis` and `/preview/sienna/blog` all return 200 with `noindex, nofollow, nocache`, `data-theme-id="sienna"`, one h1 and no overflow.
  - The hash was created in the session scratchpad and deleted afterwards. The server was run from a scratch directory without `.env*`, because `next start` loaded the repo's `.env.local` admin values over the passed environment.
- **Known console noise:** the Google Drive résumé embed requests `youtube.googleapis.com`, which fails certificate validation inside the test browser. This is external to the theme.
- Screenshots: `artifacts/sienna/2e/`.
- **Remaining (2F):** pixel comparison pass, admin thumbnail (`public/theme-thumbnails/sienna.webp` + theme-guide entry), cross-theme CSS/JS isolation check, final verification and report.

## 2F — comparison pass, thumbnail, isolation, final verification

### Comparison with the reference (measured, dark, 1440 / 1024 / 768 / 375)
These elements were measured against the stored reference metrics (`sienna-reference/measurements.json`): container, logo, nav link, theme button, hero title and button, stats card/icon/title, section subtitle/title/text, About banner, toggle, skill card, project card, Load more, contact form, input and footer.

Remaining differences are intentional or come from data:
- **Logo width:** "Inzamam." is longer than "Jack.".
- **About text height:** a longer paragraph.
- **Project card heights:** data-driven flat covers.
- **Section label box:** now includes its rule (flow layout that fixes the overlap; it looks the same).
- **Load more:** an outlined button, at the owner's request.
- **Active nav link:** highlighted (motion brief).
- **AA colours:** active tab text black, light-mode accent ink.

Fixed in this pass:
- The contact form keeps the reference 450 px cap at ≥992 px (it had stretched to 550).
- Form inputs now match the reference: `line-height: normal`, `10px 10px 10px 40px` padding (39 px tall), sienna-ink text, and the reference field icons (Ionicons person-circle, mail and chatbubbles, MIT, already installed via `react-icons`). The icons are drawn as CSS masks so they follow the palette and turn sienna on focus.

### Admin thumbnail
`public/theme-thumbnails/sienna.webp` (800×500, 31 KB) is a 1280×800 dark hero capture, the same framing as the other thumbnails. It is listed in `THUMBNAILS` in `app/admin/theme/theme-guide.jsx`.

### Cross-theme isolation
A second production build with the real data (`activeTheme: coding`, `PORTFOLIO_BUILD_DIR=.next-iso`) was compared with the Sienna data build on `/`, `/project`, `/project/mis-nexis` and `/blog`.
- **CSS:** each page links only its own theme sheet (`coding.*.css` or `sienna.*.css`). There is no Sienna markup on Coding pages.
- **JS:** neither theme's pages load Three.js (`WebGLRenderer`) or GSAP.
- **Known limitation:** Sienna's small client islands (header, colour toggle, motion, tabs, Load more) sit in the shared chunk `135-*.js`. That chunk was already shared by the Creative, Prism and Spatial islands, so it loads on every theme's pages. This comes from how the registry's lazy theme slots are bundled; it is not new to Sienna and not changed here.

### Final verification (this session)
- **Static:** `npm run validate:content` passed; `npm run lint` clean; `npm run test:unit` 274/274; `npm run build` OK with both the Sienna data copy and the real data.
- **Overflow:** none on `/`, `/project`, `/project/mis-nexis` or `/blog` at 375, 768, 1024 and 1440 px, in dark and light.
- **Colour toggle:** dark becomes light, `localStorage["sienna-color"] = "light"` and `aria-pressed` updates. After a reload with all JS bundles blocked, the page still renders light, so the pre-paint script works and there is no flash.
- **Keyboard:** the first Tab stop is the skip link.
- **Mobile menu (375):** `aria-expanded` is true, the body scroll is locked and Tab stays inside the header. Escape closes it and returns focus to the toggle, and following a link closes it.
- **Skills/Tools tabs:** ArrowRight moves to Tools and shows its panel. Project card focus shows a solid outline.
- **Reduced motion:** no running animations, and the counters show their final values (7, 9, 3).
- **No JS:** no element is hidden by reveals, all 9 cards show, both skill panels show, the tab bar is hidden, and the contact form and final counters are present.
- **Preview (2E):** all four `/preview/sienna/*` routes are noindex and render Sienna.
- **Activation and commits:** the public active theme is still `coding`; Sienna was not activated. No commit or push.

### Files (Phase 22)
- **New theme:** `themes/sienna/` — `view.mjs`, `presentation.mjs`, `stats.mjs`, `color-script.mjs`, `shell.jsx`, `home.jsx`, `sections.jsx`, `works.jsx`, `writing.jsx`, `contact.jsx`, `projects.jsx`, `project.jsx`, `blog.jsx`, `splash.jsx`, `icon.jsx`, `tech-icon.jsx`, and `client/{header,color-toggle,motion,skills-tabs,load-more}.jsx`.
- **New styles, copy, assets and tests:** `app/css/sienna.scss`, `portfolio-data/settings/copy/sienna.json`, `public/inzamam_profile-hero.webp`, `public/theme-thumbnails/sienna.webp`, `tests/unit/sienna-theme.test.mjs`.
- **Registration and schema:** `lib/themes/{ids,registry,stylesheet-sources}.mjs`, `lib/portfolio/{copy-schemas,documents,schemas}.mjs` (optional `profile.cutoutImage` / `profile.heroImage`), `portfolio-data/content/profile.json`, `app/admin/theme/theme-guide.jsx`.
- **Tests updated** for the 7th theme and 25th document, plus the copy-scan allowlist.
- **Docs:** this file, `phase-22-sienna-plan.md`, `CLAUDE.md`, `.gitignore`.
- **Screenshots:** `artifacts/` is committed with only the files the phase docs name by file or pattern; directory-only references (for example `sienna/2d/`, `sienna/2e/`) were pruned.

### Risks and open items
- **Content-store tests:** they cover the 25-document registry, but the GitHub store was still only exercised against a mocked API.
- **Google Drive embed:** the résumé preview depends on Google; inside headless Chromium its YouTube API request failed certificate validation (external).
- **Local admin env:** `next start` in this checkout loads the admin values from `.env.local` over the process environment, so local signed-in testing with other credentials needs an env-free working directory (see 2E).
- **Optional fields:** `profile.cutoutImage` and `profile.heroImage` are optional additions. `httpUrl` rejects relative strings for other media fields; this is a pre-existing schema behaviour and was not changed.
