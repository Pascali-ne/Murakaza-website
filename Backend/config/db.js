import pkg from "pg";
import dotenv from "dotenv";
dotenv.config();

const { Pool } = pkg;

const pool = process.env.DATABASE_URL
  ? new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    })
  : new Pool({
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
    });

pool.connect()
  .then(() => console.log(" Connected to PostgreSQL database"))
  .catch((err) => console.error(" Database connection error:", err.message));

export default pool;