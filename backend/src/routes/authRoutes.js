import express from "express";
import { adminLogin, forgotPassword, login, me, signup } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/signup", signup);
router.post("/login", login);
router.post("/admin-login", adminLogin);
router.post("/forgot-password", forgotPassword);
router.get("/me", protect, me);

export default router;
