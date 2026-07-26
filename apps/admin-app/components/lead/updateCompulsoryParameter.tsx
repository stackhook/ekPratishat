"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Edit3, Link, Phone, Plus, Trash2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";

import { useQueryClient } from "@tanstack/react-query";
import { useGetCategories, useLeadBasicInfo, useUpdateCompulsoryParameter } from "@repo/query-hook";
import { Lead } from "@repo/validators";

enum ClientType {
    BUYER = "BUYER",
    SELLER = "SELLER"
}

enum DealType {
    buy = "buy",
    sell = "sell",
    rent = "rent"
}


const generateConfirmationText = () => {
    const words = ["verify", "confirm", "proceed", "continue", "accept", "approve"];
    const randomWord = words[Math.floor(Math.random() * words.length)];
    return `Type "${randomWord}" to verify`;
};

export default function UpdateCompulsoryParameter({ lead }: { lead: Lead }) {
    const [open, setOpen] = useState(false);
    const [confirmationText, setConfirmationText] = useState("");
    const [form, setForm] = useState({
        contact: lead.contact,
        dealType: lead.dealType as DealType,
        clientType: lead.clientType as ClientType,
        source: lead.source,
        categoryId: lead.categoryId ?? ""
    });
    const [userInput, setUserInput] = useState("");

    const { data: categories, isLoading: categoryLoading } = useGetCategories();
    const { mutate, isPending } = useUpdateCompulsoryParameter(lead.id);
    const queryClient = useQueryClient();


    const handleOpenDialog = () => {
        setOpen(true);
        setConfirmationText(generateConfirmationText());
        setUserInput("");
        setForm({
            contact: lead.contact,
            dealType: lead.dealType as DealType,
            clientType: lead.clientType as ClientType,
            source: lead.source,
            categoryId: lead.categoryId ?? ""
        })

    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleVerify = (e: React.FormEvent) => {
        e.preventDefault();
        mutate(form, {
            onSuccess: (data) => {
                toast.success(data.message || "Operation Successful!!!");
                queryClient.invalidateQueries({
                    queryKey: ["leads"]
                });
                queryClient.invalidateQueries({
                    queryKey:["lead-detail", lead.id ]
                });
                queryClient.invalidateQueries({
                    queryKey:["user-leads" ]
                });
                setOpen(false);
            }
        })


    };

    const isConfirmButtonDisabled = isPending || userInput.trim() === "";
    const disabledCondition = lead.status === "WON" || lead.status === "LOST";

    return (
        <>
            <button onClick={handleOpenDialog} className={`inline-flex items-center gap-1.5 px-3 py-2 border border-secondary-200 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-xl text-xs font-semibold text-secondary-700 dark:text-secondary-300 transition-colors ${disabledCondition ? "cursor-not-allowed" : "cursor-pointer"}`} disabled={disabledCondition}>
                <Edit3 className="w-3.5 h-3.5 text-secondary-400" />
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent onClose={() => setOpen(false)} className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            Edit Compulsory Parameters
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleVerify} className="space-y-6 max-w-7xl p-6 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl">
                        <div className="space-y-4">
                            <h3 className="text-sm font-bold text-secondary-900 dark:text-secondary-100 tracking-wide uppercase">
                                Mandatory Parameters
                            </h3>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 block mb-1.5">
                                        Contact / Phone Number <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Phone className="w-4 h-4 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="contact"
                                            required
                                            value={form.contact}
                                            onChange={handleChange}
                                            placeholder="e.g., +977 98XXXXXXXX"
                                            className="w-full pl-9 pr-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-xl bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 block mb-1.5">
                                        Lead Acquisition Source <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Link className="w-4 h-4 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
                                        <input
                                            type="text"
                                            name="source"
                                            value={form.source}
                                            required
                                            onChange={handleChange}
                                            placeholder="e.g., Facebook Ads, Cold Call, Broker"
                                            className="w-full pl-9 pr-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-xl bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <div className="col-span-1">
                                    <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 block mb-1.5">
                                        Client Segment <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.clientType}
                                        onChange={(e) => {
                                            const nextClientType = e.target.value as ClientType;
                                            setForm((prev) => ({
                                                ...prev,
                                                clientType: nextClientType,
                                            }));

                                            // Auto-correct Deal Target if it becomes incompatible
                                            if (nextClientType === ClientType.BUYER && form.dealType === DealType.sell) {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    dealType:DealType.buy
                                                }))
                                            } else if (nextClientType === ClientType.SELLER && form.dealType === DealType.buy) {
                                                setForm((prev) => ({
                                                    ...prev,
                                                    dealType:DealType.sell
                                                }))
                                            }
                                        }}
                                        className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-xl bg-white dark:bg-secondary-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                                    >
                                        <option value={ClientType.BUYER}>Buyer</option>
                                        <option value={ClientType.SELLER}>Seller</option>
                                    </select>
                                </div>

                                <div className="col-span-1">
                                    <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 block mb-1.5">
                                        Deal Target <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        value={form.dealType}
                                        name="dealType"
                                        onChange={handleChange}
                                        className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-xl bg-white dark:bg-secondary-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                                    >
                                        {/* Dynamically render options based on the chosen clientType */}
                                        {form.clientType === ClientType.BUYER ? (
                                            <>
                                                <option value={DealType.buy}>Buy</option>
                                                <option value={DealType.rent}>Rent</option>
                                            </>
                                        ) : (
                                            <>
                                                <option value={DealType.sell}>Sell</option>
                                                <option value={DealType.rent}>Rent</option>
                                            </>
                                        )}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2">
                                <div className="col-span-1">
                                    <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 block mb-1.5">
                                        Category <span className="text-red-500">*</span>
                                    </label>
                                    <select
                                        name="categoryId"
                                        value={form.categoryId}
                                        onChange={handleChange}
                                        disabled={isPending || categoryLoading}
                                        className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-xl bg-white dark:bg-secondary-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                                        required
                                    >
                                        <option value="" hidden disabled>
                                            Select Category
                                        </option>
                                        {categoryLoading ? (
                                            <option disabled>Loading categories...</option>
                                        ) : (
                                            categories?.result.map((cat) => (
                                                <option key={cat.id} value={cat.id}>
                                                    {cat.name}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                </div>
                            </div>
                        </div>

                        <hr className="border-secondary-100 dark:border-secondary-800" />

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
                                className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100"
                                autoComplete="off"
                            />
                        </div>
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setOpen(false);
                                    setUserInput("");
                                }}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isConfirmButtonDisabled}
                                className="bg-primary-600 hover:bg-primary-700 text-white"
                            >
                                {isPending ? "Confirming..." : "Confirm"}
                            </Button>
                        </DialogFooter>
                    </form>

                </DialogContent>
            </Dialog>
        </>
    );
}