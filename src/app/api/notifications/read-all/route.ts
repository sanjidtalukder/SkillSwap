import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";

export async function PATCH(request: Request) {
  try {
    const { ids } = await request.json();

    if (!Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json({ success: true });
    }

    await prisma.notification.updateMany({
      where: { id: { in: ids } },
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
