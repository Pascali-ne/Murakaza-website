import express from "express";
import pool from "../config/db.js";
import { protect, requireRole } from "../middleware/auth.js";

const router = express.Router();

// POST /api/feedback — any logged-in customer can submit feedback about the
// service they received. product_id is optional: leave it out for general
// service feedback, or include it to review a specific product.
router.post("/", protect, async (req, res) => {
  try {
    const { product_id, rating, comment } = req.body;

    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }
    if (!comment || !comment.trim()) {
      return res.status(400).json({ message: "Please write a comment" });
    }

    const result = await pool.query(
      `INSERT INTO feedback (customer_id, product_id, rating, comment) VALUES ($1,$2,$3,$4) RETURNING *`,
      [req.user.user_id, product_id || null, rating, comment.trim()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error submitting feedback", detail: err.message });
  }
});

// GET /api/feedback/mine — a customer's own submitted feedback
router.get("/mine", protect, async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, p.name AS product_name FROM feedback f
       LEFT JOIN products p ON f.product_id = p.product_id
       WHERE f.customer_id = $1 ORDER BY f.created_at DESC`,
      [req.user.user_id]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching your feedback", detail: err.message });
  }
});

// GET /api/feedback/product/:productId — public, visible feedback for one product
router.get("/product/:productId", async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.name AS customer_name FROM feedback f JOIN users u ON f.customer_id = u.user_id
       WHERE f.product_id = $1 AND f.status = 'visible' ORDER BY f.created_at DESC`,
      [req.params.productId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching product feedback", detail: err.message });
  }
});

// GET /api/feedback — manager/admin: everything, for moderation
router.get("/", protect, requireRole("manager", "admin"), async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT f.*, u.name AS customer_name, p.name AS product_name FROM feedback f
       JOIN users u ON f.customer_id = u.user_id LEFT JOIN products p ON f.product_id = p.product_id
       ORDER BY f.created_at DESC`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching feedback", detail: err.message });
  }
});

router.put("/:id/hide", protect, requireRole("manager", "admin"), async (req, res) => {
  try {
    const result = await pool.query(`UPDATE feedback SET status = 'hidden' WHERE feedback_id = $1 RETURNING *`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Feedback not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error hiding feedback", detail: err.message });
  }
});

router.put("/:id/unhide", protect, requireRole("manager", "admin"), async (req, res) => {
  try {
    const result = await pool.query(`UPDATE feedback SET status = 'visible' WHERE feedback_id = $1 RETURNING *`, [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Feedback not found" });
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error unhiding feedback", detail: err.message });
  }
});

router.delete("/:id", protect, requireRole("manager", "admin"), async (req, res) => {
  try {
    await pool.query(`DELETE FROM feedback WHERE feedback_id = $1`, [req.params.id]);
    res.json({ message: "Feedback deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error deleting feedback", detail: err.message });
  }
});

export default router;