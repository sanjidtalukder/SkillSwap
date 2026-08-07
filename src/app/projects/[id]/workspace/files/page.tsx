import React from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { adminAuth } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma.server";
import { FilesWorkspace } from "@/features/projects/workspace/components/files/FilesWorkspace";

export default async function FilesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  // Verify auth
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  
  if (!token) {
    redirect("/login");
  }
  
  let userId = "";
  try {
    const decoded = await adminAuth.verifyIdToken(token);
    const userRecord = await prisma.user.findUnique({ where: { firebaseUid: decoded.uid } });
    if (!userRecord) throw new Error("User not found");
    userId = userRecord.id;
  } catch (err) {
    redirect("/login");
  }

  // Fetch project and verify membership
  const project = await prisma.project.findUnique({
    where: { id },
    include: { members: true }
  });

  if (!project) {
    redirect("/projects");
  }

  const isOwner = project.ownerId === userId;
  const isMember = project.members.some(m => m.userId === userId);

  if (!isOwner && !isMember) {
    redirect(`/projects/${id}`);
  }

  return (
    <div className="h-full flex flex-col p-6 max-w-7xl mx-auto w-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Project Files</h1>
        <p className="text-muted-foreground text-sm mt-1">Manage documents, assets, and design files for your project.</p>
      </div>

      <div className="flex-1 min-h-0 bg-card border border-border/40 rounded-xl overflow-hidden shadow-sm flex flex-col">
        <FilesWorkspace projectId={id} isOwner={isOwner} userId={userId} />
      </div>
    </div>
  );
}
