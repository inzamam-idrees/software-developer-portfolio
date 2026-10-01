# Dependency decisions

Added only Three.js (~0.186.1), React Three Fiber (^9.8.1), and GSAP (^3.15.0). The official npm registry reports Fiber 9.8.1 peers React/React DOM >=19 <19.4 and Three >=0.156; this app's React 19.0.0 and selected Three release satisfy those requirements. Native-only peers are optional, not installed for this web app. Existing Next.js version retained.

Sources: [Fiber package](https://www.npmjs.com/package/@react-three/fiber), [Three package](https://www.npmjs.com/package/three), [GSAP package](https://www.npmjs.com/package/gsap), [GSAP context cleanup](https://gsap.com/docs/v3/GSAP/gsap.context()/).

Lenis, Drei, @gsap/react, post-processing and a new test framework were not added. Native scrolling and gsap.context cleanup provide the required ownership without extra packages. Previously unbounded `latest` tooling ranges were constrained to the existing compatible Tailwind/PostCSS/Autoprefixer/ESLint major versions before the lockfile changed.

Scene budget: 100/30 seeded particles, DPR 1.5/1, low-polygon frames/orbits, no textures/shadows/composer. Geometry and materials are declaratively owned by Fiber. An instanced node mesh uses one scratch Object3D; no objects or React state are allocated per frame. Canvas is lazy-loaded, motion preferences precede mounting, hidden tabs suspend the loop, and context loss unmounts the scene while retaining the static hero motif.

Scroll coordination uses one GSAP timeline with measured chapter stops and a shared scalar state. Fiber alone writes transforms. Native anchors remain authoritative; no pinning, snapping, or Lenis was introduced. Media contexts and the root ResizeObserver rebuild measured stops when content/responsiveness changes; cleanup restores readable DOM transforms and static scene state. Paused/reduced-motion canvas is anchored to the hero rather than remaining behind subsequent text.
