const { onRequest } = require("firebase-functions/v2/https");
const { defineSecret } = require("firebase-functions/params");
const crypto = require("crypto");
const Razorpay = require("razorpay");

const keyId = defineSecret("RAZORPAY_KEY_ID");
const keySecret = defineSecret("RAZORPAY_KEY_SECRET");

// Gen2 runs on Cloud Run — must be public for browser checkout from localhost/prod.
// cors: true handles OPTIONS preflight so localhost:5173 can call these endpoints.
const secretOpts = {
  secrets: [keyId, keySecret],
  region: "us-central1",
  invoker: "public",
  cors: true,
};

function setCors(res) {
  res.set("Access-Control-Allow-Origin", "*");
  res.set("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.set("Access-Control-Max-Age", "3600");
}

function parseBody(req) {
  if (!req.body) return {};
  if (typeof req.body === "string") {
    try {
      return JSON.parse(req.body);
    } catch {
      return {};
    }
  }
  return req.body;
}

function getRazorpay() {
  return new Razorpay({
    key_id: keyId.value(),
    key_secret: keySecret.value(),
  });
}

/**
 * Create a Razorpay order.
 * Body: { amount: number (INR rupees), currency?: "INR", receipt?: string, notes?: object }
 * Returns: { orderId, amount (paise), currency, keyId, receipt }
 */
exports.createOrder = onRequest(secretOpts, async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const body = parseBody(req);
    const amountRupees = Number(body.amount);
    const amountPaise = Math.round(amountRupees * 100);

    if (!Number.isFinite(amountPaise) || amountPaise < 100) {
      res.status(400).json({
        error: "Invalid amount. Minimum order value is ₹1.",
      });
      return;
    }

    // Soft upper bound to catch bad client data (₹10 lakh)
    if (amountPaise > 100000000) {
      res.status(400).json({ error: "Amount too large." });
      return;
    }

    const currency = (body.currency || "INR").toUpperCase();
    if (currency !== "INR") {
      res.status(400).json({ error: "Only INR is supported." });
      return;
    }

    const receipt =
      String(body.receipt || `rcpt_${Date.now()}`).slice(0, 40) ||
      `rcpt_${Date.now()}`;

    const notes =
      body.notes && typeof body.notes === "object" ? body.notes : {};

    const razorpay = getRazorpay();
    const order = await razorpay.orders.create({
      amount: amountPaise,
      currency,
      receipt,
      notes,
    });

    res.status(200).json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      receipt: order.receipt,
      // Public key only — safe to send to the browser for Checkout.js
      keyId: keyId.value(),
    });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({
      error: err?.error?.description || err?.message || "Failed to create payment order.",
    });
  }
});

/**
 * Verify Razorpay payment signature after Checkout success.
 * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
 */
exports.verifyPayment = onRequest(secretOpts, async (req, res) => {
  setCors(res);

  if (req.method === "OPTIONS") {
    res.status(204).send("");
    return;
  }

  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed. Use POST." });
    return;
  }

  try {
    const body = parseBody(req);
    const orderId = String(body.razorpay_order_id || "").trim();
    const paymentId = String(body.razorpay_payment_id || "").trim();
    const signature = String(body.razorpay_signature || "").trim();

    if (!orderId || !paymentId || !signature) {
      res.status(400).json({
        error: "Missing razorpay_order_id, razorpay_payment_id, or razorpay_signature.",
      });
      return;
    }

    const payload = `${orderId}|${paymentId}`;
    const expected = crypto
      .createHmac("sha256", keySecret.value())
      .update(payload)
      .digest("hex");

    const valid = crypto.timingSafeEqual(
      Buffer.from(expected, "utf8"),
      Buffer.from(signature, "utf8"),
    );

    if (!valid) {
      res.status(400).json({ verified: false, error: "Invalid payment signature." });
      return;
    }

    res.status(200).json({
      verified: true,
      razorpay_order_id: orderId,
      razorpay_payment_id: paymentId,
    });
  } catch (err) {
    // timingSafeEqual throws if buffer lengths differ — treat as invalid
    if (err?.code === "ERR_CRYPTO_TIMING_SAFE_EQUAL_LENGTH") {
      res.status(400).json({ verified: false, error: "Invalid payment signature." });
      return;
    }
    console.error("verifyPayment error:", err);
    res.status(500).json({
      verified: false,
      error: err?.message || "Payment verification failed.",
    });
  }
});
