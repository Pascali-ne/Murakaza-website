import express from "express";
import bcrypt from "bcryptjs";
import pool from "../config/db.js";
import { protect, requireRole } from "../middleware/auth.js";
import { isValidRwandaPhone, normalizePhone } from "../utils/phoneValidation.js";

const router = express.Router();

// Role normalization helper: handles uppercase, lowercase, and underscores
const normalizeRole = (role) => {
  if (!role || typeof role !== "string") return null;
  const cleaned = role.trim().toLowerCase().replace(/[\s-]+/g, "_");
  if (cleaned === "store_keeper" || cleaned === "storekeeper") return "storekeeper";
  if (cleaned === "cashier") return "cashier";
  if (cleaned === "employee" || cleaned === "staff") return "employee";
  if (cleaned === "manager") return "manager";
  if (cleaned === "admin") return "admin";
  return null;
};

// GET /api/employees — List all staff and employees (Manager & Admin only)
router.get("/", protect, requireRole("manager", "admin"), async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = `
      SELECT user_id, name, email, phone, role, 
             COALESCE(is_active, true) AS is_active, 
             created_at
      FROM users 
      WHERE role IN ('cashier', 'storekeeper', 'employee', 'manager', 'admin')
    `;
    const params = [];

    if (role && role !== "all") {
      const canonRole = normalizeRole(role);
      if (canonRole) {
        params.push(canonRole);
        query += ` AND role = $${params.length}`;
      }
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(name) LIKE $${params.length} OR LOWER(email) LIKE $${params.length} OR phone LIKE $${params.length})`;
    }

    query += ` ORDER BY created_at DESC, user_id DESC`;

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (err) {
    console.error("Error fetching employees:", err);
    res.status(500).json({ message: "Could not retrieve employee list" });
  }
});

// POST /api/employees — Create a new employee account (Manager & Admin only)
router.post("/", protect, requireRole("manager", "admin"), async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Employee name is required" });
    }
    if (!email || !email.trim()) {
      return res.status(400).json({ message: "Email address is required" });
    }
    if (!password || password.length < 6) {
      return res.status(400).json({ message: "Temporary password must be at least 6 characters" });
    }

    const canonicalRole = normalizeRole(role);
    const validRolesForManager = ["cashier", "storekeeper", "employee"];
    const validRolesForAdmin = ["cashier", "storekeeper", "employee", "manager", "admin"];

    const allowedRoles = req.user.role === "admin" ? validRolesForAdmin : validRolesForManager;

    if (!canonicalRole || !allowedRoles.includes(canonicalRole)) {
      return res.status(400).json({
        message: `Invalid role selected. Allowed roles: ${allowedRoles.join(", ")}`,
      });
    }

    // Phone validation & normalization (if provided)
    let cleanPhone = "0780000000";
    if (phone && phone.trim()) {
      if (!isValidRwandaPhone(phone)) {
        return res.status(400).json({
          message: "Enter a valid 10-digit Rwandan phone number starting with 07 (e.g. 0781234567).",
        });
      }
      cleanPhone = normalizePhone(phone);
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if email already exists
    const existing = await pool.query("SELECT user_id FROM users WHERE LOWER(email) = $1", [cleanEmail]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: "An account with this email already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const insertResult = await pool.query(
      `INSERT INTO users (name, email, phone, password, role, is_active)
       VALUES ($1, $2, $3, $4, $5, true)
       RETURNING user_id, name, email, phone, role, is_active, created_at`,
      [name.trim(), cleanEmail, cleanPhone, hashedPassword, canonicalRole]
    );

    const newEmployee = insertResult.rows[0];
    res.status(201).json({
      message: `Employee ${newEmployee.name} created successfully as ${newEmployee.role}`,
      employee: newEmployee,
    });
  } catch (err) {
    console.error("Error creating employee:", err);
    res.status(500).json({ message: "Failed to create employee account: " + err.message });
  }
});

// PATCH /api/employees/:id/status — Toggle active / deactivated status
router.patch("/:id/status", protect, requireRole("manager", "admin"), async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) return res.status(400).json({ message: "Invalid employee ID" });

    // Safety: Users cannot deactivate their own account
    if (req.user.user_id === targetId) {
      return res.status(400).json({ message: "You cannot deactivate your own account" });
    }

    const targetUserRes = await pool.query("SELECT user_id, name, role, COALESCE(is_active, true) as is_active FROM users WHERE user_id = $1", [targetId]);
    if (targetUserRes.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const targetUser = targetUserRes.rows[0];

    // Safety: Managers cannot alter admin accounts
    if (targetUser.role === "admin" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Managers cannot modify Admin accounts" });
    }

    const newStatus = typeof req.body.is_active === "boolean" ? req.body.is_active : !targetUser.is_active;

    const updateRes = await pool.query(
      `UPDATE users 
       SET is_active = $1 
       WHERE user_id = $2 
       RETURNING user_id, name, email, phone, role, is_active, created_at`,
      [newStatus, targetId]
    );

    res.json({
      message: `Employee ${targetUser.name} is now ${newStatus ? "active" : "deactivated"}`,
      employee: updateRes.rows[0],
    });
  } catch (err) {
    console.error("Error updating employee status:", err);
    res.status(500).json({ message: "Failed to update employee status" });
  }
});

// DELETE /api/employees/:id — Remove or deactivate employee account
router.delete("/:id", protect, requireRole("manager", "admin"), async (req, res) => {
  try {
    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) return res.status(400).json({ message: "Invalid employee ID" });

    // Safety: Users cannot delete their own account
    if (req.user.user_id === targetId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    const targetUserRes = await pool.query("SELECT user_id, name, role FROM users WHERE user_id = $1", [targetId]);
    if (targetUserRes.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const targetUser = targetUserRes.rows[0];

    // Safety: Managers cannot delete admin accounts
    if (targetUser.role === "admin" && req.user.role !== "admin") {
      return res.status(403).json({ message: "Managers cannot delete Admin accounts" });
    }

    try {
      await pool.query("DELETE FROM users WHERE user_id = $1", [targetId]);
      return res.json({ message: `Employee ${targetUser.name} was removed successfully.` });
    } catch (dbErr) {
      // If foreign key constraint prevents hard delete (e.g. linked payments/orders),
      // gracefully deactivate the account instead
      if (dbErr.code === "23503") {
        await pool.query("UPDATE users SET is_active = false WHERE user_id = $1", [targetId]);
        return res.json({
          message: `Employee ${targetUser.name} has existing transactional history and was deactivated instead of deleted.`,
          deactivated: true,
        });
      }
      throw dbErr;
    }
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ message: "Failed to remove employee: " + err.message });
  }
});

export default router;
