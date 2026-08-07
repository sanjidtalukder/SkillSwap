"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { ROUTES } from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function HeroSection() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  return (
    <section className="relative overflow-hidden pt-20 pb-24 md:pt-28 md:pb-36 lg:pt-32 lg:pb-48">
      {/* Premium Dark/Light Mode Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/20 blur-[120px] opacity-70" />
      
      {/* Minimal grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_100%)]" />

      <div className="container mx-auto flex max-w-6xl flex-col items-center px-4 relative z-10">
        
        {/* Center-aligned Text & CTA (Vercel/Linear style) */}
        <div className="flex flex-col items-center text-center w-full max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Link href="/projects" className="inline-flex items-center gap-2 mb-8 px-4 py-1.5 rounded-full border border-border/50 bg-muted/30 backdrop-blur-md text-sm font-medium transition-colors hover:bg-muted/50 hover:border-border cursor-pointer">
              <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span>SkillSwap 2.0 is now live</span>
              <span className="text-muted-foreground ml-1">→</span>
            </Link>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-5xl font-extrabold tracking-tight sm:text-7xl lg:text-[5rem] lg:leading-[1.1] mb-6"
          >
            Swap Skills. Build Projects.<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-purple-500">
              Grow Together.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="max-w-2xl text-lg sm:text-xl leading-relaxed text-muted-foreground mb-10"
          >
            The premium collaboration platform for ambitious students. Trade your expertise, manage tasks in real-time, and build a world-class portfolio.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="flex flex-col sm:flex-row justify-center gap-4 w-full sm:w-auto"
          >
            {isLoggedIn ? (
              <Link href={ROUTES.DASHBOARD} className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href={ROUTES.REGISTER} className="w-full sm:w-auto">
                <Button variant="primary" size="lg" className="w-full h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:shadow-primary/40 group relative overflow-hidden">
                  <span className="relative z-10">Start Building Free</span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                </Button>
              </Link>
            )}
            <Link href={ROUTES.PROJECTS} className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full h-12 px-8 text-base font-semibold bg-background/50 backdrop-blur-sm border-border hover:bg-muted transition-all">
                Explore Projects
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Floating Mockup (Hero Image/UI) */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: "easeOut" }}
          className="w-full mt-16 md:mt-24 relative perspective-[2000px] z-20"
        >
          <div className="relative mx-auto max-w-5xl rounded-xl sm:rounded-2xl border border-border/50 bg-card/40 backdrop-blur-xl shadow-2xl p-2 sm:p-4 rotate-x-12 hover:rotate-x-0 transition-transform duration-700 ease-in-out transform-style-3d">
            {/* Browser top bar */}
            <div className="flex items-center gap-2 mb-4 px-2">
              <div className="w-3 h-3 rounded-full bg-red-500/80" />
              <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
              <div className="w-3 h-3 rounded-full bg-green-500/80" />
              <div className="mx-auto bg-background/50 h-6 w-64 rounded-md border border-border/30" />
            </div>
            {/* Content Mockup */}
            <div className="rounded-lg bg-background border border-border overflow-hidden h-[300px] sm:h-[500px] flex shadow-inner">
              {/* Sidebar */}
              <div className="w-48 sm:w-64 border-r border-border bg-muted/10 hidden md:flex flex-col p-4 gap-4">
                <div className="h-6 w-24 bg-muted rounded" />
                <div className="space-y-3 mt-6">
                  <div className="h-8 w-full bg-primary/10 rounded-md" />
                  <div className="h-8 w-full bg-muted/50 rounded-md" />
                  <div className="h-8 w-full bg-muted/50 rounded-md" />
                </div>
              </div>
              {/* Main Area */}
              <div className="flex-1 p-6 sm:p-8 flex flex-col gap-6 bg-gradient-to-b from-background to-muted/20">
                <div className="flex justify-between items-center">
                  <div className="h-8 w-48 bg-muted rounded-md" />
                  <div className="h-10 w-32 bg-primary rounded-md" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="h-32 bg-card border border-border/50 rounded-xl shadow-sm p-4 flex flex-col gap-3">
                    <div className="h-4 w-24 bg-muted rounded" />
                    <div className="h-8 w-full bg-indigo-500/20 rounded mt-auto" />
                  </div>
                  <div className="h-32 bg-card border border-border/50 rounded-xl shadow-sm p-4 flex flex-col gap-3">
                    <div className="h-4 w-32 bg-muted rounded" />
                    <div className="flex gap-2 mt-auto">
                      <div className="h-8 w-8 rounded-full bg-purple-500/50" />
                      <div className="h-8 w-8 rounded-full bg-blue-500/50 -ml-4 border-2 border-background" />
                    </div>
                  </div>
                </div>
                <div className="h-48 w-full bg-card border border-border/50 rounded-xl shadow-sm" />
              </div>
            </div>
            
            {/* Floating badges around the mockup */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -left-6 top-1/4 bg-background border border-border shadow-lg rounded-full px-4 py-2 flex items-center gap-2 hidden md:flex"
            >
              <div className="w-2 h-2 rounded-full bg-green-500" />
              <span className="text-sm font-medium">React Dev Found</span>
            </motion.div>
            
            <motion.div 
              animate={{ y: [10, -10, 10] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -right-6 top-1/3 bg-background border border-border shadow-lg rounded-full px-4 py-2 flex items-center gap-2 hidden md:flex"
            >
              <span className="text-sm font-medium">Workspace Active</span>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
