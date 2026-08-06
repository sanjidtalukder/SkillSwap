"use client";

import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { fetchWithAuth } from "@/lib/api-client";
import { useAuth } from "@/features/auth/hooks/useAuth";

interface Project {
  id: string;
  title: string;
  description: string;
  status: string;
  ownerId: string;
  ownerName: string;
  ownerPhoto: string;
  createdAt: string;
}

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProjects = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetchWithAuth("/api/projects");
      if (!response.ok) {
        throw new Error("Failed to load projects");
      }
      const data = await response.json();
      setProjects(data.data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading) {
      void fetchProjects();
    }
  }, [authLoading]);

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-6xl flex-1 space-y-8 p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Projects
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Browse projects seeking collaborators or start your own.
            </p>
          </div>
          {/* Note: In a complete implementation, a Create Project button/modal would go here */}
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {isLoading || authLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton count={6} />
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="group h-full hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
                <CardHeader className="space-y-4">
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="truncate text-lg">{project.title}</CardTitle>
                    <Badge variant={project.status === "active" ? "success" : "secondary"}>
                      {project.status.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <Avatar src={project.ownerPhoto} alt={project.ownerName} size="sm" />
                    <span className="truncate text-xs text-muted-foreground">
                      Created by {project.ownerName}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex h-full flex-col gap-4">
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No projects found"
            description="There are currently no active projects."
            actionLabel="Refresh Projects"
            onAction={fetchProjects}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
