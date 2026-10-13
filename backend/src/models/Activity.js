import mongoose from "mongoose";

const activitySchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, required: true },
    message: { type: String, required: true },
    metadata: { type: Object, default: {} }
  },
  { timestamps: true }
);

export default mongoose.model("Activity", activitySchema);

