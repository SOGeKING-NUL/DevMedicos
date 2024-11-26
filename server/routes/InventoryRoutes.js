const express= require("express");
router= express.Router();
const {additemtoInventory, update_inventory}= require("../controllers/InventoryControllers.js");

router.post("/addinventory", additemtoInventory);
router.post("/updateinventory", update_inventory)

module.exports= router;
