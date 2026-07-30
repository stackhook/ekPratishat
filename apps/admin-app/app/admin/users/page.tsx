"use client";

import { useGetAllUsers } from "@repo/query-hook";
import AnimateLoader from "@repo/ui/animateLoader";
import { ChevronDown, Filter, Plus, Search, X } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import Pagination from "../../../components/Pagination";
import UserTable from "../../../components/UsersTable";

export default function UserListPage() {
    const sp = useSearchParams();
    const pathname = usePathname();
    const router = useRouter();

    const [input, setInput] = useState("");
    const [q, setQ] = useState(sp.get("q") ?? "");
    const [isVerified, setIsVerified] = useState(sp.get("isVerified") ?? "");
    const [isActive, setIsActive] = useState(sp.get("isActive") || "true");
    const [role, setRole] = useState(sp.get("role") ?? "");
    const page = Number(sp.get("page") || 1);

    const [isPending, startTransition] = useTransition();

    useEffect(() => {
        setQ(sp.get("q") ?? "");
        setInput(sp.get("q") ?? "");
        setIsVerified(sp.get("isVerified") ?? "");
        setRole(sp.get("role") ?? "");
        setIsActive(sp.get("isActive") || "true");
    }, [sp]);

    const { data, isLoading, isError, error } = useGetAllUsers({ page, q, pageSize: 20, isVerified, role, isActive });

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


    const applyFilters = (updates: Record<string, string>) => {
        const params = new URLSearchParams(sp.toString());

        // Apply the updates passed (q, c_id, or type)
        Object.entries(updates).forEach(([key, value]) => {
            // if (value) params.set(key, value);
            // else params.delete(key);
            if (value === "" || value === undefined) {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }

        });

        params.set("page", "1"); // Reset to page 1 on search

        startTransition(() => {
            router.push(`${pathname}?${params.toString()}`);
        });
    };

    const resetAll = () => {
        setQ("");
        setIsVerified("");
        setRole("");
        setInput("");
        setIsActive("true");
        startTransition(() => router.push(pathname));
    };

    const users = data.items;
    const { totalPages, page: currentPage } = data.meta;
    return (
        <main className="min-h-screen">
            <div className="h-60 bg-secondary-900 flex flex-col items-center justify-center relative overflow-hidden">
                {/* Texture Overlay */}
                <div className="absolute inset-0 opacity-80 dark:opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat" />

                {/* Decorative Glow */}
                <div className="absolute -top-24 -right-24 w-64 h-64 bg-gold/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-gold/10 rounded-full blur-3xl" />

                {/* Content Container */}
                <div className="relative z-10 flex flex-col items-center gap-6">
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight text-center">
                        Users List
                    </h1>
                    <div className="flex items-center gap-2">

                    <Link
                        href="/admin/users/add-user"
                        className="group flex items-center gap-3 px-8 py-3.5 bg-white/10 hover:bg-gold backdrop-blur-md border border-white/20 hover:border-gold text-white rounded-full font-bold transition-all duration-300 shadow-2xl active:scale-95"
                    >
                        <div className="bg-gold group-hover:bg-white p-1 rounded-full transition-colors">
                            <Plus size={16} className="text-white group-hover:text-gold" strokeWidth={3} />
                        </div>
                        <span className="tracking-wide">Add New User</span>
                    </Link>
                    <Link
                        href="/admin/users/designation"
                        className="group flex items-center gap-3 px-8 py-3.5 bg-white/10 hover:bg-gold backdrop-blur-md border border-white/20 hover:border-gold text-white rounded-full font-bold transition-all duration-300 shadow-2xl active:scale-95"
                    >
                        <div className="bg-gold group-hover:bg-white p-1 rounded-full transition-colors">
                            <Plus size={16} className="text-white group-hover:text-gold" strokeWidth={3} />
                        </div>
                        <span className="tracking-wide">Designations</span>

                    </Link>
                    </div>
                </div>
            </div>
            <div className="w-full max-w-7xl mx-auto -mt-10 mb-12 relative z-20 px-4">
                <div className="bg-white dark:bg-secondary-800 backdrop-blur-md border border-secondary-200 dark:border-secondary-700 rounded-2xl md:rounded-full shadow-2xl p-2 md:p-3">
                    <div className="flex flex-col md:flex-row items-center gap-2">

                        {/* Keyword Search */}
                        <div className="flex-1 flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-secondary-100 dark:border-secondary-700 py-2">
                            <Search className="text-gold mr-3" size={20} />
                            <input
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        setQ(input);
                                        applyFilters({ q: input });
                                    }
                                }}
                                placeholder="Search by name..."
                                className="bg-transparent border-none outline-none text-sm w-full placeholder:text-secondary-400 dark:text-white"
                            />
                        </div>

                        {/* Role Dropdown */}
                        <div className="flex-1 flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-secondary-100 dark:border-secondary-700 py-2">
                            <Filter className="text-gold mr-3 shrink-0" size={18} />

                            <div className="relative w-full group">
                                {/* The Select Box */}
                                <select
                                    value={role}
                                    onChange={(e) => {
                                        setRole(e.target.value);
                                        applyFilters({ role: e.target.value });
                                    }}
                                    className="bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-700 rounded-lg px-3 py-2 text-sm w-full cursor-pointer dark:text-white appearance-none focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all pr-10"
                                >
                                    <option value="" className="dark:bg-secondary-800">All Users</option>
                                    <option value="client" className="dark:bg-secondary-800">Client</option>
                                    <option value="partner" className="dark:bg-secondary-800">Partner</option>
                                    <option value="staff" className="dark:bg-secondary-800">Staff</option>

                                </select>

                                {/* Custom Chevron Icon */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400 group-hover:text-gold transition-colors">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        {/* verified dropdown */}
                        <div className="flex-1 flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-secondary-100 dark:border-secondary-700 py-2">
                            <Filter className="text-gold mr-3 shrink-0" size={18} />

                            <div className="relative w-full group">
                                {/* The Select Box */}
                                <select
                                    value={isVerified}
                                    onChange={(e) => {
                                        setIsVerified(e.target.value);
                                        applyFilters({ isVerified: e.target.value });
                                    }}
                                    className="bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-700 rounded-lg px-3 py-2 text-sm w-full cursor-pointer dark:text-white appearance-none focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all pr-10"
                                >
                                    <option value="" className="dark:bg-secondary-800">All</option>
                                    <option value="true" className="dark:bg-secondary-800">Verified</option>
                                    <option value="false" className="dark:bg-secondary-800">Not Verified</option>

                                </select>

                                {/* Custom Chevron Icon */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400 group-hover:text-gold transition-colors">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Visibility */}
                        <div className="flex-1 flex items-center px-4 w-full border-b md:border-b-0 md:border-r border-secondary-100 dark:border-secondary-700 py-2">
                            <Filter className="text-gold mr-3 shrink-0" size={18} />

                            <div className="relative w-full group">
                                {/* The Select Box */}
                                <select
                                    value={isActive}
                                    onChange={(e) => {
                                        setIsActive(e.target.value);
                                        applyFilters({ isActive: e.target.value });
                                    }}
                                    className="bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-200 dark:border-secondary-700 rounded-lg px-3 py-2 text-sm w-full cursor-pointer dark:text-white appearance-none focus:border-gold focus:ring-1 focus:ring-gold outline-none transition-all pr-10"
                                >
                                    <option value="all" className="dark:bg-secondary-800">All</option>
                                    <option value="true" className="dark:bg-secondary-800">Active</option>
                                    <option value="false" className="dark:bg-secondary-800">Inactive</option>

                                </select>

                                {/* Custom Chevron Icon */}
                                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-secondary-400 group-hover:text-gold transition-colors">
                                    <ChevronDown size={16} />
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-2 w-full md:w-auto px-2 pb-2 md:pb-0">
                            <button
                                onClick={() => {
                                    setQ(input);
                                    applyFilters({ q: input });
                                }}
                                disabled={isPending}
                                className="flex-1 md:flex-none bg-secondary-700 dark:bg-secondary-900 text-white px-8 py-3 rounded-xl md:rounded-full text-sm font-bold hover:bg-gold-gradient transition-all active:scale-95 disabled:opacity-50"
                            >
                                {isPending ? "..." : "Search"}
                            </button>

                            {(q || isVerified || role) && (
                                <button
                                    onClick={resetAll}
                                    className="p-3 text-secondary-400 hover:text-red-500 transition-colors"
                                    title="Reset Filters"
                                >
                                    <X size={20} />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            {
                users.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="relative mb-6">
                            <div className="h-24 w-24 rounded-full bg-secondary-100 dark:bg-secondary-800 flex items-center justify-center text-4xl">
                                🏙️
                            </div>
                            <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-gold-gradient flex items-center justify-center shadow-lg border-4 border-white dark:border-secondary-900">
                                <span className="text-white text-xs font-bold">?</span>
                            </div>
                        </div>

                        <h2 className="text-2xl md:text-3xl font-black text-secondary-900 dark:text-white uppercase tracking-tight">
                            No Matches <span className="text-gold">Found</span>
                        </h2>

                        <p className="mt-4 max-w-md text-secondary-500 dark:text-secondary-400 leading-relaxed">
                            We couldn't find any users matching your current filters {q && <span>for <span className="text-gold font-bold">"{q}"</span></span>}.
                            Try broadening your criteria or resetting the filters.
                        </p>

                        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                            {/* This link effectively "Refreshes" the search by clearing the URL */}
                            <Link
                                href="/admin/users/add-user"
                                className="px-10 py-4 bg-gold-gradient text-white rounded-full font-bold hover:bg-gold-gradient-hover transition-all shadow-xl active:scale-95"
                            >
                                Add User
                            </Link>
                            <Link
                                href="/admin/users"
                                className="px-10 py-4 bg-secondary-900 dark:bg-black text-white rounded-full font-bold hover:bg-gold-gradient transition-all shadow-xl active:scale-95"
                            >
                                Clear All Filters
                            </Link>

                            <Link
                                href="/admin/dashboard"
                                className="px-10 py-4 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white rounded-full font-bold hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all"
                            >
                                Back to Home
                            </Link>
                        </div>
                    </div>
                ) : (

                    <UserTable users={users} />
                )
            }
            <Pagination totalPages={totalPages} currentPage={currentPage} />
        </main>
    )
}