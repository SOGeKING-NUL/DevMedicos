const { app } = require("express")();
const sqlite = require("sqlite3").verbose();        //verbose makes debugging easier

const db=  new sqlite.Database("../data/DevMedicos.db", (err)=>{
    if(err){
        console.log(err.message);  //API
    }
    else{
        console.log("you are connected")  ;  //API
    }
})


// function addnewItem(item){
//     const query= "INSERT INTO items(item) VALUES(?)";
//     db.run(query,[item], function(err){
//         if(err){
//             console.log(err.message);
//         }
//         else{
//             console.log("item successfully inserted");
//         };
//     });
// };

// addnewItem("Crocine");

function additemtoItems(item, callback){     //adds item to items from shipment if they dont exist
    const query= "SELECT item FROM items where item= (?)";
    db.get(query,[item], (err, row)=>{      //sqlite follows an error first convention and the db.get was supposed to return an entry if it existed or be undefined
        if(err){
            console.log("error while adding", err.message);
            callback(err);              //callback calls this error to the main function where this function is getting called
        }
        else if(!row){
            const insertQuery= "INSERT INTO items(item) VALUEs (?)";
            db.run(insertQuery,[item], (err)=>{
                if(err){
                    console.log("could add to itmes", err.message);
                    callback(err);
                }
                else{
                    console.log("successfully added to items");
                    callback(null)
                };
            });
        }
        else{
            console.log(`${item} already exits in items`);
            callback(null);
        };
    });
};

// function additemtoInventory(quantity, bonus, pack_of,item, mrp, rate, callback){
//         const total_quantity=quantity+bonus;
//         const total_units= total_quantity*pack_of;
//         const rate_per_unit=rate/pack_of;
//         const mrp_per_unit= mrp/pack_of;
        
//         const query= "INSERT INTO inventory(item, rate_per_unit, mrp_per_unit) VALUES(?, ?, ?)";

//         for 
// }

function addnewshipment(invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount){

    additemtoItems(item, (err)=>{
        if(err){
            console.log("error while adding to items from shipment" ,err.message);
            return;     // exits the function early so as not not add that file in shipment
        }
    })
    const query= "INSERT INTO shipment(invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount) VALUES(?,?,?,?,?,?,?,?)";

    bonus = bonus !== null ? Math.floor(bonus) : null; //makes bonus from deciaml to int, also no const added as bonus already declared

    db.run(query,[invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount], function(err){
        if(err){
            if (err.code === "SQLITE_CONSTRAINT") {
                console.log("Duplicate entry: A shipment with these exact details already exists.");
            } 
            else if(err.code!= "SQLITE_CONSTRAINT"){
                console.log("Error inserting shipment invoice:", err.message);
            }
        }
        else {
        console.log("Shipment invoice successfully inserted");
        }
    });
};

addnewshipment('S99PM_7U', 5, 2, 10,'Gelosil', 15, 10, 50);



db.close(function(err){
    if(err){
        console.log("error while close db", err.message);
    }   
    else{
        console.log("successfully closed");
    };
})