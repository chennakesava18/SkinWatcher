import dotenv from "dotenv";
import mongoose from "mongoose";
import User from "../models/User.js";

dotenv.config();

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const currentEmail = process.env.ADMIN_CURRENT_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const name = process.env.ADMIN_NAME?.trim() || "SkinWatcher Administrator";

if (!email || !password) {
  throw new Error("Set ADMIN_EMAIL and ADMIN_PASSWORD before running admin:create");
}
if (password.length < 8) {
  throw new Error("ADMIN_PASSWORD must be at least 8 characters");
}

await mongoose.connect(process.env.MONGO_URI);
const existing = await User.findOne(currentEmail ? { email: currentEmail } : { email });

if (existing) {
  existing.email = email;
  existing.role = "admin";
  existing.disabled = false;
  if (process.env.ADMIN_RESET_PASSWORD === "true") existing.password = password;
  await existing.save();
  console.log(`Admin role granted to ${email}${process.env.ADMIN_RESET_PASSWORD === "true" ? " and password reset" : ""}`);
} else {
  await User.create({ name, email, password, role: "admin", verified: true });
  console.log(`Admin account created for ${email}`);
}

await mongoose.disconnect();
