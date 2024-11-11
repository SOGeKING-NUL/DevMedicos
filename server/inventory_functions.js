const { app } = require("express")();
const sqlite = require("sqlite3").verbose();        //verbose makes debugging easier

let db;

async function connectDB(){

    try{
        db= new sqlite.Database("../data/inventory.db");
        console.log("you are connected");  //API
    }catch(err){
            console.log(err.message);  //API
        };
};

function closeDB(){

    try{
        db.close();
        console.log("Successfully closed DB");
    }catch(err){
        console.log("error while close db", err.message);
    };
};

async function additemtoItems(item) {
    try {
      // Check if the item already exists in the items table
      const query = "SELECT item FROM items WHERE item = ?";
      const row = await new Promise((resolve, reject) => {
        db.get(query, [item], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
  
      if (!row) {
        // If item does not exist, insert it into items table
        const insertQuery = "INSERT INTO items(item) VALUES (?)";
        await new Promise((resolve, reject) => {
          db.run(insertQuery, [item], (err) => {
            if (err) reject(err);
            else resolve();
          });
        });
        console.log("Successfully added to items");
      } else {
        console.log(`${item} already exists in items`);
      }
    } catch (err) {
      console.log("Error while adding item to items:", err.message);
    }
  }
  
async function additemtoInventory(quantity, bonus, pack_of,item, mrp, rate){
    try{
        const total_quantity=quantity+bonus;
        const total_units= total_quantity*pack_of;
        const rate_per_unit=rate/pack_of;
        const mrp_per_unit= mrp/pack_of;
        
        const query= "INSERT INTO inventory(item, rate_per_unit, mrp_per_unit) VALUES(?, ?, ?)";

        for(let i=0; i<total_units; i++){
            await db.run(query,[item, rate_per_unit, mrp_per_unit]);
        };
        console.log("Sucessfully added to inventory");

    }catch(err){
        console.log("err while adding to inventory", err.message);
    };
};
async function addnewshipment(invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount){

    try{
        await additemtoItems(item);

        const query= "INSERT INTO shipment(invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount) VALUES(?,?,?,?,?,?,?,?)";

        bonus = bonus !== null ? Math.floor(bonus) : null; //makes bonus from decimal to int, also no const added as bonus already declared

        await db.run(query,[invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount]);

        await additemtoInventory(quantity, bonus, pack_of, item, mrp, rate);

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

    await connectDB();
    await addnewshipment('S99PMEEM_7U', 1, null, 10,'apples', 230, 70, 34556); //invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount
    closeDB();

    

}

main();

