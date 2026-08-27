import express from "express";
import pool from "../config/db.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /api/products?category=student_supplies&search=book
router.get("/", async (req, res) => {
  try {
    const { category, search } = req.query;
    let query = "SELECT * FROM products WHERE 1=1";
    const params = [];

    if (category) {
      params.push(category);
      query += ` AND category = $${params.length}`;
    }
    if (search) {
      params.push(`%${search}%`);
      query += ` AND name ILIKE $${params.length}`;
    }
    query += " ORDER BY created_at DESC";

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching products" });
  }
});

// GET /api/products/:id — single product details
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM products WHERE product_id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error fetching product" });
  }
});

// POST /api/products — admin only, add product
router.post("/", protect, adminOnly, async (req, res) => {
  try {
    const { name, category, price, quantity, description, image_url } = req.body;
    const result = await pool.query(
      `INSERT INTO products (name, category, price, quantity, description, image_url)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [name, category, price, quantity, description, image_url]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error adding product" });
  }
});

// PUT /api/products/:id — admin only, edit product
router.put("/:id", protect, adminOnly, async (req, res) => {
  try {
    const { name, category, price, quantity, description, image_url } = req.body;
    const result = await pool.query(
      `UPDATE products SET name=$1, category=$2, price=$3, quantity=$4, description=$5, image_url=$6
       WHERE product_id=$7 RETURNING *`,
      [name, category, price, quantity, description, image_url, req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ message: "Product not found" });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error updating product" });
  }
});

// DELETE /api/products/:id — admin only
router.delete("/:id", protect, adminOnly, async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE product_id = $1", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

export default router;