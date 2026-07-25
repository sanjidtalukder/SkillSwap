import { parseError, NormalizedError } from "@/utils/errorHandler";

export interface ServiceResult<T> {
  data: T | null;
  error: NormalizedError | null;
}

/**
 * Enterprise Base Service Wrapper
 * Normalizes all Firebase, validation, network, and runtime exceptions into a user-friendly error object.
 */
export async function handleServiceCall<T>(
  action: () => Promise<T>,
  fallbackMessage = "An error occurred during operation"
): Promise<ServiceResult<T>> {
  try {
    const data = await action();
    return { data, error: null };
  } catch (err: unknown) {
    const normalized = parseError(err);
    if (
      !normalized.userMessage ||
      normalized.userMessage === "An unexpected error occurred. Please try again."
    ) {
      normalized.userMessage = fallbackMessage;
    }
    console.error(`[Service Error ${normalized.code}]:`, err);
    return { data: null, error: normalized };
  }
}
