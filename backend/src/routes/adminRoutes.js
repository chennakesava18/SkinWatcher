import express from "express";
import { createDoctor, deleteDoctor, listAdminDoctors, updateDoctor, updateDoctorStatus } from "../controllers/doctorController.js";
import { getAdminActivity, getAdminAnalytics, getAdminOverview, getAdminStatus, getUserDetails, listUsers, updateUserRole, updateUserStatus } from "../controllers/adminController.js";
import { protect, requireAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect, requireAdmin);
router.get("/overview", getAdminOverview);
router.get("/users", listUsers);
router.get("/users/:id", getUserDetails);
router.patch("/users/:id/status", updateUserStatus);
router.patch("/users/:id/role", updateUserRole);
router.get("/analytics", getAdminAnalytics);
router.get("/activity", getAdminActivity);
router.get("/status", getAdminStatus);
router.get("/doctors", listAdminDoctors);
router.post("/doctors", createDoctor);
router.patch("/doctors/:id", updateDoctor);
router.patch("/doctors/:id/status", updateDoctorStatus);
router.delete("/doctors/:id", deleteDoctor);

export default router;
