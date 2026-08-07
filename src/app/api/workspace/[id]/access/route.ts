import { NextResponse, NextRequest } from "next/server";
import { verifyAuth } from "@/utils/auth";
import { canAccessWorkspace } from "@/utils/workspace-auth";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { user } = await verifyAuth(request);
    const resolvedParams = await params;
    
    const result = await canAccessWorkspace(user!.id, resolvedParams.id);
    
    return NextResponse.json({ success: true, ...result });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }
}
