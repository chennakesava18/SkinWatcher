import mongoose from "mongoose";

const doctorSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    clinic: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    address: { type: String, default: "", trim: true },
    phone: { type: String, default: "", trim: true },
    email: { type: String, default: "", lowercase: true, trim: true },
    experience: { type: String, default: "", trim: true },
    consultationInfo: { type: String, default: "", trim: true },
    profileImage: { type: String, default: "", trim: true },
    description: { type: String, default: "", trim: true },
    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

doctorSchema.index({ city: 1, specialization: 1, active: 1 });

export default mongoose.model("Doctor", doctorSchema);
