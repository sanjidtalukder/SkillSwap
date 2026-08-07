import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { id: conversationId, messageId } = await params;

  try {
    const { user } = await verifyAuth(request);
    const body = await request.json();
    const { message } = body;

    if (!message || message.trim() === "") {
      return NextResponse.json({ success: false, error: "Message cannot be empty" }, { status: 400 });
    }

    // Verify ownership
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!existingMessage || existingMessage.conversationId !== conversationId) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }

    if (existingMessage.senderId !== user!.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    if (existingMessage.isDeleted) {
      return NextResponse.json({ success: false, error: "Cannot edit deleted message" }, { status: 400 });
    }

    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        message: message.trim(),
        isEdited: true
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

    return NextResponse.json({ success: true, data: updatedMessage });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; messageId: string }> }
) {
  const { id: conversationId, messageId } = await params;

  try {
    const { user } = await verifyAuth(request);

    // Verify ownership
    const existingMessage = await prisma.message.findUnique({
      where: { id: messageId }
    });

    if (!existingMessage || existingMessage.conversationId !== conversationId) {
      return NextResponse.json({ success: false, error: "Message not found" }, { status: 404 });
    }

    if (existingMessage.senderId !== user!.id) {
      return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 403 });
    }

    // Soft delete
    const deletedMessage = await prisma.message.update({
      where: { id: messageId },
      data: {
        message: "",
        isDeleted: true
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

    return NextResponse.json({ success: true, data: deletedMessage });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
