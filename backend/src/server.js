import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import connectDB from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import predictRoutes from "./routes/predictRoutes.js";
import historyRoutes from "./routes/historyRoutes.js";
import profileRoutes from "./routes/profileRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import doctorRoutes from "./routes/doctorRoutes.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, "..", ".env") });

const app = express();

connectDB();

const allowedOrigins = [process.env.CLIENT_URL, "http://localhost:5173", "http://localhost:5174"].filter(Boolean);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error("Origin is not allowed"));
  },
  credentials: true
}));
app.use(express.json({ limit: "8mb" }));
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    service: "SkinWatcher API",
    geminiConfigured: Boolean(process.env.GEMINI_API_KEY?.trim()),
    geminiModel: process.env.GEMINI_MODEL || "gemini-2.5-flash"
  });
});

app.use("/api/auth", authRoutes);
app.use("/api/predict", predictRoutes);
app.use("/api/history", historyRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/doctors", doctorRoutes);
app.use("/api/admin", adminRoutes);

app.use(notFound);
app.use(errorHandler);

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`SkinWatcher API running on port ${port}`));
