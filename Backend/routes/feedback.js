import express from "express";
import pool from "../config/db.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

router.post("/", protect, async (req, res) => {
  const { product_id, rating, comment } = req.body;
  const result = await pool.query(
    `INSERT INTO feedback (customer_id, product_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *`,
    [req.user.user_id, product_id, rating, comment]
  );
  res.status(201).json(result.rows[0]);
});

router.get("/product/:productId", async (req, res) => {
  const result = await pool.query(
    `SELECT f.*, u.name AS customer_name FROM feedback f JOIN users u ON f.customer_id = u.user_id
     WHERE f.product_id = $1 AND f.status = 'visible' ORDER BY f.created_at DESC`,
    [req.params.productId]
  );
  res.json(result.rows);
});

router.get("/", protect, requireRole("manager", "admin"), async (req, res) => {
  const result = await pool.query(
    `SELECT f.*, u.name AS customer_name, p.name AS product_name FROM feedback f
     JOIN users u ON f.customer_id = u.user_id JOIN products p ON f.product_id = p.product_id
     ORDER BY f.created_at DESC`
  );
  res.json(result.rows);
});

router.put("/:id/hide", protect, requireRole("manager", "admin"), async (req, res) => {
  const result = await pool.query(`UPDATE feedback SET status = 'hidden' WHERE feedback_id = $1 RETURNING *`, [req.params.id]);
  res.json(result.rows[0]);
});

router.put("/:id/unhide", protect, requireRole("manager", "admin"), async (req, res) => {
  const result = await pool.query(`UPDATE feedback SET status = 'visible' WHERE feedback_id = $1 RETURNING *`, [req.params.id]);
  res.json(result.rows[0]);
});

router.delete("/:id", protect, requireRole("manager", "admin"), async (req, res) => {
  await pool.query(`DELETE FROM feedback WHERE feedback_id = $1`, [req.params.id]);
  res.json({ message: "Feedback deleted" });
});

export default router;