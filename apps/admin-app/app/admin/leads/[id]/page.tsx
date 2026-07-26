"use client";

import { useGetLeadById } from "@repo/query-hook";
import AnimateLoader from "@repo/ui/animateLoader";
import { LeadDetailType } from "@repo/validators";
import ImageLightbox from "@repo/ui/imageLightbox";
import { useParams } from "next/navigation"
import {
    Phone,
    User,
    Mail,
    MapPin,
    Bookmark,
    Calendar,
    FileText,
    Tag,
    Activity,
    Clock,
    ShieldAlert,
    Trash2,
    CheckCircle,
    ExternalLink,
    ChevronRight,
    Edit,
    AlertTriangle
} from "lucide-react";

import UpdateFollowUpTime from "../../../../components/lead/ChangeFollowUptime";
import LeadStatusUpdate from "../../../../components/lead/LeadStatusUpdate";
import BasicInfoUpdate from "../../../../components/lead/BasicInfoUpdate";
import ChangeHandler from "../../../../components/lead/ChangeHandler";
import { useEffect, useState } from "react";
import PokeButton from "../../../../components/lead/PokeButton";
import UpdateCompulsoryParameter from "../../../../components/lead/updateCompulsoryParameter";

export default function LeadDetailPage() {
    const params = useParams();
    const { data, isLoading, isError, error } = useGetLeadById(params.id as string);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(new Date());
        }, 30000);

        return () => clearInterval(interval);
    }, [])

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

    const lead: LeadDetailType = data.result;
    const getStatusStyle = (status: string) => {
        const s = status.toUpperCase();
        if (s === "WON") return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900";
        if (s === "LOST") return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900";
        if (s === "FOLLOW_UP") return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900";
        return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900";
    };

    const isFollowUpOverdue =
        lead.followUpAt && new Date(lead.followUpAt) < currentTime;

    return (
        <div className="max-w-7xl p-4 md:p-6 space-y-6 text-secondary-900 dark:text-secondary-100">

            {/* 🥖 BREADCRUMB INDICATOR */}
            <div className="flex items-center gap-1.5 text-xs font-medium text-secondary-500">
                <span>Dashboard</span>
                <ChevronRight className="w-3 h-3" />
                <span>Leads</span>
                <ChevronRight className="w-3 h-3" />
                <span className="text-secondary-900 dark:text-secondary-300 font-semibold">{lead.contact}</span>
            </div>

            {/* ==========================================
          SECTION 1: MANAGEMENT ACTION COMMAND BAR
         ========================================== */}
            <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 p-4 rounded-2xl shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-4">

                {/* Entity Summary Flag Header */}
                <div className="flex items-center gap-3">
                    <div className="p-3 bg-primary-50 dark:bg-primary-950/30 text-primary-600 dark:text-primary-400 rounded-xl">
                        <User className="w-5 h-5" />
                    </div>
                    <div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <h1 className="text-base font-bold tracking-tight">{lead.name || "Anonymous Prospect"}</h1>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border tracking-wide ${getStatusStyle(lead.status)}`}>
                                {lead.status}
                            </span>
                        </div>
                        <p className="text-xs text-secondary-500 mt-0.5 font-mono">ID: {lead.id}</p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 border-t pt-3 lg:border-t-0 lg:pt-0">

                    {/* <UpdateLeadStatus lead={lead}/> */}
                    <LeadStatusUpdate lead={lead} />
                    <UpdateFollowUpTime followUpAt={lead.followUpAt} id={lead.id} status={lead.status} />
                    {/* <UpdateBasicInfo leadId={lead.id} name={lead.name} email={lead.email} coordinates={lead.coordinates} notes={lead.notes} status={lead.status}/> */}
                    <BasicInfoUpdate leadId={lead.id} name={lead.name} email={lead.email} coordinates={lead.coordinates} notes={lead.notes} status={lead.status} />

                    {/* <button type="button" className="inline-flex items-center gap-1.5 px-3 py-2 border border-secondary-200 dark:border-secondary-800 hover:bg-secondary-50 dark:hover:bg-secondary-800 rounded-xl text-xs font-semibold text-secondary-700 dark:text-secondary-300 transition-colors">
                        <ShieldAlert className="w-3.5 h-3.5 text-secondary-400" />
                        <span>Change Handler</span>
                    </button> */}
                    <ChangeHandler lead={lead} />
                    <PokeButton lead={lead} />

                    <div className="h-6 w-[1px] bg-secondary-200 dark:bg-secondary-800 hidden sm:block mx-1" />

                    <button type="button" className="inline-flex items-center gap-1.5 px-3 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400 rounded-xl text-xs font-semibold transition-colors">
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Delete Lead</span>
                    </button>
                </div>

            </div>

            {/* TWO COLUMN GRID DISPATCHER FOR PARAMETERS BLOCK */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">

                {/* ==========================================
            SECTION 2: PRIMARY COMPULSORY ATTRIBUTES
           ========================================== */}
                <div className="lg:col-span-1 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
                    <div className="p-4 bg-secondary-50/50 dark:bg-secondary-800/40 border-b border-secondary-100 dark:border-secondary-800 flex justify-between items-center">
                        <h2 className="text-xs font-bold uppercase tracking-wider text-secondary-500">Compulsory Parameters</h2>
                        {/* <button><Edit className="w-4 h-4" /></button> */}
                        <UpdateCompulsoryParameter lead={lead} />
                    </div>
                    <div className="p-5 space-y-4">

                        <div className="space-y-1">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-400 block">Contact Endpoint</span>
                            <div className="flex items-center justify-between p-2.5 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-100 dark:border-secondary-800/60">
                                <div className="flex items-center gap-2 text-sm font-bold text-secondary-900 dark:text-secondary-100">
                                    <Phone className="w-4 h-4 text-primary-500" />
                                    <span>{lead.contact}</span>
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-400 block">Deal Target</span>
                                <div className="p-2.5 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 text-xs font-bold capitalize text-secondary-800 dark:text-secondary-200">
                                    {lead.dealType}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-400 block">Client Profile</span>
                                <div className="p-2.5 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 text-xs font-bold text-secondary-800 dark:text-secondary-200">
                                    {lead.clientType}
                                </div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-400 block">Source Funnel</span>
                                <div className="p-2.5 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                    {lead.source}
                                </div>
                            </div>
                            <div className="space-y-1">
                                <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-400 block">Category</span>
                                <div className="p-2.5 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 text-xs font-semibold text-secondary-700 dark:text-secondary-300">
                                    {lead.category?.name ?? "-"}
                                </div>
                            </div>

                        </div>



                        <div className="space-y-1 pt-2 border-t border-secondary-100 dark:border-secondary-800/60">
                            <span className="text-[10px] uppercase font-bold tracking-wider text-secondary-400 block">Current Pipeline Stage</span>
                            <div className="flex items-center gap-2 text-xs font-bold">
                                <CheckCircle className="w-4 h-4 text-primary-500" />
                                <span>{lead.status} State Logged</span>
                            </div>
                        </div>

                    </div>
                </div>

                {/* ==========================================
            SECTION 3: OPTIONAL / EXTENDED CONTEXT PANELS
           ========================================== */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Main Optional Parameters Base Block */}
                    <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-sm overflow-hidden">
                        <div className="p-4 bg-secondary-50/50 dark:bg-secondary-800/40 border-b border-secondary-100 dark:border-secondary-800">
                            <h2 className="text-xs font-bold uppercase tracking-wider text-secondary-500">Other Parameters</h2>
                        </div>

                        <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">

                            {lead.name && (
                                <div className="space-y-1">
                                    <span className="text-secondary-400 block font-medium">Customer Declared Name</span>
                                    <div className="flex items-center gap-2 p-2 rounded-xl border border-secondary-100 dark:border-secondary-800 text-secondary-800 dark:text-secondary-200 font-semibold">
                                        <User className="w-4 h-4 text-secondary-400" />
                                        <span>{lead.name}</span>
                                    </div>
                                </div>
                            )}

                            {lead.email && (
                                <div className="space-y-1">
                                    <span className="text-secondary-400 block font-medium">Verified Email Destination</span>
                                    <div className="flex items-center gap-2 p-2 rounded-xl border border-secondary-100 dark:border-secondary-800 text-secondary-800 dark:text-secondary-200 font-semibold truncate">
                                        <Mail className="w-4 h-4 text-secondary-400" />
                                        <span>{lead.email}</span>
                                    </div>
                                </div>
                            )}

                            {lead.coordinates && (
                                <div className="space-y-1">
                                    <span className="text-secondary-400 block font-medium">Geographic Site Coordinates</span>
                                    <div className="flex items-center justify-between p-2 rounded-xl border border-secondary-100 dark:border-secondary-800 text-secondary-800 dark:text-secondary-200 font-semibold">
                                        <div className="flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-secondary-400" />
                                            <span>{lead.coordinates}</span>
                                        </div>
                                        <a href={`https://maps.google.com/?q=${lead.coordinates}`} target="_blank" rel="noreferrer" className="text-primary-500 hover:text-primary-600 transition-colors">
                                            <ExternalLink className="w-3.5 h-3.5" />
                                        </a>
                                    </div>
                                </div>
                            )}

                            {lead.propertyId && (
                                <div className="space-y-1">
                                    <span className="text-secondary-400 block font-medium">Linked Portfolio Property Link</span>
                                    <div className="flex items-center gap-2 p-2 rounded-xl border border-secondary-100 dark:border-secondary-800 text-secondary-800 dark:text-secondary-200 font-mono text-[11px]">
                                        <Bookmark className="w-4 h-4 text-secondary-400" />
                                        <span>{lead.propertyId}</span>
                                    </div>
                                </div>
                            )}

                            {lead.followUpAt && (
                                <div className="space-y-1">
                                    <span className="text-secondary-400 block font-medium">
                                        Scheduled Alarm Follow-Up Date
                                    </span>

                                    <div
                                        className={`flex items-center gap-2 p-2 rounded-xl border font-semibold ${isFollowUpOverdue
                                            ? "border-red-300 bg-red-50 text-red-700 dark:border-red-800 dark:bg-red-950/20 dark:text-red-400 animate-pulse"
                                            : "border-secondary-100 dark:border-secondary-800 bg-amber-50/40 dark:bg-amber-950/10 text-amber-700 dark:text-amber-400"
                                            }`}
                                    >
                                        {isFollowUpOverdue ? (
                                            <>
                                                <AlertTriangle className="w-4 h-4" />
                                                <span>⚠️ OVERDUE • </span>
                                            </>
                                        ) : (
                                            <Calendar className="w-4 h-4" />
                                        )}

                                        <span>
                                            {new Date(lead.followUpAt).toLocaleString("en-US", {
                                                timeZone: "Asia/Kathmandu",
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            )}

                            {lead.updatedAt && (
                                <div className="space-y-1">
                                    <span className="text-secondary-400 block font-medium">Last Update Time</span>
                                    <div className="flex items-center gap-2 p-2 rounded-xl border border-secondary-100 dark:border-secondary-800 text-secondary-600 dark:text-secondary-400 bg-amber-50/40 dark:bg-amber-950/10 font-semibold">
                                        <Calendar className="w-4 h-4" />
                                        <span>
                                            {new Date(lead.updatedAt).toLocaleString("en-US", {
                                                timeZone: "Asia/Kathmandu",
                                                dateStyle: "medium",
                                                timeStyle: "short",
                                            })}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1">
                                <span className="text-secondary-400 block font-medium">Lead Registered At</span>
                                <div className="flex items-center gap-2 p-2 rounded-xl border border-secondary-100 dark:border-secondary-800 text-secondary-600 dark:text-secondary-400 font-medium">
                                    <Clock className="w-4 h-4 text-secondary-400" />
                                    <span>
                                        {new Date(lead.createdAt).toLocaleString("en-US", {
                                            timeZone: "Asia/Kathmandu",
                                            dateStyle: "medium",
                                            timeStyle: "short",
                                        })}
                                    </span>
                                </div>
                            </div>

                        </div>

                        {/* Terminal Status Final Audit Remarks Layer */}
                        {lead.remarks && (
                            <div className="px-5 pb-5 space-y-1.5 text-xs">
                                <span className="text-secondary-400 block font-semibold uppercase tracking-wider text-[10px]">Lead Closure Remark</span>
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-secondary-50 dark:bg-secondary-800/40 border border-secondary-100 dark:border-secondary-800 text-secondary-700 dark:text-secondary-300">
                                    <FileText className="w-4 h-4 text-secondary-400 shrink-0 mt-0.5" />
                                    <p className="leading-relaxed font-medium">{lead.remarks}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Render Meta Custom Key-Value Object Data mapping */}
                    {lead.notes && Object.keys(lead.notes).length > 0 && (
                        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-5 shadow-sm space-y-3">
                            <span className="text-secondary-400 text-[10px] font-bold uppercase tracking-wider block">Notes</span>
                            <div className="flex flex-wrap gap-2">
                                {Object.entries(lead.notes).map(([key, value]) => {
                                    if (value === null || value === undefined || value === "") return null;
                                    return (
                                        <div
                                            key={key}
                                            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary-50 dark:bg-secondary-800/50 border border-secondary-150 dark:border-secondary-700/60 text-xs text-secondary-800 dark:text-secondary-200"
                                        >
                                            <Tag className="w-3.5 h-3.5 text-secondary-400" />
                                            <strong className="font-bold text-secondary-500">{key}:</strong>
                                            <span className="font-medium">{String(value)}</span>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* Embedded Layout System Logs Section (Ownership & Updates) */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">

                        {/* Owner Assignee Card Block */}
                        <div className="p-4 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-sm space-y-2">
                            <div className="flex items-center gap-1.5 text-secondary-400 font-semibold tracking-wide uppercase text-[9px]">
                                <ShieldAlert className="w-3.5 h-3.5" />
                                <span>Current Handler</span>
                            </div>
                            {lead.managedBy ? (
                                <div className="space-y-0.5">
                                    <p className="font-bold text-secondary-800 dark:text-secondary-200">{lead.managedBy.name}</p>
                                    <p className="text-[11px] text-secondary-500 truncate font-mono">{lead.managedBy.email}</p>
                                </div>
                            ) : (
                                <p className="text-secondary-400 italic">No manager assigned yet</p>
                            )}
                        </div>

                        {/* Last Audit Action Assignment Block */}
                        <div className="p-4 bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-sm space-y-2">
                            <div className="flex items-center gap-1.5 text-secondary-400 font-semibold tracking-wide uppercase text-[9px]">
                                <Activity className="w-3.5 h-3.5" />
                                <span>Last Updated By</span>
                            </div>
                            {lead.updatedBy ? (
                                <div className="space-y-0.5">
                                    <p className="font-bold text-secondary-800 dark:text-secondary-200">{lead.updatedBy.name}</p>
                                    <p className="text-[11px] text-secondary-500 truncate font-mono">{lead.updatedBy.email}</p>
                                </div>
                            ) : (
                                <p className="text-secondary-400 italic">No update logs recorded</p>
                            )}
                        </div>

                    </div>

                    {/* Asset Attachment Preview Segment */}
                    {lead.imageUrl && (
                        <div className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl p-5 shadow-sm space-y-3">
                            <span className="text-secondary-400 text-[10px] font-bold uppercase tracking-wider block">Attached Document Asset Preview</span>
                            <div className="relative max-w-md rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-800 shadow-inner group bg-secondary-50">
                                <ImageLightbox
                                    src={`${process.env.NEXT_PUBLIC_BASE_URL}${lead.imageUrl}`}
                                    alt="Lead attached document"
                                    className="w-full h-auto max-h-64 object-cover group-hover:scale-[1.02] transition-transform duration-300"
                                />

                            </div>
                        </div>
                    )}

                </div>

            </div>

        </div>
    )
}