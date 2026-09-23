
import { queryClient } from "./baseProvider";

let refreshPromise: Promise<boolean> | null = null;
let logoutStarted = false;

const refreshAccessToken = async (): Promise<boolean> => {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

      if (!backendUrl) {
        throw new Error("NEXT_PUBLIC_BACKEND_URL is not configured");
      }
      const response = await fetch(
        `${backendUrl}/auth/refresh`,
        {
          method: "POST",
          credentials: "include",
        },
      );

      return response.ok;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};


const logoutAndRedirect = () => {
  if (logoutStarted) {
    return;
  }

  logoutStarted = true;

  queryClient.clear();

  if (typeof window !== "undefined") {
    window.location.href = "/auth/signin";
  }
};

const request = async (
  url: string,
  options: RequestInit,
  isRetry: boolean,
): Promise<any> => {
  const response = await fetch(url, {
    ...options,
    credentials: "include",
  });

  const data = await response.json().catch(() => ({}));

  if (response.status === 401 && !isRetry) {
    const refreshed = await refreshAccessToken();

    if (refreshed) {
      return request(url, options, true);
    }

    logoutAndRedirect();

    throw (
      data || {
        message: "Session expired. Please sign in again.",
      }
    );
  }

  if (response.status === 401) {
    logoutAndRedirect();

    throw (
      data || {
        message: "Session expired. Please sign in again.",
      }
    );
  }

  if (!response.ok) {
    throw (
      data || {
        message: `Request failed with status ${response.status}`,
      }
    );
  }

  return data;
};

export const authenticatedFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<any> => {
  return request(url, options, false);
};
