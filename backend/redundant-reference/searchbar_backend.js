const express = require('express');
const cors = require('cors'); // Import the cors package
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3500;

// Connect to SQLite database
const db = new sqlite3.Database("../../data/DevMedicos.db");

// Middleware for parsing query parameters
app.use(express.json());
app.use(cors());

// Search endpoint
app.get('/api/search', (req, res) => {
  const queryText = req.query.q;
  if (!queryText) {
    return res.json({ suggestions: [] });
  }

  const query = `
    SELECT item 
    FROM items 
    WHERE item LIKE ? 
    ORDER BY item ASC 
    LIMIT 8;
  `;

  db.all(query, [`%${queryText}%`], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Database query failed' });
    }
    const suggestions = rows.map(row => row.item);
    res.json({ suggestions });
  });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
