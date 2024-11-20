const {runQuery, allQuery}=require("../utils/connect_db.js");
const {generateID}= require("../utils/Generate_id.js");
const axios= require("axios");


// exports.additemtoShipments = async(req, res) => {
//     shipments = req.body;

//     if (!Array.isArray(shipments) || shipments.length === 0) {
//         return res.status(400).json({ error: "Request body must be an array of shipment items" 
//         });
//     }

//     try{
//         for(let shipment of shipments){
//             let {invoice_no, quantity, bonus, pack_of, item, mrp, rate}= shipment;

//             // Input validation
//             if (
//                 typeof invoice_no !== "string" || invoice_no.trim() === "" ||
//                 typeof quantity !== "number" || quantity < 0 ||
//                 (typeof bonus !== "undefined" && (typeof bonus !== "number" || bonus < 0)) ||
//                 typeof pack_of !== "number" || pack_of <= 0 ||
//                 typeof item !== "string" || item.trim() === "" ||
//                 typeof mrp !== "number" || mrp <= 0 ||
//                 typeof rate !== "number" || rate <= 0
//             ) {
//                 console.error("Validation error: Missing, invalid, or incorrect data types in input fields.");
//                 return res.status(400).json({ error: "Missing, invalid, or incorrect data types in input fields." });
//             }

//             try {
//                 invoice_no = invoice_no.trim();
//                 const total_quantity = quantity + bonus;
//                 const total_units = total_quantity * pack_of;
//                 const rate_per_unit = rate/pack_of;
//                 const mrp_per_unit = mrp/pack_of;
//                 const amount = rate * quantity;

//                 const items_data = {item, mrp_per_unit};
//                 const inventory_data = {invoice_no, item, total_units, rate_per_unit};
//                 let items_message;

//                 // Add to items
//                 try {
//                     const itemsResponse = await axios.post(`http://localhost:3500/api/items/additems`, items_data);
//                     items_message = "Item successfully added.";
//                     console.log(items_message);
//                 } catch(err) {
//                     if(err.response && err.response.status === 400) {
//                         items_message = `${item} already exists in items`;
//                         console.log(items_message);
//                     } else {
//                         throw new Error("Error occurred while adding item to items: " + err.message);
//                     }
//                 }

//                 // Add to inventory
//                 try {
//                     const inventoryResponse = await axios.post(`http://localhost:3500/api/inventory/addinventory`, inventory_data);
//                     console.log("Successfully added to inventory");
//                 } catch(err) {
//                     if (err.response && err.response.status === 400) {
//                         throw new Error("Duplicate inventory entry: " + err.message);
//                     } else {
//                         throw new Error("Error while adding to inventory: " + err.message);
//                     }
//                 }

//                 // Add to shipment
//                 try {
//                     const query = "INSERT INTO shipment(id, invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount) VALUES(?,?,?,?,?,?,?,?,?)";
//                     const id = generateID();
//                     const parsedBonus = bonus !== null && bonus !== undefined ? Math.floor(bonus) : null;

//                     await runQuery(query, [
//                         id, invoice_no, parseInt(quantity), parsedBonus, pack_of, 
//                         item, parseFloat(mrp), parseFloat(rate), parseFloat(amount)
//                     ]);

//                     console.log("Shipment invoice successfully inserted");
//                     return res.status(201).json({
//                         items_message,
//                         message: "Shipment invoice successfully inserted"
//                     });

//                 } catch (err) {
//                     if (err.code === "SQLITE_CONSTRAINT") {
//                         throw new Error("Duplicate shipment entry: A shipment with these exact details already exists.");
//                     } else {
//                         throw new Error("Error inserting shipment invoice: " + err.message);
//                     }
//                 }

//             } catch (error) {
//                 console.error("Error in inner block" + error.message);
//                 return res.status(400).json({ error: "Error in inner block" + error.message });
//             }
//         }
//     } 
//     catch (error) {
//         console.error("error in main try block" + error.message);
//         return res.status(400).json({ error: "error in main try block" + error.message });
//     }; 

