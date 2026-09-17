import express from "express";
import pool from "../config/db.js";
import { protect, adminOnly, requireRole } from "../middleware/auth.js";

// Storekeepers verify and manage stock; managers and admins can too.
const stockAccess = requireRole("storekeeper", "manager", "admin");
import path from "node:path"
import multer from "multer";
import fs from "node:fs"

const router = express.Router();

const uploadStorage = path.join(path.resolve(), "uploads");

// create upload folder if not exists

if(!fs.existsSync(uploadStorage)){
  fs.mkdirSync(uploadStorage, { recursive: true });
}

const MulterDiskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadStorage);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({
  storage: MulterDiskStorage,
  limits: { fileSize: 5 * 1024 * 1024 }, // Limit to 5MB
  fileFilter: function (req, file, cb) {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only image files are allowed"));
    }

    cb(null, true);
  },
});

// POST /api/products/upload-image — admin only, upload a product photo to Cloudinary
// Send as multipart/form-data with a single field named "image".
// Returns { url } which can then be saved as a product's image_url.
router.post("/upload-image", protect, stockAccess, upload.single("image"), async (req, res) => {
  try {

    // Check if file is uploaded.
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const bind_application_url_to_uploaded_file = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    return res.status(200).json({ url: bind_application_url_to_uploaded_file });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error uploading image" });
  }
});

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

// GET /api/products/low-stock — storekeeper/manager/admin: stock verification view
// Must be registered before "/:id" so "low-stock" isn't read as a product id.
router.get("/low-stock", protect, stockAccess, async (req, res) => {
  try {
    const threshold = Number(req.query.threshold) || 10;
    const lowStock = await pool.query(
      "SELECT * FROM products WHERE quantity < $1 ORDER BY quantity ASC",
      [threshold]
    );
    const totals = await pool.query("SELECT COUNT(*) AS total_products, COALESCE(SUM(quantity),0) AS total_units FROM products");
    res.json({ low_stock_products: lowStock.rows, ...totals.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Error fetching stock report" });
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

// POST /api/products — storekeeper/manager/admin: add product
router.post("/", protect, stockAccess, async (req, res) => {
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

// PUT /api/products/:id — storekeeper/manager/admin: edit product / update stock
router.put("/:id", protect, stockAccess, async (req, res) => {
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

// DELETE /api/products/:id — storekeeper/manager/admin: remove product
router.delete("/:id", protect, stockAccess, async (req, res) => {
  try {
    await pool.query("DELETE FROM products WHERE product_id = $1", [req.params.id]);
    res.json({ message: "Product deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting product" });
  }
});

export default router;