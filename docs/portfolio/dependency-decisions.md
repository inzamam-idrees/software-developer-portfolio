# Dependency decisions

Added only Three.js (~0.186.1), React Three Fiber (^9.8.1), and GSAP (^3.15.0). The official npm registry reports Fiber 9.8.1 peers React/React DOM >=19 <19.4 and Three >=0.156; this app's React 19.0.0 and selected Three release satisfy those requirements. Native-only peers are optional, not installed for this web app. Existing Next.js version retained.

Sources: [Fiber package](https://www.npmjs.com/package/@react-three/fiber), [Three package](https://www.npmjs.com/package/three), [GSAP package](https://www.npmjs.com/package/gsap), [GSAP context cleanup](https://gsap.com/docs/v3/GSAP/gsap.context()/).

Lenis, Drei, @gsap/react, post-processing and a new test framework were not added. Native scrolling and gsap.context cleanup provide the required ownership without extra packages. Previously unbounded `latest` tooling ranges were constrained to the existing compatible Tailwind/PostCSS/Autoprefixer/ESLint major versions before the lockfile changed.

Scene budget: 100/30 seeded particles, DPR 1.5/1, low-polygon frames/orbits, no textures/shadows/composer. Geometry and materials are declaratively owned by Fiber. An instanced node mesh uses one scratch Object3D; no objects or React state are allocated per frame. Canvas is lazy-loaded, motion preferences precede mounting, hidden tabs suspend the loop, and context loss unmounts the scene while retaining the static hero motif.

Scroll coordination uses one GSAP timeline with measured chapter stops and a shared scalar state. Fiber alone writes transforms. Native anchors remain authoritative; no pinning, snapping, or Lenis was introduced. Media contexts and the root ResizeObserver rebuild measured stops when content/responsiveness changes; cleanup restores readable DOM transforms and static scene state. Paused/reduced-motion canvas is anchored to the hero rather than remaining behind subsequent text.

## Security patch pass during acceptance

The initial audit reported 22 findings, including two critical findings inherited
from the existing stack. Updated existing Next/third-parties/ESLint config to
15.5.27, React/React DOM to compatible patched 19.0.8, Nodemailer to 10.0.13,
and sharp to 0.35.5. Registry peer and engine constraints were checked first.
Node >=20.9 is now explicit. Non-breaking audit fixes refreshed existing lockfile
transitives. Next 15 pins PostCSS 8.4.31; a scoped override uses the direct patched
PostCSS 8.5.28 dependency. Lint, unit tests, production build, and visual checks
validate this compiler substitution. Final `npm audit` reports zero vulnerabilities.
No force upgrade to Next 16 and no additional product library were introduced.

Advisory evidence: [Next image optimization advisory](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4),
[Nodemailer advisory](https://github.com/advisories/GHSA-p6gq-j5cr-w38f),
and the audit's [PostCSS source-map advisory](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp).


## Rendering budget evidence

Software Chromium initially measured 30 draw calls and 3336 triangles per frame.
Instanced beam frames and simpler rings reduce this to 8 calls / 2088 triangles.
A detected software renderer uses DPR .75, 30 particles and no antialiasing; hardware
retains the approved DPR caps and 100/30 particle budgets. No animation/GPU debug
hooks ship in the UI. Measured frame intervals and limitations are in `validation.md`.
