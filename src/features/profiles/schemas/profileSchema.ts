import { z } from "zod";
import {
  AVAILABILITY_OPTIONS,
  EXPERIENCE_LEVELS,
  MAX_PROFILE_SKILLS,
} from "@/features/profiles/types/profile";

const optionalUrlSchema = z
  .string()
  .trim()
  .optional()
  .or(z.literal(""))
  .refine((value) => !value || /^https?:\/\/.+\..+/.test(value), {
    message: "Enter a valid URL starting with http:// or https://",
  });

const skillListSchema = z
  .array(z.string().trim().min(1, "Skill cannot be empty"))
  .min(1, "Add at least one skill")
  .max(MAX_PROFILE_SKILLS, `You can add up to ${MAX_PROFILE_SKILLS} skills`)
  .refine(
    (skills) => new Set(skills.map((skill) => skill.toLowerCase())).size === skills.length,
    "Skills cannot contain duplicates"
  );

export const completeProfileSchema = z.object({
  name: z.string().trim().min(2, "Full name is required").max(100, "Name is too long"),
  photo: optionalUrlSchema,
  university: z.string().trim().min(2, "University is required").max(120),
  department: z.string().trim().min(2, "Department is required").max(120),
  semester: z.string().trim().min(1, "Semester is required").max(30),
  location: z.string().trim().min(2, "Location is required").max(120),
  bio: z.string().trim().min(20, "Bio should be at least 20 characters").max(500),
  skillsHave: skillListSchema,
  skillsNeed: skillListSchema,
  github: optionalUrlSchema,
  linkedin: optionalUrlSchema,
  portfolio: optionalUrlSchema,
  experience: z.enum(EXPERIENCE_LEVELS),
  availability: z.enum(AVAILABILITY_OPTIONS),
});

export type CompleteProfileSchemaInput = z.infer<typeof completeProfileSchema>;
