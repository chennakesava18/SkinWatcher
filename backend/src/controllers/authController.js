import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Activity from "../models/Activity.js";

const tokenFor = (id) => jwt.sign({ id }, process.env.JWT_SECRET || "dev-secret", { expiresIn: "7d" });

const publicUser = (user) => ({
  _id: user._id,
  name: user.name,
  email: user.email,
  avatar: user.avatar,
  joinDate: user.createdAt,
  role: user.role === "admin" ? "admin" : "user",
  verified: Boolean(user.verified),
  disabled: Boolean(user.disabled)
});

export const signup = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      res.status(400);
      throw new Error("Name, email, and password are required");
    }

    const exists = await User.findOne({ email });
    if (exists) {
      res.status(409);
      throw new Error("Email is already registered");
    }

    const user = await User.create({ name, email, password });
    await Activity.create({ user: user._id, type: "auth", message: "Account created" });
    res.status(201).json({ user: publicUser(user), token: tokenFor(user._id) });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  return authenticate(req, res, next, "user");
};

export const adminLogin = async (req, res, next) => {
  return authenticate(req, res, next, "admin");
};

const authenticate = async (req, res, next, expectedRole) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400);
      throw new Error("Email and password are required");
    }
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (user?.disabled) {
      res.status(403);
      throw new Error("This account is disabled");
    }
    if (!user || !(await user.matchPassword(password))) {
      res.status(401);
      throw new Error("Invalid email or password");
    }
    if (expectedRole === "admin" && user.role !== "admin") {
      res.status(403);
      throw new Error("Administrator access required");
    }
    if (expectedRole === "user" && user.role === "admin") {
      res.status(403);
      throw new Error("Use the administrator portal to sign in");
    }

    await Activity.create({ user: user._id, type: "auth", message: `${expectedRole === "admin" ? "Administrator" : "User"} signed in` });
    res.json({ user: publicUser(user), token: tokenFor(user._id) });
  } catch (error) {
    next(error);
  }
};

export const forgotPassword = async (req, res) => {
  res.json({
    message: `If ${req.body.email || "that email"} exists, password reset instructions will be sent.`
  });
};

export const me = async (req, res) => {
  res.json({ user: publicUser(req.user) });
};
