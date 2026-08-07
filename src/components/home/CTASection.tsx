"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { ROUTES } from "@/constants";
import { useAuth } from "@/features/auth/hooks/useAuth";

export function CTASection() {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  return (
    <section className="relative overflow-hidden py-32 md:py-48 bg-[#0d1117] text-white border-t border-border/40">
      {/* Massive Radial Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[800px] w-[1000px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/30 via-indigo-500/10 to-transparent blur-[100px]" />
      
      {/* Grid background on dark */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff0a_1px,transparent_1px),linear-gradient(to_bottom,#ffffff0a_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]" />

      <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30, scale: 0.95 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <h2 className="text-5xl md:text-7xl font-black tracking-tight mb-8">
            Start building your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-400">
              engineering career
            </span>
          </h2>
          <p className="text-xl md:text-2xl text-gray-400 mb-12 max-w-2xl mx-auto">
            Join thousands of ambitious students. Find your co-founders, build real products, and get hired faster.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
            {!isLoggedIn ? (
              <Link href={ROUTES.REGISTER}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50 relative overflow-hidden group border border-primary/50">
                  <span className="relative z-10 flex items-center gap-2">
                    Create free account
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                  <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-in-out" />
                </Button>
              </Link>
            ) : (
              <Link href={ROUTES.DASHBOARD}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold shadow-2xl shadow-primary/30 transition-all hover:scale-105 hover:shadow-primary/50 border border-primary/50">
                  Go to Dashboard
                </Button>
              </Link>
            )}
            <Link href={ROUTES.PROJECTS}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold bg-white/5 backdrop-blur-sm border-white/10 hover:bg-white/10 hover:text-white transition-all text-gray-300">
                Explore Projects
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
