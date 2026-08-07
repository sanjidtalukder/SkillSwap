"use client";

import { motion } from "framer-motion";

export function HowItWorks() {
  const steps = [
    {
      title: "Create your developer profile",
      description: "Sign up and showcase your university, department, and current expertise. Add the technologies you know and the ones you want to learn.",
      badge: "Step 1",
      codeSnippet: `const profile = {
  role: "Fullstack Engineer",
  university: "MIT",
  skills: ["React", "Node.js"],
  learning: ["Rust", "GraphQL"]
};`
    },
    {
      title: "Discover open projects",
      description: "Browse featured projects created by other students. Filter by difficulty, category, or the specific skills you want to practice.",
      badge: "Step 2",
      codeSnippet: `// Matching algorithm at work
const matches = await findProjects({
  requiredSkills: { in: profile.skills },
  difficulty: "Intermediate",
  status: "Active"
});`
    },
    {
      title: "Collaborate and ship",
      description: "Use project workspaces and real-time chat to build amazing things together. Once finished, it's automatically added to your portfolio.",
      badge: "Step 3",
      codeSnippet: `$ git commit -m "feat: ship the MVP"
$ git push origin main

🚀 Project successfully deployed!
✅ Added to your SkillSwap portfolio.`
    },
  ];

  return (
    <section className="py-32 bg-background border-y border-border/40 relative">
      <div className="container mx-auto max-w-5xl px-4">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight">
            How it works
          </h2>
          <p className="mt-6 text-muted-foreground max-w-2xl mx-auto text-lg">
            From signing up to launching your first collaborative project in three simple steps. Designed for developers, by developers.
          </p>
        </div>

        <div className="space-y-24">
          {steps.map((step, index) => {
            const isEven = index % 2 === 0;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.7 }}
                className={`flex flex-col gap-12 items-center ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                {/* Text Content */}
                <div className="flex-1 space-y-6">
                  <div className="inline-flex items-center rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-medium text-primary">
                    {step.badge}
                  </div>
                  <h3 className="text-3xl font-bold">{step.title}</h3>
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {step.description}
                  </p>
                </div>

                {/* Code / Visual Mockup */}
                <div className="flex-1 w-full relative">
                  <div className="absolute inset-0 bg-primary/5 blur-3xl rounded-full" />
                  <div className="relative rounded-xl border border-border bg-[#0d1117] p-6 shadow-2xl overflow-hidden group hover:border-primary/50 transition-colors">
                    {/* Mac window controls */}
                    <div className="flex gap-2 mb-4">
                      <div className="w-3 h-3 rounded-full bg-red-500/80" />
                      <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                      <div className="w-3 h-3 rounded-full bg-green-500/80" />
                    </div>
                    <pre className="text-sm font-mono text-gray-300 overflow-x-auto">
                      <code>{step.codeSnippet}</code>
                    </pre>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
