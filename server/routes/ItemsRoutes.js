const express = require("express");
const router = express.Router();

const {additemtoItems, showiteminItems, showmrpinItems}= require("../controllers/ItemsControllers.js");



router.post("/additems", additemtoItems);
router.get("/showitems", showiteminItems);
router.get("/showmrp", showmrpinItems);


module.exports= router;