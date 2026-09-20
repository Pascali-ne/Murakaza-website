import express from "express";
import path from "node:path";
import fs from "node:fs";
import multer from "multer";
import pool from "../config/db.js";
import { protect, staffOrAdmin } from "../middleware/auth.js";

const router = express.Router();

const uploadStorage = path.join(path.resolve(), "uploads");
if (!fs.existsSync(uploadStorage)) {
  fs.mkdirSync(uploadStorage, { recursive: true });
}

const MulterDiskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadStorage);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname) || ".jpg";
    const safeBase = path.basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_")
      .slice(0, 30);
    cb(null, `service-${uniqueSuffix}-${safeBase}${ext}`);
  },
});

const upload = multer({
  storage: MulterDiskStorage,
  limits: { fileSize: 30 * 1024 * 1024 },
  fileFilter: function (req, file, cb) {
    const allowedTypes = [
      "image/jpeg",
      "image/png",
      "image/gif",
      "image/webp",
      "video/mp4",
      "video/webm",
      "video/quicktime",
    ];
    if (!allowedTypes.includes(file.mimetype)) {
      return cb(new Error("Only images (JPG, PNG, WebP) or videos (MP4, WebM) are allowed"));
    }
    cb(null, true);
  },
});

const defaultServices = [
  {
    title: "Printing, Photocopy & Scanning",
    description: "High-speed black & white and color document printing, photocopying, and high-resolution scanning.",
    image_url: "",
    icon: "Printer",
    price: 50,
  },
  {
    title: "Laminating & Spiral Binding",
    description: "Protect and bind your reports, booklets, projects, and documents with durable lamination and spiral binding.",
    image_url: "",
    icon: "ScanLine",
    price: 500,
  },
  {
    title: "Passport Photo, CV & Banner Printing",
    description: "Express professional passport photos, custom CV design & printout, and high-visibility banner printing.",
    image_url: "",
    icon: "FileImage",
    price: 1000,
  },
  {
    title: "Irembo Services,RDB,RURA,RRA",
    description: "Fast assistance with government electronic declarations, certificates, RDB registrations, and tax filing.",
    image_url: "",
    icon: "Landmark",
    price: 1000,
  },
  {
    title: "Wholesale Products",
    description: "Bulk stationery, paper reams, and student supplies at competitive wholesale prices for schools and businesses.",
    image_url: "",
    icon: "Package",
    price: 0,
  },
  {
    title: "General Business Support",
    description: "Official typing, document formatting, translation support, and general administrative assistance.",
    image_url: "",
    icon: "HeartHandshake",
    price: 0,
  },
];

async function initServicesTable() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS services (
        service_id SERIAL PRIMARY KEY,
        title VARCHAR(150) NOT NULL,
        description TEXT,
        image_url TEXT DEFAULT '',
        icon VARCHAR(50) DEFAULT 'Printer',
        price NUMERIC(10,2) DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    const countRes = await pool.query("SELECT COUNT(*) FROM services");
    if (parseInt(countRes.rows[0].count, 10) === 0) {
      for (const s of defaultServices) {
        await pool.query(
          `INSERT INTO services (title, description, image_url, icon, price) VALUES ($1, $2, $3, $4, $5)`,
          [s.title, s.description, s.image_url, s.icon, s.price]
        );
      }
      console.log(" Seeded initial services into database.");
    }
  } catch (err) {
    console.warn("Services table initialization note:", err.message);
  }
}
initServicesTable();

function sanitizeService(s) {
  if (!s) return s;
  let cleanUrl = s.image_url;
  if (cleanUrl && typeof cleanUrl === "string") {
    cleanUrl = cleanUrl.trim();
    if (cleanUrl.startsWith("data:")) return { ...s, image_url: cleanUrl };
    if (cleanUrl.includes("onrender.com") || (!cleanUrl.includes("localhost") && !cleanUrl.includes("127.0.0.1"))) {
      cleanUrl = cleanUrl.replace(/^http:\/\//i, "https://");
    }
    const uploadsIdx = cleanUrl.indexOf("/uploads/");
    if (uploadsIdx !== -1) {
      const base = cleanUrl.slice(0, uploadsIdx + 9);
      const rawFilename = cleanUrl.slice(uploadsIdx + 9);
      try {
        cleanUrl = base + encodeURIComponent(decodeURIComponent(rawFilename));
      } catch {
        cleanUrl = base + encodeURIComponent(rawFilename);
      }
    }
  }
  return { ...s, image_url: cleanUrl || "" };
}

// GET /api/services — Public listing of services with picture URLs
router.get("/", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM services ORDER BY service_id ASC");
    if (result.rows.length === 0) {
      return res.json(defaultServices.map((s, i) => ({ service_id: i + 1, ...s })));
    }
    res.json(result.rows.map(sanitizeService));
  } catch (err) {
    console.error("Error fetching services, returning defaults:", err.message);
    res.json(defaultServices.map((s, i) => ({ service_id: i + 1, ...s })));
  }
});

// GET /api/services/:id — Get single service
router.get("/:id", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM services WHERE service_id = $1", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Service not found" });
    res.json(sanitizeService(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: "Error fetching service" });
  }
});

// POST /api/services/upload-image — Staff/Admin upload service picture
router.post("/upload-image", protect, staffOrAdmin, upload.single("image"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }
    const host = req.get("host");
    const isLocal = host.includes("localhost") || host.includes("127.0.0.1");
    const protocol = isLocal ? req.protocol : "https";
    const encodedFilename = encodeURIComponent(req.file.filename);
    const fileUrl = `${protocol}://${host}/uploads/${encodedFilename}`;
    res.json({ url: fileUrl });
  } catch (err) {
    res.status(500).json({ message: err.message || "Upload failed" });
  }
});

// POST /api/services — Staff/Admin create service
router.post("/", protect, staffOrAdmin, async (req, res) => {
  try {
    const { title, description, image_url, icon, price } = req.body;
    if (!title) return res.status(400).json({ message: "Service title is required" });

    const result = await pool.query(
      `INSERT INTO services (title, description, image_url, icon, price)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [title, description || "", image_url || "", icon || "Printer", price || 0]
    );
    res.status(201).json(sanitizeService(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: "Error creating service: " + err.message });
  }
});

// PUT /api/services/:id — Staff/Admin update service & picture
router.put("/:id", protect, staffOrAdmin, async (req, res) => {
  try {
    const { title, description, image_url, icon, price } = req.body;
    const result = await pool.query(
      `UPDATE services 
       SET title = COALESCE($1, title),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           icon = COALESCE($4, icon),
           price = COALESCE($5, price)
       WHERE service_id = $6 RETURNING *`,
      [title, description, image_url, icon, price, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Service not found" });
    }
    res.json(sanitizeService(result.rows[0]));
  } catch (err) {
    res.status(500).json({ message: "Error updating service: " + err.message });
  }
});

// DELETE /api/services/:id — Staff/Admin delete service
router.delete("/:id", protect, staffOrAdmin, async (req, res) => {
  try {
    const result = await pool.query("DELETE FROM services WHERE service_id = $1 RETURNING *", [req.params.id]);
    if (result.rows.length === 0) return res.status(404).json({ message: "Service not found" });
    res.json({ message: "Service deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting service" });
  }
});

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