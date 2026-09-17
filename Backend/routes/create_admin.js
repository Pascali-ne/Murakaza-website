import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();

const createToken = (user) =>
  jwt.sign(
    { user_id: user.user_id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "7d" }
  );

const name = process.env.DEFAULT_ADMIN_NAME || "Admin";
const email = process.env.DEFAULT_ADMIN_EMAIL || "mukamugishapascaline@gmail.com";
const phone = process.env.DEFAULT_ADMIN_PHONE || "0799398833";
const password = process.env.DEFAULT_ADMIN_PASSWORD || "Maker20@";

export default async function createAdmin() {
  try {
    if (!name || !email || !phone || !password) {
      console.log({ message: "All fields are required" });
      return;
    }

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
    if (existing.rows.length > 0) {
      console.log("Default admin already exists — skipping creation.");
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const result = await pool.query(
      `INSERT INTO users (name, email, phone, password, role)
       VALUES ($1, $2, $3, $4, 'admin')
       RETURNING user_id, name, email, phone, role`,
      [name, email, phone, hashedPassword]
    );

    const user = result.rows[0];
    const token = createToken(user);
    console.log("Default admin created:", user.email);
  } catch (err) {
    console.error(err);
  }
}