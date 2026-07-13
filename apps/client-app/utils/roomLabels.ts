
// Only labels that VARY by category live here. Fixed labels stay in their components.
const COMMERCIAL_CATEGORIES = new Set(["commercial space"]);

export function getRoomLabels(categoryName?: string) {
  const commercial = categoryName
    ? COMMERCIAL_CATEGORIES.has(categoryName.trim().toLowerCase())
    : false;
  return {
    bedrooms: commercial ? "Rooms" : "Bedrooms",
    restrooms: commercial ? "Washrooms" : "Bathrooms",
  };
}
