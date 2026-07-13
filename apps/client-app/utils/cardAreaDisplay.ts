// Which area a property card should headline, and its true unit.
// Land + House sell on land size (sq.mtr); every other category is a
// structure sold on floor size (sq.ft).

const LAND_AREA_CATEGORIES = new Set(["land", "house"]);

export function getCardArea(listing: {
  category?: { name: string };
  landArea?: string | null;
  floorArea?: string | null;
}): { value: string; unit: string } | null {
  const name = listing.category?.name?.trim().toLowerCase();
  const showsLand = name ? LAND_AREA_CATEGORIES.has(name) : false;

  if (showsLand) {
    return listing.landArea ? { value: listing.landArea, unit: "sq.mtr" } : null;
  }
  return listing.floorArea ? { value: listing.floorArea, unit: "sq.ft" } : null;
}
