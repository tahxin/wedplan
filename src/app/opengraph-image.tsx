import { ImageResponse } from "next/og";

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
          backgroundColor: "#faf7f2",
          backgroundImage:
            "radial-gradient(circle at 20% 20%, rgba(190,18,60,0.14), transparent 28%), radial-gradient(circle at 80% 25%, rgba(245,158,11,0.14), transparent 24%)",
          color: "#1c1917",
          padding: "60px",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #be123c, #e11d48 55%, #f59e0b)",
            width: "96px",
            height: "96px",
            borderRadius: "28px",
            marginBottom: "28px",
            boxShadow: "0 18px 40px -12px rgba(190, 18, 60, 0.45)",
          }}
        >
          <svg
            width="58"
            height="58"
            viewBox="0 0 64 64"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M24.5 18.5c-6.351 0-11.5 5.149-11.5 11.5S18.149 41.5 24.5 41.5c3.06 0 5.845-1.196 7.9-3.146"
              stroke="white"
              strokeWidth="4.8"
              strokeLinecap="round"
            />
            <path
              d="M39.5 18.5c6.351 0 11.5 5.149 11.5 11.5S45.851 41.5 39.5 41.5c-3.06 0-5.845-1.196-7.9-3.146"
              stroke="white"
              strokeWidth="4.8"
              strokeLinecap="round"
            />
            <path
              d="M22 44.5c3.2 4.2 6.5 6.8 10 9 3.5-2.2 6.8-4.8 10-9"
              stroke="white"
              strokeWidth="4.8"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path d="M32 13.5v8" stroke="white" strokeWidth="4.8" strokeLinecap="round" />
            <circle cx="32" cy="11" r="2.6" fill="white" />
          </svg>
        </div>

        <h1
          style={{
            fontSize: "72px",
            fontWeight: 700,
            margin: "0 0 16px 0",
            textAlign: "center",
            letterSpacing: "-0.03em",
            color: "#1c1917",
          }}
        >
          WedPlan
        </h1>

        <p
          style={{
            fontSize: "30px",
            color: "#57534e",
            textAlign: "center",
            maxWidth: "860px",
            margin: "0 0 34px 0",
            lineHeight: "1.35",
          }}
        >
          Discover & Book Trusted Wedding Vendors in One Elegant Place
        </p>

        <div
          style={{
            display: "flex",
            gap: "22px",
            fontSize: "20px",
            fontWeight: 600,
            color: "#be123c",
          }}
        >
          <span>Photography</span>
          <span>Venues</span>
          <span>Florists</span>
          <span>Catering</span>
          <span>Bridal Fashion</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
