import { db, doc, getDoc, updateDoc } from "../firebase/config";

function newAddressId() {
  return `addr_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

export function emptyAddress(overrides = {}) {
  return {
    id: "",
    fullName: "",
    phone: "",
    email: "",
    line1: "",
    line2: "",
    landmark: "",
    city: "",
    state: "",
    pincode: "",
    country: "India",
    label: "Home",
    isDefault: true,
    ...overrides,
  };
}

export function validateAddress(address) {
  const errors = {};
  const a = address || {};

  if (!String(a.fullName || "").trim()) errors.fullName = "Full name is required";
  if (!/^[6-9]\d{9}$/.test(String(a.phone || "").trim())) {
    errors.phone = "Enter a valid 10-digit mobile number";
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(a.email || "").trim())) {
    errors.email = "Enter a valid email";
  }
  if (!String(a.line1 || "").trim()) errors.line1 = "House / street address is required";
  if (!String(a.city || "").trim()) errors.city = "City is required";
  if (!String(a.state || "").trim()) errors.state = "State is required";
  if (!/^\d{6}$/.test(String(a.pincode || "").trim())) {
    errors.pincode = "Enter a valid 6-digit PIN code";
  }
  return errors;
}

export async function fetchUserAddresses(userId) {
  if (!userId) return [];
  const snap = await getDoc(doc(db, "users", userId));
  if (!snap.exists()) return [];
  const data = snap.data();
  return Array.isArray(data.addresses) ? data.addresses : [];
}

/**
 * Save / upsert a delivery address on the user profile.
 * Sets isDefault on this address and clears it on others when requested.
 */
export async function saveUserAddress(userId, address, { makeDefault = true } = {}) {
  if (!userId) throw new Error("Sign in to save addresses.");

  const userRef = doc(db, "users", userId);
  const snap = await getDoc(userRef);
  if (!snap.exists()) throw new Error("User profile not found.");

  const data = snap.data();
  const list = Array.isArray(data.addresses) ? [...data.addresses] : [];
  const id = address.id || newAddressId();

  const next = {
    id,
    fullName: String(address.fullName || "").trim(),
    phone: String(address.phone || "").trim(),
    email: String(address.email || "").trim().toLowerCase(),
    line1: String(address.line1 || "").trim(),
    line2: String(address.line2 || "").trim(),
    landmark: String(address.landmark || "").trim(),
    city: String(address.city || "").trim(),
    state: String(address.state || "").trim(),
    pincode: String(address.pincode || "").trim(),
    country: String(address.country || "India").trim() || "India",
    label: String(address.label || "Home").trim() || "Home",
    isDefault: makeDefault,
    updatedAt: new Date().toISOString(),
  };

  let found = false;
  const updated = list.map((a) => {
    if (a.id === id) {
      found = true;
      return { ...a, ...next };
    }
    return makeDefault ? { ...a, isDefault: false } : a;
  });
  if (!found) {
    if (makeDefault) {
      updated.forEach((a) => {
        a.isDefault = false;
      });
    }
    updated.unshift(next);
  }

  await updateDoc(userRef, {
    addresses: updated,
    phone: next.phone,
    defaultAddressId: makeDefault ? id : data.defaultAddressId || id,
    updatedAt: new Date().toISOString(),
  });

  return next;
}

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
];
