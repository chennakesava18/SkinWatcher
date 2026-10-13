import express from "express";
import { listDoctors } from "../controllers/doctorController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, listDoctors);

export default router;
