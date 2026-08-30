import express from "express";
import pg from "pg";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const app = express();
app.use(express.json());

const pool = new pg.Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: process.env.DB_SSL === "true" ? { rejectUnauthorized: false } : false,
});

async function initDb() {
  for (let attempt = 1; attempt <= 10; attempt++) {
    try {
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notes (
          id SERIAL PRIMARY KEY,
          body TEXT NOT NULL,
          created_at TIMESTAMPTZ DEFAULT NOW()
        )
      `);
      console.log("Database ready");
      return;
    } catch (err) {
      console.log(`DB not ready (attempt ${attempt}): ${err.message}`);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
  throw new Error("Could not connect to database");
}

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.get("/api/notes", async (req, res) => {
  const result = await pool.query("SELECT * FROM notes ORDER BY id DESC");
  res.json(result.rows);
});

app.post("/api/notes", async (req, res) => {
  const { body } = req.body;
  if (!body) return res.status(400).json({ error: "body required" });
  const result = await pool.query(
    "INSERT INTO notes (body) VALUES ($1) RETURNING *",
    [body]
  );
  res.status(201).json(result.rows[0]);
});

app.use(express.static(path.join(__dirname, "public")));
app.get("*", (req, res) =>
  res.sendFile(path.join(__dirname, "public", "index.html"))
);

const PORT = process.env.PORT || 3000;
initDb().then(() => {
  app.listen(PORT, "0.0.0.0", () => console.log(`Listening on ${PORT}`));
});