import { refreshAccessToken } from "./refresh-auth";
import { sessionManager } from "./session-manager";


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
  }

  if (response.status === 401) {
    sessionManager.notifySessionExpired();

    throw {
      message: "Session expired. Please sign in again.",
    };
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