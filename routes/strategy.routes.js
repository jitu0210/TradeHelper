import express from "express"
import {
    createStrategy,
    getStrategies,
    getStrategyById,
    deleteStrategy
} from "../controllers/strategy.controller.js"

const router = express.Router()

router.post("/create-strategy", createStrategy);
router.get("/strategies", getStrategies);
router.get("/strategies:id", getStrategyById);
router.post("/delete-strategy", deleteStrategy);

export default router