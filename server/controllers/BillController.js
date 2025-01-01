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
        return res.json({message: "successfully added items to bill_items",
            bill_no
        });

    }catch(err){
        console.log("error while adding to bill_itemsv" + err.message);
        return res.status(500).json({error: "error while adding to bill_items: " + err.message});
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

        const insertBillQuery= `INSERT INTO bill  (bill_no, discount, amount, created_on) VALUES (?,?, ?, datetime('now', 'localtime'))`;

        await runQuery(insertBillQuery,[bill_no, discount , amount ]);
        console.log("Bill added successfully");
        return res.json({ message: "Bill added successfully", bill_no });


    }catch(err){
        console.log("Err while adding bill: "+ err.message);
        return res.status(500).json({error: "error while adding bill" + err.message});
    };
};

exports.getbills= async(req,res)=>{

    try{
        const bill_noQuery= `SELECT bill_no FROM bill`;
        const billNos= await allQuery(bill_noQuery, []);
        console.log("bill_no"+ billNos.bill_no)

        const bills=[];

        for (const {bill_no} of billNos){
            const billDetailsQuery= `SELECT created_on, amount FROM bill WHERE bill_no= ?`;
            const billDetails= await getQuery(billDetailsQuery, [bill_no]);
            console.log(billDetails)
            const { created_on, amount } = billDetails;


            const itemsQuery= `SELECT COUNT(*) AS item_count FROM bill_items WHERE bill_no = ?`;
            const items= await getQuery(itemsQuery, [bill_no]);
            const {item_count}= items;

            bills.push({
                created_on,
                bill_no,                
                item_count,
                amount            
            })
        };

        return res.json(bills);

        
    }catch(error){
        console.log("error while getting bills: "+ error.message);
        return res.status(500).json({error: "error while getting bills: "+ error.message});
    }
};

exports.viewDetials= async(req,res)=>{
    const {bill_no}= req.query;

    try{

        const itemQuery= `SELECT item,quantity, mrp_per_unit, total_amount FROM bill_items WHERE bill_no=?`;
        const discountQuery= `SELECT discount FROM bill where bill_no=?`;

        const itemsResponse= await allQuery(itemQuery,[bill_no]);
        const discountResponse= await getQuery(discountQuery, [bill_no]);

        
        return res.json({
            items: itemsResponse,
            discount: discountResponse.discount
        });

    }catch(error){
        console.log("error while view bill details"+error.message);
        return res.status(500).json({error: "error while fetching bill details"+ error.message})
    };
};

exports.addReturn = async (req, res) => {
    let { item, units, rate_per_unit } = req.body;
    item = item.trim().toLowerCase();

    try {
        const query = `
            INSERT INTO bill_item_return (item, units, rate_per_unit)
            VALUES (?, ?, ?)
        `;

        await runQuery(query, [item, parseInt(units), parseFloat(rate_per_unit)]);
        console.log("Successfully added return item");
        res.status(201).json({ message: "Successfully added return item" });

    } catch (err) {
        console.log("Error while adding return item", err.message);
        if (err.code === "SQLITE_CONSTRAINT" && err.message.includes("UNIQUE")) {
            return res.status(409).json({ error: "Duplicate return entry. This item already exists with the same details." });
        }

        // For other errors
        res.status(400).json({ error: "Failed to add return item: " + err.message });
    }
};
