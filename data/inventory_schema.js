const sqlite = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Define the path to the database file
const dbFilePath = "./inventory.db";

// Check if the directory exists
const directoryPath = path.dirname(dbFilePath);

if (!fs.existsSync(directoryPath)) {
    fs.mkdirSync(directoryPath, { recursive: true });
    console.log(`Directory ${directoryPath} was created.`);
}

const db = new sqlite.Database(dbFilePath, (err) => {
    if (err) {
        console.log("Error opening database:", err.message);
    } else {
        console.log("You are connected to the database.");
    }
});

const items = `
    CREATE TABLE IF NOT EXISTS items (
        id TEXT PRIMARY KEY,
        item TEXT NOT NULL UNIQUE,
        mrp_per_unit DECIMAL(7,2) NOT NULL CHECK (mrp_per_unit >= 0)
    )
`;

const inventory = `
    CREATE TABLE IF NOT EXISTS inventory (
        id TEXT PRIMARY KEY,
        created_on DATE NOT NULL DEFAULT CURRENT_DATE,
        item TEXT NOT NULL UNIQUE,
        units INTEGER NOT NULL DEFAULT 0,
        rate_per_unit DECIMAL(7,2) NOT NULL CHECK (rate_per_unit >= 0),
        FOREIGN KEY(item) REFERENCES items(item)
    )
`;

const shipment = `
    CREATE TABLE IF NOT EXISTS shipment (
        id TEXT PRIMARY KEY,
        invoice_no TEXT NOT NULL,
        created_on DATE NOT NULL DEFAULT CURRENT_DATE,
        quantity INTEGER NOT NULL CHECK (quantity >= 0),
        bonus INTEGER CHECK (bonus >= 0),
        pack_of DECIMAL(5,2) NOT NULL CHECK (pack_of >= 0),
        item TEXT NOT NULL,
        mrp DECIMAL(7,2) NOT NULL CHECK (mrp >= 0),
        rate DECIMAL(7,2) NOT NULL CHECK (rate >= 0),
        amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
        FOREIGN KEY(item) REFERENCES items(item),
        UNIQUE(invoice_no, created_on, quantity, bonus, pack_of, item, mrp, rate, amount)
    )
`;

db.serialize(() => {        //makes everything execute in order
    db.run(items, (err) => {
        if (err) {
            console.error("Error creating items table:", err.message);
        }
    });

    db.run(inventory, (err) => {
        if (err) {
            console.error("Error creating inventory table:", err.message);
        }
    });

    db.run(shipment, (err) => {
        if (err) {
            console.error("Error creating shipment table:", err.message);
        }
    });

    // Close the database connection after all queries are done
    db.close((err) => {
        if (err) {
            console.error("Error closing database connection:", err.message);
        } else {
            console.log("Database connection closed.");
        }
    });
});
