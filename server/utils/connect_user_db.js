const sqlite = require('sqlite3').verbose();
const util = require('util');
const argon2 = require("argon2");
const jwt = require("jsonwebtoken");
const JWT_SECRET = "95dddabcc18706af4a346037d690b623c0b664a64ff4eb7ee12bc8e9d84b15d8";

let db;

async function connectDB() {
    try {
        db = new sqlite.Database("../models/DevMedicosUsers.db");
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

async function addUser(username, password) {
    try {
        const existingUser = await getQuery("SELECT * FROM users WHERE username = ?", [username]);

        if (existingUser) {
            console.log("Username already exists. Please choose a different username.");
            return; 
        }

        const combined = username + password;
        const hashedPassword = await argon2.hash(combined);
        console.log('Hashed Password:', hashedPassword);

        await runQuery(`INSERT INTO users(username, password) VALUES (?, ?)`, [username, hashedPassword]);
        console.log('User added to DB');
    } catch (err) {
        console.error("Error storing user:", err.message);
        throw err;
    }
}

async function verifyUser(username, password) {
    try {
        const storedUser = await getQuery("SELECT password FROM users WHERE username = ?", [username]);

        if (storedUser && storedUser.password) {
            const combined = username + password;

            const isPasswordCorrect = await argon2.verify(storedUser.password, combined);

            if (isPasswordCorrect) {

                const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: "1h" });
                console.log("Password is correct! Token generated.");
                return token;
            } else {
                console.log("Password is incorrect.");
                return null; 
            }
        } else {
            console.log("User not found.");
            return null; 
        }
    } catch (err) {
        console.error("Error verifying password:", err.message);
        throw err;
    }
}

module.exports = { connectDB, closeDB, runQuery, getQuery, addUser, verifyUser};