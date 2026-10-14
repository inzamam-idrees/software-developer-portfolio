import { ImageResponse } from "next/og";
import { getCurrentPortfolioView } from "@/lib/portfolio/server.mjs";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export async function GET() {
  const { profile, settings } = await getCurrentPortfolioView();
  const [headlineLead, headlineEmphasis] = profile.headline.split(/\s+with\s+/i);
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 80,
          background: "#0B0E11",
          color: "#F4F1EB",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ fontSize: 24, color: "#91E5C1", letterSpacing: 4 }}>
          {`${profile.name} / ${profile.designation.toUpperCase()}`}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 96,
            lineHeight: 1.05,
            marginTop: 48,
          }}
        >
          {headlineLead}
          <br />
          with {headlineEmphasis}
        </div>
        <div style={{ fontSize: 24, color: "#AEB8C1", marginTop: 48 }}>
          {settings.seo.openGraph.description}
        </div>
      </div>
    ),
    size,
  );
}
