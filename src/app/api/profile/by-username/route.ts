import { NextRequest, NextResponse } from "next/server";
import { getProfileByUsername } from "@/app/api/db/profile/utils";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const username = searchParams.get("username");

    if (!username) {
      return NextResponse.json({ error: "Username is required" }, { status: 400 });
    }

    const profile = await getProfileByUsername(username);

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, profile }, { status: 200 });
  } catch (error) {
    console.error("Error fetching profile by username:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
