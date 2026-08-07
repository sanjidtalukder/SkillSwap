import { NextResponse, NextRequest } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function GET(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);

    let settings = await prisma.userSettings.findUnique({
      where: { userId: user!.id }
    });

    if (!settings) {
      settings = await prisma.userSettings.create({
        data: { userId: user!.id }
      });
    }

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("Error fetching settings:", error);
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user } = await verifyAuth(request);

    const body = await request.json();
    const {
      searchAppearance,
      showOnlineStatus,
      allowConnectionRequests,
      allowProjectInvitations,
      messagePrivacy,
      notifyConnectionRequests,
      notifyProjectRequests,
      notifyProjectAccepted,
      notifyMessages,
      notifySystem,
      notifyEmail,
      theme
    } = body;

    const settings = await prisma.userSettings.upsert({
      where: { userId: user!.id },
      update: {
        ...(searchAppearance !== undefined && { searchAppearance }),
        ...(showOnlineStatus !== undefined && { showOnlineStatus }),
        ...(allowConnectionRequests !== undefined && { allowConnectionRequests }),
        ...(allowProjectInvitations !== undefined && { allowProjectInvitations }),
        ...(messagePrivacy !== undefined && { messagePrivacy }),
        ...(notifyConnectionRequests !== undefined && { notifyConnectionRequests }),
        ...(notifyProjectRequests !== undefined && { notifyProjectRequests }),
        ...(notifyProjectAccepted !== undefined && { notifyProjectAccepted }),
        ...(notifyMessages !== undefined && { notifyMessages }),
        ...(notifySystem !== undefined && { notifySystem }),
        ...(notifyEmail !== undefined && { notifyEmail }),
        ...(theme !== undefined && { theme }),
      },
      create: {
        userId: user!.id,
        searchAppearance: searchAppearance ?? true,
        showOnlineStatus: showOnlineStatus ?? true,
        allowConnectionRequests: allowConnectionRequests ?? true,
        allowProjectInvitations: allowProjectInvitations ?? true,
        messagePrivacy: messagePrivacy ?? "everyone",
        notifyConnectionRequests: notifyConnectionRequests ?? true,
        notifyProjectRequests: notifyProjectRequests ?? true,
        notifyProjectAccepted: notifyProjectAccepted ?? true,
        notifyMessages: notifyMessages ?? true,
        notifySystem: notifySystem ?? true,
        notifyEmail: notifyEmail ?? true,
        theme: theme ?? "dark",
      }
    });

    return NextResponse.json({ data: settings });
  } catch (error) {
    console.error("Error updating settings:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
