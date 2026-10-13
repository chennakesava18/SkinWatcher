import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) {
      res.status(401);
      throw new Error("Not authorized, token missing");
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      res.status(401);
      throw new Error("User not found");
    }

    if (req.user.disabled) {
      res.status(403);
      throw new Error("This account is disabled");
    }

    next();
  } catch (error) {
    res.status(res.statusCode === 200 ? 401 : res.statusCode);
    next(error);
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== "admin") {
    res.status(403);
    return next(new Error("Admin access required"));
  }
  return next();
};
