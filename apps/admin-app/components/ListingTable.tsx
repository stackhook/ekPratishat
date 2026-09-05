
import { Calendar, CheckCircle2, MapPin, MoreVertical, ShieldCheck, Star, XCircle } from "lucide-react";
import Link from "next/link";


type SaleType = "rent" | "sale"
export interface PropertyListing {
    id: string;
    title: string;
    type: SaleType; // "rent" | "saler"
    verified: boolean;
    isFeatured: boolean;
    price:string;
    coverImage: {
        id:string;
        url: string;
    },
    images: {
        id:string;
        url: string;
    }[],
    propertyCode: number;
    tole: string;
    createdAt: Date | string; // Date if coming from server, string if via JSON API

    // Nested Location Data
    location: {
        id:string;
        name: string; // The Ward name (usually a number)
        municipality: {
            id:string;
            name: string;
            district: {
                id:string;
                name: string;
            };
        };
    };

    // Nested Category Data
    category: {
        id:string;
        name: string;
    };
}

export default function ListingTable({ listings }: { listings: PropertyListing[] }) {
     if (listings.length === 0) {
        return (
            /* --- BEAUTIFUL EMPTY STATE (Server Side) --- */
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
                    We couldn't find any properties matching your current filters.
                    Try broadening your criteria or resetting the filters.
                </p>

                <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
                    {/* This link effectively "Refreshes" the search by clearing the URL */}
                    <Link
                        href="/admin/properties/add-property"
                        replace
                        className="px-10 py-4 bg-gold-gradient text-white rounded-full font-bold hover:bg-gold-gradient-hover transition-all shadow-xl active:scale-95"
                    >
                        Add Property +
                    </Link>
                    <Link
                        href="/admin/properties"
                        replace
                        className="px-10 py-4 bg-secondary-900 dark:bg-black text-white rounded-full font-bold hover:bg-gold-gradient transition-all shadow-xl active:scale-95"
                    >
                        Clear All Filters
                    </Link>

                    <Link
                        href="/admin/dashboard"
                        replace
                        className="px-10 py-4 border border-secondary-200 dark:border-secondary-700 text-secondary-900 dark:text-white rounded-full font-bold hover:bg-secondary-100 dark:hover:bg-secondary-800 transition-all"
                    >
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-7xl mx-auto px-4">
            {/* Desktop View */}
            <div className="hidden md:block overflow-hidden bg-white dark:bg-secondary-800 rounded-2xl border border-secondary-200 dark:border-secondary-700 shadow-sm">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-secondary-50 dark:bg-secondary-900/50 text-secondary-500 uppercase text-[10px] font-black tracking-widest">
                        <tr>
                            <th className="px-6 py-4">Code</th>
                            <th className="px-6 py-4">Property</th>
                            <th className="px-6 py-4">Location</th>
                            <th className="px-6 py-4">Category / Type</th>
                            <th className="px-6 py-4">Status</th>

                        </tr>
                    </thead>
                    <tbody className="divide-y divide-secondary-100 dark:divide-secondary-700">
                        {listings.map((item) => (
                            <tr key={item.id} className="hover:bg-secondary-50 dark:hover:bg-secondary-900/30 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-1 text-sm text-secondary-600 dark:text-secondary-400">
                                        EP-
                                        <span>
                                            {item.propertyCode}
                                        </span>
                                    </div>
                                </td>
                                <td className={`px-6 py-4 transition-colors ${item.isFeatured ? "bg-gold/5" : ""}`}>
                                    <div className="flex flex-col gap-0.5">
                                        <Link href={`/admin/properties/${item.id}`} className="flex items-center gap-2">
                                            {item.isFeatured && (
                                                <Star
                                                    size={14}
                                                    className="text-gold fill-gold shrink-0"
                                                />
                                            )}
                                            <span className={`font-bold line-clamp-1 ${item.isFeatured
                                                    ? "text-gold dark:text-gold"
                                                    : "text-secondary-900 dark:text-white"
                                                }`}>
                                                {item.title}
                                            </span>
                                        </Link>

                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-secondary-400 font-medium">
                                                Added {new Date(item.createdAt).toLocaleDateString()}
                                            </span>
                                            {item.isFeatured && (
                                                <span className="text-[9px] font-black bg-gold/10 text-gold px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                                    Featured
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex items-start gap-1 text-sm text-secondary-600 dark:text-secondary-400">
                                        <MapPin size={14} className="mt-0.5 text-gold shrink-0" />
                                        <span>
                                            {item.tole}, Ward {item.location.name}, {item.location.municipality.name}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    <div className="flex flex-col gap-1">
                                        <span className="text-xs font-bold uppercase text-gold">{item.category.name}</span>
                                        <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md w-fit ${item.type === 'rent' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                                            }`}>
                                            For {item.type}
                                        </span>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {item.verified ? (
                                        <div className="flex items-center gap-1.5 text-emerald-500 text-sm font-medium">
                                            <ShieldCheck size={16} /> Verified
                                        </div>
                                    ) : (
                                        <div className="flex items-center gap-1.5 text-secondary-400 text-sm font-medium">
                                            <XCircle size={16} /> Pending
                                        </div>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Mobile View (Card Layout) */}
            <div className="md:hidden flex flex-col gap-4">
                {listings.map((item) => (
                    <div key={item.id} className="bg-white dark:bg-secondary-800 p-5 rounded-2xl border border-secondary-200 dark:border-secondary-700 shadow-sm relative overflow-hidden">
                        {item.isFeatured && <div className="absolute top-0 right-0 bg-gold text-white text-[10px] font-bold px-3 py-1 rounded-bl-lg">FEATURED</div>}

                        <div className="flex flex-col gap-3">
                            <div>
                                <h3 className="font-bold text-secondary-900 dark:text-white leading-tight">EP-{item.propertyCode}</h3>
                                <h3 className="font-bold text-secondary-900 dark:text-white leading-tight">{item.title}</h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className="text-[10px] font-black text-gold uppercase">{item.category.name}</span>
                                    <span className="text-secondary-300">•</span>
                                    <span className="text-[10px] font-bold text-secondary-400 uppercase">For {item.type}</span>
                                </div>
                            </div>

                            <div className="flex items-start gap-2 text-sm text-secondary-500 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-900/50 p-3 rounded-xl">
                                <MapPin size={16} className="text-gold shrink-0 mt-0.5" />
                                <span>{item.tole}, {item.location.municipality.name}, {item.location.municipality.district.name}</span>
                            </div>

                            <div className="flex items-center justify-between mt-2 pt-3 border-t border-secondary-100 dark:border-secondary-700">
                                <div className="flex items-center gap-1 text-[10px] text-secondary-400 font-bold uppercase">
                                    <Calendar size={12} />
                                    {new Date(item.createdAt).toLocaleDateString()}
                                </div>
                                <Link href={`/admin/properties/${item.id}`} className="text-sm font-bold text-gold hover:underline">View Details</Link>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}