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

/** Valid shop section keys for banners */
export const BANNER_SECTIONS = [
  { key: "men", label: "Men" },
  { key: "women", label: "Women" },
  { key: "accessories", label: "Accessories" },
];

export function isValidBannerSection(section) {
  return BANNER_SECTIONS.some((s) => s.key === section);
}

/**
 * Normalize banner document from Firestore.
 * @returns {{ section: string, images: Array<{id: string, url: string, path: string}>, updatedAt: * }}
 */
export function normalizeBanners(section, data = {}) {
  const images = Array.isArray(data.images)
    ? data.images
        .filter((img) => img && img.url)
        .map((img, index) => ({
          id: img.id || `banner-${index}`,
          url: img.url,
          path: img.path || "",
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
 */
export async function saveSectionBanners(section, images) {
  if (!isValidBannerSection(section)) {
    throw new Error("Invalid banner section");
  }

  const clean = (Array.isArray(images) ? images : [])
    .filter((img) => img && img.url)
    .map((img, index) => ({
      id: img.id || `banner-${index}`,
      url: img.url,
      path: img.path || "",
    }));

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
 */
export async function addBannerImages(section, files) {
  const fileList = Array.from(files || []).filter((f) =>
    f.type?.startsWith("image/"),
  );
  if (!fileList.length) {
    throw new Error("Please choose image files only.");
  }

  const uploaded = [];
  for (const file of fileList) {
    uploaded.push(await uploadBannerImage(file, section));
  }

  const current = await fetchSectionBanners(section);
  const next = [...current.images, ...uploaded];
  return saveSectionBanners(section, next);
}
