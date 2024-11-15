const { app } = require("express")();
const sqlite = require("sqlite3").verbose();        //verbose makes debugging easier
const util=  require("util");
const { v4: uuidv4 } = require('uuid');
const { generateID } = require('./Generate_id.js');
const {connectDB, closeDB}= require('./')


let db, runQuery, getQuery;

async function connectDB(){

    try{
        db= new sqlite.Database("../data/DevMedicos.db");
        console.log("you are connected"); 

        runQuery= util.promisify(db.run.bind(db));
        getQuery= util.promisify(db.get.bind(db)); 
        console.log(runQuery, getQuery)

    }catch(err){
            console.log(err.message);  //API
        };
};

async function closeDB(){

    try{
        db.close();
        console.log("Successfully closed DB");
    }catch(err){
        console.log("error while close db", err.message);
    };
};

async function additemtoItems(item, mrp_per_unit) {
    try {
      // Check if the item already exists in the items table
      const query = "SELECT item FROM items WHERE item = ?";
      const row = await getQuery(query, [item]);

      if (!row) {
        // If item does not exist, insert it into items table
        const insertQuery = "INSERT INTO items(id,item, mrp_per_unit) VALUES (?, ?, ?)";

        const id= generateID();

        await getQuery(insertQuery, [id,item, parseFloat(mrp_per_unit)]);
        console.log("Successfully added to items");
      } 
      
      else {
        console.log(`${item} already exists in items`);
      }
    } catch (err) {
      console.error("Error while adding item to items:", err.message);
    }
  }
  
async function additemtoInventory(invoice_no, item, total_units, rate_per_unit){
    try{
        
        const query= "INSERT INTO inventory(id, invoice_no, item, units, rate_per_unit) VALUES(?, ?, ?, ?, ?)";

        const id=generateID();

        await runQuery(query, [id, invoice_no, item, total_units, parseFloat(rate_per_unit)]);
        console.log("Sucessfully added to inventory");

    }catch(err){
        console.log("err while adding to inventory", err.message);
    };
};

async function additemtoShipment(invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount){

    try{
        const total_quantity=quantity+bonus;
        const total_units= total_quantity*pack_of;
        const rate_per_unit=rate/pack_of;
        const mrp_per_unit= mrp/pack_of;

        await additemtoItems(item, mrp_per_unit);

        const query= "INSERT INTO shipment(id, invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount) VALUES(?,?,?,?,?,?,?,?,?)";

        bonus = bonus !== null ? Math.floor(bonus) : null; //makes bonus from decimal to int, also no const added as bonus already declared
        const id=generateID();

        await runQuery(query,[id, invoice_no, quantity, bonus, pack_of, item, parseFloat(mrp), parseFloat(rate), parseFloat(amount)]);

        await additemtoInventory(invoice_no, item, total_units, rate_per_unit);

        console.log("Shipment invoice successfully inserted");
    }
    
    catch(err){
        if (err.code === "SQLITE_CONSTRAINT") {
            console.log("Duplicate entry: A shipment with these exact details already exists.");
        } 
        else if(err.code!= "SQLITE_CONSTRAINT"){
            console.log("Error inserting shipment invoice:", err.message);
        };
    };
};

async function main(){

    try{
        await connectDB();
        await additemtoShipment('ELSSSSS2988C', 9, null, 10,'ginger', 21, 31, 500); //invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount
        // await additemtoShipment('MSS129OER', 3, 2, 10,'leg', 90, 70, 210);
        await closeDB();
    }catch(err){
        console.error("error in main function", err.message)
    };
};
main();


module.exports = { additemtoShipment };