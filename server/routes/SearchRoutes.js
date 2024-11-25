const express= require("express");
router= express.Router();
const {searchinItems, searchiteminInventory}= require("../controllers/SearchController.js");

router.get("/searchitem", searchinItems);
router.get("/searchinventory", searchiteminInventory);

module.exports= router;
