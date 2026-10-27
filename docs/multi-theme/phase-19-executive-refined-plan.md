# Phase 19: Executive refined redesign plan

Date: 2026-10-26. The owner chose “Light and refined: airy layout, restrained color, elegant typography.” This replaces the previous visual presentation while retaining canonical content and functionality. No activation, commit, push, new dependency or changes to other themes.

## Direction and critique

An airy portrait-led personal portfolio for recruiters, clients and engineering peers. The first viewport pairs the canonical “Engineering with intention.” headline with the real portrait, designation, introduction and contact/résumé actions. A quiet employer strip provides evidence. Work precedes the detailed career history so visitors can inspect examples quickly.

Palette: white #ffffff, mist #f3f7f5, ink #173b36, secondary #52655f, teal #176b5b, border #cbd8d2. Dark mode receives its own deep green surfaces and accessible mint accents. Retain the locally hosted Inter reading face and Inter Tight display face, using lighter large display weight and stronger small headings. No network font request.

```
name / navigation / motion
headline + introduction      large real portrait
contact / résumé             experience + location
employers / core technologies
selected work: generous project panels
career guide                 complete role timeline + disclosures
expertise / background / credentials
writing / résumé / contact
```

Critique: an initial dark studio proposal was rejected in favor of the owner's light/refined choice. Avoid dark hero blocks, decorative technology orbs, invented product screenshots, metric counters, rotating logos, repeated reveal effects and numbered section labels. The portrait and typography carry the identity. Surface variation separates work and career without turning every paragraph into a card. Existing compact certificates, sparse writing and outcome omission remain.

## Build and verification

- [x] Capture incumbent light/dark full pages at 390/1280.
- [x] Recompose Executive home and project panels using existing data; add only copy-backed controls.
- [x] Replace accumulated styling with one coherent responsive token system covering all five registry slots; retain existing stylesheet pipeline.
- [x] Preserve native disclosures, complete no-JS content and optional outcome rendering. Use one coordinated hero entrance, existing disclosure/header/role transitions and fine-pointer feedback; reduced motion and shared pause disable all movement.
- [x] Verify content, stylesheet generation, lint, unit tests and production build.
- [x] Browser check light/dark, 375/390/768/1280/1536; home/projects/detail/blog; standard/no-JS/reduced; disclosure keyboard operation, pause, contrast, layout, contact error path and console errors. Capture desktop/mobile screenshots, critique once and repair observed defects together.
- [x] Document actual results, skill contributions, screenshots, data gaps and limitations.

Skills: frontend-design (composition and critique); ui-ux-pro-max (responsive/accessibility guidance); design-system (semantic/component tokens); ui-styling (native accessible control states within existing Sass architecture); gsap-performance (transform/opacity and bounded lifecycle principles, no GSAP dependency in Executive); Impeccable (craft-floor and final detector); playwright-cli (browser evidence). Existing project documentation supplies product truth; no global brand or product settings are changed.
