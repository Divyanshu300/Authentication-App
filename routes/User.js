const express = require("express");
const router = express.Router()

const {signup, sendOtp} = require("../controllers/Auth")
const {login} = require("../controllers/Auth")

router.post("/signup" , signup);
router.post("/login" , login);
router.post("/sendotp" , sendOtp);

module.exports = router