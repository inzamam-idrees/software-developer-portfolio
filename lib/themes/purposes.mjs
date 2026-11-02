// ── Theme descriptions ──
// One-line design intent per theme, shared by the admin picker and README sync; no portfolio facts live here.
const PURPOSES = Object.freeze({
  coding: "Developer-centric and code-inspired, with a strong technical personality.",
  cinematic: "Space-inspired 3D: a glowing globe behind the portrait, glass panels and a scroll-driven camera journey.",
  executive: "Recruiter-first charcoal and gold layout, highly readable and focused on career evidence.",
  spatial: "An interactive system model: skills graph, project ring and experience spine.",
  prism: "Portrait-led glass panels, warm gradients and an interactive project showcase.",
  creative: "Light, personal and illustrated: portrait with hand-drawn accents, technology strip and colorful project cards.",
  sienna: "Dark-first personal portfolio in raw sienna: portrait over a paint splash, stat cards, skill tiles and a masonry works grid, with a light mode.",
});

export function themePurpose(themeId) {
  return PURPOSES[themeId] ?? "A registered portfolio theme.";
}
