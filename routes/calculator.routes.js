// import express from "express";
// import {
//   getRiskReward,
//   getWinRate,
//   getPositionSize,
// } from "../controllers/calculator.controller.js";

// const router = express.Router();

// router.post("/risk-reward", getRiskReward);
// router.post("/win-rate", getWinRate);
// router.post("/position-size", getPositionSize);

// export default router;




import express from "express";
import {
  getRiskReward,
  getWinRate,
  getPositionSize,
  getProfitCalculator,
  getRequiredWinRate,
  getExpectancy,
  getBrokerageCalculator
} from "../controllers/calculator.controller.js";

const router = express.Router();

// Existing routes
router.post("/risk-reward", getRiskReward);
router.post("/win-rate", getWinRate);
router.post("/position-size", getPositionSize);

// New routes for Indian traders
router.post("/profit", getProfitCalculator);
router.post("/required-win-rate", getRequiredWinRate);
router.post("/expectancy", getExpectancy);
router.post("/brokerage", getBrokerageCalculator);

export default router;