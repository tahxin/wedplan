import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #9f1239, #e11d48 55%, #d97706)",
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "9px",
        }}
      >
        <svg
          width="22"
          height="22"
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M10 22.5c5.2-4.8 11-4.8 16.2 0L32 28l5.8-5.5c5.2-4.8 11-4.8 16.2 0"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M14 22.5V39c0 2.2 1.1 4.3 3 5.5l13.2 8.4c1.1.7 2.5.7 3.6 0L47 44.5c1.9-1.2 3-3.3 3-5.5V22.5"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path d="M32 28v24.5" stroke="white" strokeWidth="5" strokeLinecap="round" />
          <path
            d="M24.5 14.5c2.2-3 4.7-4.5 7.5-4.5s5.3 1.5 7.5 4.5"
            stroke="white"
            strokeWidth="5"
            strokeLinecap="round"
          />
          <circle cx="32" cy="16.5" r="2.8" fill="white" />
        </svg>
      </div>
    ),
    {
      ...size,
    }
  );
}
