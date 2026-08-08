"use client";

import { motion } from "framer-motion";
import { Users, Briefcase, Activity } from "lucide-react";

export function SocialProofSection({ stats }: { stats: { users: number, projects: number } }) {
  // Hardcoded for now, could be dynamic
  const technologies = [
    "Next.js", "React", "TypeScript", "Prisma", 
    "TailwindCSS", "Node.js", "PostgreSQL", "GraphQL", 
    "Python", "Figma", "Docker", "AWS"
  ];

  // Duplicate for seamless infinite scroll
  const marqueeTech = [...technologies, ...technologies, ...technologies];

  return (
    <section className="py-8 md:py-10 border-y border-border/40 bg-muted/20 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col items-center justify-center mb-8 md:mb-10">
          <div className="flex items-center gap-3 text-muted-foreground/90 font-medium text-sm sm:text-base">
            <span className="h-px w-6 sm:w-12 bg-border"></span>
            Trusted by {stats.users.toLocaleString()}+ students building {stats.projects.toLocaleString()}+ projects
            <span className="h-px w-6 sm:w-12 bg-border"></span>
          </div>
        </div>

        {/* Infinite Marquee */}
        <div className="relative flex overflow-hidden group [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
          <motion.div
            className="flex gap-4 sm:gap-6 items-center whitespace-nowrap py-1"
            animate={{ x: ["0%", "-33.333333%"] }}
            transition={{ 
              repeat: Infinity, 
              ease: "linear", 
              duration: 35 
            }}
          >
            {marqueeTech.map((tech, index) => (
              <div 
                key={`${tech}-${index}`} 
                className="flex items-center justify-center px-5 py-2.5 rounded-full bg-card/60 backdrop-blur-sm border border-border/80 text-foreground/90 text-sm font-medium shadow-sm transition-all hover:text-primary hover:border-primary/50 hover:bg-primary/5"
              >
                {tech}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
