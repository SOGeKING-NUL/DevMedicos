const { app } = require("express")();
const sqlite = require("sqlite3").verbose();

let db;

async function connectDB() {
  try {
    db = new sqlite.Database("../data/DevMedicos.db");
    console.log("you are connected"); //API
  } catch (err) {
    console.log(err.message); //API
  }
}

function closeDB() {
  try {
    db.close();
    console.log("Successfully closed DB");
  } catch (err) {
    console.log("error while close db", err.message);
  }
}

async function additemtoItems(item) {
  try {
    const query = "SELECT item FROM items where item= (?)";
    const row = await new Promise((resolve, reject) => {
        db.get(query, [item], (err, row) => {
          if (err) {
            reject(err);
        } else {
            resolve(row);
        }
    });
});

    if (!row){

        const insertQuery = "INSERT INTO items(item) VALUEs (?)";
        await db.run(insertQuery, [item]);
        console.log("successfully added to items");
    } else {
        console.log(`${item} already exits in items`);
    }
}catch (err) {
        console.log("error while adding", err.message);
  }
}

async function additemtoInventory(quantity, bonus, pack_of, item, mrp, rate) {
  try {
    const total_quantity = quantity + bonus;
    const total_units = total_quantity * pack_of;
    const rate_per_unit = rate / pack_of;
    const mrp_per_unit = mrp / pack_of;
    const query = "INSERT INTO inventory(item, rate_per_unit, mrp_per_unit) VALUES(?, ?, ?)";
    for (let i = 0; i < total_units; i++) {
      await db.run(query, [item, rate_per_unit, mrp_per_unit]);
    }
    console.log("Sucessfully added to inventory");
  } catch (err) {
    console.log("err while adding to inventory", err.message);
  }
}

async function addnewshipment(invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount) {
  try {
    await additemtoItems(item);
    const query = "INSERT INTO shipment(invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount) VALUES(?,?,?,?,?,?,?,?)";
    bonus = bonus !== null ? Math.floor(bonus) : null;
    await db.run(query, [invoice_no, quantity, bonus, pack_of, item, mrp, rate, amount]);
    await additemtoInventory(quantity, bonus, pack_of, item, mrp, rate);
    console.log("Shipment invoice successfully inserted");
  } catch (err) {
    if (err.code === "SQLITE_CONSTRAINT") {
      console.log("Duplicate entry: A shipment with these exact details already exists.");
    } else {
      console.log("Error inserting shipment invoice:", err.message);
    }
  }
}

async function main() {
  await connectDB();
  await addnewshipment('S99PM_7U', 1, null, 5, 'pineapple', 20, 10, 20);
  closeDB();
}

main();