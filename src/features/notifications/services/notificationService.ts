import { db } from "@/firebase";
import {
  collection,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  doc,
  updateDoc,
  writeBatch,
  Unsubscribe,
} from "firebase/firestore";
import { NotificationDocument } from "@/types/firestore";
import { handleServiceCall, ServiceResult } from "@/services/baseService";

const NOTIFICATIONS_COLLECTION = "notifications";
const MAX_NOTIFICATIONS = 20; // Bounded limit to optimize Firestore read bandwidth

export const notificationService = {
  /**
   * Subscribes to real-time notifications for a specific recipient user.
   * Uses bounded queries (limit 20) and returns an unsubscribe function to prevent memory leaks.
   */
  subscribeToNotifications(
    userId: string,
    onData: (notifications: NotificationDocument[]) => void,
    onError?: (err: Error) => void
  ): Unsubscribe {
    const q = query(
      collection(db, NOTIFICATIONS_COLLECTION),
      where("recipientId", "==", userId),
      orderBy("createdAt", "desc"),
      limit(MAX_NOTIFICATIONS)
    );

    return onSnapshot(
      q,
      (snapshot) => {
        const items = snapshot.docs.map((docSnap) => ({
          notificationId: docSnap.id,
          ...docSnap.data(),
        })) as NotificationDocument[];
        onData(items);
      },
      (error) => {
        console.error("[Notification Listener Error]:", error);
        if (onError) onError(error);
      }
    );
  },

  /**
   * Marks a single notification as read.
   */
  async markAsRead(notificationId: string): Promise<ServiceResult<void>> {
    return handleServiceCall(async () => {
      const docRef = doc(db, NOTIFICATIONS_COLLECTION, notificationId);
      await updateDoc(docRef, { read: true });
    }, "Failed to mark notification as read.");
  },

  /**
   * Batch marks all unread notifications as read for a specific user.
   */
  async markAllAsRead(notifications: NotificationDocument[]): Promise<ServiceResult<void>> {
    return handleServiceCall(async () => {
      const unreadItems = notifications.filter((item) => !item.read);
      if (unreadItems.length === 0) return;

      const batch = writeBatch(db);
      unreadItems.forEach((item) => {
        const docRef = doc(db, NOTIFICATIONS_COLLECTION, item.notificationId);
        batch.update(docRef, { read: true });
      });

      await batch.commit();
    }, "Failed to mark all notifications as read.");
  },
};
