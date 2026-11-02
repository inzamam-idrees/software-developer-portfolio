import Image from "next/image";

export { themePurpose } from "@/lib/themes/purposes.mjs";

// ── Thumbnails ──
// Screenshots of each theme's home hero at 1440×900, regenerated when a theme changes.
const THUMBNAILS = Object.freeze({
  coding: "/theme-thumbnails/coding.webp",
  cinematic: "/theme-thumbnails/cinematic.webp",
  executive: "/theme-thumbnails/executive.webp",
  spatial: "/theme-thumbnails/spatial.webp",
  prism: "/theme-thumbnails/prism.webp",
  creative: "/theme-thumbnails/creative.webp",
  sienna: "/theme-thumbnails/sienna.webp",
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
