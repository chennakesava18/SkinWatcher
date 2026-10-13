import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import Doctor from "../models/Doctor.js";
import Prediction from "../models/Prediction.js";
import User from "../models/User.js";

const publicAdminUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  role: user.role === "admin" ? "admin" : "user",
  verified: Boolean(user.verified),
  disabled: Boolean(user.disabled),
  createdAt: user.createdAt,
  updatedAt: user.updatedAt
});

const safeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const startOfToday = () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  return today;
};

export const getAdminOverview = async (_req, res, next) => {
  try {
    const [totalUsers, activeUsers, verifiedUsers, totalAnalyses, totalDoctors, activeDoctors, recentRegistrations, recentActivity] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ disabled: false }),
      User.countDocuments({ verified: true }),
      Prediction.countDocuments(),
      Doctor.countDocuments(),
      Doctor.countDocuments({ active: true }),
      User.find().select("name email role createdAt").sort({ createdAt: -1 }).limit(8).lean(),
      Activity.find().populate("user", "name email").sort({ createdAt: -1 }).limit(12).lean()
    ]);
    const analysesToday = await Prediction.countDocuments({ createdAt: { $gte: startOfToday() } });
    res.json({ totalUsers, activeUsers, inactiveUsers: totalUsers - activeUsers, verifiedUsers, unverifiedUsers: totalUsers - verifiedUsers, totalAnalyses, totalDoctors, activeDoctors, analysesToday, recentRegistrations, recentActivity });
  } catch (error) {
    next(error);
  }
};

export const listUsers = async (req, res, next) => {
  try {
    const { search = "", role = "all", verified = "all", status = "all", page = 1, limit = 20 } = req.query;
    const filter = {};
    if (search.trim()) {
      const pattern = new RegExp(safeRegex(search.trim()), "i");
      filter.$or = [{ name: pattern }, { email: pattern }];
    }
    if (["user", "admin"].includes(role)) filter.role = role;
    if (verified === "true") filter.verified = true;
    if (verified === "false") filter.verified = false;
    if (status === "active") filter.disabled = false;
    if (status === "disabled") filter.disabled = true;

    const pageNumber = Math.max(Number(page) || 1, 1);
    const pageSize = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const [users, total] = await Promise.all([
      User.find(filter).select("-password").sort({ createdAt: -1 }).skip((pageNumber - 1) * pageSize).limit(pageSize).lean(),
      User.countDocuments(filter)
    ]);
    const enrichedUsers = await Promise.all(users.map(async (user) => ({
      ...publicAdminUser(user),
      analysisCount: await Prediction.countDocuments({ user: user._id }),
      lastActivity: (await Activity.findOne({ user: user._id }).sort({ createdAt: -1 }).select("createdAt").lean())?.createdAt || null
    })));
    res.json({ users: enrichedUsers, pagination: { page: pageNumber, limit: pageSize, total, pages: Math.ceil(total / pageSize) } });
  } catch (error) {
    next(error);
  }
};

export const getUserDetails = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(404);
      throw new Error("User not found");
    }
    const [user, analysisCount, recentAnalyses, recentActivity] = await Promise.all([
      User.findById(req.params.id).select("-password").lean(),
      Prediction.countDocuments({ user: req.params.id }),
      Prediction.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(8).select("result subtype confidence riskScore createdAt").lean(),
      Activity.find({ user: req.params.id }).sort({ createdAt: -1 }).limit(8).lean()
    ]);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    res.json({ user: publicAdminUser(user), analysisCount, recentAnalyses, recentActivity, lastActivity: recentActivity[0]?.createdAt || null });
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    if (typeof req.body.disabled !== "boolean") {
      res.status(400);
      throw new Error("disabled must be a boolean");
    }
    if (String(req.user._id) === req.params.id) {
      res.status(400);
      throw new Error("You cannot disable your own account");
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.role === "admin" && req.body.disabled && await User.countDocuments({ role: "admin", disabled: false }) <= 1) {
      res.status(409);
      throw new Error("The last active administrator cannot be disabled");
    }
    user.disabled = Boolean(req.body.disabled);
    await user.save();
    await Activity.create({ user: user._id, type: "admin", message: `Account ${user.disabled ? "disabled" : "enabled"} by an administrator`, metadata: { admin: req.user._id } });
    res.json({ user: publicAdminUser(user) });
  } catch (error) {
    next(error);
  }
};

export const updateUserRole = async (req, res, next) => {
  try {
    if (String(req.user._id) === req.params.id) {
      res.status(400);
      throw new Error("You cannot change your own role");
    }
    if (!["user", "admin"].includes(req.body.role)) {
      res.status(400);
      throw new Error("Role must be user or admin");
    }
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }
    if (user.role === "admin" && req.body.role === "user" && await User.countDocuments({ role: "admin", disabled: false }) <= 1) {
      res.status(409);
      throw new Error("The last active administrator cannot be demoted");
    }
    user.role = req.body.role;
    await user.save();
    await Activity.create({ user: user._id, type: "admin", message: `Role changed to ${req.body.role}`, metadata: { admin: req.user._id } });
    res.json({ user: publicAdminUser(user) });
  } catch (error) {
    next(error);
  }
};

export const getAdminAnalytics = async (req, res, next) => {
  try {
    const requestedDays = Number(req.query.days) || 30;
    const days = Math.min(Math.max(requestedDays, 7), 365);
    const since = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000);
    since.setUTCHours(0, 0, 0, 0);
    const groupByDay = { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } };
    const [usersOverTime, analysesOverTime, verification] = await Promise.all([
      User.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: groupByDay, count: { $sum: 1 } } }, { $sort: { _id: 1 } }]),
      Prediction.aggregate([{ $match: { createdAt: { $gte: since } } }, { $group: { _id: groupByDay, total: { $sum: 1 }, benign: { $sum: { $cond: [{ $eq: ["$result", "Benign"] }, 1, 0] } }, malignant: { $sum: { $cond: [{ $eq: ["$result", "Malignant"] }, 1, 0] } } } }, { $sort: { _id: 1 } }]),
      User.aggregate([{ $group: { _id: "$verified", count: { $sum: 1 } } }])
    ]);
    res.json({ days, usersOverTime, analysesOverTime, verification });
  } catch (error) {
    next(error);
  }
};

export const getAdminActivity = async (req, res, next) => {
  try {
    const limit = Math.min(Math.max(Number(req.query.limit) || 30, 1), 100);
    const activities = await Activity.find().populate("user", "name email").sort({ createdAt: -1 }).limit(limit).lean();
    res.json({ activities });
  } catch (error) {
    next(error);
  }
};

export const getAdminStatus = async (_req, res, next) => {
  try {
    const [recentActivity, totalUsers, activeUsers, totalDoctors, activeDoctors] = await Promise.all([
      Activity.find().populate("user", "name email").sort({ createdAt: -1 }).limit(10).lean(),
      User.countDocuments(),
      User.countDocuments({ disabled: false }),
      Doctor.countDocuments(),
      Doctor.countDocuments({ active: true })
    ]);
    res.json({
      api: { status: "ok", checkedAt: new Date() },
      database: { status: mongoose.connection.readyState === 1 ? "connected" : "unavailable" },
      gemini: { configured: Boolean(process.env.GEMINI_API_KEY?.trim()) },
      totals: { totalUsers, activeUsers, inactiveUsers: totalUsers - activeUsers, totalDoctors, activeDoctors },
      recentActivity
    });
  } catch (error) {
    next(error);
  }
};
