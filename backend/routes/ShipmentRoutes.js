const express= require("express");
router= express.Router();
const{additemtoShipments, getShipments}= require("../controllers/ShipmentControllers.js")

router.post("/addshipments", additemtoShipments);
router.get("/getShipments", getShipments);

module.exports= router;