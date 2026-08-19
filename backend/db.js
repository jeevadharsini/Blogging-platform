const { Pool } = require("pg");
const fs = require("fs");
const path = require("path");

// A connection pool is more efficient than opening a new connection per request.
// SSL is required by most hosted Postgres providers (Render, Supabase, Neon, etc.)
// but not needed for a local database, so we detect that from the connection string.
const isLocal = /localhost|127\.0\.0\.1/.test(process.env.DATABASE_URL || "");

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: isLocal ? false : { rejectUnauthorized: false },
});

pool.on("error", (err) => {
  console.error("Unexpected error on idle Postgres client", err);
});

// Automatically creates the posts table (and update trigger) if it doesn't exist yet,
// so a brand-new database is ready to use without a manual setup step.
async function ensureSchema() {
  const schemaPath = path.join(__dirname, "schema.sql");
  const schemaSql = fs.readFileSync(schemaPath, "utf8");
  await pool.query(schemaSql);
}

module.exports = { pool, ensureSchema };
