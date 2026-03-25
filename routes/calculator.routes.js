const express = require("express");
const router = express.Router();
const controller = require("../controllers/calculator.controller");

router.post("/risk-reward", controller.getRiskReward);
router.post("/win-rate", controller.getWinRate);
router.post("/position-size", controller.getPositionSize);

module.exports = router;