import express from "express";
import { getBlogs, summarizeBlog } from "../controllers/blogController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.get("/", getBlogs);
router.post("/:id/summary", protect, summarizeBlog);

export default router;

