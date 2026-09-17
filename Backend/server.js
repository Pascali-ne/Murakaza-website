import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./config/db.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import serviceRoutes from "./routes/services.js";
import userRoutes from "./routes/users.js";
import createAdmin from "./routes/create_admin.js";


import path from "node:path"

import fs from "node:fs"



const uploadStorage = path.join(path.resolve(), "uploads");

dotenv.config();
const app = express();

      app.use(cors({ origin: process.env.CLIENT_URL || "*" }));

app.use(express.json());


app.use("/uploads", express.static(uploadStorage)); 

app.get("/", (req, res) => {
  res.send("MURAKAZA API is running 🚀");
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/services", serviceRoutes);
app.use("/api/users", userRoutes);

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
import paymentRoutes from "./routes/payments.js";
import feedbackRoutes from "./routes/feedback.js";
// ...
app.use("/api/payments", paymentRoutes);
app.use("/api/feedback", feedbackRoutes);