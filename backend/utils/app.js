const express = require('express');
const{connectDB,closeDB}= require("./connect_db.js");
const itemRoutes= require("../routes/ItemsRoutes.js");
const ShipmentRoutes= require("../routes/ShipmentRoutes.js");
const InventoryRoutes= require("../routes/InventoryRoutes.js");
const app = express();


connectDB();

app.get("/", (req,res)=>{
    res.json({
        message: "all is well"
    });
})


app.use(express.json());


app.use("/api/items", itemRoutes);
app.use('/api/inventory',InventoryRoutes);
app.use('/api/shipments',ShipmentRoutes);



const port=3500;
const server = app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

process.on('SIGINT', () => {
    console.log('SIGINT signal received. Closing the server and database connection...');
    closeDB();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGTERM', () => {
    console.log('SIGTERM signal received. Closing the server and database connection...');
    closeDB();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
