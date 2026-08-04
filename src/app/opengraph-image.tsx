import { ImageResponse } from "next/og";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OpengraphImage() {
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
          background: "#3B6DF5",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 140,
            height: 140,
            borderRadius: 32,
            background: "rgba(255,255,255,0.15)",
            marginBottom: 40,
          }}
        >
          <svg width="84" height="84" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2L4 5.5V11C4 16.2 7.4 20.9 12 22C16.6 20.9 20 16.2 20 11V5.5L12 2Z"
              fill="white"
            />
            <path
              d="M9.5 12L11.2 13.7L14.8 10"
              stroke="#3B6DF5"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
        <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "white" }}>EscrowFlow</div>
        <div style={{ display: "flex", fontSize: 28, color: "rgba(255,255,255,0.85)", marginTop: 16 }}>
          Get paid safely for work, anywhere in the world
        </div>
      </div>
    ),
    { ...size }
  );
}
