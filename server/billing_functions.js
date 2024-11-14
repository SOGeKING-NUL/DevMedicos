const sqlite= require("sqlite3").verbose();
const util= require("util");
const {customAlphabet}= require("nanoid");      //for a smaller bill number

function BillNo(){
    const characters= "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return customAlphabet(characters, 9);
}


console.log(BillNo());