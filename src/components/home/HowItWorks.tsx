"use client";

import { motion } from "framer-motion";
import { UserPlus, Sparkles, Network, Rocket } from "lucide-react";

export function HowItWorks() {
  const steps = [
    {
      title: "Create Profile",
      description: "Sign up and showcase your university, department, and current expertise.",
      icon: UserPlus,
    },
    {
      title: "Add Skills",
      description: "List the skills you have and the skills you're looking to learn.",
      icon: Sparkles,
    },
    {
      title: "Join Projects",
      description: "Browse featured projects and request to join teams that match your skills.",
      icon: Network,
    },
    {
      title: "Collaborate & Build",
      description: "Use project workspaces and real-time chat to build amazing things together.",
      icon: Rocket,
    },
  ];

  return (
    <section className="py-24 bg-card/10 border-y border-border/40">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-muted-foreground max-w-2xl mx-auto text-lg">
            From signing up to launching your first collaborative project in four simple steps.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting line for desktop */}
          <div className="hidden lg:block absolute top-[45px] left-[10%] right-[10%] h-0.5 bg-gradient-to-r from-primary/10 via-primary/40 to-primary/10 -z-10" />

          {steps.map((step, index) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: index * 0.15 }}
                className="flex flex-col items-center text-center group"
              >
                <div className="h-24 w-24 rounded-full bg-background border-4 border-card flex items-center justify-center mb-6 shadow-xl relative transition-transform duration-300 group-hover:scale-110 group-hover:border-primary/50">
                  <div className="absolute inset-0 bg-primary/5 rounded-full" />
                  <Icon className="h-10 w-10 text-primary z-10" />
                </div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm max-w-xs">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
