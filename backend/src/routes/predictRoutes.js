import express from "express";
import { createPrediction } from "../controllers/predictController.js";
import { protect } from "../middleware/authMiddleware.js";
import { upload } from "../middleware/uploadMiddleware.js";

const router = express.Router();
router.post("/", protect, upload.single("image"), createPrediction);

export default router;

