import { authenticatedFetch } from "@repo/shared-provider";
import { useQuery } from "@tanstack/react-query"


export const useGetAllPermissions = () => {
    return useQuery({
        queryKey: ["all-permissions"],
            queryFn: async () => {
              return authenticatedFetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/permissions`,
                { method: "GET" },
              );
            },
            staleTime: 5 * 60 * 1000,
            retry: 1,
            retryDelay: 2000,
            refetchOnWindowFocus: true,
    })
}