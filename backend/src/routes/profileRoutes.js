import express from "express";
import { changePassword, getProfile, updateProfile } from "../controllers/profileController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", protect, getProfile);
router.put("/", protect, updateProfile);
router.put("/password", protect, changePassword);

export default router;

