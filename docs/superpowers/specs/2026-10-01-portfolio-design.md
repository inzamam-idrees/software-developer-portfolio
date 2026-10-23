# Portfolio audit and proposed redesign

Status: approved by the user on 2026-10-01 as the basis for implementation planning. Application code has not been changed.

## Purpose

Turn Inzamam Idrees's existing portfolio into a premium, cinematic, scroll-driven demonstration of frontend engineering. Recruiters and prospective collaborators should quickly understand his role, selected work, engineering breadth, and how to contact him. Preserve factual content and existing routes; animation and WebGL must be optional enhancements.

## Repository audit

- Next.js 15.1.1 App Router, React 19, JavaScript with alias configuration. Installed Tailwind 3.3.3, Sass 1.69.5, ESLint 9.18.0. Manifest uses `latest` for several build dependencies even though the lockfile currently resolves compatible versions.
- `app/layout.js` owns Inter via next/font, navigation, footer, notifications, scroll-to-top, and Google Tag Manager. `app/page.js` is a client component that dynamically imports every section with SSR disabled and fetches randomized DEV articles on mount.
- Routes: `/`, `/project`, `/blog`, not-found; API routes `/api/contact`, `/api/google`, `/api/data`.
- Homepage components: hero, about, experience, skills, projects, education, blog, contact. Styling combines Tailwind utilities, global Sass, and a separate glow-card stylesheet.
- Existing animation: looping Lottie illustrations, react-fast-marquee, CSS effects, and pointer-driven glow cards. No GSAP, Lenis, Three.js, Fiber, or Drei installed.
- Content is separated into `utils/data`: personal details, eight projects, three career positions, education, and skills. Reuse these sources. Contact details are duplicated in a second file.
- Assets: portrait variants, many skill SVGs, template project/experience/education illustrations, Lottie JSON, and sample imagery. Public assets total approximately 11 MB; some photos and the GIF are several MB. No asset-to-current-project mapping is documented.
- SEO: title misspells Engineer; description is generic. No robots, sitemap, canonical, social metadata, or Person structured data files found. README mentions a Netlify URL, but production origin must be verified before canonical configuration.
- Accessibility: mobile navigation is visually hidden without a toggle and retains focusable links; navigation removes outlines; several icon controls lack accessible names; form labels have no associated IDs; no skip link or reduced-motion handling. Only the hero uses a heading; section titles are mostly spans or paragraphs.
- Contact form uses an environment-based API origin rather than a same-origin path, has no semantic form wrapper, and relies on toast feedback. Server handler lacks input validation and HTML escaping. Existing delivery configuration must be preserved; live messages must not be sent during QA.
- `/blog` depends on an external API without an empty/error fallback. Project links must be rendered only where actual URLs exist. The unused SingleProject component expects a different data schema; do not adopt it as-is.
- Performance risks: every section requires client JavaScript before content appears; large looping illustrations and continuously moving skills compete for attention; one document pointer listener per glow card performs layout reads; all skill images are imported by the image helper.

## Baseline verification

Read-only audit completed before any application changes. `npm run lint` passed with no warnings or errors. No test or typecheck script exists.

Playwright CLI inspected the local development site at 1440×900 and 390×844. Initial navigation produced a syntax error and showed only the shared shell; after refresh, content rendered with no console errors. The initial failure's cause is unconfirmed and must be investigated during implementation.

At 390 px, document scroll width is 407 px. Navigation has no mobile toggle. The code panel precedes the introduction on mobile, pushing primary actions below the first screen. Refreshed screenshots were visually inspected:

- `/tmp/portfolio-before-desktop-refreshed.png`
- `/tmp/portfolio-before-mobile-refreshed.png`

Existing `.gitignore` modification belongs to the user and must be preserved. No AGENTS.md was found in the project search.

## Approaches considered

