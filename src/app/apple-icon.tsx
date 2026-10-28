import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", background: "linear-gradient(135deg, #6A7DFF, #4255F0)" }}>
        <svg width="112" height="112" viewBox="0 0 24 24" fill="none">
          <path d="M6 20V9a6 6 0 0 1 12 0v11" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
          <path d="M3.5 20h17" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
          <circle cx="14.5" cy="14" r="1.25" fill="white" />
        </svg>
      </div>
    ),
    size,
  );
}
