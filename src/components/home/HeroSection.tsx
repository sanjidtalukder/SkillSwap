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
    <section className="relative overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24 lg:pt-32 lg:pb-28">
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
              <div className="mx-auto flex items-center justify-center bg-background/50 h-6 w-64 rounded-md border border-border/30 text-[10px] text-muted-foreground font-medium font-mono">
                skillswap.app/workspace/wfc-2030
              </div>
            </div>
            {/* Content Mockup */}
            <div className="rounded-lg bg-background border border-border overflow-hidden h-[300px] sm:h-[500px] flex shadow-inner relative text-foreground">
              {/* Sidebar */}
              <div className="w-48 sm:w-56 border-r border-border bg-muted/30 hidden md:flex flex-col">
                <div className="p-4 border-b border-border/50 flex items-center gap-2">
                  <div className="w-6 h-6 rounded bg-primary flex items-center justify-center text-[10px] font-bold text-primary-foreground shadow-sm">
                    SS
                  </div>
                  <span className="font-semibold text-sm">SkillSwap</span>
                </div>
                <div className="p-3 flex-1 flex flex-col gap-1">
                  <div className="text-[10px] font-bold text-muted-foreground/70 px-2 py-1 mb-1 tracking-wider">WORKSPACE</div>
                  {/* Navigation Items */}
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md bg-primary/10 text-primary text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
                    Overview
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" /></svg>
                    Discussion
                    <span className="ml-auto bg-primary/20 text-primary text-[10px] px-1.5 py-0.5 rounded-full font-bold">3</span>
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                    Members
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
                    Tasks
                  </div>
                  <div className="flex items-center gap-2 px-2 py-1.5 rounded-md text-muted-foreground hover:bg-muted/50 hover:text-foreground transition-colors text-sm font-medium">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" /></svg>
                    Files
                  </div>
                </div>
                {/* User profile mini */}
                <div className="p-4 border-t border-border/50 flex items-center gap-3 bg-muted/10">
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 border border-border/50 shadow-sm" />
                  <div className="flex flex-col">
                    <span className="text-xs font-semibold">Alex Dev</span>
                    <span className="text-[10px] text-muted-foreground font-medium">Pro Member</span>
                  </div>
                </div>
              </div>

              {/* Main Area */}
              <div className="flex-1 flex flex-col bg-gradient-to-b from-background to-muted/10 overflow-hidden relative">
                {/* Header */}
                <div className="px-6 py-5 border-b border-border/50 flex flex-col gap-4 bg-background/50 backdrop-blur-sm z-10">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full border border-primary/20 uppercase tracking-wide">Active Project</span>
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse shadow-[0_0_5px_rgba(34,197,94,0.5)]" />
                          3 online
                        </span>
                      </div>
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground">World Football Cup 2030</h2>
                    </div>
                    
                    {/* Avatar stack */}
                    <div className="flex -space-x-2 hidden sm:flex">
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-blue-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-30">JD</div>
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-pink-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-20">SM</div>
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-orange-500 flex items-center justify-center text-[10px] font-bold text-white shadow-sm z-10">RJ</div>
                      <div className="w-8 h-8 rounded-full border-2 border-background bg-muted text-muted-foreground flex items-center justify-center text-[10px] font-bold shadow-sm z-0">+2</div>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span className="font-medium">Task Progress</span>
                      <span className="font-bold text-foreground">64%</span>
                    </div>
                    <div className="w-full bg-muted/50 rounded-full h-1.5 overflow-hidden border border-border/20">
                      <div className="bg-gradient-to-r from-primary to-purple-500 w-[64%] h-full rounded-full shadow-[0_0_10px_rgba(168,85,247,0.4)]" />
                    </div>
                  </div>
                </div>

                {/* Content Body */}
                <div className="p-6 flex-1 flex flex-col gap-5 overflow-hidden">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Task Card 1 */}
                    <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm flex flex-col gap-3 relative group hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-500 border border-blue-500/20">Frontend</span>
                        <svg className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold mb-1">Implement Live Match Dashboard</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">Build real-time stats component with WebSockets for the final match overview.</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3">
                        <div className="flex -space-x-1.5">
                          <div className="w-5 h-5 rounded-full border border-background bg-blue-500 z-20" />
                          <div className="w-5 h-5 rounded-full border border-background bg-pink-500 z-10" />
                        </div>
                        <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                          2d left
                        </span>
                      </div>
                    </div>
                    
                    {/* Task Card 2 */}
                    <div className="bg-card border border-border/60 rounded-xl p-4 shadow-sm flex flex-col gap-3 relative group hover:border-primary/30 transition-colors">
                      <div className="flex justify-between items-start">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-500 border border-purple-500/20">Backend</span>
                        <svg className="w-4 h-4 text-muted-foreground/50 group-hover:text-muted-foreground transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
                      </div>
                      <div>
                        <h4 className="text-sm font-bold mb-1">Optimize Ticket Queue API</h4>
                        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">Reduce latency by adding Redis caching for high traffic loads during finals.</p>
                      </div>
                      <div className="flex items-center justify-between mt-auto pt-3">
                        <div className="flex -space-x-1.5">
                          <div className="w-5 h-5 rounded-full border border-background bg-orange-500 z-10" />
                        </div>
                        <span className="text-[10px] font-bold text-green-500 flex items-center gap-1 bg-green-500/10 px-1.5 py-0.5 rounded-md border border-green-500/20">
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
                          Done
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Recent Activity area */}
                  <div className="mt-2 bg-card border border-border/60 rounded-xl p-4 shadow-sm flex-1 hidden sm:flex flex-col relative overflow-hidden group">
                    <h3 className="text-[10px] font-bold text-muted-foreground/80 mb-4 uppercase tracking-widest flex items-center gap-2">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                      Recent Activity
                    </h3>
                    <div className="flex flex-col gap-4 relative pl-1">
                      <div className="absolute left-3 top-2 bottom-0 w-[1.5px] bg-border/80" />
                      
                      <div className="flex items-start gap-3 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-pink-500 border-2 border-background flex-shrink-0 mt-0.5 shadow-sm" />
                        <div className="flex-1 text-xs">
                          <span className="font-semibold text-foreground">Sarah M.</span> <span className="text-muted-foreground">pushed 3 commits to</span> <span className="text-primary font-semibold bg-primary/10 px-1.5 py-0.5 rounded text-[10px]">feature/live-stats</span>
                          <div className="text-[10px] text-muted-foreground/70 mt-1 font-medium">10 minutes ago</div>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 relative z-10">
                        <div className="w-4 h-4 rounded-full bg-orange-500 border-2 border-background flex-shrink-0 mt-0.5 shadow-sm" />
                        <div className="flex-1 text-xs">
                          <span className="font-semibold text-foreground">Ryan J.</span> <span className="text-muted-foreground">completed task</span> <span className="text-foreground font-semibold">Optimize Ticket Queue API</span>
                          <div className="text-[10px] text-muted-foreground/70 mt-1 font-medium">2 hours ago</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Soft gradient fade for bottom cutoff effect */}
                <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background via-background/80 to-transparent pointer-events-none z-20" />
              </div>
            </div>
            
            {/* Floating badges around the mockup */}
            <motion.div 
              animate={{ y: [-10, 10, -10] }} 
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
              className="absolute -left-4 sm:-left-8 top-1/4 bg-card/90 backdrop-blur-md border border-border shadow-xl rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 hidden md:flex"
            >
              <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
              <span className="text-xs sm:text-sm font-semibold">React Dev Found</span>
            </motion.div>
            
            <motion.div 
              animate={{ y: [10, -10, 10] }} 
              transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
              className="absolute -right-4 sm:-right-8 top-1/3 bg-card/90 backdrop-blur-md border border-border shadow-xl rounded-full px-3 py-1.5 sm:px-4 sm:py-2 flex items-center gap-2 hidden md:flex"
            >
              <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
              <span className="text-xs sm:text-sm font-semibold">Workspace Active</span>
            </motion.div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
