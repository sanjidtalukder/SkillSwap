"use client";

import React, { useEffect, useState } from "react";
import { fetchWithAuth } from "@/lib/api-client";
import { Avatar } from "@/components/ui/Avatar";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Spinner } from "@/components/ui/Spinner";
import { CardSkeleton } from "@/components/ui/CardSkeleton";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, ExternalLink } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

export function ProjectRequestsSection() {
  const [data, setData] = useState<{ received: any[]; sent: any[] } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"received" | "sent">("received");
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const res = await fetchWithAuth("/api/projects/requests/me");
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      setData(json.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load requests");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAction = async (requestId: string, action: "accept" | "reject") => {
    try {
      setProcessingId(requestId);
      const res = await fetchWithAuth(`/api/projects/requests/${requestId}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
        headers: { "Content-Type": "application/json" }
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error);
      
      toast.success(`Request ${action}ed successfully`);
      await fetchRequests(); // Refresh data
    } catch (err) {
      toast.error(err instanceof Error ? err.message : `Failed to ${action} request`);
    } finally {
      setProcessingId(null);
    }
  };

  if (isLoading) {
    return <div className="space-y-4"><CardSkeleton count={2} /></div>;
  }

  if (error) {
    return <div className="text-red-500 bg-red-500/10 p-4 rounded-xl">{error}</div>;
  }

  const { received = [], sent = [] } = data || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 border-b border-border/40 pb-4">
        <button
          onClick={() => setActiveTab("received")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "received" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Received Requests ({received.length})
        </button>
        <button
          onClick={() => setActiveTab("sent")}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            activeTab === "sent" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
          }`}
        >
          Sent Requests ({sent.length})
        </button>
      </div>

      <div className="space-y-4">
        {activeTab === "received" && (
          received.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No pending requests for your projects.</p>
          ) : (
            received.map((req) => (
              <div key={req.id} className="bg-card border border-border/50 rounded-xl p-5 flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="text-sm text-muted-foreground">Requested to join:</p>
                      <Link href={`/projects/${req.project.id}`} className="font-semibold hover:underline">
                        {req.project.title}
                      </Link>
                    </div>
                    <Badge variant={req.status === "pending" ? "outline" : req.status === "accepted" ? "success" : "destructive"} className="capitalize">
                      {req.status}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-4 bg-muted/20 p-4 rounded-lg">
                    <Avatar src={req.user.profile?.photo} alt={req.user.profile?.fullName} size="lg" />
                    <div>
                      <h4 className="font-medium text-lg">{req.user.profile?.fullName || "User"}</h4>
                      <p className="text-sm text-muted-foreground">
                        {req.user.profile?.university} • {req.user.profile?.department}
                      </p>
                      <Link href={`/u/${req.user.profile?.username || req.user.id}`} className="text-xs text-primary hover:underline mt-1 inline-block">
                        View Full Profile
                      </Link>
                    </div>
                  </div>

                  {req.user.skillsHave && req.user.skillsHave.length > 0 && (
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">Applicant Skills:</p>
                      <div className="flex flex-wrap gap-2">
                        {req.user.skillsHave.map((us: any) => (
                          <Badge key={us.id} variant="secondary" className="text-xs">{us.skill.name}</Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 justify-center md:w-32 shrink-0 border-t md:border-t-0 md:border-l border-border/40 pt-4 md:pt-0 md:pl-6">
                  {req.status === "pending" ? (
                    <>
                      <Button 
                        size="sm" 
                        variant="primary" 
                        onClick={() => handleAction(req.id, "accept")}
                        disabled={processingId === req.id}
                      >
                        Accept
                      </Button>
                      <Button 
                        size="sm" 
                        variant="outline" 
                        onClick={() => handleAction(req.id, "reject")}
                        disabled={processingId === req.id}
                      >
                        Reject
                      </Button>
                    </>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center capitalize">{req.status}</p>
                  )}
                </div>
              </div>
            ))
          )
        )}

        {activeTab === "sent" && (
          sent.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">You haven&apos;t sent any project join requests.</p>
          ) : (
            sent.map((req) => (
              <div key={req.id} className="bg-card border border-border/50 rounded-xl p-5 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">{req.project.title}</h4>
                  <p className="text-sm text-muted-foreground">Owner: {req.project.owner.profile?.fullName}</p>
                  <p className="text-xs text-muted-foreground mt-2">Requested {formatDistanceToNow(new Date(req.createdAt), { addSuffix: true })}</p>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <Badge variant={req.status === "pending" ? "outline" : req.status === "accepted" ? "success" : "destructive"} className="capitalize">
                    {req.status === "pending" ? <Clock className="w-3 h-3 mr-1" /> : req.status === "accepted" ? <CheckCircle2 className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                    {req.status}
                  </Badge>
                  <Link href={`/projects/${req.project.id}`} className="text-xs text-primary hover:underline inline-flex items-center">
                    View Project <ExternalLink className="w-3 h-3 ml-1" />
                  </Link>
                </div>
              </div>
            ))
          )
        )}
      </div>
    </div>
  );
}
