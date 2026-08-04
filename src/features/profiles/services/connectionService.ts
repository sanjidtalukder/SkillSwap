import { doc, getDoc, serverTimestamp, writeBatch } from "firebase/firestore";
import { db } from "@/firebase";
import { handleServiceCall, ServiceResult } from "@/services/baseService";

interface SendConnectionRequestInput {
  requesterId: string;
  requesterName: string;
  requesterPhoto?: string;
  recipientId: string;
}

export const connectionService = {
  async sendConnectionRequest({
    requesterId,
    requesterName,
    requesterPhoto,
    recipientId,
  }: SendConnectionRequestInput): Promise<ServiceResult<"created" | "exists">> {
    return handleServiceCall(async () => {
      if (requesterId === recipientId) {
        throw new Error("You cannot connect with yourself.");
      }

      const connectionId = `${requesterId}_${recipientId}`;
      const connectionRef = doc(db, "connections", connectionId);
      const existingConnection = await getDoc(connectionRef);

      if (existingConnection.exists()) {
        return "exists";
      }

      const notificationRef = doc(db, "notifications", connectionId);
      const batch = writeBatch(db);

      batch.set(connectionRef, {
        connectionId,
        requesterId,
        recipientId,
        type: "skill_swap",
        status: "pending",
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });

      batch.set(notificationRef, {
        notificationId: connectionId,
        recipientId,
        senderId: requesterId,
        senderName: requesterName,
        senderAvatarUrl: requesterPhoto || "",
        type: "connection_request",
        title: "New connection request",
        body: `${requesterName} wants to connect for a skill swap.`,
        linkUrl: `/profile/${requesterId}`,
        read: false,
        createdAt: serverTimestamp(),
      });

      await batch.commit();

      return "created";
    }, "Failed to send connection request.");
  },
};
