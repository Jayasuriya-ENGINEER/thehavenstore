import {
  db,
  storage,
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "../firebase/config";

const COLLECTION = "sectionBanners";
const POPUP_REF = "siteContent";
const POPUP_ID = "homePopup";
const HOME_COLLECTIONS_ID = "homeCollections";

/** Valid shop section keys for banners */
export const BANNER_SECTIONS = [
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
  { key: "accessories", label: "Accessories" },
];

export function isValidBannerSection(section) {
  return BANNER_SECTIONS.some((s) => s.key === section);
}

/** Clean product id used on banner click-through (document id / URL slug). */
export function normalizeBannerProductId(value) {
  return String(value || "")
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-_]/g, "")
    .slice(0, 80);
}

/**
 * Normalize banner document from Firestore.
 * @returns {{ section: string, images: Array<{id: string, url: string, path: string, productId: string}>, updatedAt: * }}
 */
export function normalizeBanners(section, data = {}) {
  const images = Array.isArray(data.images)
    ? data.images
        .filter((img) => img && img.url)
        .map((img, index) => ({
          id: img.id || `banner-${index}`,
          url: img.url,
          path: img.path || "",
          // Optional: when set, storefront click opens this product
          productId: normalizeBannerProductId(img.productId),
        }))
    : [];

  return {
    section,
    images,
    updatedAt: data.updatedAt || null,
  };
}

/**
 * Fetch banners for a section (men | women | accessories).
 * Public read — used on shop pages.
 */
export async function fetchSectionBanners(section) {
  if (!isValidBannerSection(section)) {
    return normalizeBanners(section, {});
  }

  try {
    const snap = await getDoc(doc(db, COLLECTION, section));
    if (!snap.exists()) return normalizeBanners(section, {});
    return normalizeBanners(section, snap.data());
  } catch (err) {
    console.warn("Banners fetch failed:", err?.message);
    return normalizeBanners(section, {});
  }
}

/**
 * Fetch banners for all three sections (admin dashboard).
 */
export async function fetchAllSectionBanners() {
  const results = {};
  await Promise.all(
    BANNER_SECTIONS.map(async ({ key }) => {
      results[key] = await fetchSectionBanners(key);
    }),
  );
  return results;
}

/** Public home-page promotion. One active image links to the Men's section. */
export async function fetchHomePopupBanner() {
  try {
    const snap = await getDoc(doc(db, POPUP_REF, POPUP_ID));
    if (!snap.exists() || !snap.data()?.url) return null;
    return { url: snap.data().url, path: snap.data().path || "" };
  } catch (err) {
    console.warn("Home popup fetch failed:", err?.message);
    return null;
  }
}

