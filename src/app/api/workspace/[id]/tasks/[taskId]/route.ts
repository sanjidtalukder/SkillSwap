import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string, taskId: string }> }
) {
  try {
    const { user } = await verifyAuth(request);
    const resolvedParams = await params;
    const body = await request.json();
    
    // @ts-ignore
    const task = await prisma.projectTask.update({
      where: { id: resolvedParams.taskId },
      data: {
        status: body.status,
      }
    });

    return NextResponse.json({ success: true, data: task });
  } catch (error) {
    return NextResponse.json({ success: false, error: "Unknown error" }, { status: 500 });
  }
}
