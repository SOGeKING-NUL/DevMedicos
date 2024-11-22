const express= require("express");
router= express.Router();
const{additemtoShipments, getShipments, item_count, shipment_amount, invoice_number}= require("../controllers/ShipmentControllers.js")

router.post("/addshipments", additemtoShipments);
router.get("/getShipments", getShipments);
router.get("/item_count", item_count);
router.get("/shipment_amount", shipment_amount);
router.get("/invoice_number", invoice_number);

module.exports= router;