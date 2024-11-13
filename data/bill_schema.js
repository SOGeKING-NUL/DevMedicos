const sqlite= requie("sqlite3").verbose();

const db= sqlite.Database("/bill.db", (err)=>{
    if(err){
        console.log(err.message);
    }else{
        console.log("you are connected");
    }
});


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
                total_price_per_item DECIMAL(10,2) NOT NULL,\
                FOREIGN KEY (bill_no) REFERENCES bill(bill_no),\
                FOREIGN KEY(id) REFERENCES inventory(id)\
                )"