1. **Recommended: editorial portfolio with one persistent architectural 3D scene.** Gives a distinct visual identity while keeping content readable and server rendered. Requires a small dedicated motion/scene subsystem.
2. Hero-only 3D with ordinary sections. Lower rendering cost and implementation complexity, but less cohesive scroll storytelling.
3. Full-screen pinned 3D chapters throughout. Strong spectacle, but greater scroll length, touch-navigation complexity, and performance risk. Do not choose for this content.

## Visual direction: engineered clarity

Use a graphite world, warm white typography, and a restrained mint accent derived from the current identity. Large asymmetric editorial headings, fine rules, numbered chapters, generous negative space, and clearly presented project roles replace repeated gradients and decorative code windows.

One abstract engineered core consists of layered metal frames, intersecting orbital paths, a fine technical grid, and sparse nodes. The core suggests connected frontend, backend, and infrastructure systems. It remains beside the hero, shifts into depth around about and experience, opens into a constellation around expertise, frames selected project chapters, then recedes for contact. DOM text never lives inside the canvas.

### Design tokens

- Background `#0B0E11`; surface `#14191E`; elevated surface `#1B2229`.
- Main text `#F4F1EB`; secondary text `#AEB8C1`; accent `#91E5C1`; accent text `#0B0E11`; functional border `#59656F`; decorative rules `#29323A`.
- Retain Inter for body and display to minimize font requests; use system monospace for chapter labels and technology metadata. Body 16–18 px with 1.6 line height; display fluid 48–104 px desktop, 40–60 px mobile; section headings fluid 32–64 px. Verify contrast in final compositions.
- Spacing scale: 4, 8, 12, 16, 24, 32, 48, 64, 96, 128 px. Reading width approximately 65 characters; maximum page width approximately 1280 px.
- Radius: 4 px controls, 8 px surfaces, full radius only for small status indicators. Minimal shadows; use borders and tonal separation for hierarchy.
- Focus: 2 px mint ring with 4 px offset. Controls at least 44×44 px, hover/focus states equivalent, pressed states visible.
- Interaction duration 180–240 ms, editorial reveal 650–900 ms, consistent power2 easing, linear scroll scrubbing. Avoid bounce.
- Breakpoints: 640, 768, 1024, 1280 px; compose mobile intentionally and verify at 390 px.

UI UX Pro Max searches supported storytelling and readable dark surfaces. Its generated FAQ layout and handwritten typography were unsuitable for this brief and are not adopted.

## Information architecture

1. Nonblocking intro mark integrated into hero; no loading gate or artificial delay.
2. Hero: name, actual Senior Software Engineer title, concise positioning derived from existing description, selected-work CTA and resume link, decorative core.
3. Selected work: MIS/Nexis, Group Captain, and Remmi CRM as featured chapters. Use existing roles, technology lists, and descriptions. Clearly distinguish documented functionality from measured outcomes; invent no metrics. Remaining work stays accessible at `/project`.
4. About: existing portrait, concise professional description, Lahore location, and documented strengths.
5. Expertise/capabilities: group verified technologies into frontend systems, backend/data, and delivery/infrastructure. A readable DOM list complements the visual constellation.
6. Experience: three existing positions in chronological reading order with supplied dates. Do not add unverified duties or achievements.
7. Education: preserve existing records in a compact section and retain `#education` anchor.
8. Writing: optional DEV content with resilient loading, empty, and failure behavior, plus `/blog` route.
9. Contact: prominent email, resume/social links, accessible form using existing server delivery.
10. Footer: personal identity, navigation, and existing repository credit/link.

Preserve `#about`, `#experience`, `#skills`, `#education`, `#projects`, and `#contact` deep links. No dedicated AI accomplishment section: current data documents no AI work. Research scraping and LDAP/asset-tagging automation can be described within their actual project context.

## Architecture and motion

