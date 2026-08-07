"use client";

import { motion } from "framer-motion";
import { Users, FolderGit2, Sparkles, Network } from "lucide-react";

interface StatsSectionProps {
  stats: {
    users: number;
    projects: number;
    skills: number;
    connections: number;
  };
}

export function StatsSection({ stats }: StatsSectionProps) {
  const statItems = [
    { label: "Active Students", value: stats.users, icon: Users, color: "text-blue-500" },
    { label: "Projects Created", value: stats.projects, icon: FolderGit2, color: "text-purple-500" },
    { label: "Skills Matched", value: stats.skills, icon: Sparkles, color: "text-amber-500" },
    { label: "Connections Made", value: stats.connections, icon: Network, color: "text-green-500" },
  ];

  return (
    <section className="py-12 border-y border-border/40 bg-card/20 backdrop-blur-sm">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {statItems.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="flex flex-col items-center justify-center text-center p-4"
              >
                <div className={`mb-3 rounded-xl bg-background/50 p-3 shadow-sm border border-border/50 ${stat.color}`}>
                  <Icon className="h-6 w-6" />
                </div>
                <div className="text-3xl sm:text-4xl font-black tracking-tight text-foreground mb-1">
                  {/* Note: We could use framer-motion useSpring for counting, but static renders faster on server. 
                      Since it's a server component data source, we just display it. */}
                  {stat.value.toLocaleString()}+
                </div>
                <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                  {stat.label}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
