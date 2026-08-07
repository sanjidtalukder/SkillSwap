"use client";

import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api-client";
import { Avatar } from "@/components/ui/Avatar";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { toast } from "sonner";
import { format } from "date-fns";
import Link from "next/link";
import { Check, X, Clock, AlertCircle } from "lucide-react";

interface JoinRequest {
  id: string;
  status: "pending" | "accepted" | "rejected";
  createdAt: string;
  user: {
    firebaseUid: string;
    profile: {
      fullName: string;
      photo: string;
      university: string;
      department: string;
      bio: string;
      username: string;
    };
    skillsHave: {
      skill: { name: string }
    }[];
  };
}

export function ProjectJoinRequests({ projectId }: { projectId: string }) {
  const [requests, setRequests] = useState<JoinRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    const loadRequests = async () => {
      try {
        const res = await fetchWithAuth(`/api/projects/${projectId}/requests`);
        const json = await res.json();
        if (json.success) {
          setRequests(json.data);
        } else {
          throw new Error(json.error);
        }
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "Failed to load requests");
      } finally {
        setLoading(false);
      }
    };
    loadRequests();
  }, [projectId]);

  const loadRequestsForAction = async () => {
    try {
      const res = await fetchWithAuth(`/api/projects/${projectId}/requests`);
      const json = await res.json();
      if (json.success) {
        setRequests(json.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleProcessRequest = async (requestId: string, action: "accept" | "reject") => {
    try {
      setProcessingId(requestId);
      const res = await fetchWithAuth(`/api/projects/requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      });
      const json = await res.json();

      if (json.success) {
        toast.success(`Request ${action}ed successfully`);
        // We reload the page if it's accepted so that the member list updates, 
        // or just update local state for rejected.
        if (action === "accept") {
          window.location.reload();
        } else {
          await loadRequestsForAction();
        }
      } else {
        throw new Error(json.error);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action} request`);
      setProcessingId(null);
    }
  };

  if (loading) {
    return <CardSkeleton count={2} />;
  }

  const pendingRequests = requests.filter(r => r.status === "pending");
  const rejectedRequests = requests.filter(r => r.status === "rejected");
  const acceptedRequests = requests.filter(r => r.status === "accepted");

  if (requests.length === 0 || (pendingRequests.length === 0 && rejectedRequests.length === 0)) {
    return (
      <div className="rounded-xl border border-dashed border-border/60 p-8 text-center bg-card">
        <div className="flex justify-center mb-3 text-muted">
          <AlertCircle className="w-10 h-10 opacity-50" />
        </div>
        <h3 className="font-semibold text-lg">No Pending Requests</h3>
        <p className="text-sm text-muted-foreground mt-1">When users request to join this project, they will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8" id="join-requests">
      {pendingRequests.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-warning" /> 
            Pending Requests <Badge variant="warning">{pendingRequests.length}</Badge>
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {pendingRequests.map(req => (
              <RequestCard 
                key={req.id} 
                request={req} 
                isProcessing={processingId === req.id}
                onAccept={() => handleProcessRequest(req.id, "accept")}
                onReject={() => handleProcessRequest(req.id, "reject")}
              />
            ))}
          </div>
        </div>
      )}

      {rejectedRequests.length > 0 && (
        <div className="space-y-4 pt-4 border-t border-border/40 opacity-75">
          <h3 className="text-sm font-semibold text-muted-foreground flex items-center gap-2">
            Rejected Requests
          </h3>
          <div className="grid gap-4 md:grid-cols-2">
            {rejectedRequests.map(req => (
              <RequestCard key={req.id} request={req} isProcessing={false} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function RequestCard({ 
  request, 
  isProcessing, 
  onAccept, 
  onReject 
}: { 
  request: JoinRequest, 
  isProcessing: boolean,
  onAccept?: () => void,
  onReject?: () => void,
}) {
  const { user } = request;
  const profile = user.profile;
  const isPending = request.status === "pending";

  return (
    <div className="bg-card border border-border/60 rounded-xl p-5 shadow-sm transition-shadow hover:shadow-md flex flex-col h-full">
      <div className="flex gap-4 items-start mb-4">
        <Avatar src={profile.photo || ""} alt={profile.fullName} size="md" />
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <Link href={`/u/${profile.username || user.firebaseUid}`} className="font-semibold text-base hover:text-primary transition-colors truncate block">
              {profile.fullName}
            </Link>
            <span className="text-[10px] text-muted-foreground whitespace-nowrap ml-2">
              {format(new Date(request.createdAt), 'MMM d, h:mm a')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground truncate">{profile.university}</p>
          {profile.department && (
            <p className="text-[10px] text-muted-foreground/70 truncate">{profile.department}</p>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3">
        {profile.bio && (
          <p className="text-xs text-foreground/80 line-clamp-2 bg-muted/20 p-2 rounded-md border border-border/30">
            {profile.bio}
          </p>
        )}

        {user.skillsHave && user.skillsHave.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {user.skillsHave.slice(0, 4).map(s => (
              <Badge key={s.skill.name} variant="secondary" className="text-[9px] px-1.5 py-0">
                {s.skill.name}
              </Badge>
            ))}
            {user.skillsHave.length > 4 && (
              <Badge variant="outline" className="text-[9px] px-1.5 py-0">+{user.skillsHave.length - 4}</Badge>
            )}
          </div>
        )}
      </div>

      <div className="mt-5 pt-4 border-t border-border/40 flex justify-between items-center gap-2">
        <Link href={`/u/${profile.username || user.firebaseUid}`} className="text-xs font-medium text-primary hover:underline">
          View Profile
        </Link>
        
        {isPending ? (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="h-8 text-xs px-3 hover:bg-destructive/10 hover:text-destructive hover:border-destructive/30"
              onClick={onReject}
              disabled={isProcessing}
            >
              <X className="w-3.5 h-3.5 mr-1" /> Reject
            </Button>
            <Button 
              size="sm" 
              className="h-8 text-xs px-3"
              onClick={onAccept}
              disabled={isProcessing}
            >
              <Check className="w-3.5 h-3.5 mr-1" /> Accept
            </Button>
          </div>
        ) : (
          <Badge variant={request.status === "accepted" ? "success" : "secondary"} className="capitalize text-[10px]">
            {request.status}
          </Badge>
        )}
      </div>
    </div>
  );
}
