import { NextResponse } from "next/server";
import { ensureProfileShell, getProfile, saveCompletedProfile, listCompletedProfiles } from "./utils";
import { verifyAuth } from "@/utils/auth";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const uid = searchParams.get('uid');
  const action = searchParams.get('action');

  try {
    if (action === 'list') {
      const profiles = await listCompletedProfiles();
      return NextResponse.json({ success: true, data: profiles });
    } else if (uid) {
      const profile = await getProfile(uid);
      if (!profile) {
        return NextResponse.json({ success: false, error: "Profile not found" }, { status: 404 });
      }
      return NextResponse.json({ success: true, data: profile });
    }

    return NextResponse.json({ success: false, error: "Invalid request" }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const { email, name, input } = await request.json();
    
    // Ensure the request comes from an authenticated user and get their genuine UID
    const { firebaseUid } = await verifyAuth(request, false);

    if (input) {
      // Save completed profile
      await ensureProfileShell(firebaseUid, email, name);
      await saveCompletedProfile(firebaseUid, input);
      return NextResponse.json({ success: true });
    } else {
      // Ensure profile shell
      const user = await ensureProfileShell(firebaseUid, email, name);
      return NextResponse.json({ success: true, userId: user.id });
    }
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}