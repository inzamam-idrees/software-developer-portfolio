# Phase 15: Executive redesign

2026-10-26. Scope: Executive presentation only; canonical facts, active theme,
registry, routes, SEO, contact handling and other themes remain unchanged.

## Baseline browser review

Captured home at 375, 768, 1280 and 1536 px (960 px tall), using authenticated
`/preview/executive`. Evidence: `artifacts/portfolio/phase15/before-*.png`.

- Generic slogan dominates; name and professional designation are small.
- Cream/copper/Georgia conflicts with the requested calm contemporary direction.
- Four exhaustive projects postpone career evidence by several screens.
- Uppercase tiny labels and technology pills compete with the actual content.
- Career list lacks an active role, sticky reading aid or sense of progression.
- Mobile stacks every lengthy section; the preview toolbar also overlays content.
- Desktop navigation squeezes all secondary sections into the primary header.

## Design and tokens

Palette: paper #F6F7F9, surface #FFFFFF, ink #14181F, secondary #525D6D,
rule #CDD3DF, indigo #3B4CCA. Dark equivalents: #181A20, #22252E,
#F2F4FA, #B4BDCF, #454D60, #A9B5FF. Contrast checked during browser review.
Typography: self-hosted Inter Tight for role/headings, Inter for reading;
reuse local licensed font binaries under Executive-owned paths, preload only
these two, with fixed image dimensions and natural portrait crop. Scale:
14/16/18/24/32/48/72 px; fluid headline. Body measure 68ch.
Spacing: 4/8/12/16/24/32/48/64/96. Radii: 4px controls, 12px portrait.

Hero: professional role is the headline; name and canonical introduction give
identity and context. Compact portrait/experience/focus/stack panel on the right.
Career comes next, then selected work, expertise, about and other canonical evidence.

```
Hero desktop
[name]                              [portrait | experience]
Senior Full Stack                   [focus / core stack]
Engineer                            [location]
[introduction]
[contact] [resume]

Experience
[sticky heading] | [role, employer, dates]
[role anchors]   | [outcomes + technology]
[progress rail]  | [next role]

Projects
[project title + role]   [short description / outcome]
                        [native details: approach, features, links]

Mobile
[name                 Menu]
[role headline]
[introduction / actions]
[portrait + brief]
[career heading / role anchor links]
| [role / employer / dates]
| [outcomes / technology]
[project title]
[description / expandable details]
```

All alignment is left. Quiet overview and row-based evidence; career is the sole
expressive scroll moment. A sticky rail fills using a transform, active role has
stronger type/opacity and a visible marker. Native role anchors remain keyboard
operable without JavaScript. Header current-section underline is observer driven.
CSS view timelines are preferred behind @supports; a small observer island supplies
role/progress fallback and section state. No scroll event loop or animation library.
Only transform/opacity animate. Hero entrance is subtle and visible at SSR;
skill rows settle once; native project disclosure is user controlled. Reduced motion
and shared portfolio-motion paused preference disable animated effects and dimming.

## Critique and revisions before build

Rejected a dashboard of summary cards: it would reproduce the forbidden SaaS kit.
Rejected a broadside serif treatment: too close to both old Executive and Cinematic.
Replaced repeated eyebrows/indices with semantic headings and actual dates. Removed
ornamental monogram box and ubiquitous arrows. Kept the accent for actions, focus
and career progress. Do not invent availability: canonical data has no availability
field. Display the verified focus instead. Keep the complete biography in about,
not the hero. Existing other-theme fonts are copied locally, not imported as runtime.

## Build and verification

Implement Executive-owned styling/components, copy/schema additions, and regression
checks for data isolation and motion/static behavior. Compile through existing CSS
entry (thin forwarding Sass file), retain shared form primitives. Run content, CSS,
lint, unit and production build checks. Capture home/project/blog at all four widths,
light/dark, JavaScript disabled and reduced motion; inspect career scroll states,
keyboard access, overflow, clipping, contrast, image fallback and layout stability.
No commit or push.
