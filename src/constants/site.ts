export const SITE_CONFIG = {
  name: "SkillSwap",
  description: "Enterprise Student Collaboration & Skill Exchange Platform",
  url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  links: {
    github: "https://github.com/skillswap",
  },
} as const;