// };


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
            const total_quantity = quantity + bonus;
            const total_units = total_quantity * pack_of;
            const rate_per_unit = rate / pack_of;
            const mrp_per_unit = mrp / pack_of;
            const amount = rate * quantity;

            const items_data = { item, mrp_per_unit };
            const inventory_data = { invoice_no, item, total_units, rate_per_unit };

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
                await axios.post(`http://localhost:3500/api/inventory/addinventory`, inventory_data);
            } catch (err) {
                if (err.message.includes("SQLITE_CONSTRAINT")) {
                    results.errors.push({
                        shipment,
                        message: `Duplicate inventory entry for item '${item}'.`,
                    });
                    continue;
                } else {
                    throw new Error(`Error adding to inventory: ${err.message}`);
                }
            }

            // Add to shipment
            try {
                const query = "INSERT INTO shipment(id, invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount) VALUES(?,?,?,?,?,?,?,?,?)";
                const id = generateID();
                const parsedBonus = bonus !== null && bonus !== undefined ? Math.floor(bonus) : null;

                await runQuery(query, [
                    id,
                    invoice_no,
                    parseInt(quantity),
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
                        message: "Duplicate shipment entry.",
                    });
                } else {
                    throw new Error(`Error inserting shipment invoice: ${err.message}`);
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



// exports.additemtoShipments = async (req, res) => {
//     const shipments = req.body;

//     if (!Array.isArray(shipments) || shipments.length === 0) {
//         return res.status(400).json({ error: "Request body must be an array of shipment items" });
//     }

//     const results = {
//         success: [],
//         warnings: [],
//         errors: [],
//     };

//     for (const shipment of shipments) {
//         let { invoice_no, quantity, bonus, pack_of, item, mrp, rate } = shipment;

//         // Input validation
//         if (
//             typeof invoice_no !== "string" || invoice_no.trim() === "" ||
//             typeof quantity !== "number" || quantity < 0 ||
//             (typeof bonus !== "undefined" && (typeof bonus !== "number" || bonus < 0)) ||
//             typeof pack_of !== "number" || pack_of <= 0 ||
//             typeof item !== "string" || item.trim() === "" ||
//             typeof mrp !== "number" || mrp <= 0 ||
//             typeof rate !== "number" || rate <= 0
//         ) {
//             results.errors.push({
//                 shipment,
//                 message: "Validation error: Missing, invalid, or incorrect data types in input fields.",
//             });
//             continue;
//         }

//         try {
//             invoice_no = invoice_no.trim();
//             const total_quantity = quantity + bonus;
//             const total_units = total_quantity * pack_of;
//             const rate_per_unit = rate / pack_of;
//             const mrp_per_unit = mrp / pack_of;
//             const amount = rate * quantity;

//             const items_data = { item, mrp_per_unit };
//             const inventory_data = { invoice_no, item, total_units, rate_per_unit };

//             // Add to items
//             try {
//                 await axios.post(`http://localhost:3500/api/items/additems`, items_data);
//                 results.success.push({ shipment, message: "Item successfully added." });
//             } catch (err) {
//                 if (err.response && err.response.status === 400) {
//                     results.warnings.push({
//                         shipment,
//                         message: `Item '${item}' already exists in the database.`,
//                     });
//                 } else {
//                     throw new Error(`Error adding item: ${err.message}`);
//                 }
//             }

//             // Add to inventory
//             try {
//                 await axios.post(`http://localhost:3500/api/inventory/addinventory`, inventory_data);
//             } 
//             catch (err) {
//                 if (err.code === "SQLITE_CONSTRAINT") {
//                     results.errors.push({
//                         shipment,
//                         message: "Duplicate inventory entry.",
//                     });
//                 } else {
//                     throw new Error(`Error inserting item to invntory: ${err.message}`);
//                 }
//             }
//             // catch (err) {
//             //     if (err.response && err.response.status === 400) {
//             //         results.errors.push({
//             //             shipment,
//             //             message: `Duplicate inventory entry for item '${item}'.`,
//             //         });
//             //         continue;
//             //     } else {
//             //         throw new Error(`Error adding to inventory: ${err.message}`);
//             //     }
//             // }

//             // Add to shipment
//             try {
//                 const query = "INSERT INTO shipment(id, invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount) VALUES(?,?,?,?,?,?,?,?,?)";
//                 const id = generateID();
//                 const parsedBonus = bonus !== null && bonus !== undefined ? Math.floor(bonus) : null;
    
//                 await runQuery(query, [
//                     id, invoice_no, parseInt(quantity), parsedBonus, pack_of, item, parseFloat(mrp), parseFloat(rate), parseFloat(amount)
//                 ]);
//                 console.log("Shipment invoice successfully inserted");
//                 results.success.push({ shipment, message: "Shipment invoice successfully inserted." });
//             } 
//             catch (err) {
//                 if (err.code === "SQLITE_CONSTRAINT") {
//                     results.errors.push({
//                         shipment,
//                         message: "Duplicate shipment entry.",
//                     });
//                 } else {
//                     throw new Error(`Error inserting shipment invoice: ${err.message}`);
//                 }
//             }
//         } catch (error) {
//             results.errors.push({
//                 shipment,
//                 message: `Error processing shipment: ${error.message}`,
//             });
//         }
//     }

//     // Return the consolidated result
//     return res.status(200).json(results);
// };


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
