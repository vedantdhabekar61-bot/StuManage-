import { Router } from "express";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { logger } from "../lib/logger";

const router = Router();

function getRazorpay() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_KEY_SECRET;
  if (!keyId || !keySecret) {
    throw new Error("Razorpay credentials not configured");
  }
  return { keyId, keySecret };
}

function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !serviceKey) {
    throw new Error("Supabase admin credentials not configured");
  }
  return createClient(url, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

router.post("/payment/create-order", async (req, res) => {
  try {
    const { keyId, keySecret } = getRazorpay();
    const { amount, currency = "INR" } = req.body;

    if (!amount || Number(amount) !== 50) {
      res.status(400).json({ error: "Invalid amount. Expected ₹50." });
      return;
    }

    const orderPayload = {
      amount: Number(amount) * 100,
      currency,
      receipt: `receipt_${Date.now()}`,
    };

    const response = await fetch("https://api.razorpay.com/v1/orders", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization:
          "Basic " +
          Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
      },
      body: JSON.stringify(orderPayload),
    });

    if (!response.ok) {
      const err = await response.json();
      logger.error({ err }, "Razorpay order creation failed");
      res
        .status(500)
        .json({ error: (err as any).error?.description || "Order creation failed" });
      return;
    }

    const order = await response.json();
    res.json(order);
  } catch (err: any) {
    logger.error({ err }, "Payment create-order error");
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

router.post("/payment/verify", async (req, res) => {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];

    if (!token) {
      res.status(401).json({ error: "Unauthorized: missing token" });
      return;
    }

    const supabase = getSupabaseAdmin();
    const { keyId, keySecret } = getRazorpay();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser(token);

    if (userError || !user) {
      res.status(401).json({ error: "Unauthorized: invalid token" });
      return;
    }

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      res.status(400).json({ error: "Missing Razorpay payment fields" });
      return;
    }

    // Step 1: Verify HMAC signature
    const body = `${razorpay_order_id}|${razorpay_payment_id}`;
    const expectedSignature = crypto
      .createHmac("sha256", keySecret)
      .update(body)
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      logger.warn({ userId: user.id }, "Payment signature mismatch");
      res.status(400).json({ status: "failure", error: "Signature mismatch" });
      return;
    }

    // Step 2: Verify payment with Razorpay API (prevents replay / out-of-band manipulation)
    const paymentRes = await fetch(
      `https://api.razorpay.com/v1/payments/${razorpay_payment_id}`,
      {
        headers: {
          Authorization:
            "Basic " +
            Buffer.from(`${keyId}:${keySecret}`).toString("base64"),
        },
      }
    );

    if (!paymentRes.ok) {
      logger.error({ razorpay_payment_id }, "Failed to fetch payment from Razorpay");
      res.status(502).json({ error: "Could not verify payment with Razorpay" });
      return;
    }

    const payment = (await paymentRes.json()) as any;

    // Step 3: Validate payment is actually captured and matches expected order/amount
    if (
      payment.status !== "captured" ||
      payment.order_id !== razorpay_order_id ||
      payment.amount !== 5000 || // ₹50 in paise
      payment.currency !== "INR"
    ) {
      logger.warn(
        { userId: user.id, payment_status: payment.status, amount: payment.amount },
        "Payment validation failed: unexpected state"
      );
      res.status(400).json({ status: "failure", error: "Payment validation failed" });
      return;
    }

    // Step 4: Idempotency — check if this payment was already processed
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("last_payment_id, status")
      .eq("owner_id", user.id)
      .single();

    if (existing?.last_payment_id === razorpay_payment_id) {
      logger.info({ userId: user.id }, "Duplicate payment verification — already processed");
      res.json({ status: "success", message: "Already activated" });
      return;
    }

    // Step 5: Update subscription
    const proExpiryDate = new Date();
    proExpiryDate.setDate(proExpiryDate.getDate() + 30);

    const { error: updateError } = await supabase
      .from("subscriptions")
      .update({
        status: "active",
        expiry_date: proExpiryDate.toISOString().split("T")[0],
        last_payment_id: razorpay_payment_id,
        updated_at: new Date().toISOString(),
      })
      .eq("owner_id", user.id);

    if (updateError) {
      logger.error({ updateError }, "Failed to update subscription");
      res
        .status(500)
        .json({ error: "Payment verified but subscription update failed" });
      return;
    }

    logger.info({ userId: user.id }, "Subscription upgraded to active");
    res.json({ status: "success" });
  } catch (err: any) {
    logger.error({ err }, "Payment verify error");
    res.status(500).json({ error: err.message || "Internal server error" });
  }
});

export default router;
