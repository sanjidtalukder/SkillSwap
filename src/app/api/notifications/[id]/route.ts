import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await verifyAuth(request);
    const userId = user!.id;
    const { id: notificationId } = await params;

    const notification = await prisma.notification.findUnique({
      where: { id: notificationId },
    });

    if (!notification) {
      return NextResponse.json(
        { error: "Notification not found" },
        { status: 404 }
      );
    }

    if (notification.recipientId !== userId) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await prisma.notification.delete({
      where: { id: notificationId },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
