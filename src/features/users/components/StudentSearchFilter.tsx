"use client";

import React, { memo } from "react";
import { Button } from "@/components/ui/Button";

export interface StudentSearchFilterProps {
  searchTerm: string;
  skill: string;
  department: string;
  semester: string;
  onSearchTermChange: (value: string) => void;
  onSkillChange: (value: string) => void;
  onDepartmentChange: (value: string) => void;
  onSemesterChange: (value: string) => void;
  onSearch: () => void;
  onReset: () => void;
  isLoading: boolean;
}

const DEPARTMENTS = [
  "Computer Science",
  "Electrical Engineering",
  "Software Engineering",
  "Data Science",
  "Business Administration",
  "UI/UX Design",
  "Mechanical Engineering",
];

const SEMESTERS = ["1st", "2nd", "3rd", "4th", "5th", "6th", "7th", "8th", "Graduate"];

export const StudentSearchFilter = memo(function StudentSearchFilter({
  searchTerm,
  skill,
  department,
  semester,
  onSearchTermChange,
  onSkillChange,
  onDepartmentChange,
  onSemesterChange,
  onSearch,
  onReset,
  isLoading,
}: StudentSearchFilterProps) {
  return (
    <div className="w-full space-y-4 rounded-xl border border-border/60 bg-card/40 p-5 backdrop-blur-sm">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Search by Name */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Student Name
          </label>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background/60 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Search by Skill */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Skill
          </label>
          <input
            type="text"
            placeholder="e.g. React, Python, UI/UX"
            value={skill}
            onChange={(e) => onSkillChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background/60 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Filter by Department */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Department
          </label>
          <select
            value={department}
            onChange={(e) => onDepartmentChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background/60 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>

        {/* Filter by Semester */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Semester
          </label>
          <select
            value={semester}
            onChange={(e) => onSemesterChange(e.target.value)}
            className="w-full rounded-lg border border-input bg-background/60 px-3.5 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <option value="">All Semesters</option>
            {SEMESTERS.map((sem) => (
              <option key={sem} value={sem}>
                {sem} Semester
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <Button variant="outline" size="sm" onClick={onReset} disabled={isLoading}>
          Reset
        </Button>
        <Button variant="primary" size="sm" onClick={onSearch} isLoading={isLoading}>
          Search Students
        </Button>
      </div>
    </div>
  );
});
