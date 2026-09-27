import { refreshAccessToken } from "./refresh-auth";
import { sessionManager } from "./session-manager";


type AuthenticatedFetchOptions = RequestInit & {
  suppressSessionExpired?: boolean;
};

const request = async (
  url: string,
  options: AuthenticatedFetchOptions,
  isRetry: boolean,
): Promise<any> => {

  const { suppressSessionExpired, ...requestOptions } = options;

  const response = await fetch(url, {
    ...requestOptions,
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
    if(!suppressSessionExpired && !sessionManager.isLogoutInProgress()){
      sessionManager.notifySessionExpired();
    }

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
  options:AuthenticatedFetchOptions = {},
): Promise<any> => {
  return request(url, options, false);
};