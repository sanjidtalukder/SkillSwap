import { adminAuth } from "@/lib/firebase-admin";
import prisma from "@/lib/prisma.server";
import { User } from "@prisma/client";

export interface AuthContext {
  firebaseUid: string;
  user: User | null;
  error?: string;
}

/**
 * Extracts and verifies the Firebase ID token from the Request header.
 * 
 * @param request The incoming Next.js API Request
 * @param requireUser If true, the function will throw an error if the Prisma User record is not found.
 * @returns The authenticated AuthContext
 */
export async function verifyAuth(request: Request, requireUser: boolean = true): Promise<AuthContext> {
  const authHeader = request.headers.get("Authorization");
  
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new Error("Missing or invalid Authorization header");
  }

  const token = authHeader.split("Bearer ")[1];

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    const firebaseUid = decodedToken.uid;

    const user = await prisma.user.findUnique({
      where: { firebaseUid }
    });

    if (requireUser && !user) {
      throw new Error("User record not found in the database");
    }

    return {
      firebaseUid,
      user
    };
  } catch (error) {
    console.error("Auth verification failed:", error);
    throw new Error("Unauthorized");
  }
}
