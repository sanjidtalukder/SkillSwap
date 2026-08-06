import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  const { id, requestId } = await params;

  try {
    const { user } = await verifyAuth(request);
    
    // Check ownership
    const project = await prisma.project.findUnique({ where: { id } });
    if (!project || project.ownerId !== user!.id) {
      return NextResponse.json({ success: false, error: "Unauthorized or not found" }, { status: 403 });
    }

    const body = await request.json();
    const { status } = body; // "accepted" or "rejected"

    if (status !== "accepted" && status !== "rejected") {
      return NextResponse.json({ success: false, error: "Invalid status" }, { status: 400 });
    }

    const joinRequest = await prisma.projectJoinRequest.findUnique({ where: { id: requestId } });
    if (!joinRequest || joinRequest.projectId !== id) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    // Process accept or reject using a transaction if accepted
    if (status === "accepted") {
      await prisma.$transaction(async (tx) => {
        // Update request
        await tx.projectJoinRequest.update({
          where: { id: requestId },
          data: { status: "accepted" },
        });

        // Add to members
        await tx.projectMember.create({
          data: {
            projectId: id,
            userId: joinRequest.userId,
            role: "member",
          }
        });
      });
    } else {
      await prisma.projectJoinRequest.update({
        where: { id: requestId },
        data: { status: "rejected" },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; requestId: string }> }
) {
  const { id, requestId } = await params;

  try {
    const { user } = await verifyAuth(request);
    
    const joinRequest = await prisma.projectJoinRequest.findUnique({ where: { id: requestId } });
    if (!joinRequest || joinRequest.projectId !== id) {
      return NextResponse.json({ success: false, error: "Request not found" }, { status: 404 });
    }

    // Only the requester can cancel their request
    if (joinRequest.userId !== user!.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    await prisma.projectJoinRequest.delete({ where: { id: requestId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
