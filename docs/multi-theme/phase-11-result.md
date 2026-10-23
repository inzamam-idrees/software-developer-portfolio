# Phase 11 — Prism theme and canonical certificates

Date: 2026-10-22
Status: **Implemented with owner-authorized local commits; not pushed.** Public active theme remains `coding`.
Plan: `docs/superpowers/plans/2026-10-22-prism-theme.md`.

## Design and implementation

Prism is the fifth available theme. It recreates the approved reference's portrait-led split hero, typography scale, pill navigation, active section indicator, scroll progress, floating badges, glass cards, two-row skills marquee, category filters, featured-project carousel, quick-preview dialog, mobile drawer, entrance motion, hover glow, tilt and magnetic buttons. Existing professional content and the approved omissions necessarily change the reference's section lengths and wrapping. This is an independently authored implementation, not a pixel-identical copy of the original person's portfolio.

Reference reviewed at commit `37461b2a440a6a6d46803f9eb7b535de8a429c98`:
- [Repository](https://github.com/VINNU7890/Personal-portfolio-website-)
- [Live design](https://personal-portfolio-website-pi-virid.vercel.app/)

No reference code, portrait, resume, font file or branding was copied. No package or lockfile changes. Google font **Space Grotesk** uses `next/font/google`, `display: swap`, `preload: false`, scoped to Prism, matching the repository's theme-font approach. The existing root Inter remains the body font. No new dependency, GSAP, Three/Fiber, Lenis or Framer Motion is used by Prism.

The hero uses the existing portrait, resume link, experience label, focus label, introduction and designation. The optional canonical `profile.roles` array drives Prism-only rotation when it contains multiple titles. Initially only the primary designation was seeded; subsequent profile edits added two titles, which were preserved. Additional roles can be entered in `/admin/content/profile`; no role claims are inferred from the tagline. Native name scrambling and role timing are documented in the fidelity audit’s hero follow-up.

Unsupported credentials, learning progress, audience/challenge metrics, counters, WhatsApp, resume update date remain omitted. Awards remain a separate, correctly labeled section. Actual canonical articles replace the reference's community challenge. Experience and education remain complete.

## Architecture and changed files

- `themes/prism/{shell,home,projects,project,blog}.jsx`: all five lazy slots, including real individual project pages.
- `themes/prism/{view,presentation}.mjs`: canonical projection, navigation and skill grouping; no factual content store.
- `themes/prism/{articles,heading,icon,project-content}.jsx`: theme-owned presentation. Shared contact form and pure project-detail helper are reused; no imports from another theme.
- `themes/prism/client/{controls,navigation,dialog,skills,projects,contact-channel}.jsx`: native interactions with observer/animation cleanup, optional localStorage preferences, native scrolling and clipboard feedback.
- `lib/themes/{ids,registry,stylesheet-sources}.mjs`: Prism appended in the same order; compiled stylesheet stays out of the Next CSS graph.
- `lib/themes/create-view.mjs`: certificate data is exposed only to Prism; other theme views omit it.
- `app/css/prism.scss`: scoped layout, glass surfaces, motion and both palette maps. The existing `form-primitives.scss` compiles into Prism's sheet before the theme overrides.
- `portfolio-data/settings/copy/prism.json` and `lib/portfolio/copy-schemas.mjs`: strict visible-copy tree, merged with shared copy through `view.copy`; templates use `formatCopy`.
- `portfolio-data/content/certificates.json`, `lib/portfolio/{schemas,documents}.mjs`: new strict canonical document. `documents.mjs` is already the loader/editor/store manifest, so no parallel manifest was added and `loader.mjs` needed no change. `canonicalPortfolioSchema` includes certificates. Total documents: 23.
- `app/admin/theme/theme-guide.jsx`: Prism purpose and original schematic thumbnail. Registry availability automatically adds preview/activation choices.
- Unit coverage: new `prism-theme.test.mjs`, `prism-contrast.test.mjs`; extended registry, stylesheet, content isolation, copy, preview, document, store and loader fixtures. Copy scanner recognizes `Tab` as a keyboard identifier, with no Prism visible-copy exceptions.
- `tests/browser/prism-{acceptance,accessibility,certificates}.js`: local reproducible browser checks.
- `CLAUDE.md`, `README.md`, Phase 3 architecture/result, the historical Spatial spec/plan and SEO project-page plan: current five-slot contract clarified without rewriting historical results.

The pre-existing theme-settings test expected Cinematic while bundled data already selected Coding. Its assertion and title now reflect the existing Coding setting; the setting itself was not edited.

## Palette and contrast

Edit the `$prism-dark` and `$prism-light` maps at the top of `app/css/prism.scss`. Every theme color comes from these maps. Light mode uses its own token values, not inverted dark styles. Glass panels now use a 65% dark / 75% light surface blend over the theme background.

| Token | Dark | Light |
|---|---|---|
| Background | `#130e10` | `#fff8f1` |
| Surface | `#21181b` | `#fffdfa` |
| Elevated surface | `#2c2023` | `#f3e6dc` |
| Main text | `#fff5ed` | `#302019` |
| Muted text | `#c7b6ad` | `#6e5148` |
| Terracotta accent | `#f3a987` | `#92412b` |
| Rose | `#f6a6b6` | `#943d55` |
| Gold | `#e6cf91` | `#746020` |
| Control border | `#a17e74` | `#95746a` |
| Focus ring | `#ffe0a0` | `#754000` |
| Button gradient | `#963346` → `#86401e` | `#963346` → `#86401e` |
| Button text | `#ffffff` | `#ffffff` |
| Error text | `#ffc4b5` | `#a12828` |

Unit contrast checks use the WCAG relative-luminance formula. Text and text-gradient endpoints/intermediate samples are checked against all three surfaces at 4.5:1; icon accents share those colors. Focus rings and control boundaries are checked at 3:1. Button text is checked along its gradient. Lowest foreground ratios across surfaces:

| Foreground | Dark | Light |
|---|---:|---:|
| Main text | 14.60 | 12.75 |
| Muted text | 8.01 | 5.85 |
| Accent/icons | 8.10 | 5.70 |
| Rose | 8.26 | 5.61 |
| Gold | 10.24 | 4.99 |
| Focus | 12.27 | 6.89 |
| Control border | 4.30 | 3.44 |

Gradient checks sample 21 points per segment. Automated browser auditing additionally covers rendered mobile/desktop light/dark home pages. This is local evidence, not a claim of exhaustive accessibility certification across every device and state.

## Motion and access

- The native cursor is always retained. Its decorative ring has `pointer-events: none`, and is disabled for coarse/touch pointers, reduced motion and explicit motion pause.
- Marquees pause on hover/focus and through the global motion control. With JavaScript disabled or reduced motion, both rows wrap into static readable lists.
- Entrance effects animate only intersecting content; SSR starts visible. Preferences can change during a session. Observer, pointer and animation resources are cleaned up.
- Native dialogs add an explicit forward/reverse Tab trap, Escape, initial focus, focus return, background inertness and body scroll locking. Every project preview includes a link to its real detail route.
- Mobile navigation has a semantic no-JavaScript details fallback. Its enhanced drawer closes when following a preview anchor.
- Client navigation stays within private preview routes; public activation was never exercised or changed.
- Contact retains the existing real validation/API flow; direct email and phone links stay readable without JavaScript. No reference simulated-success behavior was ported.

## Certificates: canonical owner-editable records

The initial records were explicit placeholders; the owner has since supplied certificate records. A placeholder notice appears only while TODO titles remain. Other themes neither receive certificate records through their views nor render these placeholders.

Replace them at `/admin/content/certificates` (or edit `portfolio-data/content/certificates.json`):
1. Keep or replace each stable, unique lowercase/hyphenated `id`.
2. Replace `title` and `issuer` with verified details.
3. Optionally supply `issuedDate` as `YYYY-MM-DD`, HTTP(S) `credentialUrl`, `credentialId`, `image` (local public path or permitted HTTP(S) asset), and boolean `featured`.
4. Leave absent optional facts omitted; do not supply empty strings, invented dates or verification statuses. `featured` is stored metadata; this version displays all supplied certificates in document order.
5. Set the whole array to `[]` to hide both the section and its navigation item.
6. Run `npm run validate:content` after file edits. Admin saves validate the document and the assembled portfolio automatically.

Certificate images use an unoptimized Next Image so valid external image URLs do not require new global host configuration. Owners remain responsible for asset rights and external availability.

## Initial implementation verification (historical)

- `npm run validate:content`: pass.
- `npm run test:unit`: **223 tests, 223 pass, zero fail** after review fixes. Includes `no-hardcoded-copy`, strict certificates/copy, theme isolation and palette checks.
- `npm run lint`: pass, no ESLint warnings/errors. Next emits its existing lint-command deprecation notice.
- `PORTFOLIO_BUILD_DIR=.next-prism-build npm run build`: **pass**, including a final rebuild after the motion and accessibility fixes. Public project routes remain static/SSG; preview routes remain dynamic.
- `git diff --check`: pass.
- Authenticated preview acceptance: home, `/project`, `/blog` at 390, 768, 1280 and 1536px; 24 light/dark viewport screenshots. Modal carousel, filters, drawer, Escape/focus return, reduced motion, no-JS full featured-project list, certificate editor, other-theme isolation and unchanged Coding public route passed. No page errors or downloaded heavy runtime signatures during Prism checks. Final complete rerun also passed, including home → project archive → home marquee lifecycle regression.
- Certificate admin save on the temporary content copy: pass; malformed credential URL rejected with 422, `[]` saved with 200 and hid section/navigation, three placeholders restored with 200.
- Axe WCAG 2 A/AA, 2.1 AA and 2.2 AA tags: **zero violations** at 390 and 1280px, both light/dark modes.
- Independent review found one animation lifecycle bug: reveal cleanup also canceled CSS marquee animation during client navigation. Reproduced with running animations dropping 1 → 0; fixed by tracking only reveal handles. Regression now gives 1 → 1; reviewer approved the targeted fix. The modal's forward Tab escape was also caught and fixed during browser verification.

Browser runs use a temporary `/tmp/prism-review-data` copy, test-only admin credentials, port 3025 and isolated `.next-prism-review` output. Real content files are not written by browser tests. Screenshots/logs live under `/tmp/prism-*` for this session and are not committed assets.

## Risks and remaining work

- Certificate facts and URL availability are supplied by the owner; unknown metadata remains empty.
- Live contact delivery and a deployed hosting environment were not tested; local browser checks do not send messages.
- Manual Safari/Firefox, screen reader, real touch-device and live-deployment verification remain unverified. Automated contrast/axe checks supplement, rather than replace, these checks.
- External article and resume availability depends on the existing providers. The article empty/unavailable fallback remains available.
- Reference fidelity is close in layout and interaction vocabulary, but not pixel-identical: your content, approved omissions, added career/education sections, confirmed role data, accessible motion controls and corrected light contrast affect the presentation.
- No implementation phases are intentionally deferred. No new dependencies, public activation, commits or pushes were performed.


## Reference-fidelity follow-up

The section-by-section 1280px/390px comparison, full difference inventory, corrections, intentional exceptions and fresh verification results are recorded in [phase-11-fidelity-audit.md](phase-11-fidelity-audit.md). This supersedes the initial presentation measurements above.

## Hero animation follow-up

The hero follow-up adds optional validated profile roles, native pure-state typing, corrected name glyph timing, stable sizing, and accessible static fallbacks. Full checks passed: canonical validation, 226 unit tests, lint and isolated production build; hero browser checks passed at 1280/390 and all four dark/light axe scans reported zero violations. See the fidelity audit’s hero follow-up for exact reference values, timed samples, fixture setup and the intentional moving-dot difference. The initial single designation seed was subsequently updated externally with two additional titles; those profile edits were preserved. Further confirmed titles can be added in the profile editor.

## Certificate card follow-up

Prism’s certificate cards now follow the reference hierarchy: 40px icon/issuer/year header, optional status pill, title/description, competency chips, and a separate “View certificate” action. Desktop retains two columns with a 24px gap; mobile uses one column. Existing palettes, motion controls and canonical facts remain intact.

Optional strict certificate fields `description`, `competencies` (up to 20 unique non-empty strings), and `status` (`in-progress`, `completed`, `verified`) are editable in `/admin/content/certificates`. Existing `issuedDate`, `credentialId`, `image`, and HTTP(S) `credentialUrl` remain supported. Dates display their known year in the header. Status is never inferred from an issuer or URL. A “View certificate” link opens the exact supplied credential URL in a new tab with `noopener noreferrer`; absent URLs create no fake action. The owner’s current records supply title/issuer only; URLs and additional factual metadata have been requested, not invented.

Verification: canonical validation, 227 unit tests, lint and isolated build passed. Temporary fixture browser checks passed at 1280/390 for grid, description, chips, status, safe link attributes, missing-link behavior and overflow; the fixture was restored afterward. Final axe result recorded in the fidelity audit. No commit or push.

Certificate JSON editing: each existing record now explicitly lists `description`, `competencies`, `status`, `issuedDate`, `credentialUrl`, `credentialId`, and `image`. Unknown scalar metadata uses `null`, and competencies use `[]`; these values render no fabricated details. Replace them with confirmed data. Status accepts `in-progress`, `completed`, or `verified`; dates use `YYYY-MM-DD`; credential links must use HTTP(S). Explicit null metadata is tested while invalid URLs/blank populated text remain rejected. Validation, 227 unit tests, lint and isolated build passed after this change. The current temporary development preview mirrors canonical certificate file changes; no commit/push.

## Embedded resume follow-up

Prism now embeds the current canonical Google Drive résumé using its Drive preview URL, while “Open Resume” keeps the existing Drive view link. The native lazy iframe has a copy-backed accessible title, responsive dimensions, viewer header and fallback guidance; it works without client-side viewer code or a new dependency. Unit URL-conversion tests, actual Drive content loading at 1280/390, content validation, 228 unit tests, lint and isolated build passed. No public-theme activation, commit or push.

## Final cleanup and local commit verification

Removed unused certificate date-label copy and empty layout wrappers; the typewriter now uses its named timing constants rather than duplicate numeric delays. Retained the focused components and regression tests because they are used by the theme and verification. Updated stale placeholder/commit documentation. Owner profile/certificate edits are preserved. No generated output, temporary fixtures, screenshots, environment files or dependencies are included in the commits. Public theme remains Coding. Final verification: `validate:content` passed; **228 unit tests passed, 0 failed**; lint passed; isolated production build passed. Actual Drive viewer checks passed at 1280/390. Axe scans passed at 390/1280 in light/dark with zero host-page violations. `git diff --check` passed. Removed the inactive `.next-prism-build` verification output after the successful build; kept the active preview output. Local commit authorized by the owner; no push.

## Subsequent content parity

Phase 12 supersedes the original Prism-only certificate visibility: all five themes now consume canonical certificates and shared optional content sections. See [phase-12-content-parity-result.md](phase-12-content-parity-result.md).
