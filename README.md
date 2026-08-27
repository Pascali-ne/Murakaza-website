# MURAKAZA Website

A full-stack e-commerce website for student supplies and office equipment, built from the MURAKAZA SRS v2.0.

## Tech Stack
- **Frontend:** React.js, React Router, Tailwind CSS, Axios, Vite
- **Backend:** Node.js, Express.js
- **Database:** PostgreSQL
- **Auth:** JWT (JSON Web Token) + bcrypt password hashing
- **Image storage:** Cloudinary (optional, `image_url` field works with any link too)

## Project Structure
```
murakaza-website/
├── backend/
│   ├── config/db.js          # PostgreSQL connection
│   ├── middleware/auth.js    # JWT auth + role checks
│   ├── routes/                # auth, products, orders, services, users
│   ├── database/schema.sql   # Full DB schema + sample data
│   ├── server.js              # App entry point
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/              # Home, Shop, Cart, Checkout, Login, Admin, etc.
    │   ├── components/         # Navbar, Footer, ProductCard, etc.
    │   ├── context/            # Auth + Cart global state
    │   └── api/api.js          # Axios instance
    └── package.json
```

## How to Run It

### 1. Database
1. Install PostgreSQL and create a database:
   ```
   createdb murakaza_db
   ```
2. Load the schema and sample products:
   ```
   psql -U postgres -d murakaza_db -f backend/database/schema.sql
   ```
3. To create your first admin account, register normally on the site, then run:
   ```sql
   UPDATE users SET role = 'admin' WHERE email = 'your_email@example.com';
   ```

### 2. Backend
```bash
cd backend
npm install
cp .env.example .env       # fill in your DB password and a random JWT_SECRET
npm run dev                # starts on http://localhost:5000
```

### 3. Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev                # starts on http://localhost:5173
```

Open **http://localhost:5173** in your browser — that's the live site.

## Features Implemented (mapped to SRS sections)
| SRS Section | Feature | Status |
|---|---|---|
| 7.1 | Register / Login / Logout | ✅ |
| 7.2 | Admin product management | ✅ |
| 7.3 | Search & filter products | ✅ |
| 7.4 | Shopping cart | ✅ |
| 7.5 | Order placement & status tracking | ✅ |
| 7.6 | 4 payment methods | ✅ |
| 7.7 | Contact form + Other Services requests | ✅ |
| Section 5.2 | Admin dashboard with reports | ✅ |

## Deployment (matches Section 9.7 of the SRS)
- **Frontend:** Deploy the `frontend` folder to Vercel.
- **Backend:** Deploy the `backend` folder to Railway or Render, and connect it to a managed PostgreSQL instance.
- Set the environment variables (`.env` values) in each platform's dashboard — never commit real secrets to GitHub.

## Notes for Presentation
- Product images: paste any image URL into the `image_url` field in the Admin Dashboard (or connect Cloudinary later).
- Payments (MTN MoMo / Airtel Money) are recorded in the database as "pending" — connecting to a live payment gateway is a future integration step, not required for this version.
- The "Clothing" business line (Section 3.3) is intentionally **not** built — it's documented as a future phase.
