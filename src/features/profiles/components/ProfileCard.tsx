import Link from "next/link";
import { CheckCircle2, ExternalLink, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import { ROUTES } from "@/constants";
import { UserProfile } from "@/features/profiles/types/profile";
import { UserDocument } from "@/types/firestore";

type ProfileCardData = UserProfile | UserDocument;

interface ProfileCardProps {
  profile: ProfileCardData;
  onConnect?: (profileId: string) => void;
  onMessage?: (profileId: string) => void;
  isConnecting?: boolean;
  showActions?: boolean;
}

function getProfileValue(profile: ProfileCardData) {
  const profileWithNewFields = profile as Partial<UserProfile>;
  const profileWithLegacyFields = profile as Partial<UserDocument>;

  return {
    uid: profile.uid,
    name: profileWithNewFields.name || profileWithLegacyFields.fullName || "SkillSwap Member",
    photo: profileWithNewFields.photo || profileWithLegacyFields.avatarUrl || "",
    university: profileWithNewFields.university || profileWithLegacyFields.university || "",
    department: profileWithNewFields.department || profileWithLegacyFields.department || "",
    semester: profileWithNewFields.semester || profileWithLegacyFields.semester || "",
    bio: profileWithNewFields.bio || profileWithLegacyFields.bio || "",
    skillsHave: profileWithNewFields.skillsHave || profileWithLegacyFields.skillsOffered || [],
    skillsNeed: profileWithNewFields.skillsNeed || profileWithLegacyFields.skillsWanted || [],
    experience: profileWithNewFields.experience || "Beginner",
    profileCompleted: Boolean(profileWithNewFields.profileCompleted),
  };
}

const actionLinkClassName =
  "inline-flex h-8 w-full items-center justify-center gap-1.5 rounded-lg border border-border/80 bg-background/50 px-3.5 text-xs font-semibold transition-all duration-150 hover:border-accent hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background";

export function ProfileCard({
  profile,
  onConnect,
  onMessage,
  isConnecting = false,
  showActions = true,
}: ProfileCardProps) {
  const data = getProfileValue(profile);

  return (
    <Card className="group h-full hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/10">
      <CardHeader className="space-y-4">
        <div className="flex items-start gap-4">
          <Avatar src={data.photo} alt={data.name} size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <CardTitle className="truncate text-lg">{data.name}</CardTitle>
              {data.profileCompleted && (
                <span title="Profile completed" className="text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              )}
            </div>
            <p className="mt-1 truncate text-xs text-muted-foreground">
              {data.university || "University not listed"}
            </p>
            <p className="truncate text-xs text-muted-foreground/80">
              {data.department || "Department not listed"}
              {data.semester ? ` • ${data.semester}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center justify-between gap-3">
          <Badge variant="primary">{data.experience}</Badge>
          {data.profileCompleted && <Badge variant="success">Complete</Badge>}
        </div>
      </CardHeader>

      <CardContent className="flex h-full flex-col gap-4">
        <p className="line-clamp-3 min-h-14 text-sm leading-relaxed text-muted-foreground">
          {data.bio || "No bio provided yet."}
        </p>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">Skills I Have</p>
          <div className="flex min-h-7 flex-wrap gap-1.5">
            {data.skillsHave.length > 0 ? (
              data.skillsHave.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="success">
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-xs italic text-muted-foreground/60">No skills listed</span>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <p className="text-[11px] font-semibold uppercase text-muted-foreground">Skills I Need</p>
          <div className="flex min-h-7 flex-wrap gap-1.5">
            {data.skillsNeed.length > 0 ? (
              data.skillsNeed.slice(0, 5).map((skill) => (
                <Badge key={skill} variant="outline">
                  {skill}
                </Badge>
              ))
            ) : (
              <span className="text-xs italic text-muted-foreground/60">No skills listed</span>
            )}
          </div>
        </div>

        {showActions && (
          <div className={`mt-auto grid gap-2 pt-2 ${onMessage ? 'grid-cols-3' : 'grid-cols-2'}`}>
            <Link href={`${ROUTES.PROFILE}/${data.uid}`} className={actionLinkClassName}>
              <ExternalLink className="h-4 w-4" />
              View
            </Link>
            <Button
              type="button"
              size="sm"
              className="w-full"
              onClick={() => onConnect?.(data.uid)}
              disabled={!onConnect || isConnecting}
              isLoading={isConnecting}
            >
              Connect
            </Button>
            {onMessage && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="w-full"
                onClick={() => onMessage(data.uid)}
              >
                <MessageCircle className="h-4 w-4" />
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
