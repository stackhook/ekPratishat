"use client";

import Link from "next/link";
import { Clock, RefreshCw } from "lucide-react";
import { PropertyListing } from "@repo/validators";
import PremiumListingCard from "../../../../components/properties/FeaturedListingCard";
import { useSearchParams } from "next/navigation";
import { useGetMyFavourites } from "@repo/query-hook";
import AnimateLoader from "@repo/ui/animateLoader";
import Pagination from "../../../../components/properties/Pagination";




export default function MyFavouritesPage() {
    const sp = useSearchParams();
    const page = Number(sp.get("page") || 1);
    const pageSize = Number(sp.get("pageSize") || 12);

    const { data, isLoading, isError } = useGetMyFavourites({ page, pageSize });


    if (isLoading) {
        return <div className="flex justify-center items-center w-full h-screen">
            <AnimateLoader />
        </div>
    }

    if (isError) {
        return (
            <div className="mx-auto max-w-7xl px-4 pb-20 pt-[calc(var(--site-nav-height)+2rem)]">
                <div className="flex flex-col items-center justify-center rounded-3xl border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card)] p-12 text-center shadow-[var(--ek-shadow-card)] dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)] dark:shadow-[var(--ek-dark-shadow-card)]">
                    {/* Animated or Pulsing Error Icon */}
                    <div className="relative mb-6">
                        <div className="absolute inset-0 bg-red-100 dark:bg-red-900/20 rounded-full animate-ping opacity-25"></div>
                        <div className="relative w-20 h-20 bg-red-50 dark:bg-red-900/30 rounded-full flex items-center justify-center border border-red-100 dark:border-red-800">
                            <svg
                                className="w-10 h-10 text-red-500"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                    </div>

                    <h2 className="text-2xl font-black text-secondary-900 dark:text-white mb-2">
                        Unable to load your favourites
                    </h2>
                    <p className="text-secondary-500 max-w-sm mx-auto mb-8 font-medium">
                        Our servers are having a moment. Don&apos;t worry, your favourite data is safe—we just can&apos;t reach it right now.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4">
                        <Link
                            href="/user/my-favourites"
                            className="bg-gold-gradient text-white px-8 py-3 rounded-xl font-bold shadow-gold-sm hover:shadow-gold transition-all flex items-center gap-2"
                        >
                            <RefreshCw size={18} />
                            Try Again
                        </Link>

                        <Link
                            href="/contact"
                            className="px-8 py-3 rounded-xl font-bold text-secondary-600 dark:text-secondary-400 border border-secondary-200 dark:border-secondary-700 hover:bg-secondary-50 dark:hover:bg-secondary-800 transition-all"
                        >
                            Contact Support
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const listings = data.items;
    const meta = data.meta;

    return (
        <div className="mx-auto min-h-screen max-w-7xl bg-[var(--ek-bg-main)] px-4 pb-16 pt-[calc(var(--site-nav-height)+2rem)] dark:bg-[var(--ek-dark-page)]">
            <header className="gap-4 mb-12 text-center">
                <div>
                    <h1 className="text-4xl font-black text-secondary-900 dark:text-white tracking-tight">
                        My <span className="text-gold">Favourites</span>
                    </h1>
                </div>
            </header>

            {listings.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-[var(--ek-border-soft)] bg-[var(--ek-bg-card-soft)] py-24 dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)]/70">
                    <div className="w-20 h-20 bg-secondary-100 dark:bg-secondary-800 rounded-full flex items-center justify-center mb-4">
                        <Clock size={32} className="text-secondary-400" />
                    </div>
                    <h2 className="text-xl font-bold text-secondary-900 dark:text-white">No Favourites Found</h2>
                    <p className="text-secondary-500 mt-1">Start by adding your favourite properties.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {listings.map((item: PropertyListing) => (
                            <Link href={`/properties/${item.id}`} key={item.id}>
                                <PremiumListingCard listing={item} />
                            </Link>
                        ))}
                    </div>
                    <Pagination
                        totalPages={meta.totalPages}
                        currentPage={page}
                    />
                </>
            )}
        </div>
    )
}
