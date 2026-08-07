"use client";

import { motion } from "framer-motion";
import { Users, LayoutDashboard, MessageSquare, Briefcase, Target, Layers, ShieldCheck, Zap } from "lucide-react";

export function FeaturesSection() {
  const features = [
    { title: "Real Collaboration", description: "Work together in dedicated project workspaces with real-time sync.", icon: Users },
    { title: "Project Workspaces", description: "Manage tasks, files, and team announcements in one place.", icon: LayoutDashboard },
    { title: "Private Messaging", description: "1-on-1 and group chats with read receipts and instant delivery.", icon: MessageSquare },
    { title: "Skill Matching", description: "Intelligent algorithm comparing your skills to project needs.", icon: Target },
    { title: "Team Building", description: "Send requests, review applications, and assemble your dream team.", icon: Briefcase },
    { title: "Discussion Groups", description: "Engage in project-specific or global discussion forums.", icon: Layers },
    { title: "Secure Authentication", description: "Enterprise-grade security protecting your data and profile.", icon: ShieldCheck },
    { title: "Responsive Design", description: "Optimized for mobile, tablet, and desktop experiences seamlessly.", icon: Zap },
  ];

  return (
    <section className="py-24 bg-background">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            Why Choose SkillSwap
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            Everything you need to find collaborators and build professional projects.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="group p-6 rounded-2xl border border-border/50 bg-card/40 hover:bg-card hover:border-primary/30 transition-all duration-300"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-transform group-hover:scale-110">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
                  {feature.title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
