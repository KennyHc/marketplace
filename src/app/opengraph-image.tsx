import { ImageResponse } from "next/og";

export const alt = "Pasillo · El mercado de segunda mano de tu organización";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Social share card: brand gradient, wordmark, headline and the three value props.
export default function OpengraphImage() {
  const props = ["Solo compañeros verificados", "Entrega en el mismo edificio", "Reputación visible"];
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "space-between",
          padding: 72, color: "white",
          background: "radial-gradient(circle at 15% 10%, #8b9bff 0%, transparent 45%), radial-gradient(circle at 90% 90%, #7c5cfc 0%, transparent 50%), #5167FC",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none">
              <path d="M6 20V9a6 6 0 0 1 12 0v11" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
              <path d="M3.5 20h17" stroke="white" strokeWidth="2.25" strokeLinecap="round" />
              <circle cx="14.5" cy="14" r="1.25" fill="white" />
            </svg>
          </div>
          <div style={{ fontSize: 44, fontWeight: 700, letterSpacing: -1 }}>Pasillo</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ fontSize: 76, fontWeight: 700, lineHeight: 1.05, letterSpacing: -2.5, maxWidth: 900 }}>
            El mercado de segunda mano de tu organización
          </div>
          <div style={{ display: "flex", gap: 16 }}>
            {props.map((p) => (
              <div key={p} style={{ display: "flex", alignItems: "center", height: 56, padding: "0 24px", borderRadius: 999, background: "rgba(255,255,255,0.16)", fontSize: 26 }}>
                {p}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  );
}
