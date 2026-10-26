import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);

    // Find or create self conversation
    let selfConversation = await prisma.conversation.findFirst({
      where: {
        project: null,
        participants: {
          every: { userId: user!.id }
        }
      },
      include: {
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1
        }
      }
    });

    if (!selfConversation) {
      selfConversation = await prisma.conversation.create({
        data: {
          participants: {
            create: [{ userId: user!.id }]
          }
        },
        include: {
          messages: {
            orderBy: { createdAt: "desc" },
            take: 1
          }
        }
      });
    }

    // Get current user profile details
    const dbUser = await prisma.user.findUnique({
      where: { id: user!.id },
      select: {
        id: true,
        firebaseUid: true,
        profile: { select: { fullName: true, photo: true } }
      }
    });

    const latestMessage = selfConversation.messages[0];

    return NextResponse.json({
      success: true,
      data: {
        id: selfConversation.id,
        isSelf: true,
        otherUser: {
          id: dbUser?.id,
          firebaseUid: dbUser?.firebaseUid,
          name: "Note to Self (You)",
          photo: dbUser?.profile?.photo || ""
        },
        hasUnread: false,
        latestMessage: latestMessage ? {
          id: latestMessage.id,
          message: latestMessage.message,
          createdAt: latestMessage.createdAt,
          isDeleted: latestMessage.isDeleted,
          senderId: latestMessage.senderId
        } : null,
        updatedAt: selfConversation.updatedAt,
        project: null
      }
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
