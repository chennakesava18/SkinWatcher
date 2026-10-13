import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs/promises";

const geminiApiKey = () => process.env.GEMINI_API_KEY?.trim();
const geminiModel = () => process.env.GEMINI_MODEL || "gemini-2.5-flash";

const cleanJson = (text) => {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1] : text;
  const start = candidate.indexOf("{");
  const end = candidate.lastIndexOf("}");
  if (start === -1 || end === -1) throw new Error("Gemini did not return JSON");
  return JSON.parse(candidate.slice(start, end + 1));
};

export const generateMedicalExplanation = async (prediction) => {
  const fallback = [
    `${prediction.result} pattern detected with ${prediction.confidence}% confidence.`,
    "Review the lesion for asymmetry, border irregularity, color variation, diameter changes, and evolution over time.",
    prediction.result === "Malignant"
      ? "Book an urgent dermatologist appointment for dermoscopic confirmation and possible biopsy."
      : "Continue routine self-exams and monitor changes with dated images.",
    "Use sunscreen, avoid tanning beds, and seek clinical care for fast-changing lesions."
  ].join(" ");

  if (!geminiApiKey()) return fallback;

  try {
    const genAI = new GoogleGenerativeAI(geminiApiKey());
    const model = genAI.getGenerativeModel({ model: geminiModel() });
    const prompt = `
You are assisting a healthcare screening app. Write a concise, careful medical explanation for:
Result: ${prediction.result}
Confidence: ${prediction.confidence}%
Subtype: ${prediction.subtype || "Not applicable"}
Include interpretation, risk analysis, next steps, and prevention advice.
State clearly that this is not a diagnosis.
`;
    const result = await model.generateContent(prompt);
    return result.response.text();
  } catch (error) {
    console.error(`Gemini explanation failed: ${error.message}`);
    return fallback;
  }
};

export const analyzeSkinImageWithGemini = async (file) => {
  if (!geminiApiKey()) {
    const error = new Error("AI vision is not configured. Add GEMINI_API_KEY in backend/.env to enable image-based skin lesion detection.");
    error.statusCode = 503;
    throw error;
  }

  try {
    const bytes = await fs.readFile(file.path);
    const genAI = new GoogleGenerativeAI(geminiApiKey());
    const model = genAI.getGenerativeModel({ model: geminiModel() });
    const prompt = `
You are the image safety and triage layer for SkinWatcher, an AI-assisted melanoma screening app.

First decide if the uploaded image is actually a close-up skin lesion, mole, or dermoscopic skin image suitable for skin cancer screening.
Reject unrelated images such as people, animals, food, documents, landscapes, electronics, clothes, screenshots, or any image without a visible skin lesion.

If it is not suitable, return isSkinLesionImage false and do not classify disease.
If suitable, classify only as Benign or Malignant melanoma risk, and identify a melanoma subtype only when malignant and visually supportable.

Return only valid JSON with this exact shape:
{
  "isSkinLesionImage": true,
  "rejectionReason": "",
  "result": "Benign",
  "confidence": 0,
  "subtype": "Not detected",
  "riskScore": 0,
  "explanation": "Detailed medical interpretation, risk analysis, recommended next steps, and prevention advice. Clearly state this is not a diagnosis.",
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3"]
}

Allowed result values: "Benign", "Malignant".
Allowed malignant subtype values: "Superficial Spreading Melanoma", "Nodular Melanoma", "Lentigo Maligna Melanoma", "Acral Lentiginous Melanoma", "Subtype uncertain".
Confidence and riskScore must be integers from 0 to 100.
`;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: bytes.toString("base64"),
          mimeType: file.mimetype
        }
      }
    ]);

    const parsed = cleanJson(result.response.text());
    return {
      isSkinLesionImage: Boolean(parsed.isSkinLesionImage),
      rejectionReason: parsed.rejectionReason || "Upload a clear close-up dermoscopic or skin lesion image.",
      result: parsed.result === "Malignant" ? "Malignant" : "Benign",
      confidence: Math.max(0, Math.min(100, Number.parseInt(parsed.confidence, 10) || 0)),
      subtype: parsed.result === "Malignant" ? parsed.subtype || "Subtype uncertain" : "Not detected",
      riskScore: Math.max(0, Math.min(100, Number.parseInt(parsed.riskScore, 10) || 0)),
      explanation: parsed.explanation || "",
      recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations.slice(0, 5) : []
    };
  } catch (error) {
    if (error.statusCode) throw error;
    const wrapped = new Error(`AI image analysis failed: ${error.message}`);
    wrapped.statusCode = 502;
    throw wrapped;
  }
};
