"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { fetchWithAuth } from "@/lib/api-client";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { Search, Plus, Filter, Users, Calendar, FolderOpen, Code } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Project {
  id: string;
  title: string;
  description: string;
  category: string;
  requiredSkills: string[];
  technologies: string[];
  teamSize: number;
  difficulty: string;
  deadline: string | null;
  status: string;
  ownerId: string;
  ownerName: string;
  ownerPhoto: string;
  currentMembers: number;
  createdAt: string;
}

export default function ProjectsPage() {
  const { user, loading: authLoading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const fetchProjects = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      if (search) query.set("search", search);
      if (category) query.set("category", category);
      if (difficulty) query.set("difficulty", difficulty);

      const response = await fetchWithAuth(`/api/projects?${query.toString()}`);
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
  }, [search, category, difficulty]);

  useEffect(() => {
    if (!authLoading) {
      void fetchProjects();
    }
  }, [authLoading, fetchProjects]);

  // Debounced search logic could be added here, but for simplicity we rely on manual submit or onBlur
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProjects();
  };

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-6xl flex-1 space-y-8 p-6 md:p-10">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="space-y-2">
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              Project Board
            </h1>
            <p className="max-w-2xl text-sm text-muted-foreground">
              Discover active projects seeking collaborators or start your own to build a team.
            </p>
          </div>
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search projects by title, skill, tech..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-md border border-border/80 bg-background px-9 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="rounded-md border border-border/80 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Categories</option>
            <option value="Web Development">Web Development</option>
            <option value="Mobile App">Mobile App</option>
            <option value="Data Science">Data Science</option>
            <option value="Design">Design</option>
            <option value="Other">Other</option>
          </select>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="rounded-md border border-border/80 bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="">All Difficulties</option>
            <option value="Beginner">Beginner</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
          <Button type="submit" variant="secondary">Filter</Button>
        </form>

        {error && <Alert variant="error">{error}</Alert>}

        {isLoading || authLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton count={6} />
          </div>
        ) : projects.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => (
              <Card key={project.id} className="flex flex-col group h-full hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
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
                      by {project.ownerName}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                    {project.description}
                  </p>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground/80">
                    <div className="flex items-center gap-1">
                      <FolderOpen className="h-3 w-3" />
                      <span className="truncate">{project.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      <span>{project.currentMembers + 1}/{project.teamSize} Team</span>
                    </div>
                    {project.deadline && (
                      <div className="flex items-center gap-1 col-span-2">
                        <Calendar className="h-3 w-3" />
                        <span>Ends {formatDistanceToNow(new Date(project.deadline))}</span>
                      </div>
                    )}
                  </div>
                  
                  {project.technologies.length > 0 && (
                    <div className="mt-auto space-y-1.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground">
                        <Code className="h-3 w-3" />
                        <span>Tech Stack</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {project.technologies.slice(0, 3).map((tech) => (
                          <Badge key={tech} variant="outline" className="text-[10px] px-1.5 py-0">
                            {tech}
                          </Badge>
                        ))}
                        {project.technologies.length > 3 && (
                          <span className="text-[10px] text-muted-foreground">+{project.technologies.length - 3}</span>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
                <CardFooter className="pt-4 border-t border-border/40">
                  <Link href={`/projects/${project.id}`} className="w-full">
                    <Button variant="secondary" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </CardFooter>
              </Card>
            ))}
          </div>
        ) : (
          <EmptyState
            title="No projects found"
            description="There are currently no active projects matching your filters."
            actionLabel="Clear Filters"
            onAction={() => {
              setSearch("");
              setCategory("");
              setDifficulty("");
              fetchProjects();
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
