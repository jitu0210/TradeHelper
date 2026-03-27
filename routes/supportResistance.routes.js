import express from "express"
import { getSRPrediction } from "../controllers/supportResistance.controller.js"

const router = express.Router()

router.post("/srpredict",getSRPrediction)

export default router