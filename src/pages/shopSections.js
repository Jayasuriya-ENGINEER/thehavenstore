/**
 * Shared shop section config for Men / Women / Accessories pages.
 * gender is the Firebase `gender` field filter (unisex is included for men & women).
 */
export const SHOP_SECTIONS = {
  men: {
    key: "men",
    path: "/men",
    gender: "men",
    breadcrumb: "Men",
    title: "Men's Collection",
    description:
      "Everyday essentials and elevated basics — tees, polos, hoodies and more, designed for comfort and clean style.",
    emptyHint: "Add products with gender Men or Unisex in the admin panel.",
  },
  women: {
    key: "women",
    path: "/women",
    gender: "women",
    breadcrumb: "Women",
    title: "Women's Collection",
    description:
      "Soft silhouettes and everyday staples — tops, tees, layers and more, made for comfort with a refined finish.",
    emptyHint: "Add products with gender Women or Unisex in the admin panel.",
  },
  accessories: {
    key: "accessories",
    path: "/accessories",
    gender: "accessories",
    breadcrumb: "Accessories",
    title: "Accessories",
    description:
      "Bags, caps, and finishing pieces — small details that complete the look.",
    emptyHint: "Add products with gender Accessories in the admin panel.",
  },
};

/** Resolve shop section from product gender (for detail breadcrumbs / related links). */
export function sectionFromGender(gender) {
  const g = (gender || "men").toLowerCase();
  if (g === "women") return SHOP_SECTIONS.women;
  if (g === "accessories") return SHOP_SECTIONS.accessories;
  // men + unisex default to men section URLs when no path context
  return SHOP_SECTIONS.men;
}

/** Prefer current URL section when browsing a collection; fall back by product gender. */
export function sectionFromPathname(pathname) {
  if (!pathname) return null;
  if (pathname.startsWith("/women")) return SHOP_SECTIONS.women;
  if (pathname.startsWith("/accessories")) return SHOP_SECTIONS.accessories;
  if (pathname.startsWith("/men")) return SHOP_SECTIONS.men;
  return null;
}
