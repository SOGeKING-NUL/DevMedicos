const {runQuery, allQuery, getQuery}=require("../utils/connect_db.js");
const { generateBillID } = require("../utils/Generate_id.js");
const axios= require("axios");

exports.additemtoBill= async(req,res)=>{

    const items_array= req.body;

    const bill_no= generateBillID();

    try{
        
        for (let {item, quantity, mrp_per_unit} of items_array){

            const addItemQuery= `INSERT INTO bill_items (bill_no, item, quantity, mrp_per_unit, total_amount) VALUES (?,?,?,?,?)`;

            const total_amount= quantity*mrp_per_unit;

            await runQuery(addItemQuery, [bill_no, item, quantity, mrp_per_unit, total_amount]);
        };

        console.log("added the items to bill_items");
        res.json({message: "successfully added items to bill_items",
            bill_no
        });

    }catch(err){
        console.log("error while adding to bill_itemsv" + err.message);
        res.status(500).json({error: "error while adding to bill_items: " + err.message});
    };    
};

exports.addBill= async(req,res)=>{

    let {items, discount}= req.body;
    discount = discount ?? 0;

    try{
        const response= await axios.post("http://localhost:3500/api/inventory/updateinventory", items);

        const bill_no= response.data.bill_no;
        console.log("bill_No "+bill_no);

        const amountQuery = `SELECT SUM(total_amount) AS total_amount FROM bill_items WHERE bill_no = ?`;

        const amount_response = await getQuery(amountQuery, [bill_no]);
        
        console.log("total_amount " + amount_response.total_amount)
        console.log("discount is " + discount);

        const amount = amount_response.total_amount - discount;
        console.log(amount);

        const insertBillQuery= `INSERT INTO bill  (bill_no, discount, amount) VALUES (?, ?, ?)`;

        await runQuery(insertBillQuery,[bill_no, discount , amount ]);
        console.log("Bill added successfully");
        res.json({ message: "Bill added successfully", bill_no });


    }catch(err){
        console.log("Err while adding bill: "+ err.message);
        res.status(500).json({error: "error while adding bill" + err.message});
    };
};

exports.getbills= async(req,res)=>{
    try{}catch(error){
        console.log("error while getting bills: "+ error.message);
        res.status(500).json({error: "error while getting bills: "+ error.message});
    }
};


