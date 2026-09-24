import { queryClient } from "../baseProvider";
import { refreshAccessToken } from "./refresh-auth";

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

  if (response.status === 401) {
    if (!isRetry) {
      const refreshed = await refreshAccessToken();

      if (refreshed) {
        return request(url, options, true);
      }
    }

    return {
      ok: true,
      user: null,
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

export const optionalAuthFetch = async (
  url: string,
  options: RequestInit = {},
): Promise<any> => {
  return request(url, options, false);
};
