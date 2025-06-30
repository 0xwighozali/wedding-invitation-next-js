// src/lib/db.ts
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // ssl: { // <-- Komen baris ini dan baris di bawahnya
  //   rejectUnauthorized: false
  // }
});

export default pool;
