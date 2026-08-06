import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function PATCH(request: Request) {
  try {
    const { user } = await verifyAuth(request);
    const userId = user!.id;

    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: true });
    }

    // Ensure they only update their own notifications
    await prisma.notification.updateMany({
      where: { 
        id: { in: ids },
        recipientId: userId
      },
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
