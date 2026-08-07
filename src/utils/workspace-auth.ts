import prisma from "@/lib/prisma.server";

export interface WorkspaceAccessResult {
  hasAccess: boolean;
  status: "owner" | "member" | "pending" | "not_member" | "not_found";
}

/**
 * Checks if a user has access to a project workspace securely via the database.
 * 
 * @param userId - The ID of the user requesting access.
 * @param projectId - The ID of the project workspace.
 * @returns An object containing the access boolean and the specific status.
 */
export async function canAccessWorkspace(userId: string, projectId: string): Promise<WorkspaceAccessResult> {
  if (!userId || !projectId) {
    return { hasAccess: false, status: "not_found" };
  }

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      members: {
        where: { userId }
      },
      joinRequests: {
        where: { userId }
      }
    }
  });

  if (!project) {
    return { hasAccess: false, status: "not_found" };
  }

  // Project owner always has access
  if (project.ownerId === userId) {
    return { hasAccess: true, status: "owner" };
  }

  // Check if the user is an accepted member
  if (project.members.length > 0) {
    return { hasAccess: true, status: "member" };
  }

  // Check if the user has a pending join request
  const hasPending = project.joinRequests.some(r => r.status === "pending");
  if (hasPending) {
    return { hasAccess: false, status: "pending" };
  }

  // Otherwise, no access
  return { hasAccess: false, status: "not_member" };
}
