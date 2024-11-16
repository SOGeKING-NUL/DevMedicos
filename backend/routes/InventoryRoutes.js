const express= require("express");
router= express.Router();
const {additemtoInventory}= require("../controllers/InventoryControllers.js");

router.post("/addinventory", additemtoInventory);

module.exports= router;
