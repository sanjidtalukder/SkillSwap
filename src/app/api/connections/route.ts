import { NextResponse } from "next/server";
import prisma from "@/lib/prisma.server";

export async function POST(request: Request) {
  try {
    const { requesterId, requesterName, requesterPhoto, recipientId } = await request.json();

    if (!requesterId || !recipientId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
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
    await prisma.notification.create({
      data: {
        recipientId,
        senderId: requesterId,
        type: "connection_request",
        title: "New connection request",
        body: `${requesterName || "A student"} wants to connect for a skill swap.`,
        linkUrl: `/profile/${requesterId}`,
      },
    });

    return NextResponse.json({ status: "created" });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
