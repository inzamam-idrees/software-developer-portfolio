# Phase 16: Executive polish plan

2026-10-26. Preserve Phase 15's cool-paper/ink/indigo, local Inter fonts, role-led
hero, career guide and project rows. No other theme, canonical facts, active setting,
registry, SEO, handler or dependency changes. Copy/schema changes are Executive-only.

## Before review

Reviewed authenticated Executive home at 375, 768, 1280 and 1536 px in light/dark.
Evidence: artifacts/portfolio/phase16/before-{scheme}-{width}.png and section crops.
At 1280×960 the theme is 10,701 px tall in both schemes.

1. Rhythm: identical ground and horizontal rules make every section a similar stop.
2. Career: the first role has six equal-weight paragraphs; all nine technologies show.
3. Certificates: all three titles are present, but uniform stretched card heights leave
   the two sparse records mostly blank; optional metadata varies considerably.
4. Space: 96px section padding doubles at adjacent boundaries; standalone education
   and awards each take 614px at 1280. The biography occupies another 707px.
5. Expertise: tiny numeric proficiency text interrupts reading each technology.
6. Resume: the 1,194px section contains a large white viewer, open by default.
7. Bio: the hero already uses shortIntroduction, but there is no sentence limit in the
   view layer; full biography interrupts the flow between projects and expertise.
8. CTA: career ends with technologies and no immediate contact action.

## Changes per finding

Four chapters: career/identity on paper; projects on a subtly lifted ground; expertise
and background on paper; writing/resume/contact on the lifted ground. Use full-width
surface bands with constrained text, no shadows, gradients, numbers or decorative
chapter labels. Projects stay rows; expertise uses grouped rows; background combines
biography followed by parallel education/recognition columns; closing content uses a
compact document panel and existing contact layout.

Retain palette: paper #F6F7F9 / #181A20; ink #14181F / #F2F4FA; indigo #3B4CCA /
#A9B5FF; secondary #525D6D / #B4BDCF. Add chapter surface #EEF0F5 / #20232B and
certificate surface #FFFFFF / #2A2F3B. Keep the existing type families and scale.
New fluid section-space token: clamp(44px,5vw,64px), replacing 96px desktop and
64px mobile (roughly one third shorter). Reduce internal biography/background gaps.

Career renders first three canonical highlights. Emphasize the first as the lead,
without repeating it or inventing outcomes. Remaining highlights go into native
closed details with their count. Show eight technologies in canonical order and put
any remaining tags in a native +N disclosure. End career with existing contact copy.

Replace shared certificate presentation only for Executive: title-first, issuer,
optional full date, textual status, then existing description/competencies/credential
metadata and verification action if supplied. Use content-height cards aligned at
start, not stretched empty tiles. Filter unusable placeholder/empty records in the
Executive view before deriving certificate navigation. Empty results hide section/nav.

Remove visible proficiency numbers; keep existing categories and descriptions because
proficiency is not evidence of daily-use frequency. Derive hero positioning from at
most two canonical short-introduction sentences (fall back to long introduction).
Keep full introduction and profile roles in the Background chapter. Preserve legacy
education/awards anchors inside the combined Background section; merge their nav
entries into one Background link, respecting visibility settings.

Resume becomes a compact summary, canonical update metadata when available and the
existing document URL for download/open. Native closed details mount the iframe only
after opening when JavaScript is enabled; a native lazy iframe inside noscript keeps
preview available without JavaScript. Test that no viewer request occurs while closed.

New copy: home.experience.responsibilities (count template), moreTechnologies (count
template), home.background.heading, resume.summary/download/open/preview/updated,
certificates.issued/verify. No handwritten professional facts in UI code.

## Wireframe

[paper: role hero + sticky career / three bullets / disclosure + contact]
[lifted: projects heading across width; compact expandable project rows]
[paper: expertise grouped rows]
[paper: full biography / Background education | recognition / certificates]
[lifted: writing / compact resume details / contact]
Mobile: same order; background columns stack and all summaries wrap naturally.

## Critique and revision

Avoided turning four chapters into four giant rounded cards: the tone bands span the
page and have no shadow or box frame. Avoided new chapter eyebrows or numeric labels.
Kept career as the sole scroll-led moment and removed the existing skill-row scroll
animation. Rejected “daily use” labels because canonical proficiency does not encode
frequency. Certificate metadata gaps stay absent, not padded with invented values.
Use native disclosure markers and clear count wording rather than icon-only controls.

## Verification

Run requested content/CSS/lint/unit/build commands. Capture the 72-case home/project/
blog, four-width, two-palette standard/no-JS/reduced matrix, plus full page/career at
390px. Test all new disclosures by keyboard and with JavaScript disabled, viewer
network deferral, empty certificate fixture, anchors, motion preferences, small-text
composited contrast and 1280px page-height change. Attempted Playwright Firefox:
missing firefox-1553 executable; no non-Chromium engine is currently installed in
Playwright's cache. Keep the observer fallback and report that limitation.

## Verification-driven refinement

The initial no-JavaScript iframe loaded before disclosure despite loading=lazy in
Chromium. Replaced that fallback with an explicit Load preview link targeting a
source-less named iframe inside noscript. No external viewer is requested while
closed; without JavaScript opening details offers that native load action. With
JavaScript, opening details still mounts the viewer automatically.
