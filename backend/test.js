const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const port = 3000; // Backend runs on a different port

let db = new sqlite3.Database('data\DevMedicos.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database.');
    }
});

app.get('/api/shipments', (req, res) => {
    const query = `SELECT * FROM shipment`;
    db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            shipments: rows
        });
    });
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
