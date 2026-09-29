import {
  fetchCategoryAction,
  fetchListingAction,
  fetchLocationTreeAction,
  fetchPropertyDetailAction,
} from "@repo/actions";
import { authenticatedFetch } from "@repo/shared-provider";

import { useQuery } from "@tanstack/react-query";

interface PropertyQueryType {
  page?: number;
  pageSize?: number;
  isVerified?: string;
  isFeatured?: string;
  type?: string;
  c_id?: string;
  isActive?: string;
  q?: string;
  staffId?: string;
  enabled?: boolean;
  isSold?: string;
}

export const useGetCategories = () => {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategoryAction,
    staleTime: 60 * 60 * 1000,
    refetchOnMount: (data) => !data,
    retry: 1,
    retryDelay: 2000,
    refetchOnWindowFocus: true,
  });
};

export const useGetLocationTree = () => {
  return useQuery({
    queryKey: ["location"],
    queryFn: fetchLocationTreeAction,
    retry: 1,
    retryDelay: 2000,
    staleTime: 60 * 60 * 1000,
    refetchOnMount: (data) => !data,
    refetchOnWindowFocus: true,
  });
};

export const useFetchPropertyDetail = (id: string) => {
  return useQuery({
    queryKey: ["property-detail", id],
    queryFn: async () => {
      const res = await authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/listing/${id}`,
        { method: "GET" },
      );
      return res.response?.result;
    },
    retry: 1,
    staleTime: 10 * 60 * 1000,
    refetchOnWindowFocus: true,
  });
};

export const useGetAmenities = () => {
  return useQuery({
    queryKey: ["amenities"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/listing/amenities`,
        { method: "GET" },
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch info");
      }

      return data;
    },
  });
};

export const useGetAllCategories = () => {
  return useQuery({
    queryKey: ["all-categories"],
    queryFn: async () => {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/listing/categories`,
        { method: "GET" },
      );
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.error || "Failed to fetch info");
      }

      return data;
    },
    staleTime: 5 * 60 * 1000,
  });
};

export const useGetAllProperties = ({
  page = 1,
  pageSize = 20,
  c_id = "",
  isActive = "",
  isFeatured = "",
  type = "",
  isVerified = "",
  q = "",
  staffId = "",
  enabled = true,
  isSold,
}: PropertyQueryType) => {
  return useQuery({
    queryKey: [
      "all-properties",
      {
        page,
        c_id,
        isActive,
        isFeatured,
        type,
        isVerified,
        q,
        staffId,
        isSold,
      },
    ],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        ...(q && { q }),
        ...(type && { type }),
        ...(c_id && { c_id }),
        ...(isActive !== "" && { isActive: String(isActive) }),
        ...(isVerified !== "" && { isVerified: String(isVerified) }),
        ...(isFeatured !== "" && { isFeatured: String(isFeatured) }),
        ...(staffId && { staffId }),
        ...(isSold !== "" && { isSold: String(isSold) }),
      });

      return authenticatedFetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/listing/get-all?${params.toString()}`,
        { method: "GET" },
      );
    },
    staleTime: 2 * 60 * 1000,
    retry: 1,
    enabled: enabled,
  });
};
