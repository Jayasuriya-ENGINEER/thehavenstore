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

export function normalizeProduct(id, data = {}) {
  const stock = Number(data.stock ?? data.amount ?? 0);
  const inStock =
    data.inStock !== undefined ? data.inStock !== false : stock > 0;

  return {
    id,
    name: data.name || "",
    category: data.category || "T-Shirts",
    gender: data.gender || "men",
    price: Number(data.price) || 0,
    originalPrice: Number(data.originalPrice) || Number(data.price) || 0,
    stock: Number.isFinite(stock) ? stock : 0,
    amount: Number.isFinite(stock) ? stock : 0, // alias for admin UI
    rating: Number(data.rating) || 0,
    reviews: Number(data.reviews) || 0,
    badge: data.badge || null,
    colors: Array.isArray(data.colors) ? data.colors : [],
    sizes: Array.isArray(data.sizes) ? data.sizes : [],
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

export async function fetchProducts({ gender, activeOnly = true } = {}) {
  const col = collection(db, PRODUCTS);
  const includeUnisex = gender === "men" || gender === "women";

  try {
    // Unisex must appear on both men & women — fetch active (or all) then filter
    if (includeUnisex) {
      let q = activeOnly
        ? query(col, where("active", "==", true), orderBy("createdAt", "desc"))
        : query(col, orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      let list = snap.docs.map((d) => normalizeProduct(d.id, d.data()));
      list = list.filter((p) => productMatchesSection(p.gender, gender));
      return sortByCreatedDesc(list);
    }

    let q = col;
    if (gender && activeOnly) {
      q = query(
        col,
        where("gender", "==", gender),
        where("active", "==", true),
        orderBy("createdAt", "desc"),
      );
    } else if (gender) {
      q = query(col, where("gender", "==", gender), orderBy("createdAt", "desc"));
    } else if (activeOnly) {
      q = query(col, where("active", "==", true), orderBy("createdAt", "desc"));
    } else {
      q = query(col, orderBy("createdAt", "desc"));
    }

    const snap = await getDocs(q);
    return snap.docs.map((d) => normalizeProduct(d.id, d.data()));
  } catch (err) {
    // Fallback if composite index missing — fetch all and filter client-side
    console.warn("Products query fallback:", err?.message);
    const snap = await getDocs(collection(db, PRODUCTS));
    let list = snap.docs.map((d) => normalizeProduct(d.id, d.data()));
    if (gender) list = list.filter((p) => productMatchesSection(p.gender, gender));
    if (activeOnly) list = list.filter((p) => p.active);
    return sortByCreatedDesc(list);
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

  return {
    name: form.name.trim(),
    category: form.category.trim() || "T-Shirts",
    gender: form.gender || "men",
    price: Number(form.price) || 0,
    originalPrice: Number(form.originalPrice) || Number(form.price) || 0,
    stock: safeStock,
    amount: safeStock,
    rating: Number(form.rating) || 0,
    reviews: Number(form.reviews) || 0,
    badge: form.badge?.trim() || null,
    colors: form.colors || [],
    sizes: form.sizes || [],
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

export async function createProduct(form) {
  const baseSlug = slugify(form.name) || `product-${Date.now()}`;
  const id = form.id?.trim() ? slugify(form.id) : baseSlug;
  const payload = buildPayload(form, { isNew: true });

  // Prefer readable id; fall back to auto-id if conflict
  const existing = await getDoc(doc(db, PRODUCTS, id));
  if (existing.exists()) {
    const refDoc = await addDoc(collection(db, PRODUCTS), payload);
    return normalizeProduct(refDoc.id, { ...payload, createdAt: new Date().toISOString() });
  }

  await setDoc(doc(db, PRODUCTS, id), payload);
  return normalizeProduct(id, { ...payload, createdAt: new Date().toISOString() });
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
