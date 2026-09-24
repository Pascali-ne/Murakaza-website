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
  if (cleaned === "customer") return "customer";
  return null;
};

// GET /api/employees — List all staff and employees (Manager & Admin only)
router.get("/", protect, requireRole("manager", "admin"), async (req, res) => {
  try {
    const { role, search } = req.query;
    let query = `
      SELECT u.user_id, u.name, u.email, u.phone, u.role, 
             COALESCE(u.is_active, true) AS is_active, 
             u.delegated_from_role, u.delegated_at, u.delegated_by,
             u.created_at,
             CASE WHEN u.delegated_from_role IS NOT NULL THEN COALESCE(p.name, 'Administrator') ELSE NULL END AS delegated_by_name,
             CASE WHEN u.delegated_from_role IS NOT NULL THEN p.email ELSE NULL END AS delegated_by_email
      FROM users u
      LEFT JOIN users p ON u.delegated_by = p.user_id
      WHERE u.role IN ('cashier', 'storekeeper', 'employee', 'manager', 'admin')
    `;
    const params = [];

    if (role && role !== "all") {
      const canonRole = normalizeRole(role);
      if (canonRole) {
        params.push(canonRole);
        query += ` AND u.role = $${params.length}`;
      }
    }

    if (search && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      query += ` AND (LOWER(u.name) LIKE $${params.length} OR LOWER(u.email) LIKE $${params.length} OR u.phone LIKE $${params.length})`;
    }

    query += ` ORDER BY u.created_at DESC, u.user_id DESC`;

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

    const targetUserRes = await pool.query("SELECT user_id, name, role, delegated_from_role, COALESCE(is_active, true) as is_active FROM users WHERE user_id = $1", [targetId]);
    if (targetUserRes.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const targetUser = targetUserRes.rows[0];

    // Safety: Permanent Admin accounts can NEVER be deactivated by anyone ("only admin none can do anything to him")
    if (targetUser.role === "admin" && !targetUser.delegated_from_role) {
      return res.status(403).json({ message: "Permanent Administrator accounts are protected and cannot be deactivated." });
    }

    // Safety: Acting administrators cannot deactivate Admin or Manager accounts
    if (req.user.delegated_from_role && (targetUser.role === "admin" || targetUser.role === "manager")) {
      return res.status(403).json({ message: "Acting administrators cannot deactivate Admin or Manager accounts." });
    }

    // Safety: Managers cannot alter Admin accounts
    if (targetUser.role === "admin" && (req.user.role !== "admin" || req.user.delegated_from_role)) {
      return res.status(403).json({ message: "Only permanent Administrators can modify Admin accounts." });
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

    // Safety 1: Users cannot delete their own account
    if (req.user.user_id === targetId) {
      return res.status(400).json({ message: "You cannot delete your own account" });
    }

    // Safety 2: Acting administrators cannot delete any employee accounts
    if (req.user.delegated_from_role) {
      return res.status(403).json({
        message: "Access Denied: Acting administrators cannot delete employee accounts. Only the permanent administrator has this authority.",
      });
    }

    const targetUserRes = await pool.query("SELECT user_id, name, role, delegated_from_role FROM users WHERE user_id = $1", [targetId]);
    if (targetUserRes.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const targetUser = targetUserRes.rows[0];

    // Safety 3: Permanent Admin accounts can NEVER be deleted
    if (targetUser.role === "admin" && !targetUser.delegated_from_role) {
      return res.status(403).json({ message: "Permanent Administrator accounts are protected and cannot be deleted." });
    }

    // Safety 4: Only permanent Admins can delete staff accounts
    if (req.user.role !== "admin" || req.user.delegated_from_role) {
      return res.status(403).json({ message: "Only permanent administrators can delete staff accounts." });
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

// PATCH /api/employees/:id/role — Transfer, delegate, or revoke staff/admin roles (Admin only)
router.patch("/:id/role", protect, requireRole("admin"), async (req, res) => {
  try {
    // Strict Guardrail: Temporary / delegated acting administrators cannot transfer or modify roles
    if (req.user.delegated_from_role) {
      return res.status(403).json({
        message: "Access Denied: As a temporary acting administrator, you cannot transfer or modify roles. Only the permanent administrator has this authority.",
      });
    }

    const targetId = parseInt(req.params.id, 10);
    if (isNaN(targetId)) return res.status(400).json({ message: "Invalid employee ID" });

    const { role: requestedRole, is_delegation, revoke } = req.body;

    const targetUserRes = await pool.query(
      `SELECT user_id, name, email, phone, role, 
              COALESCE(is_active, true) AS is_active, 
              delegated_from_role, delegated_at, delegated_by 
       FROM users 
       WHERE user_id = $1`,
      [targetId]
    );

    if (targetUserRes.rows.length === 0) {
      return res.status(404).json({ message: "Employee not found" });
    }

    const targetUser = targetUserRes.rows[0];

    // Case 1: Revoke delegation (returns to original role)
    if (revoke) {
      const restoreRole = targetUser.delegated_from_role || "employee";

      // Safety: Prevent removing last active admin if revoking an admin
      if (targetUser.role === "admin" && restoreRole !== "admin") {
        const adminCountRes = await pool.query(
          "SELECT COUNT(*) FROM users WHERE role = 'admin' AND COALESCE(is_active, true) = true AND user_id != $1",
          [targetId]
        );
        if (parseInt(adminCountRes.rows[0].count, 10) < 1) {
          return res.status(400).json({
            message: "Cannot revoke Admin access because this is currently the only active administrator in the system.",
          });
        }
      }

      const updateRes = await pool.query(
        `UPDATE users 
         SET role = $1, delegated_from_role = NULL, delegated_at = NULL, delegated_by = NULL 
         WHERE user_id = $2 
         RETURNING user_id, name, email, phone, role, is_active, delegated_from_role, delegated_at, delegated_by`,
        [restoreRole, targetId]
      );

      return res.json({
        message: `Delegated access for ${targetUser.name} has been revoked. Role restored to ${restoreRole}.`,
        employee: updateRes.rows[0],
      });
    }

    // Case 2: Transfer / Reassign Role
    const canonicalRole = normalizeRole(requestedRole);
    const validRoles = ["admin", "manager", "cashier", "storekeeper", "employee", "customer"];

    if (!canonicalRole || !validRoles.includes(canonicalRole)) {
      return res.status(400).json({
        message: `Invalid role selected. Allowed roles: ${validRoles.join(", ")}`,
      });
    }

    // Safety: Prevent removing the last active administrator
    if (targetUser.role === "admin" && canonicalRole !== "admin") {
      const adminCountRes = await pool.query(
        "SELECT COUNT(*) FROM users WHERE role = 'admin' AND COALESCE(is_active, true) = true AND user_id != $1",
        [targetId]
      );
      if (parseInt(adminCountRes.rows[0].count, 10) < 1) {
        return res.status(400).json({
          message: "Cannot demote the last remaining active Administrator in the system.",
        });
      }
    }

    // If marked as delegation, preserve current base role if not already delegated
    let newDelegatedFrom = targetUser.delegated_from_role;
    let newDelegatedAt = targetUser.delegated_at;
    let newDelegatedBy = targetUser.delegated_by;

    if (is_delegation) {
      if (!newDelegatedFrom) {
        newDelegatedFrom = targetUser.role; // e.g. "cashier"
      }
      newDelegatedAt = new Date();
      newDelegatedBy = req.user.user_id;
    } else {
      // Direct permanent role change clears delegation
      newDelegatedFrom = null;
      newDelegatedAt = null;
      newDelegatedBy = null;
    }

    const updateRes = await pool.query(
      `UPDATE users 
       SET role = $1, 
           delegated_from_role = $2, 
           delegated_at = $3, 
           delegated_by = $4 
       WHERE user_id = $5 
       RETURNING user_id, name, email, phone, role, is_active, delegated_from_role, delegated_at, delegated_by`,
      [canonicalRole, newDelegatedFrom, newDelegatedAt, newDelegatedBy, targetId]
    );

    const updatedUser = updateRes.rows[0];
    if (is_delegation) {
      updatedUser.delegated_by_name = req.user.name;
      updatedUser.delegated_by_email = req.user.email;
    }
    const delegationNotice = is_delegation
      ? ` (Delegated from ${newDelegatedFrom} while Admin is away)`
      : "";

    res.json({
      message: `Role for ${updatedUser.name} successfully updated to ${updatedUser.role}${delegationNotice}`,
      employee: updatedUser,
    });
  } catch (err) {
    console.error("Error transferring employee role:", err);
    res.status(500).json({ message: "Failed to transfer employee role: " + err.message });
  }
});

export default router;
