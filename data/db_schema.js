const sqlite = require("sqlite3").verbose();        //verbose makes debugging easier

const db=  new sqlite.Database("./DevMedicos.db", (err)=>{
    if(err){
        console.log(err.message);  //API
    }
    else{
        console.log("you are connected")  ;  //API
    }
})


const items="CREATE TABLE IF NOT EXISTS items(\
            id INTEGER PRIMARY KEY AUTOINCREMENT,\
            item TEXT NOT NULL\
            )"
const inventory="CREATE TABLE IF NOT EXISTS inventory (\
                id INTEGER PRIMARY KEY AUTOINCREMENT,\
                item TEXT NOT NULL,\
                quantity INTEGER NOT NULL,\
                )"

const shipment= "CREATE TABLE IF NOT EXISTS shipment (\
                id INTEGER PRIMARY KEY,\
                created_on DATE DEFAULT CURRENT_DATE,\
                quantity DECIMAL(10,2) NOT NULL,\
                bonus DECIMAL(10,2),\
                item TEXT NOT NULL,\
                exp_date NOT NULL TEXT,\
                mrp NOT NULL DECIMAL()10,2,\
                rate NOT NULL DECIMAL(10,2),\
                amount NOT NULL DECIMAL(10,2)\
                )"

const bill= "CREATE TABLE IF NOT EXISTS bill (\
            bill_no INTEGER PRIMARY KEY AUTOINCREMENT,\
            created_on DATE DEFAULT CURRENT_DATE,\
            total_bill_amount DECIMAL(10,2) NOT NULL\
            )"

const bill_item="CREATE TABLE IF NOT EXISTS bill_item(\
                id INTEGER PRIMARY KEY AUTOINCREMENT,\
                bill_no INTEGER,\
                inventory_id INTEGER,\
                quantity INTEGER NOT NULL,\
                total_price DECIMAL(10,2) NOT NULL,\
                FOREIGN KEY (bill_no) REFERENCES bill(bill_no),\
                FOREIGN KEY(inventory_id) REFERENCES inventory (id)\
                )"




db.run(inventory, (err) => {
    if (err) {
        console.error("Error creating inventory table:", err.message);
    }
});
db.run(shipment, (err) => {
    if (err) {
        console.error("Error creating shipment table:", err.message);
    }
});
db.run(bill, (err) => {
    if (err) {
        console.error("Error creating bill table:", err.message);
    }
});
db.run(bill_item, (err) => {
    if (err) {
        console.error("Error creating bill_item table:", err.message);
    }
});