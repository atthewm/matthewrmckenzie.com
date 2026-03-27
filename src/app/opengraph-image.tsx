import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Matthew McKenzie | Capital Formation & Growth Strategy";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(180deg, #2d2d2d 0%, #1a1a1a 40%, #111 100%)",
          fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif",
          color: "#fff",
        }}
      >
        <div
          style={{
            fontSize: 48,
            fontWeight: 700,
            letterSpacing: "6px",
            lineHeight: 1.2,
            display: "flex",
          }}
        >
          McKENZIE
          <span style={{ color: "#0071e3" }}>_</span>
          OS
        </div>
        <div
          style={{
            fontSize: 20,
            color: "#999",
            marginTop: 16,
            letterSpacing: "2px",
          }}
        >
          Capital Formation & Growth Strategy
        </div>
        <div
          style={{
            fontSize: 16,
            color: "#666",
            marginTop: 32,
            letterSpacing: "1px",
          }}
        >
          Matthew McKenzie
        </div>
        <div
          style={{
            fontSize: 12,
            color: "#444",
            marginTop: 8,
            letterSpacing: "3px",
            textTransform: "uppercase",
          }}
        >
          matthewrmckenzie.com
        </div>
      </div>
    ),
    { ...size }
  );
}
