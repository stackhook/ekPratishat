/**
 * PropertyListingSection — server component that renders a homepage-style
 * "section header + 6-card grid + View All CTA" block driven by a
 * properties query filter. Both `HomePageFeaturedProperties` and
 * `RecentListings` are now thin wrappers around this, parameterized by
 * (eyebrow, title, accent, filters, ctaHref).
 *
 * Capped at 6 items because both original consumers used
 * `.slice(0, 6)`. If a future consumer needs a different cap, lift
 * `limit` into a prop. Until then, keep the hardcoded value to avoid
 * speculative configuration.
 *
 * `enableContentVisibility` switches on the `[content-visibility:auto]
 * [contain-intrinsic-size:1px_1100px]` render-skipping hint. Only the
 * Featured variant ships with it today (matching the original).
 * Tailwind needs the exact class string at build time, so we toggle
 * between two literal className strings rather than interpolating.
 */

import Link from "next/link";
import type { PropertyListing } from "@repo/validators";
import { getPropertiesQuery } from "../../data/properties";
import FeaturedListingCard from "./FeaturedListingCard";
import SectionHeader from "../SectionHeader";

type PropertyListingSectionProps = {
  eyebrow: string;
  title: string;
  accent: string;
  filters: Parameters<typeof getPropertiesQuery>[0];
  ctaHref: string;
  ctaLabel?: string;
  enableContentVisibility?: boolean;
};

const SECTION_CLASS_BASE =
  "bg-[var(--ek-bg-section)] py-16 transition-colors duration-200 dark:bg-[var(--ek-dark-section)] md:py-24";
const SECTION_CLASS_WITH_CV =
  "bg-[var(--ek-bg-section)] py-16 transition-colors duration-200 [content-visibility:auto] [contain-intrinsic-size:1px_1100px] dark:bg-[var(--ek-dark-section)] md:py-24";

export async function PropertyListingSection({
  eyebrow,
  title,
  accent,
  filters,
  ctaHref,
  ctaLabel = "View All Properties",
  enableContentVisibility = false,
}: PropertyListingSectionProps) {
  const response = await getPropertiesQuery(filters);
  if (response.items.length === 0) return null;

  const listings = response.items.slice(0, 6);


  return (
    <section
      className={
        enableContentVisibility ? SECTION_CLASS_WITH_CV : SECTION_CLASS_BASE
      }
    >
      <div className="max-w-[1500px] mx-auto px-6">
        <SectionHeader
          eyebrow={eyebrow}
          title={title}
          accent={accent}
          variant="md"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {listings.map((item: PropertyListing) => (
            <Link
              key={item.id}
              href={`/properties/${item.id}`}
              className="block transition-transform duration-300 hover:-translate-y-1"
            >
              <FeaturedListingCard listing={item} />
            </Link>
          ))}
        </div>

        <div className="mt-16 text-center">
          <Link
            href={ctaHref}
            className="ek-secondary-button group gap-3 rounded-full px-10 py-4"
          >
            {ctaLabel}
            <span className="text-[var(--ek-gold-text)] transition-transform duration-300 group-hover:translate-x-1 dark:text-[var(--ek-dark-gold)]">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
