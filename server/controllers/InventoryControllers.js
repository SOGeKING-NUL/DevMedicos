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

exports.toBill = async (req, res) => {
    const { item, quantity } = req.body;

    const db = new sqlite3.Database('./data/DevMedicos.db');

    try {
        db.serialize(() => {
            db.run("BEGIN TRANSACTION");

            const getInventoryQuery = "SELECT id, units FROM inventory WHERE item = ? ORDER BY created_on ASC, id ASC";
            const updateInventoryQuery = "UPDATE inventory SET units = ? WHERE id = ?";
            const deleteInventoryQuery = "DELETE FROM inventory WHERE id = ?";

            db.all(getInventoryQuery, [item], (err, rows) => {
                if (err) {
                    db.run("ROLLBACK");
                    console.error("Error fetching inventory:", err.message);
                    return res.status(500).json({ error: "Error fetching inventory: " + err.message });
                }

                let remainingQuantity = quantity;
                for (let row of rows) {
                    if (remainingQuantity <= 0) break;

                    const { id, units } = row;

                    if (units > remainingQuantity) {
                        db.run(updateInventoryQuery, [units - remainingQuantity, id], (err) => {
                            if (err) {
                                db.run("ROLLBACK");
                                console.error("Error updating inventory:", err.message);
                                return res.status(500).json({ error: "Error updating inventory: " + err.message });
                            }
                        });
                        remainingQuantity = 0;
                    } else {
                        db.run(deleteInventoryQuery, [id], (err) => {
                            if (err) {
                                db.run("ROLLBACK");
                                console.error("Error deleting inventory:", err.message);
                                return res.status(500).json({ error: "Error deleting inventory: " + err.message });
                            }
                        });
                        remainingQuantity -= units;
                    }
                }

                if (remainingQuantity > 0) {
                    db.run("ROLLBACK");
                    return res.status(400).json({ error: "Not enough items in inventory to fulfill the bill" });
                }

                db.run("COMMIT", (err) => {
                    if (err) {
                        console.error("Error committing transaction:", err.message);
                        return res.status(500).json({ error: "Error committing transaction: " + err.message });
                    }
                    res.status(200).json({ message: "Items successfully billed and removed from inventory" });
                });
            });
        });
    } catch (error) {
        console.error("General error occurred:", error.message);
        res.status(500).json({ error: "General error occurred: " + error.message });
    } finally {
        db.close();
    }
};


