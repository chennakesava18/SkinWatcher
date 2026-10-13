import mongoose from "mongoose";
import Activity from "../models/Activity.js";
import Doctor from "../models/Doctor.js";

const safeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const fields = "name specialization clinic city address phone email experience consultationInfo profileImage description active createdAt updatedAt";

export const listDoctors = async (req, res, next) => {
  try {
    const { search = "", specialization = "all", city = "all" } = req.query;
    const filter = { active: true };
    if (search.trim()) {
      const pattern = new RegExp(safeRegex(search.trim()), "i");
      filter.$or = [{ name: pattern }, { clinic: pattern }, { specialization: pattern }, { city: pattern }];
    }
    if (specialization !== "all") filter.specialization = specialization;
    if (city !== "all") filter.city = city;
    const [doctors, specializations, cities] = await Promise.all([
      Doctor.find(filter).select(fields).sort({ name: 1 }).lean(),
      Doctor.distinct("specialization", { active: true }),
      Doctor.distinct("city", { active: true })
    ]);
    res.json({ doctors, filters: { specializations: specializations.sort(), cities: cities.sort() } });
  } catch (error) {
    next(error);
  }
};

export const listAdminDoctors = async (_req, res, next) => {
  try {
    res.json({ doctors: await Doctor.find().select(fields).sort({ createdAt: -1 }).lean() });
  } catch (error) {
    next(error);
  }
};

export const createDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.create(req.body);
    await Activity.create({ user: req.user._id, type: "admin", message: `Doctor added: ${doctor.name}`, metadata: { resource: "doctor", resourceId: doctor._id } });
    res.status(201).json({ doctor });
  } catch (error) {
    next(error);
  }
};

export const updateDoctor = async (req, res, next) => {
  try {
    if (!mongoose.isValidObjectId(req.params.id)) {
      res.status(404);
      throw new Error("Doctor not found");
    }
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }
    await Activity.create({ user: req.user._id, type: "admin", message: `Doctor updated: ${doctor.name}`, metadata: { resource: "doctor", resourceId: doctor._id } });
    res.json({ doctor });
  } catch (error) {
    next(error);
  }
};

export const updateDoctorStatus = async (req, res, next) => {
  try {
    if (typeof req.body.active !== "boolean") {
      res.status(400);
      throw new Error("active must be a boolean");
    }
    const doctor = await Doctor.findByIdAndUpdate(req.params.id, { active: req.body.active }, { new: true });
    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }
    await Activity.create({ user: req.user._id, type: "admin", message: `Doctor ${doctor.active ? "activated" : "deactivated"}: ${doctor.name}`, metadata: { resource: "doctor", resourceId: doctor._id } });
    res.json({ doctor });
  } catch (error) {
    next(error);
  }
};

export const deleteDoctor = async (req, res, next) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);
    if (!doctor) {
      res.status(404);
      throw new Error("Doctor not found");
    }
    await Activity.create({ user: req.user._id, type: "admin", message: `Doctor removed: ${doctor.name}`, metadata: { resource: "doctor", resourceId: doctor._id } });
    res.json({ message: "Doctor removed" });
  } catch (error) {
    next(error);
  }
};
