"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Edit3 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@repo/ui/dialog";
import { Button } from "@repo/ui/button";

import { useQueryClient } from "@tanstack/react-query";
import { useAddAmenity } from "@repo/query-hook";



export default function AddAmenity() {
    const [open, setOpen] = useState(false);
    const [form, setForm] = useState({
        name: "",
        icon: ""
    });

    const { mutate, isPending } = useAddAmenity();
    const queryClient = useQueryClient();


    const handleOpenDialog = () => {
        setOpen(true);
        setForm({
            name: "",
            icon: ""
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
        e.stopPropagation();
        mutate(form, {
            onSuccess: (data) => {
                toast.success(data.message || "Operation Success");
                queryClient.invalidateQueries({
                    queryKey:["amenities"]
                })
            }
        })
    };

    return (
        <>
            <button onClick={handleOpenDialog} type="button" className={`inline-flex items-center gap-1.5 px-3 py-2 border border-secondary-200 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-xl text-xs font-semibold text-secondary-700 dark:text-secondary-300 transition-colors`}>
                <Edit3 className="w-3.5 h-3.5 text-secondary-400" />
                <span>Add</span>
            </button>

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent onClose={() => setOpen(false)} className="max-w-xl">
                    <DialogHeader>
                        <DialogTitle>
                            Add Amenity
                        </DialogTitle>
                    </DialogHeader>

                    <form onSubmit={handleVerify} className="space-y-6 max-h-[60vh] overflow-y-auto pr-1">
                        <p className="text-secondary-600 dark:text-secondary-300 text-sm">
                            Add amenity that can be used for listings
                        </p>

                        <div className="flex flex-col space-y-2">
                            <label htmlFor="name" className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                Name <span className="text-red-500">*</span>
                            </label>
                            <input value={form.name} name="name" required className="w-full px-3 py-2  border  border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100" placeholder="eg: Parking" onChange={handleChange} />
                        </div>

                        <div className="flex flex-col space-y-2">
                            <label htmlFor="icon" className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                                Icon <span className="text-red-500">*</span>
                            </label>
                            <input value={form.icon} type="text" name="icon" required className="w-full px-3 py-2  border  border-secondary-300 dark:border-secondary-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100" placeholder="eg. Parking" onChange={handleChange} />
                        </div>

                        <hr className="border-secondary-100 dark:border-secondary-800" />
                        <DialogFooter>
                            <Button
                                variant="outline"
                                onClick={() => {
                                    setOpen(false);
                                }}
                                disabled={isPending}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPending}
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