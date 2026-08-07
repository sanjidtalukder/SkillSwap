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
    <section className="relative overflow-hidden pt-12 pb-20 md:pt-16 md:pb-32 lg:pt-24 lg:pb-40">
      {/* Background Gradients */}
      <div className="pointer-events-none absolute left-1/2 top-1/4 -z-10 h-[600px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-primary/30 to-indigo-600/20 blur-[120px] opacity-70" />
      <div className="pointer-events-none absolute right-0 bottom-0 -z-10 h-[400px] w-[600px] rounded-full bg-gradient-to-br from-blue-600/10 to-purple-600/20 blur-[100px]" />

      <div className="container mx-auto flex max-w-6xl flex-col lg:flex-row items-center px-4 gap-12 lg:gap-8">
        
        {/* Left Side: Text & CTA */}
        <div className="flex-1 text-center lg:text-left z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          >
            <Badge variant="primary" className="mb-6 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest shadow-sm shadow-primary/20 bg-primary/10 text-primary border-primary/20">
              The Premium Student Collaboration Platform
            </Badge>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl lg:leading-[1.1]"
          >
            Swap Skills. Build Projects. <br className="hidden lg:inline" />
            <span className="bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400 bg-clip-text text-transparent">
              Grow Together.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2, ease: "easeOut" }}
            className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground sm:text-xl mx-auto lg:mx-0"
          >
            Connect with ambitious students from top universities. Trade your expertise, collaborate on real-world projects, and build a portfolio that stands out.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3, ease: "easeOut" }}
            className="mt-10 flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start gap-4"
          >
            {isLoggedIn ? (
              <Link href={ROUTES.DASHBOARD}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]">
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <Link href={ROUTES.REGISTER}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all hover:scale-[1.02]">
                  Join Now
                </Button>
              </Link>
            )}
            <Link href={ROUTES.PROJECTS}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-12 px-8 text-base font-semibold bg-background/50 backdrop-blur-sm border-border/80 hover:bg-muted/50 transition-all hover:scale-[1.02]">
                Explore Projects
              </Button>
            </Link>
          </motion.div>
        </div>

        {/* Right Side: Floating UI Element Illustration */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.4, ease: "easeOut" }}
          className="flex-1 w-full relative hidden md:block z-10"
        >
          <div className="relative w-full aspect-square max-w-[500px] mx-auto">
            {/* Mock Floating Card 1 */}
            <motion.div 
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute top-[10%] right-[5%] w-[320px] rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-2xl"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500" />
                <div>
                  <div className="h-4 w-24 bg-foreground/10 rounded mb-2" />
                  <div className="h-3 w-16 bg-muted-foreground/20 rounded" />
                </div>
              </div>
              <div className="space-y-2 mb-4">
                <div className="h-3 w-full bg-foreground/5 rounded" />
                <div className="h-3 w-4/5 bg-foreground/5 rounded" />
              </div>
              <div className="flex gap-2">
                <div className="h-6 w-16 bg-primary/20 rounded-full" />
                <div className="h-6 w-20 bg-indigo-500/20 rounded-full" />
              </div>
            </motion.div>

            {/* Mock Floating Card 2 */}
            <motion.div 
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute bottom-[20%] left-[0%] w-[280px] rounded-xl border border-border/50 bg-card/60 backdrop-blur-xl p-5 shadow-2xl z-20"
            >
              <div className="flex justify-between items-center mb-4">
                <div className="h-5 w-24 bg-foreground/10 rounded" />
                <Badge variant="success" className="text-[10px]">Active</Badge>
              </div>
              <div className="h-3 w-full bg-foreground/5 rounded mb-2" />
              <div className="h-3 w-2/3 bg-foreground/5 rounded mb-4" />
              <div className="flex justify-between items-center mt-4 pt-4 border-t border-border/40">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full bg-blue-500/50 border-2 border-background" />
                  <div className="w-6 h-6 rounded-full bg-purple-500/50 border-2 border-background" />
                  <div className="w-6 h-6 rounded-full bg-pink-500/50 border-2 border-background" />
                </div>
                <div className="h-6 w-16 bg-primary/90 rounded-md" />
              </div>
            </motion.div>

            {/* Center Decorative Circle */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full border border-primary/20 border-dashed animate-spin-slow opacity-50" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 rounded-full border border-indigo-500/20 border-dashed animate-[spin_10s_linear_infinite_reverse] opacity-50" />
          </div>
        </motion.div>

      </div>
    </section>
  );
}
