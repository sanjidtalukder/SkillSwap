import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;

  try {
    const { user } = await verifyAuth(request);

    // Verify participation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user!.id
        }
      }
    });

    if (!participant) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // Mark as read
    await prisma.conversationParticipant.update({
      where: { id: participant.id },
      data: { hasUnread: false, lastReadAt: new Date() }
    });

    const messages = await prisma.message.findMany({
      where: { conversationId },
      include: {
        sender: {
          select: {
            id: true,
            firebaseUid: true,
            profile: { select: { fullName: true, photo: true } }
          }
        }
      },
      orderBy: { createdAt: "asc" }
    });

    return NextResponse.json({ success: true, data: messages });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: conversationId } = await params;

  try {
    const { user } = await verifyAuth(request);
    const body = await request.json();
    const { message } = body;

    if (!message || message.trim() === "") {
      return NextResponse.json({ success: false, error: "Message cannot be empty" }, { status: 400 });
    }

    // Verify participation
    const participant = await prisma.conversationParticipant.findUnique({
      where: {
        conversationId_userId: {
          conversationId,
          userId: user!.id
        }
      }
    });

    if (!participant) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // Create message
    const newMessage = await prisma.message.create({
      data: {
        conversationId,
        senderId: user!.id,
        message: message.trim()
      },
      include: {
        sender: {
          select: {
            id: true,
            firebaseUid: true,
            profile: { select: { fullName: true, photo: true } }
          }
        }
      }
    });

    // Update conversation updatedAt and notify other participants
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    await prisma.conversationParticipant.updateMany({
      where: {
        conversationId,
        userId: { not: user!.id }
      },
      data: { hasUnread: true }
    });

    const otherParticipants = await prisma.conversationParticipant.findMany({
      where: {
        conversationId,
        userId: { not: user!.id }
      },
      select: { userId: true }
    });

    if (otherParticipants.length > 0) {
      const senderName = newMessage.sender.profile?.fullName || "A user";
      await prisma.notification.createMany({
        data: otherParticipants.map(p => ({
          recipientId: p.userId,
          senderId: user!.id,
          type: "message",
          title: "New message received",
          body: `${senderName} sent you a message`,
          linkUrl: `/chat/${conversationId}`
        }))
      });
    }

    return NextResponse.json({ success: true, data: newMessage });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
