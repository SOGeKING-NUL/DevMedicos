const sqlite = require("sqlite3").verbose();
const fs = require("fs");
const path = require("path");

const dbFilePath = "./DevMedicosUsers.db";

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





const Users=`
    CREATE TABLE IF NOT EXISTS users(
        id INTEGER PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT NOT NULL
    )`;



db.run(Users, (err)=>{
    if(err){
        console.log("Error while creating user" + err.message)
    };
    });