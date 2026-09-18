import express from "express";
import crypto from "crypto";
import pool from "../config/db.js";
import { protect, requireRole } from "../middleware/auth.js";
import * as mtn from "../services/payments/mtn.js";
import * as tigo from "../services/payments/tigo.js";
import * as irembopay from "../services/payments/irembopay.js";
import * as flutterwave from "../services/payments/flutterwave.js";
import { validateMomoPhone } from "../utils/phoneValidation.js";

const router = express.Router();
const PROVIDERS = { mtn_momo: mtn, tigo_cash: tigo, irembopay, flutterwave };

router.post("/initiate", protect, async (req, res) => {
  try {
    const { order_id, payment_method, phone } = req.body;
    const provider = PROVIDERS[payment_method];
    if (!provider) return res.status(400).json({ message: "Unsupported payment method" });

    if (["mtn_momo", "tigo_cash"].includes(payment_method)) {
      const check = validateMomoPhone(phone, payment_method);
      if (!check.valid) return res.status(400).json({ message: check.message });
      req.body.phone = check.normalized;
    } else if (phone) {
      const check = validateMomoPhone(phone);
      if (!check.valid) return res.status(400).json({ message: check.message });
      req.body.phone = check.normalized;
    }

    const orderResult = await pool.query("SELECT * FROM orders WHERE order_id = $1", [order_id]);
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ message: "Order not found" });

    const txRef = `MRK-${order_id}-${crypto.randomBytes(4).toString("hex")}`;
    const result = await provider.initiate({
      amount: order.total_price, phone: req.body.phone, txRef,
      email: req.user.email, name: req.user.name,
      customerName: req.user.name, customerEmail: req.user.email, customerPhone: req.body.phone,
      redirectUrl: `${process.env.CLIENT_URL}/checkout/success`,
      items: [{ quantity: 1, unit_price: order.total_price, code: "ORDER" }],
    });

    await pool.query(`UPDATE payments SET tx_ref = $1 WHERE order_id = $2`, [txRef, order_id]);
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error initiating payment", detail: err.message });
  }
});

router.post("/webhook/:provider", async (req, res) => {
  try {
    const { provider } = req.params;
    const gateway = PROVIDERS[provider];
    if (!gateway) return res.status(400).json({ message: "Unknown gateway provider" });

    // 1. Cryptographic Webhook Authentication
    if (provider === "flutterwave") {
      const secretHash = process.env.FLUTTERWAVE_WEBHOOK_HASH || process.env.FLUTTERWAVE_SECRET_KEY;
      const signature = req.headers["verif-hash"];
      if (secretHash && signature !== secretHash) {
        console.warn("Unauthorized Flutterwave webhook attempt: invalid verif-hash");
        return res.status(401).json({ message: "Invalid webhook signature" });
      }
    } else if (provider === "mtn_momo") {
      const subscriptionKey = process.env.MTN_MOMO_SUBSCRIPTION_KEY;
      const incomingKey = req.headers["ocp-apim-subscription-key"] || req.headers["x-subscription-key"];
      if (subscriptionKey && incomingKey && incomingKey !== subscriptionKey) {
        console.warn("Unauthorized MTN MoMo webhook attempt: subscription key mismatch");
        return res.status(401).json({ message: "Invalid subscription key" });
      }
    } else if (provider === "irembopay") {
      const iremboSecret = process.env.IREMBOPAY_SECRET_KEY;
      const authHeader = req.headers["x-webhook-token"] || req.headers["authorization"];
      if (iremboSecret && authHeader && !authHeader.includes(iremboSecret)) {
        console.warn("Unauthorized IremboPay webhook attempt: token mismatch");
        return res.status(401).json({ message: "Invalid webhook token" });
      }
    } else if (provider === "tigo_cash") {
      const tigoKey = process.env.TIGO_CASH_API_KEY;
      const incomingAuth = req.headers["x-api-key"] || req.headers["authorization"];
      if (tigoKey && incomingAuth && !incomingAuth.includes(tigoKey)) {
        console.warn("Unauthorized Tigo webhook attempt: key mismatch");
        return res.status(401).json({ message: "Invalid API key" });
      }
    }

    // 2. Extract transaction reference
    const txRef =
      req.body.tx_ref ||
      req.body.externalId ||
      req.body.data?.tx_ref ||
      req.body.invoiceNumber ||
      req.body.transactionReference;

    if (!txRef) {
      return res.status(400).json({ message: "Missing transaction reference" });
    }

    // 3. Cryptographically / Server-to-server verify against provider API
    const verified = await gateway.verify(txRef);
    const isPaid = ["SUCCESSFUL", "successful", "PAID", "paid"].includes(verified.status);

    await pool.query(
      `UPDATE payments 
       SET payment_status = $1, gateway_response = $2 
       WHERE tx_ref = $3`,
      [isPaid ? "paid" : "failed", JSON.stringify(verified.raw || verified), txRef]
    );

    if (isPaid) {
      await pool.query(
        `UPDATE orders SET order_status = 'confirmed' 
         WHERE order_id = (SELECT order_id FROM payments WHERE tx_ref = $1)`,
        [txRef]
      );
      console.log(`[Webhook Verified] Payment ${txRef} marked as PAID via ${provider}`);
    } else {
      console.log(`[Webhook Verified] Payment ${txRef} marked as FAILED via ${provider}`);
    }

    return res.status(200).json({ status: "success", received: true });
  } catch (err) {
    console.error("Webhook processing error:", err);
    return res.status(500).json({ message: "Internal server error processing webhook" });
  }
});

// Secure status check endpoint - clients must query here rather than trusting return query params
router.get("/order/:orderId", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.payment_id, p.order_id, p.payment_method, p.payment_status, p.amount, p.tx_ref, o.order_status
       FROM payments p
       JOIN orders o ON p.order_id = o.order_id
       WHERE p.order_id = $1 AND (o.customer_id = $2 OR $3 = ANY(ARRAY['cashier', 'manager', 'admin']))`,
      [req.params.orderId, req.user.user_id, req.user.role]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Payment record not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching payment status" });
  }
});

router.get("/", protect, requireRole("cashier", "manager", "admin"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT p.*, o.customer_id, u.name AS customer_name FROM payments p
       JOIN orders o ON p.order_id = o.order_id JOIN users u ON o.customer_id = u.user_id
       ORDER BY p.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching payments", detail: err.message });
  }
});

router.put("/:id/confirm", protect, requireRole("cashier", "manager", "admin"), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE payments SET payment_status = 'paid', confirmed_by = $1, confirmed_at = NOW() WHERE payment_id = $2 RETURNING *`,
      [req.user.user_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Payment not found" });
    await pool.query(`UPDATE orders SET order_status = 'confirmed' WHERE order_id = $1`, [result.rows[0].order_id]);
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error confirming payment", detail: err.message });
  }
});

router.put("/:id/reject", protect, requireRole("cashier", "manager", "admin"), async (req, res) => {
  try {
    const result = await pool.query(
      `UPDATE payments SET payment_status = 'failed', confirmed_by = $1, confirmed_at = NOW() WHERE payment_id = $2 RETURNING *`,
      [req.user.user_id, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Payment not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error rejecting payment", detail: err.message });
  }
});

export default router;