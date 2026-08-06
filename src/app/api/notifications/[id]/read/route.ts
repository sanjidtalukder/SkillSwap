import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  if (!id) {
    return NextResponse.json({ error: "Missing notification ID" }, { status: 400 });
  }

  try {
    const { user } = await verifyAuth(request);
    const userId = user!.id;

    // Verify ownership
    const notification = await prisma.notification.findUnique({ where: { id } });
    if (!notification || notification.recipientId !== userId) {
      return NextResponse.json({ error: "Notification not found or unauthorized" }, { status: 403 });
    }

    await prisma.notification.update({
      where: { id },
      data: { read: true },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
