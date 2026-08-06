import "server-only";
import { auth } from "@/lib/firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  UserCredential,
  User
} from "firebase/auth";
import { LoginInput, RegisterInput } from "@/features/auth/schemas/authSchema";
import { userService } from "@/services/prismaService.server";

/**
 * Server-side auth service.
 * Used ONLY in Server Actions, Route Handlers, and Server Components.
 * Client components must use authService.ts (Firebase-only) instead.
 */
export const authService = {
  async login(credentials: LoginInput): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, credentials.email, credentials.password);
  },

  getCurrentUser() {
    return auth.currentUser;
  },

  async register(credentials: RegisterInput): Promise<UserCredential> {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      credentials.email,
      credentials.password
    );

    const fullName = credentials.name.trim();

    await updateProfile(userCredential.user, {
      displayName: fullName,
    });

    // Create user in PostgreSQL (server-side Prisma call — safe here)
    const existing = await userService.findByFirebaseUid(userCredential.user.uid);
    if (!existing) {
      await userService.createFromFirebaseUser(userCredential.user);
    }

    return userCredential;
  },

  async logout(): Promise<void> {
    return firebaseSignOut(auth);
  },

  async syncUserToDatabase(user: User) {
    const existing = await userService.findByFirebaseUid(user.uid);
    if (!existing) {
      await userService.createFromFirebaseUser(user);
    }
  }
};