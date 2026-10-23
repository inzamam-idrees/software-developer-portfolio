import { ImageResponse } from "next/og";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";

export function initials(name) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0].toUpperCase())
    .join("");
}

// Monogram from canonical data, matching the social image palette.
export async function renderMonogram({ width, height }) {
  const { profile } = await getCurrentPortfolioView();
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0B0E11",
          color: "#91E5C1",
          fontSize: Math.round(height * 0.46),
          fontWeight: 700,
          fontFamily: "sans-serif",
          letterSpacing: -2,
        }}
      >
        {initials(profile.name)}
      </div>
    ),
    { width, height },
  );
}
