import {
  collection,
  db,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  serverTimestamp,
  setDoc,
} from "../firebase/config";

const PROMO_CODES = "promoCodes";

export function normalizePromoCode(value) {
  return String(value || "")
    .trim()
    .toUpperCase()
    .replace(/\s+/g, "")
    .replace(/[^A-Z0-9_-]/g, "")
    .slice(0, 30);
}

function normalizePromoCodeData(id, data = {}) {
  const expiresAt = data.expiresAt?.toDate?.() || data.expiresAt || null;
  return {
    id,
    code: normalizePromoCode(data.code || id),
    discountType: data.discountType === "amount" ? "amount" : "percent",
    discountValue: Math.max(0, Number(data.discountValue) || 0),
    expiresAt,
    active: data.active !== false,
    createdAt: data.createdAt?.toDate?.() || data.createdAt || null,
  };
}

export function isPromoCodeActive(promo) {
  return Boolean(
    promo?.active &&
      promo?.code &&
      promo?.expiresAt &&
      new Date(promo.expiresAt).getTime() >= Date.now(),
  );
}

export function calculatePromoDiscount(subtotal, promo) {
  if (!isPromoCodeActive(promo)) return 0;
  const base = Math.max(0, Number(subtotal) || 0);
  const raw =
    promo.discountType === "percent"
      ? (base * Math.min(100, promo.discountValue)) / 100
      : promo.discountValue;
  return Math.min(base, Math.max(0, Math.round(raw * 100) / 100));
}

export async function fetchPromoCode(code) {
  const normalized = normalizePromoCode(code);
  if (!normalized) return null;
  const snap = await getDoc(doc(db, PROMO_CODES, normalized));
  if (!snap.exists()) return null;
  const promo = normalizePromoCodeData(snap.id, snap.data());
  return isPromoCodeActive(promo) ? promo : null;
}

export async function fetchPromoCodes() {
  const snap = await getDocs(collection(db, PROMO_CODES));
  return snap.docs
    .map((item) => normalizePromoCodeData(item.id, item.data()))
    .sort((a, b) => new Date(a.expiresAt) - new Date(b.expiresAt));
}

export async function savePromoCode({ code, discountType, discountValue, expiresAt }) {
  const normalized = normalizePromoCode(code);
  const value = Number(discountValue);
  const expiry = new Date(`${expiresAt}T23:59:59.999`);

  if (!/^[A-Z0-9_-]{3,30}$/.test(normalized)) {
    throw new Error("Use 3–30 letters, numbers, hyphens, or underscores for the code.");
  }
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error("Enter a discount value greater than zero.");
  }
  if (discountType === "percent" && value > 100) {
    throw new Error("Percentage discounts cannot exceed 100%.");
  }
  if (Number.isNaN(expiry.getTime()) || expiry.getTime() < Date.now()) {
    throw new Error("Choose an expiry date in the future.");
  }

  const ref = doc(db, PROMO_CODES, normalized);
  const existing = await getDoc(ref);
  await setDoc(
    ref,
    {
      code: normalized,
      discountType: discountType === "amount" ? "amount" : "percent",
      discountValue: value,
      expiresAt: expiry,
      active: true,
      updatedAt: serverTimestamp(),
      ...(existing.exists() ? {} : { createdAt: serverTimestamp() }),
    },
    { merge: true },
  );
}

export async function deletePromoCode(code) {
  const normalized = normalizePromoCode(code);
  if (!normalized) return;
  await deleteDoc(doc(db, PROMO_CODES, normalized));
}
