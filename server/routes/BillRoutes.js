const express= require("express");
const { additemtoBill, addBill, getbills } = require("../controllers/BillController");
router= express.Router();

router.post("/additemtobill", additemtoBill);
router.post("/addbill", addBill);
router.get("/getbills", getbills);

module.exports= router;