- Preserve Next.js, JavaScript, Sass/Tailwind, routes, and content files. Render core content on the server; isolate interactive navigation, contact, motion coordinator, and scene in client components.
- Add `app/components/portfolio/sections`, `navigation`, `scene`, and `motion` only where they clarify ownership. Shared display components support both selected projects and the project index.
- Lazy-load a single canvas. Use React-19-compatible Fiber and Three.js versions checked against official documentation before installation. Add Drei only if a concrete helper materially reduces custom code; avoid effect libraries and post-processing.
- GSAP/ScrollTrigger supplies a coordinated scene timeline driven by section positions. GSAP owns a shared mutable motion object; Fiber's frame callback owns camera/group transforms. Avoid two systems writing the same transform.
- Hero reveal and chapter reveals use scoped timelines. Keep scroll transitions reversible. Pin only a short desktop project composition if browser review confirms it improves reading; no mobile pinning or mandatory scroll snapping.
- Lenis remains conditional: add only if native anchor behavior, keyboard scrolling, reduced motion, and ScrollTrigger integration remain reliable. Native scrolling is the baseline.
- Use bounded geometry and seeded particle data, no external texture downloads. Start with DPR capped at 1.5 desktop and 1 mobile; approximately 100 desktop / 30 mobile particles. No shadows or post-processing by default.
- Avoid React state updates per frame. Pause when the document is hidden; use demand rendering when idle or motion is disabled. Release listeners, timelines, triggers, ticker callbacks, and owned GPU resources on cleanup.
- Reduced motion disables smooth scrolling, scrubbed camera travel, idle spin, particles, and nonessential reveals. Provide a motion toggle for continuous decorative movement. Honor live preference changes.
- WebGL-unavailable, context-loss, and scene-error cases retain a static CSS/SVG composition. Content and links work without canvas and without client enhancement.

## SEO and delivery

Correct metadata and heading hierarchy. Add local Open Graph artwork and Person JSON-LD using actual details and supplied profile links. Use a validated production-origin setting for canonical, robots, and sitemap URLs; do not assume README deployment remains current. Keep analytics conditional on valid configuration and investigate the initial syntax error.

Improve contact semantics, same-origin requests, inline feedback, server validation, and escaping while keeping existing credentials private. Test delivery through mocked requests; never send test email to the owner.

## Implementation phases

1. Reproduce startup issue; establish server-rendered shell, tokens, semantic navigation, heading hierarchy, responsive hero, and contact interactions.
2. Build project chapters, about, capability groups, experience, education, project index, and resilient writing route from existing data.
3. Add lazy 3D world, fallback, one scroll coordinator, device-specific rendering, reduced-motion path, and cleanup.
4. Add metadata/social image/structured data and deployment-origin handling.
5. Validate and refine in Playwright; run lint, applicable behavior tests, and production build. Introduce a typecheck only if typed source is introduced; do not convert the application just to satisfy a script name.

## Acceptance checks

- Real-browser checks at 1440×900, 1280×800, 768×1024, and 390×844. No horizontal overflow, clipped text, obscured focus, or inaccessible navigation.
- Homepage initial load/refresh, all anchor links, `/project`, `/blog`, not-found, project destinations where supplied, resume, email/phone/social links, and mobile menu including Escape and focus behavior.
- Contact required-field/invalid-email handling, mocked success/failure/loading, no duplicate submission, inline accessible feedback.
- Keyboard navigation, visible focus, skip link, heading order, named controls, labels, image alternatives, and contrast.
- Reduced-motion emulation and live changes, motion toggle, scroll reversal, viewport resize, WebGL-disabled fallback, canvas context failure, and route unmount/remount.
- Capture and visually inspect hero, selected projects, experience, contact, and complete mobile compositions; refine before final screenshots.
- No application console errors or failed critical local requests. Treat optional third-party failures separately and keep the page usable.
- Measure browser frame timing and rendering load; target approximately 60 FPS on tested hardware, report actual evidence and avoid promising unmeasured device performance.
- Production build and lint pass without disabling checks. Record pre-existing failures separately. Final report includes changes, checks, screenshot paths, and genuine limitations.
