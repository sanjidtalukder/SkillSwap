/**
 * Client-safe auth service.
 * Only contains Firebase Auth operations — NO Prisma, NO server imports.
 * Profile database sync is handled by API routes.
 */
import { auth } from "@/lib/firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { LoginInput, RegisterInput } from "@/features/auth/schemas/authSchema";

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

    return userCredential;
  },

  async logout(): Promise<void> {
    return firebaseSignOut(auth);
  },
};