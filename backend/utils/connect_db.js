const sqlite = require('sqlite3').verbose();
const util = require('util');

let db;
let runQuery;
let getQuery;

async function connectDB() {
    try {
        db = new sqlite.Database("data\DevMedicos.db");
        console.log("You are connected");
    } catch (err) {
        console.log("Error while connecting to DB:", err.message);
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



module.exports = { connectDB, closeDB, runQuery, getQuery };
