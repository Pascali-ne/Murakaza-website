import jwt from "jsonwebtoken";
import pool from "../config/db.js";

// Checks that a valid login token was sent and synchronizes role in real-time
export const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Look up fresh user details from database to reflect real-time role changes and deactivations
    const userRes = await pool.query(
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
      [decoded.user_id]
    );

    if (userRes.rows.length === 0) {
      return res.status(401).json({ message: "User account not found" });
    }

    const dbUser = userRes.rows[0];
    if (dbUser.is_active === false) {
      return res.status(403).json({ message: "Account has been deactivated. Please contact your administrator." });
    }

    req.user = dbUser;
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// Restricts a route to admins (and optionally staff)
export const adminOnly = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access only" });
  }
  next();
};

// NOTE: the old "staff" role was split into cashier / storekeeper / manager.
// This now means "any internal staff account", not the literal role "staff".
export const staffOrAdmin = (req, res, next) => {
  const internalRoles = ["cashier", "storekeeper", "manager", "admin"];
  if (!req.user || !internalRoles.includes(req.user.role)) {
    return res.status(403).json({ message: "Staff or admin access only" });
  }
  next();
};

export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ message: `Access restricted to: ${roles.join(", ")}` });
  }
  next();
};