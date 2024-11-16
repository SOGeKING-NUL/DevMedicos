const express= require("express");
router= express.Router();
const {searchinItems}= require("../controllers/SearchController.js");

router.get("/searchitem", searchinItems);

module.exports= router;
