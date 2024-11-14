const sqlite= require("sqlite3").verbose();
const util= require("util");
const {customAlphabet}= require("nanoid");      //for a smaller bill number

function BillNo(){
    const characters= "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    return customAlphabet(characters, 9);
}

async function connectDB(){

    try{
        db= new sqlite.Database("../data/DevMedicos.db");
        console.log("you are connected"); 

        runQuery= util.promisify(db.run.bind(db));
        getQuery= util.promisify(db.get.bind(db)); 

    }catch(err){
            console.log(err.message);  //API
        };
};

async function closeDB(){

    try{
        db.close();
        console.log("Successfully closed DB");
    }catch(err){
        console.log("error while close db", err.message);
    };
};

async function initializeBill(){
        const query="INSERT INTO bill(total_bill_sales, total_profit) VALUES(?, ?)";
        runQuery(query, [0,0], (err)=>{
            if(err){console.log("error while initialzing bill: ", err.message)}
        })
};

async function deleteBill(bill_id){
    const query ="DELETE FROM bill WHERE id=?";
    runQuery(query, [build_id])
}

async function additemtobill_item(bill_no, item, quanity, rate_per_unit, mrp_per_unit, inventory_id){

};


async function main(){

    try{
        await connectDB();
        await additemtoBill('ELS2988C', 4, null, 10,'apples', 90, 75, 300); 
        await closeDB();
    }catch(err){
        console.error("error in main function", err.message)
    };
};

main();
