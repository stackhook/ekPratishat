"use client";

import { Building2, Home, BadgeDollarSign, Wallet, TrendingUp, Sparkles } from "lucide-react";

interface Props {
    saleValue: number;
    saleCount: number;
    rentalValue: number;
    rentalCount: number;
}

export default function PropertyPortfolioSummary({
    saleValue = 0,
    saleCount = 0,
    rentalValue = 0,
    rentalCount = 0,
}: Props) {
    // 1% gross commission, keeping 25% agent allocation split
    const saleCommission = saleValue * 0.01 * 0.25;

    // Annualized rental calculations at 1% gross commission, keeping 25% agent allocation split
    const rentalCommission = rentalValue * 12 * 0.01 * 0.25;

    const totalCommission = saleCommission + rentalCommission;

    const formatCurrency = (value: number) =>
        new Intl.NumberFormat("en-NP", {
            style: "currency",
            currency: "NPR",
            maximumFractionDigits: 0,
        }).format(value || 0);

    return (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm transition hover:shadow-md max-w-7xl antialiased">
            
            {/* Header section with motivating subtitle */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-5 border-b border-slate-100">
                <div>
                    <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-emerald-500" />
                        Expected Commission Forecast
                    </h2>
                    <p className="text-xs font-medium text-slate-400 mt-0.5">
                        Real-time forecast based on your actively managed property portfolios.
                    </p>
                </div>
                <span className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-100 uppercase tracking-wide shrink-0 self-start sm:self-auto">
                    <Sparkles className="h-3 w-3" />
                    Active Pipeline
                </span>
            </div>

            {/* 🚀 HERO CALLOUT: Total Expected Agent Commission */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 text-white p-6 md:p-8 shadow-xl border border-slate-800 mb-6 group">
                
                {/* Visual Ambient Glow Orbs background ring layouts */}
                <div className="absolute -right-10 -top-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl group-hover:bg-emerald-500/20 transition duration-500" />
                <div className="absolute -left-10 -bottom-10 h-40 w-40 rounded-full bg-blue-500/10 blur-3xl group-hover:bg-blue-500/20 transition duration-500" />

                <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-indigo-300 text-xs font-bold tracking-widest uppercase">
                            <Wallet className="h-4 w-4 text-emerald-400" />
                            Your Target Commission Take-Home
                        </div>
                        <h3 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white drop-shadow-sm select-all">
                            {formatCurrency(totalCommission)}
                        </h3>
                        {/* <p className="text-[11px] text-slate-400/90 font-medium max-w-md">
                            Calculated at your structured agent incentive metrics (25% share of 1% property revenue pools).
                        </p> */}
                    </div>

                    {/* Mini Ledger breakdown inside hero layer */}
                    <div className="w-full md:w-64 border-t md:border-t-0 md:border-l border-slate-800 pt-4 md:pt-0 md:pl-6 space-y-2.5 text-xs">
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-medium">Sales Pipeline</span>
                            <span className="font-bold text-slate-200">{formatCurrency(saleCommission)}</span>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-slate-400 font-medium">Rentals (Annualized)</span>
                            <span className="font-bold text-slate-200">{formatCurrency(rentalCommission)}</span>
                        </div>
                        <div className="h-1 w-full bg-slate-800 rounded-full overflow-hidden mt-1">
                            <div 
                                className="h-full bg-gradient-to-r from-emerald-400 to-indigo-400 rounded-full" 
                                style={{ width: `${totalCommission > 0 ? (saleCommission / totalCommission) * 100 : 50}%` }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* Sub-Portfolio Category Breakdown Grids */}
            <div className="grid gap-4 sm:grid-cols-2">

                {/* Sales Portfolio Card */}
                <div className="group rounded-xl border border-slate-200 bg-slate-50/40 p-5 hover:bg-white hover:border-slate-300 transition duration-150 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-blue-50 text-blue-600 rounded-lg">
                                    <Home className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Sales Volume
                                </span>
                            </div>
                            {/* <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                1.0% Pool
                            </span> */}
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">Total Pipeline Value</p>
                        <h4 className="text-xl font-bold text-slate-800 tracking-tight mt-0.5 select-all">
                            {formatCurrency(saleValue)}
                        </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Active mandates:</span>
                        <span className="font-bold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded-full text-[11px]">
                            {saleCount} {saleCount === 1 ? "Property" : "Properties"}
                        </span>
                    </div>
                </div>

                {/* Rental Portfolio Card */}
                <div className="group rounded-xl border border-slate-200 bg-slate-50/40 p-5 hover:bg-white hover:border-slate-300 transition duration-150 flex flex-col justify-between">
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-2">
                                <div className="p-1.5 bg-indigo-50 text-indigo-600 rounded-lg">
                                    <Building2 className="h-4 w-4" />
                                </div>
                                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                                    Rental Volume
                                </span>
                            </div>
                            <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                                Monthly Base
                            </span>
                        </div>
                        <p className="text-[11px] text-slate-400 font-medium">Monthly Active Leases</p>
                        <h4 className="text-xl font-bold text-slate-800 tracking-tight mt-0.5 select-all">
                            {formatCurrency(rentalValue)}
                        </h4>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100/80 flex items-center justify-between text-xs">
                        <span className="text-slate-400 font-medium">Active leases:</span>
                        <span className="font-bold text-slate-700 bg-slate-200/60 px-2 py-0.5 rounded-full text-[11px]">
                            {rentalCount} {rentalCount === 1 ? "Property" : "Properties"}
                        </span>
                    </div>
                </div>

            </div>
        </div>
    );
}