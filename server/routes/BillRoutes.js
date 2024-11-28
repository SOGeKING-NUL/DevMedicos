const express= require("express");
const { additemtoBill, addBill, getbills, viewDetials } = require("../controllers/BillController");
router= express.Router();

router.post("/additemtobill", additemtoBill);
router.post("/addbill", addBill);
router.get("/getbills", getbills);
router.get("/viewdetails", viewDetials)

module.exports= router;
