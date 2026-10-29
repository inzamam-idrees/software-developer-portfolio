import Image from "next/image";

// ── Admin-only theme descriptions ──
// Describes each theme's design intent for the picker; no portfolio facts live here.
const PURPOSES = Object.freeze({
  coding: "Developer-centric and code-inspired, with a strong technical personality.",
  cinematic: "Space-inspired 3D: a glowing globe behind the portrait, glass panels and a scroll-driven camera journey.",
  executive: "Recruiter-first charcoal and gold layout, highly readable and focused on career evidence.",
  spatial: "An interactive system model: skills graph, project ring and experience spine.",
  prism: "Portrait-led glass panels, warm gradients and an interactive project showcase.",
});

export function themePurpose(themeId) {
  return PURPOSES[themeId] ?? "A registered portfolio theme.";
}

// ── Thumbnails ──
// Screenshots of each theme's home hero at 1440×900, regenerated when a theme changes.
const THUMBNAILS = Object.freeze({
  coding: "/theme-thumbnails/coding.webp",
  cinematic: "/theme-thumbnails/cinematic.webp",
  executive: "/theme-thumbnails/executive.webp",
  spatial: "/theme-thumbnails/spatial.webp",
  prism: "/theme-thumbnails/prism.webp",
});

export function ThemeThumbnail({ themeId }) {
  const src = THUMBNAILS[themeId];
  if (!src) return <div className="admin-theme-thumb" aria-hidden="true" />;
  return (
    <Image
      className="admin-theme-thumb"
      src={src}
      width={800}
      height={500}
      sizes="(max-width: 767px) 100vw, 360px"
      alt=""
    />
  );
}
