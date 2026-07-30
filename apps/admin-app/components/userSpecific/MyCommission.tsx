"use client";

import { useGetMyTotalPropertyValue, useUser } from "@repo/query-hook";
import { PropertyPortfolioSummarySkeleton } from "./PropertyPortFolioSkeleton";
import PropertyPortfolioSummary from "./PorpertyPortFolioSummary";

export default function MyCommission() {
    const {data:userData, isLoading: isUserLoading, isError: isUserError} = useUser();

    const hasAccess = userData?.designation?.trim().toUpperCase() === "LIAISON OFFICER";

    const { data, isLoading, isError, error } =
        useGetMyTotalPropertyValue({enabled: !!userData && hasAccess});

    if (isLoading || isUserLoading) {
        return <PropertyPortfolioSummarySkeleton />;
    }

    if(isUserError || !hasAccess || !data) {
        return null;
    }

    if (isError) {
        return (
            <div className="text-red-500">
                {error instanceof Error
                    ? error.message
                    : "Failed to load commission."}
            </div>
        );
    }

    const sale = data.find(
        (item: any) => item.type === "sale"
    );

    const rent = data.find(
        (item: any) => item.type === "rent"
    );

    return (
        <PropertyPortfolioSummary
            saleValue={Number(sale?._sum.price ?? 0)}
            saleCount={sale?._count.id ?? 0}
            rentalValue={Number(rent?._sum.price ?? 0)}
            rentalCount={rent?._count.id ?? 0}
        />
    );
}