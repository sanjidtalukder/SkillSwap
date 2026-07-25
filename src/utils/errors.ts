/**
 * Base Application Error Class
 */
export class AppError extends Error {
  public readonly code: string;
  public readonly userMessage: string;
  public readonly statusCode: number;

  constructor(message: string, code = "INTERNAL_ERROR", userMessage?: string, statusCode = 500) {
    super(message);
    this.name = this.constructor.name;
    this.code = code;
    this.userMessage = userMessage || message;
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/**
 * Custom Error for Firebase Auth & Firestore Failures
 */
export class FirebaseAppError extends AppError {
  constructor(firebaseCode: string, rawMessage: string) {
    const userFriendlyMessage = getFirebaseUserMessage(firebaseCode, rawMessage);
    super(rawMessage, firebaseCode, userFriendlyMessage, getFirebaseStatusCode(firebaseCode));
  }
}

/**
 * Custom Error for Zod Schema Validation Failures
 */
export class ValidationError extends AppError {
  public readonly errors: Record<string, string>;

  constructor(message: string, errors: Record<string, string> = {}) {
    super(message, "VALIDATION_ERROR", message, 400);
    this.errors = errors;
  }
}

/**
 * Custom Error for Offline / Network Failures
 */
export class NetworkError extends AppError {
  constructor(message = "Network connection lost. Please check your internet connection.") {
    super(message, "NETWORK_ERROR", message, 503);
  }
}

/**
 * Helper to map Firebase SDK error codes to user-friendly messages
 */
function getFirebaseUserMessage(code: string, defaultMsg: string): string {
  const firebaseMessageMap: Record<string, string> = {
    // Auth Errors
    "auth/user-not-found": "No account found with this email address.",
    "auth/wrong-password": "Incorrect password. Please try again.",
    "auth/invalid-credential": "Invalid login credentials. Please check your email and password.",
    "auth/email-already-in-use": "An account with this email address already exists.",
    "auth/weak-password": "Password is too weak. Please use at least 6 characters.",
    "auth/invalid-email": "Please enter a valid email address.",
    "auth/operation-not-allowed":
      "Email/password login is not enabled in Firebase Authentication.",
    "auth/configuration-not-found":
      "Firebase Authentication is not configured for this project yet.",
    "auth/popup-closed-by-user": "Sign in popup was closed before completing.",
    "auth/too-many-requests": "Too many unsuccessful attempts. Please try again later.",
    "auth/network-request-failed": "Network error while connecting to authentication servers.",

    // Firestore Errors
    "permission-denied": "You do not have permission to perform this action.",
    "not-found": "The requested item could not be found.",
    "already-exists": "This record already exists.",
    "resource-exhausted": "Quota limit reached. Please try again shortly.",
    "failed-precondition": "Operation failed due to database query conditions.",
    unavailable: "Database service is temporarily unavailable. Please try again.",
  };

  return (
    firebaseMessageMap[code] || defaultMsg || "An unexpected error occurred. Please try again."
  );
}

function getFirebaseStatusCode(code: string): number {
  if (code.startsWith("auth/")) return 401;
  if (code === "permission-denied") return 403;
  if (code === "not-found") return 404;
  return 500;
}
