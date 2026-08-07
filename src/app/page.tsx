import { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import prisma from "@/lib/prisma";
import { HeroSection } from "@/components/home/HeroSection";
import { StatsSection } from "@/components/home/StatsSection";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { TopMembers } from "@/components/home/TopMembers";
import { TrendingSkills } from "@/components/home/TrendingSkills";
import { HowItWorks } from "@/components/home/HowItWorks";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { RecentActivity } from "@/components/home/RecentActivity";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "SkillSwap | Swap Skills, Build Projects, Grow Together",
  description: "The premium student collaboration platform for swapping skills and building real-world projects.",
  openGraph: {
    title: "SkillSwap | Swap Skills, Build Projects, Grow Together",
    description: "The premium student collaboration platform for swapping skills and building real-world projects.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillSwap",
    description: "The premium student collaboration platform.",
  }
};

export default async function Home() {
  // Parallel data fetching for performance
  const [
    usersCount,
    projectsCount,
    skillsCount,
    connectionsCount,
    topProjects,
    topMembers,
    trendingSkills,
    recentActivities,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    prisma.skill.count(),
    prisma.matchRequest.count({ where: { status: "accepted" } }),
    
    prisma.project.findMany({
      where: { status: "active" },
      take: 3,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        requiredSkills: true,
        technologies: true,
        teamSize: true,
        difficulty: true,
        deadline: true,
        status: true,
        ownerId: true,
        owner: { select: { profile: { select: { fullName: true, photo: true } } } },
        _count: { select: { members: true } }
      }
    }),
    
    prisma.profile.findMany({
      where: { profileCompleted: true },
      take: 3,
      orderBy: { completedSwaps: "desc" }
    }),
    
    prisma.skill.findMany({
      take: 10,
      orderBy: { userSkills: { _count: "desc" } }
    }),
    
    prisma.projectActivity.findMany({
      take: 5,
      orderBy: { createdAt: "desc" }
    }),
  ]);

  // Format projects
  const formattedProjects = topProjects.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    requiredSkills: p.requiredSkills,
    technologies: p.technologies,
    teamSize: p.teamSize,
    difficulty: p.difficulty,
    deadline: p.deadline,
    status: p.status,
    ownerId: p.ownerId,
    ownerName: p.owner?.profile?.fullName || "Unknown",
    ownerPhoto: p.owner?.profile?.photo || "",
    currentMembers: p._count.members
  }));

  const stats = {
    users: usersCount,
    projects: projectsCount,
    skills: skillsCount,
    connections: connectionsCount
  };

  const formattedTrendingSkills = trendingSkills.map(s => ({
    id: s.id,
    name: s.name,
    count: 0
  }));

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <StatsSection stats={stats} />
        <FeaturedProjects projects={formattedProjects as any} />
        <TopMembers members={topMembers as any} />
        <TrendingSkills skills={formattedTrendingSkills} />
        <HowItWorks />
        <FeaturesSection />
        <RecentActivity activities={recentActivities as any} />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
