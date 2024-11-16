const {runQuery}=require("../utils/connect_db.js");
const {generateID}= require("../utils/Generate_id.js");
const axios= require("axios");


exports.additemtoShipments= async(req, res)=>{
    let {invoice_no, quantity, bonus, pack_of, item, mrp, rate}= req.body;

    const total_quantity=quantity+bonus;
    const total_units= total_quantity*pack_of;  //goes into inventory
    const rate_per_unit=rate/pack_of;       //goes into inventory
    const mrp_per_unit= mrp/pack_of;        //goes into items
    const amount=  rate*quantity;


    const items_data={
        item,
        mrp_per_unit
    };

    
    try{
        const itemsResponse= await axios.post(`http://localhost:3500/api/items/additems`,items_data);


        if(itemsResponse.status == 201){

            
            const query= "INSERT INTO shipment(id, invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount) VALUES(?,?,?,?,?,?,?,?,?)";

            bonus = (bonus !== null && bonus !== undefined) ? Math.floor(bonus) : null; //makes bonus from decimal to int, also no const added as bonus already declared

            const id=generateID();

            await runQuery(query,[id, invoice_no, parseInt(quantity), bonus, pack_of, item, parseFloat(mrp), parseFloat(rate), parseFloat(amount)]);            
            console.log("Shipment invoice successfully inserted"); 

                        
            const inventory_data={
                invoice_no,
                item, 
                total_units, 
                rate_per_unit
            }

            console.log({data:inventory_data});

           
            const inventoryResponse= await axios.post(`http://localhost:3500/api/inventory/addinventory`,inventory_data);

            res.status(201).json({message: "Shipment invoice successfully inserted"});


            // await additemtoInventory(invoice_no, item, total_units, rate_per_unit);


        }else{
            res.status(400).json({message: "failed to add item to shipment"});
        }
  
    }   
    catch(err){
        if (err.code === "SQLITE_CONSTRAINT") {
            console.log("Duplicate entry: A shipment with these exact details already exists.");
            res.status(400).json({ message: "Duplicate entry: A shipment with these exact details already exists." });
        } 
        else if(err.code!= "SQLITE_CONSTRAINT"){
            console.log("Error inserting shipment invoice:", err.message);
            res.status(500).json({ error: err.message });
        };
    };
};



// app.get('/api/shipments', async(req, res) => {
//     const query = `SELECT * FROM shipment`;
//     await db.all(query, [], (err, rows) => {
//         if (err) {
//             res.status(500).json({ error: err.message });
//             return;
//         }
//         res.json({
//             shipments: rows
//         });
//     });
// });