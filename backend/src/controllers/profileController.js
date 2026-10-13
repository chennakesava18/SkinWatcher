import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Prediction from "../models/Prediction.js";
import Activity from "../models/Activity.js";

export const getProfile = async (req, res, next) => {
  try {
    const [totalScans, benign, malignant, activities] = await Promise.all([
      Prediction.countDocuments({ user: req.user._id }),
      Prediction.countDocuments({ user: req.user._id, result: "Benign" }),
      Prediction.countDocuments({ user: req.user._id, result: "Malignant" }),
      Activity.find({ user: req.user._id }).sort({ createdAt: -1 }).limit(8)
    ]);

    res.json({
      user: {
        _id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        avatar: req.user.avatar,
        joinDate: req.user.createdAt,
        role: req.user.role === "admin" ? "admin" : "user",
        verified: Boolean(req.user.verified)
      },
      stats: { totalScans, benign, malignant, accuracy: null },
      activities
    });
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    user.name = req.body.name ?? user.name;
    user.email = req.body.email ?? user.email;
    user.avatar = req.body.avatar ?? user.avatar;
    await user.save();
    await Activity.create({ user: user._id, type: "profile", message: "Profile updated" });
    res.json({ user: { _id: user._id, name: user.name, email: user.email, avatar: user.avatar, joinDate: user.createdAt, role: user.role === "admin" ? "admin" : "user", verified: Boolean(user.verified) } });
  } catch (error) {
    next(error);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);
    if (!(await bcrypt.compare(currentPassword, user.password))) {
      res.status(400);
      throw new Error("Current password is incorrect");
    }
    user.password = newPassword;
    await user.save();
    await Activity.create({ user: user._id, type: "security", message: "Password changed" });
    res.json({ message: "Password changed successfully" });
  } catch (error) {
    next(error);
  }
};
