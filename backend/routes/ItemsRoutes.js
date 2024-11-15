const express = require("express");
const router = express.Router();

const {additemtoItems}= require("../controllers/ItemsControllers");



router.post("/inventory/add", additemtoItems);


module.exports= router;