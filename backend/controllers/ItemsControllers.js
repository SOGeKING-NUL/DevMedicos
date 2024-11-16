const {runQuery, getQuery, allQuery}=require("../utils/connect_db");
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
          res.status(201).json({message: "Successfully added to items"});
        } 
        
        else {
          console.log(`${item} already exists in items`);
          res.status(400).json({message: `${item} already exists in items`});

        }
      } catch (err) {
        console.error("Error while adding item to items:", err.message);
        res.status(500).json({error : err.message});

      }
};

exports.showitemsinitems= async(req,res)=>{


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
