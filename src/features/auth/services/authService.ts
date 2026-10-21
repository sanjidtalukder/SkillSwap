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

  async loginAsDemo(): Promise<UserCredential> {
    const demoEmail = "demo@skillswap.com";
    const demoPassword = "DemoUser@12345";
    try {
      // First try logging into existing demo account
      return await signInWithEmailAndPassword(auth, demoEmail, demoPassword);
    } catch (err: any) {
      // If demo user does not exist in Firebase Auth yet, register it automatically
      if (err.code === "auth/user-not-found" || err.code === "auth/invalid-credential" || err.code === "auth/invalid-login-credentials") {
        const cred = await createUserWithEmailAndPassword(auth, demoEmail, demoPassword);
        await updateProfile(cred.user, {
          displayName: "Demo Explorer",
        });
        return cred;
      }
      throw err;
    }
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