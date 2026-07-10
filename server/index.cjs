const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors());
app.use(express.json());

const DB_URL = 'https://jsonblob.com/api/jsonBlob/019f4ca4-0beb-76b2-9344-b3398fb07dc4';

app.get('/api/data', async (req, res) => {
  try {
    const response = await fetch(DB_URL);
    if (!response.ok) {
      return res.status(response.status).json({ error: `JSONBlob error: ${response.status}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/data', async (req, res) => {
  try {
    const response = await fetch(DB_URL, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: `JSONBlob error: ${response.status}` });
    }
    const data = await response.json();
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.listen(PORT, () => {
  console.log(`Local proxy running on http://localhost:${PORT}`);
});
