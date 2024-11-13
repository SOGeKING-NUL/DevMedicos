const sqlite= require("sqlite3").verbose();
const util= require("util");
const {nanoid}= require("nanoid");

function BillNo(){
    const characters= "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return nanoid.customAlphabet(characters, 9);
}

