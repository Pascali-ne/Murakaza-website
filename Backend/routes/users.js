import express from "express";
import pool from "../config/db.js";
import { protect, adminOnly } from "../middleware/auth.js";

const router = express.Router();

// GET /api/users/me — logged in user's own profile
router.get("/me", protect, async (req, res) => {
  const result = await pool.query(
    `SELECT 
      u.user_id, u.name, u.email, u.phone, u.role, 
      COALESCE(u.is_active, true) AS is_active, 
      u.delegated_from_role, u.delegated_at, u.delegated_by,
      CASE WHEN u.delegated_from_role IS NOT NULL THEN COALESCE(p.name, 'Administrator') ELSE NULL END AS delegated_by_name,
      CASE WHEN u.delegated_from_role IS NOT NULL THEN p.email ELSE NULL END AS delegated_by_email,
      CASE WHEN u.delegated_from_role IS NOT NULL THEN COALESCE(p.role, 'admin') ELSE NULL END AS delegated_by_role
     FROM users u
     LEFT JOIN users p ON u.delegated_by = p.user_id
     WHERE u.user_id = $1`,
    [req.user.user_id]
  );
  res.json(result.rows[0]);
});

// GET /api/users — admin: list all users
router.get("/", protect, adminOnly, async (req, res) => {
  const result = await pool.query(
    "SELECT user_id, name, email, phone, role, created_at FROM users ORDER BY created_at DESC"
  );
  res.json(result.rows);
});

// GET /api/users/report — admin: simple sales/report summary
router.get("/report/summary", protect, adminOnly, async (req, res) => {
  const totalUsers = await pool.query("SELECT COUNT(*) FROM users WHERE role = 'customer'");
  const totalOrders = await pool.query("SELECT COUNT(*) FROM orders");
  const totalRevenue = await pool.query(
    "SELECT COALESCE(SUM(total_price),0) AS revenue FROM orders WHERE order_status != 'cancelled'"
  );
  const lowStock = await pool.query("SELECT name, quantity FROM products WHERE quantity < 10");

  res.json({
    total_customers: totalUsers.rows[0].count,
    total_orders: totalOrders.rows[0].count,
    total_revenue: totalRevenue.rows[0].revenue,
    low_stock_products: lowStock.rows,
  });
});

export default router;