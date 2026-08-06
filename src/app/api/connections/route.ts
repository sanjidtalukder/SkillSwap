import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";
import { verifyAuth } from "@/utils/auth";

export async function POST(request: Request) {
  try {
    const { user } = await verifyAuth(request);
    const requesterId = user!.id;
    
    const { recipientId } = await request.json();

    if (!recipientId) {
      return NextResponse.json({ error: "Missing recipient ID" }, { status: 400 });
    }

    if (requesterId === recipientId) {
      return NextResponse.json(
        { error: "You cannot connect with yourself." },
        { status: 400 }
      );
    }

    // Check if connection already exists
    const existing = await prisma.matchRequest.findUnique({
      where: {
        senderId_receiverId: {
          senderId: requesterId,
          receiverId: recipientId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ status: "exists" });
    }

    // Create match request
    await prisma.matchRequest.create({
      data: {
        senderId: requesterId,
        receiverId: recipientId,
        status: "pending",
      },
    });

    // Create notification
    // Use the requester's name directly from their database profile rather than the request payload
    const profile = await prisma.profile.findUnique({ where: { userId: requesterId } });
    const requesterName = profile?.fullName || "A student";

    await prisma.notification.create({
      data: {
        recipientId,
        senderId: requesterId,
        type: "connection_request",
        title: "New connection request",
        body: `${requesterName} wants to connect for a skill swap.`,
        linkUrl: `/profile/${requesterId}`,
      },
    });

    return NextResponse.json({ status: "created" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: error instanceof Error && error.message === "Unauthorized" ? 401 : 500 }
    );
  }
}
