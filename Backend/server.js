import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import serviceRoutes from "./routes/services.js";
import userRoutes from "./routes/users.js";
import paymentRoutes from "./routes/payments.js";
import feedbackRoutes from "./routes/feedback.js";
import employeeRoutes from "./routes/employees.js";
import createAdmin from "./routes/create_admin.js";


import path from "node:path"

import fs from "node:fs"



const uploadStorage = path.join(path.resolve(), "uploads");

dotenv.config();
const app = express();

const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:5173",
  "http://localhost:5174",
  "https://murakaza-website.vercel.app",
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes("*") || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(null, true); // Fallback allow to avoid blocking legitimate frontend requests
      }
    },
    credentials: true,
  })
);

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));


app.use("/uploads", express.static(uploadStorage)); 

app.get("/", (req, res) => {
  res.send("MURAKAZA API is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/employees", employeeRoutes);

// Handle multer errors (bad file type, file too large) with a clean JSON response
app.use((err, req, res, next) => {
  if (err && err.name === "MulterError") {
    return res.status(400).json({ message: err.message });
  }
  if (err && err.message === "Only image files are allowed") {
    return res.status(400).json({ message: err.message });
  }
  next(err);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await createAdmin()
  console.log(`✅ MURAKAZA server running on port ${PORT}`)
});