import express from "express";
import crypto from "crypto";
import pool from "../config/db.js";
import { protect, requireRole } from "../middleware/auth.js";
import * as mtn from "../services/payments/mtn.js";
import * as tigo from "../services/payments/tigo.js";
import * as irembopay from "../services/payments/irembopay.js";
import * as flutterwave from "../services/payments/flutterwave.js";

const router = express.Router();
const PROVIDERS = { mtn_momo: mtn, tigo_cash: tigo, irembopay, flutterwave };

router.post("/initiate", protect, async (req, res) => {
  try {
    const { order_id, payment_method, phone } = req.body;
    const provider = PROVIDERS[payment_method];
    if (!provider) return res.status(400).json({ message: "Unsupported payment method" });

    const orderResult = await pool.query("SELECT * FROM orders WHERE order_id = $1", [order_id]);
    const order = orderResult.rows[0];
    if (!order) return res.status(404).json({ message: "Order not found" });

    const txRef = `MRK-${order_id}-${crypto.randomBytes(4).toString("hex")}`;
    const result = await provider.initiate({
      amount: order.total_price, phone, txRef,
      email: req.user.email, name: req.user.name,
      customerName: req.user.name, customerEmail: req.user.email, customerPhone: phone,
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
    const provider = PROVIDERS[req.params.provider];
    if (!provider) return res.sendStatus(400);
    const txRef = req.body.tx_ref || req.body.externalId || req.body.data?.tx_ref || req.body.invoiceNumber;
    if (!txRef) return res.sendStatus(400);

    const verified = await provider.verify(txRef);
    const isPaid = ["SUCCESSFUL", "successful", "PAID", "paid"].includes(verified.status);

    await pool.query(`UPDATE payments SET payment_status = $1, gateway_response = $2 WHERE tx_ref = $3`, [
      isPaid ? "paid" : "failed", JSON.stringify(verified.raw || verified), txRef,
    ]);

    if (isPaid) {
      await pool.query(
        `UPDATE orders SET order_status = 'confirmed' WHERE order_id = (SELECT order_id FROM payments WHERE tx_ref = $1)`,
        [txRef]
      );
    }
    res.sendStatus(200);
  } catch (err) {
    console.error(err);
    res.sendStatus(500);
  }
});

router.get("/", protect, requireRole("cashier", "manager", "admin"), async (req, res) => {
  const result = await pool.query(
    `SELECT p.*, o.customer_id, u.name AS customer_name FROM payments p
     JOIN orders o ON p.order_id = o.order_id JOIN users u ON o.customer_id = u.user_id
     ORDER BY p.created_at DESC`
  );
  res.json(result.rows);
});

router.put("/:id/confirm", protect, requireRole("cashier", "manager", "admin"), async (req, res) => {
  const result = await pool.query(
    `UPDATE payments SET payment_status = 'paid', confirmed_by = $1, confirmed_at = NOW() WHERE payment_id = $2 RETURNING *`,
    [req.user.user_id, req.params.id]
  );
  await pool.query(`UPDATE orders SET order_status = 'confirmed' WHERE order_id = $1`, [result.rows[0].order_id]);
  res.json(result.rows[0]);
});

router.put("/:id/reject", protect, requireRole("cashier", "manager", "admin"), async (req, res) => {
  const result = await pool.query(
    `UPDATE payments SET payment_status = 'failed', confirmed_by = $1, confirmed_at = NOW() WHERE payment_id = $2 RETURNING *`,
    [req.user.user_id, req.params.id]
  );
  res.json(result.rows[0]);
});

export default router;