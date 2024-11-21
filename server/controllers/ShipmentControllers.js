const {runQuery, getQuery, allQuery}=require("../utils/connect_db.js");
const {generateID}= require("../utils/Generate_id.js");
const axios= require("axios");

exports.additemtoShipments = async (req, res) => {
    const shipments = req.body;

    if (!Array.isArray(shipments) || shipments.length === 0) {
        return res.status(400).json({ error: "Request body must be an array of shipment items" });
    }

    const results = {
        success: [],
        warnings: [],
        errors: [],
    };

    for (const shipment of shipments) {
        let { invoice_no, quantity, bonus, pack_of, item, mrp, rate } = shipment;

        // Input validation
        if (
            typeof invoice_no !== "string" || invoice_no.trim() === "" ||
            typeof quantity !== "number" || quantity < 0 ||
            (typeof bonus !== "undefined" && (typeof bonus !== "number" || bonus < 0)) ||
            typeof pack_of !== "number" || pack_of <= 0 ||
            typeof item !== "string" || item.trim() === "" ||
            typeof mrp !== "number" || mrp <= 0 ||
            typeof rate !== "number" || rate <= 0
        ) {
            results.errors.push({
                shipment,
                message: "Validation error: Missing, invalid, or incorrect data types in input fields.",
            });
            continue;
        }

        try {
            invoice_no = invoice_no.trim();
            const total_quantity = quantity + (bonus || 0); // Handle null/undefined bonus
            const total_units = total_quantity * pack_of;
            const rate_per_unit = rate / pack_of;
            const mrp_per_unit = mrp / pack_of;
            const amount = rate * quantity;

            const items_data = { item, mrp_per_unit };
            const inventory_data = { invoice_no, item, total_units, rate_per_unit };

            // Pre-check: Ensure duplicate entries are caught before database operations
            try {
                const preCheckQuery = `SELECT COUNT(*) AS count FROM shipment WHERE invoice_no = ? AND item = ?`;
                const preCheckResult = await getQuery(preCheckQuery, [invoice_no, item]);
                if (preCheckResult.count > 0) {
                    results.errors.push({
                        shipment,
                        message: `Duplicate shipment entry for invoice '${invoice_no}' and item '${item}'.`,
                    });
                    continue;
                }
            } catch (preCheckError) {
                console.error("Error during pre-check:", preCheckError.message);
                throw preCheckError;
            }

            // Add to items
            try {
                await axios.post(`http://localhost:3500/api/items/additems`, items_data);
                results.success.push({ shipment, message: "Item successfully added." });
            } catch (err) {
                if (err.response && err.response.status === 400) {
                    results.warnings.push({
                        shipment,
                        message: `Item '${item}' already exists in the database.`,
                    });
                } else {
                    throw new Error(`Error adding item: ${err.message}`);
                }
            }

            // Add to inventory
            try {
                const itemsResponse = await axios.post(`http://localhost:3500/api/inventory/addinventory`, inventory_data);
                inventory_message = "Item successfully added to inventory.";
                console.log(inventory_message);
            } catch(err) {
                if(err.response && err.response.status === 400) {
                    inventory_message = `${item} already exists in inventory`;
                    console.log(inventory_message);
                } else {
                    throw new Error("Error occurred while adding item to items: " + err.message);
                }
            }

            // Add to shipment
            try {
                const shipmentInsertQuery = `INSERT INTO shipment (id, invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`;
                const shipmentId = generateID();
                const parsedBonus = bonus !== null && bonus !== undefined ? Math.floor(bonus) : null;

                await runQuery(shipmentInsertQuery, [
                    shipmentId,
                    invoice_no,
                    parseInt(quantity, 10),
                    parsedBonus,
                    pack_of,
                    item,
                    parseFloat(mrp),
                    parseFloat(rate),
                    parseFloat(amount),
                ]);
                results.success.push({ shipment, message: "Shipment invoice successfully inserted." });
            } catch (err) {
                if (err.message.includes("SQLITE_CONSTRAINT")) {
                    results.errors.push({
                        shipment,
                        message: `SQLITE_CONSTRAINT: Duplicate shipment entry for invoice '${invoice_no}' and item '${item}'.`,
                    });
                } else {
                    throw new Error(`Unexpected error while adding shipment: ${err.message}`);
                }
            }
        } catch (error) {
            results.errors.push({
                shipment,
                message: `Error processing shipment: ${error.message}`,
            });
        }
    }

    // Return the consolidated result
    return res.status(200).json(results);
};

exports.getShipments= async(req,res)=>{
    try{
        const query= `SELECT * FROM SHIPMENT`;
        const shipment_rows= await allQuery(query,[])
        return res.status(200).json({
            shipment_rows
        });

    }catch(err){
        
        console.log("error while fetching shipments" + err);
        return res.status(500).json({
            error: "error while fetching shipments" + err
        });
        
    };
};
