import { neon } from '@neondatabase/serverless';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const dbUrl = process.env.DATABASE_URL;
  const readDbUrl = process.env.DATABASE_READ_URL || dbUrl;

  if (!dbUrl) {
    return res.status(500).json({ error: 'DATABASE_URL environment variable is not configured.' });
  }

  // GET: Retrieve data from Read Replica (or primary if not defined)
  if (req.method === 'GET') {
    try {
      const sql = neon(readDbUrl);
      const result = await sql('SELECT encrypted_data FROM love_space_data WHERE id = 1');
      if (result.length === 0) {
        return res.status(200).json({});
      }
      return res.status(200).json({ data: result[0].encrypted_data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  // POST/PUT: Write data to Primary database
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const sql = neon(dbUrl);
      const { data } = req.body;
      if (!data) {
        return res.status(400).json({ error: 'Missing encrypted data payload' });
      }

      const result = await sql(`
        INSERT INTO love_space_data (id, encrypted_data, updated_at)
        VALUES (1, $1, CURRENT_TIMESTAMP)
        ON CONFLICT (id)
        DO UPDATE SET encrypted_data = EXCLUDED.encrypted_data, updated_at = CURRENT_TIMESTAMP
        RETURNING encrypted_data;
      `, [data]);

      return res.status(200).json({ data: result[0].encrypted_data });
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
