import {
  db,
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from "../firebase/config";

const ORDERS = "orders";

export const FREE_SHIPPING_THRESHOLD = 999;
export const FLAT_SHIPPING_FEE = 79;

export function calcShipping(subtotal) {
  if (subtotal <= 0) return 0;
  return subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_FEE;
}

export function calcOrderTotals(items) {
  const subtotal = items.reduce(
    (sum, i) => sum + (Number(i.price) || 0) * (Number(i.qty) || 0),
    0,
  );
  const mrpTotal = items.reduce(
    (sum, i) =>
      sum +
      (Number(i.originalPrice) || Number(i.price) || 0) * (Number(i.qty) || 0),
    0,
  );
  const discount = Math.max(0, mrpTotal - subtotal);
  const shipping = calcShipping(subtotal);
  const total = subtotal + shipping;
  return { subtotal, mrpTotal, discount, shipping, total };
}

function normalizeAddress(address = {}) {
  return {
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
  };
}

/**
 * Place an order in Firestore.
 * COD → paymentStatus "pending". Razorpay → pass verified payment fields → "paid".
 */
export async function placeOrder({
  userId = null,
  items = [],
  address,
  paymentMethod = "cod",
  notes = "",
  razorpayOrderId = null,
  razorpayPaymentId = null,
  razorpaySignature = null,
  paymentStatus = null,
}) {
  if (!items.length) throw new Error("Your cart is empty.");
  const shippingAddress = normalizeAddress(address);

  if (!shippingAddress.fullName) throw new Error("Full name is required.");
  if (!/^[6-9]\d{9}$/.test(shippingAddress.phone)) {
    throw new Error("Enter a valid 10-digit Indian mobile number.");
  }
  if (
    !shippingAddress.email ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shippingAddress.email)
  ) {
    throw new Error("Enter a valid email address.");
  }
  if (!shippingAddress.line1) throw new Error("Address line is required.");
  if (!shippingAddress.city) throw new Error("City is required.");
  if (!shippingAddress.state) throw new Error("State is required.");
  if (!/^\d{6}$/.test(shippingAddress.pincode)) {
    throw new Error("Enter a valid 6-digit PIN code.");
  }

  const method = paymentMethod === "razorpay" ? "razorpay" : "cod";
  if (method === "razorpay") {
    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      throw new Error("Payment details missing. Please complete Razorpay checkout.");
    }
  }

  const totals = calcOrderTotals(items);
  const orderItems = items.map((i) => ({
    productId: i.productId,
    name: i.name,
    price: Number(i.price) || 0,
    originalPrice: Number(i.originalPrice) || Number(i.price) || 0,
    image: i.image || "",
    size: i.size || "",
    color: i.color || "",
    qty: Number(i.qty) || 1,
    gender: i.gender || "",
    category: i.category || "",
  }));

  const resolvedPaymentStatus =
    paymentStatus ||
    (method === "razorpay" ? "paid" : "pending");

  const payload = {
    userId: userId || null,
    items: orderItems,
    itemCount: orderItems.reduce((s, i) => s + i.qty, 0),
    shippingAddress,
    contact: {
      fullName: shippingAddress.fullName,
      phone: shippingAddress.phone,
      email: shippingAddress.email,
    },
    ...totals,
    currency: "INR",
    paymentMethod: method, // "cod" | "razorpay"
    paymentStatus: resolvedPaymentStatus,
    razorpayOrderId: method === "razorpay" ? razorpayOrderId : null,
    razorpayPaymentId: method === "razorpay" ? razorpayPaymentId : null,
    razorpaySignature: method === "razorpay" ? razorpaySignature : null,
    orderStatus: "placed",
    notes: String(notes || "").trim(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const refDoc = await addDoc(collection(db, ORDERS), payload);

  // Mirror order id on user doc list (best-effort)
  if (userId) {
    try {
      const userRef = doc(db, "users", userId);
      const snap = await getDoc(userRef);
      if (snap.exists()) {
        const prev = Array.isArray(snap.data().orders) ? snap.data().orders : [];
        await updateDoc(userRef, {
          orders: [
            {
              id: refDoc.id,
              total: totals.total,
              status: "placed",
              createdAt: new Date().toISOString(),
            },
            ...prev,
          ].slice(0, 50),
          phone: shippingAddress.phone,
          updatedAt: new Date().toISOString(),
        });
      }
    } catch (e) {
      console.warn("Could not update user orders list:", e?.message);
    }
  }

  return {
    id: refDoc.id,
    ...payload,
    createdAt: new Date().toISOString(),
  };
}

export async function fetchOrderById(orderId) {
  if (!orderId) return null;
  const snap = await getDoc(doc(db, ORDERS, orderId));
  if (!snap.exists()) return null;
  const data = snap.data();
  return {
    id: snap.id,
    ...data,
    createdAt: data.createdAt?.toDate?.()?.toISOString?.() || data.createdAt,
  };
}

export async function fetchOrdersForUser(userId) {
  if (!userId) return [];
  try {
    const q = query(
      collection(db, ORDERS),
      where("userId", "==", userId),
      orderBy("createdAt", "desc"),
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() || null,
    }));
  } catch (err) {
    console.warn("Orders query fallback:", err?.message);
    const snap = await getDocs(collection(db, ORDERS));
    return snap.docs
      .map((d) => ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.()?.toISOString?.() || null,
      }))
      .filter((o) => o.userId === userId)
      .sort((a, b) => String(b.createdAt || "").localeCompare(String(a.createdAt || "")));
  }
}
