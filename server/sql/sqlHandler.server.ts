// lib/sqlHandler.ts
import { Pool } from "pg";

// Initialize connection pool using DATABASE_URL from environment variables
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" ? { rejectUnauthorized: false } : false,
});

/**
 * Executes a SQL query using the connection pool.
 * @param text - The SQL query text with optional placeholders ($1, $2, ...).
 * @param params - An array of parameters to substitute into the query.
 * @returns The result rows as an array of records.
 * @throws If the query fails, the error is propagated.
 */
export async function query<T = any>(text: string, params: any[] = []): Promise<T[]> {
  const client = await pool.connect();
  try {
    const res = await client.query(text, params);
    return res.rows as T[];
  } finally {
    client.release();
  }
}

/**
 * Closes all connections in the pool (for graceful shutdown).
 */
export async function closePool() {
  await pool.end();
}

