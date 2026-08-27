import express from "express";
import pool from "../config/db.js";
import { protect, staffOrAdmin } from "../middleware/auth.js";

const router = express.Router();

// POST /api/services/request — anyone can submit (contact form / other services request)
router.post("/request", async (req, res) => {
  try {
    const { customer_name, email, phone, service_type, message } = req.body;
    if (!customer_name || !phone) {
      return res.status(400).json({ message: "Name and phone are required" });
    }
    const result = await pool.query(
      `INSERT INTO service_requests (customer_name, email, phone, service_type, message)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [customer_name, email, phone, service_type, message]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Error submitting request" });
  }
});

// GET /api/services/request — staff/admin view all requests
router.get("/request", protect, staffOrAdmin, async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM service_requests ORDER BY created_at DESC");
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ message: "Error fetching requests" });
  }
});

export default router;