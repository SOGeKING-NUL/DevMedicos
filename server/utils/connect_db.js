const sqlite = require('sqlite3').verbose();
const util = require('util');
const path = require('path');

let db;
const dbPath = path.resolve(__dirname, '../models/DevMedicos.db'); 
async function connectDB() {
    try {
        db = new sqlite.Database(dbPath);
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

async function allQuery(query, params) {
    try {
        const promisifiedAll = util.promisify(db.all.bind(db));
        return await promisifiedAll(query, params);
    } catch (err) {
        console.log("Error executing allQuery:", err.message);
        throw err;
    }
 }

module.exports = { connectDB, closeDB, runQuery, getQuery, allQuery };