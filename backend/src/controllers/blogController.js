import Blog from "../models/Blog.js";
import { generateMedicalExplanation } from "../config/gemini.js";

const seedBlogs = [
  ["What is melanoma", "Basics", "Melanoma is a serious skin cancer that begins in pigment-producing melanocytes."],
  ["Early symptoms", "Symptoms", "Recognize asymmetry, border changes, color variation, diameter growth, and evolving lesions."],
  ["Skin self-examination", "Prevention", "Monthly self-checks help identify new or changing lesions earlier."],
  ["Prevention methods", "Prevention", "Sun protection, shade, and avoiding tanning beds lower preventable UV exposure."],
  ["Treatment options", "Treatment", "Treatment may include excision, immunotherapy, targeted therapy, radiation, or clinical trials."],
  ["Latest AI research in skin cancer detection", "AI Research", "AI tools can support triage by analyzing dermoscopic image patterns."]
];

export const getBlogs = async (req, res, next) => {
  try {
    if ((await Blog.countDocuments()) === 0) {
      await Blog.insertMany(
        seedBlogs.map(([title, category, excerpt]) => ({
          title,
          category,
          excerpt,
          content: `${excerpt} This educational article is designed for awareness and should not replace dermatologist advice.`,
          summary: excerpt
        }))
      );
    }

    const { q = "", category = "all" } = req.query;
    const filter = {};
    if (category !== "all") filter.category = category;
    if (q) filter.$or = [{ title: new RegExp(q, "i") }, { excerpt: new RegExp(q, "i") }, { content: new RegExp(q, "i") }];
    res.json(await Blog.find(filter).sort({ createdAt: -1 }));
  } catch (error) {
    next(error);
  }
};

export const summarizeBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      res.status(404);
      throw new Error("Blog not found");
    }
    const summary = await generateMedicalExplanation({
      result: "Educational article summary",
      confidence: 100,
      subtype: blog.title
    });
    blog.summary = summary;
    await blog.save();
    res.json({ summary });
  } catch (error) {
    next(error);
  }
};

