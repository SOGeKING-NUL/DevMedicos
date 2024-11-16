const express = require("express");
const router = express.Router();

const {additemtoItems, showiteminItems}= require("../controllers/ItemsControllers.js");



router.post("/additems", additemtoItems);
router.get("/showitems", showiteminItems);


module.exports= router;