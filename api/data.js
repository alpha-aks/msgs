export default async function handler(req, res) {
  // Set CORS headers just in case
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const DB_URL = 'https://jsonblob.com/api/jsonBlob/019f4ca4-0beb-76b2-9344-b3398fb07dc4';

  if (req.method === 'GET') {
    try {
      const response = await fetch(DB_URL);
      if (!response.ok) {
        throw new Error(`Failed to fetch from store: ${response.status}`);
      }
      const data = await response.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const response = await fetch(DB_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(req.body)
      });
      if (!response.ok) {
        throw new Error(`Failed to save to store: ${response.status}`);
      }
      const data = await response.json();
      return res.status(200).json(data);
    } catch (e) {
      return res.status(500).json({ error: e.message });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
