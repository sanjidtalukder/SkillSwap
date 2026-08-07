import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);
    
    // Get all conversations for the user
    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: { userId: user!.id }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                firebaseUid: true,
                profile: {
                  select: { fullName: true, photo: true }
                }
              }
            }
          }
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        },
        project: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { updatedAt: "desc" }
    });

    const formatted = conversations.map(c => {
      const otherParticipant = c.participants.find(p => p.userId !== user!.id);
      const myParticipant = c.participants.find(p => p.userId === user!.id);
      const latestMessage = c.messages[0];

      return {
        id: c.id,
        otherUser: {
          id: otherParticipant?.user.id,
          firebaseUid: otherParticipant?.user.firebaseUid,
          name: otherParticipant?.user.profile?.fullName || "Unknown User",
          photo: otherParticipant?.user.profile?.photo || ""
        },
        hasUnread: myParticipant?.hasUnread || false,
        latestMessage: latestMessage ? {
          id: latestMessage.id,
          message: latestMessage.message,
          createdAt: latestMessage.createdAt,
          isDeleted: latestMessage.isDeleted,
          senderId: latestMessage.senderId
        } : null,
        updatedAt: c.updatedAt,
        project: c.project ? {
          id: c.project.id,
          title: c.project.title
        } : null
      };
    });

    return NextResponse.json({ success: true, data: formatted });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);
    const body = await request.json();
    const { targetUserId } = body; // This is the PostgreSQL user ID of the target, NOT firebaseUid

    if (!targetUserId) {
      return NextResponse.json({ success: false, error: "targetUserId is required" }, { status: 400 });
    }
    
    if (user!.id === targetUserId) {
      return NextResponse.json({ success: false, error: "Cannot start conversation with yourself" }, { status: 400 });
    }

    // Verify connection status
    const connection = await prisma.matchRequest.findFirst({
      where: {
        OR: [
          { senderId: user!.id, receiverId: targetUserId },
          { senderId: targetUserId, receiverId: user!.id }
        ]
      }
    });

    if (!connection || connection.status !== "accepted") {
      return NextResponse.json(
        { 
          success: false, 
          error: "You must be connected before starting a conversation.",
          connectionStatus: connection ? connection.status : "not_connected" 
        },
        { status: 403 }
      );
    }

    // Check if conversation already exists between these two users
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        AND: [
          { participants: { some: { userId: user!.id } } },
          { participants: { some: { userId: targetUserId } } }
        ]
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, firebaseUid: true, profile: { select: { fullName: true, photo: true } } } }
          }
        }
      }
    });

    if (existingConversation) {
      return NextResponse.json({ success: true, data: existingConversation });
    }

    // Create new conversation
    const newConversation = await prisma.conversation.create({
      data: {
        participants: {
          create: [
            { userId: user!.id },
            { userId: targetUserId }
          ]
        }
      },
      include: {
        participants: {
          include: {
            user: { select: { id: true, firebaseUid: true, profile: { select: { fullName: true, photo: true } } } }
          }
        }
      }
    });

    return NextResponse.json({ success: true, data: newConversation });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
