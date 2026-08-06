"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LogIn, Mail, Lock, User, UserPlus } from "lucide-react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { ROUTES } from "@/constants";
import { loginSchema, registerSchema } from "@/features/auth/schemas/authSchema";
import { authService } from "@/features/auth/services/authService";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { profileRoutingService } from "@/features/profiles/services/profileRoutingService";
import { getErrorMessage } from "@/utils/errorHandler";
import { z } from "zod";

type AuthMode = "login" | "register";

interface AuthFormProps {
  mode?: AuthMode;
}

interface FormState {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const initialFormState: FormState = {
  name: "",
  email: "",
  password: "",
  confirmPassword: "",
};

export function AuthForm({ mode = "login" }: AuthFormProps) {
  const router = useRouter();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [form, setForm] = useState(initialFormState);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isRegister = mode === "register";

  useEffect(() => {
    async function routeAuthenticatedUser() {
      if (authLoading || !isAuthenticated) return;

      const currentUser = authService.getCurrentUser();
      if (!currentUser) return;

      const routeResult = await profileRoutingService.getRouteForUser(currentUser);
      if (routeResult.error || !routeResult.data) {
        setError(routeResult.error?.userMessage || "Failed to check your profile.");
        return;
      }

      const route = routeResult.data.profileCompleted ? ROUTES.DASHBOARD : ROUTES.COMPLETE_PROFILE;
      router.replace(route);
    }
    void routeAuthenticatedUser();
  }, [authLoading, isAuthenticated, router]);

  const updateField = (field: keyof FormState, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
    setError(null);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (isRegister) {
        const payload = registerSchema.parse(form);
        await authService.register(payload);
        // After registration, ensure profile shell
        const currentUser = authService.getCurrentUser();
        if (currentUser) {
          await fetch("/api/db/profile", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              firebaseUid: currentUser.uid,
              email: currentUser.email,
              name: currentUser.displayName || currentUser.email?.split("@")[0] || "SkillSwap Member"
            })
          });
        }
        router.replace(ROUTES.COMPLETE_PROFILE);
        return;
      } else {
        const payload = loginSchema.parse({
          email: form.email,
          password: form.password,
        });
        const credential = await authService.login(payload);
        const routeResult = await profileRoutingService.getRouteForUser(credential.user);
        if (routeResult.error || !routeResult.data) {
          setError(routeResult.error?.userMessage || "Failed to check your profile.");
          return;
        }
        const route = routeResult.data.profileCompleted ? ROUTES.DASHBOARD : ROUTES.COMPLETE_PROFILE;
        router.replace(route);
        return;
      }
    } catch (submitError) {
      setError(getErrorMessage(submitError));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle>{isRegister ? "Create your account" : "Welcome back"}</CardTitle>
        <CardDescription>
          {isRegister
            ? "Register to find collaborators and swap skills."
            : "Login to continue your SkillSwap workflow."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form className="space-y-4" onSubmit={handleSubmit}>
          {error && <Alert variant="error">{error}</Alert>}

          {isRegister && (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground/80">Full name</span>
              <div className="relative">
                <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  value={form.name}
                  onChange={(event) => updateField("name", event.target.value)}
                  autoComplete="name"
                  className="h-11 w-full rounded-lg border border-input bg-background/70 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="Your name"
                />
              </div>
            </label>
          )}

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground/80">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="email"
                value={form.email}
                onChange={(event) => updateField("email", event.target.value)}
                autoComplete="email"
                className="h-11 w-full rounded-lg border border-input bg-background/70 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="you@example.com"
              />
            </div>
          </label>

          <label className="block space-y-2">
            <span className="text-sm font-medium text-foreground/80">Password</span>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="password"
                value={form.password}
                onChange={(event) => updateField("password", event.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
                className="h-11 w-full rounded-lg border border-input bg-background/70 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                placeholder="At least 6 characters"
              />
            </div>
          </label>

          {isRegister && (
            <label className="block space-y-2">
              <span className="text-sm font-medium text-foreground/80">Confirm password</span>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="password"
                  value={form.confirmPassword}
                  onChange={(event) => updateField("confirmPassword", event.target.value)}
                  autoComplete="new-password"
                  className="h-11 w-full rounded-lg border border-input bg-background/70 pl-10 pr-3 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-primary/30"
                  placeholder="Repeat password"
                />
              </div>
            </label>
          )}

          <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting}>
            {isRegister ? <UserPlus className="h-4 w-4" /> : <LogIn className="h-4 w-4" />}
            {isRegister ? "Register" : "Login"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-muted-foreground">
          {isRegister ? "Already have an account?" : "New to SkillSwap?"}{" "}
          <Link
            href={isRegister ? ROUTES.LOGIN : ROUTES.REGISTER}
            className="font-medium text-primary hover:text-primary/80"
          >
            {isRegister ? "Login" : "Register"}
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}