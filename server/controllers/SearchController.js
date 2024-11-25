const { allQuery, runQuery, getQuery } = require('../utils/connect_db');

exports.searchinItems = async (req, res) => {
  try {
    const queryText = req.query.q;

    if (!queryText) {
      return res.json({ suggestions: [] });
    }

    const query = `
      SELECT item 
      FROM items 
      WHERE item LIKE ? 
      ORDER BY item ASC 
      LIMIT 5;
    `;

    const rows = await allQuery(query, [`%${queryText}%`]);

    const suggestions = rows.map(row => row.item); 
    return res.json({ suggestions }); 
    
  } catch (err) {
    console.error("Error executing search query:", err.message);
    return res.status(500).json({ error: 'Database query failed' });
  }
};


exports.searchiteminInventory = async (req, res) => {
  try {
    const query = `SELECT * FROM items`;
    const items = await allQuery(query, []); 

    if (items.length === 0) {
      console.log("No items found in the inventory.");
      return res.status(404).json({ message: "No items found in the inventory." });
    }

    const results= [];

    for(const x of items){
      const unit_query = `SELECT SUM(units) AS total_units FROM inventory WHERE item = ?;`;

      const result = await allQuery(unit_query, [x.item]);
      const totalUnits = result[0]?.total_units || 0; //result[0] has the amount in it and the ? makes sure that undefined/null values are handled properly. e.g. of result is : [{ total_units: 150 }]  
      
      console.log(`${totalUnits} units of ${x.item} with mrp ${x.mrp_per_unit} `)
      results.push({
        item : x.item,
        units: totalUnits,
        mrp: x.mrp_per_unit
      });
    };

    return res.json(results);


  } catch (err) {
    console.error("Error fetching items from inventory:", err.message);
    return res.status(500).json({ error: "Internal server error." });
  }
};
