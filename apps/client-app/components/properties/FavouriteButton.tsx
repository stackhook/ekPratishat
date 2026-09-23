"use client";

import { useCheckFavourite, useGetUserInfo, useToggleFavourite } from "@repo/query-hook";
import { PropertyDetailClientProps } from "./PropertyDetailClient";
// Assuming these are your icon imports - adjust names if necessary
import { Heart as HeartIcon } from "lucide-react"; 
import { Heart as HeartSolidIcon } from "lucide-react"; 
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { revalidateTagPathAction } from "../../actions/revalidateAction";

export default function FavouriteButton({ property }: PropertyDetailClientProps) {
    const { data: user, isLoading: userLoading } = useGetUserInfo();
    const queryClient = useQueryClient();
    // This query is 'enabled' only if user exists, 
    // so favouriteLoading will stay false/idle for guests.
    const { data: isFavourite, isLoading: favouriteLoading } = useCheckFavourite({ 
        user, 
        propertyId: property.id 
    });

    const {mutate,isPending} = useToggleFavourite();

    if (userLoading || favouriteLoading) {
        return (
            <div className="p-2 animate-pulse">
                <HeartIcon className="w-5 h-5 text-secondary-300" />
            </div>
        );
    }
    const handleFavouriteToogle = () => {
        if(!user) {
            toast.error("Please Login First!!!")
            return;
        }

        mutate({propertyId:property.id}, {
            onSuccess: async(data) => {
                toast.success(data.message || "Operation Successful!!!");
                queryClient.invalidateQueries({
                    queryKey: ["favourite",user.id]
                })
                await revalidateTagPathAction({tag:[`favourite-${user.id}`]})
            }
        })
    }
    const isSaved = !!user && !!isFavourite;

    return (
        <button 
            type="button"
            disabled={isPending}
            className="flex items-center gap-2 px-4 py-2 rounded-xl border border-secondary-200 dark:border-secondary-700 hover:border-gold dark:hover:border-gold transition-all duration-200 bg-white dark:bg-secondary-800"
            onClick={handleFavouriteToogle}
        >
            {isSaved ? (
                <HeartSolidIcon className="w-5 h-5 text-red-500 fill-red-500" />
            ) : (
                <HeartIcon className="w-5 h-5 text-secondary-600 dark:text-secondary-400" />
            )}
             <span className="text-secondary-700 dark:text-secondary-300">
                {isSaved ? "Added" : "Add"}
              </span>
        </button>
    );
}