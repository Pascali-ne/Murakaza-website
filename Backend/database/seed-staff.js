// Creates (or resets the password + role of) the three internal staff accounts:
// cashier, storekeeper and manager. Run this once after setting up the database
// so your supervisor's team has working logins right away.
//
// Usage (from the Backend/ folder):
//   node database/seed-staff.js
//
// Customize the emails/passwords below, or override with the env vars listed
// next to each account (put them in Backend/.env). Requires Backend/.env to
// already have your database connection configured.

import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import pool from "../config/db.js";
import { isValidRwandaPhone, normalizePhone } from "../utils/phoneValidation.js";

dotenv.config();

const STAFF_ACCOUNTS = [
  {
    role: "cashier",
    name: process.env.CASHIER_NAME || "Cashier",
    email: process.env.CASHIER_EMAIL || "cashier@murakaza.com",
    phone: process.env.CASHIER_PHONE || "0781000001",
    password: process.env.CASHIER_PASSWORD || "Cashier@123",
  },
  {
    role: "storekeeper",
    name: process.env.STOREKEEPER_NAME || "Storekeeper",
    email: process.env.STOREKEEPER_EMAIL || "storekeeper@murakaza.com",
    phone: process.env.STOREKEEPER_PHONE || "0781000002",
    password: process.env.STOREKEEPER_PASSWORD || "Storekeeper@123",
  },
  {
    role: "manager",
    name: process.env.MANAGER_NAME || "Manager",
    email: process.env.MANAGER_EMAIL || "manager@murakaza.com",
    phone: process.env.MANAGER_PHONE || "0781000003",
    password: process.env.MANAGER_PASSWORD || "Manager@123",
  },
];

const run = async () => {
  const created = [];
  try {
    for (const account of STAFF_ACCOUNTS) {
      const { role, name, email, phone, password } = account;

      if (!isValidRwandaPhone(phone)) {
        console.error(`Skipping ${role}: phone "${phone}" is not a valid Rwandan number (must start 07 and have 10 digits).`);
        continue;
      }
      const normalizedPhone = normalizePhone(phone);
      const hashed = await bcrypt.hash(password, 10);

      const existing = await pool.query("SELECT * FROM users WHERE email = $1", [email]);
      if (existing.rows.length > 0) {
        await pool.query("UPDATE users SET role = $1, password = $2, phone = $3 WHERE email = $4", [
          role, hashed, normalizedPhone, email,
        ]);
        console.log(`Existing user updated to ${role}: ${email}`);
      } else {
        await pool.query(
          `INSERT INTO users (name, email, phone, password, role) VALUES ($1, $2, $3, $4, $5)`,
          [name, email, normalizedPhone, hashed, role]
        );
        console.log(`${role} account created: ${email}`);
      }
      created.push(account);
    }

    console.log("\n=== Staff login credentials ===");
    created.forEach(({ role, email, password }) => {
      console.log(`${role.padEnd(12)} | email: ${email.padEnd(28)} | password: ${password}`);
    });
    console.log("\nTell each staff member to log in and use 'Forgot password' to set their own password.");
  } catch (err) {
    console.error("Failed to seed staff accounts:", err.message);
  } finally {
    await pool.end();
  }
};

run();