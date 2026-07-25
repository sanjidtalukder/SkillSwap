import { auth } from "@/lib/firebase/firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  UserCredential,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase/firebase";
import { LoginInput, RegisterInput } from "../schemas/authSchema";

function createSearchKeywords(name: string, email: string) {
  const normalizedName = name.trim().toLowerCase();
  const parts = normalizedName.split(/\s+/).filter(Boolean);

  return Array.from(new Set([normalizedName, ...parts, email.trim().toLowerCase()]));
}

export const authService = {
  async login(credentials: LoginInput): Promise<UserCredential> {
    return signInWithEmailAndPassword(auth, credentials.email, credentials.password);
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

    await setDoc(doc(db, "users", userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: credentials.email.trim().toLowerCase(),
      fullName,
      skillsOffered: [],
      skillsWanted: [],
      searchKeywords: createSearchKeywords(fullName, credentials.email),
      rating: 5.0,
      completedSwaps: 0,
      isOnline: true,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return userCredential;
  },

  async logout(): Promise<void> {
    return firebaseSignOut(auth);
  },
};
