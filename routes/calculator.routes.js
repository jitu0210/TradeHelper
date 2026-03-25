import express from "express"
import { getRiskReward, getWinRate, getPositionSize } from "../controllers/calculator.controller.js";

const router = express.Router()

router.post("/risk-reward", getRiskReward);
router.post("/win-rate", getWinRate);
router.post("/position-size", getPositionSize);

export default router