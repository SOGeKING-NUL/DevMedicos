const express = require("express");
const router = express.Router();

const {additemtoItems}= require("../controllers/ItemsControllers");



router.post("/add", additemtoItems);


module.exports= router;