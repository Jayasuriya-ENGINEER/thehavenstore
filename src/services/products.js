import {
  db,
  storage,
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "../firebase/config";

const PRODUCTS = "products";

function slugify(text) {
  return String(text || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

/**
 * Collection / drop tag shared by related products, e.g. "#7" or "july-drop".
 * Empty string means no group (no group-based suggestions).
 */
export function normalizeGroupName(value) {
  return String(value || "")
    .trim()
    .replace(/\s+/g, " ")
    .slice(0, 40);
}

/** Compare group names case-insensitively (supports "#7" / "#7 "). */
export function sameGroupName(a, b) {
  const left = normalizeGroupName(a).toLowerCase();
  const right = normalizeGroupName(b).toLowerCase();
  return Boolean(left && right && left === right);
}

/** Short unique suffix for product document ids. */
function uniqueIdSuffix() {
  return `${Date.now().toString(36).slice(-5)}${Math.random()
    .toString(36)
    .slice(2, 5)}`;
}

/** Normalize admin-defined option groups, e.g. Flavour → Sandal, Divine */
export function normalizeCustomOptions(raw) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((field) => {
      const name = String(field?.name || "").trim();
      const values = Array.isArray(field?.values)
        ? field.values.map((v) => String(v || "").trim()).filter(Boolean)
        : [];
      return { name, values };
    })
    .filter((f) => f.name && f.values.length > 0);
}

export function normalizeProduct(id, data = {}) {
  const stock = Number(data.stock ?? data.amount ?? 0);
  const inStock =
    data.inStock !== undefined ? data.inStock !== false : stock > 0;

  // null = use default store shipping; number (incl. 0) = admin-set charge
  const hasCustomDelivery =
    data.deliveryCharge !== undefined &&
    data.deliveryCharge !== null &&
    data.deliveryCharge !== "";
  const deliveryCharge = hasCustomDelivery
    ? Math.max(0, Number(data.deliveryCharge) || 0)
    : null;

  return {
    id,
    name: data.name || "",
    category: data.category || "T-Shirts",
    gender: data.gender || "men",
    // Shared collection tag — used for "suggested products" on product pages
    groupName: normalizeGroupName(data.groupName),
    price: Number(data.price) || 0,
    originalPrice: Number(data.originalPrice) || Number(data.price) || 0,
    stock: Number.isFinite(stock) ? stock : 0,
    amount: Number.isFinite(stock) ? stock : 0, // alias for admin UI
 //   rating: Number(data.rating) || 0, removed the rating field because it was not needed as per the new design.
  //  reviews: Number(data.reviews) || 0, also the reviews field was removed because it was not needed as per the new design.
    badge: data.badge || null,
    colors: Array.isArray(data.colors) ? data.colors : [],
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
    customOptions: normalizeCustomOptions(data.customOptions),
    deliveryCharge,
    images: Array.isArray(data.images) ? data.images : [],
    imagePaths: Array.isArray(data.imagePaths) ? data.imagePaths : [],
    shortDesc: data.shortDesc || "",
    description: data.description || "",
    details: Array.isArray(data.details) ? data.details : [],
    inStock,
    active: data.active !== false,
    createdAt: data.createdAt || null,
    updatedAt: data.updatedAt || null,
  };
}

/**
 * Section filters:
 * - men / women: exact gender match + unisex (shows on both)
 * - accessories / other: exact gender match only
 */
export function productMatchesSection(productGender, section) {
  if (!section) return true;
  const g = (productGender || "men").toLowerCase();
  const s = section.toLowerCase();
  if (s === "men") return g === "men" || g === "unisex";
  if (s === "women") return g === "women" || g === "unisex";
  return g === s;
}

function sortByCreatedDesc(list) {
  return [...list].sort((a, b) => {
    const ta = a.createdAt?.seconds || a.createdAt || 0;
    const tb = b.createdAt?.seconds || b.createdAt || 0;
    return tb - ta;
  });
}

/**
 * Load products for storefront or admin.
 *
 * Security rules only allow public list when every matched doc is active
 * (or the user is admin). So public queries MUST include active == true.
 *
 * Accessories previously queried gender + active + orderBy (needs a composite
 * index). When that failed, the fallback did an unfiltered collection read —
 * which succeeds for admin but fails for guests. Result: accessories showed
 * only while logged in as admin. We now always use active-safe queries and
 * filter section/gender client-side (same path as men/women + unisex).
 */
export async function fetchProducts({ gender, activeOnly = true } = {}) {
  const col = collection(db, PRODUCTS);

  const applyFilters = (list) => {
    let next = list;
    if (gender) {
      next = next.filter((p) => productMatchesSection(p.gender, gender));
    }
    if (activeOnly) {
      next = next.filter((p) => p.active);
    }
    return sortByCreatedDesc(next);
  };

  try {
    // Public: constrain by active so list queries match firestore.rules.
    // Admin (activeOnly=false): may list all products.
    const q = activeOnly
      ? query(col, where("active", "==", true), orderBy("createdAt", "desc"))
      : query(col, orderBy("createdAt", "desc"));

    const snap = await getDocs(q);
    const list = snap.docs.map((d) => normalizeProduct(d.id, d.data()));
    return applyFilters(list);
  } catch (err) {
    // Missing index / orderBy issues — retry without orderBy, still rule-safe.
    console.warn("Products query fallback:", err?.message);
    try {
      const q = activeOnly
        ? query(col, where("active", "==", true))
        : col;
      const snap = await getDocs(q);
      const list = snap.docs.map((d) => normalizeProduct(d.id, d.data()));
      return applyFilters(list);
    } catch (fallbackErr) {
      console.error("Products fetch failed:", fallbackErr?.message);
      throw fallbackErr;
    }
  }
}

export async function fetchProductById(id) {
  if (!id) return null;
  const snap = await getDoc(doc(db, PRODUCTS, id));
  if (!snap.exists()) return null;
  return normalizeProduct(snap.id, snap.data());
}

export async function uploadProductImage(file, productKey = "general") {
  if (!file) throw new Error("No file provided");
  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
  const path = `products/${productKey}/${Date.now()}_${safeName}`;
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  const url = await getDownloadURL(storageRef);
  return { url, path };
}

export async function deleteStoragePath(path) {
  if (!path) return;
  try {
    await deleteObject(ref(storage, path));
  } catch (e) {
    // Ignore missing files
    console.warn("Storage delete skipped:", e?.message);
  }
}

function buildPayload(form, { isNew = false } = {}) {
  const stock = Number(form.stock ?? form.amount ?? 0);
  const safeStock = Number.isFinite(stock) && stock >= 0 ? stock : 0;
  const inStock =
    form.inStock !== undefined ? form.inStock !== false : safeStock > 0;

  const isAccessories = (form.gender || "").toLowerCase() === "accessories";
  const customOptions = isAccessories
    ? normalizeCustomOptions(form.customOptions)
    : [];
  // Accessories: admin-set delivery (default 0 if left blank). Apparel: null → store default.
  let deliveryCharge = null;
  if (isAccessories) {
    const raw = form.deliveryCharge;
    deliveryCharge =
      raw === "" || raw === undefined || raw === null
        ? 0
        : Math.max(0, Number(raw) || 0);
  }

  return {
    name: form.name.trim(),
    category: form.category.trim() || "T-Shirts",
    gender: form.gender || "men",
    groupName: normalizeGroupName(form.groupName),
    price: Number(form.price) || 0,
    originalPrice: Number(form.originalPrice) || Number(form.price) || 0,
    stock: safeStock,
    amount: safeStock,
    rating: Number(form.rating) || 0,
    reviews: Number(form.reviews) || 0,
    badge: form.badge?.trim() || null,
    colors: form.colors || [],
    // Accessories use customOptions instead of clothing sizes
    sizes: isAccessories ? [] : form.sizes || [],
    customOptions,
    deliveryCharge,
    images: form.images || [],
    imagePaths: form.imagePaths || [],
    shortDesc: form.shortDesc?.trim() || "",
    description: form.description?.trim() || "",
    details: (form.details || []).filter(Boolean),
    inStock,
    active: form.active !== false,
    updatedAt: serverTimestamp(),
    ...(isNew ? { createdAt: serverTimestamp() } : {}),
  };
}

/**
 * Create a product with a unique document id (used in URLs and banner links).
 * Prefer optional custom slug; otherwise slug from name; always resolve collisions.
 */
export async function createProduct(form) {
  const payload = buildPayload(form, { isNew: true });
  const preferred =
    slugify(form.id?.trim()) ||
    slugify(form.name) ||
    `product-${uniqueIdSuffix()}`;

  let id = preferred;
  let existing = await getDoc(doc(db, PRODUCTS, id));
  if (existing.exists()) {
    id = `${preferred}-${uniqueIdSuffix()}`;
    existing = await getDoc(doc(db, PRODUCTS, id));
  }

  if (existing.exists()) {
    // Extremely rare race — let Firestore assign an auto id
    const refDoc = await addDoc(collection(db, PRODUCTS), payload);
    return normalizeProduct(refDoc.id, {
      ...payload,
      createdAt: new Date().toISOString(),
    });
  }

  await setDoc(doc(db, PRODUCTS, id), payload);
  return normalizeProduct(id, {
    ...payload,
    createdAt: new Date().toISOString(),
  });
}

export async function updateProduct(id, form) {
  const payload = buildPayload(form, { isNew: false });
  await updateDoc(doc(db, PRODUCTS, id), payload);
  return normalizeProduct(id, payload);
}

export async function deleteProduct(product) {
  const id = typeof product === "string" ? product : product?.id;
  if (!id) throw new Error("Missing product id");

  const paths =
    typeof product === "object" && Array.isArray(product.imagePaths)
      ? product.imagePaths
      : [];

  for (const path of paths) {
    await deleteStoragePath(path);
  }

  await deleteDoc(doc(db, PRODUCTS, id));
}

export { slugify };
