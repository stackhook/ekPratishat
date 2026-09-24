import { getAgentDetailAction, getAgentListAction } from "@repo/actions";
import { authenticatedFetch, optionalAuthFetch } from "@repo/shared-provider";
import { useQuery } from "@tanstack/react-query";

interface UserProps {
  id: string;
  name: string;
  role: string;
  profileImageUrl: string | null;
}

type User = UserProps | null;

interface UserQueryType {
  page?: number;
  pageSize?: number;
  isVerified?: string;
  q?: string;
  role?: string;
  isActive?: string;
}

export const useGetAgents = (options = {}) => {
  return useQuery({
    queryKey: ["agents-list"],
    queryFn: getAgentListAction,
    retry: 1,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
    ...options,
  });
};

export const useGetAgentDetail = (id: string) => {
  return useQuery({
    queryKey: ["agent-detail", id],
    queryFn: async () => {
      const res = await getAgentDetailAction(id);
      if (res.status === 200) {
        return res;
      }
    },
    retry: 1,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useUser = () => {
  return useQuery({
    queryKey: ["user-info"],
    queryFn: async () => {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/my-info`,
      );
      return res.user;
    },
    retry: 1,
    staleTime: 1 * 60 * 1000,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useGetUserInfo = () => {
  return useQuery({
    queryKey: ["my-information"],
    queryFn: async () => {
      const res = await optionalAuthFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/auth/my-info-optional`,
      );
      return res.user;
    },
    staleTime: 30 * 1000,
    refetchInterval: 2 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useCheckFavourite = ({
  propertyId,
  user,
}: {
  propertyId: string;
  user: User;
}) => {
  return useQuery({
    queryKey: ["favourite", user?.id, propertyId],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/listing/check-favourite`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ propertyId, userId: user?.id }),
        },
      );
      const data = await res.json();
      return data.result;
    },
    enabled: !!user && !!propertyId,
    staleTime: 5 * 60 * 1000,
  });
};

//get staff,agent and client list
export const useGetAllUsers = ({
  page = 1,
  q = "",
  pageSize = 20,
  isVerified = "",
  role = "",
  isActive = "",
}: UserQueryType) => {
  return useQuery({
    queryKey: ["all-users", { page, role, isVerified, q, pageSize, isActive }],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(q && { q }),
        ...(role && { role }),
        ...(isVerified !== "" && { isVerified: String(isVerified) }),
        ...(isActive !== "" && { isActive: String(isActive) }),
      });

      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/get-all?${params.toString()}`,
        { method: "GET" },
      );
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });
};

export const useGetAdminStaff = (open: boolean) => {
  return useQuery({
    queryKey: ["admin-staff"],
    queryFn: async () => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/get-admin-staff`,
        { method: "GET" },
      );
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: true,
    enabled: open,
  });
};

export const useGetStaff = (open: boolean) => {
  return useQuery({
    queryKey: ["all-staff"],
    queryFn: async () => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/get-staff`,
        { method: "GET" },
      );
    },
    staleTime: 5 * 60 * 1000,
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: true,
    enabled: open,
  });
};

export const useGetMyTotalPropertyValue = ({
  enabled,
}: {
  enabled: boolean;
}) => {
  return useQuery({
    queryKey: ["my-total-property-value"],
    queryFn: async () => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/users/my-total-property-value`,
        { method: "GET" },
      );
    },
    staleTime: 2 * 60 * 60 * 1000,
    refetchInterval: 2 * 60 * 60 * 1000,
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: true,
    enabled: enabled,
  });
};

export const useGetAllDesignations = (open: boolean) => {
  return useQuery({
    queryKey: ["all-designations"],
    queryFn: async () => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/permissions/designations`,
        { method: "GET" },
      );
    },
    staleTime: 2 * 60 * 60 * 1000,
    refetchInterval: 2 * 60 * 60 * 1000,
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: true,
    enabled: open,
  });
};

export const useGetDesignationById = (id: string | null) => {
  return useQuery({
    queryKey: ["designation", id],
    queryFn: async () => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/permissions/designation/${id}`,
        { method: "GET" },
      );
    },
    staleTime: 2 * 60 * 60 * 1000,
    refetchInterval: 2 * 60 * 60 * 1000,
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: true,
    enabled: !!id,
  });
};

export const useGetMyListings = ({
  page,
  pageSize,
}: {
  page: number;
  pageSize: number;
}) => {
  return useQuery({
    queryKey: ["my-listings", { page, pageSize }],
    queryFn: async () => {
      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/listing/my-listings?pageSize=${pageSize}&page=${page}`,
        { method: "GET" },
      );
    },
    staleTime: 15 * 60 * 1000,
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: true,
  });
};
