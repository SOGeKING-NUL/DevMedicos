const sqlite = require('sqlite3').verbose();
const util = require('util');

let db;

async function connectDB() {
    try {
        db = new sqlite.Database("../../data/DevMedicos.db");
        console.log("You are connected");

        // Create tables if they don't exist
        await createTables();
        console.log("Tables created/verified");
    } catch (err) {
        console.log("Error while connecting to DB:", err.message);
    }
}

async function createTables() {
    const itemsTable = `
        CREATE TABLE IF NOT EXISTS items (
            id TEXT PRIMARY KEY,
            item TEXT NOT NULL,
            mrp_per_unit REAL NOT NULL
        )`;

    const shipmentTable = `
        CREATE TABLE IF NOT EXISTS shipment (
            invoice_id TEXT PRIMARY KEY,
            supplier TEXT NOT NULL,
            invoice_date TEXT NOT NULL,
            invoice_amount REAL NOT NULL,
            payment_status TEXT NOT NULL
        )`;

    try {
        await runQuery(itemsTable, []);
        await runQuery(shipmentTable, []);
    } catch (err) {
        console.log("Error creating tables:", err.message);
    }
}

async function closeDB() {
    try {
        if (db) {
            db.close();
            console.log("Successfully closed DB");
        } else {
            console.log("DB connection is not open");
        }
    } catch (err) {
        console.log("Error while closing DB:", err.message);
    }
}

async function runQuery(query, params) {
    try {
        const promisifiedRun = util.promisify(db.run.bind(db));
        return await promisifiedRun(query, params);
    } catch (err) {
        console.log("Error executing runQuery:", err.message);
        throw err;
    }
}

async function getQuery(query, params) {
    try {
        const promisifiedGet = util.promisify(db.get.bind(db));
        return await promisifiedGet(query, params);
    } catch (err) {
        console.log("Error executing getQuery:", err.message);
        throw err;
    }
}

module.exports = { connectDB, closeDB, runQuery, getQuery };