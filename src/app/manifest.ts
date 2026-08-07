import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SkillSwap",
    short_name: "SkillSwap",
    description:
      "Student Collaboration Platform for Skill Exchange, Project Collaboration, and Team Communication.",
    start_url: "/",
    display: "standalone",
    background_color: "#020817", // Dark theme background
    theme_color: "#0f172a",
    icons: [
      {
        src: "/cropped-icon.png",
        sizes: "any",
        type: "image/png",
      },
      {
        src: "/icon.png",
        sizes: "180x180",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
