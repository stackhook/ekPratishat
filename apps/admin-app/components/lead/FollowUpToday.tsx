"use client";

import React, { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import { useGetFollowUpToday, useUser } from "@repo/query-hook";
import { 
  AlertOctagon, 
  Clock, 
  User, 
  Phone, 
  ArrowUpRight, 
  Calendar,
  FolderOpen,
  ShieldAlert,
  SlidersHorizontal,
  Building2,
  Tag
} from 'lucide-react';
import { Lead } from '@repo/validators';

export default function FollowUpToday() {
  const { data: userData, isLoading: isUserLoading, isError: isUserError } = useUser();
  
  // Strict matching against role conventions
  const isAdmin = userData?.role === "admin" || userData?.designation?.trim().toUpperCase() === "RECEPTIONIST";
  

  const { data: followups, isLoading: followUpLoading, isError:isFollowError } = useGetFollowUpToday({
    enabled: !!userData && isAdmin,
  });

  // ⏱️ LIVE UPDATE HEARTBEAT TRACKER
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    if (!isAdmin) return;
    
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 30000); // 30s updates

    return () => clearInterval(interval);
  }, [isAdmin]);

  // 🗂️ DYNAMIC LIVE GROUP FILTERING MATRIX
  const { overdueLeads, pendingTodayLeads } = useMemo(() => {
    const rawLeads: Lead[] = followups?.result ?? [];
    
    const overdue: Lead[] = [];
    const pending: Lead[] = [];
    const currentEpoch = currentTime.getTime();

    rawLeads.forEach((lead) => {
      if (!lead.followUpAt) return;

      const followUpEpoch = new Date(lead.followUpAt).getTime();

      if (followUpEpoch < currentEpoch) {
        overdue.push(lead);
      } else {
        pending.push(lead);
      }
    });

    return { overdueLeads: overdue, pendingTodayLeads: pending };
  }, [followups, currentTime]);

  // 1. Silent early bail-out protection for non-admins and load cycles
  if (isUserLoading || isUserError || !isAdmin || isFollowError) {
    return null;
  }

  // 2. Premium minimalist skeleton indicator for data table transition
  if (followUpLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-6">
        <div className="h-10 w-1/4 bg-secondary-200 dark:bg-secondary-800 rounded-xl animate-pulse" />
        <div className="h-64 bg-secondary-50 dark:bg-secondary-900/40 rounded-2xl border border-secondary-200 dark:border-secondary-800 animate-pulse" />
      </div>
    );
  }

  const totalLeadsCount = followups?.count ?? 0;

  return (
    <div className="max-w-7xl px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* 🏛️ ADMINISTRATIVE CONTROL HEADER PANEL */}
      <div className="bg-gradient-to-r from-secondary-950 to-secondary-900 border border-secondary-800 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div className="space-y-1.5">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-red-500/10 text-red-400 text-xs font-bold uppercase tracking-wider border border-red-500/20">
            <ShieldAlert className="w-3.5 h-3.5" /> Administrative Oversight
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">Global Follow-Up Pipeline</h1>
          <p className="text-xs text-secondary-400 max-w-xl leading-relaxed">
            Corporate control center monitoring daily task accountability and performance metrics across all active operators.
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/10 backdrop-blur-md shrink-0">
          <div className="text-right">
            <div className="text-[10px] text-secondary-400 font-bold uppercase tracking-wider">Pipeline Records</div>
            <div className="text-lg font-black text-primary-400">{totalLeadsCount} Actionable</div>
          </div>
        </div>
      </div>

      {/* ⏱️ TIME MATRIX TRACKER LEGEND */}
      <div className="flex items-center justify-between border border-secondary-200/60 dark:border-secondary-800/80 bg-secondary-50/50 dark:bg-secondary-900/20 px-4 py-3 rounded-xl text-xs text-secondary-500 dark:text-secondary-400">
        <div className="flex items-center gap-2 font-medium">
          <SlidersHorizontal className="w-3.5 h-3.5 text-secondary-400" />
          System Clock Synchronized (Nepal Standard Time)
        </div>
        <div className="text-[11px] font-mono bg-secondary-200/50 dark:bg-secondary-800 px-2 py-0.5 rounded text-secondary-600 dark:text-secondary-300">
          Last Refresh: {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>

      {totalLeadsCount === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-secondary-200 dark:border-secondary-800 rounded-3xl bg-secondary-50/20 dark:bg-secondary-900/5">
          <FolderOpen className="w-14 h-14 text-secondary-300 dark:text-secondary-700 stroke-[1.2] mb-3" />
          <h3 className="text-base font-bold text-secondary-800 dark:text-secondary-200">No operational records found</h3>
          <p className="text-xs text-secondary-400 max-w-xs mt-1 leading-relaxed">All active field agents are clear of target deadlines for today.</p>
        </div>
      ) : (
        <div className="space-y-8">
          
          {/* 🛑 CRITICAL OVERDUE OPERATIONS CONTAINER */}
          {overdueLeads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center justify-between border-b border-red-100 dark:border-red-950/40 pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  <h2 className="text-xs font-black tracking-widest text-red-600 dark:text-red-400 uppercase flex items-center gap-1.5">
                    <AlertOctagon className="w-4 h-4" />
                    Overdue Admin Deadlines ({overdueLeads.length})
                  </h2>
                </div>
                <span className="text-[10px] bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 px-2 py-0.5 rounded font-bold">Action Required</span>
              </div>
              <AdminTableLayout leads={overdueLeads} alertType="overdue" />
            </div>
          )}

          {/* ⏰ PENDING SCHEDULING CONTAINER */}
          {pendingTodayLeads.length > 0 && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 border-b border-amber-200/60 dark:border-amber-800/60 pb-2">
                <h2 className="text-xs font-black tracking-widest text-amber-600 dark:text-amber-400 uppercase flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-amber-500" />
                  Remaining Action Commitments Today ({pendingTodayLeads.length})
                </h2>
              </div>
              <AdminTableLayout leads={pendingTodayLeads} alertType="today" />
            </div>
          )}

        </div>
      )}
    </div>
  );
}

