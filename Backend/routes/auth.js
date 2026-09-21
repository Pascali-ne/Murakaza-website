import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import pool from "../config/db.js";
import { protect, requireRole } from "../middleware/auth.js";
import { isValidRwandaPhone, normalizePhone } from "../utils/phoneValidation.js";

const router = express.Router();

const createToken = (user) =>
  jwt.sign({ user_id: user.user_id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

router.post("/register", async (req, res) => {
  try {
    const { name, email, phone, password } = req.body;
    if (!name || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }
    if (!isValidRwandaPhone(phone)) {
      return res.status(400).json({
        message: "Enter a valid 10-digit Rwandan phone number starting with 07 (e.g. 0781234567 for MTN, 0721234567 for Tigo).",
      });
    }
    const normalizedPhone = normalizePhone(phone);

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: "Email is already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role)
       VALUES ($1, $2, $3, $4, 'customer')
       RETURNING user_id, name, email, phone, role`,
      [name, email, normalizedPhone, hashedPassword]
    );
    const user = result.rows[0];
    res.status(201).json({ user, token: createToken(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) return res.status(400).json({ message: "Invalid email or password" });

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid email or password" });

    if (user.is_active === false) {
      return res.status(403).json({ message: "Your account has been deactivated. Please contact your manager or administrator." });
    }

    const token = createToken(user);
    delete user.password;
    res.json({ user, token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error during login" });
  }
});

router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = req.body;
    const result = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (result.rows.length === 0) {
      return res.json({ message: "If that email exists, a reset link has been sent." });
    }
    const user = result.rows[0];
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    const expiry = new Date(Date.now() + 15 * 60 * 1000);

    await pool.query("UPDATE users SET reset_token = $1, reset_token_expiry = $2 WHERE user_id = $3", [
      hashedToken, expiry, user.user_id,
    ]);

    const resetUrl = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;
    await transporter.sendMail({
      from: `"MURAKAZA" <${process.env.EMAIL_USER}>`,
      to: user.email,
      subject: "Reset your MURAKAZA password",
      html: `<p>Hello ${user.name},</p><p>Click below to reset your password. This link expires in 15 minutes.</p><a href="${resetUrl}">${resetUrl}</a>`,
    });

    res.json({ message: "If that email exists, a reset link has been sent." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error sending reset email" });
  }
});

router.post("/reset-password/:token", async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const result = await pool.query(
      "SELECT * FROM users WHERE reset_token = $1 AND reset_token_expiry > NOW()",
      [hashedToken]
    );
    if (result.rows.length === 0) return res.status(400).json({ message: "Reset link is invalid or has expired" });

    const user = result.rows[0];
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "UPDATE users SET password = $1, reset_token = NULL, reset_token_expiry = NULL WHERE user_id = $2",
      [hashedPassword, user.user_id]
    );
    res.json({ message: "Password reset successful. Please log in." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error resetting password" });
  }
});

router.post("/create-staff", protect, requireRole("manager", "admin"), async (req, res) => {
  try {
    const { name, email, phone, password, role } = req.body;
    const allowedRoles = req.user.role === "admin"
      ? ["cashier", "storekeeper", "employee", "manager", "admin"]
      : ["cashier", "storekeeper", "employee"];

    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: `Role must be one of: ${allowedRoles.join(", ")}` });
    }
    if (!name || !email || !phone || !password) return res.status(400).json({ message: "All fields are required" });
    if (!isValidRwandaPhone(phone)) {
      return res.status(400).json({
        message: "Enter a valid 10-digit Rwandan phone number starting with 07 (e.g. 0781234567 for MTN, 0721234567 for Tigo).",
      });
    }
    const normalizedPhone = normalizePhone(phone);

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) return res.status(400).json({ message: "Email is already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING user_id, name, email, phone, role`,
      [name, email, normalizedPhone, hashedPassword, role]
    );
    res.status(201).json({ user: result.rows[0] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error creating staff account" });
  }
});

export default router;