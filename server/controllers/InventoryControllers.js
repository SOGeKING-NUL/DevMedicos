const {runQuery, allQuery}=require("../utils/connect_db.js");
const{generateID}= require("../utils/Generate_id");
const axios = require('axios');


exports.additemtoInventory= async(req,res)=>{
    let {invoice_no, item, total_units, rate_per_unit}= req.body;
    item = item.trim().toLowerCase();


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

exports.update_inventory = async (req, res) => {
    const item_array = req.body;

    try {
        await runQuery("BEGIN TRANSACTION");

        let errorOccurred = false;
        let insufficientItem = null;

        for (let { item, quantity } of item_array) {
            const getInventoryQuery = "SELECT id, units FROM inventory WHERE item = ? ORDER BY created_on ASC, id ASC";
            const updateInventoryQuery = "UPDATE inventory SET units = ? WHERE id = ?";
            const deleteInventoryQuery = "DELETE FROM inventory WHERE id = ?";

            const rows = await allQuery(getInventoryQuery, [item]);

            let remainingQuantity = quantity;

            for (let row of rows) {
                if (remainingQuantity <= 0) break;

                const { id, units } = row;

                if (units > remainingQuantity) {
                    await runQuery(updateInventoryQuery, [units - remainingQuantity, id]);
                    remainingQuantity = 0;
                } else {
                    await runQuery(deleteInventoryQuery, [id]);
                    remainingQuantity -= units;
                }
            }

            if (remainingQuantity > 0) {
                errorOccurred = true;
                insufficientItem = item;
                break;
            }
        }

        if (errorOccurred) {
            await runQuery("ROLLBACK");
            return res.status(400).json({
                error: `Not enough items in inventory to fulfill the bill for ${insufficientItem}`,
                insufficientItem: insufficientItem
            });
        }

        let bill_no;
        
        try {
            const response = await axios.post('http://localhost:3500/api/bill/additemtobill', item_array);
            bill_no= response.data.bill_no;
            console.log('Items added to bill:', response.data.message);
        } catch (axiosError) {
            console.error("Error while adding items to the bill:", axiosError.message);
            await runQuery("ROLLBACK");
            return res.status(500).json({ error: "Failed to add items to the bill: " + axiosError.message });
        }

        await runQuery("COMMIT");

        return res.status(200).json({ message: "Items successfully billed and removed from inventory",
            bill_no
        });

    } catch (error) {
        console.error("General error occurred while addin to inventory:", error.message);
        await runQuery("ROLLBACK");
        return res.status(500).json({ error: "General error occurred: " + error.message });
    }
};