/* 📊 PRIVILEGED ADMINISTRATIVE DATA DISPLAY TABLE */
function AdminTableLayout({ leads, alertType }: { leads: Lead[]; alertType: 'overdue' | 'today' }) {
  return (
    <div className="w-full overflow-hidden border border-secondary-200/70 dark:border-secondary-800/80 bg-white dark:bg-secondary-950/20 rounded-2xl shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-secondary-50/70 dark:bg-secondary-900/40 border-b border-secondary-200/60 dark:border-secondary-800 text-secondary-400 font-bold text-[10px] uppercase tracking-wider">
              <th className="py-3 px-4 w-24">Lead Code</th>
              <th className="py-3 px-4">Client Detail</th>
              <th className="py-3 px-4">Contact Parameter</th>
              <th className="py-3 px-4">Assigned Agent</th>
              <th className="py-3 px-4">Type</th>
              <th className="py-3 px-4">Scheduled Deadline</th>
              <th className="py-3 px-4 text-center w-28">Status</th>
              <th className="py-3 px-4 text-right w-24">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-secondary-100 dark:divide-secondary-800/40 text-xs">
            {leads.map((lead) => {
              const deadlineDate = lead.followUpAt ? new Date(lead.followUpAt) : null;
              
              return (
                <tr 
                  key={lead.id} 
                  className="hover:bg-secondary-50/40 dark:hover:bg-secondary-900/10 transition duration-150 group"
                >
                  {/* Lead ID Code */}
                  <td className="py-3.5 px-4 font-mono text-secondary-400 group-hover:text-secondary-900 dark:group-hover:text-secondary-100 font-medium">
                    #{lead.leadCode}
                  </td>
                  
                  {/* Client Parameter */}
                  <td className="py-3.5 px-4 font-bold text-secondary-800 dark:text-secondary-200">
                    <div className="flex items-center gap-2">
                      <User className="w-3.5 h-3.5 text-secondary-400 shrink-0 stroke-[1.5]" />
                      <span className="truncate max-w-[160px]">
                        {lead.name || <span className="italic text-secondary-400 font-normal">Anonymous Prospect</span>}
                      </span>
                    </div>
                  </td>
                  
                  {/* Communication Interface */}
                  <td className="py-3.5 px-4 font-mono text-secondary-600 dark:text-secondary-400">
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3 h-3 text-secondary-400" />
                      {lead.contact}
                    </div>
                  </td>
                  
                  {/* Assigned Agent Column */}
                  <td className="py-3.5 px-4">
                    <span className="inline-flex items-center px-2 py-0.5 rounded bg-primary-50 dark:bg-primary-950/40 text-primary-700 dark:text-primary-400 font-bold text-[11px] border border-primary-100 dark:border-primary-900/30">
                      {lead.managedBy?.name || "Unassigned"}
                    </span>
                  </td>

                  {/* Client Type / Deal context */}
                  <td className="py-3.5 px-4 text-secondary-500 dark:text-secondary-400 font-medium">
                    <div className="flex items-center gap-1">
                      {lead.clientType === 'BUYER' ? (
                        <Tag className="w-3 h-3 text-emerald-500" />
                      ) : (
                        <Building2 className="w-3 h-3 text-indigo-500" />
                      )}
                      <span className="text-[11px] tracking-wide">{lead.clientType}</span>
                    </div>
                  </td>
                  
                  {/* Dynamic Timestamps */}
                  <td className="py-3.5 px-4">
                    {deadlineDate && (
                      <div className={`flex items-center gap-1.5 font-semibold ${
                        alertType === 'overdue' ? 'text-red-500' : 'text-amber-500'
                      }`}>
                        <Calendar className="w-3.5 h-3.5 shrink-0" />
                        <span>
                          {deadlineDate.toLocaleDateString([], { month: 'short', day: 'numeric' })} at{' '}
                          {deadlineDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    )}
                  </td>
                  
                  {/* Pipeline Lifecycle State */}
                  <td className="py-3.5 px-4 text-center">
                    <span className="inline-block text-[10px] font-black px-2 py-0.5 rounded-md bg-secondary-100 dark:bg-secondary-800 text-secondary-600 dark:text-secondary-400 border border-secondary-200/40 dark:border-secondary-700/40 tracking-wider">
                      {lead.status}
                    </span>
                  </td>
                  
                  {/* Control Entry Link */}
                  <td className="py-3.5 px-4 text-right">
                    <Link 
                      href={`/admin/leads/${lead.id}`}
                      className="inline-flex items-center gap-0.5 font-bold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 transition"
                    >
                      Audit 
                      <ArrowUpRight className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}