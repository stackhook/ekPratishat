"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";

import { useQueryClient } from "@tanstack/react-query";
import { useChangePropertyHandler, useGetAdminStaff, useGetStaff } from "@repo/query-hook";
import { ShieldAlert } from "lucide-react";

type HandlerProps =  HandlerData | null;

interface HandlerData {
    id: string;
    name: string;
    email?: string | null;
    contact: string;
}


const generateConfirmationText = () => {
    const words = ["verify", "confirm", "proceed", "continue", "accept", "approve"];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    return `Type "${randomWord}" to verify`;
};

export default function ChangePropertyHandler({ propertyId, currentHandler }: { propertyId: string; currentHandler: HandlerProps }) {
    
    const [open, setOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [handlerId, setHandlerId] = useState(currentHandler?.id || "");
    const [reason, setReason] = useState("");

    const { data, isLoading, isError, error } = useGetStaff(open);

    const [userInput, setUserInput] = useState("");
    const { mutate, isPending } = useChangePropertyHandler();
    const queryClient = useQueryClient();

    const handleOpenDialog = () => {
        setOpen(true);
        setConfirmationText(generateConfirmationText());
        setUserInput("");
        setHandlerId(currentHandler?.id || "");
        setReason("");
    };

    const handleVerify = () => {
        const expectedText = confirmationText.replace('Type "', '').replace('" to verify', '');

        if (userInput.trim().toLowerCase() !== expectedText.toLowerCase()) {
            toast.error("Confirmation text doesn't match. Please try again.");
            return;
        };

        if(!reason.trim()) {
            toast.error("Please provide a reason for changing the handler.");
            return;
        }

        mutate({ propertyId, handlerId, reason }, {
            onSuccess: (data) => {
                toast.success(data.message || "Operation Success!!!");
                queryClient.invalidateQueries({
                    queryKey: ["property-detail", propertyId]
                });
                queryClient.invalidateQueries({
                    queryKey: ["all-properties"]
                });
                setOpen(false);
            },
        })

    };

    const isConfirmButtonDisabled = isPending || userInput.trim() === "" || isLoading || isError || !handlerId || handlerId === currentHandler?.id;
    

    return (
        <>
            <button type="button" onClick={handleOpenDialog} className={`inline-flex items-center gap-1.5 px-3 py-2 border border-secondary-200 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-xl text-xs font-semibold text-secondary-700 dark:text-secondary-300 transition-colors cursor-pointer`}>
                <ShieldAlert className="w-3.5 h-3.5 text-secondary-400" />
                <span>Change Handler</span>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent onClose={() => setOpen(false)} className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Change Property Handler</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5">
                        <p className="text-secondary-600 dark:text-secondary-300 text-sm break-words whitespace-normal">
                            Select the new handler you want to assign to this property. This action requires safety confirmation.
                        </p>

                        {/* Dropdown Section */}

                        <div className="flex flex-col space-y-2">
                            <label htmlFor="handler-select" className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                Select New Handler
                            </label>
                            <select
                                id="handler-select"
                                value={handlerId || ""}
                                onChange={(e) => setHandlerId(e.target.value)}
                                // 🚀 Disable interaction if data is loading or errored out
                                disabled={isPending || isLoading || isError}
                                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 disabled:opacity-75 disabled:cursor-not-allowed"
                            >
                                {/* ⏳ Case 1: Loading State */}
                                {isLoading && (
                                    <option value="" className="animate-pulse">
                                        ⏳ Loading staff directories...
                                    </option>
                                )}

                                {/* ❌ Case 2: Error State */}
                                {isError && (
                                    <option value="" className="text-red-500 dark:text-red-400 font-medium">
                                        ⚠️ {error?.message || "Failed to fetch admin staff."}
                                    </option>
                                )}

                                {/* 👥 Case 3: Success State */}
                                {!isLoading && !isError && (
                                    <>
                                        {/* 🌟 Fix: Render a fallback option if handlerId is falsy or doesn't match active staff lists */}
                                        {(!handlerId || !data?.some((h: any) => h.id === handlerId)) && (
                                            <option value="">
                                                Select a handler / All
                                            </option>
                                        )}

                                        {data?.map((handler: HandlerData) => (
                                            <option key={handler.id} value={handler.id}>
                                                {handler.name} - {handler.contact}
                                            </option>
                                        ))}
                                    </>
                                )}
                            </select>
                        </div>

                         <div className="flex flex-col space-y-2">
                            <label htmlFor="confirmation-input" className="text-sm font-medium text-secondary-700 dark:text-secondary-300 block">
                                Reason <span className="text-red-500">*</span>
                            </label>
                            <input
                                id="reason"
                                type="text"
                                required
                                value={reason}
                                onChange={(e) => setReason(e.target.value)}
                                placeholder="Enter the reason for changing the handler"
                                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
                                autoComplete="off"
                            />
                        </div>

                        {/* Confirmation Challenge - Stacked vertically */}
                        <div className="flex flex-col space-y-2">
                            <label htmlFor="confirmation-input" className="text-sm font-medium text-secondary-700 dark:text-secondary-300 block">
                                {confirmationText}
                            </label>
                            <input
                                id="confirmation-input"
                                type="text"
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                placeholder="Enter the text above"
                                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
                                autoComplete="off"
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setOpen(false);
                                setUserInput("");
                                setHandlerId("");
                                setReason("");
                            }}
                            disabled={isPending}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleVerify}
                            disabled={isConfirmButtonDisabled}
                            className="bg-primary-600 hover:bg-primary-700 text-white"
                        >
                            {isPending ? "Confirming......." : "Confirm"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    );
}
