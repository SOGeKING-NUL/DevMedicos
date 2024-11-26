const sqlite = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const dbFilePath = "./DevMedicos.db";

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




//inventory

const items = `
    CREATE TABLE IF NOT EXISTS items (
        id INTEGER PRIMARY KEY,
        item TEXT NOT NULL UNIQUE,
        mrp_per_unit DECIMAL(7,2) NOT NULL CHECK (mrp_per_unit >= 0)
    )
`;

const inventory = `
    CREATE TABLE IF NOT EXISTS inventory (
        id INTEGER PRIMARY KEY,
        created_on DATE NOT NULL DEFAULT CURRENT_DATE,
        invoice_no TEXT NOT NULL,
        item TEXT NOT NULL,
        units INTEGER NOT NULL DEFAULT 0,
        rate_per_unit DECIMAL(7,2) NOT NULL CHECK (rate_per_unit >= 0),
        FOREIGN KEY(invoice_no) REFERENCES shipment(invoice_no),
        FOREIGN KEY(item) REFERENCES items(item),
        UNIQUE(invoice_no, item, units, rate_per_unit)
    )`;

const shipment = `
    CREATE TABLE IF NOT EXISTS shipment (
        id INTEGER PRIMARY KEY,
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
    )`;


//billing

const bill= `CREATE TABLE IF NOT EXISTS bill (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
    bill_no INTEGER NOT NULL,
    discount DECIMAL(7,2),
    amount DECIMAL(7,2) NOT NULL CHECK(amount>=0)
    )`

const bill_items=`CREATE TABLE IF NOT EXISTS bill_items(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
        bill_no INTEGER NOT NULL,
        item TEXT NOT NULL,
        quantity INTEGER NOT NULL,
        mrp_per_unit DECIMAL(7,2) NOT NULL CHECK (mrp_per_unit >= 0),
        total_amount DECIMAL(7,2) NOT NULL CHECK (total_amount >=0)
        )`


db.serialize(() => {        
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

    db.run(bill, (err)=>{
        if(err){
            console.log("error while creating bill: ", err.message);
        }
    });

    db.run(bill_items, (err)=>{
        if(err){
            console.log("error while creating bill: ", err.message);
        }
    });    
    
    db.close((err) => {
        if (err) {
            console.error("Error closing database connection:", err.message);
        } else {
            console.log("Database connection closed.");
        }
    });
});
