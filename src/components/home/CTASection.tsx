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
    <section className="relative overflow-hidden py-24 md:py-32">
      {/* Dynamic Background Glow */}
      <div className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[500px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-gradient-to-tr from-primary/20 via-indigo-500/10 to-purple-600/20 blur-[100px]" />
      
      <div className="container mx-auto px-4 relative z-10 text-center max-w-4xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-4xl md:text-5xl font-black tracking-tight mb-6">
            Ready to Build Your Next Project?
          </h2>
          <p className="text-lg md:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto">
            Join thousands of students who are already collaborating, learning new skills, and building their professional portfolios.
          </p>

          <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
            {!isLoggedIn ? (
              <Link href={ROUTES.REGISTER}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-transform">
                  Create Free Account
                </Button>
              </Link>
            ) : (
              <Link href={ROUTES.DASHBOARD}>
                <Button variant="primary" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold shadow-xl shadow-primary/25 hover:scale-105 transition-transform">
                  Go to Dashboard
                </Button>
              </Link>
            )}
            <Link href={ROUTES.PROJECTS}>
              <Button variant="outline" size="lg" className="w-full sm:w-auto h-14 px-10 text-lg font-bold bg-background/50 backdrop-blur-sm border-border/80 hover:bg-muted/50 hover:scale-105 transition-transform">
                Explore Projects
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
