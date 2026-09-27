"use client"

import { useFetchPropertyDetail } from "@repo/query-hook";
import PageLoading from "@repo/ui/pageloading";
import { useParams } from "next/navigation";
// import PageLoading from "@repo/ui/pageloading"


export default function PropertyDetail(){
    const param = useParams();
    console.log(param.id);

    const {data, isLoading, isError, error} = useFetchPropertyDetail(param.id as string);

    if(isLoading){
        return (
            <PageLoading/>
        )
    }

    if (isError){
        const message = error.message || "Couldn't fetch data";
        return (
            <div className="flex flex-1 items-center justify-center text-red-500 text-lg md:text-xl h-full">{message}</div>
        );
    }

    return (
        <div>Proeprty</div>
    )
}