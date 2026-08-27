import express from "express";
import pool from "../config/db.js";
import { protect, staffOrAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /api/orders — customer places an order
// body: { items: [{product_id, quantity, unit_price}], payment_method, delivery_address }
router.post("/", protect, async (req, res) => {
  const client = await pool.connect();
  try {
    const { items, payment_method, delivery_address } = req.body;
    if (!items || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty" });
    }

    const total_price = items.reduce((sum, i) => sum + i.quantity * i.unit_price, 0);

    await client.query("BEGIN");

    const orderResult = await client.query(
      `INSERT INTO orders (customer_id, total_price, payment_method, delivery_address)
       VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.user_id, total_price, payment_method, delivery_address]
    );
    const order = orderResult.rows[0];

    for (const item of items) {
      await client.query(
        `INSERT INTO order_items (order_id, product_id, quantity, unit_price)
         VALUES ($1,$2,$3,$4)`,
        [order.order_id, item.product_id, item.quantity, item.unit_price]
      );
      // reduce stock
      await client.query(
        `UPDATE products SET quantity = quantity - $1 WHERE product_id = $2`,
        [item.quantity, item.product_id]
      );
    }

    await client.query(
      `INSERT INTO payments (order_id, payment_method, amount, payment_status)
       VALUES ($1,$2,$3, $4)`,
      [order.order_id, payment_method, total_price, payment_method === "cash_on_delivery" ? "pending" : "pending"]
    );

    await client.query("COMMIT");
    res.status(201).json(order);
  } catch (err) {
    await client.query("ROLLBACK");
    console.error(err);
    res.status(500).json({ message: "Error placing order" });
  } finally {
    client.release();
  }
});

// GET /api/orders/my — logged-in customer's own orders
router.get("/my", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM orders WHERE customer_id = $1 ORDER BY created_at DESC`,
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// GET /api/orders — admin/staff view all orders
router.get("/", protect, staffOrAdmin, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT o.*, u.name AS customer_name, u.phone
       FROM orders o JOIN users u ON o.customer_id = u.user_id
       ORDER BY o.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching orders" });
  }
});

// PUT /api/orders/:id/status — admin/staff updates order status
router.put("/:id/status", protect, staffOrAdmin, async (req, res) => {
  try {
    const { order_status } = req.body;
    const result = await pool.query(
      `UPDATE orders SET order_status = $1 WHERE order_id = $2 RETURNING *`,
      [order_status, req.params.id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error updating order status" });
  }
});

export default router;