export async function replaceHomePopupBanner(file) {
  if (!file?.type?.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }

  const previous = await fetchHomePopupBanner();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `site-banners/home-popup/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);

  await setDoc(doc(db, POPUP_REF, POPUP_ID), {
    url,
    path,
    updatedAt: serverTimestamp(),
  });

  if (previous?.path) await deleteStoragePath(previous.path);
  return { url, path };
}

export async function removeHomePopupBanner() {
  const current = await fetchHomePopupBanner();
  await deleteDoc(doc(db, POPUP_REF, POPUP_ID));
  if (current?.path) await deleteStoragePath(current.path);
}
/** Images used by the three category cards on the home page. */
export async function fetchHomeCollections() {
  try {
    const snap = await getDoc(doc(db, POPUP_REF, HOME_COLLECTIONS_ID));
    const data = snap.exists() ? snap.data() : {};
    return BANNER_SECTIONS.reduce((collections, { key }) => {
      const image = data[key];
      collections[key] = image?.url ? { url: image.url, path: image.path || "" } : null;
      return collections;
    }, {});
  } catch (err) {
    console.warn("Home collections fetch failed:", err?.message);
    return {};
  }
}

export async function replaceHomeCollectionImage(section, file) {
  if (!isValidBannerSection(section)) throw new Error("Invalid collection section");
  if (!file?.type?.startsWith("image/")) throw new Error("Please choose an image file");
  const current = await fetchHomeCollections();
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `site-banners/home-collections/${section}_${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  await setDoc(doc(db, POPUP_REF, HOME_COLLECTIONS_ID), { [section]: { url, path }, updatedAt: serverTimestamp() }, { merge: true });
  if (current[section]?.path) await deleteStoragePath(current[section].path);
  return { url, path };
}

/**
 * Upload a banner image to Firebase Storage.
 * @returns {{ url: string, path: string, id: string }}
 */
export async function uploadBannerImage(file, section) {
  if (!file) throw new Error("No file provided");
  if (!isValidBannerSection(section)) {
    throw new Error("Invalid banner section");
  }
  if (!file.type?.startsWith("image/")) {
    throw new Error("Please choose an image file");
  }

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const id = `b${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const path = `banners/${section}/${id}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { id, url, path };
}

async function deleteStoragePath(path) {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch (e) {
    console.warn("Banner storage delete skipped:", e?.message);
  }
}

/**
 * Save the full image list for a section (order preserved).
 * Does not delete storage files — call removeBannerImage for that.
 * Each image may include productId for click-through to a product page.
 */
export async function saveSectionBanners(section, images) {
  if (!isValidBannerSection(section)) {
    throw new Error("Invalid banner section");
  }

  const clean = (Array.isArray(images) ? images : [])
    .filter((img) => img && img.url)
    .map((img, index) => {
      const productId = normalizeBannerProductId(img.productId);
      const entry = {
        id: img.id || `banner-${index}`,
        url: img.url,
        path: img.path || "",
      };
      // Only store when set — keeps older banner docs tidy
      if (productId) entry.productId = productId;
      return entry;
    });

  await setDoc(
    doc(db, COLLECTION, section),
    {
      images: clean,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );

  return normalizeBanners(section, { images: clean });
}

/**
 * Set or clear the product link on one banner slide.
 */
export async function updateBannerProductLink(section, imageId, productId) {
  if (!isValidBannerSection(section) || !imageId) {
    throw new Error("Missing section or banner id");
  }

  const current = await fetchSectionBanners(section);
  const next = current.images.map((img) =>
    img.id === imageId
      ? { ...img, productId: normalizeBannerProductId(productId) }
      : img,
  );

  if (!current.images.some((img) => img.id === imageId)) {
    throw new Error("Banner not found");
  }

  return saveSectionBanners(section, next);
}

/**
 * Remove one banner image from a section (Firestore + Storage).
 */
export async function removeBannerImage(section, imageId) {
  if (!isValidBannerSection(section) || !imageId) {
    throw new Error("Missing section or image id");
  }

  const current = await fetchSectionBanners(section);
  const target = current.images.find((img) => img.id === imageId);
  const next = current.images.filter((img) => img.id !== imageId);

  await saveSectionBanners(section, next);
  if (target?.path) {
    await deleteStoragePath(target.path);
  }

  return normalizeBanners(section, { images: next });
}

/**
 * Append newly uploaded images to a section and persist.
 * @param {string} [productId] — optional product document id for click-through
 *   (applied to every file in this upload batch).
 */
export async function addBannerImages(section, files, productId = "") {
  const fileList = Array.from(files || []).filter((f) =>
    f.type?.startsWith("image/"),
  );
  if (!fileList.length) {
    throw new Error("Please choose image files only.");
  }

  const linkId = normalizeBannerProductId(productId);
  const uploaded = [];
  for (const file of fileList) {
    const item = await uploadBannerImage(file, section);
    if (linkId) item.productId = linkId;
    uploaded.push(item);
  }

  const current = await fetchSectionBanners(section);
  const next = [...current.images, ...uploaded];
  return saveSectionBanners(section, next);
}
