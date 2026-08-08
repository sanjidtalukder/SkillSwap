"use client";

import { motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";

export function BentoSkillMatchingVisual() {
  return (
    <div className="mt-8 relative flex-1 min-h-[220px] rounded-xl flex items-center justify-center">
      {/* Decorative background grid for the visualization */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:16px_16px] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative w-full max-w-[500px] h-full flex items-center justify-between px-2 sm:px-8">
        {/* User Needs Node */}
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
          className="w-32 sm:w-44 bg-background/80 backdrop-blur-md border border-border rounded-xl p-3 sm:p-4 shadow-xl relative z-10"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">You</div>
            <span className="text-xs font-bold text-foreground">Looking for</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md font-bold">React</span>
            <span className="text-[10px] px-2 py-1 bg-muted/50 text-muted-foreground border border-border/50 rounded-md font-medium">Node.js</span>
          </div>
        </motion.div>

        {/* Connection Animation */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[140px] sm:w-[200px] flex items-center justify-center z-0">
          <svg className="w-full h-8 overflow-visible" viewBox="0 0 100 20" preserveAspectRatio="none">
            <path d="M0,10 L100,10" fill="none" stroke="currentColor" className="text-border/60" strokeWidth="1.5" strokeDasharray="4 4" />
            <motion.path 
              d="M0,10 L100,10" 
              fill="none" 
              stroke="url(#glowGradient)" 
              strokeWidth="2.5" 
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: [0, 1, 0] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <defs>
              <linearGradient id="glowGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="rgba(59, 130, 246, 0)" />
                <stop offset="50%" stopColor="rgba(59, 130, 246, 1)" />
                <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Match Badge */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            className="absolute bg-background/90 backdrop-blur-md border border-blue-500/30 px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-[0_0_20px_rgba(59,130,246,0.15)] z-10"
          >
            <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.8)] animate-pulse" />
            <span className="text-[10px] font-bold text-foreground">98% Match</span>
          </motion.div>
        </div>

        {/* Matched User Node */}
        <motion.div 
          whileHover={{ y: -5 }}
          transition={{ duration: 0.3 }}
          className="w-32 sm:w-44 bg-background/80 backdrop-blur-md border border-border rounded-xl p-3 sm:p-4 shadow-xl relative z-10"
        >
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center text-[10px] font-bold text-white shadow-inner">AL</div>
            <span className="text-xs font-bold text-foreground">Alex</span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[10px] px-2 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-md font-bold">React</span>
            <span className="text-[10px] px-2 py-1 bg-purple-500/10 text-purple-400 border border-purple-500/20 rounded-md font-bold">Figma</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export function BentoRealtimeVisual() {
  return (
    <div className="mt-6 relative h-28 w-full border border-border/50 rounded-lg bg-background/50 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/90 z-10 pointer-events-none" />
      
      <div className="p-3 flex flex-col gap-2.5 relative z-0 opacity-80">
        {/* Fake chat */}
        <div className="flex items-end gap-2">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-500 to-indigo-500 shrink-0 shadow-sm" />
          <div className="bg-muted px-3 py-2 rounded-2xl rounded-bl-sm w-3/4 shadow-sm border border-border/30">
            <div className="h-1.5 w-full bg-border rounded-full mb-1.5" />
            <div className="h-1.5 w-2/3 bg-border rounded-full" />
          </div>
        </div>
        <div className="flex items-end gap-2 flex-row-reverse mt-1">
          <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 shrink-0 shadow-sm" />
          <div className="bg-indigo-500/10 px-3 py-2 rounded-2xl rounded-br-sm w-1/2 shadow-sm border border-indigo-500/20">
            <div className="h-1.5 w-full bg-indigo-500/40 rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Floating Task / Activity */}
      <motion.div 
        animate={{ y: [0, -3, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute right-3 top-3 bg-card border border-border shadow-xl rounded-md p-2.5 w-28 z-20"
      >
        <div className="flex items-center justify-between mb-2">
          <span className="text-[8px] font-bold uppercase text-green-500 tracking-wider">Completed</span>
          <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.6)] animate-pulse" />
        </div>
        <div className="h-1.5 w-full bg-muted rounded-full mb-1.5" />
        <div className="h-1.5 w-4/5 bg-muted rounded-full" />
      </motion.div>
    </div>
  );
}

export function BentoPortfolioVisual() {
  return (
    <div className="mt-6 relative h-28 w-full border border-border/50 rounded-lg bg-background/50 overflow-hidden flex items-end justify-center pb-0">
      {/* Upward progression background lines */}
      <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(168,85,247,0.05)_1px,transparent_1px)] bg-[size:100%_12px] pointer-events-none" />
      
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
        className="relative z-10 w-5/6 bg-card border border-border shadow-2xl rounded-t-xl p-3"
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-5 h-5 bg-purple-500/10 rounded flex items-center justify-center border border-purple-500/20">
              <svg className="w-3 h-3 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
            </div>
            <span className="text-[11px] font-bold text-foreground">Fintech Dashboard</span>
          </div>
          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20 flex items-center gap-1 shadow-sm">
            <ShieldCheck className="w-2.5 h-2.5" /> Verified
          </span>
        </div>
        <div className="flex gap-1.5 mb-2.5">
          <span className="w-8 h-1.5 bg-muted rounded-full" />
          <span className="w-6 h-1.5 bg-muted rounded-full" />
          <span className="w-10 h-1.5 bg-muted rounded-full" />
        </div>
        <div className="w-full h-1 bg-muted rounded-full overflow-hidden">
          <motion.div 
            initial={{ width: "0%" }}
            whileInView={{ width: "100%" }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 1.2, delay: 0.5, ease: "easeOut" }}
            className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 relative" 
          >
            <div className="absolute top-0 right-0 bottom-0 w-4 bg-white/30 blur-[2px]" />
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}
