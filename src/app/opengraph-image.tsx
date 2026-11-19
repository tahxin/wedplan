import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "WedPlan — Premier Wedding Planning Platform";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#fff1f2",
          backgroundImage: "radial-gradient(#f43f5e 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          fontFamily: "serif",
          color: "#1c1917",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#e11d48",
            color: "white",
            width: "80px",
            height: "80px",
            borderRadius: "24px",
            fontSize: "40px",
            marginBottom: "24px",
            boxShadow: "0 10px 25px -5px rgba(225, 29, 72, 0.4)",
          }}
        >
          ✦
        </div>

        <h1
          style={{
            fontSize: "64px",
            fontWeight: "bold",
            margin: "0 0 16px 0",
            textAlign: "center",
            letterSpacing: "-0.02em",
          }}
        >
          WedPlan
        </h1>

        <p
          style={{
            fontSize: "26px",
            color: "#44403c",
            textAlign: "center",
            maxWidth: "800px",
            margin: "0 0 32px 0",
            fontFamily: "sans-serif",
            lineHeight: "1.4",
          }}
        >
          Discover & Book Trusted Wedding Vendors in One Elegant Place
        </p>

        <div
          style={{
            display: "flex",
            gap: "16px",
            fontFamily: "sans-serif",
            fontSize: "16px",
            fontWeight: "600",
            color: "#e11d48",
          }}
        >
          <span>Photography</span>
          <span>•</span>
          <span>Venues</span>
          <span>•</span>
          <span>Florists</span>
          <span>•</span>
          <span>Catering</span>
          <span>•</span>
          <span>Bridal Fashion</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
