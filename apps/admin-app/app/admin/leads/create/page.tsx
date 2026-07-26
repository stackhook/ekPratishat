"use client";

import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Phone, User as UserIcon, Mail, Link, MapPin, Upload, X, Landmark, Plus, Trash2 } from "lucide-react";

import { Button } from "@repo/ui/button";
import { useCreateLead, useGetCategories } from "@repo/query-hook";

// Explicitly mapping your backend schema Enums for frontend typing
enum ClientType {
    BUYER = "BUYER",
    SELLER = "SELLER"
}

enum DealType {
    buy = "buy",
    sell = "sell",
    rent = "rent"
}

interface KeyValueRow {
    id: string;
    key: string;
    value: string;
}


export default function CreateLeadForm() {
    const queryClient = useQueryClient();
    const { mutate, isPending } = useCreateLead();
    const { data: categories, isLoading, isError, error } = useGetCategories();

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Form Field States
    const [contact, setContact] = useState("");
    const [clientType, setClientType] = useState<ClientType>(ClientType.BUYER);
    const [dealType, setDealType] = useState<DealType>(DealType.buy);
    const [categoryId,setCategoryId] = useState("");

    // Optional Field States
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [source, setSource] = useState("");
    const [coordinates, setCoordinates] = useState("");
    const [propertyId, setPropertyId] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [rows, setRows] = useState<KeyValueRow[]>([
        { id: "1", key: "", value: "" }
    ]);
    const [notes, setNotes] = useState<Record<string, any>>({});


    useEffect(() => {

        return () => {
            if (imagePreview) {
                URL.revokeObjectURL(imagePreview);
            }
        };
    }, [imagePreview]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            if (imagePreview) URL.revokeObjectURL(imagePreview); // Clean up old preview URL if exists
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handleRemoveImage = () => {
        setImageFile(null);
        if (imagePreview) URL.revokeObjectURL(imagePreview);
        setImagePreview(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleFieldChange = (id: string, field: "key" | "value", newValue: string) => {
        setRows(rows.map(row => row.id === id ? { ...row, [field]: newValue } : row));
    };

    const handleAddRow = () => {
        setRows([...rows, { id: Math.random().toString(), key: "", value: "" }]);
    };

    const handleRemoveRow = (id: string) => {
        if (rows.length === 1) {
            setRows([{ id: Math.random().toString(), key: "", value: "" }]);
            return;
        }
        setRows(rows.filter(row => row.id !== id));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!contact.trim()) {
            toast.error("Contact information is strictly mandatory.");
            return;
        }

        const finalNoteObject: Record<string, string> = {};
        let emptyKeyFound = false;
        let emptyValueFound = false;

        rows.forEach(row => {
            const trimmedKey = row.key.trim();
            const trimmedValue = row.value.trim();

            if (trimmedKey === "" && trimmedValue !== "") {
                emptyKeyFound = true;
            } else if (trimmedKey !== "" && trimmedValue === "") {
                emptyValueFound = true;
            } else if (trimmedKey !== "" && trimmedValue !== "") {
                finalNoteObject[trimmedKey] = trimmedValue;
            }
        });

        if (emptyKeyFound) {
            toast.error("A value is missing its Label/Key name.");
            return;
        }

        if (emptyValueFound) {
            toast.error("A Label/Key is missing its corresponding value.");
            return;
        }

        
        // 2. Wrap payload inside FormData to support Multer engine processing
        const formData = new FormData();
        formData.append("contact", contact.trim());
        formData.append("clientType", clientType);
        formData.append("dealType", dealType);
        formData.append("categoryId",categoryId);

        if (name.trim()) formData.append("name", name.trim());
        if (email.trim()) formData.append("email", email.trim());
        if (source.trim()) formData.append("source", source.trim());
        if (coordinates.trim()) formData.append("coordinates", coordinates.trim());
        if (propertyId.trim()) formData.append("propertyId", propertyId.trim());
        if (imageFile) formData.append("image", imageFile); // Key matches backend multer parameter setup

        if (Object.keys(finalNoteObject).length > 0) {
            formData.append("notes", JSON.stringify(finalNoteObject));
        }

        mutate({ formData }, {
            onSuccess: (data) => {
                toast.success(data.message || "New acquisition pipeline lead recorded successfully!");
                queryClient.invalidateQueries({
                    queryKey: ["leads"]
                });
                queryClient.invalidateQueries({
                    queryKey: ["user-leads"]
                })
                // Reset form controls
                setContact("");
                setName("");
                setEmail("");
                setSource("");
                setCoordinates("");
                setPropertyId("");
                setCategoryId("")
                setRows([{ id: "1", key: "", value: "" }]);
                handleRemoveImage();
            }
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-7xl p-6 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl">
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
                                required
                                value={contact}
                                onChange={(e) => setContact(e.target.value)}
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
                                value={source}
                                required
                                onChange={(e) => setSource(e.target.value)}
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
                            value={clientType}
                            onChange={(e) => {
                                const nextClientType = e.target.value as ClientType;
                                setClientType(nextClientType);

                                // Auto-correct Deal Target if it becomes incompatible
                                if (nextClientType === ClientType.BUYER && dealType === DealType.sell) {
                                    setDealType(DealType.buy);
                                } else if (nextClientType === ClientType.SELLER && dealType === DealType.buy) {
                                    setDealType(DealType.sell);
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
                            value={dealType}
                            onChange={(e) => setDealType(e.target.value as DealType)}
                            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-xl bg-white dark:bg-secondary-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                        >
                            {/* Dynamically render options based on the chosen clientType */}
                            {clientType === ClientType.BUYER ? (
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
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            disabled={isPending || isLoading}
                            className="w-full px-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-xl bg-white dark:bg-secondary-800 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                            required
                        >
                            <option value="" hidden disabled>
                                Select Category
                            </option>
                            {isLoading ? (
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

            {/* SECTION 2: OPTIONAL IDENTIFIERS */}
            <div className="space-y-4">
                <h3 className="text-sm font-bold text-secondary-500 tracking-wide uppercase">
                    Optional Descriptors
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 block mb-1.5">
                            Prospect Full Name
                        </label>
                        <div className="relative">
                            <UserIcon className="w-4 h-4 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g., Ram Bahadur"
                                className="w-full pl-9 pr-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-xl bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 block mb-1.5">
                            Email Address
                        </label>
                        <div className="relative">
                            <Mail className="w-4 h-4 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="name@domain.com"
                                className="w-full pl-9 pr-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-xl bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                            />
                        </div>
                    </div>

                    {/* <div>
            <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 block mb-1.5">
              Lead Acquisition Source
            </label>
            <div className="relative">
              <Link className="w-4 h-4 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="e.g., Facebook Ads, Cold Call, Broker"
                className="w-full pl-9 pr-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-xl bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
              />
            </div>
          </div> */}

                    <div>
                        <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 block mb-1.5">
                            Geographic Coordinates
                        </label>
                        <div className="relative">
                            <MapPin className="w-4 h-4 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
                            <input
                                type="text"
                                value={coordinates}
                                onChange={(e) => setCoordinates(e.target.value)}
                                placeholder="e.g., 27.671, 85.324"
                                className="w-full pl-9 pr-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-xl bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 block mb-1.5">
                        Link to Registered System Property ID (If applicable)
                    </label>
                    <div className="relative">
                        <Landmark className="w-4 h-4 text-secondary-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                            type="text"
                            value={propertyId}
                            onChange={(e) => setPropertyId(e.target.value)}
                            placeholder="Paste database UUID string from registered assets"
                            className="w-full pl-9 pr-3 py-2 border border-secondary-300 dark:border-secondary-600 rounded-xl bg-transparent focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
                        />
                    </div>
                </div>
            </div>

            {/* <div className="space-y-3">
                            <div className="flex justify-between items-center">
                                <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                                    Notes (Optional)
                                </label>
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    size="sm" 
                                    onClick={handleAddRow}
                                    className="flex items-center gap-1.5 h-8 text-xs border-dashed"
                                >
                                    <Plus className="w-3.5 h-3.5" />
                                    Add
                                </Button>
                            </div>

                            <div className="space-y-2.5">
                                {rows.map((row) => (
                                    <div key={row.id} className="flex items-center gap-2">
                                        <input
                                            type="text"
                                            value={row.key}
                                            onChange={(e) => handleFieldChange(row.id, "key", e.target.value)}
                                            placeholder="Label (e.g., Owner Name)"
                                            className="w-1/3 px-3 py-1.5 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        />
                                        <input
                                            type="text"
                                            value={row.value}
                                            onChange={(e) => handleFieldChange(row.id, "value", e.target.value)}
                                            placeholder="Value (e.g., Hari Prasad)"
                                            className="flex-1 px-3 py-1.5 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => handleRemoveRow(row.id)}
                                            className="p-2 text-secondary-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div> */}

            <div className="space-y-3">
                <div className="flex justify-between items-center">
                    <label className="text-sm font-semibold text-secondary-700 dark:text-secondary-300">
                        Notes (Optional)
                    </label>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={handleAddRow}
                        className="flex items-center gap-1.5 h-8 text-xs border-dashed"
                    >
                        <Plus className="w-3.5 h-3.5" />
                        Add
                    </Button>
                </div>

                <div className="space-y-4 sm:space-y-2.5">
                    {rows.map((row) => (
                        <div
                            key={row.id}
                            className="grid grid-cols-1 sm:flex sm:items-center gap-2 p-3 sm:p-0 bg-secondary-50/50 dark:bg-secondary-800/20 sm:bg-transparent rounded-xl border border-secondary-200 dark:border-secondary-700 sm:border-none"
                        >
                            {/* Key Input: Stacks on mobile, takes 35% space on desktop */}
                            <input
                                type="text"
                                value={row.key}
                                onChange={(e) => handleFieldChange(row.id, "key", e.target.value)}
                                placeholder="Label (e.g., Nearby Location)"
                                className="w-full sm:w-[35%] px-3 py-1.5 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                            />

                            {/* Value Input and Delete Button container */}
                            <div className="flex items-center gap-2 w-full sm:flex-1">
                                <input
                                    type="text"
                                    value={row.value}
                                    onChange={(e) => handleFieldChange(row.id, "value", e.target.value)}
                                    placeholder="Value (e.g., Hanuman Mandir, 500m away)"
                                    className="flex-1 px-3 py-1.5 text-sm border border-secondary-300 dark:border-secondary-600 rounded-lg bg-white dark:bg-secondary-800 text-secondary-900 dark:text-secondary-100 focus:outline-none focus:ring-1 focus:ring-primary-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => handleRemoveRow(row.id)}
                                    className="p-2 text-secondary-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-md transition-colors"
                                >
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>


            <hr className="border-secondary-100 dark:border-secondary-800" />

            {/* SECTION 3: IMAGE MEDIA CAPTURE */}
            <div className="space-y-2">
                <label className="text-xs font-semibold text-secondary-700 dark:text-secondary-300 block">
                    Asset snapshot / Document Attachment
                </label>

                {!imagePreview ? (
                    <div
                        onClick={() => fileInputRef.current?.click()}
                        className="border-2 border-dashed border-secondary-300 dark:border-secondary-700 hover:border-primary-500 dark:hover:border-primary-400 transition-colors rounded-xl p-6 text-center cursor-pointer group"
                    >
                        <Upload className="w-6 h-6 mx-auto text-secondary-400 group-hover:text-primary-500 transition-colors mb-2" />
                        <span className="text-xs font-medium text-secondary-600 dark:text-secondary-400 block">
                            Click to browse or drop field photo snapshot
                        </span>
                        <span className="text-[10px] text-secondary-400 block mt-1">
                            Supports standard image types via secure pipeline uploads
                        </span>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleImageChange}
                            accept="image/*"
                            className="hidden"
                        />
                    </div>
                ) : (
                    <div className="relative w-full max-w-xs border border-secondary-200 dark:border-secondary-800 rounded-xl overflow-hidden group">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={imagePreview}
                            alt="Lead attachments preview"
                            className="w-full h-40 object-cover"
                        />
                        <button
                            type="button"
                            onClick={handleRemoveImage}
                            className="absolute top-2 right-2 bg-secondary-900/80 text-white p-1 rounded-full hover:bg-red-600 transition-colors"
                        >
                            <X className="w-3.5 h-3.5" />
                        </button>
                    </div>
                )}
            </div>

            {/* FORM ACTION FOOTER */}
            <div className="flex items-center justify-end gap-3 pt-2">
                <button
                    type="submit"
                    disabled={isPending}
                    className="w-full sm:w-auto bg-primary-600 hover:bg-primary-700 text-white shadow-sm font-medium px-6 py-2 rounded-xl text-sm"
                >
                    {isPending ? "Constructing Lead Entry..." : "Create Pipeline Lead"}
                </button>
            </div>
        </form>
    );
}