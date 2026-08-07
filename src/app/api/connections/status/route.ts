import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);
    const userId = user!.id;
    
    const targetUserId = request.nextUrl.searchParams.get("targetUserId");
    if (!targetUserId) {
      return NextResponse.json({ error: "Missing targetUserId" }, { status: 400 });
    }

    if (userId === targetUserId) {
      return NextResponse.json({ status: "NOT_CONNECTED" });
    }

    const connection = await prisma.matchRequest.findFirst({
      where: {
        OR: [
          { senderId: userId, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: userId }
        ]
      }
    });

    if (!connection) {
      return NextResponse.json({ status: "NOT_CONNECTED" });
    }

    if (connection.status === "accepted") {
      // Check if conversation exists
      const existingConversation = await prisma.conversation.findFirst({
        where: {
          AND: [
            { participants: { some: { userId: userId } } },
            { participants: { some: { userId: targetUserId } } }
          ]
        },
        select: { id: true }
      });

      return NextResponse.json({
        status: "ACCEPTED",
        conversationId: existingConversation?.id
      });
    }

    if (connection.status === "rejected") {
      return NextResponse.json({ status: "REJECTED" });
    }

    if (connection.status === "pending") {
      if (connection.senderId === userId) {
        return NextResponse.json({ status: "PENDING_SENT" });
      } else {
        return NextResponse.json({ status: "PENDING_RECEIVED" });
      }
    }

    return NextResponse.json({ status: "NOT_CONNECTED" });

  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
