const express= require("express");
const { additemtoBill, addBill } = require("../controllers/BillController");
router= express.Router();

router.post("/additemtobill", additemtoBill);
router.post("/addbill", addBill);

module.exports= router;
