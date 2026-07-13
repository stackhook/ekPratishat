import Image from "next/image";
import { Bed, Bath, Maximize, MapPin, Crown } from "lucide-react";
import { PropertyListing } from "@repo/validators";
import { getCardArea } from "../../utils/cardAreaDisplay";

export default function ListingCard({ listing }: {listing:PropertyListing}) {
  // Use the Inland formatting logic for these large numbers
  const formattedPrice = new Intl.NumberFormat('en-IN').format(Number(listing.price));
  const area = getCardArea(listing);

  return (
    <div className="group relative w-full overflow-hidden rounded-2xl border bg-[var(--ek-bg-card)] shadow-[var(--ek-shadow-card)] antialiased transition duration-300 transform-gpu hover:-translate-y-0.5 hover:border-[var(--ek-border-strong)] hover:shadow-[0_22px_54px_rgba(15,23,42,0.13)] dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-surface)] dark:shadow-[var(--ek-dark-shadow-card)] dark:hover:border-[var(--ek-dark-border-strong)]">
      {/* Image Section */}
      <div className="relative h-64 w-full overflow-hidden">
        {listing.images?.[0]?.url ? (
          <Image
            src={`${process.env.NEXT_PUBLIC_BASE_URL}${listing.images[0].url}`}
            alt={listing.title}
            fill
            className="object-cover transition-transform duration-500 transform-gpu group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-[var(--ek-bg-card-soft)] text-sm text-[var(--ek-text-muted)] dark:bg-[var(--ek-dark-elevated)] dark:text-[var(--ek-dark-soft)]">No Image</div>
        )}

        {/* Price badge */}
        <div className="absolute left-4 top-4 rounded-full bg-[rgba(255,253,248,0.94)] px-4 py-1.5 text-sm font-bold text-[var(--ek-gold-text)] shadow-md ring-1 ring-[var(--ek-border-soft)] backdrop-blur-sm dark:bg-[rgba(33,28,20,0.88)] dark:text-[var(--ek-dark-gold)] dark:ring-[var(--ek-dark-border)]">
          Rs. {formattedPrice} {listing.type === "rent" ? "/mo" : ""}
        </div>

        {/* Premium crown — only for featured listings (same gold styling as PremiumListingCard) */}
        {listing.isFeatured && (
          <div className="absolute top-0 right-0 z-20">
                        <div className="relative rounded-bl-xl bg-gold-gradient px-2.5 py-2 text-[#151006] shadow-sm ring-1 ring-[var(--ek-border-soft)] backdrop-blur-sm dark:bg-none dark:bg-[rgba(42,36,27,0.86)] dark:text-[var(--ek-dark-gold)] dark:ring-[var(--ek-dark-border)]">

              <Crown className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="p-5">
        {typeof listing.propertyCode === "number" && (
          <div className="mb-3 inline-flex w-fit items-center rounded-full border border-[var(--ek-border-soft)] bg-[var(--ek-bg-card-soft)] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--ek-text-muted)] dark:border-[var(--ek-dark-border)] dark:bg-[var(--ek-dark-elevated)] dark:text-[var(--ek-dark-soft)]">
            EP-{listing.propertyCode}
          </div>
        )}

        <div className="mb-1 flex items-center gap-1 text-[var(--ek-text-muted)] dark:text-[var(--ek-dark-muted)]">
          <MapPin size={14} className="text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]" />
          <span className="text-xs font-semibold uppercase tracking-wider">{listing.tole}</span>
        </div>

        <h3 className="mb-4 line-clamp-1 text-xl font-bold text-[var(--ek-text-primary)] dark:text-[var(--ek-dark-text)]">
          {listing.title}
        </h3>

        {/* Features Row */}
        <div className="flex items-center justify-between border-t border-[var(--ek-border-soft)] pt-4 dark:border-[var(--ek-dark-border)]">
          <div className="flex items-center gap-4 text-[var(--ek-text-secondary)] dark:text-[var(--ek-dark-muted)]">
            {listing.noOfBedRooms && (
              <div className="flex items-center gap-1.5">
                <Bed size={16} className="text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]" />
                <span className="text-sm font-medium">{listing.noOfBedRooms}</span>
              </div>
            )}
            {listing.noOfRestRooms && (
              <div className="flex items-center gap-1.5">
                <Bath size={16} className="text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]" />
                <span className="text-sm font-medium">{listing.noOfRestRooms}</span>
              </div>
            )}
            {area && (
              <div className="flex items-center gap-1.5">
                <Maximize size={16} className="text-[var(--ek-gold-text)] dark:text-[var(--ek-dark-gold)]" />
                <span className="text-sm font-medium">{area.value} {area.unit}</span>
              </div>
            )}
          </div>

          <div className="text-xs font-bold uppercase text-[var(--ek-text-muted)] dark:text-[var(--ek-dark-soft)]">
            {listing.type}
          </div>
        </div>
      </div>
    </div>
  );
}
