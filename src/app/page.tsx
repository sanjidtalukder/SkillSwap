import { Metadata } from "next";
import { Header } from "@/components/common/Header";
import { Footer } from "@/components/common/Footer";
import prisma from "@/lib/prisma";
import { HeroSection } from "@/components/home/HeroSection";
import { SocialProofSection } from "@/components/home/SocialProofSection";
import { BentoFeatures } from "@/components/home/BentoFeatures";
import { FeaturedProjects } from "@/components/home/FeaturedProjects";
import { HowItWorks } from "@/components/home/HowItWorks";
import { CTASection } from "@/components/home/CTASection";

export const metadata: Metadata = {
  title: "SkillSwap | The Premium Student Collaboration Platform",
  description: "Swap skills, build real-world projects, and grow together. Inspired by modern SaaS workflows.",
  openGraph: {
    title: "SkillSwap | The Premium Student Collaboration Platform",
    description: "Swap skills, build real-world projects, and grow together.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SkillSwap",
    description: "The premium student collaboration platform.",
  }
};

export const revalidate = 60; // Cache the landing page

export default async function Home() {
  // Only fetch what's absolutely necessary for the landing page showcase
  const [
    usersCount,
    projectsCount,
    topProjects,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.project.count(),
    
    prisma.project.findMany({
      where: { status: "active" },
      take: 4,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        description: true,
        category: true,
        requiredSkills: true,
        technologies: true,
        status: true,
        ownerId: true,
        owner: { select: { profile: { select: { fullName: true, photo: true } } } },
        _count: { select: { members: true } }
      }
    })
  ]);

  // Format projects
  const formattedProjects = topProjects.map(p => ({
    id: p.id,
    title: p.title,
    description: p.description,
    category: p.category,
    requiredSkills: p.requiredSkills,
    technologies: p.technologies,
    status: p.status,
    ownerId: p.ownerId,
    ownerName: p.owner?.profile?.fullName || "Unknown",
    ownerPhoto: p.owner?.profile?.photo || "",
    currentMembers: p._count.members
  }));

  const stats = {
    users: usersCount,
    projects: projectsCount,
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground selection:bg-primary/20">
      <Header />
      
      <main className="flex-1">
        <HeroSection />
        <SocialProofSection stats={stats} />
        <BentoFeatures />
        <HowItWorks />
        <FeaturedProjects projects={formattedProjects as any} />
        <CTASection />
      </main>

      <Footer />
    </div>
  );
}
