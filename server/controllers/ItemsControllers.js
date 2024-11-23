const {runQuery, getQuery, allQuery}=require("../utils/connect_db.js");
const{generateID}= require("../utils/Generate_id.js")


exports.additemtoItems= async(req,res)=>{
    const {item, mrp_per_unit}= req.body;

    try {
        // Check if the item already exists in the items table
        const query = "SELECT item FROM items WHERE item = ?";
        const row = await getQuery(query, [item]);
  
        if (!row) {
          // If item does not exist, insert it into items table
          const insertQuery = "INSERT INTO items(id,item, mrp_per_unit) VALUES (?, ?, ?)";
  
          const id= generateID();
  
          await runQuery(insertQuery, [id,item, parseFloat(mrp_per_unit)]);
          console.log("Successfully added to items");
          res.status(201).json({message: "Successfully added to items"}); //this status is also checked in shipmentcontroller to additemtoShipment
        } 
        
        else {
          // If item exists, update the MRP
          await exports.updatemrp(item, mrp_per_unit);
          return res.status(200).json({ message: `MRP for ${item} successfully updated to ${mrp_per_unit}` });
      }
      } catch (err) {
        console.error("Error while adding item to items:", err.message);
        res.status(500).json({error : err.message});

      }
};

exports.updatemrp = async (item, newMRP) => {
  try {
      const query = "UPDATE items SET mrp_per_unit = ? WHERE item = ?";
      await runQuery(query, [parseFloat(newMRP), item]);
      console.log(`MRP for ${item} successfully updated to ${newMRP}`);
  } catch (err) {
      console.error("Error while updating MRP:", err.message);
      throw new Error("Failed to update MRP");
  }
};

exports.showiteminItems= async(req,res)=>{
  
  const query= "SELECT * FROM items";
  try{
    const rows= await allQuery(query, []);
    res.json({items: rows})

  }catch(err){
    console.log("error fetching all the items");
    res.status(500).json({error: err.message});
  }
};









//how to add data from frontend to additemtoInventory:
    // document.getElementById('inventoryForm').addEventListener('submit', async (event) => {
    //     event.preventDefault();

    //     const invoice_no = document.getElementById('invoice_no').value;
    //     const item = document.getElementById('item').value;
    //     const total_units = document.getElementById('total_units').value;
    //     const rate_per_unit = document.getElementById('rate_per_unit').value;

    //     const data = {
    //         invoice_no,
    //         item,
    //         total_units,
    //         rate_per_unit
    //     };

    //     try {
    //         const response = await axios.post('http://localhost:3500/item', data);

    //         console.log('Successfully added to inventory:', response.data);
    //     } catch (err) {
    //         console.error('Error adding to inventory:', err.response ? err.response.data.error : err.message);
    //     }
    // });
