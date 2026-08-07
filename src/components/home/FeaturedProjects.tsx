"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { FolderOpen, Users, Calendar, Code } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { AuthGuardModal } from "./AuthGuardModal";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  technologies: string[];
  teamSize: number;
  difficulty: string;
  deadline: Date | null;
  status: string;
  ownerId: string;
  ownerName: string;
  ownerPhoto: string;
  currentMembers: number;
}

interface FeaturedProjectsProps {
  projects: Project[];
}

export function FeaturedProjects({ projects }: FeaturedProjectsProps) {
  const { user } = useAuth();
  const isLoggedIn = !!user;
  const [showAuthModal, setShowAuthModal] = useState(false);

  const handleJoinClick = (e: React.MouseEvent, projectId: string) => {
    if (!isLoggedIn) {
      e.preventDefault();
      setShowAuthModal(true);
    }
    // If logged in, the Link will naturally navigate to the project details page where they can join
  };

  return (
    <section className="py-24 bg-gradient-to-b from-background to-muted/20 relative z-10 border-t border-border/40">
      <div className="container mx-auto max-w-6xl px-4">
        
        <div className="mb-16 text-center md:text-left flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-extrabold tracking-tight mb-4">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">active projects</span>
            </h2>
            <p className="text-muted-foreground text-lg">
              Join teams building real-world applications. Enhance your resume, learn new tech, and collaborate globally.
            </p>
          </div>
          <Link href="/projects" className="shrink-0">
            <Button variant="outline" className="hidden md:flex bg-background/50 backdrop-blur-sm border-border/80 group">
              View all projects
              <span className="ml-2 group-hover:translate-x-1 transition-transform">→</span>
            </Button>
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="group flex h-full flex-col hover:-translate-y-2 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 bg-card/60 backdrop-blur-sm">
                <CardHeader className="space-y-4 pb-4">
                  <div className="flex items-start justify-between gap-3">
                    <CardTitle className="line-clamp-2 text-xl leading-tight font-bold">{project.title}</CardTitle>
                    <Badge variant={project.difficulty === "Beginner" ? "success" : project.difficulty === "Advanced" ? "destructive" : "warning"} className="shrink-0 text-[10px] uppercase">
                      {project.difficulty}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar src={project.ownerPhoto} alt={project.ownerName} size="sm" />
                    <span className="truncate text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors">
                      {project.ownerName}
                    </span>
                  </div>
                </CardHeader>
                
                <CardContent className="flex flex-1 flex-col gap-5 pt-0">
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground/90">
                    {project.description}
                  </p>

                  <div className="grid grid-cols-2 gap-3 text-sm font-medium text-muted-foreground/80 bg-background/50 rounded-lg p-3 border border-border/40">
                    <div className="flex items-center gap-2">
                      <FolderOpen className="h-4 w-4 text-blue-400" />
                      <span className="truncate">{project.category}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-purple-400" />
                      <span>
                        {project.currentMembers}/{project.teamSize} Slots
                      </span>
                    </div>
                    {project.deadline && (
                      <div className="col-span-2 flex items-center gap-2 pt-1 border-t border-border/40 mt-1">
                        <Calendar className="h-4 w-4 text-amber-400" />
                        <span>Ends {formatDistanceToNow(new Date(project.deadline))}</span>
                      </div>
                    )}
                  </div>

                  {project.requiredSkills.length > 0 && (
                    <div className="mt-auto space-y-2">
                      <div className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        <Code className="h-3 w-3" />
                        <span>Looking for</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        {project.requiredSkills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="bg-primary/10 text-primary hover:bg-primary/20 transition-colors border-0">
                            {skill}
                          </Badge>
                        ))}
                        {project.requiredSkills.length > 3 && (
                          <span className="text-xs font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                            +{project.requiredSkills.length - 3}
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                
                <CardFooter className="border-t border-border/40 pt-4 pb-5 flex gap-3">
                  <Link href={`/projects/${project.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full font-medium">
                      Details
                    </Button>
                  </Link>
                  <Link href={`/projects/${project.id}`} onClick={(e) => handleJoinClick(e, project.id)} className="flex-1">
                    <Button variant="primary" className="w-full font-medium">
                      Join Project
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
        
        <div className="mt-10 text-center md:hidden">
          <Link href="/projects">
            <Button variant="outline" className="w-full">
              View All Projects
            </Button>
          </Link>
        </div>
      </div>
      
      <AuthGuardModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)}
        title="Login to Join Project"
        description="You must be logged in to join projects and collaborate with other students."
      />
    </section>
  );
}
