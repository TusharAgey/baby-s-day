import express from "express";
import sqlite3 from "sqlite3";

const app = express();
const PORT = process.env.PORT || 4000;

app.use(express.json());

const db = new sqlite3.Database("./server/baby-tracker.db");

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS events (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      timestamp TEXT NOT NULL,
      duration INTEGER,
      metadata TEXT
    )
  `);
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.get("/events", (_req, res) => {
  db.all("SELECT * FROM events ORDER BY timestamp DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    const mapped = rows.map((row) => ({
      ...row,
      metadata: row.metadata ? JSON.parse(row.metadata) : undefined,
    }));
    return res.json(mapped);
  });
});

app.post("/events", (req, res) => {
  const { id, type, timestamp, duration, metadata } = req.body;

  db.run(
    "INSERT INTO events (id, type, timestamp, duration, metadata) VALUES (?, ?, ?, ?, ?)",
    [
      id,
      type,
      timestamp,
      duration ?? null,
      metadata ? JSON.stringify(metadata) : null,
    ],
    (err) => {
      if (err) return res.status(500).json({ error: err.message });
      return res.status(201).json({ ok: true });
    },
  );
});

app.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});
