const sqlite = require("sqlite3").verbose();        //verbose makes debugging easier

const db=  new sqlite.Database("./inventory.db", (err)=>{
    if(err){
        console.log(err.message);  //API
    }
    else{
        console.log("you are connected")  ;  //API
    }
})


const items="CREATE TABLE IF NOT EXISTS items(\
            item TEXT PRIMARY KEY\
            )"

const inventory="CREATE TABLE IF NOT EXISTS inventory (\
                id INTEGER PRIMARY KEY AUTOINCREMENT,\
                created_on DATE NOT NULL DEFAULT CURRENT_DATE,\
                item TEXT NOT NULL,\
                rate_per_unit DECIMAL(7,2) NOT NULL CHECK (rate_per_unit >= 0),\
                mrp_per_unit DECIMAL(7,2) NOT NULL CHECK (mrp_per_unit >= 0),\
                FOREIGN KEY(item) REFERENCES items (item)\
                )"

const shipment= "CREATE TABLE IF NOT EXISTS shipment (\
                id INTEGER PRIMARY KEY AUTOINCREMENT,\
                invoice_no TEXT NOT NULL,\
                created_on DATE NOT NULL DEFAULT CURRENT_DATE,\
                quantity INTEGER NOT NULL CHECK (quantity >= 0),\
                bonus INTEGER CHECK (bonus >= 0),\
                pack_of DECIMAL(5,2) NOT NULL CHECK (pack_of >= 0),\
                item TEXT NOT NULL,\
                mrp DECIMAL(7,2) NOT NULL CHECK (mrp >= 0) ,\
                rate DECIMAL(7,2) NOT NULL CHECK (rate >= 0),\
                amount DECIMAL(10,2) NOT NULL CHECK (amount >= 0),\
                FOREIGN KEY(item) REFERENCES items (item),\
                UNIQUE(invoice_no, created_on, quantity, bonus, pack_of, item, mrp, rate, amount)\
                )"


db.run(items, (err) => {
    if (err) {
        console.error("Error creating items table:", err.message);
    }
})

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

db.close();