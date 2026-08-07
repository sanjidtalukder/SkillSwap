import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ROUTES } from "@/constants";
import { UserProfile } from "@/features/profiles/types/profile";
import { UserDocument } from "@/types/firestore";
import { useConnectionStatus } from "@/features/profiles/hooks/useConnectionStatus";
import { useRouter } from "next/navigation";

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
    username: profileWithNewFields.username || "",
  };
}

export function ProfileCard({
  profile,
  onConnect,
  onMessage,
  isConnecting = false,
  showActions = true,
}: ProfileCardProps) {
  const data = getProfileValue(profile);
  const profileUrl = data.username ? `/u/${data.username}` : `${ROUTES.PROFILE}/${data.uid}`;
  const { status, conversationId, sendRequest, acceptRequest, rejectRequest } = useConnectionStatus(data.uid);
  const router = useRouter();

  return (
    <Card className="group relative flex flex-col h-full overflow-hidden bg-card hover:-translate-y-1 hover:border-primary/60 hover:shadow-lg hover:shadow-primary/20 transition-all duration-300">
      
      {/* Invisible link covering the entire card for accessible routing */}
      <Link href={profileUrl} className="absolute inset-0 z-10 rounded-xl" aria-label={`View ${data.name}'s profile`} />

      <div className="flex-1 p-5 pb-0 flex flex-col gap-4 relative z-0">
        {/* Avatar & Header */}
        <div className="flex items-start gap-4">
          <Avatar 
            src={data.photo} 
            alt={data.name} 
            size="lg" 
            className="border border-border/50 shadow-sm transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-md" 
          />
          <div className="min-w-0 flex-1 mt-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-bold text-foreground transition-colors duration-300 group-hover:text-primary">
                {data.name}
              </h3>
              {data.profileCompleted && (
                <span title="Verified Profile" className="text-emerald-500 shrink-0">
                  <CheckCircle2 className="h-4 w-4" />
                </span>
              )}
            </div>
            <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground group-hover:text-muted-foreground/90 transition-colors">
              {data.university || "University not listed"}
            </p>
            <p className="truncate text-xs text-muted-foreground/70">
              {data.department || "Department not listed"}
              {data.semester ? ` • ${data.semester}` : ""}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center justify-between">
          <Badge variant="primary" className="text-[10px] uppercase tracking-wider font-semibold shadow-sm">{data.experience}</Badge>
          {data.profileCompleted && <Badge variant="success" className="text-[10px] uppercase tracking-wider font-semibold shadow-sm">Complete</Badge>}
        </div>

        {/* Bio */}
        <p className="line-clamp-2 text-sm text-foreground/80 leading-relaxed min-h-[2.5rem]">
          {data.bio || <span className="italic text-muted-foreground">No bio provided.</span>}
        </p>

        {/* Skills */}
        <div className="flex-1 flex flex-col gap-4 mt-2 mb-4">
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Skills I Have
            </p>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {data.skillsHave.length > 0 ? (
                data.skillsHave.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">{skill}</Badge>
                ))
              ) : (
                <span className="text-xs italic text-muted-foreground/60">None listed</span>
              )}
              {data.skillsHave.length > 4 && (
                <Badge variant="outline" className="bg-muted/50 border-border/50 text-muted-foreground">+{data.skillsHave.length - 4}</Badge>
              )}
            </div>
          </div>
          <div className="space-y-2">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary"></span> Skills I Need
            </p>
            <div className="flex flex-wrap gap-1.5 min-h-[28px]">
              {data.skillsNeed.length > 0 ? (
                data.skillsNeed.slice(0, 4).map((skill) => (
                  <Badge key={skill} variant="outline" className="bg-muted/30 border-border/60 text-foreground/80">{skill}</Badge>
                ))
              ) : (
                <span className="text-xs italic text-muted-foreground/60">None listed</span>
              )}
              {data.skillsNeed.length > 4 && (
                <Badge variant="outline" className="bg-muted/50 border-border/50 text-muted-foreground">+{data.skillsNeed.length - 4}</Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Actions (Always attached to bottom, elevated above the Link layer) */}
      {showActions && (
        <div className="mt-auto border-t border-border/50 bg-muted/10 p-4 relative z-20">
          <div className="flex flex-col sm:flex-row gap-2">
            
            {status === "NOT_CONNECTED" && (
              <Button
                type="button"
                size="sm"
                className="flex-1 h-9 text-xs font-semibold shadow-sm whitespace-nowrap px-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  sendRequest();
                }}
              >
                Connect
              </Button>
            )}

            {status === "PENDING_SENT" && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="flex-1 h-9 text-xs font-semibold shadow-sm whitespace-nowrap px-2 opacity-70"
                disabled
              >
                Request Sent
              </Button>
            )}

            {status === "PENDING_RECEIVED" && (
              <>
                <Button
                  type="button"
                  size="sm"
                  className="flex-1 h-9 text-xs font-semibold shadow-sm whitespace-nowrap px-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    acceptRequest();
                    router.refresh();
                  }}
                >
                  Accept
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  className="flex-1 h-9 text-xs font-semibold shadow-sm whitespace-nowrap px-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    rejectRequest();
                    router.refresh();
                  }}
                >
                  Reject
                </Button>
              </>
            )}

            {status === "ACCEPTED" && (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="flex-1 h-9 text-xs font-semibold shadow-sm whitespace-nowrap px-2 bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 pointer-events-none"
                  disabled
                >
                  <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" /> Connected
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="flex-1 h-9 text-xs font-semibold shadow-sm bg-background border border-border/80 hover:bg-muted whitespace-nowrap px-2"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    if (conversationId) {
                      router.push(`/chat/${conversationId}`);
                    } else {
                      onMessage?.(data.uid);
                    }
                  }}
                >
                  <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> Message
                </Button>
              </>
            )}

            {status === "LOADING" && (
              <div className="flex-1 h-9 bg-muted/50 rounded animate-pulse" />
            )}
            
            {status !== "ACCEPTED" && status !== "LOADING" && status !== "PENDING_RECEIVED" && (
              <Button
                type="button"
                size="sm"
                variant="secondary"
                className="flex-1 h-9 text-xs font-semibold shadow-sm bg-background border border-border/80 hover:bg-muted whitespace-nowrap px-2"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onMessage?.(data.uid);
                }}
              >
                <MessageCircle className="h-3.5 w-3.5 mr-1.5" /> Message
              </Button>
            )}
            
          </div>
        </div>
      )}
    </Card>
  );
}
