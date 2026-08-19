const express = require("express");
const cors = require("cors");
const path = require("path");
require("dotenv").config();

const { pool, ensureSchema } = require("./db");
const postRoutes = require("./routes/postRoutes");

const app = express();

// ---- Middleware ----
app.use(cors());
app.use(express.json()); // allows us to read JSON from req.body

// ---- API routes ----
app.use("/api/posts", postRoutes);

// ---- Serve the frontend (static files) ----
// This lets the same server host both the API and the website,
// which makes deployment on Render much simpler (one service, not two).
const frontendPath = path.join(__dirname, "..", "frontend");
app.use(express.static(frontendPath));

// Any unknown non-API route falls back to index.html
app.get(/^(?!\/api).*/, (req, res) => {
  res.sendFile(path.join(frontendPath, "index.html"));
});

// ---- PostgreSQL connection ----
const PORT = process.env.PORT || 5000;

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is missing. Please set it in your .env file.");
  process.exit(1);
}

async function start() {
  try {
    await pool.query("SELECT 1"); // simple check that the connection works
    console.log("PostgreSQL connected successfully");

    await ensureSchema(); // creates the posts table if it doesn't exist yet
    console.log("Database schema is ready");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error("PostgreSQL connection error:", err.message);
    process.exit(1);
  }
}

start();
