const sqlite = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

// Define the path to the database file
const dbFilePath = "./DevMedicos.db";

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




// //inventory

// const items = `
//     CREATE TABLE IF NOT EXISTS items (
//         id INTEGER PRIMARY KEY,
//         item TEXT NOT NULL UNIQUE,
//         mrp_per_unit DECIMAL(7,2) NOT NULL CHECK (mrp_per_unit >= 0)
//     )
// `;

// const inventory = `
//     CREATE TABLE IF NOT EXISTS inventory (
//         id INTEGER PRIMARY KEY,
//         created_on DATE NOT NULL DEFAULT CURRENT_DATE,
//         invoice_no TEXT NOT NULL,
//         item TEXT NOT NULL,
//         units INTEGER NOT NULL DEFAULT 0,
//         rate_per_unit DECIMAL(7,2) NOT NULL CHECK (rate_per_unit >= 0),
//         FOREIGN KEY(invoice_no) REFERENCES shipment(invoice_no),
//         FOREIGN KEY(item) REFERENCES items(item),
//         UNIQUE(invoice_no, item, units, rate_per_unit)
//     )`;

// const shipment = `
//     CREATE TABLE IF NOT EXISTS shipment (
//         id INTEGER PRIMARY KEY,
//         invoice_no TEXT NOT NULL,
//         created_on DATE NOT NULL DEFAULT CURRENT_DATE,
//         quantity INTEGER NOT NULL CHECK (quantity >= 0),
//         bonus INTEGER CHECK (bonus >= 0),
//         pack_of DECIMAL(5,2) NOT NULL CHECK (pack_of >= 0),
//         item TEXT NOT NULL,
//         mrp DECIMAL(7,2) NOT NULL CHECK (mrp >= 0),
//         rate DECIMAL(7,2) NOT NULL CHECK (rate >= 0),
//         amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),
//         FOREIGN KEY(item) REFERENCES items(item),
//         UNIQUE(invoice_no, created_on, quantity, bonus, pack_of, item, mrp, rate, amount)
//     )`;



// //billing

// // const bill= `CREATE TABLE IF NOT EXISTS bill (
// //     bill_no INTEGER PRIMARY KEY AUTOINCREMENT,
// //     created_on DATE DEFAULT CURRENT_DATE,
// //     total_bill_sales DECIMAL(7,2) NOT NULL CHECK(total_bill_sales>=0),
// //     total_profit DECIAML(7,2) NOT NULL
// //     )`

const bill=`CREATE TABLE IF NOT EXISTS bill(
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        created_on DATETIME DEFAULT CURRENT_TIMESTAMP,
        bill_no INTEGER,
        item TEXT NOT NULL,
        quanitity INTEGER NOT NULL,
        rate_per_unit DECIMAL(7,2) NOT NULL CHECK (rate_per_unit >= 0),
        mrp_per_unit DECIMAL(7,2) NOT NULL CHECK (mrp_per_unit >= 0),
        total_sales DECIMAL(7,2) NOT NULL CHECK (total_sales >=0),
        total_profit DECIMAL(7,2) NOT NULL,
        inventory_id INTEGER NOT NULL,
        FOREIGN KEY (rate_per_unit) REFERENCES inventory(rate_per_unit),
        FOREIGN KEY (mrp_per_unit) REFERENCES items(mrp_per_unit),
        FOREIGN KEY (item) REFERENCES items(item),
        FOREIGN KEY (inventory_id) REFERENCES inventory(id),
        FOREIGN KEY (bill_no) REFERENCES bill(bill_no)
        )`


// db.serialize(() => {        //makes everything execute in order
//     db.run(items, (err) => {
//         if (err) {
//             console.error("Error creating items table:", err.message);
//         }
//     });

//     db.run(inventory, (err) => {
//         if (err) {
//             console.error("Error creating inventory table:", err.message);
//         }
//     });

//     db.run(shipment, (err) => {
//         if (err) {
//             console.error("Error creating shipment table:", err.message);
//         }
//     });

//     db.run(bill, (err)=>{
//         if(err){
//             console.log("error while creating bill: ", err.message);
//         }
//     });    
    

//     // Close the database connection after all queries are done
//     db.close((err) => {
//         if (err) {
//             console.error("Error closing database connection:", err.message);
//         } else {
//             console.log("Database connection closed.");
//         }
//     });
// });


// const ad= `ALTER TABLE bill
// ADD created_on DATETIME DEFAULT CURRENT_TIMESTAMP`;

db.run(`DROP TABLE bill_item`, (err)=>{
    if(err){
        console.log("error while creating add: ", err.message);
    }
});