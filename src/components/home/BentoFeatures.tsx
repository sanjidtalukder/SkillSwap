import { Code2, MessagesSquare, Trophy, ShieldCheck, Zap, Globe } from "lucide-react";

export function BentoFeatures() {
  return (
    <section className="py-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-4">
            Everything you need to <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-500">ship faster</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            SkillSwap isn't just a matching platform. It's an entire ecosystem designed for ambitious students to build real products.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[300px]">
          
          {/* Bento Box 1: Large */}
          <div className="md:col-span-2 md:row-span-2 rounded-3xl bg-card border border-border/50 p-8 flex flex-col relative overflow-hidden group hover:border-primary/30 transition-colors shadow-sm">
            <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/4 group-hover:bg-blue-500/20 transition-all duration-500" />
            <div className="bg-primary/10 w-14 h-14 rounded-2xl flex items-center justify-center mb-6">
              <Code2 className="w-7 h-7 text-primary" />
            </div>
            <h3 className="text-2xl font-bold mb-3">Smart Skill Matching</h3>
            <p className="text-muted-foreground text-lg max-w-md">
              Our algorithm finds students who have the exact skills you need, and who are looking for the skills you can offer. It's a perfect technical barter.
            </p>
            
            <div className="mt-auto pt-8 flex gap-4">
              {/* Mock UI snippet */}
              <div className="flex-1 bg-background rounded-xl border border-border/50 p-4 shadow-sm flex flex-col gap-3 opacity-90 group-hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-20 bg-muted rounded" />
                  <div className="h-4 w-12 bg-primary/20 rounded" />
                </div>
                <div className="h-2 w-full bg-muted rounded" />
                <div className="h-2 w-4/5 bg-muted rounded" />
              </div>
              <div className="flex-1 bg-background rounded-xl border border-border/50 p-4 shadow-sm hidden sm:flex flex-col gap-3 opacity-70 group-hover:opacity-100 transition-opacity">
                <div className="flex justify-between items-center">
                  <div className="h-4 w-24 bg-muted rounded" />
                  <div className="h-4 w-12 bg-indigo-500/20 rounded" />
                </div>
                <div className="h-2 w-full bg-muted rounded" />
                <div className="h-2 w-3/5 bg-muted rounded" />
              </div>
            </div>
          </div>

          {/* Bento Box 2: Medium */}
          <div className="rounded-3xl bg-card border border-border/50 p-8 flex flex-col relative overflow-hidden group hover:border-indigo-500/30 transition-colors shadow-sm">
            <div className="absolute bottom-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl group-hover:bg-indigo-500/20 transition-all" />
            <div className="bg-indigo-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <MessagesSquare className="w-6 h-6 text-indigo-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Real-time Workspaces</h3>
            <p className="text-muted-foreground">
              Built-in chat, task management, and file sharing for every project you join.
            </p>
          </div>

          {/* Bento Box 3: Medium */}
          <div className="rounded-3xl bg-card border border-border/50 p-8 flex flex-col relative overflow-hidden group hover:border-purple-500/30 transition-colors shadow-sm">
             <div className="absolute top-0 left-0 w-32 h-32 bg-purple-500/10 rounded-full blur-2xl group-hover:bg-purple-500/20 transition-all" />
            <div className="bg-purple-500/10 w-12 h-12 rounded-xl flex items-center justify-center mb-6">
              <Trophy className="w-6 h-6 text-purple-500" />
            </div>
            <h3 className="text-xl font-bold mb-2">Auto-Portfolio</h3>
            <p className="text-muted-foreground">
              Every completed project automatically gets added to your verified SkillSwap portfolio.
            </p>
          </div>

          {/* Bento Box 4: Small-ish */}
          <div className="rounded-3xl bg-card border border-border/50 p-8 flex flex-col justify-center items-center text-center relative overflow-hidden group hover:border-green-500/30 transition-colors shadow-sm">
            <ShieldCheck className="w-10 h-10 text-green-500 mb-4" />
            <h3 className="text-lg font-bold mb-2">University Verified</h3>
            <p className="text-sm text-muted-foreground">Connect with real students securely.</p>
          </div>

          {/* Bento Box 5: Wide */}
          <div className="md:col-span-2 rounded-3xl bg-gradient-to-r from-card to-muted/20 border border-border/50 p-8 flex flex-col sm:flex-row items-center gap-8 group shadow-sm hover:border-primary/30 transition-colors">
            <div className="flex-1">
              <div className="flex gap-2 mb-4">
                <span className="bg-blue-500/10 text-blue-500 text-xs font-bold px-2 py-1 rounded">Global</span>
                <span className="bg-orange-500/10 text-orange-500 text-xs font-bold px-2 py-1 rounded">Fast</span>
              </div>
              <h3 className="text-2xl font-bold mb-3">Find talent anywhere</h3>
              <p className="text-muted-foreground">
                Break outside your university bubble. Collaborate cross-border and learn how global teams ship products.
              </p>
            </div>
            <div className="w-32 h-32 rounded-full bg-background border-4 border-muted flex items-center justify-center shrink-0 relative overflow-hidden group-hover:scale-105 transition-transform">
              <Globe className="w-16 h-16 text-muted-foreground/30 animate-pulse" />
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
