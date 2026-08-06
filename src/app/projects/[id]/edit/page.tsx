"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Footer } from "@/components/common/Footer";
import { Header } from "@/components/common/Header";
import { fetchWithAuth } from "@/lib/api-client";
import { useAuth } from "@/features/auth/hooks/useAuth";

export default function EditProjectPage() {
  const { id } = useParams();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Other",
    requiredSkills: "",
    technologies: "",
    teamSize: 2,
    difficulty: "Intermediate",
    deadline: "",
    status: "active",
  });

  useEffect(() => {
    const fetchProject = async () => {
      try {
        const response = await fetchWithAuth(`/api/projects/${id}`);
        if (!response.ok) throw new Error("Failed to load project details");
        const data = await response.json();
        const project = data.data;

        if (user && project.ownerId !== user.uid) {
          router.push(`/projects/${id}`);
          return;
        }

        setFormData({
          title: project.title,
          description: project.description,
          category: project.category,
          requiredSkills: project.requiredSkills.join(", "),
          technologies: project.technologies.join(", "),
          teamSize: project.teamSize,
          difficulty: project.difficulty,
          deadline: project.deadline ? new Date(project.deadline).toISOString().split('T')[0] : "",
          status: project.status,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error loading project");
      } finally {
        setIsLoading(false);
      }
    };

    if (id && user) {
      void fetchProject();
    }
  }, [id, user, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    
    setIsSubmitting(true);
    setError(null);

    try {
      const payload = {
        ...formData,
        teamSize: Number(formData.teamSize),
        requiredSkills: formData.requiredSkills.split(",").map(s => s.trim()).filter(Boolean),
        technologies: formData.technologies.split(",").map(t => t.trim()).filter(Boolean),
      };

      const response = await fetchWithAuth(`/api/projects/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Failed to update project");

      router.push(`/projects/${id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
      setIsSubmitting(false);
    }
  };

  if (authLoading || isLoading) return <div className="flex min-h-screen items-center justify-center">Loading...</div>;
  if (!user) {
    router.push("/login");
    return null;
  }

  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <Header />
      <main className="container mx-auto max-w-2xl flex-1 space-y-8 p-6 md:p-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
            Edit Project
          </h1>
          <p className="text-sm text-muted-foreground">
            Update your project details and requirements.
          </p>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Project Title</label>
            <input
              type="text"
              name="title"
              required
              value={formData.title}
              onChange={handleChange}
              className="w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <textarea
              name="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleChange}
              className="w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Web Development">Web Development</option>
                <option value="Mobile App">Mobile App</option>
                <option value="Data Science">Data Science</option>
                <option value="Design">Design</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Difficulty Level</label>
              <select
                name="difficulty"
                value={formData.difficulty}
                onChange={handleChange}
                className="w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Team Size</label>
              <input
                type="number"
                name="teamSize"
                min="2"
                max="20"
                value={formData.teamSize}
                onChange={handleChange}
                className="w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Deadline (Optional)</label>
              <input
                type="date"
                name="deadline"
                value={formData.deadline}
                onChange={handleChange}
                className="w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Project Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              >
                <option value="active">Active (Open)</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Required Skills (Comma separated)</label>
            <input
              type="text"
              name="requiredSkills"
              placeholder="e.g. React, UI Design, Marketing"
              value={formData.requiredSkills}
              onChange={handleChange}
              className="w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Technologies (Comma separated)</label>
            <input
              type="text"
              name="technologies"
              placeholder="e.g. Next.js, Node.js, PostgreSQL"
              value={formData.technologies}
              onChange={handleChange}
              className="w-full rounded-md border border-border/80 bg-background px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>

          <div className="flex gap-4 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.back()}
              className="w-full"
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting} className="w-full">
              Save Changes
            </Button>
          </div>
        </form>
      </main>
      <Footer />
    </div>
  );
}
