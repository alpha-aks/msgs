const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.warn('WARNING: DATABASE_URL environment variable is not defined. Please add it to your .env file.');
}

const pool = new Pool({
  connectionString: dbUrl,
  ssl: {
    rejectUnauthorized: false
  }
});

// Auto-initialize DB Table
async function initDb() {
  if (!dbUrl) return;
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS love_space_data (
        id INT PRIMARY KEY,
        encrypted_data TEXT NOT NULL,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Neon database table verified/created successfully via pg Pool.');
  } catch (err) {
    console.error('Error initializing database:', err);
  }
}
initDb();

app.get('/api/data', async (req, res) => {
  if (!dbUrl) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured.' });
  }
  try {
    const result = await pool.query('SELECT encrypted_data FROM love_space_data WHERE id = 1');
    if (result.rows.length === 0) {
      return res.json({});
    }
    res.json({ data: result.rows[0].encrypted_data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/data', async (req, res) => {
  if (!dbUrl) {
    return res.status(500).json({ error: 'DATABASE_URL is not configured.' });
  }
  try {
    const { data } = req.body;
    if (!data) {
      return res.status(400).json({ error: 'Missing encrypted data payload' });
    }

    const result = await pool.query(`
      INSERT INTO love_space_data (id, encrypted_data, updated_at)
      VALUES (1, $1, CURRENT_TIMESTAMP)
      ON CONFLICT (id)
      DO UPDATE SET encrypted_data = EXCLUDED.encrypted_data, updated_at = CURRENT_TIMESTAMP
      RETURNING encrypted_data;
    `, [data]);

    res.json({ data: result.rows[0].encrypted_data });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Local proxy running on http://localhost:${PORT}`);
});
