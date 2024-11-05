const sqlite = require("sqlite3").verbose();        //verbose makes debugging easier

const db=  new sqlite.Database("./DevMedicos.db", (err)=>{
    if(err){
        console.log(err.message);  //API
    }
    else{
        console.log("you are connected")  ;  //API
    }
})


const inventory= "CREATE TABLE IF NOT EXISTS inventory (\
    id INTEGER PRIMARY KEY,\
    medicine TEXT NOT NULL,\
    manufacturer TEXT DEFAULT 'Generic',\
    quantity INTEGER NOT NULL,\
    sale_price_per_unit DECIMAL(10,2) NOT NULL\
    )"

const shipment="CREATE TABLE IF NOT EXISTS shipment (\
                id INTEGER PRIMARY KEY,\
                created_on DATE DEFAULT CURRENT_DATE,\
                medicine TEXT NOT NULL,\
                quantity INTEGER NOT NULL,\
                cost_price DECIMAL NOT NULL\
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

db.run(inventory);
db.run(shipment);
db.run(bill);
db.run(bill_item);