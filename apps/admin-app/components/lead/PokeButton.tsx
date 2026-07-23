"use client";

import { usePokeLead } from "@repo/query-hook";
import { LeadDetailType } from "@repo/validators";
import { Hand, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function PokeButton({ lead }: { lead: LeadDetailType }) {

    const { mutate, isPending } = usePokeLead(lead.id);
    const handlePoke = async () => {
        mutate(undefined, {
            onSuccess:(data) => {
                toast.success(data.message || "You poked the handler")
            }
        });
    };

    const disabledCondition = lead.status === "WON" || lead.status === "LOST" || isPending;
    return (
        <button
            type="button"
            onClick={handlePoke}
            className={`inline-flex items-center gap-1.5 px-3 py-2 border border-secondary-200 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-xl text-xs font-semibold text-secondary-700 dark:text-secondary-300 transition-colors ${disabledCondition ? "cursor-not-allowed" : "cursor-pointer"}`}
            disabled={disabledCondition}
        >
            {isPending ? (
                <span className="inline-flex items-center gap-1.5">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Poking...</span>
                </span>
            ) : (
                <span className="inline-flex items-center gap-1.5">
                    <Hand className="w-4 h-4" />
                    <span>Poke</span>
                </span>
            )}
        </button>
    );
}