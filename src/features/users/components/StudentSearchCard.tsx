import React, { memo } from "react";
import { UserDocument } from "@/types/firestore";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export interface StudentSearchCardProps {
  student: UserDocument;
  onConnect?: (studentId: string) => void;
}

export const StudentSearchCard = memo(function StudentSearchCard({
  student,
  onConnect,
}: StudentSearchCardProps) {
  return (
    <Card className="hover:border-primary/40">
      <CardHeader className="flex flex-row items-center gap-4 space-y-0">
        <Avatar src={student.avatarUrl} alt={student.fullName} size="lg" />
        <div className="flex-1 overflow-hidden">
          <CardTitle className="truncate text-lg">{student.fullName}</CardTitle>
          <CardDescription className="truncate text-xs text-muted-foreground">
            {student.department || "Student"} {student.semester ? `• ${student.semester} Sem` : ""}
          </CardDescription>
          {student.university && (
            <span className="block truncate text-xs text-muted-foreground/80">
              {student.university}
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {student.bio && (
          <p className="line-clamp-2 text-xs leading-relaxed text-muted-foreground">
            {student.bio}
          </p>
        )}

        {/* Skills Offered */}
        <div>
          <span className="mb-1.5 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Can Teach:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {student.skillsOffered && student.skillsOffered.length > 0 ? (
              student.skillsOffered.slice(0, 4).map((s) => (
                <Badge key={s} variant="success">
                  {s}
                </Badge>
              ))
            ) : (
              <span className="text-xs italic text-muted-foreground/60">No skills listed</span>
            )}
          </div>
        </div>

        {/* Action Button */}
        {onConnect && (
          <div className="pt-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => onConnect(student.uid)}
            >
              Connect & Swap
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
});
