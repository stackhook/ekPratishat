"use client";

import { Fragment, useState } from "react";
import Link from "next/link";
import {
  ChevronDown,
  ChevronUp,
  Eye,
  Phone,
  Tag,
  User,
  Mail,
  MapPin,
  Bookmark,
  Calendar,
  FileText
} from "lucide-react";
import { Lead } from "@repo/validators";


interface LeadTableProps {
  leads: Lead[];
}

export default function LeadTable({ leads }: LeadTableProps) {

  const [expandedRows, setExpandedRows] = useState<Record<string, boolean>>({});

  const toggleRow = (id: string) => {
    setExpandedRows((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-12 bg-white dark:bg-secondary-900 border border-dashed border-secondary-200 dark:border-secondary-800 rounded-2xl">
        <p className="text-sm font-medium text-secondary-500">No active leads found matching criteria.</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* 🖥️ DESKTOP VIEW: Structured Table Layout */}
      <div className="hidden md:block overflow-hidden bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary-50 dark:bg-secondary-800/50 border-b border-secondary-200 dark:border-secondary-800 text-xs font-bold uppercase tracking-wider text-secondary-500">
              <th className="py-3.5 px-4 w-10">Code</th>
              <th className="py-3.5 px-4">Contact info</th>
              <th className="py-3.5 px-4 text-center">Deal Type</th>
              <th className="py-3.5 px-4 text-center">Client Type</th>
              <th className="py-3.5 px-4">Category</th>
              <th className="py-3.5 px-4">Status</th>
              <th className="py-3.5 px-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-200 dark:divide-secondary-800 text-sm">
            {leads.map((lead) => {
              const isExpanded = !!expandedRows[lead.id];
              return (
                <Fragment key={lead.id}>
                  {/* Master row for mandatory configurations */}
                  <tr key={lead.id} className="hover:bg-secondary-50/50 dark:hover:bg-secondary-800/20 transition-colors">
                    <td className="py-4 px-4">
                      <button
                        onClick={() => toggleRow(lead.id)}
                        className="p-1 hover:bg-secondary-100 dark:hover:bg-secondary-800 rounded-lg text-secondary-400 transition-colors"
                      >
                        {isExpanded ? (
                          <div className="flex gap-2">
                            <span>{lead.leadCode}</span>
                            <ChevronUp className="w-4 h-4" />
                          </div>
                        ) : (
                          <div className="flex gap-2">
                          <span>{lead.leadCode}</span>
                          <ChevronDown className="w-4 h-4" />
                          </div>
                        )}
                      </button>
                    </td>
                    <td className="py-4 px-4 font-semibold text-secondary-900 dark:text-secondary-100">
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-secondary-400" />
                        {lead.contact}
                      </div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className="px-2 py-1 text-xs font-medium rounded-md bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 capitalize">
                        {lead.dealType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`px-2 py-1 text-xs font-bold rounded-md border tracking-wide ${lead.clientType === "SELLER"
                          ? "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400"
                          : "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400"
                        }`}>
                        {lead.clientType}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-secondary-600 dark:text-secondary-400 font-medium">
                      {lead.category?.name ?? ""}
                    </td>
                    <td className="py-4 px-4">
                      <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-secondary-100 text-secondary-700 dark:bg-secondary-800 dark:text-secondary-300 border border-secondary-200 dark:border-secondary-700">
                        {lead.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <Link
                        href={`/admin/leads/${lead.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-medium transition-colors shadow-sm"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Link>
                    </td>
                  </tr>

                  {/* Dropdown row container for optional non-null elements */}
                  {isExpanded && (
                    <tr className="bg-secondary-50/40 dark:bg-secondary-800/10">
                      <td colSpan={7} className="p-5">
                        <OptionalDetailsPanel lead={lead} />
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* 📱 MOBILE VIEW: Stacked Responsive Grid Containers */}
      <div className="block md:hidden space-y-4">
        {leads.map((lead) => {
          const isExpanded = !!expandedRows[lead.id];
          return (
            <div key={lead.id} className="bg-white dark:bg-secondary-900 border border-secondary-200 dark:border-secondary-800 rounded-2xl overflow-hidden shadow-sm">
              {/* Card Primary Window */}
              <div className="p-4 space-y-3">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-secondary-400 uppercase tracking-wider">Contact Target</span>
                    <div className="flex items-center gap-2 font-bold text-secondary-900 dark:text-secondary-100">
                      <Phone className="w-4 h-4 text-secondary-400" />
                      <span>{lead.contact}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-md bg-secondary-100 text-secondary-700 dark:bg-secondary-800 text-xs font-bold">
                    Code-{lead.leadCode}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-secondary-100 dark:border-secondary-800 text-xs">
                  <div>
                    <span className="text-secondary-400 block text-[10px] mb-0.5">Deal</span>
                    <span className="capitalize font-semibold text-secondary-700 dark:text-secondary-300">{lead.dealType}</span>
                  </div>
                  <div>
                    <span className="text-secondary-400 block text-[10px] mb-0.5">Client</span>
                    <span className="font-semibold text-secondary-700 dark:text-secondary-300">{lead.clientType}</span>
                  </div>
                  <div>
                    <span className="text-secondary-400 block text-[10px] mb-0.5">Source</span>
                    <span className="font-semibold text-secondary-700 dark:text-secondary-300 truncate block">{lead.source}</span>
                  </div>
                </div>

                <div className="flex gap-2 pt-3 border-t border-secondary-100 dark:border-secondary-800">
                  <button
                    onClick={() => toggleRow(lead.id)}
                    className="flex-1 flex items-center justify-center gap-1 py-2 border border-secondary-200 dark:border-secondary-800 rounded-xl text-xs font-medium text-secondary-600 dark:text-secondary-400 bg-secondary-50/50"
                  >
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    <span>{isExpanded ? "Hide Details" : "Show Details"}</span>
                  </button>
                  <Link
                    href={`/admin/leads/${lead.id}`}
                    className="flex-1 flex items-center justify-center gap-1 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-xs font-medium text-center transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>View Workspace</span>
                  </Link>
                </div>
              </div>

              {/* Mobile Extended Accordion Sheet */}
              {isExpanded && (
                <div className="bg-secondary-50/60 dark:bg-secondary-800/20 px-4 py-5 border-t border-secondary-100 dark:border-secondary-800">
                  <OptionalDetailsPanel lead={lead} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* --- ISOLATED COMPONENT FOR NON-NULL ATTRIBUTE RENDERING --- */
function OptionalDetailsPanel({ lead }: { lead: Lead }) {
  return (
    <div className="space-y-4 text-xs">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {lead.name && (
          <div className="space-y-1">
            <span className="text-secondary-400 block font-medium">Customer Name</span>
            <div className="flex items-center gap-2 font-medium text-secondary-800 dark:text-secondary-200">
              <User className="w-3.5 h-3.5 text-secondary-400" />
              <span>{lead.name}</span>
            </div>
          </div>
        )}

        {lead.email && (
          <div className="space-y-1">
            <span className="text-secondary-400 block font-medium">Email Address</span>
            <div className="flex items-center gap-2 font-medium text-secondary-800 dark:text-secondary-200">
              <Mail className="w-3.5 h-3.5 text-secondary-400" />
              <span>{lead.email}</span>
            </div>
          </div>
        )}

        {lead.coordinates && (
          <div className="space-y-1">
            <span className="text-secondary-400 block font-medium">GPS Location Map Link</span>
            <div className="flex items-center gap-2 font-medium text-secondary-800 dark:text-secondary-200">
              <MapPin className="w-3.5 h-3.5 text-secondary-400" />
              <span>{lead.coordinates}</span>
            </div>
          </div>
        )}

        {lead.propertyId && (
          <div className="space-y-1">
            <span className="text-secondary-400 block font-medium">Assigned Property Asset ID</span>
            <div className="flex items-center gap-2 font-mono text-secondary-800 dark:text-secondary-200">
              <Bookmark className="w-3.5 h-3.5 text-secondary-400" />
              <span>{lead.propertyId}</span>
            </div>
          </div>
        )}

        {lead.followUpAt && (
          <div className="space-y-1">
            <span className="text-secondary-400 block font-medium">Next Follow Up Alarm</span>
            <div className="flex items-center gap-2 font-medium text-secondary-800 dark:text-secondary-200">
              <Calendar className="w-3.5 h-3.5 text-secondary-400" />
              <span>{new Date(lead.followUpAt).toLocaleString()}</span>
            </div>
          </div>
        )}

        {lead.managedBy && (
          <div className="space-y-1">
            <span className="text-secondary-400 block font-medium">Lead Handler</span>
            <div className="flex items-center gap-2 font-medium text-secondary-800 dark:text-secondary-200">
              <div className="w-4 h-4 rounded-full bg-secondary-200 dark:bg-secondary-700 flex items-center justify-center text-[9px] uppercase font-bold">
                {lead.managedBy.name.charAt(0)}
              </div>
              <span>{lead.managedBy.name} ({lead.managedBy.email})</span>
            </div>
          </div>
        )}

        {lead.remarks && (
          <div className="space-y-1 sm:col-span-2 md:col-span-3">
            <span className="text-secondary-400 block font-medium">Pipeline Audit Remarks</span>
            <div className="flex items-start gap-2 p-2 rounded-xl bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-800 dark:text-secondary-200 font-medium">
              <FileText className="w-3.5 h-3.5 text-secondary-400 mt-0.5 shrink-0" />
              <span>{lead.remarks}</span>
            </div>
          </div>
        )}
      </div>

      {/* Structured JSON Notes Sub-loop Map */}
      {lead.notes && Object.keys(lead.notes).length > 0 && (
        <div className="pt-3 border-t border-secondary-200 dark:border-secondary-800">
          <span className="text-secondary-400 text-[10px] uppercase font-bold tracking-wider block mb-1.5">Extended Form Metadata (JSON)</span>
          <div className="flex flex-wrap gap-1.5">
            {Object.entries(lead.notes).map(([key, value]) => {
              if (value === null || value === undefined || value === "") return null;
              return (
                <span
                  key={key}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg bg-white dark:bg-secondary-800 border border-secondary-200 dark:border-secondary-700 text-secondary-700 dark:text-secondary-300 font-medium"
                >
                  <Tag className="w-2.5 h-2.5 text-secondary-400" />
                  <span className="text-secondary-400 font-semibold">{key}:</span>
                  <span>{String(value)}</span>
                </span>
              );
            })}
          </div>
        </div>
      )}

      {/* Image Preview Snapshots */}
      {lead.imageUrl && (
        <div className="pt-3 border-t border-secondary-200 dark:border-secondary-800">
          <span className="text-secondary-400 text-[10px] uppercase font-bold tracking-wider block mb-1.5">Attached Documentation Graphic</span>
          <div className="w-24 h-16 rounded-xl overflow-hidden border border-secondary-200 dark:border-secondary-800 relative shadow-inner bg-secondary-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lead.imageUrl}
              alt="Lead attachments preview"
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      )}
    </div>
  );
}