import React from "react";
import { redirect } from "next/navigation";
import { adminAuth } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma.server";
import { Header } from "@/components/common/Header";
import { Sidebar } from "@/features/projects/workspace/components/Sidebar";
import { cookies } from "next/headers";

export default async function WorkspaceLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  
  // Verify auth using cookie since this is a server component
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
    // Access denied!
    redirect(`/projects/${id}`);
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground overflow-hidden">
      <Header />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar projectId={id} isOwner={isOwner} />
        
        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto bg-muted/10 relative">
          {children}
        </main>
      </div>
    </div>
  );
}
