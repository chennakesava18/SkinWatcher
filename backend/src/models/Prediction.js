import mongoose from "mongoose";

const predictionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    imageUrl: { type: String, required: true },
    result: { type: String, enum: ["Benign", "Malignant"], required: true },
    confidence: { type: Number, required: true },
    subtype: { type: String, default: "Not detected" },
    riskScore: { type: Number, required: true },
    explanation: { type: String, required: true },
    recommendations: [{ type: String }]
  },
  { timestamps: true }
);

export default mongoose.model("Prediction", predictionSchema);

