"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Pagination } from "@/components/ui/Pagination";
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

interface PaginationData {
  items: Project[];
  currentPage: number;
  totalPages: number;
  totalItems: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export default function ProjectsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user, loading: authLoading } = useAuth();
  
  const initialPage = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  
  const [paginationData, setPaginationData] = useState<PaginationData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const [search, setSearch] = useState(searchParams.get("search") || "");
  const [category, setCategory] = useState(searchParams.get("category") || "");
  const [difficulty, setDifficulty] = useState(searchParams.get("difficulty") || "");

  const limit = 10;

  const updateUrl = useCallback((newPage: number, newSearch: string, newCategory: string, newDifficulty: string) => {
    const query = new URLSearchParams();
    if (newPage > 1) query.set("page", newPage.toString());
    if (newSearch) query.set("search", newSearch);
    if (newCategory) query.set("category", newCategory);
    if (newDifficulty) query.set("difficulty", newDifficulty);
    
    router.push(`${pathname}?${query.toString()}`, { scroll: false });
  }, [pathname, router]);

  const fetchProjects = useCallback(async (pageToFetch: number) => {
    setIsLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams();
      query.set("page", pageToFetch.toString());
      query.set("limit", limit.toString());
      if (search) query.set("search", search);
      if (category) query.set("category", category);
      if (difficulty) query.set("difficulty", difficulty);

      const response = await fetchWithAuth(`/api/projects?${query.toString()}`);
      if (!response.ok) {
        throw new Error("Failed to load projects");
      }
      const data = await response.json();
      setPaginationData(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch projects");
    } finally {
      setIsLoading(false);
    }
  }, [search, category, difficulty]);

  useEffect(() => {
    if (!authLoading) {
      void fetchProjects(initialPage);
    }
  }, [authLoading, fetchProjects, initialPage]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateUrl(1, search, category, difficulty);
  };

  const handleFilterChange = (type: "category" | "difficulty", value: string) => {
    if (type === "category") setCategory(value);
    if (type === "difficulty") setDifficulty(value);
    updateUrl(1, search, type === "category" ? value : category, type === "difficulty" ? value : difficulty);
  };

  const handlePageChange = (newPage: number) => {
    updateUrl(newPage, search, category, difficulty);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const projects = paginationData?.items || [];

  return (
    <div className="relative flex min-h-screen flex-col overflow-hidden bg-slate-950 text-foreground selection:bg-primary/20 selection:text-primary-200">
      {/* Ambient background glow orbs */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-indigo-600/15 blur-[120px]" />
        <div className="absolute top-1/4 -right-40 h-[600px] w-[600px] rounded-full bg-cyan-600/10 blur-[140px]" />
        <div className="absolute -bottom-40 left-1/3 h-[500px] w-[500px] rounded-full bg-primary/10 blur-[120px]" />
        {/* Subtle grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b12_1px,transparent_1px),linear-gradient(to_bottom,#1e293b12_1px,transparent_1px)] bg-[size:32px_32px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]" />
      </div>

      <Header />
      <main className="container relative z-10 mx-auto max-w-6xl flex-1 space-y-8 p-6 md:p-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800/60 pb-8">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/10 text-xs font-semibold text-primary">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Collaborate & Build
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Project Board
            </h1>
            <p className="max-w-2xl text-sm md:text-base text-slate-400">
              Discover active projects seeking collaborators or start your own to build an amazing team.
            </p>
          </div>
          <Link href="/projects/new">
            <Button className="shadow-lg shadow-primary/20 hover:shadow-primary/30 font-semibold px-5 py-2.5">
              <Plus className="mr-2 h-4 w-4" />
              Create Project
            </Button>
          </Link>
        </div>

        {/* Filters and Search */}
        <form onSubmit={handleSearchSubmit} className="flex flex-col gap-3 sm:flex-row p-3 rounded-2xl bg-slate-900/60 border border-slate-800 shadow-xl shadow-black/20 backdrop-blur-md">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search projects by title, skill, tech..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full rounded-xl border border-slate-700/60 bg-slate-950/60 pl-10 pr-4 py-2.5 text-sm text-foreground placeholder:text-slate-500 focus:border-primary focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-primary transition-all"
            />
          </div>
          <select
            value={category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
            className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
          >
            <option value="" className="bg-slate-900">All Categories</option>
            <option value="Web Development" className="bg-slate-900">Web Development</option>
            <option value="Mobile App" className="bg-slate-900">Mobile App</option>
            <option value="Data Science" className="bg-slate-900">Data Science</option>
            <option value="Design" className="bg-slate-900">Design</option>
            <option value="Other" className="bg-slate-900">Other</option>
          </select>
          <select
            value={difficulty}
            onChange={(e) => handleFilterChange("difficulty", e.target.value)}
            className="rounded-xl border border-slate-700/60 bg-slate-950/60 px-3.5 py-2.5 text-sm text-slate-200 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary transition-all cursor-pointer"
          >
            <option value="" className="bg-slate-900">All Difficulties</option>
            <option value="Beginner" className="bg-slate-900">Beginner</option>
            <option value="Intermediate" className="bg-slate-900">Intermediate</option>
            <option value="Advanced" className="bg-slate-900">Advanced</option>
          </select>
          <Button type="submit" variant="secondary" className="border border-slate-700/70 hover:border-slate-500 hover:bg-slate-800">
            <Filter className="mr-2 h-4 w-4 text-primary" />
            Filter
          </Button>
        </form>

        {error && <Alert variant="error">{error}</Alert>}

        {isLoading || authLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <CardSkeleton count={limit} />
          </div>
        ) : projects.length > 0 ? (
          <div className="space-y-8">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="group relative flex h-full flex-col overflow-hidden border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-slate-900/70 to-slate-950/90 p-1 hover:-translate-y-1.5 hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/15 transition-all duration-300"
                >
                  <div className="p-5 flex flex-col h-full">
                    <CardHeader className="p-0 space-y-3 pb-4">
                      <div className="flex items-start justify-between gap-2">
                        <CardTitle className="line-clamp-1 text-lg font-bold text-slate-100 group-hover:text-primary transition-colors">
                          {project.title}
                        </CardTitle>
                        <Badge 
                          variant={project.status === "active" ? "success" : "secondary"}
                          className="shrink-0 text-[10px] tracking-wide uppercase px-2 py-0.5"
                        >
                          {project.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <Avatar src={project.ownerPhoto} alt={project.ownerName} size="sm" className="ring-1 ring-slate-700" />
                        <span className="truncate text-xs font-medium text-slate-400">
                          by <span className="text-slate-300 hover:text-white">{project.ownerName}</span>
                        </span>
                      </div>
                    </CardHeader>

                    <CardContent className="p-0 flex flex-1 flex-col gap-4">
                      <p className="line-clamp-3 text-sm leading-relaxed text-slate-400/90">
                        {project.description}
                      </p>

                      <div className="grid grid-cols-2 gap-2.5 py-3 px-3.5 rounded-xl bg-slate-950/50 border border-slate-800/60 text-xs text-slate-400">
                        <div className="flex items-center gap-1.5 truncate">
                          <FolderOpen className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate font-medium text-slate-300">{project.category}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Users className="h-3.5 w-3.5 text-indigo-400 shrink-0" />
                          <span className="font-medium text-slate-300">
                            {project.currentMembers + 1}/{project.teamSize} Team
                          </span>
                        </div>
                        {project.deadline && (
                          <div className="col-span-2 flex items-center gap-1.5 pt-1 border-t border-slate-800/50 text-[11px] text-slate-400">
                            <Calendar className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                            <span>Ends {formatDistanceToNow(new Date(project.deadline))}</span>
                          </div>
                        )}
                      </div>

                      {project.technologies.length > 0 && (
                        <div className="mt-auto pt-2 space-y-1.5">
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400">
                            <Code className="h-3.5 w-3.5 text-cyan-400" />
                            <span>Tech Stack</span>
                          </div>
                          <div className="flex flex-wrap gap-1.5">
                            {project.technologies.slice(0, 3).map((tech) => (
                              <Badge key={tech} variant="outline" className="px-2 py-0.5 text-[11px] bg-slate-800/60 border-slate-700 text-slate-300">
                                {tech}
                              </Badge>
                            ))}
                            {project.technologies.length > 3 && (
                              <span className="inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium text-slate-400 bg-slate-800/40 rounded-full border border-slate-700/50">
                                +{project.technologies.length - 3}
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter className="p-0 pt-5 mt-4 border-t border-slate-800/80">
                      <Link href={`/projects/${project.id}`} className="w-full">
                        <Button 
                          variant="secondary" 
                          className="w-full bg-slate-800/80 hover:bg-primary hover:text-primary-foreground border border-slate-700/80 hover:border-transparent transition-all duration-200 font-medium"
                        >
                          View Details
                        </Button>
                      </Link>
                    </CardFooter>
                  </div>
                </Card>
              ))}
            </div>

            {paginationData && paginationData.totalPages > 1 && (
              <Pagination
                currentPage={paginationData.currentPage}
                totalPages={paginationData.totalPages}
                onPageChange={handlePageChange}
              />
            )}
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
              updateUrl(1, "", "", "");
            }}
          />
        )}
      </main>
      <Footer />
    </div>
  );
}
