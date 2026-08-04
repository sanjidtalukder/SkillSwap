import { z } from "zod";
import { AppError, FirebaseAppError, ValidationError, NetworkError } from "./errors";

export interface NormalizedError {
  code: string;
  message: string;
  userMessage: string;
  statusCode: number;
  isOffline?: boolean;
}

function isOfflineError(code?: string, message = "") {
  const normalizedMessage = message.toLowerCase();

  return (
    code === "unavailable" ||
    code === "auth/network-request-failed" ||
    normalizedMessage.includes("client is offline") ||
    normalizedMessage.includes("network") ||
    normalizedMessage.includes("offline")
  );
}

/**
 * Centralized Error Parser Utility
 * Normalizes any error (Firebase, Zod, Network, or unknown) into a structured NormalizedError.
 */
export function parseError(error: unknown): NormalizedError {
  // Case 1: Already an AppError instance
  if (error instanceof AppError) {
    return {
      code: error.code,
      message: error.message,
      userMessage: error.userMessage,
      statusCode: error.statusCode,
      isOffline: isOfflineError(error.code, error.message),
    };
  }

  // Case 2: Zod Schema Validation Error
  if (error instanceof z.ZodError) {
    const firstIssue = error.issues[0];
    const message = firstIssue
      ? `${firstIssue.path.join(".")}: ${firstIssue.message}`
      : "Validation failed";
    return {
      code: "VALIDATION_ERROR",
      message,
      userMessage: firstIssue?.message || "Please check your form inputs.",
      statusCode: 400,
    };
  }

  // Case 3: Firebase SDK Error object (has .code property)
  if (typeof error === "object" && error !== null && "code" in error) {
    const fbError = error as { code: string; message?: string };
    const message = fbError.message || "Firebase operation failed";
    const offline = isOfflineError(fbError.code, message);

    if (offline) {
      return {
        code: fbError.code || "NETWORK_ERROR",
        message,
        userMessage: "Unable to reach the database. Please check your connection and try again.",
        statusCode: 503,
        isOffline: true,
      };
    }

    const parsedFbError = new FirebaseAppError(
      fbError.code,
      message
    );
    return {
      code: parsedFbError.code,
      message: parsedFbError.message,
      userMessage: parsedFbError.userMessage,
      statusCode: parsedFbError.statusCode,
      isOffline: false,
    };
  }

  // Case 4: Native Fetch / Network Error
  if (error instanceof TypeError && error.message.toLowerCase().includes("fetch")) {
    const netError = new NetworkError();
    return {
      code: netError.code,
      message: netError.message,
      userMessage: netError.userMessage,
      statusCode: netError.statusCode,
      isOffline: true,
    };
  }

  // Case 5: Standard JS Error
  if (error instanceof Error) {
    return {
      code: "UNKNOWN_ERROR",
      message: error.message,
      userMessage: error.message || "An unexpected error occurred. Please try again.",
      statusCode: 500,
      isOffline: isOfflineError(undefined, error.message),
    };
  }

  // Case 6: Fallback for unknown primitive throws (string, null, undefined)
  return {
    code: "UNKNOWN_ERROR",
    message: String(error),
    userMessage: "An unexpected error occurred. Please try again.",
    statusCode: 500,
    isOffline: isOfflineError(undefined, String(error)),
  };
}

/**
 * Helper to quickly extract user-friendly error message string
 */
export function getErrorMessage(error: unknown): string {
  return parseError(error).userMessage;
}
