"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { ROUTES } from "@/constants";
import { Lock } from "lucide-react";

interface AuthGuardModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
}

export function AuthGuardModal({
  isOpen,
  onClose,
  title = "Login Required",
  description = "You need to be logged in to perform this action. Join SkillSwap today to start collaborating!",
}: AuthGuardModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="flex flex-col items-center text-center">
          <div className="mb-4 rounded-full bg-primary/10 p-4">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
          <DialogDescription className="text-center pt-2">
            {description}
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-3 pt-4 sm:flex-row sm:justify-center">
          <Link href={ROUTES.LOGIN} className="w-full sm:w-auto" onClick={onClose}>
            <Button variant="outline" className="w-full">
              Sign In
            </Button>
          </Link>
          <Link href={ROUTES.REGISTER} className="w-full sm:w-auto" onClick={onClose}>
            <Button variant="primary" className="w-full">
              Create Account
            </Button>
          </Link>
        </div>
      </DialogContent>
    </Dialog>
  );
}
