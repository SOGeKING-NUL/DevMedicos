const {runQuery}=require("../utils/connect_db.js");
const{generateID}= require("../utils/Generate_id");

exports.additemtoInventory= async(req,res)=>{
    const {invoice_no, item, total_units, rate_per_unit}= req.body;

    try{
        const query= "INSERT INTO inventory(id, invoice_no, item, units, rate_per_unit) VALUES(?, ?, ?, ?, ?)";

        const id=generateID();

        await runQuery(query, [id, invoice_no, item, total_units, parseFloat(rate_per_unit)]);
        console.log("Sucessfully added to inventory");
        res.status(201).json({message: "Sucessfully added to inventory"});

    }catch(err){
        console.log("err while adding to inventory", err.message);
        if (err.code === "SQLITE_CONSTRAINT" && err.message.includes("UNIQUE")) {
            return res.status(409).json({error: "Duplicate inventory entry. This item already exists."});
        }

        //for other errors
        res.status(400).json({error: "Failed to add item to inventory: " + err.message});
    };
};




