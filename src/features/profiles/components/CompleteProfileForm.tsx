"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  AVAILABILITY_OPTIONS,
  Availability,
  EXPERIENCE_LEVELS,
  ExperienceLevel,
} from "@/features/profiles/types/profile";
import { completeProfileSchema } from "@/features/profiles/schemas/profileSchema";
import { profileService } from "@/features/profiles/services/profileService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { useCurrentProfile } from "@/features/profiles/hooks/useCurrentProfile";
import { ROUTES } from "@/constants";
import { Alert } from "@/components/ui/Alert";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { Spinner } from "@/components/ui/Spinner";
import { SkillSelector } from "@/features/profiles/components/SkillSelector";
import { Camera, Check, ChevronLeft, ChevronRight, Link as LinkIcon, Save } from "lucide-react";

interface ProfileFormState {
  name: string;
  photo: string;
  banner: string;
  university: string;
  department: string;
  semester: string;
  location: string;
  bio: string;
  skillsHave: string[];
  skillsNeed: string[];
  github: string;
  linkedin: string;
  portfolio: string;
  experience: ExperienceLevel;
  availability: Availability;
}

const steps = [
  "Basic Information",
  "Skills I Have",
  "Skills I Need",
  "Professional Links",
  "Experience",
];

const MAX_PROFILE_PHOTO_SIZE_BYTES = 5 * 1024 * 1024;

const initialState: ProfileFormState = {
  name: "",
  photo: "",
  banner: "",
  university: "",
  department: "",
  semester: "",
  location: "",
  bio: "",
  skillsHave: [],
  skillsNeed: [],
  github: "",
  linkedin: "",
  portfolio: "",
  experience: "Beginner",
  availability: "Part Time",
};

