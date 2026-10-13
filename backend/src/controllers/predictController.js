import Prediction from "../models/Prediction.js";
import Activity from "../models/Activity.js";
import { analyzeSkinImageWithGemini } from "../config/gemini.js";

export const createPrediction = async (req, res, next) => {
  try {
    if (!req.file) {
      res.status(400);
      throw new Error("Skin image is required");
    }

    const analysis = await analyzeSkinImageWithGemini(req.file);
    if (!analysis.isSkinLesionImage) {
      res.status(400);
      throw new Error(analysis.rejectionReason);
    }

    const imageUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;

    const saved = await Prediction.create({
      user: req.user._id,
      imageUrl,
      result: analysis.result,
      confidence: analysis.confidence,
      subtype: analysis.subtype,
      riskScore: analysis.riskScore,
      explanation: analysis.explanation,
      recommendations: analysis.recommendations
    });

    await Activity.create({
      user: req.user._id,
      type: "prediction",
      message: `${analysis.result} scan completed`,
      metadata: { prediction: saved._id, confidence: analysis.confidence }
    });

    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
};
