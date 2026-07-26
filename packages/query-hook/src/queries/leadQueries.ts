import { authenticatedFetch } from "@repo/shared-provider";
import { useQuery } from "@tanstack/react-query";

export const useGetLeads = ({page=1,limit=20,status="",dealType="",clientType="",q="",c_id=""}) => {
    return useQuery({
        queryKey: ["leads", {page,status,dealType,clientType,q,c_id}],
        queryFn: async () => {
            const params = new URLSearchParams({
                page: String(page),
                limit:String(limit),
                ...(q && {q}),
                ...(status && {status}),
                ...(dealType && {dealType}),
                ...(clientType && {clientType}),
                ...(c_id && {c_id})
            })
            return authenticatedFetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/lead?${params.toString()}`,
                {method: "GET"}
            );
        },
        staleTime: 2 * 60 * 1000,
        refetchInterval:2 * 60 * 1000,
        retry: 1,
        retryDelay: 2000,
        refetchOnWindowFocus: true,

    });
}

export const useGetLeadById = (id:string) => {
    return useQuery({
        queryKey:["lead-detail",id],
        queryFn: async () => {
            return authenticatedFetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/lead/${id}`,
                {method: "GET"}
            )
        },
        staleTime:2 * 60 * 1000,
        refetchInterval:2 * 60 * 1000,
        retry:1,
        retryDelay:2000,
        refetchOnWindowFocus:true
    })
}


export const useGetUserLead = () => {
    return useQuery({
        queryKey:["user-leads"],
        queryFn: async () => {
            return authenticatedFetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/lead/user-leads`,
                {method: "GET"}
            )
        },
        staleTime:2 * 60 * 1000,
        refetchInterval:2 * 60 * 1000,
        retry:1,
        retryDelay:2000,
        refetchOnWindowFocus:true
    })
}

export const useGetFollowUpToday = ({enabled}: {enabled:boolean}) => {
    return useQuery({
        queryKey:["followups-today"],
        queryFn: async () => {
            return authenticatedFetch(
                `${process.env.NEXT_PUBLIC_BACKEND_URL}/lead/today-followups`,
                {method: "GET"}
            )
        },
        staleTime:2 * 60 * 1000,
        refetchInterval:2 * 60 * 1000,
        retry:1,
        retryDelay:2000,
        refetchOnWindowFocus:true,
        enabled:enabled
    })
}