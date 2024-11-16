const express= require("express");
router= express.Router();
const{additemtoShipments}= require("../controllers/ShipmentControllers.js")

router.post("/addshipment", additemtoShipments);

module.exports= router;