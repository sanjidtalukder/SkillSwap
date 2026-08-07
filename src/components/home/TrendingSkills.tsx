"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants";

interface Skill {
  id: string;
  name: string;
  count: number;
}

interface TrendingSkillsProps {
  skills: Skill[];
}

export function TrendingSkills({ skills }: TrendingSkillsProps) {
  return (
    <section className="py-24 bg-background border-t border-border/40">
      <div className="container mx-auto max-w-4xl px-4 text-center">
        <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-4">
          Trending Technologies
        </h2>
        <p className="text-muted-foreground mb-12 text-lg max-w-2xl mx-auto">
          Explore the most popular skills our students are using to build next-generation projects.
        </p>

        <div className="flex flex-wrap justify-center gap-4">
          {skills.map((skill, index) => (
            <motion.div
              key={skill.id}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: index * 0.05 }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link href={`${ROUTES.PROJECTS}?search=${encodeURIComponent(skill.name)}`}>
                <Badge 
                  variant="outline" 
                  className="px-5 py-2.5 text-sm font-medium bg-card/40 backdrop-blur-sm hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all duration-300 shadow-sm cursor-pointer border-border/60"
                >
                  {skill.name}
                </Badge>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
