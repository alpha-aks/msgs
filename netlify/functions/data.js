import { neon } from '@neondatabase/serverless';

export default async (request, _context) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,PUT,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 200, headers });
  }

  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) {
    return new Response(JSON.stringify({ error: 'DATABASE_URL environment variable is missing.' }), {
      status: 500,
      headers
    });
  }

  const sql = neon(dbUrl);

  // GET: Retrieve data
  if (request.method === 'GET') {
    try {
      const result = await sql.query('SELECT encrypted_data FROM love_space_data WHERE id = 1');
      if (result.length === 0) {
        return new Response(JSON.stringify({}), { status: 200, headers });
      }
      return new Response(JSON.stringify({ data: result[0].encrypted_data }), { status: 200, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  // POST/PUT: Write data
  if (request.method === 'POST' || request.method === 'PUT') {
    try {
      const body = await request.json();
      const { data } = body;
      if (!data) {
        return new Response(JSON.stringify({ error: 'Missing encrypted data payload' }), { status: 400, headers });
      }

      const result = await sql.query(`
        INSERT INTO love_space_data (id, encrypted_data, updated_at)
        VALUES (1, $1, CURRENT_TIMESTAMP)
        ON CONFLICT (id)
        DO UPDATE SET encrypted_data = EXCLUDED.encrypted_data, updated_at = CURRENT_TIMESTAMP
        RETURNING encrypted_data;
      `, [data]);

      return new Response(JSON.stringify({ data: result[0].encrypted_data }), { status: 200, headers });
    } catch (e) {
      return new Response(JSON.stringify({ error: e.message }), { status: 500, headers });
    }
  }

  return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
};

export const config = {
  path: "/api/data"
};
