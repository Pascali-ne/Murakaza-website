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

const defaultAccounts = [
  {
    name: process.env.DEFAULT_ADMIN_NAME || "Admin",
    email: process.env.DEFAULT_ADMIN_EMAIL || "mukamugishapascaline@gmail.com",
    phone: process.env.DEFAULT_ADMIN_PHONE || "0799398833",
    password: process.env.DEFAULT_ADMIN_PASSWORD || "Maker20@",
    role: "admin",
  },
  {
    name: "Admin User",
    email: "admin@murakaza.com",
    phone: "0790000001",
    password: "Admin@123",
    role: "admin",
  },
  {
    name: "Manager User",
    email: "manager@murakaza.com",
    phone: "0790000002",
    password: "Manager@123",
    role: "manager",
  },
  {
    name: "Cashier User",
    email: "cashier@murakaza.com",
    phone: "0790000003",
    password: "Cashier@123",
    role: "cashier",
  },
  {
    name: "Storekeeper User",
    email: "storekeeper@murakaza.com",
    phone: "0790000004",
    password: "Storekeeper@123",
    role: "storekeeper",
  },
  {
    name: "Staff Employee",
    email: "employee@murakaza.com",
    phone: "0790000005",
    password: "Employee@123",
    role: "employee",
  },
];

export default async function createAdmin() {
  try {
    // Ensure 'employee' enum value exists and is_active column exists in PostgreSQL
    try {
      await pool.query(`
        DO $$
        BEGIN
          ALTER TYPE user_role ADD VALUE IF NOT EXISTS 'employee';
        EXCEPTION
          WHEN duplicate_object THEN null;
        END $$;
        ALTER TABLE users ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT TRUE;
      `);
    } catch (migErr) {
      console.warn("Schema initialization note for employees:", migErr.message);
    }

    for (const acc of defaultAccounts) {
      const existing = await pool.query("SELECT user_id FROM users WHERE email = $1", [acc.email]);
      if (existing.rows.length === 0) {
        const hashedPassword = await bcrypt.hash(acc.password, 10);
        await pool.query(
          `INSERT INTO users (name, email, phone, password, role)
           VALUES ($1, $2, $3, $4, $5)`,
          [acc.name, acc.email, acc.phone, hashedPassword, acc.role]
        );
        console.log(`Default account created: ${acc.email} (${acc.role})`);
      }
    }
  } catch (err) {
    console.error("Error creating default accounts:", err.message);
  }
}