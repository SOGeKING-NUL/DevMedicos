const express = require('express');
const sqlite3 = require('sqlite3').verbose();

const app = express();
app.use(express.json());
let db = new sqlite3.Database('../data/DevMedicos.db', (err) => {
    if (err) {
        console.error('Error opening database:', err.message);
    } else {
        console.log('Connected to the database.');
    }
});

app.get('/api/shipments', async(req, res) => {
    const query = `SELECT * FROM shipment`;
    await db.all(query, [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json({
            shipments: rows
        });
    });
});

app.post('/api/shipments',(req, res)=>{})

app.listen(3500, () => {
    console.log(`Server running on port 3500`);
});