export function CompleteProfileForm() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const {
    profile,
    isLoading: profileLoading,
    error: profileError,
  } = useCurrentProfile(user, authLoading);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<ProfileFormState>(initialState);
  const [didHydrate, setDidHydrate] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  useEffect(() => {
    if (didHydrate || !profile) return;

    setForm({
      name: profile.name || user?.displayName || "",
      photo: profile.photo || user?.photoURL || "",
      banner: profile.banner || "",
      university: profile.university || "",
      department: profile.department || "",
      semester: profile.semester || "",
      location: profile.location || "",
      bio: profile.bio || "",
      skillsHave: profile.skillsHave || [],
      skillsNeed: profile.skillsNeed || [],
      github: profile.github || "",
      linkedin: profile.linkedin || "",
      portfolio: profile.portfolio || "",
      experience: profile.experience || "Beginner",
      availability: profile.availability || "Part Time",
    });
    setDidHydrate(true);
  }, [didHydrate, profile, user?.displayName, user?.photoURL]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(ROUTES.LOGIN);
    }
  }, [authLoading, router, user]);

  useEffect(() => {
    if (!profileLoading && profile?.profileCompleted) {
      router.replace(ROUTES.DASHBOARD);
    }
  }, [profile?.profileCompleted, profileLoading, router]);

  const progress = useMemo(() => ((step + 1) / steps.length) * 100, [step]);

  const updateField = <K extends keyof ProfileFormState>(field: K, value: ProfileFormState[K]) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const validateCurrentStep = () => {
    if (step === 0) {
      const result = completeProfileSchema
        .pick({
          name: true,
          university: true,
          department: true,
          semester: true,
          location: true,
          bio: true,
          photo: true,
          banner: true,
        })
        .safeParse(form);
      if (!result.success) {
        setError(result.error.issues[0]?.message || "Please complete the basic information.");
        return false;
      }
    }

    if (step === 1 && form.skillsHave.length === 0) {
      setError("Add at least one skill you can share.");
      return false;
    }

    if (step === 2 && form.skillsNeed.length === 0) {
      setError("Add at least one skill you want to learn.");
      return false;
    }

    if (step === 3) {
      const result = completeProfileSchema
        .pick({ github: true, linkedin: true, portfolio: true })
        .safeParse(form);
      if (!result.success) {
        setError(result.error.issues[0]?.message || "Please check your professional links.");
        return false;
      }
    }

    return true;
  };

  const goNext = () => {
    if (!validateCurrentStep()) return;
    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const goBack = () => {
    setError(null);
    setStep((current) => Math.max(current - 1, 0));
  };

  const handlePhotoChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith("image/")) {
      setError("Choose a valid image file.");
      return;
    }

    if (file.size > MAX_PROFILE_PHOTO_SIZE_BYTES) {
      setError("Profile picture must be under 5 MB.");
      return;
    }

    setIsUploadingPhoto(true);
    const result = await profileService.uploadProfilePhoto(user.uid, file);
    setIsUploadingPhoto(false);

    if (result.error) {
      setError(result.error.userMessage);
      return;
    }

    updateField("photo", result.data || "");
    setNotice("Profile picture uploaded.");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!user) {
      router.replace(ROUTES.LOGIN);
      return;
    }

    const result = completeProfileSchema.safeParse(form);
    if (!result.success) {
      setError(result.error.issues[0]?.message || "Please complete all required fields.");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const saveResult = await profileService.saveCompletedProfile(user.uid, result.data);
    setIsSubmitting(false);

    if (saveResult.error) {
      setError(saveResult.error.userMessage);
      return;
    }

    setNotice(profile?.profileCompleted ? "Profile updated successfully." : "Profile completed successfully.");
    router.refresh();
    router.replace(ROUTES.DASHBOARD);
  };

  if (authLoading || profileLoading) {
    return (
      <div className="flex min-h-[420px] items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  // Removed early return for completed profile to allow editing

  return (
    <Card className="mx-auto w-full max-w-4xl overflow-hidden">
      <div className="border-b border-border/60 bg-secondary/25 p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm font-medium text-primary">Step {step + 1} of 5</p>
            <h1 className="mt-1 text-2xl font-extrabold text-foreground md:text-3xl">
              Complete your profile
            </h1>
          </div>
          <div className="flex flex-wrap gap-2">
            {steps.map((label, index) => (
              <span
                key={label}
                aria-hidden="true"
                className={`h-2.5 w-2.5 rounded-full transition-colors ${
                  index <= step ? "bg-primary" : "bg-muted"
                }`}
              />
            ))}
          </div>
        </div>
        <div
          className="mt-5 h-2 overflow-hidden rounded-full bg-muted"
          role="progressbar"
          aria-label="Profile completion progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(progress)}
        >
          <div
            className="h-full rounded-full bg-primary transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      <CardContent className="p-6 md:p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {(error || profileError) && <Alert variant="error">{error || profileError}</Alert>}
          {notice && <Alert variant="success">{notice}</Alert>}

          <div className="min-h-[430px] transition-all duration-300">
            {step === 0 && (
              <section className="grid gap-6 md:grid-cols-[180px_1fr]">
                <div className="space-y-3">
                  <Avatar src={form.photo} alt={form.name || "Profile photo"} size="xl" />
                  <label className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-border/70 px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary">
                    <Camera className="h-4 w-4" />
                    {isUploadingPhoto ? "Uploading..." : "Upload photo"}
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,image/gif"
                      onChange={handlePhotoChange}
                      className="sr-only"
                      disabled={isUploadingPhoto}
                    />
                  </label>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <TextField
                    label="Full Name"
                    value={form.name}
                    onChange={(value) => updateField("name", value)}
                  />
                  <TextField
                    label="Banner Image URL (Optional)"
                    value={form.banner}
                    onChange={(value) => updateField("banner", value)}
                  />
                  <TextField
                    label="University"
                    value={form.university}
                    onChange={(value) => updateField("university", value)}
                  />
                  <TextField
                    label="Department"
                    value={form.department}
                    onChange={(value) => updateField("department", value)}
                  />
                  <TextField
                    label="Semester"
                    value={form.semester}
                    onChange={(value) => updateField("semester", value)}
                  />
                  <TextField
                    label="Location"
                    value={form.location}
                    onChange={(value) => updateField("location", value)}
                    className="sm:col-span-2"
                  />
                  <label className="block space-y-2 sm:col-span-2">
                    <span className="text-sm font-medium text-foreground/80">Short Bio</span>
                    <textarea
                      value={form.bio}
                      onChange={(event) => updateField("bio", event.target.value)}
                      rows={5}
                      className="w-full rounded-lg border border-input bg-background/70 px-3 py-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                      placeholder="Tell collaborators what you are building, learning, and good at."
                    />
                  </label>
                </div>
              </section>
            )}

            {step === 1 && (
              <SkillSelector
                label="Skills I Have"
                description="Add the skills you can teach, mentor, or confidently contribute."
                skills={form.skillsHave}
                onChange={(skills) => updateField("skillsHave", skills)}
              />
            )}

            {step === 2 && (
              <SkillSelector
                label="Skills I Need"
                description="Add the skills you want to learn or need for collaboration."
                skills={form.skillsNeed}
                onChange={(skills) => updateField("skillsNeed", skills)}
              />
            )}

            {step === 3 && (
              <section className="space-y-5">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Professional Links</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Add trusted links so collaborators can review your work.
                  </p>
                </div>
                <div className="grid gap-4">
                  <LinkField
                    label="Github"
                    value={form.github}
                    onChange={(value) => updateField("github", value)}
                  />
                  <LinkField
                    label="LinkedIn"
                    value={form.linkedin}
                    onChange={(value) => updateField("linkedin", value)}
                  />
                  <LinkField
                    label="Portfolio Website"
                    value={form.portfolio}
                    onChange={(value) => updateField("portfolio", value)}
                  />
                </div>
              </section>
            )}

            {step === 4 && (
              <section className="space-y-6">
                <div>
                  <h2 className="text-2xl font-bold text-foreground">Experience</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Set expectations for your current level and availability.
                  </p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2">
                  <SelectField
                    label="Experience Level"
                    value={form.experience}
                    options={EXPERIENCE_LEVELS}
                    onChange={(value) => updateField("experience", value as ExperienceLevel)}
                  />
                  <SelectField
                    label="Availability"
                    value={form.availability}
                    options={AVAILABILITY_OPTIONS}
                    onChange={(value) => updateField("availability", value as Availability)}
                  />
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/10 p-4 text-sm text-muted-foreground">
                  <Check className="mb-2 h-5 w-5 text-primary" />
                  Your completed profile will appear in the Skill Feed for other authenticated
                  students to discover.
                </div>
              </section>
            )}
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={goBack}
              disabled={step === 0 || isSubmitting}
            >
              <ChevronLeft className="h-4 w-4" />
              Back
            </Button>

            {step < steps.length - 1 ? (
              <Button type="button" onClick={goNext}>
                Continue
                <ChevronRight className="h-4 w-4" />
              </Button>
            ) : (
              <Button type="submit" isLoading={isSubmitting}>
                <Save className="h-4 w-4" />
                Finish
              </Button>
            )}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

function TextField({ label, value, onChange, className }: FieldProps) {
  return (
    <label className={`block space-y-2 ${className || ""}`}>
      <span className="text-sm font-medium text-foreground/80">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-input bg-background/70 px-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
      />
    </label>
  );
}

function LinkField({ label, value, onChange }: FieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground/80">{label}</span>
      <div className="relative">
        <LinkIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-11 w-full rounded-lg border border-input bg-background/70 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
          placeholder="https://example.com"
        />
      </div>
    </label>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
}

function SelectField({ label, value, options, onChange }: SelectFieldProps) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium text-foreground/80">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="h-11 w-full rounded-lg border border-input bg-background/70 px-3 text-sm outline-none transition-colors focus:border-primary focus:ring-2 focus:ring-primary/30"
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  );
}
