import jwt from "jsonwebtoken";

// Checks that a valid login token was sent
export const protect = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token provided" });
  }
  try {
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { user_id, role }
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