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
    <section className="py-12 border-y border-border/40 bg-muted/20 overflow-hidden">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 mb-10">
          <div className="flex items-center gap-2 text-muted-foreground font-medium">
            <span className="h-px w-8 bg-border"></span>
            Trusted by {stats.users.toLocaleString()}+ students building {stats.projects.toLocaleString()}+ projects
            <span className="h-px w-8 bg-border"></span>
          </div>
        </div>

        {/* Infinite Marquee */}
        <div className="relative flex overflow-hidden group">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-background to-transparent z-10" />
          
          <motion.div
            className="flex gap-8 items-center whitespace-nowrap"
            animate={{ x: ["0%", "-33.33%"] }}
            transition={{ 
              repeat: Infinity, 
              ease: "linear", 
              duration: 20 
            }}
          >
            {marqueeTech.map((tech, index) => (
              <div 
                key={index} 
                className="flex items-center justify-center px-6 py-3 rounded-full bg-background border border-border/50 text-foreground/70 text-sm font-semibold shadow-sm transition-colors hover:text-primary hover:border-primary/50"
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
