/**
 * Razorpay Checkout helpers.
 * Keys live in Firebase Secrets — only the public key_id is returned by createOrder.
 */

const FUNCTIONS_BASE =
  "https://us-central1-thehavenstore.cloudfunctions.net";

async function postJson(path, body) {
  const res = await fetch(`${FUNCTIONS_BASE}/${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  let data = {};
  try {
    data = await res.json();
  } catch {
    data = {};
  }

  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data;
}

/** Load Razorpay Checkout.js once. */
export function loadRazorpayScript() {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector(
      'script[src="https://checkout.razorpay.com/v1/checkout.js"]',
    );
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      // Already loaded between inject and this call
      if (window.Razorpay) resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

/**
 * Create a Razorpay order via Cloud Function.
 * @param {{ amount: number, receipt?: string, notes?: Record<string, string> }} opts
 *   amount in INR rupees (e.g. 1078)
 */
export async function createRazorpayOrder({ amount, receipt, notes } = {}) {
  return postJson("createOrder", {
    amount,
    currency: "INR",
    receipt,
    notes,
  });
}

/**
 * Verify payment signature via Cloud Function (server-side HMAC).
 */
export async function verifyRazorpayPayment({
  razorpay_order_id,
  razorpay_payment_id,
  razorpay_signature,
}) {
  return postJson("verifyPayment", {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  });
}

/**
 * Open Razorpay Checkout and resolve with payment response on success.
 * Rejects if user closes the modal or payment fails.
 */
export function openRazorpayCheckout({
  keyId,
  orderId,
  amount,
  currency = "INR",
  name = "The Haven Store",
  description = "Order payment",
  prefill = {},
  notes = {},
}) {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject(new Error("Razorpay SDK failed to load. Check your network."));
      return;
    }

    let settled = false;

    const options = {
      key: keyId,
      amount,
      currency,
      name,
      description,
      order_id: orderId,
      prefill: {
        name: prefill.name || "",
        email: prefill.email || "",
        contact: prefill.contact || "",
      },
      notes,
      theme: {
        color: "#111111",
      },
      handler(response) {
        settled = true;
        resolve(response);
      },
      modal: {
        ondismiss() {
          if (!settled) {
            reject(new Error("Payment cancelled. You can try again when ready."));
          }
        },
      },
    };

    try {
      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (response) => {
        settled = true;
        const msg =
          response?.error?.description ||
          response?.error?.reason ||
          "Payment failed. Please try again.";
        reject(new Error(msg));
      });
      rzp.open();
    } catch (err) {
      reject(err instanceof Error ? err : new Error(String(err)));
    }
  });
}

/**
 * Full pay flow: create order → open Checkout → verify signature.
 * @returns payment fields for placeOrder
 */
export async function payWithRazorpay({
  amountRupees,
  receipt,
  customer,
  notes,
}) {
  const loaded = await loadRazorpayScript();
  if (!loaded) {
    throw new Error("Could not load Razorpay. Please refresh and try again.");
  }

  const order = await createRazorpayOrder({
    amount: amountRupees,
    receipt,
    notes: {
      ...notes,
      customerEmail: customer?.email || "",
      customerPhone: customer?.phone || "",
    },
  });

  const payment = await openRazorpayCheckout({
    keyId: order.keyId,
    orderId: order.orderId,
    amount: order.amount,
    currency: order.currency,
    prefill: {
      name: customer?.fullName || customer?.name || "",
      email: customer?.email || "",
      contact: customer?.phone || "",
    },
    notes,
  });

  const verification = await verifyRazorpayPayment({
    razorpay_order_id: payment.razorpay_order_id,
    razorpay_payment_id: payment.razorpay_payment_id,
    razorpay_signature: payment.razorpay_signature,
  });

  if (!verification.verified) {
    throw new Error(verification.error || "Payment verification failed.");
  }

  return {
    razorpayOrderId: payment.razorpay_order_id,
    razorpayPaymentId: payment.razorpay_payment_id,
    razorpaySignature: payment.razorpay_signature,
  };
}
