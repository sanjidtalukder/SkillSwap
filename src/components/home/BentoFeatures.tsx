import { Code2, MessagesSquare, Trophy, ShieldCheck } from "lucide-react";
import { BentoSkillMatchingVisual, BentoRealtimeVisual, BentoPortfolioVisual } from "./BentoVisuals";

export function BentoFeatures() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">ship faster</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SkillSwap isn&apos;t just a matching platform. It&apos;s an entire ecosystem designed for ambitious students to build real products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* Bento Box 1: Large - Smart Skill Matching */}
          <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 p-8 flex flex-col relative overflow-hidden group shadow-sm hover:border-blue-500/30 transition-colors">
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/4 group-hover:bg-blue-500/10 transition-all duration-700 pointer-events-none" />
            
            <div className="relative z-10">
              <div className="bg-blue-500/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6 border border-blue-500/20 shadow-[0_0_15px_rgba(59,130,246,0.1)]">
                <Code2 className="w-7 h-7 text-blue-500" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-bold mb-3">Smart Skill Matching</h3>
              <p className="text-muted-foreground text-lg max-w-md">
                Our algorithm finds students who have the exact skills you need, and who are looking for the skills you can offer. It&apos;s a perfect technical barter.
              </p>
            </div>
            
            <BentoSkillMatchingVisual />
          </div>

          {/* Bento Box 2: Medium - Real-time Workspaces */}
          <div className="rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 p-6 sm:p-8 flex flex-col relative overflow-hidden group shadow-sm hover:border-indigo-500/40 transition-colors">
            <div className="absolute bottom-0 right-0 w-[250px] h-[250px] bg-indigo-500/5 rounded-full blur-[60px] group-hover:bg-indigo-500/15 transition-all duration-700 pointer-events-none" />
            
            <div className="relative z-10 mb-auto">
              <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.1)]">
                <MessagesSquare className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Real-time Workspaces</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Built-in chat, task management, and file sharing for every project you join.
              </p>
            </div>

            <BentoRealtimeVisual />
          </div>

          {/* Bento Box 3: Medium - Auto-Portfolio */}
          <div className="rounded-3xl bg-card/60 backdrop-blur-xl border border-border/50 p-6 sm:p-8 flex flex-col relative overflow-hidden group shadow-sm hover:border-purple-500/40 transition-colors">
            <div className="absolute top-0 left-0 w-[250px] h-[250px] bg-purple-500/5 rounded-full blur-[60px] group-hover:bg-purple-500/15 transition-all duration-700 pointer-events-none" />
            
            <div className="relative z-10 mb-auto">
              <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-5 border border-purple-500/20 shadow-[0_0_15px_rgba(168,85,247,0.1)]">
                <Trophy className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold mb-2">Auto-Portfolio</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Every completed project automatically gets added to your verified SkillSwap portfolio.
              </p>
            </div>

            <BentoPortfolioVisual />
          </div>

        </div>
      </div>
    </section>
  );
}
