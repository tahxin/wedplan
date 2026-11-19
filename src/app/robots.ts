import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://wedplan-ice.vercel.app";

  return {
    rules: {
      userAgent: "*",
      allow: ["/", "/services", "/services/*"],
      disallow: ["/dashboard/*", "/payment/*", "/api/*"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
