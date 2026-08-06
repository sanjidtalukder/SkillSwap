"use client";

import { FormEvent, useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { MAX_PROFILE_SKILLS } from "@/features/profiles/types/profile";

interface SkillSelectorProps {
  label: string;
  description: string;
  skills: string[];
  onChange: (skills: string[]) => void;
  maxSkills?: number;
}

const SUGGESTED_SKILLS = [
  "React",
  "Next.js",
  "TypeScript",
  "Firebase",
  "Python",
  "Machine Learning",
  "UI Design",
  "Data Analysis",
  "Public Speaking",
  "Content Writing",
  "Node.js",
  "Database Design",
];

export function SkillSelector({
  label,
  description,
  skills,
  onChange,
  maxSkills = MAX_PROFILE_SKILLS,
}: SkillSelectorProps) {
  const [query, setQuery] = useState("");
  const [error, setError] = useState<string | null>(null);

  const filteredSuggestions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const selected = new Set(skills.map((skill) => skill.toLowerCase()));

    return SUGGESTED_SKILLS.filter((skill) => {
      const normalizedSkill = skill.toLowerCase();
      return !selected.has(normalizedSkill) && normalizedSkill.includes(normalizedQuery);
    }).slice(0, 6);
  }, [query, skills]);

  const addSkill = (rawSkill: string) => {
    const nextSkill = rawSkill.trim();
    if (!nextSkill) return;

    const isDuplicate = skills.some((skill) => skill.toLowerCase() === nextSkill.toLowerCase());
    if (isDuplicate) {
      setError("That skill is already selected.");
      return;
    }

    if (skills.length >= maxSkills) {
      setError(`You can add up to ${maxSkills} skills.`);
      return;
    }

    onChange([...skills, nextSkill]);
    setQuery("");
    setError(null);
  };

  const removeSkill = (skillToRemove: string) => {
    onChange(skills.filter((skill) => skill !== skillToRemove));
    setError(null);
  };

  const handleSubmit = (event: React.MouseEvent | React.KeyboardEvent) => {
    event.preventDefault();
    addSkill(query);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-2xl font-bold text-foreground">{label}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{description}</p>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row">
        <label className="relative flex-1">
          <span className="sr-only">{label}</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setError(null);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                event.preventDefault();
                handleSubmit(event as any);
              }
            }}
            className="h-11 w-full rounded-lg border border-input bg-background/70 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
            placeholder="Search or type a skill"
          />
        </label>
        <Button
          type="button"
          variant="outline"
          onClick={(event) => handleSubmit(event as any)}
        >
          <Plus className="h-4 w-4" />
          Add
        </Button>
      </div>

      {query.trim() && filteredSuggestions.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {filteredSuggestions.map((skill) => (
            <button
              key={skill}
              type="button"
              onClick={() => addSkill(skill)}
              className="rounded-full border border-border/70 px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
            >
              {skill}
            </button>
          ))}
        </div>
      )}

      {error && (
        <p role="alert" className="text-sm text-destructive-foreground">
          {error}
        </p>
      )}

      <div className="min-h-24 rounded-lg border border-border/60 bg-background/40 p-4">
        {skills.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {skills.map((skill) => (
              <Badge key={skill} variant="success" className="gap-1.5 py-1">
                {skill}
                <button
                  type="button"
                  onClick={() => removeSkill(skill)}
                  aria-label={`Remove ${skill}`}
                  className="rounded-full text-emerald-200 transition-colors hover:text-white"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </Badge>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Selected skills will appear here.</p>
        )}
      </div>

      <p className="text-xs text-muted-foreground">
        {skills.length}/{maxSkills} skills selected
      </p>
    </div>
  );
}
