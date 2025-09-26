// server.js
console.log('boot: starting server.js');

const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');

const app = express();
const PORT = process.env.PORT || 3000;

const pool = mysql.createPool({
  host: process.env.DB_HOST || '127.0.0.1',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'appuser',
  password: process.env.DB_PASS || 'apppw',
  database: process.env.DB_NAME || 'steam_demo',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

app.use(cors());
app.use(express.json());

// health check
app.get('/health', async (_req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    res.json({ ok: true, db: 'up' });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// hello world query
app.get('/hello', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, title, genre FROM games ORDER BY id ASC LIMIT 10;'
    );
    res.json(rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`API running: http://localhost:${PORT}`);
});

