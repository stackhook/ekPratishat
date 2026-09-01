"use client";

import { Edit, ShieldCheck, Clock, MapPin } from "lucide-react";
import { useRouter } from "next/navigation";
import ListingDeleteButton from "../properties/ListingDeleteButton";

export interface Listing {
  id: string;
  title: string;
  price: number;
  type: string;
  tole: string;
  propertyCode: number;
  isFeatured: boolean;
  verified: boolean;
  images: { url: string }[];
  category: { name: string };
  createdAt: Date | string;
}

export default function MyListingCard({ item }: { item: Listing }) {
  const mainImage = item.images?.[0]?.url || "/placeholder-property.jpg";
  const router = useRouter();

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card)] shadow-[var(--ek-shadow-card)] transition duration-300 hover:-translate-y-0.5 hover:border-[var(--ek-border-strong)] dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)] dark:shadow-[var(--ek-dark-shadow-card)] dark:hover:border-[var(--ek-dark-border-strong)] cursor-pointer">
      {/* Status Badges */}
      <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
        {item.verified ? (
          <div className="flex items-center gap-1.5 bg-green-500/90 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-lg">
            <ShieldCheck size={14} />
            Verified
          </div>
        ) : (
          <div className="flex items-center gap-1.5 rounded-full border border-[var(--ek-border-soft)] bg-[rgba(255,253,248,0.9)] px-3 py-1.5 text-xs font-bold text-[var(--ek-gold-text)] shadow-sm backdrop-blur-sm dark:border-[var(--ek-dark-border)] dark:bg-[rgba(33,28,20,0.88)] dark:text-[var(--ek-dark-gold)]">
            <Clock size={14} />
            Pending Verification
          </div>
        )}
      </div>

      {/* Image Section */}
      <div className="aspect-[4/3] relative overflow-hidden bg-[var(--ek-bg-card-soft)] dark:bg-[var(--ek-dark-elevated)]" onClick={() => {
        if (!item.verified) return;
        router.push(`/properties/${item.id}`);
      }}> 
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={`${process.env.NEXT_PUBLIC_BASE_URL}${mainImage}`}
          alt={item.title}
          className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-700"
        />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-4">
          <p className="text-white text-xs font-medium uppercase tracking-wider opacity-90">
            {item.category.name} • {item.type}
          </p>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5" >
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-bold text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)] text-lg truncate flex-1">
            {item.title}
          </h3>
        </div>

        <div className="flex items-center gap-1 text-[var(--ek-text-muted)] dark:text-[var(--ek-dark-muted)] text-sm mb-4">
          <MapPin size={14} className="text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]" />
          <span className="truncate">{item.tole}</span>
        </div>

        <div className="flex items-center justify-between pt-4 border-t border-[var(--ek-border-soft)] dark:border-[var(--ek-dark-border)]">
          <div>
            <p className="text-[10px] text-[var(--ek-text-muted)] dark:text-[var(--ek-dark-soft)] uppercase font-bold tracking-tighter">Price</p>
            <span className="text-xl font-black text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]">
              Rs. {item.price.toLocaleString()}
            </span>
          </div>

          <div className="flex gap-2">
            <button className="rounded-xl border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card-soft)] p-2.5 text-[var(--ek-text-secondary)] shadow-sm transition-colors hover:border-[var(--ek-border-strong)] hover:text-[var(--ek-gold-text)] dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-elevated)] dark:text-[var(--ek-dark-muted)] dark:hover:border-[var(--ek-dark-border-strong)] dark:hover:text-[var(--ek-dark-gold)]" onClick={(e) => {
              e.stopPropagation();
              router.push(`/user/edit-property/${item.id}`)
            }}>
              <Edit size={18} />
            </button>
            {/* <button className="p-2.5 text-secondary-600 dark:text-secondary-400 bg-secondary-50 dark:bg-secondary-800 hover:bg-red-500 hover:text-white rounded-xl transition-all border border-transparent shadow-sm" onClick={(e) => {
              e.stopPropagation();
            }}>
              <Trash2 size={18} />
            </button> */}
            <ListingDeleteButton id={item.id} isVerified = {item.verified} />
          </div>
        </div>
      </div>
    </div>
  );
}
