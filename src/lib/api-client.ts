import { auth } from "@/firebase";

/**
 * A wrapper around native `fetch` that automatically injects the Firebase Auth ID Token
 * into the `Authorization` header.
 * 
 * @param input The resource URL or Request object
 * @param init Optional Request options
 * @returns The Response promise
 */
export async function fetchWithAuth(input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
  let token = null;

  if (auth.currentUser) {
    try {
      token = await auth.currentUser.getIdToken();
    } catch (error) {
      console.error("Failed to get ID token from current user:", error);
    }
  }

  const headers = new Headers(init?.headers);
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  return fetch(input, {
    ...init,
    headers,
  });
}
