import { ImageResponse } from "next/og";
export const alt = "Inzamam Idrees — Senior Software Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export function GET() {
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
          INZAMAM IDREES / SENIOR SOFTWARE ENGINEER
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
          Engineering
          <br />
          with intention.
        </div>
        <div style={{ fontSize: 24, color: "#AEB8C1", marginTop: 48 }}>
          Web applications. Thoughtful systems. Readable interfaces.
        </div>
      </div>
    ),
    size,
  );
}
