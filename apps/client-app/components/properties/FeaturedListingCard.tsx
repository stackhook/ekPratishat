

import Image from "next/image";
import { Bed, Bath, Maximize, MapPin, Crown, Sparkles } from "lucide-react";
import { PropertyListing } from "@repo/validators";
import { getCardArea } from "../../utils/cardAreaDisplay";


export default function PremiumListingCard({ listing }: { listing: PropertyListing }) {
  const formattedPrice = new Intl.NumberFormat('en-IN').format(Number(listing.price));
  const area = getCardArea(listing);

  // Premium features based on actual data
  const premiumFeatures = [
    listing.noOfBedRooms ? `${listing.noOfBedRooms} Beds` : null,
    listing.noOfRestRooms ? `${listing.noOfRestRooms} Baths` : null,
    area ?`${area.value} ${area.unit}`:null,
    "Verified Property"
  ].filter(Boolean);

  return (
    <div
      className="group relative w-full h-full"
    >
      {/* Main Card - Fixed height container */}
      <div className="relative flex h-full flex-col overflow-hidden rounded-2xl border bg-[var(--ek-bg-card)] shadow-[var(--ek-shadow-card)] transition duration-300 transform-gpu group-hover:-translate-y-0.5 group-hover:border-[var(--ek-border-strong)] group-hover:shadow-[0_22px_54px_rgba(15,23,42,0.13)] dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)] dark:shadow-[var(--ek-dark-shadow-card)] dark:group-hover:border-[var(--ek-dark-border-strong)]">

        {/* Premium Ribbon Banner - Pure CSS Ribbon */}
        {listing.isFeatured && (
          <div className="absolute top-0 right-0 z-20">
            <div className="relative">
              {/* Main ribbon */}
              <div className="relative rounded-bl-xl bg-gold-gradient px-4 py-2 text-[#151006] shadow-sm ring-1 ring-[var(--ek-border-soft)] backdrop-blur-sm dark:bg-none dark:bg-[rgba(42,36,27,0.86)] dark:text-[var(--ek-dark-gold)] dark:ring-[var(--ek-dark-border)]">

                <div className="flex items-center gap-2">
                  <Crown className="w-4 h-4" />
                  <span className="text-xs font-bold tracking-wider">PREMIUM</span>
                  <Sparkles className="w-3 h-3" />
                </div>
              </div>
            </div>
          </div>

        )}

        {/* Image Section - Fixed height */}
        <div className="relative h-56 w-full overflow-hidden flex-shrink-0">
          {/* Premium Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/42 via-transparent to-transparent z-10"></div>
          {listing.coverImage?.url || listing.images?.[0]?.url ? (
            <Image
              src={`${process.env.NEXT_PUBLIC_BASE_URL}${listing.coverImage?.url || listing.images?.[0]?.url
                }`}
              alt={listing.title}
              fill
              className="object-cover transition-transform duration-700 transform-gpu group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-[var(--ek-bg-card-soft)] dark:bg-[var(--ek-dark-elevated)]">
              <Crown className="w-16 h-16 text-gold-700/35 dark:text-gold-400/35" />
            </div>
          )}

          {/* Premium Price Badge */}
          <div className="absolute bottom-3 left-3 z-20">
            <div className="rounded-lg bg-[rgba(255,253,248,0.94)] px-4 py-1.5 text-[var(--ek-gold-text)] shadow-md ring-1 ring-[var(--ek-border-soft)] backdrop-blur-sm dark:bg-[rgba(33,28,20,0.88)] dark:text-[var(--ek-dark-gold)] dark:ring-[var(--ek-dark-border)]">
              <div className="text-xs font-semibold opacity-90">Price</div>
              <div className="text-lg font-bold">Rs. {formattedPrice}{listing.type === "rent" ? <span className="text-xs">/mo</span> : ""}</div>
            </div>
          </div>
        </div>

        {/* Info Section - Flexible content with consistent spacing */}
        <div className="p-5 flex-1 flex flex-col">
          {typeof listing.propertyCode === "number" && (
            <div className="mb-3 inline-flex w-fit items-center rounded-full border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ek-text-muted)] dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-elevated)] dark:text-[var(--ek-dark-soft)]">
              EP-{listing.propertyCode}
            </div>
          )}

          {/* Location */}
          <div className="flex items-center justify-between mb-2">
            <div className="flex min-w-0 items-center gap-1.5 text-[var(--ek-text-muted)] transition-colors dark:text-[var(--ek-dark-muted)]">
              <MapPin size={14} className="shrink-0 text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]" />
              <span className="text-xs font-semibold uppercase tracking-wider line-clamp-1">
                {listing.tole || "Premium Location"}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]" />
              <span className="text-[10px] font-semibold text-[var(--ek-text-muted)] uppercase tracking-wider dark:text-[var(--ek-dark-soft)]">{listing.category.name}</span>
            </div>
          </div>

          {/* Title */}
          <h3 className="mb-3 line-clamp-2 text-lg font-bold text-[var(--ek-text-primary)] transition-colors duration-300 dark:text-[var(--ek-dark-text)]">
            {listing.title}
          </h3>

          {/* Premium Features Chips */}
          <div className="flex flex-wrap gap-2 mb-4">
            {premiumFeatures.slice(0, 3).map((feature, idx) => (
              <div key={idx} className="flex items-center gap-1.5 rounded-full bg-[rgba(154,106,0,0.07)] px-2 py-1 text-xs text-[var(--ek-text-secondary)] dark:bg-[rgba(229,184,62,0.09)] dark:text-[var(--ek-dark-muted)]">
                <div className="w-1 h-1 rounded-full bg-[var(--ek-gold-text)] dark:bg-[var(--ek-dark-gold)]"></div>
                <span>{feature}</span>
              </div>
            ))}
          </div>

          {/* Features Row - Compact */}
          <div className="flex items-center justify-between pt-3 mt-auto border-t border-[var(--ek-border-soft)] dark:border-[var(--ek-dark-border)]">
            <div className="flex items-center gap-4">
              {listing.noOfBedRooms && (
                <div className="flex items-center gap-1.5">
                  <div className="rounded bg-[rgba(154,106,0,0.07)] p-1 dark:bg-[rgba(229,184,62,0.08)]">
                    <Bed size={14} className="text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--ek-text-secondary)] dark:text-[var(--ek-dark-muted)]">{listing.noOfBedRooms}</span>
                </div>
              )}

              {listing.noOfRestRooms && (
                <div className="flex items-center gap-1.5">
                  <div className="rounded bg-[rgba(154,106,0,0.07)] p-1 dark:bg-[rgba(229,184,62,0.08)]">
                    <Bath size={14} className="text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--ek-text-secondary)] dark:text-[var(--ek-dark-muted)]">{listing.noOfRestRooms}</span>
                </div>
              )}

              {area && (
                <div className="flex items-center gap-1.5">
                  <div className="rounded bg-[rgba(154,106,0,0.07)] p-1 dark:bg-[rgba(229,184,62,0.08)]">
                    <Maximize size={14} className="text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]" />
                  </div>
                  <span className="text-xs font-semibold text-[var(--ek-text-secondary)] dark:text-[var(--ek-dark-muted)]">{area.value} {area.unit}</span>
                </div>
              )}
            </div>

            {/* Type Badge */}
            <div className="rounded-full bg-[rgba(154,106,0,0.08)] px-2.5 py-1 dark:bg-[rgba(229,184,62,0.08)]">
              <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]">
                <Crown className="w-2.5 h-2.5" />
                {listing.type}
              </div>
            </div>
          </div>

          {/* Visual CTA. The parent card is already wrapped in a Link, so this must not be a button. */}
          <div className="group/btn mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-gold-gradient py-2.5 text-sm font-semibold text-[#151006] shadow-sm shadow-gold-800/15 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:bg-gold-gradient-hover">
            <span>View Details</span>
            <Sparkles className="w-3.5 h-3.5 group-hover/btn:rotate-12 transition-transform" />
          </div>
        </div>
      </div>

    </div>
  );
}
