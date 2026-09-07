// Creates (or promotes) an admin account so you can access /admin on the frontend.
//
// Usage (from backend/ folder):
//   node database/seed-admin.js
//
// Customize the constants below first, or override with env vars:
//   ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, ADMIN_PASSWORD
//
// Requires backend/.env to be set up (same DB config used by the server).

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pool from "../config/db.js";

dotenv.config();

const NAME = process.env.ADMIN_NAME || "Admin";
const EMAIL = process.env.ADMIN_EMAIL || "admin@murakaza.com";
const PHONE = process.env.ADMIN_PHONE || "0780000000";
const PASSWORD = process.env.ADMIN_PASSWORD || "Admin@123";

const run = async () => {
  try {
    const hashed = await bcrypt.hash(PASSWORD, 10);

    const existing = await pool.query("SELECT * FROM users WHERE email = $1", [EMAIL]);

    if (existing.rows.length > 0) {
      await pool.query(
        "UPDATE users SET role = 'admin', password = $1 WHERE email = $2",
        [hashed, EMAIL]
      );
      console.log(`Existing user promoted to admin: ${EMAIL}`);
    } else {
      await pool.query(
        `INSERT INTO users (name, email, phone, password, role)
         VALUES ($1, $2, $3, $4, 'admin')`,
        [NAME, EMAIL, PHONE, hashed]
      );
      console.log(`Admin account created: ${EMAIL}`);
    }

    console.log(`Login with:\n  email:    ${EMAIL}\n  password: ${PASSWORD}`);
  } catch (err) {
    console.error("Failed to seed admin:", err.message);
  } finally {
    await pool.end();
  }
};

run();