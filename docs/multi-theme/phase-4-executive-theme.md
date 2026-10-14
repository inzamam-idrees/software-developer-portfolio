# Executive recruiter-first theme

Phase 4 replaces the semantic Executive architecture placeholder with a complete,
production-quality presentation. Cinematic remains the active development theme in
`portfolio-data/settings/theme.json`; Executive is available through the existing
validated registry and was reviewed with an isolated data fixture.

## Design system

Executive uses an editorial visual language distinct from the Coding and Cinematic
themes:

- warm ivory surfaces, charcoal typography, muted slate copy, and restrained copper
  accents;
- Georgia display typography paired with the existing sans-serif application font;
- thin rules, deliberate alignment, and content-led grids instead of decorative cards;
- compact, purposeful transitions with a complete reduced-motion override; and
- no 3D scene, WebGL canvas, GSAP timeline, or decorative client-side runtime.

The implementation is scoped to `themes/executive/` and
`app/css/executive.scss`. The only shared presentation integration is the stylesheet
import in `app/layout.js`. The registry status changes from `architecture-ready` to
`available`; the lazy slot contract and active-theme resolver are unchanged.

## Information architecture

The home route prioritizes information in the order a recruiter is likely to scan:

1. name, designation, location, experience label, full-stack focus, core stack,
   resume, and contact;
2. selected case-study projects with canonical challenge, approach, outcome, role,
   technologies, and available links;
3. concise professional introduction and configured social links;
4. categorized technical expertise;
5. chronological professional experience;
6. education; and
7. direct email plus the existing validated contact form.

`/project` presents the complete canonical project archive. `/blog` presents fetched
DEV articles when available and an honest provider fallback when empty or unavailable.
Optional descriptions and links are omitted when the canonical records do not provide
them.

## Content boundary

`createExecutivePresentation` organizes the already validated portfolio view into
enabled navigation and configured professional social links. It does not contain
professional facts. Components receive the same canonical object as the other themes;
there is no Executive JSON store, direct filesystem read, or duplicated profile,
project, experience, education, skill, resume, social, or contact content.

The user brief mentioned nearly seven years of experience, while the canonical profile
states `Over 5 years`. The design intentionally renders the canonical claim and does
not infer or manufacture a replacement.

## Recruiter usability review

The review used real canonical content and final screenshots at 1440×900, 1280×800,
1024×768, 768×1024, and 390×844.

### Five-second test

The first viewport identifies Inzamam Idrees, Senior Software Engineer, the
`Over 5 years` experience label, full-stack engineering focus, core technologies,
location, and both contact and resume actions. On mobile these remain in the hero and
professional brief without a decorative intro or animation delay.

### Thirty-second test

Selected work follows the hero. Persistent navigation names Work, About, Expertise,
Experience, and Contact; the mobile native disclosure adds All projects and Writing.
Project cards expose role and technology context, while resume and contact actions are
visible before a visitor needs to search.

### Two-minute test

Challenge/approach/outcome groupings explain featured engineering work without invented
metrics. Categorized expertise, dated roles, education, project archive, social links,
and the validated contact flow provide the broader professional picture and a clear
next step.

The visual review found the initial mobile evidence screenshots obscured by the open
menu; the capture flow was corrected to close the keyboard-tested disclosure before
capturing final evidence. Accessibility testing also found compact link targets below
24 px; their hit areas were increased and the checks rerun successfully.

## Accessibility and responsive behavior

- Semantic header, navigation, main, sections, articles, aside, footer, and one `h1`
  per route.
- Skip link is the first keyboard destination and focuses `main`.
- Native `details` mobile navigation works with keyboard, touch, and without JavaScript.
- Visible theme-specific focus treatment and interactive targets of at least 24 px.
- Labeled contact inputs, linked validation messages, live status, duplicate-submit
  protection, failure preservation, and a direct email alternative.
- No horizontal overflow at any required viewport.
- Reduced-motion media query removes transitions, and essential content remains
  server-rendered with JavaScript disabled.

## Runtime isolation

At each required viewport Executive requested nine scripts totaling 417,112 response
bytes. Browser inspection found zero chunks containing the Three.js `WebGLRenderer`,
React Three Fiber `__r3f`, GreenSock, or GSAP signatures, and zero canvas or Cinematic
motion controls. This matches the Phase 3 Executive architecture proof within normal
build-hash variance.

## Deployment note

This phase adds no persistence or mutation behavior. The existing deployment rule still
applies: future runtime file editing requires a persistent writable filesystem.
Normal ephemeral Vercel or Netlify deployment is not compatible with durable runtime
portfolio-data changes.
