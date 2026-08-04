import React, { memo } from "react";
import { UserDocument } from "@/types/firestore";
import { ProfileCard } from "@/features/profiles/components/ProfileCard";

export interface StudentSearchCardProps {
  student: UserDocument;
  onConnect?: (studentId: string) => void;
  isConnecting?: boolean;
}

export const StudentSearchCard = memo(function StudentSearchCard({
  student,
  onConnect,
  isConnecting = false,
}: StudentSearchCardProps) {
  return <ProfileCard profile={student} onConnect={onConnect} isConnecting={isConnecting} />;
});
