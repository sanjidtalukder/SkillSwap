"use client";

import { useState } from "react";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { fetchWithAuth } from "@/lib/api-client";
import { toast } from "sonner";
import { MoreHorizontal, UserX, Shield, ArrowRightLeft, ExternalLink, Calendar, GraduationCap, MapPin, Search } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";
import { useRouter } from "next/navigation";

export function MembersTab({ project, isOwner, user }: { project: any, isOwner: boolean, user: any }) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [removingId, setRemovingId] = useState<string | null>(null);
  const members = project.members || [];
  const owner = project.owner;

  // Combine owner and members into a single array for rendering, putting owner first
  const allWorkspaceMembers = [
    { ...owner, isProjectOwner: true },
    ...members.map((m: any) => ({ ...m.user, role: m.role, memberRecordId: m.id, joinedAt: m.joinedAt })) // Inject role and join date
  ];

  const filteredMembers = allWorkspaceMembers.filter((m: any) => 
    m.profile?.fullName?.toLowerCase().includes(searchQuery.toLowerCase()) || 
    m.profile?.username?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleRemoveMember = async (memberUserId: string) => {
    if (!confirm("Are you sure you want to remove this member from the workspace?")) return;

    setRemovingId(memberUserId);
    try {
      const res = await fetchWithAuth(`/api/workspace/${project.id}/members/${memberUserId}`, {
        method: "DELETE"
      });
      const data = await res.json();
      
      if (data.success) {
        toast.success("Member removed from workspace");
        router.refresh();
      } else {
        toast.error(data.error || "Failed to remove member");
      }
    } catch (err) {
      toast.error("An error occurred");
    } finally {
      setRemovingId(null);
    }
  };

  return (
    <div className="flex flex-col h-full bg-background relative">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border/40">
        <div>
          <h2 className="text-xl font-bold">Workspace Members</h2>
          <p className="text-sm text-muted-foreground">Manage your team and their roles</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search members..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 w-64 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
          />
        </div>
      </div>

      {/* Main Area */}
      <div className="flex-1 overflow-y-auto p-6 custom-scrollbar">
        {filteredMembers.length === 0 ? (
          <div className="text-center py-20 text-muted-foreground">
            No members found matching your search.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMembers.map((m) => (
              <div key={m.id} className="bg-card border border-border/40 rounded-xl p-5 hover:border-primary/30 transition-all shadow-sm group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <Avatar src={m.profile?.photo} alt={m.profile?.fullName} size="lg" />
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-card"></span>
                    </div>
                    <div>
                      <h3 className="font-bold text-foreground leading-tight flex items-center gap-2">
                        {m.profile?.fullName}
                        {m.isProjectOwner ? (
                          <Badge variant="success" className="text-[10px] px-1.5 py-0 h-4">Owner</Badge>
                        ) : m.role ? (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">{m.role}</Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4">Member</Badge>
                        )}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">@{m.profile?.username || "username"}</p>
                    </div>
                  </div>

                  {/* Owner Controls */}
                  {isOwner && !m.isProjectOwner && (
                    <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
                      <div className="flex flex-col gap-1">
                         <button 
                            onClick={() => handleRemoveMember(m.id)}
                            disabled={removingId === m.id}
                            title="Remove Member"
                            className="p-1.5 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-md transition-colors disabled:opacity-50"
                          >
                           <UserX className="w-4 h-4" />
                         </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mt-4 text-xs text-muted-foreground">
                  {m.profile?.university && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-3.5 h-3.5" />
                      <span className="truncate">{m.profile.university}</span>
                    </div>
                  )}
                  {m.profile?.department && (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="truncate">{m.profile.department} {m.profile.semester && `· ${m.profile.semester}`}</span>
                    </div>
                  )}
                  {m.joinedAt && (
                    <div className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Joined {format(new Date(m.joinedAt), "MMM d, yyyy")}</span>
                    </div>
                  )}
                </div>

                <div className="mt-5 flex gap-2">
                  <Link href={`/profile/${m.id}`} className="flex-1">
                    <Button variant="outline" size="sm" className="w-full text-xs h-8">
                      <ExternalLink className="w-3.5 h-3.5 mr-1.5" /> View Profile
                    </Button>
                  </Link>
                  {isOwner && !m.isProjectOwner && (
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" title="Transfer Ownership (Coming Soon)" disabled>
                        <ArrowRightLeft className="w-3.5 h-3.5" />
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 px-2 text-xs" title="Promote to Moderator (Coming Soon)" disabled>
                        <Shield className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
