"use client";

import { useState } from "react";
import { toast } from "sonner";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";

import { useQueryClient } from "@tanstack/react-query";
import { useAssignDesignation, useGetAllDesignations } from "@repo/query-hook";
import { Edit } from "lucide-react";

interface Props {
    userId: string;
    oldDesignationId: string | null;
}

const generateConfirmationText = () => {
    const words = ["verify", "confirm", "proceed", "continue", "accept", "approve"];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    return `Type "${randomWord}" to verify`;
};

export default function DesignationModal({ userId, oldDesignationId }: Props) {
    const [open, setOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [designationId, setDesignationId] = useState<string>(oldDesignationId ?? "")
    const [userInput, setUserInput] = useState("");
    const { mutate: assignDesignation, isPending } = useAssignDesignation();
    const {data, isLoading,isError,error} = useGetAllDesignations(open);
    const queryClient = useQueryClient();

    const handleOpenDialog = () => {
        setOpen(true);
        setConfirmationText(generateConfirmationText());
        setUserInput("");
        setDesignationId(oldDesignationId ?? "");
    };

    const handleVerify = () => {
        
        const expectedText = confirmationText.replace('Type "', '').replace('" to verify', '');

        if (userInput.trim().toLowerCase() !== expectedText.toLowerCase()) {
            toast.error("Confirmation text doesn't match. Please try again.");
            return;
        }

        if (designationId === oldDesignationId) {
            toast.error("Selected Designation is the same as the current Designation. Please choose a different designation.");
            return;
        }

        assignDesignation({ userId, id: designationId }, {
            onSuccess: (data) => {
                toast.success(data.message || "Operation Successful!!!!");
                setOpen(false);
                setUserInput("");
                queryClient.invalidateQueries({
                    queryKey: ["all-users"]
                });
                queryClient.invalidateQueries({
                    queryKey: ["agent-detail", userId]
                });
            },
        });
    };

    const isConfirmButtonDisabled = isPending || userInput.trim() === "";
    return (
        <>
            <button
                onClick={handleOpenDialog}
                className="w-full flex items-center gap-3 p-3 text-left hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors group text-green-600 dark:text-green-400"
            >
                <Edit className="h-6 w-6"/>
                <div>
                    <div className="font-medium">Change Designation</div>
                    <div className="text-sm">Update the employee designation and permissions</div>
                </div>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent onClose={() => setOpen(false)} className="max-w-lg">
                    <DialogHeader>
                        <DialogTitle>Change Employee Designation</DialogTitle>
                    </DialogHeader>

                    <div className="space-y-5">
                        <p className="text-secondary-600 dark:text-secondary-300 text-sm break-words whitespace-normal">
                            Select the new designation you want to assign to this user. This action requires safety confirmation.
                        </p>

                        {/* Dropdown Section */}
                        <div className="flex flex-col space-y-2">
                            <label htmlFor="role-select" className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                Select New Designation
                            </label>
                            <select
                                id="designation-select"
                                value={designationId}
                                onChange={(e) => setDesignationId(e.target.value)}
                                disabled={isPending || isLoading}
                                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
                            >   
                                {isLoading && (
                                    <option value="" className="animate-pulse">
                                        ⏳ Loading Designations...
                                    </option>
                                )}

                                 {isError && (
                                    <option value="" className="text-red-500 dark:text-red-400 font-medium">
                                        ⚠️ {error?.message || "Failed to fetch designations."}
                                    </option>
                                )}

                                {!isLoading && !isError && (
                                    <>
                                        {(!designationId || !data?.some((h: any) => h.id === designationId)) && (
                                            <option value="">
                                                Select a handler / All
                                            </option>
                                        )}

                                        {data?.map((designation:any) => (
                                            <option key={designation.id} value={designation.id}>
                                                {designation.title}
                                            </option>
                                        ))}
                                    </>
                                )}


                            </select>
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
                            }}
                            disabled={isPending || isLoading}
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