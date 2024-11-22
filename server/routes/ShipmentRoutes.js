const express= require("express");
router= express.Router();
const{additemtoShipments, getShipment, item_count, shipment_amount, invoice_number, shipment_date}= require("../controllers/ShipmentControllers.js")

router.post("/addshipments", additemtoShipments);
router.get("/getShipments", getShipment);
router.get("/item_count", item_count);
router.get("/shipment_amount", shipment_amount);
router.get("/invoice_number", invoice_number);
router.get("/shipment_date", shipment_date);

module.exports= router;