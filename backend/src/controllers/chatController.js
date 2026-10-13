import { generateMedicalExplanation } from "../config/gemini.js";

export const chat = async (req, res, next) => {
  try {
    const { message } = req.body;
    if (!message) {
      res.status(400);
      throw new Error("Message is required");
    }
    const reply = await generateMedicalExplanation({
      result: `Question: ${message}`,
      confidence: 100,
      subtype: "Skin cancer education chatbot"
    });
    res.json({ reply });
  } catch (error) {
    next(error);
  }
};

