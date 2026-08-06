import * as admin from "firebase-admin";

const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

if (!projectId) {
  console.warn("NEXT_PUBLIC_FIREBASE_PROJECT_ID is not defined. Firebase Admin SDK may not initialize correctly.");
}

// Initialize the Firebase Admin SDK if it hasn't been initialized yet
if (!admin.apps.length) {
  admin.initializeApp({
    projectId: projectId,
  });
}

const adminAuth = admin.auth();

export { adminAuth, admin };
