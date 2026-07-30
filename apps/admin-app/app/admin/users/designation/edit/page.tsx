"use client";

import { useGetDesignationById } from "@repo/query-hook";
import AnimateLoader from "@repo/ui/animateLoader";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";
import DesignationForm from "../../../../../components/userSpecific/DesignationForm";

interface PermissionType {
    permissionId: string;
    designationId: string;
}


export default function DesignationEditPage() {
    const sp = useSearchParams();
    const id = sp.get("id");
    const { data, isLoading, isError, error } = useGetDesignationById(id);

    const permsId = useMemo(
        () => data?.permissions.map((p: PermissionType) => p.permissionId) ?? [],
        [data]
    );

    if (!id) {
        return (
            <div className="p-6 text-red-600 bg-red-50 rounded-lg">
                Missing designation ID in URL query parameters.
            </div>
        );
    }


    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-full min-h-[400px]">
                <AnimateLoader />
            </div>
        );
    }

    if (isError) {
        return <div className="min-h-screen flex items-center justify-center text-red-500">{error.message}</div>
    }

    const initialData = {
        title: data?.title,
        description:data?.description ?? "",
        multipleAssignment: data?.multipleAssignment,
        permissionIds:permsId
    }
  

    return (
        <>
            <DesignationForm designation={initialData} isEditMode={true} id={id}/>
        </>
    )

}