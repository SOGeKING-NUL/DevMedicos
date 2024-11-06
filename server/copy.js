const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const app = express();
const PORT = 3000;

// Middleware to parse JSON bodies
app.use(express.json());

// Open the SQLite database
const db = new sqlite3.Database('./database.db');

// Define the endpoint to add items to inventory
app.post('/inventory', (req, res) => {
    const { medicine, manufacturer, quantity, sale_price_per_unit } = req.body;

    // Validate input data
    if (!medicine || !quantity || !sale_price_per_unit) {
        return res.status(400).json({ error: 'Required fields missing' });
    }

    // Insert the item into the inventory table
    const sql = `INSERT INTO inventory (medicine, manufacturer, quantity, sale_price_per_unit)
                 VALUES (?, ?, ?, ?)`;
    db.run(sql, [medicine, manufacturer || 'Generic', quantity, sale_price_per_unit], function(err) {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Send a success response with the new item ID
        res.json({ id: this.lastID, message: 'Item added successfully' });
    });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
