import express from "express";
import { deletePrediction, getHistory, getPrediction } from "../controllers/historyController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, getHistory);
router.get("/:id", protect, getPrediction);
router.delete("/:id", protect, deletePrediction);

export default router;

