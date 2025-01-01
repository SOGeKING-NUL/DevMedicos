const express= require("express");
const { additemtoBill, addBill, getbills, viewDetials, addReturn } = require("../controllers/BillController");
router= express.Router();

router.post("/additemtobill", additemtoBill);
router.post("/addreturnitem", addReturn);
router.post("/addbill", addBill);
router.get("/getbills", getbills);
router.get("/viewdetails", viewDetials)

module.exports= router;
