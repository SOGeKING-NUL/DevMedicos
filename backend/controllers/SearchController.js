const { allQuery } = require("../utils/connect_db");

exports.searchinItems= async(req, res) => {
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

  allQuery(query, [`%${queryText}%`], (err, rows) => {
    if (err) {
      console.error(err.message);
      return res.status(500).json({ error: 'Database query failed' });
    }
    const suggestions = rows.map(row => row.item);
    res.json({ suggestions });
  });
};

