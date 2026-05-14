import type { MetadataRoute } from "next";

/** Web app manifest for installable PWA (Chrome/Edge/Android; iOS uses meta + apple-touch-icon). */
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Safety Shaper",
    short_name: "Safety Shaper",
    description:
      "ESG and EHS professional network — jobs, knowledge, compliance, audits, and training.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    display_override: ["standalone", "browser"],
    background_color: "#f7f7f7",
    theme_color: "#2b4d9e",
    icons: [
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
    categories: ["business", "productivity", "social"],
    orientation: "any",
  };
}
