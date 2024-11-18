const { allQuery, runQuery } = require('../utils/connect_db');

exports.searchinItems= async(req, res) => {
  const queryText = req.query.q;
  if (!queryText) {return res.json({ suggestions: [] });
  }

  const query = `
    SELECT item 
    FROM items 
    WHERE item LIKE ? 
    ORDER BY item ASC 
    LIMIT 8;
  `;

  try {
        // Call allQuery and await its result
        const rows = await allQuery(query, [`%${queryText}%`]);
        
        // Process results
        const suggestions = rows.map((row) => row.item);
        return res.json({ suggestions });
    } catch (err) {
        // Handle errors
        console.error("Database query failed:", err.message);
        return res.status(500).json({ error: "Database query failed" });
    }

};

exports.searchiteminInventory = async (req, res) => {
  const item = req.query.q;
  if (!item) {
      return res.json({ error: "no item given" });
  }

  const query = `SELECT SUM(units) AS total_units FROM inventory WHERE item = ?;`;

  try {
      const result = await allQuery(query, [item]);
      const totalUnits = result[0]?.total_units || 0;   //result[0] has the amount in it and the ? makes sure that undefined/null values are handled properly. e.g. of result is : [{ total_units: 150 }] 
      
      console.log(`total units of ${item} are: ${totalUnits}`);
      res.json({ total_units: totalUnits });
  } catch (err) {
      console.error("Error executing query:", err.message);
      return res.status(500).json({ error: err.message });
  }
};

